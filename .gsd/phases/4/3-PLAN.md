---
phase: 4
plan: 3
wave: 2
---

# Plan 4.3: Municipal Worker UI (Time-Warp & Briefs)

## Objective
Expose the "Simulate Time" functionality in the UI for the Municipal Worker persona, and render the Agent-drafted Grievance Briefs inside the Ticket Details sidebar so judges can see the AI's output.

## Context
- .gsd/SPEC.md
- civix-agent/client/src/App.jsx
- civix-agent/client/src/components/TicketDetail.jsx

## Tasks

<task type="auto">
  <name>Simulate Time Button</name>
  <files>
    - civix-agent/client/src/App.jsx
  </files>
  <action>
    In `App.jsx`, when `persona === 'worker'`, display a floating "⏱️ Simulate Time (+6h)" button.
    When clicked, it should call POST `/api/simulate-time`.
    Show a loading spinner inside the button while the request is in flight.
    This gives the demo presenter an interactive way to trigger SLA escalations.
  </action>
  <verify>
    Switch to Municipal Worker mode in the UI. Ensure the button appears. Click it, and verify the network request is sent.
  </verify>
  <done>
    Button successfully triggers the `/api/simulate-time` endpoint and handles loading states.
  </done>
</task>

<task type="auto">
  <name>Display Grievance Briefs in TicketDetail</name>
  <files>
    - civix-agent/client/src/components/TicketDetail.jsx
  </files>
  <action>
    Update `TicketDetail.jsx` to render the `brief` object if it exists on the ticket.
    - Show a polished "Agent-Drafted Brief" section.
    - Render `ticket.brief.card.title`, `summary`, and loop over `priority_actions`.
    - Provide a toggle or second tab to view `ticket.brief.email` (the email copy format).
    - If `ticket.status === 'escalated'`, ensure the UI reflects this urgency visually (e.g. red badge/banner).
    - Display the `simulatedAge` so the user knows how old the ticket is.
  </action>
  <verify>
    Select a ticket on the map that has a generated `brief`. The sidebar should clearly display the structured card and the email copy.
  </verify>
  <done>
    Ticket details panel gracefully renders Gemini-generated briefs and simulated time state.
  </done>
</task>

## Success Criteria
- [ ] Time-warp button works and is only visible in Worker mode.
- [ ] TicketDetail side-panel displays the Gemini-drafted briefs cleanly.
- [ ] Escalated status and simulated age are visible in the UI.
