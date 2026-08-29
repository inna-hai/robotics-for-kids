import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const lessonData = readFileSync(join(root, 'js', 'lessons-data.js'), 'utf8');
const teachersHtml = readFileSync(join(root, 'teachers.html'), 'utf8');
const serverSource = readFileSync(join(root, 'server.js'), 'utf8');

assert.match(
  lessonData,
  /guideVideo:\s*\{[\s\S]*?src:\s*['"]\/api\/sensi\/guide-videos\/lesson-1['"][\s\S]*?\}/,
  'lesson 1 should declare its protected parent/instructor guide video',
);
assert.match(
  lessonData,
  /id:\s*2,[\s\S]*?guideVideo:\s*\{[\s\S]*?src:\s*['"]\/api\/sensi\/guide-videos\/lesson-2['"][\s\S]*?\}/,
  'lesson 2 should declare its protected parent/instructor guide video',
);
assert.match(
  lessonData,
  /id:\s*3,[\s\S]*?guideVideo:\s*\{[\s\S]*?src:\s*['"]\/api\/sensi\/guide-videos\/lesson-3['"][\s\S]*?\}/,
  'lesson 3 should declare its protected parent/instructor guide video',
);
assert.match(teachersHtml, /lesson\.guideVideo/, 'teacher guide should render videos from lesson data');
assert.match(teachersHtml, /<video[^>]*controls[^>]*preload="metadata"/, 'guide video should use controls without autoplay');
assert.ok(!teachersHtml.includes('<video autoplay'), 'guide video must not autoplay');
assert.match(serverSource, /pathname === '\/teachers\.html'/, 'teacher guide should map to the protected Sensi course');
assert.match(serverSource, /const guideVideoMatch = requestUrl\(req\)\.pathname\.match/, 'server should parse protected per-lesson guide-video routes');
assert.match(serverSource, /if \(guideVideoMatch\) return serveSensiGuideVideo/, 'server should serve matched guide-video lessons through the protected handler');

console.log('Sensi protected guide video integration checks passed');
