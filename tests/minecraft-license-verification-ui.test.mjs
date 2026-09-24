import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const teacherHtml = read('teacher-classrooms.html');
const adminHtml = read('classroom-admin.html');
const teacherJs = read('js/classroom-platform.js');
const adminJs = read('js/classroom-admin.js');

for (const html of [teacherHtml, adminHtml]) {
  assert.doesNotMatch(html, /יצירת חשבון Microsoft/);
  assert.doesNotMatch(html, /סיסמת Minecraft/);
}
assert.match(teacherJs, /minecraftIdentity/);
assert.match(teacherJs, /שם משתמש Minecraft/);
assert.doesNotMatch(teacherJs, /minecraftIdentity\.playerName/);
assert.doesNotMatch(teacherJs, /name = 'upn'/);
assert.doesNotMatch(teacherJs, /verify-minecraft-identity/);
assert.doesNotMatch(teacherJs, /students\/\$\{encodeURIComponent\(student\.id\)\}\/minecraft\/verify/);
assert.match(adminJs, /minecraftIdentity/);
assert.match(adminJs, /!teacher\.archivedAt && minecraftStudents\.length/);
assert.match(adminJs, /חשבון Minecraft:/);
assert.doesNotMatch(adminJs, /minecraftIdentity\.playerName/);
assert.doesNotMatch(adminJs, /name = 'upn'/);
assert.doesNotMatch(adminJs, /admin\/students\/\$\{encodeURIComponent\(student\.id\)\}\/minecraft\/verify/);
assert.doesNotMatch(`${teacherJs}\n${adminJs}`, /password.*minecraft|minecraft.*password/i);
console.log('✓ administrator and owning teacher UIs show Minecraft identity status without manual verification controls');
