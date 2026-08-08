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
  assert.ok(lessons.every((lesson) => ['classify', 'pattern', 'condition', 'route'].includes(lesson.type)));
  assert.ok(lessons.every((lesson) => lesson.tasks.length === 12));
});

test('lumi course covers logic and programming skills', () => {
  const concepts = loadLessons().map((lesson) => lesson.concept).join(' ');
  for (const phrase of ['מיון', 'דפוסים', 'אם־אז', 'סדר פעולות', 'דאטה', 'לולאות', 'דיבוג', 'תכנון אלגוריתמי', 'קלט־פלט']) {
    assert.ok(concepts.includes(phrase), `missing concept ${phrase}`);
  }
});

test('bird nest lesson is actually about birds, nests, and ordered steps', () => {
  const nest = loadLessons().find((lesson) => lesson.id === 5);
  assert.equal(nest.title, 'קן הציפורים');
  const text = [nest.story, ...nest.tasks.map((task) => `${task.prompt} ${task.hint || ''}`)].join(' ');
  for (const phrase of ['ציפור', 'קן', 'זרדים', 'גוזלים', 'מקום בטוח']) {
    assert.ok(text.includes(phrase), `missing nest phrase ${phrase}`);
  }
  assert.ok(!text.includes('לומדת טבע ואין קפיצה'), 'generic debug text leaked into nest lesson');
});

test('each lumi lesson speaks in a child-story nature language, not generic programming text', () => {
  const genericWords = /אלגוריתם|דיבוג|תכנות|קלט|פלט|דאטה|פעולה|תנאי/g;
  const storyWords = /לומי|יער|ציפור|קן|פרח|פרפר|נחל|טבע|חיה|גוזל|נמלים|פטר|צב|עץ|שמורה|גשם|שמש|רוח|עלים|זרדים|פרי|שביל|זרע|ינשוף|עטלף|גחלילית|קיפוד|נמלה|מים|טיפה|מעבדה|מחברת|גשר/g;
  for (const lesson of loadLessons()) {
    const text = [lesson.title, lesson.story, ...lesson.tasks.map((task) => `${task.prompt} ${task.hint || ''}`)].join(' ');
    const genericCount = (text.match(genericWords) || []).length;
    const storyCount = (text.match(storyWords) || []).length;
    assert.ok(storyCount >= 12, `${lesson.title} is not story-rich enough`);
    assert.ok(storyCount > genericCount * 2, `${lesson.title} is too generic: story=${storyCount}, generic=${genericCount}`);
  }
});

test('all lumi tasks are child-friendly and have one valid answer', () => {
  const lessons = loadLessons();
  for (const lesson of lessons) {
    for (const task of lesson.tasks) {
      assert.ok(task.prompt.length > 10, lesson.title);
      if (lesson.type === 'route') {
        assert.ok(task.goalText.length > 10, lesson.title);
        assert.ok(task.start && task.goal, lesson.title);
        assert.ok(Array.isArray(task.obstacles), lesson.title);
        assert.ok(Array.isArray(task.solution) && task.solution.length >= 2, lesson.title);
        assert.ok(task.solution.every((step) => ['up', 'down', 'left', 'right'].includes(step)), lesson.title);
        continue;
      }
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
  assert.match(js, /function shuffled/);
  assert.equal((js.match(/shuffled\(task\.options\)/g) || []).length, 3);
  assert.match(js, /function renderRoute/);
  assert.match(js, /blockly-panel/);
  assert.match(js, /route-map/);
  assert.match(js, /lumi-nature-progress-v1/);
  assert.match(js, /courseId: 'lumi-nature'/);
  assert.match(js, /lessonId: String\(lesson\.id\)/);
});

test('trail map lesson is an interactive route planning activity', () => {
  const lesson = loadLessons().find((item) => item.id === 9);
  assert.equal(lesson.type, 'route');
  assert.match(lesson.concept, /בלוקים/);
  assert.equal(lesson.tasks.length, 12);
  assert.ok(lesson.tasks.every((task) => task.solution.length >= 2));
});

test('route planning solutions stay on map, avoid obstacles, and reach the goal', () => {
  const directions = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
  const lesson = loadLessons().find((item) => item.id === 9);
  for (const [index, task] of lesson.tasks.entries()) {
    const obstacles = new Set(task.obstacles.map((point) => `${point.x},${point.y}`));
    let position = { ...task.start };
    for (const step of task.solution) {
      position = { x: position.x + directions[step][0], y: position.y + directions[step][1] };
      assert.ok(position.x >= 0 && position.x <= 3 && position.y >= 0 && position.y <= 3, `route ${index + 1} leaves map`);
      assert.ok(!obstacles.has(`${position.x},${position.y}`), `route ${index + 1} hits obstacle`);
    }
    assert.equal(position.x, task.goal.x, `route ${index + 1} misses goal x`);
    assert.equal(position.y, task.goal.y, `route ${index + 1} misses goal y`);
  }
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
