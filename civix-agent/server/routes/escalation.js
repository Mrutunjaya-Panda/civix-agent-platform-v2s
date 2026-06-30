const express = require('express');
const router = express.Router();
const { db } = require('../firebase');
const { draftGrievanceBrief } = require('../agents/routing');

/**
 * POST /api/simulate-time
 * Adds +6 hours to all open tickets and evaluates SLA thresholds.
 */
router.post('/simulate-time', async (req, res) => {
  try {
    const expectedPassphrase = process.env.VITE_MUNICIPAL_WORKER_PASSPHRASE || 'civix2026';
    const providedPassphrase = req.headers['x-worker-passphrase'];

    if (!providedPassphrase || providedPassphrase !== expectedPassphrase) {
      return res.status(403).json({ error: 'Forbidden: Invalid or missing worker passphrase' });
    }

    // We query for anything not 'closed' so we can escalate open/stalled and timeout resolved ones.
    const snapshot = await db.collection('tickets').where('status', '!=', 'closed').get();
    
    if (snapshot.empty) {
      return res.json({ status: 'ok', message: 'No open tickets to simulate time for.' });
    }

    const batch = db.batch();
    const escalatedTickets = [];
    const feedEntries = [];
    const timestamp = new Date().toISOString();

    for (const doc of snapshot.docs) {
      const ticket = doc.data();
      const currentAge = ticket.simulatedAge || 0;
      const newAge = currentAge + 6;
      
      const updates = {
        simulatedAge: newAge,
        updatedAt: timestamp
      };

      // SLA logic
      let needsEscalation = false;
      let newStatus = ticket.status;

      // Check if it's a resolved ticket timing out
      if (ticket.status === 'resolved') {
        const resolvedAge = ticket.resolvedAtAge || currentAge; // fallback if missing
        if (newAge - resolvedAge >= 72) {
          updates.status = 'closed';
          
          const feedRef = db.collection('activityFeed').doc();
          batch.set(feedRef, {
            type: 'CLOSED',
            message: `Citizen confirmation timeout (72h) → auto-closed`,
            ticketId: doc.id,
            createdAt: timestamp
          });
          
          escalatedTickets.push({ id: doc.id, newStatus: 'closed', newAge });
        }
      } else {
        // Normal SLA logic for non-resolved tickets
        if (ticket.status !== 'escalated' && ticket.status !== 'stalled') {
          if (ticket.severity >= 7 && newAge >= 24) {
            needsEscalation = true;
            newStatus = 'escalated';
          } else if (ticket.severity >= 4 && ticket.severity < 7 && newAge >= 48) {
            needsEscalation = true;
            newStatus = 'escalated';
          } else if (ticket.severity < 4 && newAge >= 72) {
            needsEscalation = true;
            newStatus = 'stalled';
          }
        }
      }

      if (needsEscalation) {
        updates.status = newStatus;
        updates.escalatedAtAge = newAge; // Track escalation time for the 72h auto-close countdown
        
        // Background generation of urgent brief
        // Since we are iterating, we will generate the brief inline. 
        // For a hackathon demo, we want it to be ready. It might take a few seconds,
        // but that's okay for the "Simulate Time" button.
        const urgentBrief = await draftGrievanceBrief({ ...ticket, status: newStatus }, true);
        updates.brief = urgentBrief;
        
        const feedMessage = newStatus === 'escalated' 
          ? `Ticket unresolved past SLA threshold (${newAge}h) → autonomously escalated to Tier 2`
          : `Ticket unresolved past SLA threshold (${newAge}h) → marked as stalled`;

        const feedRef = db.collection('activityFeed').doc();
        batch.set(feedRef, {
          type: 'ESCALATION',
          message: feedMessage,
          ticketId: doc.id,
          createdAt: timestamp
        });

        escalatedTickets.push({ id: doc.id, newStatus, newAge });
      }

      batch.update(doc.ref, updates);
    }

    await batch.commit();

    return res.json({ 
      status: 'ok', 
      processed: snapshot.size, 
      escalated: escalatedTickets 
    });

  } catch (err) {
    console.error('[/api/simulate-time] Error:', err);
    return res.status(500).json({ error: `Time simulation failed: ${err.message}` });
  }
});

module.exports = router;
