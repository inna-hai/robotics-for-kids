const params = new URLSearchParams(location.search);
const lessonId = Number(params.get('lesson') || 1);
const lessons = window.ART_LESSONS || [];
const colors = window.ART_COLORS || {};
const lesson = lessons.find((item) => item.id === lessonId) || lessons[0];
let selectedCommands = [];

function keyOf(command) {
  return `${command.row}:${command.col}:${command.color}`;
}

function commandLabel(command) {
  const color = colors[command.color] || { label: command.color, emoji: '⬛' };
  return `${color.emoji} שורה ${command.row}, עמודה ${command.col} — ${color.label}`;
}

function setResult(text, success = false) {
  const result = document.getElementById('result');
  result.textContent = text;
  result.style.color = success ? '#047857' : '#7c2d12';
}

function cellStyle(command) {
  const color = colors[command.color];
  return color ? `style="background:${color.hex}"` : '';
}

function renderBoard(containerId, commands, label) {
  const commandMap = new Map(commands.map((command) => [`${command.row}:${command.col}`, command]));
  const cells = [];
  for (let row = 1; row <= lesson.size; row += 1) {
    for (let col = 1; col <= lesson.size; col += 1) {
      const command = commandMap.get(`${row}:${col}`);
      const text = command ? colors[command.color].emoji : '';
      cells.push(`<div class="pixel-cell" ${command ? cellStyle(command) : ''} aria-label="${label}: שורה ${row}, עמודה ${col}">${text}</div>`);
    }
  }
  const board = document.getElementById(containerId);
  board.style.gridTemplateColumns = `repeat(${lesson.size}, 1fr)`;
  board.innerHTML = cells.join('');
}

function shuffledCommands() {
  const all = [...lesson.target, ...lesson.distractors];
  return all.map((command, index) => ({ ...command, sortKey: (command.row * 7 + command.col * 3 + index * 5) % 17 }))
    .sort((a, b) => a.sortKey - b.sortKey)
    .map(({ sortKey, ...command }) => command);
}

function renderCommands() {
  const selectedKeys = new Set(selectedCommands.map(keyOf));
  document.getElementById('commands').innerHTML = shuffledCommands().map((command) => {
    const key = keyOf(command);
    return `<button type="button" class="command-card ${selectedKeys.has(key) ? 'active' : ''}" data-key="${key}">
      <span class="command-icon">${colors[command.color].emoji}</span>
      <span>${commandLabel(command)}</span>
    </button>`;
  }).join('');
  document.querySelectorAll('[data-key]').forEach((button) => {
    button.addEventListener('click', () => toggleCommand(button.dataset.key));
  });
}

function toggleCommand(key) {
  const all = [...lesson.target, ...lesson.distractors];
  const command = all.find((item) => keyOf(item) === key);
  if (!command) return;
  if (selectedCommands.some((item) => keyOf(item) === key)) {
    selectedCommands = selectedCommands.filter((item) => keyOf(item) !== key);
  } else {
    selectedCommands.push(command);
  }
  renderCommands();
  renderBoard('my-board', selectedCommands, 'הציור שלי');
  renderSelectedList();
  renderNextStep(false);
  setResult('');
}

function renderSelectedList() {
  const list = document.getElementById('selected-list');
  if (!selectedCommands.length) {
    list.innerHTML = '<li>עדיין לא נבחרו הוראות.</li>';
    return;
  }
  list.innerHTML = selectedCommands.map((command) => `<li>${commandLabel(command)}</li>`).join('');
}

function checkArtwork() {
  const targetKeys = new Set(lesson.target.map(keyOf));
  const selectedKeys = new Set(selectedCommands.map(keyOf));
  const missing = [...targetKeys].filter((key) => !selectedKeys.has(key));
  const extra = [...selectedKeys].filter((key) => !targetKeys.has(key));
  if (!selectedCommands.length) {
    setResult('בחרו קודם כמה הוראות ציור.');
    return;
  }
  if (missing.length === 0 && extra.length === 0) {
    setResult('בול! הציור שלכם תואם לתמונה של סיסי 🎨', true);
    renderNextStep(true);
    return;
  }
  const parts = [];
  if (missing.length) parts.push(`חסרות ${missing.length} הוראות`);
  if (extra.length) parts.push(`יש ${extra.length} הוראות מיותרות`);
  setResult(`${parts.join(' וגם ')}. הסתכלו שוב על לוח המטרה ותקנו.`);
  renderNextStep(false);
}

function showHint() {
  const firstMissing = lesson.target.find((command) => !selectedCommands.some((item) => keyOf(item) === keyOf(command)));
  if (firstMissing) {
    setResult(`רמז: נסו להוסיף ${commandLabel(firstMissing)}.`);
  } else {
    setResult('רמז: אולי בחרתם הוראה שלא קיימת בציור המטרה?');
  }
  renderNextStep(false);
}

function resetArtwork() {
  selectedCommands = [];
  renderCommands();
  renderBoard('my-board', selectedCommands, 'הציור שלי');
  renderSelectedList();
  renderNextStep(false);
  setResult('');
}

function nextTarget() {
  const currentIndex = lessons.findIndex((item) => item.id === lesson.id);
  const nextLesson = lessons[currentIndex + 1];
  if (nextLesson) return { href: `art-play.html?lesson=${nextLesson.id}`, label: `➡️ המשך לציור ${nextLesson.id}` };
  return { href: 'sisi.html', label: '🤖 חזרה לכל שיעורי סיסי' };
}

function renderNextStep(show = false) {
  const box = document.getElementById('next-step');
  if (!box) return;
  if (!show) { box.innerHTML = ''; return; }
  const target = nextTarget();
  box.innerHTML = `<div class="next-step-note">מעולה — ממשיכים ברצף השיעור לאתגר הבא.</div><a class="btn" href="${target.href}">${target.label}</a>`;
}

function init() {
  document.getElementById('page-title').textContent = `${lesson.emoji} ${lesson.title}`;
  document.getElementById('page-subtitle').textContent = `שיעור 7 • ציור פיקסלים • ${lesson.concept}`;
  document.getElementById('lesson-heading').textContent = `ציור ${lesson.id}: ${lesson.title}`;
  document.getElementById('lesson-emoji').textContent = lesson.emoji;
  document.getElementById('mission').textContent = lesson.mission;
  document.getElementById('learning-note').innerHTML = `<b>רגע למידה:</b> ${lesson.learningNote}`;
  document.getElementById('check').addEventListener('click', checkArtwork);
  document.getElementById('hint').addEventListener('click', showHint);
  document.getElementById('clear').addEventListener('click', resetArtwork);
  document.getElementById('lesson-nav').innerHTML = lessons.map((item) => `<a class="${item.id === lesson.id ? 'active' : ''}" href="art-play.html?lesson=${item.id}">${item.id}</a>`).join('');
  renderBoard('target-board', lesson.target, 'ציור המטרה');
  renderBoard('my-board', selectedCommands, 'הציור שלי');
  renderCommands();
  renderSelectedList();
  renderNextStep(false);
}

init();
