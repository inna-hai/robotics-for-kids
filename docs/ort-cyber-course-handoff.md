# ORT Cyber course - handoff

Updated: 2026-10-19

## Working context

- Worktree: `package/worktrees/ort-cyber-course-completion`
- Branch: `feature/ort-cyber-course-completion`
- Base remote branch: `origin/feature/structured-15-lessons`
- Work only through a pull request; do not merge directly to `main`.
- Keep ORT Cyber independent from the Cyber City client/project.

## Saved commits

- `d81424c` - lessons 1 and 2
- `f689925` - lessons 3 to 5

The branch is currently two commits ahead of its base. The commits have not been pushed because GitHub credentials were unavailable in the environment.

## Lesson 6 - local, not committed

Implemented and saved locally:

- `ort-cyber-lesson-6.html` - student learning activity
- `ort-cyber-slides-6.html` - instructor presentation
- `content/source-materials/ort-cyber/lesson-6/` - full lesson plan, Kahoot transcript, and source review
- `ort-courses.html` - lesson 6 enabled in the ORT course hub
- `tests/ort-cyber-course.test.mjs` - lesson 6 coverage

Latest corrections completed:

- Fixed live quiz score display and safe rendering of the app name.
- Improved mobile layout, contrast, labels, focus states, `aria-pressed`, and save feedback.
- Corrected risk-calculator logic: camera-only is medium risk, two or more sensitive permissions are high risk, and Accessibility is very high risk.
- Permission-detective completion now requires both correct permission analysis and the correct installation decision; wrong answers can be corrected.
- Removed all time displays from the student activity. Times remain only in the lesson plan and instructor presentation.

Verification already completed after the corrections:

- ORT Cyber tests passed.
- ORT AI Agents regression tests passed.
- Lesson 6 correction checks passed.
- Local HTTP smoke returned 200.

Do not repeat these checks unless lesson 6 changes again or a commit/push is about to be created.

## Next session - lesson 7

1. Receive and preserve the full lesson plan, source presentation/link, and quiz screenshots.
2. Review all sources before building.
3. Create independent files `ort-cyber-lesson-7.html` and `ort-cyber-slides-7.html`.
4. Keep the student activity RTL and exclude lesson timing from it.
5. Add feedback and explanation after each quiz answer.
6. Update `ort-courses.html` and extend `tests/ort-cyber-course.test.mjs`.
7. Run proportional QA after implementation.
8. Do not commit, push, or open a pull request without a new explicit request.
