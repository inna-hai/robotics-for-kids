import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

function read(file) {
  return readFileSync(join(root, file), 'utf8');
}

function assertIncludes(source, needle, message = `Missing: ${needle}`) {
  assert.ok(source.includes(needle), message);
}

const homepage = read('index.html');
const hub = read('omer-courses.html');
const course = read('ai-research-lab.html');
const lesson1 = read('ai-research-lab-lesson-1.html');
const slides1 = read('ai-research-lab-slides-1.html');
const lesson2 = read('ai-research-lab-lesson-2.html');
const slides2 = read('ai-research-lab-slides-2.html');

assertIncludes(homepage, 'href="omer-courses.html"', 'homepage top nav should link to Omer lomdot hub');
assertIncludes(homepage, '>עומר הנביעה</a>', 'homepage should name Omer Hanbia in the top nav');
assert.ok(!homepage.includes('<h3>AI Research Lab'), 'homepage should not add a catalog card yet; link only in top nav');

assertIncludes(hub, '<title>לומדות עומר הנביעה · hai.tech</title>');
assertIncludes(hub, 'מרכז חדשנות עומר הנביעה · לומדות');
assertIncludes(hub, 'AI Research Lab - חקר, דאטה והצגת מסקנות');
assertIncludes(hub, 'href="ai-research-lab.html"');
assertIncludes(hub, '/js/feedback-widget.js');

assertIncludes(course, '<title>AI Research Lab · עומר הנביעה</title>');
assertIncludes(course, 'כיתה ט׳ · 15 מפגשים · 90 דקות למפגש');
assertIncludes(course, 'חומרי מקור שנקלטו');
assertIncludes(course, 'content/source-materials/omer-hanbia-ai-research-lab/');
assertIncludes(course, 'href="omer-courses.html"');
assertIncludes(course, '/js/feedback-widget.js');
assertIncludes(course, 'href="ai-research-lab-lesson-1.html"', 'course page should link to lesson 1 lomda');
assertIncludes(course, 'href="ai-research-lab-slides-1.html"', 'course page should link to lesson 1 instructor slides');

const lessonCards = [...course.matchAll(/<article class="lesson(?:\s[^"]*)?"/g)];
assert.equal(lessonCards.length, 15, 'course page should list all 15 lesson planning cards');

for (let lesson = 1; lesson <= 15; lesson += 1) {
  assertIncludes(course, `<span class="num">${lesson}</span>`, `course should include lesson ${lesson}`);
}

assert.ok(existsSync(join(root, 'ai-research-lab-lesson-1.html')), 'lesson 1 lomda should exist');
assert.ok(existsSync(join(root, 'ai-research-lab-slides-1.html')), 'lesson 1 slides should exist');
assert.ok(existsSync(join(root, 'ai-research-lab-lesson-2.html')), 'lesson 2 lomda should exist');
assert.ok(existsSync(join(root, 'ai-research-lab-slides-2.html')), 'lesson 2 slides should exist');
assertIncludes(lesson1, 'מה זה חקר בעידן AI?', 'lesson 1 should keep source lesson title');
assertIncludes(lesson1, 'AI הוא התחלה של חקר - לא סיום של חקר', 'lesson 1 should keep core pedagogical message');
assertIncludes(lesson1, '2-3 נושאי חקר אפשריים', 'lesson 1 should keep the source deliverable');
assertIncludes(lesson1, 'האם שימוש ב־AI משפר למידה של תלמידים?', 'lesson 1 should include the source opening question');
assertIncludes(lesson1, 'אל תכתוב מסקנה סופית', 'lesson 1 should include the source research prompt constraint');
assertIncludes(lesson1, 'CIVIX Explains AI: Hallucinations and Deepfakes', 'lesson 1 should include an optional video/search enrichment link');
assertIncludes(lesson1, 'רשות לפתיחה - סרטון קצר', 'lesson 1 should surface the video option near the opening activity');
assertIncludes(lesson1, 'href="ai-research-lab-slides-1.html"', 'lesson 1 should link to the instructor slides');
assertIncludes(lesson1, '/js/feedback-widget.js', 'lesson 1 should load the shared feedback widget');
assertIncludes(slides1, 'AI Research Lab - מפגש 1 - מה זה חקר בעידן AI?', 'slides 1 should use the cleaned lesson deck title');
assertIncludes(slides1, 'assets/html-ppt/templates/obsidian-claude-gradient/style.css', 'slides 1 should use the research-tech html-ppt skill template');
assertIncludes(slides1, 'assets/html-ppt/runtime.js', 'slides 1 should load html-ppt runtime');
assertIncludes(slides1, 'media-layout', 'slides 1 should use a non-overlapping video layout');
assertIncludes(slides1, 'scale(calc(var(--deck-scale,1) * .92))', 'slides 1 should leave viewport margins instead of filling 100 percent');
assertIncludes(slides1, '<bdi>AI</bdi>', 'slides 1 should isolate English AI inside Hebrew RTL text');
assertIncludes(slides1, '<span class="line">האם שימוש ב-<bdi>AI</bdi> משפר למידה של תלמידים?</span>', 'slide 4 prompt should be split into RTL-stable lines');
assertIncludes(slides1, 'CIVIX Explains AI: Hallucinations and Deepfakes', 'slides 1 should include a visible video enrichment slide');
assertIncludes(slides1, 'href="ai-research-lab.html"', 'slides 1 should link back to the course page');
assertIncludes(course, 'href="ai-research-lab-lesson-2.html"', 'course should link to lesson 2 lomda');
assertIncludes(course, 'href="ai-research-lab-slides-2.html"', 'course should link to lesson 2 slides');
assertIncludes(lesson2, 'מנושא רחב לשאלת חקר טובה', 'lesson 2 should keep source lesson title');
assertIncludes(lesson2, 'שאלת חקר ראשונית + 3 שאלות משנה', 'lesson 2 should keep the source deliverable');
assertIncludes(lesson2, 'נושא הוא אזור. שאלת חקר היא מסלול ברור', 'lesson 2 should keep the source central message');
assertIncludes(lesson2, 'הצע 10 שאלות חקר', 'lesson 2 should include the source AI prompt');
assertIncludes(lesson2, 'href="ai-research-lab-slides-2.html"', 'lesson 2 should link to the instructor slides');
assertIncludes(lesson2, '/js/feedback-widget.js', 'lesson 2 should load the shared feedback widget');
assertIncludes(slides2, 'AI Research Lab - מפגש 2 - מנושא רחב לשאלת חקר טובה', 'slides 2 should use the cleaned lesson deck title');
assertIncludes(slides2, 'assets/html-ppt/templates/obsidian-claude-gradient/style.css', 'slides 2 should use the research-tech html-ppt skill template');
assertIncludes(slides2, 'assets/html-ppt/runtime.js', 'slides 2 should load html-ppt runtime');
assertIncludes(slides2, 'scale(calc(var(--deck-scale,1) * .92))', 'slides 2 should leave viewport margins instead of filling 100 percent');
assertIncludes(slides2, '<bdi>AI</bdi>', 'slides 2 should isolate English AI inside Hebrew RTL text');
assertIncludes(slides2, 'href="ai-research-lab.html"', 'slides 2 should link back to the course page');


const lessonExpectations = new Map([
  [3, ['חיפוש חכם ובניית מפת חיפוש', 'מפת חיפוש צוותית + רשימת 5-7 מקורות אפשריים', 'חיפוש טוב מתחיל לפני שמקלידים']],
  [4, ['בדיקת אמינות מקורות', 'טבלת אמינות ל-3 מקורות לפחות', 'מקור נכנס לתוצר רק אחרי בדיקה']],
  [5, ['אישור שאלת חקר ותיק מקורות ראשוני', 'שאלת חקר מאושרת + תיק 3-5 מקורות + שאלות משנה', 'לא ממשיכים לניתוח לפני שיש שאלה ברורה']],
  [6, ['השוואת מקורות וזיהוי פערים', 'טבלת השוואת מקורות לפחות לשלושה מקורות', 'הבדלים בין מקורות אינם בעיה']],
  [7, ['ארגון מידע מטקסט לטבלה', 'טבלת מידע ראשונה עם לפחות 6 שורות', 'טבלה טובה אינה עיצוב']],
  [8, ['נתונים, גרפים והמחשה חזותית', 'גרף, תרשים או המחשה חזותית אחת לממצא מרכזי', 'ייצוג חזותי טוב לא רק נראה יפה']],
  [9, ['ממידע לתובנות', 'דף 3 תובנות מרכזיות + שאלה פתוחה להמשך', 'תובנה היא לא דעה יפה']],
  [10, ['טענה, מסקנה והמלצה', 'פסקת מסקנה ראשונית + המלצה או כיוון פעולה', 'מסקנה טובה היא טענה עם ראיה']],
  [11, ['בניית דוח חקר חזותי', 'טיוטת דוח חקר חזותי מלאה ברמת כ-60%', 'דוח טוב אינו אוסף קטעים שהעתקנו']],
  [12, ['עיצוב מידע ושיפור הדוח', 'דוח חקר חזותי כמעט סופי, קריא וברור', 'עיצוב טוב לא נועד להרשים']],
  [13, ['בניית מצגת מסכמת', 'מצגת ראשונה מלאה בת 5-7 שקפים', 'מצגת טובה מספרת סיפור חקר קצר']],
  [14, ['חזרת הצגה, משוב ושיפור', 'מצגת ודוח לאחר שיפור + חלוקת דיבור בצוות', 'הצגה טובה לא קוראת שקפים']],
  [15, ['הצגת תוצרים וסיכום למידה', 'דוח חקר חזותי, מצגת נתונים, הצגה ורפלקציה אישית', 'מעריכים את תהליך החשיבה']],
]);

for (const [lesson, [title, deliverable, principle]] of lessonExpectations) {
  assert.ok(existsSync(join(root, `ai-research-lab-lesson-${lesson}.html`)), `lesson ${lesson} lomda should exist`);
  assert.ok(existsSync(join(root, `ai-research-lab-slides-${lesson}.html`)), `lesson ${lesson} slides should exist`);
  assertIncludes(course, `href="ai-research-lab-lesson-${lesson}.html"`, `course should link to lesson ${lesson} lomda`);
  assertIncludes(course, `href="ai-research-lab-slides-${lesson}.html"`, `course should link to lesson ${lesson} slides`);
  const lessonHtml = read(`ai-research-lab-lesson-${lesson}.html`);
  const slidesHtml = read(`ai-research-lab-slides-${lesson}.html`);
  assertIncludes(lessonHtml, title, `lesson ${lesson} should keep source title`);
  assertIncludes(lessonHtml, deliverable, `lesson ${lesson} should keep source deliverable`);
  assertIncludes(lessonHtml, principle, `lesson ${lesson} should keep source central message`);
  assertIncludes(lessonHtml, `href="ai-research-lab-slides-${lesson}.html"`, `lesson ${lesson} should link to slides`);
  assertIncludes(lessonHtml, '/js/feedback-widget.js', `lesson ${lesson} should load shared feedback widget`);
  assertIncludes(slidesHtml, `AI Research Lab - מפגש ${lesson} - ${title}`, `slides ${lesson} should use cleaned deck title`);
  assertIncludes(slidesHtml, 'assets/html-ppt/templates/obsidian-claude-gradient/style.css', `slides ${lesson} should use html-ppt research-tech template`);
  assertIncludes(slidesHtml, 'assets/html-ppt/runtime.js', `slides ${lesson} should load html-ppt runtime`);
  assertIncludes(slidesHtml, 'scale(calc(var(--deck-scale,1) * .92))', `slides ${lesson} should leave viewport margins`);
  assertIncludes(slidesHtml, '<bdi>AI</bdi>', `slides ${lesson} should isolate English AI inside Hebrew text`);
  assertIncludes(slidesHtml, 'href="ai-research-lab.html"', `slides ${lesson} should link back to course page`);
}

const sourceRoot = join(root, 'content/source-materials/omer-hanbia-ai-research-lab');
assert.ok(existsSync(sourceRoot), 'source material folder should exist');
assert.ok(existsSync(join(sourceRoot, 'AI Research Lab - כיתה ט - תוכנית הוראה פנימית מלאה.docx')), 'full teaching plan should exist');

console.log('omer-ai-research-lab-course tests passed');
