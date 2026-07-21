import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const app = readFileSync(new URL('../python-turtle.html', import.meta.url), 'utf8');
const index = readFileSync(new URL('../python-turtle-slides.html', import.meta.url), 'utf8');

const lessonIds = [...app.matchAll(/["']?id["']?:\s*(\d+),/g)].map(m => Number(m[1]));
const uniqueIds = new Set(lessonIds);
assert.equal(uniqueIds.size, 30, 'student course should expose 30 lessons');
assert.match(app, /אתגר מסכם/);
assert.match(app, /"id": 30/);
assert.match(app, /0–10/);
assert.match(app, /student-steps/);
assert.match(index, /כרגע יש 30 שיעורים מלאים במסלול/);
assert.match(index, /python-turtle-lesson-30-slides\.html/);

for (let id = 1; id <= 30; id++) {
  const url = new URL(`../python-turtle-lesson-${id}-slides.html`, import.meta.url);
  assert.ok(existsSync(url), `missing separate teacher slides for lesson ${id}`);
  const slides = readFileSync(url, 'utf8');
  assert.match(slides, new RegExp(`שיעור ${id} מתוך 30`));
  assert.match(slides, /90 דקות/);
  assert.match(slides, /הרבה תרגולים לשיעור/);
  assert.match(slides, /פתח את שיעור/);
}

console.log('python-turtle 30 lesson course checks passed');
