const labels = { up: '⬆️', down: '⬇️', right: '➡️', left: '⬅️', broadcast: '📡 שדר שלום' };
const moves = { up: [0, -1], down: [0, 1], right: [1, 0], left: [-1, 0] };

const params = new URLSearchParams(location.search);
const lessonId = Number(params.get('lesson') || 1);
const lessons = window.SPACE_LESSONS || [];
const lesson = lessons.find((item) => item.id === lessonId) || lessons[0];
let program = [];
let robot = { ...lesson.start };
let collected = new Set();
let collectedItems = new Set();
let greetedAlien = false;
let broadcastPulse = false;
let reachedGoalDuringRun = false;
const starsStorageKey = 'sisi-space-stars-best-v1';

function key(pos) { return `${pos.x},${pos.y}`; }
function same(a, b) { return a.x === b.x && a.y === b.y; }
function isObstacle(pos) { return lesson.obstacles.some((item) => same(item, pos)); }
function inside(pos) { return pos.x >= 1 && pos.x <= 6 && pos.y >= 1 && pos.y <= 5; }
function requiredItems() { return lesson.requiredItems || []; }
function requiredAt(pos) { return requiredItems().find((item) => same(item.position, pos)); }
function hasAllRequiredItems() { return requiredItems().every((item) => collectedItems.has(item.id)); }
function requiredItemsText() { return requiredItems().map((item) => `${item.icon} ${item.label}`).join(', '); }
function carriedItemIcon() {
  if (lesson.id !== 8) return '';
  const telescope = requiredItems().find((item) => item.id === 'telescope');
  return telescope && collectedItems.has(telescope.id) ? telescope.icon : '';
}

function readStarsProgress() {
  try {
    return JSON.parse(localStorage.getItem(starsStorageKey) || '{}');
  } catch {
    return {};
  }
}

function writeStarsProgress(progress) {
  try {
    localStorage.setItem(starsStorageKey, JSON.stringify(progress));
  } catch {
    // Progress is optional; the game should continue even if storage is unavailable.
  }
}

function totalSavedStars() {
  return Object.values(readStarsProgress()).reduce((sum, value) => sum + Number(value || 0), 0);
}

function renderStarsProgress() {
  const starsProgress = document.getElementById('stars-progress');
  if (!starsProgress) return;
  starsProgress.textContent = `⭐ כוכבים שנאספו בשיעור החלל: ${totalSavedStars()}`;
}

function saveBestStarsForLesson() {
  const progress = readStarsProgress();
  const lessonKey = String(lesson.id);
  const previousBest = Number(progress[lessonKey] || 0);
  const currentStars = collected.size;
  if (currentStars > previousBest) {
    progress[lessonKey] = currentStars;
    writeStarsProgress(progress);
    renderStarsProgress();
    return true;
  }
  return false;
}

function obstacleIcon() {
  if (lesson.id === 4) return '🔥';
  if (lesson.id === 6) return '☄️';
  return '🪨';
}

function goalIcon() {
  if (lesson.id === 5) return '👽';
  if (lesson.id === 12) return '🌍';
  return '🏁';
}

function renderGuide() {
  const required = requiredItems();
  const extra = required.length ? required.map((item) => `<span class="guide-chip"><b>${item.icon}</b> ${item.label} — חובה לפני הסיום</span>`).join('') : '';
  const actionGuide = lesson.id === 5 ? '<span class="guide-chip"><b>📡</b> שדר שלום — פעולה שעושים כשסיסי עומדת ליד החייזר</span>' : '';
  document.getElementById('space-guide').innerHTML = `
    <span class="guide-chip"><b>🤖</b> סיסי</span>
    <span class="guide-chip"><b>${obstacleIcon()}</b> מכשול אדום — אסור להיתקע</span>
    <span class="guide-chip"><b>${goalIcon()}</b> יעד ירוק — לשם מגיעים בסוף</span>
    <span class="guide-chip"><b>⭐</b> כוכב בונוס — לא חובה, מוסיף אתגר</span>
    ${extra}
    ${actionGuide}
  `;
}

function renderGrid() {
  const grid = document.getElementById('grid');
  grid.innerHTML = '';
  for (let y = 1; y <= 5; y += 1) {
    for (let x = 1; x <= 6; x += 1) {
      const pos = { x, y };
      const cell = document.createElement('div');
      cell.className = 'cell';
      const item = requiredAt(pos);
      if (lesson.stars.some((star) => same(star, pos)) && !collected.has(key(pos))) cell.classList.add('star');
      if (item && !collectedItems.has(item.id)) {
        cell.classList.add('required-item');
        cell.textContent = item.icon;
        cell.title = item.label;
      }
      if (isObstacle(pos)) {
        cell.classList.add('obstacle');
        cell.textContent = obstacleIcon();
      }
      if (same(lesson.goal, pos)) {
        cell.classList.add('goal');
        cell.textContent = goalIcon();
      }
      if (same(robot, pos)) {
        cell.classList.add('robot');
        if (lesson.id === 5 && same(lesson.goal, pos)) {
          cell.textContent = broadcastPulse ? '🤖📡👽' : '🤖👽';
          if (broadcastPulse) cell.classList.add('broadcasting');
        } else {
          cell.textContent = `🤖${carriedItemIcon()}`;
        }
      }
      grid.appendChild(cell);
    }
  }
}

function renderProgram() {
  const box = document.getElementById('program');
  box.innerHTML = program.length
    ? program.map((cmd) => `<span class="chip">${labels[cmd]}</span>`).join('')
    : '<span class="small">עדיין אין פקודות. התחילו בלחיצה על חצים.</span>';
}

function setResult(text, success = false) {
  const result = document.getElementById('result');
  result.textContent = text;
  result.style.color = success ? '#15803d' : '#b45309';
}

function repeatCurrentLesson() {
  program = [];
  renderProgram();
  resetRobot();
  window.SisiCourseCertificate?.clear();
  setResult('השיעור אופס. בונים מסלול חדש מהתחלה.');
}

function resetRobot() {
  robot = { ...lesson.start };
  collected = new Set();
  collectedItems = new Set();
  greetedAlien = false;
  broadcastPulse = false;
  reachedGoalDuringRun = false;
  renderGrid();
}

function step(cmd) {
  if (cmd === 'broadcast') {
    if (lesson.id !== 5) return { ok: false, reason: 'הפקודה הזאת לא זמינה במשימה הזו.' };
    if (!same(robot, lesson.goal)) return { ok: false, reason: 'כדי לשדר שלום צריך קודם להגיע לחייזר 👽' };
    greetedAlien = true;
    broadcastPulse = true;
    renderGrid();
    return { ok: true, message: 'סיסי שידרה שלום לחייזר! 📡👽' };
  }
  broadcastPulse = false;
  const [dx, dy] = moves[cmd];
  const next = { x: robot.x + dx, y: robot.y + dy };
  if (!inside(next)) return { ok: false, reason: 'סיסי כמעט יצאה מהחלל של המשחק. צריך להישאר בתוך הלוח 🙂' };
  if (isObstacle(next)) return { ok: false, reason: 'אופס, יש מכשול בדרך. נסו מסלול אחר.' };
  robot = next;
  if (lesson.stars.some((star) => same(star, robot))) collected.add(key(robot));
  const item = requiredAt(robot);
  if (item) collectedItems.add(item.id);
  if (same(robot, lesson.goal) && hasAllRequiredItems()) reachedGoalDuringRun = true;
  renderGrid();
  return { ok: true, message: item?.collectedMessage };
}

async function runProgram() {
  resetRobot();
  setResult('סיסי יוצאת לדרך...');
  if (!program.length) {
    setResult('צריך להוסיף לפחות פקודה אחת לפני ההרצה.');
    return;
  }
  for (const cmd of program) {
    await new Promise((resolve) => setTimeout(resolve, 420));
    const outcome = step(cmd);
    if (!outcome.ok) {
      if (reachedGoalDuringRun) {
        setResult('סיסי כבר הגיעה ליעד — המסלול המשיך צעד אחד יותר מדי. מחקו את הפקודות שאחרי ההגעה ליעד ונסו שוב.');
        return;
      }
      setResult(outcome.reason);
      return;
    }
    if (outcome.message) setResult(outcome.message, true);
  }
  if (same(robot, lesson.goal) && !hasAllRequiredItems()) {
    setResult(`כמעט! לפני שמסיימים צריך לאסוף: ${requiredItemsText()}.`);
    return;
  }
  if (lesson.id === 5 && same(robot, lesson.goal) && !greetedAlien) {
    setResult('סיסי הגיעה לחייזר! עכשיו הוסיפו את הפקודה 📡 שדר שלום והריצו שוב.');
    return;
  }
  if (same(robot, lesson.goal)) {
    const improvedStars = saveBestStarsForLesson();
    const bonus = collected.size ? ` וגם אספה ${collected.size} כוכבים!` : '!';
    const action = lesson.id === 5 && greetedAlien ? ' ושידרה שלום לחייזר 📡👽' : '';
    const record = improvedStars && collected.size ? ` שיא חדש במשימה: ${collected.size} כוכבים ⭐` : '';
    const message = `יש! סיסי הגיעה ליעד${action}${bonus}${record}`;
    setResult(message, true);
    window.SisiCourseCertificate?.show({ lessons, lesson });
    window.SisiSuccessDialog?.show({ message, lessons, lesson, onRepeat: repeatCurrentLesson });
  } else {
    setResult('כמעט! סיסי לא הגיעה ליעד. הוסיפו או שנו פקודות ונסו שוב.');
  }
}

function init() {
  document.getElementById('page-title').textContent = `${lesson.emoji} ${lesson.title}`;
  document.getElementById('page-subtitle').textContent = `משימה ${lesson.id}: ${lesson.place} — ${lesson.concept}`;
  document.getElementById('lesson-heading').textContent = `משימה ${lesson.id}: ${lesson.title}`;
  document.getElementById('lesson-emoji').textContent = lesson.emoji;
  document.getElementById('mission').textContent = lesson.mission;
  document.getElementById('fact').innerHTML = `<b>עובדת חלל:</b> ${lesson.spaceFact}`;
  document.querySelector('.side-card h2').insertAdjacentHTML('afterend', '<div class="stars-progress" id="stars-progress" aria-live="polite"></div>');
  renderStarsProgress();
  renderGuide();

  if (lesson.id === 5) {
    document.querySelector('.controls').insertAdjacentHTML('beforeend', '<button class="control" data-cmd="broadcast">📡 שדר שלום</button>');
  }

  document.querySelectorAll('[data-cmd]').forEach((button) => {
    button.addEventListener('click', () => {
      program.push(button.dataset.cmd);
      renderProgram();
      window.SisiSuccessDialog?.clear();
      setResult('');
    });
  });

  document.getElementById('run').addEventListener('click', runProgram);
  document.getElementById('undo').addEventListener('click', () => { program.pop(); renderProgram(); window.SisiSuccessDialog?.clear(); setResult(''); });
  document.getElementById('clear').addEventListener('click', () => {
    window.SisiSuccessDialog?.clear();
    repeatCurrentLesson();
  });
  document.getElementById('demo').addEventListener('click', () => { program = [...lesson.commands]; renderProgram(); resetRobot(); window.SisiSuccessDialog?.clear(); setResult('פתרון לדוגמה נטען. עכשיו לחצו הרצה.'); });

  document.getElementById('lesson-nav').innerHTML = lessons.map((item) => `
    <a class="${item.id === lesson.id ? 'active' : ''}" href="space-play.html?lesson=${item.id}">${item.id}</a>
  `).join('');

  renderGrid();
  renderProgram();
}

init();
