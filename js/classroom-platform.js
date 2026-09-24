(() => {
  const page = document.body.dataset.classroomPage;
  const allowedNext = new Set([
    'sensi-city.html?lesson=1',
    'sisi.html',
    'python-turtle.html',
    'webcode.html',
    'minecraft.html',
    'kugel-student.html',
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
    'craftom-agent': 'kugel-student.html',
  };

  const teacherCourseStarts = {
    ...courseStarts,
    'craftom-agent': 'agent-academy-teacher.html',
  };

  function teacherCourseHref(courseId, classroomId = '') {
    if (courseId === 'craftom-agent' && classroomId) return `agent-academy-teacher.html?classroomId=${encodeURIComponent(classroomId)}`;
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

  function lessonProgressCounts(students, lessonIndex) {
    return students.reduce((counts, student) => {
      const lesson = student.lessons[lessonIndex];
      if (!lesson) return counts;
      if (lesson.overallStatus === 'started' || lesson.overallStatus === 'completed') counts.started += 1;
      if (lesson.overallStatus === 'completed') counts.completed += 1;
      if (lesson.submission) counts.submissions += 1;
      if (lesson.overallStatus !== 'completed' && (lesson.academyStatus === 'started' || lesson.minecraftStatus === 'started')) counts.needsAttention += 1;
      return counts;
    }, { started: 0, completed: 0, submissions: 0, needsAttention: 0 });
  }

  function createFullProgressTable(dashboard) {
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
    return [tableWrap, details];
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

    let selectedLessonIndex = 0;
    const lessonFocus = element('section', undefined, 'lesson-progress-focus');
    const lessonTop = element('div', undefined, 'lesson-progress-top');
    const lessonCopy = element('div');
    lessonCopy.append(
      element('strong', 'בדיקת שיעור אחד'),
      element('span', 'בחרי שיעור, ותראי רק את התלמידים והסטטוס שלהם באותו שיעור.'),
    );
    const lessonSelect = document.createElement('select');
    lessonSelect.setAttribute('aria-label', 'בחירת שיעור לדוח התקדמות');
    dashboard.lessons.forEach((lesson, index) => {
      const option = document.createElement('option');
      option.value = String(index);
      option.textContent = `שיעור ${lesson.id}: ${lesson.title}`;
      lessonSelect.append(option);
    });
    lessonTop.append(lessonCopy, lessonSelect);
    const lessonBody = element('div', undefined, 'lesson-progress-body');
    const detail = element('div', 'בחרי תלמיד כדי לראות פירוט של השיעור.', 'progress-detail lesson-detail-panel');

    function renderSelectedLesson() {
      const lesson = dashboard.lessons[selectedLessonIndex];
      const counts = lessonProgressCounts(dashboard.students, selectedLessonIndex);
      const lessonCards = element('div', undefined, 'lesson-summary-grid');
      [
        ['התחילו', counts.started],
        ['השלימו', counts.completed],
        ['הגישו', counts.submissions],
        ['צריכים עזרה', counts.needsAttention],
      ].forEach(([label, value]) => {
        const card = element('div', undefined, 'progress-summary-card compact');
        card.append(element('strong', String(value || 0)), element('span', label));
        lessonCards.append(card);
      });

      const studentList = element('div', undefined, 'lesson-student-list');
      dashboard.students.forEach((student) => {
        const studentLesson = student.lessons[selectedLessonIndex];
        const item = element('article', undefined, `lesson-student-row ${studentLesson.overallStatus}`);
        const name = element('div', undefined, 'lesson-student-name');
        name.append(element('strong', student.name), element('span', studentLesson.submission ? 'יש הגשה' : 'אין הגשה'));
        const status = element('div', undefined, 'lesson-student-status');
        [
          ['כללי', progressLabel(studentLesson.overallStatus), studentLesson.overallStatus],
          ['Agent', learningLabel(studentLesson.academyStatus, 'הושלם', 'בתהליך', 'חסר'), studentLesson.academyStatus],
          ['Minecraft', learningLabel(studentLesson.minecraftStatus, 'הושלם', 'בתהליך', 'לא התחיל'), studentLesson.minecraftStatus],
          ['כרטיס', learningLabel(studentLesson.exitTicketStatus, 'הוגש', 'בתהליך', 'חסר'), studentLesson.exitTicketStatus],
        ].forEach(([label, value, state]) => {
          const pill = element('span', undefined, `mini-status ${state}`);
          pill.append(element('strong', label), document.createTextNode(value));
          status.append(pill);
        });
        const open = element('button', 'פירוט', 'button quiet lesson-detail-button');
        open.type = 'button';
        open.addEventListener('click', () => {
          detail.replaceChildren(renderLessonDetail(student, studentLesson));
        });
        item.append(name, status, open);
        studentList.append(item);
      });

      lessonBody.replaceChildren(
        element('h4', `שיעור ${lesson.id}: ${lesson.title}`),
        lessonCards,
        studentList,
      );
      detail.replaceChildren(document.createTextNode('בחרי תלמיד כדי לראות פירוט של השיעור.'));
    }

    lessonSelect.addEventListener('change', () => {
      selectedLessonIndex = Number(lessonSelect.value) || 0;
      renderSelectedLesson();
    });
    renderSelectedLesson();
    lessonFocus.append(lessonTop, lessonBody, detail);

    const advanced = element('details', undefined, 'progress-advanced');
    advanced.append(element('summary', 'תצוגה מלאה של כל השיעורים'));
    advanced.append(...createFullProgressTable(dashboard));

    container.append(summary, lessonFocus, advanced);
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
    const courseView = document.getElementById('teacher-course-view');
    const teacherCourseCatalog = document.getElementById('teacher-course-catalog');
    const teacherTopbarLogout = document.getElementById('teacher-topbar-logout');
    const createClassButton = document.querySelector('#create-class-form button[type="submit"]');
    const createClassForm = document.getElementById('create-class-form');
    const createClassToggle = document.getElementById('create-class-toggle');
    const createClassFields = document.getElementById('create-class-fields');
    let availableCourseIds = [];
    let currentClasses = [];
    let selectedCourseId = '';

    function setCreateClassOpen(isOpen) {
      if (!createClassForm || !createClassToggle || !createClassFields) return;
      createClassForm.classList.toggle('is-collapsed', !isOpen);
      createClassFields.hidden = !isOpen;
      createClassToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      createClassToggle.textContent = isOpen ? 'סגירה' : 'פתיחה';
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

    function courseClassCount(courseId) {
      return currentClasses.filter((classroom) => (classroom.courses || []).includes(courseId)).length;
    }

    function renderCourseView() {
      courseView.replaceChildren();
      if (!availableCourseIds.length) {
        list.replaceChildren(element('p', 'עדיין לא הוקצו לך לומדות. מנהלת המערכת יכולה לפתוח עבורך לומדות.', 'card'));
        return;
      }

      if (!selectedCourseId || !availableCourseIds.includes(selectedCourseId)) {
        selectedCourseId = availableCourseIds.find((courseId) => courseClassCount(courseId) > 0) || availableCourseIds[0];
      }

      const picker = element('section', undefined, 'teacher-course-selector');
      const copy = element('div', undefined, 'teacher-course-selector-copy');
      copy.append(
        element('h3', 'בחרי לומדה'),
        element('p', 'לאחר הבחירה יוצגו רק הכיתות שלומדות את הלומדה הזאת.'),
      );
      const buttons = element('div', undefined, 'teacher-course-tabs');
      for (const courseId of availableCourseIds) {
        const count = courseClassCount(courseId);
        const button = element('button', undefined, `course-tab${courseId === selectedCourseId ? ' active' : ''}`);
        button.type = 'button';
        button.setAttribute('aria-pressed', courseId === selectedCourseId ? 'true' : 'false');
        button.append(
          element('strong', courseLabels[courseId] || courseId),
          element('span', count === 1 ? 'כיתה אחת' : `${count} כיתות`),
        );
        button.addEventListener('click', () => {
          selectedCourseId = courseId;
          renderCourseView();
        });
        buttons.append(button);
      }
      picker.append(copy, buttons);
      courseView.append(picker);

      const filteredClasses = currentClasses.filter((classroom) => (classroom.courses || []).includes(selectedCourseId));
      list.replaceChildren(...filteredClasses.map((classroom) => renderClass(classroom, selectedCourseId)));
      if (!filteredClasses.length) {
        list.replaceChildren(element('p', `עדיין אין כיתות תחת ${courseLabels[selectedCourseId] || selectedCourseId}. אפשר ליצור כיתה חדשה למטה ולשייך אותה ללומדה הזאת.`, 'card'));
      }
    }

    async function loadClasses() {
      const data = await api('/api/classroom/classes');
      availableCourseIds = data.teacher?.courses || [];
      currentClasses = data.classes || [];
      renderTeacherCatalog();
      renderCourseView();
    }

    function renderClass(classroom, activeCourseId = '') {
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
      const activeCourseLabel = courseLabels[activeCourseId] || activeCourseId || 'הלומדות של הכיתה';
      courseAccess.append(element('h4', activeCourseId ? activeCourseLabel : 'הלומדות של הכיתה'));
      const courseLinks = element('div', undefined, 'course-links');
      const visibleCourseIds = activeCourseId ? [activeCourseId] : (classroom.courses || []);
      for (const courseId of visibleCourseIds) {
        const linkText = courseId === 'craftom-agent'
          ? 'כניסה לכל השיעורים והמצגות'
          : `כניסה ללומדה: ${courseLabels[courseId] || courseId}`;
        const link = element('a', undefined, courseId === 'craftom-agent' ? 'course-action-card primary-action' : 'course-action-card');
        link.href = teacherCourseHref(courseId, classroom.id);
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        const title = element('strong', linkText);
        const description = element(
          'span',
          courseId === 'craftom-agent'
            ? 'מסך המורה: צפייה בכל השיעורים, מצגות, תצוגת תלמיד ופתיחת השיעור הבא.'
            : 'פתיחת סביבת המורה של הלומדה.',
        );
        link.append(title, description);
        courseLinks.append(link);
      }
      courseAccess.append(courseLinks);

      let progressDashboardSection = null;
      let progressDashboardContent = null;
      if (activeCourseId === 'craftom-agent' || (!activeCourseId && (classroom.courses || []).includes('craftom-agent'))) {
        progressDashboardSection = element('section', undefined, 'progress-dashboard-section');
        const dashboardTop = element('div', undefined, 'progress-dashboard-top');
        const copy = element('div');
        copy.append(
          element('strong', 'דוח התקדמות והגשות'),
          element('span', 'לראות לפי שיעור מה כל תלמיד התחיל, סיים והגיש.'),
        );
        const loadDashboard = element('button', 'פתיחת דוח', 'button secondary');
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
      const courseSettings = element('details', undefined, 'class-course-settings');
      courseSettings.append(element('summary', 'הגדרות לומדות לכיתה'));
      courseSettings.append(courseForm);
      courseAccess.append(courseSettings);

      const needsMinecraftIdentity = activeCourseId
        ? (activeCourseId === 'minecraft' || activeCourseId === 'craftom-agent')
        : (classroom.courses || []).some((courseId) => courseId === 'minecraft' || courseId === 'craftom-agent');
      const students = element('section', undefined, 'students-table-section');
      students.append(element('h4', 'תלמידים בכיתה'));
      if (classroom.students.length) {
        const table = element('table', undefined, 'students-table');
        const headRow = element('tr');
        headRow.append(
          element('th', 'שם התלמיד/ה'),
          element('th', needsMinecraftIdentity ? 'שם משתמש Minecraft' : 'פעילות אחרונה'),
        );
        const thead = element('thead');
        thead.append(headRow);
        const tbody = element('tbody');
        classroom.students.forEach((student) => {
          const row = element('tr');
          row.setAttribute('data-student-id', student.id);
          const latest = student.progress?.[0];
          const progressText = latest
            ? `${courseLabels[latest.courseId] || latest.courseId} · ${latest.status === 'completed' ? 'הושלם' : 'התחיל/ה'}`
            : 'אין פעילות שמורה';
          const minecraftUsername = student.minecraftIdentity?.status === 'verified'
            ? student.minecraftIdentity.upn
            : 'לא מקושר';
          const valueCell = element('td', needsMinecraftIdentity ? minecraftUsername : progressText);
          if (needsMinecraftIdentity) valueCell.className = 'minecraft-username';
          row.append(
            element('td', student.name),
            valueCell,
          );
          tbody.append(row);
        });
        table.append(thead, tbody);
        students.append(table);
      } else {
        students.append(element('p', 'עדיין לא נוספו תלמידים.', 'progress-empty-note'));
      }

      card.append(top, courseAccess, students);
      if (progressDashboardSection) card.insertBefore(progressDashboardSection, students);
      return card;
    }

    async function showDashboard(me) {
      auth.hidden = true;
      dashboard.hidden = false;
      if (teacherTopbarLogout) teacherTopbarLogout.hidden = false;
      document.getElementById('teacher-welcome').textContent = `שלום ${me.teacher.name}`;
      await loadClasses();
    }

    async function logoutTeacher() {
      await api('/api/classroom/logout', {});
      location.reload();
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
    if (createClassToggle) {
      createClassToggle.addEventListener('click', () => {
        setCreateClassOpen(createClassFields?.hidden ?? true);
      });
    }
    setCreateClassOpen(false);

    document.getElementById('create-class-form').addEventListener('submit', async (event) => {
      event.preventDefault();
      const classForm = event.currentTarget;
      setMessage(dashboardMessage, 'יוצרים כיתה…');
      try {
        const data = formData(classForm);
        data.courses = selectedCourses(classForm);
        await api('/api/classroom/classes', data);
        classForm.reset();
        setCreateClassOpen(false);
        await refreshAfterMutation('הכיתה נוצרה.');
      } catch (error) {
        setMessage(dashboardMessage, error.message);
      }
    });
    document.getElementById('teacher-logout').addEventListener('click', logoutTeacher);
    if (teacherTopbarLogout) teacherTopbarLogout.addEventListener('click', logoutTeacher);

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
