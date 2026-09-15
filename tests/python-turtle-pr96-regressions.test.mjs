import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const advanced = readFileSync(new URL('../python-turtle-advanced.html', import.meta.url), 'utf8');

assert.doesNotMatch(
  advanced,
  /currentLesson === 23 \? `\$\{indent\}repeat\(\$\{times\}\):`/,
  'lesson 23 must display valid Python for loops, not repeat(...): pseudocode',
);
assert.match(
  advanced,
  /`\$\{indent\}for i in range\(\$\{times\}\):`/,
  'repeat blocks must display valid Python for-loop syntax',
);

const catalog = readFileSync(new URL('../python-turtle-advanced-course.html', import.meta.url), 'utf8');
for (const title of [
  'זריחה בשלבים: מנבאים לפני שמריצים',
  'מכונית בעיר: מפת שבילים',
  'מפת טיול בקוד',
]) {
  assert.match(catalog, new RegExp(title), `advanced course catalog must advertise “${title}”`);
}

const lessonsJson = advanced.match(/const TURTLE_LESSONS = (\[[\s\S]*?\n\s*\]);/)?.[1];
assert.ok(lessonsJson, 'advanced lesson data must be extractable');
const lessons = JSON.parse(lessonsJson);
const parseRange = value => String(value).match(/(\d+)\s*[–-]\s*(\d+)/)?.slice(1).map(Number);
const expectedSchedules = {
  21: [[0,8],[8,20],[20,42],[42,58],[58,72],[72,80],[80,86],[86,90]],
  22: [[0,8],[8,18],[18,36],[36,52],[52,70],[70,78],[78,90]],
  23: [[0,8],[8,18],[18,32],[32,40],[40,48],[48,58],[58,68],[68,78],[78,84],[84,90]],
};
for (const id of [21, 22, 23]) {
  const lesson = lessons.find(item => item.id === id);
  const schedules = {};
  for (const field of ['timing', 'lessonFlow']) {
    const ranges = lesson[field].map(item => parseRange(typeof item === 'string' ? item : item.minutes));
    assert.ok(ranges.every(Boolean), `lesson ${id} ${field} must use minute ranges`);
    for (let index = 1; index < ranges.length; index += 1) {
      assert.equal(ranges[index][0], ranges[index - 1][1], `lesson ${id} ${field} must be continuous without overlaps or gaps`);
    }
    assert.deepEqual(ranges[0], [0, ranges[0][1]], `lesson ${id} ${field} must start at minute 0`);
    assert.equal(ranges.at(-1)[1], 90, `lesson ${id} ${field} must end at minute 90`);
    schedules[field] = ranges;
  }
  assert.deepEqual(schedules.timing, schedules.lessonFlow, `lesson ${id} timing and lessonFlow must use the same windows`);
  assert.deepEqual(schedules.timing, expectedSchedules[id], `lesson ${id} must match its synchronized 90-minute plan`);
  const slides = readFileSync(new URL(`../python-turtle-lesson-${id}-slides.html`, import.meta.url), 'utf8');
  for (const [start, end] of schedules.timing) {
    assert.match(slides, new RegExp(`${start}–${end}`), `lesson ${id} slides must include ${start}–${end}`);
  }
}

const lesson23Slides = readFileSync(new URL('../python-turtle-lesson-23-slides.html', import.meta.url), 'utf8');
assert.doesNotMatch(lesson23Slides, /<div class="code">[\s\S]*repeat\(4\):/, 'lesson 23 slides must not teach repeat(...): as Python');
assert.match(lesson23Slides, /for i in range\(4\):/, 'lesson 23 slides must show valid Python loop syntax');
assert.match(lesson23Slides, /python-turtle-advanced\.html\?lesson=23/, 'lesson 23 slides must link directly to the advanced application');

console.log('✓ lesson 23 displays valid Python loop syntax');
console.log('✓ advanced lesson catalog matches lessons 6–8');
