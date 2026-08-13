const params = new URLSearchParams(location.search);
const lessonId = Number(params.get('lesson') || 1);
const lessons = window.DINO_LESSONS || [];
const zones = window.DINO_ZONES || {};
const lesson = lessons.find((item) => item.id === lessonId) || lessons[0];
let selectedZone = null;

function isMissionOpen(id) {
  if (id === 1) return true;
  const progress = window.SisiMissionProgress;
  if (!progress || typeof progress.getCompleted !== 'function') return false;
  return progress.getCompleted().has(id - 1);
}

function showLockedMission(id) {
  setResult(`🔒 משימה ${id} עדיין נעולה. צריך קודם להשלים את המשימות הקודמות.`);
  renderNextStep(false);
}

function setResult(text, success = false) {
  const result = document.getElementById('result');
  result.textContent = text;
  result.style.color = success ? '#15803d' : '#365314';
}

function nextTarget() {
  const currentIndex = lessons.findIndex((item) => item.id === lesson.id);
  const nextLesson = lessons[currentIndex + 1];
  if (nextLesson) {
    return { href: `dino-play.html?lesson=${nextLesson.id}`, label: `➡️ המשך למשימה ${nextLesson.id}` };
  }
  return { href: 'art.html', label: '🎨 לשיעור הבא' };
}

function renderNextStep(show = false) {
  const box = document.getElementById('next-step');
  if (!box) return;
  if (!show) {
    box.innerHTML = '';
    return;
  }
  const target = nextTarget();
  const note = target.href === 'art.html'
    ? 'מעולה! סיימתם את השיעור. ממשיכים לשיעור הבא.'
    : 'יפה! ממשיכים ברצף השיעור למשימת המיון הבאה.';
  box.innerHTML = `<div class="next-step-note">${note}</div><a class="btn" href="${target.href}">${target.label}</a>`;
  window.SisiSuccessDialog?.show({ message: box.querySelector('.next-step-note')?.textContent || 'כל הכבוד! אפשר להמשיך קדימה או לנסות שוב.', lessons, lesson, nextHref: target.href, nextLabel: target.label, onRepeat: () => window.location.reload() });
}

function renderZones() {
  document.getElementById('zones').innerHTML = Object.entries(zones).map(([id, zone]) => `
    <button type="button" class="zone-btn ${selectedZone === id ? 'active' : ''}" data-zone="${id}">
      <span class="zone-icon">${zone.icon}</span>${zone.title}
    </button>
  `).join('');
  document.querySelectorAll('[data-zone]').forEach((button) => {
    button.addEventListener('click', () => {
      selectedZone = button.dataset.zone;
      renderZones();
      setResult('');
      renderNextStep(false);
    });
  });
}

function checkClassification() {
  if (!selectedZone) {
    setResult('צריך לבחור אזור בפארק לפני הבדיקה.');
    return;
  }
  if (selectedZone === lesson.dino.answer) {
    setResult(`נכון! ${lesson.dino.name} שייך/ת לאזור: ${zones[selectedZone].title} 🎉`, true);
    window.SisiCourseCertificate?.show({ lessons, lesson });
    renderNextStep(true);
  } else {
    setResult(`כמעט. בדקו שוב את המאפיינים: ${lesson.dino.facts.join(' | ')}`);
    renderNextStep(false);
  }
}

function showHint() {
  const answerZone = zones[lesson.dino.answer];
  setResult(`רמז: ${answerZone.hint}`);
  renderNextStep(false);
}

function clearSelection() {
  selectedZone = null;
  renderZones();
  setResult('');
  renderNextStep(false);
}

function init() {
  document.getElementById('page-title').textContent = `${lesson.emoji} ${lesson.title}`;
  document.getElementById('page-subtitle').textContent = `משימה ${lesson.id}: קוראים רמזים ובוחרים אזור`;
  document.getElementById('lesson-heading').textContent = `משימה ${lesson.id}: ${lesson.title}`;
  document.getElementById('lesson-emoji').textContent = lesson.emoji;
  document.getElementById('mission').textContent = lesson.mission;
  document.getElementById('learning-note').innerHTML = `<b>שאלת חשיבה:</b> ${lesson.learningNote}`;
  document.getElementById('dino-visual').textContent = lesson.dino.icon;
  document.getElementById('dino-name').textContent = lesson.dino.name;
  document.getElementById('facts').innerHTML = lesson.dino.facts.map((fact) => `<span class="fact-chip">${fact}</span>`).join('');
  document.getElementById('check').addEventListener('click', checkClassification);
  document.getElementById('hint').addEventListener('click', showHint);
  document.getElementById('clear').addEventListener('click', clearSelection);
  document.getElementById('lesson-nav').innerHTML = lessons.map((item) => {
    const locked = !isMissionOpen(item.id);
    const classes = [item.id === lesson.id ? 'active' : '', locked ? 'locked' : ''].filter(Boolean).join(' ');
    const href = `dino-play.html?lesson=${item.id}`;
    const disabled = locked ? ' aria-disabled="true"' : '';
    return `<a class="${classes}" href="${href}" data-lesson-id="${item.id}"${disabled}>${item.id}</a>`;
  }).join('');
  document.querySelectorAll('#lesson-nav a[data-lesson-id]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const targetId = Number(link.dataset.lessonId);
      if (isMissionOpen(targetId)) return;
      event.preventDefault();
      showLockedMission(targetId);
    });
  });
  window.SisiMissionProgress?.decorate?.();
  renderZones();
  renderNextStep(false);
}

init();
