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

### Robotics stable — v0.1.0 — Published

- **Status:** Published
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

### Smart City 15 Lessons — v0.4.0 — Published / Active review base

- **Status:** Published / Active review base
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

- **Status:** Review
- **PR:** https://github.com/inna-hai/robotics-for-kids/pull/9
- **Branch:** `chava/bug-fixes` → `feature/structured-15-lessons`
- **Latest checked head:** `e294301` as of 2026-07-21 fetch; previous deep review was on `c5a9194`.
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

- **Status:** Review / Needs product decision
- **PR:** https://github.com/inna-hai/robotics-for-kids/pull/10
- **Branch:** `feature/learning-platform-work` → `main`
- **Latest checked head:** `f094685`
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
