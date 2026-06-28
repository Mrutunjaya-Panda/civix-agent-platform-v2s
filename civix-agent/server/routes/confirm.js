const express = require('express');
const { db } = require('../firebase');

const router = express.Router();

router.post('/confirm', async (req, res) => {
  try {
    const { ticketId } = req.body;

    if (!ticketId) {
      return res.status(400).json({ error: 'Missing ticketId' });
    }

    const ticketRef = db.collection('tickets').doc(ticketId);
    const ticketDoc = await ticketRef.get();

    if (!ticketDoc.exists) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    const batch = db.batch();

    // Close the ticket
    batch.update(ticketRef, {
      status: 'closed',
      updatedAt: new Date().toISOString()
    });

    // Write activity feed entry
    const feedRef = db.collection('activityFeed').doc();
    batch.set(feedRef, {
      ticketId,
      type: 'CLOSED',
      message: 'Ticket closed. Loop complete.',
      timestamp: new Date().toISOString()
    });

    await batch.commit();

    res.json({ success: true });
  } catch (error) {
    console.error('[confirm.js] Confirmation failed:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
