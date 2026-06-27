---
phase: 1
plan: 2
wave: 1
---

# Plan 1.2: Firebase Services Configuration + Gemini API Verification

## Objective
Configure all three Firebase services (Firestore, Storage, Anonymous Auth) and verify the Gemini API key works with a real multimodal call. After this plan, every Google service the agents depend on is proven live — no integration surprises in Phases 3-5.

## Context
- .gsd/SPEC.md — Firebase stack decisions, Gemini 2.5 Flash, Anonymous Auth, free-tier requirement
- .gsd/DECISIONS.md — ADR-002 (Firebase Anonymous Auth), ADR-006 (Firebase Storage)
- civix-agent/server/server.js — extend with Firebase Admin SDK init
- civix-agent/client/src/ — extend with Firebase client SDK init

## Prerequisites
Before running this plan, the user must:
1. Create a Firebase project at https://console.firebase.google.com
2. Enable Firestore (Native mode), Storage, and Anonymous Authentication in the Firebase console
3. Generate a Firebase Admin SDK service account JSON key and add values to .env
4. Add GEMINI_API_KEY to .env from https://aistudio.google.com

## Tasks

<task type="auto">
  <name>Firebase Admin SDK (server) + Client SDK (frontend) initialization</name>
  <files>
    civix-agent/server/server.js
    civix-agent/server/firebase.js   ← new: Firebase Admin singleton
    civix-agent/client/src/firebase.js  ← new: Firebase client config
    civix-agent/.env.example         ← update with all Firebase fields
  </files>
  <action>
    SERVER SIDE (Firebase Admin SDK):
    1. cd server && npm install firebase-admin
    2. Create server/firebase.js:
       const admin = require('firebase-admin')
       if (!admin.apps.length) {
         admin.initializeApp({
           credential: admin.credential.cert({
             projectId: process.env.FIREBASE_PROJECT_ID,
             privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
             clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
           }),
           storageBucket: `${process.env.FIREBASE_PROJECT_ID}.appspot.com`
         })
       }
       module.exports = { db: admin.firestore(), storage: admin.storage(), admin }
    3. Add to server/server.js: require('./firebase') (imports and validates on startup — crashes with clear error if .env is wrong)
    4. Add GET /api/firebase-test route: writes a test doc to Firestore 'healthCheck' collection, reads it back, returns { firestoreOk: true, docId }

    CLIENT SIDE (Firebase client SDK):
    5. cd client && npm install firebase
    6. Create client/src/firebase.js:
       import { initializeApp } from 'firebase/app'
       import { getFirestore } from 'firebase/firestore'
       import { getStorage } from 'firebase/storage'
       import { getAuth, signInAnonymously } from 'firebase/auth'
       const firebaseConfig = {
         apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
         authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
         projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
         storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
         messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
         appId: import.meta.env.VITE_FIREBASE_APP_ID
       }
       const app = initializeApp(firebaseConfig)
       export const db = getFirestore(app)
       export const storage = getStorage(app)
       export const auth = getAuth(app)
       export { signInAnonymously }
    7. Add VITE_ prefixed Firebase client config vars to .env and .env.example
    8. In client/src/App.jsx: import { auth, signInAnonymously } from './firebase', call signInAnonymously(auth) in useEffect on mount, console.log the UID
    - IMPORTANT: Server uses FIREBASE_* env vars (no VITE_ prefix, kept server-side only)
    - Client uses VITE_FIREBASE_* env vars (Vite exposes only VITE_ prefixed vars to browser)
    - Never expose FIREBASE_PRIVATE_KEY or GEMINI_API_KEY to the client/browser
    - Storage bucket format: projectId.appspot.com (or projectId.firebasestorage.app for newer projects — check Firebase console)
  </action>
  <verify>
    1. Server: curl http://localhost:3001/api/firebase-test → {"firestoreOk":true,"docId":"..."}
    2. Firebase console Firestore → healthCheck collection → doc appears
    3. Browser devtools console → "Anonymous UID: [uid string]" logged on page load (not an error)
  </verify>
  <done>
    - Firebase Admin connects to Firestore without credential errors
    - /api/firebase-test creates and reads a Firestore doc successfully
    - Client-side Anonymous Auth signs in silently and logs a valid UID
    - No Firebase API keys are visible in browser network requests (only VITE_ prefixed config)
  </done>
</task>

<task type="auto">
  <name>Gemini API test call (multimodal + responseSchema)</name>
  <files>
    civix-agent/server/gemini.js   ← new: Gemini client singleton
    civix-agent/server/server.js   ← add test endpoint
  </files>
  <action>
    1. cd server && npm install @google/genai
    2. Create server/gemini.js:
       const { GoogleGenAI, SchemaType } = require('@google/genai')
       const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
       module.exports = { ai, SchemaType }
    3. Add POST /api/gemini-test to server.js:
       - Accept { imageUrl, description } in request body
       - Use a hardcoded public test image URL if none provided (use a real public civic issue image URL)
       - Call Gemini 2.5 Flash with:
         model: 'gemini-2.5-flash'
         multimodal input: text prompt + fileData (imageUrl, mimeType: 'image/jpeg')
         responseSchema: { type: OBJECT, properties: { category: STRING, severity: NUMBER, reasoning: STRING }, required: [...] }
         generationConfig: { responseMimeType: 'application/json', responseSchema }
       - Return the parsed JSON response
    - Model ID: use 'gemini-2.5-flash' (confirm exact string in Google AI Studio if 'gemini-2.5-flash-latest' is needed)
    - Parse result: JSON.parse(result.response.text()) — do not access .candidates directly
    - Handle errors gracefully: if Gemini call fails, return { error: message } with 500 status
    - DO NOT implement any triage logic here — this is purely a connectivity and schema test
  </action>
  <verify>
    curl -X POST http://localhost:3001/api/gemini-test \
      -H "Content-Type: application/json" \
      -d '{"imageUrl":"https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/24701-nature-natural-beauty.jpg/320px-24701-nature-natural-beauty.jpg"}' 
    → Returns JSON matching responseSchema: { "category": "...", "severity": ..., "reasoning": "..." }
    (category may be anything for a test image — we only care that the schema is enforced and no API errors)
  </verify>
  <done>
    - /api/gemini-test returns valid JSON matching the responseSchema
    - No "API_KEY_INVALID" or quota errors
    - response.text() parses as JSON without error
    - Gemini singleton (gemini.js) is importable by future agent modules
  </done>
</task>

## Success Criteria
- [ ] Firestore write+read works via /api/firebase-test (verified in Firebase console)
- [ ] Firebase Anonymous Auth signs in client silently (UID logged in devtools)
- [ ] Gemini 2.5 Flash returns structured JSON matching responseSchema via /api/gemini-test
- [ ] No secrets exposed client-side (GEMINI_API_KEY, FIREBASE_PRIVATE_KEY absent from browser network tab)
