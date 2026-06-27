/**
 * firebase.js — Client-side Firebase SDK initialization
 * Only VITE_ prefixed env vars are exposed to the browser by Vite.
 * Firestore, Storage, and Anonymous Auth are all initialized here.
 */
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
};

// Validate config on startup — catches missing .env values early
const missingKeys = Object.entries(firebaseConfig)
  .filter(([, v]) => !v)
  .map(([k]) => `VITE_${k.replace(/([A-Z])/g, '_$1').toUpperCase()}`);

if (missingKeys.length) {
  console.error('[firebase.js] Missing env vars:', missingKeys.join(', '));
  console.error('Copy .env.example → .env and fill in your Firebase config.');
}

const app = initializeApp(firebaseConfig);

export const db      = getFirestore(app);
export const storage = getStorage(app);
export const auth    = getAuth(app);

/**
 * silentSignIn — signs in anonymously and returns the user.
 * Called once in App.jsx on mount. Persists via Firebase local persistence.
 */
export async function silentSignIn() {
  return new Promise((resolve) => {
    // If already signed in (e.g. page refresh), resolve immediately
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        unsubscribe();
        resolve(user);
      }
    });

    // Sign in anonymously — Firebase persists the session
    signInAnonymously(auth).catch((err) => {
      console.error('[firebase.js] Anonymous sign-in failed:', err.message);
      resolve(null);
    });
  });
}

export { signInAnonymously, onAuthStateChanged };
