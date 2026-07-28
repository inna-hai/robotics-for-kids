(() => {
  const TOKEN_KEY = 'haiTec…oken';
  const BADGE_ID = 'hai-user-badge';

  function token() {
    return localStorage.getItem(TOKEN_KEY) || '';
  }

  function addStyles() {
    if (document.getElementById('hai-user-badge-style')) return;
    const style = document.createElement('style');
    style.id = 'hai-user-badge-style';
    style.textContent = `
      #${BADGE_ID}{position:fixed;z-index:99999;left:12px;bottom:12px;max-width:min(420px,calc(100vw - 24px));font-family:Rubik,Arial,sans-serif;direction:rtl;color:#0f172a;background:rgba(255,255,255,.96);border:1px solid #dbeafe;border-radius:999px;padding:9px 13px;box-shadow:0 14px 42px rgba(15,23,42,.18);display:flex;align-items:center;gap:8px;font-weight:900;font-size:.92rem;backdrop-filter:blur(14px)}
      #${BADGE_ID} .hai-user-dot{width:10px;height:10px;border-radius:999px;background:#94a3b8;box-shadow:0 0 0 4px #f1f5f9}
      #${BADGE_ID}.child .hai-user-dot{background:#16a34a;box-shadow:0 0 0 4px #dcfce7}
      #${BADGE_ID}.parent .hai-user-dot{background:#f59e0b;box-shadow:0 0 0 4px #fef3c7}
      #${BADGE_ID}.guest .hai-user-dot{background:#64748b;box-shadow:0 0 0 4px #f1f5f9}
      #${BADGE_ID} small{display:block;color:#64748b;font-weight:800;font-size:.78rem;line-height:1.15}
      #${BADGE_ID} b{display:block;line-height:1.15;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:330px}
      @media(max-width:560px){#${BADGE_ID}{left:8px;right:8px;bottom:8px;border-radius:18px;justify-content:flex-start;font-size:.86rem}#${BADGE_ID} b{max-width:calc(100vw - 90px)}}
    `;
    document.head.appendChild(style);
  }

  function setBadge(kind, title, subtitle) {
    addStyles();
    let badge = document.getElementById(BADGE_ID);
    if (!badge) {
      badge = document.createElement('div');
      badge.id = BADGE_ID;
      badge.setAttribute('role', 'status');
      badge.setAttribute('aria-live', 'polite');
      document.body.appendChild(badge);
    }
    badge.className = kind;
    badge.innerHTML = `<span class="hai-user-dot" aria-hidden="true"></span><span><b>${escapeHtml(title)}</b><small>${escapeHtml(subtitle)}</small></span>`;
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  }

  async function load() {
    const authToken = token();
    if (!authToken) {
      setBadge('guest', 'לא מחובר/ת', 'התקדמות לא תישמר עד כניסה');
      return;
    }
    try {
      const response = await fetch('/api/summer/me', { headers: { Authorization: `Bearer ${authToken}` } });
      if (!response.ok) throw new Error('not logged in');
      const data = await response.json();
      if (data.mode === 'child') {
        setBadge('child', `${data.child?.name || data.user?.studentName || 'ילד/ה'} מבצע/ת שיעורים`, 'התקדמות נשמרת לילד/ה הזה/ו');
        return;
      }
      setBadge('parent', `${data.user?.parentName || 'הורה'} — תצוגת הורה`, 'אפשר לצפות; התקדמות לא נשמרת לילד');
    } catch {
      setBadge('guest', 'לא מחובר/ת', 'התחברו כדי לשמור התקדמות');
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', load);
  else load();
})();
