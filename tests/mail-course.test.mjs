import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import vm from 'node:vm';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const mailHtml = readFileSync(join(root, 'mail.html'), 'utf8');
const playHtml = readFileSync(join(root, 'mail-play.html'), 'utf8');
const labHtml = readFileSync(join(root, 'mail-lab.html'), 'utf8');
const hubHtml = readFileSync(join(root, 'sisi.html'), 'utf8');
const smartCityHtml = readFileSync(join(root, 'smart-city.html'), 'utf8');
const parkHtml = readFileSync(join(root, 'park.html'), 'utf8');
const mailCss = readFileSync(join(root, 'css', 'mail.css'), 'utf8');
const lessonsSource = readFileSync(join(root, 'js', 'mail-lessons.js'), 'utf8');
const playSource = readFileSync(join(root, 'js', 'mail-play.js'), 'utf8');
const plan = readFileSync(join(root, 'MAIL_75_MIN_LESSON_PLAN.md'), 'utf8');

const sandbox = { window: {} };
vm.runInNewContext(lessonsSource, sandbox, { filename: 'mail-lessons.js' });
const lessons = sandbox.window.MAIL_LESSONS;
const routes = sandbox.window.MAIL_ROUTES;

const tests = [];
function test(name, fn) { tests.push({ name, fn }); }
function assertIncludes(source, needle, message = `Missing: ${needle}`) { assert.ok(source.includes(needle), message); }

test('mail course is linked as lesson 12 in the Sisi series', () => {
  assertIncludes(smartCityHtml, 'href="mail.html"');
  assertIncludes(smartCityHtml, 'שיעור 12: דואר קסום');
  assertIncludes(parkHtml, 'href="mail.html"');
  assertIncludes(hubHtml, 'שיעור 12');
  assertIncludes(hubHtml, 'סיסי בדואר הקסום');
});

test('landing page frames a gentle routing mechanic and includes creator lab', () => {
  assertIncludes(mailHtml, 'שיעור 12 • ניתוב לפי רמזים • כיתות ב׳ • 75 דקות');
  assertIncludes(mailHtml, 'בלי להקפיץ את הרמה');
  assertIncludes(mailHtml, 'דואר 1–4 לכל הכיתה, 5–6 + מעבדה להרחבה');
  assertIncludes(mailHtml, 'href="mail-play.html?lesson=1"');
  assertIncludes(mailHtml, 'href="mail-lab.html"');
  assertIncludes(mailHtml, 'js/mail-lessons.js');
  assertIncludes(mailHtml, 'css/mail.css');
});

test('mail data has six routing tasks with valid route answers', () => {
  assert.equal(lessons.length, 6);
  const routeKeys = Object.keys(routes);
  const expected = ['library', 'garden', 'music', 'lab', 'kitchen', 'park'];
  assert.deepEqual(Array.from(lessons, (lesson) => lesson.route), expected);
  for (const lesson of lessons) {
    assert.ok(routeKeys.includes(lesson.route), `Lesson ${lesson.id} route must be valid`);
    assert.ok(lesson.clue.includes('+'), `Lesson ${lesson.id} should include two clues`);
    assert.ok(lesson.learningNote.length >= 30, `Lesson ${lesson.id} needs learning note`);
  }
});

test('mail play page exposes route selection and final flow to lab', () => {
  assertIncludes(playHtml, 'id="route-options"');
  assertIncludes(playHtml, 'id="route-preview"');
  assertIncludes(playHtml, 'id="clue-chip"');
  assertIncludes(playHtml, 'js/mail-play.js');
  assertIncludes(playSource, "href: 'mail-lab.html'");
  assert.ok(!playHtml.includes('count-options'), 'Mail lesson should not use loop counts');
  assert.ok(!playHtml.includes('setting-options'), 'Mail lesson should not use parameter settings');
});

test('mail engine checks selected route and provides clue-based hint', () => {
  assertIncludes(playSource, 'function checkRoute()');
  assertIncludes(playSource, 'selectedRoute === lesson.route');
  assertIncludes(playSource, 'לרמזים שעל ההודעה');
  assertIncludes(playSource, 'function showHint()');
  assertIncludes(playSource, 'mail-play.html?lesson=');
});

test('mail lab, css and plan support a full 75-minute lesson', () => {
  assertIncludes(labHtml, 'פעילות יצירה • 15–20 דקות');
  assertIncludes(labHtml, 'הודעה');
  assertIncludes(labHtml, 'רמז 1');
  assertIncludes(labHtml, 'יעד');
  assertIncludes(mailCss, '.route-card');
  assertIncludes(mailCss, '.route-preview');
  assertIncludes(mailCss, '.mailbox-row');
  assertIncludes(plan, 'mail-lab.html');
  assertIncludes(plan, 'מספיק חומר ל־75 דקות');
});

let passed = 0;
for (const { name, fn } of tests) {
  try { fn(); passed += 1; console.log(`✓ ${name}`); }
  catch (error) { console.error(`✗ ${name}`); console.error(error.stack || error.message); process.exitCode = 1; break; }
}
if (!process.exitCode) console.log(`\n${passed}/${tests.length} mail course tests passed.`);
