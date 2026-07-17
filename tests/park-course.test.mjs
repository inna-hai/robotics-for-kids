import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import vm from 'node:vm';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const parkHtml = readFileSync(join(root, 'park.html'), 'utf8');
const playHtml = readFileSync(join(root, 'park-play.html'), 'utf8');
const hubHtml = readFileSync(join(root, 'sisi.html'), 'utf8');
const smartCityHtml = readFileSync(join(root, 'smart-city.html'), 'utf8');
const gardenHtml = readFileSync(join(root, 'garden.html'), 'utf8');
const parkCss = readFileSync(join(root, 'css', 'park.css'), 'utf8');
const lessonsSource = readFileSync(join(root, 'js', 'park-lessons.js'), 'utf8');
const playSource = readFileSync(join(root, 'js', 'park-play.js'), 'utf8');
const plan = readFileSync(join(root, 'PARK_75_MIN_LESSON_PLAN.md'), 'utf8');

const sandbox = { window: {} };
vm.runInNewContext(lessonsSource, sandbox, { filename: 'park-lessons.js' });
const lessons = sandbox.window.PARK_LESSONS;
const controls = sandbox.window.PARK_CONTROLS;
const settings = sandbox.window.PARK_SETTINGS;

const tests = [];
function test(name, fn) { tests.push({ name, fn }); }
function assertIncludes(source, needle, message = `Missing: ${needle}`) { assert.ok(source.includes(needle), message); }

test('park course is linked as lesson 11 in the Sisi series', () => {
  assertIncludes(smartCityHtml, 'href="park.html"');
  assertIncludes(smartCityHtml, 'שיעור 11: לונה פארק');
  assertIncludes(gardenHtml, 'href="park.html"');
  assertIncludes(hubHtml, 'שיעור 11');
  assertIncludes(hubHtml, 'סיסי בלונה פארק');
});

test('landing page frames a gentle command-with-setting mechanic for grade B', () => {
  assertIncludes(parkHtml, 'שיעור 11 • פקודה עם הגדרה • כיתות ב׳ • 75 דקות');
  assertIncludes(parkHtml, 'פקודה + ערך');
  assertIncludes(parkHtml, 'בחירה אינטואיטיבית');
  assertIncludes(parkHtml, 'מתקנים 1–4 לכל הכיתה, 5–12 להרחבה ותרגול');
  assertIncludes(parkHtml, 'href="park-play.html?lesson=1"');
  assertIncludes(parkHtml, 'js/park-lessons.js');
  assertIncludes(parkHtml, 'css/park.css');
});

test('park data has twelve ride scenarios with valid control and setting answers', () => {
  assert.equal(lessons.length, 12);
  const controlKeys = Object.keys(controls);
  const settingKeys = Object.keys(settings);
  for (const lesson of lessons) {
    assert.ok(controlKeys.includes(lesson.control), `Lesson ${lesson.id} control must be valid`);
    assert.ok(settingKeys.includes(lesson.setting), `Lesson ${lesson.id} setting must be valid`);
    assert.ok(lesson.commandText.includes('הפעל'), `Lesson ${lesson.id} should be phrased as command`);
    assert.ok(lesson.learningNote.length >= 35, `Lesson ${lesson.id} needs learning note`);
  }
});

test('park play page exposes control and setting selection rather than harder mechanics', () => {
  assertIncludes(playHtml, 'id="control-options"');
  assertIncludes(playHtml, 'id="setting-options"');
  assertIncludes(playHtml, 'id="command-preview"');
  assertIncludes(playHtml, 'id="ride-stage"');
  assertIncludes(playHtml, 'js/park-play.js');
  assert.ok(!playHtml.includes('count-options'), 'Park lesson should not use loop counts');
  assert.ok(!playHtml.includes('sensor-options'), 'Park lesson should not use sensors');
});

test('park engine checks selected ride plus setting and gives simple parameter feedback', () => {
  assertIncludes(playSource, 'function runCommand()');
  assertIncludes(playSource, 'selectedControl === lesson.control');
  assertIncludes(playSource, 'selectedSetting === lesson.setting');
  assertIncludes(playSource, 'המתקן נכון, אבל ההגדרה');
  assertIncludes(playSource, 'function showHint()');
  assertIncludes(playSource, 'park-play.html?lesson=');
});

test('park css and plan support a 75-minute parameter lesson', () => {
  assertIncludes(parkCss, '.command-preview');
  assertIncludes(parkCss, '.ride-stage');
  assertIncludes(parkCss, '.ride.low');
  assertIncludes(parkCss, '.ride.high');
  assertIncludes(plan, 'שיעור 75 דקות לכיתות ב׳ / גיל 7');
  assertIncludes(plan, 'מוסיפים רק דבר אחד: הגדרה לפעולה');
  assertIncludes(plan, 'מתקנים 1–4 מספיקים לשיעור מלא');
});

let passed = 0;
for (const { name, fn } of tests) {
  try { fn(); passed += 1; console.log(`✓ ${name}`); }
  catch (error) { console.error(`✗ ${name}`); console.error(error.stack || error.message); process.exitCode = 1; break; }
}
if (!process.exitCode) console.log(`\n${passed}/${tests.length} park course tests passed.`);
