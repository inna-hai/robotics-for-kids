import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const read = (path) => fs.readFileSync(path, 'utf8');
const tests = [];
function test(name, fn) { tests.push({ name, fn }); }
function loadLessons() {
  const context = { window: {} };
  vm.createContext(context);
  vm.runInContext(read('js/lumi-lessons.js'), context);
  return context.window.LUMI_LESSONS;
}

test('lumi hub exists and frames a distinct nature notebook course', () => {
  const html = read('lumi.html');
  assert.match(html, /לומי חוקרת הטבע/);
  assert.match(html, /מחברת מסע/);
  assert.match(html, /כיתה ב׳ ומעלה/);
  assert.match(html, /lumi-play\.html\?lesson=1/);
  assert.doesNotMatch(html, /סיסי בחלל/);
});

test('lumi course has fifteen stations with first three playable', () => {
  const lessons = loadLessons();
  assert.equal(lessons.length, 15);
  assert.deepEqual(Array.from(lessons.slice(0, 3).map((lesson) => lesson.type)), ['classify', 'pattern', 'condition']);
  assert.ok(lessons.slice(3).every((lesson) => lesson.type === 'soon'));
  assert.equal(new Set(lessons.map((lesson) => lesson.id)).size, 15);
});

test('first three lumi lessons have three child-friendly tasks and one answer each', () => {
  const lessons = loadLessons().slice(0, 3);
  for (const lesson of lessons) {
    assert.equal(lesson.tasks.length, 3, lesson.title);
    for (const task of lesson.tasks) {
      assert.ok(task.prompt.length > 10);
      assert.ok(task.answer);
      assert.ok(task.options.length >= 3);
      if (lesson.type === 'pattern') {
        assert.ok(task.options.includes(task.answer));
      } else {
        assert.equal(task.options.filter((option) => option.id === task.answer).length, 1);
      }
    }
  }
});

test('lumi play page loads lesson data and standalone play engine', () => {
  const html = read('lumi-play.html');
  assert.match(html, /js\/lumi-lessons\.js/);
  assert.match(html, /js\/lumi-play\.js/);
  assert.match(html, /מחברת המסע/);
  assert.match(html, /lumi.html/);
});

test('lumi play engine stores separate progress and student-progress course id', () => {
  const js = read('js/lumi-play.js');
  assert.match(js, /lumi-nature-progress-v1/);
  assert.match(js, /courseId: 'lumi-nature'/);
  assert.match(js, /lessonId: String\(lesson\.id\)/);
});

let passed = 0;
for (const { name, fn } of tests) {
  try {
    fn();
    console.log(`✓ ${name}`);
    passed += 1;
  } catch (error) {
    console.error(`✗ ${name}`);
    console.error(error);
    process.exitCode = 1;
    break;
  }
}
if (process.exitCode) process.exit(process.exitCode);
console.log(`\n${passed}/${tests.length} Lumi course tests passed.`);
