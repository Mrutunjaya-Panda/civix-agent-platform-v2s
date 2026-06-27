/**
 * firebase.js — Server-side Firebase Admin SDK singleton
 * Initializes once; imported by all agent modules that need Firestore or Storage.
 * Credentials come from environment variables ONLY — never hardcoded.
 */
const admin = require('firebase-admin');

if (!admin.apps.length) {
  const privateKey = process.env.FIREBASE_PRIVATE_KEY
    ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
    : undefined;

  if (!process.env.FIREBASE_PROJECT_ID || !privateKey || !process.env.FIREBASE_CLIENT_EMAIL) {
    throw new Error(
      '[firebase.js] Missing required env vars: FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL\n' +
      'Copy .env.example → .env and fill in your Firebase Admin SDK credentials.'
    );
  }

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    }),
    storageBucket: `${process.env.FIREBASE_PROJECT_ID}.appspot.com`,
  });

  console.log(`[Firebase] Admin SDK initialized — project: ${process.env.FIREBASE_PROJECT_ID}`);
}

const db = admin.firestore();
const storage = admin.storage();

// Firestore settings — disable deprecated timestamp warnings
db.settings({ ignoreUndefinedProperties: true });

module.exports = { db, storage, admin };
