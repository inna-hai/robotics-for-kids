import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const root = new URL('../', import.meta.url);
const read = path => readFileSync(new URL(path, root), 'utf8');
const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(read('js/webcode-lessons.js'), sandbox);
const lessons = sandbox.window.WEBCODE_LESSONS;

const parseRange = value => {
  const match = String(value || '').match(/^\s*(\d+)\s*[–-]\s*(\d+)\s*$/);
  return match ? { start: Number(match[1]), end: Number(match[2]) } : null;
};

assert.equal(lessons.length, 30);
assert.equal(parseRange('junk 0–8'), null, 'timing parser must reject prefixed junk');
assert.equal(parseRange('0–8 trailing'), null, 'timing parser must reject trailing junk');
assert.deepEqual(parseRange('0–8'), { start: 0, end: 8 });
for (const lesson of lessons) {
  assert.equal(lesson.durationMinutes, 90, `lesson ${lesson.id} must be 90 minutes`);
  assert.ok((lesson.lessonFlow || []).every(step => {
    const range = parseRange(step.minutes);
    return range && range.start < range.end && range.end <= 90;
  }), `lesson ${lesson.id} flow must contain valid ranges ending by minute 90`);
  const required = (lesson.exercises || []).filter(exercise => !exercise.optional);
  const extensions = (lesson.exercises || []).filter(exercise => exercise.optional);
  assert.ok(required.length >= 6, `lesson ${lesson.id} must keep a complete core lesson`);
  assert.ok(required.every(exercise => {
    const range = parseRange(exercise.minutes);
    return range && range.start < range.end && range.end <= 90;
  }), `lesson ${lesson.id} required exercises must use valid ranges within 90 minutes`);
  assert.ok(extensions.length > 0, `lesson ${lesson.id} must preserve later material as optional extensions`);
  assert.ok(extensions.every(exercise => exercise.extension && exercise.minutes === 'הרחבה לפי זמן'), `lesson ${lesson.id} extensions must be explicitly marked and must not claim required class minutes`);
}

const hub = read('webcode.html');
const play = read('webcode-play.html');
const slides = read('webcode-slides.html');
assert.match(hub, /90 דקות לשיעור/);
assert.match(hub, /<b>90<\/b>דק׳ לשיעור/);
assert.doesNotMatch(hub, /170 דקות לשיעור|<b>170<\/b>דק׳ לשיעור/);
assert.match(slides, /מהלך שיעור \$\{lesson\.durationMinutes\} דקות/);
assert.match(play, /isLastRequired/, 'the final core exercise must expose lesson completion without walking through extensions');
assert.match(play, /להרחבה אופציונלית/, 'the final core exercise must offer extensions as an explicit choice');
console.log('✓ all 30 WebCode lessons fit a 90-minute core with optional extensions');
