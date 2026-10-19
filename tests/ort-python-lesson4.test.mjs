import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const lesson = await readFile(new URL('../ort-python-lesson-4.html', import.meta.url), 'utf8');
const slides = await readFile(new URL('../ort-python-slides-4.html', import.meta.url), 'utf8');
const source = await readFile(new URL('../content/source-materials/ort-python/lesson-4/ort-python-lesson-4-plan-text.md', import.meta.url), 'utf8');

test('lesson 4 preserves the source-plan concepts and assignments', () => {
  for (const required of [
    'while', 'for', 'range', 'random.randint', 'break', 'continue',
    'קלט עד עצירה', 'אי־זוגיים', 'מספרים ראשוניים', 'print hello world',
    'בלי if', 'Kahoot', 'משחק ניחוש מספר'
  ]) assert.ok(lesson.includes(required), `missing lesson content: ${required}`);
  assert.ok(source.includes('55b5d4ac-3c1e-4acd-95ad-1e02714c1a00'));
});

test('lesson 4 has eight derived completion tasks and no learner-controlled done checkbox', () => {
  assert.match(lesson, /const required=\['choice-loop','predict-while','range-builder','predict-control','class-1','class-2','prime-plan','quiz'\]/);
  assert.doesNotMatch(lesson, /data-done|type="checkbox"/);
  assert.match(lesson, /ortPython\.lesson4\.v3/);
});

test('lesson quiz has four complete single-answer questions with explanations', () => {
  const match = lesson.match(/const quiz=(\[[\s\S]*?\n\]);\nlet quizIndex/);
  assert.ok(match, 'quiz data not found');
  const quiz = Function(`return ${match[1]}`)();
  assert.equal(quiz.length, 4);
  for (const item of quiz) {
    assert.equal(item.o.length, 4);
    assert.ok(Number.isInteger(item.a) && item.a >= 0 && item.a < item.o.length);
    assert.ok(item.e.trim().length > 0);
  }
  assert.match(lesson, /buttons\.forEach\(\(b,i\)=>\{b\.disabled=true/);
  assert.match(lesson, /nextQuiz\.disabled=false/);
});

test('instructor deck contains guide questions, no displayed timing, and all source activities', () => {
  assert.equal((slides.match(/class="slide(?: active center)?"/g) || []).length, 17);
  assert.ok((slides.match(/class="question"/g) || []).length >= 15);
  assert.doesNotMatch(slides, /\b\d+\s*דקות\b/);
  for (const required of ['תרגול כיתה 1', 'תרגול כיתה 2', 'לולאה בתוך לולאה', 'בונוס המערך', 'Kahoot', 'בונוס אם נשאר זמן']) {
    assert.ok(slides.includes(required), `missing deck content: ${required}`);
  }
  assert.match(slides, /id="counter">1 \/ 17/);
});
