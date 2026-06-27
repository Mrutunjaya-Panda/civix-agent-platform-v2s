---
phase: 2
plan: 2
wave: 2
---

# Plan 2.2: Live Map Data Binding & Severity Pins

## Objective
Connect the React-Leaflet map to a real-time Firestore listener (`onSnapshot`) so that tickets appear instantly. Implement the severity-based styling for map pins.

## Context
- .gsd/SPEC.md
- civix-agent/client/src/components/Map.jsx
- civix-agent/client/src/firebase.js

## Tasks

<task type="auto">
  <name>Firestore useTickets Hook</name>
  <files>
    - civix-agent/client/src/hooks/useTickets.js
  </files>
  <action>
    - Create a custom React hook `useTickets` that uses Firebase `onSnapshot` to listen to the `tickets` collection.
    - Return the array of ticket objects (with their Firestore document ID).
  </action>
  <verify>Check that the hook correctly initializes the Firestore listener.</verify>
  <done>Hook is available for `App.jsx` to consume.</done>
</task>

<task type="auto">
  <name>Data-Bind Map and Add Severity Pins</name>
  <files>
    - civix-agent/client/src/components/Map.jsx
    - civix-agent/client/src/App.jsx
  </files>
  <action>
    - Update `Map.jsx` `MarkerClusterLayer` to map over the `tickets` prop and render `L.marker` for each.
    - Create custom HTML icons for the markers based on severity:
      - LOW (1-3.9) -> Green
      - MEDIUM (4-6.9) -> Yellow
      - HIGH (7-10) -> Red
      - RESOLVED (status === 'resolved') -> Grey
    - Update `App.jsx` to use `useTickets()` and pass the array to `<Map tickets={tickets} />`.
  </action>
  <verify>Provide a small test script to inject a dummy ticket into Firestore and verify the UI updates without reload.</verify>
  <done>Map renders colored pins representing real Firestore data.</done>
</task>

## Success Criteria
- [ ] Map receives live data from Firestore.
- [ ] Pins are styled based on their severity/status.
