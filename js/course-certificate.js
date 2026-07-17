(() => {
  if (window.SisiCourseCertificate) return;

  const courses = {
    '/space-play.html': { title: 'שיעור החלל', home: 'space.html', homeLabel: '🪐 לעמוד שיעור החלל', next: 'music.html', nextLabel: '🎵 לשיעור הבא' },
    '/music-play.html': { title: 'מכונת המוזיקה', home: 'music.html', homeLabel: '🎶 לעמוד המוזיקה', next: 'ocean.html', nextLabel: '🌊 לשיעור הבא' },
    '/ocean-play.html': { title: 'האוקיינוס', home: 'ocean.html', homeLabel: '🌊 לעמוד האוקיינוס', next: 'detective.html', nextLabel: '🕵️‍♀️ לשיעור הבא' },
    '/detective-play.html': { title: 'סיסי הבלשית', home: 'detective.html', homeLabel: '🔎 לעמוד הבלשות', next: 'kitchen.html', nextLabel: '🧁 לשיעור הבא' },
    '/kitchen-play.html': { title: 'מטבח הקסמים', home: 'kitchen.html', homeLabel: '🧁 לעמוד המטבח', next: 'dino.html', nextLabel: '🦕 לשיעור הבא' },
    '/dino-play.html': { title: 'פארק הדינוזאורים', home: 'dino.html', homeLabel: '🦕 לעמוד הדינוזאורים', next: 'dino-lab.html', nextLabel: '🧬 למעבדת הדינוזאורים' },
    '/art-play.html': { title: 'ציור הפיקסלים', home: 'art.html', homeLabel: '🎨 לעמוד הציור', next: 'weather.html', nextLabel: '🌦️ לשיעור הבא' },
    '/weather-play.html': { title: 'תחנת מזג האוויר', home: 'weather.html', homeLabel: '🌦️ לעמוד מזג האוויר', next: 'factory.html', nextLabel: '🏭 לשיעור הבא' },
    '/factory-play.html': { title: 'מפעל הלולאות', home: 'factory.html', homeLabel: '🏭 לעמוד המפעל', next: 'factory-lab.html', nextLabel: '🏭 למעבדת הלולאות' },
    '/garden-play.html': { title: 'גינת הרובוטים', home: 'garden.html', homeLabel: '🌱 לעמוד הגינה', next: 'garden-lab.html', nextLabel: '🌱 למעבדת הגינה' },
    '/park-play.html': { title: 'פארק השעשועים', home: 'park.html', homeLabel: '🎡 לעמוד הפארק', next: 'park-lab.html', nextLabel: '🎢 למעבדת הפארק' },
    '/mail-play.html': { title: 'מרכז הדואר', home: 'mail.html', homeLabel: '✉️ לעמוד הדואר', next: 'mail-lab.html', nextLabel: '✉️ למעבדת הדואר' },
    '/cinema-play.html': { title: 'בימוי הרובוטים', home: 'cinema.html', homeLabel: '🎬 לעמוד הקולנוע', next: 'cinema-lab.html', nextLabel: '🎬 למעבדת הבימוי' },
    '/escape-play.html': { title: 'חדר הבריחה', home: 'escape.html', homeLabel: '🔐 לעמוד חדר הבריחה', next: 'escape-lab.html', nextLabel: '🔐 למעבדת חדר הבריחה' },
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

  function courseInfo(override = {}) {
    const path = window.location.pathname.replace(/.*\//, '/');
    return { ...(courses[path] || { title: 'השיעור', home: 'sisi.html', homeLabel: '🤖 לכל שיעורי סיסי' }), ...override };
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
      <p>סיסי השלימה יחד איתכם את כל ${count} המשימות. אפשר לחזור לעמוד השיעור, להמשיך לחלק הבא, או לעבור לכל שיעורי סיסי.</p>
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

  window.SisiCourseCertificate = { show, clear };
})();
