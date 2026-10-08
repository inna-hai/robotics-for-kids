(() => {
  const page = document.body.dataset.kugelPage;
  const query = new URLSearchParams(location.search);
  let classroomId = query.get('classroomId') || '';
  const hasRequestedLesson = query.has('lesson');
  const requestedLessonId = Number(query.get('lesson') || '');
  const requestedChallengeId = Number(query.get('challenge') || '');
  const teacherPagePath = 'agent-academy-teacher.html';
  const TEACHER_REFRESH_MS = 30000;
  const TEACHER_BACKGROUND_REFRESH_MS = 120000;
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
    const finish = document.getElementById('finishLesson');
    const continueCourse = document.getElementById('continueCourse');
    const coinProgress = document.getElementById('coinProgress');
    const progressStrip = document.getElementById('studentProgressStrip');
    const qaLessonSwitcher = document.getElementById('qaLessonSwitcher');
    const qaLessonGrid = document.getElementById('qaLessonGrid');
    const compoundEntryId = query.get('c') || query.get('compound') || '';
    let current = null;

    function renderStudentWorldMode(data) {
      const buildMode = data.worldMode === 'build' || data.session?.worldMode === 'build';
      document.body.classList.toggle('is-build-mode', buildMode);
      const heroTitle = document.querySelector('.student-hero h2');
      const heroGoal = document.querySelector('.student-hero .goal');
      const mazePreview = document.querySelector('.student-hero .maze-preview');
      const missionCard = document.querySelector('.mission-card');
      const videoCard = document.querySelector('.lesson-zero-video-card');
      const progressPanel = coinProgress?.closest('.panel');
      if (heroTitle) heroTitle.textContent = buildMode ? 'שיעור בנייה: עובדים במתחם האישי' : 'שיעור פתיחה: מבוך המטבעות';
      if (heroGoal) heroGoal.textContent = buildMode
        ? 'היכנסו ל-Minecraft ובנו במתחם שלכם לפי המשימה של השיעור.'
        : 'אספו את כל 8 המטבעות, לחצו על סיום, ונסו לשפר את הזמן האישי שלכם.';
      if (mazePreview) mazePreview.hidden = buildMode;
      if (videoCard) videoCard.hidden = buildMode;
      if (progressPanel) progressPanel.hidden = buildMode;
      if (finish) finish.hidden = buildMode;
      if (missionCard && missionCard.dataset.mode !== (buildMode ? 'build' : 'maze')) {
        missionCard.dataset.mode = buildMode ? 'build' : 'maze';
        if (buildMode) {
          missionCard.replaceChildren(
            node('h3', 'משימת השיעור'),
            node('p', 'היכנסו ל-Minecraft ובנו במתחם שלכם לפי המשימה. אין בשיעור הזה מטבעות, שיאים או ניסיונות.'),
          );
        } else {
          const list = node('ol', undefined, 'lesson-zero-checklist');
          ['פותחים את Minecraft.', 'נכנסים לעולם המבוך.', 'אוספים 8 מטבעות.', 'לוחצים סיום כדי לשמור זמן.']
            .forEach(text => list.append(node('li', text)));
          missionCard.replaceChildren(node('h3', 'מה עושים?'), list);
        }
      }
    }

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
      const buildMode = data.worldMode === 'build' || session.worldMode === 'build';
      renderStudentWorldMode(data);
      renderQaLessonSwitcher(data);
      sessionStatus.textContent = session.active
        ? (buildMode ? 'עולם בנייה פעיל' : (isLessonZero ? 'עולם Minecraft פעיל' : 'השיעור פתוח לכיתה'))
        : (buildMode ? 'ממתינים לפתיחת עולם הבנייה' : (isLessonZero ? 'שיעור הפתיחה פתוח לתלמידים' : 'ממתין שהמורה תפתח גישה לשיעור'));
      playerStatus.textContent = student.connected ? 'מחובר/ת' : 'לא מחובר/ת';
      identity.textContent = student.minecraftPlayerName
        ? `${student.name} • שחקן Minecraft: ${student.minecraftPlayerName}`
        : `${student.name || 'תלמיד/ה'} • המורה עדיין לא שייכה לך שם שחקן ב-Minecraft.`;
      if (minecraft && session.active) {
        const serverParts = [`שרת: ${minecraft.serverName}`, `כתובת: ${minecraft.serverAddress}`];
        if (minecraft.serverId) serverParts.push(`Server ID: ${minecraft.serverId}`);
        minecraftDetails.textContent = serverParts.join(' • ');
      } else {
        minecraftDetails.textContent = isLessonZero
          ? 'שיעור הפתיחה פתוח. פרטי Minecraft יוצגו לאחר שהמורה תפעיל את עולם התרגול ותשייך את שם השחקן.'
          : 'פרטי החיבור יוצגו לאחר שהמורה תפעיל את העולם ותשייך את שם השחקן.';
      }
      document.getElementById('minecraftAccessCode').textContent = minecraft?.accessCode || (minecraft && session.active ? 'אין צורך בקוד גישה נוסף' : 'יוצג לאחר הפעלת עולם Minecraft');
      coinProgress.textContent = buildMode
        ? `מתחם: ${student.compoundId ? `#${student.compoundId}` : 'אין עדיין'} · כניסה אחרונה: ${formatDate(student.lastSeenAt) || 'אין עדיין'}`
        : `${student.coins || 0} מתוך 8 מטבעות · ניסיונות שהושלמו: ${Number(student.attemptCount || 0)} · זמן אחרון: ${formatDuration(student.lastDurationMs)} · שיא: ${formatDuration(student.bestTimeMs)}`;
      const steps = [
        ...(buildMode
          ? [
            ['העולם הופעל', session.active],
            ['מחובר/ת ל-Minecraft', Boolean(student.connected)],
            ['מתחם משויך', Boolean(student.compoundId)],
          ]
          : [
            ['העולם הופעל', session.active],
            ['Minecraft נפתח', Boolean(student.startedAt)],
            ['8 מטבעות', Number(student.coins) >= 8],
            ['הושלם', Boolean(student.completed)],
          ]),
      ].map(([label, done]) => node('span', label, `progress-step${done ? ' done' : ''}`));
      progressStrip.replaceChildren(...steps);
      const canStart = Boolean(session.active && student.minecraftPlayerName && minecraft);
      launch.disabled = !canStart;
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
    const lessonZeroEndPanel = document.getElementById('lessonZeroEndPanel');
    const teacherLessonKicker = document.getElementById('teacherLessonKicker');
    const teacherLessonTitle = document.getElementById('teacherLessonTitle');
    const teacherLessonGoal = document.getElementById('teacherLessonGoal');
    const teacherHomeLessonPickerLink = document.getElementById('teacherHomeLessonPickerLink');
    const teacherLiveControls = document.getElementById('teacherLiveControls');
    const teacherMetrics = document.getElementById('teacherMetrics');
    const teacherStudentBoard = document.getElementById('teacherStudentBoard');
    const teacherConnectionSummary = document.getElementById('teacherConnectionSummary');
    const teacherHomeOverview = document.getElementById('teacherHomeOverview');
    const teacherHomeChallenges = document.getElementById('teacherHomeChallenges');
    const teacherProgramVideoPreview = document.getElementById('teacherProgramVideoPreview');
    const teacherChallengeOverview = document.getElementById('teacherChallengeOverview');
    const teacherChallengeEyebrow = document.getElementById('teacherChallengeEyebrow');
    const teacherChallengeTitle = document.getElementById('teacherChallengeTitle');
    const teacherChallengeStory = document.getElementById('teacherChallengeStory');
    const teacherChallengeVideoPreview = document.getElementById('teacherChallengeVideoPreview');
    const teacherChallengeLessons = document.getElementById('teacherChallengeLessons');
    const selectedLessonVideoPanel = document.getElementById('selectedLessonVideoPanel');
    const selectedLessonVideoPreview = document.getElementById('selectedLessonVideoPreview');
    const selectedLessonVideoEyebrow = document.getElementById('selectedLessonVideoEyebrow');
    const selectedLessonVideoTitle = document.getElementById('selectedLessonVideoTitle');
    const selectedLessonVideoSummary = document.getElementById('selectedLessonVideoSummary');
    const teacherLogout = document.getElementById('kugel-teacher-logout');
    let current = null;
    let activeTeacherStudentModalKey = '';
    let activeTeacherStudentModalSnapshot = null;
    let activeTeacherStudentModalSignature = '';
    let latestClosedClassStageReport = null;
    let teacherRefreshTimer = null;
    let teacherRefreshInFlight = false;
    const openTeacherStudentIds = new Set();
    const openStageReportFullDetails = new Set();
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

    function applyTeacherClassroomId(nextClassroomId) {
      classroomId = nextClassroomId || '';
      if (!classroomId) return;
      const next = new URLSearchParams(location.search);
      next.set('classroomId', classroomId);
      history.replaceState(null, '', `${teacherPagePath}?${next.toString()}${location.hash}`);
    }

    function teacherClassroomRosterStudent(student) {
      const identity = student?.minecraftIdentity || {};
      return {
        id: student?.id || '',
        name: student?.name || 'תלמיד/ה',
        minecraftPlayerName: student?.minecraftPlayerName || '',
        minecraftEmail: identity.email || '',
        rosterOnly: true,
      };
    }

    function findTeacherClassroom(classes) {
      const items = Array.isArray(classes) ? classes : [];
      return items.find(item => item.id === classroomId) || null;
    }

    async function resolveTeacherClassroomId() {
      if (classroomId) return true;
      const data = await api('/api/classroom/classes');
      const craftomClasses = (data.classes || []).filter(item => (item.courses || []).includes('craftom-agent'));
      if (craftomClasses.length === 1) {
        applyTeacherClassroomId(craftomClasses[0].id);
        return true;
      }
      if (craftomClasses.length > 1) {
        setStatus(status, 'יש כמה כיתות קוגל. צריך לפתוח את מסך השיעור מתוך כרטיס הכיתה הנכון.', true);
        return false;
      }
      setStatus(status, 'לא נמצאה כיתת קוגל למורה המחוברת.', true);
      return false;
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

    function teacherFallbackHomeData(note = 'כדי לפתוח Minecraft ולראות לוח חי צריך להיכנס מתוך כרטיס כיתה.', classroom = null) {
      const rosterStudents = (classroom?.students || []).map(teacherClassroomRosterStudent);
      return {
        classroom: { name: classroom?.name || 'מסך בית מורה' },
        session: {},
        lessons: classroom?.lessonAccess?.lessons?.length ? classroom.lessonAccess.lessons : teacherProgramLessons(),
        students: rosterStudents,
        metrics: {},
        loadingClassroom: true,
        minecraftConfigured: false,
        minecraftSetupNote: note,
      };
    }

    async function renderTeacherRosterFallback() {
      if (!classroomId || (current?.students || []).length) return;
      const data = await api('/api/classroom/classes');
      const classroom = findTeacherClassroom(data.classes);
      if (!classroom) return;
      render(teacherFallbackHomeData('סטטוסים חיים נטענים עכשיו. רשימת התלמידים כבר מוצגת מתוך הכיתה.', classroom));
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

    function selectedLessonVideoInfo(lesson) {
      const lessonId = Number(lesson?.id ?? 0);
      if (lessonId === 0) {
        return {
          src: 'assets/kugel/videos/agent-academy-lesson0-intro-teen.mp4',
          poster: 'assets/kugel/videos/agent-academy-lesson0-intro-teen-poster.jpg',
          eyebrow: 'סרטון פתיחת התוכנית',
          title: 'שיעור 0: מבוך המטבעות',
          summary: 'סרטון פתיחה לפני הכניסה למבוך: מה עושים במיינקראפט, איך מתרגלים תנועה, ואיך המורה עוקב אחרי ההתקדמות.',
        };
      }
      if (lesson?.video) {
        return {
          src: lesson.video,
          poster: lesson.poster,
          eyebrow: `סרטון אתגר ${lesson.challengeId || lessonChallengeId(lessonId)}`,
          title: lesson.title || `שיעור ${lessonId}`,
          summary: lesson.summary || 'סרטון קצר לפני פתיחת השיעור לתלמידים.',
        };
      }
      return null;
    }

    function resolveSelectedLesson(lessons, activeLessonId) {
      const requested = hasRequestedLesson && Number.isInteger(requestedLessonId) && requestedLessonId >= 0 && requestedLessonId <= 16
        ? requestedLessonId
        : 0;
      const openLessonId = Math.max(0, ...(current?.lessonAccess?.lessons || [])
        .filter(item => Number(item.id) > 0 && item.open)
        .map(item => Number(item.id)));
      const nextLessonId = Number((current?.lessonAccess?.lessons || [])
        .find(item => Number(item.id) > 0 && item.nextToOpen)?.id || 0);
      const defaultHomeLessonId = 1;
      const fallback = openLessonId || (activeLessonId > 0 ? activeLessonId : 0) || nextLessonId || defaultHomeLessonId;
      const selectedId = hasRequestedLesson ? requested : (fallback || 1);
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
        const result = await api(path, payload);
        if (result?.classStageReport) latestClosedClassStageReport = result.classStageReport;
        setStatus(status, doneText);
        await refresh();
      } catch (error) {
        setStatus(status, error.message, true);
      }
    }

    async function restartLessonZeroFromReport() {
      setStatus(status, 'מפעילים מחדש את שיעור 0, מאפסים את נתוני המבוך ומרימים שרת Minecraft חדש…');
      try {
        const result = await api(scoped('/launch'), { resetLessonZero: true });
        latestClosedClassStageReport = null;
        openStageReportFullDetails.clear();
        setStatus(status, 'שיעור 0 הופעל מחדש. הדוח הקודם נשמר אצלנו, והלוח מתחיל מעקב חדש.');
        render(result);
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

    function closeLessonButton(lessonId, label = 'נעילת שיעור') {
      const access = lessonAccessInfo(lessonId);
      const isLessonZero = Number(lessonId) === 0;
      const activeLessonZero = Boolean(current?.session?.active
        && current?.session?.serverState === 'running'
        && Number(current?.session?.lessonId) === 0);
      if ((isLessonZero && !activeLessonZero) || (!isLessonZero && !access.open)) return null;
      const button = node('button', label, 'btn lock-lesson-action danger-action');
      button.type = 'button';
      button.addEventListener('click', () => teacherAction(
        scoped(`/lessons/${encodeURIComponent(lessonId)}/close`),
        {},
        isLessonZero ? 'מסיימים את שיעור 0, מורידים את השרת ומבקשים דוח…' : `נועלים את שיעור ${lessonId} לתלמידים…`,
        isLessonZero ? 'שיעור 0 נסגר, השרת ירד והדוח נטען ללומדה.' : `שיעור ${lessonId} נעול עכשיו לתלמידים.`
      ));
      return button;
    }

    function liveMinecraftControlsAvailable() {
      const session = current?.session || {};
      return Boolean(current?.minecraftConfigured && session.active && session.serverState === 'running');
    }

    function currentTeacherLessonId() {
      if (hasRequestedLesson && Number.isFinite(requestedLessonId)) return requestedLessonId;
      return Number(current?.trackedLessonId ?? current?.session?.lessonId ?? 0);
    }

    function currentTeacherBuildMode() {
      const lessonId = currentTeacherLessonId();
      if (lessonId >= 1) return true;
      return (current?.viewMode || current?.worldMode || current?.session?.worldMode) === 'build';
    }

    function studentConnectionBadge(student, liveMinecraft) {
      const lastSeen = formatDate(student.lastSeenAt);
      let text = 'לא שויך שחקן Minecraft';
      let state = 'is-unassigned';

      if (student.minecraftPlayerName && liveMinecraft) {
        text = student.connected ? 'מחובר/ת ל-Minecraft' : 'לא מחובר/ת ל-Minecraft';
        state = student.connected ? 'is-online' : 'is-offline';
      } else if (student.minecraftPlayerName && lastSeen) {
        text = `נראה/תה לאחרונה: ${lastSeen}`;
        state = 'is-last-seen';
      } else if (student.minecraftPlayerName) {
        text = 'Minecraft לא פעיל עכשיו';
        state = 'is-static';
      }

      const badge = node('span', text, `connection-pill ${state}`);
      if (lastSeen) badge.title = `נראה/תה לאחרונה: ${lastSeen}`;
      return badge;
    }

    function learningStateLabel(value, completed = 'הושלם', started = 'בתהליך', missing = 'חסר') {
      if (value === 'completed') return completed;
      if (value === 'started') return started;
      return missing;
    }

    function lessonZeroOverallStatus(student) {
      if (student.minecraftStatus === 'completed') return 'completed';
      if (
        Number(student.attemptCount || 0) > 0
        || student.minecraftStatus === 'started'
        || Number(student.coins || 0) > 0
        || student.connected
        || student.lastSeenAt
      ) return 'started';
      return 'not-started';
    }

    function lessonZeroRetrying(student) {
      return Number(student?.attemptCount || 0) > 0 && student?.minecraftStatus !== 'completed' && !student?.completed;
    }

    function lessonZeroOverallLabel(student, overallStatus) {
      if (overallStatus === 'completed') return 'הושלם';
      if (lessonZeroRetrying(student)) return 'ניסיון חדש';
      return overallStatus === 'started' ? 'בתהליך' : 'לא התחיל';
    }

    function lessonZeroMinecraftLabel(student) {
      if (lessonZeroRetrying(student)) return 'מנסה שוב';
      return learningStateLabel(student.minecraftStatus, 'הושלם', 'בתהליך', 'לא התחיל');
    }

    function lessonZeroFinishStatus(student) {
      const overallStatus = lessonZeroOverallStatus(student);
      if (lessonZeroRetrying(student)) return { text: 'ניסיון חדש', state: 'started' };
      if (overallStatus === 'completed') return { text: 'לחץ/ה סיום', state: 'completed' };
      if (overallStatus === 'started') return { text: 'בתהליך', state: 'started' };
      return { text: 'טרם סיים/ה', state: 'not-started' };
    }

    function lessonZeroSubmissionStatus(student) {
      if (lessonZeroRetrying(student)) return { text: 'ניסיון נוסף', state: 'started' };
      if (lessonZeroOverallStatus(student) === 'completed') return { text: 'הגיש/ה', state: 'completed' };
      if (lessonZeroOverallStatus(student) === 'started') return { text: 'בתהליך', state: 'started' };
      return { text: 'טרם התחיל/ה', state: 'not-started' };
    }

    function renderMiniStatus(label, value, state) {
      const pill = node('span', undefined, `mini-status ${state || 'not-started'}`);
      pill.append(node('strong', label), document.createTextNode(value));
      return pill;
    }

    function academyProgressTotal(student) {
      const total = Number(student?.academyTotalExercises || 6);
      return Number.isFinite(total) && total > 0 ? total : 6;
    }

    function academyProgressDone(student) {
      const total = academyProgressTotal(student);
      const done = Number(student?.academyCompletedExercises || 0);
      return Math.max(0, Math.min(total, Number.isFinite(done) ? done : 0));
    }

    function academyProgressState(student) {
      const done = academyProgressDone(student);
      const total = academyProgressTotal(student);
      if (student?.academyStatus === 'completed' || (total > 0 && done >= total)) return 'completed';
      if (student?.academyStatus === 'started' || done > 0) return 'started';
      return 'not-started';
    }

    function academyProgressText(student) {
      const done = academyProgressDone(student);
      const total = academyProgressTotal(student);
      return `${done}/${total} תרגילים`;
    }

    function renderBuildFact(label, value, className = '') {
      const item = node('div', undefined, `build-student-fact ${className}`.trim());
      item.append(node('span', label), node('strong', value || 'אין עדיין'));
      return item;
    }

    function hasDurationValue(value) {
      return value !== null && value !== undefined && value !== '' && Number.isFinite(Number(value));
    }

    function renderTeacherConnectionPill(student, liveMinecraft) {
      let text = 'אין שחקן Minecraft משויך';
      let state = 'unassigned';
      const lastSeen = formatDate(student.lastSeenAt);
      if (student.minecraftPlayerName && liveMinecraft && student.connected) {
        text = 'מחובר/ת עכשיו';
        state = 'connected';
      } else if (student.minecraftPlayerName && liveMinecraft) {
        text = 'לא מחובר/ת עכשיו';
        state = 'offline';
      } else if (student.minecraftPlayerName && lastSeen) {
        text = `נראה/תה לאחרונה: ${lastSeen}`;
        state = 'last-seen';
      } else if (student.minecraftPlayerName) {
        text = 'Minecraft לא פעיל עכשיו';
        state = 'offline';
      }
      const pill = node('span', undefined, `minecraft-connection-mini ${state}`);
      pill.append(node('strong', 'חיבור'), document.createTextNode(text));
      return pill;
    }

    function renderTeacherCoinProgress(student) {
      const goal = 8;
      const coins = Math.max(0, Math.min(goal, Number(student.coins || 0)));
      const percent = Math.round((coins / goal) * 100);
      const progress = node('div', undefined, `coin-progress${coins >= goal ? ' complete' : ''}`);
      const label = node('div', undefined, 'coin-progress-label');
      label.append(node('strong', 'מטבעות'), node('span', `${coins} מתוך ${goal}`));
      const track = node('div', undefined, 'coin-progress-track');
      track.setAttribute('role', 'progressbar');
      track.setAttribute('aria-valuemin', '0');
      track.setAttribute('aria-valuemax', String(goal));
      track.setAttribute('aria-valuenow', String(coins));
      const fill = document.createElement('span');
      fill.style.width = `${percent}%`;
      track.append(fill);
      progress.append(label, track);
      return progress;
    }

    function renderTeacherDurationPills(student) {
      const pills = [];
      if (hasDurationValue(student.lastDurationMs)) {
        pills.push(renderMiniStatus('זמן סיום', formatDuration(student.lastDurationMs), 'completed'));
      }
      if (hasDurationValue(student.bestTimeMs)) {
        pills.push(renderMiniStatus('שיא', formatDuration(student.bestTimeMs), 'completed'));
      }
      return pills;
    }

    function renderTeacherStudentIdentityLines(student) {
      const lines = node('div', undefined, 'student-minecraft-identity-lines');
      const minecraftName = student.minecraftPlayerName || 'אין שחקן Minecraft משויך';
      const minecraftEmail = student.minecraftEmail || 'מייל Minecraft לא אומת עדיין';
      lines.append(
        node('span', `Minecraft: ${minecraftName}`),
        node('span', `מייל: ${minecraftEmail}`),
      );
      return lines;
    }

    function commandIcon(name) {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('viewBox', '0 0 24 24');
      svg.setAttribute('aria-hidden', 'true');
      svg.setAttribute('focusable', 'false');
      const paths = {
        chat: [
          ['path', { d: 'M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z' }],
          ['path', { d: 'M8 9h8' }],
          ['path', { d: 'M8 13h5' }],
        ],
        freeze: [
          ['circle', { cx: '12', cy: '12', r: '9' }],
          ['path', { d: 'M10 8v8' }],
          ['path', { d: 'M14 8v8' }],
        ],
        release: [
          ['path', { d: 'M8 11V8a4 4 0 0 1 7.5-2' }],
          ['rect', { x: '6', y: '11', width: '12', height: '9', rx: '2' }],
          ['path', { d: 'M12 15v2' }],
        ],
      };
      (paths[name] || []).forEach(([tag, attrs]) => {
        const child = document.createElementNS('http://www.w3.org/2000/svg', tag);
        Object.entries(attrs).forEach(([key, value]) => child.setAttribute(key, value));
        svg.append(child);
      });
      return svg;
    }

    function commandButton(label, iconName) {
      const button = node('button', undefined, 'button quiet compact-action command-action-button');
      const icon = node('span', undefined, 'command-action-icon');
      const text = node('span', label, 'command-action-label');
      icon.append(commandIcon(iconName));
      button.append(icon, text);
      button.setAttribute('aria-label', label);
      return button;
    }

    function enhanceCommandAction(button, iconName) {
      if (!button || button.querySelector('.command-action-icon')) return;
      const label = button.textContent.trim();
      button.textContent = '';
      button.classList.add('command-action-button');
      const icon = node('span', undefined, 'command-action-icon');
      const text = node('span', label, 'command-action-label');
      icon.append(commandIcon(iconName));
      button.append(icon, text);
      button.setAttribute('aria-label', label);
    }

    function renderTeacherStudentActions(student, liveMinecraft) {
      const actions = node('div', undefined, 'minecraft-command-actions');
      const disabled = !liveMinecraft || !student.minecraftPlayerName;
      async function run(path, payload, busyText, successText) {
        setStatus(status, busyText);
        [...actions.querySelectorAll('button')].forEach((button) => { button.disabled = true; });
        try {
          await api(scoped(`/${path}`), payload);
          setStatus(status, successText);
          await refresh();
        } catch (error) {
          setStatus(status, error.message, true);
        } finally {
          [...actions.querySelectorAll('button')].forEach((button) => { button.disabled = disabled; });
        }
      }
      const chat = commandButton('צ׳אט לתלמיד', 'chat');
      const freeze = commandButton('עצירה לתלמיד', 'freeze');
      const release = commandButton('שחרור לתלמיד', 'release');
      [chat, freeze, release].forEach((button) => {
        button.type = 'button';
        button.disabled = disabled;
      });
      chat.addEventListener('click', () => {
        const text = prompt('מה לשלוח בצ׳אט לתלמיד?');
        if (!text?.trim()) return;
        run('message', { scope: 'player', target: student.minecraftPlayerName, text: text.trim() }, 'שולחים הודעה…', 'ההודעה נשלחה.');
      });
      freeze.addEventListener('click', () => run('freeze', { scope: 'player', target: student.minecraftPlayerName, on: true }, 'עוצרים את התלמיד…', 'התלמיד נעצר.'));
      release.addEventListener('click', () => run('freeze', { scope: 'player', target: student.minecraftPlayerName, on: false }, 'משחררים את התלמיד…', 'התלמיד שוחרר.'));
      actions.append(chat, freeze, release);
      return actions;
    }

    function safeReportUrl(value) {
      try {
        const parsed = new URL(String(value || ''), location.href);
        return ['http:', 'https:'].includes(parsed.protocol) ? parsed.href : '';
      } catch {
        return '';
      }
    }

    function stageReportStatusText(report) {
      if (!report) return 'אין עדיין';
      return report.generatedAt ? `עודכן ${formatDate(report.generatedAt) || report.generatedAt}` : 'נוצר דוח';
    }

    function stageReportFullDetailsKey(report, title) {
      return [
        title || 'דוח',
        report?.generatedAt || '',
        report?.lessonLabel || '',
        String(report?.reportText || '').slice(0, 80),
        String(report?.reportText || '').length,
      ].join('|');
    }

    function appendReportField(container, label, value) {
      if (!value) return;
      const item = node('div', undefined, 'stage-report-field');
      item.append(node('strong', label), node('p', value));
      container.append(item);
    }

    function appendReportFact(container, label, value) {
      if (value === null || value === undefined || value === '') return;
      container.append(node('dt', label), node('dd', String(value)));
    }

    function renderReportSection(title, ...children) {
      const section = node('section', undefined, 'stage-report-section');
      section.append(node('strong', title, 'stage-report-section-title'));
      children.flat().filter(Boolean).forEach(child => section.append(child));
      return section.children.length > 1 ? section : null;
    }

    function reportVerdictState(value) {
      const text = String(value || '').toLowerCase();
      if (/good|טוב|עבר|הושלם|מתאים/.test(text)) return 'completed';
      if (/partial|חלק|דורש|בדיקה/.test(text)) return 'started';
      return 'not-started';
    }

    function renderSnapshotFacts(snapshot) {
      if (!snapshot) return null;
      const facts = node('dl', undefined, 'stage-report-facts');
      appendReportFact(facts, 'בלוקים', snapshot.blocksCount);
      appendReportFact(facts, 'חורים', snapshot.holesCount);
      appendReportFact(facts, 'גובה מקס׳', snapshot.maxHeight);
      return facts.children.length ? facts : null;
    }

    function cleanStagePhotoUrls(urls) {
      return [...new Set((Array.isArray(urls) ? urls : []).map(safeReportUrl).filter(Boolean))];
    }

    function renderStagePhotoGallery(urls, label = 'צילומי התלמיד') {
      const photoUrls = cleanStagePhotoUrls(urls);
      if (!photoUrls.length) return null;
      const gallery = node('div', undefined, 'stage-photo-gallery');
      photoUrls.forEach((url, index) => {
        const link = document.createElement('a');
        link.href = url;
        link.target = '_blank';
        link.rel = 'noopener';
        link.className = 'stage-photo-link';
        const image = document.createElement('img');
        image.src = url;
        image.alt = `${label} ${index + 1}`;
        image.loading = 'lazy';
        link.append(image);
        gallery.append(link);
      });
      return gallery;
    }

    function renderStudentStagePhotos(stagePhotos) {
      const photoUrls = cleanStagePhotoUrls(stagePhotos?.photoUrls);
      if (!photoUrls.length) return null;
      const card = node('article', undefined, 'stage-report-card stage-photos-card');
      card.append(node('h5', 'צילומים מהשיעור'));
      const statuses = node('div', undefined, 'stage-report-verdicts');
      statuses.append(renderMiniStatus('צילומים', `${photoUrls.length} תמונות`, 'completed'));
      if (stagePhotos.generatedAt) statuses.append(renderMiniStatus('עודכן', formatDate(stagePhotos.generatedAt) || stagePhotos.generatedAt, 'not-started'));
      card.append(statuses);
      const gallery = renderStagePhotoGallery(photoUrls);
      if (gallery) card.append(gallery);
      return card;
    }

    function studentStagePhotoCount(student) {
      const stagePhotos = cleanStagePhotoUrls(student.stagePhotos?.photoUrls).length;
      const reportPhotos = cleanStagePhotoUrls(student.stageReport?.photoUrls).length;
      return Math.max(stagePhotos, reportPhotos);
    }

    function renderActivityFacts(activity) {
      if (!activity) return null;
      const facts = node('dl', undefined, 'stage-report-facts');
      appendReportFact(facts, 'Agent הניח', activity.agentPlaced);
      appendReportFact(facts, 'Agent שבר', activity.agentBroken);
      appendReportFact(facts, 'ידני הניח', activity.manualPlaced);
      appendReportFact(facts, 'ידני שבר', activity.manualBroken);
      appendReportFact(facts, 'חסימות שבירה', activity.blockedBreakAttempts);
      appendReportFact(facts, 'דקות פעילות', activity.activeMinutes);
      appendReportFact(facts, 'הודעות צ׳אט', activity.chatMessages);
      appendReportFact(facts, 'התערבויות מורה', activity.teacherInterventions);
      return facts.children.length ? facts : null;
    }

    function renderStageReport(report, title = 'דוח שלב') {
      if (!report) return null;
      const card = node('article', undefined, 'stage-report-card');
      card.append(node('h5', report.lessonLabel ? `${title} · ${report.lessonLabel}` : title));
      const verdicts = node('div', undefined, 'stage-report-verdicts');
      if (report.buildVerdict) verdicts.append(renderMiniStatus('בנייה', report.buildVerdict, reportVerdictState(report.buildVerdict)));
      if (report.codeVerdict) verdicts.append(renderMiniStatus('קוד', report.codeVerdict, reportVerdictState(report.codeVerdict)));
      if (report.generatedAt) verdicts.append(renderMiniStatus('עודכן', formatDate(report.generatedAt) || report.generatedAt, 'not-started'));
      if (verdicts.children.length) card.append(verdicts);

      const buildSection = renderReportSection(
        'בנייה במתחם',
        report.buildSummary ? node('p', report.buildSummary) : null,
        report.snapshot?.summary ? node('p', report.snapshot.summary, 'stage-report-muted-text') : null,
        renderSnapshotFacts(report.snapshot),
      );
      if (buildSection) card.append(buildSection);

      const reportPhotos = renderStagePhotoGallery(report.photoUrls);
      const photosSection = renderReportSection(
        'תמונות מהשיעור',
        reportPhotos,
      );
      if (photosSection) card.append(photosSection);

      const activitySection = renderReportSection(
        'פעילות',
        report.activitySummary ? node('p', report.activitySummary) : null,
        renderActivityFacts(report.activity),
      );
      if (activitySection) card.append(activitySection);

      if (report.snapshotMap) {
        const map = node('pre', report.snapshotMap, 'stage-report-map');
        const mapSection = renderReportSection('מפה מלמעלה', map);
        if (mapSection) card.append(mapSection);
      }

      const codeChildren = [];
      if (report.codeSummary) codeChildren.push(node('p', report.codeSummary));
      if (report.code) {
        const codeBox = node('details', undefined, 'stage-report-code');
        const summary = node('summary', report.code.name || 'קוד MakeCode');
        codeBox.append(summary);
        const codeUrl = safeReportUrl(report.code.url);
        if (codeUrl) {
          const link = node('a', 'פתיחת קישור קוד', 'stage-report-link');
          link.href = codeUrl;
          link.target = '_blank';
          link.rel = 'noopener';
          codeBox.append(link);
        }
        if (report.code.error) appendReportField(codeBox, 'שגיאת קוד', report.code.error);
        if (report.code.source) codeBox.append(node('pre', report.code.source, 'stage-report-source'));
        codeChildren.push(codeBox);
      }
      const codeSection = renderReportSection('קוד MakeCode', codeChildren);
      if (codeSection) card.append(codeSection);

      const tipSection = renderReportSection('טיפ למורה', report.teacherTip ? node('p', report.teacherTip) : null);
      if (tipSection) card.append(tipSection);

      if (!buildSection && !activitySection && !codeSection && !tipSection) {
        appendReportField(card, 'סיכום בנייה', report.buildSummary);
        appendReportField(card, 'סיכום קוד', report.codeSummary);
        appendReportField(card, 'טיפ למורה', report.teacherTip);
        appendReportField(card, 'פעילות', report.activitySummary);
        appendReportField(card, 'תמונת מצב', report.snapshot?.summary);
      }
      if (report.reportText) {
        const full = node('details', undefined, 'stage-report-full');
        const detailsKey = stageReportFullDetailsKey(report, title);
        full.dataset.reportKey = detailsKey;
        full.open = openStageReportFullDetails.has(detailsKey);
        full.addEventListener('toggle', () => {
          if (full.open) openStageReportFullDetails.add(detailsKey);
          else openStageReportFullDetails.delete(detailsKey);
        });
        full.append(node('summary', 'דוח מלא'), node('pre', report.reportText));
        card.append(full);
      }
      return card;
    }

    function renderChatCodeLink(codeLink) {
      if (!codeLink) return null;
      const url = safeReportUrl(codeLink.url);
      if (!url) return null;
      const card = node('article', undefined, 'stage-report-card chat-code-link-card');
      card.append(node('h5', 'קישור MakeCode מהצ׳אט'));
      const statuses = node('div', undefined, 'stage-report-verdicts');
      statuses.append(renderMiniStatus('קישור קוד', 'התקבל בצ׳אט', 'completed'));
      if (codeLink.sentAt) statuses.append(renderMiniStatus('נשלח', formatDate(codeLink.sentAt) || codeLink.sentAt, 'not-started'));
      card.append(statuses);
      const link = node('a', 'פתיחת קישור MakeCode', 'stage-report-link');
      link.href = url;
      link.target = '_blank';
      link.rel = 'noopener';
      card.append(link);
      if (codeLink.message) appendReportField(card, 'הודעת הצ׳אט', codeLink.message);
      return card;
    }

    function localCodeCheckStatusText(check) {
      if (!check) return 'אין עדיין';
      if (check.status === 'passed') return 'נראה מתאים';
      if (check.status === 'partial') return 'דורש בדיקה';
      if (check.status === 'failed') return 'חסר חלק';
      return 'לא נפתח';
    }

    function renderLocalCodeCheck(check) {
      if (!check) return null;
      const state = check.status === 'passed' ? 'completed' : (check.status === 'partial' ? 'started' : 'not-started');
      const card = node('article', undefined, 'stage-report-card local-code-check-card');
      card.append(node('h5', `בדיקת קוד בלומדה · ${check.lessonLabel || 'שיעור'}`));
      const statuses = node('div', undefined, 'stage-report-verdicts');
      statuses.append(renderMiniStatus('תוצאה', check.verdict || localCodeCheckStatusText(check), state));
      if (check.url) {
        const url = safeReportUrl(check.url);
        if (url) {
          const link = node('a', 'פתיחת קישור MakeCode', 'stage-report-link');
          link.href = url;
          link.target = '_blank';
          link.rel = 'noopener';
          statuses.append(link);
        }
      }
      card.append(statuses);
      appendReportField(card, 'סיכום בדיקה', check.summary);
      if (check.error) appendReportField(card, 'שגיאה', check.error);
      if (Array.isArray(check.checks) && check.checks.length) {
        const checks = node('div', undefined, 'stage-report-verdicts local-code-checks');
        check.checks.forEach(item => {
          checks.append(renderMiniStatus(item.label, item.ok ? 'זוהה' : 'חסר', item.ok ? 'completed' : 'not-started'));
        });
        card.append(checks);
      }
      if (check.source) {
        const codeBox = node('details', undefined, 'stage-report-code');
        codeBox.append(node('summary', 'הקוד שהלומדה בדקה'), node('pre', check.source, 'stage-report-source'));
        card.append(codeBox);
      }
      return card;
    }

    function renderTeacherStudentDetail(student) {
      const buildMode = currentTeacherBuildMode();
      const detail = node('div', undefined, `progress-detail-card ${buildMode ? 'build-progress-detail-card' : 'lesson-zero-progress-detail-card'}`);
      detail.append(node('h4', buildMode ? `${student.name} · מצב בנייה` : 'פרטי שיעור 0'));
      detail.append(renderTeacherStudentIdentityLines(student));
      if (buildMode) detail.append(node('p', 'עבודה במתחם האישי ב-Minecraft.'));
      const statuses = node('div', undefined, 'progress-detail-statuses');
      if (buildMode) {
        statuses.append(
          renderMiniStatus('אקדמיה', academyProgressText(student), academyProgressState(student)),
          renderTeacherConnectionPill(student, liveMinecraftControlsAvailable()),
          renderMiniStatus('מתחם', student.compoundId ? `#${student.compoundId}` : 'אין עדיין', 'not-started'),
        );
      } else {
        statuses.append(
          renderMiniStatus('Minecraft', lessonZeroMinecraftLabel(student), student.minecraftStatus || 'not-started'),
          renderMiniStatus('סיום', lessonZeroFinishStatus(student).text, lessonZeroFinishStatus(student).state),
        );
      }
      detail.append(statuses);
      const meta = node('dl', undefined, 'progress-detail-meta');
      const metaItems = buildMode
        ? [
          ['אקדמיית ה-Agent', academyProgressText(student)],
          ['חיבור', student.connected ? 'מחובר/ת' : 'לא מחובר/ת'],
          ['מתחם', student.compoundId ? `#${student.compoundId}` : 'אין עדיין'],
          ['כניסה אחרונה', formatDate(student.lastSeenAt) || 'אין עדיין'],
        ]
        : [
          ['ניסיונות שהושלמו', String(Number(student.attemptCount || 0))],
          ['זמן אחרון', formatDuration(student.lastDurationMs)],
          ['שיא', formatDuration(student.bestTimeMs)],
          ['נראה לאחרונה', formatDate(student.lastSeenAt) || 'אין עדיין'],
        ];
      metaItems.forEach(([term, value]) => {
        meta.append(node('dt', term), node('dd', value));
      });
      detail.append(meta);
      const chatCodeLink = renderChatCodeLink(student.chatCodeLink);
      if (chatCodeLink) detail.append(chatCodeLink);
      const stagePhotos = renderStudentStagePhotos(student.stagePhotos);
      if (stagePhotos) detail.append(stagePhotos);
      const localCodeCheck = renderLocalCodeCheck(student.localCodeCheck);
      if (localCodeCheck) detail.append(localCodeCheck);
      const stageReport = renderStageReport(student.stageReport);
      if (stageReport) detail.append(stageReport);
      const hasBuildReportData = Boolean(chatCodeLink || stagePhotos || localCodeCheck || stageReport);
      if (student.submission) {
        const submission = node('div', undefined, 'progress-submission');
        const info = node('div');
        info.append(
          node('strong', `כרטיס יציאה - שיעור ${student.submission.lessonId}`),
          node('p', student.submission.exitAnswer || ''),
          node('small', `עודכן: ${formatDate(student.submission.updatedAt)}${student.submission.replaced ? ' • עודכן אחרי ההגשה הראשונה' : ''}`),
        );
        if (student.submission.photo?.url) {
          const image = document.createElement('img');
          image.src = student.submission.photo.url;
          image.alt = `תמונת העבודה של ${student.name}`;
          const imageLink = document.createElement('a');
          imageLink.href = student.submission.photo.url;
          imageLink.target = '_blank';
          imageLink.rel = 'noopener';
          imageLink.append(image);
          submission.append(imageLink, info);
        } else {
          info.append(node('small', 'הצילום מגיע ממיינקראפט ומוצג למעלה באזור הצילומים.'));
          submission.append(info);
        }
        detail.append(submission);
      } else if (buildMode && !hasBuildReportData) {
        detail.append(node('p', 'עדיין אין קישור קוד או דוח מוניטור לתלמיד הזה.', 'progress-empty-note'));
      }
      return detail;
    }

    function ensureTeacherStudentModal() {
      let dialog = document.getElementById('teacherStudentDetailDialog');
      if (dialog) return dialog;
      dialog = document.createElement('dialog');
      dialog.id = 'teacherStudentDetailDialog';
      dialog.className = 'teacher-student-detail-dialog';
      dialog.addEventListener('close', () => {
        activeTeacherStudentModalKey = '';
        activeTeacherStudentModalSnapshot = null;
        activeTeacherStudentModalSignature = '';
      });
      document.body.append(dialog);
      return dialog;
    }

    function teacherStudentDetailSignature(student) {
      return JSON.stringify({
        id: teacherStudentCardKey(student),
        connected: Boolean(student.connected),
        compoundId: student.compoundId || '',
        minecraftStatus: student.minecraftStatus || '',
        chatCodeLink: student.chatCodeLink || null,
        stagePhotos: student.stagePhotos || null,
        localCodeCheck: student.localCodeCheck || null,
        stageReport: student.stageReport || null,
        submission: student.submission || null,
      });
    }

    function renderTeacherStudentModalContent(student, options = {}) {
      const dialog = ensureTeacherStudentModal();
      const previousBody = dialog.querySelector('.teacher-student-detail-modal-body');
      const previousScrollTop = options.preserveScroll && previousBody ? previousBody.scrollTop : 0;
      const liveMinecraft = liveMinecraftControlsAvailable();
      const shell = node('div', undefined, 'teacher-student-detail-modal');
      const header = node('header', undefined, 'teacher-student-detail-modal-head');
      const titleWrap = node('div');
      titleWrap.append(
        node('span', 'פירוט תלמיד', 'teacher-student-detail-modal-kicker'),
        node('h3', student.name || 'תלמיד'),
      );
      const close = node('button', 'סגירה', 'secondary-action teacher-student-detail-modal-close');
      close.type = 'button';
      close.addEventListener('click', () => dialog.close());
      header.append(titleWrap, close);

      const body = node('div', undefined, 'teacher-student-detail-modal-body');
      body.append(renderTeacherStudentDetail(student));
      const actions = renderTeacherStudentActions(student, liveMinecraft);
      actions.insertBefore(node('strong', 'פעולות מורה', 'build-actions-title'), actions.firstChild);
      body.append(actions);
      shell.append(header, body);
      dialog.replaceChildren(shell);
      activeTeacherStudentModalSignature = teacherStudentDetailSignature(student);
      if (options.preserveScroll && previousBody) {
        body.scrollTop = previousScrollTop;
        requestAnimationFrame(() => {
          body.scrollTop = previousScrollTop;
        });
      }
    }

    function openTeacherStudentDetailModal(student) {
      const dialog = ensureTeacherStudentModal();
      activeTeacherStudentModalKey = teacherStudentCardKey(student);
      activeTeacherStudentModalSnapshot = student;
      renderTeacherStudentModalContent(student);
      if (dialog.open) return;
      if (typeof dialog.showModal === 'function') dialog.showModal();
      else dialog.setAttribute('open', '');
    }

    function updateTeacherStudentCardOpenHint(row) {
      const hint = row.querySelector('.student-card-open-hint');
      if (hint) hint.textContent = row.open ? 'סגור' : 'פרטים';
    }

    function renderTeacherStudentCardSummary(student, liveMinecraft, buildMode, isOpen = false) {
      const summary = document.createElement(buildMode ? 'button' : 'summary');
      summary.className = 'teacher-student-card-summary';
      summary.setAttribute('aria-label', `פתיחת פרטים על ${student.name}`);
      if (buildMode) {
        summary.type = 'button';
        summary.classList.add('teacher-student-card-button');
        summary.addEventListener('click', () => openTeacherStudentDetailModal(student));
      }

      const header = node('div', undefined, 'teacher-student-card-header');
      const name = node('div', undefined, 'lesson-student-name');
      name.append(node('strong', student.name));
      header.append(name, node('span', isOpen ? 'סגור' : 'פרטים', 'student-card-open-hint'));

      const essentials = node('div', undefined, 'teacher-student-card-essentials');
      essentials.append(renderTeacherConnectionPill(student, liveMinecraft));
      if (buildMode) {
        essentials.append(
          renderMiniStatus('אקדמיה', academyProgressText(student), academyProgressState(student)),
          renderBuildFact('מתחם', student.compoundId ? `#${student.compoundId}` : 'אין עדיין'),
        );
        if (student.chatCodeLink) essentials.append(renderMiniStatus('קישור קוד', 'התקבל בצ׳אט', 'completed'));
        if (student.localCodeCheck) {
          essentials.append(renderMiniStatus('בדיקת קוד', localCodeCheckStatusText(student.localCodeCheck), student.localCodeCheck.status === 'passed' ? 'completed' : 'started'));
        }
        const photoCount = studentStagePhotoCount(student);
        if (photoCount) essentials.append(renderMiniStatus('צילומים', `${photoCount} תמונות`, 'completed'));
        if (student.stageReport) essentials.append(renderMiniStatus('דוח שלב', stageReportStatusText(student.stageReport), 'completed'));
      } else {
        const submission = lessonZeroSubmissionStatus(student);
        essentials.append(
          renderTeacherCoinProgress(student),
          renderMiniStatus('הגשה', submission.text, submission.state),
        );
      }

      summary.append(header, essentials);
      return summary;
    }

    function teacherStudentCardKey(student) {
      return String(student.id || student.minecraftPlayerName || student.name || '');
    }

    function renderConnectionSummary(students, metrics, liveMinecraft, minecraftConfigured) {
      if (!teacherConnectionSummary) return;
      const total = students.length;
      const connected = Number(metrics?.connected ?? students.filter(student => student.connected).length);
      const assigned = students.filter(student => student.minecraftPlayerName).length;
      const unassigned = total - assigned;
      const offline = Math.max(0, total - connected);
      const title = teacherConnectionSummary.querySelector('strong');
      const detail = teacherConnectionSummary.querySelector('span');

      teacherConnectionSummary.classList.toggle('is-live', liveMinecraft);
      teacherConnectionSummary.classList.toggle('is-paused', !liveMinecraft);
      teacherConnectionSummary.classList.toggle('is-empty', total === 0);
      teacherConnectionSummary.classList.toggle('is-loading-statuses', Boolean(current?.loadingClassroom && total));
      teacherConnectionSummary.classList.remove('is-error');

      if (!total) {
        title.textContent = 'אין עדיין תלמידים בכיתה';
        detail.textContent = 'כשתלמידים יצטרפו לכיתה, מצב Minecraft שלהם יופיע כאן.';
      } else if (current?.loadingClassroom) {
        title.textContent = 'הכיתה נטענה, הסטטוסים בטעינה';
        detail.textContent = `${total} תלמידים בכיתה. עוד רגע יופיעו מצב Minecraft והתקדמות לכל תלמיד.`;
      } else if (minecraftConfigured === false) {
        title.textContent = `חיבור Minecraft לא מוגדר`;
        detail.textContent = `${total} תלמידים בכיתה. צריך להפעיל את חיבור ה-Monitor כדי לראות סטטוס חי.`;
      } else if (liveMinecraft) {
        title.textContent = `מחוברים עכשיו: ${connected} מתוך ${total}`;
        detail.textContent = `${offline} לא מחוברים${unassigned ? ` • ${unassigned} בלי שחקן משויך` : ''}`;
      } else {
        title.textContent = 'Minecraft לא פעיל עכשיו';
        detail.textContent = `${total} תלמידים בכיתה. ברשימה למטה מופיע הסטטוס האחרון לכל תלמיד.`;
      }
    }

    function renderClassStageReport(report) {
      const card = renderStageReport(report, 'דוח סוף שיעור');
      if (!card) return null;
      card.classList.add('class-stage-report-card');
      const students = Array.isArray(report.students) ? report.students : [];
      const lessonZeroSummary = report.lessonZeroSummary || null;
      const hasCode = item => Boolean(item?.code?.url || item?.code?.source);
      const hasScan = item => Boolean(item?.snapshot?.summary || item?.snapshotMap || item?.buildVerdict);
      const needsAttention = item => {
        const build = String(item?.buildVerdict || '').toLowerCase();
        const code = String(item?.codeVerdict || '').toLowerCase();
        return !hasCode(item)
          || /partial|empty|unknown|חלק|ריק|לא ידוע|חסר/.test(build)
          || /missing|error|unknown|partial|אין|חסר|שגיאה|חלק/.test(code);
      };
      const submitted = students.filter(hasScan).length;
      const codeLinks = students.filter(hasCode).length;
      const attention = students.filter(needsAttention).length;
      const goodBuild = students.filter(item => /good|טוב|עומד|הושלם/.test(String(item?.buildVerdict || '').toLowerCase())).length;
      const summary = node('div', undefined, 'class-stage-report-summary');
      const summaryItems = lessonZeroSummary
        ? [
          ['תלמידים בדוח', lessonZeroSummary.studentCount ?? students.length],
          ['נכחו בשרת', lessonZeroSummary.presentCount ?? lessonZeroSummary.studentCount ?? 0],
          ['סיימו מבוך', lessonZeroSummary.completedCount ?? 0],
          ['הודעות צ׳אט', lessonZeroSummary.chatMessages ?? 0],
        ]
        : [
          ['תלמידים בדוח', students.length],
          ['נסרקו', submitted],
          ['קישור קוד', codeLinks],
          ['בנייה טובה', goodBuild],
          ['דורשים בדיקה', attention],
        ];
      summaryItems.forEach(([label, value]) => summary.append(renderMiniStatus(label, String(value), value ? 'started' : 'not-started')));
      card.insertBefore(summary, card.children[1] || null);
      const meta = node('dl', undefined, 'progress-detail-meta class-stage-report-meta');
      [
        ['התחלה', formatDate(report.startedAt) || report.startedAt || 'אין עדיין'],
        ['סיום', formatDate(report.endedAt) || report.endedAt || 'אין עדיין'],
        ['תלמידים בדוח', String(lessonZeroSummary?.studentCount ?? (report.students || []).length)],
      ].forEach(([term, value]) => meta.append(node('dt', term), node('dd', value)));
      card.insertBefore(meta, card.children[1] || null);
      return card;
    }

    function teacherLoadFailureMessage(error) {
      if (error?.status === 401) {
        return 'צריך להיכנס כמורה של הכיתה כדי לראות את התלמידים במסך הזה.';
      }
      if (error?.status === 404) {
        return 'הכיתה הזו שייכת למורה אחרת, לכן אי אפשר לטעון מכאן את רשימת התלמידים.';
      }
      if (error?.status === 403) {
        return 'אקדמיית ה-Agent לא פתוחה לכיתה הזו או שאין הרשאה לצפות בה.';
      }
      return error?.message || 'לא הצלחנו לטעון את הכיתה.';
    }

    function renderTeacherLoadFailure(message) {
      className.textContent = 'הכיתה לא נטענה';
      renderConnectionSummary([], {}, false, false);
      const title = teacherConnectionSummary?.querySelector('strong');
      const detail = teacherConnectionSummary?.querySelector('span');
      teacherConnectionSummary?.classList.add('is-error');
      if (title) title.textContent = 'לא ניתן להציג תלמידים';
      if (detail) detail.textContent = message;
      monitor.replaceChildren();
      const card = node('div', undefined, 'teacher-load-error-card');
      card.append(
        node('strong', 'זו לא כיתה ריקה'),
        node('span', message),
      );
      monitor.append(card);
    }

    function renderStudent(student) {
      const liveMinecraft = liveMinecraftControlsAvailable();
      const buildMode = currentTeacherBuildMode();
      const overallStatus = lessonZeroOverallStatus(student);
      const row = node(buildMode ? 'article' : 'details', undefined, `lesson-student-row teacher-monitor-row teacher-student-card ${buildMode ? 'build-mode' : overallStatus}`);
      const cardKey = teacherStudentCardKey(student);
      if (cardKey && !buildMode) {
        row.dataset.studentId = cardKey;
        row.open = openTeacherStudentIds.has(cardKey);
        row.addEventListener('toggle', () => {
          if (row.open) openTeacherStudentIds.add(cardKey);
          else openTeacherStudentIds.delete(cardKey);
          updateTeacherStudentCardOpenHint(row);
        });
      }
      const isOpen = row.open;
      row.append(renderTeacherStudentCardSummary(student, liveMinecraft, buildMode, isOpen));
      if (buildMode) return row;

      const status = node('div', undefined, 'lesson-student-status teacher-student-card-detail');
      const detail = node('div', undefined, 'teacher-monitor-detail');
      detail.replaceChildren(renderTeacherStudentDetail(student));
      status.append(detail);
      const actions = renderTeacherStudentActions(student, liveMinecraft);
      if (buildMode) actions.insertBefore(node('strong', 'פעולות מורה', 'build-actions-title'), actions.firstChild);
      status.append(actions);
      row.append(status);
      return row;
    }

    function renderTeacherHeader(selectedLesson, activeLessonId) {
      if (!teacherCourseHeaderNav) return;
      const onTeacherHome = !hasRequestedLesson && !requestedChallengeId;
      const items = [
        ['דף הבית', teacherPageUrl(), onTeacherHome],
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
            const closeButton = closeLessonButton(lesson.id, `נעילת שיעור ${lesson.id}`);
            lessonActions.append(manageButton);
            if (openButton) lessonActions.append(openButton);
            if (closeButton) lessonActions.append(closeButton);
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
        const challengeSequence = [];
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
        const previewButton = lessonId === 0 ? node('a', 'צפייה כתלמיד', 'btn secondary') : null;
        if (previewButton) previewButton.href = studentPreviewUrl(0);
        const button = openLessonButton(lessonId, `פתיחת שיעור ${lessonId} לתלמידים`);
        const closeButton = closeLessonButton(lessonId, lessonId === 0 ? 'סיום שיעור 0' : `נעילת שיעור ${lessonId}`);
        container.replaceChildren(manageButton, ...(previewButton ? [previewButton] : []), ...(button ? [button] : []), ...(closeButton ? [closeButton] : []));
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
        ? (isLessonZero ? 'סגירת עולם Minecraft לשיעור הפתיחה' : `עולם Minecraft פעיל - סגירה`)
        : (lesson.hasWorld ? (isLessonZero ? 'הפעלת עולם Minecraft לשיעור הפתיחה' : `הפעלת עולם Minecraft לשיעור ${lesson.id}`) : 'חסר עולם Minecraft');
      const launch = node('button', actionLabel, `primary-action start-lesson-action${isActiveLesson ? ' end-lesson-action' : ''}${Number(lesson.id) === 1 ? ' lesson-one-action' : ''}`);
      launch.type = 'button';
      launch.disabled = minecraftBlocked || !lesson.hasWorld || session.serverState === 'starting';
      launch.title = !lesson.hasWorld
        ? 'צריך להגדיר עולם Minecraft אמיתי לשיעור הזה לפני שאפשר להפעיל אותו.'
        : (minecraftBlocked ? current?.minecraftSetupNote || '' : '');
      launch.classList.toggle('is-active-lesson', isActiveLesson);
      launch.addEventListener('click', () => teacherAction(
        isActiveLesson && isLessonZero ? scoped('/lessons/0/close') : (isActiveLesson ? scoped('/stop') : lessonLaunchPath(lesson.id)),
        {},
        isActiveLesson
          ? (isLessonZero ? 'מסיימים את שיעור 0, מורידים את השרת ומבקשים דוח…' : `סוגרים את עולם Minecraft לשיעור ${lesson.id}…`)
          : (isLessonZero ? 'מפעילים את עולם Minecraft לשיעור הפתיחה…' : `מפעילים את עולם Minecraft לשיעור ${lesson.id}…`),
        isActiveLesson
          ? (isLessonZero ? 'שיעור 0 נסגר, השרת ירד והדוח נטען ללומדה.' : `עולם Minecraft לשיעור ${lesson.id} נסגר.`)
          : (isLessonZero ? 'עולם Minecraft לשיעור הפתיחה פעיל.' : `עולם Minecraft לשיעור ${lesson.id} פעיל.`)
      ));
      if (!(isLessonZero && isActiveLesson)) actionRow.append(launch);
      if (Number(lesson.id) >= 1) {
        const link = node('a', 'תצוגת תלמיד', 'secondary-action teacher-next-lesson teacher-preview-action');
        link.href = studentPreviewUrl(lesson.id);
        actionRow.append(link);
        const slides = node('a', 'מצגת מדריך', 'secondary-action teacher-slides-action');
        slides.href = `craftom-minecraft-slides.html?challenge=${lesson.challengeId || Math.ceil(Number(lesson.id) / 4)}&${teacherReturnQuery(lesson.id)}`;
        actionRow.append(slides);
      }
      return actionRow;
    }

    function teacherLessonAccessNotice(lessonId) {
      const id = Number(lessonId);
      if (id < 1 || !lessonAccessInfo(id).open) return null;
      const notice = node('div', undefined, 'selected-lesson-status is-open');
      notice.append(
        node('strong', `שיעור ${id} פתוח לתלמידים`),
        node('span', `הפעולות כאן שייכות לשיעור ${id}.`)
      );
      return notice;
    }

    function renderSelectedLesson(lesson, session, activeLessonId, minecraftBlocked, updatePageHeader = true, showVideo = true) {
      if (!lesson || !selectedLessonActions) return;
      const lessonId = Number(lesson.id);
      const challengeId = lessonChallengeId(lessonId);
      const videoInfo = selectedLessonVideoInfo(lesson);
      selectedLessonEyebrow.textContent = lessonId === 0 ? 'שיעור פתיחה' : `אתגר ${challengeId} • שיעור ${lessonId}`;
      selectedLessonTitle.textContent = `פעולות לשיעור ${lessonId}`;
      selectedLessonSummary.textContent = '';
      selectedLessonSummary.hidden = true;
      if (updatePageHeader) {
        teacherLessonKicker.textContent = lessonId === 0 ? 'שיעור 0 • משימת פתיחה' : `אתגר ${challengeId} • שיעור ${lessonId}`;
        teacherLessonTitle.textContent = lesson.title || `שיעור ${lessonId}`;
        teacherLessonGoal.textContent = lesson.summary || 'מסך ניהול קצר לשיעור: פתיחת גישה, צפייה כתלמיד ומצגת מדריך.';
      }
      const actions = renderTeacherLessonActions(lesson, session, activeLessonId, minecraftBlocked);
      const openButton = openLessonButton(lessonId, `פתיחת שיעור ${lessonId} לתלמידים`);
      if (openButton) actions.prepend(openButton);
      const closeButton = closeLessonButton(lessonId, lessonId === 0 ? 'סיום שיעור 0' : `לנעול שיעור ${lessonId}`);
      if (closeButton && lessonId !== 0) actions.prepend(closeButton);
      const accessNotice = teacherLessonAccessNotice(lessonId);
      if (accessNotice) actions.prepend(accessNotice);
      selectedLessonActions.replaceChildren(...actions.childNodes);
      if (selectedLessonVideoPanel) selectedLessonVideoPanel.hidden = !showVideo || !videoInfo;
      if (showVideo && videoInfo && selectedLessonVideoPreview) {
        if (selectedLessonVideoEyebrow) selectedLessonVideoEyebrow.textContent = videoInfo.eyebrow;
        if (selectedLessonVideoTitle) selectedLessonVideoTitle.textContent = videoInfo.title;
        if (selectedLessonVideoSummary) selectedLessonVideoSummary.textContent = videoInfo.summary;
        renderTeacherVideoPreview(videoInfo.src, videoInfo.poster, videoInfo.title, selectedLessonVideoPreview);
      }
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
      const closeButton = closeLessonButton(lesson.id, `נעילת שיעור ${lesson.id}`);
      actions.append(choose, preview, ...(openButton ? [openButton] : []), ...(closeButton ? [closeButton] : []));
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

    function renderLessonZeroEndPanel(showingLessonManagement, selectedLessonId, activeLessonId, session, hasClassReport) {
      if (!lessonZeroEndPanel) return;
      const showEndPanel = Boolean(showingLessonManagement
        && Number(selectedLessonId) === 0
        && Number(activeLessonId) === 0
        && session?.active
        && session?.serverState === 'running');
      const showRestartPanel = Boolean(showingLessonManagement
        && Number(selectedLessonId) === 0
        && !showEndPanel
        && hasClassReport);
      const showPanel = showEndPanel || showRestartPanel;
      lessonZeroEndPanel.hidden = !showPanel;
      lessonZeroEndPanel.classList.toggle('is-restart', showRestartPanel);
      if (!showPanel) {
        lessonZeroEndPanel.replaceChildren();
        return;
      }

      const copy = node('div', undefined, 'lesson-zero-end-copy');
      const button = showRestartPanel
        ? node('button', 'הפעלת שיעור 0 מחדש', 'btn restart-lesson-zero-action')
        : closeLessonButton(0, 'סיום שיעור 0 והפקת דוח');
      if (showRestartPanel) {
        copy.append(
          node('strong', 'הפעלת שיעור 0 מחדש'),
          node('span', 'מעלה מחדש את שרת Minecraft לשיעור הפתיחה, מאפס את מצב המבוך והמעקב במסך, ומשאיר את הדוח הקודם כסיכום של הסבב שהסתיים.'),
        );
        button.type = 'button';
        button.addEventListener('click', restartLessonZeroFromReport);
      } else {
        copy.append(
          node('strong', 'סיום שיעור 0'),
          node('span', 'מסיים את שיעור הפתיחה בלבד, מבקש דוח מהמוניטור, מכבה את שרת Minecraft ולא פותח את שיעור 1.'),
        );
      }
      lessonZeroEndPanel.replaceChildren(copy, ...(button ? [button] : []));
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
      const showingLessonActions = !showingChallengeOverview && (showingLessonManagement || showingTeacherHome);
      if (selectedTeacherLesson) selectedTeacherLesson.hidden = !showingLessonActions;
      if (selectedLessonVideoPanel) selectedLessonVideoPanel.hidden = true;
      if (selectedTeacherLesson && showingLessonActions) selectedTeacherLesson.hidden = false;
      if (showingLessonActions) renderSelectedLesson(selectedLesson, session, activeLessonId, minecraftBlocked, showingLessonManagement, showingLessonManagement);
      const liveMinecraft = liveMinecraftControlsAvailable();
      if (teacherStudentBoard) teacherStudentBoard.hidden = !showingLessonManagement;
      if (teacherLiveControls) {
        teacherLiveControls.hidden = !showingLessonManagement || !liveMinecraft;
        if (!teacherLiveControls.hidden) teacherLiveControls.open = true;
      }
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
      renderConnectionSummary(data.students || [], data.metrics || {}, liveMinecraft, data.minecraftConfigured);
      const monitorItems = [];
      if (data.classStageReport) latestClosedClassStageReport = data.classStageReport;
      const classReport = renderClassStageReport(data.classStageReport || latestClosedClassStageReport);
      if (classReport) monitorItems.push(classReport);
      if (data.loadingClassroom && (data.students || []).length) {
        const loadingNotice = node('div', undefined, 'teacher-status-loading-card');
        loadingNotice.append(
          node('strong', 'סטטוסי התלמידים בטעינה'),
          node('span', 'רשימת התלמידים כבר מוצגת. כשהמוניטור יסיים לטעון, החיבור וההתקדמות יתעדכנו אוטומטית.'),
        );
        monitorItems.push(loadingNotice);
      }
      monitorItems.push(...(data.students || []).map(renderStudent));
      monitor.replaceChildren(...monitorItems);
      if (!data.students?.length) {
        monitor.append(node('p', data.loadingClassroom ? 'טוענים את תלמידי הכיתה…' : 'עדיין אין תלמידים בכיתה.'));
      }
      renderLessonZeroEndPanel(showingLessonManagement, selectedLessonId, activeLessonId, session, Boolean(classReport));
      if (activeTeacherStudentModalKey) {
        const modalStudent = (data.students || []).find(student => teacherStudentCardKey(student) === activeTeacherStudentModalKey);
        if (modalStudent && !data.loadingClassroom) {
          activeTeacherStudentModalSnapshot = modalStudent;
          const nextSignature = teacherStudentDetailSignature(modalStudent);
          if (nextSignature !== activeTeacherStudentModalSignature) {
            renderTeacherStudentModalContent(modalStudent, { preserveScroll: true });
          }
        } else if (modalStudent && !activeTeacherStudentModalSnapshot) {
          activeTeacherStudentModalSnapshot = modalStudent;
        }
      }
    }

    async function refresh() {
      if (teacherRefreshInFlight) return;
      teacherRefreshInFlight = true;
      try {
        if (!current) render(teacherFallbackHomeData());
        if (!classroomId) {
          try {
            if (!await resolveTeacherClassroomId()) {
              render(teacherFallbackHomeData());
              return;
            }
          } catch (error) {
            setStatus(status, error.message || 'חסר מזהה כיתה. יש לפתוח את הלוח מתוך כרטיס הכיתה.', true);
            render(teacherFallbackHomeData());
            return;
          }
        }
        const lessonFilter = hasRequestedLesson ? `&lessonId=${encodeURIComponent(String(requestedLessonId))}` : '';
        try {
          await renderTeacherRosterFallback();
        } catch (error) {
          // The full lesson session is the source of truth; roster fallback is only a calming interim state.
        }
        render(await api(`/api/kugel/session?classroomId=${encodeURIComponent(classroomId)}${lessonFilter}`));
      } catch (error) {
        const message = teacherLoadFailureMessage(error);
        setStatus(status, message, true);
        renderTeacherLoadFailure(message);
      } finally {
        teacherRefreshInFlight = false;
      }
    }

    function teacherRefreshDelay() {
      return document.hidden ? TEACHER_BACKGROUND_REFRESH_MS : TEACHER_REFRESH_MS;
    }

    function scheduleTeacherRefresh(delay = teacherRefreshDelay()) {
      if (teacherRefreshTimer) clearTimeout(teacherRefreshTimer);
      teacherRefreshTimer = setTimeout(async () => {
        await refresh();
        scheduleTeacherRefresh();
      }, delay);
    }

    enhanceCommandAction(document.querySelector('#classMessageForm button[type="submit"]'), 'chat');
    enhanceCommandAction(document.getElementById('freezeAll'), 'freeze');
    enhanceCommandAction(document.getElementById('releaseAll'), 'release');

    document.getElementById('stopLesson')?.addEventListener('click', () => teacherAction(scoped('/stop'), {}, 'מסיימים את השיעור…', 'השיעור הסתיים והשרת שוחרר.'));
    document.getElementById('classMessageForm').addEventListener('submit', async event => {
      event.preventDefault();
      await teacherAction(scoped('/message'), { scope: 'all', text: classMessage.value }, 'שולחים לכיתה…', 'ההודעה נשלחה לכיתה.');
      classMessage.value = '';
    });
    document.getElementById('freezeAll').addEventListener('click', () => teacherAction(scoped('/freeze'), { scope: 'all', on: true }, 'עוצרים את הכיתה…', 'הכיתה נעצרה.'));
    document.getElementById('releaseAll').addEventListener('click', () => teacherAction(scoped('/freeze'), { scope: 'all', on: false }, 'משחררים את הכיתה…', 'הכיתה שוחררה.'));
    document.getElementById('refreshBoard').addEventListener('click', async () => {
      if (teacherRefreshTimer) clearTimeout(teacherRefreshTimer);
      await refresh();
      scheduleTeacherRefresh();
    });
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
    scheduleTeacherRefresh();
    document.addEventListener('visibilitychange', () => scheduleTeacherRefresh(document.hidden ? TEACHER_BACKGROUND_REFRESH_MS : 0));
  }

  canonicalizeTeacherUrl();
  if (page === 'student') initStudent();
  if (page === 'teacher') initTeacher();
})();
