const params = new URLSearchParams(location.search);
const lessonId = Number(params.get('lesson') || 1);
const lessons = window.CINEMA_LESSONS || [];
const lesson = lessons.find((item) => item.id === lessonId) || lessons[0];
let selectedOrder = [];

function setResult(text, success = false) {
  const result = document.getElementById('result');
  result.textContent = text;
  result.style.color = success ? '#15803d' : '#9f1239';
}
function shuffledScenes() {
  return Object.entries(lesson.scenes).map(([id, scene], index) => ({ id, scene, sort: (index * 7 + lesson.id * 3) % 5 })).sort((a,b)=>a.sort-b.sort);
}
function renderSceneBank() {
  const chosen = new Set(selectedOrder);
  document.getElementById('scene-bank').innerHTML = shuffledScenes().map(({id, scene}) => `
    <button type="button" class="scene-card ${chosen.has(id) ? 'used' : ''}" data-scene="${id}" ${chosen.has(id) ? 'disabled' : ''}>
      <span class="scene-icon">${scene.icon}</span><span>${scene.text}</span>
    </button>`).join('');
  document.querySelectorAll('[data-scene]').forEach((button)=>button.addEventListener('click',()=>addScene(button.dataset.scene)));
}
function renderTimeline() {
  const labels = ['התחלה', 'אמצע', 'סוף'];
  document.getElementById('timeline').innerHTML = [0,1,2].map((index) => {
    const id = selectedOrder[index];
    const scene = id ? lesson.scenes[id] : null;
    return `<div class="timeline-slot"><b>${labels[index]}</b><span>${scene ? scene.icon : '❔'}</span><p>${scene ? scene.text : 'בחרו סצנה'}</p></div>`;
  }).join('');
}
function addScene(id) {
  if (selectedOrder.length >= 3 || selectedOrder.includes(id)) return;
  selectedOrder.push(id);
  renderAll();
}
function renderAll() { renderSceneBank(); renderTimeline(); renderNextStep(false); setResult(''); }
function checkMovie() {
  if (selectedOrder.length < 3) { setResult('צריך לבחור 3 סצנות: התחלה, אמצע וסוף.'); return; }
  const ok = selectedOrder.every((id, index) => id === lesson.correctOrder[index]);
  if (ok) { setResult('מעולה! הסרט מסודר בסדר הגיוני 🎬', true); renderNextStep(true); }
  else { setResult('כמעט. יש סצנה שלא במקום. חשבו מה חייב לקרות קודם ומה קורה אחר כך.'); renderNextStep(false); }
}
function showHint() {
  const nextId = lesson.correctOrder[selectedOrder.length] || lesson.correctOrder[0];
  const scene = lesson.scenes[nextId];
  setResult(`רמז: הסצנה הבאה שכדאי לבחור היא ${scene.icon} ${scene.text}`);
  renderNextStep(false);
}
function clearTimeline() { selectedOrder = []; renderAll(); }
function nextTarget() {
  const currentIndex = lessons.findIndex((item) => item.id === lesson.id);
  const nextLesson = lessons[currentIndex + 1];
  if (nextLesson) return { href: `cinema-play.html?lesson=${nextLesson.id}`, label: `➡️ המשך לסרט ${nextLesson.id}` };
  return { href: 'cinema-lab.html', label: '🎬 המשך למעבדת הסרטים' };
}
function renderNextStep(show = false) {
  const box = document.getElementById('next-step');
  if (!box) return;
  if (!show) { box.innerHTML = ''; return; }
  const target = nextTarget();
  box.innerHTML = `<div class="next-step-note">הסרט נערך נכון! ממשיכים לסרט הבא.</div><a class="btn" href="${target.href}">${target.label}</a>`;
}
function init() {
  document.getElementById('page-title').textContent = `${lesson.emoji} ${lesson.title}`;
  document.getElementById('page-subtitle').textContent = `שיעור 13 • סדר סצנות וסיבה-תוצאה • ${lesson.concept}`;
  document.getElementById('lesson-heading').textContent = `סרט ${lesson.id}: ${lesson.title}`;
  document.getElementById('lesson-emoji').textContent = lesson.emoji;
  document.getElementById('story').textContent = lesson.story;
  document.getElementById('learning-note').innerHTML = `<b>רגע למידה:</b> ${lesson.learningNote}`;
  document.getElementById('check').addEventListener('click', checkMovie);
  document.getElementById('hint').addEventListener('click', showHint);
  document.getElementById('clear').addEventListener('click', clearTimeline);
  document.getElementById('lesson-nav').innerHTML = lessons.map((item) => `<a class="${item.id === lesson.id ? 'active' : ''}" href="cinema-play.html?lesson=${item.id}">${item.id}</a>`).join('');
  renderAll();
}
init();
