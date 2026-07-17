import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import vm from 'node:vm';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const artHtml = readFileSync(join(root, 'art.html'), 'utf8');
const playHtml = readFileSync(join(root, 'art-play.html'), 'utf8');
const hubHtml = readFileSync(join(root, 'sisi.html'), 'utf8');
const smartCityHtml = readFileSync(join(root, 'smart-city.html'), 'utf8');
const dinoHtml = readFileSync(join(root, 'dino.html'), 'utf8');
const artCss = readFileSync(join(root, 'css', 'art.css'), 'utf8');
const lessonsSource = readFileSync(join(root, 'js', 'art-lessons.js'), 'utf8');
const playSource = readFileSync(join(root, 'js', 'art-play.js'), 'utf8');
const plan = readFileSync(join(root, 'ART_75_MIN_LESSON_PLAN.md'), 'utf8');

const sandbox = { window: {} };
vm.runInNewContext(lessonsSource, sandbox, { filename: 'art-lessons.js' });
const lessons = sandbox.window.ART_LESSONS;
const colors = sandbox.window.ART_COLORS;

const tests = [];
function test(name, fn) { tests.push({ name, fn }); }
function assertIncludes(source, needle, message = `Missing: ${needle}`) { assert.ok(source.includes(needle), message); }
function keyOf(command) { return `${command.row}:${command.col}:${command.color}`; }

test('art course is linked as lesson 7 in the Sisi series', () => {
  assertIncludes(smartCityHtml, 'href="art.html"');
  assertIncludes(smartCityHtml, 'שיעור 7: פיקסלים');
  assertIncludes(dinoHtml, 'href="art.html"');
  assertIncludes(hubHtml, 'שיעור 7');
  assertIncludes(hubHtml, 'סיסי בסטודיו הפיקסלים');
});

test('landing page frames a new pixel-coordinate mechanic for grade B', () => {
  assertIncludes(artHtml, 'שיעור 7 • פיקסלים וקואורדינטות • כיתות ב׳ • 75 דקות');
  assertIncludes(artHtml, 'שורה ועמודה');
  assertIncludes(artHtml, 'דיבוג');
  assertIncludes(artHtml, 'ציורים 1–4 לכל הכיתה, 5–6 להרחבה');
  assertIncludes(artHtml, 'href="art-play.html?lesson=1"');
  assertIncludes(artHtml, 'js/art-lessons.js');
  assertIncludes(artHtml, 'css/art.css');
});

test('art data has six pixel challenges with valid coordinates and distractors', () => {
  assert.equal(lessons.length, 6);
  const colorKeys = Object.keys(colors);
  for (const lesson of lessons) {
    assert.ok([4, 5].includes(lesson.size), `Lesson ${lesson.id} should use a young-kid-sized grid`);
    assert.ok(lesson.target.length >= 5, `Lesson ${lesson.id} needs enough target pixels`);
    assert.ok(lesson.distractors.length >= 2, `Lesson ${lesson.id} needs distractor commands for debugging`);
    const targetKeys = new Set();
    for (const command of [...lesson.target, ...lesson.distractors]) {
      assert.ok(command.row >= 1 && command.row <= lesson.size, `row out of range in lesson ${lesson.id}`);
      assert.ok(command.col >= 1 && command.col <= lesson.size, `col out of range in lesson ${lesson.id}`);
      assert.ok(colorKeys.includes(command.color), `unknown color ${command.color}`);
      if (lesson.target.includes(command)) targetKeys.add(keyOf(command));
    }
    for (const distractor of lesson.distractors) {
      assert.ok(!targetKeys.has(keyOf(distractor)), `Distractor duplicates target in lesson ${lesson.id}`);
    }
  }
});

test('art play page exposes pixel boards and command cards instead of previous mechanics', () => {
  assertIncludes(playHtml, 'id="target-board"');
  assertIncludes(playHtml, 'id="my-board"');
  assertIncludes(playHtml, 'id="commands"');
  assertIncludes(playHtml, 'id="selected-list"');
  assertIncludes(playHtml, 'js/art-play.js');
  assert.ok(!playHtml.includes('zone-btn'), 'Art lesson should not use dino classification zones');
  assert.ok(!playHtml.includes('recipe-steps'), 'Art lesson should not use recipe ordering');
});

test('art engine validates selected commands against target pixels and supports debugging', () => {
  assertIncludes(playSource, 'function checkArtwork()');
  assertIncludes(playSource, 'missing.length === 0 && extra.length === 0');
  assertIncludes(playSource, 'הוראות מיותרות');
  assertIncludes(playSource, 'function showHint()');
  assertIncludes(playSource, 'function resetArtwork()');
  assertIncludes(playSource, 'renderNextStep(true)');
  assertIncludes(playSource, 'art-play.html?lesson=');
});

test('art css and plan support a visual 75-minute pixel lesson', () => {
  assertIncludes(artCss, '.pixel-board');
  assertIncludes(artCss, '.pixel-cell');
  assertIncludes(artCss, '.command-card');
  assertIncludes(artCss, '.boards-two');
  assertIncludes(artCss, 'direction:ltr');
  assertIncludes(plan, 'שיעור 75 דקות לכיתות ב׳ / גיל 7');
  assertIncludes(plan, 'ציורים 1–4 מספיקים לשיעור מלא');
  assertIncludes(plan, 'לא ניווט במסלול');
});

let passed = 0;
for (const { name, fn } of tests) {
  try { fn(); passed += 1; console.log(`✓ ${name}`); }
  catch (error) { console.error(`✗ ${name}`); console.error(error.stack || error.message); process.exitCode = 1; break; }
}
if (!process.exitCode) console.log(`\n${passed}/${tests.length} art course tests passed.`);
