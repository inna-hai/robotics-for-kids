import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import vm from 'node:vm';

const root = new URL('../', import.meta.url);
const read = path => readFileSync(new URL(path, root), 'utf8');
const play = read('webcode-play.html');
const hub = read('webcode.html');
const slides = read('webcode-slides.html');

for (const [name, html] of [['hub', hub], ['play', play], ['slides', slides]]) {
  assert.match(html, /js\/webcode-lessons\.js\?v=[^"']+/, `${name} must load the single canonical lesson source with a cache-busting version`);
  assert.doesNotMatch(html, /webcode-lessons-code-bridge/, `${name} must not load a divergent lesson bridge copy`);
}
assert.equal(existsSync(new URL('../js/webcode-lessons-code-bridge-v226.js', import.meta.url)), false, 'the duplicated bridge asset must be removed');
assert.match(play, /js\/vendor\/blockly\/blockly\.min\.js/, 'WebCode must use the repository-local Blockly runtime');
assert.match(play, /js\/vendor\/blockly\/msg\/he\.js/, 'WebCode must use the repository-local Hebrew Blockly messages');
assert.doesNotMatch(play, /unpkg\.com\/blockly/, 'WebCode must not depend on an unpinned external Blockly CDN');
assert.match(play, /if\s*\(ok\)[\s\S]*hai:classroom-progress/, 'successful WebCode validation must report classroom progress');
assert.match(play, /function jsLiteral\s*\(/, 'generated JavaScript must use a dedicated string-literal encoder');
assert.match(play, /jsLiteral\(buttonMessage\)/, 'editable button messages must be encoded as JavaScript string literals');
assert.match(play, /try\s*\{\s*init\(\);\s*\}\s*catch\s*\(error\)/, 'WebCode startup must retain its visible error fallback');
assert.match(hub, /170 דקות לשיעור/, 'WebCode hub must advertise the configured 170-minute lesson duration');
assert.doesNotMatch(hub, /90 דקות לשיעור|<b>90<\/b>דק׳ לשיעור/, 'WebCode hub must not advertise a stale 90-minute duration');
assert.match(slides, /מהלך שיעור \$\{lesson\.durationMinutes\} דקות/, 'guide slides must display each lesson\'s configured duration');

const activeAsset = (play.match(/<script src="(js\/webcode-lessons\.js\?v=[^"]+)"/) || [])[1];
assert.ok(activeAsset, 'active lesson asset must be discoverable');
const lessonSource = read(activeAsset.split('?')[0]);
const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(lessonSource, sandbox);
const lessons = sandbox.window.WEBCODE_LESSONS;
assert.equal(lessons.length, 30);

const codeRoleExercises = lessons.flatMap(lesson => (lesson.exercises || []).map(exercise => ({ lesson, exercise }))).filter(({ exercise }) =>
  exercise.choiceBox?.groups?.some(group => group.id === 'code_role')
);
assert.ok(codeRoleExercises.length > 0, 'course must include code-role reading exercises');
for (const { lesson, exercise } of codeRoleExercises) {
  const check = exercise.check || {};
  const requiresSelection = Boolean(check.requiresCodeSelectionBlockTypes?.length || check.requiresCodeSelectionTab || check.requiresCodeSelectionTabs?.length);
  assert.ok(requiresSelection, `lesson ${lesson.id} exercise ${exercise.id} must require selecting generated code before answering`);
}

const paragraphExercise = lessons[0].exercises.find(exercise => exercise.check?.qualityBlocklyFields?.some(rule => rule.type === 'web_paragraph'));
assert.ok(paragraphExercise, 'lesson 1 must contain a validated paragraph-writing exercise');
const paragraphRule = paragraphExercise.check.qualityBlocklyFields.find(rule => rule.type === 'web_paragraph');
assert.ok(Number(paragraphRule.minChars) >= 12, 'paragraph validation must require at least 12 characters');
assert.ok(Number(paragraphRule.minWords) >= 3, 'paragraph validation must require at least three words');

console.log('✓ PR #92 regressions are prevented');
