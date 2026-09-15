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
  const createTeacherForm = document.getElementById('create-teacher-form');

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

  function teacherLicenseCreatedMessage(issuedLicense) {
    if (!issuedLicense) return '';
    return ` נוצר רישיון Minecraft. המשתמש והסיסמה נשמרים ומוצגים בכרטיס המורה במסך האדמין.`;
  }

  function teacherPasswordResetMessage(passwordReset) {
    if (!passwordReset) return '';
    return ` סיסמת Minecraft אופסה ונשמרה בכרטיס המורה במסך האדמין.`;
  }

  function minecraftPasswordPanel(details, title = 'סיסמת Minecraft למורה') {
    const panel = element('div', undefined, 'course-picker');
    panel.append(element('strong', title));
    const upnLabel = element('label', 'משתמש');
    const upnInput = document.createElement('input');
    upnInput.value = details.eduUpn || '';
    upnInput.readOnly = true;
    upnLabel.append(upnInput);
    const passwordLabel = element('label', 'סיסמה זמנית');
    const passwordInput = document.createElement('input');
    passwordInput.value = details.temporaryPassword || details.password || '';
    passwordInput.readOnly = true;
    passwordInput.type = 'text';
    passwordLabel.append(passwordInput);
    panel.append(upnLabel, passwordLabel, element('p', 'מוצג לאדמין בלבד. הסיסמה הזו משמשת לכניסה של המורה ל-Minecraft Education.', 'class-summary'));
    return panel;
  }

  function passwordResetPanel(passwordReset) {
    return minecraftPasswordPanel(passwordReset, 'סיסמת Minecraft חדשה');
  }

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

  function formPayload(form) {
    const data = new FormData(form);
    return {
      name: String(data.get('name') || ''),
      email: String(data.get('email') || ''),
      password: String(data.get('password') || ''),
      playerName: String(data.get('playerName') || ''),
      eduUpn: String(data.get('eduUpn') || ''),
      createMinecraftLicense: data.get('createMinecraftLicense') === '1',
      licenseHandle: String(data.get('licenseHandle') || ''),
      courses: data.getAll('courses'),
    };
  }

  function renderTeacher(teacher) {
    const card = element('article', undefined, 'class-card');
    const heading = element('div', undefined, 'class-top');
    const identity = element('div');
    identity.append(element('h3', teacher.name), element('p', `אימייל כניסה ללומדה: ${teacher.email}`));
    heading.append(identity);
    if (teacher.canDelete !== false) {
      const deleteButton = element('button', 'מחיקת מורה', 'button quiet');
      deleteButton.type = 'button';
      deleteButton.addEventListener('click', async () => {
        const approved = window.confirm(`למחוק את המורה ${teacher.name}?\nהפעולה תמחק גם כיתות, תלמידים והתקדמות ששייכים למורה.`);
        if (!approved) return;
        setMessage(message, `מוחקים את ${teacher.name}…`);
        try {
          await api(`/api/classroom/admin/teachers/${encodeURIComponent(teacher.id)}/delete`, {});
          setMessage(message, `המורה ${teacher.name} נמחקה.`, true);
          await loadTeachers();
        } catch (error) {
          setMessage(message, error.message);
        }
      });
      heading.append(deleteButton);
    }

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

    const license = teacher.minecraftLicense || {};
    const licenseForm = element('form', undefined, 'course-access-form minecraft-license-form');
    licenseForm.append(element('strong', license.approved ? 'רישיון Minecraft למורה מאושר' : 'רישיון Minecraft למורה חסר'));
    if (license.approved) {
      const details = element('p', `שם שחקן: ${license.playerName || '-'} · UPN: ${license.eduUpn || '-'}`, 'class-summary');
      const resetResult = element('div');
      if (teacher.minecraftPassword) {
        resetResult.replaceChildren(minecraftPasswordPanel({
          eduUpn: license.eduUpn,
          password: teacher.minecraftPassword,
        }));
      }
      const resetPasswordButton = element('button', 'איפוס והצגת סיסמת Minecraft', 'button secondary');
      resetPasswordButton.type = 'button';
      resetPasswordButton.addEventListener('click', async () => {
        const approved = window.confirm(`לאפס סיסמת Minecraft עבור ${teacher.name}?`);
        if (!approved) return;
        setMessage(message, `מאפסים סיסמת Minecraft עבור ${teacher.name}…`);
        resetResult.replaceChildren();
        try {
          const data = await api(`/api/classroom/admin/teachers/${encodeURIComponent(teacher.id)}/minecraft-license`, {
            resetMinecraftPassword: true,
          });
          setMessage(message, `סיסמת Minecraft של ${teacher.name} אופסה ומוצגת בכרטיס המורה.`, true);
          if (data.passwordReset) resetResult.replaceChildren(passwordResetPanel(data.passwordReset));
          teacher.minecraftPassword = data.passwordReset?.temporaryPassword || '';
        } catch (error) {
          setMessage(message, error.message);
        }
      });
      licenseForm.append(details, resetPasswordButton, resetResult);
      card.append(heading, classText, licenseForm, form);
      return card;
    }
    const playerLabel = element('label', 'שם שחקן Minecraft');
    const playerInput = document.createElement('input');
    playerInput.name = 'playerName';
    playerInput.required = true;
    playerInput.maxLength = 32;
    playerInput.value = license.playerName || '';
    playerLabel.append(playerInput);
    const upnLabel = element('label', 'רישיון / UPN');
    const upnInput = document.createElement('input');
    upnInput.name = 'eduUpn';
    upnInput.type = 'email';
    upnInput.required = true;
    upnInput.value = license.eduUpn || '';
    upnInput.placeholder = 'teacher@hai.tech';
    upnLabel.append(upnInput);
    const saveLicense = element('button', 'אישור רישיון מורה', 'button secondary');
    saveLicense.type = 'submit';
    const handleLabel = element('label', 'שם משתמש לרישיון חדש');
    const handleInput = document.createElement('input');
    handleInput.name = 'licenseHandle';
    handleInput.maxLength = 48;
    handleInput.placeholder = 'לדוגמה: michal.albaz';
    handleLabel.append(handleInput);
    const createLicenseButton = element('button', 'יצירת רישיון Minecraft', 'button secondary');
    createLicenseButton.type = 'button';
    createLicenseButton.addEventListener('click', async () => {
      if (!handleInput.value.trim()) {
        setMessage(message, 'נא להזין שם משתמש לרישיון החדש.');
        handleInput.focus();
        return;
      }
      const approved = window.confirm(`ליצור רישיון Minecraft חדש עבור ${teacher.name}?`);
      if (!approved) return;
      setMessage(message, `יוצרים רישיון Minecraft עבור ${teacher.name}…`);
      try {
        const data = await api(`/api/classroom/admin/teachers/${encodeURIComponent(teacher.id)}/minecraft-license`, {
          createMinecraftLicense: true,
          licenseHandle: handleInput.value,
        });
        setMessage(message, `רישיון Minecraft של ${teacher.name} נוצר ואושר.${teacherLicenseCreatedMessage(data.issuedLicense)}`, true);
        await loadTeachers();
      } catch (error) {
        setMessage(message, error.message);
      }
    });
    licenseForm.append(playerLabel, upnLabel, saveLicense, handleLabel, createLicenseButton);
    licenseForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      setMessage(message, `מאשרים רישיון Minecraft עבור ${teacher.name}…`);
      try {
        await api(`/api/classroom/admin/teachers/${encodeURIComponent(teacher.id)}/minecraft-license`, {
          playerName: playerInput.value,
          eduUpn: upnInput.value,
          status: 'approved',
        });
        setMessage(message, `רישיון Minecraft של ${teacher.name} אושר.`, true);
        await loadTeachers();
      } catch (error) {
        setMessage(message, error.message);
      }
    });

    card.append(heading, classText, licenseForm, form);
    return card;
  }

  async function loadTeachers() {
    const data = await api('/api/classroom/admin/teachers');
    teachersList.replaceChildren(...data.teachers.map(renderTeacher));
    if (!data.teachers.length) teachersList.append(element('p', 'עדיין אין חשבונות מורים.', 'card'));
  }

  async function showDashboard() {
    auth.hidden = true;
    dashboard.hidden = false;
    await loadTeachers();
  }

  function updateCreateTeacherMinecraftFields() {
    if (!createTeacherForm) return;
    const minecraftFields = document.getElementById('create-teacher-minecraft-fields');
    const existingMinecraftFields = document.getElementById('create-teacher-existing-minecraft-fields');
    const newMinecraftFields = document.getElementById('create-teacher-new-minecraft-fields');
    const craftomChecked = createTeacherForm.querySelector('input[name="courses"][value="craftom-agent"]')?.checked;
    const createLicenseChecked = createTeacherForm.querySelector('input[name="createMinecraftLicense"]')?.checked;
    const playerInput = createTeacherForm.querySelector('input[name="playerName"]');
    const upnInput = createTeacherForm.querySelector('input[name="eduUpn"]');
    const licenseHandleInput = createTeacherForm.querySelector('input[name="licenseHandle"]');
    if (minecraftFields) minecraftFields.hidden = !craftomChecked;
    if (existingMinecraftFields) existingMinecraftFields.hidden = Boolean(craftomChecked && createLicenseChecked);
    if (newMinecraftFields) newMinecraftFields.hidden = Boolean(!craftomChecked || !createLicenseChecked);
    if (playerInput) playerInput.required = Boolean(craftomChecked && !createLicenseChecked);
    if (upnInput) {
      upnInput.required = Boolean(craftomChecked && !createLicenseChecked);
      upnInput.disabled = Boolean(craftomChecked && createLicenseChecked);
    }
    if (licenseHandleInput) {
      licenseHandleInput.required = Boolean(craftomChecked && createLicenseChecked);
      licenseHandleInput.disabled = Boolean(!craftomChecked || !createLicenseChecked);
    }
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

  const adminEmailLoginForm = document.getElementById('admin-email-login-form');
  if (adminEmailLoginForm) {
    adminEmailLoginForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const form = event.currentTarget;
      setMessage(authMessage, 'מתחברים לאדמין…');
      try {
        const data = new FormData(form);
        await api('/api/classroom/admin-login', {
          email: String(data.get('email') || ''),
          password: String(data.get('password') || ''),
        });
        form.reset();
        setMessage(authMessage, '', true);
        await showDashboard();
      } catch (error) {
        setMessage(authMessage, error.message);
      }
    });
  }

  const adminSetupForm = document.getElementById('admin-setup-form');
  if (adminSetupForm) {
    adminSetupForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const form = event.currentTarget;
      setMessage(authMessage, 'יוצרים כניסת אדמין…');
      try {
        const data = new FormData(form);
        await api('/api/classroom/admin-setup', {
          name: String(data.get('name') || ''),
          email: String(data.get('email') || ''),
          password: String(data.get('password') || ''),
        });
        form.reset();
        setMessage(authMessage, '', true);
        await showDashboard();
      } catch (error) {
        setMessage(authMessage, error.message);
      }
    });
  }

  document.getElementById('admin-logout').addEventListener('click', async () => {
    try {
      await api('/api/classroom/admin-logout', {});
      location.reload();
    } catch (error) {
      setMessage(message, error.message);
    }
  });

  if (createTeacherForm) {
    createTeacherForm.addEventListener('change', updateCreateTeacherMinecraftFields);
    updateCreateTeacherMinecraftFields();
    createTeacherForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      setMessage(message, 'יוצרים מורה חדשה…');
      try {
        const data = await api('/api/classroom/admin/teachers', formPayload(createTeacherForm));
        createTeacherForm.reset();
        createTeacherForm.querySelector('input[name="courses"][value="craftom-agent"]').checked = true;
        updateCreateTeacherMinecraftFields();
        setMessage(message, `המורה ${data.teacher.name} נוצרה. נכנסים איתה ממסך המורה עם אימייל הכניסה וסיסמת הלומדה שהוגדרו כאן.${teacherLicenseCreatedMessage(data.issuedLicense)}`, true);
        await loadTeachers();
      } catch (error) {
        setMessage(message, error.message);
      }
    });
  }

  api('/api/classroom/admin-me')
    .then((data) => data.role === 'admin' && showDashboard())
    .catch(() => {});
})();
