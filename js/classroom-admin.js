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
  const createInvitationForm = document.getElementById('create-invitation-form');
  const oneTimeCredential = document.getElementById('admin-one-time-credential');
  const invitationsList = document.getElementById('admin-invitations-list');
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
    if (!response.ok) {
      const error = new Error(data.error || 'הפעולה לא הצליחה.');
      error.data = data;
      throw error;
    }
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
  function renderInvitation(invitation) {
    const card = setHook(element('article', undefined, 'class-card'), 'data-invitation-id', invitation.id);
    card.append(element('h3', invitation.name), element('p', invitation.email),
      element('p', `מצב: ${invitation.status} · משלוח: ${invitation.deliveryStatus}`));
    if (['pending', 'sent', 'failed', 'unknown'].includes(invitation.status)) {
      for (const [label, action] of [['שליחה מחדש', 'resend'], ['ביטול הזמנה', 'revoke']]) {
        const button = actionButton(label, `${action}-invitation`, 'button secondary');
        button.addEventListener('click', async () => {
          try {
            const data = await api(`/api/classroom/admin/invitations/${encodeURIComponent(invitation.id)}/${action}`, {});
            if (data.testCode) {
              oneTimeCredential.textContent = `קוד ההזמנה החדש: ${data.testCode} — מוצג עכשיו בלבד.`;
              oneTimeCredential.hidden = false;
            }
            await refreshInvitations(action === 'resend' ? 'ההזמנה נשלחה מחדש.' : 'ההזמנה בוטלה.');
          } catch (error) { setMessage(message, error.message); }
        });
        card.append(button);
      }
    }
    return card;
  }
  async function loadInvitations() {
    const data = await api('/api/classroom/admin/invitations');
    invitationsList.replaceChildren(...data.invitations.map(renderInvitation));
  }
  async function refreshInvitations(successText) {
    setMessage(message, successText, true);
    try { await loadInvitations(); }
    catch (error) { setMessage(message, `${successText} רענון ההזמנות נכשל: ${error.message}`, true); }
  }
  async function showDashboard() {
    auth.hidden = true; dashboard.hidden = false;
    await Promise.all([loadTeachers(), loadInvitations()]);
  }

  document.getElementById('admin-access-request-form').addEventListener('submit', async (event) => {
    event.preventDefault(); const form = event.currentTarget;
    try {
      const email = new FormData(form).get('email');
      await api('/api/classroom/admin-access/request', { email });
      document.querySelector('#admin-access-redeem-form input[name="email"]').value = email;
      setMessage(authMessage, 'בקשת הגישה התקבלה. אם הכתובת מורשית, הקוד יישלח אליה לאחר השלמת המשלוח.', true);
    } catch (error) { setMessage(authMessage, error.message); }
  });
  document.getElementById('admin-access-redeem-form').addEventListener('submit', async (event) => {
    event.preventDefault(); const form = event.currentTarget; setMessage(authMessage, 'מתחברים…');
    try { await api('/api/classroom/admin-access/redeem', Object.fromEntries(new FormData(form).entries())); form.reset(); await showDashboard(); }
    catch (error) { setMessage(authMessage, error.message); }
  });
  createInvitationForm.addEventListener('submit', async (event) => {
    event.preventDefault(); oneTimeCredential.textContent = ''; oneTimeCredential.hidden = true;
    let data;
    try { data = await api('/api/classroom/admin/invitations', Object.fromEntries(new FormData(createInvitationForm).entries())); }
    catch (error) { setMessage(message, error.message); return; }
    createInvitationForm.reset();
    if (data.testCode) {
      oneTimeCredential.textContent = `קוד ההזמנה של ${data.invitation.name}: ${data.testCode} — מוצג עכשיו בלבד.`;
      oneTimeCredential.hidden = false;
    }
    setMessage(message, `ההזמנה נשמרה. מצב המשלוח: ${data.invitation.deliveryStatus}.`, data.invitation.deliveryStatus === 'sent');
    try { await loadInvitations(); }
    catch (error) { setMessage(message, `ההזמנה נשמרה והקוד נשאר בתצוגה, אך הרענון נכשל: ${error.message}`, true); }
  });
  showArchived.addEventListener('change', () => loadTeachers().catch((error) => setMessage(message, error.message)));
  document.getElementById('admin-logout').addEventListener('click', async () => {
    oneTimeCredential.textContent = ''; oneTimeCredential.hidden = true;
    try { await api('/api/classroom/admin-logout', {}); location.reload(); } catch (error) { setMessage(message, error.message); }
  });
  document.getElementById('admin-rotate').addEventListener('click', async () => {
    try {
      const data = await api('/api/classroom/admin/rotate', {});
      if (data.deliveryStatus === 'unknown') {
        oneTimeCredential.textContent = 'מצב משלוח קוד הגישה החדש לא ידוע. הגישה הקודמת בוטלה; המתינו למייל או בקשו קוד חדש.';
      } else if (data.testCode) {
        oneTimeCredential.textContent = `קוד הגישה החלופי: ${data.testCode} — מוצג עכשיו בלבד.`;
      } else {
        oneTimeCredential.textContent = 'קוד גישה חלופי נשלח למייל המנהלת.';
      }
      oneTimeCredential.hidden = false; auth.hidden = false; dashboard.hidden = true;
    } catch (error) {
      if (error.data?.deliveryStatus === 'failed') {
        oneTimeCredential.textContent = 'שליחת קוד הגישה החדש נכשלה. הגישה הקודמת בוטלה; בקשו קוד חדש כדי להתחבר שוב.';
        oneTimeCredential.hidden = false; auth.hidden = false; dashboard.hidden = true;
      } else {
        setMessage(message, error.message);
      }
    }
  });
  api('/api/classroom/admin-me').then((data) => data.role === 'admin' && showDashboard()).catch(() => {});
})();
