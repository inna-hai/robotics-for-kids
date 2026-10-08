import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import vm from 'node:vm';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const read = (path) => readFileSync(join(root, path), 'utf8');
assert.ok(existsSync(join(root, 'classroom-admin.html')), 'missing secure classroom administrator page');
assert.ok(existsSync(join(root, 'js/classroom-admin.js')), 'missing classroom administrator client');

const index = read('index.html');
const entry = read('classroom-entry.html');
const teacher = read('teacher-classrooms.html');
const admin = read('classroom-admin.html');
const adminClient = read('js/classroom-admin.js');
const client = read('js/classroom-platform.js');
const entryClient = read('js/classroom-entry.js');
const studentClient = read('js/classroom-student.js');
const sessionClient = read('js/classroom-session.js');
const styles = read('css/classroom-platform.css');
const server = read('server.js');
const packageJson = read('package.json');

for (const next of [
  'sensi-city.html?lesson=1',
  'sisi.html',
  'python-turtle.html',
  'webcode.html',
  'minecraft.html',
  'craftom-school/preview/index.html',
]) {
  assert.ok(index.includes(`classroom-entry.html?next=${encodeURIComponent(next)}`), `Missing shared entry link for ${next}`);
}

assert.ok(entry.includes('id="guest-continue"'));
assert.ok(entry.includes('id="guest-choice-card"'));
assert.ok(entry.includes('id="classroom-login-form"'));
assert.ok(entry.includes('name="identifier"'));
assert.ok(entry.includes('name="password"'));
assert.ok(entry.includes('id="preview-demo-student"'));
assert.ok(entry.includes('id="classroom-password-toggle"'));
assert.ok(entry.includes('התנסות כאורח'));
assert.ok(entry.includes('id="subscription-continue"'));
assert.ok(entry.includes('מנוי אישי'));
assert.ok(entry.includes('מייל או קוד כיתה'));
assert.ok(entry.includes('סיסמה או קוד אישי'));
assert.ok(entry.includes('teacher-classrooms.html'));
assert.ok(read('classroom-student.html').includes('id="classroom-student-courses"'));

assert.ok(teacher.includes('id="teacher-login-form"'));
assert.ok(teacher.includes('id="preview-demo-teacher"'));
assert.ok(teacher.includes('id="teacher-invitation-form"'));
assert.ok(teacher.includes('name="code"'));
assert.ok(teacher.includes('id="teacher-one-time-password"'));
assert.ok(teacher.includes('id="teacher-topbar-logout"'));
assert.ok(teacher.includes('id="create-class-form"'));
assert.ok(teacher.includes('id="classes-list"'));
assert.ok(teacher.includes('id="teacher-course-catalog"'));
assert.ok(teacher.includes('יצירת כיתה'));
assert.ok(teacher.includes('כניסת מורה לכל הלומדות'));
assert.ok(teacher.includes('כל לומדה נפתחת לפי ההרשאות שלך באותה כניסת מורה'));
assert.ok(teacher.includes('css/classroom-platform.css?v=20261008-lesson-page-same-tab-1'));
assert.ok(teacher.includes('js/classroom-platform.js?v=20261008-lesson-page-same-tab-1'));
assert.ok(teacher.includes('בחירת לומדות לכיתה'));
assert.ok(!teacher.includes('הלומדות הזמינות לך'), 'create-class flow should not duplicate teacher course availability above the class picker');
assert.match(client, /function lessonZeroRetrying\(lesson\)[\s\S]*Boolean\(lesson\?\.retrying\)/, 'progress dashboard should detect lesson zero retry attempts');
assert.match(client, /if \(lessonZeroRetrying\(lesson\)\) return 'ניסיון חדש'/, 'progress dashboard should not show retry attempts as never started');
assert.match(client, /if \(lessonZeroRetrying\(lesson\)\) return 'מנסה שוב'/, 'progress dashboard should label Minecraft retry state clearly');
assert.match(client, /function lessonSubmissionSummary\(lesson\)[\s\S]*הושלם במיינקראפט/, 'lesson zero rows should summarize Minecraft completion instead of missing submissions');
assert.match(client, /function lessonExitStatus\(lesson\)[\s\S]*label: 'סיום'[\s\S]*לחץ\/ה סיום/, 'lesson zero rows should show a finish status instead of a missing exit ticket');
assert.match(client, /הודעה \$\{label\}/, 'teacher dashboard should label Minecraft chat as a teacher message');
assert.match(client, /מה לשלוח לכל הכיתה מהמורה/, 'class-wide Minecraft chat prompt should make it clear the teacher sends it');
assert.doesNotMatch(client, /שיגור אל התלמיד|משגרים אל התלמיד|command\('teleport'/, 'teacher dashboards should not expose the unused teleport-to-player action');
assert.ok(teacher.includes('id="teacher-topbar-logout" type="button" hidden'), 'teacher logout in the topbar should appear only after an authenticated teacher session');
assert.ok(!teacher.includes('value="minecraft"'), 'teacher HTML must not expose a static unrestricted course picker');
assert.ok(teacher.includes('סמני רק את הלומדות שהתלמידים בכיתה הזאת יקבלו'));
assert.ok(teacher.includes('id="teacher-course-view"'));
assert.ok(!client.includes('ניהול Agent Academy נשאר במסך הייעודי שלו'), 'Agent Academy should not render a second course hub above the selected class');
assert.ok(!client.includes('function renderCraftomLessonMap(classroom)'), 'teacher class hub should not duplicate the Agent Academy lesson map');
assert.ok(client.includes('agent-academy-teacher.html?classroomId=${encodeURIComponent(classroomId)}'), 'teacher class hub should link to the single Agent Academy class management screen');
assert.ok(client.includes('function renderCraftomLessonControls(classroom)'), 'teacher class hub should show a simple per-lesson control list');
assert.ok(client.includes('כל השיעורים'), 'lesson management tab should list all Agent Academy lessons directly');
assert.ok(client.includes("element('a', 'עמוד כל השיעורים'"), 'lesson management tab should link to the full Agent Academy lesson board');
assert.ok(client.includes("allLessonsPage.href = teacherCourseHref('craftom-agent', classroom.id)"), 'the all-lessons button should keep the teacher scoped to the selected class');
assert.doesNotMatch(client, /allLessonsPage\.target = '_blank'[\s\S]*top\.append\(topCopy, allLessonsPage\)/, 'the all-lessons button should open in the same tab');
assert.doesNotMatch(client, /const page = element\('a', 'עמוד השיעור'[\s\S]*page\.target = '_blank'[\s\S]*actions\.append\(page\)/, 'per-lesson page buttons should open in the same tab');
assert.ok(client.includes('הפעלת שיעור'), 'closed lessons should have a teacher-friendly activation button');
assert.ok(client.includes('נעילת שיעור'), 'open lessons should have a teacher-friendly lock button');
assert.ok(client.includes('שיעור 0 פתוח תמיד'), 'lesson zero should be explained as always open');
assert.ok(client.includes('/lessons/${encodeURIComponent(String(lessonId))}/${path}'), 'lesson controls should call the existing open/close access endpoints');
assert.ok(client.includes('אי אפשר לפתוח את שיעור ${lessonId} עדיין'), 'out-of-order lesson clicks should explain the sequence rule to the teacher');
assert.ok(client.includes("toggle.setAttribute('aria-disabled', 'true')"), 'out-of-order lesson controls should remain clickable for feedback without appearing fully available');
assert.ok(styles.includes('.button.lesson-sequence-blocked'), 'out-of-order lesson activation should have a subdued visual state');
assert.match(client, /const activeLessonId = Math\.max\(0,[\s\S]*lesson\.open[\s\S]*isActiveLesson/, 'lesson management should calculate the currently active open lesson');
assert.ok(client.includes('is-completed-lesson'), 'previous Agent Academy lessons should get a completed visual state');
assert.ok(client.includes('הושלם / עברנו הלאה'), 'previous Agent Academy lessons should be labeled as completed/past');
assert.ok(styles.includes('.craftom-lesson-control-row.is-active-lesson'), 'active Agent Academy lesson should be visually highlighted');
assert.ok(styles.includes('.craftom-lesson-control-row.is-completed-lesson'), 'past Agent Academy lessons should be subdued');
assert.ok(client.includes("preferredClassTabs.set(classroom.id, 'lesson')"), 'lesson open/lock actions should keep the class card on the lesson tab after rerender');
assert.ok(client.includes('renderClassTabShell(tabs, preferredClassTabs.get(classroom.id))'), 'class tab shell should restore the teacher’s last active tab');
assert.ok(styles.includes('.craftom-lesson-control-row'), 'teacher lesson controls should be styled as readable rows');
assert.ok(client.includes('if (tab?.onActivate) tab.onActivate()'), 'class tabs should support work that starts when a tab is selected');
assert.ok(client.includes("activeCourseId !== 'craftom-agent'"), 'Agent Academy should not show a duplicate class progress tab');
assert.ok(client.includes('if (initialTab?.onActivate) initialTab.onActivate()'), 'the active class tab should run its activation behavior on render');
assert.match(client, /const tabs = \[[\s\S]*id: 'lesson'[\s\S]*label: 'ניהול שיעור'[\s\S]*id: 'students'[\s\S]*label: 'תלמידים וקודים'[\s\S]*\.\.\.progressTab/, 'lesson management should be the first class tab and open by default');
assert.ok(client.includes("element('button', 'רענון דוח'"), 'report tab should offer refresh instead of a second open button');
assert.ok(!client.includes("element('button', 'פתיחת דוח'"), 'report tab should not require a separate open-report button');
assert.ok(client.includes("'תרגול קוד'"), 'class progress should label Agent Academy progress as code practice');
assert.ok(!client.includes("['Agent', learningLabel(studentLesson.academyStatus"), 'class progress should not show a vague Agent-missing status');
assert.ok(!client.includes("['אקדמיית Agent', learningLabel(lesson.academyStatus"), 'class progress detail should not show a vague Agent Academy missing status');
assert.ok(client.includes('advancedOpen: Boolean(progressDashboardContent.querySelector'), 'report auto-refresh should preserve whether the full view is open');
assert.ok(client.includes('advanced.open = Boolean(options.advancedOpen)'), 'progress dashboard render should restore the full-view details state');
assert.ok(client.includes('selectedLessonIndex: Number(progressDashboardContent.querySelector'), 'report auto-refresh should preserve the selected lesson');
assert.ok(client.includes('lessonSelect.value = String(selectedLessonIndex)'), 'progress dashboard render should restore the selected lesson');
assert.ok(client.includes('function renderLessonDurationPills(lesson)'), 'progress dashboard rows should show lesson zero finish durations');
assert.ok(client.includes("element('strong', 'זמן סיום')"), 'progress dashboard should label the latest finish duration');
assert.ok(client.includes("['מייל', student.minecraftEmail || 'אין עדיין']"), 'student identity lines should show the verified Minecraft/Microsoft email when available');
assert.match(client, /if \(!buildMode\) \{[\s\S]*inlineDetail\.append\(renderLessonDetail\(student, studentLesson, dashboard\)\)/, 'class tracking should not duplicate build-mode student facts in an inner detail card');
assert.doesNotMatch(client, /function renderLessonDetail\(student, lesson, dashboard\)[\s\S]*detail\.append\(renderCoinProgress\([\s\S]*function renderStudentIdentityBadges/, 'class tracking details should not duplicate the lesson-zero coin bar inside each student card');
assert.ok(!styles.includes('.teacher-lessons-map'), 'lesson map styling should stay out of the simpler class hub');

assert.ok(admin.includes('id="admin-access-request-form"'));
assert.ok(admin.includes('id="admin-access-redeem-form"'));
assert.ok(admin.includes('id="admin-dashboard"'));
assert.ok(admin.includes('id="admin-teachers-list"'));
assert.ok(admin.includes('id="create-invitation-form"'));
assert.ok(admin.includes('id="admin-invitations-list"'));
assert.ok(admin.includes('id="show-archived-teachers"'));
assert.ok(admin.includes('id="admin-one-time-credential"'));
assert.ok(admin.includes('ניהול הרשאות מורים'));
assert.ok(admin.includes('js/classroom-admin.js'));
assert.ok(adminClient.includes('/api/classroom/admin-access/request'));
assert.ok(adminClient.includes('/api/classroom/admin-access/redeem'));
assert.ok(adminClient.includes('/api/classroom/admin/invitations'));
assert.ok(adminClient.includes('/api/classroom/admin/teachers'));
assert.match(adminClient, /בקשת הגישה התקבלה/);
assert.doesNotMatch(adminClient, /קוד גישה נשלח אליה/, 'asynchronous access delivery must not be presented as already sent');
assert.ok(adminClient.includes('/courses'));
assert.ok(adminClient.includes('/archive'));
assert.ok(adminClient.includes('/restore'));
assert.ok(adminClient.includes('data-teacher-id'));
assert.ok(adminClient.includes('data-action'));
assert.ok(client.includes('data-class-id'));
assert.ok(client.includes('function renderStudentRoster(classroom)'), 'teacher class hub should include roster import and login-code management');
assert.ok(client.includes('student-roster-email'), 'teacher class roster should show each student Minecraft/Microsoft email under the name');
assert.ok(client.includes('function rosterMinecraftIdentityText(student)'), 'teacher class roster should derive a clear Minecraft identity line');
assert.ok(client.includes('function renderRosterMinecraftIdentity(student)'), 'teacher class roster should render Minecraft identity as a bidi-safe RTL line');
assert.ok(client.includes('מייל Minecraft: ${email}'), 'teacher class roster should label a verified Microsoft email clearly');
assert.ok(client.includes('משתמש Minecraft: ${playerName}'), 'teacher class roster should show the assigned Minecraft user when email is not verified');
assert.ok(!client.includes('מייל Minecraft: לא אומת עדיין'), 'teacher class roster should not hide assigned Minecraft users behind an unverified-email message');
assert.ok(client.includes('/students/bulk'), 'teacher class hub should support importing a pasted student list');
assert.ok(client.includes('קוד אישי מספרי'), 'teacher class hub should describe numeric-only student login codes');
assert.ok(styles.includes('.student-roster-panel'), 'student roster import should be styled');
assert.ok(styles.includes('.student-roster-email-value'), 'Minecraft email values should be isolated inside the RTL roster line');
assert.ok(styles.includes('.numeric-login-code'), 'numeric login codes should be easy to scan');
assert.ok(!client.includes('reset-student-code'), 'teacher-facing student table must not expose code reset actions');
assert.ok(!client.includes('archive-student'), 'teacher-facing student table must not expose archive actions');
assert.ok(adminClient.includes('replaceChildren'));
assert.ok(!adminClient.includes('innerHTML'), 'administrator UI must render teacher data without innerHTML');
assert.ok(!adminClient.includes('localStorage'), 'administrator credentials must stay only in the HttpOnly session cookie');

assert.ok(client.includes('/api/classroom/teacher-login'));
assert.ok(client.includes('/api/classroom/preview-demo-teacher-enabled'));
assert.ok(client.includes('/api/classroom/preview-demo-teacher-login'));
assert.ok(client.includes('fromTeacherBoard'), 'teacher board return should open the class list instead of leaving preview users at the login form');
assert.ok(client.includes("history.replaceState(null, '', 'teacher-classrooms.html')"));
assert.ok(client.includes('/api/classroom/teacher-invitations/redeem'));
assert.ok(entryClient.includes('/api/classroom/teacher-login'));
assert.ok(entryClient.includes('/api/classroom/student-login'));
assert.ok(!entryClient.includes('/api/classroom/login'), 'unified UI must not duplicate server-side authentication');
assert.ok(entryClient.includes('/api/classroom/preview-demo-student-enabled'));
assert.ok(entryClient.includes('/api/classroom/preview-demo-student-login'));
assert.ok(client.includes('/api/classroom/classes'));
assert.ok(client.includes("/courses`"));
assert.ok(client.includes("new FormData(form).getAll('courses')"));
assert.ok(client.includes('availableCourseIds'));
assert.ok(client.includes('teacher-course-catalog'));
assert.ok(client.includes('teacher-course-view'));
assert.ok(client.includes('teacherCourseResources'), 'teacher hub should expose guide resources per assigned course');
assert.ok(client.includes('teacher-course-hub-card'), 'teacher hub should show one clear action card for the selected course');
assert.ok(client.includes('function renderGenericCourseProgress(classroom, courseId)'), 'teacher hub should provide basic class tracking for non-Minecraft courses');
assert.ok(client.includes('מעקב בסיסי לפי ההתקדמות שהתלמידים שומרים מתוך הלומדה'), 'generic course tracking should explain its source');
assert.ok(client.includes('teacherCourseGuideLinks(selectedCourseId)'), 'selected course hub should render teacher guide links');
assert.ok(client.includes('teacher-topbar-logout'));
assert.ok(client.includes('selectedCourseId'));
assert.ok(client.includes('פתיחת סביבת המורה'));
assert.ok(client.includes('פתיחת הלומדה'));
assert.ok(client.includes('כניסה ללומדה:'));
assert.ok(client.includes('teacherCourseHref(courseId, classroom.id)'));
assert.ok(client.includes("if (courseId !== 'craftom-agent')"), 'Agent Academy class management link should open in the same tab');
assert.ok(client.includes("if (selectedCourseId !== 'craftom-agent')"), 'Agent Academy course hub link should open in the same tab');
assert.ok(!client.includes('בחירת כיתה לניהול'), 'Agent Academy should go straight to the filtered class cards without a duplicate choose-class action');
assert.ok(studentClient.includes('classroom-student-courses'));
assert.ok(read('classroom-student.html').includes('הלומדות הפתוחות לכיתה שלך'));
assert.ok(entryClient.includes('/api/classroom/logout'));
assert.ok(entryClient.includes("params.get('student_login') === '1'"), 'Minecraft Open Lomda needs forced student login mode');
assert.ok(entryClient.includes("location.assign(nextWithCompound())"), 'forced student login should continue to the requested lomda');
assert.ok(entryClient.includes("url.searchParams.set('c', compoundId)"), 'forced student login should preserve compound_id in next');
assert.ok(entryClient.includes("!forcedStudentLogin && identifier.includes('@')"), 'forced student login must not accept teacher-role routing');
assert.ok(entryClient.includes("if (forcedStudentLogin)"), 'forced student login should bypass the existing role redirect');
assert.ok(entryClient.includes("guest.addEventListener('click'"));
assert.ok(studentClient.includes("document.getElementById('classroom-student-logout')"));
assert.ok(!client.includes('haiTechClassroomToken'), 'classroom credentials must stay in HttpOnly cookies');
assert.ok(!entryClient.includes('haiTechClassroomToken'), 'unified classroom credentials must stay in HttpOnly cookies');
assert.ok(!studentClient.includes('innerHTML'), 'student data must use safe DOM rendering');
assert.ok(!client.includes('localStorage.setItem'), 'classroom entry must never persist credentials in browser storage');
for (const courseId of ['sensi-city', 'sisi', 'python-turtle', 'webcode', 'minecraft', 'craftom-agent']) {
  assert.ok(sessionClient.includes(courseId), `Missing classroom progress adapter for ${courseId}`);
}
assert.ok(sessionClient.includes('|weather|'), 'Sisi weather lesson must be mapped to classroom progress');
assert.ok(sessionClient.includes('/api/classroom/progress'));
assert.ok(sessionClient.includes('hai:classroom-progress'));
assert.ok(sessionClient.includes('classroom-student-floating-logout'), 'student pages should get a shared floating logout button');
assert.ok(sessionClient.includes('/api/classroom/logout'), 'shared student logout should clear the classroom session');
assert.ok(sessionClient.includes("location.assign('classroom-entry.html')"), 'student logout should return to the classroom entry page');
assert.ok(server.includes('injectClassroomSession'));
assert.ok(server.includes('classroom-session.js?v=20261001-student-logout-1'), 'injected classroom session script should cache-bust the shared student logout');
assert.ok(server.includes('function previewDemoStudentLogin'));
assert.ok(server.includes('function requireCurrentTeacherClassroom'));
assert.ok((server.match(/requireCurrentTeacherClassroom\(db, req, teacher\.id, classroomId\)/g) || []).length >= 3,
  'teacher student edit/reset/archive/restore/create writes must revalidate the live teacher session and ownership inside their transaction');
assert.ok(server.includes("const CLASSROOM_PREVIEW_DEMO_TEACHER = process.env.ROBOTICS_PREVIEW_DEMO_TEACHER === '1'"), 'preview login must require explicit server configuration');
assert.ok(!server.includes('craftom-tehila-preview.orma-ai.com'), 'a client-controlled Host header must not enable preview authentication');
assert.ok(!server.includes("headers?.['x-forwarded-host']"), 'a client-controlled forwarded host must not bypass authentication');
assert.ok(server.includes("'/classroom-entry.html'"));
assert.ok(server.includes("'/classroom-student.html'"));
assert.ok(server.includes("'/teacher-classrooms.html'"));
assert.ok(packageJson.includes('node --check js/classroom-platform.js'));
assert.ok(packageJson.includes('node --check js/classroom-entry.js'));
assert.ok(packageJson.includes('node --check js/classroom-student.js'));
assert.ok(packageJson.includes('node --check js/classroom-session.js'));
assert.ok(styles.includes('@media'));
assert.ok(styles.includes('.management-form'));
assert.ok(styles.includes('.archive-state'));
assert.ok(styles.includes('.teacher-course-hub-card'), 'teacher all-course hub should have stable card styling');
assert.ok(styles.includes('.generic-course-progress'), 'generic non-Minecraft progress should be styled');

const progressRequests = [];
const classroomWindow = { addEventListener() {} };
const classroomLocation = { pathname: '/space.html', search: '', assign() {} };
const classroomContext = {
  window: classroomWindow,
  location: classroomLocation,
  URLSearchParams,
  document: {
    body: { append() {} },
    createElement() { return { setAttribute() {}, style: {}, textContent: '' }; },
  },
  fetch: async (path, options = {}) => {
    if (path === '/api/classroom/me') return { ok: true, json: async () => ({ role: 'student', student: { name: 'דנה' }, classroom: { name: 'כיתה' } }) };
    progressRequests.push(JSON.parse(options.body));
    return { ok: true, json: async () => ({ ok: true }) };
  },
};
vm.runInNewContext(sessionClient, classroomContext);
await new Promise((resolve) => setTimeout(resolve, 0));
assert.equal(progressRequests[0].courseId, 'sisi');
assert.equal(progressRequests[0].lessonId, 'space');
classroomLocation.search = '?lesson=7';
await classroomWindow.ClassroomProgress.save({ activityId: 'lesson-check' });
assert.equal(progressRequests.at(-1).lessonId, '7');

console.log('✓ classroom entry and teacher dashboard cover all six active courses');
