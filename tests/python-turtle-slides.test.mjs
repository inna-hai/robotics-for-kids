import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { Script } from 'node:vm';

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

const inlineScripts = [...app.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)].map(match => match[1]);
assert.ok(inlineScripts.length > 0, 'python-turtle.html should include inline app script');
for (const [index, script] of inlineScripts.entries()) {
  assert.doesNotThrow(() => new Script(script), `inline script ${index + 1} in python-turtle.html should be valid JavaScript`);
}

for (let id = 1; id <= 30; id++) {
  const url = new URL(`../python-turtle-lesson-${id}-slides.html`, import.meta.url);
  assert.ok(existsSync(url), `missing separate teacher slides for lesson ${id}`);
  const lessonSlides = readFileSync(url, 'utf8');
  assert.match(lessonSlides, new RegExp(`שיעור ${id} מתוך 30`));
  assert.match(lessonSlides, /90 דקות/);
  if (id === 9) {
    assert.match(lessonSlides, /תרגולי הכוכב/);
    assert.match(lessonSlides, /דיבאג ואתגרי סיום/);
  } else {
    assert.match(lessonSlides, /הרבה תרגולים לשיעור/);
  }
  assert.match(lessonSlides, /מבנה 90 דקות/);
  assert.match(lessonSlides, /דגשי מדריך/);
  assert.match(lessonSlides, /פתח את שיעור/);
}

const lesson2 = readFileSync(new URL('../python-turtle-lesson-2-slides.html', import.meta.url), 'utf8');
const lesson6 = readFileSync(new URL('../python-turtle-lesson-6-slides.html', import.meta.url), 'utf8');
const lesson7 = readFileSync(new URL('../python-turtle-lesson-7-slides.html', import.meta.url), 'utf8');
const lesson30 = readFileSync(new URL('../python-turtle-lesson-30-slides.html', import.meta.url), 'utf8');
assert.match(lesson2, /מסלול מדרגות/);
assert.match(lesson2, /תרגול 9 — מדרגות בשני צבעים/);
assert.match(lesson6, /משתנה/);
assert.match(lesson7, /קרש ראשון בגדר/);
assert.match(lesson7, /מתחילים משמאל/);
assert.match(lesson30, /פרויקט גמר קצר/);

console.log('python-turtle teacher slides checks passed');

assert.match(readFileSync('python-turtle-lesson-7-slides.html', 'utf8'), /אתגר מסכם — כותבים Python קצר/, 'lesson 7 slides include the final Python writing challenge');

assert.match(readFileSync('python-turtle-lesson-7-slides.html', 'utf8'), /אתגר רשות — גדר עם שפיצים/, 'lesson 7 slides include the pointed fence challenge');
