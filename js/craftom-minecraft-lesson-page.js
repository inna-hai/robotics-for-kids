(function () {
  const params = new URLSearchParams(location.search);
  const lessonNumber = document.body.dataset.lesson || params.get('lesson') || 1;
  const lesson = window.getCraftomMinecraftLesson(lessonNumber);
  const program = window.CRAFTOM_MINECRAFT_PROGRAM;
  const challengeLessons = program.lessons.filter(item => item.challengeId === lesson.challengeId);
  const esc = value => String(value || '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));

  function list(items) {
    return items.map(item => `<li>${esc(item)}</li>`).join('');
  }

  function academyCards(exercises) {
    return exercises.map((item, index) => `
      <article class="academy-step">
        <span class="academy-step-number">${index + 1}</span>
        <div>
          <h3>${esc(item.title)}</h3>
          <p>${esc(item.mission)}</p>
          <div class="academy-code-lines" dir="ltr">
            ${item.blocks.map(block => `<code>${esc(block)}</code>`).join('')}
          </div>
          <details>
            <summary>Python</summary>
            <pre dir="ltr">${esc(item.python)}</pre>
          </details>
          <strong>${esc(item.check)}</strong>
        </div>
      </article>
    `).join('');
  }

  function fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = () => reject(new Error('file_read_failed'));
      reader.readAsDataURL(file);
    });
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

  if (!document.getElementById('lessonNav')) {
    document.body.innerHTML = `
      <main class="shell">
        <nav class="lesson-nav" id="lessonNav" aria-label="בחירת שיעור באתגר הנוכחי"></nav>
        <section class="hero">
          <div>
            <div class="kicker" id="kicker"></div>
            <h1 id="title"></h1>
            <p class="goal" id="summary"></p>
            <p><strong>תוצר:</strong> <span id="deliverable"></span></p>
            <div class="actions">
              <a class="btn" id="studentLink" href="#">דף עבודה</a>
              <a class="btn secondary" id="slidesLink" href="#">מצגת מדריך</a>
              <a class="btn secondary" id="challengeLink" href="#">דף האתגר</a>
            </div>
          </div>
          <figure class="minecraft-shot">
            <video id="video" class="lesson-video" controls preload="metadata" playsinline></video>
            <figcaption class="shot-caption"><span id="concept"></span></figcaption>
          </figure>
        </section>
        <section class="grid" style="margin-top:16px">
          <article class="card build-first"><h2>יעד השיעור</h2><p id="goal"></p></article>
          <article class="card build-first"><h2>פקודות מרכזיות</h2><p id="command"></p></article>
        </section>
        <section class="detail-grid" style="margin-top:16px">
          <article class="detail-box"><h2>איך עובדים לבד</h2><ul id="selfStudy"></ul></article>
          <article class="detail-box"><h2>מה בונים במיינקראפט</h2><ul id="build"></ul></article>
          <article class="detail-box"><h2>קוד / MakeCode</h2><ul id="code"></ul></article>
          <article class="detail-box"><h2>ראיות Craftom</h2><ul id="evidence"></ul></article>
          <article class="detail-box"><h2>מה מעלים בסוף</h2><p id="exitUpload"></p></article>
        </section>
        <section class="card agent-academy" id="agentAcademy" style="margin-top:16px" hidden>
          <span class="tag">תרגול מדורג</span>
          <h2 id="academyTitle"></h2>
          <p id="academyStory"></p>
          <div class="academy-steps" id="academySteps"></div>
        </section>
        <section class="card makecode-workspace" style="margin-top:16px">
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
        <section class="card" style="margin-top:16px">
          <h2>מצגת מדריך</h2>
          <p>קישור למדריך/ה בלבד. העבודה של התלמיד נמצאת בעמוד הזה ובדף העבודה.</p>
          <a class="btn secondary" id="lessonSlidesBoxLink" href="#">פתיחת המצגת</a>
        </section>
        <section class="card" style="margin-top:16px">
          <span class="tag" id="challengeMapTitle"></span>
          <h2>מפת שיעורי האתגר</h2>
          <div class="challenge-lesson-map" id="challengeLessonMap"></div>
          <div class="actions">
            <a class="btn" id="challengeMapLink" href="#">למפת האתגר</a>
            <a class="btn secondary" href="craftom-school/preview/index.html">לכל האתגרים</a>
          </div>
        </section>
        <section class="card" style="margin-top:16px">
          <h2>כרטיס יציאה</h2>
          <p><strong>העלאת תמונה:</strong> <span id="exitUploadInline"></span></p>
          <form class="exit-ticket-form" id="exitTicketForm">
            <label>
              <span>שם / צוות</span>
              <input id="exitStudentName" name="studentName" autocomplete="name" placeholder="כתבו שם או שם צוות">
            </label>
            <label>
              <span>שאלת כרטיס היציאה</span>
              <strong id="exitTicket" class="exit-ticket-question"></strong>
              <textarea id="exitAnswer" name="answer" required rows="4" placeholder="כתבו כאן את התשובה הקצרה שלכם"></textarea>
            </label>
            <label>
              <span>תמונה של מה שבניתם במיינקראפט</span>
              <input id="exitPhoto" name="photo" type="file" accept="image/png,image/jpeg,image/webp" required>
            </label>
            <button class="btn" id="exitSubmit" type="submit">הגשת כרטיס יציאה</button>
            <p class="submit-status" id="exitSubmitStatus" role="status" aria-live="polite"></p>
          </form>
        </section>
        <div class="actions">
          <a class="btn secondary" id="prevLink" href="#">שיעור קודם</a>
          <a class="btn" id="nextLink" href="#">שיעור הבא</a>
          <a class="btn secondary" href="craftom-school/preview/index.html">מפת הקורס</a>
        </div>
      </main>
      <a class="platform-home-link" href="index.html" aria-label="חזרה לעמוד הראשי"><span class="platform-home-icon" aria-hidden="true">🏠</span><span class="platform-home-text">לעמוד הראשי</span></a>
    `;
  }

  document.title = `שיעור ${lesson.id} - ${lesson.title} | ${program.title}`;
  document.getElementById('kicker').textContent = `${program.grade} • שיעור ${lesson.id} מתוך ${program.totalMeetings} • אתגר ${lesson.challengeId}: ${lesson.challengeTitle}`;
  document.getElementById('title').textContent = lesson.title;
  window.CRAFTOM_CURRENT_MINECRAFT_LESSON = lesson;
  document.getElementById('summary').textContent = lesson.summary;
  document.getElementById('deliverable').textContent = lesson.deliverable;
  document.getElementById('concept').textContent = lesson.concept;
  document.getElementById('command').textContent = lesson.command;
  document.getElementById('goal').textContent = lesson.detail.goal;
  document.getElementById('selfStudy').innerHTML = list([
    'צפו בסרטון של האתגר והבינו מה צריך לקרות בעיר.',
    'בנו במיינקראפט את החלק הקטן של היום.',
    'פתחו MakeCode וכתבו רק את הקוד שמפעיל את ה-Agent.',
    'הריצו, בדקו מה קרה בעולם, תקנו דבר אחד והריצו שוב.',
    'העלו צילום של מה שבניתם ומלאו את כרטיס היציאה במילים שלכם.'
  ]);
  document.getElementById('build').innerHTML = list(lesson.detail.build);
  document.getElementById('code').innerHTML = list(lesson.detail.code);
  document.getElementById('evidence').innerHTML = list(lesson.detail.evidence);
  const academy = lesson.detail.academy;
  const academySection = document.getElementById('agentAcademy');
  if (academy && academySection) {
    academySection.hidden = false;
    document.getElementById('academyTitle').textContent = academy.title;
    document.getElementById('academyStory').textContent = academy.story;
    document.getElementById('academySteps').innerHTML = academyCards(academy.exercises);
  }
  document.getElementById('makeCodeSnippet').textContent = makeCodeSnippets[lesson.id] || makeCodeSnippets[1];
  document.getElementById('exitUpload').textContent = program.exitUpload;
  document.getElementById('exitUploadInline').textContent = program.exitUpload;
  document.getElementById('exitTicket').textContent = lesson.detail.exit;
  document.getElementById('video').src = lesson.video;
  document.getElementById('video').poster = lesson.poster;
  document.getElementById('challengeLink').href = `craftom-minecraft-challenge.html?challenge=${lesson.challengeId}`;
  document.getElementById('challengeMapLink').href = `craftom-minecraft-challenge.html?challenge=${lesson.challengeId}`;
  document.getElementById('studentLink').href = `craftom-minecraft-students.html?challenge=${lesson.challengeId}`;
  document.getElementById('slidesLink').href = `craftom-minecraft-slides.html?challenge=${lesson.challengeId}`;
  document.getElementById('lessonSlidesBoxLink').href = `craftom-minecraft-slides.html?challenge=${lesson.challengeId}`;
  const currentLessonIndex = challengeLessons.findIndex(item => item.id === lesson.id);
  const prevLesson = currentLessonIndex > 0 ? challengeLessons[currentLessonIndex - 1] : null;
  const nextLesson = currentLessonIndex < challengeLessons.length - 1 ? challengeLessons[currentLessonIndex + 1] : null;
  const prevLink = document.getElementById('prevLink');
  const nextLink = document.getElementById('nextLink');
  prevLink.style.display = prevLesson ? '' : 'none';
  nextLink.style.display = nextLesson ? '' : 'none';
  if (prevLesson) prevLink.href = `craftom-minecraft-lesson-${prevLesson.id}.html`;
  if (nextLesson) nextLink.href = `craftom-minecraft-lesson-${nextLesson.id}.html`;
  document.getElementById('lessonNav').innerHTML = challengeLessons.map(item => `<a class="${item.id === lesson.id ? 'active' : ''}" href="craftom-minecraft-lesson-${item.id}.html">${item.id}</a>`).join('');
  document.getElementById('challengeMapTitle').textContent = `אתגר ${lesson.challengeId}: ${lesson.challengeTitle}`;
  document.getElementById('challengeLessonMap').innerHTML = challengeLessons.map(item => `
      <a class="${item.id === lesson.id ? 'active' : ''}" href="craftom-minecraft-lesson-${item.id}.html">
        <span>שיעור ${item.id}</span>
        <strong>${esc(item.title)}</strong>
        <small>${esc(item.deliverable)}</small>
      </a>
    `).join('');

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
  form.addEventListener('submit', async event => {
    event.preventDefault();
    status.textContent = '';
    const photo = document.getElementById('exitPhoto').files[0];
    const answer = document.getElementById('exitAnswer').value.trim();
    const studentName = document.getElementById('exitStudentName').value.trim();

    if (!answer) {
      status.textContent = 'כתבו תשובה קצרה לפני ההגשה.';
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessonId: String(lesson.id),
          lessonTitle: lesson.title,
          challengeId: String(lesson.challengeId),
          challengeTitle: lesson.challengeTitle,
          studentName,
          answer,
          photo: { name: photo.name, dataUrl: photoDataUrl },
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'לא הצלחנו לשמור את ההגשה.');
      form.classList.add('submitted');
      status.textContent = `כרטיס היציאה הוגש ונשמר. מספר הגשה: ${data.id}`;
    } catch (error) {
      status.textContent = error.message || 'לא הצלחנו לשמור את ההגשה.';
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = 'הגשת כרטיס יציאה';
    }
  });
})();
