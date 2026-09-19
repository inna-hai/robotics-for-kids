import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';

const root = new URL('..', import.meta.url);
const html = readFileSync(join(root.pathname, 'cyber-city-lesson-8.html'), 'utf8');
const js = readFileSync(join(root.pathname, 'js', 'cyber-city-lesson-8.js'), 'utf8');
const css = readFileSync(join(root.pathname, 'css', 'cyber-city-academy.css'), 'utf8');
const course = readFileSync(join(root.pathname, 'cyber-city-course.html'), 'utf8');
const index = readFileSync(join(root.pathname, 'index.html'), 'utf8');

assert.ok(html.includes('20260919-mystery-room-v2'), 'lesson 8 should use the mystery room cache key');
assert.ok(html.includes('Cyber Mystery Room'), 'lesson 8 should present the mystery room mission');
assert.ok(html.includes('cyber-city-lesson8-overview.mp4'), 'lesson 8 should open with a video brief');
assert.ok(html.includes('js/cyber-city-lesson-8.js'), 'lesson 8 should load its interactive script');

assert.ok(js.includes('conceptVideos'), 'lesson 8 should include concept video cards');
assert.ok(js.includes('Digital Forensics'), 'lesson 8 should teach digital forensics');
assert.ok(js.includes('Indicators of Compromise'), 'lesson 8 should teach indicators of compromise');
assert.ok(js.includes('evidenceItems'), 'lesson 8 should define an evidence board');
assert.ok(js.includes('timelineEvents'), 'lesson 8 should define timeline ordering practice');
assert.ok(js.includes('terminalFileSystem'), 'lesson 8 should include a simulated forensics filesystem');
assert.ok(js.includes('runTerminalCommand'), 'lesson 8 should process terminal commands inside the lab');
assert.ok(js.includes('wc auth.log'), 'lesson 8 terminal should practice counting log lines');
assert.ok(js.includes('FLAG{gate_timeline}'), 'lesson 8 should include a CTF flag reward');
assert.ok(js.includes('Python Evidence Counter'), 'lesson 8 should include Python analysis practice');
assert.ok(js.includes('Incident Report'), 'lesson 8 should finish with an incident report');

assert.ok(css.includes('.mystery-grid'), 'lesson 8 should have a dedicated mystery room layout');
assert.ok(css.includes('.mystery-stage-video'), 'lesson 8 videos should have dedicated responsive styling');
assert.ok(css.includes('.evidence-board'), 'lesson 8 should style the evidence board');
assert.ok(css.includes('.timeline-builder'), 'lesson 8 should style the timeline builder');

assert.ok(course.includes('cyber-city-lesson-8.html'), 'course page should link to lesson 8');
assert.ok(course.includes('Cyber Mystery Room'), 'course page should name lesson 8');
assert.ok(course.includes('<b>8</b>שיעורים בנויים כרגע'), 'course page should count eight built lessons');
assert.ok(index.includes('cyber-city-lesson-8.html'), 'home page should link to lesson 8');

const requiredVideos = [
  'overview',
  'concepts',
  'evidence',
  'timeline',
  'terminal',
  'python',
  'report',
  'concept-forensics',
  'concept-logs',
  'concept-timeline',
  'concept-ioc',
  'concept-terminal',
  'concept-ctf',
];

for (const video of requiredVideos) {
  assert.ok(
    existsSync(join(root.pathname, 'marketing', `cyber-city-lesson8-${video}.mp4`)),
    `missing lesson 8 video: ${video}`,
  );
  assert.ok(
    existsSync(join(root.pathname, 'marketing', `cyber-city-lesson8-${video}-poster.jpg`)),
    `missing lesson 8 poster: ${video}`,
  );

  const probe = spawnSync(ffmpegInstaller.path, [
    '-hide_banner',
    '-i',
    join(root.pathname, 'marketing', `cyber-city-lesson8-${video}.mp4`),
  ], { encoding: 'utf8' });
  assert.match(
    `${probe.stdout}${probe.stderr}`,
    /Audio:/,
    `lesson 8 video should include narration audio: ${video}`,
  );
}
