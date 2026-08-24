import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const root = new URL('../', import.meta.url);
const homepageHtml = readFileSync(new URL('index.html', root), 'utf8');
const courseHtml = readFileSync(new URL('drone-intelligence-lab-grade9.html', root), 'utf8');
const playHtml = readFileSync(new URL('drone-intelligence-lab-grade9-play.html', root), 'utf8');
const slidesHtml = readFileSync(new URL('drone-intelligence-lab-grade9-slides.html', root), 'utf8');
const guideHtml = readFileSync(new URL('drone-intelligence-lab-grade9-guide.html', root), 'utf8');
const lessonsSource = readFileSync(new URL('js/drone-intelligence-lab-grade9-lessons.js', root), 'utf8');

function assertIncludes(source, needle, message = `Missing: ${needle}`) { assert.ok(source.includes(needle), message); }
function loadLessons() { const sandbox = { window: {} }; vm.createContext(sandbox); vm.runInContext(lessonsSource, sandbox); return sandbox.window; }
const data = loadLessons();

test('Drone Intelligence Lab exposes a 15 lesson grade 9 JavaScript intelligence scaffold', () => {
  const lessons = data.DRONE_INTELLIGENCE_LAB_GRADE9_LESSONS;
  assert.equal(lessons.length, 15);
  assert.equal(JSON.stringify(lessons.map(l => l.id)), JSON.stringify(Array.from({ length: 15 }, (_, i) => i + 1)));
  assert.ok(lessons.every(l => l.durationMinutes === 90));
  assert.ok(lessons.every(l => l.grade === 'כיתה ט׳ עתודה'));
  assert.ok(lessons.every(l => l.language === 'JavaScript'));
  assert.ok(lessons.every(l => l.tabletFirst === true));
  assert.ok(lessons.slice(0, 4).every(l => l.physicalFlightAllowed === false));
  assert.ok(lessons.slice(4).every(l => l.physicalFlightAllowed === true));
});

test('Drone Intelligence Lab follows the syllabus topics for grade 9', () => {
  const lessons = data.DRONE_INTELLIGENCE_LAB_GRADE9_LESSONS;
  assertIncludes(lessons[5].title, 'לוגיקה אלגוריתמית מורכבת');
  assertIncludes(lessons[5].concept, 'Boolean');
  assertIncludes(lessons[6].title, 'סריקה תלת־ממדית');
  assertIncludes(lessons[7].title, 'מכשולים דינמיים');
  assertIncludes(lessons[8].title, 'ניתוח יעילות קוד');
  assertIncludes(lessons[8].concept, 'Performance');
  assertIncludes(lessons[9].title, 'מעבדה חכמה בשטח');
  assertIncludes(lessons[13].title, 'דוח טכנולוגי');
  assertIncludes(lessons[14].title, 'פיץ׳ טכנולוגי');
});

test('Drone Intelligence Lab pages are linked from homepage and use the hybrid model', () => {
  assertIncludes(homepageHtml, 'Drone Intelligence Lab');
  assertIncludes(homepageHtml, 'href="drone-intelligence-lab-grade9.html"');
  assertIncludes(homepageHtml, 'href="drone-intelligence-lab-grade9-play.html?lesson=1"');
  assertIncludes(courseHtml, 'Drone Intelligence Lab');
  assertIncludes(courseHtml, 'משימות חכמות וניתוח שטח');
  assertIncludes(courseHtml, 'js/drone-intelligence-lab-grade9-lessons.js');
  assertIncludes(courseHtml, 'drone-intelligence-lab-grade9-slides.html?lesson=1');
  assertIncludes(courseHtml, 'drone-intelligence-lab-grade9-guide.html?lesson=1');
  assertIncludes(playHtml, 'window.getDroneIntelligenceLabGrade9Lesson');
  assertIncludes(playHtml, 'DroneBlocks Code בטאבלט');
  assertIncludes(playHtml, 'renderAppWorkflow');
  assertIncludes(slidesHtml, 'Drone Intelligence Lab');
  assertIncludes(guideHtml, 'מערך מדריך — Drone Intelligence Lab');
});

test('Drone Intelligence Lab course page has sky and flight effect styling', () => {
  assertIncludes(courseHtml, 'linear-gradient(180deg,#6dd5ff');
  assertIncludes(courseHtml, '@keyframes skyDrift');
  assertIncludes(courseHtml, '@keyframes flyAcross');
  assertIncludes(courseHtml, 'body:after');
  assertIncludes(courseHtml, '🚁');
});

test('Drone Intelligence Lab lesson model is ready for future full lesson production', () => {
  for (const lesson of data.DRONE_INTELLIGENCE_LAB_GRADE9_LESSONS) {
    assert.ok(lesson.lessonFlow.length >= 7, `lesson ${lesson.id} should have 90 minute flow`);
    assert.ok(lesson.exercises.length >= 7, `lesson ${lesson.id} should have scaffold exercises`);
    assert.ok(lesson.successCriteria.length >= 5, `lesson ${lesson.id} should have success criteria`);
    assert.ok(lesson.instructorGuide?.pedagogy?.length >= 3, `lesson ${lesson.id} should have instructor pedagogy notes`);
    assert.ok(lesson.appWorkflow?.length >= 4, `lesson ${lesson.id} should have external app workflow`);
  }
});
