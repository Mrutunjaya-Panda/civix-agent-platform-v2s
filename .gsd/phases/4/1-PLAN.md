---
phase: 4
plan: 1
wave: 1
---

# Plan 4.1: Agent 2 — Routing & Brief Generation (Background)

## Objective
Build Agent 2 (Routing & Escalation Agent) to draft structured grievance briefs (Card view + Email copy) via Gemini. Since triage is latency-sensitive, this agent will run *asynchronously* after the initial ticket is created, updating the ticket in Firestore with the generated brief.

## Context
- .gsd/SPEC.md
- civix-agent/server/agents/triage.js
- civix-agent/server/routes/report.js

## Tasks

<task type="auto">
  <name>Grievance Brief Generator (Agent 2)</name>
  <files>
    - civix-agent/server/agents/routing.js
  </files>
  <action>
    Create `routing.js`.
    Export a function `draftGrievanceBrief(ticket, isEscalation = false)`:
    1. Prepare a prompt combining ticket details (`category`, `severity`, `note`, `reasoning`).
    2. Call Gemini using `structuredCall` (from `gemini.js`).
    3. The `schema` must enforce this structure:
       ```json
       {
         "type": "object",
         "properties": {
           "card": {
             "type": "object",
             "properties": {
               "title": { "type": "string" },
               "summary": { "type": "string" },
               "priority_actions": { "type": "array", "items": { "type": "string" } }
             }
           },
           "email": { "type": "string", "description": "Professional email body to the department" }
         }
       }
       ```
    4. If `isEscalation` is true, the prompt should request a highly urgent escalation tone.
  </action>
  <verify>
    Write a small test script or run a node REPL to call `draftGrievanceBrief` with a dummy ticket and verify it returns a valid object matching the schema.
  </verify>
  <done>
    `draftGrievanceBrief` returns a structured brief via Gemini.
  </done>
</task>

<task type="auto">
  <name>Async Brief Generation on Report</name>
  <files>
    - civix-agent/server/routes/report.js
  </files>
  <action>
    Modify POST `/api/report` (Unique Report section):
    After returning the JSON response to the client (`res.json(...)`), execute an asynchronous background promise:
    1. Call `draftGrievanceBrief(newTicket)`.
    2. Update the Firestore ticket with `brief: { card, email }`.
    3. Write a new entry to the `activityFeed`: `"Grievance brief drafted and routed to " + department` (type: 'ROUTING').
    *Do not block the HTTP response on this LLM call to preserve the <15s SLA.*
  </action>
  <verify>
    Submit a unique report via the UI or cURL. Check Firestore `tickets` collection immediately (no brief), then wait 5-10 seconds and check again (brief should be populated).
  </verify>
  <done>
    Tickets receive a `brief` asynchronously after creation, and a routing activity feed log is added.
  </done>
</task>

## Success Criteria
- [ ] Agent 2 generates structured briefs using Gemini function-calling / JSON schema.
- [ ] Briefs are attached to tickets asynchronously without degrading report submission latency.
- [ ] Activity Feed shows the routing log entry.
