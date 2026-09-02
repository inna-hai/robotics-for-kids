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
  const minimumExercises = [6, 7, 8, 9].includes(lesson.id) ? 6 : [2, 4, 5].includes(lesson.id) ? 7 : 8;
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
assert.ok(lessons[1].exercises[1].check.changedBlocklyFields?.some(rule => rule.type === 'web_card_shape' && rule.field === 'SHAPE' && rule.defaultValue === 'none'), 'lesson 2 exercise 2 requires changing the card shape from default');
assert.ok(lessons[1].exercises[2].check.orderedBlockTypes.join('>') === 'web_card_shape>web_shadow', 'lesson 2 exercise 3 requires shadow after card shape');
assert.ok(lessons[1].exercises[2].check.changedBlocklyFields?.some(rule => rule.type === 'web_shadow' && rule.field === 'SHADOW' && rule.defaultValue === 'choose'), 'lesson 2 exercise 3 requires changing the card shadow from default');
assert.ok(lessons[1].exercises[3].check.changedBlocklyFields?.some(rule => rule.type === 'web_title_color' && rule.field === 'COLOR' && rule.defaultValue === 'none'), 'lesson 2 exercise 4 requires changing the title color from default');
assert.ok(lessons[1].exercises[4].check.changedBlocklyFields?.some(rule => rule.type === 'web_button_style' && rule.field === 'STYLE' && rule.defaultValue === 'none'), 'lesson 2 exercise 5 requires changing the button style from default');
assert.ok(lessons[1].exercises[5].prompt.includes('עם העכבר'), 'lesson 2 exercise 6 tells learners to hover over the button with the mouse');
assert.ok(lessons[1].exercises[5].check.changedBlocklyFields?.some(rule => rule.type === 'web_hover' && rule.field === 'EFFECT' && rule.defaultValue === 'none'), 'lesson 2 exercise 6 requires changing the hover effect from default');
assert.equal(lessons[1].exercises.length, 7, 'lesson 2 removes the redundant full-design recap exercise');
assert.ok(lessons[1].exercises[6].check.requiresCodePeek, 'lesson 2 final exercise requires opening generated code peek');
assert.equal(lessons[1].exercises[6].check.requiresCodeSelectionTab, 'css', 'lesson 2 final exercise requires selecting the CSS code box');
assert.ok(lessons[1].exercises[6].check.requiresCodeSelectionBlockTypes?.includes('web_shadow'), 'lesson 2 final exercise requires selecting a design block that maps to CSS');
assert.ok(!lessons[1].exercises[6].prompt.includes('קישור ציבורי'), 'lesson 2 final exercise does not ask learners to copy/share a link');
assert.ok(play.includes('<block type="web_button"><field name="LABEL">ראו את העיצוב</field>'), 'lesson 2 starter includes a button so button style and hover exercises are visible');
assert.ok(play.includes('changedBlocklyFields') && play.includes('hasChangedBlocklyFields'), 'player can require changed Blockly field values when exercise text asks students to edit defaults');
assert.ok(play.includes('requiresCodeSelectionTab') && play.includes('requiresCodeSelectionTabs') && play.includes('hasGeneratedCodeSelection'), 'player can require selecting generated code in specific code tab(s)');
assert.ok(play.includes('lastGeneratedCodeSelection = { exerciseId: activeExercise') && play.includes('const exerciseOk = lastGeneratedCodeSelection.exerciseId === activeExercise') && play.includes('lastGeneratedCodeSelection = null;\n      renderCurrentExercise();'), 'generated-code block selection must be made in the current exercise');
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
assert.equal(lessons[0].exercises[6].check.footerMustBeLast, true, 'lesson 1 exercise 7 requires footer to be the last connected block');
assert.ok(lessons[0].exercises[7].prompt.includes('לחצו על אחד הבלוקים'), 'lesson 1 exercise 8 tells learners to click a block to highlight generated code');
assert.deepEqual(Array.from(lessons[0].exercises[7].check.requiresCodeSelectionTabs), ['html', 'css'], 'lesson 1 exercise 8 requires generated-code highlighting in HTML or CSS');
assert.ok(lessons[0].exercises[7].check.requiresCodeSelectionBlockTypes?.includes('web_title'), 'lesson 1 exercise 8 requires selecting a page block that maps to generated code');
assert.equal(lessons[0].exercises[7].check.requiresCodePeek, true, 'lesson 1 exercise 8 requires opening the generated-code peek before approval');
assert.ok(play.includes('requiresCodePeek') && play.includes('codePeekOpened'), 'player can require opening the generated-code panel for code-peek exercises');
assert.ok(play.includes('footerMustBeLast') && play.includes('checkFooterAtEndExercise'), 'player can validate that the footer block is last');
assert.ok(play.includes('changedAny') && play.includes('hasChanged'), 'player can require real code changes when an exercise asks for editing');
assert.ok(play.includes('htmlExcludes') && play.includes('excludesAll'), 'player can reject unchanged/default generated code when needed');

console.log('webcode checks validation passed');


const lesson8 = lessons.find(lesson => lesson.id === 8);
const lesson8Time = lesson8.blocklyBlocks.find(block => block.type === 'lesson_8_time');
const lesson8Color = lesson8.blocklyBlocks.find(block => block.type === 'lesson_8_lit_color');
assert.equal(JSON.stringify(lesson8Time.args0[0].options.map(option => option[1])), JSON.stringify(['10', '15', '20']), 'lesson 8 time options are ordered smallest to largest');
assert.ok(lesson8.exercises[0].check.requiresPreviewTimeFromBlockField, 'lesson 8 time exercise requires the live preview time display to match the block');
assert.ok(lesson8.exercises[2].check.requiresPreviewMessageFromBlockOutput, 'lesson 8 ending-message exercise requires seeing the message after the timer ends');
assert.ok(lesson8Color.args0[0].options.some(option => option[1] === '#fde047'), 'lesson 8 keeps yellow as an allowed/default lit-window color');
assert.ok(lesson8Color.args0[0].options.length >= 6, 'lesson 8 lit-window color block includes extra color options');
assert.equal(lesson8.exercises.length, 6, 'lesson 8 removes weak exercises 6 and 7');
assert.equal(lesson8.exercises.at(-1).check.requiresCodeSelectionTab, 'js', 'lesson 8 final code-peek exercise requires JavaScript highlighting');
assert.ok(play.includes('timeText') && play.includes('hasPreviewTimeFromBlockField'), 'player can validate timer text shown in the live preview');

assert.equal(JSON.stringify(lesson8.blocklyBlocks.find(block => block.type === 'lesson_8_windows').args0[0].options.map(option => option[1])), JSON.stringify(['5', '10', '15', '20']), 'lesson 8 window-count options are ordered smallest to largest');

assert.ok(lesson8.blocklyBlocks.find(block => block.type === 'lesson_8_end').args0[0].text === 'כל הכבוד 🎉', 'lesson 8 ending-message block default is only the ending message');
assert.ok(!lesson8.starter.js.includes(' + score + " חלונות."'), 'lesson 8 does not append windows after the ending-message text');

assert.ok(lesson8.starter.html.includes('id="windowsSummary"') && lesson8.starter.js.includes('מספר החלונות שהארתם הוא:'), 'lesson 8 separates the score summary from the editable ending message');

assert.ok(!lesson8.exercises[2].prompt.includes('למשל כל הכבוד'), 'lesson 8 ending-message prompt does not use the default text as the example');

assert.ok(lesson8.exercises[4].prompt.includes('בחרו את הצבע שאתם מעדיפים') && !lesson8.exercises[4].prompt.includes('אפשר להשאיר צהוב'), 'lesson 8 color prompt asks learners to choose their preferred color without calling out yellow');


const lesson9 = lessons.find(lesson => lesson.id === 9);
assert.equal(lesson9.exercises.length, 6, 'lesson 9 removes weak recap exercises');
assert.ok(lesson9.exercises[0].check.requiresPreviewLivesFromBlockField, 'lesson 9 lives exercise validates the live lives display');
assert.ok(lesson9.exercises[2].check.requiresPreviewLivesAfterPenalty, 'lesson 9 obstacle exercise validates lives after a preview penalty');
assert.ok(lesson9.exercises[4].check.requiresPreviewMessageFromBlockOutput, 'lesson 9 smart-skip exercise validates the visible preview message');
assert.equal(lesson9.exercises.at(-1).check.requiresCodeSelectionTab, 'js', 'lesson 9 final code-peek exercise requires JavaScript highlighting');
assert.ok(play.includes('livesText') && play.includes('hasPreviewLivesAfterPenalty'), 'player can validate lives changes shown in the live preview');
assert.ok(play.includes('livesText') && play.includes('hasPreviewLivesFromBlockField'), 'player can validate lives display from block fields');

assert.ok(!lesson9.exercises.slice(0, 5).some(ex => ex.check.changedBlocklyFields), 'lesson 9 allows sensible default dropdown/text values when they fit the game');
assert.ok(lesson9.starter.js.includes('nextItem(feedbackText = "")') && lesson9.starter.js.includes('feedbackText + " " + nextMessage'), 'lesson 9 keeps star/skip feedback visible with the current-item hint naturally appended');
assert.ok(lesson9.starter.js.includes('score = Math.max(0, score - 1)') && lesson9.starter.js.includes('דילגתם על כוכב ואיבדתם נקודה'), 'lesson 9 skip-star path subtracts a point');
assert.ok(!JSON.stringify(lesson9).includes('פריט חדש'), 'lesson 9 removes redundant new-item button/copy');
assert.equal(lesson9.exercises[4].check.requiresPreviewButtonText, 'דלגו', 'lesson 9 smart-skip exercise checks the skip button');
assert.notEqual(lesson9.blocklyBlocks.find(block => block.type === 'lesson_9_smart_skip').args0[0].text, 'דילוג חכם!', 'lesson 9 smart-skip block has a visible default change');
assert.notEqual(lesson9.blocklyBlocks.find(block => block.type === 'lesson_9_gameover').args0[0].text, 'נגמרו החיים. נסו שוב!', 'lesson 9 game-over block has a visible default change');
assert.ok(lesson9.starter.js.includes('if (lives > 0)') && lesson9.starter.js.includes('if (lives <= 0)'), 'lesson 9 does not overwrite Game Over by immediately rolling a new item');

assert.ok(play.includes('disabled="true"') && !play.includes('אפשר בלוק עמוד אחד בלבד'), 'toolbox greys/disables the page root block without an extra note');
assert.ok(play.includes("getAllBlocks(false).filter(block => block.type === 'page_start')") && play.includes('block.dispose(false, true)'), 'player enforces a single page root block even if duplicates appear from saved state/history');

assert.equal(lesson9.exercises[1].check.requiresPreviewScoreFromBlockField.mode, 'increase', 'lesson 9 exercise 2 accepts score increasing by the star value from the current score');
assert.ok(play.includes('scoreBefore') && play.includes("rule.mode === 'increase'") && play.includes('actual === before + expected'), 'player can validate score increase from a preview click');
