import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import vm from 'node:vm';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const spaceHtml = readFileSync(join(root, 'space.html'), 'utf8');
const playHtml = readFileSync(join(root, 'space-play.html'), 'utf8');
const smartCityHtml = readFileSync(join(root, 'smart-city.html'), 'utf8');
const spaceCss = readFileSync(join(root, 'css', 'space.css'), 'utf8');
const lessonsSource = readFileSync(join(root, 'js', 'space-lessons.js'), 'utf8');
const playSource = readFileSync(join(root, 'js', 'space-play.js'), 'utf8');
const certificateSource = readFileSync(join(root, 'js', 'course-certificate.js'), 'utf8');

const sandbox = { window: {} };
vm.runInNewContext(lessonsSource, sandbox, { filename: 'space-lessons.js' });
const lessons = sandbox.window.SPACE_LESSONS;

const tests = [];
function test(name, fn) { tests.push({ name, fn }); }
function assertIncludes(source, needle, message = `Missing: ${needle}`) { assert.ok(source.includes(needle), message); }
function assertMatches(source, regex, message = `Missing pattern: ${regex}`) { assert.match(source, regex, message); }

test('space course is a separate entry point and does not replace the smart-city course', () => {
  assertIncludes(smartCityHtml, 'href="space.html"');
  assertIncludes(smartCityHtml, 'שיעור 1: סיסי בחלל');
  assertIncludes(smartCityHtml, 'href="index.html?lesson=1"');
  assertIncludes(smartCityHtml, 'סנסי בעיר החכמה');
  assertIncludes(spaceHtml, 'href="smart-city.html"');
});

test('landing page is clearly a space lesson for grade B and frames a 75 minute first lesson', () => {
  assertIncludes(spaceHtml, 'שיעור חלל: סיסי בחלל');
  assertIncludes(spaceHtml, 'שיעור חלל • כיתות ב׳ • 75 דקות');
  assertIncludes(spaceHtml, 'שיעור חלל קליל וצבעוני לכיתות ב׳');
  assertIncludes(spaceHtml, 'מה עושים בשיעור החלל?');
  assertIncludes(spaceHtml, 'משימות שיעור החלל');
  assertIncludes(spaceHtml, '75</b>דק׳ לשיעור ראשון');
  assertIncludes(spaceHtml, 'שיעור ראשון מומלץ: משימות 1–4 במשך 75 דקות');
  assertIncludes(spaceHtml, 'href="space-play.html?lesson=1"');
  assertIncludes(spaceHtml, 'js/space-lessons.js');
  assertIncludes(spaceHtml, 'css/space.css');
});

test('space course has twelve lightweight missions with child-friendly space facts', () => {
  assert.equal(lessons.length, 12);
  for (const lesson of lessons) {
    assert.equal(typeof lesson.id, 'number');
    assert.ok(lesson.title.length >= 4, `Lesson ${lesson.id} needs a title`);
    assert.ok(lesson.mission.length >= 20, `Lesson ${lesson.id} needs a mission story`);
    assert.ok(lesson.spaceFact.length >= 20, `Lesson ${lesson.id} needs a space fact`);
    assert.ok(lesson.commands.length >= 3, `Lesson ${lesson.id} needs a demo command path`);
    assert.ok(lesson.commands.every((cmd) => ['up', 'down', 'right', 'left'].includes(cmd)), `Lesson ${lesson.id} has unsupported command`);
  }
  assert.deepEqual(Array.from(lessons, (lesson) => lesson.id), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
});

test('all mission coordinates fit inside the simple 6 by 5 board', () => {
  const inside = (point) => point.x >= 1 && point.x <= 6 && point.y >= 1 && point.y <= 5;
  for (const lesson of lessons) {
    assert.ok(inside(lesson.start), `Lesson ${lesson.id} start is outside the board`);
    assert.ok(inside(lesson.goal), `Lesson ${lesson.id} goal is outside the board`);
    for (const obstacle of lesson.obstacles) assert.ok(inside(obstacle), `Lesson ${lesson.id} obstacle is outside the board`);
    for (const star of lesson.stars) assert.ok(inside(star), `Lesson ${lesson.id} star is outside the board`);
    for (const item of lesson.requiredItems || []) assert.ok(inside(item.position), `Lesson ${lesson.id} required item is outside the board`);
  }
});

test('demo solutions reach each goal, collect required items, and avoid obstacles', () => {
  const deltas = { up: [0, -1], down: [0, 1], right: [1, 0], left: [-1, 0] };
  for (const lesson of lessons) {
    const obstacles = new Set(lesson.obstacles.map((point) => `${point.x},${point.y}`));
    const required = new Set((lesson.requiredItems || []).map((item) => `${item.position.x},${item.position.y}`));
    const collectedRequired = new Set();
    const pos = { ...lesson.start };
    for (const cmd of lesson.commands) {
      const [dx, dy] = deltas[cmd];
      pos.x += dx;
      pos.y += dy;
      const posKey = `${pos.x},${pos.y}`;
      assert.ok(pos.x >= 1 && pos.x <= 6 && pos.y >= 1 && pos.y <= 5, `Lesson ${lesson.id} demo leaves the board`);
      assert.ok(!obstacles.has(posKey), `Lesson ${lesson.id} demo hits an obstacle at ${pos.x},${pos.y}`);
      if (required.has(posKey)) collectedRequired.add(posKey);
    }
    assert.equal(pos.x, lesson.goal.x, `Lesson ${lesson.id} demo should reach the goal x`);
    assert.equal(pos.y, lesson.goal.y, `Lesson ${lesson.id} demo should reach the goal y`);
    assert.deepEqual(collectedRequired, required, `Lesson ${lesson.id} demo should collect all required items`);
  }
});

test('interactive play page exposes simple controls, run/reset flow, and lesson navigation', () => {
  assertIncludes(playHtml, 'שיעור חלל • סיסי בחלל • משימת תכנות קצרה');
  assertIncludes(playHtml, 'שיעור חלל אינטראקטיבי');
  assertIncludes(playHtml, 'aria-label="מקרא סימנים של משחק החלל"');
  assertIncludes(playHtml, 'aria-label="לוח משחק של שיעור חלל"');
  assertIncludes(playHtml, 'data-cmd="up"');
  assertIncludes(playHtml, 'data-cmd="down"');
  assertIncludes(playHtml, 'data-cmd="right"');
  assertIncludes(playHtml, 'data-cmd="left"');
  assertIncludes(playHtml, 'id="run"');
  assertIncludes(playHtml, 'id="undo"');
  assertIncludes(playHtml, 'id="clear"');
  assertIncludes(playHtml, 'איפוס / ניקוי');
  assertIncludes(playHtml, 'id="demo"');
  assertIncludes(playHtml, 'js/course-certificate.js');
  assertIncludes(playHtml, 'js/space-play.js');
  assertIncludes(playSource, 'function renderGuide()');
  assertIncludes(playSource, 'function runProgram()');
  assertIncludes(playSource, 'SisiCourseCertificate?.show');
  assertIncludes(certificateSource, 'תעודת סיום');
  assertIncludes(playSource, 'פתרון לדוגמה נטען');
  assertIncludes(playSource, 'lessons.map((item)');
  assertIncludes(playSource, 'requiredItems');
});

test('game board uses left-to-right grid direction so right and left buttons move visually correctly', () => {
  assertMatches(spaceCss, /\.grid\{[^}]*direction:ltr/);
  assertIncludes(playSource, "right: [1, 0]");
  assertIncludes(playSource, "left: [-1, 0]");
});

test('responsive styling keeps the course usable on phones', () => {
  assertIncludes(spaceCss, '.space-guide');
  assertIncludes(spaceCss, '.cell.required-item');
  assertIncludes(spaceCss, '@media(max-width:620px)');
  assertMatches(spaceCss, /\.cards,\.stats\{grid-template-columns:1fr\}/);
  assertIncludes(spaceCss, '.actions .btn,.side-actions .btn{width:100%}');
  assertIncludes(spaceCss, 'cursor:pointer');
});

let passed = 0;
for (const { name, fn } of tests) {
  try {
    fn();
    passed += 1;
    console.log(`✓ ${name}`);
  } catch (error) {
    console.error(`✗ ${name}`);
    console.error(error.stack || error.message);
    process.exitCode = 1;
    break;
  }
}

if (!process.exitCode) {
  console.log(`\n${passed}/${tests.length} space course tests passed.`);
}
