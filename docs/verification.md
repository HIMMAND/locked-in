# Verification — 1 November 2026

## Passed

- `npm run build`: TypeScript and Vite production build. Versioned offline shell contains 19 assets.
- `npm test`: 4 passing tests for local calendar boundaries, consecutive check-ins, same-day duplication, missed days and personal best.
- `npm run test:ui`: 11 passing Playwright tests in Google Chrome. Covers text/photo check-ins, same-file reselection, persisted records, crew and challenge creation, invitation errors and recovery, all three four-step journeys, nickname onboarding, restart confirmation, dialog focus restoration, skip navigation, and correct calendar behavior after restart.
- Mobile overflow sweep: nine routes × three themes at 390 × 844; no horizontal overflow or browser exceptions.
- `node scripts/audit.mjs`: no automated WCAG A/AA violations on Today, Design Lab, Welcome, Crews and Rankings in all three themes (15 combinations). This is automated coverage, not a complete accessibility certification.
- `node scripts/test-offline.mjs`: production app reloads offline after initial cache installation and navigates between Design Lab and Today.
- Desktop and phone screenshots inspected. The comparison image is in `docs/previews/three-directions.png`; full snapshots are in the local ignored `artifacts/` directory.
- `git diff --check`: no whitespace errors.

## Findings fixed

- Reset the file input after selection so removing and reselecting the same photo works.
- Restore keyboard focus to the dialog opener.
- Make the skip link focus the main landmark without changing the hash route.
- Darken secondary text and active labels in the soft palettes.
- Give mobile crew/feed panels the full available width.
- Fit comparison thumbnails within their phone cards.
- Count today separately from historical days in the seven-day calendar after a restart.
- Match cached same-origin static responses independently of Vite’s `Vary: Origin` header, so offline module/font requests resolve correctly.

## Review scope

The user journey was drawn before implementation and reviewed using brainstorming, Web Interface Guidelines, and UI Skills interaction-design/fixing-accessibility guidance. See the design spec for the flow, recovery paths and privacy decisions. The Anatomy vault uses 45 polygonal parts and eight discrete progress states; it has no animated pipes or curved mechanical assemblies requiring the kit’s round-part collision audit.

## Intentional limitations

This delivery is a local UI prototype. Authentication, real invitations, shared storage, media uploads, push notifications, authoritative streak timing, independent challenge scoring and moderation are not connected. Sample friends and scores are labeled as demo data. Photos are temporary on-device previews; no image is stored or sent. No UI implies that a photo verifies abstinence.
