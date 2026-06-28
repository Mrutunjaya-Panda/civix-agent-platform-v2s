---
phase: 5
plan: 3
wave: 2
---

# Plan 5.3: Citizen Engagement & Confirmation UI

## Objective
Provide real-time feedback to the citizen when their issue is resolved. The citizen receives an in-app toast notification and can confirm the resolution to formally close the ticket.

## Context
- civix-agent/client/src/App.jsx
- civix-agent/client/src/components/TicketDetail.jsx
- civix-agent/server/server.js

## Tasks

<task type="auto">
  <name>Citizen Real-Time Notification & Confirmation</name>
  <files>
    - civix-agent/client/src/App.jsx
    - civix-agent/client/src/components/TicketDetail.jsx
    - civix-agent/server/server.js
  </files>
  <action>
    1. **Backend**: Add a small `POST /api/confirm` endpoint that takes `ticketId`, sets `status` to `closed`, and logs to `activityFeed` ("Ticket closed. Loop complete.").
    2. **Backend (Timeout Fallback)**: Update the `/api/simulate-time` (Agent 2 SLA monitor) logic. If a ticket is `resolved` but not `closed`, and 72 simulated hours pass, auto-close it with an Activity Feed log: *"Citizen confirmation timeout (72h) → auto-closed"*. Alternatively, if we added a 'dispute' button, it would re-escalate, but auto-close is the safest default fallback to prevent a dead-end state.
    3. **Frontend Toast**: In `App.jsx`, listen to changes in `tickets`. If a ticket authored by the current `firebaseUser.uid` transitions to `status === 'resolved'`, show a temporary in-app toast message: "Your issue has been marked as Repaired! Click to view."
    4. **TicketDetail UI**: In `TicketDetail.jsx`, if `persona === 'citizen'` and `ticket.status === 'resolved'`:
       - Display the Agent 3 generated `recap` text.
       - Show the `repairImageUrl`.
       - Render a "Confirm Resolution" button.
       - Clicking it calls `POST /api/confirm`, updating the ticket to `closed`.
  </action>
  <verify>
    Create a ticket as a Citizen. Switch to Worker, upload a valid repair photo. Switch back to Citizen and observe the "resolved" status, the agent recap, and click the confirmation button to close the ticket.
  </verify>
  <done>
    Citizens are kept in the loop and have the power to confirm resolutions, completing the civic feedback cycle.
  </done>
</task>

## Success Criteria
- [ ] `/api/confirm` endpoint successfully closes a ticket.
- [ ] Citizen sees a toast/notification when their ticket is resolved.
- [ ] Ticket details display the repair image and agent recap to the citizen.
- [ ] Citizen can click "Confirm Resolution" to close the loop.
