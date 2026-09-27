(() => {
  const allowedNext = new Set([
    'sensi-city.html?lesson=1',
    'sisi.html',
    'python-turtle.html',
    'webcode.html',
    'minecraft.html',
    'craftom-school/preview/index.html',
  ]);

  const params = new URLSearchParams(location.search);
  const requested = params.get('next') || '';
  const next = allowedNext.has(requested) ? requested : 'index.html#courses';
  const forcedStudentLogin = params.get('student_login') === '1';
  const compoundId = String(params.get('c') || '').trim();
  const guestNext = 'sisi.html';
  const guest = document.getElementById('guest-continue');
  const subscription = document.getElementById('subscription-continue');
  const guestCard = document.getElementById('guest-choice-card');
  const subscriptionCard = document.getElementById('subscription-choice-card');
  const entryIntro = document.getElementById('classroom-entry-intro');
  const classroomTitle = document.getElementById('classroom-login-title');
  const classroomDescription = document.getElementById('classroom-login-description');
  const identifierLabel = document.getElementById('classroom-identifier-label');
  const passwordLabel = document.getElementById('classroom-password-label');
  const submitButton = document.getElementById('classroom-login-submit');
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

  function redirectForRole(role) {
    if (role === 'teacher') location.assign('teacher-classrooms.html');
    if (role === 'student') location.assign('classroom-student.html');
  }

  function nextWithCompound() {
    if (!compoundId || !allowedNext.has(requested)) return next;
    const url = new URL(next, location.origin || window.location.origin);
    url.searchParams.set('c', compoundId);
    return `${url.pathname.replace(/^\//, '')}${url.search}${url.hash}`;
  }

  function renderForcedStudentLogin() {
    document.body.classList.add('forced-student-login');
    if (guestCard) guestCard.hidden = true;
    if (subscriptionCard) subscriptionCard.hidden = true;
    if (previewDemoStudent) previewDemoStudent.hidden = true;
    if (entryIntro) {
      entryIntro.querySelector('.eyebrow').textContent = 'כניסת תלמיד ממיינקראפט';
      entryIntro.querySelector('h1').textContent = 'כניסה ללומדה';
      entryIntro.querySelector('p').textContent = 'הכניסו קוד כיתה וקוד אישי כדי לפתוח את הלומדה מתוך עולם Minecraft.';
    }
    if (classroomTitle) classroomTitle.textContent = 'כניסת תלמיד';
    if (classroomDescription) classroomDescription.textContent = 'נכנסים עם קוד הכיתה והקוד האישי, ואז חוזרים ישר ללומדה.';
    if (identifierLabel) identifierLabel.firstChild.textContent = 'קוד כיתה';
    if (passwordLabel) passwordLabel.firstChild.textContent = 'קוד אישי או שם';
    if (submitButton) submitButton.textContent = 'כניסה ללומדה';
  }

  async function clearExistingSessionsForStudentLogin() {
    setMessage('מכינים כניסת תלמיד…');
    try {
      await request('/api/classroom/logout', {});
    } catch {}
    try {
      await summerRequest('/api/summer/logout');
      localStorage.removeItem('haiTechSummerToken');
    } catch {}
    setMessage('');
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
    passwordToggle.setAttribute('aria-label', reveal ? 'הסתרת סיסמה' : 'הצגת סיסמה');
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    setMessage('נכנסים…');
    try {
      const data = Object.fromEntries(new FormData(event.currentTarget).entries());
      const identifier = String(data.identifier || '').trim();
      const password = String(data.password || '');
      const teacherLogin = !forcedStudentLogin && identifier.includes('@');
      const result = teacherLogin
        ? await request('/api/classroom/teacher-login', { email: identifier, password })
        : await request('/api/classroom/student-login', { classCode: identifier, personalCode: password });
      setMessage('', true);
      if (forcedStudentLogin) {
        if (result.role !== 'student') throw new Error('הכניסה הזו מיועדת לתלמידים בלבד.');
        location.assign(nextWithCompound());
        return;
      }
      redirectForRole(result.role);
    } catch (error) {
      setMessage(error.message);
    }
  });

  if (previewDemoStudent && !forcedStudentLogin) {
    request('/api/classroom/preview-demo-student-enabled')
      .then((data) => { if (data.enabled) previewDemoStudent.hidden = false; })
      .catch(() => {});
    previewDemoStudent.addEventListener('click', async () => {
      setMessage('פותחים תלמידת בדיקה…');
      previewDemoStudent.disabled = true;
      try {
        const data = await request('/api/classroom/preview-demo-student-login', {});
        redirectForRole(data.role);
      } catch (error) {
        setMessage(error.message);
      } finally {
        previewDemoStudent.disabled = false;
      }
    });
  }

  if (forcedStudentLogin) {
    renderForcedStudentLogin();
    clearExistingSessionsForStudentLogin();
  } else {
    request('/api/classroom/me')
      .then((me) => {
        if (me.role === 'teacher' || me.role === 'student') redirectForRole(me.role);
        else if (me.subscriptionGateEnabled === false && allowedNext.has(requested)) location.assign(requested);
      })
      .catch(() => {});
  }
})();
