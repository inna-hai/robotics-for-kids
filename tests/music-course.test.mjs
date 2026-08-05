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
  assertIncludes(musicHtml, 'href="ocean.html"');
  assertIncludes(musicHtml, 'שיעור 3: אוקיינוס');
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

test('music lesson data has twelve pattern challenges with valid notes', () => {
  assert.equal(lessons.length, 12);
  const noteKeys = Object.keys(notes);
  assert.deepEqual(noteKeys.sort(), ['blue', 'green', 'purple', 'red', 'yellow']);
  assert.ok(lessons.find((lesson) => lesson.id === 6).target.length >= 8, 'Lesson 6 should be a harder debugging challenge');
  const debugLesson = lessons.find((lesson) => lesson.id === 6);
  assertIncludes(debugLesson.title, 'לא מתאים');
  assertIncludes(debugLesson.mission, 'מתכונת');
  assert.ok(Array.isArray(debugLesson.displayTarget), 'Lesson 6 should show a buggy sequence to debug');
  assert.notDeepEqual(debugLesson.displayTarget, debugLesson.target, 'Lesson 6 visible sequence should include one wrong note');
  const completionLesson = lessons.find((lesson) => lesson.id === 8);
  assertIncludes(completionLesson.mission, 'המשיכו את הרצף');
  assert.ok(Array.isArray(completionLesson.displayTarget), 'Lesson 8 should show only the start of the sequence');
  assert.ok(completionLesson.displayTarget.length < completionLesson.target.length, 'Lesson 8 should require children to continue the sequence');
  const conditionLesson = lessons.find((lesson) => lesson.id === 9);
  assertIncludes(conditionLesson.mission, 'שני צלילים נמוכים');
  assertIncludes(conditionLesson.thinkingTask.options.find((option) => option.good).text, 'שני צלילים נמוכים');
  const twoBugLesson = lessons.find((lesson) => lesson.id === 10);
  assertIncludes(twoBugLesson.mission, 'מתכונת של 3 צלילים');
  assert.ok(!twoBugLesson.mission.includes('שני הצלילים האחרונים'), 'Lesson 10 instructions should not reveal where the mistakes are');
  assert.ok(Array.isArray(twoBugLesson.displayTarget), 'Lesson 10 should show a buggy sequence to debug');
  assert.equal(twoBugLesson.target.length, 9, 'Lesson 10 should use a 9-note sequence');
  assert.equal(twoBugLesson.displayTarget.length, 9, 'Lesson 10 visible sequence should also be 9 notes');
  assert.deepEqual(twoBugLesson.target.slice(0, 7), twoBugLesson.displayTarget.slice(0, 7), 'Lesson 10 should keep only the last two notes wrong');
  assert.notEqual(twoBugLesson.displayTarget[7], twoBugLesson.target[7], 'Lesson 10 note 8 should be wrong');
  assert.notEqual(twoBugLesson.displayTarget[8], twoBugLesson.target[8], 'Lesson 10 note 9 should be wrong');
  assertIncludes(twoBugLesson.thinkingTask.options.find((option) => option.good).text, 'בדקנו מה לא מתאים');
  const loopLesson = lessons.find((lesson) => lesson.id === 11);
  assertIncludes(loopLesson.mission, 'חוזר 3 פעמים');
  assert.equal(loopLesson.target.length, 7, 'Lesson 11 should expand the loop into seven notes');
  assert.deepEqual(Array.from(loopLesson.loopInstruction.pattern), ['blue', 'purple'], 'Lesson 11 should show the repeated pair as an instruction');
  assert.equal(loopLesson.loopInstruction.repeat, 3, 'Lesson 11 should ask for three repeats');
  assert.deepEqual(Array.from(loopLesson.loopInstruction.ending), ['green'], 'Lesson 11 should show the ending note separately');
  const concertLesson = lessons.find((lesson) => lesson.id === 12);
  assertIncludes(concertLesson.mission, 'תוכנית לקונצרט');
  assert.equal(concertLesson.target.length, 7, 'Lesson 12 should expand the concert plan into seven notes');
  assert.deepEqual(Array.from(concertLesson.concertInstruction.opening), ['red'], 'Lesson 12 should show an opening note');
  assert.equal(concertLesson.concertInstruction.repeat, 2, 'Lesson 12 should ask for two repeats');
  assert.deepEqual(Array.from(concertLesson.concertInstruction.pattern), ['blue', 'yellow'], 'Lesson 12 should show the repeated concert part');
  assert.deepEqual(Array.from(concertLesson.concertInstruction.ending), ['green', 'purple'], 'Lesson 12 should show the ending notes');
  for (const lesson of lessons) {
    assert.equal(typeof lesson.id, 'number');
    assert.ok(lesson.title.length >= 4, `Lesson ${lesson.id} needs a title`);
    assert.ok(lesson.mission.length >= 20, `Lesson ${lesson.id} needs a mission`);
    assert.ok(lesson.teacherFact.length >= 20, `Lesson ${lesson.id} needs a learning note`);
    assert.ok(lesson.target.length >= 3, `Lesson ${lesson.id} needs a target pattern`);
    assert.ok(lesson.target.every((note) => noteKeys.includes(note)), `Lesson ${lesson.id} has unsupported notes`);
    assert.ok(lesson.thinkingTask.question.length >= 10, `Lesson ${lesson.id} needs a thinking question`);
    assert.equal(lesson.thinkingTask.options.length, 3, `Lesson ${lesson.id} needs three thinking options`);
    assert.equal(lesson.thinkingTask.options.filter((option) => option.good).length, 1, `Lesson ${lesson.id} needs one correct thinking option`);
    assert.ok(lesson.thinkingTask.success.length >= 20, `Lesson ${lesson.id} needs success feedback`);
  }
});

test('music lesson 1 explains notes before asking about rising notes', () => {
  const lesson = lessons.find((item) => item.id === 1);
  assert.equal(lesson.thinkingTask.question, 'מה קורה ברצף הזה?');
  assert.equal(lesson.thinkingTask.options[0].text, 'הצלילים עולים אחד־אחד: דו → רה → מי');
  assert.equal(lesson.thinkingTask.options[2].text, 'הדפוס חוזר אחורה');
  assert.ok(lesson.teacherFact.includes('תווים הם סימנים ושמות'), 'Lesson 1 should explain what notes are before using do-re-mi');
  assert.ok(lesson.teacherFact.includes('עולים מדרגה'), 'Lesson 1 should explain rising notes before asking about them');
  assert.ok(lesson.teacherFact.includes('כמו בקוד, גם במוזיקה הסדר חשוב'), 'Lesson 1 should keep the approved order wording');
  assert.ok(!lessonsSource.includes('מה קורה בדפוס הזה?'));
});

test('music play page exposes pattern-building controls instead of grid movement controls', () => {
  assertIncludes(playHtml, 'notes-bank');
  assertIncludes(playHtml, 'pattern-target');
  assertIncludes(playHtml, 'pattern-build');
  assertIncludes(playHtml, 'thinking-box');
  assertIncludes(playHtml, 'thinking-options');
  assertIncludes(playHtml, 'id="play"');
  assertIncludes(playHtml, 'id="check"');
  assertIncludes(playHtml, 'id="demo"');
  assertIncludes(playHtml, 'js/music-play.js');
  assert.ok(!playHtml.includes('data-cmd="right"'), 'Music lesson should not use board navigation buttons');
  assert.ok(!playHtml.includes('data-cmd="left"'), 'Music lesson should not use board navigation buttons');
});

test('music engine checks order, supports a first-note demo hint, and can play tones', () => {
  assertIncludes(playSource, 'function checkPattern()');
  assertIncludes(playSource, 'build.every((note, index) => note === lesson.target[index])');
  assertIncludes(playSource, 'function playTone(noteKey)');
  assertIncludes(playSource, 'function renderThinkingTask()');
  assertIncludes(playSource, 'function shuffleOptions(options)');
  assertIncludes(playSource, 'function triggerStageLight(noteKey, keepActive = false)');
  assertIncludes(playSource, 'function playLightShow()');
  assertIncludes(playSource, 'loopInstruction');
  assertIncludes(playSource, 'concertInstruction');
  assertIncludes(playSource, 'חזרו ${loop.repeat} פעמים');
  assertIncludes(playSource, 'פתיחה:');
  assertIncludes(playSource, 'מופע האורות:');
  assertIncludes(playSource, 'lesson.id !== 5');
  assertIncludes(playSource, 'const shuffledThinkingOptions = shuffleOptions');
  assertIncludes(playSource, 'shuffledThinkingOptions.map');
  assertIncludes(playSource, 'function thinkingAnswerOk()');
  assertIncludes(playSource, 'אתגר החשיבה');
  assertIncludes(playSource, 'debug-hint');
  assertIncludes(playSource, 'window.AudioContext || window.webkitAudioContext');
  assertIncludes(playSource, 'build = lesson.target.length ? [lesson.target[0]] : []');
  assertIncludes(playSource, 'דוגמה קטנה נטענה');
  assert.ok(!playSource.includes('build = [...lesson.target]'), 'Demo should not reveal the full answer');
  assertIncludes(playSource, 'הצליל מספר');
});

test('music css includes dedicated stage, note buttons, and mobile layout', () => {
  assertIncludes(musicCss, '.music-stage');
  assertIncludes(musicCss, '.notes-bank');
  assertIncludes(musicCss, '.pattern-target');
  assertIncludes(musicCss, '.pattern-build');
  assertIncludes(musicCss, '.note-chip.playing');
  assertIncludes(musicCss, '.thinking-box');
  assertIncludes(musicCss, '.thinking-option.active');
  assertIncludes(musicCss, '.stage-light');
  assertIncludes(musicCss, '.loop-instruction');
  assertIncludes(musicCss, '.concert-instruction');
  assertIncludes(musicCss, '.stage-light.active');
  assertMatches(musicCss, /@media\(max-width:620px\)\{\.note\{width:calc\(50% - 5px\)\}\.thinking-options\{grid-template-columns:1fr\}\}/);
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
