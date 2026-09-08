import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = path => readFileSync(join(root, path), 'utf8');

for (const path of [
  'kugel-student.html',
  'kugel-teacher.html',
  'assets/kugel/kugel-lomda-interfaces.css',
  'js/kugel-lesson-zero.js',
]) assert.ok(existsSync(join(root, path)), `missing selective lesson-zero asset: ${path}`);

const student = read('kugel-student.html');
const teacher = read('kugel-teacher.html');
const client = read('js/kugel-lesson-zero.js');
const classroomClient = read('js/classroom-platform.js');
const server = read('server.js');
const packageJson = read('package.json');

assert.match(student, /שיעור 0/);
assert.match(student, /מבוך המטבעות/);
assert.match(student, /פתחו את Minecraft/);
assert.match(student, /minecraftAccessCode/);
assert.match(student, /המשך לשיעור 1/);
assert.doesNotMatch(student, /name="studentName"/, 'student identity must come from the authenticated classroom session');
assert.doesNotMatch(student, /href="kugel-teacher\.html"/, 'students must not receive a shortcut to teacher controls');

assert.match(teacher, /ניהול Minecraft לכיתה/);
assert.match(teacher, /בחירת שיעור Minecraft/);
assert.match(teacher, /minecraftLessonList/);
assert.match(teacher, /לוח התלמידים/);
assert.match(teacher, /עצירת הכיתה/);
assert.match(teacher, /שחרור הכיתה/);
assert.match(teacher, /סיום השיעור ושחרור השרת/);

for (const endpoint of [
  '/api/kugel/session',
  '/api/kugel/student/start',
  '/api/kugel/student/reset',
  '/api/kugel/student/finish',
  '/launch',
  '/stop',
  '/message',
  '/freeze',
  '/minecraft',
]) assert.ok(client.includes(endpoint), `Kugel client missing ${endpoint}`);
assert.match(client, /lessons\/\$\{encodeURIComponent\(lessonId\)\}\/launch/);
assert.match(client, /חסר עולם Minecraft/);
assert.match(client, /craftom-minecraft-lesson-\$\{lesson.id\}\.html/);
assert.ok(client.includes("page === 'teacher'"));
assert.ok(client.includes("page === 'student'"));
assert.ok(client.includes('classroomId'));
assert.ok(client.includes('minecraftPlayerName'));
assert.ok(client.includes('replaceChildren'));
assert.ok(!client.includes('localStorage'), 'Kugel completion and identity must not trust localStorage');
assert.ok(!client.includes('program.lessons'), 'the selective integration must not duplicate the existing 16 lessons');
assert.ok(!client.includes('DEFAULT_KUGEL_STUDENTS'), 'the live roster must come from the authenticated classroom');

assert.ok(classroomClient.includes('kugel-teacher.html?classroomId='), 'teacher class cards must link to their scoped lesson-zero board');
assert.ok(classroomClient.includes("'craftom-agent': 'kugel-student.html'"), 'classroom students should enter lesson zero before the existing course');
assert.match(server, /basename === 'kugel-student'/);
assert.match(server, /basename === 'kugel-teacher'/);
assert.match(server, /kugel-50-safe-compounds-v3-mazes-8-coins-npc-reset-caged-inner-wood-obstacle-test-v1-20260906/);
assert.match(server, /movement-buttons-practice/);
assert.ok(packageJson.includes('node --check js/kugel-lesson-zero.js'));
console.log('✓ Kugel UI contains only secure lesson zero and links back to the existing course');
