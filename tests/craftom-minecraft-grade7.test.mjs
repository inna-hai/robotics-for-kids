import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import vm from 'node:vm';

const read = path => readFileSync(path, 'utf8');
const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(read('js/craftom-minecraft-challenges.js'), sandbox);

const program = sandbox.window.CRAFTOM_MINECRAFT_PROGRAM;
assert.ok(program, 'Craftom grade 7 program exists');
assert.equal(program.grade, 'כיתה ז׳');
assert.equal(program.totalChallenges, 4);
assert.equal(program.totalMeetings, 16);
assert.equal(program.meetingsPerChallenge, 4);
assert.match(program.plot, /50x50/);

assert.deepEqual(Array.from(program.challenges, challenge => challenge.title), [
  'הרובוט השליח',
  'גשר הבנאי',
  'מעבר חציה חכם',
  'העיר החכמה שלי'
]);

for (const challenge of program.challenges) {
  assert.equal(challenge.meetings.length, 4, `challenge ${challenge.id} has 4 meetings`);
  for (const meeting of challenge.meetings) {
    const detail = meeting[4];
    assert.ok(detail.goal, `meeting ${meeting[0]} has a lesson goal`);
    assert.ok(detail.teacher.length >= 3, `meeting ${meeting[0]} has teacher steps`);
    assert.ok(detail.build.length >= 3, `meeting ${meeting[0]} has Minecraft build steps`);
    assert.ok(detail.code.length >= 3, `meeting ${meeting[0]} has MakeCode steps`);
    assert.ok(detail.evidence.length >= 4, `meeting ${meeting[0]} has Craftom evidence checks`);
    assert.ok(detail.exit, `meeting ${meeting[0]} has an exit ticket`);
  }
  assert.ok(challenge.video.startsWith('marketing/craftom-challenge'), `challenge ${challenge.id} uses recovered Craftom video`);
  assert.ok(existsSync(challenge.video), `video exists for challenge ${challenge.id}`);
  assert.ok(challenge.checks.length >= 4, `challenge ${challenge.id} has Craftom checks`);
}

const hub = read('craftom-school/preview/index.html');
assert.match(hub, /Craftom Challenges.*כיתה ז׳/);
assert.match(hub, /js\/craftom-minecraft-challenges\.js/);
assert.match(hub, /craftom-minecraft-challenge\.html\?challenge=/);
assert.doesNotMatch(hub, /כיתה ד׳ 1|עומר העתידית|15 מפגשים/);

const challengePage = read('craftom-minecraft-challenge.html');
assert.match(challengePage, /window\.getCraftomMinecraftChallenge/);
assert.match(challengePage, /challenge\.video/);
assert.match(challengePage, /craftom-minecraft-students\.html/);
assert.match(challengePage, /שיעור מפורט/);
assert.match(challengePage, /מה המורה עושה/);
assert.match(challengePage, /ראיות Craftom/);

const studentsPage = read('craftom-minecraft-students.html');
assert.match(studentsPage, /דף עבודה לתלמידים/);
assert.match(studentsPage, /מגרש 50x50/);

const slidesPage = read('craftom-minecraft-slides.html');
assert.match(slidesPage, /מצגת מדריך/);
assert.match(slidesPage, /challenge\.meetings/);

const home = read('index.html');
assert.match(home, /Craftom Challenges כיתה ז׳/);
assert.match(home, /craftom-school\/preview\/index\.html/);

for (const id of [1, 2, 3, 4]) {
  assert.match(read(`craftom-minecraft-challenge-${id}.html`), new RegExp(`challenge=${id}`), `legacy challenge ${id} link redirects`);
  assert.match(read(`craftom-minecraft-lesson-${id}.html`), new RegExp(`challenge=${id}`), `legacy lesson ${id} link redirects`);
}

console.log('Craftom grade 7 course restoration checks passed');
