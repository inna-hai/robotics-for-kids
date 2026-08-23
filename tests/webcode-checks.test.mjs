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
  if (check.blockTypes?.length || check.changedAny?.length || check.requiresCodePeek || check.requiresCodeSelectionTab || check.requiresCodeSelectionTabs?.length || check.requiresCodeSelectionBlockTypes?.length || check.debugCodeIncludes?.length || check.debugCodeExcludes?.length) return false;
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
  const minimumExercises = lesson.id === 6 ? 6 : [2, 4, 5].includes(lesson.id) ? 7 : 8;
  assert.equal(lesson.exercises.length >= minimumExercises, true, `lesson ${lesson.id} has enough exercises`);
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
    if (lesson.realBlocklyBuilder) {
      if (exercise.id >= 2) assert.ok(exercise.check.blockTypes?.length || exercise.check.requiresCodePeek, `lesson ${lesson.id} exercise ${exercise.id} requires connected Blockly work or generated-code inspection`);
    } else if ([3, 5, 6, 7, 8].includes(exercise.id) || (exercise.id === 4 && lesson.bridgeBlocks?.length)) {
      assert.deepEqual(Array.from(exercise.check.changedAny || []), ['html', 'css', 'js'], `lesson ${lesson.id} exercise ${exercise.id} requires an actual code change`);
    }
  }
}

for (const lesson of lessons) {
  for (const exercise of lesson.exercises) {
    const asksForAction = /גררו|חברו|הפעילו|שנו|השלימו|תקנו|הוסיפו|צרו/.test(`${exercise.title} ${exercise.prompt}`);
    if (!asksForAction || exercise.noCheck) continue;
    if (lesson.realBlocklyBuilder && exercise.id === 1) continue;
    assert.equal(starterPasses(lesson, exercise.check), false, `lesson ${lesson.id} exercise ${exercise.id} should not pass from untouched starter code`);
  }
}

const play = read('webcode-play.html');
assert.ok(play.includes('blockTypes') && play.includes('hasBlockTypes'), 'player can validate specific Blockly block types');
assert.ok(play.includes('orderedBlockTypes') && play.includes('hasOrderedBlockTypes'), 'player can validate Blockly block order when exercises say below/after');
assert.ok(lessons[0].exercises[1].check.orderedBlockTypes.join('>') === 'web_title>web_paragraph', 'lesson 1 exercise 2 requires paragraph under title');
assert.ok(lessons[1].exercises[0].check.changedBlocklyFields?.some(rule => rule.type === 'web_theme' && rule.field === 'THEME' && rule.defaultValue === 'space'), 'lesson 2 exercise 1 requires changing the page design palette from default');
assert.ok(lessons[1].exercises[0].check.fieldFeedback.includes('פלטה אחרת'), 'lesson 2 exercise 1 gives specific feedback when the default palette is unchanged');
assert.ok(lessons[1].exercises[1].check.changedBlocklyFields?.some(rule => rule.type === 'web_card_shape' && rule.field === 'SHAPE' && rule.defaultValue === 'round'), 'lesson 2 exercise 2 requires changing the card shape from default');
assert.ok(lessons[1].exercises[2].check.orderedBlockTypes.join('>') === 'web_card_shape>web_shadow', 'lesson 2 exercise 3 requires shadow after card shape');
assert.ok(lessons[1].exercises[2].check.changedBlocklyFields?.some(rule => rule.type === 'web_shadow' && rule.field === 'SHADOW' && rule.defaultValue === 'soft'), 'lesson 2 exercise 3 requires changing the card shadow from default');
assert.ok(lessons[1].exercises[3].check.changedBlocklyFields?.some(rule => rule.type === 'web_title_color' && rule.field === 'COLOR' && rule.defaultValue === 'blue'), 'lesson 2 exercise 4 requires changing the title color from default');
assert.ok(lessons[1].exercises[4].check.changedBlocklyFields?.some(rule => rule.type === 'web_button_style' && rule.field === 'STYLE' && rule.defaultValue === 'pill'), 'lesson 2 exercise 5 requires changing the button style from default');
assert.ok(lessons[1].exercises[5].prompt.includes('עם העכבר'), 'lesson 2 exercise 6 tells learners to hover over the button with the mouse');
assert.ok(lessons[1].exercises[5].check.changedBlocklyFields?.some(rule => rule.type === 'web_hover' && rule.field === 'EFFECT' && rule.defaultValue === 'grow'), 'lesson 2 exercise 6 requires changing the hover effect from default');
assert.equal(lessons[1].exercises.length, 7, 'lesson 2 removes the redundant full-design recap exercise');
assert.ok(lessons[1].exercises[6].check.requiresCodePeek, 'lesson 2 final exercise requires opening generated code peek');
assert.equal(lessons[1].exercises[6].check.requiresCodeSelectionTab, 'css', 'lesson 2 final exercise requires selecting the CSS code box');
assert.ok(lessons[1].exercises[6].check.requiresCodeSelectionBlockTypes?.includes('web_shadow'), 'lesson 2 final exercise requires selecting a design block that maps to CSS');
assert.ok(!lessons[1].exercises[6].prompt.includes('קישור ציבורי'), 'lesson 2 final exercise does not ask learners to copy/share a link');
assert.ok(play.includes('<block type="web_button"><field name="LABEL">ראו את העיצוב</field>'), 'lesson 2 starter includes a button so button style and hover exercises are visible');
assert.ok(play.includes('changedBlocklyFields') && play.includes('hasChangedBlocklyFields'), 'player can require changed Blockly field values when exercise text asks students to edit defaults');
assert.ok(play.includes('requiresCodeSelectionTab') && play.includes('requiresCodeSelectionTabs') && play.includes('hasGeneratedCodeSelection'), 'player can require selecting generated code in specific code tab(s)');
assert.ok(play.includes('isCodePeekOpen()') && play.includes('!c.requiresCodePeek || isCodePeekOpen()'), 'code-peek checks require the generated-code panel to be open now, not only remembered from earlier');
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
assert.ok(lessons[0].exercises[7].prompt.includes('לחצו על אחד הבלוקים'), 'lesson 1 exercise 8 tells learners to click a block to highlight generated code');
assert.deepEqual(Array.from(lessons[0].exercises[7].check.requiresCodeSelectionTabs), ['html', 'css'], 'lesson 1 exercise 8 requires generated-code highlighting in HTML or CSS');
assert.ok(lessons[0].exercises[7].check.requiresCodeSelectionBlockTypes?.includes('web_title'), 'lesson 1 exercise 8 requires selecting a page block that maps to generated code');
assert.equal(lessons[0].exercises[7].check.requiresCodePeek, true, 'lesson 1 exercise 8 requires opening the generated-code peek before approval');
assert.ok(play.includes('requiresCodePeek') && play.includes('codePeekOpened'), 'player can require opening the generated-code panel for code-peek exercises');
assert.ok(play.includes('checkFooterMoveExercise') && play.includes('firstOrder') && play.includes('blockOrderSignature'), 'player supports two-step order-change checks');
assert.ok(play.includes('changedAny') && play.includes('hasChanged'), 'player can require real code changes when an exercise asks for editing');
assert.ok(play.includes('htmlExcludes') && play.includes('excludesAll'), 'player can reject unchanged/default generated code when needed');

console.log('webcode checks validation passed');
