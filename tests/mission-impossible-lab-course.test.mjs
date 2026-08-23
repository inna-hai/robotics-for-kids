import { readFileSync } from 'node:fs';
import { strict as assert } from 'node:assert';
import vm from 'node:vm';

const root = new URL('../', import.meta.url);
const read = path => readFileSync(new URL(path, root), 'utf8');
const sandbox = { window: {} };

vm.createContext(sandbox);
vm.runInContext(read('js/mission-impossible-lab-lessons.js'), sandbox);

const program = sandbox.window.MISSION_IMPOSSIBLE_LAB_PROGRAM;
assert.ok(program, 'Mission Impossible Lab program exists');
assert.equal(program.targetAudience, 'כיתה ז׳', 'program targets grade 7');
assert.equal(program.totalMeetings, 15, 'program has 15 meetings');
assert.equal(program.meetingMinutes, 90, 'meetings are 90 minutes');
assert.equal(program.lessons.length, 15, 'program exposes 15 lessons');
assert.deepEqual(Array.from(program.lessons, lesson => lesson.id), Array.from({ length: 15 }, (_, index) => index + 1), 'lesson ids are sequential');

for (const lesson of program.lessons) {
  assert.equal(lesson.durationMinutes, 90, `lesson ${lesson.id} is 90 minutes`);
  assert.equal(lesson.grade, 'כיתה ז׳', `lesson ${lesson.id} targets grade 7`);
  assert.ok(lesson.title && lesson.unit && lesson.concept && lesson.story, `lesson ${lesson.id} has core metadata`);
  assert.ok(lesson.teacherGoal && lesson.studentOutcome && lesson.bigQuestion, `lesson ${lesson.id} has pedagogy`);
  assert.ok(lesson.flow.length >= 7, `lesson ${lesson.id} has detailed flow`);
  assert.ok(lesson.workshopTasks.length >= 5, `lesson ${lesson.id} has workshop tasks`);
  assert.ok(lesson.opalPrompt.includes('כיתה ז׳'), `lesson ${lesson.id} has grade-specific AI prompt`);
  assert.ok(lesson.studentWorksheet.fields.length >= 7, `lesson ${lesson.id} has worksheet fields`);
  assert.ok(lesson.studentWorksheet.checklist.length >= 5, `lesson ${lesson.id} has worksheet checklist`);
}

assert.ok(program.lessons[0].title.includes('פתיחת המעבדה'), 'lesson 1 opens the lab');
assert.ok(program.lessons[4].title.includes('תפקידים'), 'lesson 5 closes the research/team setup unit');
assert.ok(program.lessons[7].title.includes('אבטיפוס'), 'lesson 8 builds a prototype');
assert.ok(program.lessons[14].title.includes('Expo'), 'lesson 15 closes with an expo');

const hub = read('mission-impossible-lab.html');
assert.ok(hub.includes('Mission Impossible Lab'), 'hub has course title');
assert.ok(hub.includes('15 מפגשים'), 'hub presents 15 meetings');
assert.ok(hub.includes('mission-impossible-lab-students.html?lesson=1'), 'hub links student worksheets');
assert.ok(hub.includes('mission-impossible-lab-slides.html?lesson=1'), 'hub links instructor slides');
assert.ok(hub.includes('js/mission-impossible-lab-lessons.js'), 'hub loads course data');

const students = read('mission-impossible-lab-students.html');
assert.ok(students.includes('דף עבודה לתלמידים'), 'students page is a worksheet');
assert.ok(students.includes('window.getMissionImpossibleLabLesson'), 'students page uses mission lab lessons');
assert.ok(students.includes('localStorage'), 'students page saves locally');
assert.ok(students.includes('copySummary'), 'students page can copy summary');

const slides = read('mission-impossible-lab-slides.html');
assert.ok(slides.includes('מצגת מדריך'), 'slides page is instructor deck');
assert.ok(slides.includes('lessonPicker'), 'slides page can switch lessons');
assert.ok(slides.includes('תבנית פיץ׳ סיום'), 'slides include pitch template');

const improvement = read('mission-impossible-lab-improvement.html');
assert.ok(improvement.includes('בקשת שיפור'), 'improvement page has title');
assert.ok(improvement.includes('/api/feedback'), 'improvement page posts feedback');
assert.ok(improvement.includes('מפגש 15 - Mission Impossible Expo'), 'improvement page can target lesson 15');

const index = read('index.html');
assert.ok(index.includes('mission-impossible-lab.html'), 'home page links mission lab course');
assert.ok(index.includes('Mission Impossible Lab'), 'home page labels mission lab course');

console.log('mission-impossible-lab-course tests passed');
