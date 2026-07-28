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

  function routeFreeLessonsToRegistration() {
    freeLessonLinks.forEach((link) => {
      link.dataset.lessonHref = link.getAttribute('href') || '';
      link.setAttribute('href', 'register.html');
      const badge = link.querySelector('.access-badge');
      if (badge) badge.textContent = '✅ חינם אחרי הרשמה';
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', async () => {
      if (!(await isLoggedIn())) routeFreeLessonsToRegistration();
    });
  } else {
    isLoggedIn().then((loggedIn) => {
      if (!loggedIn) routeFreeLessonsToRegistration();
    });
  }
})();
