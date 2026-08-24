import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const homepageHtml = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const courseHtml = readFileSync(new URL('../tello-edu-grade5.html', import.meta.url), 'utf8');
const playHtml = readFileSync(new URL('../tello-edu-grade5-play.html', import.meta.url), 'utf8');
const slidesHtml = readFileSync(new URL('../tello-edu-grade5-slides.html', import.meta.url), 'utf8');
const lessonsSource = readFileSync(new URL('../js/tello-edu-grade5-lessons.js', import.meta.url), 'utf8');

function assertIncludes(source, needle, message = `Missing: ${needle}`) {
  assert.ok(source.includes(needle), message);
}

function loadLessons() {
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  vm.runInContext(lessonsSource, sandbox, { filename: 'tello-edu-grade5-lessons.js' });
  return sandbox.window;
}

const data = loadLessons();

test('Tello EDU grade 5 course is a tablet-first 15 lesson DroneBlocks path', () => {
  assert.equal(data.TELLO_EDU_GRADE5_LESSONS.length, 15);
  assert.equal(JSON.stringify(data.TELLO_EDU_GRADE5_LESSONS.map(l => l.id)), JSON.stringify(Array.from({ length: 15 }, (_, i) => i + 1)));
  assert.ok(data.TELLO_EDU_GRADE5_LESSONS.every(l => l.durationMinutes === 90));
  assert.ok(data.TELLO_EDU_GRADE5_LESSONS.every(l => l.grade === 'כיתה ה׳'));
  assert.ok(data.TELLO_EDU_GRADE5_LESSONS.every(l => l.platform.includes('DroneBlocks')));
  assert.ok(data.TELLO_EDU_GRADE5_LESSONS.every(l => l.tabletFirst === true));
});

test('Tello EDU course defers physical flight until lesson 5', () => {
  const lessons = data.TELLO_EDU_GRADE5_LESSONS;
  assert.ok(lessons.slice(0, 4).every(l => l.physicalFlightAllowed === false));
  assert.ok(lessons.slice(4).every(l => l.physicalFlightAllowed === true));
  assertIncludes(lessons[0].mission, 'Hello Tello');
  assertIncludes(lessons[0].subtitle, 'סימולטור');
  assert.ok(lessons[0].realWorldUses.length >= 4);
  assert.ok(lessons[0].vocabulary.length >= 8);
  assert.ok(lessons[0].safetyRules.length >= 6);
  assert.ok(lessons[0].instructorSlides.length >= 8);
  assertIncludes(lessons[4].title, 'טיסת רחפן ראשונה');
  assert.ok(lessons[4].blocks.includes('safety_check'));
});

test('Tello EDU lessons expose 90 minute flow, exercises, and drone navigation concepts', () => {
  for (const lesson of data.TELLO_EDU_GRADE5_LESSONS) {
    assert.ok(lesson.lessonFlow.length >= 7, `lesson ${lesson.id} should have a full 90 minute flow`);
    assert.ok(lesson.exercises.length >= 6, `lesson ${lesson.id} should have at least six exercises`);
    assert.ok(lesson.blocks.includes('takeoff') || lesson.blocks.includes('safety_check'));
    assert.ok(lesson.blocks.includes('land'));
  }
  const concepts = data.TELLO_EDU_GRADE5_LESSONS.map(l => `${l.title} ${l.concept} ${l.story} ${l.mission}`).join('\n');
  for (const expected of ['סימולטור', 'מרחק', 'Yaw', 'Mission Pad', 'Show Mission Code', 'בטיחות']) {
    assertIncludes(concepts, expected);
  }
});

test('Tello EDU lesson 2 adapts the Box Mission plan for grade 5 navigation and control', () => {
  const lesson = data.TELLO_EDU_GRADE5_LESSONS[1];
  assertIncludes(lesson.title, 'ניווט דו־מימדי');
  assertIncludes(lesson.concept, 'Pitch');
  assertIncludes(lesson.concept, 'Roll');
  assertIncludes(lesson.concept, 'Yaw');
  assertIncludes(lesson.mission, 'Box Mission');
  assert.deepEqual(Array.from(lesson.blocks), ['takeoff', 'forward', 'right', 'back', 'left', 'land']);
  assert.equal(lesson.physicalFlightAllowed, false);
  assert.ok(lesson.vocabulary.some(([term]) => term.includes('Strafing')));
  assert.ok(lesson.exercises.some(ex => ex.title.includes('Strafing Box')));
  assert.ok(lesson.instructorSlides.some(slide => slide.title.includes('Yaw Box')));
});

test('Tello EDU pages exist but are hidden from the main platform homepage', () => {
  assert.ok(!homepageHtml.includes('Tello EDU — ניווט ובקרה'), 'Tello EDU should not appear as a main homepage card');
  assert.ok(!homepageHtml.includes('href="tello-edu-grade5.html"'), 'Tello EDU course should not be linked from the main homepage');
  assert.ok(!homepageHtml.includes('href="tello-edu-grade5-play.html?lesson=1"'), 'Tello EDU lesson should not be linked from the main homepage');
  assertIncludes(courseHtml, 'Tello EDU — ניווט ובקרה');
  assertIncludes(courseHtml, 'js/tello-edu-grade5-lessons.js');
  assertIncludes(courseHtml, 'tello-edu-grade5-slides.html?lesson=1');
  assertIncludes(courseHtml, 'class="platform-home-link"');
  assertIncludes(playHtml, 'סימולציה');
  assertIncludes(playHtml, 'בלוקים מתחברים כמו DroneBlocks');
  assertIncludes(playHtml, 'Blockly.inject');
  assertIncludes(playHtml, 'tello_takeoff');
  assertIncludes(playHtml, 'tello_yaw_right_360');
  assertIncludes(playHtml, 'tello_run_program');
  assertIncludes(playHtml, 'Run Mission  הרץ תוכנית');
  assertIncludes(playHtml, 'return \'<xml><block type="tello_run_program" x="360" y="75"></block></xml>\';');
  assertIncludes(playHtml, 'getRunBlock');
  assertIncludes(playHtml, 'tello_forward');
  assertIncludes(playHtml, 'tello_right');
  assertIncludes(playHtml, 'expectedTypes = (lesson.blocks || [])');
  assertIncludes(playHtml, 'renderer: \'zelos\'');
  assertIncludes(playHtml, 'מילון טיסה');
  assertIncludes(playHtml, 'צ׳קליסט בטיחות');
  assertIncludes(playHtml, 'סימולטור שמיים');
  assertIncludes(playHtml, 'Lenovo TB311FU');
  assertIncludes(playHtml, 'getTelloEduGrade5Lesson');
  assertIncludes(playHtml, 'class="platform-home-link"');
  assertIncludes(slidesHtml, 'מצגת מדריך');
  assertIncludes(slidesHtml, 'missionLines');
  assertIncludes(slidesHtml, 'Pitch, Roll ו־Yaw');
  assertIncludes(slidesHtml, 'רחפנים בעולם האמיתי');
  assertIncludes(slidesHtml, 'בטיחות לפני טיסה');
  assertIncludes(slidesHtml, 'Lenovo TB311FU');
});
