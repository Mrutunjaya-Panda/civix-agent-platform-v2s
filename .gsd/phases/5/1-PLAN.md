---
phase: 5
plan: 1
wave: 1
---

# Plan 5.1: Agent 3 — Visual Repair Verification (Backend)

## Objective
Build Agent 3 (Citizen Engagement & Verification) which uses Gemini Vision to compare the original reported photo against a newly uploaded "repair" photo. If it detects a fix, it marks the ticket as resolved and drafts a community recap.

## Context
- .gsd/SPEC.md
- civix-agent/server/agents/gemini.js
- civix-agent/server/server.js

## Tasks

<task type="auto">
  <name>Visual Verification Agent (Agent 3)</name>
  <files>
    - civix-agent/server/agents/verification.js
  </files>
  <action>
    Create `verification.js`.
    Export a function `verifyRepair(originalImageUrl, repairImageUrl, category)`.
    1. Fetch both images as buffers/base64 to send to Gemini Vision.
    2. Prompt Gemini: "Compare these two images of a civic infrastructure issue (Category: [category]). Image 1 is the original complaint. Image 2 is the claimed repair. Was the issue actually repaired?"
    3. Use `structuredCall` to return:
       ```json
       { "isRepaired": boolean, "recap": "2-sentence community engagement text thanking the reporter and explaining the fix" }
       ```
  </action>
  <verify>
    Run a local test script passing two image URLs to `verifyRepair` to ensure it returns a valid JSON schema with `isRepaired: true|false`.
  </verify>
  <done>
    Agent 3 successfully compares two images and outputs a verified boolean and recap message.
  </done>
</task>

<task type="auto">
  <name>POST /api/verify Endpoint</name>
  <files>
    - civix-agent/server/routes/verify.js
    - civix-agent/server/server.js
  </files>
  <action>
    Create `routes/verify.js` and mount it to `/api/verify` in `server.js` (replacing the Phase 1 stub).
    1. Accept body: `{ ticketId, repairImageUrl }`
    2. Fetch the ticket from Firestore.
    3. Call `verifyRepair(ticket.imageUrl, repairImageUrl, ticket.category)`.
    4. If `isRepaired === true`:
       - Update ticket `status` to `'resolved'`, add `repairImageUrl`, and add `recap`.
       - Write to `activityFeed` (Type: 'RESOLUTION', Message: 'Email drafted and dispatched to citizen — awaiting confirmation').
    5. If `isRepaired === false`:
       - Write to `activityFeed` (Type: 'REJECTED', Message: 'Repair verification failed. Image does not show a valid fix.').
    6. Return the verification result to the client.
  </action>
  <verify>
    POST to `/api/verify` with a valid ticket ID and a repair image URL. Check Firestore to see the ticket updated to `resolved` with the `recap` attached.
  </verify>
  <done>
    Endpoint correctly processes repair submissions, runs the agent, and updates Firestore state.
  </done>
</task>

## Success Criteria
- [ ] Agent 3 can consume two images and accurately assess if a repair occurred.
- [ ] `/api/verify` processes the images and updates the ticket status to `resolved`.
- [ ] Activity Feed logs the resolution attempt.
