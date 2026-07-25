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
      <p>סיסי השלימה יחד איתכם את כל ${count} המשימות. אפשר לחזור לעמוד השיעור, לעבור לשיעור הבא, או לעבור לכל שיעורי סיסי.</p>
      <div class="sisi-certificate-actions">
        <a class="btn" href="${info.home}">${info.homeLabel}</a>
        ${info.next ? `<a class="btn secondary" href="${info.next}">${info.nextLabel || '➡️ המשך'}</a>` : ''}
        <a class="btn secondary" href="sisi.html">🤖 כל שיעורי סיסי</a>
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

  function showSuccessDialog({ message, lessons, lesson, nextHref, nextLabel, repeatLabel, onRepeat } = {}) {
    injectDialogStyle();
    document.getElementById('sisi-success-dialog')?.remove();
    const info = courseInfo();
    const href = nextHref || nextMissionHref(lessons, lesson) || info.next || 'sisi.html';
    const label = nextLabel || (nextMissionHref(lessons, lesson) ? '➡️ לשיעור/משימה הבאה' : (info.nextLabel || '➡️ לשיעור הבא'));
    const card = document.createElement('div');
    card.id = 'sisi-success-dialog';
    card.className = 'sisi-success-backdrop';
    card.setAttribute('role', 'dialog');
    card.setAttribute('aria-modal', 'true');
    card.innerHTML = `
      <div class="sisi-success-dialog">
        <div class="badge">🎉 הצלחה!</div>
        <h2>סיסי הצליחה במשימה</h2>
        <p>${message || 'כל הכבוד! אפשר להמשיך קדימה או לנסות שוב מהתחלה.'}</p>
        <div class="sisi-success-actions">
          <a class="btn" href="${href}">${label}</a>
          <button class="btn repeat" type="button" data-repeat>${repeatLabel || '🔁 לחזור על השיעור הזה'}</button>
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
  window.SisiSuccessDialog = { show: showSuccessDialog, clear: clearSuccessDialog };
})();
