const params = new URLSearchParams(location.search);
const lessonId = Number(params.get('lesson') || 1);
const lessons = window.MUSIC_LESSONS || [];
const notes = window.MUSIC_NOTES || {};
const lesson = lessons.find((item) => item.id === lessonId) || lessons[0];
let build = [];

function noteChip(noteKey, extraClass = '') {
  const note = notes[noteKey];
  return `<span class="note-chip ${extraClass}" data-note="${noteKey}">${note.icon} ${note.label}</span>`;
}

function renderTarget() {
  document.getElementById('target').innerHTML = lesson.target.map((note) => noteChip(note)).join('');
}

function renderBuild() {
  document.getElementById('build').innerHTML = build.length
    ? build.map((note) => noteChip(note)).join('')
    : '<span class="small">עדיין אין צלילים. לחצו על צבעים כדי לבנות דפוס.</span>';
}

function setResult(text, success = false) {
  const result = document.getElementById('result');
  result.textContent = text;
  result.style.color = success ? '#15803d' : '#be185d';
}

function playTone(noteKey) {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;
  const frequencies = { red: 262, blue: 294, yellow: 330, green: 349, purple: 392 };
  const context = new AudioContext();
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = 'sine';
  oscillator.frequency.value = frequencies[noteKey] || 262;
  oscillator.connect(gain);
  gain.connect(context.destination);
  gain.gain.setValueAtTime(0.001, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.16, context.currentTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.22);
  oscillator.start();
  oscillator.stop(context.currentTime + 0.24);
}

async function playSequence(sequence) {
  const chips = [...document.querySelectorAll('#build .note-chip')];
  for (let i = 0; i < sequence.length; i += 1) {
    chips[i]?.classList.add('playing');
    playTone(sequence[i]);
    await new Promise((resolve) => setTimeout(resolve, 330));
    chips[i]?.classList.remove('playing');
  }
}

function checkPattern() {
  if (!build.length) {
    setResult('קודם צריך לבנות רצף צלילים.');
    return;
  }
  const sameLength = build.length === lesson.target.length;
  const sameNotes = sameLength && build.every((note, index) => note === lesson.target[index]);
  if (sameNotes) {
    setResult('מעולה! סיסי ניגנה את הדפוס בדיוק לפי הסדר 🎶', true);
    return;
  }
  const firstWrong = build.findIndex((note, index) => note !== lesson.target[index]);
  if (!sameLength) {
    setResult(`כמעט. בדפוס צריך ${lesson.target.length} צלילים, ואצלך יש ${build.length}.`);
  } else {
    setResult(`כמעט. הצליל מספר ${firstWrong + 1} שונה מהדפוס. נסו לתקן.`);
  }
}

function init() {
  document.getElementById('page-title').textContent = `${lesson.emoji} ${lesson.title}`;
  document.getElementById('page-subtitle').textContent = `משימה ${lesson.id}: ${lesson.concept}`;
  document.getElementById('lesson-heading').textContent = `משימה ${lesson.id}: ${lesson.title}`;
  document.getElementById('lesson-emoji').textContent = lesson.emoji;
  document.getElementById('mission').textContent = lesson.mission;
  document.getElementById('teacher-fact').innerHTML = `<b>רגע למידה:</b> ${lesson.teacherFact}`;

  document.getElementById('notes-bank').innerHTML = Object.entries(notes).map(([key, note]) => `
    <button class="note ${note.className}" data-note="${key}" type="button">${note.icon} ${note.label}</button>
  `).join('');

  document.querySelectorAll('#notes-bank [data-note]').forEach((button) => {
    button.addEventListener('click', () => {
      build.push(button.dataset.note);
      playTone(button.dataset.note);
      renderBuild();
      setResult('');
    });
  });

  document.getElementById('play').addEventListener('click', () => playSequence(build));
  document.getElementById('check').addEventListener('click', checkPattern);
  document.getElementById('undo').addEventListener('click', () => { build.pop(); renderBuild(); setResult(''); });
  document.getElementById('clear').addEventListener('click', () => { build = []; renderBuild(); setResult(''); });
  document.getElementById('demo').addEventListener('click', () => { build = [...lesson.target]; renderBuild(); setResult('הדפוס נטען. עכשיו אפשר להשמיע או לבדוק.'); });

  document.getElementById('lesson-nav').innerHTML = lessons.map((item) => `
    <a class="${item.id === lesson.id ? 'active' : ''}" href="music-play.html?lesson=${item.id}">${item.id}</a>
  `).join('');

  renderTarget();
  renderBuild();
}

init();
