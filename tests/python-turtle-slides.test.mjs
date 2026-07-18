import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const slides = readFileSync(new URL('../python-turtle-slides.html', import.meta.url), 'utf8');
const app = readFileSync(new URL('../python-turtle.html', import.meta.url), 'utf8');

assert.match(slides, /מצגות מדריך לשיעורי Python Turtle/);
assert.match(slides, /כרגע יש 30 שיעורים מלאים במסלול/);
assert.match(slides, /python-turtle-lesson-1-slides\.html/);
assert.match(slides, /python-turtle-lesson-30-slides\.html/);
assert.match(slides, /פתח בלומדה/);
assert.match(slides, /@media print/);
assert.match(app, /python-turtle-slides\.html/);
assert.doesNotMatch(slides, /MVP חדש לכיתה/);

for (let id = 1; id <= 30; id++) {
  const url = new URL(`../python-turtle-lesson-${id}-slides.html`, import.meta.url);
  assert.ok(existsSync(url), `missing separate teacher slides for lesson ${id}`);
  const lessonSlides = readFileSync(url, 'utf8');
  assert.match(lessonSlides, new RegExp(`שיעור ${id} מתוך 30`));
  assert.match(lessonSlides, /90 דקות/);
  assert.match(lessonSlides, /הרבה תרגולים לשיעור/);
  assert.match(lessonSlides, /מבנה 90 דקות/);
  assert.match(lessonSlides, /דגשי מדריך/);
  assert.match(lessonSlides, /פתח את שיעור/);
}

const lesson2 = readFileSync(new URL('../python-turtle-lesson-2-slides.html', import.meta.url), 'utf8');
const lesson6 = readFileSync(new URL('../python-turtle-lesson-6-slides.html', import.meta.url), 'utf8');
const lesson30 = readFileSync(new URL('../python-turtle-lesson-30-slides.html', import.meta.url), 'utf8');
assert.match(lesson2, /מסלול מדרגות/);
assert.match(lesson6, /משתנה/);
assert.match(lesson30, /פרויקט גמר קצר/);

console.log('python-turtle teacher slides checks passed');
