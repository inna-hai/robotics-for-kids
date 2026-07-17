const labels = { up: '⬆️', down: '⬇️', right: '➡️', left: '⬅️' };
const moves = { up: [0, -1], down: [0, 1], right: [1, 0], left: [-1, 0] };

const params = new URLSearchParams(location.search);
const lessonId = Number(params.get('lesson') || 1);
const lessons = window.SPACE_LESSONS || [];
const lesson = lessons.find((item) => item.id === lessonId) || lessons[0];
let program = [];
let robot = { ...lesson.start };
let collected = new Set();
let collectedItems = new Set();

function key(pos) { return `${pos.x},${pos.y}`; }
function same(a, b) { return a.x === b.x && a.y === b.y; }
function isObstacle(pos) { return lesson.obstacles.some((item) => same(item, pos)); }
function inside(pos) { return pos.x >= 1 && pos.x <= 6 && pos.y >= 1 && pos.y <= 5; }
function requiredItems() { return lesson.requiredItems || []; }
function requiredAt(pos) { return requiredItems().find((item) => same(item.position, pos)); }
function hasAllRequiredItems() { return requiredItems().every((item) => collectedItems.has(item.id)); }
function requiredItemsText() { return requiredItems().map((item) => `${item.icon} ${item.label}`).join(', '); }

function obstacleIcon() {
  if (lesson.id === 4) return '🔥';
  if (lesson.id === 6) return '☄️';
  return '🪨';
}

function goalIcon() { return lesson.id === 5 ? '👽' : '🏁'; }

function renderGuide() {
  const required = requiredItems();
  const extra = required.length ? required.map((item) => `<span class="guide-chip"><b>${item.icon}</b> ${item.label} — חובה לפני הסיום</span>`).join('') : '';
  document.getElementById('space-guide').innerHTML = `
    <span class="guide-chip"><b>🤖</b> סיסי</span>
    <span class="guide-chip"><b>${obstacleIcon()}</b> מכשול אדום — אסור להיתקע</span>
    <span class="guide-chip"><b>${goalIcon()}</b> יעד ירוק — לשם מגיעים בסוף</span>
    <span class="guide-chip"><b>⭐</b> כוכב בונוס — לא חובה, מוסיף אתגר</span>
    ${extra}
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
        cell.textContent = '🤖';
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

function resetRobot() {
  robot = { ...lesson.start };
  collected = new Set();
  collectedItems = new Set();
  renderGrid();
}

function step(cmd) {
  const [dx, dy] = moves[cmd];
  const next = { x: robot.x + dx, y: robot.y + dy };
  if (!inside(next)) return { ok: false, reason: 'סיסי כמעט יצאה מהחלל של המשחק. צריך להישאר בתוך הלוח 🙂' };
  if (isObstacle(next)) return { ok: false, reason: 'אופס, יש מכשול בדרך. נסו מסלול אחר.' };
  robot = next;
  if (lesson.stars.some((star) => same(star, robot))) collected.add(key(robot));
  const item = requiredAt(robot);
  if (item) collectedItems.add(item.id);
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
      setResult(outcome.reason);
      return;
    }
    if (outcome.message) setResult(outcome.message, true);
  }
  if (same(robot, lesson.goal) && !hasAllRequiredItems()) {
    setResult(`כמעט! לפני שמסיימים צריך לאסוף: ${requiredItemsText()}.`);
    return;
  }
  if (same(robot, lesson.goal)) {
    const bonus = collected.size ? ` וגם אספה ${collected.size} כוכבים!` : '!';
    setResult(`יש! סיסי הגיעה ליעד${bonus}`, true);
    window.SisiCourseCertificate?.show({ lessons, lesson });
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
  renderGuide();

  document.querySelectorAll('[data-cmd]').forEach((button) => {
    button.addEventListener('click', () => {
      program.push(button.dataset.cmd);
      renderProgram();
      setResult('');
    });
  });

  document.getElementById('run').addEventListener('click', runProgram);
  document.getElementById('undo').addEventListener('click', () => { program.pop(); renderProgram(); setResult(''); });
  document.getElementById('clear').addEventListener('click', () => {
    program = [];
    renderProgram();
    resetRobot();
    window.SisiCourseCertificate?.clear();
    setResult('המשימה אופסה. אפשר לבנות מסלול מחדש.');
  });
  document.getElementById('demo').addEventListener('click', () => { program = [...lesson.commands]; renderProgram(); resetRobot(); setResult('פתרון לדוגמה נטען. עכשיו לחצו הרצה.'); });

  document.getElementById('lesson-nav').innerHTML = lessons.map((item) => `
    <a class="${item.id === lesson.id ? 'active' : ''}" href="space-play.html?lesson=${item.id}">${item.id}</a>
  `).join('');

  renderGrid();
  renderProgram();
}

init();
