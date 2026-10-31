# LOCKED IN

A mobile-first visual prototype for private accountability crews. Minecraft headings, soft gradients, original space-crew avatars, and an Anatomy-built seven-day streak vault.

## Start here

```sh
npm install
npm run dev
```

Open **http://localhost:5173/#lab** to compare the three directions and click through their journeys.

- **Day Shift:** mint/lilac, progress-first dashboard, crew-first onboarding.
- **Night Shift:** dark orbital lounge, mission-first dashboard and onboarding.
- **Lobby Club:** peach/olive, check-in-first dashboard, ritual-first onboarding.

The theme buttons switch the entire app. The Design Lab has four interactive journey steps for each direction. Use **Try this full UI** to open the dashboard or finish a journey to open its welcome screen.

## What works in this prototype

- Responsive dashboard, private crew lobbies, challenges, rankings, profile and welcome screens.
- Create local crews, copy demo invitation links, enter demo code `BOYS24`, create and join challenges.
- Daily text or photo check-in with preview, removal, an honest-check-in confirmation, and same-day duplicate prevention.
- Browser-local persistence, nickname editing, reminder preference, and confirmed streak restart while retaining personal best.
- PWA manifest, install icons, and a versioned offline app shell in the production build.
- Keyboard-accessible Radix dialogs, restored focus, labeled inputs, visible focus indicators, reduced motion and mobile safe areas.

## Boundaries

This is the requested **visual/UI phase**, not a live multi-user service. Login previews a nickname flow and creates no account. Friends, their activity, rankings and baseline streak are sample data. Crews and invitations created here only exist in this browser. No messages are sent. Reminder preferences do not schedule notifications. Photos remain in memory for preview and are never uploaded or persisted; the saved check-in stores only a note and photo-presence flag.

A photo records participation, not abstinence. The UI asks for an ordinary moment from the day and offers an equal text alternative. Challenge cards currently illustrate the personal accountability streak; independent challenge scoring belongs in the backend phase.

## Production preview and checks

```sh
npm run build
npm run preview -- --port 4173
npm test
npm run test:ui
node scripts/audit.mjs
node scripts/test-offline.mjs
```

Browser checks require local Google Chrome. UI tests and the accessibility audit expect the dev server on port 5173. The offline test expects the production preview on port 4173. Offline reload works after the first successful online visit; service workers run on HTTPS or localhost.

`npm run art` rebuilds all eight vault states using the vendored Anatomy core. `node scripts/capture.mjs` saves desktop/mobile screenshots and the comparison image.

## Project map

- `src/App.tsx`: application shell, navigation, local state and creation/invite dialogs.
- `src/pages.tsx`: dashboard, crew, challenge, leaderboard and profile screens.
- `src/DesignLab.tsx`: three visual directions, interactive journeys and welcome screen.
- `src/components/Checkin.tsx`: photo/text check-in and success state.
- `src/components/Primitives.tsx`: accessible dialog, crew avatars and shared UI.
- `src/streak.mjs`: local-calendar streak logic.
- `src/styles.css`: responsive styles and the three design systems.
- `scripts/build-vault.mjs`: 45-part isometric artwork generated with Anatomy.
- `scripts/build-sw.mjs`: production offline-shell generation.
- `docs/superpowers/specs/2026-11-01-locked-in-design.md`: journey drawn before implementation, design decisions and review.
- `docs/verification.md`: verification evidence and limitations.

## Design sources

- [UI Skills](https://www.ui-skills.com/): invoked with `npx ui-skills`; applied baseline-ui, fixing-accessibility and interaction-design.
- [Anatomy](https://github.com/wheresryan22/anatomy): installed via Skills CLI, used for the isometric vault. The build vendors its unchanged 36 KB geometry core and MIT license under `scripts/vendor/anatomy/`; the full installed skill remains local under `.agents/`.
- Minecraft.ttf: the user’s existing font at `/Users/himanshusmac/Downloads/Minecraft.ttf`, copied for this local preview.
- DM Sans: Google Fonts, with its OFL license in `public/fonts/`.
- Space-crew artwork: original SVG shapes, inspired by the requested social-lobby theme; no game assets were imported.
