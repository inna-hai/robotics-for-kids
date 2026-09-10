(() => {
  const page = document.body.dataset.kugelPage;
  const query = new URLSearchParams(location.search);
  const classroomId = query.get('classroomId') || '';
  const hasRequestedLesson = query.has('lesson');
  const requestedLessonId = Number(query.get('lesson') || '');
  const requestedChallengeId = Number(query.get('challenge') || '');
  const drafts = new Map();

  function node(tag, text, className) {
    const element = document.createElement(tag);
    if (text !== undefined) element.textContent = text;
    if (className) element.className = className;
    return element;
  }

  async function api(path, payload) {
    const response = await fetch(path, {
      method: payload === undefined ? 'GET' : 'POST',
      credentials: 'same-origin',
      headers: payload === undefined ? {} : { 'Content-Type': 'application/json' },
      body: payload === undefined ? undefined : JSON.stringify(payload),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(data.error || 'הפעולה לא הצליחה.');
      error.status = response.status;
      throw error;
    }
    return data;
  }

  function setStatus(target, text, failed = false) {
    if (!target) return;
    target.textContent = text || '';
    target.classList.toggle('error', failed);
  }

  function formatDate(value) {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleString('he-IL');
  }

  async function initStudent() {
    const sessionStatus = document.getElementById('studentSessionStatus');
    const playerStatus = document.getElementById('playerStatus');
    const identity = document.getElementById('studentIdentity');
    const minecraftDetails = document.getElementById('minecraftDetails');
    const message = document.getElementById('studentMessage');
    const launch = document.getElementById('launchWorld');
    const reset = document.getElementById('resetOwnMission');
    const finish = document.getElementById('finishLesson');
    const continueCourse = document.getElementById('continueCourse');
    const coinProgress = document.getElementById('coinProgress');
    const progressStrip = document.getElementById('studentProgressStrip');
    const qaLessonSwitcher = document.getElementById('qaLessonSwitcher');
    const qaLessonGrid = document.getElementById('qaLessonGrid');
    let current = null;

    function renderQaLessonSwitcher(data) {
      if (!qaLessonSwitcher || !qaLessonGrid) return;
      const enabled = Boolean(data.qaLessonMapping && Array.isArray(data.lessons) && data.lessons.length);
      qaLessonSwitcher.hidden = !enabled;
      if (!enabled) {
        qaLessonGrid.replaceChildren();
        return;
      }
      const links = data.lessons.map(lesson => {
        const lessonId = Number(lesson.id);
        const link = node('a', String(lessonId), `qa-lesson-link${lessonId === Number(data.lesson?.id || 0) ? ' active' : ''}${lesson.hasWorld === false ? ' missing-world' : ''}`);
        link.href = lessonId === 0 ? 'kugel-student.html' : `craftom-minecraft-lesson-${lessonId}.html`;
        link.title = lessonId === 0
          ? 'שיעור 0 - מבוך המטבעות'
          : `${lesson.title || `שיעור ${lessonId}`}${lesson.hasWorld === false ? ' - חסר עולם Minecraft' : ''}`;
        return link;
      });
      qaLessonGrid.replaceChildren(...links);
    }

    function render(data) {
      current = data;
      const student = data.student || {};
      const session = data.session || {};
      const minecraft = data.minecraft;
      renderQaLessonSwitcher(data);
      sessionStatus.textContent = session.active ? 'השיעור פעיל' : 'ממתין להפעלת המורה';
      playerStatus.textContent = student.connected ? 'מחובר/ת' : 'לא מחובר/ת';
      identity.textContent = student.minecraftPlayerName
        ? `${student.name} • שחקן Minecraft: ${student.minecraftPlayerName}`
        : `${student.name || 'תלמיד/ה'} • המורה עדיין לא שייכה לך שם שחקן ב-Minecraft.`;
      minecraftDetails.textContent = minecraft && session.active
        ? `שרת: ${minecraft.serverName} • כתובת: ${minecraft.serverAddress} • Server ID: ${minecraft.serverId}`
        : 'פרטי החיבור יוצגו לאחר שהמורה תפעיל את העולם ותשייך את שם השחקן.';
      document.getElementById('minecraftAccessCode').textContent = minecraft?.accessCode || 'יוצג לאחר הפעלת השיעור';
      coinProgress.textContent = `${student.coins || 0} מתוך 8 מטבעות`;
      const steps = [
        ['העולם הופעל', session.active],
        ['Minecraft נפתח', Boolean(student.startedAt)],
        ['8 מטבעות', Number(student.coins) >= 8],
        ['הושלם', Boolean(student.completed)],
      ].map(([label, done]) => node('span', label, `progress-step${done ? ' done' : ''}`));
      progressStrip.replaceChildren(...steps);
      const canStart = Boolean(session.active && student.minecraftPlayerName && minecraft);
      launch.disabled = !canStart;
      reset.disabled = !canStart;
      finish.disabled = !canStart;
      continueCourse.hidden = !student.completionRecorded;
    }

    async function refresh() {
      try {
        render(await api('/api/kugel/session'));
      } catch (error) {
        setStatus(message, error.message, true);
        launch.disabled = true;
        reset.disabled = true;
        finish.disabled = true;
      }
    }

    launch.addEventListener('click', async () => {
      setStatus(message, 'פותחים את Minecraft…');
      try {
        const data = await api('/api/kugel/student/start', {});
        setStatus(message, 'Minecraft נפתח. אם האפליקציה לא נפתחה, השתמשו בפרטי השרת שמופיעים למעלה.');
        if (data.minecraft?.launchUrl) location.href = data.minecraft.launchUrl;
      } catch (error) {
        setStatus(message, error.message, true);
      }
    });
    reset.addEventListener('click', async () => {
      setStatus(message, 'מאפסים את הניסיון…');
      try {
        await api('/api/kugel/student/reset', {});
        setStatus(message, 'הניסיון אופס. אפשר להתחיל מחדש.');
        await refresh();
      } catch (error) {
        setStatus(message, error.message, true);
      }
    });
    finish.addEventListener('click', async () => {
      setStatus(message, 'בודקים את אירועי המשחק…');
      try {
        await api('/api/kugel/student/finish', {});
        setStatus(message, 'שיעור 0 הושלם. אפשר להמשיך לשיעור 1.');
        await refresh();
      } catch (error) {
        setStatus(message, error.message, true);
      }
    });

    await refresh();
    setInterval(refresh, 5000);
  }

  async function initTeacher() {
    const status = document.getElementById('teacherStatus');
    const monitor = document.getElementById('studentMonitor');
    const className = document.getElementById('teacherClassName');
    const classMessage = document.querySelector('#classMessageForm input[name="text"]');
    const lessonList = document.getElementById('minecraftLessonList');
    const studentPreviewLink = document.getElementById('studentPreviewLink');
    const teacherCourseHeaderNav = document.getElementById('teacherCourseHeaderNav');
    const selectedTeacherLesson = document.getElementById('selectedTeacherLesson');
    const selectedLessonTitle = document.getElementById('selectedLessonTitle');
    const selectedLessonSummary = document.getElementById('selectedLessonSummary');
    const selectedLessonEyebrow = document.getElementById('selectedLessonEyebrow');
    const selectedLessonActions = document.getElementById('selectedLessonActions');
    const selectedLessonPreviewLink = document.getElementById('selectedLessonPreviewLink');
    const teacherLessonKicker = document.getElementById('teacherLessonKicker');
    const teacherLessonTitle = document.getElementById('teacherLessonTitle');
    const teacherLessonGoal = document.getElementById('teacherLessonGoal');
    const teacherLiveControls = document.getElementById('teacherLiveControls');
    const teacherLessonSteps = document.getElementById('teacherLessonSteps');
    const teacherMetrics = document.getElementById('teacherMetrics');
    const teacherStudentBoard = document.getElementById('teacherStudentBoard');
    const teacherHomeOverview = document.getElementById('teacherHomeOverview');
    const teacherHomeChallenges = document.getElementById('teacherHomeChallenges');
    const teacherHomeCurrentLesson = document.getElementById('teacherHomeCurrentLesson');
    const teacherHomeWelcome = document.getElementById('teacherHomeWelcome');
    const teacherHomeClassName = document.getElementById('teacherHomeClassName');
    const teacherHomeActiveLesson = document.getElementById('teacherHomeActiveLesson');
    const teacherHomeMinecraftState = document.getElementById('teacherHomeMinecraftState');
    const teacherChallengeOverview = document.getElementById('teacherChallengeOverview');
    const teacherChallengeEyebrow = document.getElementById('teacherChallengeEyebrow');
    const teacherChallengeTitle = document.getElementById('teacherChallengeTitle');
    const teacherChallengeStory = document.getElementById('teacherChallengeStory');
    const teacherChallengeLessons = document.getElementById('teacherChallengeLessons');
    let current = null;

    function scoped(action) {
      return `/api/kugel/classes/${encodeURIComponent(classroomId)}${action}`;
    }

    function lessonLaunchPath(lessonId) {
      return Number(lessonId) === 0 ? scoped('/launch') : scoped(`/lessons/${encodeURIComponent(lessonId)}/launch`);
    }

    function teacherPageUrl(params = {}) {
      const next = new URLSearchParams();
      if (classroomId) next.set('classroomId', classroomId);
      if (params.lesson !== undefined) next.set('lesson', String(params.lesson));
      if (params.challenge !== undefined) next.set('challenge', String(params.challenge));
      const suffix = next.toString();
      return `kugel-teacher.html${suffix ? `?${suffix}` : ''}`;
    }

    function lessonChallengeId(lessonId) {
      const id = Number(lessonId);
      return id >= 1 ? Math.ceil(id / 4) : 0;
    }

    function resolveSelectedLesson(lessons, activeLessonId) {
      const requested = hasRequestedLesson && Number.isInteger(requestedLessonId) && requestedLessonId >= 0 && requestedLessonId <= 16
        ? requestedLessonId
        : 0;
      const fallback = activeLessonId >= 0 ? activeLessonId : 0;
      const selectedId = requested || fallback || 0;
      return lessons.find(lesson => Number(lesson.id) === selectedId) || lessons.find(lesson => Number(lesson.id) === 0) || lessons[0];
    }

    function currentChallenge(lessons) {
      if (!requestedChallengeId) return null;
      const challengeId = Math.min(4, Math.max(1, requestedChallengeId));
      const program = window.CRAFTOM_MINECRAFT_PROGRAM;
      const challenge = program?.challenges?.find(item => Number(item.id) === challengeId);
      const fallbackLessons = lessons.filter(lesson => lessonChallengeId(lesson.id) === challengeId);
      return {
        id: challengeId,
        title: challenge?.title || `אתגר ${challengeId}`,
        story: challenge?.story || 'בחרו את אחד השיעורים באתגר כדי לראות את לוח המורה, ההתקדמות וכפתור פתיחת Minecraft.',
        meetings: challenge?.meetings || fallbackLessons.map(lesson => [
          String(lesson.id),
          lesson.title || `שיעור ${lesson.id}`,
          lesson.summary || '',
          '',
        ]),
      };
    }

    function metric(id, value) {
      document.getElementById(id).textContent = String(value || 0);
    }

    async function teacherAction(path, payload, pendingText, doneText) {
      setStatus(status, pendingText);
      try {
        await api(path, payload);
        setStatus(status, doneText);
        await refresh();
      } catch (error) {
        setStatus(status, error.message, true);
      }
    }

    function renderStudent(student) {
      const card = node('article', undefined, `monitor-row ${student.connected ? 'is-connected' : 'is-offline'}`);
      const identity = node('div', undefined, 'student-identity');
      identity.append(node('strong', student.name), node('span', student.connected ? 'מחובר/ת' : 'לא מחובר/ת', 'connection-pill'));

      const progress = node('div', undefined, 'coin-progress');
      const lessonId = Number(current?.session?.lessonId || 0);
      const minecraftLabel = lessonId === 0
        ? `${student.coins || 0} / 8 מטבעות`
        : (student.minecraftStatus === 'completed' ? 'משימת Minecraft הושלמה' : (student.minecraftStatus === 'started' ? 'Minecraft בתהליך' : 'Minecraft לא התחיל'));
      progress.append(node('strong', minecraftLabel), node('span', student.minecraftStatus === 'completed' ? 'הושלם' : (student.startedAt ? 'בתהליך' : 'לא התחיל')));

      const learning = node('div', undefined, 'student-learning-status');
      const academyStatus = node('span', student.academyStatus === 'completed' ? 'אקדמיה הושלמה' : 'חסרה אקדמיה', `learning-pill ${student.academyStatus === 'completed' ? 'done' : 'missing'}`);
      const minecraftStatus = node('span', student.minecraftStatus === 'completed' ? 'Minecraft הושלם' : student.minecraftStatus === 'started' ? 'Minecraft בתהליך' : 'חסר Minecraft', `learning-pill ${student.minecraftStatus === 'completed' ? 'done' : student.minecraftStatus === 'started' ? 'started' : 'missing'}`);
      const exitStatus = node('span', student.submission ? 'כרטיס יציאה ותמונה הוגשו' : 'חסרה תמונה/כרטיס יציאה', `learning-pill ${student.submission ? 'done' : 'missing'}`);
      learning.append(academyStatus, minecraftStatus, exitStatus);

      const playerForm = node('form', undefined, 'student-message-input');
      const playerInput = document.createElement('input');
      playerInput.name = 'playerName';
      playerInput.placeholder = 'שם שחקן Minecraft';
      playerInput.value = student.minecraftPlayerName || '';
      playerInput.maxLength = 32;
      const savePlayer = node('button', 'שמירת שחקן', 'secondary-action');
      savePlayer.type = 'submit';
      playerForm.append(playerInput, savePlayer);
      playerForm.addEventListener('submit', async event => {
        event.preventDefault();
        await teacherAction(scoped(`/students/${encodeURIComponent(student.id)}/minecraft`), { playerName: playerInput.value }, 'שומרים את שם השחקן…', 'שם השחקן נשמר.');
      });

      const actions = node('div', undefined, 'student-row-actions');
      const messageInput = document.createElement('input');
      messageInput.placeholder = 'הודעה אישית';
      messageInput.value = drafts.get(student.id) || '';
      messageInput.addEventListener('input', () => drafts.set(student.id, messageInput.value));
      const send = node('button', 'שליחה', 'secondary-action');
      send.type = 'button';
      send.disabled = !student.minecraftPlayerName;
      send.addEventListener('click', async () => {
        await teacherAction(scoped('/message'), { scope: 'player', target: student.minecraftPlayerName, text: messageInput.value }, 'שולחים הודעה…', 'ההודעה נשלחה.');
        drafts.delete(student.id);
      });
      const freeze = node('button', 'עצירה', 'secondary-action danger-action');
      freeze.type = 'button';
      freeze.disabled = !student.minecraftPlayerName;
      freeze.addEventListener('click', () => teacherAction(scoped('/freeze'), { scope: 'player', target: student.minecraftPlayerName, on: true }, 'עוצרים את התלמיד/ה…', 'התלמיד/ה נעצר/ה.'));
      const release = node('button', 'שחרור', 'secondary-action');
      release.type = 'button';
      release.disabled = !student.minecraftPlayerName;
      release.addEventListener('click', () => teacherAction(scoped('/freeze'), { scope: 'player', target: student.minecraftPlayerName, on: false }, 'משחררים את התלמיד/ה…', 'התלמיד/ה שוחרר/ה.'));
      actions.append(messageInput, send, freeze, release);

      const submission = node('div', undefined, `student-submission ${student.submission ? 'has-submission' : 'is-missing'}`);
      if (student.submission) {
        const image = document.createElement('img');
        image.src = student.submission.photo.url;
        image.alt = `תמונת העבודה של ${student.name}`;
        const imageLink = document.createElement('a');
        imageLink.href = student.submission.photo.url;
        imageLink.target = '_blank';
        imageLink.rel = 'noopener';
        imageLink.append(image);
        const info = node('div');
        info.append(
          node('strong', `כרטיס יציאה - שיעור ${student.submission.lessonId}`),
          node('p', student.submission.exitAnswer || ''),
          node('small', `עודכן: ${formatDate(student.submission.updatedAt)}${student.submission.replaced ? ' • הוחלף אחרי ההגשה הראשונה' : ''}`),
        );
        submission.append(imageLink, info);
      } else {
        submission.append(node('strong', 'חסרה הגשה'), node('span', 'אין עדיין תמונה וכרטיס יציאה לשיעור הפעיל.'));
      }
      card.append(identity, progress, learning, submission, playerForm, actions);
      return card;
    }

    function renderTeacherHeader(selectedLesson, activeLessonId) {
      if (!teacherCourseHeaderNav) return;
      const selectedLessonId = Number(selectedLesson?.id ?? activeLessonId ?? 0);
      const activeChallengeFromUrl = requestedChallengeId || 0;
      const onTeacherHome = !hasRequestedLesson && !activeChallengeFromUrl;
      const items = [
        ['דף הבית', teacherPageUrl(), onTeacherHome],
        ['השיעור הנוכחי', teacherPageUrl({ lesson: activeLessonId || selectedLessonId || 0 }), hasRequestedLesson],
        ...[1, 2, 3, 4].map(challengeId => [
          `אתגר ${challengeId}`,
          teacherPageUrl({ challenge: challengeId }),
          activeChallengeFromUrl === challengeId,
        ]),
      ];
      teacherCourseHeaderNav.replaceChildren(...items.map(([label, href, active]) => {
        const link = node('a', label, active ? 'primary' : '');
        link.href = href;
        return link;
      }));
    }

    function minecraftStateLabel(session) {
      if (session.active && session.serverState === 'running') return 'פעיל';
      if (session.active && session.serverState === 'starting') return 'בהפעלה';
      if (session.serverState === 'error') return 'שגיאה';
      if (session.updatedAt) return 'הסתיים';
      return 'ממתין';
    }

    function renderTeacherHome(lessons, session, activeLessonId, data) {
      if (!teacherHomeOverview || !teacherHomeChallenges) return;
      const onTeacherHome = !hasRequestedLesson && !requestedChallengeId;
      teacherHomeOverview.hidden = !onTeacherHome;
      if (!onTeacherHome) {
        teacherHomeChallenges.replaceChildren();
        return;
      }
      const program = window.CRAFTOM_MINECRAFT_PROGRAM;
      const challengeCards = [1, 2, 3, 4].map(challengeId => {
        const challenge = program?.challenges?.find(item => Number(item.id) === challengeId);
        const challengeLessons = lessons.filter(lesson => lessonChallengeId(lesson.id) === challengeId);
        const card = node('article', undefined, 'minecraft-lesson-option teacher-home-challenge');
        const title = node('a', challenge?.title || `אתגר ${challengeId}`, 'minecraft-lesson-title-link');
        title.href = teacherPageUrl({ challenge: challengeId });
        card.append(node('span', `אתגר ${challengeId}`), title);
        card.append(node('small', challenge?.concept || `${challengeLessons.length} שיעורים לבחירה`));
        const lessonLinks = node('div', undefined, 'teacher-home-lesson-links');
        lessonLinks.append(...challengeLessons.map(lesson => {
          const link = node('a', String(lesson.id), Number(activeLessonId) === Number(lesson.id) ? 'active' : '');
          link.href = teacherPageUrl({ lesson: lesson.id });
          link.title = lesson.title || `שיעור ${lesson.id}`;
          return link;
        }));
        card.append(lessonLinks);
        return card;
      });
      const activeLesson = session.active
        ? lessons.find(lesson => Number(lesson.id) === Number(activeLessonId || 0)) || null
        : null;
      if (teacherHomeWelcome) teacherHomeWelcome.textContent = `ברוך הבא${data.teacher?.name ? `, ${data.teacher.name}` : ''}`;
      if (teacherHomeClassName) teacherHomeClassName.textContent = data.classroom?.name || 'כיתה';
      if (teacherHomeActiveLesson) teacherHomeActiveLesson.textContent = activeLesson ? (activeLesson.title || `שיעור ${activeLesson.id}`) : 'אין שיעור פעיל';
      if (teacherHomeMinecraftState) teacherHomeMinecraftState.textContent = minecraftStateLabel(session);
      if (teacherHomeCurrentLesson) {
        teacherHomeCurrentLesson.href = activeLesson ? teacherPageUrl({ lesson: activeLesson.id }) : '#teacherHomeChallenges';
        teacherHomeCurrentLesson.textContent = activeLesson ? `מעבר לשיעור ${activeLesson.id}` : 'בחירת שיעור';
      }
      teacherLessonKicker.textContent = 'דף הבית • ניהול אקדמיית ה-Agent';
      teacherLessonTitle.textContent = 'ניהול אקדמיית ה-Agent לכיתה';
      teacherLessonGoal.textContent = 'בחרו שיעור לפתיחה. הניהול המלא מופיע רק בתוך מסך השיעור.';
      teacherHomeChallenges.replaceChildren(...challengeCards);
    }

    function renderTeacherLessonActions(lesson, session, activeLessonId, minecraftBlocked) {
      const actionRow = node('div', undefined, 'minecraft-lesson-actions');
      const isActiveLesson = Boolean(session.active && activeLessonId === Number(lesson.id));
      const actionLabel = isActiveLesson ? `סיום שיעור ${lesson.id}` : (lesson.hasWorld ? `פתיחת Minecraft לשיעור ${lesson.id}` : 'חסר עולם Minecraft');
      const launch = node('button', actionLabel, `primary-action start-lesson-action${isActiveLesson ? ' end-lesson-action' : ''}${Number(lesson.id) === 1 ? ' lesson-one-action' : ''}`);
      launch.type = 'button';
      launch.disabled = minecraftBlocked || !lesson.hasWorld || session.serverState === 'starting';
      launch.title = !lesson.hasWorld
        ? 'צריך להגדיר עולם Minecraft אמיתי לשיעור הזה לפני שאפשר להפעיל אותו.'
        : (minecraftBlocked ? current?.minecraftSetupNote || '' : '');
      launch.classList.toggle('is-active-lesson', isActiveLesson);
      launch.addEventListener('click', () => teacherAction(
        isActiveLesson ? scoped('/stop') : lessonLaunchPath(lesson.id),
        {},
        isActiveLesson ? `מסיימים את שיעור ${lesson.id}…` : `מפעילים את עולם שיעור ${lesson.id}…`,
        isActiveLesson ? 'השיעור הסתיים והשרת שוחרר.' : `עולם שיעור ${lesson.id} פעיל.`
      ));
      actionRow.append(launch);
      if (Number(lesson.id) >= 1) {
        const link = node('a', `צפייה בדף שיעור ${lesson.id}`, 'secondary-action link-action teacher-next-lesson');
        link.href = `craftom-minecraft-lesson-${lesson.id}.html`;
        actionRow.append(link);
        const slides = node('a', 'מצגת מדריך', 'secondary-action link-action');
        slides.href = `craftom-minecraft-slides.html?challenge=${lesson.challengeId || Math.ceil(Number(lesson.id) / 4)}&lesson=${lesson.id}`;
        actionRow.append(slides);
      }
      return actionRow;
    }

    function renderSelectedLesson(lesson, session, activeLessonId, minecraftBlocked) {
      if (!lesson || !selectedLessonActions) return;
      const lessonId = Number(lesson.id);
      const challengeId = lessonChallengeId(lessonId);
      selectedLessonEyebrow.textContent = lessonId === 0 ? 'שיעור פתיחה' : `אתגר ${challengeId} • שיעור ${lessonId}`;
      selectedLessonTitle.textContent = lesson.title || `שיעור ${lessonId}`;
      selectedLessonSummary.textContent = lesson.summary || 'בודקים האם קיים עולם Minecraft מתאים לשיעור הזה.';
      teacherLessonKicker.textContent = lessonId === 0 ? 'שיעור 0 • תרגול פתיחה' : `אתגר ${challengeId} • שיעור ${lessonId}`;
      teacherLessonTitle.textContent = lesson.title || `שיעור ${lessonId}`;
      teacherLessonGoal.textContent = lesson.summary || 'האקדמיה ו־Minecraft זמינים במקביל לפי בחירת המורה.';
      if (selectedLessonPreviewLink) {
        selectedLessonPreviewLink.href = lessonId === 0 ? 'kugel-student.html' : `craftom-minecraft-lesson-${lessonId}.html`;
      }
      const actions = renderTeacherLessonActions(lesson, session, activeLessonId, minecraftBlocked);
      selectedLessonActions.replaceChildren(...actions.childNodes);
    }

    function renderTeacherLessonPicker(lesson, selectedLessonId) {
      const isSelectedLesson = Number(selectedLessonId) === Number(lesson.id);
      const card = node('article', undefined, `minecraft-lesson-option teacher-challenge-lesson${lesson.hasWorld ? '' : ' is-missing-world'}${isSelectedLesson ? ' is-selected-lesson' : ''}`);
      const title = node('a', lesson.title || `שיעור ${lesson.id}`, 'minecraft-lesson-title-link');
      title.href = teacherPageUrl({ lesson: lesson.id });
      card.append(title);
      card.append(node('span', lesson.summary || 'בודקים האם קיים עולם Minecraft מתאים לשיעור הזה.'));
      const choose = node('a', 'כניסה לשיעור', 'secondary-action link-action');
      choose.href = teacherPageUrl({ lesson: lesson.id });
      card.append(choose);
      return card;
    }

    function renderTeacherChallenge(challenge, lessons, selectedLessonId) {
      if (!teacherChallengeOverview || !teacherChallengeLessons) return;
      teacherChallengeOverview.hidden = !challenge;
      if (!challenge) {
        teacherChallengeLessons.replaceChildren();
        return;
      }
      const challengeLessons = lessons.filter(lesson => lessonChallengeId(lesson.id) === challenge.id);
      teacherChallengeEyebrow.textContent = `אתגר ${challenge.id} מתוך 4`;
      teacherChallengeTitle.textContent = challenge.title;
      teacherChallengeStory.textContent = challenge.story;
      teacherLessonKicker.textContent = `אתגר ${challenge.id} • בחירת שיעור`;
      teacherLessonTitle.textContent = challenge.title;
      teacherLessonGoal.textContent = challenge.story;
      teacherChallengeLessons.replaceChildren(...challengeLessons.map(lesson => renderTeacherLessonPicker(lesson, selectedLessonId)));
    }

    function render(data) {
      current = data;
      className.textContent = data.classroom.name;
      const session = data.session || {};
      const activeLessonId = Number(session.lessonId ?? 0);
      if (studentPreviewLink) {
        studentPreviewLink.href = activeLessonId === 0 ? 'kugel-student.html' : `craftom-minecraft-lesson-${activeLessonId}.html`;
      }
      const minecraftBlocked = data.minecraftConfigured === false;
      const lessons = data.lessons?.length ? data.lessons : [data.lesson].filter(Boolean);
      const selectedLesson = resolveSelectedLesson(lessons, activeLessonId);
      const selectedLessonId = Number(selectedLesson?.id ?? activeLessonId ?? 0);
      const challenge = currentChallenge(lessons);
      const showingChallengeOverview = Boolean(challenge && !hasRequestedLesson);
      const showingTeacherHome = !hasRequestedLesson && !requestedChallengeId;
      document.body.classList.toggle('is-teacher-lesson', !showingChallengeOverview && !showingTeacherHome);
      document.body.classList.toggle('is-teacher-home', showingTeacherHome);
      document.body.classList.toggle('is-teacher-challenge', showingChallengeOverview);
      renderTeacherHeader(selectedLesson, activeLessonId);
      renderTeacherHome(lessons, session, activeLessonId, data);
      renderTeacherChallenge(challenge, lessons, selectedLessonId);
      const showingLessonManagement = !showingChallengeOverview && !showingTeacherHome;
      if (selectedTeacherLesson) selectedTeacherLesson.hidden = showingChallengeOverview || showingTeacherHome;
      if (selectedTeacherLesson && !showingChallengeOverview && !showingTeacherHome) selectedTeacherLesson.hidden = false;
      if (!showingChallengeOverview && !showingTeacherHome) renderSelectedLesson(selectedLesson, session, activeLessonId, minecraftBlocked);
      [teacherLiveControls, teacherLessonSteps, teacherMetrics, teacherStudentBoard].forEach(section => {
        if (section) section.hidden = !showingLessonManagement;
      });
      document.getElementById('serverState').textContent = session.serverState === 'running' ? 'שרת פעיל' : session.serverState === 'error' ? 'שגיאת הפעלה' : 'שרת מוכן';
      const previewDetail = data.minecraftPreviewMode && session.active && session.serverDetail
        ? `${session.serverDetail} ${data.minecraftSetupNote}`
        : data.minecraftSetupNote;
      document.getElementById('serverDetail').textContent = data.minecraftConfigured === false || data.minecraftPreviewMode
        ? previewDetail
        : (session.serverDetail || '');
      document.getElementById('serverDot').classList.toggle('busy', session.serverState === 'starting');
      document.getElementById('serverDot').classList.toggle('error', data.minecraftConfigured === false || session.serverState === 'error');
      if (lessonList) lessonList.replaceChildren(...lessons.map(lesson => renderTeacherLessonPicker(lesson, selectedLessonId)));
      metric('metricConnected', data.metrics?.connected);
      metric('metricActive', data.metrics?.active);
      metric('metricDone', data.metrics?.completed);
      metric('metricAttention', data.metrics?.needsHelp);
      monitor.replaceChildren(...(data.students || []).map(renderStudent));
      if (!data.students?.length) monitor.append(node('p', 'עדיין אין תלמידים בכיתה.'));
    }

    async function refresh() {
      if (!classroomId) {
        setStatus(status, 'חסר מזהה כיתה. יש לפתוח את הלוח מתוך כרטיס הכיתה.', true);
        if (selectedTeacherLesson) selectedTeacherLesson.hidden = true;
        if (teacherHomeOverview) teacherHomeOverview.hidden = false;
        if (teacherChallengeOverview) teacherChallengeOverview.hidden = true;
        document.body.classList.remove('is-teacher-lesson', 'is-teacher-challenge');
        document.body.classList.add('is-teacher-home');
        [teacherLiveControls, teacherLessonSteps, teacherMetrics, teacherStudentBoard].forEach(section => {
          if (section) section.hidden = true;
        });
        teacherLessonKicker.textContent = 'דף הבית • ניהול אקדמיית ה-Agent';
        teacherLessonTitle.textContent = 'פותחים את הניהול מתוך כיתה';
        teacherLessonGoal.textContent = 'כדי לראות שיעור, לוח חי וכפתורי Minecraft צריך להיכנס דרך כרטיס הכיתה במסך הכיתות.';
        return;
      }
      try {
        render(await api(`/api/kugel/session?classroomId=${encodeURIComponent(classroomId)}`));
      } catch (error) {
        setStatus(status, error.message, true);
      }
    }

    document.getElementById('stopLesson')?.addEventListener('click', () => teacherAction(scoped('/stop'), {}, 'מסיימים את השיעור…', 'השיעור הסתיים והשרת שוחרר.'));
    document.getElementById('classMessageForm').addEventListener('submit', async event => {
      event.preventDefault();
      await teacherAction(scoped('/message'), { scope: 'all', text: classMessage.value }, 'שולחים לכיתה…', 'ההודעה נשלחה לכיתה.');
      classMessage.value = '';
    });
    document.getElementById('freezeAll').addEventListener('click', () => teacherAction(scoped('/freeze'), { scope: 'all', on: true }, 'עוצרים את הכיתה…', 'הכיתה נעצרה.'));
    document.getElementById('releaseAll').addEventListener('click', () => teacherAction(scoped('/freeze'), { scope: 'all', on: false }, 'משחררים את הכיתה…', 'הכיתה שוחררה.'));
    document.getElementById('refreshBoard').addEventListener('click', refresh);
    await refresh();
    setInterval(refresh, 5000);
  }

  if (page === 'student') initStudent();
  if (page === 'teacher') initTeacher();
})();
