import { readFileSync, existsSync } from 'node:fs';
import { strict as assert } from 'node:assert';
import vm from 'node:vm';

const root = new URL('../', import.meta.url);
const read = path => readFileSync(new URL(path, root), 'utf8');
const exists = path => existsSync(new URL(path, root));
const sandbox = { window: {} };

vm.createContext(sandbox);
vm.runInContext(read('js/craftom-minecraft-challenges.js'), sandbox);

const program = sandbox.window.CRAFTOM_MINECRAFT_PROGRAM;
assert.ok(program, 'Craftom Minecraft program exists');
assert.equal(program.totalChallenges, 4, 'program has 4 challenges');
assert.equal(program.totalMeetings, 16, 'program has 16 meetings');
assert.ok(program.subtitle.includes('עבודה עצמית'), 'program frames the course as a self-study lomda');
assert.ok(program.subtitle.includes('בהמשכים'), 'program frames the course as one continuing city');
assert.equal(
  program.overviewVideo,
  'marketing/craftom-program-real-minecraft-gemini-live-1x.mp4',
  'program points to the real Minecraft overview video'
);
assert.ok(exists(program.overviewVideo), 'overview video file exists');
assert.ok(exists(program.overviewPoster), 'overview video poster exists');
assert.ok(program.exitUpload.includes('צילום'), 'program has a photo upload requirement for exit tickets');
assert.ok(program.exitUpload.includes('כרטיס היציאה'), 'photo upload is tied to the exit ticket');

const [challenge1, challenge2, challenge3, challenge4] = program.challenges;
assert.equal(challenge1.title, 'הרובוט השליח', 'challenge 1 keeps the courier foundation');
assert.equal(challenge2.title, 'קו המשלוחים האוטומטי', 'challenge 2 is the automatic delivery line');
assert.equal(challenge3.title, 'קו משלוחים חכם', 'challenge 3 is the smart delivery line');
assert.equal(challenge4.title, 'העיר החכמה שלי', 'challenge 4 is the personal smart city project');
assert.ok(challenge4.concept.includes('אוטומציות למערכות בעיר'), 'challenge 4 focuses on adding automations to city systems');
assert.ok(challenge4.checks[0].includes('לפחות שתי מערכות'), 'challenge 4 requires more than one city system/automation');
assert.ok(challenge4.checks[2].includes('לפחות שני רעיונות'), 'challenge 4 asks students to combine multiple programming ideas');
assert.equal(
  challenge4.video,
  'marketing/craftom-challenge4-smart-city-automations-gemini-live-1x.mp4',
  'challenge 4 points to the updated smart city automations video'
);
assert.ok(exists(challenge4.video), 'challenge 4 updated video file exists');
assert.ok(exists(challenge4.poster), 'challenge 4 updated poster exists');
assert.ok(challenge2.concept.includes('start/stop'), 'challenge 2 teaches safe loop controls');
assert.ok(challenge2.meetings[2][4].code.some(item => item.includes('running')), 'challenge 2 includes running variable details');
assert.equal(
  challenge2.video,
  'marketing/craftom-challenge2-delivery-line-gemini-live-1x.mp4',
  'challenge 2 points to the updated automatic delivery line video'
);
assert.ok(exists(challenge2.video), 'challenge 2 updated video file exists');
assert.ok(exists(challenge2.poster), 'challenge 2 updated poster exists');
assert.ok(challenge3.concept.includes('if/else'), 'challenge 3 teaches conditions');
assert.ok(challenge3.checks.some(item => item.includes('מצב נראה בעולם')), 'challenge 3 requires visible Minecraft state');
assert.ok(challenge3.meetings[0][4].code.some(item => item.includes('agent.detect')), 'challenge 3 includes a Minecraft-visible state check option');
assert.ok(!challenge3.meetings[2][4].code.join(' ').includes('else pause(1000) else'), 'challenge 3 does not present two else branches as one code sequence');
assert.equal(
  challenge3.video,
  'marketing/craftom-challenge3-smart-delivery-line-gemini-live-1x.mp4',
  'challenge 3 points to the updated smart delivery line video'
);
assert.ok(exists(challenge3.video), 'challenge 3 updated video file exists');
assert.ok(exists(challenge3.poster), 'challenge 3 updated poster exists');
assert.ok(challenge4.meetings[3][1].includes('דמו'), 'challenge 4 closes with a demo lesson');
assert.ok(challenge4.meetings[0][4].exit.includes('שתי מערכות'), 'challenge 4 first exit ticket matches the multi-system final project');

const serialized = JSON.stringify(program);
assert.ok(!serialized.includes('גשר הבנאי'), 'old bridge framing was removed from the curriculum data');
assert.ok(!serialized.includes('מעבר חציה חכם'), 'old disconnected crosswalk framing was removed from the curriculum data');
assert.equal(challenge2.command, 'start / stop', 'old bridge command was replaced with start/stop');

const preview = read('craftom-school/preview/index.html');
assert.ok(preview.includes('programVideo'), 'preview page renders the program video element');
assert.ok(preview.includes('סרטון פתיחת התוכנית'), 'preview page labels the overview video');
assert.ok(preview.includes('program.overviewVideo'), 'preview page loads video from program data');
assert.ok(preview.includes('איך עובדים בלומדה'), 'preview explains the self-study mode before teacher materials');
assert.ok(preview.includes('20260904-self-study-2'), 'preview page cache-busts the updated challenge data');

for (const path of [
  'craftom-minecraft-challenge.html',
  'craftom-minecraft-students.html',
  'craftom-minecraft-slides.html',
  'craftom-minecraft-lesson.html',
]) {
  assert.ok(read(path).includes('20260904-self-study-2'), `${path} loads the updated challenge data`);
}

assert.ok(read('craftom-minecraft-challenge.html').includes('רצף עבודה עצמית'), 'challenge page frames the work as self-study');
assert.ok(read('craftom-minecraft-lesson.html').includes('איך עובדים לבד'), 'lesson page starts lesson detail with self-study steps');
assert.ok(read('craftom-minecraft-students.html').includes('דף עבודה עצמית'), 'student worksheet is framed as self-study');
assert.ok(read('craftom-minecraft-lesson.html').includes('העלאת תמונה'), 'lesson page asks for a photo upload in the exit ticket area');
assert.ok(read('craftom-minecraft-challenge.html').includes('program.exitUpload'), 'challenge page shows the shared photo upload requirement');
assert.ok(read('craftom-minecraft-students.html').includes('העלאת תמונה ל-Craftom'), 'student worksheet includes a Craftom photo upload field');
assert.ok(read('craftom-minecraft-slides.html').includes('program.exitUpload'), 'slides remind instructors that exit tickets include a photo upload');

for (const path of [
  'craftom-minecraft-challenge.html',
  'craftom-minecraft-lesson.html',
  'js/craftom-minecraft-lesson-page.js',
]) {
  const content = read(path);
  assert.ok(!content.includes('מה המורה עושה'), `${path} does not show teacher instructions in student-facing material`);
  assert.ok(content.includes('מצגת מדריך'), `${path} links to the instructor slides instead`);
}

console.log('craftom-minecraft-course tests passed');
