import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const lessonData = readFileSync(join(root, 'js', 'lessons-data.js'), 'utf8');
const teachersHtml = readFileSync(join(root, 'teachers.html'), 'utf8');
const lessonSlidesHtml = readFileSync(join(root, 'slides', 'lesson.html'), 'utf8');
const serverSource = readFileSync(join(root, 'server.js'), 'utf8');

assert.match(
  lessonData,
  /guideVideo:\s*\{[\s\S]*?src:\s*['"]\/api\/sensi\/guide-videos\/lesson-1['"][\s\S]*?\}/,
  'lesson 1 should declare its parent/instructor guide video',
);
assert.match(
  lessonData,
  /id:\s*2,[\s\S]*?guideVideo:\s*\{[\s\S]*?src:\s*['"]\/api\/sensi\/guide-videos\/lesson-2['"][\s\S]*?\}/,
  'lesson 2 should declare its parent/instructor guide video',
);
assert.match(
  lessonData,
  /id:\s*3,[\s\S]*?guideVideo:\s*\{[\s\S]*?src:\s*['"]\/api\/sensi\/guide-videos\/lesson-3['"][\s\S]*?\}/,
  'lesson 3 should declare its parent/instructor guide video',
);
assert.match(
  lessonData,
  /id:\s*4,[\s\S]*?guideVideo:\s*\{[\s\S]*?src:\s*['"]\/api\/sensi\/guide-videos\/lesson-4['"][\s\S]*?\}/,
  'lesson 4 should declare its parent/instructor guide video',
);
assert.match(
  lessonData,
  /id:\s*5,[\s\S]*?guideVideo:\s*\{[\s\S]*?src:\s*['"]\/api\/sensi\/guide-videos\/lesson-5['"][\s\S]*?\}/,
  'lesson 5 should declare its parent/instructor guide video',
);
assert.match(
  lessonData,
  /id:\s*6,[\s\S]*?guideVideo:\s*\{[\s\S]*?src:\s*['"]\/api\/sensi\/guide-videos\/lesson-6['"][\s\S]*?\}/,
  'lesson 6 should declare its parent/instructor guide video',
);
assert.match(
  lessonData,
  /id:\s*7,[\s\S]*?guideVideo:\s*\{[\s\S]*?src:\s*['"]\/api\/sensi\/guide-videos\/lesson-7['"][\s\S]*?\}/,
  'lesson 7 should declare its parent/instructor guide video',
);
assert.match(
  lessonData,
  /id:\s*8,[\s\S]*?guideVideo:\s*\{[\s\S]*?src:\s*['"]\/api\/sensi\/guide-videos\/lesson-8['"][\s\S]*?\}/,
  'lesson 8 should declare its parent/instructor guide video',
);
for (let lessonId = 9; lessonId <= 15; lessonId += 1) {
  assert.match(
    lessonData,
    new RegExp(`id:\\s*${lessonId},[\\s\\S]*?guideVideo:\\s*\\{[\\s\\S]*?src:\\s*['"]\\/api\\/sensi\\/guide-videos\\/lesson-${lessonId}['"][\\s\\S]*?\\}`),
    `lesson ${lessonId} should declare its parent/instructor guide video`,
  );
}
assert.match(teachersHtml, /lesson\.guideVideo/, 'teacher guide should render videos from lesson data');
assert.match(teachersHtml, /<video[^>]*controls[^>]*preload="metadata"/, 'guide video should use controls without autoplay');
assert.ok(!teachersHtml.includes('<video autoplay'), 'guide video must not autoplay');
assert.match(lessonSlidesHtml, /function guideVideoSlide\(\)/, 'lesson slides should define a guide-video slide');
assert.match(lessonSlidesHtml, /lesson\.guideVideo\?\.src/, 'lesson slides should read the video URL from lesson data');
assert.match(lessonSlidesHtml, /<video class="guide-video-frame" controls preload="metadata" playsinline>/, 'lesson slides should embed a playable guide video');
assert.match(lessonSlidesHtml, /introSlides\[0\],[\s\S]*?guideSlide[\s\S]*?introSlides\.slice\(1\)/, 'guide video should appear right after the opening slide');
assert.ok(!lessonSlidesHtml.includes('<video autoplay'), 'lesson slide guide video must not autoplay');
assert.match(serverSource, /const guideVideoMatch = requestUrl\(req\)\.pathname\.match/, 'server should parse protected per-lesson guide-video routes');
assert.match(serverSource, /if \(guideVideoMatch\) return serveSensiGuideVideo/, 'server should serve matched guide-video lessons through the video handler');

console.log('Sensi guide video integration checks passed');
