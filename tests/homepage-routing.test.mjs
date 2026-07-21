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

const tests = [];
function test(name, fn) { tests.push({ name, fn }); }
function assertIncludes(source, needle, message = `Missing: ${needle}`) { assert.ok(source.includes(needle), message); }
function assertNotIncludes(source, needle, message = `Unexpected: ${needle}`) { assert.ok(!source.includes(needle), message); }

test('homepage is now a platform gateway and links to primary learning modules', () => {
  assertIncludes(homepageHtml, '<title>פלטפורמת לומדות טכנולוגיה</title>');
  assertIncludes(homepageHtml, 'מרכז הלומדות');
  assertIncludes(homepageHtml, 'href="sensi-city.html?lesson=1"');
  assertIncludes(homepageHtml, 'href="pygame.html"');
  assertIncludes(homepageHtml, 'href="roblox.html"');
  assertIncludes(homepageHtml, 'href="python-turtle.html"');
  assertIncludes(homepageHtml, 'href="space.html"');
  assertIncludes(homepageHtml, 'href="ocean.html"');
});

test('original Sensi Blockly application moved to sensi-city.html', () => {
  assertIncludes(sensiCityHtml, '<title>🏙️ סנסי בעיר החכמה - 15 שיעורי רובוטיקה</title>');
  assertIncludes(sensiCityHtml, 'Blockly.Blocks');
  assertIncludes(sensiCityHtml, 'currentLesson');
  assertIncludes(sensiCityHtml, 'href="index.html" class="home-link"');
  assertIncludes(sensiCityHtml, '🏠 ראשי');
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

test('homepage local html links point to existing files', () => {
  const hrefs = [...homepageHtml.matchAll(/href="([^"]+\.html(?:\?[^\"]*)?)"/g)].map((match) => match[1]);
  assert.ok(hrefs.length >= 16, 'Homepage should expose a useful course catalog');
  for (const href of hrefs) {
    const clean = href.replace(/^\.\//, '').split('?')[0].split('#')[0];
    assert.ok(existsSync(join(root, clean)), `Missing homepage target: ${href}`);
  }
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
