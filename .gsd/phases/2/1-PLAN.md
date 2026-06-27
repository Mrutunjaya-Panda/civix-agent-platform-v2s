---
phase: 2
plan: 1
wave: 1
---

# Plan 2.1: Cloudinary Utility & Firestore Configuration

## Objective
Establish the base data layer for Phase 2: Define Firestore collections (in code via a schema file), deploy basic security rules to lock down writes, and create the Cloudinary image upload utility (ADR-011) so citizens can upload photos without server bandwidth or Firebase Storage limits.

## Context
- .gsd/SPEC.md — Firebase and Cloudinary tech stack
- .gsd/DECISIONS.md — ADR-011 (Cloudinary unsigned uploads)

## Tasks

<task type="auto">
  <name>Firestore Schema Definitions & Security Rules</name>
  <files>
    - civix-agent/client/src/lib/schema.js
    - civix-agent/firestore.rules
    - civix-agent/firebase.json
  </files>
  <action>
    - Create `client/src/lib/schema.js` exporting constants or JSDoc types documenting our 4 collections (`tickets`, `clusters`, `activityFeed`, `users`).
    - Create `firestore.rules` allowing public reads for `tickets` and `clusters`, but requiring authentication (Anonymous Auth) for writes.
    - Create `firebase.json` pointing to `firestore.rules` (even though we deploy the API to Cloud Run, rules go to Firebase).
  </action>
  <verify>Check that firestore.rules and firebase.json are syntactically valid.</verify>
  <done>Files exist and rules are properly formatted for Firebase.</done>
</task>

<task type="auto">
  <name>Cloudinary Upload Utility</name>
  <files>
    - civix-agent/client/src/lib/cloudinary.js
  </files>
  <action>
    - Implement `uploadImage(file)` that compresses the image (using browser native Canvas or similar small utility, e.g. `browser-image-compression` if installed) and POSTs to `https://api.cloudinary.com/v1_1/{CLOUD_NAME}/image/upload`.
    - Use `VITE_CLOUDINARY_CLOUD_NAME` and `VITE_CLOUDINARY_UPLOAD_PRESET` from import.meta.env.
    - Return the `secure_url` on success.
  </action>
  <verify>Review the fetch call to ensure it uses the unsigned preset properly.</verify>
  <done>Cloudinary utility is ready to be used by the Citizen reporting form in Phase 3.</done>
</task>

## Success Criteria
- [ ] Schema documented and rules defined.
- [ ] Cloudinary upload function exported and ready for use.
