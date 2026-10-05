const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const puppeteer = require('puppeteer-core');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;

const ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'marketing', 'agent-academy-lesson0-frames');
const SILENT_MP4 = path.join(ROOT, 'marketing', 'agent-academy-lesson0-intro-teen-silent.mp4');
const AUDIO_MP3 = path.join(ROOT, 'marketing', 'agent-academy-lesson0-teen-leda.mp3');
const OUT_MP4 = path.join(ROOT, 'marketing', 'agent-academy-lesson0-intro-teen.mp4');
const FPS = 15;
let frame = 0;

function cleanDir(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
}

function framePath() {
  return path.join(OUT_DIR, `frame-${String(frame++).padStart(5, '0')}.png`);
}

function run(args) {
  const result = spawnSync(ffmpegPath, args, { stdio: 'inherit' });
  if (result.status) process.exit(result.status);
}

function probe(file) {
  spawnSync(ffmpegPath, ['-hide_banner', '-i', file], { stdio: 'inherit' });
}

const html = String.raw`
<!doctype html>
<html lang="he" dir="rtl">
<head>
  <meta charset="utf-8">
  <link href="https://fonts.googleapis.com/css2?family=Rubik:wght@500;700;800;900&display=swap" rel="stylesheet">
  <style>
    *{box-sizing:border-box}
    body{margin:0;width:1280px;height:720px;overflow:hidden;font-family:Rubik,Arial,sans-serif;direction:rtl;color:#102033;background:linear-gradient(135deg,#eaf7ff 0%,#fff7e6 54%,#eefdf4 100%)}
    .scene{position:relative;width:100%;height:100%;padding:26px}
    .top{display:flex;align-items:center;justify-content:space-between;gap:18px;margin-bottom:16px}
    .brand{display:flex;align-items:center;gap:12px;font-weight:900;color:#123047}
    .mark{width:44px;height:44px;border-radius:14px;background:#0ea5e9;color:white;display:grid;place-items:center;box-shadow:0 12px 28px rgba(14,165,233,.3)}
    .pill{background:white;border:2px solid rgba(14,165,233,.22);border-radius:999px;padding:10px 16px;font-weight:900;box-shadow:0 12px 30px rgba(15,23,42,.08)}
    .layout{display:grid;grid-template-columns:410px 1fr;gap:20px;align-items:stretch}
    .panel{background:rgba(255,255,255,.94);border:1px solid rgba(15,23,42,.08);border-radius:28px;box-shadow:0 18px 45px rgba(15,23,42,.13);padding:22px;position:relative;overflow:hidden}
    .student h1,.student h2,.student h3{margin:0}
    .student .eyebrow{font-weight:900;color:#0284c7;margin:0 0 8px}
    .student h1{font-size:40px;line-height:1.05}
    .student .goal{font-size:21px;line-height:1.45;font-weight:800;color:#35516a;margin:12px 0 18px}
    .button{border:0;border-radius:18px;padding:15px 18px;font:900 20px Rubik,Arial;background:#0ea5e9;color:white;box-shadow:0 12px 24px rgba(14,165,233,.28)}
    .button.secondary{background:#ecfeff;color:#0f766e;border:2px solid #99f6e4;box-shadow:none}
    .progress{margin-top:18px;border-radius:20px;background:#f8fafc;border:1px solid #e2e8f0;padding:16px}
    .progress strong{display:block;font-size:25px;margin-bottom:10px}
    .coins{display:grid;grid-template-columns:repeat(8,1fr);gap:6px;direction:ltr}
    .coin-dot{height:24px;border-radius:999px;background:#e5e7eb;border:2px solid #cbd5e1;transition:.25s}
    .coin-dot.on{background:#facc15;border-color:#eab308;box-shadow:0 0 0 5px rgba(250,204,21,.2)}
    .mazeWrap{display:grid;grid-template-columns:minmax(0,1fr) 255px;gap:14px;height:590px;align-items:start}
    .mazePanel{padding:18px}
    .mazeTitle{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px}
    .mazeTitle h2{font-size:30px;margin:0;color:#123047}
    .counter{font-weight:900;background:#fef3c7;color:#92400e;border-radius:999px;padding:10px 16px;direction:ltr;unicode-bidi:isolate}
    .maze{position:relative;direction:ltr;width:420px;height:405px;margin:24px auto 0;border-radius:26px;overflow:hidden;background:linear-gradient(180deg,#90d7ff 0%,#c8f0ff 42%,#99d57b 43%,#7abf5f 100%);box-shadow:inset 0 0 0 3px rgba(255,255,255,.35),0 18px 42px rgba(15,23,42,.2)}
    .maze:before{content:'';position:absolute;left:20px;right:20px;bottom:24px;height:62px;background:linear-gradient(90deg,#3d7f37,#65a94b,#3f813a);border-radius:50%;filter:blur(1px);opacity:.55}
    .minecraft-board{position:absolute;left:46px;top:62px;width:316px;height:276px;display:grid;grid-template-columns:repeat(8,36px);grid-template-rows:repeat(7,36px);gap:4px;transform:rotateX(58deg) rotateZ(-38deg);transform-style:preserve-3d;transform-origin:center center}
    .cell{position:relative;width:36px;height:36px;transform-style:preserve-3d;background:#62ad3e;background-image:linear-gradient(45deg,rgba(255,255,255,.12) 25%,transparent 25%,transparent 50%,rgba(255,255,255,.12) 50%,rgba(255,255,255,.12) 75%,transparent 75%);background-size:14px 14px;border:1px solid rgba(42,86,34,.5);box-shadow:0 8px 0 #47722f,0 11px 11px rgba(15,23,42,.16)}
    .cell:before{content:'';position:absolute;left:-1px;right:-1px;bottom:-10px;height:10px;background:#7a4f2b;border:1px solid rgba(74,45,21,.45);transform-origin:top;transform:skewX(-45deg)}
    .cell:after{content:'';position:absolute;right:-10px;top:-1px;width:10px;bottom:-1px;background:#5f8d39;border:1px solid rgba(42,86,34,.45);transform-origin:left;transform:skewY(-45deg)}
    .wall{z-index:2;transform:translateZ(27px);background:#7b8794;background-image:linear-gradient(45deg,rgba(255,255,255,.18) 25%,transparent 25%,transparent 50%,rgba(255,255,255,.14) 50%,rgba(255,255,255,.14) 75%,transparent 75%);background-size:16px 16px;border-color:#4b5563;box-shadow:0 27px 0 #4b5563,0 32px 18px rgba(15,23,42,.28)}
    .wall:before{height:27px;bottom:-27px;background:#374151;transform:skewX(-45deg)}
    .wall:after{width:27px;right:-27px;background:#596574;transform:skewY(-45deg)}
    .coin .coinSprite{position:absolute;left:7px;top:3px;width:23px;height:23px;border-radius:50%;background:radial-gradient(circle at 34% 28%,#fff9c4 0 16%,#facc15 17% 58%,#b7791f 59% 100%);box-shadow:0 0 0 3px rgba(250,204,21,.22),0 8px 12px rgba(146,64,14,.28);transform:translateZ(22px) rotateX(-58deg) rotateZ(38deg);transition:.25s;animation:coinSpin 1.1s ease-in-out infinite alternate}
    .coin.taken .coinSprite{opacity:0;transform:translateZ(18px) rotateX(-58deg) rotateZ(38deg) scale(.2)}
    .end .buttonSprite{position:absolute;left:6px;top:7px;width:25px;height:20px;border-radius:6px;background:linear-gradient(180deg,#ef4444,#991b1b);box-shadow:0 6px 0 #5b1111,0 9px 11px rgba(127,29,29,.35);transform:translateZ(18px) rotateX(-58deg) rotateZ(38deg)}
    .player{position:absolute;z-index:3;width:24px;height:36px;filter:drop-shadow(0 8px 6px rgba(15,23,42,.3));transition:left .46s linear,top .46s linear,transform .2s ease;transform:translateZ(18px) rotateX(-58deg) rotateZ(38deg) scale(.92);transform-style:preserve-3d}
    .player .head{position:absolute;left:5px;top:0;width:15px;height:15px;border-radius:3px;background:#f2b389;border:1px solid #9f633f}
    .player .hair{position:absolute;left:4px;top:-1px;width:17px;height:5px;border-radius:3px 3px 1px 1px;background:#5b341f}
    .player .body{position:absolute;left:4px;top:14px;width:17px;height:15px;border-radius:3px;background:linear-gradient(90deg,#2563eb 0 50%,#1d4ed8 51%);border:1px solid #173a82}
    .player .arm,.player .leg{position:absolute;width:5px;border-radius:2px;transform-origin:top center}
    .player .arm{top:16px;height:14px;background:#f2b389;border:1px solid #9f633f}
    .player .arm.l{left:0}.player .arm.r{right:0}
    .player .leg{top:28px;height:10px;background:#334155;border:1px solid #172033}
    .player .leg.l{left:7px}.player .leg.r{right:7px}
    .player.walk .arm.l,.player.walk .leg.r{animation:walkA .32s ease-in-out infinite alternate}
    .player.walk .arm.r,.player.walk .leg.l{animation:walkB .32s ease-in-out infinite alternate}
    .player.dir-right{transform:translateZ(18px) rotateX(-58deg) rotateZ(38deg) scale(.92)}
    .player.dir-left{transform:translateZ(18px) rotateX(-58deg) rotateZ(38deg) scaleX(-1) scale(.92)}
    .player.dir-up{transform:translateZ(18px) rotateX(-58deg) rotateZ(38deg) translateY(-3px) scale(.92)}
    .player.dir-down{transform:translateZ(18px) rotateX(-58deg) rotateZ(38deg) translateY(3px) scale(.92)}
    .player.pop{transform:translateZ(21px) rotateX(-58deg) rotateZ(38deg) scale(1.05) translateY(-4px)}
    .player.dir-left.pop{transform:translateZ(21px) rotateX(-58deg) rotateZ(38deg) scaleX(-1) scale(1.05) translateY(-4px)}
    .pickup{position:absolute;z-index:12;font:900 20px Rubik,Arial;color:#facc15;text-shadow:0 3px 0 #7c2d12,0 0 10px rgba(255,255,255,.7);animation:pickup .65s ease-out forwards;pointer-events:none}
    .trail{position:absolute;z-index:1;width:12px;height:12px;border-radius:4px;background:rgba(14,165,233,.34);box-shadow:0 0 0 5px rgba(14,165,233,.12);transform:translateZ(12px);animation:trailFade 1.4s ease-out forwards;pointer-events:none}
    @keyframes walkA{from{transform:rotate(-18deg)}to{transform:rotate(18deg)}}
    @keyframes walkB{from{transform:rotate(18deg)}to{transform:rotate(-18deg)}}
    @keyframes pickup{0%{opacity:0;transform:translateY(4px) scale(.8)}20%{opacity:1}100%{opacity:0;transform:translateY(-34px) scale(1.2)}}
    @keyframes trailFade{0%{opacity:.75;transform:translateZ(12px) scale(1)}100%{opacity:0;transform:translateZ(12px) scale(.55)}}
    @keyframes coinSpin{from{filter:brightness(1);transform:translateZ(22px) rotateX(-58deg) rotateZ(22deg) scale(.94)}to{filter:brightness(1.14);transform:translateZ(24px) rotateX(-58deg) rotateZ(54deg) scale(1.06)}}
    .side{display:flex;flex-direction:column;gap:12px;position:relative;z-index:4}
    .step{border-radius:22px;background:#f8fafc;border:2px solid #e2e8f0;padding:15px;min-height:92px;transition:.25s}
    .step b{display:block;font-size:20px;margin-bottom:5px;color:#0f172a}
    .step span{font-weight:800;color:#52657a;line-height:1.35}
    .step.active{background:#ecfeff;border-color:#06b6d4;box-shadow:0 12px 26px rgba(6,182,212,.14);transform:translateX(-4px)}
    .caption{position:fixed;right:34px;bottom:26px;z-index:20;max-width:700px;background:rgba(15,23,42,.88);color:white;border-radius:25px;padding:17px 23px;font:900 31px/1.25 Rubik,Arial;box-shadow:0 18px 42px rgba(15,23,42,.26);text-align:right}
    .caption small{display:block;margin-top:5px;color:#c7f9ff;font-size:18px}
    .spot{outline:7px solid #facc15;box-shadow:0 0 0 12px rgba(250,204,21,.25),0 16px 42px rgba(15,23,42,.16)!important}
    .doneBurst{display:none}
  </style>
</head>
<body>
  <main class="scene">
    <div class="top">
      <div class="brand"><div class="mark">C</div><div>Agent Academy<br><small>שיעור פתיחה</small></div></div>
      <div class="pill">שיעור 0: בדיקת מוכנות במבוך</div>
    </div>
    <div class="layout">
      <section class="panel student" id="studentPanel">
        <p class="eyebrow">דף התלמיד</p>
        <h1>שיעור פתיחה</h1>
        <p class="goal">נכנסים לעולם Minecraft, אוספים 8 מטבעות במבוך, ולוחצים על כפתור הסיום כדי לאשר שהמשימה הושלמה.</p>
        <button class="button" id="openBtn">פתחו את Minecraft</button>
        <div class="progress" id="progressBox">
          <strong id="progressText">0 מתוך 8 מטבעות</strong>
          <div class="coins">${Array.from({length:8},(_,i)=>`<i class="coin-dot" data-dot="${i+1}"></i>`).join('')}</div>
        </div>
        <button class="button secondary" id="finishBtn" style="margin-top:14px">בדיקת סיום</button>
        <div class="doneBurst" id="doneBurst">🎉</div>
      </section>
      <section class="panel mazePanel" id="mazePanel">
        <div class="mazeTitle"><h2>מבוך Minecraft</h2><div class="counter" id="coinCounter">0 / 8</div></div>
        <div class="mazeWrap">
          <div class="maze" id="maze"><div class="minecraft-board" id="minecraftBoard"></div></div>
          <aside class="side">
            <div class="step" id="s1"><b>1. כניסה</b><span>פותחים את Minecraft דרך דף השיעור.</span></div>
            <div class="step" id="s2"><b>2. משימה</b><span>אוספים 8 מטבעות ומתמצאים במסלול.</span></div>
            <div class="step" id="s3"><b>3. סיום במבוך</b><span>לוחצים על כפתור הסיום בתוך Minecraft.</span></div>
            <div class="step" id="s4"><b>4. אימות</b><span>חוזרים לדף ולוחצים בדיקת סיום.</span></div>
          </aside>
        </div>
      </section>
    </div>
    <div class="caption" id="caption">שיעור 0: בדיקת מוכנות<small>לפני הקורס עצמו מוודאים שהחיבור והמשימה עובדים</small></div>
  </main>
  <script>
    const maze = document.getElementById('maze');
    const board = document.getElementById('minecraftBoard');
    const walls = new Set(['1,0','2,0','3,0','5,0','6,0','7,0','1,1','2,1','4,1','5,1','6,1','7,1','5,2','6,2','0,3','1,3','2,3','5,3','6,3','1,4','2,4','4,4','5,4','6,4','0,6','4,6','5,6','6,6']);
    const coins = new Set(['0,1','2,2','4,2','7,2','0,4','3,4','5,5','7,5']);
    for (let y=0;y<7;y++) for (let x=0;x<8;x++) {
      const c = document.createElement('div');
      c.className = 'cell';
      const key = x + ',' + y;
      c.dataset.xy = key;
      if (walls.has(key)) c.classList.add('wall');
      if (coins.has(key)) {
        c.classList.add('coin');
        const coin = document.createElement('i');
        coin.className = 'coinSprite';
        c.appendChild(coin);
      }
      if (key === '7,6') {
        c.classList.add('end');
        const btn = document.createElement('i');
        btn.className = 'buttonSprite';
        c.appendChild(btn);
      }
      board.appendChild(c);
    }
    const player = document.createElement('div');
    player.className = 'player';
    player.innerHTML = '<i class="hair"></i><i class="head"></i><i class="body"></i><i class="arm l"></i><i class="arm r"></i><i class="leg l"></i><i class="leg r"></i>';
    board.appendChild(player);
    window.videoState = { collected: 0, x: 0, y: 0 };
    window.setCaption = (title, sub='') => document.getElementById('caption').innerHTML = title + (sub ? '<small>' + sub + '</small>' : '');
    window.setStep = id => document.querySelectorAll('.step').forEach(el => el.classList.toggle('active', el.id === id));
    window.spot = id => {
      document.querySelectorAll('.spot').forEach(el => el.classList.remove('spot'));
      if (id) document.getElementById(id).classList.add('spot');
    };
    window.movePlayer = (x, y, take=false) => {
      const tx = x * 40 + 18;
      const ty = y * 40 + 13;
      const trail = document.createElement('i');
      trail.className = 'trail';
      trail.style.left = (tx - 6) + 'px';
      trail.style.top = (ty - 6) + 'px';
      board.appendChild(trail);
      setTimeout(() => trail.remove(), 1500);
      player.classList.remove('dir-left','dir-right','dir-up','dir-down','pop');
      const dx = x - window.videoState.x;
      const dy = y - window.videoState.y;
      const dir = Math.abs(dx) >= Math.abs(dy) ? (dx < 0 ? 'dir-left' : 'dir-right') : (dy < 0 ? 'dir-up' : 'dir-down');
      player.classList.add(dir, 'walk');
      player.style.left = (tx - 12) + 'px';
      player.style.top = (ty - 34) + 'px';
      window.videoState.x = x;
      window.videoState.y = y;
      if (take) {
        const el = document.querySelector('[data-xy="' + x + ',' + y + '"]');
        if (el && !el.classList.contains('taken')) {
          el.classList.add('taken');
          window.videoState.collected++;
          document.getElementById('coinCounter').textContent = window.videoState.collected + ' / 8';
          document.getElementById('progressText').textContent = window.videoState.collected + ' מתוך 8 מטבעות';
          document.querySelector('[data-dot="' + window.videoState.collected + '"]')?.classList.add('on');
          const pop = document.createElement('b');
          pop.className = 'pickup';
          pop.textContent = '+1';
          const rect = maze.getBoundingClientRect();
          const cell = document.querySelector('[data-xy="' + x + ',' + y + '"]').getBoundingClientRect();
          pop.style.left = (cell.left - rect.left + cell.width / 2 - 10) + 'px';
          pop.style.top = (cell.top - rect.top + cell.height / 2 - 42) + 'px';
          maze.appendChild(pop);
          setTimeout(() => pop.remove(), 700);
          setTimeout(() => player.classList.add('pop'), 160);
        }
      }
      setTimeout(() => player.classList.remove('walk'), 520);
    };
    window.finish = () => {
      document.getElementById('doneBurst').classList.add('show');
      document.getElementById('finishBtn').textContent = 'שיעור 0 הושלם';
      document.getElementById('finishBtn').classList.remove('secondary');
      document.getElementById('finishBtn').classList.add('button');
    };
    window.movePlayer(0,0,false);
  </script>
</body>
</html>`;

(async () => {
  cleanDir(OUT_DIR);
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/chromium-browser',
    headless: 'new',
    timeout: 120000,
    userDataDir: path.join('/tmp', `lesson0-video-${Date.now()}`),
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu', '--no-first-run', '--noerrdialogs', '--font-render-hinting=none'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720, deviceScaleFactor: 1 });
  await page.setContent(html, { waitUntil: 'networkidle0' });

  async function snap() { await page.screenshot({ path: framePath(), type: 'png' }); }
  async function hold(seconds) { for (let i = 0; i < Math.round(seconds * FPS); i++) await snap(); }
  async function caption(title, sub='') { await page.evaluate((title, sub) => window.setCaption(title, sub), title, sub); }
  async function step(id) { await page.evaluate(id => window.setStep(id), id); }
  async function spot(id) { await page.evaluate(id => window.spot(id), id); }
  async function move(x, y, take=false, seconds=0.78) {
    await page.evaluate((x, y, take) => window.movePlayer(x, y, take), x, y, take);
    await hold(seconds);
  }

  await caption('שיעור 0: בדיקת מוכנות', 'לפני שיעור 1 מוודאים שהכניסה והמשימה עובדות');
  await step('s1'); await spot('studentPanel'); await hold(5.2);
  await caption('המורה פותחת את שיעור 0', 'בדף השיעור לוחצים על “פתחו את Minecraft”');
  await hold(4.4);
  await spot('mazePanel'); await caption('בתוך Minecraft נכנסים למבוך', 'המטרה: התמצאות במסלול ואיסוף 8 מטבעות');
  await step('s2'); await hold(4.2);

  const route = [
    [0,1,true],[0,2,false],[1,2,false],[2,2,true],[3,2,false],[4,2,true],
    [4,3,false],[3,3,false],[3,4,true],[3,5,false],[3,6,false],[2,6,false],
    [1,6,false],[1,5,false],[0,5,false],[0,4,true],[1,5,false],[2,5,false],
    [3,5,false],[4,5,false],[5,5,true],[6,5,false],[7,5,true],[7,4,false],
    [7,3,false],[7,2,true],[7,3,false],[7,4,false],[7,5,false],[7,6,false],
  ];
  await caption('מתקדמים במסלול ואוספים מטבעות', 'המערכת סופרת את ההתקדמות');
  for (const [x, y, take] of route) await move(x, y, take, take ? 0.95 : 0.5);

  await step('s3'); await caption('בסוף המבוך לוחצים על כפתור הסיום', 'זה האירוע שמאשר שהגעתם לקצה');
  await hold(4.6);
  await step('s4'); await spot('studentPanel'); await caption('חוזרים לדף השיעור', 'ולוחצים על “בדיקת סיום”');
  await hold(4.8);
  await page.evaluate(() => window.finish());
  await caption('המערכת בודקת את המשימה', '8 מטבעות + לחיצה על כפתור הסיום');
  await hold(5.0);
  await caption('שיעור 0 הושלם', 'אפשר להמשיך לשיעור 1');
  await hold(5.2);
  await caption('אם משהו לא מסתדר — קוראים למורה', 'בודקים חיבור, שם שחקן, ומנסים שוב');
  await hold(15.0);

  await browser.close();
  run(['-y', '-framerate', String(FPS), '-i', path.join(OUT_DIR, 'frame-%05d.png'), '-vf', 'format=yuv420p', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-movflags', '+faststart', SILENT_MP4]);
  if (fs.existsSync(AUDIO_MP3)) {
    run(['-y', '-i', SILENT_MP4, '-i', AUDIO_MP3, '-c:v', 'copy', '-c:a', 'aac', '-b:a', '160k', '-shortest', '-movflags', '+faststart', OUT_MP4]);
    probe(OUT_MP4);
    console.log(OUT_MP4);
  } else {
    console.log(SILENT_MP4);
  }
})();
