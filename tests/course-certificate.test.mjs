import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const courses = ['space', 'music', 'ocean', 'detective', 'kitchen', 'dino', 'art', 'weather', 'factory', 'garden', 'park', 'mail', 'cinema', 'escape', 'finale'];
const certificateSource = readFileSync(join(root, 'js', 'course-certificate.js'), 'utf8');

const tests = [];
function test(name, fn) { tests.push({ name, fn }); }
function assertIncludes(source, needle, message = `Missing: ${needle}`) { assert.ok(source.includes(needle), message); }

test('shared certificate helper defines a reusable completion certificate', () => {
  assertIncludes(certificateSource, 'window.SisiCourseCertificate');
  assertIncludes(certificateSource, 'תעודת סיום');
  assertIncludes(certificateSource, 'סיימתם את');
  assertIncludes(certificateSource, 'כל שיעורי סיסי');
});

test('all Sisi course play pages load the certificate helper before their play engine', () => {
  for (const course of courses) {
    const html = readFileSync(join(root, `${course}-play.html`), 'utf8');
    const helperIndex = html.indexOf('js/course-certificate.js');
    const playIndex = html.indexOf(`js/${course}-play.js`);
    assert.notEqual(helperIndex, -1, `${course}-play.html should load course-certificate.js`);
    assert.notEqual(playIndex, -1, `${course}-play.html should load its play script`);
    assert.ok(helperIndex < playIndex, `${course}-play.html should load certificate helper before play script`);
  }
});

test('all Sisi course play engines show certificate on successful final mission', () => {
  for (const course of courses) {
    const source = readFileSync(join(root, 'js', `${course}-play.js`), 'utf8');
    assertIncludes(source, 'SisiCourseCertificate?.show', `${course}-play.js should call certificate helper on success`);
  }
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

if (!process.exitCode) console.log(`\n${passed}/${tests.length} course certificate tests passed.`);
