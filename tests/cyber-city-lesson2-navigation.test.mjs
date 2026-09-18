import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const lesson = readFileSync(new URL('cyber-city-lesson-2.html', root), 'utf8');
const js = readFileSync(new URL('js/cyber-city-lesson-2.js', root), 'utf8');

test('Cyber City lesson 2 uses the same minimal student navigation as lesson 1', () => {
  assert.ok(lesson.includes('class="student-nav-panel"'), 'lesson should use the top student navigation panel');
  assert.ok(!lesson.includes('class="station-map"'), 'lesson should not use the older side station map');
  assert.ok(lesson.includes('id="currentStepLabel"'), 'lesson should show the current mission number');
  assert.ok(lesson.includes('id="currentStepName"'), 'lesson should show the current mission name');
  assert.ok(js.includes('short:'), 'stations should include short child-friendly labels');
  assert.ok(js.includes('משימה ${state.station + 1} מתוך ${stations.length}'), 'navigation should render mission count');
  assert.ok(js.includes('`הבא: ${nextStation.short}`'), 'next button should name the next mission');
  assert.ok(!js.includes('התחלתי משימת קוד'), 'brief should not require an extra acknowledgement button');
  assert.ok(js.includes("if (state.station === 0)"), 'moving forward from the brief should complete it automatically');
});

test('Cyber City lesson 2 console makes run and output visible', () => {
  assert.ok(js.includes('class="builder-grid console-lab"'), 'console station should use a dedicated guided layout');
  assert.ok(js.includes('לוחצים על הרצה'), 'console should explicitly tell students to run the program');
  assert.ok(js.includes('כפתור ההרצה נמצא מעל חלון ה־Python'), 'console should point students to the run button above Python');
  assert.ok(js.includes('class="button run-console-button code-run-button"'), 'run button should sit in the Python panel toolbar');
  assert.ok(js.includes('class="play-icon"'), 'run button should include a play icon marker');
  assert.ok(js.includes('consoleRan'), 'output should depend on an explicit run action');
  assert.ok(js.includes('class="terminal-output console-output'), 'output should have a dedicated visible output panel');
});

test('Cyber City lesson 2 If Lab shows run result instead of revealing full solution code', () => {
  const renderRunSource = js.slice(js.indexOf('function renderRun()'), js.indexOf('function renderEngineCode'));
  assert.ok(renderRunSource.includes('תוצאת הרצה'), 'If Lab should label the panel as a run result');
  assert.ok(renderRunSource.includes('run-signal-list'), 'If Lab should show which signals affected the score');
  assert.ok(!renderRunSource.includes('renderEngineCode(signals)'), 'If Lab should not reveal the full generated code preview');
  assert.ok(js.includes('הקוד הסופי'), 'final code should still be available later in the Debug/Build station');
});

test('Cyber City lesson 2 embeds a short explainer video for every station', () => {
  for (const id of ['brief', 'console', 'signals', 'logic', 'debug', 'report']) {
    assert.ok(js.includes(`${id}: {`), `station ${id} should define an explainer video`);
  }
  for (const file of [
    'marketing/cyber-city-lesson2-brief.mp4',
    'marketing/cyber-city-lesson2-console.mp4',
    'marketing/cyber-city-lesson2-signals.mp4',
    'marketing/cyber-city-lesson2-if-lab.mp4',
    'marketing/cyber-city-lesson2-debug.mp4',
    'marketing/cyber-city-lesson2-report.mp4',
  ]) {
    assert.ok(js.includes(file), `${file} should be embedded`);
  }
  for (const poster of [
    'marketing/cyber-city-lesson2-brief-poster.jpg',
    'marketing/cyber-city-lesson2-console-poster.jpg',
    'marketing/cyber-city-lesson2-signals-poster.jpg',
    'marketing/cyber-city-lesson2-if-lab-poster.jpg',
    'marketing/cyber-city-lesson2-debug-poster.jpg',
    'marketing/cyber-city-lesson2-report-poster.jpg',
  ]) {
    assert.ok(js.includes(poster), `${poster} should be used as a non-empty video poster`);
  }
  assert.ok(js.includes('function renderStationVideo()'), 'lesson should render a station video block dynamically');
  assert.ok(js.includes('class="stage-video-card"'), 'station video should use a dedicated lesson card');
  assert.ok(js.includes('poster="${esc(video.poster)}"'), 'video elements should show the station poster before playback');
});
