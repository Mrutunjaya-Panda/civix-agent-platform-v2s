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
const verifyRouter = require('./routes/verify');
const confirmRouter = require('./routes/confirm');
const resetRouter = require('./routes/reset');

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

// Helper for gemini test: Fetch image and convert to inlineData
async function fetchImageInline(url) {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
  });
  if (!response.ok) throw new Error(`Failed to fetch image: ${response.status}`);
  const contentType = response.headers.get('content-type') || 'image/jpeg';
  const mimeType = contentType.split(';')[0].trim();
  const arrayBuffer = await response.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString('base64');
  return { inlineData: { mimeType, data: base64 } };
}

// Gemini multimodal test — classifies a test image with responseSchema
app.post('/api/gemini-test', async (req, res) => {
  try {
    const { imageUrl } = req.body;

    // Use a public test image if none provided
    const testUrl = imageUrl || 'https://picsum.photos/seed/civix/800/600.jpg';
    const imagePart = await fetchImageInline(testUrl);

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
        imagePart,
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
app.use('/api', verifyRouter);
app.use('/api', confirmRouter);
app.use('/api', resetRouter);

// ── Production static serving ─────────────────────────────────────────────────
// IMPORTANT: Must come AFTER all /api routes
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '../client/dist');
  app.use(express.static(distPath));
  app.use((req, res, next) => {
    if (req.method === 'GET') {
      res.sendFile(path.join(distPath, 'index.html'));
    } else {
      next();
    }
  });
}

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`CivixAgent API running on :${PORT} [${process.env.NODE_ENV || 'development'}]`);
});

module.exports = app;
