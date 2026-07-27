(() => {
  const TOKEN_KEY = 'haiTechSummerToken';
  const API_PATHS = {
    register: '/api/summer/register',
    login: '/api/summer/login',
    'child-login': '/api/summer/child-login',
    me: '/api/summer/me',
    logout: '/api/summer/logout',
    children: '/api/summer/children',
    progress: '/api/progress?courseId=sisi&lessonId=space',
  };
  const forms = {
    register: document.getElementById('register-form'),
    login: document.getElementById('login-form'),
    'child-login': document.getElementById('child-login-form'),
  };
  const message = document.getElementById('auth-message');
  const dashboard = document.getElementById('dashboard-panel');
  const authPanel = document.getElementById('auth-panel');
  const welcome = document.getElementById('welcome-text');
  const statusBadge = document.getElementById('subscription-status');

  function setMessage(text, type = '') {
    if (!message) return;
    message.textContent = text || '';
    message.className = `message ${type}`.trim();
  }

  function saveToken(token) {
    if (token) localStorage.setItem(TOKEN_KEY, token);
  }

  function getToken() {
    return localStorage.getItem(TOKEN_KEY) || '';
  }

  function clearToken() {
    localStorage.removeItem(TOKEN_KEY);
  }

  async function loadProgressSummary() {
    const summary = document.getElementById('progress-summary');
    if (!summary) return;
    try {
      const data = await api(API_PATHS.progress);
      const completed = (data.progress || []).filter((item) => item.status === 'completed').length;
      summary.textContent = completed ? `התקדמות: הושלמו ${completed} משימות בשיעור הראשון.` : 'התקדמות: עדיין אין משימות שהושלמו.';
    } catch {
      summary.textContent = 'התקדמות: תופיע כאן אחרי התחברות והשלמת משימות.';
    }
  }

  function renderChildren(children = []) {
    const box = document.getElementById('children-box');
    const list = document.getElementById('children-list');
    if (!box || !list) return;
    box.hidden = false;
    list.innerHTML = children.length ? children.map((child) => `
      <article class="child-card">
        <strong>${escapeHtml(child.name)}</strong>
        <span>קוד ילד: <b dir="ltr">${escapeHtml(child.accessCode)}</b></span>
        <small>הילד/ה נכנס/ת דרך login.html עם הקוד הזה וה-PIN שבחרת.</small>
      </article>
    `).join('') : '<p class="hint">עדיין לא נוספו ילדים.</p>';
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[char]));
  }

  function renderUser(user, options = {}) {
    if (!user) return;
    if (authPanel) authPanel.style.display = 'none';
    if (dashboard) dashboard.classList.add('active');
    const child = options.child;
    const isChild = options.mode === 'child';
    if (welcome) welcome.textContent = isChild && child
      ? `שלום ${child.name}, אפשר להתחיל ללמוד.`
      : `שלום ${user.parentName}, החשבון של ${user.studentName} מוכן.`;
    const active = user.subscriptionStatus === 'active';
    if (statusBadge) {
      statusBadge.textContent = active ? 'מנוי פעיל' : 'התנסות פתוחה';
      statusBadge.classList.toggle('active', active);
    }
    if (!isChild) renderChildren(options.children || []);
    loadProgressSummary();
  }

  async function api(path, payload) {
    const headers = { 'Content-Type': 'application/json' };
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
    const response = await fetch(path, {
      method: payload ? 'POST' : 'GET',
      headers,
      body: payload ? JSON.stringify(payload) : undefined,
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || 'משהו השתבש.');
    return data;
  }

  document.querySelectorAll('[data-tab]').forEach((tab) => {
    tab.addEventListener('click', () => {
      const selected = tab.dataset.tab;
      document.querySelectorAll('[data-tab]').forEach(button => button.classList.toggle('active', button === tab));
      Object.entries(forms).forEach(([name, form]) => {
        if (form) form.hidden = name !== selected;
      });
      setMessage('');
    });
  });


  document.querySelectorAll('[data-toggle-password]').forEach((button) => {
    button.addEventListener('click', () => {
      const input = document.getElementById(button.dataset.togglePassword);
      if (!input) return;
      const show = input.type === 'password';
      input.type = show ? 'text' : 'password';
      button.setAttribute('aria-label', show ? 'הסתרת סיסמה' : 'הצגת סיסמה');
      button.setAttribute('aria-pressed', show ? 'true' : 'false');
    });
  });

  Object.entries(forms).forEach(([action, form]) => {
    if (!form) return;
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const submit = form.querySelector('button[type="submit"]');
      submit.disabled = true;
      setMessage('בודק...', '');
      try {
        const payload = Object.fromEntries(new FormData(form).entries());
        if (action === 'register' && payload.password !== payload.confirmPassword) {
          throw new Error('הסיסמאות לא תואמות. נא להקליד שוב.');
        }
        const data = await api(API_PATHS[action], payload);
        saveToken(data.token);
        setMessage(action === 'register' ? 'החשבון נוצר. אפשר להתחיל ללמוד.' : 'נכנסת בהצלחה.', 'ok');
        renderUser(data.user, data);
      } catch (error) {
        setMessage(error.message, 'error');
      } finally {
        submit.disabled = false;
      }
    });
  });

  const logout = document.getElementById('logout-button');
  if (logout) {
    logout.addEventListener('click', () => {
      api(API_PATHS.logout, {}).catch(() => {}).finally(() => {
        clearToken();
        dashboard.classList.remove('active');
        if (authPanel) authPanel.style.display = '';
        setMessage('התנתקת.', 'ok');
      });
    });
  }

  const addChildForm = document.getElementById('add-child-form');
  if (addChildForm) {
    addChildForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const submit = addChildForm.querySelector('button[type="submit"]');
      submit.disabled = true;
      setMessage('מוסיף ילד/ה...', '');
      try {
        const payload = Object.fromEntries(new FormData(addChildForm).entries());
        const data = await api(API_PATHS.children, payload);
        renderChildren(data.children || []);
        addChildForm.reset();
        setMessage(`נוסף ילד/ה. קוד כניסה: ${data.child.accessCode}`, 'ok');
      } catch (error) {
        setMessage(error.message, 'error');
      } finally {
        submit.disabled = false;
      }
    });
  }

  if (getToken()) {
    api(API_PATHS.me)
      .then(data => renderUser(data.user, data))
      .catch(() => clearToken());
  }
})();
