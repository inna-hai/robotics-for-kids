const params = new URLSearchParams(location.search);
const lessonId = Number(params.get('lesson') || 1);
const lessons = window.FACTORY_LESSONS || [];
const actions = window.FACTORY_ACTIONS || {};
const counts = window.FACTORY_COUNTS || [];
const lesson = lessons.find((item) => item.id === lessonId) || lessons[0];
let selectedAction = null;
let selectedCount = null;

function setResult(text, success = false) {
  const result = document.getElementById('result');
  result.textContent = text;
  result.style.color = success ? '#15803d' : '#92400e';
}

function renderActionOptions() {
  document.getElementById('action-options').innerHTML = Object.entries(actions).map(([id, action]) => `
    <button type="button" class="option-card ${selectedAction === id ? 'active' : ''}" data-action="${id}">
      <span class="option-icon">${action.icon}</span><span>${action.label}</span>
    </button>
  `).join('');
  document.querySelectorAll('[data-action]').forEach((button) => {
    button.addEventListener('click', () => {
      selectedAction = button.dataset.action;
      renderAll();
    });
  });
}

function renderCountOptions() {
  document.getElementById('count-options').innerHTML = counts.map((count) => `
    <button type="button" class="count-card ${selectedCount === count ? 'active' : ''}" data-count="${count}">
      <span>חזור</span><b>${count}</b><span>פעמים</span>
    </button>
  `).join('');
  document.querySelectorAll('[data-count]').forEach((button) => {
    button.addEventListener('click', () => {
      selectedCount = Number(button.dataset.count);
      renderAll();
    });
  });
}

function renderLoopPreview() {
  const action = selectedAction ? actions[selectedAction] : null;
  const countText = selectedCount ? selectedCount : '?';
  const actionText = action ? `${action.icon} ${action.label}` : 'בחרו פעולה';
  document.getElementById('loop-preview').innerHTML = `
    <span class="loop-word">חזור</span>
    <span class="loop-count">${countText}</span>
    <span class="loop-word">פעמים</span>
    <span class="loop-action">${actionText}</span>
  `;
}

function renderFactoryLine() {
  const action = actions[lesson.action];
  const doneCount = selectedAction === lesson.action && selectedCount ? selectedCount : 0;
  const max = Math.max(lesson.count, doneCount, 3);
  const items = [];
  for (let i = 1; i <= max; i += 1) {
    const filled = i <= doneCount;
    items.push(`<div class="toy ${filled ? 'done' : ''}"><span>${filled ? action.icon : '⬜'}</span><small>${i}</small></div>`);
  }
  document.getElementById('factory-line').innerHTML = items.join('');
}

function renderAll() {
  renderActionOptions();
  renderCountOptions();
  renderLoopPreview();
  renderFactoryLine();
  renderNextStep(false);
  setResult('');
}

function runLoop() {
  if (!selectedAction || !selectedCount) {
    setResult('צריך לבחור גם פעולה וגם מספר חזרות.');
    return;
  }
  const actionOk = selectedAction === lesson.action;
  const countOk = selectedCount === lesson.count;
  renderFactoryLine();
  if (actionOk && countOk) {
    setResult(`מעולה! ${lesson.loopText}. ${lesson.result} 🎉`, true);
    renderNextStep(true);
    return;
  }
  if (!actionOk && !countOk) {
    setResult('כמעט. גם הפעולה וגם מספר החזרות לא מתאימים למשימה. קראו שוב מה המפעל צריך.');
  } else if (!actionOk) {
    setResult('מספר החזרות נכון, אבל הפעולה לא מתאימה לצעצוע הזה.');
  } else if (selectedCount < lesson.count) {
    setResult(`הפעולה נכונה, אבל הלולאה קצרה מדי. צריך ${lesson.count} חזרות.`);
  } else {
    setResult(`הפעולה נכונה, אבל הלולאה חוזרת יותר מדי. צריך בדיוק ${lesson.count} חזרות.`);
  }
  renderNextStep(false);
}

function showHint() {
  if (!selectedAction) {
    setResult(`רמז: חפשו את הפעולה שמתאימה לסיפור — ${actions[lesson.action].icon} ${actions[lesson.action].label}.`);
  } else if (selectedAction !== lesson.action) {
    setResult(`הפעולה צריכה להיות: ${actions[lesson.action].icon} ${actions[lesson.action].label}.`);
  } else {
    setResult(`הפעולה נכונה. עכשיו ספרו כמה פעמים היא צריכה לקרות: ${lesson.count}.`);
  }
  renderNextStep(false);
}

function clearLoop() {
  selectedAction = null;
  selectedCount = null;
  renderAll();
}

function nextTarget() {
  const currentIndex = lessons.findIndex((item) => item.id === lesson.id);
  const nextLesson = lessons[currentIndex + 1];
  if (nextLesson) return { href: `factory-play.html?lesson=${nextLesson.id}`, label: `➡️ המשך למשימה ${nextLesson.id}` };
  return { href: 'factory-lab.html', label: '🏭 המשך למעבדת הלולאות' };
}

function renderNextStep(show = false) {
  const box = document.getElementById('next-step');
  if (!box) return;
  if (!show) { box.innerHTML = ''; return; }
  const target = nextTarget();
  box.innerHTML = `<div class="next-step-note">הלולאה עבדה! ממשיכים למשימת המפעל הבאה.</div><a class="btn" href="${target.href}">${target.label}</a>`;
}

function init() {
  document.getElementById('page-title').textContent = `${lesson.emoji} ${lesson.title}`;
  document.getElementById('page-subtitle').textContent = `שיעור 9 • לולאות וחזרות • ${lesson.concept}`;
  document.getElementById('lesson-heading').textContent = `משימת מפעל ${lesson.id}: ${lesson.title}`;
  document.getElementById('lesson-emoji').textContent = lesson.emoji;
  document.getElementById('story').textContent = lesson.story;
  document.getElementById('learning-note').innerHTML = `<b>רגע למידה:</b> ${lesson.learningNote}`;
  document.getElementById('goal-chip').textContent = lesson.loopText;
  document.getElementById('check').addEventListener('click', runLoop);
  document.getElementById('hint').addEventListener('click', showHint);
  document.getElementById('clear').addEventListener('click', clearLoop);
  document.getElementById('lesson-nav').innerHTML = lessons.map((item) => `<a class="${item.id === lesson.id ? 'active' : ''}" href="factory-play.html?lesson=${item.id}">${item.id}</a>`).join('');
  renderAll();
}

init();
