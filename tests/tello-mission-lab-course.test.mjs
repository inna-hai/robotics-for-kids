import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const homepageHtml = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const courseHtml = readFileSync(new URL('../tello-mission-lab.html', import.meta.url), 'utf8');
const playHtml = readFileSync(new URL('../tello-mission-lab-play.html', import.meta.url), 'utf8');
const slidesHtml = readFileSync(new URL('../tello-mission-lab-slides.html', import.meta.url), 'utf8');
const lessonsSource = readFileSync(new URL('../js/tello-mission-lab-lessons.js', import.meta.url), 'utf8');

function assertIncludes(source, needle, message = `Missing: ${needle}`) { assert.ok(source.includes(needle), message); }
function loadLessons() { const sandbox = { window: {} }; vm.createContext(sandbox); vm.runInContext(lessonsSource, sandbox); return sandbox.window; }
const data = loadLessons();

test('Tello Mission Lab exposes a 15 lesson grade 6 tablet-first research course', () => {
  assert.equal(data.TELLO_MISSION_LAB_LESSONS.length, 15);
  assert.equal(JSON.stringify(data.TELLO_MISSION_LAB_LESSONS.map(l => l.id)), JSON.stringify(Array.from({ length: 15 }, (_, i) => i + 1)));
  assert.ok(data.TELLO_MISSION_LAB_LESSONS.every(l => l.durationMinutes === 90));
  assert.ok(data.TELLO_MISSION_LAB_LESSONS.every(l => l.grade === 'כיתה ו׳'));
  assert.ok(data.TELLO_MISSION_LAB_LESSONS.every(l => l.tabletFirst === true));
  assert.ok(data.TELLO_MISSION_LAB_LESSONS.slice(0, 4).every(l => l.physicalFlightAllowed === false));
  assert.ok(data.TELLO_MISSION_LAB_LESSONS.slice(4).every(l => l.physicalFlightAllowed === true));
});

test('Mission Lab lesson 1 follows the user-provided research and safety brief', () => {
  const lesson = data.TELLO_MISSION_LAB_LESSONS[0];
  assertIncludes(lesson.title, 'ממריאים אל המחר');
  assertIncludes(lesson.story, 'Ingenuity');
  assertIncludes(lesson.mission, 'System Check Alpha');
  assert.deepEqual(Array.from(lesson.blocks), ['takeoff', 'hover', 'land']);
  assert.ok(lesson.realWorldUses.some(u => u.title.includes('Ingenuity')));
  assert.ok(lesson.vocabulary.some(v => v[0].includes('Lift')));
  assert.ok(lesson.vocabulary.some(v => v[0].includes('VPS')));
  assert.ok(lesson.safetyRules.some(r => r.includes('סימולטור בלבד')));
  assert.ok(lesson.teamRoles.length === 3);
  assert.ok(lesson.networkProcedure.length >= 4);
  assert.ok(lesson.debuggingGuide.length >= 5);
  assert.ok(lesson.lessonFlow.length === 7);
  assert.ok(lesson.exercises.length >= 7);
});

test('Mission Lab pages are linked and use Blockly connected blocks with simulator UI', () => {
  assertIncludes(homepageHtml, 'Tello Mission Lab — משימות חקר');
  assertIncludes(homepageHtml, 'href="tello-mission-lab.html"');
  assertIncludes(homepageHtml, 'href="tello-mission-lab-play.html?lesson=1"');
  assertIncludes(courseHtml, 'Tello Mission Lab — משימות חקר');
  assertIncludes(courseHtml, 'js/tello-mission-lab-lessons.js');
  assertIncludes(playHtml, 'Blockly.inject');
  assertIncludes(playHtml, 'tello_hover');
  assertIncludes(playHtml, 'System Check Alpha');
  assertIncludes(playHtml, 'סימולטור שמיים');
  assertIncludes(slidesHtml, 'System Check Alpha');
  assertIncludes(slidesHtml, 'Ingenuity');
});
