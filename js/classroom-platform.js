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
    'craftom-agent': 'kugel-student.html',
  };

  const teacherCourseStarts = {
    ...courseStarts,
    'craftom-agent': 'craftom-school/preview/index.html',
  };

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
        teacherCourseCatalog.append(element('p', 'עדיין לא הוקצו לך לומדות. מנהלת המערכת יכולה לפתוח עבורך לומדות.', 'message'));
        createClassButton.disabled = true;
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

      const courseForm = element('form', undefined, 'course-access-form');
      courseForm.append(createCoursePicker(classroom.courses || [], availableCourseIds));
      const saveCourses = element('button', 'שמירת הלומדות', 'button secondary');
      saveCourses.type = 'submit';
      courseForm.append(saveCourses);
      courseForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        setMessage(dashboardMessage, 'שומרים את הלומדות…');
        try {
          await api(`/api/classroom/classes/${encodeURIComponent(classroom.id)}/courses`, {
            courses: selectedCourses(courseForm),
          });
          setMessage(dashboardMessage, 'הלומדות של הכיתה עודכנו.', true);
          await loadClasses();
        } catch (error) {
          setMessage(dashboardMessage, error.message);
        }
      });
      courseAccess.append(courseForm);

      const students = element('ul', undefined, 'student-list');
      if (classroom.students.length) {
        classroom.students.forEach((student) => {
          const item = element('li');
          item.append(element('strong', student.name));
          const latest = student.progress?.[0];
          item.append(element(
            'small',
            latest
              ? `${courseLabels[latest.courseId] || latest.courseId} · ${latest.status === 'completed' ? 'הושלם' : 'התחיל/ה'}`
              : 'עדיין אין פעילות שמורה',
          ));
          students.append(item);
        });
      } else {
        students.append(element('li', 'עדיין לא נוספו תלמידים.'));
      }

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
            refreshedNotice.textContent = `הקוד האישי של ${data.student.name}: ${data.student.loginCode} — הקוד מוצג עכשיו בלבד.`;
            refreshedNotice.hidden = false;
          }
          setMessage(dashboardMessage, 'התלמיד/ה נוסף/ה. שמרו את הקוד האישי שמופיע בכרטיס הכיתה.', true);
        } catch (error) {
          setMessage(dashboardMessage, error.message);
        }
      });
      card.append(top, courseAccess, students, addForm, oneTime);
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
    document.getElementById('create-class-form').addEventListener('submit', async (event) => {
      event.preventDefault();
      const classForm = event.currentTarget;
      setMessage(dashboardMessage, 'יוצרים כיתה…');
      try {
        const data = formData(classForm);
        data.courses = selectedCourses(classForm);
        await api('/api/classroom/classes', data);
        classForm.reset();
        setMessage(dashboardMessage, 'הכיתה נוצרה.', true);
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
  if (page === 'teacher') initTeacher();
})();
