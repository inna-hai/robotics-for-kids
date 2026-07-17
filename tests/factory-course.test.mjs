import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import vm from 'node:vm';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const factoryHtml = readFileSync(join(root, 'factory.html'), 'utf8');
const playHtml = readFileSync(join(root, 'factory-play.html'), 'utf8');
const hubHtml = readFileSync(join(root, 'sisi.html'), 'utf8');
const smartCityHtml = readFileSync(join(root, 'smart-city.html'), 'utf8');
const weatherHtml = readFileSync(join(root, 'weather.html'), 'utf8');
const factoryCss = readFileSync(join(root, 'css', 'factory.css'), 'utf8');
const lessonsSource = readFileSync(join(root, 'js', 'factory-lessons.js'), 'utf8');
const playSource = readFileSync(join(root, 'js', 'factory-play.js'), 'utf8');
const plan = readFileSync(join(root, 'FACTORY_75_MIN_LESSON_PLAN.md'), 'utf8');

const sandbox = { window: {} };
vm.runInNewContext(lessonsSource, sandbox, { filename: 'factory-lessons.js' });
const lessons = sandbox.window.FACTORY_LESSONS;
const actions = sandbox.window.FACTORY_ACTIONS;
const counts = sandbox.window.FACTORY_COUNTS;

const tests = [];
function test(name, fn) { tests.push({ name, fn }); }
function assertIncludes(source, needle, message = `Missing: ${needle}`) { assert.ok(source.includes(needle), message); }

test('factory course is linked as lesson 9 in the Sisi series', () => {
  assertIncludes(smartCityHtml, 'href="factory.html"');
  assertIncludes(smartCityHtml, 'שיעור 9: לולאות');
  assertIncludes(weatherHtml, 'href="factory.html"');
  assertIncludes(hubHtml, 'שיעור 9');
  assertIncludes(hubHtml, 'סיסי במפעל הצעצועים');
});

test('landing page frames a new explicit loop mechanic for grade B', () => {
  assertIncludes(factoryHtml, 'שיעור 9 • לולאות וחזרות • כיתות ב׳ • 75 דקות');
  assertIncludes(factoryHtml, 'חזור X');
  assertIncludes(factoryHtml, 'לולאות');
  assertIncludes(factoryHtml, 'משימות 1–4 לכל הכיתה, 5–12 להרחבה ותרגול');
  assertIncludes(factoryHtml, 'href="factory-play.html?lesson=1"');
  assertIncludes(factoryHtml, 'js/factory-lessons.js');
  assertIncludes(factoryHtml, 'css/factory.css');
});

test('factory data has twelve loop tasks with valid action and count answers', () => {
  assert.equal(lessons.length, 12);
  const actionKeys = Object.keys(actions);
  for (const lesson of lessons) {
    assert.ok(actionKeys.includes(lesson.action), `Lesson ${lesson.id} action must be valid`);
    assert.ok(counts.includes(lesson.count), `Lesson ${lesson.id} count must be selectable`);
    assert.ok(lesson.loopText.includes(`חזור ${lesson.count} פעמים`), `Lesson ${lesson.id} should state loop count`);
    assert.ok(lesson.learningNote.length >= 30, `Lesson ${lesson.id} needs learning note`);
  }
});

test('factory play page exposes action and repeat-count controls instead of previous mechanics', () => {
  assertIncludes(playHtml, 'id="action-options"');
  assertIncludes(playHtml, 'id="count-options"');
  assertIncludes(playHtml, 'id="loop-preview"');
  assertIncludes(playHtml, 'id="factory-line"');
  assertIncludes(playHtml, 'js/factory-play.js');
  assert.ok(!playHtml.includes('sensor-options'), 'Factory lesson should not use sensor choices');
  assert.ok(!playHtml.includes('pixel-board'), 'Factory lesson should not use pixel boards');
});

test('factory engine checks action plus repeat count and gives loop debugging feedback', () => {
  assertIncludes(playSource, 'function runLoop()');
  assertIncludes(playSource, 'selectedAction === lesson.action');
  assertIncludes(playSource, 'selectedCount === lesson.count');
  assertIncludes(playSource, 'הלולאה קצרה מדי');
  assertIncludes(playSource, 'הלולאה חוזרת יותר מדי');
  assertIncludes(playSource, 'function showHint()');
  assertIncludes(playSource, 'factory-play.html?lesson=');
});

test('factory css and plan support a 75-minute loop lesson', () => {
  assertIncludes(factoryCss, '.loop-preview');
  assertIncludes(factoryCss, '.count-card');
  assertIncludes(factoryCss, '.factory-line');
  assertIncludes(factoryCss, '.toy.done');
  assertIncludes(plan, 'שיעור 75 דקות לכיתות ב׳ / גיל 7');
  assertIncludes(plan, 'משימות 1–4 מספיקות לשיעור מלא');
  assertIncludes(plan, 'חזור X פעמים');
});

let passed = 0;
for (const { name, fn } of tests) {
  try { fn(); passed += 1; console.log(`✓ ${name}`); }
  catch (error) { console.error(`✗ ${name}`); console.error(error.stack || error.message); process.exitCode = 1; break; }
}
if (!process.exitCode) console.log(`\n${passed}/${tests.length} factory course tests passed.`);
