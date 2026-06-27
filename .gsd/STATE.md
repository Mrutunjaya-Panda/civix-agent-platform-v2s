# STATE.md — CivixAgent Session Memory

> **Last Updated**: 2026-06-27
> **Current Phase**: Not Started
> **Next Action**: Run /plan 1 to create Phase 1 execution plan

---

## Project Summary
CivixAgent — Autonomous hyperlocal civic issue manager for Bhubaneswar.
Multi-agent system: Triage (Gemini Vision) → Routing + Escalation → Citizen Engagement.
Stack: React+Vite+Tailwind / Node.js+Express / Gemini 2.5 Flash / Firestore + Firebase Storage + Firebase Auth / Google Maps + MarkerClusterer / Cloud Run.

## Key Decisions Locked
- Severity formula: clamp(((Baseline x 0.5) + (Visual x 0.5)) + ClusterBonus, 1, 10)
- 4 departments: Roads(6), Water(7), Electricity(8), Sanitation(5)
- Brief format: ticket card + email body (both)
- Auth: Firebase Anonymous Auth (citizens), passphrase toggle (Municipal Worker)
- SLA: HIGH=24h, MEDIUM=48h, LOW=72h | +6h per Simulate Time click
- Seed: 20 reports, Bhubaneswar (20.2961N, 85.8245E), incl. stalled/escalated/resolved examples
- Image storage: Firebase Storage (client-compressed)
- Notifications: in-app toast + mocked email log in Activity Feed
- Marker clustering: enabled (@googlemaps/markerclusterer)

## Phases (6 total)
- Phase 1: Foundation + Infrastructure
- Phase 2: Data Model + Real-Time Layer
- Phase 3: Agent 1 Triage
- Phase 4: Agent 2 Routing + Escalation
- Phase 5: Agent 3 Citizen Engagement
- Phase 6: Seed Data + Polish + Deploy

## Session Log
- 2026-06-27: PRD analyzed, all 7 open questions resolved via Q&A, SPEC.md FINALIZED, ROADMAP.md created (6 phases)
