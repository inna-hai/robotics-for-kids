const lessons = window.LUMI_LESSONS || [];
const params = new URLSearchParams(window.location.search);
const lessonId = Number(params.get('lesson') || '1');
const lesson = lessons.find((item) => item.id === lessonId) || lessons[0];
const $ = (id) => document.getElementById(id);
const storageKey = 'lumi-nature-progress-v1';
let taskIndex = 0;
let stars = 0;
let solved = new Set();

function readProgress() {
  try { return JSON.parse(localStorage.getItem(storageKey) || '{}'); } catch { return {}; }
}
function writeProgress(progress) { localStorage.setItem(storageKey, JSON.stringify(progress)); }
function saveLessonComplete() {
  const progress = readProgress();
  progress[lesson.id] = { sticker: lesson.sticker, stickerName: lesson.stickerName, completedAt: new Date().toISOString(), stars };
  writeProgress(progress);
  try {
    window.StudentProgress?.save?.({ courseId: 'lumi-nature', lessonId: String(lesson.id), activityId: `station-${lesson.id}`, status: 'completed', score: 100, metadata: { stars, sticker: lesson.sticker } });
  } catch {}
}
function stickers() {
  const progress = readProgress();
  return Object.keys(progress).sort((a,b)=>Number(a)-Number(b)).map((key) => progress[key]);
}
function ui() {
  $('lesson-pill').textContent = `תחנה ${lesson.id} · ${lesson.title}`;
  $('lesson-story').textContent = lesson.story;
  $('stars').textContent = stars;
  $('done').textContent = Math.min(taskIndex, lesson.tasks.length);
  $('total').textContent = lesson.tasks.length;
  $('bar').style.width = `${Math.min(100, taskIndex / lesson.tasks.length * 100)}%`;
  const collected = stickers();
  $('stickers').innerHTML = collected.length ? collected.map((s) => `<span class="sticker" title="${s.stickerName || 'מדבקה'}">${s.sticker}</span>`).join('') : '<span class="lead" style="font-size:.95rem">עוד אין מדבקות. בואו נתחיל!</span>';
}
function sparkle() {
  for (let i = 0; i < 8; i++) {
    const s = document.createElement('div');
    s.className = 'spark';
    s.textContent = ['✨','🍃','⭐','🌼'][i % 4];
    s.style.left = `${30 + Math.random() * 40}vw`;
    s.style.top = `${42 + Math.random() * 28}vh`;
    document.body.appendChild(s);
    setTimeout(() => s.remove(), 900);
  }
}
function setResult(text, ok = false) {
  const el = $('result');
  if (el) el.textContent = text;
  if (ok) sparkle();
}
function shuffled(items) {
  return [...items].sort(() => Math.random() - 0.5);
}
function choose(correct, message) {
  if (solved.has(taskIndex)) return;
  if (correct) {
    solved.add(taskIndex);
    stars += 1;
    setResult(message || 'נכון! לומי מוסיפה תצפית למחברת.', true);
    document.querySelectorAll('.option').forEach((button) => button.disabled = true);
    setTimeout(() => { taskIndex += 1; render(); }, 950);
  } else {
    setResult(message || 'כמעט. נחפש שוב לפי הרמזים.');
  }
  ui();
}
function renderClassify(task) {
  $('host').innerHTML = `<div class="task-card"><div class="task-title">${lesson.icon} ${lesson.title}</div><p class="task-text">${task.prompt}</p><p class="lead">רמז: ${task.hint}</p><div class="options" id="options"></div><div class="result" id="result"></div></div>`;
  const options = shuffled(task.options);
  $('options').innerHTML = options.map((option) => `<button class="option" data-id="${option.id}"><span class="emoji">${option.emoji}</span>${option.label}</button>`).join('');
  document.querySelectorAll('.option').forEach((button) => {
    button.addEventListener('click', () => {
      const option = task.options.find((item) => item.id === button.dataset.id);
      const ok = option.id === task.answer;
      button.classList.add(ok ? 'good' : 'bad');
      choose(ok, option.why);
    });
  });
}
function renderPattern(task) {
  $('host').innerHTML = `<div class="task-card"><div class="task-title">${lesson.icon} ${lesson.title}</div><p class="task-text">${task.prompt}</p><div class="pattern">${task.sequence.map((item) => `<span>${item}</span>`).join('')}</div><div class="options" id="options"></div><div class="result" id="result"></div></div>`;
  const options = shuffled(task.options);
  $('options').innerHTML = options.map((value) => `<button class="option" data-value="${value}"><span class="emoji">${value}</span>זה מתאים</button>`).join('');
  document.querySelectorAll('.option').forEach((button) => {
    button.addEventListener('click', () => {
      const ok = button.dataset.value === task.answer;
      button.classList.add(ok ? 'good' : 'bad');
      choose(ok, ok ? `נכון! ${task.why}` : 'כמעט. בואו נסתכל על הדפוס מההתחלה.');
    });
  });
}
function renderCondition(task) {
  const visual = task.condition
    ? `<div class="pattern" dir="rtl"><span>${task.condition}</span><span>⬅️</span><span>?</span></div>`
    : `<p class="lead">רמז: ${task.hint || 'בחרו את הפעולה שהכי מתקנת את האלגוריתם.'}</p>`;
  $('host').innerHTML = `<div class="task-card"><div class="task-title">${lesson.icon} ${lesson.title}</div><p class="task-text">${task.prompt}</p>${visual}<div class="options" id="options"></div><div class="result" id="result"></div></div>`;
  const options = shuffled(task.options);
  $('options').innerHTML = options.map((option) => `<button class="option" data-id="${option.id}"><span class="emoji">${option.emoji}</span>${option.label}</button>`).join('');
  document.querySelectorAll('.option').forEach((button) => {
    button.addEventListener('click', () => {
      const option = task.options.find((item) => item.id === button.dataset.id);
      const ok = option.id === task.answer;
      button.classList.add(ok ? 'good' : 'bad');
      choose(ok, option.why);
    });
  });
}
function renderRoute(task) {
  const directions = [
    { id: 'up', label: 'למעלה', icon: '⬆️', dx: 0, dy: -1 },
    { id: 'down', label: 'למטה', icon: '⬇️', dx: 0, dy: 1 },
    { id: 'left', label: 'שמאלה', icon: '⬅️', dx: -1, dy: 0 },
    { id: 'right', label: 'ימינה', icon: '➡️', dx: 1, dy: 0 },
  ];
  let program = [];
  const key = (p) => `${p.x},${p.y}`;
  const obstacles = new Set((task.obstacles || []).map(key));
  const drawMap = (position = task.start, trail = []) => {
    const trailSet = new Set(trail.map(key));
    $('route-map').innerHTML = Array.from({ length: 16 }, (_, index) => {
      const x = index % 4;
      const y = Math.floor(index / 4);
      const point = { x, y };
      let content = '🌿';
      let cls = 'route-cell';
      if (obstacles.has(key(point))) { content = '🪨'; cls += ' obstacle'; }
      if (trailSet.has(key(point))) cls += ' trail';
      if (x === task.goal.x && y === task.goal.y) { content = '🏁'; cls += ' target'; }
      if (x === position.x && y === position.y) { content = '🧒'; cls += ' hero'; }
      return `<div class="${cls}">${content}</div>`;
    }).join('');
  };
  const renderProgram = () => {
    $('route-program').innerHTML = program.length
      ? program.map((step, index) => `<button class="route-step" data-index="${index}" title="הסרה">${directions.find((d) => d.id === step).icon}</button>`).join('')
      : '<span class="lead">הוסיפו בלוקים של כיוון לכאן</span>';
    document.querySelectorAll('.route-step').forEach((button) => {
      button.addEventListener('click', () => {
        program.splice(Number(button.dataset.index), 1);
        renderProgram();
      });
    });
  };
  const runProgram = () => {
    let pos = { ...task.start };
    const trail = [pos];
    for (const step of program) {
      const dir = directions.find((d) => d.id === step);
      pos = { x: pos.x + dir.dx, y: pos.y + dir.dy };
      trail.push(pos);
      if (pos.x < 0 || pos.x > 3 || pos.y < 0 || pos.y > 3) {
        drawMap(task.start, []);
        return setResult('אופס, לומי יצאה מהמפה. מחקו בלוק ונסו שוב.');
      }
      if (obstacles.has(key(pos))) {
        drawMap(pos, trail);
        return setResult('בום קטן על אבן! צריך לתכנן עקיפה אחרת.');
      }
    }
    drawMap(pos, trail);
    const exact = program.join(',') === task.solution.join(',');
    const arrived = pos.x === task.goal.x && pos.y === task.goal.y;
    choose(arrived, arrived
      ? (exact ? 'מעולה! בניתם מסלול בלוקים מדויק ללומי.' : 'יפה! לומי הגיעה ליעד במסלול משלכם.')
      : 'לומי עוד לא הגיעה ליעד. הוסיפו או החליפו בלוקים.');
  };
  $('host').innerHTML = `<div class="task-card route-card"><div class="task-title">${lesson.icon} ${lesson.title}</div><p class="task-text">${task.prompt}</p><p class="lead">${task.goalText}</p><div class="route-layout"><div class="route-map" id="route-map"></div><div class="blockly-panel"><b>בלוקי ניווט</b><div class="block-palette" id="block-palette"></div><b>התוכנית שלי</b><div class="route-program" id="route-program"></div><div class="route-actions"><button class="btn green" id="run-route">▶️ הרצה</button><button class="btn yellow" id="clear-route">🧹 ניקוי</button></div></div></div><div class="result" id="result"></div></div>`;
  $('block-palette').innerHTML = directions.map((dir) => `<button class="nav-block" data-step="${dir.id}">${dir.icon}<span>${dir.label}</span></button>`).join('');
  document.querySelectorAll('.nav-block').forEach((button) => button.addEventListener('click', () => {
    if (program.length >= 8) return setResult('מסלול ארוך מדי. נסו לבנות תוכנית קצרה וברורה.');
    program.push(button.dataset.step);
    renderProgram();
  }));
  $('run-route').addEventListener('click', runProgram);
  $('clear-route').addEventListener('click', () => { program = []; drawMap(); renderProgram(); setResult('ניקינו את הבלוקים. אפשר לתכנן מחדש.'); });
  drawMap();
  renderProgram();
}
function finish() {
  saveLessonComplete();
  ui();
  $('host').innerHTML = '';
  $('summary').classList.add('active');
  $('summary-icon').textContent = lesson.sticker;
  $('summary-text').textContent = `אספתם ${stars} נקודות תצפית וקיבלתם ${lesson.stickerName}. לומי מוכנה להמשיך לתחנה הבאה!`;
  $('next-btn').onclick = () => {
    if (lesson.id >= lessons.length) window.location.href = 'lumi.html';
    else window.location.href = `lumi-play.html?lesson=${lesson.id + 1}`;
  };
  if (lesson.id >= lessons.length) $('next-btn').textContent = 'חזרה למפת המסע';
}
function render() {
  ui();
  $('summary').classList.remove('active');
  if (taskIndex >= lesson.tasks.length) return finish();
  const task = lesson.tasks[taskIndex];
  if (lesson.type === 'classify') renderClassify(task);
  else if (lesson.type === 'pattern') renderPattern(task);
  else if (lesson.type === 'condition') renderCondition(task);
  else if (lesson.type === 'route') renderRoute(task);
}

render();
