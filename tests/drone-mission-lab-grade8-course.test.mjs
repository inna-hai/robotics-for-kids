import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const root = new URL('../', import.meta.url);
const homepageHtml = readFileSync(new URL('index.html', root), 'utf8');
const courseHtml = readFileSync(new URL('drone-mission-lab-grade8.html', root), 'utf8');
const playHtml = readFileSync(new URL('drone-mission-lab-grade8-play.html', root), 'utf8');
const slidesHtml = readFileSync(new URL('drone-mission-lab-grade8-slides.html', root), 'utf8');
const guideHtml = readFileSync(new URL('drone-mission-lab-grade8-guide.html', root), 'utf8');
const lessonsSource = readFileSync(new URL('js/drone-mission-lab-grade8-lessons.js', root), 'utf8');

function assertIncludes(source, needle, message = `Missing: ${needle}`) { assert.ok(source.includes(needle), message); }
function loadLessons() { const sandbox = { window: {} }; vm.createContext(sandbox); vm.runInContext(lessonsSource, sandbox); return sandbox.window; }
const data = loadLessons();

test('Drone Mission Lab exposes a 15 lesson grade 8 JavaScript photography and research scaffold', () => {
  const lessons = data.DRONE_MISSION_LAB_GRADE8_LESSONS;
  assert.equal(lessons.length, 15);
  assert.equal(JSON.stringify(lessons.map(l => l.id)), JSON.stringify(Array.from({ length: 15 }, (_, i) => i + 1)));
  assert.ok(lessons.every(l => l.durationMinutes === 90));
  assert.ok(lessons.every(l => l.grade === 'כיתה ח׳'));
  assert.ok(lessons.every(l => l.language === 'JavaScript'));
  assert.ok(lessons.every(l => l.tabletFirst === true));
  assert.ok(lessons.slice(0, 4).every(l => l.physicalFlightAllowed === false));
  assert.ok(lessons.slice(4).every(l => l.physicalFlightAllowed === true));
});

test('Drone Mission Lab follows the syllabus topics for grade 8', () => {
  const lessons = data.DRONE_MISSION_LAB_GRADE8_LESSONS;
  assertIncludes(lessons[5].title, 'סריקה וחיפוש');
  assertIncludes(lessons[5].concept, 'Grid Navigation');
  assertIncludes(lessons[6].title, 'מצלמת הרחפן');
  assertIncludes(lessons[6].mission, 'מצלם');
  assertIncludes(lessons[7].title, 'חיפוש והצלה');
  assertIncludes(lessons[8].title, 'אופטימיזציה');
  assertIncludes(lessons[8].concept, 'Telemetry');
  assertIncludes(lessons[9].title, 'Blueprint');
  assertIncludes(lessons[13].title, 'מצגת מסכמת');
  assertIncludes(lessons[14].title, 'אירוע שיא');
});

test('Drone Mission Lab pages are linked from homepage and use the hybrid model', () => {
  assertIncludes(homepageHtml, 'Drone Mission Lab');
  assertIncludes(homepageHtml, 'href="drone-mission-lab-grade8.html"');
  assertIncludes(homepageHtml, 'href="drone-mission-lab-grade8-play.html?lesson=1"');
  assertIncludes(courseHtml, 'Drone Mission Lab');
  assertIncludes(courseHtml, 'צילום ומשימות חקר');
  assertIncludes(courseHtml, 'js/drone-mission-lab-grade8-lessons.js');
  assertIncludes(courseHtml, 'drone-mission-lab-grade8-slides.html?lesson=1');
  assertIncludes(courseHtml, 'drone-mission-lab-grade8-guide.html?lesson=1');
  assertIncludes(playHtml, 'window.getDroneMissionLabGrade8Lesson');
  assertIncludes(playHtml, 'DroneBlocks Code בטאבלט');
  assertIncludes(playHtml, 'renderAppWorkflow');
  assertIncludes(slidesHtml, 'Drone Mission Lab');
  assertIncludes(guideHtml, 'מערך מדריך — Drone Mission Lab');
});

test('Drone Mission Lab lesson model is ready for future full lesson production', () => {
  for (const lesson of data.DRONE_MISSION_LAB_GRADE8_LESSONS) {
    assert.ok(lesson.lessonFlow.length >= 7, `lesson ${lesson.id} should have 90 minute flow`);
    assert.ok(lesson.exercises.length >= 7, `lesson ${lesson.id} should have scaffold exercises`);
    assert.ok(lesson.successCriteria.length >= 5, `lesson ${lesson.id} should have success criteria`);
    assert.ok(lesson.instructorGuide?.pedagogy?.length >= 3, `lesson ${lesson.id} should have instructor pedagogy notes`);
    assert.ok(lesson.appWorkflow?.length >= 4, `lesson ${lesson.id} should have external app workflow`);
  }
});
