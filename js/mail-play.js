const params = new URLSearchParams(location.search);
const lessonId = Number(params.get('lesson') || 1);
const lessons = window.MAIL_LESSONS || [];
const routes = window.MAIL_ROUTES || {};
const lesson = lessons.find((item) => item.id === lessonId) || lessons[0];
let selectedRoute = null;

function setResult(text, success = false) {
  const result = document.getElementById('result');
  result.textContent = text;
  result.style.color = success ? '#15803d' : '#1d4ed8';
}

function renderRouteOptions() {
  document.getElementById('route-options').innerHTML = Object.entries(routes).map(([id, route]) => `
    <button type="button" class="route-card ${selectedRoute === id ? 'active' : ''}" data-route="${id}">
      <span class="route-icon">${route.icon}</span><span>${route.label}</span>
    </button>
  `).join('');
  document.querySelectorAll('[data-route]').forEach((button) => {
    button.addEventListener('click', () => {
      selectedRoute = button.dataset.route;
      renderRouteOptions();
      renderRoutePreview();
      renderNextStep(false);
      setResult('');
    });
  });
}

function renderRoutePreview() {
  const route = selectedRoute ? routes[selectedRoute] : null;
  document.getElementById('route-preview').innerHTML = route
    ? `<span>${lesson.emoji}</span><b>הרמז:</b><span>${lesson.clue}</span><b>שליחה אל:</b><span>${route.icon} ${route.label}</span>`
    : `<span>${lesson.emoji}</span><b>הרמז:</b><span>${lesson.clue}</span><b>שליחה אל:</b><span>בחרו יעד</span>`;
}

function checkRoute() {
  if (!selectedRoute) {
    setResult('צריך לבחור תיבה או מסלול לפני ששולחים.');
    return;
  }
  if (selectedRoute === lesson.route) {
    setResult(`נכון! ${lesson.result} ✉️`, true);
    window.SisiCourseCertificate?.show({ lessons, lesson });
    renderNextStep(true);
  } else {
    setResult('כמעט. היעד לא מתאים לרמזים שעל ההודעה. קראו שוב את התוכן וחפשו מילים חשובות.');
    renderNextStep(false);
  }
}

function showHint() {
  const route = routes[lesson.route];
  setResult(`רמז: ${route.hint}. נסו לשלוח אל ${route.icon} ${route.label}.`);
  renderNextStep(false);
}

function clearRoute() {
  selectedRoute = null;
  renderRouteOptions();
  renderRoutePreview();
  renderNextStep(false);
  setResult('');
}

function nextTarget() {
  const currentIndex = lessons.findIndex((item) => item.id === lesson.id);
  const nextLesson = lessons[currentIndex + 1];
  if (nextLesson) return { href: `mail-play.html?lesson=${nextLesson.id}`, label: `➡️ המשך לדואר ${nextLesson.id}` };
  return { href: 'mail-lab.html', label: '✉️ המשך למעבדת הדואר' };
}

function renderNextStep(show = false) {
  const box = document.getElementById('next-step');
  if (!box) return;
  if (!show) { box.innerHTML = ''; return; }
  const target = nextTarget();
  box.innerHTML = `<div class="next-step-note">הדואר נותב נכון! ממשיכים להודעה הבאה.</div><a class="btn" href="${target.href}">${target.label}</a>`;
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
  document.getElementById('lesson-nav').innerHTML = lessons.map((item) => `<a class="${item.id === lesson.id ? 'active' : ''}" href="mail-play.html?lesson=${item.id}">${item.id}</a>`).join('');
  renderRouteOptions();
  renderRoutePreview();
  renderNextStep(false);
}

init();
