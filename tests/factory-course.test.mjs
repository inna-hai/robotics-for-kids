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
      assert.ok(lesson.loopText.includes('לולאות'), `Lesson ${lesson.id} should state multi-loop task`);
      for (const loop of lesson.multiLoops) {
        assert.ok(actionKeys.includes(loop.action), `Lesson ${lesson.id} multi loop action must be valid`);
        assert.ok(counts.includes(loop.count), `Lesson ${lesson.id} multi loop count must be selectable`);
      }
    } else {
      assert.ok(lesson.loopText.includes(`חזור ${lesson.count} פעמים`), `Lesson ${lesson.id} should state loop count`);
    }
    assert.ok(lesson.learningNote.length >= 30, `Lesson ${lesson.id} needs learning note`);
  }
  const lesson3 = lessons.find((item) => item.id === 3);
  assertIncludes(lesson3.story, 'שלושה דובי צעצוע זהים');
  assert.ok(!lesson3.story.includes('חולצה') && !lesson3.story.includes('אוזן') && !lesson3.story.includes('כיס'), 'Lesson 3 should model repeated work on similar items, not different positions on one toy');
  assertIncludes(actions.paint.label, 'צעצוע');
  const lesson4 = lessons.find((item) => item.id === 4);
  assert.equal(lesson4.compoundLoop.count, 4);
  assert.deepEqual(Array.from(lesson4.compoundLoop.actions), ['wrap', 'ribbon']);
  assertIncludes(lesson4.story, 'כל מתנה צריך לעטוף ולקשור בסרט');
  assert.ok(!lesson4.story.includes('קודם') && !lesson4.story.includes('ואז'), 'Lesson 4 should not reveal operation order in story');
  const lesson10 = lessons.find((item) => item.id === 10);
  assertIncludes(lesson10.story, 'חמישה חלונות תצוגה');
  assert.deepEqual(Array.from(lesson10.compoundLoop.actions), ['window', 'star']);
  assert.notEqual(lesson10.compoundLoop.count, lesson4.compoundLoop.count, 'Lesson 10 should not duplicate lesson 4 count');
  assert.notDeepEqual(Array.from(lesson10.compoundLoop.actions), Array.from(lesson4.compoundLoop.actions), 'Lesson 10 should not duplicate lesson 4 actions');
  const lesson5 = lessons.find((item) => item.id === 5);
  assertIncludes(lesson5.story, 'שלושה צעצועים מוכנים למשלוח');
  assert.ok(!lesson5.story.includes('לכן'), 'Lesson 5 should not explain why one loop is enough');
  const lesson7 = lessons.find((item) => item.id === 7);
  assertIncludes(lesson7.story, '5 קוביות');
  const compoundLessons = lessons.filter((lesson) => lesson.id >= 4 && lesson.compoundLoop);
  const splitLoopLessons = lessons.filter((lesson) => lesson.id >= 4 && lesson.multiLoops);
  assert.ok(compoundLessons.length >= 5, 'Same-count challenges should use one loop with several ordered actions');
  assert.ok(splitLoopLessons.length >= 2, 'Different-count challenges should still use separate loops');
  const finalLesson = lessons.find((item) => item.id === 12);
  assertIncludes(finalLesson.story, 'צובעים ארבעה צעצועים');
  assertIncludes(finalLesson.story, 'כוכב על שישה שלטי דוכן');
  assertIncludes(finalLesson.story, 'אורזים שתי קופסאות פרסים');
  assertIncludes(finalLesson.multiLoops[1].target, '6 שלטי דוכן');
  assert.deepEqual(Array.from(finalLesson.multiLoops.map((loop) => loop.targetLabel)), ['צעצועים', 'שלטי דוכן', 'קופסאות פרסים']);
  assert.ok(!finalLesson.compoundLoop, 'Final challenge should not repeat lesson 4 gift compound-loop structure');
  assert.equal(finalLesson.multiLoops.length, 3);
  assert.deepEqual(Array.from(finalLesson.multiLoops.map((loop) => loop.action)), ['paint', 'star', 'box']);
  assert.deepEqual(Array.from(finalLesson.multiLoops.map((loop) => loop.count)), [4, 6, 2]);
  const lesson11 = lessons.find((item) => item.id === 11);
  assert.notDeepEqual(Array.from(finalLesson.multiLoops.map((loop) => loop.action)), Array.from(lesson11.multiLoops.map((loop) => loop.action)), 'Final challenge should not duplicate lesson 11 actions');
  assert.notDeepEqual(Array.from(finalLesson.multiLoops.map((loop) => loop.count)), Array.from(lesson11.multiLoops.map((loop) => loop.count)), 'Final challenge should not duplicate lesson 11 counts');
});

test('factory play page exposes action and repeat-count controls instead of previous mechanics', () => {
  assertIncludes(playHtml, 'id="action-options"');
  assertIncludes(playHtml, 'id="count-options"');
  assertIncludes(playHtml, 'id="loop-preview"');
  assertIncludes(playHtml, 'id="factory-line"');
  assertIncludes(playHtml, 'id="current-mission-badge"');
  assert.ok(!playHtml.includes('goal-chip'), 'Factory lesson should not show a ready-made goal chip');
  assert.ok(!playSource.includes("getElementById('goal-chip')"), 'Factory engine should not fill a revealing goal chip');
  assert.ok(!playHtml.includes('id="hint"'), 'Factory lesson should not show a hint button');
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
  assertIncludes(playSource, 'משימה ${lesson.id} מתוך ${lessons.length}');
  assertIncludes(playSource, 'data-loop-target');
  assertIncludes(playSource, 'על מה עובדים');
  assertIncludes(playSource, 'loopTargetLabel(target)');
  assert.ok(!playSource.includes('loop-target-note'), 'Multi-loop cards should not show passive target notes; they should use an explicit object-selection step');
  assertIncludes(playSource, 'compound-loop-stack');
  assertIncludes(playSource, 'compound-action-slot');
  assertIncludes(playSource, 'איך יודעים כמה פעמים להריץ');
  assertIncludes(playSource, 'מספר החזרות הוא מספר הפריטים שמופיע בסיפור');
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
  assertIncludes(playSource, 'selectedCount ? Array.from({ length: selectedCount }');
  assert.ok(!playSource.includes('selectedLoops[index].count || target.count'), 'Factory line must not reveal the correct repeat count with empty squares before selection');
  assertIncludes(playSource, 'בחרו מספר');
  assert.ok(!playSource.includes('function showHint()'), 'Factory engine should not keep hint UI logic');
  assert.ok(!playSource.includes("getElementById('hint')"), 'Factory engine should not bind a removed hint button');
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
  assertIncludes(factoryCss, '#count-panel{grid-column:1/-1}');
  assertIncludes(factoryCss, '.current-mission-badge');
  assertIncludes(factoryCss, '.lesson-nav a.active::after');
  assertIncludes(factoryCss, '.clean-target-part');
  assertIncludes(factoryCss, '.clean-target-btn');
  assert.ok(!factoryCss.includes('.loop-target-note'), 'Removed passive target-note styling should not remain');
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
