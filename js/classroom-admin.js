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
  let selectedTeacherId = '';

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

  function renderTeacherSelector(teachers) {
    const selector = element('section', undefined, 'selector-panel');
    selector.append(element('h3', 'בחירת מורה'));
    const pending = teachers.filter(teacher => !(teacher.courses || []).length);
    if (pending.length) {
      selector.append(element('p', `יש ${pending.length} מורה/ות שממתינות להרשאות לומדות: ${pending.map(teacher => teacher.name).join(', ')}`, 'message'));
    }
    const buttons = element('div', undefined, 'selector-list');
    teachers.forEach((teacher) => {
      const button = element('button', teacher.name, `selector-button ${teacher.id === selectedTeacherId ? 'active' : ''}`);
      button.type = 'button';
      const details = element('small', `${teacher.email} · ${(teacher.classes || []).length} כיתות · ${(teacher.courses || []).length ? 'יש הרשאות' : 'ממתינה להרשאות'}`);
      button.append(details);
      button.addEventListener('click', () => {
        selectedTeacherId = teacher.id;
        renderTeachers();
      });
      buttons.append(button);
    });
    selector.append(buttons);
    return selector;
  }

  function renderTeacherDetails(teacher) {
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
        const data = await api(`/api/classroom/admin/teachers/${encodeURIComponent(teacher.id)}/courses`, { courses });
        await loadTeachers();
        setMessage(message, data.warning || `הרשאות הלומדות של ${teacher.name} נשמרו בהצלחה.`, true);
      } catch (error) {
        setMessage(message, error.message);
      }
    });

    const courseSummary = (teacher.courses || []).map(id => courseLabels[id] || id).join(', ') || 'עדיין לא אושרו לומדות למורה הזאת.';
    card.append(heading, element('p', `לומדות מאושרות למורה: ${courseSummary}`), classText, form);
    return card;
  }

  function renderTeachers() {
    teachersList.replaceChildren();
    if (!currentTeachers.length) {
      teachersList.append(element('p', 'עדיין אין חשבונות מורים.', 'card'));
      return;
    }
    teachersList.append(renderTeacherSelector(currentTeachers));
    const selected = currentTeachers.find(teacher => teacher.id === selectedTeacherId);
    if (!selected) {
      teachersList.append(element('p', 'בחרו מורה מהרשימה כדי לראות כיתות, לומדות מאושרות והרשאות.', 'card'));
      return;
    }
    teachersList.append(renderTeacherDetails(selected));
  }

  async function loadTeachers() {
    const data = await api('/api/classroom/admin/teachers');
    currentTeachers = data.teachers || [];
    if (selectedTeacherId && !currentTeachers.some(teacher => teacher.id === selectedTeacherId)) selectedTeacherId = '';
    renderTeachers();
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
