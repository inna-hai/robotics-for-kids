import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (file) => readFileSync(join(root, file), 'utf8');

const turtleHtml = read('python-turtle.html');
assert.ok(turtleHtml.includes("field_dropdown',name:'COLOR'"), 'Python Turtle pen color uses explicit dropdown');
for (const color of ['🔵 כחול', '🟢 ירוק', '🟡 צהוב', '🔴 אדום', '🟣 סגול', '🩷 ורוד', '⚫ שחור']) {
  assert.ok(turtleHtml.includes(color), `Python Turtle dropdown includes ${color}`);
}

const gamelabHtml = read('gamelab-play.html');
assert.ok(gamelabHtml.includes('configuredKeyMoves'), 'PlayCode Lab maps event-key chains to keyboard controls');
assert.ok(gamelabHtml.includes("document.addEventListener('keydown'"), 'PlayCode Lab listens to keydown events');
assert.ok(gamelabHtml.includes("ArrowRight:'right'"), 'PlayCode Lab supports arrow keys');

for (const course of ['space', 'ocean']) {
  const html = read(`${course}-play.html`);
  const js = read(`js/${course}-play.js`);
  assert.ok(html.includes('id="stop"'), `${course} play page has a stop button`);
  assert.ok(js.includes('function stopRun()'), `${course} play engine can stop an active run`);
  assert.ok(js.includes('runToken'), `${course} play engine cancels the active async run safely`);
  assert.ok(js.includes('setRunning(false)'), `${course} play engine restores buttons after run ends`);
}

const sensiCityHtml = read('sensi-city.html');
const sensiLessonsData = read('js/lessons-data.js');
assert.ok(sensiCityHtml.includes('function activateDefaultEnvironmentForLesson'), 'Sensi City has default lesson environment activation');
assert.ok(sensiCityHtml.includes('lessonNum === 4 && !environment.smoke'), 'Sensi lesson 4 starts with smoke visible for dragging');
assert.ok(sensiCityHtml.includes("dragging = 'smoke'"), 'Sensi smoke object remains draggable');
assert.ok(sensiCityHtml.includes('function stabilizeLayoutAfterPaint'), 'Sensi City stabilizes layout after refresh paint');
assert.ok(sensiCityHtml.includes('Math.max(320'), 'Sensi City clamps canvas width during resize');
assert.ok(sensiCityHtml.includes('Math.max(220'), 'Sensi City clamps canvas height during resize');
assert.ok(sensiCityHtml.includes('function completeTeacherApprovalExercise()'), 'Sensi City can complete teacher-approved summary/discussion exercises');
assert.ok(sensiCityHtml.includes('isTeacherApprovalExercise(exercise)'), 'Sensi City detects teacher-approved exercises');
assert.ok(sensiCityHtml.includes('completionButtonLabel'), 'Sensi City renders a clear completion button label for teacher-approved exercises');
for (const title of [
  'תרגיל 5 — אתגר פתוח: כלל עירוני',
  'תרגיל 5 — סיכום: כלל רעש הוגן לשכונה',
  'תרגיל 4 — אתגר פתוח: כלל חממה חכם'
]) {
  const titleIndex = sensiLessonsData.indexOf(title);
  assert.notEqual(titleIndex, -1, `${title} exists in lesson data`);
  const nearby = sensiLessonsData.slice(Math.max(0, titleIndex - 220), titleIndex + 420);
  assert.ok(nearby.includes("completionMode: 'teacherApproval'"), `${title} has teacher approval completion mode`);
}
assert.ok(
  sensiLessonsData.includes("title: 'תרגיל 4 — סיכום נוהל חילוץ', completionMode: 'teacherApproval'"),
  'Lesson 14 summary exercise has teacher approval completion mode'
);
assert.ok(sensiCityHtml.includes("currentLesson === 2") && sensiCityHtml.includes("getSoundLevel() === 'LOUD' ? 'LOUD' : 'QUIET'"), 'Sensi City records lesson 2 loud vs quiet/soft test runs');
assert.ok(sensiCityHtml.includes("currentLesson === 12") && sensiCityHtml.includes("environment.obstacle ? 'FENCE' : 'NO_FENCE'"), 'Sensi City records lesson 12 fence/no-fence test runs');
assert.ok(sensiCityHtml.includes("return ['NO_FENCE', 'FENCE'];"), 'Sensi City requires both lesson 12 delivery run states');
assert.ok(sensiCityHtml.includes('rule_homeowner_message_inside_condition'), 'Sensi City validates lesson 13 homeowner report message');
assert.ok(sensiCityHtml.includes('rule_burglar_message_inside_condition'), 'Sensi City validates lesson 13 burglar report message');
assert.ok(sensiCityHtml.includes('rule_quiet_motion_message_inside_nested_condition'), 'Sensi City validates lesson 13 nested quiet-motion report message');

const certificate = read('js/course-certificate.js');
assert.ok(certificate.includes('window.SisiProgress'), 'shared success helper exposes Sisi progress API');
assert.ok(certificate.includes('sisi-progress:'), 'shared success helper stores per-page progress in localStorage');
assert.ok(certificate.includes('markProgress(lesson)'), 'success dialog saves progress when mission is completed');

console.log('feedback fixes checks passed');
