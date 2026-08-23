import { readFileSync, existsSync } from 'node:fs';
import { strict as assert } from 'node:assert';
import vm from 'node:vm';

const root = new URL('../', import.meta.url);
const read = path => readFileSync(new URL(path, root), 'utf8');
const exists = path => existsSync(new URL(path, root));
const sandbox = { window: {} };

vm.createContext(sandbox);
vm.runInContext(read('js/omer-future-craftom-lessons.js'), sandbox);

const program = sandbox.window.OMER_FUTURE_CRAFTOM_PROGRAM;
assert.ok(program, 'Omer future Craftom program exists');
assert.equal(program.targetAudience, 'כיתה ד׳', 'program targets grade 4');
assert.equal(program.age, 'בני 9', 'program targets age 9');
assert.equal(program.totalChallenges, 4, 'program has 4 challenges');
assert.equal(program.totalMeetings, 16, 'program has 16 meetings');
assert.equal(program.meetingsPerChallenge, 4, 'program has 4 meetings per challenge');
assert.equal(program.meetingMinutes, 75, 'each meeting is 75 minutes');
assert.equal(program.lessons.length, 4, 'program exposes 4 challenges');
assert.deepEqual(Array.from(program.lessons, lesson => lesson.id), [1, 2, 3, 4], 'challenge ids are sequential');
assert.ok(program.title.includes('עומר העתידנית'), 'course title is about futuristic Omer');
assert.ok(program.subtitle.includes('חקר'), 'subtitle includes research');
assert.ok(program.sharedOutcomes.some(item => item.includes('חשיבה מערכתית')), 'shared outcomes include systems thinking');

const serialized = JSON.stringify(program);
assert.ok(!serialized.includes('agent.move'), 'grade 4 course does not include Agent coding');
assert.ok(!serialized.includes('player.onChat'), 'grade 4 course does not include chat command programming');
assert.ok(!serialized.includes('JavaScript'), 'grade 4 course does not teach JavaScript');

for (const lesson of program.lessons) {
  assert.equal(lesson.durationMinutes, 75, `challenge ${lesson.id} meetings are 75 minutes`);
  assert.equal(lesson.challengeDuration, '4 שיעורים', `challenge ${lesson.id} is presented as 4 meetings`);
  assert.equal(lesson.grade, 'כיתה ד׳', `challenge ${lesson.id} targets grade 4`);
  assert.equal(lesson.platform, 'Minecraft Education + Craftom', `challenge ${lesson.id} uses Craftom/Minecraft`);
  assert.ok(lesson.title && lesson.theme && lesson.systemFocus && lesson.story, `challenge ${lesson.id} has core metadata`);
  assert.ok(lesson.imaginePrompt && lesson.imaginePrompt.includes('דמיינו'), `challenge ${lesson.id} has child-world prompt`);
  assert.ok(lesson.teacherGoal && lesson.studentOutcome && lesson.bigQuestion, `challenge ${lesson.id} has pedagogy`);
  assert.ok(lesson.researchPrompt && lesson.researchPrompt.includes('חקר'), `challenge ${lesson.id} has research prompt`);
  assert.ok(lesson.minecraftBuild && lesson.minecraftBuild.length > 20, `challenge ${lesson.id} has concrete Minecraft build`);
  assert.ok(lesson.story.includes('עומר') || lesson.minecraftBuild.includes('עומר'), `challenge ${lesson.id} is anchored to Omer`);
  assert.equal(lesson.totalMeetings, 4, `challenge ${lesson.id} has 4 meetings`);
  assert.equal(lesson.meetings.length, 4, `challenge ${lesson.id} defines 4 meetings`);
  assert.ok(lesson.meetings.every(item => item.length === 4), `challenge ${lesson.id} meetings include number, title, task, deliverable`);
  assert.ok(lesson.workshopTasks.length === 4, `challenge ${lesson.id} exposes workshop tasks for slides`);
  assert.ok(lesson.exitTicket, `challenge ${lesson.id} has exit ticket`);
  assert.ok(lesson.image && exists(lesson.image), `challenge ${lesson.id} has an existing Minecraft image`);
  assert.ok(lesson.jsonSpec && exists(lesson.jsonSpec), `challenge ${lesson.id} has JSON success spec`);
  assert.ok(lesson.successChecks.length >= 4, `challenge ${lesson.id} has success checks`);
  assert.ok(lesson.teacherPrep.length >= 3, `challenge ${lesson.id} has teacher prep`);
  assert.ok(lesson.meetings.length === 4, `challenge ${lesson.id} has concrete meeting steps`);
  assert.ok(lesson.flow.length >= 7, `challenge ${lesson.id} has detailed flow`);
  assert.ok(lesson.studentWorksheet.fields.length >= 8, `challenge ${lesson.id} has worksheet fields`);
  assert.ok(lesson.studentWorksheet.fields.some(field => field.label.includes('למי זה עוזר')), `challenge ${lesson.id} asks who it helps`);
  assert.ok(lesson.studentWorksheet.fields.some(field => field.label.includes('מתחבר')), `challenge ${lesson.id} asks how it connects`);
  assert.ok(lesson.studentWorksheet.checklist.length >= 4, `challenge ${lesson.id} has worksheet checklist`);

  const json = JSON.parse(read(lesson.jsonSpec));
  assert.equal(json.challengeStructure.estimatedMeetings, 4, `challenge ${lesson.id} JSON is four meetings`);
  assert.ok(json.challengeStructure.childWorldPrompt, `challenge ${lesson.id} JSON has child-world prompt`);
  assert.equal(json.studentDeliverable?.meetingDeliverables?.length, 4, `challenge ${lesson.id} JSON has meeting deliverables`);
  assert.ok(json.craftomEvidence, `challenge ${lesson.id} JSON has craftom evidence`);
  assert.ok(json.teacherReport?.scoreBands?.length >= 4, `challenge ${lesson.id} JSON has score bands`);
}

assert.ok(program.lessons[0].title.includes('שער'), 'challenge 1 opens with vision gate');
assert.ok(program.lessons[1].title.includes('שכונה'), 'challenge 2 builds a neighborhood');
assert.ok(program.lessons[2].title.includes('טבע'), 'challenge 3 covers nature/water/energy');
assert.ok(program.lessons[3].title.includes('רכבת'), 'challenge 4 closes with a train tour');
assert.equal(program.buildProtocol.roles.length, 5, 'program defines build roles');

const hub = read('omer-future-craftom.html');
assert.ok(hub.includes('עומר העתידנית'), 'hub has course title');
assert.ok(hub.includes('בלי תכנות'), 'hub states no coding');
assert.ok(hub.includes('grid-4'), 'hub uses Craftom preview style stats grid');
assert.ok(hub.includes('4</h2><b>אתגרים'), 'hub presents 4 challenges');
assert.ok(hub.includes('תמונת Minecraft'), 'hub mentions Minecraft image');
assert.ok(hub.includes('JSON הצלחה'), 'hub links JSON success');
assert.ok(hub.includes('lesson.meetings'), 'hub renders meetings per challenge');
assert.ok(hub.includes('lesson.imaginePrompt'), 'hub renders child-world prompt');
assert.ok(hub.includes('program.omerAnchor'), 'hub renders Omer anchor text');
assert.ok(hub.includes('lesson.image'), 'hub renders images from challenge data');
assert.ok(hub.includes('omer-future-craftom-challenge.html?lesson=${lesson.id}'), 'hub links Omer challenge pages');
assert.ok(hub.includes('omer-future-craftom-students.html?lesson=${lesson.id}'), 'hub links student worksheets');
assert.ok(hub.includes('omer-future-craftom-slides.html?lesson=${lesson.id}'), 'hub links instructor slides');
assert.ok(hub.includes('js/omer-future-craftom-lessons.js'), 'hub loads course data');

const students = read('omer-future-craftom-students.html');
assert.ok(students.includes('דף תלמידים'), 'students page is a worksheet');
assert.ok(students.includes('window.getOmerFutureCraftomLesson'), 'students page uses course lessons');
assert.ok(students.includes('localStorage'), 'students page saves locally');
assert.ok(students.includes('copySummary'), 'students page can copy summary');
assert.ok(students.includes('מה עושים היום'), 'students page presents exact work mode');
assert.ok(students.includes('4 שיעורים באתגר'), 'students page shows challenge meetings');
assert.ok(students.includes('אתגר'), 'students page uses challenge language');

const slides = read('omer-future-craftom-slides.html');
assert.ok(slides.includes('מצגת מדריך'), 'slides page is instructor deck');
assert.ok(slides.includes('lessonPicker'), 'slides page can switch challenges');
assert.ok(slides.includes('לא מלמדים קוד'), 'slides remind no coding');
assert.ok(slides.includes('מה לבדוק בזמן עבודה'), 'slides include teacher observation checks');
assert.ok(slides.includes('תבנית סיור סופי'), 'slides include final tour template');

const challengePage = read('omer-future-craftom-challenge.html');
assert.ok(challengePage.includes('grid-4'), 'challenge page uses Craftom challenge card grid');
assert.ok(challengePage.includes('lesson.meetings'), 'challenge page renders four meeting cards');
assert.ok(challengePage.includes('imaginePrompt'), 'challenge page renders child-world prompt');
assert.ok(challengePage.includes('minecraft-shot'), 'challenge page has Minecraft hero image');
assert.ok(challengePage.includes('JSON הצלחה'), 'challenge page links JSON success');
assert.ok(challengePage.includes('window.getOmerFutureCraftomLesson'), 'challenge page loads lesson by query');

const improvement = read('omer-future-craftom-improvement.html');
assert.ok(improvement.includes('בקשת שיפור'), 'improvement page has title');
assert.ok(improvement.includes('/api/feedback'), 'improvement page posts feedback');
assert.ok(improvement.includes("source: 'omer-future-craftom'"), 'improvement page identifies course source');

const index = read('index.html');
assert.ok(index.includes('omer-future-craftom.html'), 'home page links Omer future course');
assert.ok(index.includes('עומר העתידנית'), 'home page labels Omer future course');
assert.ok(index.includes('4 אתגרים'), 'home page presents the revised challenge structure');

console.log('omer-future-craftom-course tests passed');
