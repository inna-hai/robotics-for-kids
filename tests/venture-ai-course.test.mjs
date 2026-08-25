import { existsSync, readFileSync } from 'node:fs';
import { strict as assert } from 'node:assert';
import vm from 'node:vm';

const root = new URL('../', import.meta.url);
const read = path => readFileSync(new URL(path, root), 'utf8');
const sandbox = { window: {} };

vm.createContext(sandbox);
vm.runInContext(read('js/venture-ai-lessons.js'), sandbox);

const program = sandbox.window.VENTURE_AI_PROGRAM;
assert.ok(program, 'venture AI program exists');
assert.equal(program.targetAudience, 'כיתות ח׳', 'program targets grade 8');
assert.equal(program.totalMeetings, 4, 'program has 4 meetings');
assert.equal(program.toolName, 'Opal', 'program uses Opal');
assert.equal(program.lessons.length, 4, 'program exposes 4 lessons');
assert.ok(program.teamFramework.summary.includes('4-5 תלמידים'), 'program defines fixed 4-5 student teams');
assert.equal(program.teamFramework.roles.length, 5, 'program defines five team roles');
assert.deepEqual(Array.from(program.lessons, lesson => lesson.id), [1, 2, 3, 4], 'lesson ids are sequential');

for (const lesson of program.lessons) {
  assert.equal(lesson.durationMinutes, 90, `lesson ${lesson.id} is 90 minutes`);
  assert.ok(lesson.title && lesson.teacherGoal && lesson.studentOutcome, `lesson ${lesson.id} has core metadata`);
  assert.ok(lesson.flow.length >= 7, `lesson ${lesson.id} has detailed flow`);
  assert.ok(lesson.workshopTasks.length >= 5, `lesson ${lesson.id} has workshop tasks`);
  assert.ok(lesson.opalPrompt.includes('___'), `lesson ${lesson.id} has fillable Opal prompt`);
  assert.ok(lesson.instructorNotes.length >= 3, `lesson ${lesson.id} has instructor notes`);
  assert.ok(lesson.exitTicket, `lesson ${lesson.id} has exit ticket`);
  assert.ok(lesson.studentWorksheet, `lesson ${lesson.id} has student worksheet`);
  assert.ok(lesson.studentWorksheet.fields.length >= 6, `lesson ${lesson.id} has worksheet fields`);
  assert.ok(lesson.studentWorksheet.checklist.length >= 5, `lesson ${lesson.id} has worksheet checklist`);
  assert.ok(lesson.image, `lesson ${lesson.id} has a visual asset`);
  assert.ok(existsSync(new URL(lesson.image, root)), `lesson ${lesson.id} image file exists`);
  if (lesson.video) {
    assert.ok(existsSync(new URL(lesson.video, root)), `lesson ${lesson.id} video file exists`);
  }
}

assert.ok(program.lessons[0].title.includes('מיזם עירוני'), 'lesson 1 starts from a city venture');
assert.ok(program.lessons[0].keyConcepts.includes('לאו-טק'), 'lesson 1 introduces high-tech and low-tech framing');
assert.ok(program.lessons[0].keyConcepts.includes('אופאל כסוכן AI'), 'lesson 1 opens Opal as an AI thinking agent');
assert.equal(program.lessons[0].video, 'marketing/venture-ai-lesson1-explainer.mp4', 'lesson 1 has embedded explainer video');
assert.ok(program.lessons[1].keyConcepts.includes('MoSCoW'), 'lesson 2 uses MoSCoW to narrow scope');
assert.ok(program.lessons[1].opalPrompt.includes('Must'), 'lesson 2 feeds Must scope into the Opal prompt');
assert.equal(program.lessons[1].video, 'marketing/venture-ai-lesson2-explainer.mp4', 'lesson 2 has embedded explainer video');
assert.ok(program.lessons[2].title.includes('אופאל'), 'lesson 3 builds in Opal');
assert.ok(program.lessons[2].keyConcepts.includes('תפקידי צוות'), 'lesson 3 includes team roles');
assert.equal(program.lessons[2].video, 'marketing/venture-ai-lesson3-explainer.mp4', 'lesson 3 has embedded explainer video');
assert.ok(program.lessons[3].title.includes('מציגים'), 'lesson 4 closes with demo/pitch');
assert.ok(program.lessons[3].keyConcepts.includes('ביקורת עמיתים'), 'lesson 4 includes peer critique');
assert.equal(program.lessons[3].video, 'marketing/venture-ai-lesson4-explainer.mp4', 'lesson 4 has embedded explainer video');
assert.ok(program.lessons[3].teacherGoal.includes('המפגש האחרון'), 'lesson 4 opens as the final meeting');
assert.ok(program.lessons[3].studentOutcome.includes('מגיש'), 'lesson 4 ends with submission');
assert.ok(program.pitchTemplate[0].includes('חולון'), 'pitch template keeps the city context');

const page = read('venture-ai.html');
assert.ok(page.includes('מרעיון למיזם עם AI'), 'course page has title');
assert.ok(page.includes('venture-ai-slides.html?lesson=${lesson.id}'), 'course page links instructor slides inside each lesson');
assert.ok(page.includes('venture-ai-students.html?lesson=${lesson.id}'), 'course page links student worksheet inside each lesson');
assert.ok(page.includes('venture-ai-improvement.html'), 'course page links improvement request form');
assert.ok(page.includes('https://opal.hai.tech/'), 'course page links Opal');
assert.ok(page.includes('meeting-image'), 'course page renders meeting images');
assert.ok(page.includes('meeting-video'), 'course page can render lesson videos instead of images');
assert.ok(page.includes('teamFrameTitle'), 'course page renders team framework');
assert.ok(page.includes('<video controls playsinline'), 'course page embeds the program explainer video');
assert.ok(page.includes('marketing/venture-ai-program-explainer.mp4'), 'course page uses internal MP4 explainer video');
assert.ok(page.includes('lesson.video ? `<video class="meeting-video"'), 'course page embeds lesson videos inside meeting cards');
assert.ok(page.includes('סרטון פתיחה'), 'course page labels the explainer video clearly');
assert.ok(existsSync(new URL('marketing/venture-ai-program-explainer.mp4', root)), 'explainer video file exists');

const slides = read('venture-ai-slides.html');
assert.ok(slides.includes('מצגת מדריך'), 'slides page is instructor deck');
assert.ok(slides.includes('lessonPicker'), 'slides page can switch lessons');
assert.ok(slides.includes('תבנית פיץ׳ סיום'), 'slides include pitch template');
assert.ok(slides.includes('teamFramework'), 'slides include team framework');

const students = read('venture-ai-students.html');
assert.ok(students.includes('דף עבודה לתלמידים'), 'students page is a worksheet');
assert.ok(students.includes('localStorage'), 'students page saves locally');
assert.ok(students.includes('copySummary'), 'students page can copy submission summary');
assert.ok(students.includes('markSubmitted'), 'students page can mark submission');
assert.ok(students.includes('venture-ai-improvement.html'), 'students page links improvement request form');
assert.ok(students.includes('teamRoles'), 'students page renders team roles');

const improvement = read('venture-ai-improvement.html');
assert.ok(improvement.includes('בקשת שיפור'), 'improvement page has title');
assert.ok(improvement.includes('/api/feedback'), 'improvement page posts to feedback API');
assert.ok(improvement.includes('מפגש 4 - דמו ופיץ׳'), 'improvement page can target all venture lessons');
assert.ok(improvement.includes('buildMessage'), 'improvement page builds structured request');

const index = read('index.html');
assert.ok(!index.includes('venture-ai.html'), 'home page hides guided venture AI course');
assert.ok(!index.includes('venture-ai-students.html?lesson=1'), 'home page hides venture AI student worksheet');
assert.ok(!index.includes('venture-ai-improvement.html'), 'home page hides venture AI improvement form');
assert.ok(!index.includes('יזמות AI'), 'home page hides venture AI label');

console.log('venture-ai-course tests passed');
