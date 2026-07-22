async function post(url, body) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body || {})
  });
  const data = await res.json().catch(() => ({ ok: res.ok }));
  if (!res.ok && data.ok !== false) data.ok = false;
  if (!res.ok && !data.error) data.error = 'הפעולה לא הצליחה. נסו שוב בעוד רגע.';
  return data;
}

function setMsg(message, error) {
  const el = document.getElementById('msg');
  if (!el) return;
  el.textContent = message || '';
  el.classList.toggle('error', !!error);
}

function esc(value) {
  return String(value == null ? '' : value).replace(/[&<>"']/g, ch => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[ch]));
}

const TASK_STATUS = {
  to_do: 'לביצוע',
  in_progress: 'בתהליך',
  submitted: 'הוגש',
  needs_fix: 'צריך תיקון',
  completed: 'הושלם',
  feedback: 'משוב',
  open: 'פתוח',
  empty: 'ריק',
  build: 'בנייה',
  code: 'קוד',
};

function taskStatusLabel(status) {
  return TASK_STATUS[status] || status || 'לביצוע';
}

function taskStatusClass(status) {
  return String(status || 'to_do').replace(/[^a-z0-9_-]/gi, '-').toLowerCase();
}

function statusBadge(status) {
  return `<em class="status-badge status-${taskStatusClass(status)}">${esc(taskStatusLabel(status))}</em>`;
}

function toast(message, error) {
  let el = document.getElementById('toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'toast';
    document.body.appendChild(el);
  }
  el.textContent = message || '';
  el.classList.toggle('error', !!error);
  el.classList.add('show');
  window.clearTimeout(el._timer);
  el._timer = window.setTimeout(() => el.classList.remove('show'), 2600);
}

async function guard(roles) {
  const data = await fetch('/api/me').then(r => r.ok ? r.json() : null).catch(() => null);
  if (!data || !data.ok) {
    location.replace('/login.html?next=' + encodeURIComponent(location.pathname));
    return null;
  }
  if (roles && !roles.includes(data.user.role)) {
    location.replace(data.home_url || '/');
    return null;
  }
  return data;
}

function navigateTo(url) {
  document.body.classList.add('page-leaving');
  window.setTimeout(() => { location.href = url; }, 170);
}

async function logout() {
  await fetch('/api/logout', { method: 'POST' }).catch(() => {});
  navigateTo('/login.html');
}

window.addEventListener('DOMContentLoaded', () => {
  requestAnimationFrame(() => document.body.classList.add('page-ready'));
});
