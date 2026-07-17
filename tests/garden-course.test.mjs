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

test('landing page frames an interesting but gentle sequence mechanic for grade B', () => {
  assertIncludes(gardenHtml, 'שיעור 10 • רצף ושלבי גדילה • כיתות ב׳ • 75 דקות');
  assertIncludes(gardenHtml, 'בלי קפיצה חדה');
  assertIncludes(gardenHtml, 'רצף');
  assertIncludes(gardenHtml, 'שלבים 1–4 לכל הכיתה, 5–6 להרחבה');
  assertIncludes(gardenHtml, 'href="garden-play.html?lesson=1"');
  assertIncludes(gardenHtml, 'js/garden-lessons.js');
  assertIncludes(gardenHtml, 'css/garden.css');
});

test('garden data has six growth stages with valid one-action answers', () => {
  assert.equal(lessons.length, 6);
  const actionKeys = Object.keys(actions);
  const expected = ['soil', 'seed', 'water', 'sun', 'support', 'harvest'];
  assert.deepEqual(Array.from(lessons, (lesson) => lesson.answer), expected);
  for (const lesson of lessons) {
    assert.ok(actionKeys.includes(lesson.answer), `Lesson ${lesson.id} answer must be valid`);
    assert.ok(lesson.plantStage.length >= 20, `Lesson ${lesson.id} needs plant stage`);
    assert.ok(lesson.learningNote.length >= 35, `Lesson ${lesson.id} needs learning note`);
  }
});

test('garden play page exposes stage and action choice rather than harder mechanics', () => {
  assertIncludes(playHtml, 'id="action-options"');
  assertIncludes(playHtml, 'id="choice-preview"');
  assertIncludes(playHtml, 'id="growth-path"');
  assertIncludes(playHtml, 'id="stage"');
  assertIncludes(playHtml, 'js/garden-play.js');
  assert.ok(!playHtml.includes('count-options'), 'Garden lesson should not use repeat counts');
  assert.ok(!playHtml.includes('sensor-options'), 'Garden lesson should not use sensor/action pairing');
});

test('garden engine checks one appropriate action and keeps feedback simple', () => {
  assertIncludes(playSource, 'function checkAction()');
  assertIncludes(playSource, 'selectedAction === lesson.answer');
  assertIncludes(playSource, 'הפעולה לא מתאימה לשלב הנוכחי');
  assertIncludes(playSource, 'function showHint()');
  assertIncludes(playSource, 'garden-play.html?lesson=');
  assertIncludes(playSource, 'renderGrowthPath()');
});

test('garden css and plan support a gentle 75-minute growth lesson', () => {
  assertIncludes(gardenCss, '.growth-path');
  assertIncludes(gardenCss, '.growth-step');
  assertIncludes(gardenCss, '.action-card');
  assertIncludes(gardenCss, '.choice-preview');
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
