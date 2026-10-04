const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const { db } = require('../firebase');

const BHUBANESWAR_CENTER = { lat: 20.2960, lng: 85.8245 };
const USER_ID = 'demo-citizen-123';

const DEMO_IMAGES = {
  image1: 'https://res.cloudinary.com/dozoeunif/image/upload/v1782619338/jogaefu5bwnxiw7tk7z6.jpg',
  image2: 'https://res.cloudinary.com/dozoeunif/image/upload/v1782796457/pkvhxxkcoh3za4k5qwow.png',
  utilityPole: 'https://res.cloudinary.com/dozoeunif/image/upload/v1791138274/utility-pole-leans-precarious-angle-appearing-to-have-snapped-become-uprooted-ground-as-weighed-down-451644726_tgywkf.webp',
  streetlight: 'https://res.cloudinary.com/dozoeunif/image/upload/v1791138415/streetlight_foxfgr.jpg'
};

// Generate random coords around center (rough approximation ~5km radius)
function randomLocation() {
  const r = 5000 / 111300; // = 0.045 degrees
  const u = Math.random();
  const v = Math.random();
  const w = r * Math.sqrt(u);
  const t = 2 * Math.PI * v;
  const x = w * Math.cos(t);
  const y = w * Math.sin(t);
  const new_x = x / Math.cos(BHUBANESWAR_CENTER.lat * (Math.PI / 180));
  
  return {
    lat: BHUBANESWAR_CENTER.lat + y,
    lng: BHUBANESWAR_CENTER.lng + new_x
  };
}

const timestamp = new Date().toISOString();

const seedData = [
  // 1. Pre-Stalled Low-Severity Ticket (Scenario 2)
  {
    id: 'demo-stalled-001',
    description: 'Streetlight blinking on and off near the park entrance.',
    category: 'Electricity',
    status: 'stalled',
    severity: 2,
    simulatedAge: 72,
    location: randomLocation(),
    reportedBy: USER_ID,
    createdAt: timestamp,
    updatedAt: timestamp,
    duplicateCount: 1,
    // imageUrl: 'https://loremflickr.com/800/600/streetlight,broken,night/all?lock=101',
    imageUrl: DEMO_IMAGES.streetlight,
    reasoning: 'Non-critical lighting issue in a public space. Low impact on immediate safety.',
    brief: {
      card: { title: 'STALLED: Minor Lighting Issue', summary: 'Blinking streetlight. No safety risk.', priority_actions: ['Schedule maintenance'] },
      email: 'A minor lighting issue is stalled. Dispatch crew when available.'
    }
  },
  
  // 2. Pre-Escalated High-Severity Cluster (Scenario 3)
  {
    id: 'demo-escalated-002',
    description: 'Massive sinkhole opening up on the main road, traffic blocked.',
    category: 'Roads',
    status: 'escalated',
    severity: 9,
    simulatedAge: 26,
    location: randomLocation(),
    reportedBy: USER_ID,
    createdAt: timestamp,
    updatedAt: timestamp,
    duplicateCount: 3, // Shows cluster reinforcement
    //imageUrl: 'https://loremflickr.com/800/600/sinkhole,road,damage/all?lock=102',
    imageUrl: DEMO_IMAGES.image1,
    reasoning: 'Critical infrastructure failure blocking traffic. High risk of injury.',
    brief: {
      card: { title: 'URGENT: Major Road Collapse', summary: 'Sinkhole blocking main transit artery.', priority_actions: ['Dispatch emergency barricades', 'Reroute traffic', 'Assess structural damage'] },
      email: 'URGENT ESCALATION:\nA massive sinkhole has blocked the main road. Immediate tier-2 response required to secure the perimeter.'
    }
  },

  // 3. Resolved (Unconfirmed) Ticket for Citizen Loop Demo (Scenario 4)
  {
    id: 'demo-resolved-003',
    description: 'Water pipe burst flooding the intersection.',
    category: 'Water',
    status: 'resolved',
    severity: 6,
    simulatedAge: 40,
    resolvedAtAge: 40, // Has 72h from here to auto-close
    location: randomLocation(),
    reportedBy: USER_ID,
    createdAt: timestamp,
    updatedAt: timestamp,
    duplicateCount: 1,
    //imageUrl: 'https://loremflickr.com/800/600/flood,street,leak/all?lock=103',
    imageUrl: DEMO_IMAGES.image2,
    repairImageUrl: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?q=80&w=800&auto=format&fit=crop', // Stock fixed pipe
    agentRecap: 'The uploaded image confirms the pipe has been sealed and the flooding is contained. Resolution verified.',
    reasoning: 'Active water leak wasting resources and causing localized flooding. Moderate severity.',
    brief: {
      card: { title: 'Pipe Leak', summary: 'Water main leak flooding street.', priority_actions: ['Shut off local valve', 'Patch pipe'] },
      email: 'Dispatch plumbing unit to repair burst pipe.'
    }
  }
];

// Add 17 Normal Tickets
const categories = ['Roads', 'Water', 'Electricity', 'Sanitation'];
const severities = [2, 3, 4, 5, 6, 7];

for (let i = 4; i <= 6; i++) {
  const cat = categories[Math.floor(Math.random() * categories.length)];
  const sev = severities[Math.floor(Math.random() * severities.length)];
  
  seedData.push({
    id: `demo-normal-${i.toString().padStart(3, '0')}`,
    description: `Standard civic issue report regarding ${cat.toLowerCase()} infrastructure.`,
    category: cat,
    status: 'open',
    severity: sev,
    simulatedAge: Math.floor(Math.random() * 20),
    location: randomLocation(),
    reportedBy: `other-user-${i}`, // So they don't get toasts for these
    createdAt: timestamp,
    updatedAt: timestamp,
    duplicateCount: 1,
    //imageUrl: `https://loremflickr.com/800/600/street,infrastructure,city/all?lock=${i}`, // unique image per normal ticket
    imageUrl: DEMO_IMAGES.utilityPole,
    reasoning: `Triage AI determined this is a severity ${sev} ${cat} issue.`,
    brief: {
      card: { title: `Standard ${cat} Issue`, summary: 'Routine maintenance required.', priority_actions: ['Inspect', 'Repair'] },
      email: 'Please schedule standard inspection.'
    }
  });
}

async function runSeed(isCli = false) {
  console.log('🌱 Starting database seed...');
  
  try {
    // 1. Wipe existing tickets
    console.log('Deleting old tickets...');
    const ticketsSnap = await db.collection('tickets').get();
    const batchDelete = db.batch();
    ticketsSnap.docs.forEach(doc => batchDelete.delete(doc.ref));
    await batchDelete.commit();
    console.log(`Deleted ${ticketsSnap.size} old tickets.`);

    // 2. Wipe existing activity feed
    console.log('Deleting old activity feed...');
    const feedSnap = await db.collection('activityFeed').get();
    const batchFeedDelete = db.batch();
    feedSnap.docs.forEach(doc => batchFeedDelete.delete(doc.ref));
    await batchFeedDelete.commit();
    console.log(`Deleted ${feedSnap.size} feed entries.`);

    // 3. Insert new seed data
    console.log('Inserting seed tickets...');
    let batchInsert = db.batch();
    
    // Firestore batches have a 500 operation limit, we only have 20 so it's fine
    for (const ticket of seedData) {
      const { id, ...data } = ticket;
      const docRef = db.collection('tickets').doc(id);
      batchInsert.set(docRef, data);
    }
    await batchInsert.commit();
    console.log(`Successfully seeded ${seedData.length} tickets!`);

    // 4. Create an initial activity feed entry so it's not empty
    await db.collection('activityFeed').add({
      type: 'SYSTEM',
      message: 'System rebooted. Initializing Agent Swarm. Monitoring active municipal reports across Bhubaneswar.',
      createdAt: new Date().toISOString()
    });

    console.log('✅ Seed complete!');
    if (isCli) process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err);
    if (isCli) process.exit(1);
    throw err;
  }
}

if (require.main === module) {
  runSeed(true);
}

module.exports = { runSeed };
