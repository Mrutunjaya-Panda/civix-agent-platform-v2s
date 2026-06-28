---
phase: 3
plan: 2
wave: 2
---

# Plan 3.2: Gemini Vision Classification + Severity Formula

## Objective
Implement the Triage Agent's core intelligence inside the `/api/report` route — photo is analysed by Gemini Vision, severity is calculated via the SPEC formula, and the result is written to Firestore as a live ticket.

## Context
- .gsd/SPEC.md — Agent 1 spec, Severity Formula, Department Routing Table
- civix-agent/server/routes/report.js
- civix-agent/server/gemini.js
- civix-agent/server/firebase.js

## Tasks

<task type="auto">
  <name>Gemini Vision Classification</name>
  <files>
    - civix-agent/server/agents/triage.js
  </files>
  <action>
    Create `server/agents/triage.js` exporting an async `triageReport({ imageUrl, note })` function:

    1. Fetch the image from `imageUrl` as base64 (use `node-fetch` or built-in `fetch`) and build an `inlineData` part for Gemini.
    2. Call `structuredCall` from `gemini.js` with:
       - parts: [ inlineData, textPrompt explaining the task ]
       - schema: `{ category: string, visualSeverity: number (1-10), reasoning: string }`
    3. Validate the response fields; throw if category is not in the routing table.
    4. Apply severity formula from SPEC:
       - BASELINES: `{ Roads: 6, Water: 7, Electricity: 8, Sanitation: 5 }`
       - `severity = clamp(((Baseline * 0.5) + (visualSeverity * 0.5)) + clusterBonus, 1, 10)`
       - `clusterBonus` = 0 for now (spatial check is Plan 3.3)
    5. Return `{ category, severity, reasoning, department }` where department is from the routing table.
  </action>
  <verify>
    `node -e "require('./agents/triage').triageReport({ imageUrl: 'https://res.cloudinary.com/dozoeunif/image/upload/v1/civix-uploads/test.jpg', note: 'pothole' }).then(console.log)"` 
    (run from server dir, any valid image URL will work)
    Must return JSON with category, severity (1-10), reasoning.
  </verify>
  <done>
    triageReport returns structured JSON with correct severity range and valid category from routing table.
  </done>
</task>

<task type="auto">
  <name>Write Live Ticket to Firestore</name>
  <files>
    - civix-agent/server/routes/report.js
    - civix-agent/server/firebase.js
  </files>
  <action>
    Update `routes/report.js` to call `triageReport` and write the result to Firestore:

    1. Call `await triageReport({ imageUrl, note })`.
    2. Use Firebase Admin SDK to `addDoc` to `tickets` collection with full schema fields from `schema.js`.
    3. Also `addDoc` to `activityFeed` with `{ type: 'TRIAGE', message: 'Ticket classified as ${category}, severity ${severity}', ticketId }`.
    4. Return `{ status: 'ok', ticketId, severity, category }` to client.
    5. Error handling: if Gemini fails, return 500 with clear message.

    Important: Use `admin.firestore()` from the server-side firebase.js (NOT client SDK).
  </action>
  <verify>
    POST to /api/report with a valid Cloudinary imageUrl:
    `Invoke-WebRequest http://localhost:3001/api/report -Method POST -Body '{"imageUrl":"https://res.cloudinary.com/dozoeunif/image/upload/v1/civix-uploads/test.jpg","location":{"lat":20.2961,"lng":85.8245},"note":"Pothole on main road"}' -ContentType 'application/json'`
    Must return `{ status: "ok", ticketId: "...", severity: number, category: string }`.
    The ticket must appear on the live map automatically (onSnapshot fires).
  </verify>
  <done>
    End-to-end: POST /api/report → Gemini → Firestore → pin appears on map within 15 seconds.
  </done>
</task>

## Success Criteria
- [ ] `triageReport()` calls Gemini Vision with correct schema and returns structured JSON.
- [ ] Severity formula correctly applies SPEC baselines and clamping.
- [ ] Ticket written to Firestore `tickets` collection with all required fields.
- [ ] Activity Feed entry written for the triage decision.
- [ ] Pin appears on the live map within ~15 seconds of submitting the report.
