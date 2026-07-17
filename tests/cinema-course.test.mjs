import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import vm from 'node:vm';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const cinemaHtml = readFileSync(join(root, 'cinema.html'), 'utf8');
const playHtml = readFileSync(join(root, 'cinema-play.html'), 'utf8');
const labHtml = readFileSync(join(root, 'cinema-lab.html'), 'utf8');
const hubHtml = readFileSync(join(root, 'sisi.html'), 'utf8');
const smartCityHtml = readFileSync(join(root, 'smart-city.html'), 'utf8');
const mailHtml = readFileSync(join(root, 'mail.html'), 'utf8');
const cinemaCss = readFileSync(join(root, 'css', 'cinema.css'), 'utf8');
const lessonsSource = readFileSync(join(root, 'js', 'cinema-lessons.js'), 'utf8');
const playSource = readFileSync(join(root, 'js', 'cinema-play.js'), 'utf8');
const plan = readFileSync(join(root, 'CINEMA_75_MIN_LESSON_PLAN.md'), 'utf8');

const sandbox = { window: {} };
vm.runInNewContext(lessonsSource, sandbox, { filename: 'cinema-lessons.js' });
const lessons = sandbox.window.CINEMA_LESSONS;

const tests = [];
function test(name, fn) { tests.push({ name, fn }); }
function assertIncludes(source, needle, message = `Missing: ${needle}`) { assert.ok(source.includes(needle), message); }

test('cinema course is linked as lesson 13 in the Sisi series', () => {
  assertIncludes(smartCityHtml, 'href="cinema.html"');
  assertIncludes(smartCityHtml, 'שיעור 13: אולפן סרטים');
  assertIncludes(mailHtml, 'href="cinema.html"');
  assertIncludes(hubHtml, 'שיעור 13');
  assertIncludes(hubHtml, 'סיסי באולפן הסרטים');
});

test('landing page frames a full 75-minute sequence lesson', () => {
  assertIncludes(cinemaHtml, 'שיעור 13 • סדר סצנות וסיבה-תוצאה • כיתות ב׳ • 75 דקות');
  assertIncludes(cinemaHtml, 'לא קופץ חזק ברמה');
  assertIncludes(cinemaHtml, 'אתגר “מה חסר באמצע?”');
  assertIncludes(cinemaHtml, 'משחק במאי בזוגות');
  assertIncludes(cinemaHtml, 'href="cinema-play.html?lesson=1"');
  assertIncludes(cinemaHtml, 'href="cinema-lab.html"');
});

test('cinema data has six three-scene ordering tasks', () => {
  assert.equal(lessons.length, 6);
  for (const lesson of lessons) {
    assert.equal(lesson.correctOrder.length, 3, `Lesson ${lesson.id} should have three ordered scenes`);
    assert.equal(Object.keys(lesson.scenes).length, 3, `Lesson ${lesson.id} should expose exactly three scenes`);
    for (const id of lesson.correctOrder) assert.ok(lesson.scenes[id], `Missing scene ${id}`);
    assert.ok(lesson.learningNote.length >= 30, `Lesson ${lesson.id} needs learning note`);
  }
});

test('cinema play page exposes scene bank, timeline, and lab flow', () => {
  assertIncludes(playHtml, 'id="scene-bank"');
  assertIncludes(playHtml, 'id="timeline"');
  assertIncludes(playHtml, 'js/cinema-play.js');
  assertIncludes(playSource, 'selectedOrder.every');
  assertIncludes(playSource, "href: 'cinema-lab.html'");
  assert.ok(!playHtml.includes('route-options'), 'Cinema lesson should not use mail routing');
  assert.ok(!playHtml.includes('count-options'), 'Cinema lesson should not use loop counts');
});

test('cinema lab and plan ensure the lesson holds 75 minutes', () => {
  assertIncludes(labHtml, 'פעילות יצירה • 15–20 דקות');
  assertIncludes(labHtml, 'שם הסרט');
  assertIncludes(labHtml, 'התחלה');
  assertIncludes(labHtml, 'אמצע');
  assertIncludes(labHtml, 'בדיקת חברים');
  assertIncludes(cinemaCss, '.timeline-slot');
  assertIncludes(cinemaCss, '.scene-card');
  assertIncludes(plan, 'בדיקת 75 דקות');
  assertIncludes(plan, 'מעבדת סרטים');
});

let passed = 0;
for (const { name, fn } of tests) {
  try { fn(); passed += 1; console.log(`✓ ${name}`); }
  catch (error) { console.error(`✗ ${name}`); console.error(error.stack || error.message); process.exitCode = 1; break; }
}
if (!process.exitCode) console.log(`\n${passed}/${tests.length} cinema course tests passed.`);
