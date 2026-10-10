(() => {
  const script = document.currentScript;
  const config = {
    webcode: {
      label: 'WebCode Lab',
      guestUrl: 'webcode-play.html?lesson=1&v=20',
      courseUrl: 'webcode.html',
      teacherUrl: 'quick-classroom.html?course=webcode',
    },
    'python-turtle': {
      label: 'פייתון מצייר',
      guestUrl: 'python-turtle.html?lesson=1',
      courseUrl: 'python-turtle.html?lesson=1',
      teacherUrl: 'quick-classroom.html?course=python-turtle',
    },
    'sensi-city': {
      label: 'סנסי בעיר החכמה',
      guestUrl: 'sensi-city.html?lesson=1',
      courseUrl: 'sensi-city.html?lesson=1',
      teacherUrl: 'quick-classroom.html?course=sensi-city',
    },
    sisi: {
      label: 'סדרת סיסי לכיתות ב׳',
      guestUrl: 'space.html',
      courseUrl: 'sisi.html',
      teacherUrl: 'quick-classroom.html?course=sisi',
    },
    minecraft: {
      label: 'מיינקראפט קידס: מתכנתים קסמים',
      guestUrl: 'minecraft-play.html?lesson=1',
      courseUrl: 'minecraft.html',
      teacherUrl: 'quick-classroom.html?course=minecraft',
    },
    'future-architects': {
      label: 'אדריכלי המחר',
      guestUrl: 'future-architects-lesson.html',
      courseUrl: 'future-architects.html',
      teacherUrl: 'quick-classroom.html?course=future-architects',
    },
  };
  const courseId = script?.dataset.course || document.body?.dataset.quickClassroomCourse || '';
  const mode = script?.dataset.mode || document.body?.dataset.quickClassroomMode || 'panel';
  const course = config[courseId];
  if (!course || document.querySelector('[data-quick-classroom-embed]')) return;

  const markerColors = [
    ['blue', 'כחול', 'marker-blue'],
    ['green', 'ירוק', 'marker-green'],
    ['yellow', 'צהוב', 'marker-yellow'],
    ['pink', 'ורוד', 'marker-pink'],
    ['purple', 'סגול', 'marker-purple'],
    ['orange', 'כתום', 'marker-orange'],
  ];
  const markerShapes = [
    ['circle', '●', 'עיגול'],
    ['star', '★', 'כוכב'],
    ['square', '■', 'ריבוע'],
    ['heart', '♥', 'לב'],
    ['triangle', '▲', 'משולש'],
    ['diamond', '◆', 'יהלום'],
  ];

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, char => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    }[char]));
  }

  function markerChoices(name) {
    return markerColors.map((color, index) => {
      const shape = markerShapes[index % markerShapes.length];
      return `<label class="qce-marker-option" title="${shape[2]} ${color[1]}">
        <input type="radio" name="${name}" data-color="${color[0]}" data-shape="${shape[0]}" ${index === 0 ? 'checked' : ''}>
        <span class="qce-marker-chip ${color[2]}" aria-hidden="true">${shape[1]}</span>
      </label>`;
    }).join('');
  }

  function selectedMarker(root, name) {
    const checked = root.querySelector(`input[name="${name}"]:checked`);
    return { color: checked?.dataset.color || 'blue', shape: checked?.dataset.shape || 'circle' };
  }

  async function postJson(path, payload) {
    const response = await fetch(path, {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || 'לא הצלחנו להיכנס לכיתה.');
    return data;
  }

  function setStatus(root, text, bad = false) {
    const status = root.querySelector('[data-qce-status]');
    if (!status) return;
    status.textContent = text || '';
    status.classList.toggle('bad', Boolean(bad));
  }

  function rememberFutureArchitectsStudent(loginData) {
    if (loginData?.classroom?.course?.id !== 'future-architects') return;
    if (!loginData?.student?.id || !loginData?.classroom?.id) return;
    sessionStorage.setItem('futureArchitects.classroomStorageScope.v1', `student:${loginData.classroom.id}:${loginData.student.id}`);
  }

  function rememberClassroomStudentScope(loginData) {
    const courseId = loginData?.classroom?.course?.id;
    if (!courseId || !loginData?.student?.id || !loginData?.classroom?.id) return;
    sessionStorage.setItem('haiTechClassroomStorageScope.v1', `student:${loginData.classroom.id}:${loginData.student.id}:${courseId}`);
  }

  function bindForm(root, markerName) {
    const form = root.querySelector('[data-qce-form]');
    form?.addEventListener('submit', async event => {
      event.preventDefault();
      setStatus(root, 'נכנסים לכיתה...');
      const marker = selectedMarker(root, markerName);
      try {
        const loginData = await postJson('/api/webcode/student-login', {
          classCode: root.querySelector('[data-qce-class-code]').value,
          name: root.querySelector('[data-qce-student-name]').value,
          markerColor: marker.color,
          markerShape: marker.shape,
        });
        rememberClassroomStudentScope(loginData);
        rememberFutureArchitectsStudent(loginData);
        location.assign(loginData.startUrl || course.courseUrl);
      } catch (error) {
        setStatus(root, error.message || 'לא הצלחנו להיכנס לכיתה.', true);
      }
    });
  }

  function panelHtml() {
    return `<section class="quick-classroom-embed qce-panel" data-quick-classroom-embed aria-label="כניסה לכיתה עבור ${escapeHtml(course.label)}">
      <article class="qce-card qce-intro">
        <span class="qce-eyebrow">כניסה לכיתה</span>
        <h2>${escapeHtml(course.label)}</h2>
        <p>תלמידים נכנסים עם קוד הכיתה והשם שלהם. מורות פותחות או מנהלות כיתות ללומדה הזאת.</p>
        <div class="qce-actions">
          <a class="qce-btn qce-secondary" href="${course.teacherUrl}">פתיחת / ניהול כיתה</a>
          <a class="qce-btn qce-ghost" href="${course.guestUrl}">כניסה בלי כיתה</a>
        </div>
      </article>
      <article class="qce-card">
        <h3>אני תלמיד/ה בכיתה</h3>
        <form class="qce-form" data-qce-form>
          <div class="qce-row">
            <label>קוד כיתה
              <input data-qce-class-code inputmode="numeric" autocomplete="off" placeholder="למשל 4827" required>
            </label>
            <label>השם שלי
              <input data-qce-student-name autocomplete="name" placeholder="שם פרטי או כינוי" required>
            </label>
          </div>
          <label>הסימון שלי
            <div class="qce-marker-grid">${markerChoices(`qce-marker-${courseId}`)}</div>
          </label>
          <button class="qce-btn qce-primary" type="submit">להיכנס ולשמור התקדמות</button>
          <div class="qce-status" data-qce-status role="status"></div>
        </form>
      </article>
    </section>`;
  }

  function dockHtml({ gated = false } = {}) {
    return `<div class="quick-classroom-embed ${gated ? 'qce-gate' : 'qce-dock'}" data-quick-classroom-embed>
      ${gated ? '<div class="qce-gate-backdrop" aria-hidden="true"></div>' : ''}
      <button class="qce-dock-toggle" type="button" aria-expanded="false">כניסת כיתה</button>
      <section class="qce-dock-panel" ${gated ? '' : 'hidden'} aria-label="כניסה לכיתה עבור ${escapeHtml(course.label)}">
        <div class="qce-dock-head">
          <div><span class="qce-eyebrow">כניסה לכיתה</span><h2>${escapeHtml(course.label)}</h2></div>
          <button class="qce-close" type="button" aria-label="סגירה" ${gated ? 'hidden' : ''}>×</button>
        </div>
        <p>${gated ? 'כדי שההתקדמות תישמר למורה, נכנסים עם קוד כיתה ושם. אפשר להמשיך בלי כיתה רק כאורח.' : 'תלמידים נכנסים עם קוד כיתה ושם. מורות פותחות או מנהלות כיתות ללומדה הזאת.'}</p>
        <form class="qce-form" data-qce-form>
          <label>קוד כיתה
            <input data-qce-class-code inputmode="numeric" autocomplete="off" placeholder="למשל 4827" required>
          </label>
          <label>השם שלי
            <input data-qce-student-name autocomplete="name" placeholder="שם פרטי או כינוי" required>
          </label>
          <label>הסימון שלי
            <div class="qce-marker-grid">${markerChoices(`qce-dock-marker-${courseId}`)}</div>
          </label>
          <button class="qce-btn qce-primary" type="submit">להיכנס לכיתה</button>
          <div class="qce-status" data-qce-status role="status"></div>
        </form>
        <div class="qce-actions">
          <a class="qce-btn qce-secondary" href="${course.teacherUrl}">מורה / פתיחת כיתה</a>
          <button class="qce-btn qce-ghost" type="button" data-qce-guest>להמשיך בלי כיתה</button>
        </div>
      </section>
    </div>`;
  }

  function insertPanel(root) {
    const target = document.querySelector('.hero') || document.querySelector('main > section') || document.querySelector('main');
    if (target?.parentNode) {
      target.insertAdjacentElement('afterend', root);
    } else {
      document.body.prepend(root);
    }
  }

  function insertDock(root, { gated = false } = {}) {
    document.body.append(root);
    const toggle = root.querySelector('.qce-dock-toggle');
    const panel = root.querySelector('.qce-dock-panel');
    const close = root.querySelector('.qce-close');
    const guest = root.querySelector('[data-qce-guest]');
    const setOpen = open => {
      panel.hidden = !open;
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      root.classList.toggle('is-open', open);
    };
    toggle.addEventListener('click', () => setOpen(panel.hidden));
    close?.addEventListener('click', () => setOpen(false));
    guest?.addEventListener('click', () => {
      sessionStorage.setItem(`haiTechQuickClassGuest:${courseId}`, '1');
      setOpen(false);
    });
    if (gated) {
      setOpen(true);
      if (sessionStorage.getItem(`haiTechQuickClassGuest:${courseId}`) === '1') {
        setOpen(false);
      } else {
        fetch('/api/classroom/me', { credentials: 'same-origin' })
          .then(response => response.ok ? response.json() : null)
          .then(me => {
            if (me?.role === 'student' || me?.role === 'teacher') setOpen(false);
          })
          .catch(() => {});
      }
    }
  }

  const wrapper = document.createElement('div');
  wrapper.innerHTML = mode === 'dock' || mode === 'gate' ? dockHtml({ gated: mode === 'gate' }) : panelHtml();
  const root = wrapper.firstElementChild;
  if (!root) return;
  if (mode === 'dock' || mode === 'gate') insertDock(root, { gated: mode === 'gate' });
  else insertPanel(root);
  bindForm(root, mode === 'dock' || mode === 'gate' ? `qce-dock-marker-${courseId}` : `qce-marker-${courseId}`);
})();
