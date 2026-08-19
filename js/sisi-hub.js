(() => {
  const freeLessonLinks = document.querySelectorAll('[data-free-lesson]');
  if (!freeLessonLinks.length) return;

  async function isLoggedIn() {
    try {
      const response = await fetch('/api/summer/me', { credentials: 'same-origin' });
      return response.ok;
    } catch {
      return false;
    }
  }

  function keepFreeLessonsOnRegistration() {
    freeLessonLinks.forEach((link) => {
      link.setAttribute('href', 'register.html');
      const badge = link.querySelector('.access-badge');
      if (badge) badge.textContent = '✅ חינם אחרי הרשמה';
    });
  }

  function routeFreeLessonsToCourse() {
    freeLessonLinks.forEach((link) => {
      const target = link.dataset.lessonHref;
      if (target) link.setAttribute('href', target);
      const badge = link.querySelector('.access-badge');
      if (badge) badge.textContent = '✅ פתוח בחשבון שלך';
    });
  }

  async function updateFreeLessonLinks() {
    if (await isLoggedIn()) routeFreeLessonsToCourse();
    else keepFreeLessonsOnRegistration();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', updateFreeLessonLinks);
  else updateFreeLessonLinks();
})();
