/**
 * schema.js
 * 
 * Documentation and constants for the Firestore database collections used in CivixAgent.
 * Since Firestore is NoSQL, these act as structural documentation for our frontend and backend.
 */

export const COLLECTIONS = {
  TICKETS: 'tickets',
  CLUSTERS: 'clusters',
  ACTIVITY_FEED: 'activityFeed',
  USERS: 'users',
};

/**
 * @typedef {Object} Ticket
 * @property {string} id - Firestore document ID
 * @property {string} category - 'Roads' | 'Water' | 'Electricity' | 'Sanitation'
 * @property {number} severity - Calculated severity (1-10)
 * @property {string} reasoning - Gemini's explanation for the severity
 * @property {string} status - 'new' | 'escalated' | 'resolved'
 * @property {Object} location - { lat: number, lng: number }
 * @property {string} imageUrl - Cloudinary secure_url
 * @property {string} reportedBy - Firebase Auth UID of the citizen
 * @property {string} createdAt - ISO string timestamp
 * @property {number} simulatedAge - Hours since creation in simulation time
 */

/**
 * @typedef {Object} Cluster
 * @property {string} id - Firestore document ID
 * @property {string} parentTicketId - The main ticket this cluster belongs to
 * @property {Array<string>} duplicateTicketIds - Other tickets merged into this cluster
 * @property {number} clusterBonus - Severity points added due to density
 */

/**
 * @typedef {Object} ActivityFeedItem
 * @property {string} id - Firestore document ID
 * @property {string} type - 'TRIAGE' | 'ESCALATION' | 'RESOLUTION'
 * @property {string} message - Human-readable log
 * @property {string} ticketId - Associated ticket ID
 * @property {string} createdAt - ISO string timestamp
 */
