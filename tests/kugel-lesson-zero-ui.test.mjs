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
const interfacesCss = read('assets/kugel/kugel-lomda-interfaces.css');
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
assert.match(teacher, /teacherCourseHeaderNav/);
assert.match(teacher, /teacher-classrooms-button/);
assert.doesNotMatch(teacher, /teacher-return-topbar/);
assert.doesNotMatch(teacher, /brand-mark teacher-mark/);
assert.doesNotMatch(teacher, /<strong>Craftom<\/strong><small>חזרה לכיתות שלי<\/small>/);
assert.match(teacher, /דף הבית/);
assert.match(teacher, /teacherHomeOverview/);
assert.match(teacher, /teacherHomeChallenges/);
assert.match(teacher, /teacherHomeWelcome/);
assert.match(teacher, /teacherHomeClassName/);
assert.match(teacher, /teacherHomeActiveLesson/);
assert.match(teacher, /teacherHomeMinecraftState/);
assert.doesNotMatch(teacher, /בחירת שיעור לפתיחה/);
assert.doesNotMatch(teacher, /teacherLessonMenu/);
assert.doesNotMatch(teacher, /teacherLessonMenuOptions/);
assert.doesNotMatch(teacher, /teacherHomeMinecraftActions/);
assert.doesNotMatch(teacher, /teacherLessonPickerForm/);
assert.doesNotMatch(teacher, /teacherLessonSelect/);
assert.match(teacher, /20260910-collapsible-student-board-1/, 'teacher board cache-busts the collapsible student board layout');
assert.ok(teacher.indexOf('workspace-hero teacher-hero') < teacher.indexOf('teacher-control'), 'teacher hero should be the first panel in the teacher board');
assert.ok(teacher.indexOf('teacher-classrooms-button') > teacher.indexOf('workspace-hero teacher-hero'), 'teacher class return button should live inside the hero panel');
assert.ok(teacher.indexOf('teacher-control') < teacher.indexOf('selectedTeacherLesson'), 'teacher controls should be the first compact lesson panel');
assert.ok(teacher.indexOf('selectedTeacherLesson') < teacher.indexOf('teacher-main'), 'selected teacher lesson should sit beside controls before the rest of the board');
assert.match(teacher, /selectedTeacherLesson/);
assert.match(teacher, /id="selectedTeacherLesson"[^>]*hidden/, 'selected lesson placeholder should stay hidden until a lesson is selected');
assert.match(teacher, /teacherChallengeOverview/);
assert.doesNotMatch(teacher, /בחירת שיעור Minecraft/);
assert.doesNotMatch(teacher, /minecraftLessonList/);
assert.match(teacher, /לוח התלמידים/);
assert.match(teacher, /teacher-student-board-details/);
assert.ok(teacher.indexOf('<summary>לוח התלמידים</summary>') < teacher.indexOf('id="studentMonitor"'), 'student board opens from its summary before the monitor');
assert.match(teacher, /עצירת הכיתה/);
assert.match(teacher, /שחרור הכיתה/);

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
assert.match(client, /teacherPageUrl\(\{ challenge: challengeId \}\)/);
assert.doesNotMatch(client, /renderTeacherLessonSelect/);
assert.doesNotMatch(client, /teacherLessonPickerForm/);
assert.match(client, /renderTeacherHome\(lessons, session, activeLessonId, data\)/);
assert.match(client, /document\.body\.classList\.toggle\('is-teacher-lesson'/);
assert.match(client, /teacherHomeWelcome\.textContent/);
assert.match(client, /minecraftStateLabel\(session\)/);
assert.match(client, /teacherHomeOverview\.hidden = !onTeacherHome/);
assert.match(client, /teacherHomeCurrentLesson\.href = activeLesson \? teacherPageUrl\(\{ lesson: activeLesson\.id \}\) : '#teacherHomeChallenges'/);
assert.doesNotMatch(client, /teacherLessonMenuOptions/);
assert.match(client, /teacherPageUrl\(\{ lesson: lesson\.id \}\)/);
assert.match(client, /renderTeacherHeader\(selectedLesson, activeLessonId\)/);
assert.match(client, /חסר מזהה כיתה\. יש לפתוח את הלוח מתוך כרטיס הכיתה\./);
assert.match(client, /renderSelectedLesson\(selectedLesson, session, activeLessonId, minecraftBlocked\)/);
assert.match(client, /renderTeacherChallenge\(challenge, lessons, selectedLessonId\)/);
assert.match(client, /selectedLessonActions\.replaceChildren/);
assert.ok(client.includes("page === 'teacher'"));
assert.ok(client.includes("page === 'student'"));
assert.ok(client.includes('classroomId'));
assert.ok(client.includes('minecraftPlayerName'));
assert.ok(client.includes('replaceChildren'));
assert.ok(!client.includes('localStorage'), 'Kugel completion and identity must not trust localStorage');
assert.ok(!client.includes('program.lessons'), 'the selective integration must not duplicate the existing 16 lessons');
assert.ok(!client.includes('DEFAULT_KUGEL_STUDENTS'), 'the live roster must come from the authenticated classroom');
assert.match(interfacesCss, /\.teacher-board\s*{[^}]*grid-template-columns:\s*1fr/s, 'teacher board should be a single vertical column');
assert.match(interfacesCss, /\.teacher-app\.is-teacher-lesson \.teacher-board\s*{[^}]*grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\)/s, 'teacher lesson view should show the first two panels as equal compact columns');
assert.match(interfacesCss, /\.teacher-app\.is-teacher-lesson \.teacher-board\s*{[^}]*align-items:\s*stretch/s, 'parallel teacher lesson panels should share the same visual height');
assert.doesNotMatch(interfacesCss, /\.teacher-app\.is-teacher-lesson \.teacher-control\s*{[^}]*align-self:\s*start/s, 'teacher control should not leave a short-panel gap in the first pair');
assert.match(interfacesCss, /\.teacher-app\.is-teacher-lesson \.teacher-main\s*{[^}]*grid-column:\s*1 \/ -1/s, 'only the first two lesson panels should be parallel');
assert.match(interfacesCss, /\.teacher-student-board-details summary\s*{[^}]*cursor:\s*pointer/s, 'student board heading should be clickable');
assert.doesNotMatch(interfacesCss, /\.student-layout,\s*\.teacher-board\s*{[^}]*grid-template-columns:\s*330px/s, 'teacher board must not share the student two-column grid');
assert.doesNotMatch(interfacesCss, /teacher-lesson-menu/, 'teacher lesson dropdown should be removed from the home page');

assert.ok(classroomClient.includes('kugel-teacher.html?classroomId='), 'teacher class cards must link to their scoped lesson-zero board');
assert.ok(classroomClient.includes("'craftom-agent': 'kugel-student.html'"), 'classroom students should enter lesson zero before the existing course');
assert.ok(client.includes('סיום שיעור'), 'active teacher Minecraft lesson button should become an end-lesson action');
assert.ok(client.includes("scoped('/stop')"), 'active teacher lesson button should release the Minecraft server');
assert.match(server, /basename === 'kugel-student'/);
assert.match(server, /basename === 'kugel-teacher'/);
assert.match(server, /kugel-50-safe-compounds-v3-mazes-8-coins-npc-reset-caged-inner-wood-obstacle-test-v1-20260906/);
assert.match(server, /kugel-50-safe-compounds-v3-20260824/);
assert.ok(packageJson.includes('node --check js/kugel-lesson-zero.js'));
console.log('✓ Kugel UI contains only secure lesson zero and links back to the existing course');
