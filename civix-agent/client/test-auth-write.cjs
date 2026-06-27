require('dotenv').config({ path: '../.env' });
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc } = require('firebase/firestore');
const { getAuth, signInAnonymously } = require('firebase/auth');

const app = initializeApp({
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
});

const db = getFirestore(app);
const auth = getAuth(app);

async function testAuthWrite() {
  console.log('Authenticating anonymously...');
  try {
    const userCred = await signInAnonymously(auth);
    console.log('✅ Authenticated as:', userCred.user.uid);
    
    console.log('Attempting authenticated write to "tickets"...');
    const docRef = await addDoc(collection(db, 'tickets'), {
      category: 'Roads',
      severity: 8,
      status: 'new',
      reasoning: 'Pothole on main road causing traffic delays (Dummy Ticket)',
      location: { lat: 20.2961 + (Math.random() * 0.01 - 0.005), lng: 85.8245 + (Math.random() * 0.01 - 0.005) },
      createdAt: new Date().toISOString(),
      reportedBy: userCred.user.uid
    });
    
    console.log('✅ SUCCESS: Dummy ticket injected successfully with ID:', docRef.id);
    console.log('This ticket should now appear instantly on your live map!');
    process.exit(0);
  } catch (err) {
    console.error('❌ FAIL: Authenticated write failed:', err);
    process.exit(1);
  }
}

testAuthWrite();
