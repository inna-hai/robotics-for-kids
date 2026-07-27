# Robotics Product Versions

This file is the product-level version log for `robotics-for-kids`.

It is intentionally human-readable: it explains what is published, what is under review, what changed pedagogically, and how to roll back.

## Product Areas

| Product area | Public URL | Primary branch | Purpose |
|---|---|---|---|
| Robotics stable | https://robotics.hai.tech | `main` | Public stable learning platform / Sensi entry point |
| Smart City 15 Lessons | https://robotics15.hai.tech | `feature/structured-15-lessons` | 15-lesson smart-city robotics curriculum under active development |

## Version Statuses

- `Draft` — work exists but is not ready for review.
- `Review` — ready for Inna / QA review.
- `Approved` — product owner approved the version.
- `Published` — deployed on the public URL.
- `Superseded` — replaced by a newer product version.
- `Rejected` — reviewed and intentionally not accepted.

## Versioning Convention

Use product tags after approval/publication:

- Stable platform: `robotics-vX.Y.Z`
- Smart City 15 Lessons: `robotics15-vX.Y.Z`
- Review candidates: `robotics15-vX.Y.Z-rcN`

Recommended bump rules:

- `PATCH` (`v1.0.1`) — copy fixes, visual polish, small bug fixes.
- `MINOR` (`v1.1.0`) — lesson changes, new exercises, new pages, meaningful UX changes.
- `MAJOR` (`v2.0.0`) — changed course structure, changed homepage/product architecture, incompatible curriculum shift.

## Current Published Versions

### Smart City 15 Lessons — v0.7.4 — Published

- **Status:** Published
- **Branch:** `feature/structured-15-lessons`
- **Commit:** `1189648`
- **Tag:** `robotics15-v0.7.4`
- **Live:** https://robotics15.hai.tech
- **Date recorded:** 2026-07-21
- **Approved by:** Inna

Product changes:

- Consolidated the Sisi homepage catalog: the 15 individual Sisi lesson cards were removed from the platform homepage.
- Kept Sisi as one clear series card for grade B, placed high in the catalog after the Sensi cards.
- Updated catalog copy so each series appears once, while individual lesson pages remain reachable through the Sisi hub.

Verification:

- Live verified with cache-busted URL: https://robotics15.hai.tech/?v=robotics15-v0.7.4
- Full Node test suite passed: all `tests/*.mjs`.
- Homepage routing test updated to match the product decision that Sisi is one catalog series, not 15 separate homepage cards.

Rollback:

```bash
git checkout feature/structured-15-lessons
git reset --hard f017576
# or use the previous product tag: robotics15-v0.7.3
```

### Smart City 15 Lessons — v0.7.3 — Superseded

- **Status:** Superseded by `robotics15-v0.7.4`
- **Branch:** `feature/structured-15-lessons`
- **Commit:** `f017576`
- **Tag:** `robotics15-v0.7.3`
- **Live:** https://robotics15.hai.tech
- **Date recorded:** 2026-07-21
- **Approved by:** Inna

Product changes:

- Polished the platform homepage layout and copy after visual review.
- Fixed the “שלושה עולמות” mismatch to four aligned learning worlds.
- Changed the tracks grid to four columns on desktop and two on tablet.
- Reduced hero/section spacing, clarified CTA wording, clarified lesson-count stats, and removed internal Holon copy.

Verification:

- Live verified with cache-busted URL: https://robotics15.hai.tech/?v=robotics15-v0.7.3
- Full Node test suite passed: all `tests/*.mjs`.

Rollback:

```bash
git checkout feature/structured-15-lessons
git reset --hard 3d4f3ea
# or use the previous product tag: robotics15-v0.7.2
```

### Smart City 15 Lessons — v0.7.2 — Superseded

- **Status:** Superseded by `robotics15-v0.7.3`
- **Branch:** `feature/structured-15-lessons`
- **Commit:** `3d4f3ea`
- **Tag:** `robotics15-v0.7.2`
- **Live:** https://robotics15.hai.tech
- **Date recorded:** 2026-07-21
- **Approved by:** Inna

Product changes:

- Differentiated homepage course card visuals so the catalog feels less repetitive and easier to scan.
- Kept the broader v0.7 platform structure and Craftom visibility intact.

Verification:

- Full Node test suite passed: all `tests/*.mjs`.
- Homepage routing checks passed.

Rollback:

```bash
git checkout feature/structured-15-lessons
git reset --hard 7e2ace1
# or use the previous product tag: robotics15-v0.7.1
```

### Smart City 15 Lessons — v0.7.1 — Superseded

- **Status:** Superseded by `robotics15-v0.7.2`
- **Branch:** `feature/structured-15-lessons`
- **Commit:** `7e2ace1`
- **Tag:** `robotics15-v0.7.1`
- **Live:** https://robotics15.hai.tech
- **Date recorded:** 2026-07-21
- **Approved by:** Inna

Product changes:

- Added Craftom School to the `robotics15` platform homepage.
- Added a quick-link card, learning-track explanation, catalog card, roadmap row, and CTA link for Craftom.
- Links point to the static Craftom preview/README for now, because the full API-backed app requires a Node server and later shared login infrastructure.

Verification:

- Homepage routing test passed and verifies the Craftom links.
- Full Node test suite passed: all `tests/*.mjs`.
- `git diff --check` clean.

Rollback:

```bash
git checkout feature/structured-15-lessons
git reset --hard 7b9e343
# or use the previous product tag: robotics15-v0.7.0
```

### Smart City 15 Lessons — v0.7.0 — Superseded

- **Status:** Superseded by `robotics15-v0.7.1`
- **Branch:** `feature/structured-15-lessons`
- **Commit:** `f5f3b6c`
- **Tag:** `robotics15-v0.7.0`
- **Live:** https://robotics15.hai.tech
- **Date recorded:** 2026-07-21
- **Approved by:** Inna

Product changes:

- Merged PR #13 by Ami (`ameidar`): Craftom School lomda MVP.
- Added standalone `craftom-school/` app with Node server, student/teacher/admin flows, classes, teams, lesson editor, reports, observations, demo seed, and smoke test.
- Added 15-meeting Craftom course model and documentation/recommendation pages.
- Note: this is an MVP foundation and is not yet connected to Minecraft/Craftom production systems.

Verification:

- Merge into `feature/structured-15-lessons` was clean.
- `git diff --check HEAD~1..HEAD` clean.
- Craftom checks passed: `npm run check`, `npm run seed:demo`, and `npm run test:smoke` against a local server.
- Full Node test suite passed: all `tests/*.mjs`.

Rollback:

```bash
git checkout feature/structured-15-lessons
git reset --hard ea0000d
# or use the previous product tag: robotics15-v0.6.3
```

### Smart City 15 Lessons — v0.6.3 — Superseded

- **Status:** Superseded by `robotics15-v0.7.0`
- **Branch:** `feature/structured-15-lessons`
- **Commit:** `cfa0ae4`
- **Tag:** `robotics15-v0.6.3`
- **Live:** https://robotics15.hai.tech
- **Date recorded:** 2026-07-21
- **Approved by:** Inna

Product changes:

- Synced `main` into the shared structured 15-lessons branch after PR #12 was merged to `main`.
- Brought Miriam's Minecraft Kids refinements into `robotics15`: lesson data, play page, slides, teacher page, and landing page updates.
- Keeps the Holon-style homepage redesign and Sensi 15 structure from `robotics15-v0.6.2`.

Verification:

- Full Node test suite passed: all `tests/*.mjs`.
- `git diff --check` clean.

Rollback:

```bash
git checkout feature/structured-15-lessons
git reset --hard 7cec3e6
# or use the previous product tag: robotics15-v0.6.2
```

### Smart City 15 Lessons — v0.6.2 — Superseded

- **Status:** Superseded by `robotics15-v0.6.3`
- **Branch:** `feature/structured-15-lessons`
- **Commit:** `65b5423`
- **Tag:** `robotics15-v0.6.2`
- **Live:** https://robotics15.hai.tech
- **Date recorded:** 2026-07-21
- **Approved by:** Inna

Product changes:

- Merged the redesigned platform homepage from `main` into the shared structured 15-lessons branch.
- `robotics15` now uses the polished Holon-style homepage: premium hero, generated EdTech image, quick path cards, learning tracks, full catalog, roadmap, and CTA.
- Keeps `sensi-city.html` as the 15-lesson Sensi course and `sensi-classic.html` as the 5-lesson classic course.

Verification:

- Full Node test suite passed: all `tests/*.mjs`.
- `git diff --check` clean.
- Homepage routing test verifies the expanded course links.

Rollback:

```bash
git checkout feature/structured-15-lessons
git reset --hard 116bb3a
# or use the previous product tag: robotics15-v0.6.1
```

### Smart City 15 Lessons — v0.6.1 — Superseded

- **Status:** Superseded by `robotics15-v0.6.2`
- **Branch:** `feature/structured-15-lessons`
- **Commit:** `3a5899b`
- **Tag:** `robotics15-v0.6.1`
- **Live:** https://robotics15.hai.tech
- **Date recorded:** 2026-07-21
- **Approved by:** Inna

Product changes:

- Merged the expanded homepage course catalog from `main` into the shared structured 15-lessons branch.
- The `robotics15` homepage now exposes the prepared modules as individual cards: the full Sisi series, individual Sisi lessons, CodeQuest, PlayCode Lab/GameLab, and WebMakers Lab/AppForge.
- Keeps `sensi-city.html` as the 15-lesson Sensi course and `sensi-classic.html` as the 5-lesson classic course.

Verification:

- Full Node test suite passed: all `tests/*.mjs`.
- `git diff --check` clean.
- Homepage routing test verifies the expanded course links.

Rollback:

```bash
git checkout feature/structured-15-lessons
git reset --hard caedab8
# or use the previous product tag: robotics15-v0.6.0
```

### Smart City 15 Lessons — v0.6.0 — Superseded

- **Status:** Superseded by `robotics15-v0.6.1`
- **Branch:** `feature/structured-15-lessons`
- **Commit:** `19dc6bd`
- **Tag:** `robotics15-v0.6.0`
- **Live:** https://robotics15.hai.tech
- **Date recorded:** 2026-07-21
- **Approved by:** Inna

Product changes:

- Merged `origin/main` into the shared structured 15-lessons branch.
- Resolved the root-page conflict intentionally: `index.html` is now the platform homepage from `main`.
- Preserved the latest structured-branch Sensi 15 app, including Chava lesson 15 improvements, as `sensi-city.html`.
- Brought in the stable platform additions from `main`: Pygame, Roblox, platform home links, and Sensi classic 5 lessons.
- Added a homepage link inside the structured Sensi 15 app.

Verification:

- Full Node test suite passed: all `tests/*.mjs`.
- `tests/homepage-routing.test.mjs` passed.
- `tests/lesson-7-8-regression.test.mjs` passed.
- `git diff --check` clean.

Rollback:

```bash
git checkout feature/structured-15-lessons
git reset --hard 4625d0b
# or use the previous product tag: robotics15-v0.5.0
```

### Robotics stable — v0.8.7 — Published

- **Status:** Published
- **Branch:** `main`
- **Commit:** `35552a1`
- **Tag:** `robotics-v0.8.7`
- **Live:** https://robotics.hai.tech
- **Date recorded:** 2026-07-27
- **Approved by:** Inna

Product changes:

- Replaced the temporary `summer-account.html` experience with proper product account screens.
- Added separate pages: `register.html` for registration, `login.html` for returning users, and `account.html` for the learner account hub.
- Kept `summer-account.html` as a legacy redirect to `account.html` so old links do not break.
- Removed internal/project-management text from the account flow and replaced it with normal marketing/product copy.
- Updated subscription and lock-screen links to route to the new registration/login pages.

Verification:

- `npm run check` passed.
- `npm test` passed: all `tests/*.mjs`.
- Live verified: `/account.html`, `/register.html`, `/login.html`, legacy `/summer-account.html`, `/css/account.css`, and `/space.html` return 200.
- Live register/me/login API flow passed with a temporary test user; test user was removed afterward.

Rollback:

```bash
git checkout main
git reset --hard ba6e132
# or use the previous product tag: robotics-v0.8.6
```

### Robotics stable — v0.8.6 — Superseded

- **Status:** Superseded by `robotics-v0.8.7`
- **Branch:** `main`
- **Commit:** `82c998f`
- **Tag:** `robotics-v0.8.6`
- **Live:** https://robotics.hai.tech
- **Date recorded:** 2026-07-27
- **Approved by:** Inna

Product changes:

- Changed the free trial from Sensi City lesson 1 to **Sisi lesson 1: Space**.
- Public without payment: homepage, summer subscription page, summer account/login page, about page, Sisi hub, `space.html`, and `space-play.html?lesson=1`.
- Locked without active subscription: Sisi lessons 2–15, Sensi City, Python, WebCode, Minecraft, Money Smart, slides/labs, and other direct HTML learning URLs.
- Updated homepage, subscription page, account dashboard, and Sisi hub badges so users can see immediately what is open and what is locked.

Verification:

- `npm run check` passed.
- `npm test` passed: all `tests/*.mjs`.
- Live verified: `/`, `/sisi.html`, `/space.html`, and `/space-play.html?lesson=1` return 200; `/music.html`, `/music-play.html?lesson=1`, `/sensi-city.html?lesson=1`, and `/python-turtle.html` return 402 lock page.

Rollback:

```bash
git checkout main
git reset --hard 49692ba
# or use the previous product tag: robotics-v0.8.5
```

### Robotics stable — v0.8.5 — Superseded

- **Status:** Superseded by `robotics-v0.8.6`
- **Branch:** `main`
- **Commit:** `7ac452a`
- **Tag:** `robotics-v0.8.5`
- **Live:** https://robotics.hai.tech
- **Date recorded:** 2026-07-27
- **Approved by:** Inna

Product changes:

- Added server-side paid access lock for summer learning content.
- Public without payment: homepage, summer subscription page, summer account/login page, about page, and free Sensi City lesson 1.
- Locked without active subscription: Sensi lessons 2+, Python, WebCode, Minecraft, Money Smart, Sisi lessons, slides, labs, and other direct HTML learning URLs.
- Added a polished Hebrew lock screen with CTAs to registration, subscription details, and free lesson 1.
- Registration/login now also set an HTTP-only session cookie so protected HTML routes can be authorized by the server.
- Added logout cookie/session revocation.

Verification:

- `npm run check` passed.
- `npm test` passed: all `tests/*.mjs`.
- Local paywall integration verified: public pages 200, trial user locked with 402, active user opens paid content with 200.
- Live verified: `sensi-city.html?lesson=1` 200; `sensi-city.html?lesson=2`, `python-turtle-course.html`, and `webcode-play.html` return 402 lock page; trial user locked; temporary active user opened paid content and was removed afterward.

Rollback:

```bash
git checkout main
git reset --hard 59f7006
# or use the previous product tag: robotics-v0.8.4
```

### Robotics stable — v0.8.4 — Superseded

- **Status:** Superseded by `robotics-v0.8.5`
- **Branch:** `main`
- **Commit:** `3e58b0c`
- **Tag:** `robotics-v0.8.4`
- **Live:** https://robotics.hai.tech
- **Date recorded:** 2026-07-27
- **Approved by:** Inna

Product changes:

- Replaced the temporary JSON account storage with a real SQLite database: `data/summer-subscriptions.sqlite`.
- Added database-backed tables for `summer_users`, `summer_sessions`, and `summer_subscription_events`.
- Summer login now uses server-side session records with hashed tokens and expiry instead of only stateless local tokens.
- Kept a JSON-to-SQLite migration path so existing trial accounts can be migrated safely if present.
- Added `package.json`, `package-lock.json`, and `better-sqlite3` dependency for reproducible server setup.

Verification:

- `npm run check` passed.
- `npm test` passed: all `tests/*.mjs`.
- Local register/login/me integration test verified SQLite user + session rows.
- Live `https://robotics.hai.tech/api/summer/register` verified SQLite persistence and session creation; temporary test user was removed afterward.

Rollback:

```bash
git checkout main
git reset --hard 81b78d7
# or use the previous product tag: robotics-v0.8.3
```

### Robotics stable — v0.8.3 — Superseded

- **Status:** Superseded by `robotics-v0.8.4`
- **Branch:** `main`
- **Commit:** `8a37465`
- **Tag:** `robotics-v0.8.3`
- **Live:** https://robotics.hai.tech
- **Date recorded:** 2026-07-27
- **Approved by:** Inna

Product changes:

- Added a real summer account flow instead of leaving the subscription as only a landing page.
- Added `summer-account.html` with registration, login, learner dashboard, and direct entry to the free Sensi City lesson.
- Added server API endpoints for summer accounts: `/api/summer/register`, `/api/summer/login`, and `/api/summer/me`.
- Kept the Morning payment/webhook explicitly marked as missing before full paid-subscription launch.
- Switched live stable service from static Python serving to the project Node server on port 3006 so the auth API works in production.

Verification:

- `node --check server.js`, `node --check js/summer-account.js`, and `node --check js/summer-subscription.js` passed.
- Full Node test suite passed: all `tests/*.mjs`, including updated summer subscription/account tests.
- Live verified: `https://robotics.hai.tech/summer-account.html`, `summer-subscription.html`, and `sensi-city.html?lesson=1` return 200.
- Live API verified with a temporary test account: register → `/api/summer/me`; test user was removed afterward.

Rollback:

```bash
git checkout main
git reset --hard 4635b62
# or use the previous product tag: robotics-v0.8.2
```

### Robotics stable — v0.8.2 — Superseded

- **Status:** Superseded by `robotics-v0.8.3`
- **Branch:** `main`
- **Commit:** `40f678b`
- **Tag:** `robotics-v0.8.2`
- **Live:** https://robotics.hai.tech
- **Date recorded:** 2026-07-27
- **Approved by:** Inna

Product changes:

- Added a summer subscription landing page: `summer-subscription.html`.
- Added homepage CTA for a summer learning subscription funnel: free first lesson, then monthly Morning recurring-payment subscription.
- Added explicit cancellation copy: subscribers can cancel any time by WhatsApp/email before the next charge.
- Added a payment-link config placeholder (`js/summer-subscription-config.js`) so the Morning recurring-payment link can be inserted safely when ready.

Verification:

- `git diff --check` clean.
- Full Node test suite passed: all `tests/*.mjs`, including `tests/summer-subscription.test.mjs`.
- Payment link is intentionally empty until Morning provides the recurring payment URL.

Rollback:

```bash
git checkout main
git reset --hard 85183ef
# or use the previous product tag: robotics-v0.8.1
```

### Robotics stable — v0.8.1 — Superseded

- **Status:** Superseded by `robotics-v0.8.2`
- **Branch:** `main`
- **Commit:** `b574e51`
- **Tag:** `robotics-v0.8.1`
- **Live:** https://robotics.hai.tech
- **Date recorded:** 2026-07-27
- **Approved by:** Inna

Product changes:

- Merged PR #15 / `feature/financial-literacy-teens` into stable `main`.
- Added **Money Smart Lab**: a financial-literacy learning module for teens with course overview, interactive lab, five instructor slide decks, RTL styling, and automated tests.
- Updated platform/homepage routing so Money Smart appears as a primary learning module.
- PR also included course-flow refinements across existing play pages, certificate behavior, Sisi hub tests, and Minecraft Kids content/play improvements.
- Cleaned trailing whitespace in the generated Money Smart slide decks before merge.

Verification:

- Stashed unrelated local Chess Quest work before merging.
- Merge into current `main` completed cleanly with no conflicts.
- `git diff --check HEAD~1..HEAD` passed after whitespace cleanup.
- Full Node test suite passed on `main`: all `tests/*.mjs`.

Rollback:

```bash
git checkout main
git reset --hard f07419b
# or use the previous product tag: robotics-v0.8.0
```

### Robotics stable — v0.8.0 — Superseded

- **Status:** Superseded by `robotics-v0.8.1`
- **Branch:** `main`
- **Commit:** `cbf67be`
- **Tag:** `robotics-v0.8.0`
- **Live:** https://robotics.hai.tech
- **Date recorded:** 2026-07-22
- **Approved by:** Inna

Product changes:

- Merged the active `robotics15` platform work into stable `main` as a pre-final stable release.
- Brings the 15-lesson Sensi smart-city course, Sisi series hub/catalog consolidation, Python Turtle, Pygame, Roblox, CodeQuest, GameLab, AppForge, Craftom preview links, and the polished platform homepage into `main`.
- Keeps versioning pre-1.0 because Inna confirmed this is not the final product version yet.

Verification:

- Merge from `feature/structured-15-lessons` into `main` completed cleanly.
- `git diff --check` passed.
- Full Node test suite passed on `main`: all `tests/*.mjs`.

Rollback:

```bash
git checkout main
git reset --hard 744bf61
# or use the previous product tag: robotics-v0.2.4
```

### Robotics stable — v0.2.4 — Superseded

- **Status:** Superseded by `robotics-v0.8.0`
- **Branch:** `main`
- **Commit:** `b1e62a4`
- **Tag:** `robotics-v0.2.4`
- **Live:** https://robotics.hai.tech
- **Date recorded:** 2026-07-21
- **Approved by:** Inna

Product changes:

- Merged PR #12 by Miriam: Minecraft Kids builder lesson refinements.
- Updated Minecraft lesson data and play experience, including lesson 3/pixel-gallery related refinements.
- Updated Minecraft slides, teacher page, and landing page copy touched by the PR.

Verification:

- Merge into current `main` was clean.
- Full Node test suite passed: all `tests/*.mjs`.
- `git diff --check HEAD~1..HEAD` clean.

Rollback:

```bash
git checkout main
git reset --hard 06a1f20
# or use the previous product tag: robotics-v0.2.3
```

### Robotics stable — v0.2.3 — Superseded

- **Status:** Superseded by `robotics-v0.2.4`
- **Branch:** `main`
- **Commit:** `e400c9f`
- **Tag:** `robotics-v0.2.3`
- **Live:** https://robotics.hai.tech
- **Date recorded:** 2026-07-21
- **Approved by:** Inna

Product changes:

- Redesigned the platform homepage in the style direction of the Holon pages: premium hero, navigation, track sections, roadmap, CTA, and polished catalog cards.
- Added a generated EdTech hero image at `assets/robotics-home-hero.png`.
- Kept all existing homepage course links while making the page feel like a product catalog rather than a plain card list.

Verification:

- Full Node test suite passed: all `tests/*.mjs`.
- `git diff --check` clean.
- Homepage routing test still verifies the expanded course links.

Rollback:

```bash
git checkout main
git reset --hard 795f5ea
# or use the previous product tag: robotics-v0.2.2
```

### Robotics stable — v0.2.2 — Superseded

- **Status:** Superseded by `robotics-v0.2.3`
- **Branch:** `main`
- **Commit:** `235dbfd`
- **Tag:** `robotics-v0.2.2`
- **Live:** https://robotics.hai.tech
- **Date recorded:** 2026-07-21
- **Approved by:** Inna

Product changes:

- Expanded the platform homepage catalog so the prepared learning modules are visible as individual cards.
- Added homepage cards for the full Sisi series and individual Sisi lessons beyond Space/Ocean: music, detective, kitchen, dino, art, weather, factory, garden, park, mail, cinema, escape, and finale.
- Added explicit homepage cards for CodeQuest, PlayCode Lab/GameLab, and WebMakers Lab/AppForge.
- Expanded quick links for Sisi, CodeQuest, PlayCode Lab, and WebMakers Lab.

Verification:

- Full Node test suite passed: all `tests/*.mjs`.
- `git diff --check` clean.
- Homepage routing test now verifies the expanded course links.

Rollback:

```bash
git checkout main
git reset --hard 44a1fe1
# or use the previous product tag: robotics-v0.2.1
```

### Robotics stable — v0.2.1 — Superseded

- **Status:** Superseded by `robotics-v0.2.2`
- **Branch:** `main`
- **Commit:** `c8a7a61`
- **Tag:** `robotics-v0.2.1`
- **Live:** https://robotics.hai.tech
- **Date recorded:** 2026-07-21
- **Approved by:** Inna

Product changes:

- Restored the original 5-lesson Sensi course as a separate classic product page: `sensi-classic.html`.
- Added isolated classic support pages: `sensi-classic-about.html`, `sensi-classic-teachers.html`, and `sensi-classic-slides/`.
- Added homepage quick links and course card for “סנסי קלאסי” while keeping `sensi-city.html` as the 15-lesson smart-city Sensi course.
- Added routing tests to ensure classic 5-lesson Sensi remains separate from Sensi 15.

Verification:

- Full Node test suite passed: all `tests/*.mjs`.
- `git diff --check` clean.
- Local link scan on the classic Sensi pages found 0 missing local links.

Rollback:

```bash
git checkout main
git reset --hard 8945516
# or use the previous product tag: robotics-v0.2.0
```

### Robotics stable — v0.2.0 — Superseded

- **Status:** Superseded by `robotics-v0.2.1`
- **Branch:** `main`
- **Commit:** `8e2c9c0`
- **Tag:** `robotics-v0.2.0`
- **Live:** https://robotics.hai.tech
- **Date recorded:** 2026-07-21
- **Approved by:** Inna

Product changes:

- Merged PR #10 by Or / ashtamker: learning platform homepage.
- Public root `index.html` is now a platform gateway for the learning modules.
- Original Sensi Blockly app moved to `sensi-city.html`.
- Added Pygame and Roblox learning modules, slides/content, assets, and tests.
- Added platform-home links across primary learning pages.
- Fixed release checks after merge: WebMakers link in `holon-scope-program.html`; cleaned EOF whitespace warnings.

Verification:

- Full Node test suite passed: all `tests/*.mjs`.
- `git diff --check` clean for release diff.
- Local link scan on primary pages found 0 missing local links.

Rollback:

```bash
git checkout main
git reset --hard 1e76b9d
# or use previous product tag: robotics-v0.1.0
```

### Smart City 15 Lessons — v0.5.0 — Superseded

- **Status:** Superseded by `robotics15-v0.6.0`
- **Branch:** `feature/structured-15-lessons`
- **Commit:** `4625d0b`
- **Tag:** `robotics15-v0.5.0`
- **Live:** https://robotics15.hai.tech
- **Date recorded:** 2026-07-21
- **Approved by:** Inna

Product changes:

- Merged PR #9 by Chava: lesson 15 improvements.
- Added richer lesson 15 city zones and interactions: greenhouse, rescue/emergency, security patrol, grocery/homes delivery flow and supporting visual assets.
- Added/updated regression coverage for lesson 15.
- Verification after merge: `node tests/lesson-7-8-regression.test.mjs` passed `44/44`; live URL verified with lesson 15 new strings/assets.

Rollback:

```bash
git checkout feature/structured-15-lessons
git reset --hard 9ebb5af
# or use the previous tag: robotics15-v0.4.0
```

### Robotics stable — v0.1.0 — Superseded

- **Status:** Superseded by `robotics-v0.2.0`
- **Branch:** `main`
- **Commit:** `55ab2d4`
- **Live:** https://robotics.hai.tech
- **Date recorded:** 2026-07-21
- **Approved by:** Inna / current production state

Product notes:

- `main` is the stable public robotics site.
- Current `origin/main` includes the Python Turtle mobile layout sync and `.gitignore` restoration.
- Open PRs against `main` should not be merged automatically if they change the public root homepage or course architecture.

Rollback:

```bash
git checkout main
git reset --hard 55ab2d4
# redeploy/restart according to the current hosting setup
```

### Smart City 15 Lessons — v0.4.0 — Superseded

- **Status:** Superseded by `robotics15-v0.5.0`
- **Branch:** `feature/structured-15-lessons`
- **Commit:** `9ebb5af`
- **Live:** https://robotics15.hai.tech
- **Date recorded:** 2026-07-21
- **Approved by:** Inna / current robotics15 review base

Product notes:

- Includes PR #8 lessons 10–11 polish merged into the 15-lesson branch.
- Includes Python Turtle mobile layout sync from main.
- Current regression baseline: `node tests/lesson-7-8-regression.test.mjs` previously passed `37/37` on the synced branch.

Rollback:

```bash
git checkout feature/structured-15-lessons
git reset --hard 9ebb5af
# redeploy/restart robotics15 service if needed
```

## Open Review Candidates

### Smart City 15 Lessons — v0.5.0-rc1 — PR #9 Chava lesson 15 improvements

- **Status:** Merged / Published as `robotics15-v0.5.0`
- **PR:** https://github.com/inna-hai/robotics-for-kids/pull/9
- **Branch:** `chava/bug-fixes` → `feature/structured-15-lessons`
- **Latest checked head:** `e294301`; merged into `feature/structured-15-lessons` as merge commit `4625d0b`.
- **Product area:** Smart City 15 Lessons

Expected product change:

- Upgrades lesson 15 with richer city zones and interactions.
- Adds lesson 15 visual assets.
- Adds/updates regression tests around lesson 15.

Review notes:

- Previous deep review on head `c5a9194`: clean merge into `feature/structured-15-lessons`, `44/44` regression tests passed.
- Need re-check because PR head advanced to `e294301`.
- Prior requested cleanup: remove unrelated `holon-scope-program.html` WebMakers change and remove trailing blank line in test file.

Approval checklist:

- [ ] Re-run merge simulation into `origin/feature/structured-15-lessons`.
- [ ] Re-run regression tests.
- [ ] Confirm no unrelated Holon page changes.
- [ ] Confirm `git diff --check` is clean.
- [ ] If approved, tag as `robotics15-v0.5.0` after merge and publish.

### Robotics stable — v0.2.0-rc1 — PR #10 learning platform homepage

- **Status:** Merged / Published as `robotics-v0.2.0`
- **PR:** https://github.com/inna-hai/robotics-for-kids/pull/10
- **Branch:** `feature/learning-platform-work` → `main`
- **Latest checked head:** `f094685`; merged into `main` as merge commit `9c8e50f`, release fixes commit `8e2c9c0`.
- **Product area:** Robotics stable homepage / learning platform

Expected product change:

- Replaces public root `index.html` with a platform homepage.
- Moves Sensi app to `sensi-city.html`.
- Adds Pygame and Roblox learning modules and tests.

Review notes:

- Merge simulation into `origin/main` was clean.
- Sensi regression test passed `37/37` after simulated merge.
- Most course tests passed, but full suite had existing failure in `tests/appforge-course.test.mjs` (`Holon program links WebMakers`), which also exists on clean `origin/main`.
- `git diff --check` reported trailing blank lines in `content/pygame-lessons.js` and `content/roblox-lessons.md`.
- This is a product architecture change, not just a bug fix. It requires explicit product approval before merge.

Approval checklist:

- [ ] Decide if `robotics.hai.tech/` should become a platform homepage.
- [ ] Manually review homepage and Sensi redirect/entry flow.
- [ ] Fix or document existing AppForge test failure.
- [ ] Clean EOF whitespace warnings.
- [ ] If approved, tag as `robotics-v0.2.0` after merge and publish.

### Robotics stable — v0.2.0-rc2 — PR #11 Craftom school lomda

- **Status:** Not reviewed yet
- **PR:** https://github.com/inna-hai/robotics-for-kids/pull/11
- **Branch:** `feature/add-craftom-school` → `main`
- **Product area:** Robotics stable / Craftom learning content

Approval checklist:

- [ ] Review files and product scope.
- [ ] Run merge simulation into `origin/main`.
- [ ] Run relevant tests.
- [ ] Decide if it belongs in robotics stable.

### Robotics stable — v0.2.0-rc3 — PR #12 Minecraft Kids refinements

- **Status:** Not reviewed yet
- **PR:** https://github.com/inna-hai/robotics-for-kids/pull/12
- **Branch:** `miriam/minecraft-kids` → `main`
- **Product area:** Robotics stable / Minecraft kids lessons

Approval checklist:

- [ ] Review files and product scope.
- [ ] Run merge simulation into `origin/main`.
- [ ] Run relevant tests.
- [ ] Check overlap with PR #11 and PR #10 before merge.

## Release Procedure

For each product-level release:

1. Review PR scope and decide product area (`main` or `feature/structured-15-lessons`).
2. Run merge simulation into the target branch.
3. Run relevant tests.
4. Confirm `git diff --check` is clean.
5. Update this file:
   - Move candidate to `Current Published Versions` if released.
   - Add product summary, commit, live URL, approval, and rollback note.
6. Create a Git tag:

```bash
git tag -a robotics15-v0.5.0 -m "Publish Robotics 15 v0.5.0"
git push origin robotics15-v0.5.0
```

or:

```bash
git tag -a robotics-v0.2.0 -m "Publish Robotics v0.2.0"
git push origin robotics-v0.2.0
```

7. Verify live URL with cache-busting query parameter.

## Product Decision Log

### 2026-07-21 — Product version management introduced

Decision:

- Add product-level versioning for robotics because multiple contributors are opening PRs across stable, Smart City 15, Craftom, Roblox/Pygame, and Minecraft areas.
- Keep the mechanism lightweight first: `PRODUCT_VERSIONS.md` + Git tags after approval.

Standing rules:

- Do not treat a clean Git merge as product approval.
- Any PR changing `index.html` / public root behavior needs explicit product approval.
- Any PR targeting `feature/structured-15-lessons` should be reviewed as a `robotics15` release candidate.
- Product cards/release notes should be written in human-readable language, not only commit messages.
