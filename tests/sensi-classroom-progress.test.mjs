import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (path) => readFileSync(join(root, path), 'utf8');

const sensi = read('sensi-city.html');
const classroomSession = read('js/classroom-session.js');
const server = read('server.js');

assert.match(sensi, /function advanceCompletedExercise\(completionVerb = 'הושלם'\)/, 'Sensi should have one completion path for programming exercises');
assert.match(sensi, /window\.dispatchEvent\(new CustomEvent\('hai:classroom-progress'/, 'Sensi completion should emit the shared classroom progress event');
assert.match(sensi, /lessonId:\s*String\(currentLesson\)/, 'Sensi should persist the active lesson id');
assert.match(sensi, /activityId:\s*`exercise-\$\{completedIndex \+ 1\}`/, 'Sensi should persist the completed exercise number');
assert.match(sensi, /status:\s*'completed'/, 'Sensi should persist exercise completion status');
assert.match(sensi, /score:\s*100/, 'Sensi should persist completed exercises with full score');
assert.match(sensi, /metadata:\s*\{[\s\S]*exerciseTitle:[\s\S]*completedCount,[\s\S]*totalExercises: exercises\.length,[\s\S]*completionVerb[\s\S]*\}/, 'Sensi should save useful exercise metadata for teacher tracking');
assert.ok(sensi.indexOf('setExerciseProgress(completedCount)') < sensi.indexOf("window.dispatchEvent(new CustomEvent('hai:classroom-progress'"),
  'Sensi should keep local progress while also reporting to the classroom DB');
assert.match(sensi, /completeLesson15PlanningStep\(\)[\s\S]*advanceCompletedExercise\('סומן כבוצע'\)/, 'Sensi manual planning steps should reuse the same progress-saving completion path');
assert.match(sensi, /completeTeacherApprovalExercise\(\)[\s\S]*advanceCompletedExercise\('סומן כבוצע'\)/, 'Sensi teacher-approval exercises should reuse the same progress-saving completion path');

assert.match(classroomSession, /if \(\/sensi-city\|smart-city\/\.test\(pathname\)\) return 'sensi-city'/, 'classroom session adapter must map Sensi pages to sensi-city');
assert.match(classroomSession, /window\.addEventListener\('hai:classroom-progress'/, 'classroom session adapter should listen for Sensi progress events');
assert.match(classroomSession, /return request\('\/api\/classroom\/progress', payload\)/, 'classroom progress events should save through the classroom DB API');
assert.match(server, /if \(basename === 'sensi-city' \|\| basename === 'smart-city'\) return 'sensi-city'/, 'server access guard must map Sensi student pages to the Sensi classroom course');
assert.match(server, /pathname === '\/sensi-city\.html' \|\| pathname === '\/smart-city\.html'/, 'paid/classroom access guard must recognize Sensi pages');
assert.match(server, /if \(result\.forbidden\) return send\(res, 403, JSON\.stringify\(\{ error: 'הלומדה אינה פתוחה לכיתה הזו\.' \}\)\)/, 'DB writes should reject Sensi progress if Sensi is not open to the class');

const progressRequests = [];
const listeners = {};
const context = {
  window: {
    addEventListener(type, handler) { listeners[type] = handler; },
    ClassroomProgress: undefined,
  },
  location: { pathname: '/sensi-city.html', search: '?lesson=4' },
  URLSearchParams,
  document: {
    body: { append() {} },
    createElement() { return { setAttribute() {}, style: {}, textContent: '' }; },
  },
  fetch: async (path, options = {}) => {
    if (path === '/api/classroom/me') {
      return { ok: true, json: async () => ({ role: 'student', student: { name: 'דנה' }, classroom: { name: 'ז1' } }) };
    }
    progressRequests.push({ path, body: JSON.parse(options.body) });
    return { ok: true, json: async () => ({ ok: true }) };
  },
};

vm.runInNewContext(classroomSession, context);
await new Promise((resolve) => setTimeout(resolve, 0));
assert.equal(progressRequests[0].path, '/api/classroom/progress');
assert.deepEqual(
  progressRequests[0].body,
  { courseId: 'sensi-city', lessonId: '4', activityId: 'page-open', status: 'started', score: 0, metadata: { path: 'sensi-city.html?lesson=4' } },
  'Sensi classroom entry should record a started page-open event for signed-in students',
);

listeners['hai:classroom-progress']({
  detail: {
    lessonId: '4',
    activityId: 'exercise-2',
    status: 'completed',
    score: 100,
    metadata: { source: 'test' },
  },
});
await new Promise((resolve) => setTimeout(resolve, 0));
assert.deepEqual(
  progressRequests.at(-1).body,
  { courseId: 'sensi-city', lessonId: '4', activityId: 'exercise-2', status: 'completed', score: 100, metadata: { source: 'test' } },
  'Sensi exercise completion events should be saved to classroom_progress through the shared adapter',
);

console.log('✓ Sensi reports classroom progress through the shared DB adapter');
