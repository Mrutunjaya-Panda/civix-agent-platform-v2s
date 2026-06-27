/**
 * firebase.js — Server-side Firebase Admin SDK singleton (v13 modular API)
 * firebase-admin v13 exports initializeApp, cert, getApps at the top level.
 * Subservices are imported from firebase-admin/firestore, firebase-admin/storage.
 */
const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getFirestore }                 = require('firebase-admin/firestore');

// Guard against double-initialization (nodemon hot-reload)
if (!getApps().length) {
  const privateKey = process.env.FIREBASE_PRIVATE_KEY
    ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
    : undefined;

  if (!process.env.FIREBASE_PROJECT_ID || !privateKey || !process.env.FIREBASE_CLIENT_EMAIL) {
    throw new Error(
      '[firebase.js] Missing env vars: FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL\n' +
      'Copy .env.example → .env and fill in your Firebase Admin SDK credentials.'
    );
  }

  initializeApp({
    credential: cert({
      projectId:   process.env.FIREBASE_PROJECT_ID,
      privateKey,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    }),
  });

  console.log(`[Firebase] Admin SDK initialized — project: ${process.env.FIREBASE_PROJECT_ID}`);
}

const db = getFirestore();
db.settings({ ignoreUndefinedProperties: true });

module.exports = { db };
