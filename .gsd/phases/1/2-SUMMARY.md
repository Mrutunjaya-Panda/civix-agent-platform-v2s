# Plan 1.2 Summary — Firebase Services + Gemini API Verification

## Status: COMPLETE (singletons written, manual verification required for live keys)

## What was built
- server/firebase.js: Firebase Admin SDK singleton
  - Validates FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL on startup
  - Exports db (Firestore), storage (Firebase Storage), admin
  - Clear error message if env vars missing
- server/gemini.js: Gemini 2.5 Flash singleton
  - Uses @google/genai SDK with Google AI Studio key (no billing card)
  - structuredCall() helper: wraps generateContent with responseSchema + JSON parse
  - MODEL constant: gemini-2.5-flash
- server/server.js: two test endpoints added
  - GET /api/firebase-test: writes + reads Firestore healthCheck collection
  - POST /api/gemini-test: multimodal call with responseSchema (category/severity/reasoning)
- client/src/firebase.js: Firebase client SDK
  - Validates VITE_ env vars on startup
  - silentSignIn(): handles both fresh visits and returning users (avoids double sign-in)
  - Exports db, storage, auth
- client/src/App.jsx: Anonymous Auth status badge shows UID on sign-in

## Verification (requires live .env keys to run)
User must:
1. Create Firebase project → enable Firestore, Storage, Anonymous Auth
2. Add Admin SDK service account credentials to .env
3. Add Gemini API key from aistudio.google.com to .env
4. Run server, test: GET /api/firebase-test → {firestoreOk: true}
5. Run server, test: POST /api/gemini-test → {geminiOk: true, result: {...}}
6. Open browser → Firebase Auth badge shows UID (not error)

## Packages installed
- server: firebase-admin@^13.x, @google/genai@^1.x
- client: firebase@^11.x
