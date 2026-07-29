import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const course = readFileSync(new URL('../roblox-course.html', import.meta.url), 'utf8');
const app = readFileSync(new URL('../roblox.html', import.meta.url), 'utf8');
const slides = readFileSync(new URL('../roblox-slides.html', import.meta.url), 'utf8');
const lessonData = readFileSync(new URL('../content/roblox-lessons.js', import.meta.url), 'utf8');
const lessonMd = readFileSync(new URL('../content/roblox-lessons.md', import.meta.url), 'utf8');
const bundle = app + '\n' + course + '\n' + slides + '\n' + lessonData + '\n' + lessonMd;

assert.match(course, /Roblox Studio Lab/);
assert.match(course, /24 שיעורים/);
assert.match(course, /roblox\.html/);
assert.match(course, /roblox-slides\.html/);
assert.match(course, /הוספת עצמים/);
assert.match(course, /מסלול מכשולים/);
assert.match(course, /שלט כניסה/);

assert.match(app, /Roblox Studio Lab/);
assert.match(app, /Explorer/);
assert.match(app, /Properties/);
assert.match(app, /Luau/);
assert.match(app, /העתק קוד/);
assert.match(app, /copyCurrentCode/);
assert.match(app, /navigator\.clipboard/);
assert.match(app, /scriptLocationFor/);
assert.match(app, /LESSON_SCREENSHOTS/);
assert.match(app, /assets\/roblox-screenshots\/roblox-lesson-1-02\.png/);
assert.match(app, /content\/roblox-lessons\.js/);
assert.match(app, /function setLesson/);
assert.match(app, /SurfaceGui/);
assert.match(app, /TextLabel/);
assert.match(bundle, /Anchored/);
assert.match(bundle, /CanCollide/);
assert.match(bundle, /game\.Workspace/);

assert.match(slides, /מצגת מדריך/);
assert.match(slides, /מבנה שיעור מומלץ/);
assert.match(slides, /שיעורים 1–3/);
assert.match(slides, /@media print/);

assert.match(lessonMd, /# Roblox 10\+ — מערכי שיעור ללומדה/);
assert.match(bundle, /const ROBLOX_LESSONS = \[/);
assert.match(bundle, /SpawnLocation/);
assert.match(bundle, /Roblox Studio is ready!/);
assert.match(bundle, /part\.Anchored = true/);
assert.match(bundle, /part\.CanCollide = false/);
assert.match(bundle, /label\.Text = \"Welcome to my obby!\"/);
assert.match(bundle, /Move\/Scale\/Rotate/);
assert.match(bundle, /Transparency/);
assert.match(bundle, /AnchorPoint/);
assert.match(bundle, /script\.Parent/);
assert.match(bundle, /Touched:Connect/);
assert.match(bundle, /Instance\.new/);
assert.match(bundle, /Vector3\.new/);
assert.match(bundle, /ScreenGui/);

const lessonIds = [...lessonData.matchAll(/\{id:(\d+),title:/g)].map(m => Number(m[1]));
assert.equal(new Set(lessonIds).size, 24, 'Roblox course should expose 24 lessons');
assert.deepEqual(lessonIds, Array.from({length:24}, (_,i)=>i+1));

for (const publicHtml of [course, app, slides]) {
  assert.doesNotMatch(publicHtml, /Drive|מהדרייב|מתוך המערך המקורי|גרסה ראשונית|Placeholder|Monday|סיום טיפול/);
  const scriptBodies = [...publicHtml.matchAll(/<script(?![^>]*src=)[^>]*>([\s\S]*?)<\/script>/g)].map(m => m[1]);
  for (const body of scriptBodies) new Function(body);
}

console.log('roblox course MVP checks passed');
