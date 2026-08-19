const params = new URLSearchParams(location.search);
const lessonId = Number(params.get('lesson') || 1);
const lessons = window.MAIL_LESSONS || [];
const routes = window.MAIL_ROUTES || {};
const lesson = lessons.find((item) => item.id === lessonId) || lessons[0];
let selectedRoute = null;
let mailPosition = { x: 5, y: 3 };
let lastStepBlocked = false;

const mazeSize = { cols: 9, rows: 5 };
const mailboxPositions = {
  library: { x: 1, y: 1 },
  garden: { x: 5, y: 1 },
  music: { x: 9, y: 1 },
  lab: { x: 1, y: 5 },
  kitchen: { x: 5, y: 5 },
  park: { x: 9, y: 5 }
};
const blockedCells = new Set(['2,2', '4,2', '6,2', '8,2', '2,4', '4,4', '6,4', '8,4']);
const moves = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  right: { x: 1, y: 0 },
  left: { x: -1, y: 0 }
};

function key(pos) { return `${pos.x},${pos.y}`; }
function same(a, b) { return a.x === b.x && a.y === b.y; }
function inside(pos) { return pos.x >= 1 && pos.x <= mazeSize.cols && pos.y >= 1 && pos.y <= mazeSize.rows; }
function routeAt(pos) { return Object.entries(mailboxPositions).find(([, mailbox]) => same(pos, mailbox))?.[0] || null; }

function selectRoute(routeId) {
  selectedRoute = routeId;
  renderRouteOptions();
  renderRoutePreview();
  renderMailMaze();
  renderNextStep(false);
  setResult('');
}

function setResult(text, success = false) {
  const result = document.getElementById('result');
  result.textContent = text;
  result.style.color = success ? '#15803d' : '#1d4ed8';
}

function animateMailGame(success) {
  const maze = document.getElementById('mail-maze');
  const activeCell = document.querySelector('.mail-cell.mail-current');
  if (!maze || !activeCell) return;
  maze.classList.toggle('mail-maze-success', success);
  activeCell.classList.remove('mail-sent', 'mail-wrong');
  void activeCell.offsetWidth;
  activeCell.classList.add(success ? 'mail-sent' : 'mail-wrong');
}

function renderRouteOptions() {
  document.getElementById('route-options').innerHTML = Object.entries(routes).map(([id, route]) => `
    <button type="button" class="route-card mail-route-card ${selectedRoute === id ? 'active' : ''}" data-route="${id}">
      <span class="route-icon mail-route-icon">${route.icon}</span>
      <span class="route-card-text"><b>${route.label}</b><small>${route.reason}</small></span>
    </button>
  `).join('');
  document.querySelectorAll('[data-route]').forEach((button) => {
    button.addEventListener('click', () => {
      selectRoute(button.dataset.route);
      mailPosition = { ...(mailboxPositions[selectedRoute] || mailPosition) };
      renderMailMaze();
    });
  });
}

function renderMailMaze() {
  const maze = document.getElementById('mail-maze');
  if (!maze) return;
  const cells = [];
  for (let y = 1; y <= mazeSize.rows; y += 1) {
    for (let x = 1; x <= mazeSize.cols; x += 1) {
      const pos = { x, y };
      const routeId = routeAt(pos);
      const route = routeId ? routes[routeId] : null;
      const isBlocked = blockedCells.has(key(pos));
      const isCurrent = same(pos, mailPosition);
      const isCorrectMailbox = routeId === lesson.route;
      cells.push(`
        <div class="mail-cell ${isBlocked ? 'mail-blocked' : ''} ${routeId ? 'mail-target' : ''} ${isCorrectMailbox ? 'mail-correct-target' : ''} ${selectedRoute === routeId ? 'active' : ''} ${isCurrent ? 'mail-current' : ''}" data-maze-route="${routeId || ''}">
          ${route ? `<span class="maze-mailbox-icon">${route.icon}</span><span class="maze-mailbox-label">${route.label}</span>` : ''}
          ${isBlocked ? '<span class="maze-block">🚧</span>' : ''}
          ${isCurrent ? '<span class="maze-envelope">✉️</span>' : ''}
        </div>
      `);
    }
  }
  maze.innerHTML = cells.join('');
}

function renderRoutePreview() {
  const route = selectedRoute ? routes[selectedRoute] : null;
  document.getElementById('route-preview').innerHTML = route
    ? `<span>${lesson.emoji}</span><b>הרמז:</b><span>${lesson.clue}</span><b>שליחה אל:</b><span>${route.icon} ${route.label}</span><b>למה?</b><span>${route.reason}</span>`
    : `<span>${lesson.emoji}</span><b>הרמז:</b><span>${lesson.clue}</span><b>שליחה אל:</b><span>הוליכו לתיבה</span>`;
}

function checkRoute() {
  if (!selectedRoute) {
    setResult('צריך להוליך את המעטפה לתיבה או לבחור יעד לפני ששולחים.');
    return;
  }
  if (selectedRoute === lesson.route) {
    animateMailGame(true);
    setResult(`נכון! ${lesson.result} ✉️`, true);
    window.SisiCourseCertificate?.show({ lessons, lesson });
    renderNextStep(true);
  } else {
    animateMailGame(false);
    setResult('כמעט. היעד לא מתאים לרמזים שעל ההודעה. החזירו את המעטפה ונסו תיבה אחרת.');
    renderNextStep(false);
  }
}

function moveEnvelope(direction) {
  const delta = moves[direction];
  if (!delta) return;
  const next = { x: mailPosition.x + delta.x, y: mailPosition.y + delta.y };
  lastStepBlocked = false;
  document.getElementById('mail-maze')?.classList.remove('mail-maze-success');
  if (!inside(next) || blockedCells.has(key(next))) {
    lastStepBlocked = true;
    renderMailMaze();
    setResult('יש חסימה במסלול. נסו חץ אחר.');
    return;
  }
  mailPosition = next;
  const routeId = routeAt(mailPosition);
  if (routeId) {
    selectedRoute = routeId;
    renderRouteOptions();
    renderRoutePreview();
    renderMailMaze();
    checkRoute();
  } else {
    renderMailMaze();
    setResult('');
  }
}

function showHint() {
  const route = routes[lesson.route];
  setResult(`רמז: ${route.hint}. קראו שוב את ההודעה ובדקו איזה יעד הכי מתאים.`);
  renderNextStep(false);
}

function clearRoute() {
  selectedRoute = null;
  document.getElementById('mail-maze')?.classList.remove('mail-maze-success');
  mailPosition = { x: 5, y: 3 };
  lastStepBlocked = false;
  renderRouteOptions();
  renderRoutePreview();
  renderMailMaze();
  renderNextStep(false);
  setResult('');
}

function nextTarget() {
  const currentIndex = lessons.findIndex((item) => item.id === lesson.id);
  const nextLesson = lessons[currentIndex + 1];
  if (nextLesson) return { href: `mail-play.html?lesson=${nextLesson.id}`, label: `➡️ המשך לדואר ${nextLesson.id}` };
  return { href: 'cinema.html', label: '🎬 לשיעור הבא' };
}

function renderNextStep(show = false) {
  const box = document.getElementById('next-step');
  if (!box) return;
  if (!show) { box.innerHTML = ''; return; }
  const target = nextTarget();
  box.innerHTML = `<div class="next-step-note">הדואר נותב נכון! <span class="mailbox-stamp">נשלח בהצלחה</span><br>ממשיכים להודעה הבאה.</div><a class="btn" href="${target.href}">${target.label}</a>`;
  window.SisiSuccessDialog?.show({ message: 'הדואר נותב נכון! נשלח בהצלחה. ממשיכים להודעה הבאה.', lessons, lesson, nextHref: target.href, nextLabel: target.label, onRepeat: () => window.location.reload() });
}

function init() {
  document.getElementById('page-title').textContent = `${lesson.emoji} ${lesson.title}`;
  document.getElementById('page-subtitle').textContent = `שיעור 12 • ניתוב לפי רמזים • ${lesson.concept}`;
  document.getElementById('lesson-heading').textContent = `דואר ${lesson.id}: ${lesson.title}`;
  document.getElementById('lesson-emoji').textContent = lesson.emoji;
  document.getElementById('message').textContent = lesson.message;
  document.getElementById('clue-chip').textContent = lesson.clue;
  document.getElementById('learning-note').innerHTML = `<b>רגע למידה:</b> ${lesson.learningNote}`;
  document.getElementById('check').addEventListener('click', checkRoute);
  document.getElementById('hint').addEventListener('click', showHint);
  document.getElementById('clear').addEventListener('click', clearRoute);
  document.querySelectorAll('[data-move]').forEach((button) => button.addEventListener('click', () => moveEnvelope(button.dataset.move)));
  document.addEventListener('keydown', (event) => {
    const keyMap = { ArrowUp: 'up', ArrowDown: 'down', ArrowRight: 'right', ArrowLeft: 'left' };
    if (!keyMap[event.key]) return;
    event.preventDefault();
    moveEnvelope(keyMap[event.key]);
  });
  document.getElementById('lesson-nav').innerHTML = lessons.map((item) => `<a class="${item.id === lesson.id ? 'active' : ''}" href="mail-play.html?lesson=${item.id}">${item.id}</a>`).join('');
  renderRouteOptions();
  renderRoutePreview();
  renderMailMaze();
  renderNextStep(false);
}

init();