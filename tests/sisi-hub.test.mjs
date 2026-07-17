import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const hubHtml = readFileSync(join(root, 'sisi.html'), 'utf8');
const smartCityHtml = readFileSync(join(root, 'smart-city.html'), 'utf8');
const spaceHtml = readFileSync(join(root, 'space.html'), 'utf8');
const musicHtml = readFileSync(join(root, 'music.html'), 'utf8');
const oceanHtml = readFileSync(join(root, 'ocean.html'), 'utf8');
const detectiveHtml = readFileSync(join(root, 'detective.html'), 'utf8');
const dinoHtml = readFileSync(join(root, 'dino.html'), 'utf8');
const artHtml = readFileSync(join(root, 'art.html'), 'utf8');
const weatherHtml = readFileSync(join(root, 'weather.html'), 'utf8');
const factoryHtml = readFileSync(join(root, 'factory.html'), 'utf8');
const gardenHtml = readFileSync(join(root, 'garden.html'), 'utf8');
const parkHtml = readFileSync(join(root, 'park.html'), 'utf8');
const mailHtml = readFileSync(join(root, 'mail.html'), 'utf8');
const cinemaHtml = readFileSync(join(root, 'cinema.html'), 'utf8');

const tests = [];
function test(name, fn) { tests.push({ name, fn }); }
function assertIncludes(source, needle, message = `Missing: ${needle}`) { assert.ok(source.includes(needle), message); }

test('Sisi hub lists all thirteen lessons in the recommended order', () => {
  assertIncludes(hubHtml, 'סיסי — שיעורי תכנות לילדים');
  const expected = [
    ['שיעור 1', 'space.html', 'סיסי בחלל'],
    ['שיעור 2', 'music.html', 'מכונת המוזיקה'],
    ['שיעור 3', 'ocean.html', 'סיסי באוקיינוס'],
    ['שיעור 4', 'detective.html', 'סיסי הבלשית'],
    ['שיעור 5', 'kitchen.html', 'סיסי במטבח הקסמים'],
    ['שיעור 6', 'dino.html', 'סיסי בפארק הדינוזאורים'],
    ['שיעור 7', 'art.html', 'סיסי בסטודיו הפיקסלים'],
    ['שיעור 8', 'weather.html', 'סיסי ותחנת מזג האוויר'],
    ['שיעור 9', 'factory.html', 'סיסי במפעל הצעצועים'],
    ['שיעור 10', 'garden.html', 'סיסי בגינת הקסמים'],
    ['שיעור 11', 'park.html', 'סיסי בלונה פארק'],
    ['שיעור 12', 'mail.html', 'סיסי בדואר הקסום'],
    ['שיעור 13', 'cinema.html', 'סיסי באולפן הסרטים']
  ];
  let lastIndex = -1;
  for (const [number, href, title] of expected) {
    assertIncludes(hubHtml, number);
    assertIncludes(hubHtml, `href="${href}"`);
    assertIncludes(hubHtml, title);
    const index = hubHtml.indexOf(`href="${href}"`);
    assert.ok(index > lastIndex, `${href} should appear after the previous lesson`);
    lastIndex = index;
  }
});

test('main and lesson landing pages link back to the Sisi hub', () => {
  for (const [name, html] of Object.entries({ smartCityHtml, spaceHtml, musicHtml, oceanHtml, detectiveHtml, dinoHtml, artHtml, weatherHtml, factoryHtml, gardenHtml, parkHtml, mailHtml, cinemaHtml })) {
    assertIncludes(html, 'href="sisi.html"', `${name} should link to sisi.html`);
    assertIncludes(html, 'כל שיעורי סיסי', `${name} should label the hub link clearly`);
  }
});

test('hub frames the series for grade B age 7 and 75-minute lessons', () => {
  assertIncludes(hubHtml, 'כיתות ב׳');
  assertIncludes(hubHtml, 'גיל 7');
  assertIncludes(hubHtml, '75</b>דק׳ לשיעור');
  assertIncludes(hubHtml, '13</b>מכניקות שונות');
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

if (!process.exitCode) {
  console.log(`\n${passed}/${tests.length} Sisi hub tests passed.`);
}
