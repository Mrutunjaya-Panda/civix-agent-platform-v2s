---
phase: 3
plan: 3
wave: 3
---

# Plan 3.3: Spatial Deduplication + Cluster Reinforcement

## Objective
Complete the Triage Agent by adding the spatial duplicate check and Cluster Reinforcement logic — if a new report lands within 50m of an existing open ticket in the same category, it reinforces the cluster instead of creating a new pin, bumping severity with the ClusterBonus.

## Context
- .gsd/SPEC.md — Agent 1 spec, ClusterBonus formula, Success Criteria (90% dedup accuracy)
- civix-agent/server/agents/triage.js
- civix-agent/server/routes/report.js
- civix-agent/server/firebase.js

## Tasks

<task type="auto">
  <name>Spatial Geo-Radius Query</name>
  <files>
    - civix-agent/server/agents/dedup.js
  </files>
  <action>
    Create `server/agents/dedup.js` exporting `findNearbyTickets({ lat, lng, category, radiusMeters = 50 })`:

    1. Query Firestore `tickets` collection for open tickets of the same category.
    2. For each result, compute Haversine distance from `{lat, lng}` to `ticket.location`.
    3. Return the array of tickets within `radiusMeters` sorted by distance.

    Note: Firestore does NOT support native geo-radius queries — we must fetch tickets by category and filter in-memory using Haversine. This is acceptable for demo scale (city-level, <1000 tickets).

    Implement a standalone `haversine(lat1, lng1, lat2, lng2): meters` utility inside dedup.js.
  </action>
  <verify>
    `node -e "require('./agents/dedup').findNearbyTickets({ lat: 20.2961, lng: 85.8245, category: 'Roads' }).then(r => console.log('nearby:', r.length))"`
    Should return an array (may be empty if no tickets nearby, which is fine).
  </verify>
  <done>
    findNearbyTickets returns an array without throwing; haversine returns reasonable meter distances.
  </done>
</task>

<task type="auto">
  <name>Cluster Reinforcement + ClusterBonus in Report Route</name>
  <files>
    - civix-agent/server/routes/report.js
    - civix-agent/server/agents/triage.js
  </files>
  <action>
    Update `report.js` to integrate the dedup check before writing a new ticket:

    1. Call `findNearbyTickets({ lat, lng, category })` AFTER triage classification.
    2. **If nearby tickets found (cluster hit)**:
       - Calculate `clusterBonus = min(nearbyTickets.length * 0.5, 2)`.
       - Re-run severity formula with clusterBonus applied.
       - Update the NEAREST existing ticket's `severity` and `duplicateCount` in Firestore.
       - Write to `activityFeed`: `"${nearbyTickets.length} similar report(s) within 50m detected → merged → severity bumped to ${newSeverity}"`.
       - Return `{ status: 'clustered', parentTicketId, newSeverity }` — do NOT create a new ticket.
    3. **If no nearby tickets (unique report)**:
       - Create new ticket as in Plan 3.2 (clusterBonus = 0).
    4. Update `triageReport` in `triage.js` to accept an optional `clusterBonus` parameter for the formula.
  </action>
  <verify>
    1. Submit a first report at lat=20.2961, lng=85.8245, category=Roads → must create a new ticket.
    2. Submit a second report at lat=20.2962, lng=85.8246 (same area), category=Roads → must return `{ status: "clustered" }` and NOT create a second pin.
    3. Activity feed must show the merge message in Firestore console.
  </verify>
  <done>
    Duplicate reports within 50m are merged; cluster bonus recalculates severity; activity feed records the decision.
  </done>
</task>

## Success Criteria
- [ ] Haversine distance calculation is correct (test: ~111m per 0.001 degree lat).
- [ ] Nearby tickets are found and returned correctly.
- [ ] Second report within 50m is clustered, not duplicated as a new pin.
- [ ] ClusterBonus correctly bumps severity (capped at +2).
- [ ] Activity Feed entry describes the merge with human-readable language.
