import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import vm from 'node:vm';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const escapeHtml = readFileSync(join(root, 'escape.html'), 'utf8');
const playHtml = readFileSync(join(root, 'escape-play.html'), 'utf8');
const labHtml = readFileSync(join(root, 'escape-lab.html'), 'utf8');
const hubHtml = readFileSync(join(root, 'sisi.html'), 'utf8');
const smartCityHtml = readFileSync(join(root, 'smart-city.html'), 'utf8');
const cinemaHtml = readFileSync(join(root, 'cinema.html'), 'utf8');
const escapeCss = readFileSync(join(root, 'css', 'escape.css'), 'utf8');
const lessonsSource = readFileSync(join(root, 'js', 'escape-lessons.js'), 'utf8');
const playSource = readFileSync(join(root, 'js', 'escape-play.js'), 'utf8');
const plan = readFileSync(join(root, 'ESCAPE_76_MIN_LESSON_PLAN.md'), 'utf8');

const sandbox = { window: {} };
vm.runInNewContext(lessonsSource, sandbox, { filename: 'escape-lessons.js' });
const lessons = sandbox.window.ESCAPE_LESSONS;
const keys = sandbox.window.ESCAPE_KEYS;

const tests = [];
function test(name, fn) { tests.push({ name, fn }); }
function assertIncludes(source, needle, message = `Missing: ${needle}`) { assert.ok(source.includes(needle), message); }

test('escape course is linked as lesson 14 in the Sisi series', () => {
  assertIncludes(smartCityHtml, 'href="escape.html"');
  assertIncludes(smartCityHtml, 'שיעור 14: חדר בריחה');
  assertIncludes(cinemaHtml, 'href="escape.html"');
  assertIncludes(hubHtml, 'שיעור 14');
  assertIncludes(hubHtml, 'סיסי בחדר הבריחה');
});

test('landing page frames a 76-minute experiential programming lesson', () => {
  assertIncludes(escapeHtml, 'שיעור 14 • תנאי וגם • כיתות ב׳ • 76 דקות');
  assertIncludes(escapeHtml, 'אם שני תנאים מתקיימים יחד');
  assertIncludes(escapeHtml, 'אתגר “אחד נכון לא מספיק”');
  assertIncludes(escapeHtml, 'משחק בוני חדרים בזוגות');
  assertIncludes(escapeHtml, 'href="escape-play.html?lesson=1"');
  assertIncludes(escapeHtml, 'href="escape-lab.html"');
});

test('escape data has six AND-condition tasks with two required keys and distractors', () => {
  assert.equal(lessons.length, 6);
  const keyIds = Object.keys(keys);
  for (const lesson of lessons) {
    assert.equal(lesson.required.length, 2, `Lesson ${lesson.id} needs two required conditions`);
    assert.equal(lesson.distractors.length, 2, `Lesson ${lesson.id} needs two distractors`);
    for (const id of [...lesson.required, ...lesson.distractors]) assert.ok(keyIds.includes(id), `Unknown key ${id}`);
    assertIncludes(lesson.conditionText, 'וגם');
    assert.ok(lesson.learningNote.length >= 35, `Lesson ${lesson.id} needs learning note`);
  }
});

test('escape play page checks two selected keys and reason for AND', () => {
  assertIncludes(playHtml, 'id="key-options"');
  assertIncludes(playHtml, 'id="condition-preview"');
  assertIncludes(playHtml, 'id="reason-options"');
  assertIncludes(playSource, 'selected.length !== 2');
  assertIncludes(playSource, 'כי שני התנאים מתקיימים יחד');
  assertIncludes(playSource, "href: 'escape-lab.html'");
  assert.ok(!playHtml.includes('scene-bank'), 'Escape lesson should not use cinema scene bank');
});

test('escape lab, css, and plan support 76 minutes', () => {
  assertIncludes(labHtml, 'פעילות יצירה • 15–20 דקות');
  assertIncludes(labHtml, 'תנאי 1');
  assertIncludes(labHtml, 'תנאי 2');
  assertIncludes(labHtml, 'רמז מבלבל');
  assertIncludes(escapeCss, '.condition-preview');
  assertIncludes(escapeCss, '.key-card');
  assertIncludes(plan, 'שיעור 76 דקות');
  assertIncludes(plan, 'מתקדם בתכנות בצורה חווייתית');
});

let passed = 0;
for (const { name, fn } of tests) {
  try { fn(); passed += 1; console.log(`✓ ${name}`); }
  catch (error) { console.error(`✗ ${name}`); console.error(error.stack || error.message); process.exitCode = 1; break; }
}
if (!process.exitCode) console.log(`\n${passed}/${tests.length} escape course tests passed.`);
