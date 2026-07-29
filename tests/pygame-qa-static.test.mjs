import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const html = readFileSync(new URL('../pygame.html', import.meta.url), 'utf8');
const lessonDataCode = readFileSync(new URL('../content/pygame-lessons.js', import.meta.url), 'utf8');
const { PYGAME_LESSONS } = vm.runInNewContext(`${lessonDataCode}\n({ PYGAME_LESSONS })`, {});

function extractConstObject(name) {
  const start = html.indexOf(`const ${name} =`);
  assert.notEqual(start, -1, `${name} exists`);
  const eq = html.indexOf('=', start);
  const brace = html.indexOf('{', eq);
  let depth = 0;
  for (let i = brace; i < html.length; i += 1) {
    const ch = html[i];
    if (ch === '{') depth += 1;
    if (ch === '}') depth -= 1;
    if (depth === 0) return html.slice(brace, i + 1);
  }
  throw new Error(`Could not extract ${name}`);
}

const lessonPresets = vm.runInNewContext(`(${extractConstObject('LESSON_PRESETS')})`);
const unlocks = vm.runInNewContext(`(${extractConstObject('BLOCK_UNLOCK_LESSON')})`);

const blockGroups = [
  ['screen', ['pg_screen','pg_background']],
  ['player', ['pg_player','pg_speed','pg_move_keys','pg_keep_inside']],
  ['draw', ['pg_draw_player','pg_coin','pg_obstacle']],
  ['game', ['pg_loop','pg_score','pg_collision','pg_game_over']],
  ['note', ['pg_comment']],
];
const orderedTypes = blockGroups.flatMap(([, types]) => types);

assert.equal(PYGAME_LESSONS.length, 28, '28 lessons loaded');
assert.equal(Object.keys(lessonPresets).length, 28, '28 lesson presets exist');

for (let lesson = 1; lesson <= 28; lesson += 1) {
  const preset = lessonPresets[lesson];
  assert.ok(Array.isArray(preset), `lesson ${lesson} preset is array`);
  assert.ok(preset.includes('pg_screen'), `lesson ${lesson} preset includes screen`);
  assert.ok(preset.includes('pg_loop'), `lesson ${lesson} preset includes loop`);
  const unknownBlocks = preset.filter(x => typeof x === 'string' && x.startsWith('pg_') && !orderedTypes.includes(x));
  assert.equal(unknownBlocks.length, 0, `lesson ${lesson} has only known blocks: ${unknownBlocks.join(', ')}`);
}

function unlockedAt(lesson) {
  return orderedTypes.filter(type => (unlocks[type] || 99) <= lesson);
}

const expectedByLesson = {
  1: ['pg_screen','pg_background','pg_loop','pg_comment'],
  2: ['pg_player','pg_draw_player'],
  3: ['pg_speed','pg_move_keys'],
  4: ['pg_keep_inside'],
  5: ['pg_coin','pg_score'],
  11: ['pg_collision'],
  12: ['pg_obstacle'],
  14: ['pg_game_over'],
};
for (const [lessonText, expected] of Object.entries(expectedByLesson)) {
  const lesson = Number(lessonText);
  const unlocked = unlockedAt(lesson);
  for (const type of expected) assert.ok(unlocked.includes(type), `${type} unlocked by lesson ${lesson}`);
}

for (let lesson = 2; lesson <= 28; lesson += 1) {
  const prev = unlockedAt(lesson - 1);
  const now = unlockedAt(lesson);
  for (const type of prev) assert.ok(now.includes(type), `${type} remains available at lesson ${lesson}`);
  assert.equal(JSON.stringify(now), JSON.stringify(orderedTypes.filter(t => now.includes(t))), `lesson ${lesson} keeps fixed group order`);
}

assert.doesNotMatch(html, /FieldColour/, 'does not use unsupported Blockly.FieldColour');
assert.match(html, /FieldDropdown/, 'background color uses stable FieldDropdown');
assert.match(html, /label text="מסך"/, 'direct flyout label exists');
assert.match(html, /toolboxForLesson/, 'dynamic toolbox exists');
assert.match(html, /workspace\.updateToolbox/, 'toolbox is updated when lesson changes');
assert.match(html, /loadLessonPreset\(l\.id\)/, 'lesson changes load presets');

console.log('pygame QA static checks passed');
