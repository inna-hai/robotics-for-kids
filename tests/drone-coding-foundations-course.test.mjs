import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const root = new URL('../', import.meta.url);
const homepageHtml = readFileSync(new URL('index.html', root), 'utf8');
const courseHtml = readFileSync(new URL('drone-coding-foundations.html', root), 'utf8');
const playHtml = readFileSync(new URL('drone-coding-foundations-play.html', root), 'utf8');
const slidesHtml = readFileSync(new URL('drone-coding-foundations-slides.html', root), 'utf8');
const guideHtml = readFileSync(new URL('drone-coding-foundations-guide.html', root), 'utf8');
const lessonsSource = readFileSync(new URL('js/drone-coding-foundations-lessons.js', root), 'utf8');

function assertIncludes(source, needle, message = `Missing: ${needle}`) { assert.ok(source.includes(needle), message); }
function loadLessons() { const sandbox = { window: {} }; vm.createContext(sandbox); vm.runInContext(lessonsSource, sandbox); return sandbox.window; }
const data = loadLessons();

test('Drone Coding Foundations exposes a 15 lesson grade 7 JavaScript drone scaffold', () => {
  assert.equal(data.DRONE_CODING_FOUNDATIONS_LESSONS.length, 15);
  assert.equal(JSON.stringify(data.DRONE_CODING_FOUNDATIONS_LESSONS.map(l => l.id)), JSON.stringify(Array.from({ length: 15 }, (_, i) => i + 1)));
  assert.ok(data.DRONE_CODING_FOUNDATIONS_LESSONS.every(l => l.durationMinutes === 90));
  assert.ok(data.DRONE_CODING_FOUNDATIONS_LESSONS.every(l => l.grade === 'כיתה ז׳ עתודה'));
  assert.ok(data.DRONE_CODING_FOUNDATIONS_LESSONS.every(l => l.language === 'JavaScript'));
  assert.ok(data.DRONE_CODING_FOUNDATIONS_LESSONS.every(l => l.tabletFirst === true));
  assert.ok(data.DRONE_CODING_FOUNDATIONS_LESSONS.slice(0, 4).every(l => l.physicalFlightAllowed === false));
  assert.ok(data.DRONE_CODING_FOUNDATIONS_LESSONS.slice(4).every(l => l.physicalFlightAllowed === true));
});

test('Drone Coding Foundations follows the syllabus topics from shared base into JavaScript', () => {
  const lessons = data.DRONE_CODING_FOUNDATIONS_LESSONS;
  assertIncludes(lessons[0].title, 'היכרות');
  assertIncludes(lessons[1].title, 'הריבוע');
  assertIncludes(lessons[2].title, 'ענן');
  assertIncludes(lessons[3].title, 'לולאות ומשתנים');
  assertIncludes(lessons[4].title, 'הטסה פיזית ראשונה');
  assertIncludes(lessons[5].title, 'מעבר מבלוקים לקוד טקסטואלי');
  assertIncludes(lessons[6].title, 'for');
  assertIncludes(lessons[7].title, 'פונקציות');
  assertIncludes(lessons[8].title, 'If / Else');
  assertIncludes(lessons[9].title, 'פרויקט הגמר');
  assert.ok(lessons.slice(10, 13).every(l => l.title.includes('שיעור')));
  assertIncludes(lessons[13].title, 'Comments');
  assertIncludes(lessons[14].title, 'אירוע שיא');
});

test('Drone Coding Foundations pages are linked from homepage and use the hybrid course model', () => {
  assertIncludes(homepageHtml, 'Drone Coding Foundations');
  assertIncludes(homepageHtml, 'href="drone-coding-foundations.html"');
  assertIncludes(homepageHtml, 'href="drone-coding-foundations-play.html?lesson=1"');
  assertIncludes(courseHtml, 'Drone Coding Foundations — JavaScript');
  assertIncludes(courseHtml, 'js/drone-coding-foundations-lessons.js');
  assertIncludes(courseHtml, 'drone-coding-foundations-slides.html?lesson=1');
  assertIncludes(courseHtml, 'drone-coding-foundations-guide.html?lesson=1');
  assertIncludes(playHtml, 'window.getDroneCodingFoundationsLesson');
  assertIncludes(playHtml, 'droneblocks-code');
  assertIncludes(playHtml, 'DroneBlocks Code בטאבלט');
  assertIncludes(playHtml, 'renderAppWorkflow');
  assertIncludes(slidesHtml, 'Drone Coding Foundations');
  assertIncludes(guideHtml, 'מערך מדריך — Drone Coding Foundations');
});

test('Drone Coding Foundations lesson model is ready for future full lesson production', () => {
  for (const lesson of data.DRONE_CODING_FOUNDATIONS_LESSONS) {
    assert.ok(lesson.lessonFlow.length >= 7, `lesson ${lesson.id} should have 90 minute flow`);
    assert.ok(lesson.exercises.length >= 7, `lesson ${lesson.id} should have scaffold exercises`);
    assert.ok(lesson.successCriteria.length >= 5, `lesson ${lesson.id} should have success criteria`);
    assert.ok(lesson.instructorGuide?.pedagogy?.length >= 3, `lesson ${lesson.id} should have instructor pedagogy notes`);
    assert.ok(lesson.appWorkflow?.length >= 4, `lesson ${lesson.id} should have external app workflow`);
  }
});
