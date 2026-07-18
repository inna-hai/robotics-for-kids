import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const factoryHtml = readFileSync(join(root, 'factory.html'), 'utf8');
const gardenHtml = readFileSync(join(root, 'garden.html'), 'utf8');
const parkHtml = readFileSync(join(root, 'park.html'), 'utf8');
const factoryLab = readFileSync(join(root, 'factory-lab.html'), 'utf8');
const gardenLab = readFileSync(join(root, 'garden-lab.html'), 'utf8');
const parkLab = readFileSync(join(root, 'park-lab.html'), 'utf8');
const factoryPlay = readFileSync(join(root, 'js', 'factory-play.js'), 'utf8');
const gardenPlay = readFileSync(join(root, 'js', 'garden-play.js'), 'utf8');
const parkPlay = readFileSync(join(root, 'js', 'park-play.js'), 'utf8');
const factoryPlan = readFileSync(join(root, 'FACTORY_75_MIN_LESSON_PLAN.md'), 'utf8');
const gardenPlan = readFileSync(join(root, 'GARDEN_75_MIN_LESSON_PLAN.md'), 'utf8');
const parkPlan = readFileSync(join(root, 'PARK_75_MIN_LESSON_PLAN.md'), 'utf8');

const tests = [];
function test(name, fn) { tests.push({ name, fn }); }
function assertIncludes(source, needle, message = `Missing: ${needle}`) { assert.ok(source.includes(needle), message); }

test('lessons 9-11 landing pages link to creator labs', () => {
  assertIncludes(factoryHtml, 'href="factory-lab.html"');
  assertIncludes(gardenHtml, 'href="garden-lab.html"');
  assertIncludes(parkHtml, 'href="park-lab.html"');
});

test('final game flow continues to creator labs instead of ending early', () => {
  assertIncludes(factoryPlay, "href: 'factory-lab.html'");
  assertIncludes(gardenPlay, "href: 'garden-lab.html'");
  assertIncludes(parkPlay, "href: 'park-lab.html'");
});

test('factory lab adds a 15-20 minute invented loop activity', () => {
  assertIncludes(factoryLab, 'פעילות יצירה • 15–20 דקות');
  assertIncludes(factoryLab, 'שם הצעצוע');
  assertIncludes(factoryLab, 'פעולה חוזרת');
  assertIncludes(factoryLab, 'כמה פעמים');
  assertIncludes(factoryLab, 'שאלת שיתוף');
  assertIncludes(factoryPlan, 'factory-lab.html');
  assertIncludes(factoryPlan, 'מספיק חומר גם לכיתה זריזה');
});

test('garden lab adds a gentle create-your-own plant rules activity', () => {
  assertIncludes(gardenLab, 'פעילות יצירה • 15–20 דקות');
  assertIncludes(gardenLab, 'שם הצמח');
  assertIncludes(gardenLab, 'מצב 1');
  assertIncludes(gardenLab, 'פעולה 1');
  assertIncludes(gardenLab, 'אם</b>');
  assertIncludes(gardenPlan, 'garden-lab.html');
  assertIncludes(gardenPlan, 'בלי להעלות את הרמה בחדות');
});

test('park lab adds a ride design activity for command parameters', () => {
  assertIncludes(parkLab, 'פעילות יצירה • 15–20 דקות');
  assertIncludes(parkLab, 'שם המתקן');
  assertIncludes(parkLab, 'מצב רגוע');
  assertIncludes(parkLab, 'מצב חגיגי');
  assertIncludes(parkLab, 'פקודות המתקן שהמצאתי');
  assertIncludes(parkPlan, 'park-lab.html');
  assertIncludes(parkPlan, 'מחזיק 75 דקות');
});

let passed = 0;
for (const { name, fn } of tests) {
  try { fn(); passed += 1; console.log(`✓ ${name}`); }
  catch (error) { console.error(`✗ ${name}`); console.error(error.stack || error.message); process.exitCode = 1; break; }
}
if (!process.exitCode) console.log(`\n${passed}/${tests.length} lesson 9-11 lab tests passed.`);
