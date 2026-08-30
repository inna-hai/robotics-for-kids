import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const playHtml = readFileSync(new URL('../minecraft-play.html', import.meta.url), 'utf8');
const lessonsSource = readFileSync(new URL('../js/minecraft-lessons.js', import.meta.url), 'utf8');
const forcedLessonsSource = readFileSync(new URL('../js/minecraft-lessons-20260820-stairs.js', import.meta.url), 'utf8');

function loadLessons(source) {
  const sandbox = { window: {}, console };
  vm.createContext(sandbox);
  vm.runInContext(source, sandbox);
  return sandbox.window.MINECRAFT_KIDS_LESSONS;
}

const lessons = loadLessons(lessonsSource);
const forcedLessons = loadLessons(forcedLessonsSource);
assert.equal(lessons.length, 15, 'main lesson file should expose 15 lessons');
assert.equal(forcedLessons.length, 15, 'forced lesson file should expose 15 lessons');

for (const id of Array.from({ length: 15 }, (_, index) => index + 1)) {
  const lesson = lessons.find(item => item.id === id);
  const forced = forcedLessons.find(item => item.id === id);
  assert.ok(lesson, `lesson ${id} should exist in main lessons`);
  assert.ok(forced, `lesson ${id} should exist in forced lessons`);
  assert.ok(Array.isArray(lesson.blocks) && lesson.blocks.length >= 2, `lesson ${id} should expose toolbox blocks`);
  assert.ok(Array.isArray(forced.blocks) && forced.blocks.length >= 2, `forced lesson ${id} should expose toolbox blocks`);
  assert.ok(Array.isArray(lesson.programmingExercises) && lesson.programmingExercises.length >= 1, `lesson ${id} should have programming exercises`);
}

const requiredDomIds = [
  'blocklyDiv',
  'lessonMissionBoard',
  'modelShape',
  'pixelShape',
  'missionFeedback',
  'lessonPointsLabel',
  'coursePointsLabel',
  'world'
];
for (const id of requiredDomIds) {
  assert.ok(playHtml.includes(`id="${id}"`), `play page should include #${id}`);
}

assert.ok(playHtml.includes('Blockly.inject(\'blocklyDiv\'') || playHtml.includes('Blockly.inject("blocklyDiv"'), 'Blockly should be injected into #blocklyDiv');

const definedBlockTypes = new Set([...playHtml.matchAll(/type:'([^']+)'/g)].map(match => match[1]));
for (const [sourceName, course] of [['main', lessons], ['forced', forcedLessons]]) {
  for (const lesson of course) {
    for (const blockType of lesson.blocks || []) {
      assert.ok(definedBlockTypes.has(blockType), `${sourceName} lesson ${lesson.id} toolbox block ${blockType} should be defined before Blockly.inject`);
    }
  }
}
assert.ok(playHtml.includes("case 'move_pet_right'") && playHtml.includes("case 'move_pet_left'") && playHtml.includes("case 'move_pet_up'") && playHtml.includes("case 'move_pet_down'"), 'direction-specific pet movement aliases should run correctly');
assert.ok(playHtml.includes('Blockly.svgResize(workspace)'), 'Blockly should resize after layout changes');
assert.ok(!playHtml.includes('enableBlocklyCommandScroll'), 'page should not override Blockly internal scrolling with a custom wheel handler');
assert.ok(playHtml.includes("const MISSION_POINTS_STORAGE_KEY = 'minecraftKidsMissionPoints:v1'"), 'mission points key should remain stable and not reset saved points');

assert.ok(!playHtml.includes('minecr…s:v1'), 'mission points key must never be truncated with an ellipsis');
assert.ok(playHtml.includes('Blockly measured layout 2026-08-30'), 'Blockly editor should have a late visible guard against CSS collapse');
assert.ok(playHtml.includes('#blocklyDiv .blocklyToolboxDiv{visibility:visible!important;}'), 'Blockly toolbox should not be hidden by page CSS');
assert.ok(playHtml.includes('.blockly-area{flex:1 1 auto;min-height:320px;position:relative;overflow:hidden}#blocklyDiv{height:100%;min-height:320px;width:100%}'), 'base Blockly area sizing should not collapse to zero height');
assert.ok(playHtml.includes('updatePointsStatus();') && playHtml.includes(`sizeBlocklyArea();\n      workspace = Blockly.inject`), 'saved points should render and Blockly should be measured before injection');

assert.ok(playHtml.includes('function workspaceHasBlocks()'), 'page should detect empty saved Blockly workspaces');
assert.ok(playHtml.includes('function restoreStarterWorkspace()'), 'page should restore starter blocks when saved workspace is empty or corrupt');
assert.ok(playHtml.includes('if (!workspaceHasBlocks())'), 'empty saved workspace should not leave the coding area blank');
assert.ok(playHtml.includes('function scheduleBlocklyLayoutRefresh()') && playHtml.includes('[60, 180, 420'), 'Blockly should resize after layout settles so trash/toolbox positions are correct');

assert.ok(playHtml.includes('function sizeBlocklyArea()'), 'Blockly should get an explicit pixel height before injection');
assert.ok(playHtml.includes(`sizeBlocklyArea();
      workspace = Blockly.inject`), 'Blockly area must be measured before Blockly injects');
assert.ok(playHtml.includes('function installBlocklyResizeWatcher()') && playHtml.includes('ResizeObserver'), 'Blockly should resize when the code panel size changes');
assert.ok(playHtml.includes('workspace.resizeContents') && playHtml.includes('workspace.scrollCenter'), 'Blockly contents should be remeasured and centered after resize');

const modelLessons = [2, 4, 6, 8, 9, 10, 11, 12, 13];
for (const id of modelLessons) {
  const className = `lesson-${['zero','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen'][id]}`;
  assert.ok(playHtml.includes(`.world.${className} .lesson-model-only`), `lesson ${id} should show the model card`);
}

const regularModelLessonsWithoutMissionBoard = [2, 4, 6, 8, 12, 13];
for (const id of regularModelLessonsWithoutMissionBoard) {
  const className = `lesson-${['zero','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen'][id]}`;
  assert.ok(playHtml.includes(`.world.${className} #lessonMissionBoard`), `lesson ${id} should hide the extra mission board`);
}
assert.ok(playHtml.includes('const showLessonMissionBoard = missions.length && (lesson.id === 1 || lesson.id === 9 || lesson.id === 10 || lesson.id === 11)'), 'only dedicated mission-board lessons should show the in-world mission board');

assert.ok(playHtml.includes('Lesson 1 mission card 2026-08-30'), 'lesson 1 should show a dedicated mission 1/2 card');
assert.ok(playHtml.includes('Lesson 1 strict mission card 2026-08-30') && playHtml.includes('.world.lesson-one .lesson-model-only{display:none!important;}'), 'lesson 1 should hide generic model card');
assert.equal(forcedLessons.find(lesson => lesson.id === 1).programmingExercises.length, 2, 'lesson 1 should have exactly two mission choices');
assert.ok(forcedLessons.find(lesson => lesson.id === 1).programmingExercises[0].studentPrompt.includes('3 בלוקים'), 'lesson 1 first mission instructions should require three blocks');
assert.ok(forcedLessons.find(lesson => lesson.id === 1).programmingExercises[1].studentPrompt.includes('3 אריחי שביל') && forcedLessons.find(lesson => lesson.id === 1).programmingExercises[1].studentPrompt.includes('המגדל ממשימה 1'), 'lesson 1 second mission should add 3 path tiles beside the existing tower');
assert.ok(playHtml.includes('if (clearDrawing) state.lessonOneBlocks = 0'), 'lesson 1 tower state should persist between reruns and clear only with drawing reset');
assert.ok(playHtml.includes('right:16px;left:auto;top:14px'), 'lesson 1 mission card should sit on the right side like other instruction cards');
assert.ok(playHtml.includes('lesson.id === 1 || lesson.id === 9 || lesson.id === 10 || lesson.id === 11'), 'lesson 1 should be included in mission board rendering');
assert.ok(playHtml.includes('lesson.id !== 1 || index < 2'), 'lesson 1 mission card should expose only mission choices 1 and 2');

assert.ok(playHtml.includes('function pixelGridHtml(model)'), 'pixel models should use robust HTML rendering');
assert.ok(playHtml.includes('without block outlines'), 'pixel models should preserve no-outline visual intent');
assert.ok(playHtml.includes("shape.innerHTML = pixelGridHtml(model)"), 'pixel model cards should render non-empty HTML');
assert.ok(playHtml.includes("shape.innerHTML = lesson.id === 13 ? lesson13MissionSceneHtml(lessonMissionIndex) : gardenSceneHtml()"), 'garden-scene models should render non-empty HTML');

const rulesMatch = playHtml.match(/const rules = \{([\s\S]*?)\n      \};\n      return rules;/);
assert.ok(rulesMatch, 'mission rule definitions should be present');
assert.ok(playHtml.includes('return rules[index] || null;') && !playHtml.includes('return rules[index] || rules[0]'), 'mission checks should evaluate only the selected card');
assert.ok(playHtml.includes('function modelChoiceSelectsMission()'), 'model-driven lesson cards should be mission selectors too');
const rulesBody = rulesMatch[1];
for (let id = 1; id <= 15; id++) {
  assert.ok(new RegExp(`\\n\\s*${id}:\\s*\\[`).test(rulesBody), `lesson ${id} should have feedback/check rules`);
}

assert.ok(playHtml.includes('resetWorld({ clearDrawing:false, resetPlayer:true, keepFeedback:true })'), 'normal reruns should keep drawings');
assert.ok(playHtml.includes('function worldPlacedColorCounts()') && playHtml.includes('function placedColorCount(color)'), 'feedback should count visible accumulated color blocks');
assert.ok(playHtml.includes('function availablePlacedKindColorCounts()') && playHtml.includes('function hasRequiredModelParts(model'), 'model validation should track kind and color');
assert.ok(playHtml.includes('4: [') && playHtml.includes('hasRequiredModelParts(selectedBuildModel(0))'), 'lesson 4 model validation should check part kinds');
assert.ok(playHtml.includes('resetWorld({ clearDrawing:true, resetPlayer:true });'), 'clear drawing button should still clear drawings');
assert.ok(playHtml.startsWith('<!DOCTYPE html>'), 'minecraft-play.html must remain an HTML file, not be overwritten by a test/source file');
console.log('minecraft page smoke tests passed');

assert.ok(playHtml.includes('אריחי שביל בלבד') && playHtml.includes("availablePlacedCount('path') >= 3"), 'gate mission 3 should mention path tiles only and validate path tiles');

assert.ok(forcedLessons.find(lesson => lesson.id === 5).blocks.includes('place_path'), 'lesson 5 should include place_path because gate mission 3 requires path tiles');

assert.ok(!playHtml.includes("5. מעבר סודי") && !lessonsSource.includes('משימה 5: דוד מפעיל את הכדור הסגול'), 'lesson 5 should not show mission 5');
