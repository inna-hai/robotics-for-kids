import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (path) => readFileSync(join(root, path), 'utf8');

const server = read('server.js');
const teacherClient = read('js/kugel-lesson-zero.js');
const classroomClient = read('js/classroom-platform.js');
const classroomSession = read('js/classroom-session.js');
const studentHtml = read('kugel-student.html');
const teacherHtml = read('kugel-teacher.html');
const teacherHub = read('teacher-classrooms.html');

assert.match(server, /const KUGEL_COURSE_ID = 'craftom-agent'/, 'Minecraft Agent Academy must keep its dedicated course id');
assert.match(server, /if \(courseId === KUGEL_COURSE_ID && lessonId === '0' && activityId === 'minecraft-maze' && status === 'completed'\)/, 'generic classroom progress must not complete Minecraft lesson zero');
assert.match(server, /return \{ kugelDenied: true \}/, 'forged Minecraft maze completion should be denied before DB write');
assert.match(server, /שיעור 0 מושלם רק אחרי בדיקת Minecraft/, 'denied generic Minecraft completion should explain that Monitor verification is required');
assert.match(server, /function completeKugelClassroomProgress\(db, studentId, summary\)/, 'Minecraft completion must keep the dedicated server-side completion path');
assert.match(server, /INSERT INTO classroom_progress[\s\S]*'0', 'minecraft-maze', 'completed'/, 'Minecraft completion should still persist through the verified maze path');
assert.match(server, /function classroomStudentCanAccessCraftomLesson\(db, student, lessonId\)/, 'Minecraft lesson access must stay server-side');
assert.match(server, /craftomOpenedLessonIds\(db, student\.classroom_id\)\.has\(Number\(lessonId\)\)/, 'Minecraft lesson access must depend on teacher-opened lessons');
assert.match(server, /function classroomStudentCompletedCraftomLessonZero\(studentId\)/, 'lesson-zero completion checks should remain explicit');
assert.match(server, /activity_id = 'minecraft-maze' AND status = 'completed'/, 'lesson-zero completion should depend on the verified maze activity');

assert.match(server, /KUGEL_ALWAYS_ON_CLASS_MONITORS/, 'always-on Minecraft classes should stay mapped explicitly');
assert.match(server, /edu-kugel-holon/, 'Hani/Holon always-on Monitor mapping should remain present');
assert.match(server, /edu-kugel-sarit/, 'Sarit always-on Monitor mapping should remain present');
assert.match(server, /\/api\/internal\/minecraft\/live-commands/, 'Minecraft-side polling queue must remain available');
assert.match(server, /const target = command\.scope === 'player' && command\.target \? command\.target : '@a'/, 'class-wide teacher message should still target all Minecraft players');
assert.match(server, /staticPathname = pathname === '\/agent-academy-teacher\.html' \? '\/kugel-teacher\.html' : pathname/, 'public teacher URL should keep serving the existing Minecraft teacher board');

assert.doesNotMatch(studentHtml, /resetOwnMission|ניסיון חדש/, 'student lomda must not re-add the reset-maze button');
assert.doesNotMatch(teacherClient, /\/api\/kugel\/student\/reset/, 'student client must not call the removed manual reset endpoint');
assert.doesNotMatch(teacherClient, /שיגור אל התלמיד|משגרים אל התלמיד|run\('teleport'/, 'teacher UI must not re-add teleport-to-player');
assert.match(teacherHtml, /הודעה לכולם מהמורה/, 'teacher board should keep class-wide teacher message visible');
assert.match(teacherHtml, /עצירת הכיתה/, 'teacher board should keep freeze-class visible');
assert.match(teacherHtml, /שחרור הכיתה/, 'teacher board should keep release-class visible');
assert.doesNotMatch(teacherClient, /liveMinecraftLifecycleActionsAvailable\(\)/, 'teacher lesson actions should not depend on the live monitor lifecycle');
assert.match(teacherClient, /if \(!\(isLessonZero && isActiveLesson\)\) actionRow\.append\(launch\)/, 'teacher lesson action buttons should remain visible even without a live monitor');
assert.match(teacherClient, /teacherLiveControls\.hidden = !showingLessonManagement \|\| !liveMinecraft/, 'always-on monitors should still show message/freeze/release controls when live');
assert.match(teacherClient, /if \(!teacherLiveControls\.hidden\) teacherLiveControls\.open = true/, 'live class controls should open automatically when available');

assert.match(classroomClient, /'craftom-agent': 'craftom-school\/preview\/index\.html'/, 'students should still enter Agent Academy through the course home');
assert.match(classroomClient, /agent-academy-teacher\.html\?classroomId=/, 'teacher hub should link to the scoped Agent Academy board');
assert.match(classroomClient, /renderProgressDashboard/, 'Minecraft class tracking dashboard must stay wired into the teacher hub');
assert.match(classroomClient, /renderMinecraftActionButtons/, 'teacher hub should keep Minecraft message/freeze/release controls');
assert.match(classroomClient, /api\/kugel\/classes/, 'teacher hub controls should use the existing Minecraft API');
assert.match(teacherHub, /כניסת מורה לכל הלומדות/, 'new all-course teacher hub should coexist with Minecraft');
assert.match(classroomSession, /craftom-\(school\|minecraft\|agent\)/, 'classroom session adapter must recognize Agent Academy pages');
assert.match(classroomSession, /if \(\/minecraft\/\.test\(pathname\)\) return 'minecraft'/, 'classroom session adapter must keep the separate Minecraft course mapping');

console.log('✓ Minecraft guardrails protect Agent Academy while other lomdas evolve');
