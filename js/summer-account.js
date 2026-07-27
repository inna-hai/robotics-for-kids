(() => {
  const TOKEN_KEY = 'haiTechSummerToken';
  const API_PATHS = {
    register: '/api/summer/register',
    login: '/api/summer/login',
    me: '/api/summer/me',
    logout: '/api/summer/logout',
  };
  const forms = {
    register: document.getElementById('register-form'),
    login: document.getElementById('login-form'),
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

  function renderUser(user) {
    if (!user) return;
    authPanel.style.display = 'none';
    dashboard.classList.add('active');
    welcome.textContent = `שלום ${user.parentName}, החשבון של ${user.studentName} מוכן.`;
    const active = user.subscriptionStatus === 'active';
    statusBadge.textContent = active ? 'מנוי פעיל' : 'התנסות פתוחה';
    statusBadge.classList.toggle('active', active);
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
        renderUser(data.user);
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
        authPanel.style.display = '';
        setMessage('התנתקת.', 'ok');
      });
    });
  }

  if (getToken()) {
    api(API_PATHS.me)
      .then(data => renderUser(data.user))
      .catch(() => clearToken());
  }
})();
