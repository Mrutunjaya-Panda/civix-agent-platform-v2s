# DECISIONS.md — Architecture Decision Records

> CivixAgent — Decision log

---

## ADR-001: Severity Scoring Formula
**Date**: 2026-06-27
**Decision**: clamp(((Baseline x 0.5) + (Visual x 0.5)) + ClusterBonus, 1, 10)
**Reason**: Clean 1-10 range, mathematically sound, explainable in judge Q&A. Separates AI vision signal from domain knowledge baseline equally.

## ADR-002: Firebase Anonymous Auth over localStorage UUID
**Date**: 2026-06-27
**Decision**: Firebase Anonymous Auth for citizens
**Reason**: Survives tab-close/reopen, provides real Firebase UID for Firestore security rules, more robust for live demo. Same zero-friction UX for the citizen.

## ADR-003: Grievance Brief Format (Both Card + Email)
**Date**: 2026-06-27
**Decision**: Ticket card (structured JSON rendered in UI) + email body string (copyable)
**Reason**: Card gives judges instant at-a-glance read during live demo; email proves Gemini generates real-world actionable output. Serves both usability and agentic depth scoring criteria.

## ADR-004: SLA Thresholds (Severity-Tiered)
**Date**: 2026-06-27
**Decision**: HIGH=24h, MEDIUM=48h, LOW=72h | +6h per click
**Reason**: 4 clicks to escalation for HIGH is optimal demo pacing — fast enough to show, slow enough to feel realistic.

## ADR-005: Pre-Stalled LOW Ticket in Seed Data
**Date**: 2026-06-27
**Decision**: One LOW-severity ticket seeded with timestamp 70h in the past (already stalled on load)
**Reason**: Proves LOW-severity stalled path without requiring judges to click through 12 Simulate Time clicks. Efficient demo coverage.

## ADR-006: Firebase Storage for Images
**Date**: 2026-06-27
**Decision**: Firebase Storage (client-compressed before upload)
**Reason**: Only production-grade option. Adds 4th Google tech touchpoint. Free tier sufficient (5GB storage, 1GB/day download). Base64-in-Firestore rejected (1MB doc limit).

## ADR-007: Marker Clustering Enabled
**Date**: 2026-06-27
**Decision**: @googlemaps/markerclusterer included
**Reason**: 20+ pins in one neighborhood causes unreadable overlap without clustering. Standard polish, ~30min integration, significant visual quality improvement.

## ADR-008: 4 Departments (Config-Driven, Extensible)
**Date**: 2026-06-27
**Decision**: Roads, Water, Electricity, Sanitation only for v1. Architecture is config-driven.
**Reason**: Keeps scope tight for hackathon. Adding new categories in future requires only a routing table config entry.
