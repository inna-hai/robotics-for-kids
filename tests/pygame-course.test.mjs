import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const course = readFileSync(new URL('../pygame-course.html', import.meta.url), 'utf8');
const app = readFileSync(new URL('../pygame.html', import.meta.url), 'utf8');
const slides = readFileSync(new URL('../pygame-slides.html', import.meta.url), 'utf8');
const lesson1Slides = readFileSync(new URL('../pygame-lesson-1-slides.html', import.meta.url), 'utf8');
const lesson2Slides = readFileSync(new URL('../pygame-lesson-2-slides.html', import.meta.url), 'utf8');
const lessonData = readFileSync(new URL('../content/pygame-lessons.js', import.meta.url), 'utf8');
const lessonMd = readFileSync(new URL('../content/pygame-lessons.md', import.meta.url), 'utf8');
const appBundle = app + '\n' + lessonData + '\n' + lessonMd;

assert.match(course, /Pygame Lab/);
assert.match(course, /28 שיעורים/);
assert.match(course, /לומדה פעילה עם 28 שיעורים/);
assert.match(course, /pygame\.html/);
assert.match(course, /pygame-lesson-1-slides\.html/);
assert.match(course, /pygame-lesson-2-slides\.html/);
assert.doesNotMatch(course, /<nav class=\"nav\">[\s\S]*pygame-lesson-[12]-slides\.html[\s\S]*<\/nav>/);
assert.doesNotMatch(course, /שיעורי הגרסה הראשונה|מתוך המערך המקורי|מהדרייב|במיפוי|תמונות מסך מהמערכים/);

assert.match(app, /Pygame Lab/);
assert.match(app, /https:\/\/unpkg\.com\/blockly\/blockly\.min\.js/);
assert.match(app, /content\/pygame-lessons\.js/);
assert.match(app, /const LESSON_PRESETS/);
assert.match(app, /toolboxForLesson/);
assert.match(app, /BLOCK_UNLOCK_LESSON/);
assert.match(app, /label text=\"מסך\"/);
assert.match(app, /label:'דמות ותנועה'/);
assert.match(app, /loadLessonPreset/);
assert.match(app, /טען דוגמת שיעור/);
assert.match(app, /מצגת שיעור/);
assert.doesNotMatch(app, /<nav class="nav"[^>]*>[\s\S]*pygame-slides\.html[\s\S]*<\/nav>/);
assert.match(lessonMd, /# Pygame — מערכי שיעור ללומדה/);
assert.match(appBundle, /const PYGAME_LESSONS = \[/);
assert.match(appBundle, /התקנות וחלון המשחק הראשון/);
assert.match(appBundle, /Trex Runner חלק ג/);
assert.match(app, /pg_screen/);
assert.match(app, /pg_move_keys/);
assert.match(app, /pg_collision/);
assert.match(app, /pg_keep_inside/);
assert.match(app, /pg_obstacle/);
assert.match(app, /simulateBlocks/);
assert.match(app, /rectHit/);
assert.doesNotMatch(app, /מתוך המערך המקורי/);
assert.match(app, /דוגמאות ותרגילי העמקה/);
assert.match(appBundle, /pygame.draw.rect/);
assert.match(appBundle, /pygame.USEREVENT/);
assert.match(appBundle, /random_number = random.randint/);
assert.match(appBundle, /word_to_guess = random.choice/);
assert.match(app, /pg_background.*pg_loop/s);
assert.match(app, /pg_coin:5/);
assert.match(app, /pg_collision:11/);
assert.match(app, /pg_game_over:14/);
assert.match(app, /pg_coin.*pg_collision.*pg_score/s);
assert.match(app, /import pygame/);
assert.match(app, /pygame\.display\.set_mode/);
assert.match(app, /player\.colliderect\(coin\)/);
assert.match(app, /מסך המשחק/);
assert.match(appBundle, /תרגולים/);
assert.match(appBundle, /דגש מדריך/);

const lessonIds = [...lessonData.matchAll(/\{id:(\d+),title:/g)].map(m => Number(m[1]));
assert.equal(new Set(lessonIds).size, 28, 'Pygame course should expose 28 lessons');
assert.deepEqual(lessonIds, Array.from({length:28}, (_,i)=>i+1));

assert.match(slides, /מצגת ומערך מדריך/);
assert.match(slides, /מבנה שיעור מומלץ/);
assert.match(slides, /מפת 28 השיעורים/);
assert.match(slides, /כל שיעור בלומדה כולל הסבר לתלמיד/);
assert.match(slides, /90 דקות/);
assert.match(slides, /שיעור 1 — חלון המשחק הראשון/);
assert.match(slides, /שיעור 5 — מטבע וניקוד/);
assert.match(slides, /שילוב דוגמאות ויזואליות/);
assert.match(slides, /@media print/);
assert.match(slides, /פתח בלומדה/);
assert.match(slides, /pygame-lesson-1-slides\.html/);
assert.match(slides, /pygame-lesson-2-slides\.html/);

assert.match(lesson1Slides, /Pygame • שיעור 1/);
assert.doesNotMatch(lesson1Slides, /Drive|מהדרייב|מתוך המערך המקורי/);
assert.match(lesson1Slides, /pip install pygame/);
assert.match(lesson1Slides, /print\("Hello, World!"\)/);
assert.match(lesson1Slides, /pygame\.display\.set_mode/);
assert.match(lesson1Slides, /pygame\.html\?lesson=1/);

assert.match(lesson2Slides, /Pygame • שיעור 2/);
assert.doesNotMatch(lesson2Slides, /Drive|מהדרייב|מתוך המערך המקורי/);
assert.match(lesson2Slides, /משתנים הם “מגירות אחסון”/);
assert.match(lesson2Slides, /sumOfAges/);
assert.match(lesson2Slides, /input\("what is your name\?/);
assert.match(lesson2Slides, /pygame\.Rect/);
assert.match(lesson2Slides, /pygame\.html\?lesson=2/);

for (const html of [app, slides, lesson1Slides, lesson2Slides]) {
  const scriptBodies = [...html.matchAll(/<script(?![^>]*src=)[^>]*>([\s\S]*?)<\/script>/g)].map(m => m[1]);
  for (const body of scriptBodies) new Function(body);
}

console.log('pygame course MVP checks passed');
