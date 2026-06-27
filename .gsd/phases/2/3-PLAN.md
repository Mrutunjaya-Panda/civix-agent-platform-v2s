---
phase: 2
plan: 3
wave: 2
---

# Plan 2.3: Persona Switcher & UI Components

## Objective
Implement the UI shell elements for the application: a Persona Switcher to gate Municipal Worker access using the passphrase, and a Ticket Detail overlay to show static data (which will become dynamic in Phase 3+).

## Context
- .gsd/SPEC.md
- civix-agent/client/src/App.jsx

## Tasks

<task type="auto">
  <name>Persona Switcher UI</name>
  <files>
    - civix-agent/client/src/components/PersonaSwitcher.jsx
    - civix-agent/client/src/App.jsx
  </files>
  <action>
    - Create `PersonaSwitcher` component: a toggle between "Citizen" and "Municipal Worker".
    - When selecting "Municipal Worker", prompt for a passphrase.
    - Check the passphrase against `import.meta.env.VITE_MUNICIPAL_WORKER_PASSPHRASE` (note: need to add `VITE_` prefix to it in `.env` if we want to check it client-side. Update `.env.example` and `.env` logic for `MUNICIPAL_WORKER_PASSPHRASE`).
    - Add it to the main `App.jsx` UI overlay.
  </action>
  <verify>Check that switching to Municipal Worker requires the correct passphrase.</verify>
  <done>UI displays current persona and correctly gates the worker persona.</done>
</task>

<task type="auto">
  <name>Ticket Detail Sidebar (Static)</name>
  <files>
    - civix-agent/client/src/components/TicketDetail.jsx
    - civix-agent/client/src/App.jsx
  </files>
  <action>
    - Create a sidebar or modal component `TicketDetail` to display when a map pin is clicked.
    - Fields: Category, Severity, Status, Reasoning (from Gemini), Location, Photo, Activity Feed.
    - Add state in `App.jsx` for `selectedTicket` and wire it to map marker clicks.
  </action>
  <verify>Manually click a marker (using dummy data) to see the sidebar pop out.</verify>
  <done>Ticket Detail panel successfully opens on pin click.</done>
</task>

## Success Criteria
- [ ] Persona Switcher works and restricts access.
- [ ] Clicking a pin opens a detail panel.
