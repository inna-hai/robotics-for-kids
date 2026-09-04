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
assert.equal(program.lessons.length, 16, 'program exposes 16 detailed lesson pages');
assert.match(program.exitUpload, /צילום/, 'exit ticket asks students to upload a Minecraft photo');

assert.deepEqual(Array.from(program.challenges, challenge => challenge.title), [
  'הרובוט השליח',
  'קו המשלוחים האוטומטי',
  'קו משלוחים חכם',
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
assert.match(hub, /craftom-minecraft-lesson-\$\{lessonId\}\.html/);
assert.doesNotMatch(hub, /כיתה ד׳ 1|עומר העתידית|15 מפגשים/);

const challengePage = read('craftom-minecraft-challenge.html');
assert.match(challengePage, /window\.getCraftomMinecraftChallenge/);
assert.match(challengePage, /challenge\.video/);
assert.match(challengePage, /craftom-minecraft-students\.html/);
assert.match(challengePage, /שיעור מפורט/);
assert.match(challengePage, /רצף עבודה עצמית/);
assert.doesNotMatch(challengePage, /מה המורה עושה/);
assert.match(challengePage, /ראיות Craftom/);
assert.match(challengePage, /craftom-minecraft-lesson-\$\{\(\(challenge\.id - 1\) \* 4\) \+ index \+ 1\}\.html/);

const studentsPage = read('craftom-minecraft-students.html');
assert.match(studentsPage, /דף עבודה עצמית/);
assert.match(studentsPage, /מגרש 50x50/);
assert.match(studentsPage, /העלאת תמונה ל-Craftom/);

const slidesPage = read('craftom-minecraft-slides.html');
assert.match(slidesPage, /מצגת מדריך/);
assert.match(slidesPage, /challenge\.meetings/);

const home = read('index.html');
assert.match(home, /Craftom Challenges כיתה ז׳/);
assert.match(home, /craftom-school\/preview\/index\.html/);

for (const id of [1, 2, 3, 4]) {
  assert.match(read(`craftom-minecraft-challenge-${id}.html`), new RegExp(`challenge=${id}`), `legacy challenge ${id} link redirects`);
}

for (let id = 1; id <= 16; id += 1) {
  const lessonPage = read(`craftom-minecraft-lesson-${id}.html`);
  assert.match(lessonPage, new RegExp(`data-lesson="${id}"`), `lesson ${id} has its own page`);
  assert.match(lessonPage, /craftom-minecraft-lesson-page\.js/, `lesson ${id} loads shared renderer`);
  assert.match(lessonPage, /20260904-self-study-4/, `lesson ${id} cache-busts the updated exit upload renderer`);
}

const lessonTemplate = read('craftom-minecraft-lesson.html');
const lessonRenderer = read('js/craftom-minecraft-lesson-page.js');
assert.match(lessonTemplate, /challengeLessonMap/, 'lesson template has a map for lessons in the current challenge');
assert.match(lessonTemplate, /בחירת שיעור באתגר הנוכחי/, 'lesson top nav is scoped to the current challenge');
assert.match(lessonTemplate, /exitTicketForm/, 'lesson template has a real exit ticket form');
assert.match(lessonTemplate, /type="file"/, 'lesson template has a real image upload input');
assert.match(lessonRenderer, /fetch\('\/api\/craftom\/exit-ticket'/, 'lesson renderer submits exit tickets to the server');
assert.match(lessonRenderer, /const challengeLessons = program\.lessons\.filter\(item => item\.challengeId === lesson\.challengeId\)/, 'lesson top nav only uses lessons from the current challenge');
assert.doesNotMatch(lessonRenderer, /lessonNav'\)\.innerHTML = program\.lessons\.map/, 'lesson top nav no longer lists all 16 lessons');
assert.match(lessonRenderer, /prevLink\.style\.display = prevLesson/, 'previous lesson button stays inside the current challenge');
assert.match(lessonRenderer, /nextLink\.style\.display = nextLesson/, 'next lesson button stays inside the current challenge');
assert.match(lessonRenderer, /filter\(item => item\.challengeId === lesson\.challengeId\)/, 'lesson renderer filters the current challenge lesson map');
assert.match(lessonRenderer, /challengeMapLink/, 'lesson renderer links back to the current challenge map');
assert.match(lessonRenderer, /לכל האתגרים/, 'lesson renderer links back up to all challenges');

console.log('Craftom grade 7 course restoration checks passed');
