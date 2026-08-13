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
function shuffleScoreForLesson(lesson, command, index) {
  const raw = `${lesson.id}|${index}|${command.row}|${command.col}|${command.color}|pixel-cards-v3`;
  return [...raw].reduce((hash, char) => ((hash * 33) ^ char.charCodeAt(0)) >>> 0, 5381);
}
function shuffledTypesForLesson(lesson) {
  const targetKeys = new Set(lesson.target.map(keyOf));
  return [...lesson.target, ...lesson.distractors]
    .map((command, index) => ({ ...command, shuffleScore: shuffleScoreForLesson(lesson, command, index) }))
    .sort((a, b) => a.shuffleScore - b.shuffleScore)
    .map((command) => targetKeys.has(keyOf(command)) ? 'T' : 'D');
}
function hasSimpleAlternatingPattern(types) {
  return types.slice(0, Math.min(types.length, 10)).every((type, index) => type === (index % 2 === 0 ? types[0] : types[1]) && types[0] !== types[1]);
}

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
  assertIncludes(artHtml, 'ציורים 1–4 לכל הכיתה, 5–12 להרחבה ותרגול');
  assertIncludes(artHtml, 'href="art-play.html?lesson=1"');
  assertIncludes(artHtml, 'js/art-lessons.js');
  assertIncludes(artHtml, 'css/art.css');
});

test('art color palette keeps pink and yellow visually distinct', () => {
  assert.equal(colors.pink.hex, '#f9a8d4');
  assert.equal(colors.yellow.hex, '#fde047');
});

test('art data has twelve pixel challenges with valid coordinates and distractors', () => {
  assert.equal(lessons.length, 12);
  const colorKeys = Object.keys(colors);
  for (const lesson of lessons) {
    assert.ok([4, 5].includes(lesson.size), `Lesson ${lesson.id} should use a young-kid-sized grid`);
    assert.ok(lesson.target.length >= 5, `Lesson ${lesson.id} needs enough target pixels`);
    assert.ok(lesson.distractors.length >= 9, `Lesson ${lesson.id} needs enough distractor commands for a real challenge`);
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

test('art challenges include enough unrelated command cards', () => {
  for (const lesson of lessons) {
    const targetKeys = new Set(lesson.target.map(keyOf));
    assert.ok(lesson.distractors.length >= 9, `Lesson ${lesson.id} should include multiple extra distractors`);
    for (const distractor of lesson.distractors) {
      assert.ok(!targetKeys.has(keyOf(distractor)), `Distractor duplicates target in lesson ${lesson.id}`);
    }
  }
});

test('art command cards are shuffled as one mixed deck across all lessons', () => {
  assertIncludes(playSource, 'function shuffleScore(command, index)');
  assertIncludes(playSource, 'pixel-cards-v3');
  assertIncludes(playSource, 'return [...lesson.target, ...lesson.distractors]');
  assertIncludes(playSource, '.sort((a, b) => a.shuffleScore - b.shuffleScore)');
  assertIncludes(playHtml, 'js/art-play.js?v=20260813-shuffled-no-hint-v3');
  assert.ok(!playSource.includes('const targets = sortCommands(lesson.target'), 'cards should not split correct and distractor decks');
  assert.ok(!playSource.includes('if (distractors[index]) mixed.push(distractors[index]);'), 'cards should not use a fixed distractor-target alternation');
  for (const lesson of lessons) {
    const types = shuffledTypesForLesson(lesson);
    assert.ok(!hasSimpleAlternatingPattern(types), `Lesson ${lesson.id} should not start with an easy correct/wrong alternation`);
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

test('art labels explain Hebrew row and column orientation', () => {
  assertIncludes(playHtml, 'שורה היא פס אופקי בלוח');
  assertIncludes(playHtml, 'עמודה היא פס אנכי');
  assertIncludes(playSource, 'function displayColumnFromInternal(col)');
  assertIncludes(playSource, 'lesson.size - col + 1');
  assertIncludes(playSource, 'function displayColumn(command)');
  assertIncludes(playSource, 'שורה ${command.row}, עמודה ${displayColumn(command)}');
  assert.ok(!playSource.includes('(אופקית)'), 'command cards should stay concise after the instruction explains row orientation');
  assert.ok(!playSource.includes('(אנכית)'), 'command cards should stay concise after the instruction explains column orientation');
});

test('art command labels count columns from the visible RTL side', () => {
  const lessonOneYellow = lessons[0].target.find((command) => command.color === 'yellow');
  assert.equal(lessonOneYellow.row, 2);
  assert.equal(lessons[0].size - lessonOneYellow.col + 1, 3, 'lesson 1 yellow center should display as row 2 column 3 in the RTL-visible grid');
  assert.ok(!playSource.includes('עמודה ${command.col}'), 'command labels must not expose internal column numbers');
  assert.ok(!playSource.includes('עמודה ${col}'), 'board aria labels must not expose internal column numbers');
  assertIncludes(playSource, 'עמודה ${displayColumnFromInternal(col)}');
});

test('art engine validates selected commands against target pixels and supports debugging', () => {
  assertIncludes(playSource, 'function checkArtwork()');
  assertIncludes(playSource, 'missing.length === 0 && extra.length === 0');
  assertIncludes(playSource, 'הוראות מיותרות');
  assertIncludes(playSource, 'function resetArtwork()');
  assert.ok(!playHtml.includes('id="hint"'), 'Pixel lesson should not expose a hint button');
  assert.ok(!playSource.includes('function showHint()'), 'Pixel lesson should not include direct hint logic');
  assertIncludes(playSource, 'renderNextStep(true)');
  assertIncludes(playSource, 'art-play.html?lesson=');
});

test('art css and plan support a visual 75-minute pixel lesson', () => {
  assertIncludes(artCss, '.pixel-board');
  assertIncludes(artCss, '.pixel-cell');
  assertIncludes(artCss, '.command-card');
  assertIncludes(artCss, '.command-card.active{background:#fef08a;border-color:#f9a8d4;box-shadow:none;transform:none}');
  assert.ok(!artCss.includes('.command-card.active{background:#fef08a;border-color:#db2777;transform:'), 'Selecting command cards should not shift them out of alignment');
  assert.ok(!artCss.includes('.command-card.active{background:#fef08a;border-color:#f9a8d4;box-shadow:inset'), 'Selecting command cards should not add visual size with inset shadow');
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
