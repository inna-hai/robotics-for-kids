import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const homepageHtml = readFileSync(join(root, 'index.html'), 'utf8');
const sensiCityHtml = readFileSync(join(root, 'sensi-city.html'), 'utf8');
const smartCityHtml = readFileSync(join(root, 'smart-city.html'), 'utf8');
const teachersHtml = readFileSync(join(root, 'teachers.html'), 'utf8');
const aboutHtml = readFileSync(join(root, 'about.html'), 'utf8');
const slidesIndexHtml = readFileSync(join(root, 'slides', 'index.html'), 'utf8');
const slidesLessonHtml = readFileSync(join(root, 'slides', 'lesson.html'), 'utf8');
const sensiClassicHtml = readFileSync(join(root, 'sensi-classic.html'), 'utf8');
const sensiClassicAboutHtml = readFileSync(join(root, 'sensi-classic-about.html'), 'utf8');
const sensiClassicTeachersHtml = readFileSync(join(root, 'sensi-classic-teachers.html'), 'utf8');
const sensiClassicSlidesIndexHtml = readFileSync(join(root, 'sensi-classic-slides', 'index.html'), 'utf8');

const tests = [];
function test(name, fn) { tests.push({ name, fn }); }
function assertIncludes(source, needle, message = `Missing: ${needle}`) { assert.ok(source.includes(needle), message); }
function assertNotIncludes(source, needle, message = `Unexpected: ${needle}`) { assert.ok(!source.includes(needle), message); }

test('homepage is now a platform gateway and links to primary learning modules', () => {
  assertIncludes(homepageHtml, '<title>פלטפורמת לומדות טכנולוגיה</title>');
  assertIncludes(homepageHtml, 'מרכז הלומדות');
  assertIncludes(homepageHtml, 'href="sensi-city.html?lesson=1"');
  assertIncludes(homepageHtml, 'href="sensi-classic.html?lesson=1"');
  assertIncludes(homepageHtml, 'href="sensi-classic-slides/index.html"');
  assertIncludes(homepageHtml, 'href="pygame.html"');
  assertIncludes(homepageHtml, 'href="roblox.html"');
  assertIncludes(homepageHtml, 'href="python-turtle.html"');
  assertIncludes(homepageHtml, 'href="sisi.html"');
  assertIncludes(homepageHtml, 'סדרת סיסי לכיתות ב׳');
  assertIncludes(homepageHtml, 'href="finale.html"');
  assertIncludes(homepageHtml, 'href="codequest.html"');
  assertIncludes(homepageHtml, 'href="gamelab.html"');
  assertIncludes(homepageHtml, 'href="appforge.html"');
  assertIncludes(homepageHtml, 'href="craftom-school/preview/index.html"');
  assertIncludes(homepageHtml, 'href="craftom-school/README.md"');
});

test('Sensi 15 remains on sensi-city and classic 5-lesson Sensi is restored separately', () => {
  assertIncludes(sensiCityHtml, '<title>🏙️ סנסי בעיר החכמה - 15 שיעורי רובוטיקה</title>');
  assertIncludes(sensiCityHtml, 'Blockly.Blocks');
  assertIncludes(sensiCityHtml, 'currentLesson');
  assertIncludes(sensiCityHtml, 'href="index.html" class="home-link"');
  assertIncludes(sensiCityHtml, '🏠 ראשי');

  assertIncludes(sensiClassicHtml, '<title>🤖 סנסי קלאסי - 5 שיעורי חושים</title>');
  assertIncludes(sensiClassicHtml, 'קלאסי 5 שיעורים');
  assertIncludes(sensiClassicHtml, 'onclick="selectLesson(5)"');
  assertNotIncludes(sensiClassicHtml, 'onclick="selectLesson(6)"');
  assertIncludes(sensiClassicHtml, 'href="sensi-classic-slides/lesson1.html"');
  assertIncludes(sensiClassicHtml, "'sensi-classic-slides/lesson' + num + '.html'");
  assertIncludes(sensiClassicHtml, 'href="index.html"');
});

test('internal Sensi course links no longer point lessons at index.html', () => {
  for (const [name, source] of [
    ['smart-city.html', smartCityHtml],
    ['teachers.html', teachersHtml],
    ['about.html', aboutHtml],
    ['slides/index.html', slidesIndexHtml],
    ['slides/lesson.html', slidesLessonHtml],
  ]) {
    assertNotIncludes(source, 'index.html?lesson=', `${name} should route lessons to sensi-city.html`);
    assertNotIncludes(source, '../index.html?lesson=', `${name} should route slide lessons to sensi-city.html`);
  }
  assertIncludes(smartCityHtml, 'href="sensi-city.html?lesson=1"');
  assertIncludes(teachersHtml, 'href="sensi-city.html?lesson=1"');
  assertIncludes(aboutHtml, 'href="sensi-city.html?lesson=1"');
  assertIncludes(slidesIndexHtml, 'href="../sensi-city.html"');
  assertIncludes(slidesLessonHtml, '../sensi-city.html?lesson=${lesson.id}');
});

test('classic Sensi support pages are isolated from the 15-lesson course', () => {
  assertIncludes(sensiClassicAboutHtml, 'href="sensi-classic.html');
  assertIncludes(sensiClassicTeachersHtml, 'href="sensi-classic.html');
  assertIncludes(sensiClassicSlidesIndexHtml, 'href="../sensi-classic.html');
  assertNotIncludes(sensiClassicAboutHtml, 'href="index.html?lesson=');
  assertNotIncludes(sensiClassicTeachersHtml, 'href="index.html?lesson=');
  assertNotIncludes(sensiClassicSlidesIndexHtml, '../index.html?lesson=');
});

test('homepage local html links point to existing files', () => {
  const hrefs = [...homepageHtml.matchAll(/href="([^"]+\.html(?:\?[^\"]*)?)"/g)].map((match) => match[1]);
  assert.ok(hrefs.length >= 16, 'Homepage should expose a useful course catalog');
  for (const href of hrefs) {
    const clean = href.replace(/^\.\//, '').split('?')[0].split('#')[0];
    assert.ok(existsSync(join(root, clean)), `Missing homepage target: ${href}`);
  }
});

test('primary learning pages expose a visible homepage back link', () => {
  const rootLearningPages = [
    'roblox.html', 'roblox-course.html', 'roblox-slides.html',
    'pygame.html', 'pygame-course.html', 'pygame-slides.html',
    'python-turtle.html', 'python-turtle-course.html',
    'space.html', 'space-play.html',
    'ocean.html', 'ocean-play.html',
    'webcode.html', 'webcode-play.html',
    'minecraft.html', 'minecraft-teachers.html',
    'codequest.html', 'appforge.html',
    'smart-city.html', 'teachers.html',
  ];

  for (const file of rootLearningPages) {
    const source = readFileSync(join(root, file), 'utf8');
    assertIncludes(source, 'class="platform-home-link"', `${file} should include the shared homepage link`);
    assertIncludes(source, 'href="index.html"', `${file} should link back to the platform homepage`);
    assertIncludes(source, 'לעמוד הראשי', `${file} should expose clear Hebrew home text`);
  }

  assertIncludes(slidesIndexHtml, 'class="platform-home-link"', 'slides/index.html should include the shared homepage link');
  assertIncludes(slidesIndexHtml, 'href="../index.html"', 'slides/index.html should link back to the platform homepage');
});

let failed = 0;
for (const { name, fn } of tests) {
  try {
    fn();
    console.log(`✓ ${name}`);
  } catch (error) {
    failed += 1;
    console.error(`✗ ${name}`);
    console.error(error);
  }
}

if (failed) process.exit(1);
