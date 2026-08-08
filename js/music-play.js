const params = new URLSearchParams(location.search);
const lessonId = Number(params.get('lesson') || 1);
const lessons = window.MUSIC_LESSONS || [];
const notes = window.MUSIC_NOTES || {};
const lesson = lessons.find((item) => item.id === lessonId) || lessons[0];
let build = [];
let selectedThinking = null;
let lightShowPlaying = false;
const stageLightPrompt = 'לחצו עלי כדי לראות את סדר האורות';
const shuffledThinkingOptions = shuffleOptions(lesson.thinkingTask?.options || []);

function shuffleOptions(options) {
  const shuffled = [...options];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
  }
  return shuffled;
}

function noteChip(noteKey, extraClass = '') {
  const note = notes[noteKey];
  return `<span class="note-chip ${extraClass}" data-note="${noteKey}">${note.icon} ${note.label}</span>`;
}

function lightName(noteKey) {
  return { red: 'אדום', blue: 'כחול', yellow: 'צהוב', green: 'ירוק', purple: 'סגול' }[noteKey] || 'במה';
}

function renderTarget() {
  if (lesson.id === 5) {
    document.getElementById('target').innerHTML = '<span class="small">לחצו על “מופע אורות”, ואז בנו למטה את רצף הצלילים המתאים.</span>';
    return;
  }
  if (lesson.loopInstruction) {
    const loop = lesson.loopInstruction;
    document.getElementById('target').innerHTML = `
      <div class="loop-instruction">
        <div><strong>חזרו ${loop.repeat} פעמים:</strong> ${loop.pattern.map((note) => noteChip(note)).join('')}</div>
        <div><strong>ואז:</strong> ${loop.ending.map((note) => noteChip(note)).join('')}</div>
      </div>
    `;
    return;
  }
  if (lesson.concertInstruction) {
    const concert = lesson.concertInstruction;
    document.getElementById('target').innerHTML = `
      <div class="loop-instruction concert-instruction">
        <div><strong>פתיחה:</strong> ${concert.opening.map((note) => noteChip(note)).join('')}</div>
        <div><strong>חזרו ${concert.repeat} פעמים:</strong> ${concert.pattern.map((note) => noteChip(note)).join('')}</div>
        <div><strong>סיום:</strong> ${concert.ending.map((note) => noteChip(note)).join('')}</div>
      </div>
    `;
    return;
  }
  const visibleTarget = lesson.displayTarget || lesson.target;
  const prefix = lesson.id === 6
    ? '<div class="debug-hint">חפשו את הצליל שלא מתאים למתכונת, ובנו למטה את הרצף הנכון.</div>'
    : lesson.id === 8
      ? '<div class="debug-hint">זה תחילת הרצף. המשיכו אותו לפי החוק, כך שיהיו סך הכול 6 צלילים.</div>'
      : '';
  document.getElementById('target').innerHTML = prefix + visibleTarget.map((note) => noteChip(note)).join('');
}

function renderBuild() {
  document.getElementById('build').innerHTML = build.length
    ? build.map((note) => noteChip(note)).join('')
    : '<span class="small">עדיין אין צלילים. לחצו על צבעים כדי לבנות דפוס.</span>';
}

function renderThinkingTask() {
  const task = lesson.thinkingTask;
  document.getElementById('thinking-question').textContent = task.question;
  document.getElementById('thinking-options').innerHTML = shuffledThinkingOptions.map((option) => `
    <button type="button" class="thinking-option ${selectedThinking === option.id ? 'active' : ''}" data-thinking="${option.id}">${option.text}</button>
  `).join('');
  document.querySelectorAll('[data-thinking]').forEach((button) => {
    button.addEventListener('click', () => {
      selectedThinking = button.dataset.thinking;
      renderThinkingTask();
      setResult('');
    });
  });
}

function triggerStageLight(noteKey, keepActive = false) {
  if (lesson.id !== 5) return;
  const light = document.getElementById('stage-light');
  if (!light) return;
  const note = notes[noteKey];
  light.className = `stage-light ${note?.className || ''} active`;
  light.textContent = '';
  light.setAttribute('aria-label', note ? `אור ${lightName(noteKey)}` : 'אור במה');
  window.clearTimeout(triggerStageLight.timeoutId);
  if (keepActive) return;
  triggerStageLight.timeoutId = window.setTimeout(() => {
    light.classList.remove('active');
    light.textContent = stageLightPrompt;
    light.setAttribute('aria-label', stageLightPrompt);
  }, 900);
}

function thinkingAnswerOk() {
  return lesson.thinkingTask.options.some((option) => option.id === selectedThinking && option.good);
}

function setResult(text, success = false) {
  const result = document.getElementById('result');
  result.textContent = text;
  result.style.color = success ? '#15803d' : '#be185d';
}

function playTone(noteKey) {
  triggerStageLight(noteKey);
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
  gain.gain.exponentialRampToValueAtTime(0.36, context.currentTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.32);
  oscillator.start();
  oscillator.stop(context.currentTime + 0.34);
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

async function playLightShow() {
  if (lightShowPlaying) return;
  lightShowPlaying = true;
  setResult('שימו לב לסדר האורות...');
  for (let index = 0; index < lesson.target.length; index += 1) {
    triggerStageLight(lesson.target[index], true);
    await new Promise((resolve) => setTimeout(resolve, 920));
  }
  const light = document.getElementById('stage-light');
  light?.classList.remove('active');
  if (light) {
    light.textContent = stageLightPrompt;
    light.setAttribute('aria-label', stageLightPrompt);
  }
  lightShowPlaying = false;
  setResult('עכשיו בנו למטה את רצף הצלילים שמתאים לאורות.');
}

function checkPattern() {
  if (!build.length) {
    setResult('קודם צריך לבנות רצף צלילים.');
    return;
  }
  const sameLength = build.length === lesson.target.length;
  const sameNotes = sameLength && build.every((note, index) => note === lesson.target[index]);
  if (sameNotes && !selectedThinking) {
    setResult('הרצף נכון. עכשיו בחרו תשובה באתגר החשיבה — מה הרעיון שמסתתר במוזיקה?');
    return;
  }
  if (sameNotes && !thinkingAnswerOk()) {
    setResult('הרצף נכון, אבל תשובת החשיבה עדיין לא מדויקת. נסו לחשוב מה בדקתם ברצף.');
    return;
  }
  if (sameNotes) {
    const message = `${lesson.thinkingTask.success} 🎶`;
    setResult(message, true);
    window.SisiCourseCertificate?.show({ lessons, lesson });
    window.SisiSuccessDialog?.show({ message, lessons, lesson, onRepeat: () => window.location.reload() });
    return;
  }
  const firstWrong = build.findIndex((note, index) => note !== lesson.target[index]);
  if (!sameLength) {
    setResult(`כמעט. ברצף צריך ${lesson.target.length} צלילים, ואצלך יש ${build.length}.`);
  } else {
    setResult(`כמעט. הצליל מספר ${firstWrong + 1} עדיין לא מתאים. נסו לתקן.`);
  }
}

function init() {
  document.getElementById('page-title').textContent = `${lesson.emoji} ${lesson.title}`;
  document.getElementById('page-subtitle').textContent = `משימה ${lesson.id}: ${lesson.concept}`;
  document.getElementById('lesson-heading').textContent = `משימה ${lesson.id}: ${lesson.title}`;
  document.getElementById('lesson-emoji').textContent = lesson.emoji;
  document.getElementById('mission').textContent = lesson.mission;
  document.getElementById('teacher-fact').innerHTML = `<b>רגע למידה:</b> ${lesson.teacherFact}`;
  if (lesson.id === 5) {
    document.querySelector('.challenge-box b').textContent = 'מופע האורות:';
    document.getElementById('teacher-fact').insertAdjacentHTML('afterend', `<button class="stage-light" id="stage-light" type="button" aria-label="${stageLightPrompt}">${stageLightPrompt}</button>`);
  }

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
  if (lesson.id === 5) {
    document.getElementById('stage-light')?.addEventListener('click', playLightShow);
  }
  document.getElementById('check').addEventListener('click', checkPattern);
  document.getElementById('undo').addEventListener('click', () => { build.pop(); renderBuild(); setResult(''); });
  document.getElementById('clear').addEventListener('click', () => { build = []; selectedThinking = null; renderBuild(); renderThinkingTask(); setResult(''); });
  document.getElementById('demo').addEventListener('click', () => {
    build = lesson.target.length ? [lesson.target[0]] : [];
    renderBuild();
    if (lesson.target[0]) playTone(lesson.target[0]);
    setResult('דוגמה קטנה נטענה: הצליל הראשון נוסף. המשיכו את הרצף בעצמכם.');
  });

  document.getElementById('lesson-nav').innerHTML = lessons.map((item) => `
    <a class="${item.id === lesson.id ? 'active' : ''}" href="music-play.html?lesson=${item.id}">${item.id}</a>
  `).join('');

  renderTarget();
  renderBuild();
  renderThinkingTask();
}

init();
