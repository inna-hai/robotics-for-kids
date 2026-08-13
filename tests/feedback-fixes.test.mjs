import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (file) => readFileSync(join(root, file), 'utf8');

const turtleHtml = read('python-turtle.html');
assert.ok(turtleHtml.includes("field_dropdown',name:'COLOR'"), 'Python Turtle pen color uses explicit dropdown');
for (const color of ['🔵 כחול', '🟢 ירוק', '🟡 צהוב', '🔴 אדום', '🟣 סגול', '🩷 ורוד', '⚫ שחור']) {
  assert.ok(turtleHtml.includes(color), `Python Turtle dropdown includes ${color}`);
}

const gamelabHtml = read('gamelab-play.html');
assert.ok(gamelabHtml.includes('configuredKeyMoves'), 'PlayCode Lab maps event-key chains to keyboard controls');
assert.ok(gamelabHtml.includes("document.addEventListener('keydown'"), 'PlayCode Lab listens to keydown events');
assert.ok(gamelabHtml.includes("ArrowRight:'right'"), 'PlayCode Lab supports arrow keys');

for (const course of ['space', 'ocean']) {
  const html = read(`${course}-play.html`);
  const js = read(`js/${course}-play.js`);
  assert.ok(html.includes('id="stop"'), `${course} play page has a stop button`);
  assert.ok(js.includes('function stopRun()'), `${course} play engine can stop an active run`);
  assert.ok(js.includes('runToken'), `${course} play engine cancels the active async run safely`);
  assert.ok(js.includes('setRunning(false)'), `${course} play engine restores buttons after run ends`);
}

const sensiCityHtml = read('sensi-city.html');
assert.ok(sensiCityHtml.includes('function activateDefaultEnvironmentForLesson'), 'Sensi City has default lesson environment activation');
assert.ok(sensiCityHtml.includes('lessonNum === 4 && !environment.smoke'), 'Sensi lesson 4 starts with smoke visible for dragging');
assert.ok(sensiCityHtml.includes("dragging = 'smoke'"), 'Sensi smoke object remains draggable');
assert.ok(sensiCityHtml.includes('function stabilizeLayoutAfterPaint'), 'Sensi City stabilizes layout after refresh paint');
assert.ok(sensiCityHtml.includes('Math.max(320'), 'Sensi City clamps canvas width during resize');
assert.ok(sensiCityHtml.includes('Math.max(220'), 'Sensi City clamps canvas height during resize');

const certificate = read('js/course-certificate.js');
assert.ok(certificate.includes('window.SisiProgress'), 'shared success helper exposes Sisi progress API');
assert.ok(certificate.includes('sisi-progress:'), 'shared success helper stores per-page progress in localStorage');
assert.ok(certificate.includes('markProgress(lesson)'), 'success dialog saves progress when mission is completed');

console.log('feedback fixes checks passed');
