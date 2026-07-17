const params = new URLSearchParams(location.search);
const lessonId = Number(params.get('lesson') || 1);
const lessons = window.GARDEN_LESSONS || [];
const actions = window.GARDEN_ACTIONS || {};
const lesson = lessons.find((item) => item.id === lessonId) || lessons[0];
let selectedAction = null;

function setResult(text, success = false) {
  const result = document.getElementById('result');
  result.textContent = text;
  result.style.color = success ? '#15803d' : '#365314';
}

function renderActionOptions() {
  document.getElementById('action-options').innerHTML = Object.entries(actions).map(([id, action]) => `
    <button type="button" class="action-card ${selectedAction === id ? 'active' : ''}" data-action="${id}">
      <span class="action-icon">${action.icon}</span><span>${action.label}</span>
    </button>
  `).join('');
  document.querySelectorAll('[data-action]').forEach((button) => {
    button.addEventListener('click', () => {
      selectedAction = button.dataset.action;
      renderActionOptions();
      renderChoicePreview();
      renderNextStep(false);
      setResult('');
    });
  });
}

function renderChoicePreview() {
  const action = selectedAction ? actions[selectedAction] : null;
  document.getElementById('choice-preview').innerHTML = action
    ? `<span>${lesson.emoji}</span><b>השלב:</b><span>${lesson.plantStage}</span><b>הפעולה:</b><span>${action.icon} ${action.label}</span>`
    : `<span>${lesson.emoji}</span><b>השלב:</b><span>${lesson.plantStage}</span><b>הפעולה:</b><span>בחרו פעולה מתאימה</span>`;
}

function renderGrowthPath() {
  document.getElementById('growth-path').innerHTML = lessons.map((item) => `
    <a class="growth-step ${item.id === lesson.id ? 'active' : ''}" href="garden-play.html?lesson=${item.id}">
      <span>${item.emoji}</span><small>${item.id}</small>
    </a>
  `).join('');
}

function checkAction() {
  if (!selectedAction) {
    setResult('צריך לבחור פעולה לגינה לפני הבדיקה.');
    return;
  }
  if (selectedAction === lesson.answer) {
    setResult(`נכון! ${actions[selectedAction].label}. ${lesson.result} 🌼`, true);
    renderNextStep(true);
  } else {
    setResult('כמעט. הפעולה לא מתאימה לשלב הנוכחי של הצמח. קראו שוב מה מצב הגינה.');
    renderNextStep(false);
  }
}

function showHint() {
  const answer = actions[lesson.answer];
  setResult(`רמז: בשלב הזה הכי מתאים/ה — ${answer.icon} ${answer.label}.`);
  renderNextStep(false);
}

function clearChoice() {
  selectedAction = null;
  renderActionOptions();
  renderChoicePreview();
  renderNextStep(false);
  setResult('');
}

function nextTarget() {
  const currentIndex = lessons.findIndex((item) => item.id === lesson.id);
  const nextLesson = lessons[currentIndex + 1];
  if (nextLesson) return { href: `garden-play.html?lesson=${nextLesson.id}`, label: `➡️ המשך לשלב ${nextLesson.id}` };
  return { href: 'sisi.html', label: '🤖 חזרה לכל שיעורי סיסי' };
}

function renderNextStep(show = false) {
  const box = document.getElementById('next-step');
  if (!box) return;
  if (!show) { box.innerHTML = ''; return; }
  const target = nextTarget();
  box.innerHTML = `<div class="next-step-note">הגינה התקדמה שלב! ממשיכים לשלב הבא במחזור החיים.</div><a class="btn" href="${target.href}">${target.label}</a>`;
}

function init() {
  document.getElementById('page-title').textContent = `${lesson.emoji} ${lesson.title}`;
  document.getElementById('page-subtitle').textContent = `שיעור 10 • רצף ושלבי גדילה • ${lesson.concept}`;
  document.getElementById('lesson-heading').textContent = `שלב ${lesson.id}: ${lesson.title}`;
  document.getElementById('lesson-emoji').textContent = lesson.emoji;
  document.getElementById('story').textContent = lesson.story;
  document.getElementById('stage').textContent = lesson.plantStage;
  document.getElementById('learning-note').innerHTML = `<b>רגע למידה:</b> ${lesson.learningNote}`;
  document.getElementById('check').addEventListener('click', checkAction);
  document.getElementById('hint').addEventListener('click', showHint);
  document.getElementById('clear').addEventListener('click', clearChoice);
  document.getElementById('lesson-nav').innerHTML = lessons.map((item) => `<a class="${item.id === lesson.id ? 'active' : ''}" href="garden-play.html?lesson=${item.id}">${item.id}</a>`).join('');
  renderActionOptions();
  renderChoicePreview();
  renderGrowthPath();
  renderNextStep(false);
}

init();
