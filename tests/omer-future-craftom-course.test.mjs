import { readFileSync } from 'node:fs';
import { strict as assert } from 'node:assert';
import vm from 'node:vm';

const root = new URL('../', import.meta.url);
const read = path => readFileSync(new URL(path, root), 'utf8');
const sandbox = { window: {} };

vm.createContext(sandbox);
vm.runInContext(read('js/omer-future-craftom-lessons.js'), sandbox);

const program = sandbox.window.OMER_FUTURE_CRAFTOM_PROGRAM;
assert.ok(program, 'Omer future Craftom program exists');
assert.equal(program.targetAudience, 'כיתה ד׳', 'program targets grade 4');
assert.equal(program.age, 'בני 9', 'program targets age 9');
assert.equal(program.totalMeetings, 15, 'program has 15 meetings');
assert.equal(program.meetingMinutes, 75, 'meetings are 75 minutes');
assert.equal(program.lessons.length, 15, 'program exposes 15 lessons');
assert.deepEqual(Array.from(program.lessons, lesson => lesson.id), Array.from({ length: 15 }, (_, index) => index + 1), 'lesson ids are sequential');
assert.ok(program.title.includes('עומר העתידנית'), 'course title is about futuristic Omer');
assert.ok(program.subtitle.includes('בלי') === false || program.subtitle.includes('תכנות'), 'subtitle is explicit about course scope');
assert.ok(program.sharedOutcomes.some(item => item.includes('חשיבה מערכתית')), 'shared outcomes include systems thinking');

const serialized = JSON.stringify(program);
assert.ok(!serialized.includes('agent.move'), 'grade 4 course does not include Agent coding');
assert.ok(!serialized.includes('player.onChat'), 'grade 4 course does not include chat command programming');
assert.ok(!serialized.includes('JavaScript'), 'grade 4 course does not teach JavaScript');

for (const lesson of program.lessons) {
  assert.equal(lesson.durationMinutes, 75, `lesson ${lesson.id} is 75 minutes`);
  assert.equal(lesson.grade, 'כיתה ד׳', `lesson ${lesson.id} targets grade 4`);
  assert.equal(lesson.platform, 'Minecraft Education + Craftom', `lesson ${lesson.id} uses Craftom/Minecraft`);
  assert.ok(lesson.title && lesson.unit && lesson.concept && lesson.story, `lesson ${lesson.id} has core metadata`);
  assert.ok(lesson.teacherGoal && lesson.studentOutcome && lesson.bigQuestion, `lesson ${lesson.id} has pedagogy`);
  assert.ok(lesson.minecraftBuild && lesson.minecraftBuild.length > 12, `lesson ${lesson.id} has concrete Minecraft build`);
  assert.ok(lesson.systemFocus && lesson.systemFocus.length > 4, `lesson ${lesson.id} has system focus`);
  assert.ok(lesson.teacherPrep.length >= 2, `lesson ${lesson.id} has teacher preparation`);
  assert.ok(lesson.exactSteps.length >= 5, `lesson ${lesson.id} has concrete classroom steps`);
  assert.ok(lesson.flow.length >= 7, `lesson ${lesson.id} has detailed flow`);
  assert.ok(lesson.studentWorksheet.fields.length >= 8, `lesson ${lesson.id} has worksheet fields`);
  assert.ok(lesson.studentWorksheet.fields.some(field => field.label.includes('למי זה עוזר')), `lesson ${lesson.id} asks who it helps`);
  assert.ok(lesson.studentWorksheet.fields.some(field => field.label.includes('מתחבר')), `lesson ${lesson.id} asks how it connects`);
  assert.ok(lesson.studentWorksheet.checklist.length >= 6, `lesson ${lesson.id} has worksheet checklist`);
}

assert.ok(program.lessons[0].title.includes('ברוכים הבאים'), 'lesson 1 is onboarding and vision');
assert.ok(program.lessons[4].title.includes('טבע'), 'lesson 5 covers nature/water/shade');
assert.ok(program.lessons[9].title.includes('חירום'), 'lesson 10 covers safety/resilience');
assert.ok(program.lessons[14].title.includes('Expo'), 'lesson 15 closes with expo');
assert.equal(program.buildProtocol.roles.length, 5, 'program defines build roles');

const hub = read('omer-future-craftom.html');
assert.ok(hub.includes('עומר העתידנית'), 'hub has course title');
assert.ok(hub.includes('בלי תכנות'), 'hub states no coding');
assert.ok(hub.includes('15 מפגשים'), 'hub presents 15 meetings');
assert.ok(hub.includes('מה בונים במיינקראפט'), 'hub presents Minecraft builds');
assert.ok(hub.includes('omer-future-craftom-students.html?lesson=1'), 'hub links student worksheets');
assert.ok(hub.includes('omer-future-craftom-slides.html?lesson=1'), 'hub links instructor slides');
assert.ok(hub.includes('js/omer-future-craftom-lessons.js'), 'hub loads course data');

const students = read('omer-future-craftom-students.html');
assert.ok(students.includes('דף תלמידים'), 'students page is a worksheet');
assert.ok(students.includes('window.getOmerFutureCraftomLesson'), 'students page uses course lessons');
assert.ok(students.includes('localStorage'), 'students page saves locally');
assert.ok(students.includes('copySummary'), 'students page can copy summary');
assert.ok(students.includes('מה עושים היום'), 'students page presents exact work mode');

const slides = read('omer-future-craftom-slides.html');
assert.ok(slides.includes('מצגת מדריך'), 'slides page is instructor deck');
assert.ok(slides.includes('lessonPicker'), 'slides page can switch lessons');
assert.ok(slides.includes('לא מלמדים קוד'), 'slides remind no coding');
assert.ok(slides.includes('מה לבדוק בזמן עבודה'), 'slides include teacher observation checks');
assert.ok(slides.includes('תבנית סיור סופי'), 'slides include final tour template');

const improvement = read('omer-future-craftom-improvement.html');
assert.ok(improvement.includes('בקשת שיפור'), 'improvement page has title');
assert.ok(improvement.includes('/api/feedback'), 'improvement page posts feedback');
assert.ok(improvement.includes("source: 'omer-future-craftom'"), 'improvement page identifies course source');

const index = read('index.html');
assert.ok(index.includes('omer-future-craftom.html'), 'home page links Omer future course');
assert.ok(index.includes('עומר העתידנית'), 'home page labels Omer future course');

console.log('omer-future-craftom-course tests passed');
