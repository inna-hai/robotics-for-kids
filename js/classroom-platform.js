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
    const next = nextCourse();
    const guest = document.getElementById('guest-continue');
    const studentContinue = document.getElementById('student-continue');
    if (guest) guest.href = next;
    if (studentContinue) studentContinue.href = next;

    const form = document.getElementById('student-login-form');
    const message = document.getElementById('student-login-message');
    const session = document.getElementById('student-session');
    const welcome = document.getElementById('student-welcome');

    function showStudent(data) {
      form.hidden = true;
      session.hidden = false;
      welcome.textContent = `שלום ${data.student.name}, נכנסת לכיתה ${data.classroom.name}.`;
    }

    try {
      const me = await api('/api/classroom/me');
      if (me.role === 'student') showStudent(me);
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

  async function initTeacher() {
    const auth = document.getElementById('teacher-auth');
    const dashboard = document.getElementById('teacher-dashboard');
    const authMessage = document.getElementById('teacher-auth-message');
    const dashboardMessage = document.getElementById('dashboard-message');
    const list = document.getElementById('classes-list');

    async function loadClasses() {
      const data = await api('/api/classroom/classes');
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
      card.append(top, students, addForm, oneTime);
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
        await api('/api/classroom/classes', formData(classForm));
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
