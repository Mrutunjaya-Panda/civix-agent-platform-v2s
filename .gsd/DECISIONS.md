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

## ADR-009: React-Leaflet + OpenStreetMap as Primary Map (Google Maps demoted to optional)
**Date**: 2026-06-27
**Decision**: React-Leaflet + OpenStreetMap + Leaflet.markercluster as the primary and only map implementation
**Reason**: Google Maps Platform requires billing card even for free-tier quota. Leaflet requires zero API key, zero billing, and zero risk of "billing not enabled" errors during development. For a hackathon, eliminating a potential show-stopping setup blocker is more valuable than the marginal visual difference. CartoDB dark tiles provide the same premium dark aesthetic without any API key.
**Impact on scoring**: Leaflet does not count as a Google Technology touchpoint. However, Gemini + Firestore + Cloud Run represent three strong Google touchpoints — sufficient for the 15% Google Technologies criterion without Maps.

## ADR-010: Cloud Run Billing Card Step Deliberately Deferred to Phase 6
**Date**: 2026-06-27
**Decision**: Cloud Run deployment is the LAST action of the entire project (end of Phase 6)
**Reason**: Cloud Run requires billing account setup (card for identity verification). By deferring it to the final phase, the card step happens exactly once, deliberately, after the complete application is built and locally verified. This prevents billing setup from blocking or interrupting development work. All development and testing runs on Firebase (free Spark plan) + localhost.
**Process**: Full end-to-end demo flow must be verified locally and on Firebase before the gcloud deploy command is run.

## ADR-011: Cloudinary Replaces Firebase Storage for Image Uploads
**Date**: 2026-06-28
**Decision**: Use Cloudinary free tier for all civic issue image uploads, instead of Firebase Storage
**Reason**: Firebase Storage now requires upgrading to the Blaze (pay-as-you-go) plan — even for free-quota usage — which requires a credit card. This breaks the zero-card dev principle. Cloudinary offers a permanently free tier (25GB/month) with no credit card required at signup. Images are uploaded directly from the browser (unsigned upload preset), Cloudinary returns a secure public URL, that URL is stored in the Firestore ticket doc and passed to Gemini Vision.
**Impact**: 
- Remove FIREBASE_STORAGE_BUCKET references (still present in VITE_ config for future use, but storage.js client not used)
- Add CLOUDINARY_CLOUD_NAME to .env (client-safe, no secret needed for unsigned uploads)
- Client upload flow: compress image client-side → POST to https://api.cloudinary.com/v1_1/{cloud_name}/image/upload → get back secure_url
- Server gemini.js: receives the Cloudinary URL, passes as fileData.fileUri to Gemini Vision (public URL works directly)
