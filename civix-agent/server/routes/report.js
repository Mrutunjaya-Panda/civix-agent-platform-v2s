const express = require('express');
const router = express.Router();
const { db } = require('../firebase');
const { triageReport } = require('../agents/triage');
const { findNearbyTickets, severityBand } = require('../agents/dedup');
const { draftGrievanceBrief } = require('../agents/routing');

/**
 * POST /api/report
 * Full triage pipeline:
 *   1. Validate payload
 *   2. Call Gemini Vision → classify + score
 *   3. Run spatial dedup → cluster hit or new ticket
 *   4. Write to Firestore (tickets + activityFeed, or clusters + activityFeed)
 *   5. Return result to client
 */
router.post('/report', async (req, res) => {
  const { imageUrl, location, note = '', uid } = req.body;

  // ── Validation ───────────────────────────────────────────────────────────────
  if (!imageUrl) {
    return res.status(400).json({ error: 'imageUrl is required' });
  }
  if (!location || typeof location.lat !== 'number' || typeof location.lng !== 'number') {
    return res.status(400).json({ error: 'location with numeric lat and lng is required' });
  }
  if (location.lat < -90 || location.lat > 90 || location.lng < -180 || location.lng > 180) {
    return res.status(400).json({ error: 'location coordinates out of valid range' });
  }

  console.log('[/api/report] Incoming report:', {
    imageUrl: imageUrl.slice(0, 60) + '…',
    location,
    note: note?.slice(0, 80) || '(none)',
    uid: uid || '(anonymous)',
  });

  try {
    // ── Step 1: Triage (Gemini Vision) — initial pass, clusterBonus = 0 ──────
    const triageResult = await triageReport({ imageUrl, note, clusterBonus: 0 });
    const { category, severity: initialSeverity, reasoning, department, contact } = triageResult;

    console.log(`[/api/report] Triage result: category=${category}, severity=${initialSeverity}, dept=${department}`);

    // ── Step 2: Spatial dedup check ──────────────────────────────────────────
    const nearbyTickets = await findNearbyTickets({
      lat: location.lat,
      lng: location.lng,
      category,
      radiusMeters: 50,
    });

    // ── Step 3a: CLUSTER HIT — reinforce existing ticket ─────────────────────
    if (nearbyTickets.length > 0) {
      const nearest = nearbyTickets[0];
      const clusterBonus = Math.min(nearbyTickets.length * 0.5, 2);

      // Re-run severity formula with the clusterBonus applied
      const { calcSeverity } = require('../agents/triage');
      const newSeverity = calcSeverity(category, triageResult.visualSeverity, clusterBonus);
      const band = severityBand(newSeverity);

      // Update the nearest existing ticket
      const ticketRef = db.collection('tickets').doc(nearest.id);
      await ticketRef.update({
        severity: newSeverity,
        duplicateCount: (nearest.duplicateCount || 0) + 1,
        updatedAt: new Date().toISOString(),
      });

      // Write a slim record to the clusters collection
      const clusterRef = await db.collection('clusters').add({
        parentTicketId: nearest.id,
        imageUrl,
        clusterBonus,
        createdAt: new Date().toISOString(),
      });

      // Activity feed entry — ALL dynamic values, no hardcoding
      const feedMessage = `${nearbyTickets.length} similar report(s) within 50m detected → merged → priority bumped to ${newSeverity.toFixed(1)} (${band})`;
      await db.collection('activityFeed').add({
        type: 'CLUSTER',
        message: feedMessage,
        ticketId: nearest.id,
        clusterId: clusterRef.id,
        createdAt: new Date().toISOString(),
      });

      console.log(`[/api/report] Cluster hit → parent=${nearest.id}, newSeverity=${newSeverity} (${band}), bonus=${clusterBonus}`);

      return res.json({
        status: 'clustered',
        parentTicketId: nearest.id,
        newSeverity,
        band,
        message: feedMessage,
      });
    }

    // ── Step 3b: UNIQUE REPORT — create new ticket ────────────────────────────
    const newTicket = {
      category,
      severity: initialSeverity,
      reasoning,
      department,
      contact,
      status: 'new',
      imageUrl,
      location,
      note,
      reportedBy: uid || 'anonymous',
      duplicateCount: 0,
      simulatedAge: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const ticketRef = await db.collection('tickets').add(newTicket);

    // Activity feed entry
    const band = severityBand(initialSeverity);
    await db.collection('activityFeed').add({
      type: 'TRIAGE',
      message: `New ${category} issue classified → severity ${initialSeverity.toFixed(1)} (${band}) → routed to ${department}`,
      ticketId: ticketRef.id,
      createdAt: new Date().toISOString(),
    });

    console.log(`[/api/report] New ticket created: id=${ticketRef.id}, category=${category}, severity=${initialSeverity}`);

    // Send response to client immediately to preserve <15s latency
    res.json({
      status: 'ok',
      ticketId: ticketRef.id,
      category,
      severity: initialSeverity,
      band,
      reasoning,
      department,
    });

    // ── Step 4: Async Routing & Brief Generation (Agent 2) ───────────────────
    (async () => {
      try {
        const brief = await draftGrievanceBrief(newTicket);
        await ticketRef.update({ brief, updatedAt: new Date().toISOString() });
        
        await db.collection('activityFeed').add({
          type: 'ROUTING',
          message: `Grievance brief drafted and routed to ${department}`,
          ticketId: ticketRef.id,
          createdAt: new Date().toISOString(),
        });
        console.log(`[/api/report] Background routing complete for ${ticketRef.id}`);
      } catch (err) {
        console.error(`[/api/report] Background routing failed for ${ticketRef.id}:`, err);
      }
    })();

    return;

  } catch (err) {
    console.error('[/api/report] Error during triage:', err);
    return res.status(500).json({ error: `Triage failed: ${err.message}` });
  }
});

module.exports = router;
