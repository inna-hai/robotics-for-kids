import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const courseHtml = readFileSync(join(root, 'chess-quest.html'), 'utf8');
const playHtml = readFileSync(join(root, 'chess-quest-play.html'), 'utf8');
const js = readFileSync(join(root, 'js', 'chess-quest.js'), 'utf8');
const css = readFileSync(join(root, 'css', 'chess-quest.css'), 'utf8');
const indexHtml = readFileSync(join(root, 'index.html'), 'utf8');

const tests = [];
function test(name, fn) { tests.push({ name, fn }); }
function assertIncludes(source, needle, message = `Missing: ${needle}`) { assert.ok(source.includes(needle), message); }

test('Chess Quest product pages exist and are linked from homepage', () => {
  assert.ok(existsSync(join(root, 'chess-quest.html')));
  assert.ok(existsSync(join(root, 'chess-quest-play.html')));
  assertIncludes(indexHtml, 'href="chess-quest.html"');
  assertIncludes(indexHtml, 'href="chess-quest-play.html"');
  assertIncludes(indexHtml, 'Chess Quest');
});

test('Chess Quest course page presents a polished 15 lesson product', () => {
  assertIncludes(courseHtml, '<title>Chess Quest - ממלכת השחמט לילדים</title>');
  assertIncludes(courseHtml, 'קורס שחמט אינטראקטיבי');
  assertIncludes(courseHtml, 'מפת מסע של 15 שיעורים');
  assertIncludes(courseHtml, 'סיסי הופכת למאמנת שחמט');
  assertIncludes(courseHtml, 'בנוי כמוצר להדרכה אמיתית');
  assertIncludes(courseHtml, 'chess-quest-play.html?lesson=15');
});

test('Chess Quest interactive lab exposes board, coach, inventory, progress and certificate', () => {
  assertIncludes(playHtml, 'id="chessBoard"');
  assertIncludes(playHtml, 'id="lessonSelect"');
  assertIncludes(playHtml, 'id="pieceInventory"');
  assertIncludes(playHtml, 'id="progressBar"');
  assertIncludes(playHtml, 'תעודת שחמטאי צעיר');
  assertIncludes(playHtml, 'js/chess-quest.js');
});

test('Chess Quest engine includes all core chess pieces and 15 lessons', () => {
  for (const key of ['king', 'queen', 'rook', 'bishop', 'knight', 'pawn']) assertIncludes(js, `${key}:`);
  const lessonCount = (js.match(/\{id:\d+,piece:/g) || []).length;
  assert.equal(lessonCount, 15);
  for (const term of ['מט בסיסי', 'מזלג ואיום כפול', 'סיכה וגילוי', 'טורניר המלכים']) assertIncludes(js, term);
  for (const fn of ['legalFor', 'knightMove', 'sameDiag', 'pawnMove', 'showCertificate']) assertIncludes(js, `function ${fn}`);
});

test('Chess Quest styling is RTL, responsive and visually productized', () => {
  assertIncludes(css, 'direction:rtl');
  assertIncludes(css, '.kingdom-card');
  assertIncludes(css, '.chess-board');
  assertIncludes(css, '.certificate-card');
  assertIncludes(css, '@media(max-width:1100px)');
  assertIncludes(css, 'linear-gradient');
});

let failed = 0;
for (const { name, fn } of tests) {
  try { fn(); console.log(`✓ ${name}`); }
  catch (error) { failed += 1; console.error(`✗ ${name}`); console.error(error); }
}
if (failed) process.exit(1);
