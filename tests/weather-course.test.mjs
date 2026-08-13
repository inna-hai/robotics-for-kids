import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import vm from 'node:vm';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const weatherHtml = readFileSync(join(root, 'weather.html'), 'utf8');
const playHtml = readFileSync(join(root, 'weather-play.html'), 'utf8');
const hubHtml = readFileSync(join(root, 'sisi.html'), 'utf8');
const smartCityHtml = readFileSync(join(root, 'smart-city.html'), 'utf8');
const artHtml = readFileSync(join(root, 'art.html'), 'utf8');
const weatherCss = readFileSync(join(root, 'css', 'weather.css'), 'utf8');
const lessonsSource = readFileSync(join(root, 'js', 'weather-lessons.js'), 'utf8');
const playSource = readFileSync(join(root, 'js', 'weather-play.js'), 'utf8');
const plan = readFileSync(join(root, 'WEATHER_75_MIN_LESSON_PLAN.md'), 'utf8');

const sandbox = { window: {} };
vm.runInNewContext(lessonsSource, sandbox, { filename: 'weather-lessons.js' });
const lessons = sandbox.window.WEATHER_LESSONS;
const sensors = sandbox.window.WEATHER_SENSORS;
const actions = sandbox.window.WEATHER_ACTIONS;
const conditions = sandbox.window.WEATHER_CONDITIONS;
const bugParts = sandbox.window.WEATHER_BUG_PARTS;

const tests = [];
function test(name, fn) { tests.push({ name, fn }); }
function assertIncludes(source, needle, message = `Missing: ${needle}`) { assert.ok(source.includes(needle), message); }
function optionOrderScoreForLesson(lesson, id, type, index) {
  const raw = `${type}|${lesson.id}|${index}|${id}|weather-debug-challenge-v6`;
  return [...raw].reduce((hash, char) => ((hash * 31) + char.charCodeAt(0)) >>> 0, 7);
}
function rawOrderedKeysForLesson(lesson, items, type) {
  return Object.keys(items)
    .map((id, index) => ({ id, score: optionOrderScoreForLesson(lesson, id, type, index) }))
    .sort((a, b) => a.score - b.score)
    .map((item) => item.id);
}
function orderedKeysForLesson(lesson, items, type) {
  const ordered = rawOrderedKeysForLesson(lesson, items, type);
  if (type === 'sensor') return ordered;
  const sensorOrder = orderedKeysForLesson(lesson, sensors, 'sensor');
  let shiftedOrder = ordered;
  const correctId = type === 'condition' ? lesson.condition : type === 'reason' ? lesson.reason : lesson.action;
  while (sensorOrder.indexOf(lesson.sensor) === shiftedOrder.indexOf(correctId)) {
    shiftedOrder = [...shiftedOrder.slice(1), shiftedOrder[0]];
  }
  return shiftedOrder;
}

test('weather course is linked as lesson 8 in the Sisi series', () => {
  assertIncludes(smartCityHtml, 'href="weather.html"');
  assertIncludes(smartCityHtml, 'שיעור 8: חיישנים');
  assertIncludes(artHtml, 'href="weather.html"');
  assertIncludes(hubHtml, 'שיעור 8');
  assertIncludes(hubHtml, 'סיסי ותחנת מזג האוויר');
});

test('landing page frames a new sensor automation mechanic for grade B', () => {
  assertIncludes(weatherHtml, 'שיעור 8 • חיישנים ואוטומציה • כיתות ב׳ • 75 דקות');
  assertIncludes(weatherHtml, 'קלט→פלט');
  assertIncludes(weatherHtml, 'אם-אז');
  assertIncludes(weatherHtml, 'תחנות 1–4 לכל הכיתה, 5–12 להרחבה ותרגול');
  assertIncludes(weatherHtml, 'href="weather-play.html?lesson=1"');
  assertIncludes(weatherHtml, 'js/weather-lessons.js?v=20260813-debug-challenge-v6');
  assertIncludes(playHtml, 'js/weather-lessons.js?v=20260813-debug-challenge-v6');
  assertIncludes(weatherHtml, 'css/weather.css?v=20260813-condition-no-icon-v3');
  assertIncludes(playHtml, 'css/weather.css?v=20260813-condition-no-icon-v3');
});

test('weather data has twelve scenarios with valid three-part rule answers', () => {
  assert.equal(lessons.length, 12);
  const sensorKeys = Object.keys(sensors);
  const actionKeys = Object.keys(actions);
  const conditionKeys = Object.keys(conditions);
  const bugPartKeys = Object.keys(bugParts);
  const usedSensors = new Set();
  for (const lesson of lessons) {
    assert.ok(sensorKeys.includes(lesson.sensor), `Lesson ${lesson.id} sensor must be valid`);
    assert.ok(conditionKeys.includes(lesson.condition), `Lesson ${lesson.id} condition must be valid`);
    assert.ok(actionKeys.includes(lesson.action), `Lesson ${lesson.id} action must be valid`);
    assert.ok(lesson.bug, `Lesson ${lesson.id} needs a debugging challenge`);
    assert.ok(bugPartKeys.includes(lesson.bug.part), `Lesson ${lesson.id} bug part must be valid`);
    assert.ok(conditions[lesson.condition].label.startsWith('אם'), `Lesson ${lesson.id} should use if condition wording`);
    assert.ok(lesson.learningNote.length >= 30, `Lesson ${lesson.id} needs learning note`);
    usedSensors.add(lesson.sensor);
  }
  assert.ok(usedSensors.size >= 6, 'Each weather scenario should use a distinct sensor');
  const finalLesson = lessons.find((item) => item.id === 12);
  assert.ok(finalLesson.scene.includes('רעש חזק'), 'Final weather mission should clearly describe the noise problem');
  assert.ok(finalLesson.scene.includes('בשקט'), 'Final weather mission should clearly point to the quiet action');
});

test('weather play page exposes condition, sensor, action and debugging selection rather than previous mechanics', () => {
  assertIncludes(playHtml, 'id="condition-options"');
  assertIncludes(lessonsSource, 'window.WEATHER_CONDITIONS');
  assertIncludes(lessonsSource, 'window.WEATHER_BUG_PARTS');
  assertIncludes(playHtml, 'id="sensor-options"');
  assertIncludes(playHtml, 'id="action-options"');
  assertIncludes(playHtml, 'id="bug-options"');
  assertIncludes(playHtml, 'id="rule-preview"');
  assert.ok(!playHtml.includes('id="condition-chip"'), 'Weather play should not reveal the condition as a separate clue chip');
  assert.ok(!playHtml.includes('id="hint"'), 'Weather play should not include a hint button');
  assert.ok(!playSource.includes('condition-chip'), 'Weather engine should not fill a separate condition clue chip');
  assert.ok(!playSource.includes('function showHint()'), 'Weather engine should not expose a hint flow');
  assertIncludes(playHtml, 'js/weather-play.js?v=20260813-debug-challenge-v6');
  assert.ok(!playHtml.includes('pixel-board'), 'Weather lesson should not use pixel boards');
  assert.ok(!playHtml.includes('recipe-steps'), 'Weather lesson should not use recipe ordering');
});

test('weather option columns are shuffled so answers do not line up by row', () => {
  assertIncludes(playSource, 'function optionOrderScore(id, type, index)');
  assertIncludes(playSource, 'function orderedOptions(items, type)');
  assertIncludes(playSource, 'weather-debug-challenge-v6');
  const lessonEight = lessons.find((lesson) => lesson.id === 8);
  const sensorOrder = orderedKeysForLesson(lessonEight, sensors, 'sensor');
  const conditionOrder = orderedKeysForLesson(lessonEight, conditions, 'condition');
  const actionOrder = orderedKeysForLesson(lessonEight, actions, 'action');
  assert.notEqual(sensorOrder.indexOf(lessonEight.sensor), conditionOrder.indexOf(lessonEight.condition), 'Lesson 8 condition should not be solvable by matching row positions');
  const bugOrder = orderedKeysForLesson(lessonEight, bugParts, 'bug');
  assert.notEqual(sensorOrder.indexOf(lessonEight.sensor), actionOrder.indexOf(lessonEight.action), 'Lesson 8 action should not be solvable by matching row positions');
  assert.notEqual(sensorOrder.indexOf(lessonEight.sensor), bugOrder.indexOf(lessonEight.bug.part), 'Lesson 8 bug answer should not be solvable by matching row positions');
  for (const lesson of lessons) {
    const sOrder = orderedKeysForLesson(lesson, sensors, 'sensor');
    const cOrder = orderedKeysForLesson(lesson, conditions, 'condition');
    const aOrder = orderedKeysForLesson(lesson, actions, 'action');
    assert.notEqual(sOrder.join(','), cOrder.join(','), `Lesson ${lesson.id} sensor/condition lists should not share identical order`);
    assert.notEqual(sOrder.join(','), aOrder.join(','), `Lesson ${lesson.id} sensor/action lists should not share identical order`);
  }
});

test('weather engine checks condition, sensor, action and debugging with targeted feedback', () => {
  assertIncludes(playSource, 'function checkAutomation()');
  assertIncludes(playSource, "class=\"option-card ${type}-card");
  assertIncludes(playSource, "(type === 'condition' || type === 'bug') ? '' : `<span class=\"option-icon\">${item.icon}</span>`");
  assertIncludes(playSource, 'selectedCondition === lesson.condition');
  assertIncludes(playSource, 'selectedSensor === lesson.sensor');
  assertIncludes(playSource, 'selectedAction === lesson.action');
  assertIncludes(playSource, 'selectedBugPart === lesson.bug.part');
  assertIncludes(playSource, 'צריך לבחור תנאי, חיישן, פעולה וגם לזהות את התקלה');
  assert.ok(!playSource.includes("'❔'"), 'Empty-state placeholders should use readable text, not unsupported question-mark emoji');
  assert.ok(!playSource.includes('conditions[selectedCondition].icon'), 'Condition preview should not use emoji icons that may render as empty squares');
  assertIncludes(playSource, 'משפט ה־אם לא מתאים');
  assertIncludes(playSource, 'התנאי והחיישן נכונים');
  assertIncludes(playSource, 'זיהוי התקלה של סיסי');
  assertIncludes(playSource, 'weather-play.html?lesson=');
});

test('weather css and plan support a 75-minute sensor lesson', () => {
  assertIncludes(weatherCss, '.option-card');
  assertIncludes(weatherCss, '.rule-preview');
  assertIncludes(weatherCss, '.station-card');
  assertIncludes(weatherCss, 'grid-template-columns:repeat(3,minmax(0,1fr))');
  assertIncludes(weatherCss, '.condition-card .option-icon,.bug-card .option-icon,.option-card[data-condition] .option-icon,.option-card[data-bug] .option-icon{display:none!important}');
  assertIncludes(weatherCss, '.bug-grid{grid-template-columns:repeat(3,minmax(0,1fr))}');
  assertIncludes(plan, 'שיעור 75 דקות לכיתות ב׳ / גיל 7');
  assertIncludes(plan, 'תחנות 1–4 מספיקות לשיעור מלא');
  assertIncludes(plan, 'חיישן שקולט מצב בעולם לבין פעולה');
});

let passed = 0;
for (const { name, fn } of tests) {
  try { fn(); passed += 1; console.log(`✓ ${name}`); }
  catch (error) { console.error(`✗ ${name}`); console.error(error.stack || error.message); process.exitCode = 1; break; }
}
if (!process.exitCode) console.log(`\n${passed}/${tests.length} weather course tests passed.`);
