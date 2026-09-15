(() => {
  const courseLabels = {
    'sensi-city': 'סנסי בעיר החכמה', sisi: 'סיסי', 'python-turtle': 'Python Turtle',
    webcode: 'Web Code', minecraft: 'Minecraft', 'craftom-agent': 'אקדמיית ה-Agent',
  };
  const auth = document.getElementById('admin-auth');
  const dashboard = document.getElementById('admin-dashboard');
  const authMessage = document.getElementById('admin-auth-message');
  const message = document.getElementById('admin-message');
  const teachersList = document.getElementById('admin-teachers-list');
  const createTeacherForm = document.getElementById('create-teacher-form');
  const oneTimePassword = document.getElementById('admin-one-time-password');
  const showArchived = document.getElementById('show-archived-teachers');

  function element(tag, text, className) {
    const node = document.createElement(tag);
    if (text !== undefined) node.textContent = text;
    if (className) node.className = className;
    return node;
  }
  function setHook(node, name, value) { node.setAttribute(name, value); return node; }
  function setMessage(target, text, success = false) {
    target.textContent = text || '';
    target.classList.toggle('success', success);
  }
  async function refreshAfterMutation(successText) {
    setMessage(message, successText, true);
    try {
      await loadTeachers();
    } catch (error) {
      setMessage(message, `${successText} עם זאת, רענון הרשימה נכשל: ${error.message}`, true);
    }
  }
  async function api(path, payload) {
    const response = await fetch(path, {
      method: payload === undefined ? 'GET' : 'POST', credentials: 'same-origin',
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
      checkbox.type = 'checkbox'; checkbox.name = 'courses'; checkbox.value = courseId;
      checkbox.checked = selectedCourses.includes(courseId);
      label.append(checkbox, ` ${labelText}`); fieldset.append(label);
    }
    return fieldset;
  }
  function actionButton(text, action, className = 'button quiet') {
    const button = element('button', text, className);
    button.type = 'button';
    setHook(button, 'data-action', action);
    return button;
  }
  async function runAction(teacher, suffix, progressText, successText) {
    setMessage(message, progressText);
    try {
      await api(`/api/classroom/admin/teachers/${encodeURIComponent(teacher.id)}${suffix}`, {});
      await refreshAfterMutation(successText);
    } catch (error) { setMessage(message, error.message); }
  }
  function renderTeacher(teacher) {
    const card = setHook(element('article', undefined, `class-card${teacher.archivedAt ? ' archived' : ''}`), 'data-teacher-id', teacher.id);
    const heading = element('div', undefined, 'class-top');
    const identity = element('div');
    identity.append(element('h3', teacher.name), element('p', teacher.email));
    if (teacher.archivedAt) identity.append(element('p', 'בארכיון', 'archive-state'));
    heading.append(identity);
    const classes = teacher.classes || [];
    const classSummary = classes.length
      ? classes.map((classroom) => `${classroom.name}: ${(classroom.courses || []).map((id) => courseLabels[id] || id).join(', ') || 'ללא לומדות'}`).join(' · ')
      : 'עדיין אין למורה כיתות.';
    card.append(heading, element('p', classSummary, 'class-summary'));
    const archivedStudents = classes.flatMap((classroom) => (classroom.students || [])
      .filter((student) => student.archivedAt)
      .map((student) => ({ ...student, classroomName: classroom.name })));
    if (archivedStudents.length) {
      const archivedList = element('ul', undefined, 'student-list archived-students');
      for (const student of archivedStudents) {
        const item = element('li');
        setHook(item, 'data-student-id', student.id);
        item.append(element('span', `${student.name} · ${student.classroomName}`));
        const restoreStudent = actionButton('שחזור תלמיד/ה', 'restore-student', 'button secondary');
        restoreStudent.addEventListener('click', async () => {
          setMessage(message, 'משחזרים את התלמיד/ה…');
          try {
            await api(`/api/classroom/admin/students/${encodeURIComponent(student.id)}/restore`, {});
            await refreshAfterMutation('התלמיד/ה שוחזר/ה.');
          } catch (error) { setMessage(message, error.message); }
        });
        item.append(restoreStudent); archivedList.append(item);
      }
      card.append(element('h4', 'תלמידים בארכיון'), archivedList);
    }

    if (teacher.archivedAt) {
      const restore = actionButton('שחזור מורה', 'restore-teacher', 'button secondary');
      restore.addEventListener('click', () => runAction(teacher, '/restore', 'משחזרים את המורה…', 'המורה שוחזרה.'));
      card.append(restore);
      return card;
    }

    const identityForm = element('form', undefined, 'management-form teacher-identity-form');
    setHook(identityForm, 'data-action', 'edit-teacher');
    const nameLabel = element('label', 'שם מלא');
    const nameInput = document.createElement('input'); nameInput.name = 'name'; nameInput.required = true; nameInput.value = teacher.name;
    const emailLabel = element('label', 'מייל');
    const emailInput = document.createElement('input'); emailInput.name = 'email'; emailInput.type = 'email'; emailInput.required = true; emailInput.value = teacher.email;
    nameLabel.append(nameInput); emailLabel.append(emailInput);
    const saveIdentity = element('button', 'שמירת פרטי המורה', 'button secondary'); saveIdentity.type = 'submit'; setHook(saveIdentity, 'data-action', 'save-teacher');
    identityForm.append(nameLabel, emailLabel, saveIdentity);
    identityForm.addEventListener('submit', async (event) => {
      event.preventDefault(); setMessage(message, 'שומרים את פרטי המורה…');
      try {
        await api(`/api/classroom/admin/teachers/${encodeURIComponent(teacher.id)}`, Object.fromEntries(new FormData(identityForm).entries()));
        await refreshAfterMutation('פרטי המורה נשמרו.');
      } catch (error) { setMessage(message, error.message); }
    });

    const courseForm = element('form', undefined, 'course-access-form');
    setHook(courseForm, 'data-action', 'teacher-courses');
    courseForm.append(coursePicker(teacher.courses || []));
    const saveCourses = element('button', 'שמירת הרשאות המורה', 'button secondary'); saveCourses.type = 'submit'; setHook(saveCourses, 'data-action', 'save-teacher-courses');
    courseForm.append(saveCourses);
    courseForm.addEventListener('submit', async (event) => {
      event.preventDefault(); setMessage(message, `שומרים הרשאות עבור ${teacher.name}…`);
      try {
        await api(`/api/classroom/admin/teachers/${encodeURIComponent(teacher.id)}/courses`, { courses: new FormData(courseForm).getAll('courses') });
        await refreshAfterMutation(`הרשאות הלומדות של ${teacher.name} נשמרו.`);
      } catch (error) { setMessage(message, error.message); }
    });
    const archive = actionButton('העברה לארכיון', 'archive-teacher');
    archive.addEventListener('click', () => runAction(teacher, '/archive', 'מעבירים את המורה לארכיון…', 'המורה הועברה לארכיון והחיבורים שלה נותקו.'));
    card.append(identityForm, courseForm, archive);
    return card;
  }
  async function loadTeachers() {
    const data = await api(`/api/classroom/admin/teachers${showArchived.checked ? '?includeArchived=1' : ''}`);
    teachersList.replaceChildren(...data.teachers.map(renderTeacher));
    if (!data.teachers.length) teachersList.append(element('p', 'עדיין אין חשבונות מורים.', 'card'));
  }
  async function showDashboard() { auth.hidden = true; dashboard.hidden = false; await loadTeachers(); }

  document.getElementById('admin-login-form').addEventListener('submit', async (event) => {
    event.preventDefault(); const form = event.currentTarget; setMessage(authMessage, 'מתחברים…');
    try { await api('/api/classroom/admin-login', { code: new FormData(form).get('code') }); form.reset(); setMessage(authMessage, '', true); await showDashboard(); }
    catch (error) { setMessage(authMessage, error.message); }
  });
  createTeacherForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    oneTimePassword.textContent = '';
    oneTimePassword.hidden = true;
    setMessage(message, 'יוצרים חשבון מורה…');
    let data;
    try {
      data = await api('/api/classroom/admin/teachers', Object.fromEntries(new FormData(createTeacherForm).entries()));
    } catch (error) {
      setMessage(message, error.message);
      return;
    }
    createTeacherForm.reset();
    oneTimePassword.textContent = `הסיסמה הזמנית של ${data.teacher.name}: ${data.temporaryPassword} — מוצגת עכשיו בלבד.`;
    oneTimePassword.hidden = false;
    setMessage(message, 'חשבון המורה נוצר. שמרו ומסרו את הסיסמה הזמנית באופן מאובטח.', true);
    try {
      await loadTeachers();
    } catch (error) {
      setMessage(message, `חשבון המורה נוצר והסיסמה הזמנית נשמרה בתצוגה, אך רענון הרשימה נכשל: ${error.message}`, true);
    }
  });
  showArchived.addEventListener('change', () => loadTeachers().catch((error) => setMessage(message, error.message)));
  document.getElementById('admin-logout').addEventListener('click', async () => {
    oneTimePassword.textContent = '';
    oneTimePassword.hidden = true;
    try { await api('/api/classroom/admin-logout', {}); location.reload(); } catch (error) { setMessage(message, error.message); }
  });
  api('/api/classroom/admin-me').then((data) => data.role === 'admin' && showDashboard()).catch(() => {});
})();
