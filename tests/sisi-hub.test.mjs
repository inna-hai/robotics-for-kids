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
const escapeHtml = readFileSync(join(root, 'escape.html'), 'utf8');
const finaleHtml = readFileSync(join(root, 'finale.html'), 'utf8');
const sisiHubJs = readFileSync(join(root, 'js', 'sisi-hub.js'), 'utf8');
const certificateSource = readFileSync(join(root, 'js/course-certificate.js'), 'utf8');

const sisiLessonFiles = [
  'sisi.html',
  'space.html', 'space-play.html',
  'music.html', 'music-play.html',
  'ocean.html', 'ocean-play.html',
  'detective.html', 'detective-play.html',
  'kitchen.html', 'kitchen-play.html',
  'dino.html', 'dino-play.html', 'dino-lab.html',
  'art.html', 'art-play.html',
  'weather.html', 'weather-play.html',
  'factory.html', 'factory-play.html', 'factory-lab.html',
  'garden.html', 'garden-play.html', 'garden-lab.html',
  'park.html', 'park-play.html', 'park-lab.html',
  'mail.html', 'mail-play.html', 'mail-lab.html',
  'cinema.html', 'cinema-play.html', 'cinema-lab.html',
  'escape.html', 'escape-play.html', 'escape-lab.html',
  'finale.html', 'finale-play.html', 'finale-lab.html',
];

const playFiles = sisiLessonFiles.filter((file) => file.endsWith('-play.html'));

const tests = [];
function test(name, fn) { tests.push({ name, fn }); }
function assertIncludes(source, needle, message = `Missing: ${needle}`) { assert.ok(source.includes(needle), message); }
function assertNotIncludes(source, needle, message = `Unexpected: ${needle}`) { assert.ok(!source.includes(needle), message); }

test('Sisi hub lists all fifteen lessons in the recommended order', () => {
  assertIncludes(hubHtml, 'חשיבה ותכנות לילדים עם סיסי');
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
    ['שיעור 13', 'cinema.html', 'סיסי באולפן הסרטים'],
    ['שיעור 14', 'escape.html', 'סיסי בחדר הבריחה'],
    ['שיעור 15', 'finale.html', 'סיסי מצילה את העיר החכמה']
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
  for (const [name, html] of Object.entries({ smartCityHtml, spaceHtml, musicHtml, oceanHtml, detectiveHtml, dinoHtml, artHtml, weatherHtml, factoryHtml, gardenHtml, parkHtml, mailHtml, cinemaHtml, escapeHtml, finaleHtml })) {
    assertIncludes(html, 'href="sisi.html"', `${name} should link to sisi.html`);
    assertIncludes(html, 'כל שיעורי סיסי', `${name} should label the hub link clearly`);
  }
});

test('Sisi lesson pages stay inside the Sisi flow', () => {
  for (const file of sisiLessonFiles) {
    const html = readFileSync(join(root, file), 'utf8');
    assertNotIncludes(html, 'href="index.html"', `${file} should not send children to the general homepage`);
    assertNotIncludes(html, 'לעמוד הראשי', `${file} should say Sisi page, not generic main page`);
    assertNotIncludes(html, 'חזרה לעמוד הראשי', `${file} should not use a generic main-page label`);
    assertNotIncludes(html, 'href="smart-city.html"', `${file} should not link from Sisi to smart-city`);
    assertNotIncludes(html, 'href="sensi-city.html', `${file} should not link from Sisi to Sensi 15`);
    assertNotIncludes(html, 'href="sensi-classic.html', `${file} should not link from Sisi to Sensi classic`);
  }
});

test('Sisi play pages expose only child-flow navigation, not labs or generic lesson pages', () => {
  for (const file of playFiles) {
    const html = readFileSync(join(root, file), 'utf8');
    assertNotIncludes(html, '-lab.html', `${file} should not send children to lab pages from the main play flow`);
    assertNotIncludes(html, 'עמוד השיעור', `${file} should use Sisi/next navigation instead of a generic lesson-page link`);
    assertIncludes(html, 'לעמוד סיסי', `${file} should include a clear Sisi hub link`);
  }
});

test('hub frames the series for grade B and up and 75-minute lessons', () => {
  assertIncludes(hubHtml, 'כיתות ב׳ ומעלה');
  assertIncludes(hubHtml, '75</b>דק׳ לשיעור');
  assertIncludes(hubHtml, '15</b>מכניקות שונות');
});

test('free lesson cards require registration for guests before entering lessons', () => {
  assertIncludes(hubHtml, 'data-free-lesson');
  assertIncludes(hubHtml, 'data-lesson-href="space.html"');
  assertIncludes(hubHtml, 'data-lesson-href="music.html"');
  assertIncludes(hubHtml, 'data-lesson-href="ocean.html"');
  assertIncludes(hubHtml, 'href="register.html" data-free-lesson data-lesson-href="space.html"');
  assertIncludes(hubHtml, '✅ חינם אחרי הרשמה');
  assertIncludes(hubHtml, 'js/sisi-hub.js');
  assertIncludes(sisiHubJs, '/api/summer/me');
  assertIncludes(sisiHubJs, "link.setAttribute('href', 'register.html')");
  assertIncludes(sisiHubJs, "link.setAttribute('href', target)");
  assertIncludes(sisiHubJs, '✅ פתוח בחשבון שלך');
  assertIncludes(sisiHubJs, 'credentials: \'same-origin\'');
});

test('Sisi play missions unlock progressively after successful completion', () => {
  assertIncludes(certificateSource, 'sisi-mission-completed-v3-', 'course helper should persist completed missions per play page');
  assertIncludes(certificateSource, 'completed.has(id - 1)', 'a mission should open only after the previous mission is completed');
  assertIncludes(certificateSource, 'completed.add(Number(lesson.id))', 'success dialog should mark the current mission complete');
  assertIncludes(certificateSource, 'כדי לפתוח את משימה', 'locked missions should explain which previous mission is required');
  assertIncludes(certificateSource, 'targetId - 1', 'locked mission message should point to the immediate previous mission');
  assertIncludes(certificateSource, 'aria-disabled', 'locked mission buttons should expose disabled state');
  assertIncludes(certificateSource, 'SisiMissionProgress', 'progress helper should be available for future Sisi pages');
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
