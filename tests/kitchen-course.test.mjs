import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import vm from 'node:vm';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const kitchenHtml = readFileSync(join(root, 'kitchen.html'), 'utf8');
const playHtml = readFileSync(join(root, 'kitchen-play.html'), 'utf8');
const hubHtml = readFileSync(join(root, 'sisi.html'), 'utf8');
const smartCityHtml = readFileSync(join(root, 'smart-city.html'), 'utf8');
const detectiveHtml = readFileSync(join(root, 'detective.html'), 'utf8');
const kitchenCss = readFileSync(join(root, 'css', 'kitchen.css'), 'utf8');
const lessonsSource = readFileSync(join(root, 'js', 'kitchen-lessons.js'), 'utf8');
const playSource = readFileSync(join(root, 'js', 'kitchen-play.js'), 'utf8');

const sandbox = { window: {} };
vm.runInNewContext(lessonsSource, sandbox, { filename: 'kitchen-lessons.js' });
const lessons = sandbox.window.KITCHEN_LESSONS;

const tests = [];
function test(name, fn) { tests.push({ name, fn }); }
function assertIncludes(source, needle, message = `Missing: ${needle}`) { assert.ok(source.includes(needle), message); }
function assertMatches(source, regex, message = `Missing pattern: ${regex}`) { assert.match(source, regex, message); }

test('kitchen course is linked as lesson 5 in the series', () => {
  assertIncludes(smartCityHtml, 'href="kitchen.html"');
  assertIncludes(smartCityHtml, 'שיעור 5: מטבח הקסמים');
  assertIncludes(detectiveHtml, 'href="kitchen.html"');
  assertIncludes(hubHtml, 'שיעור 5');
  assertIncludes(hubHtml, 'סיסי במטבח הקסמים');
});

test('landing page frames a new recipe/algorithm mechanic for grade B', () => {
  assertIncludes(kitchenHtml, 'שיעור 5 • מטבח ואלגוריתמים • כיתות ב׳ • 75 דקות');
  assertIncludes(kitchenHtml, 'סיסי במטבח הקסמים');
  assertIncludes(kitchenHtml, 'אלגוריתם');
  assertIncludes(kitchenHtml, 'סדר פעולות');
  assertIncludes(kitchenHtml, 'href="kitchen-play.html?lesson=1"');
  assertIncludes(kitchenHtml, 'js/kitchen-lessons.js');
  assertIncludes(kitchenHtml, 'css/kitchen.css');
});

test('kitchen lesson data has six recipes with valid unique ordered steps', () => {
  assert.equal(lessons.length, 6);
  for (const lesson of lessons) {
    assert.ok(lesson.steps.length >= 4, `Recipe ${lesson.id} needs at least 4 steps`);
    assert.equal(new Set(lesson.steps.map((step) => step.id)).size, lesson.steps.length, `Recipe ${lesson.id} step IDs must be unique`);
    assert.deepEqual(new Set(lesson.correctOrder), new Set(lesson.steps.map((step) => step.id)), `Recipe ${lesson.id} order must use all steps`);
    assert.ok(lesson.cookingNote.length >= 20, `Recipe ${lesson.id} needs a learning note`);
  }
});

test('kitchen play page exposes recipe ordering controls rather than previous mechanics', () => {
  assertIncludes(playHtml, 'step-bank');
  assertIncludes(playHtml, 'recipe-steps');
  assertIncludes(playHtml, 'id="check"');
  assertIncludes(playHtml, 'id="demo"');
  assertIncludes(playHtml, 'js/kitchen-play.js');
  assert.ok(!playHtml.includes('data-cmd="right"'), 'Kitchen lesson should not use board movement commands');
  assert.ok(!playHtml.includes('notes-bank'), 'Kitchen lesson should not use music notes');
  assert.ok(!playHtml.includes('id="clues"'), 'Kitchen lesson should not use detective clues');
});

test('kitchen engine checks exact step order and gives debugging feedback', () => {
  assertIncludes(playSource, 'function checkRecipe()');
  assertIncludes(playSource, 'lesson.correctOrder.length');
  assertIncludes(playSource, 'recipe.findIndex((id, index) => id !== lesson.correctOrder[index])');
  assertIncludes(playSource, 'שלב');
  assertIncludes(playSource, 'recipe = [...lesson.correctOrder]');
});

test('kitchen css includes dedicated recipe layout and responsive behavior', () => {
  assertIncludes(kitchenCss, '.kitchen-stage');
  assertIncludes(kitchenCss, '.recipe-layout');
  assertIncludes(kitchenCss, '.step-bank');
  assertIncludes(kitchenCss, '.recipe-steps');
  assertIncludes(kitchenCss, '.step-chip');
  assertMatches(kitchenCss, /@media\(max-width:760px\)\{\.recipe-layout\{grid-template-columns:1fr\}\}/);
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

if (!process.exitCode) console.log(`\n${passed}/${tests.length} kitchen course tests passed.`);
