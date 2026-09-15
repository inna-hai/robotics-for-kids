import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const sensi = read('sensi-city.html');

const sensiAdvanceStart = sensi.indexOf('function advanceCompletedExercise(');
const sensiAdvanceEnd = sensi.indexOf('\n        function completeActiveExerciseIfReady()', sensiAdvanceStart);
assert.notEqual(sensiAdvanceStart, -1, 'Sensi canonical exercise completion function exists');
const sensiAdvance = sensi.slice(sensiAdvanceStart, sensiAdvanceEnd);
assert.match(sensiAdvance, /hai:classroom-progress/, 'Sensi validated exercise completion emits classroom progress');
assert.match(sensiAdvance, /activityId:\s*`exercise-\$\{completedIndex \+ 1\}`/, 'Sensi reports the completed exercise number');
assert.match(sensiAdvance, /lessonId:\s*String\(currentLesson\)/, 'Sensi reports the active lesson');
assert.match(sensiAdvance, /status:\s*'completed'/, 'Sensi reports a completed status');
const sensiValidationStart = sensi.indexOf('function completeActiveExerciseIfReady()');
const sensiValidationEnd = sensi.indexOf('\n        function completeLesson15PlanningStep()', sensiValidationStart);
const sensiValidation = sensi.slice(sensiValidationStart, sensiValidationEnd);
assert.match(sensiValidation, /if \(!result\.ok\)[\s\S]*return;[\s\S]*advanceCompletedExercise\('הושלם'\)/, 'Sensi emits completion only after its validator succeeds');
const sensiToggleStart = sensi.indexOf('function toggleTask(num)');
const sensiToggleEnd = sensi.indexOf('\n        function closeSuccess()', sensiToggleStart);
assert.doesNotMatch(sensi.slice(sensiToggleStart, sensiToggleEnd), /hai:classroom-progress/, 'manual Sensi checklist marks must not report validated completion');

const turtle = read('python-turtle.html');
assert.match(turtle, /function completeCurrentTurtleExercise\(exercise = currentExercises\(\)\[currentExerciseIndex\]\)/, 'Python Turtle centralizes validated exercise completion');
const turtleCompletionStart = turtle.indexOf('function completeCurrentTurtleExercise(');
const turtleCompletionEnd = turtle.indexOf('\n    function ', turtleCompletionStart + 10);
const turtleCompletion = turtle.slice(turtleCompletionStart, turtleCompletionEnd);
assert.match(turtleCompletion, /hai:classroom-progress/, 'Python Turtle completion emits classroom progress');
assert.match(turtleCompletion, /lessonId:\s*String\(currentLesson\)/, 'Python Turtle reports the active lesson');
assert.match(turtleCompletion, /activityId:\s*`exercise-\$\{exercise\.id\}`/, 'Python Turtle reports the validated exercise');
assert.match(turtleCompletion, /status:\s*'completed'/, 'Python Turtle reports completed status');
assert.match(turtle, /if\(isRunOnlyExampleExercise\(ex\)\)[\s\S]*const runFinished = await run\(\);[\s\S]*if\(!runFinished\) return;[\s\S]*completeCurrentTurtleExercise\(\)/, 'stopped Python Turtle guided runs must not report completion');
const turtleAdvanceStart = turtle.indexOf('function advancePastCurrentExercise()');
const turtleAdvanceEnd = turtle.indexOf('\n    function nextExercise()', turtleAdvanceStart);
const turtleAdvance = turtle.slice(turtleAdvanceStart, turtleAdvanceEnd);
assert.doesNotMatch(turtleAdvance, /completeCurrentTurtleExercise/, 'skipping an optional Python Turtle challenge must not report false completion');
assert.match(turtleAdvance, /completedSet\(\)\.add\(currentExerciseIndex\)/, 'optional Python Turtle steps may still retain their existing local navigation state');

const webcode = read('webcode-play.html');
const webcodeCheckStart = webcode.indexOf('function checkExercise()');
const webcodeCheckEnd = webcode.indexOf('function renderProgress()', webcodeCheckStart);
assert.notEqual(webcodeCheckStart, -1, 'WebCode check function exists');
const webcodeCheck = webcode.slice(webcodeCheckStart, webcodeCheckEnd);
assert.match(webcodeCheck, /if\(ok\)[\s\S]*hai:classroom-progress/, 'WebCode emits progress only after its real validator passes');
assert.match(webcodeCheck, /lessonId:\s*String\(lesson\.id\)/, 'WebCode reports the current lesson');
assert.match(webcodeCheck, /activityId:\s*`exercise-\$\{ex\.id\}`/, 'WebCode reports the completed exercise');
assert.match(webcodeCheck, /status:\s*'completed'/, 'WebCode reports completed status');

const minecraft = read('minecraft-play.html');
const minecraftEvaluationStart = minecraft.indexOf('function evaluateProgramResult()');
const minecraftEvaluationEnd = minecraft.indexOf('\n    function updateStatus()', minecraftEvaluationStart);
assert.notEqual(minecraftEvaluationStart, -1, 'Minecraft result evaluator exists');
const minecraftEvaluation = minecraft.slice(minecraftEvaluationStart, minecraftEvaluationEnd);
assert.match(minecraftEvaluation, /if \(evaluateLessonMission\(selected\)\)[\s\S]*hai:classroom-progress/, 'Minecraft reports only after mission validation succeeds');
assert.match(minecraftEvaluation, /lessonId:\s*String\(lesson\.id\)/, 'Minecraft reports the current lesson');
assert.match(minecraftEvaluation, /activityId:\s*`mission-\$\{selected \+ 1\}`/, 'Minecraft reports the selected mission');
assert.match(minecraftEvaluation, /status:\s*'completed'/, 'Minecraft reports completed status');

const academy = read('js/craftom-agent-academy.js');
const academyChecksStart = academy.indexOf('function renderChecks(checks)');
const academyChecksEnd = academy.indexOf('\n  function updatePython()', academyChecksStart);
assert.notEqual(academyChecksStart, -1, 'Agent Academy result renderer exists');
const academyChecks = academy.slice(academyChecksStart, academyChecksEnd);
assert.match(academyChecks, /const passed = checks\.length > 0 && checks\.every\(check => check\.pass\)[\s\S]*if \(passed\)[\s\S]*reportProgress\(`academy-exercise-\$\{activeExercise \+ 1\}`/, 'Agent Academy reports only when every real criterion passes');
assert.match(academy, /new CustomEvent\('hai:classroom-progress'/, 'Agent Academy progress reports use the classroom progress event');
assert.match(academy, /lessonId:\s*String\(lesson\.id\)/, 'Agent Academy reports the current lesson');
assert.match(academyChecks, /reportProgress\(`academy-exercise-\$\{activeExercise \+ 1\}`/, 'Agent Academy reports the completed exercise');
assert.match(academy, /reportProgress\('academy-complete'/, 'Agent Academy reports full lesson-academy completion after all exercises pass');

const craftomLesson = read('js/craftom-minecraft-lesson-page.js');
const exitSuccessStart = craftomLesson.indexOf("form.classList.add('submitted')");
assert.notEqual(exitSuccessStart, -1, 'Craftom exit-ticket success path exists');
const exitSuccess = craftomLesson.slice(exitSuccessStart, exitSuccessStart + 700);
assert.match(exitSuccess, /hai:classroom-progress/, 'accepted Craftom exit tickets emit classroom progress');
assert.match(exitSuccess, /lessonId:\s*String\(lesson\.id\)/, 'Craftom exit tickets report the lesson');
assert.match(exitSuccess, /activityId:\s*'exit-ticket'/, 'Craftom reports the accepted exit ticket');
assert.match(exitSuccess, /status:\s*'completed'/, 'Craftom reports completed status');

const sessionClient = read('js/classroom-session.js');
const sessionListeners = new Map();
const queuedProgress = [];
let resolveClassroomMe;
const classroomWindow = {
  addEventListener(name, listener) { sessionListeners.set(name, listener); },
};
vm.runInNewContext(sessionClient, {
  window: classroomWindow,
  location: { pathname: '/webcode-play.html', search: '?lesson=3' },
  URLSearchParams,
  document: {
    body: { append() {} },
    createElement() { return { setAttribute() {}, style: {}, textContent: '' }; },
  },
  fetch: async (path, options = {}) => {
    if (path === '/api/classroom/me') {
      return new Promise(resolve => {
        resolveClassroomMe = () => resolve({ ok: true, json: async () => ({ role: 'student', student: { name: 'דנה' }, classroom: { name: 'כיתה' } }) });
      });
    }
    queuedProgress.push(JSON.parse(options.body));
    return { ok: true, json: async () => ({ ok: true }) };
  },
});
sessionListeners.get('hai:classroom-progress')({ detail: { activityId: 'exercise-2', status: 'completed', score: 100 } });
assert.equal(queuedProgress.length, 0, 'completion waits while classroom identity is loading');
resolveClassroomMe();
await new Promise(resolve => setTimeout(resolve, 0));
await new Promise(resolve => setTimeout(resolve, 0));
assert.ok(queuedProgress.some(item => item.activityId === 'exercise-2' && item.status === 'completed'), 'queued completion is sent after student identity resolves');

assert.match(sessionClient, /if \(me\.role !== 'student'\) \{\s*pendingProgress\.length = 0;\s*return;\s*\}/, 'guest identity clears queued completion events');
const guestListeners = new Map();
const guestProgress = [];
let resolveGuestMe;
vm.runInNewContext(sessionClient, {
  window: { addEventListener(name, listener) { guestListeners.set(name, listener); } },
  location: { pathname: '/webcode-play.html', search: '?lesson=3' },
  URLSearchParams,
  document: {
    body: { append() {} },
    createElement() { return { setAttribute() {}, style: {}, textContent: '' }; },
  },
  fetch: async (path, options = {}) => {
    if (path === '/api/classroom/me') {
      return new Promise(resolve => {
        resolveGuestMe = () => resolve({ ok: true, json: async () => ({ role: 'guest' }) });
      });
    }
    guestProgress.push(JSON.parse(options.body));
    return { ok: true, json: async () => ({ ok: true }) };
  },
});
guestListeners.get('hai:classroom-progress')({ detail: { activityId: 'exercise-2', status: 'completed', score: 100 } });
resolveGuestMe();
await new Promise(resolve => setTimeout(resolve, 0));
assert.equal(guestProgress.length, 0, 'guest completion stays local and is never posted');

console.log('✓ Sensi validated exercise completions report classroom progress');
console.log('✓ Python Turtle exercise completions report classroom progress');
console.log('✓ WebCode exercise completions report classroom progress');
console.log('✓ Minecraft mission completions report classroom progress');
console.log('✓ Agent Academy and Craftom exit-ticket completions report classroom progress');
console.log('✓ completion events wait for classroom identity instead of being lost');
console.log('✓ guest completion events remain local');
