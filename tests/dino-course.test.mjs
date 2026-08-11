import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import vm from 'node:vm';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const dinoHtml = readFileSync(join(root, 'dino.html'), 'utf8');
const playHtml = readFileSync(join(root, 'dino-play.html'), 'utf8');
const labHtml = readFileSync(join(root, 'dino-lab.html'), 'utf8');
const labSource = readFileSync(join(root, 'js', 'dino-lab.js'), 'utf8');
const hubHtml = readFileSync(join(root, 'sisi.html'), 'utf8');
const smartCityHtml = readFileSync(join(root, 'smart-city.html'), 'utf8');
const kitchenHtml = readFileSync(join(root, 'kitchen.html'), 'utf8');
const dinoCss = readFileSync(join(root, 'css', 'dino.css'), 'utf8');
const lessonsSource = readFileSync(join(root, 'js', 'dino-lessons.js'), 'utf8');
const playSource = readFileSync(join(root, 'js', 'dino-play.js'), 'utf8');
const plan = readFileSync(join(root, 'DINO_75_MIN_LESSON_PLAN.md'), 'utf8');

const sandbox = { window: {} };
vm.runInNewContext(lessonsSource, sandbox, { filename: 'dino-lessons.js' });
const lessons = sandbox.window.DINO_LESSONS;
const zones = sandbox.window.DINO_ZONES;

const tests = [];
function test(name, fn) { tests.push({ name, fn }); }
function assertIncludes(source, needle, message = `Missing: ${needle}`) { assert.ok(source.includes(needle), message); }
function assertMatches(source, regex, message = `Missing pattern: ${regex}`) { assert.match(source, regex, message); }

test('dino course is linked as lesson 6 in the series', () => {
  assertIncludes(smartCityHtml, 'href="dino.html"');
  assertIncludes(smartCityHtml, 'שיעור 6: דינוזאורים');
  assertIncludes(kitchenHtml, 'href="dino.html"');
  assertIncludes(hubHtml, 'שיעור 6');
  assertIncludes(hubHtml, 'סיסי בפארק הדינוזאורים');
});

test('landing page frames a new classification/data mechanic for grade B', () => {
  assertIncludes(dinoHtml, 'שיעור 6 • דינוזאורים ודאטה • כיתות ב׳ • 75 דקות');
  assertIncludes(dinoHtml, 'מיון לפי מאפיינים');
  assertIncludes(dinoHtml, 'דאטה');
  assertIncludes(dinoHtml, 'מעבדת יצירה');
  assertIncludes(dinoHtml, 'משימות 1–4 + מעבדת יצירה במשך 76 דקות');
  assertIncludes(dinoHtml, 'href="dino-play.html?lesson=1"');
  assertIncludes(dinoHtml, 'js/dino-lessons.js');
  assertIncludes(dinoHtml, 'css/dino.css');
});

test('dino data has twelve classification tasks with valid zone answers', () => {
  assert.equal(lessons.length, 12);
  const zoneKeys = Object.keys(zones);
  for (const lesson of lessons) {
    assert.ok(zoneKeys.includes(lesson.dino.answer), `Lesson ${lesson.id} answer must be a known zone`);
    assert.ok(lesson.dino.facts.length >= 3, `Lesson ${lesson.id} needs facts`);
    assert.ok(lesson.learningNote.length >= 20, `Lesson ${lesson.id} needs learning note`);
  }
});

test('dino character names do not reveal the classification answer', () => {
  const revealingWords = ['טורף', 'טורפי', 'צמח', 'צמחוני', 'ענק', 'מעופף', 'כנף', 'כנפי', 'ביצה', 'ביצ', 'דג', 'מים', 'מימי', 'שריון', 'חד', 'חוד', 'רץ', 'גבוה'];
  for (const lesson of lessons) {
    for (const word of revealingWords) {
      assert.ok(!lesson.dino.name.includes(word), `Lesson ${lesson.id} dino name should not reveal answer: ${lesson.dino.name}`);
    }
  }
});

test('dino visuals are gently related to the destination zone', () => {
  const allowedIcons = {
    herbivore: new Set(['🦕', '🌳', '🌿']),
    carnivore: new Set(['🦖', '🐊']),
    nursery: new Set(['🥚', '🐣']),
    giant: new Set(['🦕', '🐾']),
    flying: new Set(['🐦', '🪽', '🦅'])
  };
  for (const lesson of lessons) {
    assert.ok(allowedIcons[lesson.dino.answer].has(lesson.dino.icon), `Lesson ${lesson.id} icon ${lesson.dino.icon} should connect to ${lesson.dino.answer} without confusing learners`);
  }
});

test('dino fact chips use natural wording without colons', () => {
  for (const lesson of lessons) {
    for (const fact of lesson.dino.facts) {
      assert.ok(!fact.includes(':'), `Lesson ${lesson.id} fact should use natural wording: ${fact}`);
    }
  }
});

test('dino tasks use varied reasons instead of one repeated matching rule', () => {
  const units = new Set(lessons.map((lesson) => lesson.unit));
  assert.ok(units.size >= 10, 'dino tasks should vary the primary classification reason');
  const requiredReasonWords = ['אוכל', 'שיניים', 'שלב חיים', 'גודל', 'דרך תנועה', 'מקום מחיה', 'אזור מתאים', 'התנהגות', 'צורת אכילה', 'טיפול'];
  for (const word of requiredReasonWords) {
    assert.ok([...units].some((unit) => unit.includes(word)), `Missing varied reason unit: ${word}`);
  }
  const answerCounts = lessons.reduce((counts, lesson) => ({ ...counts, [lesson.dino.answer]: (counts[lesson.dino.answer] || 0) + 1 }), {});
  for (const zone of Object.keys(zones)) {
    assert.ok(answerCounts[zone] >= 2, `${zone} should appear in multiple varied tasks`);
  }
});

test('dino play page exposes classification controls rather than previous mechanics', () => {
  assertIncludes(playHtml, 'id="facts"');
  assertIncludes(playHtml, 'id="zones"');
  assertIncludes(playHtml, 'id="check"');
  assertIncludes(playHtml, 'id="next-step"');
  assertIncludes(playHtml, 'js/dino-play.js');
  assert.ok(!playHtml.includes('recipe-steps'), 'Dino lesson should not use recipe ordering');
  assert.ok(!playHtml.includes('notes-bank'), 'Dino lesson should not use music notes');
});

test('dino engine checks selected zone against data answer and provides hints', () => {
  assertIncludes(playSource, 'function checkClassification()');
  assertIncludes(playSource, 'selectedZone === lesson.dino.answer');
  assertIncludes(playSource, 'renderNextStep(true)');
  assertIncludes(playSource, 'function nextTarget()');
  assertIncludes(playSource, "href: 'art.html'");
  assertIncludes(playSource, 'המשך למשימה');
  assertIncludes(playSource, 'לשיעור הבא');
  assertIncludes(playSource, 'function showHint()');
  assertIncludes(playSource, 'answerZone.hint');
});

test('dino lab adds a creative classification activity for a full 76-minute lesson', () => {
  assertIncludes(labHtml, 'מעבדת הדינוזאורים של סיסי');
  assertIncludes(labHtml, 'פעילות יצירה');
  assertIncludes(labHtml, '15–20 דקות');
  assertIncludes(labHtml, 'data-trait="species"');
  assertIncludes(labHtml, 'איזה מין דינוזאור');
  assertIncludes(labHtml, 'data-trait="food"');
  assertIncludes(labHtml, 'data-trait="movement"');
  assertIncludes(labHtml, 'data-trait="size"');
  assertIncludes(labHtml, 'data-trait="state"');
  assertIncludes(labSource, 'function classifyDino()');
  assertIncludes(labSource, "{ id: 'trex'");
  assertIncludes(labSource, "{ id: 'brachio'");
  assertIncludes(labSource, "{ id: 'ptero'");
  assertIncludes(labSource, 'speciesName()');
  assertIncludes(labSource, "selected.state === 'egg'");
  assertIncludes(labSource, "selected.movement === 'flies'");
  assertIncludes(labSource, "selected.species === 'trex'");
});

test('dino css and plan support a 76-minute visual classification lesson', () => {
  assertIncludes(dinoCss, '.dino-stage');
  assertIncludes(dinoCss, '.dino-visual');
  assertIncludes(dinoCss, '.zone-btn');
  assertIncludes(dinoCss, '.dino-lab');
  assertIncludes(dinoCss, '.created-dino');
  assertIncludes(dinoCss, '.dino-image');
  assertIncludes(dinoCss, '.species-trex');
  assertIncludes(dinoCss, '.species-brachio');
  assertIncludes(dinoCss, '.species-ptero');
  assertMatches(dinoCss, /@media\(max-width:820px\)\{\.dino-layout\{grid-template-columns:1fr\}/);
  assertIncludes(plan, 'שיעור 76 דקות: רצף משימות מיון + מעבר מובנה למעבדת יצירת דינוזאור');
  assertIncludes(plan, 'לא לדחוס את כל 6 משימות המיון לכל הכיתה');
});

let passed = 0;
for (const { name, fn } of tests) {
  try { fn(); passed += 1; console.log(`✓ ${name}`); }
  catch (error) { console.error(`✗ ${name}`); console.error(error.stack || error.message); process.exitCode = 1; break; }
}
if (!process.exitCode) console.log(`\n${passed}/${tests.length} dino course tests passed.`);
