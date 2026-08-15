import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import vm from 'node:vm';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const finaleHtml = readFileSync(join(root, 'finale.html'), 'utf8');
const playHtml = readFileSync(join(root, 'finale-play.html'), 'utf8');
const labHtml = readFileSync(join(root, 'finale-lab.html'), 'utf8');
const hubHtml = readFileSync(join(root, 'sisi.html'), 'utf8');
const smartCityHtml = readFileSync(join(root, 'smart-city.html'), 'utf8');
const escapeHtml = readFileSync(join(root, 'escape.html'), 'utf8');
const finaleCss = readFileSync(join(root, 'css', 'finale.css'), 'utf8');
const lessonsSource = readFileSync(join(root, 'js', 'finale-lessons.js'), 'utf8');
const playSource = readFileSync(join(root, 'js', 'finale-play.js'), 'utf8');
const plan = readFileSync(join(root, 'FINALE_76_MIN_LESSON_PLAN.md'), 'utf8');

const sandbox = { window: {} };
vm.runInNewContext(lessonsSource, sandbox, { filename: 'finale-lessons.js' });
const missions = sandbox.window.FINALE_MISSIONS;
const conditions = sandbox.window.FINALE_CONDITIONS;
const actions = sandbox.window.FINALE_ACTIONS;

const tests = [];
function test(name, fn) { tests.push({ name, fn }); }
function assertIncludes(source, needle, message = `Missing: ${needle}`) { assert.ok(source.includes(needle), message); }

test('finale course is linked as lesson 15 and capstone', () => {
  assertIncludes(smartCityHtml, 'href="finale.html"');
  assertIncludes(smartCityHtml, 'שיעור 15: שיא העיר');
  assertIncludes(escapeHtml, 'href="finale.html"');
  assertIncludes(hubHtml, 'שיעור 15');
  assertIncludes(hubHtml, 'סיסי מצילה את העיר החכמה');
});

test('landing page frames a 75-minute capstone integrating programming ideas', () => {
  assertIncludes(finaleHtml, 'שיעור 15 • שיעור שיא • עיר חכמה • 75 דקות');
  assertIncludes(finaleHtml, 'תנאי, רצף פעולות, דיבוג ונימוק');
  assertIncludes(finaleHtml, 'אתגר צוותי');
  assertIncludes(finaleHtml, 'הצגת פתרון');
  assertIncludes(finaleHtml, 'href="finale-play.html?lesson=1"');
  assertIncludes(finaleHtml, 'href="finale-lab.html"');
});

test('finale data has twelve missions combining condition, ordered actions, and distractor', () => {
  assert.equal(missions.length, 12);
  const conditionKeys = Object.keys(conditions);
  const actionKeys = Object.keys(actions);
  for (const mission of missions) {
    assert.ok(conditionKeys.includes(mission.condition), `Mission ${mission.id} condition must exist`);
    assert.equal(mission.conditionOptions.length, 4, `Mission ${mission.id} should offer four city states`);
    assert.ok(mission.conditionOptions.includes(mission.condition), `Mission ${mission.id} options should include the correct city state`);
    for (const id of mission.conditionOptions) assert.ok(conditionKeys.includes(id), `Unknown condition option ${id}`);
    assert.equal(mission.correctActions.length, 3, `Mission ${mission.id} needs three actions`);
    assert.ok(actionKeys.includes(mission.distractor), `Mission ${mission.id} distractor must exist`);
    for (const id of mission.correctActions) assert.ok(actionKeys.includes(id), `Unknown action ${id}`);
    assert.ok(mission.explanation.length >= 25, `Mission ${mission.id} needs explanation`);
  }
});

test('finale play page requires condition, ordered actions, and explanation', () => {
  assertIncludes(playHtml, 'id="condition-options"');
  assertIncludes(playHtml, 'id="action-options"');
  assertIncludes(playHtml, 'id="program-preview"');
  assertIncludes(playHtml, 'id="explanation-options"');
  assertIncludes(playSource, 'selectedCondition === mission.condition');
  assertIncludes(playSource, 'selectedActions.every');
  assertIncludes(playSource, 'selectedExplanation === mission.explanation');
  assertIncludes(playSource, 'function explanationChoices()');
  assertIncludes(playSource, 'distractorPairs');
  assertIncludes(playSource, 'mission.id % 3');
  assertIncludes(playSource, 'function removeAction(id)');
  assertIncludes(playSource, 'data-remove-action');
  assertIncludes(playSource, 'toggleAction(button.dataset.action)');
  assertIncludes(playSource, "href: 'sisi.html'");
});

test('finale lab, css, and plan support a 75-minute capstone project', () => {
  assertIncludes(labHtml, 'פרויקט סיום • 20 דקות');
  assertIncludes(labHtml, 'בעיה בעיר');
  assertIncludes(labHtml, 'פעולה מיותרת');
  assertIncludes(labHtml, 'בדיקת חברים');
  assertIncludes(finaleCss, '.program-grid');
  assertIncludes(finaleCss, '.condition-line');
  assertIncludes(finaleCss, '.remove-action');
  assertIncludes(plan, 'שיעור שיא של 75 דקות');
  assertIncludes(plan, 'מסכם את קורס סיסי');
});

let passed = 0;
for (const { name, fn } of tests) {
  try { fn(); passed += 1; console.log(`✓ ${name}`); }
  catch (error) { console.error(`✗ ${name}`); console.error(error.stack || error.message); process.exitCode = 1; break; }
}
if (!process.exitCode) console.log(`\n${passed}/${tests.length} finale course tests passed.`);
