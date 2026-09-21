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
    const session = document.getElementById('student-session');
    const welcome = document.getElementById('student-welcome');
    const studentLogout = document.getElementById('student-logout');
    const previewDemoStudent = document.getElementById('preview-demo-student');

    guest.addEventListener('click', async (event) => {
      event.preventDefault();
      setMessage(message, 'עוברים למצב אורח…');
      try {
        await api('/api/classroom/logout', {});
        await summerRequest('/api/summer/logout');
        localStorage.removeItem('haiTechSummerToken');
        location.assign(guestNext);
      } catch (error) {
        setMessage(message, error.message);
      }
    });

    subscription.addEventListener('click', async (event) => {
      event.preventDefault();
      setMessage(message, 'עוברים למנוי האישי…');
      try {
        await api('/api/classroom/logout', {});
      } catch (error) {
        setMessage(message, error.message);
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
      document.body.classList.add('classroom-student-signed-in');
      form.hidden = true;
      session.hidden = false;
      welcome.textContent = `שלום ${data.student.name}, נכנסת לכיתה ${data.classroom.name}.`;
      if (studentCourseLinks) {
        const links = (data.classroom.courses || []).map((courseId) => {
          const link = element('a', courseLabels[courseId] || courseId, 'button primary');
          link.href = courseStarts[courseId] || 'index.html#courses';
          return link;
        });
        studentCourseLinks.replaceChildren(...links);
      }
      if (studentContinue) studentContinue.hidden = true;
    }

    try {
      const me = await api('/api/classroom/me');
      if (me.role === 'student') showStudent(me);
      if (me.role === 'guest' && me.subscriptionGateEnabled === false && requested) {
        location.assign(requested);
      }
    } catch {}

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      setMessage(message, 'נכנסים…');
      try {
        const data = await api('/api/classroom/student-login', formData(form));
        setMessage(message, '', true);
        showStudent(data);
      } catch (error) {
        setMessage(message, error.message);
      }
    });

    if (previewDemoStudent) {
      api('/api/classroom/preview-demo-student-enabled')
        .then((data) => {
          if (data.enabled) previewDemoStudent.hidden = false;
        })
        .catch(() => {});
      previewDemoStudent.addEventListener('click', async () => {
        setMessage(message, 'פותחים תלמידת בדיקה…');
        previewDemoStudent.disabled = true;
        try {
          const data = await api('/api/classroom/preview-demo-student-login', {});
          setMessage(message, '', true);
          showStudent(data);
        } catch (error) {
          setMessage(message, error.message);
        } finally {
          previewDemoStudent.disabled = false;
        }
      });
    }

    studentLogout.addEventListener('click', async () => {
      setMessage(message, 'מתנתקים…');
      try {
        await api('/api/classroom/logout', {});
        document.body.classList.remove('classroom-student-signed-in');
        session.hidden = true;
        form.hidden = false;
        form.reset();
        setMessage(message, 'אפשר להיכנס עכשיו כתלמיד/ה אחר/ת.', true);
      } catch (error) {
        setMessage(message, error.message);
      }
    });
  }

  function element(tag, text, className) {
    const node = document.createElement(tag);
    if (text !== undefined) node.textContent = text;
    if (className) node.className = className;
    return node;
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
    'craftom-agent': 'craftom-school/preview/index.html',
  };

  const teacherCourseStarts = {
    ...courseStarts,
    'craftom-agent': 'kugel-teacher.html',
  };

  function teacherCourseHref(courseId, classroomId = '') {
    if (courseId === 'craftom-agent' && classroomId) return `kugel-teacher.html?classroomId=${encodeURIComponent(classroomId)}`;
    return teacherCourseStarts[courseId] || courseStarts[courseId] || 'index.html#courses';
  }

  function progressLabel(status) {
    return {
      completed: 'הושלם',
      started: 'בתהליך',
      missing: 'לא התחיל',
    }[status] || 'לא התחיל';
  }

  function learningLabel(status, completeText, startedText, missingText) {
    if (status === 'completed') return completeText;
    if (status === 'started') return startedText;
    return missingText;
  }

  function formatDashboardDate(value) {
    if (!value) return 'אין עדיין';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'אין עדיין';
    return date.toLocaleString('he-IL');
  }

  function formatDashboardDuration(value) {
    const ms = Number(value);
    if (!Number.isFinite(ms) || ms < 0) return 'אין';
    const seconds = Math.round(ms / 1000);
    return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
  }

  function renderLessonDetail(student, lesson) {
    const detail = element('div', undefined, 'progress-detail-card');
    detail.append(element('h4', `${student.name} · שיעור ${lesson.lessonId}`));
    detail.append(element('p', lesson.title || 'שיעור'));
    const statuses = element('div', undefined, 'progress-detail-statuses');
    [
      ['אקדמיית Agent', learningLabel(lesson.academyStatus, 'הושלמה', 'בתהליך', 'חסרה'), lesson.academyStatus],
      ['Minecraft', learningLabel(lesson.minecraftStatus, 'הושלם', 'בתהליך', 'לא התחיל'), lesson.minecraftStatus],
      ['כרטיס יציאה', learningLabel(lesson.exitTicketStatus, 'הוגש', 'בתהליך', 'חסר'), lesson.exitTicketStatus],
    ].forEach(([label, text, status]) => {
      const item = element('span', undefined, `progress-pill ${status}`);
      item.append(element('strong', label), document.createTextNode(text));
      statuses.append(item);
    });
    detail.append(statuses);
    const meta = element('dl', undefined, 'progress-detail-meta');
    [
      ['ניסיונות', String(lesson.attempts || 0)],
      ['זמן אחרון', formatDashboardDuration(lesson.lastDurationMs)],
      ['שיא', formatDashboardDuration(lesson.bestTimeMs)],
      ['עודכן', formatDashboardDate(lesson.updatedAt)],
    ].forEach(([term, value]) => {
      meta.append(element('dt', term), element('dd', value));
    });
    detail.append(meta);
    if (lesson.submission) {
      const submission = element('div', undefined, 'progress-submission');
      const imageLink = element('a');
      imageLink.href = lesson.submission.photo.url;
      imageLink.target = '_blank';
      imageLink.rel = 'noopener';
      const image = document.createElement('img');
      image.src = lesson.submission.photo.url;
      image.alt = `תמונת הגשה של ${student.name}`;
      imageLink.append(image);
      const info = element('div');
      info.append(
        element('strong', lesson.submission.lessonTitle || `הגשה לשיעור ${lesson.lessonId}`),
        element('p', lesson.submission.exitAnswer || 'אין תשובה כתובה.'),
        element('small', `עודכן: ${formatDashboardDate(lesson.submission.updatedAt)}`),
      );
      submission.append(imageLink, info);
      detail.append(submission);
    } else {
      detail.append(element('p', 'אין עדיין תמונה או כרטיס יציאה לשיעור הזה.', 'progress-empty-note'));
    }
    return detail;
  }

  function renderProgressDashboard(container, dashboard) {
    container.replaceChildren();
    const summary = element('div', undefined, 'progress-summary-grid');
    [
      ['תלמידים', dashboard.totals.students],
      ['התחילו', dashboard.totals.startedStudents],
      ['השלימו לפחות שיעור', dashboard.totals.completedStudents],
      ['הגשות', dashboard.totals.submissions],
      ['צריכים תשומת לב', dashboard.totals.needsAttention],
    ].forEach(([label, value]) => {
      const card = element('div', undefined, 'progress-summary-card');
      card.append(element('strong', String(value || 0)), element('span', label));
      summary.append(card);
    });

    const tableWrap = element('div', undefined, 'progress-table-wrap');
    const table = element('table', undefined, 'progress-table');
    const thead = element('thead');
    const headRow = element('tr');
    headRow.append(element('th', 'תלמיד/ה'));
    dashboard.lessons.forEach((lesson) => {
      const th = element('th', lesson.id === 0 ? '0' : String(lesson.id));
      th.title = lesson.title;
      headRow.append(th);
    });
    thead.append(headRow);
    const tbody = element('tbody');
    const details = element('div', 'בחרו תא בטבלה כדי לראות פירוט תלמיד ושיעור.', 'progress-detail');
    dashboard.students.forEach((student) => {
      const row = element('tr');
      const name = element('th', undefined, 'progress-student-name');
      name.append(element('strong', student.name), element('small', `${student.totals.completed} הושלמו · ${student.totals.submissions} הגשות`));
      row.append(name);
      student.lessons.forEach((lesson) => {
        const cell = element('td');
        const button = element('button', progressLabel(lesson.overallStatus), `progress-cell ${lesson.overallStatus}`);
        button.type = 'button';
        button.title = `${student.name} · ${lesson.title}`;
        button.addEventListener('click', () => {
          details.replaceChildren(renderLessonDetail(student, lesson));
        });
        cell.append(button);
        row.append(cell);
      });
      tbody.append(row);
    });
    table.append(thead, tbody);
    tableWrap.append(table);

    container.append(summary, tableWrap, details);
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
    const teacherParams = new URLSearchParams(location.search);
    const shouldOpenClassList = teacherParams.get('fromTeacherBoard') === '1';
    const auth = document.getElementById('teacher-auth');
    const dashboard = document.getElementById('teacher-dashboard');
    const authMessage = document.getElementById('teacher-auth-message');
    const dashboardMessage = document.getElementById('dashboard-message');
    const list = document.getElementById('classes-list');
    const teacherCourseCatalog = document.getElementById('teacher-course-catalog');
    const createClassButton = document.querySelector('#create-class-form button[type="submit"]');
    let availableCourseIds = [];
    const oneTimeStudentCodes = new Map();

    function clearOneTimeStudentCodes() {
      oneTimeStudentCodes.clear();
      for (const notice of document.querySelectorAll?.('[data-role="student-code-notice"]') || []) {
        notice.textContent = '';
        notice.hidden = true;
      }
    }

    async function refreshAfterMutation(successText) {
      setMessage(dashboardMessage, successText, true);
      try {
        await loadClasses();
      } catch (error) {
        setMessage(dashboardMessage, `${successText} עם זאת, רענון רשימת הכיתות נכשל: ${error.message}`, true);
      }
    }

    function renderTeacherCatalog() {
      teacherCourseCatalog.replaceChildren();
      if (!availableCourseIds.length) {
        teacherCourseCatalog.append(element('p', 'עדיין לא הוקצו לך לומדות. מנהלת המערכת יכולה לפתוח עבורך לומדות.', 'message'));
        createClassButton.disabled = true;
        return;
      }
      const courseLinks = element('div', undefined, 'course-links');
      for (const courseId of availableCourseIds) {
        const linkLabel = courseId === 'craftom-agent'
          ? 'ניהול אקדמיית ה-Agent לפי כיתה'
          : `פתיחת הלומדה שלי: ${courseLabels[courseId] || courseId}`;
        const link = element('a', linkLabel, 'button quiet');
        if (courseId === 'craftom-agent') {
          link.href = '#classes-list';
          link.addEventListener('click', () => {
            setMessage(dashboardMessage, 'בחרי כיתה עם אקדמיית ה-Agent ולחצי על "ניהול הלומדה".', true);
          });
        } else {
          link.href = teacherCourseHref(courseId);
          link.target = '_blank';
          link.rel = 'noopener noreferrer';
        }
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
      card.setAttribute('data-class-id', classroom.id);
      const top = element('div', undefined, 'class-top');
      const titleBox = element('div');
      const classCode = element('p', undefined, 'class-code-line');
      classCode.append(element('span', 'קוד הכיתה לתלמידים:'), element('strong', classroom.joinCode, 'code'));
      titleBox.append(element('h3', classroom.name), classCode);
      top.append(titleBox);

      const courseAccess = element('section', undefined, 'class-courses');
      courseAccess.append(element('h4', 'הלומדות של הכיתה'));
      const courseLinks = element('div', undefined, 'course-links');
      for (const courseId of classroom.courses || []) {
        const linkText = courseId === 'craftom-agent'
          ? `ניהול הלומדה: ${courseLabels[courseId] || courseId}`
          : `פתיחת הלומדה: ${courseLabels[courseId] || courseId}`;
        const link = element('a', linkText, 'button quiet');
        link.href = teacherCourseHref(courseId, classroom.id);
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        courseLinks.append(link);
      }
      courseAccess.append(courseLinks);
      if ((classroom.courses || []).includes('craftom-agent')) {
        const lessonZeroPanel = element('div', undefined, 'lesson-zero-panel');
        lessonZeroPanel.append(
          element('strong', 'שיעור 0 מוכן להפעלה'),
          element('span', 'מכאן מתחילים את שיעור הפתיחה ב-Minecraft ומנהלים את תלמידי הכיתה.'),
        );
        const lessonZero = element('a', 'התחלת שיעור 0 ב-Minecraft', 'button primary lesson-zero-start');
        lessonZero.href = `kugel-teacher.html?classroomId=${encodeURIComponent(classroom.id)}`;
        lessonZeroPanel.append(lessonZero);
        courseAccess.append(lessonZeroPanel);
      }

      let progressDashboardSection = null;
      let progressDashboardContent = null;
      if ((classroom.courses || []).includes('craftom-agent')) {
        progressDashboardSection = element('section', undefined, 'progress-dashboard-section');
        const dashboardTop = element('div', undefined, 'progress-dashboard-top');
        const copy = element('div');
        copy.append(
          element('strong', 'דוח התקדמות אקדמיית ה-Agent'),
          element('span', 'מבט מרוכז על כל תלמיד מול שיעורים 0–16, כולל הגשות וכרטיסי יציאה.'),
        );
        const loadDashboard = element('button', 'פתיחת דוח התקדמות', 'button secondary');
        loadDashboard.type = 'button';
        progressDashboardContent = element('div', undefined, 'progress-dashboard-content');
        progressDashboardContent.hidden = true;
        loadDashboard.addEventListener('click', async () => {
          const opened = !progressDashboardContent.hidden;
          if (opened) {
            progressDashboardContent.hidden = true;
            loadDashboard.textContent = 'פתיחת דוח התקדמות';
            return;
          }
          progressDashboardContent.hidden = false;
          loadDashboard.textContent = 'רענון דוח';
          progressDashboardContent.replaceChildren(element('p', 'טוענים דוח התקדמות…', 'progress-empty-note'));
          try {
            const data = await api(`/api/classroom/classes/${encodeURIComponent(classroom.id)}/progress-dashboard`);
            renderProgressDashboard(progressDashboardContent, data.dashboard);
            setMessage(dashboardMessage, '', true);
          } catch (error) {
            progressDashboardContent.replaceChildren(element('p', error.message, 'message'));
          }
        });
        dashboardTop.append(copy, loadDashboard);
        progressDashboardSection.append(dashboardTop, progressDashboardContent);
      }

      const courseForm = element('form', undefined, 'course-access-form');
      courseForm.append(createCoursePicker(classroom.courses || [], availableCourseIds));
      const saveCourses = element('button', 'שמירת הלומדות', 'button secondary');
      saveCourses.type = 'submit';
      saveCourses.setAttribute('data-action', 'save-class-courses');
      courseForm.append(saveCourses);
      courseForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        setMessage(dashboardMessage, 'שומרים את הלומדות…');
        try {
          await api(`/api/classroom/classes/${encodeURIComponent(classroom.id)}/courses`, {
            courses: selectedCourses(courseForm),
          });
          await refreshAfterMutation('הלומדות של הכיתה עודכנו.');
        } catch (error) {
          setMessage(dashboardMessage, error.message);
        }
      });
      courseAccess.append(courseForm);

      const oneTime = element('p', oneTimeStudentCodes.get(classroom.id) || '', 'one-time-code');
      oneTime.hidden = !oneTimeStudentCodes.has(classroom.id);
      oneTime.setAttribute('data-role', 'student-code-notice');
      const students = element('ul', undefined, 'student-list');
      if (classroom.students.length) {
        classroom.students.forEach((student) => {
          const item = element('li', undefined, 'student-row');
          item.setAttribute('data-student-id', student.id);
          const editForm = element('form', undefined, 'student-edit-form');
          editForm.setAttribute('data-action', 'edit-student');
          const nameLabel = element('label', 'שם תלמיד/ה');
          const nameInput = document.createElement('input');
          nameInput.name = 'name'; nameInput.required = true; nameInput.value = student.name;
          nameLabel.append(nameInput);
          const saveName = element('button', 'שמירת שם', 'button quiet');
          saveName.type = 'submit'; saveName.setAttribute('data-action', 'save-student');
          editForm.append(nameLabel, saveName);
          editForm.addEventListener('submit', async (event) => {
            event.preventDefault(); setMessage(dashboardMessage, 'שומרים את שם התלמיד/ה…');
            try {
              await api(`/api/classroom/classes/${encodeURIComponent(classroom.id)}/students/${encodeURIComponent(student.id)}`, formData(editForm));
              await refreshAfterMutation('שם התלמיד/ה נשמר.');
            } catch (error) { setMessage(dashboardMessage, error.message); }
          });
          const latest = student.progress?.[0];
          const progress = element('small', latest
            ? `${courseLabels[latest.courseId] || latest.courseId} · ${latest.status === 'completed' ? 'הושלם' : 'התחיל/ה'}`
            : 'עדיין אין פעילות שמורה');
          const minecraftForm = element('form', undefined, 'minecraft-identity-form');
          minecraftForm.setAttribute('data-action', 'verify-minecraft-identity');
          const upnLabel = element('label', 'חשבון Microsoft קיים (@hai.tech)');
          const upnInput = document.createElement('input');
          upnInput.name = 'upn'; upnInput.type = 'email'; upnInput.required = true;
          upnInput.value = student.minecraftIdentity?.upn || '';
          const playerLabel = element('label', 'שם שחקן Minecraft');
          const playerInput = document.createElement('input');
          playerInput.name = 'playerName'; playerInput.required = true; playerInput.pattern = '[A-Za-z0-9_]{2,32}';
          playerInput.minLength = 2; playerInput.maxLength = 32;
          playerInput.value = student.minecraftIdentity?.playerName || student.minecraftPlayerName || '';
          upnLabel.append(upnInput); playerLabel.append(playerInput);
          const minecraftStatus = element('small', student.minecraftIdentity?.status === 'verified'
            ? `מאומת: ${student.minecraftIdentity.upn} · ${student.minecraftIdentity.playerName}`
            : 'טרם אומת משתמש פעיל עם רישיון Minecraft Education.');
          const verifyMinecraft = element('button', 'אימות וקישור חשבון קיים', 'button quiet');
          verifyMinecraft.type = 'submit'; verifyMinecraft.setAttribute('data-action', 'verify-minecraft-identity');
          minecraftForm.append(upnLabel, playerLabel, minecraftStatus, verifyMinecraft);
          minecraftForm.addEventListener('submit', async (event) => {
            event.preventDefault(); setMessage(dashboardMessage, 'מאמתים משתמש ורישיון קיימים…');
            try {
              await api(`/api/classroom/classes/${encodeURIComponent(classroom.id)}/students/${encodeURIComponent(student.id)}/minecraft/verify`, formData(minecraftForm));
              await refreshAfterMutation('חשבון Microsoft הקיים ורישיון Minecraft Education אומתו וקושרו.');
            } catch (error) { setMessage(dashboardMessage, error.message); }
          });
          const actions = element('div', undefined, 'student-actions');
          const reset = element('button', 'איפוס קוד אישי', 'button quiet');
          reset.type = 'button'; reset.setAttribute('data-action', 'reset-student-code');
          reset.addEventListener('click', async () => {
            clearOneTimeStudentCodes();
            oneTime.textContent = '';
            oneTime.hidden = true;
            setMessage(dashboardMessage, 'מאפסים את הקוד האישי…');
            try {
              const data = await api(`/api/classroom/classes/${encodeURIComponent(classroom.id)}/students/${encodeURIComponent(student.id)}/reset`, {});
              const codeNotice = `הקוד האישי החדש של ${data.student.name}: ${data.student.loginCode} — הקוד מוצג עכשיו בלבד.`;
              oneTimeStudentCodes.set(classroom.id, codeNotice);
              oneTime.textContent = codeNotice;
              oneTime.hidden = false;
              await refreshAfterMutation('הקוד אופס וכל החיבורים הקודמים נותקו.');
            } catch (error) { setMessage(dashboardMessage, error.message); }
          });
          const archive = element('button', 'העברה לארכיון', 'button quiet');
          archive.type = 'button'; archive.setAttribute('data-action', 'archive-student');
          archive.addEventListener('click', async () => {
            setMessage(dashboardMessage, 'מעבירים את התלמיד/ה לארכיון…');
            try {
              await api(`/api/classroom/classes/${encodeURIComponent(classroom.id)}/students/${encodeURIComponent(student.id)}/archive`, {});
              await refreshAfterMutation('התלמיד/ה הועבר/ה לארכיון וכל החיבורים נותקו.');
            } catch (error) { setMessage(dashboardMessage, error.message); }
          });
          actions.append(reset, archive);
          item.append(editForm, progress);
          if ((classroom.courses || []).some((courseId) => courseId === 'minecraft' || courseId === 'craftom-agent')) {
            item.append(minecraftForm);
          }
          item.append(actions);
          students.append(item);
        });
      } else {
        students.append(element('li', 'עדיין לא נוספו תלמידים.'));
      }

      const addForm = element('form', undefined, 'add-student-form');
      addForm.setAttribute('data-action', 'add-student');
      const label = element('label', 'שם תלמיד/ה');
      const input = document.createElement('input');
      input.name = 'name';
      input.required = true;
      label.append(input);
      const button = element('button', 'הוספת תלמיד/ה', 'button secondary');
      button.type = 'submit';
      button.setAttribute('data-action', 'add-student');
      addForm.append(label, button);

      addForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        clearOneTimeStudentCodes();
        oneTime.textContent = '';
        oneTime.hidden = true;
        setMessage(dashboardMessage, 'מוסיפים תלמיד/ה…');
        try {
          const data = await api(`/api/classroom/classes/${encodeURIComponent(classroom.id)}/students`, formData(addForm));
          const codeNotice = `הקוד האישי של ${data.student.name}: ${data.student.loginCode} — הקוד מוצג עכשיו בלבד.`;
          oneTimeStudentCodes.set(classroom.id, codeNotice);
          oneTime.textContent = codeNotice;
          oneTime.hidden = false;
          addForm.reset();
          await refreshAfterMutation('התלמיד/ה נוסף/ה. שמרו את הקוד האישי שמופיע בכרטיס הכיתה.');
        } catch (error) {
          setMessage(dashboardMessage, error.message);
        }
      });
      const archivedSection = element('section', undefined, 'archived-students-section');
      const showArchivedStudents = element('button', 'הצגת תלמידים בארכיון', 'button quiet');
      showArchivedStudents.type = 'button'; showArchivedStudents.setAttribute('data-action', 'show-archived-students');
      const archivedList = element('ul', undefined, 'student-list archived-students');
      archivedList.hidden = true;
      showArchivedStudents.addEventListener('click', async () => {
        setMessage(dashboardMessage, 'טוענים תלמידים מהארכיון…');
        try {
          const data = await api(`/api/classroom/classes/${encodeURIComponent(classroom.id)}/students/archived`);
          const rows = data.students.map((student) => {
            const item = element('li'); item.setAttribute('data-student-id', student.id);
            item.append(element('span', student.name));
            if (student.minecraftIdentity?.status === 'verified') {
              item.append(element('small', `חשבון Minecraft מאומת נשמר: ${student.minecraftIdentity.upn} · ${student.minecraftIdentity.playerName}`));
            }
            const restore = element('button', 'שחזור תלמיד/ה', 'button secondary');
            restore.type = 'button'; restore.setAttribute('data-action', 'restore-student');
            restore.addEventListener('click', async () => {
              setMessage(dashboardMessage, 'משחזרים את התלמיד/ה…');
              try {
                await api(`/api/classroom/classes/${encodeURIComponent(classroom.id)}/students/${encodeURIComponent(student.id)}/restore`, {});
                await refreshAfterMutation('התלמיד/ה שוחזר/ה לכיתה. הקוד האישי לא הוצג או שונה.');
              } catch (error) { setMessage(dashboardMessage, error.message); }
            });
            item.append(restore); return item;
          });
          archivedList.replaceChildren(...rows);
          if (!rows.length) archivedList.append(element('li', 'אין תלמידים בארכיון בכיתה הזו.'));
          archivedList.hidden = false;
          setMessage(dashboardMessage, '', true);
        } catch (error) { setMessage(dashboardMessage, error.message); }
      });
      archivedSection.append(showArchivedStudents, archivedList);
      card.append(top, courseAccess, students, addForm, oneTime, archivedSection);
      if (progressDashboardSection) card.insertBefore(progressDashboardSection, students);
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
    document.getElementById('teacher-invitation-form').addEventListener('submit', async (event) => {
      event.preventDefault();
      const form = event.currentTarget;
      const notice = document.getElementById('teacher-one-time-password');
      notice.textContent = ''; notice.hidden = true;
      setMessage(authMessage, 'מממשים את ההזמנה…');
      try {
        const data = await api('/api/classroom/teacher-invitations/redeem', formData(form));
        notice.textContent = `הסיסמה הזמנית שלך: ${data.temporaryPassword} — מוצגת עכשיו בלבד. העתיקו אותה ואז התחברו.`;
        notice.hidden = false;
        const loginEmail = document.querySelector('#teacher-login-form input[name="email"]');
        if (loginEmail) loginEmail.value = data.teacher.email;
        form.reset();
        setMessage(authMessage, 'החשבון נוצר. הסיסמה הזמנית נשמרה בתצוגה עד שתעתיקו אותה.', true);
      } catch (error) { setMessage(authMessage, error.message); }
    });
    async function openPreviewDemoTeacher() {
      setMessage(authMessage, 'פותחים מורה בדיקה…');
      try {
        const data = await api('/api/classroom/preview-demo-teacher-login', {});
        setMessage(authMessage, '', true);
        await showDashboard(data);
        if (shouldOpenClassList) history.replaceState(null, '', 'teacher-classrooms.html');
        return true;
      } catch (error) {
        setMessage(authMessage, error.message);
        return false;
      }
    }

    const previewDemoTeacher = document.getElementById('preview-demo-teacher');
    if (previewDemoTeacher) {
      api('/api/classroom/preview-demo-teacher-enabled')
        .then((data) => {
          if (data.enabled) previewDemoTeacher.hidden = false;
        })
        .catch(() => {});
      previewDemoTeacher.addEventListener('click', async () => {
        previewDemoTeacher.disabled = true;
        try {
          await openPreviewDemoTeacher();
        } finally {
          previewDemoTeacher.disabled = false;
        }
      });
    }
    document.getElementById('create-class-form').addEventListener('submit', async (event) => {
      event.preventDefault();
      const classForm = event.currentTarget;
      setMessage(dashboardMessage, 'יוצרים כיתה…');
      try {
        const data = formData(classForm);
        data.courses = selectedCourses(classForm);
        await api('/api/classroom/classes', data);
        classForm.reset();
        await refreshAfterMutation('הכיתה נוצרה.');
      } catch (error) {
        setMessage(dashboardMessage, error.message);
      }
    });
    document.getElementById('teacher-logout').addEventListener('click', async () => {
      clearOneTimeStudentCodes();
      await api('/api/classroom/logout', {});
      location.reload();
    });

    try {
      const me = await api('/api/classroom/me');
      if (me.role === 'teacher') {
        await showDashboard(me);
        if (shouldOpenClassList) history.replaceState(null, '', 'teacher-classrooms.html');
      } else if (shouldOpenClassList && previewDemoTeacher) {
        const demo = await api('/api/classroom/preview-demo-teacher-enabled').catch(() => ({ enabled: false }));
        if (demo.enabled) await openPreviewDemoTeacher();
      }
    } catch {}
  }

  if (page === 'entry') initEntry();
  if (page === 'teacher') initTeacher();
})();
