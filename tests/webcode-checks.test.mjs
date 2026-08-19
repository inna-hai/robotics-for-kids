import { readFileSync } from 'node:fs';
import { strict as assert } from 'node:assert';
import vm from 'node:vm';

const root = new URL('../', import.meta.url);
const read = path => readFileSync(new URL(path, root), 'utf8');
const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(read('js/webcode-lessons.js'), sandbox);
const lessons = sandbox.window.WEBCODE_LESSONS;

function includesAll(text, list = []) { return list.every(snippet => text.includes(snippet)); }
function excludesAll(text, list = []) { return list.every(snippet => !text.includes(snippet)); }
function starterPasses(lesson, check = {}) {
  if (check.blockTypes?.length || check.changedAny?.length) return false;
  return includesAll(lesson.starter.html, check.htmlIncludes)
    && includesAll(lesson.starter.css, check.cssIncludes)
    && includesAll(lesson.starter.js, check.jsIncludes)
    && excludesAll(lesson.starter.html, check.htmlExcludes)
    && excludesAll(lesson.starter.css, check.cssExcludes)
    && excludesAll(lesson.starter.js, check.jsExcludes);
}
function sourcesForLesson(lesson) {
  const bridgeText = (lesson.bridgeBlocks || [])
    .flatMap(block => [block.find, block.replace, block.label, block.hint])
    .filter(Boolean)
    .join('\n');
  const exerciseText = lesson.exercises.map(ex => `${ex.title}\n${ex.prompt}\n${ex.hint}`).join('\n');
  return `${lesson.starter.html}\n${lesson.starter.css}\n${lesson.starter.js}\n${bridgeText}\n${exerciseText}`;
}

for (const lesson of lessons) {
  assert.equal(lesson.exercises.length >= 8, true, `lesson ${lesson.id} has enough exercises`);
  const source = sourcesForLesson(lesson);
  for (const exercise of lesson.exercises) {
    const check = exercise.check || {};
    for (const key of ['htmlIncludes', 'cssIncludes', 'jsIncludes']) {
      for (const snippet of check[key] || []) {
        if (lesson.realBlocklyBuilder) continue;
        assert.ok(source.includes(snippet), `lesson ${lesson.id} exercise ${exercise.id} check snippet is attainable: ${snippet}`);
      }
    }
  }
}

for (const lesson of lessons.slice(12)) {
  for (const exercise of lesson.exercises) {
    if ([3, 5, 6, 7, 8].includes(exercise.id) || (exercise.id === 4 && lesson.bridgeBlocks?.length)) {
      assert.deepEqual(Array.from(exercise.check.changedAny || []), ['html', 'css', 'js'], `lesson ${lesson.id} exercise ${exercise.id} requires an actual code change`);
    }
  }
}

for (const lesson of lessons) {
  for (const exercise of lesson.exercises) {
    const asksForAction = /גררו|חברו|הפעילו|שנו|השלימו|תקנו|הוסיפו|צרו/.test(`${exercise.title} ${exercise.prompt}`);
    if (!asksForAction) continue;
    assert.equal(starterPasses(lesson, exercise.check), false, `lesson ${lesson.id} exercise ${exercise.id} should not pass from untouched starter code`);
  }
}

const play = read('webcode-play.html');
assert.ok(play.includes('blockTypes') && play.includes('hasBlockTypes'), 'player can validate specific Blockly block types');
assert.ok(play.includes('orderedBlockTypes') && play.includes('hasOrderedBlockTypes'), 'player can validate Blockly block order when exercises say below/after');
assert.ok(lessons[0].exercises[1].check.orderedBlockTypes.join('>') === 'web_title>web_paragraph', 'lesson 1 exercise 2 requires paragraph under title');
assert.ok(lessons[1].exercises[2].check.orderedBlockTypes.join('>') === 'web_card_shape>web_shadow', 'lesson 2 exercise 3 requires shadow after card shape');
assert.ok(play.includes('changedBlocklyFields') && play.includes('hasChangedBlocklyFields'), 'player can require changed Blockly field values when exercise text asks students to edit defaults');
assert.ok(play.includes('nonEmptyBlocklyFields') && play.includes('hasNonEmptyBlocklyFields'), 'player can reject empty text fields in Blockly blocks');
assert.ok(play.includes('exerciseFailureMessage'), 'player reports the specific failed condition instead of always showing the generic hint');
assert.ok(lessons[0].exercises[0].check.fieldFeedback.includes('הכותרת מחוברת'), 'lesson 1 exercise 1 gives specific feedback when the title is connected but unchanged');
assert.ok(lessons[0].exercises[0].check.nonEmptyBlocklyFields?.some(rule => rule.type === 'web_title' && rule.field === 'TEXT'), 'lesson 1 exercise 1 rejects empty title text');
assert.ok(lessons[0].exercises[1].check.fieldFeedback.includes('הפסקה במקום הנכון'), 'lesson 1 exercise 2 gives specific feedback when paragraph order is right but text is unchanged');
assert.ok(lessons[0].exercises[1].check.nonEmptyBlocklyFields?.some(rule => rule.type === 'web_paragraph' && rule.field === 'TEXT'), 'lesson 1 exercise 2 rejects empty paragraph text');
assert.ok(lessons[0].exercises[3].check.changedBlocklyFields?.[0]?.field === 'THEME', 'lesson 1 exercise 4 requires changing the theme palette from default');
assert.ok(lessons[0].exercises[3].check.fieldFeedback.includes('פלטה אחרת'), 'lesson 1 exercise 4 gives specific feedback when default palette is unchanged');
assert.ok(lessons[0].exercises[4].check.nonEmptyBlocklyFields?.length === 2, 'lesson 1 exercise 5 rejects empty button label/message text');
assert.ok(lessons[0].exercises[5].check.nonEmptyBlocklyFields?.length === 2, 'lesson 1 exercise 6 rejects empty info-box text');
assert.ok(lessons[0].exercises[6].check.nonEmptyBlocklyFields?.some(rule => rule.type === 'web_footer'), 'lesson 1 exercise 7 rejects empty footer text');
assert.equal(lessons[0].exercises[6].check.twoStepFooterMove, true, 'lesson 1 exercise 7 requires two checks: connect footer, then move it');
assert.equal(lessons[0].exercises[7].check.requiresCodePeek, true, 'lesson 1 exercise 8 requires opening the generated-code peek before approval');
assert.ok(play.includes('requiresCodePeek') && play.includes('codePeekOpened'), 'player can require opening the generated-code panel for code-peek exercises');
assert.ok(play.includes('checkFooterMoveExercise') && play.includes('firstOrder') && play.includes('blockOrderSignature'), 'player supports two-step order-change checks');
assert.ok(play.includes('changedAny') && play.includes('hasChanged'), 'player can require real code changes when an exercise asks for editing');
assert.ok(play.includes('htmlExcludes') && play.includes('excludesAll'), 'player can reject unchanged/default generated code when needed');

console.log('webcode checks validation passed');
