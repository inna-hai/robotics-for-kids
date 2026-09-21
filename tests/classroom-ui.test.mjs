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
assert.ok(teacher.includes('id="create-class-form"'));
assert.ok(teacher.includes('id="classes-list"'));
assert.ok(teacher.includes('id="teacher-course-catalog"'));
assert.ok(teacher.includes('יצירת כיתה'));
assert.ok(teacher.includes('js/classroom-platform.js?v=20260921-teacher-progress-dashboard-2'));
assert.ok(!teacher.includes('value="minecraft"'), 'teacher HTML must not expose a static unrestricted course picker');
assert.ok(teacher.includes('בחרו מתוך הלומדות שהוקצו לך'));

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
assert.ok(client.includes('data-student-id'));
assert.ok(client.includes("data-role', 'student-code-notice"));
assert.ok(client.includes('/reset'));
assert.ok(client.includes('/archive'));
assert.ok(client.includes('/students/archived'));
assert.ok(client.includes('restore-student'));
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
assert.ok(client.includes('פתיחת הלומדה שלי'));
assert.ok(client.includes('פתיחת הלומדה'));
assert.ok(client.includes('ניהול הלומדה:'));
assert.ok(client.includes('teacherCourseHref(courseId, classroom.id)'));
assert.ok(client.includes('ניהול אקדמיית ה-Agent לפי כיתה'));
assert.ok(studentClient.includes('classroom-student-courses'));
assert.ok(read('classroom-student.html').includes('הלומדות הפתוחות לכיתה שלך'));
assert.ok(entryClient.includes('/api/classroom/logout'));
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
assert.ok(server.includes('injectClassroomSession'));
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
assert.ok(styles.includes('.student-actions'));
assert.ok(styles.includes('.management-form'));
assert.ok(styles.includes('.archive-state'));

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
