(function () {
  const params = new URLSearchParams(location.search);
  const lessonNumber = document.body.dataset.lesson || params.get('lesson') || 1;
  const lesson = window.getCraftomMinecraftLesson(lessonNumber);
  const program = window.CRAFTOM_MINECRAFT_PROGRAM;
  const esc = value => String(value || '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));

  function list(items) {
    return items.map(item => `<li>${esc(item)}</li>`).join('');
  }

  if (!document.getElementById('lessonNav')) {
    document.body.innerHTML = `
      <main class="shell">
        <nav class="lesson-nav" id="lessonNav" aria-label="בחירת שיעור"></nav>
        <section class="hero">
          <div>
            <div class="kicker" id="kicker"></div>
            <h1 id="title"></h1>
            <p class="goal" id="summary"></p>
            <p><strong>תוצר:</strong> <span id="deliverable"></span></p>
            <div class="actions">
              <a class="btn" id="studentLink" href="#">דף תלמידים</a>
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
          <article class="detail-box"><h2>מה המורה עושה</h2><ul id="teacher"></ul></article>
          <article class="detail-box"><h2>מה בונים במיינקראפט</h2><ul id="build"></ul></article>
          <article class="detail-box"><h2>קוד / MakeCode</h2><ul id="code"></ul></article>
          <article class="detail-box"><h2>ראיות Craftom</h2><ul id="evidence"></ul></article>
        </section>
        <section class="card" style="margin-top:16px">
          <h2>כרטיס יציאה</h2>
          <p id="exitTicket"></p>
          <div class="worksheet-lines"><div class="line"></div></div>
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

  document.title = `שיעור ${lesson.id} - ${lesson.title} | Craftom כיתה ז׳`;
  document.getElementById('kicker').textContent = `${program.grade} • שיעור ${lesson.id} מתוך ${program.totalMeetings} • אתגר ${lesson.challengeId}: ${lesson.challengeTitle}`;
  document.getElementById('title').textContent = lesson.title;
  document.getElementById('summary').textContent = lesson.summary;
  document.getElementById('deliverable').textContent = lesson.deliverable;
  document.getElementById('concept').textContent = lesson.concept;
  document.getElementById('command').textContent = lesson.command;
  document.getElementById('goal').textContent = lesson.detail.goal;
  document.getElementById('teacher').innerHTML = list(lesson.detail.teacher);
  document.getElementById('build').innerHTML = list(lesson.detail.build);
  document.getElementById('code').innerHTML = list(lesson.detail.code);
  document.getElementById('evidence').innerHTML = list(lesson.detail.evidence);
  document.getElementById('exitTicket').textContent = lesson.detail.exit;
  document.getElementById('video').src = lesson.video;
  document.getElementById('video').poster = lesson.poster;
  document.getElementById('challengeLink').href = `craftom-minecraft-challenge.html?challenge=${lesson.challengeId}`;
  document.getElementById('studentLink').href = `craftom-minecraft-students.html?challenge=${lesson.challengeId}`;
  document.getElementById('slidesLink').href = `craftom-minecraft-slides.html?challenge=${lesson.challengeId}`;
  document.getElementById('prevLink').href = `craftom-minecraft-lesson-${Math.max(1, lesson.id - 1)}.html`;
  document.getElementById('nextLink').href = `craftom-minecraft-lesson-${Math.min(program.totalMeetings, lesson.id + 1)}.html`;
  document.getElementById('lessonNav').innerHTML = program.lessons.map(item => `<a class="${item.id === lesson.id ? 'active' : ''}" href="craftom-minecraft-lesson-${item.id}.html">${item.id}</a>`).join('');
})();
