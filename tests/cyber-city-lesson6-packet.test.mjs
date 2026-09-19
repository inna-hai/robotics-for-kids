import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const html = readFileSync(join(root, 'cyber-city-lesson-6.html'), 'utf8');
const js = readFileSync(join(root, 'js', 'cyber-city-lesson-6.js'), 'utf8');
const course = readFileSync(join(root, 'cyber-city-course.html'), 'utf8');
const css = readFileSync(join(root, 'css', 'cyber-city-academy.css'), 'utf8');

assert.ok(html.includes('Packet Patrol'), 'lesson 6 is now Packet Patrol');
assert.ok(html.includes('Packet Inspector'), 'lesson 6 outcome is Packet Inspector');
assert.ok(js.includes('Route Builder'), 'lesson teaches the network route with Route Builder');
assert.ok(js.includes('Packet Log'), 'lesson teaches packet logs');
assert.ok(js.includes('proto=https'), 'lesson includes HTTPS traffic');
assert.ok(js.includes('proto=http'), 'lesson includes HTTP traffic');
assert.ok(js.includes('dns=free-coins.example'), 'lesson uses simulated DNS/log data');
assert.ok(js.includes('pkt = input("packet log: ")'), 'Python code uses short English variable pkt');
assert.ok(js.includes('if "http" in pkt'), 'Python checks traffic text with if/in');
assert.ok(js.includes('pointerdown'), 'route builder uses pointer events so drag works on touch screens');
assert.ok(js.includes('document.elementFromPoint'), 'route builder drops pieces by pointer location');
assert.ok(js.indexOf("id: 'https'") < js.indexOf("id: 'device'"), 'route builder source cards are shuffled and not shown in answer order');
assert.ok(js.includes("state.station = packetStationIndex"), 'save-and-continue advances from Route Builder to Packet Log');
assert.ok(js.includes('conceptVideos'), 'route builder has concept videos before the exercise');
assert.ok(js.includes('watchedConcepts'), 'route builder tracks required concept videos');
assert.ok(js.indexOf("id: 'packet'") < js.indexOf("id: 'device'"), 'packet is explained before the route concepts');
assert.ok(js.includes('Packet הוא חבילת מידע קטנה'), 'lesson explains what a packet is before packet-log work');
assert.ok(js.includes('למה צריך להבין אותו'), 'concept gate explains why packets matter before the exercise');
assert.ok(!js.includes('finishedConceptVideos'), 'concept confirmation buttons are not blocked until the video ends');
assert.ok(js.includes('preserveScroll'), 'route builder interactions preserve mobile scroll position after rerender');
assert.ok(js.includes('window.scrollTo'), 'route builder restores scroll after in-place interactions');
assert.ok(js.includes('data-concept-video'), 'concept videos report when they have been watched');
assert.ok(js.includes('data-confirm-concept'), 'concept videos require an explicit done button');
assert.ok(js.includes('data-concept-answer'), 'each concept video has a separate mini task');
assert.ok(js.includes('conceptTasks'), 'route builder tracks concept mini-task answers');
assert.ok(js.includes('משימה קטנה'), 'students see a dedicated exercise under each concept video');
assert.ok(js.includes('סיימתי לראות'), 'concept video confirmation button is visible to students');
assert.ok(js.includes('ממתין לאישור'), 'concept video confirmation button is active before the video ends');
assert.ok(!js.includes('ייפתח בסוף הסרטון'), 'concept confirmation button must not wait until the video ends');
assert.ok(js.includes('השלימו סרטונים ומשימות'), 'route builder locks the exercise until concept videos and mini tasks are complete');
assert.ok(css.includes('.concept-video-card'), 'concept videos have dedicated card styling');
assert.ok(css.includes('.concept-done-button'), 'concept done buttons have dedicated styling');
assert.ok(css.includes('.concept-mini-task'), 'concept mini tasks have dedicated styling');
assert.ok(js.includes('שחררו כאן'), 'empty route slots show a Hebrew instruction instead of debug text');
assert.ok(!js.includes('<em>empty</em>'), 'route builder must not render the internal empty label');
assert.match(css, /\.route-slots\s*\{[\s\S]*grid-template-columns:\s*minmax\(220px,\s*420px\)/, 'route builder slots are arranged vertically');
for (const slug of ['packet', 'device', 'dns', 'ip', 'server', 'https']) {
  assert.ok(existsSync(join(root, 'marketing', `cyber-city-lesson6-concept-${slug}.mp4`)), `concept video ${slug} exists`);
  assert.ok(existsSync(join(root, 'marketing', `cyber-city-lesson6-concept-${slug}-poster.jpg`)), `concept poster ${slug} exists`);
}
assert.ok(!js.includes('fetch('), 'lesson must not scan or fetch real network targets');
assert.ok(!js.includes('XMLHttpRequest'), 'lesson must not use browser network scanning');
assert.ok(course.includes('Ethical Hacker Lab'), 'course roadmap follows with Ethical Hacker Lab');
assert.ok(course.includes('Digital Forensics / CTF'), 'course roadmap follows with forensics/CTF');
assert.ok(existsSync(join(root, 'assets', 'cyber-city', 'packet-lab.svg')), 'packet lab visual exists');

console.log('cyber city lesson 6 packet tests passed.');
