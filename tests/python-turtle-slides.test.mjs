import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const slides = readFileSync(new URL('../python-turtle-slides.html', import.meta.url), 'utf8');
const app = readFileSync(new URL('../python-turtle.html', import.meta.url), 'utf8');
const separateSlides = Array.from({length: 6}, (_, i) => readFileSync(new URL(`../python-turtle-lesson-${i + 1}-slides.html`, import.meta.url), 'utf8'));

assert.match(slides, /מצגות מדריך לשיעורי Python Turtle/);
assert.match(slides, /python-turtle-lesson-1-slides\.html/);
assert.match(slides, /python-turtle-lesson-6-slides\.html/);
assert.match(slides, /שיעור 1 — פקודות ראשונות/);
assert.match(slides, /שיעור 2 — מציירים ריבוע/);
assert.match(slides, /שיעור 3 — צבע ועובי/);
assert.match(slides, /שיעור 4 — עט למעלה \/ למטה/);
assert.match(slides, /שיעור 5 — אתגר כוכב/);
assert.match(slides, /שיעור 6 — משתנה: אורך/);
assert.match(slides, /טעויות נפוצות/);
assert.match(slides, /פתח בלומדה/);
assert.match(slides, /python-turtle\.html\?lesson=6/);
assert.match(slides, /@media print/);
assert.match(app, /python-turtle-slides\.html/);
assert.doesNotMatch(slides, /MVP חדש לכיתה/);

for (const [index, lessonSlides] of separateSlides.entries()) {
  assert.match(lessonSlides, new RegExp(`שיעור ${index + 1}`));
  assert.match(lessonSlides, /90 דקות/);
  assert.match(lessonSlides, /הרבה תרגולים לשיעור/);
  assert.match(lessonSlides, /מבנה 90 דקות/);
  assert.match(lessonSlides, /פתח את שיעור/);
}
assert.match(separateSlides[1], /אתגר משולש/);
assert.match(separateSlides[5], /משתנה הוא קופסה עם שם/);

console.log('python-turtle teacher slides checks passed');
