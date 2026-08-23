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
assert.ok(playHtml.includes('function missionRuleDefinitions()'), 'play page should define per-exercise mission checks');
assert.ok(playHtml.includes('function currentMissionRule(index)'), 'play page should select the current exercise rule');
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
assert.ok(playHtml.includes('ירוק מעל אדום'), 'model feedback should explain overlapping wrong-color blocks');
assert.ok(playHtml.includes('חסר בלוק בצבע ${colorNames[color]'), 'model feedback should explain when required color blocks are missing');
assert.ok(playHtml.includes('יש צבע שלא שייך ל'), 'model feedback should explain when an unexpected color was used');
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
assert.ok(playHtml.includes('function selectedExerciseIndex(){ return lesson.id === 5 ? gateMissionIndex : lessonMissionIndex; }'), 'lesson 9 validation should follow the selected mission, not a stale model index');
assert.ok(playHtml.includes('minecraft-lessons-20260820-stairs.js?v=20260823-lesson11-no-path-in-task2'), 'lesson data fixes should force a fresh cache key in the browser');
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
  assert.ok((lesson.programmingExercises || []).length >= 3, `Lesson ${lesson.id} should have visible programming exercises`);
  assert.match(rulesBody, new RegExp(`\\n\\s*${lesson.id}: \\[`, 'm'), `Lesson ${lesson.id} should have dedicated mission feedback rules`);
}

for (const phrase of [
  'הניחו לפחות בלוק אחד',
  'זמנו את פיקסל',
  'הפעילו מזג אוויר גשם',
  'אם עומדים על היהלום',
  'השתמשו בבלוק בנה מבוך קטן',
  'זמנו מפלצת מצחיקה',
  'משפט הצגה'
]) {
  assert.ok(playHtml.includes(phrase), `Feedback should include learner-facing hint: ${phrase}`);
}

console.log('minecraft mission feedback tests passed');
