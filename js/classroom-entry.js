(() => {
  const allowedNext = new Set([
    'sensi-city.html?lesson=1',
    'sisi.html',
    'python-turtle.html',
    'webcode.html',
    'minecraft.html',
    'craftom-school/preview/index.html',
  ]);

  const query = new URLSearchParams(location.search);
  const requested = query.get('next') || '';
  const autoDemoStudent = query.get('demoStudent') === '1';
  const switchToStudent = query.get('switchRole') === 'student';
  const next = allowedNext.has(requested) ? requested : 'index.html#courses';
  const guestNext = 'sisi.html';
  const guest = document.getElementById('guest-continue');
  const subscription = document.getElementById('subscription-continue');
  const form = document.getElementById('classroom-login-form');
  const message = document.getElementById('classroom-login-message');
  const password = document.getElementById('classroom-password');
  const passwordToggle = document.getElementById('classroom-password-toggle');
  const previewDemoStudent = document.getElementById('preview-demo-student');

  function summerToken() {
    return localStorage.getItem('haiTechSummerToken') || '';
  }

  async function request(path, payload) {
    const response = await fetch(path, {
      method: payload === undefined ? 'GET' : 'POST',
      credentials: 'same-origin',
      headers: payload === undefined ? {} : { 'Content-Type': 'application/json' },
      body: payload === undefined ? undefined : JSON.stringify(payload),
    });
    let data = {};
    try { data = await response.json(); } catch {}
    if (!response.ok) throw new Error(data.error || 'הפעולה לא הצליחה.');
    return data;
  }

  async function summerRequest(path) {
    const token = summerToken();
    const response = await fetch(path, {
      method: path.endsWith('/logout') ? 'POST' : 'GET',
      credentials: 'same-origin',
      headers: token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' },
      body: path.endsWith('/logout') ? '{}' : undefined,
    });
    let data = {};
    try { data = await response.json(); } catch {}
    if (!response.ok) throw new Error(data.error || 'הפעולה לא הצליחה.');
    return data;
  }

  function setMessage(text, success = false) {
    message.textContent = text || '';
    message.classList.toggle('success', success);
  }

  function redirectForRole(role, targetNext = '') {
    if (role === 'teacher') location.assign('teacher-classrooms.html');
    if (role === 'student') location.assign(targetNext && allowedNext.has(targetNext) ? targetNext : 'classroom-student.html');
  }

  async function openPreviewDemoStudent() {
    setMessage('פותחים תלמידת בדיקה…');
    if (previewDemoStudent) previewDemoStudent.disabled = true;
    try {
      await request('/api/classroom/logout', {}).catch(() => {});
      const data = await request('/api/classroom/preview-demo-student-login', {});
      redirectForRole(data.role, autoDemoStudent ? next : '');
    } catch (error) {
      setMessage(error.message);
    } finally {
      if (previewDemoStudent) previewDemoStudent.disabled = false;
    }
  }

  guest.href = guestNext;
  guest.addEventListener('click', async (event) => {
    event.preventDefault();
    setMessage('עוברים למצב אורח…');
    try {
      await request('/api/classroom/logout', {});
      await summerRequest('/api/summer/logout');
      localStorage.removeItem('haiTechSummerToken');
      location.assign(guestNext);
    } catch (error) {
      setMessage(error.message);
    }
  });

  subscription.addEventListener('click', async (event) => {
    event.preventDefault();
    setMessage('עוברים למנוי האישי…');
    try {
      await request('/api/classroom/logout', {});
    } catch (error) {
      setMessage(error.message);
      return;
    }
    if (!summerToken()) {
      location.assign('login.html');
      return;
    }
    try {
      const me = await summerRequest('/api/summer/me');
      location.assign(me.mode === 'child' ? next : 'account.html');
    } catch {
      localStorage.removeItem('haiTechSummerToken');
      location.assign('login.html');
    }
  });

  passwordToggle.addEventListener('click', () => {
    const reveal = password.type === 'password';
    password.type = reveal ? 'text' : 'password';
    passwordToggle.setAttribute('aria-pressed', reveal ? 'true' : 'false');
    passwordToggle.textContent = reveal ? 'הסתרת סיסמה' : 'הצגת סיסמה';
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    setMessage('נכנסים…');
    try {
      const data = Object.fromEntries(new FormData(event.currentTarget).entries());
      const identifier = String(data.identifier || '').trim();
      const password = String(data.password || '');
      const teacherLogin = identifier.includes('@');
      const result = teacherLogin
        ? await request('/api/classroom/teacher-login', { email: identifier, password })
        : await request('/api/classroom/student-login', { classCode: identifier, personalCode: password });
      setMessage('', true);
      redirectForRole(result.role);
    } catch (error) {
      setMessage(error.message);
    }
  });

  if (previewDemoStudent) {
    request('/api/classroom/preview-demo-student-enabled')
      .then((data) => { if (data.enabled) previewDemoStudent.hidden = false; })
      .catch(() => {});
    previewDemoStudent.addEventListener('click', async () => {
      await openPreviewDemoStudent();
    });
  }

  if (autoDemoStudent) {
    openPreviewDemoStudent();
  } else if (switchToStudent) {
    request('/api/classroom/logout', {})
      .catch(() => {})
      .finally(() => {
        history.replaceState(null, '', 'classroom-entry.html');
      });
  } else {
    request('/api/classroom/me')
      .then((me) => {
        if (me.role === 'teacher' || me.role === 'student') redirectForRole(me.role);
        else if (me.subscriptionGateEnabled === false && allowedNext.has(requested)) location.assign(requested);
      })
      .catch(() => {});
  }
})();
