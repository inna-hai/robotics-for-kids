(() => {
  const page = document.body.dataset.kugelPage;
  const query = new URLSearchParams(location.search);
  const classroomId = query.get('classroomId') || '';
  const hasRequestedLesson = query.has('lesson');
  const requestedLessonId = Number(query.get('lesson') || '');
  const requestedChallengeId = Number(query.get('challenge') || '');
  const teacherPagePath = 'agent-academy-teacher.html';
  const drafts = new Map();

  function canonicalizeTeacherUrl() {
    if (page !== 'teacher' || !location.pathname.endsWith('/kugel-teacher.html')) return;
    history.replaceState(null, '', `${teacherPagePath}${location.search}${location.hash}`);
  }

  function node(tag, text, className) {
    const element = document.createElement(tag);
    if (text !== undefined) element.textContent = text;
    if (className) element.className = className;
    return element;
  }

  function rootAssetPath(path) {
    if (!path || /^(?:https?:|data:|blob:|\/)/.test(path)) return path || '';
    return `/${path}`;
  }

  function craftomPosterPath(path) {
    const filename = String(path || '').split('/').pop();
    if (!filename || !filename.endsWith('.webp')) return rootAssetPath(path);
    return `/api/craftom/challenge-posters/${encodeURIComponent(filename)}`;
  }

  function setMediaSource(media, attribute, value) {
    if (!media || !value) return;
    if (media.getAttribute(attribute) !== value) media.setAttribute(attribute, value);
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

  function formatDuration(ms) {
    if (ms === null || ms === undefined) return 'אין עדיין';
    const value = Number(ms);
    if (!Number.isFinite(value) || value < 0) return 'אין עדיין';
    const totalSeconds = Math.round(value / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${String(seconds).padStart(2, '0')}`;
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
    const compoundEntryId = query.get('c') || query.get('compound') || '';
    let current = null;

    function renderTeacherReturnAction() {
      if (query.get('teacherReturn') !== '1') return;
      const next = new URLSearchParams();
      const returnClassroomId = query.get('classroomId');
      if (returnClassroomId) next.set('classroomId', returnClassroomId);
      next.set('lesson', '0');
      document.body.insertAdjacentHTML('afterbegin', `
        <div class="teacher-return-action" id="teacherReturnAction">
          <a class="btn secondary" href="${teacherPagePath}?${next.toString()}">חזרה לניהול שיעור מורה</a>
        </div>
      `);
    }

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
          ? 'שיעור 0 - אוספים 8 מטבעות במבוך'
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
      const isLessonZero = Number(data.lesson?.id ?? session.lessonId ?? 0) === 0;
      renderQaLessonSwitcher(data);
      sessionStatus.textContent = session.active
        ? (isLessonZero ? 'עולם Minecraft פעיל' : 'השיעור פתוח לכיתה')
        : (isLessonZero ? 'שיעור הפתיחה פתוח לתלמידים' : 'ממתין שהמורה תפתח גישה לשיעור');
      playerStatus.textContent = student.connected ? 'מחובר/ת' : 'לא מחובר/ת';
      identity.textContent = student.minecraftPlayerName
        ? `${student.name} • שחקן Minecraft: ${student.minecraftPlayerName}`
        : `${student.name || 'תלמיד/ה'} • המורה עדיין לא שייכה לך שם שחקן ב-Minecraft.`;
      minecraftDetails.textContent = minecraft && session.active
        ? `שרת: ${minecraft.serverName} • כתובת: ${minecraft.serverAddress} • Server ID: ${minecraft.serverId}`
        : (isLessonZero
          ? 'שיעור הפתיחה פתוח. פרטי Minecraft יוצגו לאחר שהמורה תפעיל את עולם התרגול ותשייך את שם השחקן.'
          : 'פרטי החיבור יוצגו לאחר שהמורה תפעיל את העולם ותשייך את שם השחקן.');
      document.getElementById('minecraftAccessCode').textContent = minecraft?.accessCode || 'יוצג לאחר הפעלת עולם Minecraft';
      coinProgress.textContent = `${student.coins || 0} מתוך 8 מטבעות · ניסיונות: ${Number(student.attemptCount || 0)} · זמן אחרון: ${formatDuration(student.lastDurationMs)} · שיא: ${formatDuration(student.bestTimeMs)}`;
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
      const lessonOneOpen = Boolean(data.lessonAccess?.openedLessonIds?.map(Number).includes(1));
      continueCourse.hidden = !(student.completionRecorded || lessonOneOpen);
      continueCourse.textContent = lessonOneOpen ? 'המשך לשיעור 1' : 'המשך לשיעור 1 אחרי בדיקת סיום';
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

    async function enterFromCompoundLink() {
      if (!compoundEntryId) return false;
      setStatus(message, 'מזהים את התלמיד/ה לפי החלקה במשחק…');
      try {
        render(await api('/api/kugel/compound-entry', { compoundId: compoundEntryId }));
        setStatus(message, '');
        const cleanUrl = new URL(location.href);
        cleanUrl.searchParams.delete('c');
        cleanUrl.searchParams.delete('compound');
        history.replaceState(null, '', cleanUrl);
        return true;
      } catch (error) {
        setStatus(message, error.message, true);
        launch.disabled = true;
        reset.disabled = true;
        finish.disabled = true;
        return true;
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

    renderTeacherReturnAction();
    if (!await enterFromCompoundLink()) await refresh();
    setInterval(refresh, 5000);
  }

  async function initTeacher() {
    const status = document.getElementById('teacherStatus');
    const monitor = document.getElementById('studentMonitor');
    const className = document.getElementById('teacherClassName');
    const classMessage = document.querySelector('#classMessageForm input[name="text"]');
    const lessonList = document.getElementById('minecraftLessonList');
    const teacherCourseHeaderNav = document.getElementById('teacherCourseHeaderNav');
    const selectedTeacherLesson = document.getElementById('selectedTeacherLesson');
    const selectedLessonTitle = document.getElementById('selectedLessonTitle');
    const selectedLessonSummary = document.getElementById('selectedLessonSummary');
    const selectedLessonEyebrow = document.getElementById('selectedLessonEyebrow');
    const selectedLessonActions = document.getElementById('selectedLessonActions');
    const teacherLessonKicker = document.getElementById('teacherLessonKicker');
    const teacherLessonTitle = document.getElementById('teacherLessonTitle');
    const teacherLessonGoal = document.getElementById('teacherLessonGoal');
    const teacherHomeLessonPickerLink = document.getElementById('teacherHomeLessonPickerLink');
    const teacherLiveControls = document.getElementById('teacherLiveControls');
    const teacherLessonSteps = document.getElementById('teacherLessonSteps');
    const teacherMetrics = document.getElementById('teacherMetrics');
    const teacherStudentBoard = document.getElementById('teacherStudentBoard');
    const teacherHomeOverview = document.getElementById('teacherHomeOverview');
    const teacherHomeChallenges = document.getElementById('teacherHomeChallenges');
    const teacherProgramVideoPreview = document.getElementById('teacherProgramVideoPreview');
    const teacherChallengeOverview = document.getElementById('teacherChallengeOverview');
    const teacherChallengeEyebrow = document.getElementById('teacherChallengeEyebrow');
    const teacherChallengeTitle = document.getElementById('teacherChallengeTitle');
    const teacherChallengeStory = document.getElementById('teacherChallengeStory');
    const teacherChallengeVideoPreview = document.getElementById('teacherChallengeVideoPreview');
    const teacherChallengeLessons = document.getElementById('teacherChallengeLessons');
    const teacherLogout = document.getElementById('kugel-teacher-logout');
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
      return `${teacherPagePath}${suffix ? `?${suffix}` : ''}`;
    }

    function teacherReturnQuery(lessonId) {
      const next = new URLSearchParams();
      next.set('teacherReturn', '1');
      next.set('lesson', String(lessonId));
      if (classroomId) next.set('classroomId', classroomId);
      return next.toString();
    }

    function studentPreviewUrl(lessonId) {
      const suffix = teacherReturnQuery(lessonId);
      return Number(lessonId) === 0 ? `kugel-student.html?${suffix}` : `craftom-minecraft-lesson-${lessonId}.html?${suffix}`;
    }

    function lessonChallengeId(lessonId) {
      const id = Number(lessonId);
      return id >= 1 ? Math.ceil(id / 4) : 0;
    }

    function lessonZeroOverview() {
      return {
        id: 0,
        challengeId: 0,
        title: 'שיעור פתיחה: אוספים 8 מטבעות במבוך',
        summary: 'משימת פתיחה ב-Minecraft: נכנסים למבוך, אוספים 8 מטבעות ולוחצים על כפתור הסיום.',
        deliverable: 'איסוף 8 מטבעות וסיום המבוך',
        hasWorld: true,
      };
    }

    function withLessonZero(lessons) {
      const items = Array.isArray(lessons) ? lessons.filter(Boolean) : [];
      if (items.some(lesson => Number(lesson.id) === 0)) return items;
      return [lessonZeroOverview(), ...items];
    }

    function teacherProgramLessons() {
      return withLessonZero(window.CRAFTOM_MINECRAFT_PROGRAM?.lessons || []);
    }

    function renderTeacherVideoPreview(src, poster, label, frame = node('div', undefined, 'teacher-video-preview')) {
      frame.classList.add('teacher-video-preview');
      const videoUrl = rootAssetPath(src);
      const posterUrl = craftomPosterPath(poster);
      if (frame.dataset.videoSrc === videoUrl && frame.querySelector('video.challenge-video')) return frame;
      frame.replaceChildren();
      const video = node('video', undefined, 'challenge-video');
      setMediaSource(video, 'src', videoUrl);
      if (posterUrl) setMediaSource(video, 'poster', posterUrl);
      video.controls = true;
      video.preload = 'metadata';
      video.playsInline = true;
      video.setAttribute('aria-label', label);
      frame.dataset.videoSrc = videoUrl;
      frame.append(video);
      return frame;
    }

    function resolveSelectedLesson(lessons, activeLessonId) {
      const requested = hasRequestedLesson && Number.isInteger(requestedLessonId) && requestedLessonId >= 0 && requestedLessonId <= 16
        ? requestedLessonId
        : 0;
      const fallback = activeLessonId >= 0 ? activeLessonId : 0;
      const selectedId = hasRequestedLesson ? requested : (fallback || 0);
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
        concept: challenge?.concept || '',
        story: challenge?.story || 'בחרו את אחד השיעורים באתגר כדי לראות את לוח המורה, ההתקדמות וכפתור פתיחת הגישה לתלמידים.',
        video: challenge?.video || '',
        poster: challenge?.poster || '',
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

    function lessonAccessInfo(lessonId) {
      return current?.lessonAccess?.lessons?.find(item => Number(item.id) === Number(lessonId)) || {
        id: Number(lessonId),
        open: Number(lessonId) === 0,
        nextToOpen: false,
      };
    }

    function lessonAccessText(lessonId) {
      const access = lessonAccessInfo(lessonId);
      if (Number(lessonId) === 0) return 'פתוח כברירת מחדל';
      if (access.open) return 'פתוח לתלמידים';
      if (access.nextToOpen) return 'הבא לפתיחה';
      return 'נעול לתלמידים';
    }

    function openLessonButton(lessonId, label = 'פתיחה לתלמידים') {
      const access = lessonAccessInfo(lessonId);
      if (Number(lessonId) === 0 || access.open || !access.nextToOpen) return null;
      const button = node('button', label, 'btn open-next-lesson-action');
      button.type = 'button';
      button.addEventListener('click', () => teacherAction(
        scoped(`/lessons/${encodeURIComponent(lessonId)}/open`),
        {},
        `פותחים את שיעור ${lessonId} לתלמידים…`,
        `שיעור ${lessonId} פתוח עכשיו לתלמידים.`
      ));
      return button;
    }

    function liveMinecraftControlsAvailable() {
      const session = current?.session || {};
      return Boolean(current?.minecraftConfigured && session.active && session.serverState === 'running');
    }

    function renderStudent(student) {
      const liveMinecraft = liveMinecraftControlsAvailable();
      const card = node('article', undefined, `monitor-row ${liveMinecraft ? (student.connected ? 'is-connected' : 'is-offline') : 'is-static'}`);
      const identity = node('div', undefined, 'student-identity');
      identity.append(node('strong', student.name));
      if (student.minecraftPlayerName) identity.append(node('span', `שחקן Minecraft: ${student.minecraftPlayerName}`, 'student-player-name'));
      if (liveMinecraft) {
        identity.append(node('span', student.connected ? 'מחובר/ת' : 'לא מחובר/ת', 'connection-pill'));
      }

      const learning = node('div', undefined, 'student-learning-status');
      if (student.academyStatus === 'completed') learning.append(node('span', 'אקדמיה הושלמה', 'learning-pill done'));
      if (student.minecraftStatus === 'completed') learning.append(node('span', 'Minecraft הושלם', 'learning-pill done'));
      if (student.minecraftStatus === 'started') learning.append(node('span', 'Minecraft בתהליך', 'learning-pill started'));
      if (student.submission) learning.append(node('span', 'כרטיס יציאה ותמונה הוגשו', 'learning-pill done'));
      if (!learning.childElementCount) learning.append(node('span', 'עוד אין התקדמות לשיעור הזה', 'learning-pill neutral'));

      const liveBlocks = [];
      if (liveMinecraft) {
        const progress = node('div', undefined, 'coin-progress');
        const lessonId = Number(current?.trackedLessonId ?? current?.session?.lessonId ?? 0);
        if (lessonId === 0) {
          progress.append(
            node('strong', `${student.coins || 0} / 8 מטבעות`),
            node('span', student.minecraftStatus === 'completed' ? 'הושלם' : (student.minecraftStatus === 'started' ? 'בתהליך' : 'לא התחיל')),
            node('span', `ניסיונות: ${Number(student.attemptCount || 0)}`),
            node('span', `משך אחרון: ${formatDuration(student.lastDurationMs)}`),
            node('span', `שיא: ${formatDuration(student.bestTimeMs)}`),
          );
        } else {
          const minecraftLabel = student.minecraftStatus === 'completed' ? 'משימת Minecraft הושלמה' : (student.minecraftStatus === 'started' ? 'Minecraft בתהליך' : 'Minecraft לא התחיל');
          progress.append(node('strong', minecraftLabel), node('span', student.minecraftStatus === 'completed' ? 'הושלם' : (student.minecraftStatus === 'started' ? 'בתהליך' : 'לא התחיל')));
        }
        liveBlocks.push(progress);

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
        freeze.addEventListener('click', () => teacherAction(scoped('/freeze'), { scope: 'player', target: student.minecraftPlayerName, on: true }, 'עוצרים את התלמיד…', 'התלמיד נעצר.'));
        const release = node('button', 'שחרור', 'secondary-action');
        release.type = 'button';
        release.disabled = !student.minecraftPlayerName;
        release.addEventListener('click', () => teacherAction(scoped('/freeze'), { scope: 'player', target: student.minecraftPlayerName, on: false }, 'משחררים את התלמיד…', 'התלמיד שוחרר.'));
        actions.append(messageInput, send, freeze, release);
        liveBlocks.push(actions);
      }

      const submission = student.submission ? node('div', undefined, 'student-submission has-submission') : null;
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
      }
      card.append(identity, ...liveBlocks.slice(0, 1), learning, ...(submission ? [submission] : []), ...liveBlocks.slice(1));
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
        delete teacherHomeChallenges.dataset.rendered;
        return;
      }
      const program = window.CRAFTOM_MINECRAFT_PROGRAM;
      if (!teacherHomeChallenges.dataset.rendered) {
        const lessonZero = lessons.find(lesson => Number(lesson.id) === 0) || lessonZeroOverview();
        const zeroCard = node('article', undefined, 'card lesson-card teacher-home-challenge teacher-home-zero');
        zeroCard.append(node('span', 'שיעור 0 • לפני אתגר 1', 'tag'));
        const zeroHeading = node('h2');
        const zeroLink = node('a', lessonZero.title || 'שיעור פתיחה', 'minecraft-lesson-title-link');
        zeroLink.href = teacherPageUrl({ lesson: 0 });
        zeroLink.dataset.lessonId = '0';
        zeroHeading.append(zeroLink);
        zeroCard.append(zeroHeading);
        zeroCard.append(node('span', lessonAccessText(0), 'lesson-access-badge is-open'));
        zeroCard.append(node('p', lessonZero.summary || 'משימת פתיחה קצרה לפני שיעור 1.'));
        const zeroList = node('ul', undefined, 'meeting-list');
        const zeroItem = node('li');
        const zeroItemLink = node('a', 'שיעור 0: אוספים 8 מטבעות במבוך');
        zeroItemLink.href = teacherPageUrl({ lesson: 0 });
        zeroItemLink.dataset.lessonId = '0';
        const zeroLead = node('b');
        zeroLead.append(zeroItemLink);
        const zeroBadge = node('span', lessonAccessText(0), 'lesson-access-badge is-open');
        zeroBadge.dataset.accessLessonId = '0';
        zeroItem.append(
          zeroLead,
          zeroBadge,
          document.createElement('br'),
          document.createTextNode('פתוח כברירת מחדל לתלמידים, כדי להתחיל מהתמצאות קצרה לפני שיעור 1.'),
        );
        zeroList.append(zeroItem);
        const zeroActions = node('div', undefined, 'challenge-actions');
        const zeroManage = node('a', 'ניהול שיעור 0', 'btn');
        zeroManage.href = teacherPageUrl({ lesson: 0 });
        const zeroPreview = node('a', 'צפייה כתלמיד', 'btn secondary');
        zeroPreview.href = studentPreviewUrl(0);
        zeroActions.append(zeroManage, zeroPreview);
        zeroCard.append(zeroList, zeroActions);
        const challengeCards = [1, 2, 3, 4].map(challengeId => {
          const challenge = program?.challenges?.find(item => Number(item.id) === challengeId);
          const challengeLessons = lessons.filter(lesson => lessonChallengeId(lesson.id) === challengeId);
          const firstLesson = challengeLessons[0]?.id;
          const lastLesson = challengeLessons[challengeLessons.length - 1]?.id;
          const lessonRange = firstLesson && lastLesson ? `שיעורים ${firstLesson}-${lastLesson}` : `${challengeLessons.length} שיעורים לבחירה`;
          const card = node('article', undefined, 'card lesson-card teacher-home-challenge');
          if (challenge?.video) card.append(renderTeacherVideoPreview(
            challenge.video,
            challenge.poster,
            `סרטון הסבר לאתגר ${challengeId}: ${challenge.title || ''}`,
          ));
          card.append(node('span', `אתגר ${challengeId} • ${challenge?.concept || lessonRange}`, 'tag'));
          card.append(node('h2', challenge?.title || `אתגר ${challengeId}`));
          card.append(node('p', challenge?.story || 'בחר שיעור כדי לפתוח את מסך הניהול המלא שלו.'));
          const meetingList = node('ul', undefined, 'meeting-list');
          meetingList.append(...challengeLessons.map((lesson, index) => {
            const meeting = challenge?.meetings?.[index];
            const item = node('li');
            const link = node('a', `שיעור ${lesson.id}: ${meeting?.[1] || lesson.title || 'ניהול שיעור'}`);
            link.href = teacherPageUrl({ lesson: lesson.id });
            link.title = lesson.title || `שיעור ${lesson.id}`;
            link.dataset.lessonId = String(lesson.id);
            const lead = node('b');
            lead.append(link);
            const accessBadge = node('span', lessonAccessText(lesson.id), 'lesson-access-badge');
            accessBadge.dataset.accessLessonId = String(lesson.id);
            const lessonActions = node('div', undefined, 'lesson-access-actions');
            lessonActions.dataset.openActionsLessonId = String(lesson.id);
            const manageButton = node('a', `ניהול שיעור ${lesson.id}`, 'btn secondary lesson-manage-action');
            manageButton.href = teacherPageUrl({ lesson: lesson.id });
            const openButton = openLessonButton(lesson.id, `פתיחת שיעור ${lesson.id} לתלמידים`);
            lessonActions.append(manageButton);
            if (openButton) lessonActions.append(openButton);
            item.append(
              lead,
              accessBadge,
              document.createElement('br'),
              document.createTextNode(meeting?.[3] || 'כניסה לניהול השיעור, תצוגת תלמיד ומעקב אחרי הכיתה.'),
              lessonActions,
            );
            return item;
          }));
          const actions = node('div', undefined, 'challenge-actions');
          const challengeLink = node('a', 'כניסה לאתגר', 'btn');
          challengeLink.href = teacherPageUrl({ challenge: challengeId });
          actions.append(challengeLink);
          card.append(meetingList, actions);
          return card;
        });
        const challengeSequence = [zeroCard];
        challengeCards.forEach((card, index) => {
          const divider = node('div', `אתגר ${index + 1}`, 'teacher-home-challenge-divider');
          divider.setAttribute('aria-hidden', 'true');
          challengeSequence.push(divider, card);
        });
        teacherHomeChallenges.replaceChildren(...challengeSequence);
        teacherHomeChallenges.dataset.rendered = 'true';
      }
      teacherHomeChallenges.querySelectorAll('[data-lesson-id]').forEach(link => {
        const lessonId = Number(link.dataset.lessonId);
        link.classList.toggle('active', lessonId === Number(activeLessonId));
        const access = lessonAccessInfo(lessonId);
        link.classList.toggle('is-open-to-students', Boolean(access.open));
        link.classList.toggle('is-next-to-open', Boolean(access.nextToOpen));
      });
      teacherHomeChallenges.querySelectorAll('[data-access-lesson-id]').forEach(badge => {
        const lessonId = Number(badge.dataset.accessLessonId);
        const access = lessonAccessInfo(lessonId);
        badge.textContent = lessonAccessText(lessonId);
        badge.classList.toggle('is-open', Boolean(access.open));
        badge.classList.toggle('is-next', Boolean(access.nextToOpen));
      });
      teacherHomeChallenges.querySelectorAll('[data-open-actions-lesson-id]').forEach(container => {
        const lessonId = Number(container.dataset.openActionsLessonId);
        const manageButton = node('a', `ניהול שיעור ${lessonId}`, 'btn secondary lesson-manage-action');
        manageButton.href = teacherPageUrl({ lesson: lessonId });
        const button = openLessonButton(lessonId, `פתיחת שיעור ${lessonId} לתלמידים`);
        container.replaceChildren(manageButton, ...(button ? [button] : []));
      });
      if (teacherProgramVideoPreview && program?.overviewVideo && !teacherProgramVideoPreview.dataset.rendered) {
        renderTeacherVideoPreview(
          program.overviewVideo,
          program.overviewPoster,
          'סרטון הסבר על אקדמיית ה-Agent במיינקראפט',
          teacherProgramVideoPreview,
        );
        teacherProgramVideoPreview.dataset.rendered = 'true';
      }
      teacherLessonKicker.textContent = 'אקדמיית ה-Agent • מסך מורה';
      teacherLessonTitle.textContent = 'ניהול אקדמיית ה-Agent';
      teacherLessonGoal.textContent = 'בחרו שיעור לפתיחה מהרשימה למטה.';
    }

    function renderTeacherLessonActions(lesson, session, activeLessonId, minecraftBlocked) {
      const actionRow = node('div', undefined, 'minecraft-lesson-actions');
      const lessonId = Number(lesson.id);
      const isLessonZero = lessonId === 0;
      const isActiveLesson = Boolean(session.active && activeLessonId === lessonId);
      const actionLabel = isActiveLesson
        ? (isLessonZero ? 'סגירת עולם Minecraft לשיעור הפתיחה' : `סגירת עולם Minecraft לשיעור ${lesson.id}`)
        : (lesson.hasWorld ? (isLessonZero ? 'הפעלת עולם Minecraft לשיעור הפתיחה' : `הפעלת עולם Minecraft לשיעור ${lesson.id}`) : 'חסר עולם Minecraft');
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
        isActiveLesson
          ? (isLessonZero ? 'סוגרים את עולם Minecraft לשיעור הפתיחה…' : `סוגרים את עולם Minecraft לשיעור ${lesson.id}…`)
          : (isLessonZero ? 'מפעילים את עולם Minecraft לשיעור הפתיחה…' : `מפעילים את עולם Minecraft לשיעור ${lesson.id}…`),
        isActiveLesson
          ? (isLessonZero ? 'עולם Minecraft לשיעור הפתיחה נסגר.' : `עולם Minecraft לשיעור ${lesson.id} נסגר.`)
          : (isLessonZero ? 'עולם Minecraft לשיעור הפתיחה פעיל.' : `עולם Minecraft לשיעור ${lesson.id} פעיל.`)
      ));
      if (liveMinecraftControlsAvailable()) actionRow.append(launch);
      if (Number(lesson.id) >= 1) {
        const link = node('a', 'תצוגת תלמיד', 'secondary-action link-action teacher-next-lesson');
        link.href = studentPreviewUrl(lesson.id);
        actionRow.append(link);
        const slides = node('a', 'מצגת מדריך', 'secondary-action link-action');
        slides.href = `craftom-minecraft-slides.html?challenge=${lesson.challengeId || Math.ceil(Number(lesson.id) / 4)}&${teacherReturnQuery(lesson.id)}`;
        actionRow.append(slides);
      }
      return actionRow;
    }

    function renderSelectedLesson(lesson, session, activeLessonId, minecraftBlocked) {
      if (!lesson || !selectedLessonActions) return;
      const lessonId = Number(lesson.id);
      const challengeId = lessonChallengeId(lessonId);
      selectedLessonEyebrow.textContent = lessonId === 0 ? 'שיעור פתיחה' : `אתגר ${challengeId} • שיעור ${lessonId}`;
      selectedLessonTitle.textContent = `פעולות לשיעור ${lessonId}`;
      selectedLessonSummary.textContent = 'פתחו גישה לתלמידים, בדקו איך השיעור נראה לתלמידים או עברו למצגת המדריך.';
      teacherLessonKicker.textContent = lessonId === 0 ? 'שיעור 0 • משימת פתיחה' : `אתגר ${challengeId} • שיעור ${lessonId}`;
      teacherLessonTitle.textContent = lesson.title || `שיעור ${lessonId}`;
      teacherLessonGoal.textContent = lesson.summary || 'מסך ניהול קצר לשיעור: פתיחת גישה, צפייה כתלמיד ומצגת מדריך.';
      const actions = renderTeacherLessonActions(lesson, session, activeLessonId, minecraftBlocked);
      const openButton = openLessonButton(lessonId, `פתיחת שיעור ${lessonId} לתלמידים`);
      if (openButton) actions.prepend(openButton);
      selectedLessonActions.replaceChildren(...actions.childNodes);
    }

    function renderTeacherLessonPicker(lesson, selectedLessonId) {
      const isSelectedLesson = Number(selectedLessonId) === Number(lesson.id);
      const card = node('article', undefined, `card lesson-card teacher-challenge-lesson${lesson.hasWorld ? '' : ' is-missing-world'}${isSelectedLesson ? ' is-selected-lesson' : ''}`);
      card.append(node('span', `שיעור ${lesson.id}`, 'tag'));
      const title = node('a', lesson.title || `שיעור ${lesson.id}`, 'minecraft-lesson-title-link');
      title.href = teacherPageUrl({ lesson: lesson.id });
      const heading = node('h2');
      heading.append(title);
      card.append(heading);
      card.append(node('span', lessonAccessText(lesson.id), `lesson-access-badge ${lessonAccessInfo(lesson.id).open ? 'is-open' : ''}${lessonAccessInfo(lesson.id).nextToOpen ? ' is-next' : ''}`));
      card.append(node('p', lesson.summary || 'בודקים האם קיים עולם Minecraft מתאים לשיעור הזה.'));
      const actions = node('div', undefined, 'challenge-actions');
      const choose = node('a', 'כניסה לשיעור', 'btn');
      choose.href = teacherPageUrl({ lesson: lesson.id });
      const preview = node('a', 'תצוגת תלמיד', 'btn secondary');
      preview.href = studentPreviewUrl(lesson.id);
      const openButton = openLessonButton(lesson.id, 'פתיחה לתלמידים');
      actions.append(choose, preview, ...(openButton ? [openButton] : []));
      card.append(actions);
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
      if (teacherChallengeVideoPreview) {
        renderTeacherVideoPreview(
          challenge.video,
          challenge.poster,
          `סרטון הסבר לאתגר ${challenge.id}: ${challenge.title || ''}`,
          teacherChallengeVideoPreview,
        );
      }
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
      const minecraftBlocked = data.minecraftConfigured === false;
      const lessons = withLessonZero(data.lessons?.length ? data.lessons : [data.lesson].filter(Boolean));
      const selectedLesson = resolveSelectedLesson(lessons, activeLessonId);
      const selectedLessonId = Number(selectedLesson?.id ?? activeLessonId ?? 0);
      const challenge = currentChallenge(lessons);
      const showingChallengeOverview = Boolean(challenge && !hasRequestedLesson);
      const showingTeacherHome = !hasRequestedLesson && !requestedChallengeId;
      document.body.classList.toggle('is-teacher-lesson', !showingChallengeOverview && !showingTeacherHome);
      document.body.classList.toggle('is-teacher-home', showingTeacherHome);
      document.body.classList.toggle('is-teacher-challenge', showingChallengeOverview);
      document.body.classList.toggle('is-lesson-zero', !showingChallengeOverview && !showingTeacherHome && selectedLessonId === 0);
      if (teacherHomeLessonPickerLink) teacherHomeLessonPickerLink.hidden = !showingTeacherHome;
      renderTeacherHeader(selectedLesson, activeLessonId);
      renderTeacherHome(lessons, session, activeLessonId, data);
      renderTeacherChallenge(challenge, lessons, selectedLessonId);
      const showingLessonManagement = !showingChallengeOverview && !showingTeacherHome;
      if (selectedTeacherLesson) selectedTeacherLesson.hidden = showingChallengeOverview || showingTeacherHome;
      if (selectedTeacherLesson && !showingChallengeOverview && !showingTeacherHome) selectedTeacherLesson.hidden = false;
      if (!showingChallengeOverview && !showingTeacherHome) renderSelectedLesson(selectedLesson, session, activeLessonId, minecraftBlocked);
      const liveMinecraft = liveMinecraftControlsAvailable();
      if (teacherLessonSteps) teacherLessonSteps.hidden = !showingLessonManagement || !liveMinecraft;
      if (teacherStudentBoard) teacherStudentBoard.hidden = !showingLessonManagement;
      if (teacherLiveControls) teacherLiveControls.hidden = !showingLessonManagement || !liveMinecraft;
      if (teacherMetrics) teacherMetrics.hidden = !showingLessonManagement || !liveMinecraft;
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
        render({
          classroom: { name: 'כיתה' },
          session: {},
          lessons: teacherProgramLessons(),
          students: [],
          metrics: {},
          minecraftConfigured: false,
          minecraftSetupNote: 'כדי לפתוח Minecraft ולראות לוח חי צריך להיכנס מתוך כרטיס כיתה.',
        });
        return;
      }
      try {
        const lessonFilter = hasRequestedLesson ? `&lessonId=${encodeURIComponent(String(requestedLessonId))}` : '';
        render(await api(`/api/kugel/session?classroomId=${encodeURIComponent(classroomId)}${lessonFilter}`));
      } catch (error) {
        setStatus(status, error.message, true);
        render({
          classroom: { name: 'כיתה' },
          session: {},
          lessons: teacherProgramLessons(),
          students: [],
          metrics: {},
          minecraftConfigured: false,
          minecraftSetupNote: 'לא הצלחנו לטעון את הכיתה, אבל אפשר עדיין לראות את מבנה האתגרים.',
        });
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
    teacherLogout?.addEventListener('click', async () => {
      teacherLogout.disabled = true;
      setStatus(status, 'מתנתקים…');
      try {
        await api('/api/classroom/logout', {});
      } catch (error) {
        // Still leave the local screen; the server may already have cleared the session.
      } finally {
        location.href = 'classroom-entry.html';
      }
    });
    await refresh();
    setInterval(refresh, 5000);
  }

  canonicalizeTeacherUrl();
  if (page === 'student') initStudent();
  if (page === 'teacher') initTeacher();
})();
