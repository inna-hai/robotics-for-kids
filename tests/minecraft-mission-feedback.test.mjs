import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const playHtml = readFileSync(new URL('../minecraft-play.html', import.meta.url), 'utf8');
const lessonsSource = readFileSync(new URL('../js/minecraft-lessons.js', import.meta.url), 'utf8');
const forcedLessonsSource = readFileSync(new URL('../js/minecraft-lessons-20260820-stairs.js', import.meta.url), 'utf8');

const sandbox = { window: {}, console };
vm.createContext(sandbox);
vm.runInContext(lessonsSource, sandbox);
const lessons = sandbox.window.MINECRAFT_KIDS_LESSONS;
const forcedSandbox = { window: {}, console };
vm.createContext(forcedSandbox);
vm.runInContext(forcedLessonsSource, forcedSandbox);
const forcedLessons = forcedSandbox.window.MINECRAFT_KIDS_LESSONS;

assert.equal(lessons.length, 15, 'Minecraft course should expose 15 lessons');
const lessonOne = lessons.find((lesson) => lesson.id === 1);
assert.equal(lessonOne.programmingExercises.length, 2, 'lesson 1 should expose exactly two learner missions');
assert.ok(lessonOne.programmingExercises[0].title.includes('שלושה בלוקים') && lessonOne.programmingExercises[0].studentPrompt.includes('3 בלוקים'), 'lesson 1 mission 1 should require a 3-block tower');
assert.ok(lessonOne.programmingExercises[1].title.includes('שלושה אריחים') && lessonOne.programmingExercises[1].studentPrompt.includes('המגדל ממשימה 1') && lessonOne.programmingExercises[1].studentPrompt.includes('3 אריחי שביל'), 'lesson 1 mission 2 should require a 3-tile path beside the existing tower');
assert.ok(playHtml.includes('משימה 1 דורשת מגדל של 3 בלוקים') && playHtml.includes("state.lessonOneBlocks >= 3 && dirCount('up') >= 2"), 'lesson 1 mission 1 validation should require 3 blocks and two upward moves');
assert.ok(playHtml.includes('משימה 2 דורשת שהמגדל ממשימה 1 יישאר') && playHtml.includes("state.lessonOneBlocks >= 3 && placedCount('path') >= 3"), 'lesson 1 mission 2 validation should require existing tower plus 3 path tiles');
assert.ok(playHtml.includes('if (clearDrawing) state.lessonOneBlocks = 0'), 'lesson 1 tower counter should persist across reruns and reset only when drawing is cleared');
assert.ok(playHtml.includes('.world.lesson-one #lessonMissionBoard{display:block!important;width:230px;max-width:calc(100% - 32px);right:16px;left:auto;top:14px;}'), 'lesson 1 mission card should be positioned on the right side');

assert.ok(playHtml.includes('Lesson mission board cleanup 2026-08-30'), 'regular model lessons should hide the extra lesson mission board behind the model card');
assert.ok(playHtml.includes('const showLessonMissionBoard = missions.length && (lesson.id === 1 || lesson.id === 9 || lesson.id === 10 || lesson.id === 11)'), 'lesson 1 and dedicated mission-board lessons should show the in-world mission board');
assert.ok(playHtml.includes('.world.lesson-six #lessonMissionBoard') && playHtml.includes('display:none!important'), 'lesson 6 should not show the extra mission board rectangle behind the model card');

assert.ok(lessons.find((lesson) => lesson.id === 15).title === 'תערוכת מיינקראפט', 'lesson 15 should be a distinct exhibition/debug lesson, not a repeat of lesson 14');
assert.ok(lessons.find((lesson) => lesson.id === 15).goal.includes('שם, הסבר, בדיקה, תיקון, שדרוג והרצה'), 'lesson 15 goal should focus on exhibition process');
assert.ok(lessons.find((lesson) => lesson.id === 15).programmingExercises.some((exercise) => exercise.title.includes('כרטיס הסבר')), 'lesson 15 should include a project explanation card exercise');
assert.ok(playHtml.includes('15: [') && playHtml.includes('בחרו פרויקט לתערוכה') && playHtml.includes('שדרוג צריך לפחות 3') && playHtml.includes('להצגת הסיום צריך רצף מלא'), 'lesson 15 feedback should have detailed checks for exhibition/debug/presentation stages');

assert.ok(playHtml.includes('Model card restore 2026-08-30'), 'model card restore CSS should be present');

assert.ok(playHtml.includes('Pixel model restore 2026-08-30'), 'pixel model restore CSS should be present');
assert.ok(playHtml.includes('without block outlines') && playHtml.includes('.pixel-grid-model .model-cell{width:18px;height:18px;border:0!important;box-shadow:none!important'), 'lesson 9/11 pixel drawings should be seamless color shapes without visible block outlines');
assert.ok(playHtml.includes('function pixelGridHtml(model)') && playHtml.includes("shape.className = 'model-shape pixel-grid-art'") && playHtml.includes('pixelGridHtml(sourceModel)'), 'lesson 9/11 pixel drawings should render as visible HTML block grids instead of SVG-only drawings');
assert.ok(!playHtml.includes("shape.className = 'model-shape drawing-card pixel-art'"), 'pixel model cards should no longer depend on the SVG drawing-card renderer that can disappear');
assert.ok(playHtml.includes('.world.lesson-eleven .lesson-model-only') && playHtml.includes('.world.lesson-twelve .lesson-model-only') && playHtml.includes('.world.lesson-thirteen .lesson-model-only'), 'model cards should be visible for lessons 11, 12, and 13 as well as earlier model lessons');
assert.ok(playHtml.includes('.world.lesson-thirteen .garden-scene-card{background:transparent!important;border:0!important'), 'lesson 13 scene should be visually unified with the outer model card');
assert.ok(playHtml.includes('function missionRuleDefinitions()'), 'play page should define per-exercise mission checks');
assert.ok(playHtml.includes('Lesson 1 mission card 2026-08-30') && playHtml.includes('lesson.id !== 1 || index < 2'), 'lesson 1 mission card should be available and limited to choices 1/2');
assert.ok(playHtml.includes("type:'move_pet_right'") && playHtml.includes("case 'move_pet_right'"), 'lesson 6 pet movement alias blocks should be defined and runnable');
assert.ok(playHtml.includes('updatePointsStatus();') && playHtml.includes(`sizeBlocklyArea();
      workspace = Blockly.inject`), 'mission points should refresh and Blockly should be measured before injection');
assert.ok(playHtml.includes('function currentMissionRule(index)'), 'play page should select the current exercise rule');
assert.ok(playHtml.includes('return rules[index] || null;') && !playHtml.includes('return rules[index] || rules[0]'), 'current mission validation should not fall back to mission 1 or any other mission');
assert.ok(playHtml.includes('function modelChoiceSelectsMission()') && playHtml.includes('return [2, 4, 6, 8, 12].includes(lesson.id);'), 'lesson 2 model choices should sync the selected mission');
assert.ok(playHtml.includes('if (lesson.id === 9 || lesson.id === 11 || modelChoiceSelectsMission()) lessonMissionIndex = index;'), 'model-card lessons should update lessonMissionIndex when a model is selected');
assert.ok(playHtml.includes('if (lesson.id === 1) return Math.max(0, Math.min(1, lessonMissionIndex));'), 'lesson 1 selected mission index should be clamped to missions 1/2');
assert.ok(playHtml.includes('Lesson 1 strict mission card 2026-08-30') && playHtml.includes('.world.lesson-one .lesson-model-only{display:none!important;}'), 'lesson 1 should not show the generic model card or pager');
assert.ok(playHtml.includes('function missingMissionNote(index)'), 'play page should explain what is missing');
assert.ok(playHtml.includes('function normalizeBlockColor(color)'), 'play page should normalize Blockly color field values before drawing');
assert.ok(playHtml.includes("red:'red'"), 'red field values should stay red and not fall back to green');
assert.ok(playHtml.includes("'אדום':'red'"), 'Hebrew red values should normalize to red');
assert.ok(playHtml.includes('placeBlockFromCommand(block)'), 'place block execution should go through the safe command helper');
assert.ok(!playHtml.includes('function clearRunOutput()'), 'normal runs should remain cumulative; only the clear drawing button should reset the drawing');
assert.ok(playHtml.includes('return null;'), 'invalid color field values should not silently become green blocks');
assert.ok(!playHtml.includes("blockColorFromField(block, fallback = 'grass')"), 'invalid color field values must not default to grass');
assert.ok(playHtml.includes('function modelColorCounts(model)'), 'play page should derive required colors from visual models');
assert.ok(playHtml.includes('function hasRequiredModelColors(model'), 'play page should reject model exercises with wrong colors');
assert.ok(playHtml.includes('function conflictingColorOverlaps()'), 'play page should detect when a later green block covers an earlier red block in the same spot');
assert.ok(playHtml.includes('function frontFeetSpawnPosition(existingSelector)'), 'front-of-feet spawns should use a shared offset helper');
assert.ok(playHtml.includes('function funnyMobPosition()'), 'generic funny mob helper may still exist for other lessons');
assert.ok(playHtml.includes('function spawnPetPosition()'), 'pet should have a dedicated front-of-feet position helper');
assert.ok(playHtml.includes('state.steveX + 18 + offset'), 'funny mob and pet should spawn near David’s feet horizontally with a small offset for multiples');
assert.ok(playHtml.includes('state.steveY - 4 + (existing % 2) * 6'), 'funny mob and pet should overlap David’s feet slightly from the front');
assert.ok(!playHtml.includes("document.querySelectorAll('#world .mob').forEach(el => el.remove())"), 'funny mob spawning should allow multiple mobs in the same run');
assert.ok(!playHtml.includes("document.querySelectorAll('#world .pet').forEach(el => el.remove())"), 'pet spawning should allow multiple pets in the same run');
assert.ok(playHtml.includes("addEmoji('pet','🐶', spot.x, spot.y)"), 'pet spawning should add a visible pet icon');
assert.ok(playHtml.includes('.mob{z-index:7;font-size:2.85rem'), 'funny mob should be larger and in front of David’s feet');
assert.ok(playHtml.includes('@keyframes monster-wobble'), 'funny monster should wobble so it feels alive');
assert.ok(playHtml.includes('@keyframes monster-horns'), 'funny monster should animate horn-like marks');
assert.ok(!playHtml.includes("addEmoji('mob','🐌', 280, 86)"), 'funny mob must not spawn at a fixed center coordinate');
assert.ok(!playHtml.includes("addEmoji('mob','🐌', spot.x, spot.y)"), 'funny mob should no longer look like a cute snail');
assert.ok(playHtml.includes('function placedBlockColorCount()'), 'lesson 13 platform validation should count full block colors separately from path tiles');
assert.ok(playHtml.includes('בית גדול לכל החיות צריך'), 'lesson 13 mission 4 feedback should require a big shared pet house');
assert.ok(playHtml.includes("petCount() >= 3 && placedCount('block') >= 6"), 'lesson 13 mission 4 validation should require several pets and a larger build');
assert.ok(playHtml.includes("placedColorCount('red') >= 2"), 'lesson 13 mission 4 validation should require a red roof');
assert.ok(playHtml.includes('חלל פנימי פתוח ולבן לחיות'), 'lesson 13 mission 4 feedback should mention the open white interior');
assert.ok(playHtml.includes('גג אדום צמוד לבית עם שפיץ במרכז'), 'lesson 13 mission 4 feedback should mention the attached pointy red roof');
assert.ok(!playHtml.includes('13: [ { ok:() => s.spawnedMob || totalBuilding() >= 3'), 'lesson 13 should not pass only because a mob was spawned or any three building parts exist');
assert.ok(playHtml.includes('ירוק מעל אדום'), 'model feedback should explain overlapping wrong-color blocks');
assert.ok(playHtml.includes('חסר בלוק בצבע ${colorNames[color]'), 'model feedback should explain when required color blocks are missing');
assert.ok(playHtml.includes('יש צבע שלא שייך ל'), 'model feedback should explain when an unexpected color was used');
assert.ok(lessons.find((lesson) => lesson.id === 13).title === 'בית החיות של דוד', 'lesson 13 should be a pet-only building lesson');
assert.ok(lessons.find((lesson) => lesson.id === 13).programmingExercises.every((exercise) => exercise.studentPrompt.length <= 52), 'lesson 13 exercise prompts should stay concise because the model explains the task');
assert.ok(lessons.find((lesson) => lesson.id === 13).programmingExercises.some((exercise) => exercise.title.includes('כיסא לחיית המחמד')), 'lesson 13 should include a concise pet chair challenge');
assert.ok(playHtml.includes('כיסא לחיית מחמד נמוך מהצד צריך להיבנות בדיוק'), 'lesson 13 first mission feedback should match the low side-view pet chair requirements');
assert.ok(playHtml.includes('2 רגליים של בלוק אחד'), 'lesson 13 chair should require one block per leg');
assert.ok(playHtml.includes('function hasSideViewPetChair()'), 'lesson 13 first mission should validate the exact side-view pet chair shape');
assert.ok(!lessons.find((lesson) => lesson.id === 13).blocks.includes('spawn_funny_mob'), 'lesson 13 toolbox should not include the monster spawn block');
assert.ok(!lessons.find((lesson) => lesson.id === 13).programmingExercises.some((exercise) => JSON.stringify(exercise).includes('מפלצת')), 'lesson 13 exercise text should not mention monsters');
assert.ok(!forcedLessons.find((lesson) => lesson.id === 13).blocks.includes('spawn_funny_mob'), 'forced lesson 13 toolbox should not include the monster spawn block');
for (const sourceLesson of [lessons.find((lesson) => lesson.id === 13), forcedLessons.find((lesson) => lesson.id === 13)]) {
  assert.ok(!JSON.stringify(sourceLesson).includes('מפלצות'), 'lesson 13 should not mention monsters in any teacher/student text');
  assert.ok(!JSON.stringify(sourceLesson).includes('מפלצת'), 'lesson 13 should not mention a monster in any teacher/student text');
}
assert.ok(!playHtml.includes('גן משחקים צריך ספסל/נדנדה מחצאים, גדר קצרה, שביל, זמנו מפלצת מצחיקה'), 'lesson 13 old mission 4 monster feedback must be removed');
assert.ok(playHtml.includes('function hasLesson13PetSwing()'), 'lesson 13 final garden mission should validate the described swing requirements');
assert.ok(playHtml.includes('function namedPetCount()'), 'lesson 13 garden mission should count distinct named pets without requiring pixel-perfect placement');
assert.ok(playHtml.includes('נדנדה אדומה עם שני מושבים בקצוות'), 'lesson 13 final garden feedback should explain the two-seat swing model');
assert.ok(playHtml.includes('להיראות כמו נדנדה ושביל'), 'lesson 13 final garden feedback should emphasize visual shape, not only counts');
assert.ok(playHtml.includes('הגדר היא קישוט בלבד ולא חובה'), 'lesson 13 garden mission should not require a fence that may hide other objects');
assert.ok(!playHtml.includes("petCount() >= 2 && placedCount('half') >= 2 && placedCount('block') >= 3 && placedCount('path') >= 1 && s.saidTexts.length >= 2"), 'lesson 13 mission 4 should not have a hidden speech requirement');
assert.ok(!playHtml.includes('בית מפלצת שלם צריך'), 'lesson 13 old final monster feedback must be removed');
assert.ok(playHtml.includes('stats().petSpawns.push({ name:petName'), 'lesson 13 first mission should validate where the named pet was spawned');
assert.ok(lessons.find((lesson) => lesson.id === 13).programmingExercises.some((exercise) => exercise.title.includes('חזית גדר')), 'lesson 13 should include a 2D pet fence gate challenge');
assert.ok(playHtml.includes('function hasFrontFenceForPet()'), 'lesson 13 second mission should validate the 2D fence shape');
assert.ok(playHtml.includes('visibleBuildingCount() >= 4'), 'lesson 13 second mission should accept a flexible fence-like front without exact pet coordinates');
assert.ok(playHtml.includes('חזית גדר דו־ממדית צריכה חיית מחמד'), 'lesson 13 second mission feedback should explain the 2D fence requirements');
assert.ok(playHtml.includes('הכלב לא צריך להיות בדיוק בין בלוקים'), 'lesson 13 second mission should not fail because the pet is a little outside the detected fence bounds');
assert.ok(playHtml.includes('availablePlacedCount'), 'lesson 13 second mission should count visible world blocks, not only blocks created in the last run');
assert.ok(playHtml.includes('function visibleBuildingCount()'), 'lesson 13 second mission should not depend on a scoped helper from missionRuleDefinitions');
assert.ok(playHtml.includes('id="lessonMissionBoard"'), 'play page should show a mission board for exercise selection');
assert.ok(playHtml.includes("if (lesson.id !== 5)"), 'generic mission board should apply beyond lesson 7, while lesson 5 keeps its gate board');

const lessonNine = lessons.find((lesson) => lesson.id === 9);
const forcedLessonNine = forcedLessons.find((lesson) => lesson.id === 9);
assert.equal(lessonNine.title, 'מציור לדגם בלוקים', 'lesson 9 should teach translating whole drawings into block models');
assert.equal(lessonNine.durationMinutes, 75, 'lesson 9 should fill more than an hour');
assert.equal(lessonNine.programmingExercises.length, 4, 'lesson 9 should have three model-matching drawing missions plus one personal challenge');
assert.ok(lessonNine.programmingExercises.some((exercise) => exercise.title.includes('ציור אישי')), 'lesson 9 should end with a personal drawing translation challenge');
assert.deepEqual(
  [forcedLessonNine.title, forcedLessonNine.durationMinutes, forcedLessonNine.programmingExercises.length],
  [lessonNine.title, lessonNine.durationMinutes, lessonNine.programmingExercises.length],
  'forced lesson cache should match the updated lesson 9 data'
);
assert.ok(playHtml.includes('drawing-card'), 'lesson 9 should display whole drawings rather than square-grid models');
assert.ok(playHtml.includes('function lessonNineModelForMission'), 'lesson 9 feedback should map each mission to the visible drawing model');
assert.ok(playHtml.includes('function lessonNineModelMatches'), 'lesson 9 feedback should compare the learner build shape to the visible drawing model');
assert.ok(playHtml.includes('missingLessonNineModelNote'), 'lesson 9 feedback should explain which model colors or parts are missing');
assert.ok(playHtml.includes('finalParts = new Map'), 'lesson 9 shape check should count final visible parts, not every placement command');
assert.ok(playHtml.includes('function selectedExerciseIndex()') && playHtml.includes('return lessonMissionIndex;'), 'lesson 9 validation should follow the selected mission, not a stale model index');

assert.ok(playHtml.includes('minecraftKidsMissionPoints:v1'), 'mission points should persist in localStorage across lesson pages');
assert.ok(playHtml.includes('function awardMissionPoint'), 'successful missions should award a point only once');
assert.ok(playHtml.includes('נקודות בשיעור') && playHtml.includes('נקודות בכל השיעורים'), 'play page should show lesson and course point totals');
assert.ok(playHtml.includes('Lesson 2 feedback compact fix 2026-08-30'), 'mission feedback compact CSS should prevent short feedback from stretching into a huge panel');
assert.ok(playHtml.includes('Final feedback compact override 2026-08-30'), 'final responsive override should keep mission feedback content-sized after later CSS rules');
assert.ok(playHtml.includes('Scroll safety 2026-08-30'), 'responsive layout should allow scrolling instead of cropping the world image');
assert.ok(playHtml.includes('No-gap feedback/world layout 2026-08-30'), 'feedback and world rows should be content-sized to avoid a blank gap after run');
assert.ok(playHtml.includes('Split-panel scrolling 2026-08-30'), 'desktop scrolling should be isolated to the run/world panel instead of the whole page');
assert.ok(playHtml.includes('resetWorld({ clearDrawing:false, resetPlayer:true, keepFeedback:true })'), 'normal runProgram reruns should keep previous drawing until the clear drawing button is clicked');
assert.ok(playHtml.includes('function clearDrawing()') && playHtml.includes('resetWorld({ clearDrawing:true, resetPlayer:true });'), 'only the clear drawing button should remove the accumulated drawing');
assert.ok(playHtml.includes('Run-panel scrollbar restore 2026-08-30'), 'desktop run panel should keep its own scrollbar after split-panel layout changes');
assert.ok(!playHtml.includes('lesson.id === 3 && !extraClass'), 'lesson 3 should not auto-step David upward after placing a block');
assert.ok(playHtml.includes('lessonMissionIndex = pixelIndex'), 'lesson 3 pixel model choice should stay synced with mission choice');
assert.ok(playHtml.includes('evaluateProgramResultWithoutDrawingSideEffects()'), 'lesson 3 mission checking must not add visual blocks at the end of a run');
assert.ok(!playHtml.includes('Lesson 3 remove confusing green square 2026-08-30'), 'lesson 3 should not change David shirt as a workaround');
assert.ok(playHtml.includes('function removeLessonThreeStrayGreenBlocks()'), 'lesson 3 should remove unintended green blocks that overlap David after a run');
assert.ok(playHtml.includes('modelNeedsGreen'), 'lesson 3 stray green cleanup should not remove legitimate green from green models such as the flower');
assert.ok(playHtml.includes('state.runStats.placed = state.runStats.placed.filter'), 'stray green cleanup should also remove the block from mission-check stats so feedback is clear');
assert.ok(playHtml.includes('Lesson 13 model visibility restore 2026-08-30'), 'lesson 13 mission model drawing should stay visible after layout changes');
assert.ok(playHtml.includes('Lesson 13 centered block models 2026-08-30'), 'lesson 13 models should be centered in the card between title and lesson text');
assert.ok(playHtml.includes('pet(82, 66') && playHtml.includes('pet(104, 66') && playHtml.includes('pet(126, 66'), 'lesson 13 task 4 pets should be inside the house, above the floor');
assert.ok(playHtml.includes('Playground for pets') && playHtml.includes('playground-scene'), 'lesson 13 task 5 should have a visible centered playground model');
assert.ok(playHtml.includes('bench touches the green path') && playHtml.includes("block(4, 7.5, 8, 1, '#ffd166')"), 'lesson 13 task 5 bench seat/back should align on its legs and touch the green path');
assert.ok(playHtml.includes('playground-scene') && playHtml.includes('one red half-block seat on each side') && playHtml.includes('full-height purple block'), 'lesson 13 task 5 playground model should match the user-built swing with one half-block seat per side and a full purple block');
assert.ok(playHtml.includes("block(5, 9.5, 1, 1.05, '#7c4a21')") && playHtml.includes("block(16.05, 9.55, 1.9, 1, '#a855f7')"), 'lesson 13 task 5 bench support and full-height purple swing block should visually touch the green path from above');
assert.ok(playHtml.includes("halfBlock(14, 7.85, 5.9, '#ef4444')") && playHtml.includes("halfBlock(14, 6.8, 1.9, '#ef4444')") && playHtml.includes("halfBlock(18, 6.8, 1.9, '#ef4444')"), 'lesson 13 task 5 swing should show one red half-block seat on each side and a red connector row');
assert.ok(playHtml.includes('html-scene') && playHtml.includes('scene-part') && playHtml.includes('scene-canvas'), 'lesson 13 should render stable visible block-model parts in the middle of the card');
assert.ok(!playHtml.includes("playground-scene\" aria-hidden=\"true\"><div class=\"scene-canvas\">${parts.join('')}${label('גן משחקים לחיות')}"), 'lesson 13 task 5 should not overlay an internal label on top of the model');
assert.ok(playHtml.includes('scene-half-block') && playHtml.includes("pet(134, 52, '🐱')") && playHtml.includes("pet(170, 52, '🐶')"), 'lesson 13 task 5 pets should stand directly above the single half-block swing seats');
assert.ok(playHtml.includes('Blockly layout restore 2026-08-30') && playHtml.includes('Blockly.svgResize') && !playHtml.includes('enableBlocklyCommandScroll'), 'Blockly should keep its own internal toolbox/flyout display while still resizing in the fixed split layout');
assert.ok(playHtml.includes('removeLessonThreeStrayGreenBlocks();'), 'lesson 3 stray green cleanup should run before feedback');
assert.ok(!playHtml.includes('pixel-art-finished .player'), 'lesson 3 should not hide David as a workaround for extra blocks');
assert.ok(playHtml.includes('המשימה הזו כבר הושלמה בעבר'), 'repeat completions should not award duplicate points');
assert.ok(playHtml.includes('minecraft-lessons-20260820-stairs.js?v=20260830-lesson5-four-missions-v123'), 'preview should force a fresh cache key in the browser');
assert.ok(playHtml.includes("drawing:'garden-scene'"), 'lesson 13 should show a Minecraft-style square garden model without visible block outlines');
assert.ok(playHtml.includes('שביל ירוק, ספסל ונדנדה לחיות'), 'lesson 13 garden model should name the path, bench, and pet swing');
assert.ok(playHtml.includes('function lesson13MissionSceneHtml(index)'), 'lesson 13 should render a small model for every task');
assert.ok(playHtml.includes('Pet climbing stand') && playHtml.includes('מתקן טיפוס לחיה'), 'lesson 13 task 3 should be a completely different pet climbing stand model');
assert.ok(playHtml.includes('מתקן טיפוס לחיה צריך שטיח ירוק') && playHtml.includes("dirCount('up') >= 2"), 'lesson 13 task 3 feedback should validate the climbing stand, not food/water');
assert.ok(!playHtml.includes('תחנת חטיפים ומים צריכה') && !playHtml.includes('פינת אוכל לחיה'), 'lesson 13 task 3 should not remain the old food/water station');
assert.ok(playHtml.includes('open white interior for pets') && playHtml.includes('בית גדול לחיות'), 'lesson 13 task 4 model should show an open white interior with roof and grass');
assert.ok(playHtml.includes('brown floor aligned with the post bases'), 'lesson 13 task 4 model should align the brown house floor with the post bases');
assert.ok(playHtml.includes("slab(4, 8, 2, '#22c55e')") && playHtml.includes("slab(14, 8, 2, '#22c55e')"), 'lesson 13 task 4 should show upper green path segments on both sides of the house');
assert.ok(playHtml.includes("slab(3, 9, 14, '#22c55e')"), 'lesson 13 task 4 should keep the lower green path as one continuous line below the house');
assert.ok(playHtml.includes('lesson13MissionSceneHtml(lessonMissionIndex)'), 'lesson 13 model should change with the selected task');
assert.ok(playHtml.includes('כיסא לחיה') && playHtml.includes('גדר קדמית') && playHtml.includes('מתקן טיפוס לחיה') && playHtml.includes('בית גדול לחיות') && playHtml.includes('playground-scene'), 'lesson 13 should include compact visible models for tasks 1-5 without overlaying text on task 5');
assert.ok(playHtml.includes("block(9, 2, 2, 1, '#ef4444')"), 'lesson 13 task 4 roof should have a red point at the top');
assert.ok(!playHtml.includes("block(8, 5, 4, 1, '#ffd166')"), 'lesson 13 task 4 should not keep the extra gold roof line');
assert.ok(playHtml.includes("slab(7, 8, 6, '#9b6a3b')"), 'lesson 13 task 4 should include a low wooden floor aligned with the first post blocks');
assert.ok(!playHtml.includes("block(7, 8, 6, 1, '#9b6a3b')"), 'lesson 13 task 4 should not show a full brown block line inside the open white house interior');
assert.ok(playHtml.includes('gold seat'), 'lesson 13 garden model should document the gold bench seat row');
assert.ok(playHtml.includes("block(3, 9.5, 9, 1, '#ffd166')"), 'lesson 13 model bench lower seat row should be gold');
assert.ok(playHtml.includes('no extra green pads between objects and grass'), 'lesson 13 task 5 model should not add separate green pads between objects and path');
assert.ok(playHtml.includes("pathTile(1, 11, 28"), 'lesson 13 task 5 path should be raised to meet the lowered bench and swing');
assert.ok(playHtml.includes("block(5, 10.5, 1, 1"), 'lesson 13 task 5 bench legs should be one block high and touch the lowered seat');
assert.ok(playHtml.includes("block(21, 10.5, 2, 1.5"), 'lesson 13 task 5 purple swing support should be extended to reach the path');
assert.ok(!playHtml.includes("block(21, 12, 2, 1, '#22c55e')"), 'lesson 13 task 5 should not use a separate green pad under the swing');
assert.ok(playHtml.includes("block(5, 10.5, 1, 1"), 'lesson 13 model bench supports should be one block high');
assert.ok(playHtml.includes("modelPager.querySelectorAll('.lesson-mission-choice')"), 'lesson 13 mission buttons inside the model card should be clickable after re-render');
assert.ok(playHtml.includes('ציור הבית'), 'lesson 9 feedback should validate the house drawing model for mission 2');
assert.ok(playHtml.includes('ציור היהלום'), 'lesson 9 feedback should validate the diamond drawing model');
assert.ok(!playHtml.includes('תרגיל 2 — דגל'), 'lesson 9 mission 2 title must not mention the flag');
assert.ok(!playHtml.includes('משימה 2: הסתכלו על ציור הדגל'), 'lesson 9 mission 2 prompt must not mention the flag');
assert.ok(!playHtml.includes('בלי רשת'), 'lesson 9 visible copy should not use confusing grid wording');
assert.ok(!playHtml.includes('בלי קווי רשת'), 'lesson 9 visible copy should not use confusing grid-line wording');
assert.ok(!playHtml.includes('איזה ציור תרגמתם'), 'lesson 9 should not require writing which drawing was translated');
assert.ok(playHtml.includes('ציור אישי צריך לפחות 8 חלקים'), 'lesson 9 final feedback should require a substantial personal drawing model');

const lessonEleven = lessons.find((lesson) => lesson.id === 11);
const forcedLessonEleven = forcedLessons.find((lesson) => lesson.id === 11);
assert.equal(lessonEleven.title, 'דגמי תפוחים מבלוקים', 'lesson 11 should become apple-themed block model missions');
assert.equal(lessonEleven.programmingExercises.length, 4, 'lesson 11 should have four drawing-model collection missions');
assert.equal(
  Array.from(lessonEleven.programmingExercises, (exercise) => exercise.title).join(' | '),
  'תרגיל 1 — שדה תפוחים | תרגיל 2 — שלט פתיחה | תרגיל 3 — שביל איסוף | תרגיל 4 — גביע ניצחון',
  'lesson 11 visible exercise titles should match the drawing models'
);
assert.deepEqual(
  [forcedLessonEleven.title, forcedLessonEleven.programmingExercises.length],
  [lessonEleven.title, lessonEleven.programmingExercises.length],
  'forced lesson cache should match the updated lesson 11 data'
);
assert.ok(playHtml.includes("11: [\n        { level:'ציור שדה תפוחים'"), 'lesson 11 should display drawing-source models');
assert.ok(playHtml.includes('function lessonElevenModelForMission'), 'lesson 11 feedback should map each mission to its visible drawing model');
assert.ok(playHtml.includes("lessonNineModelMatches(lessonElevenModelForMission(1))"), 'lesson 11 feedback should exactly validate the sign model');
assert.ok(playHtml.includes("lessonNineModelMatches(lessonElevenModelForMission(2))"), 'lesson 11 feedback should exactly validate the path model including path slabs');
assert.ok(playHtml.includes("lessonNineModelMatches(lessonElevenModelForMission(3))"), 'lesson 11 feedback should exactly validate the trophy model');
assert.ok(!playHtml.includes('הפעילו את בלוק איסוף 5 תפוחים'), 'lesson 11 feedback should not require a separate apple-game block');
assert.ok(lessonEleven.programmingExercises[2].studentPrompt.includes('5 אריחי שביל ירוקים'), 'lesson 11 exercise 3 should explicitly require path slabs');
assert.ok(!playHtml.includes('מסתכלים על הציור מימין'), 'lesson 11/9 instructions should not point to a fixed right-side drawing location');
assert.ok(!playHtml.includes('כרטיס ציור המקור'), 'drawing missions should not refer to an unclear source drawing card');
assert.ok(playHtml.includes('mission-source-drawing'), 'lesson 11 should embed the visible drawing example inside the mission card');
assert.ok(playHtml.includes('בונים בדיוק לפי הדוגמה: אותו מיקום, צבע וסוג חלק'), 'lesson 11 instructions should clearly require an exact build');
assert.ok(!playHtml.includes('בהתחלה או בסוף, העיקר שיהיה מחובר'), 'lesson 11 instructions should not discuss a separate apple block');
assert.ok(playHtml.includes('מצליחים רק כשהבנייה זהה לדוגמה'), 'lesson 11 instructions should explain strict exact-match success');

const rulesBodyMatch = playHtml.match(/const rules = \{([\s\S]*?)\n\s*\};\n\s*return rules;/);
assert.ok(rulesBodyMatch, 'mission rules object should be present');
const rulesBody = rulesBodyMatch[1];

for (const lesson of lessons) {
  assert.ok((lesson.programmingExercises || []).length >= (lesson.id === 1 ? 2 : 3), `Lesson ${lesson.id} should have visible programming exercises`);
  assert.match(rulesBody, new RegExp(`\\n\\s*${lesson.id}: \\[`, 'm'), `Lesson ${lesson.id} should have dedicated mission feedback rules`);
}

for (const phrase of [
  'משימה 1 דורשת מגדל של 3 בלוקים',
  'זמנו את פיקסל',
  'הפעילו מזג אוויר גשם',
  'אם עומדים על היהלום',
  'השתמשו בבלוק בנה מבוך קטן',
  'זמנו חיית מחמד',
  'משפט הצגה'
]) {
  assert.ok(playHtml.includes(phrase), `Feedback should include learner-facing hint: ${phrase}`);
}

console.log('minecraft mission feedback tests passed');

assert.ok(!playHtml.includes('כפתור המשימה לא היה מסומן'), 'lesson 13 should not complete mission 2 when another mission is selected');

assert.ok(playHtml.includes('state.petsByName'), 'named pet summons should reuse and move an existing pet with the same name');
assert.ok(playHtml.includes('pet.dataset.name = petName'), 'named pets should store their name in the DOM');
assert.ok(playHtml.includes('pet-name'), 'named pets should show their name label');

assert.ok(playHtml.includes("שביל צבעוני שמוביל אל השער — משתמשים באריחי שביל בלבד, לא בבלוקים שלמים"), 'gate mission 3 instructions should say to use path tiles only');
assert.ok(playHtml.includes("availablePlacedCount('path') >= 3 && uniquePathColors() >= 2"), 'gate mission 3 should require path tiles, not full blocks');
assert.ok(playHtml.includes('function uniquePathColors()'), 'gate mission 3 should count unique path tile colors');
assert.ok(!playHtml.includes('placedCount() >= 3 && uniqueColors() >= 2'), 'gate mission 3 should not accept any 3 blocks/parts as a path');

const lessonFive = forcedLessons.find(lesson => lesson.id === 5);
assert.ok(lessonFive.blocks.includes('place_path'), 'lesson 5 should expose path tile block for colorful path mission');
assert.ok(lessonFive.blocks.includes('place_block'), 'lesson 5 should still expose full blocks for the gate missions');

assert.ok(playHtml.includes("{ title:'4. עוקפים את השער'") && !playHtml.includes("{ title:'5. מעבר סודי'"), 'lesson 5 should have exactly four gate missions and no duplicate fifth mission');
assert.ok(!playHtml.includes('index === 4 && completedGateEntryMission() && gateWasBypassed()'), 'lesson 5 should not keep scoring logic for removed mission 5');
assert.ok(!playHtml.includes("צריך גם מעבר דרך השער וגם עקיפה/תנועה בעומק סביבו"), 'lesson 5 should not keep feedback for removed mission 5');
assert.ok(!lessonsSource.includes('משימה 5: דוד מפעיל את הכדור הסגול'), 'lesson 5 slides/lesson data should not include removed mission 5');
