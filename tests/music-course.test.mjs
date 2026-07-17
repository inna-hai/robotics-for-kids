import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import vm from 'node:vm';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const musicHtml = readFileSync(join(root, 'music.html'), 'utf8');
const playHtml = readFileSync(join(root, 'music-play.html'), 'utf8');
const smartCityHtml = readFileSync(join(root, 'smart-city.html'), 'utf8');
const spaceHtml = readFileSync(join(root, 'space.html'), 'utf8');
const musicCss = readFileSync(join(root, 'css', 'music.css'), 'utf8');
const lessonsSource = readFileSync(join(root, 'js', 'music-lessons.js'), 'utf8');
const playSource = readFileSync(join(root, 'js', 'music-play.js'), 'utf8');

const sandbox = { window: {} };
vm.runInNewContext(lessonsSource, sandbox, { filename: 'music-lessons.js' });
const lessons = sandbox.window.MUSIC_LESSONS;
const notes = sandbox.window.MUSIC_NOTES;

const tests = [];
function test(name, fn) { tests.push({ name, fn }); }
function assertIncludes(source, needle, message = `Missing: ${needle}`) { assert.ok(source.includes(needle), message); }
function assertMatches(source, regex, message = `Missing pattern: ${regex}`) { assert.match(source, regex, message); }

test('music lesson is linked as lesson 2 instead of another navigation-board reskin', () => {
  assertIncludes(smartCityHtml, 'href="music.html"');
  assertIncludes(smartCityHtml, 'שיעור 2: מכונת המוזיקה');
  assertIncludes(spaceHtml, 'href="music.html"');
  assertIncludes(spaceHtml, 'שיעור 2: מכונת המוזיקה');
  assertIncludes(musicHtml, 'זה לא עוד שיעור ניווט על לוח');
});

test('landing page frames a new music/pattern mechanic for grade B', () => {
  assertIncludes(musicHtml, 'שיעור 2 • מוזיקה ודפוסים • כיתות ב׳ • 75 דקות');
  assertIncludes(musicHtml, 'סיסי ומכונת המוזיקה');
  assertIncludes(musicHtml, 'דפוסים ותבניות');
  assertIncludes(musicHtml, 'חזרה/לולאה');
  assertIncludes(musicHtml, 'href="music-play.html?lesson=1"');
  assertIncludes(musicHtml, 'js/music-lessons.js');
  assertIncludes(musicHtml, 'css/music.css');
});

test('music lesson data has six pattern challenges with valid notes', () => {
  assert.equal(lessons.length, 6);
  const noteKeys = Object.keys(notes);
  assert.deepEqual(noteKeys.sort(), ['blue', 'green', 'purple', 'red', 'yellow']);
  for (const lesson of lessons) {
    assert.equal(typeof lesson.id, 'number');
    assert.ok(lesson.title.length >= 4, `Lesson ${lesson.id} needs a title`);
    assert.ok(lesson.mission.length >= 20, `Lesson ${lesson.id} needs a mission`);
    assert.ok(lesson.teacherFact.length >= 20, `Lesson ${lesson.id} needs a learning note`);
    assert.ok(lesson.target.length >= 3, `Lesson ${lesson.id} needs a target pattern`);
    assert.ok(lesson.target.every((note) => noteKeys.includes(note)), `Lesson ${lesson.id} has unsupported notes`);
  }
});

test('music play page exposes pattern-building controls instead of grid movement controls', () => {
  assertIncludes(playHtml, 'notes-bank');
  assertIncludes(playHtml, 'pattern-target');
  assertIncludes(playHtml, 'pattern-build');
  assertIncludes(playHtml, 'id="play"');
  assertIncludes(playHtml, 'id="check"');
  assertIncludes(playHtml, 'id="demo"');
  assertIncludes(playHtml, 'js/music-play.js');
  assert.ok(!playHtml.includes('data-cmd="right"'), 'Music lesson should not use board navigation buttons');
  assert.ok(!playHtml.includes('data-cmd="left"'), 'Music lesson should not use board navigation buttons');
});

test('music engine checks order, supports demo pattern, and can play tones', () => {
  assertIncludes(playSource, 'function checkPattern()');
  assertIncludes(playSource, 'build.every((note, index) => note === lesson.target[index])');
  assertIncludes(playSource, 'function playTone(noteKey)');
  assertIncludes(playSource, 'window.AudioContext || window.webkitAudioContext');
  assertIncludes(playSource, 'build = [...lesson.target]');
  assertIncludes(playSource, 'הצליל מספר');
});

test('music css includes dedicated stage, note buttons, and mobile layout', () => {
  assertIncludes(musicCss, '.music-stage');
  assertIncludes(musicCss, '.notes-bank');
  assertIncludes(musicCss, '.pattern-target');
  assertIncludes(musicCss, '.pattern-build');
  assertIncludes(musicCss, '.note-chip.playing');
  assertMatches(musicCss, /@media\(max-width:620px\)\{\.note\{width:calc\(50% - 5px\)\}\}/);
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
  console.log(`\n${passed}/${tests.length} music course tests passed.`);
}
