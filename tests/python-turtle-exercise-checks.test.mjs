import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../python-turtle.html', import.meta.url), 'utf8');

assert.match(html, /function repeatShapeMatches\(sides, angle\)/, 'shape exercises use a dedicated repeat/sides/angle validator');
assert.match(html, /netTurn = bodyActions\.reduce/, 'shape validator rejects loops whose opposite turns cancel out instead of forming a shape');
assert.match(html, /closesShape = simulatePath\(repeatedActions\)\.distanceFromStart <= 25/, 'shape validator checks that the repeated loop actually closes into a polygon');
assert.match(html, /currentLesson === 3/, 'lesson 3 has specific validators instead of only generic checks');
assert.match(html, /if\(isTipExercise\(ex\) \|\| isChallengeExercise\(ex\)\) return \[\]/, 'challenge exercises are not forced through hard validators');
assert.match(html, /isTip \|\| isChallengeExercise\(ex\) \|\| isSelectionOnly/, 'challenge exercises do not show a dedicated check button');
assert.match(html, /if\(isChallengeExercise\(ex\)\) run\(\);/, 'running challenge code runs the turtle without falsely rendering exercise success');
assert.match(html, /let lastSelectedBlockId = null/, 'selection-only checks remember the last selected block before the check button steals focus');
assert.match(html, /function isSelectionOnlyExercise\(ex\)/, 'lesson 3 for-highlight exercise is a selection-only step');
assert.match(html, /isTip \|\| isChallengeExercise\(ex\) \|\| isSelectionOnly/, 'selection-only exercise and challenges have no check button');
assert.match(html, /completedSet\(\)\.delete\(index\)/, 'selection-only exercise ignores stale completed progress until the user selects the repeat block again');
assert.match(html, /const canContinue = isSelectionOnly \? !!selectionExerciseUnlocked\[selectionUnlockKey\(\)\]/, 'selection-only exercise unlocks continue from an explicit saved unlock flag');
assert.match(html, /function selectionOnlyBlockType\(ex\)/, 'selection-only exercises can specify the block type to select');
assert.match(html, /currentLesson === 4 && ex\?\.id === 6\) return \['py_color'\]/, 'lesson 4 color-code exercise unlocks by selecting the color block');
assert.match(html, /const requiredTypes = isSelectionOnlyExercise\(ex\) \? selectionOnlyBlockTypes\(ex\) : \[\]/, 'selection-only unlock listener uses the exercise-specific selected block types');
assert.match(html, /const matchedType = requiredTypes\.find\(type=>selectedBlockHighlightsExpectedCode\(selected, type, highlighted\)\)/, 'selection-only unlock requires selecting a block whose Python line is actually highlighted');
assert.match(html, /currentLesson === 5 && ex\?\.id === 3\) return \['py_penup', 'py_pendown'\]/, 'lesson 5 pen-code exercise unlocks by selecting both pen blocks');
assert.match(html, /requiredTypes\.every\(type=>selectionExerciseSelections\[key\]\.has\(type\)\)/, 'multi-block selection exercises require all selected blocks before continue unlocks');
assert.match(html, /selectionExerciseUnlocked\[key\] = true/, 'continue remains available after the correct block was selected, even after focus moves to the button');
assert.match(html, /const skipRun = currentLesson === 3 && ex\.id === 4/, 'lesson 3 for-highlight exercise checks selection without running or moving the turtle');
assert.match(html, /selected \|\| \(lastSelectedBlockId \? workspace\.getBlockById\(lastSelectedBlockId\) : null\)/, 'selected-block validator can use the last highlighted block');
assert.match(html, /repeatShapeMatches\(4, 90\)/, 'lesson 3 exercise 1 checks a real square: 4 repeats and 90 degrees');
assert.match(html, /repeatShapeMatches\(3, 120\)/, 'lesson 3 exercise 2 checks a real triangle');
assert.match(html, /repeatShapeMatches\(6, 60\)/, 'lesson 3 exercise 3 checks a real hexagon');
assert.match(html, /repeatShapeMatches\(5, 72\)/, 'pentagon checks require 5 repeats and 72 degrees');
assert.match(html, /actionDrawnColors\(actions\)\.size < 2/, 'color exercises check colors that are actually drawn, not only selected');
assert.match(html, /const needsNonBlue = \/שונה מהכחול/, 'generic color checks allow blue unless the exercise explicitly asks for a non-blue color');
assert.match(html, /const requestedColor = needsNonBlue \? colorActions\.find/, 'generic color checks only require an explicit color block when non-blue is requested');
assert.match(html, /!needsNonBlue \|\| color !== defaultBlue/, 'generic color checks count pen-down drawing in blue when blue is allowed');
assert.match(html, /function forwardStepsChangedFromBaseline\(actions, index=currentExerciseIndex\)/, 'side-length exercise compares current forward steps to the exercise-start baseline');
assert.match(html, /צריך לשנות את מספר הצעדים בבלוק ׳זוז קדימה׳ לעומת מה שהיה בתחילת התרגיל/, 'side-length exercise fails until the forward step count actually changes');
assert.match(html, /function actionDrawsWithWidth\(actions, width\)/, 'width exercises check that drawing happens after the requested pen width is set');
assert.match(html, /actionDrawsWithWidth\(actions, 3\)/, 'width 3 exercises require actual drawing with width 3');
assert.match(html, /function actionChangesColorBetweenDraws\(actions\)/, 'middle-color exercises require drawing before and after a color change');
assert.match(html, /ex\.id === 4[\s\S]*actionChangesColorBetweenDraws\(actions\)/, 'lesson 4 color-change exercise uses the middle-drawing color validator');
assert.match(html, /function actionDrawsDifferentColorLengths\(actions\)/, 'two-line color exercise checks actual drawn line colors and lengths');
assert.match(html, /segments\.length !== 2/, 'two-line color exercise requires exactly two drawn lines');
assert.match(html, /ex\.id === 5[\s\S]*actionDrawsDifferentColorLengths\(actions\)/, 'lesson 4 two-line exercise has a specific validator');
assert.match(html, /currentLesson === 4 && ex\?\.id === 7[\s\S]*py_color/, 'lesson 4 late-color debug exercise has generated starter code');
assert.match(html, /function fixesLateColorStarter\(actions\)/, 'late-color debug exercise checks that the starter shape is preserved and recolored');
assert.match(html, /const intendedColor = '#16a34a'/, 'late-color debug exercise requires the intended starter color, not any non-blue color');
assert.match(html, /ex\.id === 7[\s\S]*fixesLateColorStarter\(actions\)/, 'lesson 4 late-color exercise uses its specific starter-fix validator');
assert.match(html, /currentLesson === 5 && ex\.id === 1[\s\S]*forwardAfterPenUp/, 'lesson 5 merged pen-up exercise requires movement after the pen is raised');
assert.match(html, /penup\|הרימו עט/, 'penup exercises require the pen-up block');
assert.match(html, /pendown\|הורידו עט/, 'pendown exercises require the pen-down block');

console.log('python turtle exercise check regressions passed');

assert.match(html, /function isRunOnlyExampleExercise\(ex\)/, 'run-only example exercises can unlock continue after running without a check button');
assert.match(html, /currentLesson === 5 && ex\?\.id === 4[\s\S]*movable="false"/, 'lesson 5 forgotten-pendown demo loads locked starter code');
assert.match(html, /isRunOnlyExampleExercise\(ex\)[\s\S]*await run\(\)[\s\S]*completedSet\(\)\.add\(currentExerciseIndex\)/, 'lesson 5 demo unlocks continue only after running');

assert.match(html, /const runOnlyExampleStarted = \{\}/, 'run-only examples track whether the user ran this demo in the current entry');
assert.match(html, /!isRunOnlyExampleExercise\(ex\) && \(hasGeneratedStarter \|\| hasEntryReset\)/, 'locked run-only examples do not show the reset-to-starter button');
assert.match(html, /isRunOnlyExampleExercise\(ex\) \? !!runOnlyExampleStarted\[selectionUnlockKey\(\)\]/, 'run-only examples keep continue disabled until the demo is run');

assert.match(html, /currentLesson === 5 && ex\?\.id === 3[\s\S]*py_penup[\s\S]*py_pendown/, 'lesson 5 code-selection exercise loads starter blocks to select');


assert.match(html, /runOnlyExampleStarted\[key\] = false;[\s\S]*exercisePassed = false;/, 'run-only examples relock continue on every entry until Run is pressed');
assert.match(html, /isRunOnlyExampleExercise\(leavingEx\) && !runOnlyExampleStarted\[selectionUnlockKey\(\)\]/, 'next exercise guard blocks run-only demos before Run even if previously completed');



assert.match(html, /const alreadyDone = completedSet\(\)\.has\(index\) \|\| !!selectionExerciseUnlocked\[key\]/, 'selection-only exercises stay unlocked when navigating back after completion');

assert.match(html, /function requiresFreshCheckExercise\(ex\)/, 'some starter-fix exercises require a fresh successful check before continue unlocks');
















assert.match(html, /currentLesson === 5 && ex\?\.id === 5[\s\S]*py_repeat[\s\S]*py_forward[\s\S]*py_repeat/, 'lesson 5 connector-fix exercise loads starter code with two shapes and a connector');

assert.match(html, /currentLesson === 5 && ex\.id === 5[\s\S]*penUpIndex[\s\S]*pendownIndex[\s\S]*transitionForwards/, 'lesson 5 connector-fix exercise validates penup transition and pendown before the second shape');

assert.match(html, /requiresFreshCheckExercise\(targetEx\)[\s\S]*completedSet\(\)\.delete\(index\)/, 'fresh-check exercises clear stale completion on entry');

assert.match(html, /requiresCheckedContinue\(leavingEx\) && !exercisePassed\) return/, 'normal checked exercises cannot continue from stale completed progress');

assert.match(html, /currentLesson === 5 && ex\.id === 2[\s\S]*penUpIndex[\s\S]*forwardAfterPenUpIndex[\s\S]*pendownIndex/, 'lesson 5 exercise 2 requires continuing from exercise 1 with penup movement before pendown');

assert.match(html, /המשיכו מהקוד של תרגול 1[\s\S]*תנועה בלי ציור[\s\S]*הורד עט[\s\S]*משולש/, 'lesson 5 exercise 2 wording asks to continue from exercise 1 and matches the penup-to-pendown flow');

assert.match(html, /currentLesson === 6 && ex\?\.id === 3\) return \['py_set_length'\]/, 'lesson 6 code-selection exercise unlocks by selecting the set-length block');
assert.match(html, /function repeatUsesLengthShape\(sides, angle\)/, 'lesson 6 validates shapes that use forward(length), not hard-coded numbers');
assert.match(html, /currentLesson === 6[\s\S]*ex\.id === 1[\s\S]*values\.includes\(70\)[\s\S]*firstForwardLengthIndex/, 'lesson 6 exercise 1 requires setting length to 70 before using forward length');
assert.match(html, /ex\.id === 2[\s\S]*repeatUsesLengthShape\(4, 90\)/, 'lesson 6 exercise 2 requires a square drawn with the length variable');
assert.match(html, /ex\.id === 4[\s\S]*values\.includes\(120\)[\s\S]*repeatUsesLengthShape\(4, 90\)/, 'lesson 6 exercise 4 requires changing length to 120 while keeping a variable square');
assert.match(html, /ex\.id === 5[\s\S]*uniqueValues\.size < 2[\s\S]*צריך לבנות שני ריבועים/, 'lesson 6 exercise 5 requires two variable-based squares with different length values');

assert.match(html, /currentLesson === 6 && ex\?\.id === 3[\s\S]*py_set_length[\s\S]*py_forward_length/, 'lesson 6 code-selection exercise loads starter blocks to select');


assert.match(html, /function starterXmlForExercise\(ex\)[\s\S]*currentLesson === 6 && ex\?\.id === 3[\s\S]*py_set_length[\s\S]*py_forward_length/, 'lesson 6 exercise 3 starter XML lives in starterXmlForExercise');

assert.match(html, /תרגול 6 — מגדילים את האורך תוך כדי ציור/, 'lesson 6 restores the grow-length exercise before the final challenge');

assert.match(html, /ex\.id === 6[\s\S]*growIndex[\s\S]*forwardBeforeGrow[\s\S]*forwardAfterGrow/, 'lesson 6 grow-length exercise requires drawing before and after increasing length');

assert.doesNotMatch(html, /function selectionOnlyBlockTypes\(ex\)\{[^}]*return '<xml>/, 'selection-only block type helpers must not return starter XML');

assert.match(html, /selectedBlockHighlightsExpectedCode[\s\S]*highlightedLines=null[\s\S]*textContent\.includes\(expectedText\)/, 'selection-only exercises require the expected Python code line to be highlighted');

assert.match(html, /if\(isSelectionOnlyExercise\(ex\)\)\{[\s\S]*selectionExerciseUnlocked\[key\] = false[\s\S]*completedSet\(\)\.delete\(currentExerciseIndex\)/, 'selection-only completion is cleared after workspace edits');

assert.match(html, /תרגול 7 — מחומש בצבע אחר/, 'lesson 6 restores the useful color-variation exercise');

assert.match(html, /אתגר למתקדמים — משתמשים ב־length פעמיים/, 'lesson 6 restores an advanced open-ended length challenge');

assert.match(html, /ex\.id === 7[\s\S]*cmd==='color'[\s\S]*cmd==='forward'[\s\S]*repeatUsesLengthShape\(5, 72\)/, 'lesson 6 color pentagon requires color, no numeric forward movement, and a length-based pentagon');

assert.match(html, /event\.newElementId \? workspace\.getBlockById\(event\.newElementId\) : \(Blockly\.getSelected \? Blockly\.getSelected\(\) : null\)/, 'selection-only handler falls back to the actual selected Blockly block');

assert.match(html, /selectedNames[\s\S]*עכשיו אפשר ללחוץ המשך/, 'selection-only feedback tells the student Continue is now unlocked after the correct highlight');

assert.match(html, /const isCodeEditEvent = !event\.isUiEvent[\s\S]*event\.type !== Blockly\.Events\.CLICK/, 'selection-only unlock is not cleared by Blockly UI-only events such as clicking Continue');

assert.match(html, /if\(isCodeEditEvent\)\{[\s\S]*selectionExerciseUnlocked\[key\] = false/, 'selection-only unlock clears only when the workspace code is edited');

assert.match(html, /בחרו צבע אחר וציירו מחומש שמשתמש רק ב־length לתנועה קדימה/, 'lesson 6 exercise 7 asks for a specific pentagon instead of a vague shape');

assert.match(html, /כמעט — בדקו שכל התנועות קדימה במחומש משתמשות במשתנה/, 'lesson 6 exercise 7 rejects numeric forward movement without revealing the exact answer');

assert.doesNotMatch(html, /צריך לצייר מחומש: חזרה 5 פעמים, פנייה של 72 מעלות/, 'lesson 6 exercise 7 feedback must not reveal the exact pentagon answer');

assert.match(html, /function requiresCheckedContinue\(ex\)[\s\S]*!isTipExercise\(ex\)[\s\S]*!isChallengeExercise\(ex\)[\s\S]*!isSelectionOnlyExercise\(ex\)[\s\S]*!isRunOnlyExampleExercise\(ex\)/, 'normal exercises require an approved check before Continue unlocks');

assert.match(html, /const canContinue = isSelectionOnly[\s\S]*requiresCheckedContinue\(ex\) \? exercisePassed/, 'normal exercises do not unlock Continue from stale completed progress');

assert.match(html, /if\(requiresCheckedContinue\(leavingEx\) && !exercisePassed\) return/, 'nextExercise blocks normal exercises until the current check passes');

assert.doesNotMatch(html, /exercisePassed \|\| completedSet\(\)\.has\(currentExerciseIndex\)/, 'normal exercise Continue gate must not use stale completedSet progress');


assert.match(html, /\.exercise-feedback:empty\{display:none\}/, 'empty feedback box is hidden before any check result');

assert.match(html, /<div class="exercise-bottom"><div class="exercise-controls">[\s\S]*<div class="exercise-feedback/, 'exercise feedback shares the bottom row with the buttons so Continue remains visible');

assert.match(html, /\.exercise-bottom\{display:flex;gap:10px;align-items:center/, 'exercise bottom row keeps feedback and controls visible together');

assert.doesNotMatch(html, /exercise-feedback'\)\?\.scrollIntoView/, 'exercise feedback should not auto-scroll controls out of view');

assert.match(html, /תרגול 6 — תקנו בלוק מיותר/, 'lesson 7 includes a concrete debug exercise instead of filler');

assert.doesNotMatch(html, /currentLesson === 7 && ex\?\.id === 4\) return \['py_repeat'\]/, 'lesson 7 no longer repeats the code-highlight selection exercise');

assert.doesNotMatch(html, /currentLesson === 7 && ex\?\.id === 4[\s\S]*py_repeat[\s\S]*py_forward/, 'lesson 7 removed the redundant selection-only starter');

assert.match(html, /if\(currentLesson === 7\)\{[\s\S]*ex\.id === 2[\s\S]*repeatHasForwardThenTurn\(4\)/, 'lesson 7 exercise 2 validates a 4-repeat base frame');

assert.match(html, /if\(currentLesson === 7\)\{[\s\S]*ex\.id === 3[\s\S]*times === 8[\s\S]*a\.v === 45/, 'lesson 7 exercise 3 validates an 8-sided frame, not a repeated square');

assert.match(html, /if\(currentLesson === 7\)\{[\s\S]*ex\.id === 4[\s\S]*actionDrawnColors/, 'lesson 7 color exercise validates color actually drawn');

assert.match(html, /if\(currentLesson === 7\)\{[\s\S]*ex\.id === 5[\s\S]*repeatHasTwoForwardPattern/, 'lesson 7 two-line pattern validates repeated pattern content');

assert.match(html, /if\(currentLesson === 7\)\{[\s\S]*ex\.id === 7[\s\S]*simulatePath\(actions\)\.distanceFromStart/, 'lesson 7 frame exercise validates a closed repeated path');
