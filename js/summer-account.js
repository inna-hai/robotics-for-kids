(() => {
  const TOKEN_KEY = 'haiTechSummerToken';
  const API_PATHS = {
    register: '/api/summer/register',
    login: '/api/summer/login',
    'child-login': '/api/summer/child-login',
    me: '/api/summer/me',
    logout: '/api/summer/logout',
    children: '/api/summer/children',
    dashboard: '/api/summer/dashboard',
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

  const COURSE_LABELS = {
    sisi: 'סיסי',
    space: 'חלל',
    webcode: 'WebCode',
    minecraft: 'Minecraft Kids',
    pygame: 'Pygame',
    roblox: 'Roblox',
    sensi: 'סנסי',
  };

  function labelFor(value) {
    return COURSE_LABELS[value] || String(value || '').replace(/[-_]/g, ' ') || 'לא ידוע';
  }

  function formatDate(value) {
    if (!value) return 'עדיין אין פעילות';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'עדיין אין פעילות';
    return date.toLocaleString('he-IL', { dateStyle: 'short', timeStyle: 'short' });
  }

  async function loadProgressSummary() {
    const panel = document.getElementById('parent-progress');
    const summary = document.getElementById('progress-summary');
    const list = document.getElementById('parent-progress-list');
    if (!summary || !list) return;
    if (panel) panel.hidden = false;
    list.innerHTML = '<p class="hint">טוען התקדמות…</p>';
    try {
      const data = await api(API_PATHS.dashboard);
      const children = data.dashboard?.children || [];
      const totals = children.reduce((acc, item) => {
        acc.completed += item.summary?.completedActivities || 0;
        acc.total += item.summary?.totalActivities || 0;
        if ((item.summary?.lastActivityAt || '') > acc.last) acc.last = item.summary.lastActivityAt;
        return acc;
      }, { completed: 0, total: 0, last: '' });
      summary.textContent = totals.total
        ? `סה״כ: ${totals.completed}/${totals.total} משימות הושלמו · פעילות אחרונה: ${formatDate(totals.last)}`
        : 'עדיין אין פעילות לימודית שמורה. ברגע שילד/ה ישלים/תשלים משימה — זה יופיע כאן.';
      list.innerHTML = children.length ? children.map(renderChildProgress).join('') : '<p class="hint">עדיין לא נוספו ילדים.</p>';
    } catch {
      summary.textContent = 'התקדמות: תופיע כאן אחרי התחברות והשלמת משימות.';
      list.innerHTML = '';
    }
  }

  function renderChildProgress(item) {
    const child = item.child || {};
    const s = item.summary || {};
    const courses = item.courses || [];
    const courseHtml = courses.length ? courses.map((course) => `
      <details class="progress-course">
        <summary>
          <span>${escapeHtml(labelFor(course.courseId))}</span>
          <b>${course.completedActivities}/${course.totalActivities} · ${course.completionPercent || 0}%</b>
        </summary>
        <div class="lesson-list">
          ${(course.lessons || []).map((lesson) => `
            <div class="lesson-row">
              <span>${escapeHtml(labelFor(lesson.lessonId))}</span>
              <small>${lesson.completedActivities}/${lesson.totalActivities} הושלמו · ${lesson.attempts || 0} ניסיונות · ציון מיטבי ${lesson.bestScore || 0}</small>
            </div>
          `).join('')}
        </div>
      </details>
    `).join('') : '<p class="hint">עדיין אין משימות שמורות לילד/ה הזה/ו.</p>';

    return `
      <article class="progress-child-card">
        <div class="progress-child-top">
          <div>
            <h4>${escapeHtml(child.name || 'ילד/ה')}</h4>
            <span class="child-status ${child.subscriptionStatus === 'active' ? 'active' : ''}">${child.subscriptionStatus === 'active' ? 'מנוי פעיל' : 'התנסות'}</span>
          </div>
          <div class="progress-ring" style="--p:${s.completionPercent || 0}" aria-label="${s.completionPercent || 0}% הושלם">${s.completionPercent || 0}%</div>
        </div>
        <div class="progress-stats">
          <span><b>${s.completedActivities || 0}</b> הושלמו</span>
          <span><b>${s.startedActivities || 0}</b> התחילו</span>
          <span><b>${s.averageScore || 0}</b> ציון ממוצע</span>
          <span><b>${formatDate(s.lastActivityAt)}</b> פעילות אחרונה</span>
        </div>
        ${courseHtml}
      </article>
    `;
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
        <em class="child-status ${child.subscriptionStatus === 'active' ? 'active' : ''}">${child.subscriptionStatus === 'active' ? 'מנוי פעיל לילד/ה' : 'התנסות — שיעורים נעולים דורשים מנוי נפרד'}</em>
        <small>הילד/ה נכנס/ת דרך login.html עם הקוד הזה וה-PIN שבחרת.</small>
      </article>
    `).join('') : '<p class="hint">עדיין לא נוספו ילדים.</p>';
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[char]));
  }

  function accessList(user, child) {
    const values = [];
    if (Array.isArray(user?.access)) values.push(...user.access);
    if (Array.isArray(child?.access)) values.push(...child.access);
    return values.map(item => String(item || '').trim()).filter(Boolean);
  }

  function isRestrictedToSensiCity(user, child) {
    const access = accessList(user, child);
    return access.some(item => item.startsWith('restrict:'))
      && (access.includes('sensi-city') || access.includes('restrict:sensi-city') || access.includes('sensi-city-all'));
  }

  function shouldGoDirectlyToSensiCity(user, child) {
    return isRestrictedToSensiCity(user, child);
  }

  function renderCourseList(user, options = {}) {
    const list = document.querySelector('.course-list');
    if (!list || !user) return;
    const child = options.child;
    const active = user.subscriptionStatus === 'active';

    if (isRestrictedToSensiCity(user, child)) {
      list.innerHTML = `
        <article class="course">
          <div>
            <h3>סנסי בעיר החכמה · 15 שיעורי רובוטיקה</h3>
            <p>הגישה שלך פתוחה למסלול סנסי בעיר החכמה בלבד.</p>
          </div>
          <a class="btn green" href="smart-city.html">כניסה לסנסי בעיר החכמה</a>
        </article>
      `;
      return;
    }

    if (active) {
      list.innerHTML = `
        <article class="course"><div><h3>קטלוג הלומדות</h3><p>המנוי פעיל. אפשר לבחור לומדה מתוך הקטלוג.</p></div><a class="btn green" href="index.html#courses">בחירת לומדה</a></article>
        <article class="course"><div><h3>סנסי בעיר החכמה</h3><p>מסלול Blockly וסימולטור רובוט עם 15 שיעורים.</p></div><a class="btn light" href="smart-city.html">כניסה לסנסי</a></article>
      `;
      return;
    }

    list.innerHTML = `
      <article class="course"><div><h3>חשיבה ותכנות · 3 שיעורים בחינם</h3><p>אפשר להתחיל עכשיו עם 3 שיעורים בחינם, וההתקדמות נשמרת לילד/ה.</p></div><a class="btn green" href="space.html">להתחיל ללמוד</a></article>
      <article class="course"><div><h3>לפתוח את כל הלומדות</h3><p>מפעילים מנוי לילד/ה ואז כל הקורסים הזמינים נפתחים.</p></div><a class="btn primary" href="https://mrng.to/fZiL2SITRp">הפעלת מנוי</a></article>
    `;
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
    renderCourseList(user, options);
    if (!isChild) {
      renderChildren(options.children || []);
      loadProgressSummary();
    } else {
      const progressPanel = document.getElementById('parent-progress');
      if (progressPanel) progressPanel.hidden = true;
    }
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
        if (shouldGoDirectlyToSensiCity(data.user, data.child)) {
          setMessage('נכנסת בהצלחה. מעבירים אותך לסנסי בעיר החכמה…', 'ok');
          location.href = 'smart-city.html';
          return;
        }
        setMessage(action === 'register' ? 'החשבון נוצר. מעבירים אותך לאזור האישי…' : 'נכנסת בהצלחה. מעבירים אותך לאזור האישי…', 'ok');
        if (!location.pathname.endsWith('/account.html')) {
          if (shouldGoDirectlyToSensiCity(data.user, data.child)) {
            location.href = 'smart-city.html';
            return;
          }
          location.href = 'account.html';
          return;
        }
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

  const refreshProgress = document.getElementById('refresh-progress');
  if (refreshProgress) refreshProgress.addEventListener('click', loadProgressSummary);

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
        loadProgressSummary();
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
      .then(data => {
        if (!location.pathname.endsWith('/account.html')) {
          location.href = 'account.html';
          return;
        }
        renderUser(data.user, data);
      })
      .catch(() => clearToken());
  }
})();
