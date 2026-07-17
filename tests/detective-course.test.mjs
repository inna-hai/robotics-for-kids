import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import vm from 'node:vm';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const detectiveHtml = readFileSync(join(root, 'detective.html'), 'utf8');
const playHtml = readFileSync(join(root, 'detective-play.html'), 'utf8');
const smartCityHtml = readFileSync(join(root, 'smart-city.html'), 'utf8');
const oceanHtml = readFileSync(join(root, 'ocean.html'), 'utf8');
const detectiveCss = readFileSync(join(root, 'css', 'detective.css'), 'utf8');
const lessonsSource = readFileSync(join(root, 'js', 'detective-lessons.js'), 'utf8');
const playSource = readFileSync(join(root, 'js', 'detective-play.js'), 'utf8');

const sandbox = { window: {} };
vm.runInNewContext(lessonsSource, sandbox, { filename: 'detective-lessons.js' });
const lessons = sandbox.window.DETECTIVE_LESSONS;

const tests = [];
function test(name, fn) { tests.push({ name, fn }); }
function assertIncludes(source, needle, message = `Missing: ${needle}`) { assert.ok(source.includes(needle), message); }
function assertMatches(source, regex, message = `Missing pattern: ${regex}`) { assert.match(source, regex, message); }

test('detective course is linked as lesson 4 in the series', () => {
  assertIncludes(smartCityHtml, 'href="detective.html"');
  assertIncludes(smartCityHtml, 'שיעור 4: סיסי הבלשית');
  assertIncludes(oceanHtml, 'href="detective.html"');
  assertIncludes(oceanHtml, 'שיעור 4: בלשות');
});

test('landing page frames a new if-then detective mechanic for grade B', () => {
  assertIncludes(detectiveHtml, 'שיעור 4 • בלשות ותנאים • כיתות ב׳ • 75 דקות');
  assertIncludes(detectiveHtml, 'סיסי הבלשית');
  assertIncludes(detectiveHtml, 'אם… אז…');
  assertIncludes(detectiveHtml, 'תנאי פשוט');
  assertIncludes(detectiveHtml, 'href="detective-play.html?lesson=1"');
  assertIncludes(detectiveHtml, 'js/detective-lessons.js');
  assertIncludes(detectiveHtml, 'css/detective.css');
});

test('detective lesson data has six cases with exactly one good clue and one good rule', () => {
  assert.equal(lessons.length, 6);
  for (const lesson of lessons) {
    assert.equal(typeof lesson.id, 'number');
    assert.ok(lesson.title.length >= 4, `Case ${lesson.id} needs a title`);
    assert.ok(lesson.mission.length >= 20, `Case ${lesson.id} needs a mission`);
    assert.ok(lesson.learningNote.length >= 20, `Case ${lesson.id} needs a learning note`);
    assert.equal(lesson.clues.filter((clue) => clue.good).length, 1, `Case ${lesson.id} needs one good clue`);
    assert.equal(lesson.rules.filter((rule) => rule.good).length, 1, `Case ${lesson.id} needs one good rule`);
    assert.ok(lesson.suspects.length >= 3, `Case ${lesson.id} needs suspects/options`);
  }
});

test('detective play page exposes clue/rule selection rather than navigation or music controls', () => {
  assertIncludes(playHtml, 'id="clues"');
  assertIncludes(playHtml, 'id="rules"');
  assertIncludes(playHtml, 'id="check"');
  assertIncludes(playHtml, 'id="hint"');
  assertIncludes(playHtml, 'js/detective-play.js');
  assert.ok(!playHtml.includes('data-cmd="right"'), 'Detective lesson should not use board movement commands');
  assert.ok(!playHtml.includes('notes-bank'), 'Detective lesson should not use music note bank');
});

test('detective engine checks both clue and if-then rule and gives targeted feedback', () => {
  assertIncludes(playSource, 'function rotateOptions(items, offset)');
  assertIncludes(playSource, 'function checkCase()');
  assertIncludes(playSource, 'clue.good && rule.good');
  assertIncludes(playSource, 'הכלל טוב, אבל הרמז');
  assertIncludes(playSource, 'הרמז טוב, אבל כלל');
  assertIncludes(playSource, 'function showHint()');
  assertIncludes(playSource, 'renderSuspects(true)');
});

test('detective css includes dedicated case board and responsive layout', () => {
  assertIncludes(detectiveCss, '.detective-stage');
  assertIncludes(detectiveCss, '.case-board');
  assertIncludes(detectiveCss, '.clue.active');
  assertIncludes(detectiveCss, '.rule.active');
  assertIncludes(detectiveCss, '.suspect.found');
  assertMatches(detectiveCss, /@media\(max-width:760px\)\{\.case-board\{grid-template-columns:1fr\}\}/);
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
  console.log(`\n${passed}/${tests.length} detective course tests passed.`);
}
