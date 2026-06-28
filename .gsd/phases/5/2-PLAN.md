---
phase: 5
plan: 2
wave: 2
---

# Plan 5.2: Closed-Loop Worker UI

## Objective
Enable Municipal Workers to submit proof of repair directly from the map interface. This closes the loop for the worker side of the equation.

## Context
- civix-agent/client/src/components/TicketDetail.jsx
- civix-agent/client/src/lib/cloudinary.js

## Tasks

<task type="auto">
  <name>Worker "Mark as Repaired" Action</name>
  <files>
    - civix-agent/client/src/components/TicketDetail.jsx
  </files>
  <action>
    In `TicketDetail.jsx`:
    1. If `persona === 'worker'` and `ticket.status !== 'resolved'` (and not closed), display a "Mark as Repaired" section.
    2. Add a file input for capturing the repair photo.
    3. On submit, upload the image via `cloudinary.js` to get a `secure_url`.
    4. Call `POST /api/verify` with the `ticketId` and the `repairImageUrl`.
    5. Show a loading state ("Agent verifying repair...").
    6. If the backend returns `isRepaired: false`, display a warning toast/message to the worker that the AI rejected the proof.
  </action>
  <verify>
    Switch to Municipal Worker mode, select an open ticket, upload a repair image, and verify the frontend hits the endpoint and processes the response.
  </verify>
  <done>
    Workers can seamlessly upload repair proof, triggering Agent 3 verification.
  </done>
</task>

## Success Criteria
- [ ] TicketDetail has an upload form for repair photos when in Worker mode.
- [ ] Upload uses Cloudinary and sends the URL to the `/api/verify` backend.
- [ ] Rejected repairs are communicated gracefully to the worker.
