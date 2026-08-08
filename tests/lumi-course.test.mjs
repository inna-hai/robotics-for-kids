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
  assert.match(html, /15 תחנות פעילות/);
  assert.match(html, /12 תרגולים בכל תחנה/);
  assert.match(html, /lumi-play\.html\?lesson=1/);
  assert.doesNotMatch(html, /סיסי בחלל/);
});

test('lumi course has fifteen fully playable stations', () => {
  const lessons = loadLessons();
  assert.equal(lessons.length, 15);
  assert.equal(new Set(lessons.map((lesson) => lesson.id)).size, 15);
  assert.ok(lessons.every((lesson) => ['classify', 'pattern', 'condition'].includes(lesson.type)));
  assert.ok(lessons.every((lesson) => lesson.tasks.length === 12));
});

test('lumi course covers logic and programming skills', () => {
  const concepts = loadLessons().map((lesson) => lesson.concept).join(' ');
  for (const phrase of ['מיון', 'דפוסים', 'אם־אז', 'סדר פעולות', 'דאטה', 'לולאות', 'דיבוג', 'תכנון אלגוריתמי', 'קלט־פלט']) {
    assert.ok(concepts.includes(phrase), `missing concept ${phrase}`);
  }
});

test('all lumi tasks are child-friendly and have one valid answer', () => {
  const lessons = loadLessons();
  for (const lesson of lessons) {
    for (const task of lesson.tasks) {
      assert.ok(task.prompt.length > 10, lesson.title);
      assert.ok(task.answer, lesson.title);
      assert.ok(task.options.length >= 3, lesson.title);
      if (lesson.type === 'pattern') {
        assert.ok(task.options.includes(task.answer), lesson.title);
      } else {
        assert.equal(task.options.filter((option) => option.id === task.answer).length, 1, lesson.title);
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

test('lumi play engine supports all fifteen lessons and stores progress separately', () => {
  const js = read('js/lumi-play.js');
  assert.doesNotMatch(js, /id <= 3/);
  assert.match(js, /task\.condition\s*\?/);
  assert.match(js, /רמז:/);
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
