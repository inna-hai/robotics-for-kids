const labels = { up: '⬆️', down: '⬇️', right: '➡️', left: '⬅️' };
const moves = { up: [0, -1], down: [0, 1], right: [1, 0], left: [-1, 0] };

const params = new URLSearchParams(location.search);
const lessonId = Number(params.get('lesson') || 1);
const lessons = window.OCEAN_LESSONS || [];
const lesson = lessons.find((item) => item.id === lessonId) || lessons[0];
let program = [];
let robot = { ...lesson.start };
let collected = new Set();
let dolphinGuideStep = 0;
let lastDolphinGuideStep = -1;
let dolphinGuideTimer = null;
let movingDecorationTimer = null;
let movingDecorationTick = 0;
let passedCaveGate = false;
const pearlsStorageKey = 'sisi-ocean-pearls-best-v1';

function key(pos) { return `${pos.x},${pos.y}`; }
function same(a, b) { return a.x === b.x && a.y === b.y; }
function isObstacle(pos) { return lesson.obstacles.some((item) => same(item, pos)); }
function isDangerZone(pos) { return (lesson.dangerZones || []).some((item) => same(item, pos)); }
function isCaveGate(pos) { return lesson.caveGate && same(lesson.caveGate, pos); }
function movingDecorationPosition(item) {
  const positions = item.positions || [];
  if (!positions.length) return null;
  const pattern = item.pattern || [0, 1];
  const patternIndex = pattern[movingDecorationTick % pattern.length] || 0;
  return positions[Math.min(patternIndex, positions.length - 1)];
}
function movingDecorationPositions() {
  return (lesson.movingDecorations || []).map((item) => ({ ...item, ...movingDecorationPosition(item) })).filter((item) => item.x && item.y);
}
function decorationAt(pos) {
  return [...(lesson.decorations || []), ...movingDecorationPositions()].find((item) => same(item, pos));
}
function movingDecorationCells() {
  return (lesson.movingDecorations || []).flatMap((item) => item.positions || []);
}
function caveGateOpen() { return !lesson.caveGate || collectedRequired(); }
function passedRequiredCaveGate() { return !lesson.caveGate || passedCaveGate; }
function inside(pos) { return pos.x >= 1 && pos.x <= 6 && pos.y >= 1 && pos.y <= 5; }
function requiredCollectibles() { return [...(lesson.requiredCollectibles || []), ...(lesson.requiredCollectible ? [lesson.requiredCollectible] : [])]; }
function requiredWaypoints() { return lesson.requiredWaypoints || []; }
function requiredTargets() { return [...requiredCollectibles(), ...requiredWaypoints()]; }
function allCollectibles() { return [...(lesson.collectibles || []), ...requiredTargets()]; }
function requiredAt(pos) { return requiredTargets().find((item) => same(item, pos)); }
function isRequiredCollectible(pos) { return Boolean(requiredAt(pos)); }
function collectedRequired() { return requiredTargets().every((item) => collected.has(key(item))); }
function collectedRequiredIcons() { return requiredCollectibles().filter((item) => collected.has(key(item))).map((item) => item.icon || '🪙').join(''); }
function currentPearlsCount() {
  const requiredKeys = new Set(requiredTargets().map((item) => key(item)));
  return [...collected].filter((item) => !requiredKeys.has(item)).length;
}
function readPearlsProgress() {
  try {
    return JSON.parse(localStorage.getItem(pearlsStorageKey) || '{}');
  } catch {
    return {};
  }
}
function writePearlsProgress(progress) {
  try {
    localStorage.setItem(pearlsStorageKey, JSON.stringify(progress));
  } catch {
    // Progress is optional; the game should continue even if storage is unavailable.
  }
}
function totalSavedPearls() {
  return Object.values(readPearlsProgress()).reduce((sum, value) => sum + Number(value || 0), 0);
}
function renderPearlsProgress() {
  const pearlsProgress = document.getElementById('pearls-progress');
  if (!pearlsProgress) return;
  pearlsProgress.textContent = `🫧 פנינים שנאספו בשיעור האוקיינוס: ${totalSavedPearls()}`;
}
function currentDolphinGuidePos() {
  const path = lesson.dolphinGuidePath || [];
  return path.length ? path[dolphinGuideStep % path.length] : null;
}
function pickRandomDolphinGuideStep() {
  const path = lesson.dolphinGuidePath || [];
  if (path.length <= 1) return 0;
  let nextStep = Math.floor(Math.random() * path.length);
  if (nextStep === lastDolphinGuideStep) nextStep = (nextStep + 1) % path.length;
  return nextStep;
}
function saveBestPearlsForLesson() {
  const progress = readPearlsProgress();
  const lessonKey = String(lesson.id);
  const previousBest = Number(progress[lessonKey] || 0);
  const currentPearls = currentPearlsCount();
  if (currentPearls > previousBest) {
    progress[lessonKey] = currentPearls;
    writePearlsProgress(progress);
    renderPearlsProgress();
    return true;
  }
  return false;
}

function paintCell(cell, pos) {
  cell.className = 'cell';
  cell.textContent = '';
  cell.dataset.pos = key(pos);
  const guidePos = currentDolphinGuidePos();
  if (guidePos && same(guidePos, pos)) {
    cell.classList.add('dolphin-guide');
    cell.textContent = '🐬';
  }
  const decoration = decorationAt(pos);
  if (decoration) {
    cell.classList.add('decoration');
    cell.textContent = decoration.icon;
  }
  if (allCollectibles().some((star) => same(star, pos)) && !collected.has(key(pos))) cell.classList.add('collectible');
  if (isRequiredCollectible(pos) && !collected.has(key(pos))) {
    cell.classList.add('required-collectible');
    cell.textContent = requiredAt(pos)?.icon || '🪙';
  }
  if (isDangerZone(pos)) {
    cell.classList.add('danger-zone');
    cell.textContent = '⚠️';
  }
  if (isObstacle(pos)) {
    cell.classList.add('obstacle');
    cell.textContent = lesson.id === 4 ? '🦀' : lesson.id === 6 ? '🦈' : '🪨';
  }
  if (isCaveGate(pos)) {
    cell.classList.add(caveGateOpen() ? 'cave-gate-open' : 'cave-gate-closed');
    cell.textContent = caveGateOpen() ? '🕳️' : '🚪';
  }
  if (same(lesson.goal, pos)) {
    cell.classList.add('goal');
    cell.textContent = lesson.goalIcon || '🐚';
  }
  if (same(robot, pos)) {
    cell.classList.add('robot');
    cell.textContent = collectedRequiredIcons() ? `🤖${collectedRequiredIcons()}` : '🤖';
  }
}

function repaintCell(pos) {
  const cell = document.querySelector(`[data-pos="${key(pos)}"]`);
  if (cell) paintCell(cell, pos);
}

function renderGrid() {
  const grid = document.getElementById('grid');
  grid.innerHTML = '';
  for (let y = 1; y <= 5; y += 1) {
    for (let x = 1; x <= 6; x += 1) {
      const pos = { x, y };
      const cell = document.createElement('div');
      paintCell(cell, pos);
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
  passedCaveGate = false;
  renderGrid();
}

function step(cmd) {
  const [dx, dy] = moves[cmd];
  const next = { x: robot.x + dx, y: robot.y + dy };
  if (!inside(next)) return { ok: false, reason: 'סיסי כמעט יצאה מלוח האוקיינוס. צריך להישאר בתוך הלוח 🙂' };
  if (isObstacle(next)) return { ok: false, reason: 'אופס, יש מכשול בדרך. נסו מסלול אחר.' };
  if (isDangerZone(next)) return { ok: false, reason: 'זה קרוב מדי לסרטן. צריך לשמור מרחק ולבחור מסלול אחר.' };
  if (isCaveGate(next) && !caveGateOpen()) return { ok: false, reason: lesson.caveGateMessage || 'השער עדיין סגור. צריך לאסוף קודם את פריטי המפתח.' };
  if (decorationAt(next)?.blocked) return { ok: false, reason: lesson.blockedDecorationMessage || 'כמעט! צריך לבחור מסלול אחר.' };
  if (same(next, lesson.goal) && !passedRequiredCaveGate()) return { ok: false, reason: lesson.caveGateRequiredMessage || 'כמעט! צריך לעבור דרך שער המערה לפני שמגיעים ליעד.' };
  robot = next;
  if (isCaveGate(robot) && caveGateOpen()) passedCaveGate = true;
  if (allCollectibles().some((star) => same(star, robot))) collected.add(key(robot));
  renderGrid();
  return { ok: true };
}

function countDirectionChanges(commands) {
  let changes = 0;
  for (let index = 1; index < commands.length; index += 1) {
    if (commands[index] !== commands[index - 1]) changes += 1;
  }
  return changes;
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
  }
  if (same(robot, lesson.goal)) {
    if (!collectedRequired()) {
      const missing = requiredCollectibles().filter((item) => !collected.has(key(item)));
      setResult(lesson.requiredMissingMessage || missing[0]?.missingMessage || `כמעט! קודם צריך לאסוף את ${missing[0]?.name || 'הפריט'}, ורק אחר כך להגיע ליעד.`);
      return;
    }
    if (!passedRequiredCaveGate()) {
      setResult(lesson.caveGateRequiredMessage || 'כמעט! צריך לעבור דרך שער המערה לפני שמגיעים ליעד.');
      return;
    }
    const pearlCount = currentPearlsCount();
    const improvedPearls = saveBestPearlsForLesson();
    const requiredText = requiredTargets().length ? ` עם ${requiredTargets().map((item) => item.name).join(' ו')}` : '';
    const bonus = pearlCount ? ` וגם אספה ${pearlCount} פנינים!` : '!';
    const record = improvedPearls && pearlCount ? ` שיא חדש במשימה: ${pearlCount} פנינים 🫧` : '';
    const message = `יש! סיסי הגיעה ליעד${requiredText}${bonus}${record}`;
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
  document.getElementById('fact').innerHTML = `<b>עובדת ים:</b> ${lesson.oceanFact}`;
  document.querySelector('.side-card h2').insertAdjacentHTML('afterend', '<div class="pearls-progress" id="pearls-progress" aria-live="polite"></div>');
  renderPearlsProgress();

  if (lesson.dolphinGuidePath?.length) {
    dolphinGuideStep = pickRandomDolphinGuideStep();
    lastDolphinGuideStep = dolphinGuideStep;
    dolphinGuideTimer = setInterval(() => {
      const previousPos = currentDolphinGuidePos();
      dolphinGuideStep = pickRandomDolphinGuideStep();
      lastDolphinGuideStep = dolphinGuideStep;
      const nextPos = currentDolphinGuidePos();
      repaintCell(previousPos);
      repaintCell(nextPos);
    }, 650);
  }

  if (lesson.movingDecorations?.length) {
    movingDecorationTimer = setInterval(() => {
      const affectedCells = movingDecorationCells();
      movingDecorationTick += 1;
      affectedCells.forEach(repaintCell);
    }, 700);
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
  document.getElementById('clear').addEventListener('click', () => { window.SisiSuccessDialog?.clear(); repeatCurrentLesson(); });
  document.getElementById('demo').addEventListener('click', () => { program = [...lesson.commands]; renderProgram(); resetRobot(); window.SisiSuccessDialog?.clear(); setResult('פתרון לדוגמה נטען. עכשיו לחצו הרצה.'); });

  document.getElementById('lesson-nav').innerHTML = lessons.map((item) => `
    <a class="${item.id === lesson.id ? 'active' : ''}" href="ocean-play.html?lesson=${item.id}">${item.id}</a>
  `).join('');

  renderGrid();
  renderProgram();
}

init();
