import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const read = (file) => readFileSync(join(root, file), 'utf8');
const homepage = read('index.html');
const course = read('money-smart-course.html');
const lab = read('money-smart-lab.html');
const slidesHub = read('money-smart-slides.html');
const lessonSlides = [1,2,3,4,5].map((id) => read(`money-smart-lesson-${id}-slides.html`));
const js = read('js/money-smart-lab.js');
const css = read('css/money-smart.css');

function includes(source, text, msg = `Missing ${text}`) { assert.ok(source.includes(text), msg); }

test('Money Smart Lab is linked from platform homepage', () => {
  includes(homepage, 'Money Smart Lab');
  includes(homepage, 'href="money-smart-course.html"');
  includes(homepage, 'href="money-smart-lab.html"');
  includes(homepage, 'href="money-smart-slides.html"');
  includes(homepage, 'חינוך פיננסי לנוער');
});

test('Money Smart course overview exposes core specification', () => {
  includes(course, '<title>Money Smart Lab - חכמים עם כסף</title>');
  includes(course, 'כיתות ט׳–י׳');
  includes(course, '5 מפגשים');
  includes(course, '90 דקות');
  includes(course, 'אינה ייעוץ פיננסי');
  includes(course, 'מאיה');
  includes(course, 'ליאור');
  includes(course, 'href="money-smart-lab.html"');
  includes(course, 'href="money-smart-slides.html"');
  includes(course, 'class="platform-home-link"');
});

test('Money Smart interactive lab has clear instructor links without an unused mode toggle', () => {
  includes(lab, '<title>Money Smart Lab - לומדה אינטראקטיבית</title>');
  assert.ok(!lab.includes('mode-switch'), 'Unused student/teacher mode toggle should not be rendered');
  assert.ok(!lab.includes('מצב תלמיד'), 'Student mode button should not be rendered');
  assert.ok(!lab.includes('מצב מדריך'), 'Teacher mode button should not be rendered');
  includes(lab, 'Money Smart Plan');
  includes(lab, 'יומן החלטות אישי');
  includes(lab, 'תקציב 600 הוא תרגול פתיחה');
  includes(lab, 'id="currentLessonSlides"');
  includes(lab, 'href="money-smart-lesson-1-slides.html"');
  includes(lab, 'href="money-smart-slides.html"');
  includes(js, 'money-smart-lesson-${l.id}-slides.html');
  includes(lab, 'js/money-smart-lab.js');
  includes(lab, 'class="platform-home-link"');
});

test('Money Smart concept chips are interactive explanatory controls', () => {
  includes(js, 'conceptInfo');
  includes(js, 'data-concept');
  includes(js, 'conceptDefinition');
  includes(css, 'concept-definition');
  includes(css, '.concept-chips button');
  includes(js, 'תקציב 600 הוא תרגול פתיחה');
});

test('Money Smart lab lessons are expanded to the seven required stages', () => {
  for (const stage of [
    'פתיחת מעבדה',
    'מה הייתם עושים?',
    'לומדים דרך גילוי',
    'מתנסים',
    'עצירת מדריך',
    'משימת דמות',
    'סיכום ועדכון תוכנית'
  ]) {
    const count = (js.match(new RegExp(stage, 'g')) || []).length;
    assert.equal(count, 5, `${stage} should appear once per each of five meetings`);
  }
});

test('Money Smart lesson 1 is upgraded to a product-level budget flow', () => {
  for (const phrase of [
    'lesson1Budget',
    'lesson1Event',
    'lesson1Discovery',
    'lesson1CharacterBudget',
    'lesson1TeacherStop',
    'lesson1Summary',
    'lesson1Categories',
    'lesson1Events',
    'characterPlans',
    'scoreBudget',
    'scoreHtml',
    'שמירת תקציב פתיחה',
    'אירוע בלתי צפוי',
    'התקציב כבר אינו 600 קבוע',
    'סיכום שנוצר מהפעילות',
    'נשמר ל־Money Smart Plan'
  ]) includes(js, phrase);
  includes(css, 'decision-score');
  includes(css, 'event-card');
  includes(css, 'character-budget-head');
});

test('Money Smart content includes five required meetings and interactions', () => {
  for (const phrase of [
    'כסף הוא בחירה',
    'איך גורמים לנו לקנות?',
    'כסף עכשיו מול כסף בעתיד',
    'איך כסף נשמר, גדל ומשמש אחרים?',
    'כסף דיגיטלי, הונאות ותוכנית מסכמת',
    'budget',
    'shoppingCalc',
    'interestCalc',
    'riskGraph',
    'finalChallenge',
    'תכנון',
    'בדיקה',
    'גמישות',
    'סיכון',
    'נימוק'
  ]) includes(js, phrase);
});

test('Money Smart slides hub links to five separate instructor decks', () => {
  includes(slidesHub, '<title>Money Smart Lab - מצגות מדריך נפרדות</title>');
  includes(slidesHub, 'מצגת נפרדת לכל מפגש');
  includes(slidesHub, 'href="money-smart-lab.html"');
  for (let id = 1; id <= 5; id += 1) {
    includes(slidesHub, `href="money-smart-lesson-${id}-slides.html"`);
    includes(slidesHub, `פתח מצגת מפגש ${id}`);
  }
});

test('Each Money Smart lesson has its own RTL slide deck with the requested outline', () => {
  const expectedCounts = [11, 12, 13, 16, 15];
  const expectedTitles = [
    'כסף הוא בחירה',
    'איך גורמים לנו לקנות?',
    'כסף עכשיו מול כסף בעתיד',
    'איך כסף נשמר, גדל ומשמש אחרים?',
    'כסף דיגיטלי, הונאות ותוכנית מסכמת'
  ];
  lessonSlides.forEach((html, index) => {
    const id = index + 1;
    includes(html, `<title>Money Smart Lab - מצגת מפגש ${id}: ${expectedTitles[index]}</title>`);
    includes(html, 'dir="rtl"');
    includes(html, 'href="money-smart-lab.html"');
    includes(html, 'href="money-smart-slides.html"');
    includes(html, expectedTitles[index]);
    includes(html, 'מעבר ללומדה');
    const slideCount = (html.match(/class="slide"/g) || []).length;
    assert.equal(slideCount, expectedCounts[index], `lesson ${id} slide count`);
  });
});

test('Money Smart files exist and include responsive RTL styling', () => {
  for (const file of [
    'money-smart-course.html',
    'money-smart-lab.html',
    'money-smart-slides.html',
    'money-smart-lesson-1-slides.html',
    'money-smart-lesson-2-slides.html',
    'money-smart-lesson-3-slides.html',
    'money-smart-lesson-4-slides.html',
    'money-smart-lesson-5-slides.html',
    'css/money-smart.css',
    'js/money-smart-lab.js',
    'js/build-money-smart-slides.mjs'
  ]) {
    assert.ok(existsSync(join(root, file)), `Missing ${file}`);
  }
  includes(css, '@media(max-width:760px)');
  includes(css, 'direction:rtl');
  includes(css, 'lab-layout');
});
