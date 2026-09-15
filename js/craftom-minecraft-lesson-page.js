(function () {
  const params = new URLSearchParams(location.search);
  const lessonNumber = document.body.dataset.lesson || params.get('lesson') || 1;
  const lesson = window.getCraftomMinecraftLesson(lessonNumber);
  const program = window.CRAFTOM_MINECRAFT_PROGRAM;
  const challengeLessons = program.lessons.filter(item => item.challengeId === lesson.challengeId);
  const esc = value => String(value || '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
  const fallbackReflectionQuestion = 'מה הדבר המרכזי שלמדתם במפגש הזה, ואיך השתמשתם בו בבנייה או בקוד?';

  function teacherManagementUrl() {
    const next = new URLSearchParams();
    const classroomId = params.get('classroomId');
    if (classroomId) next.set('classroomId', classroomId);
    next.set('lesson', String(lesson.id));
    return `kugel-teacher.html?${next.toString()}`;
  }

  function renderTeacherReturnAction() {
    if (params.get('teacherReturn') !== '1') return;
    document.getElementById('teacherReturnAction')?.remove();
    document.body.insertAdjacentHTML('afterbegin', `
      <div class="teacher-return-action" id="teacherReturnAction">
        <a class="btn secondary" href="${teacherManagementUrl()}">חזרה לניהול שיעור מורה</a>
      </div>
    `);
  }

  function renderCourseHeader() {
    document.getElementById('courseHeader')?.remove();
    document.body.insertAdjacentHTML('afterbegin', `
      <header class="course-header" id="courseHeader" aria-label="ניווט אקדמיית ה-Agent">
        <div class="course-header-inner">
          <a class="course-brand" href="craftom-school/preview/index.html">אקדמיית ה-Agent</a>
          <nav class="course-nav" id="courseHeaderNav" aria-label="מעבר מהיר">
            <a href="craftom-school/preview/index.html">דף הבית</a>
            <a class="primary" href="craftom-minecraft-lesson-${lesson.id}.html">השיעור הנוכחי</a>
            ${program.challenges.map(challenge => `<a href="craftom-minecraft-challenge.html?challenge=${challenge.id}">אתגר ${challenge.id}</a>`).join('')}
          </nav>
        </div>
      </header>
    `);
  }

  function list(items) {
    return items.map(item => `<li>${esc(item)}</li>`).join('');
  }

  function explainCommand(command) {
    const text = String(command || '').trim();
    if (!text) return '';
    let explanation = 'פקודה שתשתמש בה כדי לבנות את רצף הפעולות של ה-Agent.';
    if (/on chat command/i.test(text) || /^פקודת/.test(text)) {
      explanation = 'פקודה שמפעילה את הקוד כשכותבים את השם שלה בצ׳אט של Minecraft.';
    } else if (/teleportToPlayer/i.test(text)) {
      explanation = 'מזמנת את ה-Agent אליך, כדי להתחיל מנקודת מוצא ברורה.';
    } else if (/agent\.move/i.test(text) || /תנועה/.test(text)) {
      explanation = 'מזיזה את ה-Agent בכיוון ובמספר צעדים שתבחר. שינוי המספר משנה את המרחק.';
    } else if (/agent\.turn/i.test(text) || /פנייה/.test(text)) {
      explanation = 'מסובבת את ה-Agent ימינה או שמאלה כדי להמשיך במסלול אחר.';
    } else if (/agent\.place|agent\.drop|הנחת|מסירה/i.test(text)) {
      explanation = 'גורמת ל-Agent להניח או למסור משהו בעולם, כדי שהפעולה תהיה נראית במיינקראפט.';
    } else if (/player\.say|הודעת|מדווח|אומר/i.test(text)) {
      explanation = 'מציגה הודעה שמסבירה מה קרה בהרצה.';
    } else if (/running|start|stop/i.test(text)) {
      explanation = 'עוזרת לשלוט מתי האוטומציה מתחילה ומתי היא נעצרת.';
    } else if (/forever|repeat|לולאה|חזרות/i.test(text)) {
      explanation = 'חוזרת על אותה פעולה כמה פעמים, כדי שלא תצטרך לשכפל את אותם בלוקים.';
    } else if (/pause/i.test(text)) {
      explanation = 'יוצרת המתנה קצרה בין פעולות, כדי שההרצה תהיה ברורה ולא מהירה מדי.';
    } else if (/if|else|תנאי|שני מצבים/i.test(text)) {
      explanation = 'מאפשרת ל-Agent לבחור פעולה לפי מצב בעולם: אם משהו נכון עושים פעולה אחת, אחרת עושים פעולה אחרת.';
    } else if (/detect|routeOpen|פתוחה|חסומה|סימון|ערך/i.test(text)) {
      explanation = 'בודקת או מייצגת מצב בעולם, למשל דרך פתוחה או חסומה.';
    } else if (/אלגוריתם|תכנון|בחירה|החלטה/i.test(text)) {
      explanation = 'עוזרת לך לתכנן מראש מה ה-Agent צריך לעשות לפני שכותבים בלוקים.';
    } else if (/test|בדיקה|תיקון/i.test(text)) {
      explanation = 'משמשת להרצה שמטרתה לבדוק מה עובד ומה צריך לתקן.';
    } else if (/demo|הצגה|סיום/i.test(text)) {
      explanation = 'משמשת להצגת התוצר הסופי בצורה מסודרת.';
    }
    return `<li><strong>${esc(text)}</strong><span>${esc(explanation)}</span></li>`;
  }

  function commandList(items) {
    return items.map(explainCommand).join('');
  }

  function fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = () => reject(new Error('file_read_failed'));
      reader.readAsDataURL(file);
    });
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

  function ensureMinecraftEntryCard() {
    let card = document.getElementById('minecraftEntryCard');
    if (card) return card;
    card = document.createElement('section');
    card.className = 'card minecraft-entry-card';
    card.id = 'minecraftEntryCard';
    card.innerHTML = `
      <div class="minecraft-entry-copy">
        <span class="tag">Minecraft Education</span>
        <h2>כניסה לעולם Minecraft של השיעור</h2>
        <p id="minecraftEntryStatus">בודקים אם המורה הפעילה את העולם…</p>
        <p class="minecraft-entry-details" id="minecraftEntryDetails"></p>
      </div>
      <div class="minecraft-entry-actions">
        <button class="btn" id="minecraftEntryLaunch" type="button" disabled>פתיחת Minecraft</button>
        <button class="btn secondary" id="minecraftEntryRefresh" type="button">רענון</button>
      </div>
      <p class="submit-status" id="minecraftEntryMessage" role="status" aria-live="polite"></p>
    `;
    const academyCard = document.getElementById('agentAcademyCta');
    const makeCodeWorkspace = document.getElementById('makeCodeWorkspace');
    const detailGrid = document.querySelector('.detail-grid');
    const hero = document.querySelector('.hero');
    const anchor = academyCard && !academyCard.hidden
      ? academyCard
      : (makeCodeWorkspace && !makeCodeWorkspace.hidden ? makeCodeWorkspace : detailGrid || hero);
    anchor?.insertAdjacentElement('afterend', card);
    return card;
  }

  function ensureMinecraftTopLink() {
    if (document.getElementById('minecraftEntryTopLink')) return;
    const actions = document.querySelector('.hero .actions');
    if (!actions) return;
    const link = document.createElement('a');
    link.className = 'btn minecraft-entry-top-link';
    link.id = 'minecraftEntryTopLink';
    link.href = '#minecraftEntryCard';
    link.textContent = 'כניסה ל-Minecraft';
    actions.insertBefore(link, actions.firstChild);
  }

  function ensureAgentAcademyTopLink() {
    let link = document.getElementById('agentAcademyTopLink');
    const actions = document.querySelector('.hero .actions');
    if (!actions) return null;
    if (link) return link;
    link = document.createElement('a');
    link.className = 'btn secondary agent-academy-top-link';
    link.id = 'agentAcademyTopLink';
    link.textContent = 'פתיחת אקדמיית Agent';
    actions.appendChild(link);
    return link;
  }

  function agentAcademyUrl() {
    const next = new URLSearchParams();
    next.set('lesson', String(lesson.id));
    if (params.get('teacherReturn') === '1') {
      next.set('teacherReturn', '1');
      const classroomId = params.get('classroomId');
      if (classroomId) next.set('classroomId', classroomId);
    }
    return `craftom-agent-academy.html?${next.toString()}`;
  }

  async function initMinecraftEntry() {
    let me = null;
    try {
      me = await api('/api/classroom/me');
    } catch {
      return;
    }
    if (!me || me.role !== 'student') return;

    const card = ensureMinecraftEntryCard();
    ensureMinecraftTopLink();
    const status = card.querySelector('#minecraftEntryStatus');
    const details = card.querySelector('#minecraftEntryDetails');
    const message = card.querySelector('#minecraftEntryMessage');
    const launch = card.querySelector('#minecraftEntryLaunch');
    const refreshButton = card.querySelector('#minecraftEntryRefresh');
    let currentSession = null;

    function setMessage(text, failed = false) {
      message.textContent = text || '';
      message.classList.toggle('error', failed);
    }

    function render(data) {
      currentSession = data;
      const activeLessonId = Number(data.session?.lessonId ?? 0);
      const currentLessonId = Number(lesson.id);
      const activeForThisLesson = Boolean(data.session?.active && activeLessonId === currentLessonId);
      const minecraft = data.minecraft;
      const student = data.student || {};

      if (!data.session?.active) {
        status.textContent = `המורה עדיין לא פתחה את שיעור ${currentLessonId} ב-Minecraft.`;
        details.textContent = '';
      } else if (!activeForThisLesson) {
        status.textContent = `המורה פתחה כרגע את שיעור ${activeLessonId}. כדי להיכנס לשיעור הזה צריך לפתוח את שיעור ${currentLessonId}.`;
        details.textContent = '';
      } else if (!student.minecraftPlayerName) {
        status.textContent = 'המורה עדיין לא שייכה לך שם שחקן Minecraft.';
        details.textContent = '';
      } else {
        status.textContent = `עולם Minecraft נפתח לשיעור ${currentLessonId}. אפשר לפתוח את Minecraft ולהיכנס לעולם.`;
        details.textContent = minecraft
          ? `שרת: ${minecraft.serverName} • כתובת: ${minecraft.serverAddress} • Server ID: ${minecraft.serverId}`
          : 'פרטי השרת יוצגו לאחר שהעולם יהיה זמין.';
      }

      launch.disabled = !(activeForThisLesson && student.minecraftPlayerName && minecraft);
    }

    async function refresh() {
      try {
        render(await api('/api/kugel/session'));
      } catch (error) {
        status.textContent = error.message || 'לא ניתן לבדוק כרגע את מצב Minecraft.';
        details.textContent = '';
        launch.disabled = true;
      }
    }

    launch.addEventListener('click', async () => {
      setMessage('פותחים את Minecraft…');
      try {
        const data = await api('/api/kugel/student/start', {});
        setMessage('Minecraft נפתח. אם האפליקציה לא נפתחה, השתמשו בפרטי השרת שמופיעים כאן.');
        if (data.minecraft?.launchUrl) location.href = data.minecraft.launchUrl;
        await refresh();
      } catch (error) {
        setMessage(error.message, true);
      }
    });

    refreshButton.addEventListener('click', refresh);
    await refresh();
    setInterval(refresh, 5000);
  }

  const makeCodeSnippets = {
    1: `player.onChat("deliver", function () {
    agent.teleportToPlayer()
    agent.move(FORWARD, 5)
})`,
    2: `player.onChat("deliver", function () {
    agent.teleportToPlayer()
    agent.move(FORWARD, 4)
    agent.turn(LEFT_TURN)
    agent.move(FORWARD, 3)
})`,
    3: `player.onChat("deliver", function () {
    agent.teleportToPlayer()
    agent.setItem(DIRT, 1, 1)
    agent.move(FORWARD, 5)
    agent.place(DOWN)
    player.say("המשלוח הגיע")
})`,
    4: `player.onChat("deliver", function () {
    agent.teleportToPlayer()
    agent.setItem(DIRT, 1, 1)
    agent.move(FORWARD, 4)
    agent.turn(LEFT_TURN)
    agent.move(FORWARD, 3)
    agent.place(DOWN)
})`,
    5: `player.onChat("deliver", function () {
    agent.teleportToPlayer()
    agent.move(FORWARD, 5)
    agent.place(DOWN)
    player.say("משלוח אחד הסתיים")
})`,
    6: `player.onChat("cycle", function () {
    agent.teleportToPlayer()
    agent.move(FORWARD, 5)
    agent.place(DOWN)
    agent.turn(LEFT_TURN)
    agent.turn(LEFT_TURN)
    agent.move(FORWARD, 5)
})`,
    7: `let running = false

player.onChat("start", function () {
    running = true
})

player.onChat("stop", function () {
    running = false
})

loops.forever(function () {
    if (running) {
        agent.move(FORWARD, 5)
        agent.place(DOWN)
        agent.turn(LEFT_TURN)
        agent.turn(LEFT_TURN)
        agent.move(FORWARD, 5)
    }
    loops.pause(500)
})`,
    8: `let running = false

player.onChat("start", function () {
    running = true
})

player.onChat("stop", function () {
    running = false
})

loops.forever(function () {
    if (running) {
        agent.move(FORWARD, 6)
        agent.place(DOWN)
        agent.turn(LEFT_TURN)
        agent.move(FORWARD, 2)
        agent.turn(LEFT_TURN)
        agent.move(FORWARD, 6)
    }
    loops.pause(500)
})`,
    9: `let routeOpen = true

player.onChat("open", function () {
    routeOpen = true
    player.say("הדרך פתוחה")
})

player.onChat("close", function () {
    routeOpen = false
    player.say("הדרך חסומה")
})`,
    10: `let routeOpen = true

player.onChat("start", function () {
    if (routeOpen) {
        agent.move(FORWARD, 5)
        player.say("ממשיכים במסלול")
    } else {
        player.say("ממתינים לפתיחת הדרך")
    }
})`,
    11: `let routeOpen = false

player.onChat("test", function () {
    if (routeOpen) {
        agent.move(FORWARD, 5)
    } else {
        player.say("הדרך חסומה - מחכים")
        loops.pause(1000)
    }
})`,
    12: `let stationFull = false

player.onChat("test", function () {
    if (stationFull) {
        player.say("התחנה מלאה - עוברים לתחנה אחרת")
    } else {
        agent.move(FORWARD, 5)
        agent.place(DOWN)
        player.say("החבילה נמסרה")
    }
})`,
    13: `player.onChat("plan", function () {
    player.say("מערכת 1: קו משלוחים")
    player.say("מערכת 2: שער או תחנת איסוף")
})`,
    14: `player.onChat("start", function () {
    agent.teleportToPlayer()
    agent.move(FORWARD, 4)
    agent.place(DOWN)
    player.say("אוטומציה חדשה הופעלה")
})`,
    15: `player.onChat("test", function () {
    player.say("בודקים אוטומציה חדשה")
    agent.move(FORWARD, 4)
    player.say("בודקים מערכת קיימת")
    agent.turn(LEFT_TURN)
    agent.move(FORWARD, 2)
})`,
    16: `player.onChat("demo", function () {
    player.say("דמו עיר חכמה מתחיל")
    agent.move(FORWARD, 4)
    agent.place(DOWN)
    player.say("מערכת משלוחים עובדת")
    agent.turn(LEFT_TURN)
    agent.move(FORWARD, 3)
    player.say("אוטומציה נוספת עובדת")
})`
  };

  async function renderQaCourseSwitcher() {
    let me = null;
    try {
      const response = await fetch('/api/classroom/me', { credentials: 'same-origin' });
      me = await response.json();
    } catch {
      return;
    }
    if (!me || me.role !== 'student' || !me.student?.qaLessonMapping) return;
    const switcher = document.createElement('section');
    switcher.className = 'qa-course-switcher';
    switcher.innerHTML = `
      <strong>בדיקת שיעורים</strong>
      <small>פתוח רק לתלמידת בדיקה לצורך מיפוי.</small>
      <nav aria-label="מעבר מהיר בין שיעורי Craftom">
        <a href="kugel-student.html">0</a>
        ${Array.from({ length: 16 }, (_, index) => {
          const id = index + 1;
          return `<a class="${id === Number(lesson.id) ? 'active' : ''}" href="craftom-minecraft-lesson-${id}.html">${id}</a>`;
        }).join('')}
      </nav>
    `;
    const target = document.getElementById('lessonNav') || document.querySelector('.hero') || document.querySelector('main');
    target?.insertAdjacentElement('beforebegin', switcher);
  }

  if (!document.getElementById('lessonNav')) {
    document.body.innerHTML = `
      <main class="shell">
        <nav class="lesson-nav" id="lessonNav" aria-label="בחירת שיעור באתגר הנוכחי"></nav>
        <nav class="lesson-progress-nav" aria-label="שלבי המפגש">
          <a href="#lessonIntro">פתיחה</a>
          <span aria-hidden="true">←</span>
          <a href="#agentAcademyCta">אקדמיית Agent</a>
          <span aria-hidden="true">←</span>
          <a href="#minecraftEntryCard">Minecraft</a>
          <span aria-hidden="true">←</span>
          <a href="#exitTicketSection">כרטיס יציאה</a>
        </nav>
        <section class="hero" id="lessonIntro">
          <div>
            <div class="kicker" id="kicker"></div>
            <h1 id="title"></h1>
            <p class="goal" id="summary"></p>
            <p><strong>תוצר:</strong> <span id="deliverable"></span></p>
            <div class="actions"></div>
          </div>
          <figure class="minecraft-shot">
            <video id="video" class="lesson-video" controls preload="metadata" playsinline></video>
            <figcaption class="shot-caption"><span id="concept"></span></figcaption>
          </figure>
        </section>
        <section class="grid" style="margin-top:16px">
          <article class="card build-first"><h2>מה תלמד בשיעור</h2><p id="goal"></p></article>
          <article class="card build-first"><h2>פקודות מרכזיות</h2><ul id="command" class="command-explain-list"></ul></article>
        </section>
        <section class="detail-grid" style="margin-top:16px">
          <article class="detail-box"><h2>איך עובדים לבד</h2><ul id="selfStudy"></ul></article>
          <article class="detail-box"><h2>מה בונים במיינקראפט</h2><ul id="build"></ul></article>
          <article class="detail-box"><h2>קוד / MakeCode</h2><ul id="code"></ul></article>
          <article class="detail-box"><h2>מה מעלים בסוף</h2><p id="exitUpload"></p></article>
        </section>
        <section class="card agent-academy-cta" id="agentAcademyCta" style="margin-top:16px" hidden>
          <span class="tag">חובה: קודם תרגול</span>
          <h2>אקדמיית Agents לתרגול MakeCode</h2>
          <p>כאן לא פותחים את ה-Code Builder הרגיל. קודם נכנסים לאקדמיה, בונים את הקוד בבלוקים, עוברים לטאב Python אם רוצים, מריצים את ה-Agent בהדמיה ומקבלים בדיקה אוטומטית.</p>
          <p class="agent-academy-flow">אחרי שהתרגול עובר בדיקה, חוזרים לשיעור ומיישמים את אותו רעיון בתוך Minecraft Education.</p>
          <a class="btn agent-academy-primary-link" id="agentAcademyLink" href="#">פתיחת אקדמיית Agents</a>
        </section>
        <section class="card makecode-workspace" id="makeCodeWorkspace" style="margin-top:16px">
          <div>
            <span class="tag">MakeCode</span>
            <h2>Code Builder לתכנון</h2>
            <p>גררו בלוקים מהמחסנית, תכננו את פעולות ה-Agent, עברו בין JavaScript/Python והעתיקו את הקוד ל-Code Builder בתוך Minecraft Education.</p>
          </div>
          <div class="makecode-mode-tabs" role="tablist" aria-label="בחירת מצב Code Builder">
            <button class="active" type="button" data-craftom-code-mode="blocks">בלוקים</button>
            <button type="button" data-craftom-code-mode="python">Python</button>
            <button type="button" data-craftom-code-mode="javascript">JavaScript</button>
          </div>
          <div class="makecode-editor-frame">
            <div id="craftomBlockly" class="craftom-blockly" aria-label="עורך בלוקים לתכנון MakeCode"></div>
            <pre id="makeCodeSnippet" class="makecode-code" dir="ltr" hidden></pre>
          </div>
          <div class="actions">
            <button class="btn" id="copyMakeCode" type="button">העתקת קוד</button>
            <a class="btn secondary" href="https://minecraft.makecode.com/" target="_blank" rel="noopener">פתיחת MakeCode</a>
          </div>
        </section>
        <section class="card" id="exitTicketSection" style="margin-top:16px">
          <h2>כרטיס יציאה</h2>
          <p><strong>העלאת תמונה:</strong> <span id="exitUploadInline"></span></p>
          <form class="exit-ticket-form" id="exitTicketForm">
            <label>
              <span>שאלת כרטיס היציאה</span>
              <strong id="exitTicket" class="exit-ticket-question"></strong>
              <textarea id="exitAnswer" name="answer" required rows="4" placeholder="כתוב כאן את התשובה הקצרה שלך"></textarea>
            </label>
            <label>
              <span>שאלת חשיבה נוספת</span>
              <strong id="exitReflectionQuestion" class="exit-ticket-question">${fallbackReflectionQuestion}</strong>
              <textarea id="exitReflection" name="reflection" required rows="4" placeholder="כתוב תשובה שמתייחסת למה שלמדת במפגש הזה"></textarea>
            </label>
            <label>
              <span>תמונה של מה שבניתם במיינקראפט</span>
              <input id="exitPhoto" name="photo" type="file" accept="image/png,image/jpeg,image/webp" required>
            </label>
            <button class="btn" id="exitSubmit" type="submit">הגשת כרטיס יציאה</button>
            <p class="submit-status" id="exitSubmitStatus" role="status" aria-live="polite"></p>
          </form>
          <div class="existing-submission" id="existingSubmission" hidden></div>
        </section>
        <div class="actions">
          <a class="btn secondary" id="prevLink" href="#">שיעור קודם</a>
          <a class="btn" id="nextLink" href="#">שיעור הבא</a>
          <a class="btn" id="nextChallengeLink" href="#" hidden>לאתגר הבא</a>
          <a class="btn secondary" href="craftom-school/preview/index.html">מפת הקורס</a>
        </div>
      </main>
      <a class="platform-home-link" href="index.html" aria-label="חזרה לעמוד הראשי"><span class="platform-home-icon" aria-hidden="true">🏠</span><span class="platform-home-text">לעמוד הראשי</span></a>
    `;
  }
  renderCourseHeader();
  renderTeacherReturnAction();
  renderQaCourseSwitcher();

  document.title = `שיעור ${lesson.id} - ${lesson.title} | ${program.title}`;
  document.getElementById('kicker').textContent = `${program.grade} • שיעור ${lesson.id} מתוך ${program.totalMeetings} • אתגר ${lesson.challengeId}: ${lesson.challengeTitle}`;
  document.getElementById('title').textContent = lesson.title;
  window.CRAFTOM_CURRENT_MINECRAFT_LESSON = lesson;
  document.getElementById('summary').textContent = lesson.summary;
  document.getElementById('deliverable').textContent = lesson.deliverable;
  document.getElementById('concept').textContent = lesson.concept;
  document.getElementById('goal').textContent = lesson.detail.learn || lesson.detail.goal;
  document.getElementById('command').innerHTML = commandList(lesson.detail.code || [lesson.command]);
  const selfStudySteps = lesson.detail.academy
    ? [
        'צפה בסרטון והבן מה צריך לקרות בעיר.',
        'היכנס לאקדמיית Agents ותרגל שם את קוד ה-MakeCode בבלוקים.',
        'הרץ את ה-Agent בהדמיה עד שהבדיקה באקדמיה עוברת.',
        'חזור לשיעור ויישם את אותו רעיון בתוך Minecraft Education.',
        'העלה צילום של מה שבנית במיינקראפט ומלא את כרטיס היציאה במילים שלך.'
      ]
    : [
        'צפה בסרטון של האתגר והבן מה צריך לקרות בעיר.',
        'בנה במיינקראפט את החלק הקטן של היום.',
        'פתח MakeCode וכתוב רק את הקוד שמפעיל את ה-Agent.',
        'הרץ, בדוק מה קרה בעולם, תקן דבר אחד והריץ שוב.',
        'העלה צילום של מה שבנית ומלא את כרטיס היציאה במילים שלך.'
      ];
  document.getElementById('selfStudy').innerHTML = list(selfStudySteps);
  document.getElementById('build').innerHTML = list(lesson.detail.build);
  document.getElementById('code').innerHTML = list(lesson.detail.code);
  const academyCta = document.getElementById('agentAcademyCta');
  const makeCodeWorkspace = document.getElementById('makeCodeWorkspace');
  if (lesson.detail.academy && academyCta) {
    academyCta.hidden = false;
    const academyHref = agentAcademyUrl();
    document.getElementById('agentAcademyLink').href = academyHref;
    const academyTopLink = ensureAgentAcademyTopLink();
    if (academyTopLink) academyTopLink.href = academyHref;
    if (makeCodeWorkspace) makeCodeWorkspace.hidden = true;
  }
  initMinecraftEntry();
  document.getElementById('makeCodeSnippet').textContent = makeCodeSnippets[lesson.id] || makeCodeSnippets[1];
  document.getElementById('exitUpload').textContent = program.exitUpload;
  document.getElementById('exitUploadInline').textContent = program.exitUpload;
  document.getElementById('exitTicket').textContent = lesson.detail.exit;
  const reflectionQuestion = lesson.detail.reflection || fallbackReflectionQuestion;
  const reflectionQuestionNode = document.getElementById('exitReflectionQuestion');
  if (reflectionQuestionNode) reflectionQuestionNode.textContent = reflectionQuestion;
  document.getElementById('video').src = lesson.video;
  document.getElementById('video').poster = lesson.poster;
  const currentLessonIndex = challengeLessons.findIndex(item => item.id === lesson.id);
  const prevLesson = currentLessonIndex > 0 ? challengeLessons[currentLessonIndex - 1] : null;
  const nextLesson = currentLessonIndex < challengeLessons.length - 1 ? challengeLessons[currentLessonIndex + 1] : null;
  const nextChallenge = program.challenges.find(item => item.id === lesson.challengeId + 1);
  const nextChallengeFirstLesson = nextChallenge
    ? program.lessons.find(item => item.challengeId === nextChallenge.id)
    : null;
  const prevLink = document.getElementById('prevLink');
  const nextLink = document.getElementById('nextLink');
  const nextChallengeLink = document.getElementById('nextChallengeLink');
  prevLink.style.display = prevLesson ? '' : 'none';
  nextLink.style.display = nextLesson ? '' : 'none';
  if (prevLesson) prevLink.href = `craftom-minecraft-lesson-${prevLesson.id}.html`;
  if (nextLesson) nextLink.href = `craftom-minecraft-lesson-${nextLesson.id}.html`;
  if (nextChallengeLink && nextChallengeFirstLesson) {
    nextChallengeLink.href = `craftom-minecraft-lesson-${nextChallengeFirstLesson.id}.html`;
  }
  document.getElementById('lessonNav').innerHTML = challengeLessons.map(item => `<a class="${item.id === lesson.id ? 'active' : ''}" href="craftom-minecraft-lesson-${item.id}.html">${item.id}</a>`).join('');

  const copyMakeCodeButton = document.getElementById('copyMakeCode');
  copyMakeCodeButton.addEventListener('click', async () => {
    const originalText = copyMakeCodeButton.textContent;
    try {
      await navigator.clipboard.writeText(document.getElementById('makeCodeSnippet').textContent || '');
      copyMakeCodeButton.textContent = 'הקוד הועתק';
    } catch (error) {
      copyMakeCodeButton.textContent = 'בחרו והעתיקו ידנית';
    }
    setTimeout(() => {
      copyMakeCodeButton.textContent = originalText;
    }, 1700);
  });

  const form = document.getElementById('exitTicketForm');
  const status = document.getElementById('exitSubmitStatus');
  const submitButton = document.getElementById('exitSubmit');
  const existingSubmission = document.getElementById('existingSubmission');

  function renderSubmission(submission) {
    if (!existingSubmission) return;
    if (!submission) {
      existingSubmission.hidden = true;
      existingSubmission.innerHTML = '';
      return;
    }
    if (submission && !nextLesson && nextChallengeLink) {
      nextChallengeLink.hidden = !nextChallengeFirstLesson;
    }
    existingSubmission.hidden = false;
    existingSubmission.innerHTML = `
      <h3>ההגשה השמורה שלי</h3>
      <div class="submission-preview">
        <a href="${esc(submission.photo.url)}" target="_blank" rel="noopener">
          <img src="${esc(submission.photo.url)}" alt="תמונת העבודה שהוגשה">
        </a>
        <div>
          <p><strong>עודכן:</strong> ${esc(new Date(submission.updatedAt).toLocaleString('he-IL'))}</p>
          <p><strong>תשובה:</strong> ${esc(submission.exitAnswer)}</p>
          <p>${submission.replaced ? 'התמונה הוחלפה לאחר ההגשה הראשונה.' : 'זו ההגשה הראשונה לשיעור הזה.'}</p>
        </div>
      </div>
    `;
  }

  async function loadOwnSubmission() {
    try {
      const response = await fetch(`/api/craftom/submissions?lessonId=${encodeURIComponent(String(lesson.id))}`, { credentials: 'same-origin' });
      const data = await response.json().catch(() => ({}));
      if (response.ok) renderSubmission(data.submissions?.[0] || null);
    } catch {
      renderSubmission(null);
    }
  }

  loadOwnSubmission();
  form.addEventListener('submit', async event => {
    event.preventDefault();
    status.textContent = '';
    const photo = document.getElementById('exitPhoto').files[0];
    const answer = document.getElementById('exitAnswer').value.trim();
    const reflection = document.getElementById('exitReflection')?.value.trim() || '';

    if (!answer) {
      status.textContent = 'כתוב תשובה קצרה לפני ההגשה.';
      return;
    }
    if (!reflection) {
      status.textContent = 'כתוב תשובה לשאלת החשיבה הנוספת לפני ההגשה.';
      return;
    }
    if (!photo) {
      status.textContent = 'צרפו תמונה של מה שבניתם לפני ההגשה.';
      return;
    }
    if (photo.size > 5 * 1024 * 1024) {
      status.textContent = 'התמונה גדולה מדי. אפשר להעלות תמונה עד 5MB.';
      return;
    }

    submitButton.disabled = true;
    submitButton.textContent = 'שולחים...';
    try {
      const photoDataUrl = await fileToDataUrl(photo);
      const response = await fetch('/api/craftom/exit-ticket', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessonId: String(lesson.id),
          lessonTitle: lesson.title,
          challengeId: String(lesson.challengeId),
          challengeTitle: lesson.challengeTitle,
          exitQuestion: `${lesson.detail.exit}\n${reflectionQuestion}`,
          answer: `שאלת כרטיס היציאה: ${answer}\n\nשאלת חשיבה נוספת: ${reflection}`,
          photo: { name: photo.name, dataUrl: photoDataUrl },
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'לא הצלחנו לשמור את ההגשה.');
      form.classList.add('submitted');
      renderSubmission(data.submission || null);
      status.textContent = data.submission?.replaced
        ? 'כרטיס היציאה והתמונה הוחלפו ונשמרו.'
        : `כרטיס היציאה הוגש ונשמר. מספר הגשה: ${data.id}`;
      if (!nextLesson && nextChallengeLink) {
        nextChallengeLink.hidden = !nextChallengeFirstLesson;
      }
    } catch (error) {
      status.textContent = error.message || 'לא הצלחנו לשמור את ההגשה.';
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = 'הגשת כרטיס יציאה';
    }
  });
})();
