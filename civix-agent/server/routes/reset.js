const express = require('express');
const { db } = require('../firebase');
const { runSeed } = require('../scripts/seed');

const router = express.Router();

router.post('/reset-demo', async (req, res) => {
  try {
    const expectedPassphrase = process.env.VITE_MUNICIPAL_WORKER_PASSPHRASE || 'civix2026';
    const providedPassphrase = req.headers['x-worker-passphrase'];

    if (!providedPassphrase || providedPassphrase !== expectedPassphrase) {
      return res.status(403).json({ error: 'Forbidden: Invalid or missing worker passphrase' });
    }

    // Reuse the exact seed logic
    await runSeed(false);

    // runSeed already adds the system reboot message, but the user explicitly requested:
    // "Writes a fresh System log entry to the Activity Feed, something like 'System reset. Demo environment reinitialized with sample municipal reports.'"
    
    await db.collection('activityFeed').add({
      type: 'SYSTEM',
      message: 'System reset. Demo environment reinitialized with sample municipal reports.',
      createdAt: new Date().toISOString()
    });

    res.json({ success: true, message: 'Demo data reset successfully.' });
  } catch (error) {
    console.error('[/api/reset-demo] Reset failed:', error);
    res.status(500).json({ error: 'Failed to reset demo data' });
  }
});

module.exports = router;
