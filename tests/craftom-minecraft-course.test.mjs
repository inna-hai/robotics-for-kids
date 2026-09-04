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
assert.ok(program.subtitle.includes('בהמשכים'), 'program frames the course as one continuing city');
assert.equal(
  program.overviewVideo,
  'marketing/craftom-program-real-minecraft-gemini-live-1x.mp4',
  'program points to the real Minecraft overview video'
);
assert.ok(exists(program.overviewVideo), 'overview video file exists');
assert.ok(exists(program.overviewPoster), 'overview video poster exists');

const [challenge1, challenge2, challenge3, challenge4] = program.challenges;
assert.equal(challenge1.title, 'הרובוט השליח', 'challenge 1 keeps the courier foundation');
assert.equal(challenge2.title, 'קו המשלוחים האוטומטי', 'challenge 2 is the automatic delivery line');
assert.equal(challenge3.title, 'קו משלוחים חכם', 'challenge 3 is the smart delivery line');
assert.equal(challenge4.title, 'העיר החכמה שלי', 'challenge 4 is the personal smart city project');
assert.equal(
  challenge4.video,
  'marketing/craftom-challenge4-smart-city-project-gemini-live-1x.mp4',
  'challenge 4 points to the updated smart city project video'
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
assert.equal(
  challenge3.video,
  'marketing/craftom-challenge3-smart-delivery-line-gemini-live-1x.mp4',
  'challenge 3 points to the updated smart delivery line video'
);
assert.ok(exists(challenge3.video), 'challenge 3 updated video file exists');
assert.ok(exists(challenge3.poster), 'challenge 3 updated poster exists');
assert.ok(challenge4.meetings[3][1].includes('דמו'), 'challenge 4 closes with a demo lesson');

const serialized = JSON.stringify(program);
assert.ok(!serialized.includes('גשר הבנאי'), 'old bridge framing was removed from the curriculum data');
assert.ok(!serialized.includes('מעבר חציה חכם'), 'old disconnected crosswalk framing was removed from the curriculum data');
assert.equal(challenge2.command, 'start / stop', 'old bridge command was replaced with start/stop');

const preview = read('craftom-school/preview/index.html');
assert.ok(preview.includes('programVideo'), 'preview page renders the program video element');
assert.ok(preview.includes('סרטון פתיחת התוכנית'), 'preview page labels the overview video');
assert.ok(preview.includes('program.overviewVideo'), 'preview page loads video from program data');
assert.ok(preview.includes('20260904-delivery-videos-3'), 'preview page cache-busts the updated challenge data');

for (const path of [
  'craftom-minecraft-challenge.html',
  'craftom-minecraft-students.html',
  'craftom-minecraft-slides.html',
  'craftom-minecraft-lesson.html',
]) {
  assert.ok(read(path).includes('20260904-delivery-videos-3'), `${path} loads the updated challenge data`);
}

console.log('craftom-minecraft-course tests passed');
