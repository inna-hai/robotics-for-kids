(() => {
  const TOKEN_KEY = 'haiTechSummerToken';
  const BADGE_ID = 'hai-user-badge';

  function token() {
    return localStorage.getItem(TOKEN_KEY) || '';
  }

  function isQuietGuestPage() {
    const path = window.location.pathname.replace(/\/+$/, '') || '/';
    return ['/', '/index.html', '/summer-subscription.html', '/register.html', '/login.html', '/thankyou.html'].includes(path);
  }

  function removeBadge() {
    const badge = document.getElementById(BADGE_ID);
    if (badge) badge.remove();
  }

  function addStyles() {
    if (document.getElementById('hai-user-badge-style')) return;
    const style = document.createElement('style');
    style.id = 'hai-user-badge-style';
    style.textContent = `
      #${BADGE_ID}{position:fixed;z-index:99999;left:12px;bottom:12px;max-width:min(420px,calc(100vw - 24px));font-family:Rubik,Arial,sans-serif;direction:rtl;color:#0f172a;background:rgba(255,255,255,.96);border:1px solid #dbeafe;border-radius:999px;padding:9px 13px;box-shadow:0 14px 42px rgba(15,23,42,.18);display:flex;align-items:center;gap:8px;font-weight:900;font-size:.92rem;backdrop-filter:blur(14px)}
      #${BADGE_ID}.clickable{cursor:pointer}
      #${BADGE_ID}.clickable:focus{outline:3px solid #bfdbfe;outline-offset:3px}
      #${BADGE_ID} .hai-user-dot{width:10px;height:10px;border-radius:999px;background:#94a3b8;box-shadow:0 0 0 4px #f1f5f9}
      #${BADGE_ID} .hai-user-arrow{font-size:.82rem;color:#64748b;line-height:1}
      #${BADGE_ID} .hai-user-menu{position:absolute;right:0;bottom:calc(100% + 8px);display:none;min-width:180px;background:white;border:1px solid #dbeafe;border-radius:16px;padding:8px;box-shadow:0 18px 48px rgba(15,23,42,.18)}
      #${BADGE_ID}.menu-open .hai-user-menu{display:block}
      #${BADGE_ID} .hai-user-menu button{width:100%;border:0;border-radius:12px;background:#fff1f2;color:#be123c;padding:10px 12px;font:900 .9rem Rubik,Arial,sans-serif;cursor:pointer;text-align:center}
      #${BADGE_ID} .hai-user-menu button:hover,#${BADGE_ID} .hai-user-menu button:focus{background:#ffe4e6;outline:none}
      #${BADGE_ID}.child .hai-user-dot{background:#16a34a;box-shadow:0 0 0 4px #dcfce7}
      #${BADGE_ID}.classroom .hai-user-dot{background:#4f46e5;box-shadow:0 0 0 4px #e0e7ff}
      #${BADGE_ID}.teacher{left:auto;right:12px;bottom:12px;max-width:min(260px,calc(100vw - 24px));padding:7px 10px;border-radius:14px;font-size:.78rem;box-shadow:0 10px 26px rgba(15,23,42,.12)}
      #${BADGE_ID}.teacher small{font-size:.68rem}
      #${BADGE_ID}.teacher b{max-width:205px}
      #${BADGE_ID}.parent .hai-user-dot{background:#f59e0b;box-shadow:0 0 0 4px #fef3c7}
      #${BADGE_ID}.guest .hai-user-dot{background:#64748b;box-shadow:0 0 0 4px #f1f5f9}
      #${BADGE_ID} small{display:block;color:#64748b;font-weight:800;font-size:.78rem;line-height:1.15}
      #${BADGE_ID} b{display:block;line-height:1.15;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:330px}
      @media(max-width:560px){#${BADGE_ID}{left:8px;right:8px;bottom:8px;border-radius:18px;justify-content:flex-start;font-size:.86rem}#${BADGE_ID} b{max-width:calc(100vw - 90px)}#${BADGE_ID}.teacher{left:auto;right:8px;max-width:min(230px,calc(100vw - 16px));font-size:.74rem}#${BADGE_ID}.teacher b{max-width:175px}}
    `;
    document.head.appendChild(style);
  }

  function refreshAfterLogout() {
    if (typeof window.location.reload === 'function') {
      window.location.reload();
      return;
    }
    window.location.href = window.location.href;
  }

  async function logoutBadge(mode) {
    if (mode === 'classroom' || mode === 'classroom-teacher') {
      const response = await fetch('/api/classroom/logout', { method: 'POST', credentials: 'same-origin' });
      if (!response.ok) throw new Error('logout failed');
      refreshAfterLogout();
      return;
    }
    if (mode === 'subscription' || mode === 'subscription-parent') {
      localStorage.removeItem(TOKEN_KEY);
      refreshAfterLogout();
    }
  }

  function setBadge(kind, title, subtitle, options = {}) {
    addStyles();
    let badge = document.getElementById(BADGE_ID);
    if (!badge) {
      badge = document.createElement('div');
      badge.id = BADGE_ID;
      badge.setAttribute('role', 'status');
      badge.setAttribute('aria-live', 'polite');
      document.body.appendChild(badge);
    }
    const canLogout = Boolean(options.logoutMode);
    badge.className = `${kind}${canLogout ? ' clickable' : ''}`;
    if (canLogout) {
      badge.setAttribute('role', 'button');
      badge.setAttribute('tabindex', '0');
      badge.setAttribute('aria-haspopup', 'menu');
      badge.setAttribute('aria-expanded', 'false');
      badge.setAttribute('title', 'לחיצה לפתיחת תפריט משתמש');
    } else {
      badge.setAttribute('role', 'status');
      badge.setAttribute('aria-live', 'polite');
      badge.removeAttribute?.('tabindex');
      badge.removeAttribute?.('aria-haspopup');
      badge.removeAttribute?.('aria-expanded');
      badge.removeAttribute?.('title');
    }
    badge.innerHTML = `<span class="hai-user-dot" aria-hidden="true"></span><span><b>${escapeHtml(title)}</b><small>${escapeHtml(subtitle)}</small></span>${canLogout ? '<span class="hai-user-arrow" aria-hidden="true">⌃</span><span class="hai-user-menu" role="menu"><button type="button" data-hai-logout role="menuitem">התנתקות</button></span>' : ''}`;
    badge.onclick = async event => {
      if (!canLogout) return;
      event.stopPropagation?.();
      if (event.target?.closest?.('[data-hai-logout]')) {
        const button = event.target.closest('[data-hai-logout]');
        button.disabled = true;
        button.textContent = 'מתנתקות…';
        try {
          await logoutBadge(options.logoutMode);
        } catch {
          button.disabled = false;
          button.textContent = 'לא הצלחנו להתנתק';
        }
        return;
      }
      const open = !badge.classList.contains('menu-open');
      badge.classList.toggle('menu-open', open);
      badge.setAttribute('aria-expanded', String(open));
    };
    badge.onkeydown = event => {
      if (!canLogout) return;
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault?.();
        badge.click?.();
      }
      if (event.key === 'Escape') {
        badge.classList.remove('menu-open');
        badge.setAttribute('aria-expanded', 'false');
      }
    };
  }

  function setAccessContext(mode, detail = {}) {
    window.HaiAccessContext = { mode, ...detail };
    window.dispatchEvent(new CustomEvent('hai:access-context', { detail: window.HaiAccessContext }));
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  }

  async function load() {
    try {
      const classroomResponse = await fetch('/api/classroom/me', { credentials: 'same-origin' });
      if (classroomResponse.ok) {
        const classroomData = await classroomResponse.json();
        if (classroomData.role === 'student') {
          setAccessContext('classroom', {
            studentName: classroomData.student?.name || '',
            classroomName: classroomData.classroom?.name || '',
          });
          setBadge(
            'classroom',
            `${classroomData.student?.name || 'תלמיד/ה'} · תלמיד/ת כיתה`,
            `${classroomData.classroom?.name || 'כיתה'} · ההתקדמות נשלחת למורה`,
            { logoutMode: 'classroom' },
          );
          return;
        }
        if (classroomData.role === 'teacher') {
          setAccessContext('classroom-teacher', { teacherName: classroomData.teacher?.name || '' });
          setBadge('classroom teacher', `${classroomData.teacher?.name || 'מורה'} · סביבת מורה`, 'ניהול כיתות ודוחות', { logoutMode: 'classroom-teacher' });
          return;
        }
      }
    } catch {}

    const authToken = token();
    if (!authToken) {
      setAccessContext('guest');
      if (isQuietGuestPage()) {
        removeBadge();
        return;
      }
      setBadge('guest', 'מצב אורח', 'ההתקדמות נשמרת רק במכשיר הזה');
      return;
    }
    try {
      const response = await fetch('/api/summer/me', { headers: { Authorization: `Bearer ${authToken}` } });
      if (!response.ok) throw new Error('not logged in');
      const data = await response.json();
      if (data.mode === 'child') {
        setAccessContext('subscription', { childName: data.child?.name || data.user?.studentName || '' });
        setBadge('subscription child', `${data.child?.name || data.user?.studentName || 'ילד/ה'} · מנוי אישי`, 'התקדמות נשמרת לילד/ה הזה/ו', { logoutMode: 'subscription' });
        return;
      }
      setAccessContext('subscription-parent', { parentName: data.user?.parentName || '' });
      setBadge('subscription parent', `${data.user?.parentName || 'הורה'} — תצוגת הורה`, 'אפשר לצפות; התקדמות לא נשמרת לילד', { logoutMode: 'subscription-parent' });
    } catch {
      setAccessContext('guest');
      setBadge('guest', 'מצב אורח', 'התחברו כדי לשמור התקדמות');
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', load);
  else load();
})();
