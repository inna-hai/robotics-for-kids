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
function createDragHandlers(program, renderProgram, makeStep) {
  return {
    dragStart(event) { event.dataTransfer.setData('text/plain', event.currentTarget.dataset.step); },
    allowDrop(event) { event.preventDefault(); event.currentTarget.classList.add('drag-over'); },
    leaveDrop(event) { event.currentTarget.classList.remove('drag-over'); },
    drop(event) {
      event.preventDefault();
      event.currentTarget.classList.remove('drag-over');
      const step = event.dataTransfer.getData('text/plain');
      if (step) { program.push(makeStep(step)); renderProgram(); }
    }
  };
}
function renderBlockAlgorithm(task, mode) {
  let program = [];
  const isPattern = mode === 'pattern';
  const stepType = isPattern ? 'pattern' : 'option';
  const actionBlocks = isPattern
    ? [
      { id: 'observe-pattern', kind: 'action', icon: '👀', label: 'בודקים את הדפוס' },
      { id: 'repeat-rule', kind: 'action', icon: '🔁', label: 'ממשיכים את החוקיות' },
      { id: 'write-note', kind: 'action', icon: '📒', label: 'רושמים במחברת' },
    ]
    : [
      { id: 'observe-clues', kind: 'action', icon: '🔎', label: 'בודקים רמזים' },
      { id: 'if-then', kind: 'action', icon: '➡️', label: 'אם הרמז מתאים אז...' },
      { id: 'write-note', kind: 'action', icon: '📒', label: 'רושמים במחברת' },
    ];
  const answerBlocks = isPattern
    ? shuffled(task.options).map((value) => ({ id: value, kind: stepType, icon: value, label: `להוסיף ${value}` }))
    : shuffled(task.options).map((option) => ({ id: option.id, kind: stepType, icon: option.emoji, label: option.label, why: option.why }));
  const palette = [...actionBlocks, ...answerBlocks];
  const visual = isPattern
    ? `<div class="pattern">${task.sequence.map((item) => `<span>${item}</span>`).join('')}</div>`
    : (task.condition
      ? `<div class="pattern" dir="rtl"><span>${task.condition}</span><span>⬅️</span><span>?</span></div>`
      : `<p class="lead">רמז: ${task.hint || 'בנו סדר פעולות קטן שיעזור ללומי להחליט.'}</p>`);
  const guideText = isPattern
    ? 'גררו בלוקים לפי הסדר: בודקים דפוס → בוחרים את הסימן הבא → רושמים במחברת.'
    : 'גררו בלוקים לפי הסדר: בודקים רמזים → בוחרים מה מתאים → רושמים במחברת.';
  $('host').innerHTML = `<div class="task-card blocks-card"><div class="task-title">${lesson.icon} ${lesson.title}</div><p class="task-text">${task.prompt}</p><div class="block-guide">👆 ${guideText}</div>${visual}<div class="algorithm-layout"><div class="blockly-panel"><b>מחסן בלוקים — גררו מכאן</b><div class="block-help">סגול = פעולה · ירוק = תשובה/תוצאה</div><div class="block-palette wide" id="algo-palette"></div></div><div class="program-panel"><b>האלגוריתם שלי — שחררו כאן</b><div class="algo-program drop-zone" id="algo-program"><div class="empty-program"><span>1️⃣ בדיקה</span><span>2️⃣ החלטה</span><span>3️⃣ רישום במחברת</span></div></div><div class="route-actions"><button class="btn green" id="run-algo">▶️ בדיקה</button><button class="btn yellow" id="clear-algo">🧹 ניקוי</button></div></div></div><div class="result" id="result"></div></div>`;
  const renderProgram = () => {
    $('algo-program').innerHTML = program.length
      ? program.map((step, index) => `<button class="algo-step ${step.kind}" data-index="${index}" title="לחצו להסרה"><span>${step.icon}</span>${step.label}</button>`).join('')
      : '<div class="empty-program"><span>1️⃣ בדיקה</span><span>2️⃣ החלטה</span><span>3️⃣ רישום במחברת</span></div>';
    document.querySelectorAll('.algo-step').forEach((button) => button.addEventListener('click', () => {
      program.splice(Number(button.dataset.index), 1);
      renderProgram();
    }));
  };
  const makeStep = (id) => palette.find((block) => block.id === id);
  const dnd = createDragHandlers(program, renderProgram, makeStep);
  $('algo-palette').innerHTML = palette.map((block) => `<button class="nav-block algo-block ${block.kind}" draggable="true" data-step="${block.id}"><span>${block.icon}</span>${block.label}</button>`).join('');
  document.querySelectorAll('.algo-block').forEach((button) => {
    button.addEventListener('dragstart', dnd.dragStart);
    button.addEventListener('click', () => { program.push(makeStep(button.dataset.step)); renderProgram(); });
  });
  $('algo-program').addEventListener('dragover', dnd.allowDrop);
  $('algo-program').addEventListener('dragleave', dnd.leaveDrop);
  $('algo-program').addEventListener('drop', dnd.drop);
  $('clear-algo').addEventListener('click', () => { program = []; renderProgram(); setResult('ניקינו. אפשר לבנות אלגוריתם חדש.'); });
  $('run-algo').addEventListener('click', () => {
    const actions = program.map((step) => step.id);
    const hasStart = isPattern ? actions.includes('observe-pattern') : actions.includes('observe-clues') || actions.includes('if-then');
    const answerIndex = actions.indexOf(task.answer);
    const hasNoteAfter = actions.indexOf('write-note') > answerIndex;
    const pickedAnswers = program.filter((step) => step.kind === stepType).map((step) => step.id);
    const onlyOneAnswer = pickedAnswers.length === 1;
    if (program.length < 3) return setResult('האלגוריתם קצר מדי. צריך לפחות: בדיקה → החלטה → רישום.');
    if (!hasStart) return setResult('מה חסר בהתחלה? קודם נותנים ללומי לבדוק את הרמזים או הדפוס.');
    if (answerIndex === -1) return setResult('כמעט. הבלוק של ההחלטה עוד לא מתאים לסיפור. החליפו אותו ונסו שוב.');
    if (!onlyOneAnswer) return setResult('בחרתם כמה תשובות. באלגוריתם הזה צריך החלטה אחת ברורה.');
    if (!hasNoteAfter) return setResult('יפה, אבל בסוף לומי צריכה לרשום במחברת מה גילתה.');
    const correctBlock = answerBlocks.find((block) => block.id === task.answer);
    choose(true, isPattern ? `נכון! ${task.why}` : correctBlock?.why || 'נכון! האלגוריתם של לומי עובד.');
  });
  renderProgram();
}
function renderClassify(task) { renderBlockAlgorithm(task, 'classify'); }
function renderPattern(task) { renderBlockAlgorithm(task, 'pattern'); }
function renderCondition(task) { renderBlockAlgorithm(task, 'condition'); }
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
  const makeStep = (id) => directions.find((dir) => dir.id === id)?.id;
  const dnd = createDragHandlers(program, renderProgram, makeStep);
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
  $('block-palette').innerHTML = directions.map((dir) => `<button class="nav-block" draggable="true" data-step="${dir.id}">${dir.icon}<span>${dir.label}</span></button>`).join('');
  document.querySelectorAll('.nav-block').forEach((button) => button.addEventListener('click', () => {
    if (program.length >= 8) return setResult('מסלול ארוך מדי. נסו לבנות תוכנית קצרה וברורה.');
    program.push(button.dataset.step);
    renderProgram();
  }));
  document.querySelectorAll('.nav-block').forEach((button) => button.addEventListener('dragstart', dnd.dragStart));
  $('route-program').classList.add('drop-zone');
  $('route-program').addEventListener('dragover', dnd.allowDrop);
  $('route-program').addEventListener('dragleave', dnd.leaveDrop);
  $('route-program').addEventListener('drop', dnd.drop);
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
