import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const teacherHtml = read('teacher-classrooms.html');
const adminHtml = read('classroom-admin.html');
const teacherJs = read('js/classroom-platform.js');
const adminJs = read('js/classroom-admin.js');

for (const html of [teacherHtml, adminHtml]) {
  assert.match(html, /חשבון Microsoft קיים/);
  assert.doesNotMatch(html, /יצירת חשבון Microsoft/);
  assert.doesNotMatch(html, /סיסמת Minecraft/);
}
assert.match(teacherJs, /minecraftIdentity/);
assert.match(teacherJs, /name = 'upn'/);
assert.match(teacherJs, /name = 'playerName'/);
assert.match(teacherJs, /חשבון Minecraft מאומת נשמר/);
assert.match(teacherJs, /maxLength = 32/);
assert.match(teacherJs, /students\/\$\{encodeURIComponent\(student\.id\)\}\/minecraft\/verify/);
assert.match(adminJs, /minecraftIdentity/);
assert.match(adminJs, /name = 'upn'/);
assert.match(adminJs, /name = 'playerName'/);
assert.match(adminJs, /!teacher\.archivedAt && minecraftStudents\.length/);
assert.match(adminJs, /חשבון Minecraft מאומת נשמר/);
assert.match(adminJs, /maxLength = 32/);
assert.match(adminJs, /admin\/students\/\$\{encodeURIComponent\(student\.id\)\}\/minecraft\/verify/);
assert.doesNotMatch(`${teacherJs}\n${adminJs}`, /password.*minecraft|minecraft.*password/i);
console.log('✓ administrator and owning teacher UIs only link existing Minecraft identities');
