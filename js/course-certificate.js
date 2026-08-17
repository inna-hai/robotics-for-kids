(() => {
  if (window.SisiCourseCertificate) return;

  const courses = {
    '/space-play.html': { title: 'שיעור החלל', home: 'space.html', homeLabel: '🪐 לעמוד שיעור החלל', next: 'music.html', nextLabel: '🎵 לשיעור הבא' },
    '/music-play.html': { title: 'מכונת המוזיקה', home: 'music.html', homeLabel: '🎶 לעמוד המוזיקה', next: 'ocean.html', nextLabel: '🌊 לשיעור הבא' },
    '/ocean-play.html': { title: 'האוקיינוס', home: 'ocean.html', homeLabel: '🌊 לעמוד האוקיינוס', next: 'detective.html', nextLabel: '🕵️‍♀️ לשיעור הבא' },
    '/detective-play.html': { title: 'סיסי הבלשית', home: 'detective.html', homeLabel: '🔎 לעמוד הבלשות', next: 'kitchen.html', nextLabel: '🧁 לשיעור הבא' },
    '/kitchen-play.html': { title: 'מטבח הקסמים', home: 'kitchen.html', homeLabel: '🧁 לעמוד המטבח', next: 'dino.html', nextLabel: '🦕 לשיעור הבא' },
    '/dino-play.html': { title: 'פארק הדינוזאורים', home: 'dino.html', homeLabel: '🦕 לעמוד הדינוזאורים', next: 'art.html', nextLabel: '🎨 לשיעור הבא' },
    '/art-play.html': { title: 'ציור הפיקסלים', home: 'art.html', homeLabel: '🎨 לעמוד הציור', next: 'weather.html', nextLabel: '🌦️ לשיעור הבא' },
    '/weather-play.html': { title: 'תחנת מזג האוויר', home: 'weather.html', homeLabel: '🌦️ לעמוד מזג האוויר', next: 'factory.html', nextLabel: '🏭 לשיעור הבא' },
    '/factory-play.html': { title: 'מפעל הלולאות', home: 'factory.html', homeLabel: '🏭 לעמוד המפעל', next: 'garden.html', nextLabel: '🌱 לשיעור הבא' },
    '/garden-play.html': { title: 'גינת הרובוטים', home: 'garden.html', homeLabel: '🌱 לעמוד הגינה', next: 'park.html', nextLabel: '🎡 לשיעור הבא' },
    '/park-play.html': { title: 'פארק השעשועים', home: 'park.html', homeLabel: '🎡 לעמוד הפארק', next: 'mail.html', nextLabel: '✉️ לשיעור הבא' },
    '/mail-play.html': { title: 'מרכז הדואר', home: 'mail.html', homeLabel: '✉️ לעמוד הדואר', next: 'cinema.html', nextLabel: '🎬 לשיעור הבא' },
    '/cinema-play.html': { title: 'בימוי הרובוטים', home: 'cinema.html', homeLabel: '🎬 לעמוד הקולנוע', next: 'escape.html', nextLabel: '🔐 לשיעור הבא' },
    '/escape-play.html': { title: 'חדר הבריחה', home: 'escape.html', homeLabel: '🔐 לעמוד חדר הבריחה', next: 'finale.html', nextLabel: '🏙️ לשיעור הבא' },
    '/finale-play.html': { title: 'העיר החכמה', home: 'finale.html', homeLabel: '🏙️ לעמוד הסיום', next: 'sisi.html', nextLabel: '🤖 לכל שיעורי סיסי' },
  };

  function injectStyle() {
    if (document.getElementById('sisi-certificate-style')) return;
    const style = document.createElement('style');
    style.id = 'sisi-certificate-style';
    style.textContent = `
      .sisi-certificate{margin-top:16px;background:linear-gradient(135deg,#fef3c7,#dbeafe);border:3px solid #facc15;border-radius:22px;padding:16px;color:#0f172a;box-shadow:0 14px 30px rgba(250,204,21,.22);direction:rtl}
      .sisi-certificate-badge{display:inline-flex;background:#facc15;color:#422006;border-radius:999px;padding:7px 12px;font-weight:900}
      .sisi-certificate h2{margin:10px 0 6px;font-size:1.35rem}.sisi-certificate p{line-height:1.6;margin:0 0 12px}.sisi-certificate-actions{display:flex;gap:10px;flex-wrap:wrap}
      @media(max-width:620px){.sisi-certificate-actions .btn{width:100%}}
    `;
    document.head.appendChild(style);
  }

  function compactInfo(override = {}) {
    return Object.fromEntries(Object.entries(override).filter(([, value]) => value !== undefined && value !== null && value !== ''));
  }

  function courseInfo(override = {}) {
    const path = window.location.pathname.replace(/.*\//, '/');
    return { ...(courses[path] || { title: 'השיעור', home: 'sisi.html', homeLabel: '🤖 לכל שיעורי סיסי' }), ...compactInfo(override) };
  }

  function isLast(lessons, lesson) {
    if (!Array.isArray(lessons) || !lessons.length || !lesson) return false;
    return lessons[lessons.length - 1].id === lesson.id;
  }

  function missionProgressKey(pathname = window.location.pathname) {
    const file = pathname.replace(/.*\//, '');
    return `sisi-mission-unlocked-v1-${file}`;
  }

  function missionCompletedKey(pathname = window.location.pathname) {
    const file = pathname.replace(/.*\//, '');
    return `sisi-mission-completed-v3-${file}`;
  }

  function getCompletedMissions(pathname = window.location.pathname) {
    try {
      const value = JSON.parse(localStorage.getItem(missionCompletedKey(pathname)) || '[]');
      return new Set(Array.isArray(value) ? value.map(Number).filter(Number.isFinite) : []);
    } catch (error) {
      return new Set();
    }
  }

  function saveCompletedMissions(completed, pathname = window.location.pathname) {
    localStorage.setItem(missionCompletedKey(pathname), JSON.stringify([...completed].sort((a, b) => a - b)));
  }

  function getUnlockedMission(pathname = window.location.pathname) {
    const completed = getCompletedMissions(pathname);
    let unlocked = 1;
    while (completed.has(unlocked)) unlocked += 1;
    return unlocked;
  }

  function setUnlockedMission(nextId, pathname = window.location.pathname) {
    const target = Number(nextId) || 1;
    const completed = getCompletedMissions(pathname);
    for (let id = 1; id < target; id += 1) completed.add(id);
    saveCompletedMissions(completed, pathname);
    localStorage.setItem(missionProgressKey(pathname), String(getUnlockedMission(pathname)));
    decorateMissionNav();
    return getUnlockedMission(pathname);
  }

  function markMissionComplete(lessons, lesson) {
    if (!Array.isArray(lessons) || !lesson) return getUnlockedMission();
    const index = lessons.findIndex((item) => item.id === lesson.id);
    if (index === -1) return getUnlockedMission();
    const completed = getCompletedMissions();
    completed.add(Number(lesson.id));
    saveCompletedMissions(completed);
    localStorage.setItem(missionProgressKey(), String(getUnlockedMission()));
    decorateMissionNav();
    return getUnlockedMission();
  }

  function injectMissionLockStyle() {
    if (document.getElementById('sisi-mission-lock-style')) return;
    const style = document.createElement('style');
    style.id = 'sisi-mission-lock-style';
    style.textContent = `
      #lesson-nav a{transition:transform .16s ease,box-shadow .16s ease}
      #lesson-nav a.active{transform:scale(1.12);box-shadow:0 0 0 3px rgba(37,99,235,.85),0 0 0 6px rgba(255,255,255,.95),0 10px 20px rgba(15,23,42,.22);outline:0;position:relative;z-index:2}
      #lesson-nav a.locked{opacity:.45;filter:grayscale(.45);cursor:not-allowed;position:relative}
      #lesson-nav a.locked::after{content:'🔒';font-size:.72em;margin-inline-start:4px}
      #lesson-nav a.done{background:#dcfce7!important;color:#166534!important;border-color:#22c55e!important}
      .sisi-lock-message{margin:12px 0;padding:12px 14px;border-radius:16px;background:#fff7ed;border:2px solid #fed7aa;color:#9a3412;font-weight:900;line-height:1.45}
      .sisi-locked-overlay{position:fixed;inset:0;background:rgba(15,23,42,.64);z-index:9998;display:flex;align-items:center;justify-content:center;padding:18px;direction:rtl}
      .sisi-locked-card{width:min(520px,100%);background:#fff7ed;color:#0f172a;border:4px solid #facc15;border-radius:28px;padding:24px;text-align:center;box-shadow:0 28px 70px rgba(15,23,42,.34)}
      .sisi-locked-card h2{margin:0 0 10px;color:#92400e}.sisi-locked-card p{line-height:1.6;font-weight:800;color:#334155}
      .sisi-locked-card .btn{display:inline-flex;align-items:center;justify-content:center;margin-top:8px}
    `;
    document.head.appendChild(style);
  }

  function lessonIdFromHref(href) {
    try { return Number(new URL(href, window.location.href).searchParams.get('lesson') || '1'); }
    catch (error) { return 1; }
  }

  function showExerciseLockMessage(text) {
    const nav = document.getElementById('lesson-nav');
    if (!nav) return;
    let message = document.getElementById('sisi-lock-message');
    if (!message) {
      message = document.createElement('div');
      message.id = 'sisi-lock-message';
      message.className = 'sisi-lock-message';
      nav.insertAdjacentElement('afterend', message);
    }
    message.textContent = text;
  }

  function decorateMissionNav() {
    const nav = document.getElementById('lesson-nav');
    if (!nav) return;
    injectMissionLockStyle();
    const unlocked = getUnlockedMission();
    nav.querySelectorAll('a[href]').forEach((link) => {
      const id = lessonIdFromHref(link.href);
      const completed = getCompletedMissions();
      const locked = id > 1 && !completed.has(id - 1);
      link.classList.toggle('locked', locked);
      link.classList.toggle('done', completed.has(id));
      link.setAttribute('aria-disabled', locked ? 'true' : 'false');
      if (!link.dataset.sisiLockBound) {
        link.dataset.sisiLockBound = 'true';
        link.addEventListener('click', (event) => {
          const targetId = lessonIdFromHref(link.href);
          const completed = getCompletedMissions();
          if (targetId === 1 || completed.has(targetId - 1)) return;
          event.preventDefault();
          showExerciseLockMessage(`כדי לפתוח את משימה ${targetId}, צריך קודם להשלים את המשימות הקודמות.`);
        });
      }
    });
  }

  function enforceDirectMissionLock() {
    const currentId = Number(new URLSearchParams(window.location.search).get('lesson') || '1');
    const completed = getCompletedMissions();
    const unlocked = getUnlockedMission();
    const locked = currentId > 1 && !completed.has(currentId - 1);
    if (!Number.isFinite(currentId) || !locked || document.getElementById('sisi-locked-overlay')) return;
    injectMissionLockStyle();
    const target = `${window.location.pathname.replace(/.*\//, '')}?lesson=${unlocked}`;
    const card = document.createElement('div');
    card.id = 'sisi-locked-overlay';
    card.className = 'sisi-locked-overlay';
    card.innerHTML = `
      <div class="sisi-locked-card" role="dialog" aria-modal="true">
        <h2>🔒 המשימה עדיין נעולה</h2>
        <p>כדי לפתוח את משימה ${currentId}, צריך קודם להשלים את המשימות הקודמות.</p>
        <a class="btn" href="${target}">לחזור למשימה הפתוחה</a>
      </div>
    `;
    document.body.appendChild(card);
  }

  function watchMissionNav() {
    decorateMissionNav();
    enforceDirectMissionLock();
    const observer = new MutationObserver(() => {
      decorateMissionNav();
      enforceDirectMissionLock();
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', watchMissionNav);
  else watchMissionNav();

  function show({ lessons, lesson, total, title, home, homeLabel, next, nextLabel } = {}) {
    if (!isLast(lessons, lesson)) return false;
    injectStyle();
    document.getElementById('sisi-course-certificate')?.remove();
    const info = courseInfo({ title, home, homeLabel, next, nextLabel });
    const count = total || lessons.length;
    const card = document.createElement('div');
    card.id = 'sisi-course-certificate';
    card.className = 'sisi-certificate';
    card.innerHTML = `
      <div class="sisi-certificate-badge">🏆 תעודת סיום</div>
      <h2>כל הכבוד! סיימתם את ${info.title}</h2>
      <p>סיסי השלימה יחד איתכם את כל ${count} המשימות. אפשר להמשיך לשיעור הבא או לחזור לעמוד סיסי.</p>
      <div class="sisi-certificate-actions">
        ${info.next ? `<a class="btn" href="${info.next}">${info.nextLabel || '➡️ לשיעור הבא'}</a>` : ''}
        <a class="btn secondary" href="sisi.html">🤖 לעמוד סיסי</a>
      </div>
    `;
    const result = document.getElementById('result');
    const anchor = document.getElementById('next-step') || result;
    if (anchor) anchor.insertAdjacentElement('afterend', card);
    else document.querySelector('main')?.appendChild(card);
    return true;
  }

  function clear() {
    document.getElementById('sisi-course-certificate')?.remove();
  }

  function injectDialogStyle() {
    if (document.getElementById('sisi-success-dialog-style')) return;
    const style = document.createElement('style');
    style.id = 'sisi-success-dialog-style';
    style.textContent = `
      .sisi-success-backdrop{position:fixed;inset:0;background:rgba(15,23,42,.58);display:flex;align-items:center;justify-content:center;padding:18px;z-index:9999;direction:rtl}
      .sisi-success-dialog{width:min(520px,100%);background:linear-gradient(135deg,#fff7ed,#ecfeff);border:4px solid #facc15;border-radius:30px;padding:24px;box-shadow:0 28px 70px rgba(15,23,42,.32);text-align:center;color:#0f172a}
      .sisi-success-dialog .badge{display:inline-flex;align-items:center;gap:8px;background:#22c55e;color:#fff;border-radius:999px;padding:8px 14px;font-weight:900;margin-bottom:10px}
      .sisi-finish-art{font-size:clamp(2.6rem,9vw,4.8rem);line-height:1;margin:8px 0 4px;filter:drop-shadow(0 8px 12px rgba(15,23,42,.12))}
      .sisi-success-dialog h2{margin:8px 0 10px;font-size:clamp(1.45rem,4vw,2rem);color:#14532d}.sisi-success-dialog p{margin:0 0 18px;line-height:1.65;font-weight:800;color:#334155}
      .sisi-success-actions{display:grid;grid-template-columns:1fr 1fr;gap:12px}.sisi-success-actions .btn{justify-content:center;text-align:center}.sisi-success-actions .btn.repeat{background:linear-gradient(135deg,#e0f2fe,#bae6fd);color:#075985;box-shadow:none}
      @media(max-width:560px){.sisi-success-actions{grid-template-columns:1fr}.sisi-success-dialog{padding:20px}}
    `;
    document.head.appendChild(style);
  }

  function nextMissionHref(lessons, lesson) {
    if (!Array.isArray(lessons) || !lesson) return null;
    const index = lessons.findIndex((item) => item.id === lesson.id);
    if (index === -1 || index >= lessons.length - 1) return null;
    return `${window.location.pathname.replace(/.*\//, '')}?lesson=${lessons[index + 1].id}`;
  }

  function progressKey() {
    const path = window.location.pathname.replace(/.*\//, '') || 'sisi-play';
    return `sisi-progress:${path}`;
  }

  function markProgress(lesson) {
    if (!lesson?.id) return null;
    try {
      const key = progressKey();
      const progress = JSON.parse(localStorage.getItem(key) || '{}');
      progress.completed = progress.completed || {};
      progress.completed[lesson.id] = { completedAt: new Date().toISOString(), title: lesson.title || lesson.place || `משימה ${lesson.id}` };
      progress.lastCompleted = lesson.id;
      progress.updatedAt = new Date().toISOString();
      localStorage.setItem(key, JSON.stringify(progress));
      return progress;
    } catch {
      return null;
    }
  }

  function showSuccessDialog({ message, title, badge, lessons, lesson, nextHref, nextLabel, repeatLabel, onRepeat } = {}) {
    injectDialogStyle();
    markProgress(lesson);
    document.getElementById('sisi-success-dialog')?.remove();
    markMissionComplete(lessons, lesson);
    const info = courseInfo();
    const missionHref = nextMissionHref(lessons, lesson);
    const path = window.location.pathname.replace(/.*\//, '/');
    const finishMessagePaths = new Set([
      '/space-play.html', '/music-play.html', '/ocean-play.html', '/detective-play.html', '/kitchen-play.html',
      '/park-play.html', '/mail-play.html', '/cinema-play.html', '/escape-play.html', '/finale-play.html'
    ]);
    const finishArt = {
      '/space-play.html': '🚀🪐✨',
      '/music-play.html': '🎵🎹🎧',
      '/ocean-play.html': '🌊🐠🤖',
      '/detective-play.html': '🔎🕵️‍♀️✨',
      '/kitchen-play.html': '🧁🍪🤖',
      '/park-play.html': '🎡🎢🎟️',
      '/mail-play.html': '✉️📬🤖',
      '/cinema-play.html': '🎬🤖🌟',
      '/escape-play.html': '🔐🗝️🚪',
      '/finale-play.html': '🏙️🤖🏆'
    };
    const finalMission = isLast(lessons, lesson);
    const finishedCourse = finishMessagePaths.has(path) && finalMission;
    const href = nextHref || missionHref || info.next || 'sisi.html';
    const label = nextLabel || (missionHref ? '➡️ למשימה הבאה' : (info.next ? '➡️ לשיעור הבא' : '🤖 לעמוד סיסי'));
    const displayBadge = badge || (finishedCourse ? '🏆 סיום כל המשימות!' : '🎉 הצלחה!');
    const displayTitle = title || (finishedCourse ? `סיימתם את כל משימות ${info.title}!` : 'סיסי הצליחה במשימה');
    const displayMessage = finishedCourse
      ? `איזה יופי! השלמתם את כל ${lessons?.length || ''} המשימות בשיעור הזה. סיסי גאה בכם — אפשר לעבור לשיעור הבא או לנסות שוב בשביל הכיף.`
      : (message || 'כל הכבוד! אפשר להמשיך קדימה או לנסות שוב מהתחלה.');
    const displayArt = finishedCourse ? `<div class="sisi-finish-art" aria-hidden="true">${finishArt[path] || '🤖🏆✨'}</div>` : '';
    const card = document.createElement('div');
    card.id = 'sisi-success-dialog';
    card.className = 'sisi-success-backdrop';
    card.setAttribute('role', 'dialog');
    card.setAttribute('aria-modal', 'true');
    card.innerHTML = `
      <div class="sisi-success-dialog">
        <div class="badge">${displayBadge}</div>
        ${displayArt}
        <h2>${displayTitle}</h2>
        <p>${displayMessage}</p>
        <div class="sisi-success-actions">
          <a class="btn" href="${href}">${label}</a>
          <button class="btn repeat" type="button" data-repeat>${repeatLabel || '🔁 לנסות שוב'}</button>
        </div>
      </div>
    `;
    card.querySelector('[data-repeat]')?.addEventListener('click', () => {
      card.remove();
      if (typeof onRepeat === 'function') onRepeat();
      else window.location.href = window.location.href;
    });
    document.body.appendChild(card);
    return true;
  }

  function clearSuccessDialog() {
    document.getElementById('sisi-success-dialog')?.remove();
  }

  window.SisiCourseCertificate = { show, clear };
  window.SisiProgress = { mark: markProgress };
  window.SisiSuccessDialog = { show: showSuccessDialog, clear: clearSuccessDialog };
  window.SisiMissionProgress = { getUnlocked: getUnlockedMission, getCompleted: getCompletedMissions, setUnlocked: setUnlockedMission, markComplete: markMissionComplete, decorate: decorateMissionNav };
})();
