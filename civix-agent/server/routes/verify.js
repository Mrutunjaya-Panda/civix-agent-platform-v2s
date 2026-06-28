const express = require('express');
const { db } = require('../firebase');
const { verifyRepair } = require('../agents/verification');

const router = express.Router();

router.post('/verify', async (req, res) => {
  try {
    const { ticketId, repairImageUrl } = req.body;

    if (!ticketId || !repairImageUrl) {
      return res.status(400).json({ error: 'Missing ticketId or repairImageUrl' });
    }

    const ticketRef = db.collection('tickets').doc(ticketId);
    const ticketDoc = await ticketRef.get();

    if (!ticketDoc.exists) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    const ticket = ticketDoc.data();

    // Call Agent 3 to verify the repair
    const { isRepaired, recap } = await verifyRepair(ticket.imageUrl, repairImageUrl, ticket.category);

    const batch = db.batch();

    if (isRepaired) {
      // Update ticket to resolved
      batch.update(ticketRef, {
        status: 'resolved',
        repairImageUrl,
        agentRecap: recap,
        resolvedAtAge: ticket.simulatedAge || 0,
        updatedAt: new Date().toISOString()
      });

      // Write activity feed entry
      const feedRef = db.collection('activityFeed').doc();
      batch.set(feedRef, {
        ticketId,
        type: 'RESOLUTION',
        message: 'Email drafted and dispatched to citizen — awaiting confirmation',
        timestamp: new Date().toISOString(),
        details: recap
      });
    } else {
      // Reject repair
      const feedRef = db.collection('activityFeed').doc();
      batch.set(feedRef, {
        ticketId,
        type: 'REJECTED',
        message: 'Repair verification failed. Image does not show a valid fix.',
        timestamp: new Date().toISOString(),
        details: recap
      });
    }

    await batch.commit();

    res.json({ success: true, isRepaired, recap });
  } catch (error) {
    console.error('[verify.js] Verification failed:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
