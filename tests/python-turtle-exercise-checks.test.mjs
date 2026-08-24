import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../python-turtle.html', import.meta.url), 'utf8');

assert.match(html, /function repeatShapeMatches\(sides, angle\)/, 'shape exercises use a dedicated repeat/sides/angle validator');

assert.match(html, /"id": 2,[\s\S]*"prompt": "בנו מדרגה שיורדת ימינה: קטע ישר, ירידה קצרה, ואז המשך ישר\."/, 'lesson 2 exercise 1 asks for a descending stair without revealing the block sequence');
assert.match(html, /const pattern = \['forward','right','forward','left','forward'\]/, 'lesson 2 stair validator uses the updated 5-block stair pattern');
assert.match(html, /עדיין לא נראית מדרגה שיורדת ימינה/, 'lesson 2 exercise 1 feedback does not reveal the full block sequence');
assert.match(html, /בנו רצף של 3 מדרגות יורדות, בלי להשתמש בבלוק חזור/, 'lesson 2 exercise 2 asks for a natural three-stair sequence');
assert.match(html, /function hasDescendingStairSequence\(actions, stairCount=3\)/, 'lesson 2 exercise 2 accepts natural descending stair sequences instead of one exact block pattern');
assert.match(html, /function isOneTurnChangeFromDescendingStairs\(actions, stairCount=3\)/, 'lesson 2 exercise 3 accepts a one-turn change from natural descending stair sequences');
assert.match(html, /currentLesson === 2 && ex\.id === 3[\s\S]*isOneTurnChangeFromDescendingStairs\(actions, 3\)/, 'lesson 2 exercise 3 uses the flexible one-turn stair validator');
assert.match(html, /עדיין לא רואים 3 מדרגות יורדות ברצף/, 'lesson 2 exercise 2 feedback does not reveal the full block sequence');
assert.match(html, />✨ דוגמת הפעלה<\//, 'demo button is labeled as an operation demo');
assert.match(html, /זו דוגמת הפעלה בלבד — לא הפתרון של המשימה/, 'demo button explains it is not the task solution');
assert.match(html, /ensureStarterHasPythonBlock\(xmls\[currentLesson\] \|\| xmls\[1\]\)/, 'operation demo examples are wrapped with the Python block');
assert.match(html, /שנו רק את המספר בבלוק ׳עובי עט׳ ל־8 והריצו/, 'lesson 4 exercise 3 hint tells students exactly what to change');
assert.match(html, /אפשר לשנות צבע גם באמצע ציור של ריבוע/, 'lesson 4 exercise 4 hint explains where to place the color block');
assert.match(html, /הצבע החדש צריך להופיע לפני החלק הבא של הציור/, 'lesson 4 exercise 4 feedback explains color order');
assert.match(html, /תרגול 5 — ריבוע משתנה/, 'lesson 4 exercise 5 asks for a styled square');
assert.match(html, /function actionDrawsStyledSquare/, 'lesson 4 exercise 5 validates the styled square');

const loadDemoSource = html.slice(html.indexOf('function loadDemo()'), html.indexOf('function updateLessonUrl'));
assert.match(loadDemoSource, /const existingTopBlocks = workspace\.getTopBlocks\(false\)\.length[\s\S]*Blockly\.Xml\.domToWorkspace\(demoXml, workspace\)/, "demo button appends example blocks to the existing workspace instead of replacing the child's blocks");
assert.doesNotMatch(loadDemoSource, /workspace\.clear\(\)/, 'demo button does not clear existing blocks before adding the example');
assert.match(loadDemoSource, /5: "<xml><block type=\\"py_forward\\"[\s\S]*py_penup[\s\S]*py_pendown[\s\S]*py_forward/, 'lesson 5 demo button uses the small pen-up demo, not the old two-shape example');

assert.match(html, /netTurn = bodyActions\.reduce/, 'shape validator rejects loops whose opposite turns cancel out instead of forming a shape');
assert.match(html, /closesShape = simulatePath\(repeatedActions\)\.distanceFromStart <= 25/, 'shape validator checks that the repeated loop actually closes into a polygon');
assert.match(html, /currentLesson === 3/, 'lesson 3 has specific validators instead of only generic checks');
assert.match(html, /if\(isTipExercise\(ex\) \|\| isChallengeExercise\(ex\)\) return \[\]/, 'challenge exercises are not forced through hard validators');
assert.match(html, /isTip \|\| isChallengeExercise\(ex\) \|\| isSelectionOnly/, 'challenge exercises do not show a dedicated check button');
assert.match(html, /if\(isChallengeExercise\(ex\)\) run\(\);/, 'running challenge code runs the turtle without falsely rendering exercise success');
assert.match(html, /let lastSelectedBlockId = null/, 'selection-only checks remember the last selected block before the check button steals focus');
assert.match(html, /function isSelectionOnlyExercise\(ex\)/, 'lesson 3 for-highlight exercise is a selection-only step');
assert.match(html, /isTip \|\| isChallengeExercise\(ex\) \|\| isSelectionOnly/, 'selection-only exercise and challenges have no check button');
assert.doesNotMatch(html, /completedSet\(\)\.delete\(index\)/, 'selection-only revisits do not clear an exercise that was already unlocked');
assert.match(html, /const canContinue = alreadyCompleted \|\| \(isSelectionOnly \? !!selectionExerciseUnlocked\[selectionUnlockKey\(\)\]/, 'selection-only exercise keeps continue unlocked after completion and also unlocks from an explicit saved unlock flag');
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
assert.match(html, /if\(ex\.id === 5\)[\s\S]*repeatCalculatedShapeMatches\(\)/, 'lesson 3 exercise 5 validates the open calculated-shape task instead of only changing a side length');
assert.match(html, /function actionDrawsWithWidth\(actions, width\)/, 'width exercises check that drawing happens after the requested pen width is set');
assert.match(html, /function actionDrawsWithMinWidth\(actions, minWidth\)/, 'some width exercises accept a stated minimum width rather than one hidden exact value');
assert.match(html, /function actionDrawsWithColor\(actions, expectedColor\)/, 'color validators can check the color active at actual draw time');
assert.match(html, /actionDrawsWithWidth\(actions, 3\)/, 'width 3 exercises require actual drawing with width 3');
assert.match(html, /function actionChangesColorBetweenDraws\(actions\)/, 'middle-color exercises require drawing before and after a color change');
assert.match(html, /ex\.id === 4[\s\S]*actionChangesColorBetweenDraws\(actions\)/, 'lesson 4 color-change exercise uses the middle-drawing color validator');
assert.match(html, /ex\.id === 5[\s\S]*actionDrawsStyledSquare\(actions\)/, 'lesson 4 styled-square exercise has a specific validator');
assert.match(html, /colors\.size === 4 && widths\.size === 4/, 'lesson 4 exercise 5 requires four different colors and four different widths');
assert.match(html, /const firstSevenDrawn = drawn\.slice\(0, 7\)/, 'lesson 4 styled-square accepts a square without a redundant final turn');
assert.match(html, /optionalFinalTurn/, 'lesson 4 styled-square allows but validates an optional final turn');
assert.match(html, /שיניתם את הקוד — לחצו שוב על בדיקה/, 'editing after failed validation clears stale feedback and prompts recheck');
assert.match(html, /currentLesson === 4 && ex\?\.id === 7[\s\S]*py_color/, 'lesson 4 late-color debug exercise has generated starter code');
assert.match(html, /function fixesLateColorStarter\(actions\)/, 'late-color debug exercise checks that the starter shape is preserved and recolored');
assert.match(html, /const intendedColor = '#16a34a'/, 'late-color debug exercise requires the intended starter color, not any non-blue color');
assert.match(html, /ex\.id === 7[\s\S]*fixesLateColorStarter\(actions\)/, 'lesson 4 late-color exercise uses its specific starter-fix validator');
assert.match(html, /הקוד אמור לצייר ריבוע ירוק, אבל הצבע מופיע מאוחר מדי/, 'lesson 4 exercise 7 explains the intended output before asking students to debug');
assert.match(html, /בלוק הצבע הירוק נמצא לפני פקודות הריבוע/, 'lesson 4 exercise 7 feedback tells students how to fix the late color bug');
assert.match(html, /currentLesson === 4 && ex\?\.id === 7\) return '<xml><block type="py_python"/, 'lesson 4 exercise 7 starter is nested under the Python block');
assert.match(html, /currentLesson === 5 && ex\.id === 1[\s\S]*forwardAfterPenUp/, 'lesson 5 merged pen-up exercise requires movement after the pen is raised');
assert.match(html, /penup\|הרימו עט/, 'penup exercises require the pen-up block');
assert.match(html, /pendown\|הורידו עט/, 'pendown exercises require the pen-down block');

console.log('python turtle exercise check regressions passed');


assert.match(html, /function validateWrittenPythonExercise\(ex, actions\)/, 'written Python exercises can validate the requested shape, not only syntax');


assert.match(html, /currentLesson === 2 && ex\?\.id === 15[\s\S]*hasForwardBeforeTurn[\s\S]*hasForwardAfterTurn/, 'lesson 2 final writing task rejects only-straight code and requires a stair-like forward-turn-forward sequence');
assert.match(html, /כדי ליצור מדרגה, כתבו קו קדימה, פנייה, ואז עוד קו קדימה/, 'lesson 2 final writing task gives child-friendly feedback when the written code is not stair-like');


assert.match(html, /currentLesson === 1 \|\| currentLesson === 2 \|\| currentLesson === 3/, 'final written Python task is available in lessons 1-3 only for now');
assert.match(html, /currentLesson === 3 && ex\?\.id === 13[\s\S]*squareStartPattern = \['forward','turn90','forward','turn90','forward'\][\s\S]*כדי ליצור 3 צלעות של ריבוע/, 'lesson 3 final writing task requires three square sides, not only a stair-like forward-turn-forward sequence');
assert.match(html, /בחרו צורה משלכם עם כמה צלעות\/צדדים שתרצו[\s\S]*360 ÷ מספר הצלעות\/הצדדים[\s\S]*function repeatCalculatedShapeMatches\(\)[\s\S]*360 \/ times/, 'lesson 3 has an open choose-and-calculate shape task validated by the formula, not fixed to 5 or 6 sides');
assert.match(html, /כתבו בתוך התיבה בלומדה 5 שורות Python קצרות שיוצרות 3 צלעות של ריבוע/, 'lesson 3 includes a final written Python challenge for three square sides');


assert.match(html, /function isChallengeExercise\(ex\)\{[\s\S]*return \/אתגר\/\.test\(text\);/, 'only exercises explicitly named as challenges are labeled as challenges in the side navigation');
assert.doesNotMatch(html, /אתגר\|אות ראשונה של השם/, 'regular creative name-letter exercise is not automatically labeled as a challenge');

assert.match(html, /function isRunOnlyExampleExercise\(ex\)/, 'run-only example exercises can unlock continue after running without a check button');
assert.match(html, /currentLesson === 5 && ex\?\.id === 4[\s\S]*py_repeat[\s\S]*py_forward[\s\S]*py_right[\s\S]*py_forward[\s\S]*py_penup[\s\S]*py_pendown[\s\S]*py_repeat/, 'lesson 5 order-debug exercise starts with two shapes and penup too late after the connector was drawn');
assert.match(html, /currentLesson === 5 && ex\.id === 4[\s\S]*beforePenUpForwards < 4[\s\S]*הצורה הראשונה ולפני המעבר[\s\S]*afterPendownTriangleTurns/, 'lesson 5 order-debug exercise validates moving penup between the first shape and the transition');
assert.match(html, /currentLesson === 5 && ex\?\.id === 5[\s\S]*py_forward[\s\S]*py_penup[\s\S]*py_forward[\s\S]*py_pendown[\s\S]*py_forward[\s\S]*movable="false"/, 'lesson 5 small penup demo loads locked starter code with two separated lines');
assert.match(html, /"id": 3[\s\S]*"title": "הרצה מודרכת"[\s\S]*"id": 4[\s\S]*"title": "תרגול 4 — למה הופיע קו מחבר\?"/, 'lesson 5 guided run appears before the order-debug exercise');
assert.match(html, /isRunOnlyExampleExercise\(ex\)[\s\S]*await run\(\)[\s\S]*completedSet\(\)\.add\(currentExerciseIndex\)/, 'lesson 5 demo unlocks continue only after running');

assert.match(html, /const runOnlyExampleStarted = \{\}/, 'run-only examples track whether the user ran this demo in the current entry');
assert.match(html, /!isRunOnlyExampleExercise\(ex\) && \(hasGeneratedStarter \|\| hasEntryReset\)/, 'locked run-only examples do not show the reset-to-starter button');
assert.match(html, /isRunOnlyExampleExercise\(ex\) \? !!runOnlyExampleStarted\[selectionUnlockKey\(\)\]/, 'run-only examples keep continue disabled until the demo is run');

assert.match(html, /currentLesson === 5 && ex\?\.id === 3[\s\S]*py_penup[\s\S]*py_pendown/, 'lesson 5 code-selection exercise loads starter blocks to select');
assert.match(html, /תרגול 3 — בלוקים לקוד Python[\s\S]*האם הצב מצייר או לא מצייר אחריה[\s\S]*מצב הציור אחרי כל שורה/, 'lesson 5 exercise 3 asks students to explain penup and pendown, not only click blocks');
assert.match(html, /lineMatches \|\| selectionOnlyBlockTypes\(currentExercises\(\)\[currentExerciseIndex\][\s\S]*includes\(expectedType\)/, 'selection exercises can unlock from selecting the correct block even if code highlight text matching is brittle');


assert.match(html, /runOnlyExampleStarted\[key\] = false;[\s\S]*exercisePassed = false;/, 'run-only examples relock continue on every entry until Run is pressed');
assert.match(html, /isRunOnlyExampleExercise\(leavingEx\) && !runOnlyExampleStarted\[selectionUnlockKey\(\)\]/, 'next exercise guard blocks run-only demos before Run even if previously completed');



assert.match(html, /const alreadyDone = completedSet\(\)\.has\(index\) \|\| !!selectionExerciseUnlocked\[key\]/, 'selection-only exercises stay unlocked when navigating back after completion');

assert.match(html, /function requiresFreshCheckExercise\(ex\)/, 'some starter-fix exercises require a fresh successful check before continue unlocks');
















assert.match(html, /currentLesson === 5 && ex\?\.id === 6\) return '<xml><block type="py_python" x="20" y="20"><\/block><\/xml>'/, 'lesson 5 house exercise starts from a clean Python block, not the previous debug code');
assert.match(html, /תרגול 5 — בית עם גג מרחף[\s\S]*ריבוע לקירות ומשולש לגג[\s\S]*רווח קטן בין הקירות לגג/, 'lesson 5 exercise 5 asks for a meaningful house drawing with a separated roof');
assert.match(html, /currentLesson === 5 && ex\.id === 6[\s\S]*squareForwards[\s\S]*squareTurns[\s\S]*transitionForwards[\s\S]*roofTurns/, 'lesson 5 house exercise validates square walls, pen-up transition, and triangle roof');
assert.match(html, /תרגול 6 — שלוש צורות צבעוניות ומופרדות[\s\S]*יש שלוש צורות נפרדות[\s\S]*לפחות שלושה צבעים שונים/, 'lesson 5 former first challenge is now a required checked exercise');
assert.doesNotMatch(html, /אתגר — שלוש צורות צבעוניות ומופרדות/, 'lesson 5 three-shapes task is no longer marked as an optional challenge');
assert.doesNotMatch(html, /אתגר — עיר קטנה עם בתים נפרדים/, 'lesson 5 duplicate city challenge was removed');
assert.match(html, /currentLesson === 5 && ex\.id === 7[\s\S]*actionDrawnColors\(actions\)\.size < 3[\s\S]*cleanTransitions < 2/, 'lesson 5 three-shapes exercise validates colors and pen-up transitions');
assert.match(html, /currentLesson === 5 && ex\?\.id === 12\) return 5/, 'lesson 5 final Python writing challenge requires five short lines');
assert.match(html, /currentLesson === 5 && ex\?\.id === 12\) return '<xml><block type="py_python" x="20" y="20"><\/block><\/xml>'/, 'lesson 5 final Python writing challenge starts from a clean workspace');
assert.match(html, /currentLesson === 5 && ex\?\.id === 12 \? 'forward\(70\).*penup\(\).*pendown\(\).*forward\(70\)'/, 'lesson 5 final Python writing challenge keeps the helpful placeholder example');
assert.match(html, /כתבו בקוד Python פקודות שגורמות לצב לצייר קו[\s\S]*penup\(\)[\s\S]*pendown\(\)/, 'lesson 5 final Python writing challenge asks for forward, penup, forward, pendown, forward');
assert.match(html, /currentLesson === 5 && ex\?\.id === 12[\s\S]*matchesPenLiftLine[\s\S]*forward[\s\S]*penup[\s\S]*pendown/, 'lesson 5 final Python writing challenge validates pen lift sequence');

assert.match(html, /if\(requiresFreshCheckExercise\(targetEx\) && !completedSet\(\)\.has\(index\)\)\{\s*exercisePassed = false;\s*\}/, 'fresh-check exercises relock Continue only until they have been completed once');
assert.doesNotMatch(html, /requiresFreshCheckExercise\(targetEx\)[\s\S]{0,120}completedSet\(\)\.delete\(index\)/, 'returning to a completed fresh-check exercise must not relock later unlocked exercises');

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

assert.match(html, /selectedBlockHighlightsExpectedCode[\s\S]*highlightedLines=null[\s\S]*lineMatches[\s\S]*selectionOnlyBlockTypes\(currentExercises\(\)\[currentExerciseIndex\]/, 'selection-only exercises prefer highlighted Python code but still unlock from selecting the correct block if highlight matching is brittle');

assert.match(html, /if\(isSelectionOnlyExercise\(ex\) && !alreadyCompleted\)\{[\s\S]*selectionExerciseUnlocked\[key\] = false/, 'selection-only completion is cleared after workspace edits only before the exercise has been completed once');
assert.doesNotMatch(html, /if\(isSelectionOnlyExercise\(ex\)[\s\S]{0,180}completedSet\(\)\.delete\(currentExerciseIndex\)/, 'selection-only workspace edits do not remove already unlocked navigation');

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

assert.match(html, /const canContinue = alreadyCompleted \|\|[\s\S]*requiresCheckedContinue\(ex\) \? exercisePassed/, 'normal exercises unlock Continue after they pass once and stay unlocked when revisited');

assert.match(html, /if\(requiresCheckedContinue\(leavingEx\) && !exercisePassed\) return/, 'nextExercise blocks normal exercises until the current check passes before first completion');

assert.match(html, /exercisePassed = completedSet\(\)\.has\(currentExerciseIndex\)/, 'revisiting a completed normal exercise restores its passed state');

assert.match(html, /function createCodeSnapshot\(\)[\s\S]*actions:getActions\(\)\.map[\s\S]*blockTypes:connectedBlocks\.map[\s\S]*repeatPatterns/, 'exercise checks snapshot the code and repeat structure at the moment the run starts');

assert.match(html, /if\(!skipRun\) await run\(snapshot\.actions\)[\s\S]*const problems = validateExercise\(snapshot\)/, 'exercise checks validate the same code snapshot that the turtle just ran');

assert.match(html, /function hasBlock\(type\)\{[\s\S]*activeValidationSnapshot[\s\S]*blockTypes\.includes\(type\)/, 'block-presence validators use the run snapshot during checks, not live mid-run edits');

assert.match(html, /function repeatPatternBlocks\(\)\{[\s\S]*activeValidationSnapshot[\s\S]*repeatPatterns/, 'repeat validators use the run snapshot during checks, not live mid-run edits');


assert.match(html, /\.exercise-feedback:empty\{display:none\}/, 'empty feedback box is hidden before any check result');
assert.match(html, /\.exercise-feedback\{[^}]*max-height:none;overflow:visible/, 'feedback boxes expand instead of showing an inner scrollbar');

assert.match(html, /const feedbackBelowButtons = true/, 'all exercise feedback is rendered below the button row');
assert.match(html, /feedbackBelowButtons \? '<br>' : feedbackHtml/, 'all exercises insert a real line break before feedback');
assert.match(html, /feedbackBelowButtons \? feedbackHtml : ''/, 'all exercise feedback is rendered below the button row');
assert.match(html, /if\(feedbackBelowButtons && message\)\{[\s\S]*missionEl\.scrollTo\(\{top: missionEl\.scrollHeight, behavior:'smooth'\}\)/, 'exercise feedback scrolls the instructions area down when feedback first appears');

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

assert.match(html, /currentLesson === 8 && ex\?\.id === 4\) return \['py_grow_length'\]/, 'lesson 8 code-selection exercise unlocks by selecting the grow-length block');

assert.match(html, /if\(type === 'py_grow_length'\) return 'length = length \+'/, 'lesson 8 grow-length selection expects the Python update line');

assert.match(html, /function repeatSpiralPattern\(times=null, angle=null, growAmount=null\)/, 'lesson 8 has a dedicated spiral validator for forward-length, turn, and grow-length order');

assert.match(html, /body\.some\(a=>a\.cmd === 'setVar' && a\.name === 'length'\)\) return false/, 'lesson 8 spiral validator rejects resetting length inside the repeat loop');

assert.match(html, /if\(currentLesson === 8\)\{[\s\S]*ex\.id === 3[\s\S]*repeatSpiralPattern\(8, 90, 10\)/, 'lesson 8 exercise 3 validates the base spiral pattern');

assert.doesNotMatch(html, /כמעט — ודאו שהאורך נקבע לפני החזרה, ובתוך החזרה הוא רק מתקדם, פונה, ואז גדל/, 'lesson 8 spiral failure feedback should not reveal the exact block recipe');

assert.match(html, /המשיכו מהקוד של תרגול 1: הוסיפו אחרי התנועה פנייה ימינה של 90/, 'lesson 8 exercise 2 makes clear it builds on exercise 1 code');

assert.match(html, /המשיכו מהספירלה שבניתם בתרגול 3: שנו רק את הגדלת length מ־10 ל־20/, 'lesson 8 exercise 5 makes clear it builds on exercise 3 code');

assert.match(html, /המשיכו מהקוד של תרגול 5: שנו רק את הפנייה ל־60/, 'lesson 8 exercise 6 makes clear it builds on exercise 5 code');

assert.match(html, /if\(currentLesson === 8\)\{[\s\S]*ex\.id === 5[\s\S]*repeatSpiralPattern\(8, 90, 20\)/, 'lesson 8 exercise 5 validates changing only the grow amount');

assert.match(html, /if\(currentLesson === 8\)\{[\s\S]*ex\.id === 6[\s\S]*repeatSpiralPattern\(8, 60, null\)/, 'lesson 8 exercise 6 validates the alternate turn while preserving growth');

assert.doesNotMatch(html, /תקנו את הקוד ההתחלתי: length מתאפס בתוך כל חזרה/, 'lesson 8 debug prompt should not reveal the exact bug before the learner investigates');

assert.match(html, /תקנו את הקוד ההתחלתי כך שספירלת החלל תגדל בכל סיבוב/, 'lesson 8 debug exercise asks for the goal without naming the exact bug');

assert.match(html, /currentLesson === 8 && ex\?\.id === 7[\s\S]*py_repeat[\s\S]*py_set_length[\s\S]*py_forward_length[\s\S]*py_right[\s\S]*py_grow_length/, 'lesson 8 debug exercise loads a starter with set-length and grow-length inside the loop so there is a real bug to fix');

assert.match(html, /if\(currentLesson === 8\)\{[\s\S]*ex\.id === 8[\s\S]*actionDrawnColors/, 'lesson 8 color exercise validates color actually drawn on the spiral');

assert.match(html, /"id": 9,[\s\S]*"prompt": "בנו קו אחד של כוכב: הזיזו את הצב קדימה ואז סובבו אותו ימינה ב־144 מעלות/, 'lesson 9 starts by teaching the most basic star unit with the required turn degree');

assert.match(html, /if\(currentLesson === 9\)\{[\s\S]*ex\.id === 1[\s\S]*hasStarUnit\(actions, null, 144\)/, 'lesson 9 exercise 1 validates one star line before asking for a full star');

assert.match(html, /המשיכו מהקו הראשון שבניתם בתרגול 1: חזרו על אותה יחידה מספיק פעמים/, 'lesson 9 exercise 2 builds directly from the first star-line exercise');

assert.match(html, /המשיכו מהכוכב שבניתם בתרגול 2: לפני שהכוכב מתחיל, סובבו את הצב סיבוב קטן/, 'lesson 9 exercise 3 asks for a more interesting rotated-star variation instead of changing only steps');

assert.match(html, /currentLesson === 9 && ex\?\.id === 4\) return \['py_right'\]/, 'lesson 9 code-selection exercise targets the turn block');

assert.match(html, /if\(type === 'py_right'\) return 'right'/, 'lesson 9 turn selection expects the right\(\) Python line');

assert.match(html, /function repeatStarPattern\(times=5, angle=144, length=null\)/, 'lesson 9 has a dedicated behavior validator for repeated star units');

assert.match(html, /function hasPreTurnBeforeStar\(actions\)/, 'lesson 9 has a helper for rotated-star variations');

assert.match(html, /if\(currentLesson === 9\)\{[\s\S]*ex\.id === 3[\s\S]*hasPreTurnBeforeStar\(actions\)/, 'lesson 9 exercise 3 validates a rotation variation before the star pattern');

assert.match(html, /if\(currentLesson === 9\)\{[\s\S]*ex\.id === 2[\s\S]*repeatStarPattern\(5, 144, null\)/, 'lesson 9 exercise 2 validates a full repeated star without requiring a copied length');

assert.match(html, /function hasSeparatedColoredStars\(actions\)/, 'lesson 9 has a helper for separated colored stars');

assert.match(html, /if\(currentLesson === 9\)\{[\s\S]*ex\.id === 6[\s\S]*starRepeatCount\(5, 144, 1, 999\) < 2[\s\S]*hasSeparatedColoredStars\(actions\)/, 'lesson 9 exercise 6 validates two separated colored stars using penup/pendown');

assert.match(html, /currentLesson === 9 && ex\?\.id === 7[\s\S]*py_penup[\s\S]*py_pendown[\s\S]*<field name="ANGLE">90<\/field>[\s\S]*<field name="ANGLE">90<\/field>/, 'lesson 9 debug exercise loads two separated wrong-angle stars to fix');

assert.match(html, /תקנו את הקוד ההתחלתי כך ששני הכוכבים יצוירו ברורים וסגורים, בלי לגרור בלוקים חדשים/, 'lesson 9 debug prompt asks for fixing two stars by editing values instead of dragging blocks');

assert.match(html, /if\(currentLesson === 9\)\{[\s\S]*ex\.id === 7[\s\S]*starRepeatCount\(5, 144, 1, 999\) < 2[\s\S]*hasSeparatedColoredStars\(actions\)/, 'lesson 9 exercise 7 validates two fixed separated colored stars');

assert.match(html, /"id": 10,[\s\S]*"prompt": "תקנו את הקוד ההתחלתי כך שהציור יהיה ריבוע סגור וברור/, 'lesson 10 starts with a concrete broken-square debug task');
assert.match(html, /currentLesson === 10 && ex\?\.id === 1[\s\S]*<field name="ANGLE">80<\/field>/, 'lesson 10 exercise 1 starter has a real wrong-angle square bug');
assert.match(html, /if\(currentLesson === 10\)\{[\s\S]*ex\.id === 1[\s\S]*repeatShapeMatches\(4, 90\)/, 'lesson 10 exercise 1 validates a fixed closed square');
assert.match(html, /currentLesson === 10 && ex\?\.id === 2[\s\S]*<field name="TIMES">3<\/field>[\s\S]*<field name="ANGLE">90<\/field>/, 'lesson 10 exercise 2 starter has a real broken triangle value');
assert.match(html, /if\(currentLesson === 10\)\{[\s\S]*ex\.id === 2[\s\S]*repeatShapeMatches\(3, 120\)/, 'lesson 10 exercise 2 validates a fixed closed triangle');
assert.doesNotMatch(html, /currentLesson === 10 && ex\?\.id === 3\) return \['py_right'\]/, 'lesson 10 exercise 3 no longer duplicates the same turn-value detective task as exercise 2');
assert.match(html, /"title": "תרגול 3 — שער מתומן מקולקל"/, 'lesson 10 exercise 3 is a distinct octagon-style debug task, not another square/triangle turn task');
assert.match(html, /currentLesson === 10 && ex\?\.id === 3[\s\S]*<field name="WIDTH">2<\/field>[\s\S]*<field name="TIMES">8<\/field>[\s\S]*<field name="ANGLE">60<\/field>[\s\S]*py_color/, 'lesson 10 exercise 3 starter has multiple real octagon/color/width bugs');
assert.match(html, /ex\.id === 3[\s\S]*repeatShapeMatches\(8, 45\)[\s\S]*actionDrawsWithMinWidth\(actions, 6\)[\s\S]*#7c3aed/, 'lesson 10 exercise 3 validates octagon shape plus minimum drawn width and purple color');
assert.doesNotMatch(html, /לחצו על בלוק הפנייה בקוד ההתחלתי ובדקו איזו שורת Python נדלקת/, 'lesson 10 exercise 3 should not reuse the generic copied code-highlight prompt');
assert.match(html, /if\(currentLesson === 10\)\{[\s\S]*ex\.id === 4[\s\S]*repeatShapeMatches\(4, 90\)/, 'lesson 10 repeat-structure debug validates the whole square unit inside the loop');
assert.match(html, /function hasSeparatedSquareAndTriangle\(actions\)/, 'lesson 10 has a helper for fixing a connector between two shapes');
assert.match(html, /if\(currentLesson === 10\)\{[\s\S]*ex\.id === 5[\s\S]*hasSeparatedSquareAndTriangle\(actions\)/, 'lesson 10 connector debug validates pen-up movement between a square and triangle');
assert.match(html, /"title": "תרגול 6 — שלוש צורות בשלושה צבעים"/, 'lesson 10 exercise 6 extends the separated-shapes idea instead of only fixing late color');
assert.match(html, /הוסיפו בעצמכם בלוק צבע לפני כל צורה/, 'lesson 10 exercise 6 asks learners to add the color blocks themselves');
assert.match(html, /function hasThreeSeparatedDifferentColorShapes\(actions\)/, 'lesson 10 has a helper for three separated different-color shapes');
assert.match(html, /colorActions = actions\.filter\(a=>a\.cmd === 'color'/, 'lesson 10 exercise 6 requires explicit color blocks, not only default blue');
assert.match(html, /if\(currentLesson === 10\)\{[\s\S]*ex\.id === 6[\s\S]*hasThreeSeparatedDifferentColorShapes\(actions\)/, 'lesson 10 exercise 6 validates separated shapes with different drawn colors');
assert.match(html, /"title": "תרגול 7 — מנעול משולב מתקדם"/, 'lesson 10 exercise 7 is harder than exercise 6 and combines multiple previous bug types');
assert.match(html, /כל צורה צריכה להיות בצבע אחר ומתוקנת/, 'lesson 10 exercise 7 asks learners to add the color blocks themselves');
assert.match(html, /currentLesson === 10 && ex\?\.id === 7[\s\S]*<field name="ANGLE">80<\/field>[\s\S]*<field name="ANGLE">90<\/field>[\s\S]*py_set_length/, 'lesson 10 exercise 7 starter includes square, star, and spiral bugs');
assert.match(html, /function hasAdvancedDebugLock\(actions\)/, 'lesson 10 has a helper for the advanced combined debug lock task');
assert.match(html, /function advancedDebugLockIssues\(actions\)/, 'lesson 10 advanced lock reports specific issues instead of one generic failure');
assert.match(html, /advancedDebugLockIssues\(actions\)[\s\S]*actionDrawnColors\(actions\)\.size < 3[\s\S]*repeatedShapeSequenceStarts\(actions, 4, 90\)[\s\S]*repeatedStarSequenceStarts\(actions, 144\)[\s\S]*repeatSpiralPattern\(8, null, 10\)/, 'lesson 10 advanced lock counts drawn default blue, detects square/star from flattened actions, and validates a growing spiral without requiring one hidden spiral angle');
assert.doesNotMatch(html, /advancedDebugLockIssues\(actions\)[\s\S]{0,260}explicitColors\.size < 3/, 'lesson 10 advanced lock should not require three explicit color blocks; default blue counts as a drawn color');
assert.match(html, /if\(currentLesson === 10\)\{[\s\S]*ex\.id === 7[\s\S]*advancedDebugLockIssues\(actions\)/, 'lesson 10 exercise 7 uses the advanced combined validator');
assert.match(html, /"title": "אתגר — חדר הבריחה המלא"[\s\S]*ריבוע, משולש, כוכב וספירלה[\s\S]*4 צבעים שונים/, 'lesson 10 final challenge is a long structured classroom task instead of asking learners to invent their own question');
assert.match(html, /requiresFreshCheckExercise\(ex\)[\s\S]*currentLesson === 10 && \[1,2,3,4,5,6,7\]\.includes\(ex\?\.id\)/, 'lesson 10 generated debug exercises require a fresh successful check');
assert.match(html, /function startEmptyLesson\(id, updateUrl=true\)\{[\s\S]*workspace\.clear\(\);[\s\S]*generatePython\(\);[\s\S]*maybeLoadExerciseStarter\(currentExerciseIndex, true\);[\s\S]*renderCurrentExercise\(\);/, 'starting a lesson with a generated first exercise reloads the starter code after clearing the workspace');
assert.match(html, /const restoredExercise = currentExercises\(\)\[currentExerciseIndex\];[\s\S]*starterXmlForExercise\(restoredExercise\) && !getActions\(\)\.length[\s\S]*exerciseStarterLoaded\[baselineKey\(\)\] = false;[\s\S]*maybeLoadExerciseStarter\(currentExerciseIndex, true\);/, 'restoring saved progress with an empty generated-starter exercise reloads the starter so blocks and Python code are visible');

assert.match(html, /"id": 11,[\s\S]*"title": "מפת שכונה עם הערות וקנה מידה"[\s\S]*"concept": "הערות קוד וקנה מידה"/, 'lesson 11 is reworked around a real new concept: comments and scale');
assert.match(html, /if\(t==='py_comment'\) out\.push\(\{cmd:'comment'/, 'comment blocks are included in action snapshots for validation');
assert.match(html, /function hasCommentBeforeFirstDraw\(actions, pattern=null\)/, 'lesson 11 can require comments before the drawing they document');
assert.match(html, /ex\.id === 1[\s\S]*hasCommentBeforeFirstDraw\(actions, \/רחוב\|ראשי\/\)/, 'lesson 11 exercise 1 rejects comments placed after the first street or unrelated comment text');
assert.match(html, /ההערה לא נראית בציור[\s\S]*רק בקוד Python/, 'lesson 11 exercise 1 explains comments are visible only in Python code');
assert.match(html, /ex\.id === 2[\s\S]*comments\.every\(text=>\/רחוב\/\.test\(text\)\)/, 'lesson 11 exercise 2 requires each note/comment to include the word רחוב');
assert.match(html, /כל הערה צריכה להכיל את המילה “רחוב”/, 'lesson 11 exercise 2 states the רחוב word requirement in learner text');
assert.match(html, /currentLesson === 11 && ex\?\.id === 3\) return \['py_comment'\]/, 'lesson 11 selection exercise targets the comment block');
assert.match(html, /if\(type === 'py_comment'\) return '#'/, 'lesson 11 comment selection highlights the Python # line');
assert.match(html, /function renderCodeLineText\(text\)[\s\S]*commentMatch[\s\S]*<span dir="rtl" class="code-comment-text">/, 'Hebrew Python comments are isolated RTL after the # so text like רחוב א\' is not visually flipped');
assert.match(html, /currentLesson === 11 && ex\?\.id === 3[\s\S]*<block type="py_comment"[\s\S]*רחוב ראשי/, 'lesson 11 exercise 3 has generated comment starter code');
assert.match(html, /if\(currentLesson === 11\)\{[\s\S]*ex\.id === 4[\s\S]*commentTexts\(actions\)\.length < 1[\s\S]*repeatUsesLengthShape\(4, 90\)/, 'lesson 11 exercise 4 validates a note plus a scaled square block using length');

assert.match(html, /"title": "תרגול 5 — שתי נקודות עניין נקיות"/, 'lesson 11 removes the too-easy scale-up exercise and makes points-of-interest exercise 5');
assert.match(html, /"title": "תרגול 6 — דיבאג רחובות בקנה מידה"[\s\S]*כל הרחובות צריכים להשתמש ב־length/, 'lesson 11 exercise 6 title and prompt match street-only starter code');
assert.match(html, /if\(currentLesson === 11\)\{[\s\S]*ex\.id === 5[\s\S]*actionDrawnColors\(actions\)\.size < 2[\s\S]*ex\.id === 6[\s\S]*forwardVarCount\(actions\) < 3/, 'lesson 11 validators match renumbered points and debug exercises');
assert.match(html, /“זוז קדימה לפי האורך” יוצר בקוד: forward\(length\)/, 'lesson 11 exercise 4 hint explains the forward(length) block name');
assert.match(html, /function hasScaledMapDebugFix\(actions\)/, 'lesson 11 has a helper for the broken scale-map debug task');
assert.match(html, /currentLesson === 11 && ex\?\.id === 6[\s\S]*<field name="TEXT">מעבר לרחוב צדדי<\/field>[\s\S]*<field name="TEXT">רחוב צדדי<\/field>[\s\S]*<block type="py_forward"><field name="STEPS">35<\/field>/, 'lesson 11 exercise 6 starter labels the fixed-number side street bug as a street');
assert.match(html, /if\(currentLesson === 11\)\{[\s\S]*ex\.id === 6[\s\S]*forwardVarCount\(actions\) < 3[\s\S]*penUpMoveCount\(actions\) < 1/, 'lesson 11 exercise 6 validates scaled streets and a clean pen-up transition');
assert.match(html, /function hasAdvancedDocumentedMap\(actions\)/, 'lesson 11 has an advanced documented-map validator');
assert.match(html, /"title": "אתגר — מפה מתקדמת עם מקרא"[\s\S]*אתגר: בנו מפה מתקדמת/, 'lesson 11 exercise 7 is marked as a challenge');
assert.match(html, /"title": "אתגר — עיר קטנה מתועדת"[\s\S]*5 חלקים מתועדים[\s\S]*4 צבעים שונים[\s\S]*3 מעברים בלי ציור/, 'lesson 11 final challenge is a long structured classroom task');

assert.doesNotMatch(html, /if\(!exercisePassed\) completedSet\(\)\.delete\(index\)/, 'completed exercises stay unlocked after revisiting selection exercises');
assert.match(html, /const alreadyCompleted = completedSet\(\)\.has\(currentExerciseIndex\);[\s\S]*const canContinue = alreadyCompleted \|\|/, 'completed exercises keep Continue unlocked when revisited');
assert.match(html, /if\(isSelectionOnlyExercise\(ex\) && !alreadyCompleted\)/, 'editing a completed selection exercise does not clear its unlocked state');

assert.match(html, /else if\(isSelectionOnlyExercise\(ex\)\)\{[\s\S]*await run\(\);[\s\S]*כדי להמשיך, לחצו על הבלוק המתאים/, 'running a selection-only exercise does not show generic check success feedback');
assert.doesNotMatch(html, /else if\(isSelectionOnlyExercise\(ex\)\)[\s\S]{0,160}else checkExercise\(\)/, 'selection-only exercises are not validated by the global Run button');


assert.ok(!html.includes('בלי להפוך את כיוון הירידה'), 'lesson 2 exercise 1 feedback stays concise without the direction-warning phrase');

assert.match(html, /"hint": "חשבו על צורת מדרגה: קודם קטע ישר, אחר כך ירידה קצרה, ואז ממשיכים ישר/, 'lesson 2 exercise 1 hint explains the stair shape without revealing block order');

assert.match(html, /תרגול 8 — מוצאים את הבאג בצורה[\s\S]*אמורים לצייר מחומש[\s\S]*currentLesson === 3 && ex\?\.id === 8[\s\S]*<field name="TIMES">4<\/field>[\s\S]*<field name="ANGLE">72<\/field>[\s\S]*if\(ex\.id === 8\)[\s\S]*repeatShapeMatches\(5, 72\)/, 'lesson 3 exercise 8 is a starter-block debugging task with a missing-side pentagon, not a square-looking wrong angle');

assert.match(html, /תרגול 9 — צורות בתוך צורות[\s\S]*בנו מחומש שהוא בתוך משושה שהוא בתוך מתומן/, 'lesson 3 exercise 9 uses nested shapes with integer turn angles and is not a second challenge');
assert.doesNotMatch(html, /אתגר — בנו משושה|אתגר: בנו משושה/, 'lesson 3 keeps only the final Python writing exercise as a challenge');


assert.match(html, /"id": 4,[\s\S]*תרגול 1 — צבע ראשון ושינוי ראשון[\s\S]*העט מתחיל בצבע כחול[\s\S]*בחרו צבע חדש וציירו עוד קו קצר/, 'lesson 4 exercise 1 starts with a simple color-change task, not only drawing the default blue line');

assert.match(html, /"id": 4,[\s\S]*בחרתם בלוק שקשור לצבע או לעובי, וראיתם את השורה המתאימה בקוד/, 'lesson 4 exercise 2 check is phrased directly for students');
assert.doesNotMatch(html, /"id": 4,[\s\S]*התלמיד\/ה יודע\/ת להצביע על הבלוק או השורה שקשורים ל־עט וצבע/, 'lesson 4 exercise checks do not expose teacher-facing wording to students');

assert.match(html, /"id": 4,[\s\S]*תרגול 8 — לוגו קטן עם 3 צבעים[\s\S]*צרו לוגו קטן עם 3 צבעים/, 'lesson 4 exercise 8 is regular logo practice, not an early challenge');
assert.doesNotMatch(html, /"id": 4,[\s\S]*אתגר: לוגו קטן עם 3 צבעים/, 'lesson 4 does not label the logo practice as a challenge');
assert.match(html, /תרגול 8 — לוגו קטן עם 3 צבעים[\s\S]*הלוגו כולל ציור עם לפחות 3 צבעים שונים/, 'lesson 4 exercise 8 student-facing check requires three colors');
assert.match(html, /currentLesson === 4[\s\S]*ex\.id === 8[\s\S]*actionDrawnColors\(actions\)\.size < 3/, 'lesson 4 exercise 8 validator rejects drawings with fewer than three actual colors');
assert.match(html, /הלוגו צריך לכלול לפחות 3 צבעים שונים שמצוירים בפועל/, 'lesson 4 exercise 8 gives clear feedback for missing colors');


assert.match(html, /currentLesson === 4 && ex\?\.id === 12\) return 4/, 'lesson 4 final Python writing challenge requires 4 short lines');
assert.match(html, /קודם בחרו צבע חדש[\s\S]*אחר כך ציירו קו[\s\S]*פנו 90 מעלות[\s\S]*שינוי הצבע צריך להופיע לפני הקו הראשון/, 'lesson 4 final writing challenge explains the task in words, with color before movement');
assert.match(html, /const colorMatch = cleaned\.match/, 'written Python parser accepts simple color lines');
assert.match(html, /currentLesson === 4 && ex\?\.id === 12[\s\S]*matchesColoredCorner/, 'lesson 4 writing challenge validates color before the drawn corner');
