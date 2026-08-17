const params = new URLSearchParams(location.search);
const lessonId = Number(params.get('lesson') || 1);
const lessons = window.GARDEN_LESSONS || [];
const actions = window.GARDEN_ACTIONS || {};
const lesson = lessons.find((item) => item.id === lessonId) || lessons[0];
function shuffleChoices(choices = []) {
  const shuffled = [...choices];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
const displayChoices = shuffleChoices(lesson.choices);
let selectedAction = null;
let selectedBed = null;
let savedVegetables = Number(sessionStorage.getItem('gardenSavedVegetables') || 0);

function renderLessonIcon(item, className = '') {
  if (item?.art === 'greenTomato') {
    return `<span class="green-tomato-emoji ${className}" role="img" aria-label="עגבנייה ירוקה">🍅</span>`;
  }
  return `<span class="${className}">${item?.emoji || ''}</span>`;
}

function isBedLesson() {
  return Array.isArray(lesson.choices) && lesson.choices.length > 0;
}

function needsTool() {
  return lesson.mode !== 'bed';
}

function correctChoice() {
  return displayChoices?.find((choice) => choice.id === lesson.correctBed);
}

function selectedChoice() {
  return displayChoices?.find((choice) => choice.id === selectedBed);
}

function renderChoiceIcon(choice, className = '') {
  return renderLessonIcon(choice || {}, className);
}

function setResult(text, success = false) {
  const result = document.getElementById('result');
  result.textContent = text;
  result.style.color = success ? '#15803d' : '#365314';
}

function renderActionOptions() {
  const helper = needsTool()
    ? 'בחרו כלי מהמחסן'
    : 'בשלב הזה בוחרים ערוגה לפי המשימה. המחסן נשאר כאן כדי לזכור מה תפקיד כל כלי.';
  document.querySelector('.action-panel p').textContent = helper;
  document.getElementById('action-options').innerHTML = Object.entries(actions).map(([id, action]) => `
    <button type="button" class="action-card ${selectedAction === id ? 'active' : ''}" data-action="${id}" aria-label="${action.label}">
      <span class="action-icon">${action.icon}</span>
      <span><b>${action.tool}</b><small>${action.role || action.label}</small></span>
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

function gardenMood() {
  if (isBedLesson()) {
    if (!selectedBed) return 'waiting';
    if (lesson.mode === 'bed') return selectedBed === lesson.correctBed ? 'ready' : 'warning';
    if (!selectedAction) return 'waiting';
    return selectedBed === lesson.correctBed && selectedAction === lesson.answer ? 'ready' : 'warning';
  }
  if (!selectedAction) return 'waiting';
  return selectedAction === lesson.answer ? 'ready' : 'warning';
}

function renderGardenBoard() {
  const board = document.getElementById('garden-board');
  if (!board) return;
  const mood = gardenMood();
  const action = selectedAction ? actions[selectedAction] : null;
  board.className = `garden-board ${isBedLesson() ? 'multi-bed-board' : ''} ${mood}`;

  if (isBedLesson()) {
    board.innerHTML = `
      <div class="garden-sky"><span>☀️</span><span>☁️</span><span>🦋</span></div>
      <div class="mission-strip">${lesson.mission || 'בחרו ערוגה מתאימה למשימה'}</div>
      <div class="bed-grid" role="group" aria-label="בחירת ערוגה">
        ${displayChoices.map((choice) => `
          <button type="button" class="mini-bed ${selectedBed === choice.id ? 'active' : ''}" data-bed="${choice.id}">
            <span class="mini-veg">${renderChoiceIcon(choice)}</span>
            <b>${choice.label}</b>
            <small>${choice.status}</small>
          </button>
        `).join('')}
      </div>
      <div class="tool-feedback">${selectedBed ? `נבחרה ערוגת ${selectedChoice()?.label}` : 'בחרו ירק לפי המשימה'}${needsTool() ? ` · ${action ? `${action.icon} ${action.tool} נבחר` : 'בחרו גם כלי מהמחסן'}` : ''}</div>
    `;
    document.querySelectorAll('[data-bed]').forEach((button) => {
      button.addEventListener('click', () => {
        selectedBed = button.dataset.bed;
        renderGardenBoard();
        renderChoicePreview();
        renderNextStep(false);
        setResult('');
      });
    });
    return;
  }

  board.innerHTML = `
    <div class="garden-sky"><span>☀️</span><span>☁️</span><span>🦋</span></div>
    <div class="garden-bed">
      <div class="garden-vegetable">${renderLessonIcon(lesson)}</div>
      <div class="garden-status">${lesson.plantStage}</div>
    </div>
    <div class="tool-feedback">${action ? `${action.icon} ${action.tool} נבחר` : 'בחרו כלי מהמחסן'}</div>
  `;
}

function renderChoicePreview() {
  const action = selectedAction ? actions[selectedAction] : null;
  if (isBedLesson()) {
    const choice = selectedChoice();
    document.getElementById('choice-preview').innerHTML = `
      ${choice ? renderChoiceIcon(choice) : '🌱'}
      <b>הערוגה:</b><span>${choice ? choice.label : 'בחרו ירק מתוך שלוש הערוגות'}</span>
      ${needsTool() ? `<b>הכלי:</b><span>${action ? `${action.icon} ${action.tool}` : 'בחרו כלי מתאים מהמחסן'}</span>` : '<b>המשימה:</b><span>מצאו את הירק המתאים</span>'}
    `;
  } else {
    document.getElementById('choice-preview').innerHTML = action
      ? `${renderLessonIcon(lesson)}<b>הערוגה:</b><span>${lesson.vegetable || lesson.title}</span><b>הכלי:</b><span>${action.icon} ${action.tool}</span>`
      : `${renderLessonIcon(lesson)}<b>הערוגה:</b><span>${lesson.vegetable || lesson.title}</span><b>הכלי:</b><span>בחרו כלי מתאים מהמחסן</span>`;
  }
  renderGardenBoard();
}

function renderGrowthPath() {
  document.getElementById('growth-path').innerHTML = lessons.map((item) => `
    <a class="growth-step ${item.id === lesson.id ? 'active' : ''}" href="garden-play.html?lesson=${item.id}">
      <span>🌱</span><small>${item.id}</small>
    </a>
  `).join('');
}

function renderScore() {
  const score = document.getElementById('garden-score');
  if (!score) return;
  score.innerHTML = `<b>${savedVegetables}</b><span>ירקות שניצלו/נאספו</span>`;
}

function checkAction() {
  if (isBedLesson() && !selectedBed) {
    setResult('צריך לבחור אחת משלוש הערוגות לפני הבדיקה.');
    return;
  }
  if (needsTool() && !selectedAction) {
    setResult('צריך לבחור כלי מהמחסן לפני הבדיקה.');
    return;
  }

  const bedOk = !isBedLesson() || selectedBed === lesson.correctBed;
  const actionOk = !needsTool() || selectedAction === lesson.answer;
  if (bedOk && actionOk) {
    savedVegetables = Math.max(savedVegetables, lesson.id);
    sessionStorage.setItem('gardenSavedVegetables', String(savedVegetables));
    renderScore();
    renderGardenBoard();
    const toolText = selectedAction ? `${actions[selectedAction].tool}. ` : '';
    setResult(`נכון! ${toolText}${lesson.result} 🥕`, true);
    window.SisiCourseCertificate?.show({ lessons, lesson });
    renderNextStep(true);
  } else {
    renderGardenBoard();
    setResult('כמעט. בדקו שוב גם את המשימה, גם את מצב הירקות, וגם את תפקיד הכלי שבחרתם.');
    renderNextStep(false);
  }
}

function showHint() {
  setResult(lesson.hint || 'רמז: קראו קודם את המשימה, ואז חפשו באיזו ערוגה מופיע אותו סימן בדיוק.');
  renderNextStep(false);
}

function clearChoice() {
  selectedAction = null;
  selectedBed = null;
  renderActionOptions();
  renderChoicePreview();
  renderNextStep(false);
  setResult('');
}

function nextTarget() {
  const currentIndex = lessons.findIndex((item) => item.id === lesson.id);
  const nextLesson = lessons[currentIndex + 1];
  if (nextLesson) return { href: `garden-play.html?lesson=${nextLesson.id}`, label: `➡️ המשך לערוגה ${nextLesson.id}` };
  return { href: 'park.html', label: '🎡 לשיעור הבא' };
}

function renderNextStep(show = false) {
  const box = document.getElementById('next-step');
  if (box) box.innerHTML = '';
  if (!show) return;
  const target = nextTarget();
  window.SisiSuccessDialog?.show({ message: 'הערוגה טופלה נכון! ממשיכים לערוגה הבאה במשימת הירקות.', lessons, lesson, nextHref: target.href, nextLabel: target.label, onRepeat: () => window.location.reload() });
}

function init() {
  document.getElementById('page-title').textContent = `🌱 ${lesson.title}`;
  document.getElementById('page-subtitle').textContent = `שיעור 10 • משימת הערוגות • ${lesson.concept}`;
  document.getElementById('lesson-heading').textContent = `ערוגה ${lesson.id}: ${lesson.title}`;
  document.getElementById('lesson-emoji').textContent = '🌱';
  document.getElementById('story').textContent = lesson.story;
  document.getElementById('stage').textContent = lesson.mission || lesson.plantStage;
  document.getElementById('learning-note').innerHTML = `<b>רגע למידה:</b> ${lesson.learningNote}`;
  document.getElementById('check').addEventListener('click', checkAction);
  document.getElementById('hint').addEventListener('click', showHint);
  document.getElementById('clear').addEventListener('click', clearChoice);
  document.getElementById('lesson-nav').innerHTML = lessons.map((item) => `<a class="${item.id === lesson.id ? 'active' : ''}" href="garden-play.html?lesson=${item.id}">${item.id}</a>`).join('');
  renderActionOptions();
  renderChoicePreview();
  renderGrowthPath();
  renderScore();
  renderNextStep(false);
}

init();
