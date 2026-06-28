const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// ── Initialize singletons (validates env vars on startup) ─────────────────────
const { db } = require('./firebase');
const { structuredCall } = require('./gemini');

// ── Agent Routes ──────────────────────────────────────────────────────────────
const reportRouter = require('./routes/report');
const escalationRouter = require('./routes/escalation');

const app = express();
const PORT = process.env.PORT || 3001;

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? true
    : ['http://localhost:5173', 'http://localhost:4173'],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── API Routes ────────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'CivixAgent API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// Firestore connectivity test — write + read a healthCheck doc
app.get('/api/firebase-test', async (req, res) => {
  try {
    const ref = await db.collection('healthCheck').add({
      createdAt: new Date().toISOString(),
      test: true,
    });
    const snap = await ref.get();
    res.json({ firestoreOk: true, docId: ref.id, data: snap.data() });
  } catch (err) {
    res.status(500).json({ firestoreOk: false, error: err.message });
  }
});

// Gemini multimodal test — classifies a test image with responseSchema
app.post('/api/gemini-test', async (req, res) => {
  try {
    const { imageUrl } = req.body;

    // Use a public test image if none provided
    const testUrl = imageUrl || 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Damaged_road.jpg/320px-Damaged_road.jpg';

    const schema = {
      type: 'object',
      properties: {
        category:  { type: 'string', enum: ['Roads', 'Water', 'Electricity', 'Sanitation', 'Unknown'] },
        severity:  { type: 'number', description: 'Visual severity 1-10' },
        reasoning: { type: 'string', description: 'Brief explanation of the classification' },
      },
      required: ['category', 'severity', 'reasoning'],
    };

    const result = await structuredCall({
      parts: [
        { text: 'You are a civic issue classifier. Analyze this image and classify the infrastructure problem shown.' },
        { fileData: { fileUri: testUrl, mimeType: 'image/jpeg' } },
      ],
      schema,
      system: 'Classify civic infrastructure issues from photos. Be concise.',
    });

    res.json({ geminiOk: true, result });
  } catch (err) {
    res.status(500).json({ geminiOk: false, error: err.message });
  }
});

// ── Mount agent routes ───────────────────────────────────────────────────────
app.use('/api', reportRouter);
app.use('/api', escalationRouter);

app.post('/api/verify', (req, res) => {
  res.status(503).json({ error: 'Verification endpoint not yet implemented (Phase 5)' });
});

app.post('/api/resolve', (req, res) => {
  res.status(503).json({ error: 'Resolution endpoint not yet implemented (Phase 5)' });
});

// ── Production static serving ─────────────────────────────────────────────────
// IMPORTANT: Must come AFTER all /api routes
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '../client/dist');
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`CivixAgent API running on :${PORT} [${process.env.NODE_ENV || 'development'}]`);
});

module.exports = app;
