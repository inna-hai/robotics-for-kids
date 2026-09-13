(() => {
  const page = document.body.dataset.classroomPage;
  const allowedNext = new Set([
    'sensi-city.html?lesson=1',
    'sisi.html',
    'python-turtle.html',
    'webcode.html',
    'minecraft.html',
    'craftom-school/preview/index.html',
  ]);

  function nextCourse() {
    const requested = new URLSearchParams(location.search).get('next') || '';
    return allowedNext.has(requested) ? requested : 'index.html#courses';
  }

  function requestedCourse() {
    const requested = new URLSearchParams(location.search).get('next') || '';
    return allowedNext.has(requested) ? requested : '';
  }

  function guestCourse() {
    return 'sisi.html';
  }

  function summerToken() {
    return localStorage.getItem('haiTechSummerToken') || '';
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

  function formData(form) {
    return Object.fromEntries(new FormData(form).entries());
  }

  function setMessage(element, text, success = false) {
    if (!element) return;
    element.textContent = text || '';
    element.classList.toggle('success', success);
  }

  function initPasswordToggles() {
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
  }

  function initRecoveryToggles() {
    document.querySelectorAll('[data-toggle-recovery]').forEach((button) => {
      button.addEventListener('click', () => {
        const panel = document.getElementById(button.dataset.toggleRecovery);
        if (panel) panel.hidden = !panel.hidden;
      });
    });
  }

  async function initEntry() {
    const requested = requestedCourse();
    const next = requested || nextCourse();
    const guestNext = guestCourse();
    const guest = document.getElementById('guest-continue');
    const subscription = document.getElementById('subscription-continue');
    const studentContinue = document.getElementById('student-continue');
    const studentCourseLinks = document.getElementById('student-course-links');
    if (guest) guest.href = guestNext;
    if (studentContinue) studentContinue.href = next;

    const form = document.getElementById('student-login-form');
    const message = document.getElementById('student-login-message');
    const unifiedForm = document.getElementById('classroom-unified-login-form');
    const unifiedMessage = document.getElementById('classroom-unified-message');
    const entryMessage = message || unifiedMessage;
    const codeRequestForm = document.getElementById('student-code-request');

    guest?.addEventListener('click', async (event) => {
      event.preventDefault();
      setMessage(entryMessage, 'עוברים למצב אורח…');
      try {
        await api('/api/classroom/logout', {});
        await summerRequest('/api/summer/logout');
        localStorage.removeItem('haiTechSummerToken');
        location.assign(guestNext);
      } catch (error) {
        setMessage(entryMessage, error.message);
      }
    });

    subscription?.addEventListener('click', async (event) => {
      event.preventDefault();
      setMessage(entryMessage, 'עוברים למנוי האישי…');
      try {
        await api('/api/classroom/logout', {});
      } catch (error) {
        setMessage(entryMessage, error.message);
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

    function showStudent(data) {
      location.assign(data.nextUrl || 'classroom-student.html');
    }

    try {
      const me = await api('/api/classroom/me');
      if (me.role === 'teacher') {
        location.assign('teacher-classrooms.html');
        return;
      }
      if (me.role === 'student') {
        location.assign('classroom-student.html');
        return;
      }
      if (me.role === 'guest' && me.subscriptionGateEnabled === false && requested) {
        location.assign(requested);
      }
    } catch {}

    unifiedForm?.addEventListener('submit', async (event) => {
      event.preventDefault();
      setMessage(unifiedMessage, 'בודקים הרשאות ונכנסים…');
      try {
        const data = await api('/api/classroom/login', formData(unifiedForm));
        if (data.role === 'teacher') {
          setMessage(unifiedMessage, 'זוהתה כניסת מורה. עוברים למסך הכיתות…', true);
          location.assign(data.nextUrl || 'teacher-classrooms.html');
          return;
        }
        setMessage(unifiedMessage, '', true);
        location.assign(data.nextUrl || 'classroom-student.html');
      } catch (error) {
        setMessage(unifiedMessage, error.message);
      }
    });

    form?.addEventListener('submit', async (event) => {
      event.preventDefault();
      setMessage(entryMessage, 'נכנסים…');
      try {
        const data = await api('/api/classroom/student-login', formData(form));
        setMessage(entryMessage, '', true);
        location.assign('classroom-student.html');
      } catch (error) {
        setMessage(entryMessage, error.message);
      }
    });

    if (codeRequestForm) {
      codeRequestForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        setMessage(entryMessage, 'שולחים בקשה למורה…');
        try {
          const data = await api('/api/classroom/student-code-request', formData(codeRequestForm));
          codeRequestForm.reset();
          setMessage(entryMessage, data.message || 'נשלח עכשיו מייל למורה עם בקשת פרטי הכניסה.', true);
        } catch (error) {
          setMessage(entryMessage, error.message);
        }
      });
    }

  }

  function element(tag, text, className) {
    const node = document.createElement(tag);
    if (text !== undefined) node.textContent = text;
    if (className) node.className = className;
    return node;
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

  function safeFilename(value) {
    return String(value || 'classroom').trim().replace(/[^\w\u0590-\u05ff-]+/g, '-').replace(/-+/g, '-');
  }

  function exportClassroomStudents(classroom) {
    const rows = (classroom.students || []).map(student => [
      student.name,
      student.username || '',
      classroom.name,
      classroom.joinCode,
      student.password || '',
      student.minecraftPlayerName || '',
      student.createdAt || '',
    ]);
    downloadCsv(
      `students-${safeFilename(classroom.name)}.csv`,
      ['שם תלמיד/ה', 'שם משתמש לתלמיד', 'כיתה', 'קוד כיתה', 'סיסמה', 'שם משתמש למיינקראפט', 'תאריך יצירת שם המשתמש לתלמיד'],
      rows,
    );
  }

  function renderStudentCredentialsTable(classroom) {
    const wrapper = element('div', undefined, 'student-credentials-table');
    const table = document.createElement('table');
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    ['שם תלמיד/ה', 'שם משתמש לתלמיד', 'כיתה', 'קוד כיתה', 'סיסמה', 'שם משתמש למיינקראפט', 'תאריך יצירת שם המשתמש לתלמיד']
      .forEach(title => headerRow.append(element('th', title)));
    thead.append(headerRow);
    const tbody = document.createElement('tbody');
    if ((classroom.students || []).length) {
      classroom.students.forEach((student) => {
        const row = document.createElement('tr');
        [
          student.name,
          student.username || '',
          classroom.name,
          classroom.joinCode,
          student.password || 'לא נשמר לתלמיד קיים',
          student.minecraftPlayerName || '',
          formatDateTime(student.createdAt) || student.createdAt || '',
        ].forEach(value => row.append(element('td', value)));
        tbody.append(row);
      });
    } else {
      const row = document.createElement('tr');
      const cell = element('td', 'עדיין לא נוספו תלמידים לכיתה הזאת.');
      cell.colSpan = 7;
      row.append(cell);
      tbody.append(row);
    }
    table.append(thead, tbody);
    wrapper.append(table);
    return wrapper;
  }

  function formatDateTime(value) {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleString('he-IL', { dateStyle: 'short', timeStyle: 'short' });
  }

  function studentProgressSummary(student) {
    const rows = Array.isArray(student.progress) ? student.progress : [];
    const completed = rows.filter(row => row.status === 'completed').length;
    const started = rows.length - completed;
    const latest = rows[0];
    const latestLabel = latest
      ? `${courseLabels[latest.courseId] || latest.courseId} · שיעור ${latest.lessonId || 'כללי'} · ${latest.status === 'completed' ? 'הושלם' : 'התחיל/ה'}`
      : 'עדיין אין פעילות שמורה';
    return {
      total: rows.length,
      completed,
      started,
      latestLabel,
      updatedAt: formatDateTime(latest?.updatedAt || latest?.completedAt || latest?.startedAt),
    };
  }

  const courseLabels = {
    'sensi-city': 'סנסי בעיר החכמה',
    sisi: 'סיסי',
    'python-turtle': 'Python Turtle',
    webcode: 'Web Code',
    minecraft: 'Minecraft',
    'craftom-agent': 'אקדמיית ה-Agent',
  };

  const courseStarts = {
    'sensi-city': 'sensi-city.html?lesson=1',
    sisi: 'sisi.html',
    'python-turtle': 'python-turtle.html',
    webcode: 'webcode.html',
    minecraft: 'minecraft.html',
    'craftom-agent': 'kugel-student.html',
  };

  const teacherCourseStarts = {
    ...courseStarts,
    'craftom-agent': 'craftom-school/preview/index.html',
  };

  async function initStudentHome() {
    const welcome = document.getElementById('student-home-welcome');
    const linksBox = document.getElementById('student-home-course-links');
    const message = document.getElementById('student-home-message');
    const logout = document.getElementById('student-home-logout');

    try {
      const data = await api('/api/classroom/me');
      if (data.role !== 'student') {
        location.assign('classroom-entry.html');
        return;
      }
      welcome.textContent = `שלום ${data.student.name}, נכנסת לכיתה ${data.classroom.name}.`;
      const links = (data.classroom.courses || []).map((courseId) => {
        const link = element('a', courseLabels[courseId] || courseId, 'button primary');
        link.href = courseStarts[courseId] || 'index.html#courses';
        return link;
      });
      linksBox.replaceChildren(...links);
      if (!links.length) setMessage(message, 'עדיין אין לומדות פתוחות לכיתה שלך. המורה תפתח לומדות בהמשך.', false);
    } catch (error) {
      setMessage(message, error.message);
      setTimeout(() => location.assign('classroom-entry.html'), 1200);
    }

    logout?.addEventListener('click', async () => {
      setMessage(message, 'מתנתקים...');
      try {
        await api('/api/classroom/logout', {});
      } finally {
        location.assign('classroom-entry.html');
      }
    });
  }

  function selectedCourses(form) {
    return new FormData(form).getAll('courses');
  }

  function createCoursePicker(selected = [], availableCourseIds = Object.keys(courseLabels)) {
    const fieldset = element('fieldset', undefined, 'course-picker');
    fieldset.append(element('legend', 'לומדות פתוחות לכיתה'));
    for (const courseId of availableCourseIds) {
      const labelText = courseLabels[courseId] || courseId;
      const label = element('label');
      const input = document.createElement('input');
      input.type = 'checkbox';
      input.name = 'courses';
      input.value = courseId;
      input.checked = selected.includes(courseId);
      label.append(input, ` ${labelText}`);
      fieldset.append(label);
    }
    return fieldset;
  }

  async function initTeacher() {
    const auth = document.getElementById('teacher-auth');
    const dashboard = document.getElementById('teacher-dashboard');
    const authMessage = document.getElementById('teacher-auth-message');
    const dashboardMessage = document.getElementById('dashboard-message');
    const list = document.getElementById('classes-list');
    const teacherCourseCatalog = document.getElementById('teacher-course-catalog');
    const createClassButton = document.querySelector('#create-class-form button[type="submit"]');
    let availableCourseIds = [];

    function renderTeacherCatalog() {
      teacherCourseCatalog.replaceChildren();
      if (!availableCourseIds.length) {
        teacherCourseCatalog.append(element('p', 'עדיין לא הוקצו לך לומדות. אפשר ליצור כיתה עכשיו ולהוסיף לה לומדות אחרי שמנהלת המערכת תפתח עבורך הרשאות.', 'message'));
        createClassButton.disabled = false;
        return;
      }
      const courseLinks = element('div', undefined, 'course-links');
      for (const courseId of availableCourseIds) {
        const link = element('a', `פתיחת הלומדה שלי: ${courseLabels[courseId] || courseId}`, 'button quiet');
        link.href = teacherCourseStarts[courseId];
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        courseLinks.append(link);
      }
      teacherCourseCatalog.append(courseLinks, createCoursePicker([], availableCourseIds));
      createClassButton.disabled = false;
    }

    async function loadClasses() {
      const data = await api('/api/classroom/classes');
      availableCourseIds = data.teacher?.courses || [];
      renderTeacherCatalog();
      list.replaceChildren(...data.classes.map(renderClass));
      if (!data.classes.length) list.append(element('p', 'עדיין אין כיתות. צרו את הכיתה הראשונה.', 'card'));
    }

    function renderClass(classroom) {
      const card = element('article', undefined, 'class-card');
      card.dataset.classId = classroom.id;
      const top = element('div', undefined, 'class-top');
      const titleBox = element('div');
      titleBox.append(element('h3', classroom.name), element('p', 'קוד הכיתה לתלמידים:'));
      const code = element('strong', classroom.joinCode, 'code');
      top.append(titleBox, code);

      const exportBox = element('section', undefined, 'export-box');
      exportBox.append(
        element('h4', 'טבלת תלמידים ופרטי כניסה'),
        element('p', 'הטבלה מציגה רק תלמידים בכיתה הזאת. תלמידים חדשים יופיעו עם שם משתמש וסיסמה קבועים לייצוא.'),
      );
      exportBox.append(renderStudentCredentialsTable(classroom));
      const exportActions = element('div', undefined, 'export-actions');
      const exportList = element('button', 'הורדת רשימת תלמידים', 'button quiet');
      exportList.type = 'button';
      exportList.addEventListener('click', () => {
        exportClassroomStudents(classroom);
        setMessage(dashboardMessage, `קובץ התלמידים של ${classroom.name} ירד למחשב.`, true);
      });
      const resetCodes = element('button', 'חידוש סיסמאות לתלמידים', 'button secondary');
      resetCodes.type = 'button';
      resetCodes.addEventListener('click', async () => {
        if (!classroom.students.length) {
          setMessage(dashboardMessage, 'אין עדיין תלמידים בכיתה הזאת.', false);
          return;
        }
        if (!confirm(`לחדש סיסמאות לכל תלמידי ${classroom.name}? הסיסמאות הישנות יפסיקו לעבוד.`)) return;
        resetCodes.disabled = true;
        setMessage(dashboardMessage, 'יוצרים קודי כניסה חדשים…');
        try {
          const data = await api(`/api/classroom/classes/${encodeURIComponent(classroom.id)}/students/reset-codes`, {});
          downloadCsv(
            `student-login-codes-${safeFilename(classroom.name)}.csv`,
            ['כיתה', 'קוד כיתה', 'שם תלמיד/ה', 'שם משתמש לכניסה', 'סיסמה / קוד אישי חדש', 'שם שחקן Minecraft', 'נוצר בתאריך'],
            (data.students || []).map(student => [
              data.classroom.name,
              data.classroom.joinCode,
              student.name,
              student.username || '',
              student.password || student.loginCode,
              student.minecraftPlayerName || '',
              student.updatedAt || '',
            ]),
          );
          setMessage(dashboardMessage, `נוצר קובץ קודי כניסה חדשים עבור ${classroom.name}.`, true);
          await loadClasses();
        } catch (error) {
          setMessage(dashboardMessage, error.message);
        } finally {
          resetCodes.disabled = false;
        }
      });
      exportActions.append(exportList, resetCodes);
      exportBox.append(exportActions);

      const courseAccess = element('section', undefined, 'class-courses');
      courseAccess.append(element('h4', 'הלומדות של הכיתה'));
      const courseLinks = element('div', undefined, 'course-links');
      for (const courseId of classroom.courses || []) {
        const link = element('a', `פתיחת הלומדה: ${courseLabels[courseId] || courseId}`, 'button quiet');
        link.href = teacherCourseStarts[courseId];
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        courseLinks.append(link);
      }
      courseAccess.append(courseLinks);
      if ((classroom.courses || []).includes('craftom-agent')) {
        const lessonZero = element('a', 'ניהול שיעור 0 ב-Minecraft', 'button primary');
        lessonZero.href = `kugel-teacher.html?classroomId=${encodeURIComponent(classroom.id)}`;
        courseAccess.append(lessonZero);
      }

      const courseForm = element('form', undefined, 'course-access-form');
      if (availableCourseIds.length) {
        courseForm.append(createCoursePicker(classroom.courses || [], availableCourseIds));
        const saveCourses = element('button', 'שמירת הלומדות', 'button secondary');
        saveCourses.type = 'submit';
        courseForm.append(saveCourses);
        courseForm.addEventListener('submit', async (event) => {
          event.preventDefault();
          setMessage(dashboardMessage, 'שומרים את הלומדות…');
          try {
            const data = await api(`/api/classroom/classes/${encodeURIComponent(classroom.id)}/courses`, {
              courses: selectedCourses(courseForm),
            });
            setMessage(dashboardMessage, data.warning || 'הלומדות של הכיתה עודכנו.', true);
            await loadClasses();
          } catch (error) {
            setMessage(dashboardMessage, error.message);
          }
        });
      } else {
        courseForm.append(element('p', 'אין עדיין לומדות זמינות למורה הזאת. הכיתה יכולה להישאר קיימת, ומנהלת תפתח הרשאות בהמשך.', 'message'));
      }
      courseAccess.append(courseForm);

      const progressSection = element('section', undefined, 'student-progress-panel');
      progressSection.append(
        element('h4', 'התקדמות תלמידים'),
        element('p', 'כאן מופיעה התקדמות שנשמרה מתלמידים שנכנסו עם שם המשתמש והסיסמה שלהם.'),
      );
      const students = element('ul', undefined, 'student-list');
      if (classroom.students.length) {
        classroom.students.forEach((student) => {
          const summary = studentProgressSummary(student);
          const item = element('li');
          const name = element('strong', student.name);
          const stats = element('div', undefined, 'student-progress-stats');
          stats.append(
            element('span', `משתמש: ${student.username || classroom.joinCode}`),
            element('span', `${summary.completed} הושלמו`),
            element('span', `${summary.started} התחילו`),
            element('span', summary.updatedAt ? `פעילות אחרונה: ${summary.updatedAt}` : 'אין פעילות אחרונה'),
          );
          item.append(name, stats, element('small', summary.latestLabel));
          students.append(item);
        });
      } else {
        students.append(element('li', 'עדיין לא נוספו תלמידים.'));
      }
      progressSection.append(students);

      const addForm = element('form', undefined, 'add-student-form');
      const label = element('label', 'שם תלמיד/ה');
      const input = document.createElement('input');
      input.name = 'name';
      input.required = true;
      label.append(input);
      const button = element('button', 'הוספת תלמיד/ה', 'button secondary');
      button.type = 'submit';
      addForm.append(label, button);

      const oneTime = element('p', '', 'one-time-code');
      oneTime.hidden = true;
      addForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        setMessage(dashboardMessage, 'מוסיפים תלמיד/ה…');
        try {
          const data = await api(`/api/classroom/classes/${encodeURIComponent(classroom.id)}/students`, formData(addForm));
          addForm.reset();
          await loadClasses();
          const refreshedCard = [...list.children].find((item) => item.dataset.classId === classroom.id);
          const refreshedNotice = refreshedCard?.querySelector('.one-time-code');
          if (refreshedNotice) {
            refreshedNotice.textContent = `פרטי הכניסה של ${data.student.name}: שם משתמש ${data.student.username}, סיסמה ${data.student.password || data.student.loginCode}. הפרטים נשמרו בטבלת הכיתה ובקובץ הייצוא.`;
            refreshedNotice.hidden = false;
          }
          setMessage(dashboardMessage, 'התלמיד/ה נוסף/ה. פרטי הכניסה נשמרו בטבלת הכיתה ובקובץ הייצוא.', true);
        } catch (error) {
          setMessage(dashboardMessage, error.message);
        }
      });
      card.append(top, exportBox, courseAccess, progressSection, addForm, oneTime);
      return card;
    }

    async function showDashboard(me) {
      auth.hidden = true;
      dashboard.hidden = false;
      document.getElementById('teacher-welcome').textContent = `שלום ${me.teacher.name}`;
      await loadClasses();
    }

    async function submitAuth(form, endpoint) {
      setMessage(authMessage, 'מתחברים…');
      try {
        const data = await api(endpoint, formData(form));
        setMessage(authMessage, '', true);
        await showDashboard(data);
      } catch (error) {
        setMessage(authMessage, error.message);
      }
    }

    document.getElementById('teacher-login-form').addEventListener('submit', (event) => {
      event.preventDefault();
      submitAuth(event.currentTarget, '/api/classroom/teacher-login');
    });
    document.getElementById('teacher-register-form').addEventListener('submit', (event) => {
      event.preventDefault();
      submitAuth(event.currentTarget, '/api/classroom/teacher-register');
    });
    document.getElementById('teacher-forgot-form')?.addEventListener('submit', async (event) => {
      event.preventDefault();
      const recoveryMessage = document.getElementById('teacher-recovery-message');
      setMessage(recoveryMessage, 'שולחים קוד אימות למייל…');
      try {
        await api('/api/classroom/forgot-password', { role: 'teacher', ...formData(event.currentTarget) });
        setMessage(recoveryMessage, 'אם המייל רשום במערכת, נשלח אליו קוד אימות.', true);
      } catch (error) {
        setMessage(recoveryMessage, error.message);
      }
    });
    document.getElementById('teacher-reset-form')?.addEventListener('submit', async (event) => {
      event.preventDefault();
      const recoveryMessage = document.getElementById('teacher-recovery-message');
      setMessage(recoveryMessage, 'מאמתים קוד ומעדכנים סיסמה…');
      try {
        await api('/api/classroom/reset-password', { role: 'teacher', ...formData(event.currentTarget) });
        event.currentTarget.reset();
        setMessage(recoveryMessage, 'הסיסמה עודכנה. אפשר להיכנס מחדש עם הסיסמה החדשה.', true);
      } catch (error) {
        setMessage(recoveryMessage, error.message);
      }
    });
    document.getElementById('create-class-form').addEventListener('submit', async (event) => {
      event.preventDefault();
      const classForm = event.currentTarget;
      setMessage(dashboardMessage, 'יוצרים כיתה…');
      try {
        const data = formData(classForm);
        data.courses = selectedCourses(classForm);
        await api('/api/classroom/classes', data);
        classForm.reset();
        setMessage(dashboardMessage, data.courses.length ? 'הכיתה נוצרה עם הלומדות שנבחרו.' : 'הכיתה נוצרה. אפשר להוסיף לומדות אחרי שמנהלת תפתח הרשאות.', true);
        await loadClasses();
      } catch (error) {
        setMessage(dashboardMessage, error.message);
      }
    });
    document.getElementById('teacher-logout').addEventListener('click', async () => {
      await api('/api/classroom/logout', {});
      location.reload();
    });

    try {
      const me = await api('/api/classroom/me');
      if (me.role === 'teacher') await showDashboard(me);
    } catch {}
  }

  if (page === 'entry') initEntry();
  if (page === 'student-home') initStudentHome();
  if (page === 'teacher') initTeacher();
  initPasswordToggles();
  initRecoveryToggles();
})();
