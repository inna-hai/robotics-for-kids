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

test('landing page frames a programming-oriented robot algorithm lesson', () => {
  assertIncludes(cinemaHtml, 'שיעור 13 • אלגוריתמים מצולמים • כיתות ב׳ • 75 דקות');
  assertIncludes(cinemaHtml, 'רצף פקודות');
  assertIncludes(cinemaHtml, 'פקודה מיותרת');
  assertIncludes(cinemaHtml, 'זה לא רק סיפור');
  assertIncludes(cinemaHtml, 'אתגר “איזו פקודה מיותרת?”');
  assertIncludes(cinemaHtml, 'href="cinema-play.html?lesson=1"');
  assertIncludes(cinemaHtml, 'href="cinema-lab.html"');
});

test('cinema data has six robot algorithm tasks with three correct commands plus distractor', () => {
  assert.equal(lessons.length, 6);
  for (const lesson of lessons) {
    assert.equal(lesson.correctOrder.length, 3, `Lesson ${lesson.id} should have three ordered commands`);
    assert.equal(Object.keys(lesson.commands).length, 4, `Lesson ${lesson.id} should expose four command choices`);
    assert.ok(lesson.distractor, `Lesson ${lesson.id} needs distractor command`);
    assert.ok(lesson.commands[lesson.distractor], `Lesson ${lesson.id} distractor must exist`);
    for (const id of lesson.correctOrder) assert.ok(lesson.commands[id], `Missing command ${id}`);
    assert.ok(lesson.goal.includes('המטרה'), `Lesson ${lesson.id} needs explicit goal`);
  }
});

test('cinema play page builds command algorithm, removes distractor, and asks for reason', () => {
  assertIncludes(playHtml, 'id="scene-bank"');
  assertIncludes(playHtml, 'id="timeline"');
  assertIncludes(playHtml, 'id="goal"');
  assertIncludes(playHtml, 'id="reason-options"');
  assertIncludes(playSource, 'selectedOrder.every');
  assertIncludes(playSource, 'lesson.distractor');
  assertIncludes(playSource, 'פקודה מיותרת');
  assertIncludes(playSource, 'selectedReason');
  assertIncludes(playSource, "href: 'cinema-lab.html'");
});

test('cinema lab and plan ensure a full 75-minute programming lesson', () => {
  assertIncludes(labHtml, 'פעילות יצירה • 15–20 דקות');
  assertIncludes(labHtml, 'מטרת הרובוט');
  assertIncludes(labHtml, 'פקודה מיותרת');
  assertIncludes(labHtml, 'בדיקת חברים');
  assertIncludes(cinemaCss, '.timeline-slot');
  assertIncludes(cinemaCss, '.reason-card');
  assertIncludes(cinemaCss, '.goal-chip');
  assertIncludes(plan, 'בדיקת 75 דקות');
  assertIncludes(plan, 'מקדם ישירות לכיוון תכנות');
});

let passed = 0;
for (const { name, fn } of tests) {
  try { fn(); passed += 1; console.log(`✓ ${name}`); }
  catch (error) { console.error(`✗ ${name}`); console.error(error.stack || error.message); process.exitCode = 1; break; }
}
if (!process.exitCode) console.log(`\n${passed}/${tests.length} cinema course tests passed.`);
