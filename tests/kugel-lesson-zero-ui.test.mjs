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
const teacherClient = client.slice(client.indexOf('async function initTeacher'));
const classroomClient = read('js/classroom-platform.js');
const challengeData = read('js/craftom-minecraft-challenges.js');
const interfacesCss = read('assets/kugel/kugel-lomda-interfaces.css');
const server = read('server.js');
const packageJson = read('package.json');

assert.match(student, /שיעור 0/);
assert.match(student, /אוספים 8 מטבעות במבוך/);
assert.match(student, /פתחו את Minecraft/);
assert.match(student, /minecraftAccessCode/);
assert.match(student, /המשך לשיעור 1/);
assert.match(student, /20260924-lesson-zero-clear-copy-1/, 'lesson zero should load the current lesson-access client');
assert.doesNotMatch(student, /name="studentName"/, 'student identity must come from the authenticated classroom session');
assert.doesNotMatch(student, /href="kugel-teacher\.html"/, 'students must not receive a shortcut to teacher controls');

assert.match(teacher, /ניהול Minecraft לכיתה/);
assert.match(teacher, /teacherCourseHeaderNav/);
assert.match(teacher, /teacher-classrooms-button/);
assert.match(teacher, /href="teacher-classrooms\.html\?fromTeacherBoard=1">חזרה לכיתות שלי/, 'teacher class return button should go straight back to the class list flow');
assert.doesNotMatch(teacher, /teacher-return-topbar/);
assert.doesNotMatch(teacher, /brand-mark teacher-mark/);
assert.doesNotMatch(teacher, /<strong>Craftom<\/strong><small>חזרה לכיתות שלי<\/small>/);
assert.match(teacher, /דף הבית/);
assert.match(teacher, /teacherHomeOverview/);
assert.match(teacher, /teacherHomeChallenges/);
assert.match(teacher, /steps teacher-home-challenges/);
assert.match(teacher, /teacherHomeClassName/);
assert.match(teacher, /teacherHomeActiveLesson/);
assert.match(teacher, /teacherHomeMinecraftState/);
assert.match(teacher, /hero teacher-hero/);
assert.match(teacher, /card build-first teacher-hero-summary-card/);
assert.match(teacher, /grid-4 teacher-home-status/);
assert.match(teacher, /card highlight/);
assert.match(teacher, /teacher-hero-summary-card/);
assert.match(teacher, /teacherProgramVideoPreview/);
assert.match(teacher, /card program-video-card teacher-program-card/);
assert.match(teacher, /teacher-program-card/);
assert.doesNotMatch(teacher, /teacher-home-hero-row/);
assert.doesNotMatch(teacher, /teacher-home-flow/);
assert.doesNotMatch(teacher, /דף הבית של המורה/);
assert.doesNotMatch(teacher, /מבוא למורה/);
assert.match(teacher, /בחירת שיעור לפתיחה/);
assert.match(teacher, /בחירת שיעור לפי אתגרים/);
assert.doesNotMatch(teacher, /תצוגת תלמיד לשיעור פתיחה/);
assert.doesNotMatch(teacher, /teacherHomeStudentPreview/);
assert.doesNotMatch(teacher, /teacherHomeCurrentLesson/);
assert.doesNotMatch(teacher, /תצוגה מקדימה לתלמיד/);
assert.match(teacher, /הכיתה שאתה מנהל כרגע/);
assert.match(teacher, /מה התלמידים בונים/);
assert.match(teacher, /מעקב תלמידים/);
assert.match(teacher, /המורה משייך לכל תלמיד/);
assert.doesNotMatch(teacher, /כתלמידה|התלמידות|תלמידות|את מנהלת|משייכת/);
assert.match(teacher, /teacher-hero-actions/);
assert.doesNotMatch(teacher, /teacherLessonMenu/);
assert.doesNotMatch(teacher, /teacherLessonMenuOptions/);
assert.doesNotMatch(teacher, /teacherHomeMinecraftActions/);
assert.doesNotMatch(teacher, /teacherLessonPickerForm/);
assert.doesNotMatch(teacher, /teacherLessonSelect/);
assert.match(teacher, /20260914-video-first-frames-1/, 'teacher board cache-busts the challenge data posters');
assert.match(teacher, /20260924-lesson-zero-clear-copy-1/, 'teacher board cache-busts the lesson-zero home status update');
assert.match(teacher, /rel="preload" as="image" href="assets\/craftom\/challenges\/craftom-program-real-minecraft-gemini-live-1x-first-frame\.webp"/, 'teacher home should preload the first visible video poster');
assert.match(teacher, /craftom-challenge4-smart-city-automations-gemini-live-1x-first-frame\.webp" type="image\/webp"/, 'teacher home should preload challenge video posters');
assert.ok(teacher.indexOf('hero teacher-hero') < teacher.indexOf('teacher-control'), 'teacher hero should be the first panel in the teacher board');
assert.ok(teacher.indexOf('teacher-classrooms-button') > teacher.indexOf('hero teacher-hero'), 'teacher class return button should live inside the hero panel');
assert.ok(teacher.indexOf('teacher-control') < teacher.indexOf('selectedTeacherLesson'), 'teacher controls should be the first compact lesson panel');
assert.ok(teacher.indexOf('selectedTeacherLesson') < teacher.indexOf('teacher-main'), 'selected teacher lesson should sit beside controls before the rest of the board');
assert.match(teacher, /selectedTeacherLesson/);
assert.match(teacher, /id="selectedTeacherLesson"[^>]*hidden/, 'selected lesson placeholder should stay hidden until a lesson is selected');
assert.match(teacher, /teacherChallengeOverview/);
assert.match(teacher, /teacherChallengeVideoPreview/);
assert.match(teacher, /teacher-challenge-intro/);
assert.doesNotMatch(teacher, /בחירת שיעור Minecraft/);
assert.doesNotMatch(teacher, /minecraftLessonList/);
assert.match(teacher, /לוח התלמידים/);
assert.match(teacher, /teacher-student-board-details/);
assert.ok(teacher.indexOf('<summary>לוח התלמידים</summary>') < teacher.indexOf('id="studentMonitor"'), 'student board opens from its summary before the monitor');
assert.match(teacher, /עצירת הכיתה/);
assert.match(teacher, /שחרור הכיתה/);
assert.match(teacher, /details class="panel compact-panel teacher-live-controls teacher-live-controls-bottom"/);
assert.match(teacher, /בקרה כיתתית ושרת Minecraft/);
assert.ok(teacher.indexOf('id="teacherLiveControls"') > teacher.indexOf('teacherStudentBoard'), 'live classroom controls should sit folded after the lesson content');
assert.ok(teacher.indexOf('server-status-card') > teacher.indexOf('id="teacherLiveControls"'), 'server status should live inside the folded bottom controls');

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
]) assert.ok(client.includes(endpoint), `Agent Academy client missing ${endpoint}`);
assert.match(client, /lessons\/\$\{encodeURIComponent\(lessonId\)\}\/launch/);
assert.match(client, /חסר עולם Minecraft/);
assert.match(client, /craftom-minecraft-lesson-\$\{lessonId\}\.html\?\$\{suffix\}/, 'teacher student previews should include the return query on lesson pages');
assert.match(client, /teacherPageUrl\(\{ challenge: challengeId \}\)/);
assert.doesNotMatch(client, /renderTeacherLessonSelect/);
assert.doesNotMatch(client, /teacherLessonPickerForm/);
assert.match(client, /renderTeacherHome\(lessons, session, activeLessonId, data\)/);
assert.match(client, /teacherHomeLessonPickerLink\.hidden = !showingTeacherHome/, 'lesson picker hero action should only show on the teacher home screen');
assert.match(client, /session\.active \|\| Number\(activeLessonId\) === 0/, 'teacher home should treat lesson zero as open even when the Minecraft server is idle');
assert.match(client, /function teacherProgramLessons\(\)/, 'teacher home should have fallback lesson data before a classroom session loads');
assert.match(client, /render\(\{\s*classroom: \{ name: 'כיתה' \},\s*session: \{\},\s*lessons: teacherProgramLessons\(\)/s, 'teacher home and challenge views should render fallback program data without a classroom id');
assert.match(client, /const selectedId = hasRequestedLesson \? requested : \(fallback \|\| 0\)/, 'an explicit lesson=0 must not fall back to a different active lesson');
assert.match(client, /document\.body\.classList\.toggle\('is-teacher-lesson'/);
assert.match(client, /document\.body\.classList\.toggle\('is-lesson-zero'[^)]*selectedLessonId === 0\)/s, 'teacher maze illustration should be scoped to lesson zero');
assert.match(client, /teacherProgramVideoPreview/);
assert.match(client, /program\?\.overviewVideo/);
assert.match(client, /video:\s*challenge\?\.video \|\| ''/, 'teacher challenge pages should pass the actual challenge video to the player');
assert.match(client, /poster:\s*challenge\?\.poster \|\| ''/, 'teacher challenge pages should pass the actual challenge poster to the player');
assert.match(client, /function rootAssetPath\(path\)/);
assert.match(client, /function craftomPosterPath\(path\)/);
assert.match(client, /function setMediaSource\(media, attribute, value\)/);
assert.match(client, /\/api\/craftom\/challenge-posters\/\$\{encodeURIComponent\(filename\)\}/);
assert.match(client, /if \(!teacherHomeChallenges\.dataset\.rendered\)/, 'teacher home video cards should not be rebuilt on every live refresh');
assert.match(client, /teacherHomeChallenges\.dataset\.rendered = 'true'/);
assert.match(client, /delete teacherHomeChallenges\.dataset\.rendered/);
assert.match(client, /renderTeacherVideoPreview\(/, 'teacher home and challenge screens should render actual video players');
assert.match(client, /video\.controls = true/);
assert.match(client, /video\.preload = 'metadata'/);
assert.match(client, /video\.playsInline = true/);
assert.match(client, /frame\.dataset\.videoSrc === videoUrl/, 'teacher video players should not be recreated on every live refresh');
assert.doesNotMatch(client, /teacher-video-play/);
assert.match(client, /const posterUrl = craftomPosterPath\(poster\)/, 'teacher poster images should use the WebP MIME-safe API path');
assert.match(client, /setMediaSource\(video, 'src', videoUrl\)/);
assert.match(client, /setMediaSource\(video, 'poster', posterUrl\)/);
assert.match(client, /querySelectorAll\('\[data-lesson-id\]'\)/, 'teacher home refresh should update active lesson links without recreating videos');
assert.match(client, /card lesson-card teacher-home-challenge/);
assert.match(client, /challenge-video/);
assert.match(client, /meeting-list/);
assert.match(client, /challenge-actions/);
assert.match(client, /minecraftStateLabel\(session\)/);
assert.match(client, /teacherHomeOverview\.hidden = !onTeacherHome/);
assert.doesNotMatch(client, /teacherHomeCurrentLesson/, 'teacher home top actions should not duplicate the lesson picker');
assert.doesNotMatch(client, /teacherHomeStudentPreview/, 'student preview should not appear as a top-level home action');
assert.match(client, /function teacherReturnQuery\(lessonId\)/, 'teacher links should mark student/slides pages as opened from teacher management');
assert.match(client, /next\.set\('teacherReturn', '1'\)/, 'teacher return query should be attached to teacher-launched preview pages');
assert.match(client, /function studentPreviewUrl\(lessonId\)/, 'teacher preview links should route through a shared preview URL helper');
assert.match(client, /slides\.href = `craftom-minecraft-slides\.html\?challenge=\$\{lesson\.challengeId \|\| Math\.ceil\(Number\(lesson\.id\) \/ 4\)\}&\$\{teacherReturnQuery\(lesson\.id\)\}`/, 'teacher slides should include a return link target');
assert.match(client, /חזרה לניהול שיעור מורה/, 'teacher-launched lesson-zero preview should include a return action');
assert.match(client, /שיעור \$\{lesson\.id\}/, 'teacher home lesson buttons should use clear lesson labels');
assert.match(client, /בחר שיעור כדי לפתוח את מסך הניהול המלא שלו/);
assert.match(client, /עוצרים את התלמיד/);
assert.doesNotMatch(teacherClient, /בחרי שיעור|התלמיד\/ה/, 'teacher screen copy should use masculine wording');
assert.doesNotMatch(client, /teacherLessonMenuOptions/);
assert.match(client, /teacherPageUrl\(\{ lesson: lesson\.id \}\)/);
assert.match(client, /function formatDuration\(ms\)/, 'lesson-zero metrics should use a shared duration formatter');
assert.match(client, /function formatDuration\(ms\)[\s\S]{0,120}ms === null \|\| ms === undefined/, 'missing durations must not be rendered as zero seconds');
assert.match(client, /coinProgress\.textContent = `[\s\S]*student\.attemptCount[\s\S]*formatDuration\(student\.lastDurationMs\)[\s\S]*formatDuration\(student\.bestTimeMs\)/, 'students should see verified attempt, last-duration, and best-time metrics');
assert.match(client, /ניסיונות: \$\{Number\(student\.attemptCount \|\| 0\)\}/, 'teachers should see the completed attempt count');
assert.match(client, /משך אחרון: \$\{formatDuration\(student\.lastDurationMs\)\}/, 'teachers should see the last completed duration');
assert.match(client, /שיא: \$\{formatDuration\(student\.bestTimeMs\)\}/, 'teachers should see the personal best');
assert.match(client, /progress\.append\([\s\S]{0,300}student\.minecraftStatus === 'started' \? 'בתהליך' : 'לא התחיל'/, 'historical lesson tracking must not reuse a different lesson’s startedAt timestamp');
assert.match(client, /renderTeacherHeader\(selectedLesson, activeLessonId\)/);
assert.match(client, /חסר מזהה כיתה\. יש לפתוח את הלוח מתוך כרטיס הכיתה\./);
assert.match(client, /renderSelectedLesson\(selectedLesson, session, activeLessonId, minecraftBlocked\)/);
assert.match(client, /renderTeacherChallenge\(challenge, lessons, selectedLessonId\)/);
assert.match(client, /teacherChallengeVideoPreview/);
assert.match(client, /card lesson-card teacher-challenge-lesson/, 'teacher challenge lesson cards should match the student challenge card style');
assert.match(client, /צפייה כשיעור תלמיד/);
assert.match(client, /selectedLessonActions\.replaceChildren/);
assert.ok(client.includes("page === 'teacher'"));
assert.ok(client.includes("page === 'student'"));
assert.ok(client.includes('classroomId'));
assert.ok(client.includes('minecraftPlayerName'));
assert.ok(client.includes('replaceChildren'));
assert.ok(!client.includes('localStorage'), 'Agent Academy completion and identity must not trust localStorage');
assert.ok(!client.includes('program.lessons'), 'the selective integration must not duplicate the existing 16 lessons');
assert.ok(!client.includes('DEFAULT_KUGEL_STUDENTS'), 'the live roster must come from the authenticated classroom');
assert.match(interfacesCss, /\.teacher-board\s*{[^}]*grid-template-columns:\s*1fr/s, 'teacher board should be a single vertical column');
assert.match(interfacesCss, /\.teacher-app\.is-teacher-home \.teacher-control,\s*\.teacher-app\.is-teacher-challenge \.teacher-control\s*{[^}]*display:\s*none/s, 'teacher challenge pages should not show the lesson-management Minecraft panel');
assert.match(interfacesCss, /\.teacher-course-header \.course-nav\s*{[^}]*flex:\s*1/s, 'teacher course header navigation should stay compact instead of stretching into wide columns');
assert.match(interfacesCss, /\.teacher-course-header \.course-nav a\s*{[^}]*flex:\s*0 0 auto/s, 'teacher header buttons should keep natural compact widths');
assert.match(interfacesCss, /\.teacher-app\.is-teacher-home \.teacher-shell\s*{[^}]*width:\s*min\(1180px, calc\(100% - 28px\)\)/s, 'teacher home should use the same page width as the student home');
assert.match(interfacesCss, /\.teacher-app\.is-teacher-home \.teacher-hero\s*{[^}]*grid-template-columns:\s*minmax\(0, 1fr\) 420px/s, 'teacher home hero should mirror the student home intro layout');
assert.match(interfacesCss, /\.teacher-app\.is-teacher-home \.maze-preview,\s*\.teacher-app\.is-teacher-home \.server-status-card\s*{[^}]*display:\s*none/s, 'teacher home should hide lesson status cards like the student home');
assert.match(interfacesCss, /\.teacher-app \.teacher-hero \.maze-preview\s*{[^}]*display:\s*none/s, 'teacher maze illustration should not appear on Agent Academy lessons');
assert.match(interfacesCss, /\.teacher-app\.is-teacher-lesson\.is-lesson-zero \.teacher-hero \.maze-preview\s*{[^}]*display:\s*grid/s, 'teacher maze illustration should remain available for lesson zero');
assert.match(interfacesCss, /\.teacher-program-card\s*{[^}]*grid-template-columns:\s*minmax\(0, 1\.1fr\) minmax\(280px, \.9fr\)/s, 'teacher home should use a student-home-like video card');
assert.match(interfacesCss, /\.teacher-challenge-intro\s*{[^}]*grid-template-columns:\s*minmax\(0, 1\.1fr\) minmax\(280px, \.9fr\)/s, 'teacher challenge view should use the student challenge video-card layout');
assert.match(interfacesCss, /\.teacher-app\.is-teacher-home \.challenge-video,\s*\.teacher-app\.is-teacher-home \.teacher-video-preview,\s*\.teacher-app\.is-teacher-challenge \.challenge-video,\s*\.teacher-app\.is-teacher-challenge \.teacher-video-preview\s*{[^}]*background:\s*#dfeef8/s, 'teacher home and challenge video previews should show poster cards instead of black video blocks');
assert.doesNotMatch(interfacesCss, /teacher-home-flow/, 'teacher home should not keep the old internal workflow card row');
assert.match(interfacesCss, /\.teacher-home-challenge \.meeting-list\s*{[^}]*list-style:\s*none/s, 'teacher home challenge cards should use the same lesson-list structure as the student cards');
assert.match(interfacesCss, /\.teacher-app\.is-teacher-lesson \.teacher-board\s*{[^}]*grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\)/s, 'teacher lesson view should show the first two panels as equal compact columns');
assert.match(interfacesCss, /\.teacher-app\.is-teacher-lesson \.teacher-board\s*{[^}]*align-items:\s*stretch/s, 'parallel teacher lesson panels should share the same visual height');
assert.match(interfacesCss, /\.teacher-app\.is-teacher-lesson \.teacher-control\s*{[^}]*align-self:\s*start/s, 'teacher control should fit its compact content instead of stretching to the neighboring panel');
assert.match(interfacesCss, /\.teacher-app\.is-teacher-lesson \.teacher-control h1\s*{[^}]*font-size:\s*1\.02rem/s, 'teacher control should use compact heading size');
assert.match(interfacesCss, /\.teacher-app\.is-teacher-lesson \.teacher-main\s*{[^}]*grid-column:\s*1 \/ -1/s, 'only the first two lesson panels should be parallel');
assert.match(interfacesCss, /\.teacher-student-board-details summary\s*{[^}]*cursor:\s*pointer/s, 'student board heading should be clickable');
assert.doesNotMatch(interfacesCss, /\.student-layout,\s*\.teacher-board\s*{[^}]*grid-template-columns:\s*330px/s, 'teacher board must not share the student two-column grid');
assert.doesNotMatch(interfacesCss, /teacher-lesson-menu/, 'teacher lesson dropdown should be removed from the home page');

assert.ok(classroomClient.includes('kugel-teacher.html?classroomId='), 'teacher class cards must link to their scoped lesson-zero board');
assert.ok(classroomClient.includes("'craftom-agent': 'kugel-student.html'"), 'classroom students should enter the open lesson-zero page');
assert.ok(server.includes("Location: '/kugel-student.html'"), 'unfinished Craftom students should be redirected to lesson zero from the course home');
assert.ok(client.includes('סגירת עולם Minecraft לשיעור הפתיחה'), 'active teacher lesson-zero button should become an end-lesson action');
assert.ok(client.includes("scoped('/stop')"), 'active teacher lesson button should release the Minecraft server');
assert.match(server, /basename === 'kugel-student'/);
assert.match(server, /basename === 'kugel-teacher'/);
assert.match(server, /'\.webp': 'image\/webp'/, 'Craftom video posters must be served with a browser-safe WebP MIME type');
assert.match(server, /\/api\\\/craftom\\\/challenge-posters\\\/\(\[\^\/\]\+\\\.webp\)/, 'teacher home should expose a safe poster endpoint for Craftom WebP previews');
assert.match(server, /'Content-Type': 'image\/webp'/, 'Craftom poster endpoint must force the WebP MIME type');

for (const poster of [
  'craftom-program-real-minecraft-gemini-live-1x-first-frame.webp',
  'craftom-challenge1-explainer-gemini-live-1.12x-first-frame.webp',
  'craftom-challenge2-delivery-line-gemini-live-1x-first-frame.webp',
  'craftom-challenge3-smart-delivery-line-gemini-live-1x-first-frame.webp',
  'craftom-challenge4-smart-city-automations-gemini-live-1x-first-frame.webp',
]) {
  assert.match(challengeData, new RegExp(poster.replace(/[.]/g, '\\.')), `Craftom challenge data should use first-frame poster: ${poster}`);
  assert.ok(existsSync(join(root, 'assets/craftom/challenges', poster)), `missing generated first-frame poster: ${poster}`);
}
assert.match(server, /kugel-50-safe-compounds-v3-mazes-8-coins-npc-reset-caged-inner-wood-obstacle-test-v1-20260906/);
assert.match(server, /kugel-50-safe-compounds-v3-20260824/);
assert.match(server, /trackedLessonId === 0[\s\S]{0,140}summary\.completionRecorded/, 'lesson-zero tracking must use persisted lesson-zero completion, not another lesson’s run state');
assert.ok(packageJson.includes('node --check js/kugel-lesson-zero.js'));
console.log('✓ Agent Academy UI contains only secure lesson zero and links back to the existing course');
