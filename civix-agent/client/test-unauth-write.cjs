require('dotenv').config({ path: '../.env' });
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc } = require('firebase/firestore');

// Initialize with Client SDK (NOT Admin)
const app = initializeApp({
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
});

const db = getFirestore(app);

async function testUnauthWrite() {
  console.log('Attempting unauthenticated write to "tickets"...');
  try {
    const docRef = await addDoc(collection(db, 'tickets'), {
      status: 'new',
      category: 'Roads',
      test: 'unauth-write'
    });
    console.error('❌ FAIL: Unauthenticated write SUCCEEDED!', docRef.id);
    process.exit(1);
  } catch (err) {
    if (err.code === 'permission-denied') {
      console.log('✅ SUCCESS: Unauthenticated write was REJECTED by firestore.rules.');
      process.exit(0);
    } else {
      console.error('❌ FAIL: Failed for an unexpected reason:', err);
      process.exit(1);
    }
  }
}

testUnauthWrite();
