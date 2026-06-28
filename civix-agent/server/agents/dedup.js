/**
 * dedup.js — Spatial deduplication utilities for the Triage Agent
 *
 * ADR-012: Semantic dedup (Gemini embedding comparison) is intentionally
 * deferred post-hackathon. Spatial + category match delivers the visible
 * cluster merge moment without a second LLM round-trip.
 */
const { db } = require('../firebase');

// ── Haversine distance formula ─────────────────────────────────────────────────
/**
 * Compute the great-circle distance between two lat/lng points.
 * @param {number} lat1
 * @param {number} lng1
 * @param {number} lat2
 * @param {number} lng2
 * @returns {number} Distance in metres
 */
function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371000; // Earth radius in metres
  const toRad = (deg) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;

  return R * 2 * Math.asin(Math.sqrt(a));
}

// ── Severity band — SINGLE source of truth ────────────────────────────────────
/**
 * Convert a numeric severity score to a human-readable band label.
 * Used by BOTH the activity feed log lines and the frontend UI.
 * Import this instead of hardcoding HIGH/MEDIUM/LOW anywhere.
 *
 * @param {number} severity - Score 1-10
 * @returns {'HIGH' | 'MEDIUM' | 'LOW'}
 */
function severityBand(severity) {
  if (severity >= 7) return 'HIGH';
  if (severity >= 4) return 'MEDIUM';
  return 'LOW';
}

// ── Nearby ticket query ────────────────────────────────────────────────────────
/**
 * Find open tickets of the same category within a given radius.
 * Queries Firestore by category (indexed), then filters in-memory by distance.
 *
 * @param {object} params
 * @param {number} params.lat
 * @param {number} params.lng
 * @param {string} params.category  — Must match a valid ROUTING_TABLE key
 * @param {number} [params.radiusMeters=50]
 * @returns {Promise<Array>} Matching ticket objects sorted by distance ascending
 */
async function findNearbyTickets({ lat, lng, category, radiusMeters = 50 }) {
  // Fetch all open (non-resolved) tickets in the same category
  let snapshot;
  try {
    snapshot = await db
      .collection('tickets')
      .where('category', '==', category)
      .where('status', '!=', 'resolved')
      .get();
  } catch (err) {
    // Graceful fallback if composite index is still building
    if (err.code === 9 || (err.message && err.message.includes('index'))) {
      console.warn('[dedup] Composite index not ready yet — skipping dedup, treating as unique report.');
      return [];
    }
    throw err;
  }

  const nearby = [];

  snapshot.forEach((doc) => {
    const data = doc.data();
    if (!data.location?.lat || !data.location?.lng) return;

    const distanceM = haversine(lat, lng, data.location.lat, data.location.lng);
    if (distanceM <= radiusMeters) {
      nearby.push({ id: doc.id, ...data, _distanceM: distanceM });
    }
  });

  // Sort by closest first so report.js always reinforces the nearest parent
  nearby.sort((a, b) => a._distanceM - b._distanceM);

  return nearby;
}

module.exports = { haversine, severityBand, findNearbyTickets };
