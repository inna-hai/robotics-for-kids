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
}

render();
