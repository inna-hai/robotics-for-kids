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
assert.ok(lessons.length >= 6, 'first six WebCode lessons exist');

const lesson = lessons[0];
assert.equal(lesson.durationMinutes, 90, 'lesson is framed as 90 minutes');
assert.ok(lesson.title.includes('העמוד הראשון'), 'lesson has grade-appropriate first-page title');
assert.ok(lesson.starter.html.includes('<button onclick="sayHello()">'), 'starter has working button');
assert.ok(lesson.starter.css.includes('border-radius'), 'starter includes visible styling');
assert.ok(lesson.starter.js.includes('getElementById("message")'), 'starter JS targets message id');
assert.ok(lesson.exercises.length >= 8, 'lesson includes many exercises');
assert.ok(lesson.lessonFlow.length >= 7, 'lesson includes full 90-minute guide flow');
assert.ok(lesson.vocabulary.some(v => v[0] === 'HTML'), 'vocabulary includes HTML');
assert.ok(lesson.vocabulary.some(v => v[0] === 'CSS'), 'vocabulary includes CSS');
assert.ok(lesson.vocabulary.some(v => v[0] === 'JavaScript'), 'vocabulary includes JavaScript');

const lesson2 = lessons[1];
assert.equal(lesson2.durationMinutes, 90, 'lesson 2 is framed as 90 minutes');
assert.ok(lesson2.title.includes('מעצבים'), 'lesson 2 focuses on design');
assert.ok(lesson2.starter.css.includes('button:hover'), 'lesson 2 includes hover styling');
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

const hub = read('webcode.html');
assert.ok(hub.includes('WebCode Lab'), 'hub page exists');
assert.ok(hub.includes('webcode-play.html?lesson=1'), 'hub links to lesson 1');
assert.ok(hub.includes('webcode-slides.html?lesson=1'), 'hub links to guide slides');

const play = read('webcode-play.html');
assert.ok(play.includes('textarea id="htmlCode"'), 'play page has HTML editor');
assert.ok(play.includes('textarea id="cssCode"'), 'play page has CSS editor');
assert.ok(play.includes('textarea id="jsCode"'), 'play page has JS editor');
assert.ok(play.includes('iframe id="preview"'), 'play page has live preview');
assert.ok(play.includes('checkExercise()'), 'play page has exercise checking');
assert.ok(play.includes('completedTitle'), 'check button keeps success feedback visible after running preview');

const slides = read('webcode-slides.html');
assert.ok(slides.includes('מהלך שיעור 90 דקות'), 'slides include 90-minute flow');
assert.ok(slides.includes('רצף תרגולים לשיעור'), 'slides include exercise sequence');
assert.ok(slides.includes('שימוש נכון ב־AI'), 'slides include AI guidance');

const grade4 = read('holon-scope-grade4.html');
assert.ok(grade4.includes('webcode.html'), 'grade 4 page links to WebCode hub');
assert.ok(grade4.includes('webcode-play.html?lesson=1'), 'grade 4 page links to first lesson');

console.log('webcode-course tests passed');
