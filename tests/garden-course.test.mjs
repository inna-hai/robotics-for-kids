import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import vm from 'node:vm';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const gardenHtml = readFileSync(join(root, 'garden.html'), 'utf8');
const playHtml = readFileSync(join(root, 'garden-play.html'), 'utf8');
const hubHtml = readFileSync(join(root, 'sisi.html'), 'utf8');
const smartCityHtml = readFileSync(join(root, 'smart-city.html'), 'utf8');
const factoryHtml = readFileSync(join(root, 'factory.html'), 'utf8');
const gardenCss = readFileSync(join(root, 'css', 'garden.css'), 'utf8');
const lessonsSource = readFileSync(join(root, 'js', 'garden-lessons.js'), 'utf8');
const playSource = readFileSync(join(root, 'js', 'garden-play.js'), 'utf8');
const plan = readFileSync(join(root, 'GARDEN_75_MIN_LESSON_PLAN.md'), 'utf8');

const sandbox = { window: {} };
vm.runInNewContext(lessonsSource, sandbox, { filename: 'garden-lessons.js' });
const lessons = sandbox.window.GARDEN_LESSONS;
const actions = sandbox.window.GARDEN_ACTIONS;

const tests = [];
function test(name, fn) { tests.push({ name, fn }); }
function assertIncludes(source, needle, message = `Missing: ${needle}`) { assert.ok(source.includes(needle), message); }

test('garden course is linked as lesson 10 in the Sisi series', () => {
  assertIncludes(smartCityHtml, 'href="garden.html"');
  assertIncludes(smartCityHtml, 'שיעור 10: גינת קסמים');
  assertIncludes(factoryHtml, 'href="garden.html"');
  assertIncludes(hubHtml, 'שיעור 10');
  assertIncludes(hubHtml, 'סיסי בגינת הקסמים');
});

test('landing page frames a vegetable garden game for grade B', () => {
  assertIncludes(gardenHtml, 'שיעור 10 • משימת הערוגות • כיתות ב׳ • 75 דקות');
  assertIncludes(gardenHtml, 'מחסן הכלים נשאר קבוע');
  assertIncludes(gardenHtml, 'טיפול וקטיף');
  assertIncludes(gardenHtml, 'ערוגות 1–6 לכל הכיתה, 7–12 להרחבה ואתגר');
  assertIncludes(gardenHtml, 'href="garden-play.html?lesson=1"');
  assertIncludes(gardenHtml, 'js/garden-lessons.js');
  assertIncludes(gardenHtml, 'css/garden.css');
});

test('garden data has twelve vegetable beds with clear bed-and-tool missions', () => {
  assert.equal(lessons.length, 12);
  const actionKeys = Object.keys(actions);
  assert.deepEqual(Array.from(lessons, (lesson) => lesson.mode), Array(12).fill('bed-tool'));
  assert.ok(actionKeys.includes('harvest'));
  assert.ok(actionKeys.includes('drain'));
  assert.ok(actionKeys.includes('shade'));
  for (const lesson of lessons) {
    assert.equal(lesson.choices.length, 3, `Lesson ${lesson.id} needs three vegetable beds`);
    assert.ok(lesson.choices.some((choice) => choice.id === lesson.correctBed), `Lesson ${lesson.id} needs a valid correct bed`);
    assert.ok(lesson.mission.startsWith('משימה:'), `Lesson ${lesson.id} mission should be explicit`);
    assert.ok(lesson.mission.length >= 45, `Lesson ${lesson.id} needs a clear mission`);
    assert.ok(actionKeys.includes(lesson.answer), `Lesson ${lesson.id} answer must be valid`);
    assert.ok(lesson.learningNote.length >= 35, `Lesson ${lesson.id} needs learning note`);
  }
});

test('garden play page exposes fixed tools and a visual vegetable board', () => {
  assertIncludes(playHtml, 'id="action-options"');
  assertIncludes(playHtml, 'id="choice-preview"');
  assertIncludes(playHtml, 'id="growth-path"');
  assertIncludes(playHtml, 'id="garden-board"');
  assertIncludes(playHtml, 'id="garden-score"');
  assertIncludes(playHtml, 'id="stage"');
  assertIncludes(playHtml, 'js/garden-play.js');
  assert.ok(!playHtml.includes('count-options'), 'Garden lesson should not use repeat counts');
  assert.ok(!playHtml.includes('sensor-options'), 'Garden lesson should not use sensor/action pairing');
});

test('garden engine checks beds and tools while keeping feedback game-like', () => {
  assertIncludes(playSource, 'function checkAction()');
  assertIncludes(playSource, 'shuffleChoices(lesson.choices)');
  assertIncludes(playSource, 'selectedBed === lesson.correctBed');
  assertIncludes(playSource, 'selectedAction === lesson.answer');
  assertIncludes(playSource, 'צריך לבחור אחת משלוש הערוגות');
  assertIncludes(playSource, 'function showHint()');
  assertIncludes(playSource, 'garden-play.html?lesson=');
  assertIncludes(playSource, 'renderGardenBoard()');
  assertIncludes(playSource, 'gardenSavedVegetables');
});

test('garden css and plan support the lesson shell and visual board', () => {
  assertIncludes(gardenCss, '.growth-path');
  assertIncludes(gardenCss, '.growth-step');
  assertIncludes(gardenCss, '.action-card');
  assertIncludes(gardenCss, '.choice-preview');
  assertIncludes(gardenCss, '.garden-board');
  assertIncludes(gardenCss, '.bed-grid');
  assertIncludes(gardenCss, '.mini-bed');
  assertIncludes(gardenCss, '.score-pill');
  assertIncludes(plan, 'בלי קפיצה חדה ברמה');
  assertIncludes(plan, 'שלבים 1–4 מספיקים לשיעור מלא');
  assertIncludes(plan, 'מתאים לילדים שמתקשים אחרי לולאות');
});

let passed = 0;
for (const { name, fn } of tests) {
  try { fn(); passed += 1; console.log(`✓ ${name}`); }
  catch (error) { console.error(`✗ ${name}`); console.error(error.stack || error.message); process.exitCode = 1; break; }
}
if (!process.exitCode) console.log(`\n${passed}/${tests.length} garden course tests passed.`);
