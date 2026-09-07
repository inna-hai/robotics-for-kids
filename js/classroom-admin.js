(() => {
  const courseLabels = {
    'sensi-city': 'סנסי בעיר החכמה',
    sisi: 'סיסי',
    'python-turtle': 'Python Turtle',
    webcode: 'Web Code',
    minecraft: 'Minecraft',
    'craftom-agent': 'אקדמיית ה-Agent',
  };

  const auth = document.getElementById('admin-auth');
  const dashboard = document.getElementById('admin-dashboard');
  const authMessage = document.getElementById('admin-auth-message');
  const message = document.getElementById('admin-message');
  const teachersList = document.getElementById('admin-teachers-list');
  const exportTeachersButton = document.getElementById('admin-export-teachers');
  let currentTeachers = [];

  function element(tag, text, className) {
    const node = document.createElement(tag);
    if (text !== undefined) node.textContent = text;
    if (className) node.className = className;
    return node;
  }

  function setMessage(target, text, success = false) {
    target.textContent = text || '';
    target.classList.toggle('success', success);
  }

  function formData(form) {
    return Object.fromEntries(new FormData(form).entries());
  }

  function csvCell(value) {
    return `"${String(value ?? '').replace(/"/g, '""')}"`;
  }

  function downloadCsv(filename, headers, rows) {
    const content = [headers, ...rows]
      .map(row => row.map(csvCell).join(','))
      .join('\n');
    const blob = new Blob([`\uFEFF${content}`], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function exportTeachers() {
    const rows = currentTeachers.flatMap(teacher => {
      const teacherCourses = (teacher.courses || []).map(id => courseLabels[id] || id).join(', ');
      const classes = teacher.classes || [];
      if (!classes.length) {
        return [[
          teacher.name,
          teacher.email,
          teacherCourses || 'ללא לומדות',
          'עדיין אין כיתות',
          '',
          teacher.createdAt || '',
          'סיסמאות וקודי הזמנה לא מוצגים בקובץ.',
        ]];
      }
      return classes.map(classroom => [
        teacher.name,
        teacher.email,
        teacherCourses || 'ללא לומדות',
        classroom.name,
        (classroom.courses || []).map(id => courseLabels[id] || id).join(', ') || 'ללא לומדות',
        teacher.createdAt || '',
        'סיסמאות וקודי הזמנה לא מוצגים בקובץ.',
      ]);
    });
    downloadCsv(
      'teachers-access.csv',
      ['שם מורה', 'מייל כניסה', 'לומדות פתוחות למורה', 'כיתה', 'לומדות פתוחות לכיתה', 'נוצר בתאריך', 'הערת אבטחה'],
      rows,
    );
    setMessage(message, 'קובץ המורות וההרשאות ירד למחשב.', true);
  }

  document.querySelectorAll('[data-toggle-password]').forEach((button) => {
    button.addEventListener('click', () => {
      const input = document.getElementById(button.dataset.togglePassword);
      if (!input) return;
      const show = input.type === 'password';
      input.type = show ? 'text' : 'password';
      button.setAttribute('aria-label', show ? 'הסתרה' : 'הצגה');
      button.setAttribute('aria-pressed', show ? 'true' : 'false');
    });
  });

  document.querySelectorAll('[data-toggle-recovery]').forEach((button) => {
    button.addEventListener('click', () => {
      const panel = document.getElementById(button.dataset.toggleRecovery);
      if (panel) panel.hidden = !panel.hidden;
    });
  });

  async function api(path, payload) {
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

  function coursePicker(selectedCourses) {
    const fieldset = element('fieldset', undefined, 'course-picker');
    fieldset.append(element('legend', 'לומדות זמינות למורה'));
    for (const [courseId, labelText] of Object.entries(courseLabels)) {
      const label = element('label');
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.name = 'courses';
      checkbox.value = courseId;
      checkbox.checked = selectedCourses.includes(courseId);
      label.append(checkbox, ` ${labelText}`);
      fieldset.append(label);
    }
    return fieldset;
  }

  function renderTeacher(teacher) {
    const card = element('article', undefined, 'class-card');
    const heading = element('div', undefined, 'class-top');
    const identity = element('div');
    identity.append(element('h3', teacher.name), element('p', teacher.email));
    heading.append(identity);

    const classes = teacher.classes || [];
    const classSummary = classes.length
      ? classes.map((classroom) => `${classroom.name}: ${(classroom.courses || []).map((id) => courseLabels[id] || id).join(', ') || 'ללא לומדות'}`).join(' · ')
      : 'עדיין אין למורה כיתות.';
    const classText = element('p', classSummary, 'class-summary');

    const form = element('form', undefined, 'course-access-form');
    form.append(coursePicker(teacher.courses || []));
    const save = element('button', 'שמירת הרשאות המורה', 'button secondary');
    save.type = 'submit';
    form.append(save);
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      setMessage(message, `שומרים הרשאות עבור ${teacher.name}…`);
      try {
        const courses = new FormData(form).getAll('courses');
        await api(`/api/classroom/admin/teachers/${encodeURIComponent(teacher.id)}/courses`, { courses });
        setMessage(message, `הרשאות הלומדות של ${teacher.name} נשמרו.`, true);
        await loadTeachers();
      } catch (error) {
        setMessage(message, error.message);
      }
    });

    card.append(heading, classText, form);
    return card;
  }

  async function loadTeachers() {
    const data = await api('/api/classroom/admin/teachers');
    currentTeachers = data.teachers || [];
    teachersList.replaceChildren(...currentTeachers.map(renderTeacher));
    if (!currentTeachers.length) teachersList.append(element('p', 'עדיין אין חשבונות מורים.', 'card'));
  }

  async function showDashboard() {
    auth.hidden = true;
    dashboard.hidden = false;
    await loadTeachers();
  }

  document.getElementById('admin-login-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    setMessage(authMessage, 'מתחברים…');
    try {
      const code = new FormData(form).get('code');
      await api('/api/classroom/admin-login', { code });
      form.reset();
      setMessage(authMessage, '', true);
      await showDashboard();
    } catch (error) {
      setMessage(authMessage, error.message);
    }
  });

  document.getElementById('admin-forgot-form')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const recoveryMessage = document.getElementById('admin-recovery-message');
    setMessage(recoveryMessage, 'שולחים קוד אימות למייל…');
    try {
      await api('/api/classroom/forgot-password', { role: 'admin', ...formData(form) });
      setMessage(recoveryMessage, 'אם המייל מוגדר במערכת, נשלח אליו קוד אימות.', true);
    } catch (error) {
      setMessage(recoveryMessage, error.message);
    }
  });

  document.getElementById('admin-reset-form')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const recoveryMessage = document.getElementById('admin-recovery-message');
    setMessage(recoveryMessage, 'מאמתים קוד ומעדכנים סיסמה…');
    try {
      await api('/api/classroom/reset-password', { role: 'admin', ...formData(form) });
      form.reset();
      setMessage(recoveryMessage, 'הסיסמה עודכנה. אפשר להיכנס מחדש עם הסיסמה החדשה.', true);
    } catch (error) {
      setMessage(recoveryMessage, error.message);
    }
  });

  document.getElementById('admin-logout').addEventListener('click', async () => {
    try {
      await api('/api/classroom/admin-logout', {});
      location.reload();
    } catch (error) {
      setMessage(message, error.message);
    }
  });

  if (exportTeachersButton) {
    exportTeachersButton.addEventListener('click', () => {
      if (!currentTeachers.length) {
        setMessage(message, 'אין עדיין מורות לייצוא.');
        return;
      }
      exportTeachers();
    });
  }

  api('/api/classroom/admin-me')
    .then((data) => data.role === 'admin' && showDashboard())
    .catch(() => {});
})();
