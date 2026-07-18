import { readFileSync } from 'node:fs';
import { strict as assert } from 'node:assert';
import vm from 'node:vm';

const root = new URL('../', import.meta.url);
const read = path => readFileSync(new URL(path, root), 'utf8');

const dataCode = read('js/webcode-lessons.js');
const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(dataCode, sandbox);

const lessons = sandbox.window.WEBCODE_LESSONS;
assert.equal(Array.isArray(lessons), true, 'lessons array exists');
assert.ok(lessons.length >= 12, 'first twelve WebCode lessons exist');

const lesson = lessons[0];
assert.equal(lesson.durationMinutes, 90, 'lesson is framed as 90 minutes');
assert.ok(lesson.title.includes('Blockly אמיתי'), 'lesson has real Blockly page-builder title');
assert.ok(lesson.starter.html.includes('<button onclick="sayHello()">'), 'starter has working button');
assert.ok(lesson.starter.css.includes('border-radius'), 'starter includes visible styling');
assert.ok(lesson.starter.js.includes('getElementById("message")'), 'starter JS targets message id');
assert.ok(lesson.exercises.length >= 8, 'lesson includes many exercises');
assert.ok(lesson.lessonFlow.length >= 7, 'lesson includes full 90-minute guide flow');
assert.ok(lesson.vocabulary.some(v => v[0] === 'HTML'), 'vocabulary includes HTML');
assert.ok(lesson.vocabulary.some(v => v[0] === 'CSS'), 'vocabulary includes CSS');
assert.ok(lesson.vocabulary.some(v => v[0] === 'JavaScript'), 'vocabulary includes JavaScript');
assert.equal(lesson.mode, 'Real Blockly page builder', 'lesson 1 uses a real Blockly page builder');
assert.equal(lesson.realBlocklyBuilder, true, 'lesson 1 enables real Blockly workspace');
assert.ok(lesson.exercises.some(ex => ex.prompt.includes('גררו')), 'lesson 1 exercises require dragging blocks');

const lesson2 = lessons[1];
assert.equal(lesson2.durationMinutes, 90, 'lesson 2 is framed as 90 minutes');
assert.ok(lesson2.title.includes('סטודיו עיצוב'), 'lesson 2 focuses on real Blockly design studio');
assert.equal(lesson2.mode, 'Real Blockly design studio', 'lesson 2 uses real Blockly design studio mode');
assert.equal(lesson2.realBlocklyBuilder, true, 'lesson 2 enables real Blockly workspace');
assert.ok(lesson2.exercises.some(ex => ex.title.includes('Hover')), 'lesson 2 includes hover design exercise');
assert.ok(lesson2.exercises.length >= 8, 'lesson 2 includes many exercises');
assert.ok(lesson2.vocabulary.some(v => v[0] === 'hover'), 'lesson 2 vocabulary includes hover');

const lesson3 = lessons[2];
assert.equal(lesson3.durationMinutes, 90, 'lesson 3 is framed as 90 minutes');
assert.ok(lesson3.title.includes('כפתורים'), 'lesson 3 focuses on buttons');
assert.ok(lesson3.starter.html.includes('onclick="makeHappy()"'), 'lesson 3 has onclick event');
assert.ok(lesson3.starter.js.includes('classList.toggle("magic")'), 'lesson 3 includes classList toggle');
assert.ok(lesson3.exercises.length >= 8, 'lesson 3 includes many exercises');
assert.ok(lesson3.vocabulary.some(v => v[0] === 'onclick'), 'lesson 3 vocabulary includes onclick');

const lesson4 = lessons[3];
assert.equal(lesson4.durationMinutes, 90, 'lesson 4 is framed as 90 minutes');
assert.ok(lesson4.title.includes('מקשיב'), 'lesson 4 focuses on user input');
assert.ok(lesson4.starter.html.includes('id="nameInput"'), 'lesson 4 has name input');
assert.ok(lesson4.starter.js.includes('.value'), 'lesson 4 reads input value');
assert.ok(lesson4.exercises.length >= 8, 'lesson 4 includes many exercises');
assert.ok(lesson4.vocabulary.some(v => v[0] === 'input'), 'lesson 4 vocabulary includes input');

const lesson5 = lessons[4];
assert.equal(lesson5.durationMinutes, 90, 'lesson 5 is framed as 90 minutes');
assert.ok(lesson5.title.includes('חידון'), 'lesson 5 focuses on quiz building');
assert.ok(lesson5.starter.js.includes('if (answer === "CSS")'), 'lesson 5 includes if condition');
assert.ok(lesson5.starter.js.includes('else'), 'lesson 5 includes else branch');
assert.ok(lesson5.exercises.length >= 8, 'lesson 5 includes many exercises');
assert.ok(lesson5.vocabulary.some(v => v[0] === 'if'), 'lesson 5 vocabulary includes if');

const lesson6 = lessons[5];
assert.equal(lesson6.durationMinutes, 90, 'lesson 6 is framed as 90 minutes');
assert.ok(lesson6.title.includes('ניקוד'), 'lesson 6 focuses on scoring');
assert.ok(lesson6.starter.js.includes('let score = 0'), 'lesson 6 initializes score variable');
assert.ok(lesson6.starter.js.includes('score = score + 1'), 'lesson 6 increments score');
assert.ok(lesson6.exercises.length >= 8, 'lesson 6 includes many exercises');
assert.ok(lesson6.vocabulary.some(v => v[0] === 'variable'), 'lesson 6 vocabulary includes variable');

const lesson7 = lessons[6];
assert.equal(lesson7.durationMinutes, 90, 'lesson 7 is framed as 90 minutes');
assert.ok(lesson7.title.includes('קליקים'), 'lesson 7 focuses on click game');
assert.ok(lesson7.starter.js.includes('const target = 10'), 'lesson 7 has target score');
assert.ok(lesson7.starter.js.includes('score >= target'), 'lesson 7 checks win condition');
assert.ok(lesson7.exercises.length >= 8, 'lesson 7 includes many exercises');
assert.ok(lesson7.vocabulary.some(v => v[0] === 'target'), 'lesson 7 vocabulary includes target');

const lesson8 = lessons[7];
assert.equal(lesson8.durationMinutes, 90, 'lesson 8 is framed as 90 minutes');
assert.ok(lesson8.title.includes('טיימר'), 'lesson 8 focuses on timer');
assert.ok(lesson8.starter.js.includes('let timeLeft = 15'), 'lesson 8 initializes timeLeft');
assert.ok(lesson8.starter.js.includes('setInterval'), 'lesson 8 uses timer interval');
assert.ok(lesson8.exercises.length >= 8, 'lesson 8 includes many exercises');
assert.ok(lesson8.vocabulary.some(v => v[0] === 'timeLeft'), 'lesson 8 vocabulary includes timeLeft');

const lesson9 = lessons[8];
assert.equal(lesson9.durationMinutes, 90, 'lesson 9 is framed as 90 minutes');
assert.ok(lesson9.title.includes('מכשולים'), 'lesson 9 focuses on obstacles');
assert.ok(lesson9.starter.js.includes('let lives = 3'), 'lesson 9 initializes lives');
assert.ok(lesson9.starter.js.includes('lives <= 0'), 'lesson 9 checks game over');
assert.ok(lesson9.exercises.length >= 8, 'lesson 9 includes many exercises');
assert.ok(lesson9.vocabulary.some(v => v[0] === 'lives'), 'lesson 9 vocabulary includes lives');

const lesson10 = lessons[9];
assert.equal(lesson10.durationMinutes, 90, 'lesson 10 is framed as 90 minutes');
assert.ok(lesson10.title.includes('כוח מיוחד'), 'lesson 10 focuses on special power');
assert.ok(lesson10.starter.js.includes('let powerReady = true'), 'lesson 10 initializes power state');
assert.ok(lesson10.starter.js.includes('if (powerReady)'), 'lesson 10 checks power availability');
assert.ok(lesson10.exercises.length >= 8, 'lesson 10 includes many exercises');
assert.ok(lesson10.vocabulary.some(v => v[0] === 'powerReady'), 'lesson 10 vocabulary includes powerReady');

const lesson11 = lessons[10];
assert.equal(lesson11.durationMinutes, 90, 'lesson 11 is framed as 90 minutes');
assert.ok(lesson11.title.includes('מסך פתיחה'), 'lesson 11 focuses on screens');
assert.ok(lesson11.starter.js.includes('function showScreen'), 'lesson 11 includes screen switching');
assert.ok(lesson11.starter.html.includes('id="startScreen"'), 'lesson 11 has start screen');
assert.ok(lesson11.exercises.length >= 8, 'lesson 11 includes many exercises');
assert.ok(lesson11.vocabulary.some(v => v[0] === 'screen'), 'lesson 11 vocabulary includes screen');

const lesson12 = lessons[11];
assert.equal(lesson12.durationMinutes, 90, 'lesson 12 is framed as 90 minutes');
assert.ok(lesson12.title.includes('מיני־פרויקט'), 'lesson 12 is a mini project');
assert.ok(lesson12.starter.js.includes('function updateScreen'), 'lesson 12 consolidates screen updates');
assert.ok(lesson12.starter.js.includes('const target = 5'), 'lesson 12 has project target');
assert.ok(lesson12.exercises.length >= 8, 'lesson 12 includes many exercises');
assert.ok(lesson12.vocabulary.some(v => v[0] === 'project'), 'lesson 12 vocabulary includes project');

const hub = read('webcode.html');
assert.ok(hub.includes('WebCode Lab'), 'hub page exists');
assert.ok(hub.includes('webcode-play.html?lesson=1'), 'hub links to lesson 1');
assert.ok(hub.includes('webcode-slides.html?lesson=1'), 'hub links to guide slides');
assert.ok(hub.includes('גשר מ־Blockly לקוד') || hub.includes('Blockly'), 'hub explains Blockly-to-code direction');

const play = read('webcode-play.html');
assert.ok(play.includes('textarea id="htmlCode"'), 'play page has HTML editor');
assert.ok(play.includes('textarea id="cssCode"'), 'play page has CSS editor');
assert.ok(play.includes('textarea id="jsCode"'), 'play page has JS editor');
assert.ok(play.includes('לראות קוד שנוצר'), 'play page has explicit generated-code button');
assert.ok(play.includes('showGeneratedCode'), 'play page can open generated code panel for students');
assert.ok(play.includes('iframe id="preview"'), 'play page has live preview');
assert.ok(play.includes('lessonPanel'), 'play page wraps lesson text in a collapsible panel');
assert.ok(play.includes('toggleLessonPanel'), 'play page can collapse and expand lesson instructions');
assert.ok(play.includes('aria-expanded'), 'collapsible lesson panel is accessible');
assert.ok(play.includes('lessonToggleIcon') && play.includes('⌃') && play.includes('⌄'), 'collapse toggle uses standard chevron icons instead of plus/minus');
assert.ok(play.includes('lesson-collapsed'), 'collapsing instructions reallocates space to Blockly and preview sections');
assert.ok(play.includes('Blockly.svgResize'), 'collapsing instructions resizes Blockly after layout change');
assert.ok(play.includes('alignBlocklyStarterBlocksRight'), 'starter Blockly program is aligned to the right side of the workspace');
assert.ok(play.includes('safeRightEdge') && play.includes('blocklyToolboxCategoryGroup'), 'starter blocks align to free workspace edge without overlapping toolbox');
assert.ok(play.includes('checkExercise()'), 'play page has exercise checking');
assert.ok(play.includes('completedTitle'), 'check button keeps success feedback visible after running preview');
assert.ok(play.includes('webcode-error'), 'play page catches preview JavaScript errors');
assert.ok(play.includes('debugHint'), 'play page gives student-friendly syntax/debug hints');
assert.ok(play.includes('validateJavaScriptSyntax'), 'play page validates JavaScript syntax before preview injection');
assert.ok(play.includes('שגיאת סינטקס ב־JavaScript'), 'play page shows Hebrew syntax error feedback');
assert.ok(play.includes('https://unpkg.com/blockly/blockly.min.js'), 'play page loads real Blockly');
assert.ok(play.includes('Blockly.inject'), 'play page injects a real Blockly workspace');
assert.ok(play.includes('defineWebBuilderBlocks'), 'play page defines draggable Web builder blocks');
assert.ok(play.includes('webBuilderToolbox'), 'play page exposes a Blockly toolbox');
assert.ok(play.includes('web_card_shape') && play.includes('web_hover'), 'play page defines design studio blocks for lesson 2');
assert.ok(play.includes('סטודיו עיצוב'), 'play page toolbox includes design studio category');
assert.ok(play.includes('generateCodeFromBlockly'), 'play page generates HTML/CSS/JS from connected Blockly blocks');
assert.ok(play.includes('shareProject'), 'play page can create a share link for the student project');
assert.ok(play.includes('navigator.clipboard.writeText(shareUrl)'), 'share button copies only the public link');
assert.ok(play.includes('הקישור הציבורי הועתק'), 'share button confirms the public link was copied');
assert.ok(!play.includes('navigator.share'), 'share button does not open native share UI');
assert.ok(play.includes('webcode-share.html'), 'play page shares to a clean viewer page');
assert.ok(play.includes('renderBridgeBlocks'), 'play page keeps bridge blocks fallback for later lessons');
assert.ok(play.includes('applyBridgeBlock'), 'play page can apply bridge blocks into code');

const shared = read('webcode-share.html');
assert.ok(shared.includes('עמוד משותף'), 'shared project viewer page exists');
assert.ok(shared.includes('decodeSharePayload'), 'shared project viewer decodes link payload');
assert.ok(shared.includes('sandbox="allow-scripts"'), 'shared project viewer isolates student code in sandboxed iframe');
assert.ok(shared.includes('לבנות עמוד משלי'), 'shared project viewer invites friends to build their own page');

const slides = read('webcode-slides.html');
assert.ok(slides.includes('מהלך שיעור 90 דקות'), 'slides include 90-minute flow');
assert.ok(slides.includes('רצף תרגולים לשיעור'), 'slides include exercise sequence');
assert.ok(slides.includes('שימוש נכון ב־AI'), 'slides include AI guidance');

const grade4 = read('holon-scope-grade4.html');
assert.ok(grade4.includes('webcode.html'), 'grade 4 page links to WebCode hub');
assert.ok(grade4.includes('webcode-play.html?lesson=1'), 'grade 4 page links to first lesson');

console.log('webcode-course tests passed');
