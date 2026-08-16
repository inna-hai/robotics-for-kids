import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import vm from 'node:vm';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const factoryHtml = readFileSync(join(root, 'factory.html'), 'utf8');
const playHtml = readFileSync(join(root, 'factory-play.html'), 'utf8');
const hubHtml = readFileSync(join(root, 'sisi.html'), 'utf8');
const smartCityHtml = readFileSync(join(root, 'smart-city.html'), 'utf8');
const weatherHtml = readFileSync(join(root, 'weather.html'), 'utf8');
const factoryCss = readFileSync(join(root, 'css', 'factory.css'), 'utf8');
const lessonsSource = readFileSync(join(root, 'js', 'factory-lessons.js'), 'utf8');
const playSource = readFileSync(join(root, 'js', 'factory-play.js'), 'utf8');
const plan = readFileSync(join(root, 'FACTORY_75_MIN_LESSON_PLAN.md'), 'utf8');

const sandbox = { window: {} };
vm.runInNewContext(lessonsSource, sandbox, { filename: 'factory-lessons.js' });
const lessons = sandbox.window.FACTORY_LESSONS;
const actions = sandbox.window.FACTORY_ACTIONS;
const counts = sandbox.window.FACTORY_COUNTS;

const tests = [];
function test(name, fn) { tests.push({ name, fn }); }
function assertIncludes(source, needle, message = `Missing: ${needle}`) { assert.ok(source.includes(needle), message); }

test('factory course is linked as lesson 9 in the Sisi series', () => {
  assertIncludes(smartCityHtml, 'href="factory.html"');
  assertIncludes(smartCityHtml, 'שיעור 9: לולאות');
  assertIncludes(weatherHtml, 'href="factory.html"');
  assertIncludes(hubHtml, 'שיעור 9');
  assertIncludes(hubHtml, 'סיסי במפעל הצעצועים');
});

test('landing page frames a new explicit loop mechanic for grade B', () => {
  assertIncludes(factoryHtml, 'שיעור 9 • לולאות וחזרות • כיתות ב׳ • 75 דקות');
  assertIncludes(factoryHtml, 'חזור X');
  assertIncludes(factoryHtml, 'לולאות');
  assertIncludes(factoryHtml, 'משימות 1–4 לכל הכיתה, 5–12 להרחבה ותרגול');
  assertIncludes(factoryHtml, 'href="factory-play.html?lesson=1"');
  assertIncludes(factoryHtml, 'js/factory-lessons.js');
  assertIncludes(factoryHtml, 'css/factory.css');
});

test('factory data has twelve loop tasks with valid action and count answers', () => {
  assert.equal(lessons.length, 12);
  const actionKeys = Object.keys(actions);
  for (const lesson of lessons) {
    assert.ok(actionKeys.includes(lesson.action), `Lesson ${lesson.id} action must be valid`);
    assert.ok(counts.includes(lesson.count), `Lesson ${lesson.id} count must be selectable`);
    if (lesson.compoundLoop) {
      assert.ok(lesson.loopText.includes('פעולה'), `Lesson ${lesson.id} should state compound action task`);
      assert.ok(counts.includes(lesson.compoundLoop.count), `Lesson ${lesson.id} compound count must be selectable`);
      for (const action of lesson.compoundLoop.actions) assert.ok(actionKeys.includes(action), `Lesson ${lesson.id} compound action must be valid`);
    } else if (lesson.multiLoops) {
      assert.ok(lesson.loopText.includes('שתי לולאות'), `Lesson ${lesson.id} should state multi-loop task`);
      for (const loop of lesson.multiLoops) {
        assert.ok(actionKeys.includes(loop.action), `Lesson ${lesson.id} multi loop action must be valid`);
        assert.ok(counts.includes(loop.count), `Lesson ${lesson.id} multi loop count must be selectable`);
      }
    } else {
      assert.ok(lesson.loopText.includes(`חזור ${lesson.count} פעמים`), `Lesson ${lesson.id} should state loop count`);
    }
    assert.ok(lesson.learningNote.length >= 30, `Lesson ${lesson.id} needs learning note`);
  }
  const lesson4 = lessons.find((item) => item.id === 4);
  assert.equal(lesson4.compoundLoop.count, 4);
  assert.deepEqual(Array.from(lesson4.compoundLoop.actions), ['wrap', 'ribbon']);
  assertIncludes(lesson4.story, 'כל מתנה צריך לעטוף ולקשור בסרט');
  assert.ok(!lesson4.story.includes('קודם') && !lesson4.story.includes('ואז'), 'Lesson 4 should not reveal operation order in story');
  const lesson5 = lessons.find((item) => item.id === 5);
  assertIncludes(lesson5.story, 'שלושה צעצועים מוכנים למשלוח');
  assert.ok(!lesson5.story.includes('לכן'), 'Lesson 5 should not explain why one loop is enough');
  const compoundLessons = lessons.filter((lesson) => lesson.id >= 4 && lesson.compoundLoop);
  const splitLoopLessons = lessons.filter((lesson) => lesson.id >= 4 && lesson.multiLoops);
  assert.ok(compoundLessons.length >= 5, 'Same-count challenges should use one loop with several ordered actions');
  assert.ok(splitLoopLessons.length >= 2, 'Different-count challenges should still use separate loops');
  const finalLesson = lessons.find((item) => item.id === 12);
  assert.ok(finalLesson.compoundLoop.actions.length >= 3, 'Final factory challenge should support more than two actions in one loop');
});

test('factory play page exposes action and repeat-count controls instead of previous mechanics', () => {
  assertIncludes(playHtml, 'id="action-options"');
  assertIncludes(playHtml, 'id="count-options"');
  assertIncludes(playHtml, 'id="loop-preview"');
  assertIncludes(playHtml, 'id="factory-line"');
  assert.ok(!playHtml.includes('goal-chip'), 'Factory lesson should not show a ready-made goal chip');
  assert.ok(!playSource.includes("getElementById('goal-chip')"), 'Factory engine should not fill a revealing goal chip');
  assertIncludes(playHtml, 'id="challenge-panel"');
  assertIncludes(playHtml, 'הבעיה דורשת כמה פעולות');
  assert.ok(!playHtml.includes('do-steps'), 'Factory lesson should not show step sentence rectangles');
  assertIncludes(playHtml, 'בנו שתי לולאות כמו בציור');
  assertIncludes(playHtml, 'id="count-panel"');
  assert.ok(!playHtml.includes('challenge-summary'), 'Factory lesson should not show extra target rectangles');
  assertIncludes(playHtml, 'js/factory-play.js');
  assert.ok(!playHtml.includes('sensor-options'), 'Factory lesson should not use sensor choices');
  assert.ok(!playHtml.includes('pixel-board'), 'Factory lesson should not use pixel boards');
});

test('factory engine checks action plus repeat count and gives loop debugging feedback', () => {
  assertIncludes(playSource, 'function runLoop()');
  assertIncludes(playSource, 'loop.action === target.action');
  assertIncludes(playSource, 'loop.count === target.count');
  assertIncludes(playSource, 'חסרות חזרות');
  assertIncludes(playSource, 'יותר מדי חזרות');
  assertIncludes(playSource, 'const compoundLoop = lesson.compoundLoop');
  assertIncludes(playSource, 'const loopTargets = compoundLoop ? [] : (lesson.multiLoops');
  assertIncludes(playSource, 'loopTargets.length > 1');
  assertIncludes(playSource, 'selectedLoops');
  assertIncludes(playSource, 'compound-loop-stack');
  assertIncludes(playSource, 'compound-action-slot');
  assertIncludes(playSource, 'בחרו את הפעולות ואת מספר הפעמים');
  assert.ok(!playSource.includes('קודם בוחרים'), 'Compound UI should not tell the order');
  assert.ok(!playSource.includes('אחר כך בוחרים'), 'Compound UI should not tell the order');
  assertIncludes(playSource, 'data-compound-action');
  assertIncludes(playSource, 'clean-loop-stack');
  assertIncludes(playSource, 'clean-loop-card');
  assertIncludes(playSource, 'clean-actions-part');
  assertIncludes(playSource, 'clean-count-part');
  assertIncludes(playSource, 'loopOk(loop, target)');
  assertIncludes(playSource, 'runningAnimation');
  assertIncludes(playSource, 'animate-in');
  assertIncludes(playSource, 'function showHint()');
  assertIncludes(playSource, 'factory-play.html?lesson=');
});

test('factory css and plan support a 75-minute loop lesson', () => {
  assertIncludes(factoryCss, '.loop-preview');
  assertIncludes(factoryCss, '.program-loops');
  assertIncludes(factoryCss, '.program-panel');
  assertIncludes(factoryCss, '.two-loop-grid');
  assertIncludes(factoryCss, '.visible-loop-card');
  assertIncludes(factoryCss, '.compound-loop-stack');
  assertIncludes(factoryCss, '.program-loops:has(.compound-loop-stack)');
  assertIncludes(factoryCss, '.compound-action-slot');
  assertIncludes(factoryCss, '.count-card');
  assertIncludes(factoryCss, '.factory-line');
  assertIncludes(factoryCss, '.toy.done');
  assertIncludes(factoryCss, '@keyframes factoryPop');
  assertIncludes(factoryCss, '.toy.animate-in');
  assertIncludes(factoryCss, '.buggy-loop');
  assertIncludes(factoryCss, '.task-guide');
  assertIncludes(plan, 'שיעור 75 דקות לכיתות ב׳ / גיל 7');
  assertIncludes(plan, 'משימות 1–4 מספיקות לשיעור מלא');
  assertIncludes(plan, 'חזור X פעמים');
});

let passed = 0;
for (const { name, fn } of tests) {
  try { fn(); passed += 1; console.log(`✓ ${name}`); }
  catch (error) { console.error(`✗ ${name}`); console.error(error.stack || error.message); process.exitCode = 1; break; }
}
if (!process.exitCode) console.log(`\n${passed}/${tests.length} factory course tests passed.`);
