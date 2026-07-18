import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const slides = readFileSync(new URL('../python-turtle-slides.html', import.meta.url), 'utf8');
const app = readFileSync(new URL('../python-turtle.html', import.meta.url), 'utf8');

assert.match(slides, /מצגות מדריך לשיעורי Python Turtle/);
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

console.log('python-turtle teacher slides checks passed');
