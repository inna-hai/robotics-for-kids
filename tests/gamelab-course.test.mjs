import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import vm from 'node:vm';

const hubHtml = fs.readFileSync(new URL('../gamelab.html', import.meta.url), 'utf8');
const playHtml = fs.readFileSync(new URL('../gamelab-play.html', import.meta.url), 'utf8');
const lessonsSource = fs.readFileSync(new URL('../js/gamelab-lessons.js', import.meta.url), 'utf8');
const slidesHtml = fs.readFileSync(new URL('../gamelab-slides.html', import.meta.url), 'utf8');

function loadLessons() {
  const context = { window: {} };
  vm.createContext(context);
  vm.runInContext(lessonsSource, context);
  return context.window;
}

function assertIncludes(haystack, needle) {
  assert.ok(haystack.includes(needle), `Expected to include: ${needle}`);
}

const data = loadLessons();

test('GameLab exposes a 15 lesson grade C game development path with 90 minute lessons', () => {
  assert.equal(data.GAMELAB_LESSONS.length, 15);
  assert.equal(JSON.stringify(data.GAMELAB_LESSONS.map(l => l.id)), JSON.stringify(Array.from({ length: 15 }, (_, i) => i + 1)));
  assert.ok(data.GAMELAB_LESSONS.every(l => l.durationMinutes === 90));
  assert.ok(data.GAMELAB_LESSONS.every(l => l.lessonFlow.length === 7));
  assert.ok(data.GAMELAB_LESSONS.every(l => l.blocks.includes('event_start') || l.blocks.includes('event_key') || l.blocks.includes('show_start_screen')));
  assertIncludes(data.GAMELAB_LESSONS[0].title, 'המשחק הראשון שלי');
  assertIncludes(data.GAMELAB_LESSONS[14].title, 'Game Demo Day');
});

test('GameLab includes character creation, game development concepts, and AI director challenges', () => {
  const concepts = data.GAMELAB_LESSONS.map(l => `${l.title} ${l.concept} ${l.story} ${l.mission}`).join('\n');
  for (const expected of ['דמות', 'ניקוד', 'חיים', 'אויב', 'Level Design', 'מפתח', 'טיימר', 'QA', 'Playtesting']) {
    assertIncludes(concepts, expected);
  }
  assert.ok(data.GAMELAB_AI_CHALLENGES.length >= 10);
  assert.ok(data.GAMELAB_DIRECTOR_FEEDBACK.length >= 8);
  assert.ok(data.GAMELAB_LESSONS.every(l => l.exercises.length === 6));
  assert.ok(data.GAMELAB_LESSONS.every(l => l.exercises.some(ex => ex.minutes === '82–90')));
  assert.ok(data.GAMELAB_LESSONS.every(l => l.exercises.some(ex => ex.title.includes('במאי המשחק'))));
});

test('GameLab hub links to the interactive learning page and presents the innovation clearly', () => {
  assertIncludes(hubHtml, 'סטודיו משחקים צעיר');
  assertIncludes(hubHtml, 'Game Studio Junior');
  assertIncludes(hubHtml, 'gamelab-play.html?lesson=1');
  assertIncludes(hubHtml, 'gamelab-slides.html?lesson=1');
  assertIncludes(hubHtml, 'במאי משחק חכם');
  assertIncludes(hubHtml, 'Blockly');
  assertIncludes(hubHtml, 'פיתוח משחקים');
});

test('GameLab play page exposes Blockly, character editor, and direct lesson navigation', () => {
  assertIncludes(playHtml, 'Blockly');
  assertIncludes(playHtml, 'heroName');
  assertIncludes(playHtml, 'heroColor');
  assertIncludes(playHtml, 'heroPower');
  assertIncludes(playHtml, 'gameName');
  assertIncludes(playHtml, 'newAiChallenge');
  assertIncludes(playHtml, 'runProgram');
  assertIncludes(playHtml, 'resetGame');
  assertIncludes(playHtml, 'gamelab-play.html?lesson=');
  assertIncludes(playHtml, 'gamelab-slides.html?lesson=');
});

test('GameLab instructor slides are generated per lesson with 90 minute flow and exercise solutions', () => {
  assertIncludes(slidesHtml, 'מצגת מדריך');
  assertIncludes(slidesHtml, 'lesson.durationMinutes');
  assertIncludes(slidesHtml, 'מהלך שיעור 90 דקות');
  assertIncludes(slidesHtml, 'AI לא בונה במקום הילדים');
  assertIncludes(slidesHtml, 'lesson.exercises');
  assertIncludes(slidesHtml, 'gamelab-play.html?lesson=');
});
