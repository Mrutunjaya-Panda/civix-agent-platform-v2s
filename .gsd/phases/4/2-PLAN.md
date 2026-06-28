---
phase: 4
plan: 2
wave: 1
---

# Plan 4.2: Time-Warp Control & SLA Monitor (Backend)

## Objective
Build the simulated SLA escalation system. A new endpoint will add +6 hours of `simulatedAge` to all open tickets. Agent 2 evaluates SLA rules upon this time jump, triggering autonomous escalations for breached tickets.

## Context
- .gsd/SPEC.md
- civix-agent/server/agents/routing.js
- civix-agent/server/server.js

## Tasks

<task type="auto">
  <name>Simulate Time Endpoint & SLA Logic</name>
  <files>
    - civix-agent/server/routes/escalation.js
    - civix-agent/server/server.js
  </files>
  <action>
    Create `server/routes/escalation.js` and mount it to `/api/simulate-time` in `server.js`.
    On POST `/api/simulate-time`:
    1. Fetch all tickets where `status !== 'resolved'`.
    2. Loop through tickets, incrementing `simulatedAge` by +6.
    3. Evaluate SLA based on SPEC:
       - HIGH severity (7-10): Escalate if > 24h
       - MEDIUM severity (4-6.9): Escalate if > 48h
       - LOW severity (1-3.9): Flag stalled if > 72h
    4. If SLA breached and ticket is not already `escalated` / `stalled`:
       - Change status to `escalated` (or `stalled` for LOW).
       - Fire `draftGrievanceBrief(ticket, true)` to get a new urgent brief.
       - Log to `activityFeed` (e.g. "Ticket {ID} unresolved past {X}h SLA → autonomously escalated to Tier 2").
    5. Update all modified tickets in Firestore via a batch write or sequential updates.
    6. Return a summary array of tickets that were escalated.
  </action>
  <verify>
    Create a mock ticket in Firestore with `simulatedAge: 20` and `severity: 8` (HIGH). POST to `/api/simulate-time`. Verify the ticket jumps to 26 hours, status changes to `escalated`, and the activity feed updates.
  </verify>
  <done>
    Simulate Time endpoint successfully applies time jumps and correctly escalates tickets based on severity bands.
  </done>
</task>

## Success Criteria
- [ ] POST `/api/simulate-time` increments `simulatedAge` for all open tickets.
- [ ] SLA thresholds accurately trigger escalations.
- [ ] Escalatation events generate a re-drafted urgent brief and an Activity Feed log.
