import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import puppeteer from 'puppeteer-core';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';

const ROOT = path.resolve(new URL('..', import.meta.url).pathname);
const MARKETING = path.join(ROOT, 'marketing');
const FRAME_ROOT = path.join(MARKETING, 'silent-motion-course-preview-frames');
const FFMPEG = ffmpegInstaller.path;
const FPS = 15;
const BASE_URL = process.env.PREVIEW_BASE_URL || 'http://127.0.0.1:3137';
const CHROMIUM = process.env.CHROMIUM || '/usr/bin/chromium-browser';

const courses = [
  { slug: 'sensi-city', url: '/sensi-city.html?lesson=1', title: 'סנסי בעיר החכמה' },
  { slug: 'sisi', url: '/space-play.html?lesson=1', title: 'סדרת סיסי' },
  { slug: 'python-turtle', url: '/python-turtle.html', title: 'Python Turtle' },
  { slug: 'webcode', url: '/webcode-play.html?lesson=1', title: 'Web Code' },
  { slug: 'minecraft', url: '/minecraft-play.html?lesson=1', title: 'Minecraft' }
];

function run(cmd, args, opts = {}) {
  const result = spawnSync(cmd, args, { encoding: 'utf8', ...opts });
  if (result.status !== 0) throw new Error(`${cmd} failed\n${result.stdout || ''}\n${result.stderr || ''}`);
  return result;
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function prepare(page) {
  await page.setViewport({ width: 1280, height: 720, deviceScaleFactor: 1 });
  await page.addStyleTag({ content: `
    *{scrollbar-width:none!important}::-webkit-scrollbar{display:none!important}
    #rfw-launcher,.platform-home-link{display:none!important}
    #motionCaption{position:fixed;right:28px;bottom:22px;z-index:999999;max-width:700px;background:rgba(15,23,42,.9);color:white;border-radius:20px;padding:13px 18px;font:900 27px/1.22 Rubik,Arial,sans-serif;text-align:right;direction:rtl;box-shadow:0 18px 44px rgba(15,23,42,.32)}
    #motionCaption small{display:block;color:#bae6fd;font-size:18px;margin-top:4px}
    .motion-spot{outline:7px solid #facc15!important;box-shadow:0 0 0 12px rgba(250,204,21,.24),0 18px 42px rgba(15,23,42,.28)!important;border-radius:18px!important}
    .motion-ghost{position:fixed;z-index:999998;direction:rtl;border-radius:14px;padding:10px 18px;background:linear-gradient(135deg,#fb923c,#facc15);color:#111827;font:900 22px Rubik,Arial,sans-serif;box-shadow:0 16px 34px rgba(15,23,42,.28);transition:transform .72s cubic-bezier(.2,.9,.2,1),opacity .22s ease;will-change:transform}
    .motion-ring{position:fixed;z-index:999997;border:6px solid #22c55e;border-radius:18px;box-shadow:0 0 0 8px rgba(34,197,94,.18);pointer-events:none;animation:pulseRing .72s ease-in-out infinite alternate}
    @keyframes pulseRing{from{transform:scale(.98);opacity:.68}to{transform:scale(1.03);opacity:1}}
  `});
  await page.evaluate(() => {
    const caption = document.createElement('div');
    caption.id = 'motionCaption';
    caption.innerHTML = 'הצצה מהירה מתוך השיעור <small>בלי קריינות — רואים מה עושים בפועל</small>';
    document.body.appendChild(caption);
  });
}

async function caption(page, title, sub = '') {
  await page.evaluate((title, sub) => {
    const el = document.getElementById('motionCaption');
    if (el) el.innerHTML = `${title}${sub ? `<small>${sub}</small>` : ''}`;
  }, title, sub);
}

async function spot(page, selector) {
  await page.evaluate((selector) => {
    document.querySelectorAll('.motion-spot').forEach((el) => el.classList.remove('motion-spot'));
    document.querySelector(selector)?.classList.add('motion-spot');
  }, selector);
}

async function ring(page, selector) {
  await page.evaluate((selector) => {
    document.querySelectorAll('.motion-ring').forEach((el) => el.remove());
    const target = document.querySelector(selector);
    if (!target) return;
    const rect = target.getBoundingClientRect();
    const mark = document.createElement('div');
    mark.className = 'motion-ring';
    mark.style.left = `${rect.left}px`;
    mark.style.top = `${rect.top}px`;
    mark.style.width = `${rect.width}px`;
    mark.style.height = `${rect.height}px`;
    document.body.appendChild(mark);
  }, selector);
}

async function clearRing(page) {
  await page.evaluate(() => document.querySelectorAll('.motion-ring').forEach((el) => el.remove()));
}

async function ghostMove(page, text, fromSelector, toSelector) {
  await page.evaluate((text, fromSelector, toSelector) => {
    const from = document.querySelector(fromSelector)?.getBoundingClientRect() || { left: 940, top: 160, width: 160, height: 44 };
    const to = document.querySelector(toSelector)?.getBoundingClientRect() || { left: 560, top: 260, width: 220, height: 50 };
    const ghost = document.createElement('div');
    ghost.className = 'motion-ghost';
    ghost.textContent = text;
    ghost.style.left = '0';
    ghost.style.top = '0';
    ghost.style.transform = `translate(${from.left + from.width / 2 - 80}px, ${from.top + from.height / 2 - 22}px) scale(.92)`;
    document.body.appendChild(ghost);
    requestAnimationFrame(() => {
      ghost.style.transform = `translate(${to.left + to.width / 2 - 80}px, ${to.top + to.height / 2 - 22}px) scale(1)`;
    });
    setTimeout(() => { ghost.style.opacity = '0'; }, 780);
    setTimeout(() => ghost.remove(), 1040);
  }, text, fromSelector, toSelector);
}

async function snap(page, dir, frame) {
  await page.screenshot({ path: path.join(dir, `frame-${String(frame.value++).padStart(5, '0')}.png`), type: 'png' });
}

async function hold(page, dir, frame, seconds) {
  const frames = Math.max(1, Math.round(seconds * FPS));
  for (let i = 0; i < frames; i += 1) await snap(page, dir, frame);
}

async function clickText(page, text) {
  await page.evaluate((text) => {
    [...document.querySelectorAll('button,a')].find((el) => el.innerText?.includes(text))?.click();
  }, text);
}

async function minecraftWorkspace(page, xmlText) {
  await page.evaluate((xmlText) => {
    localStorage.removeItem(workspaceStorageKey());
    workspace.clear();
    if (xmlText) Blockly.Xml.domToWorkspace(Blockly.utils.xml.textToDom(xmlText), workspace);
    resetWorld({ clearDrawing: true, resetPlayer: true });
    Blockly.svgResize(workspace);
  }, xmlText);
}

async function minecraftAdd(page, dir, frame, label, xmlText, seconds = 0.75) {
  await ghostMove(page, label, '.blocklyFlyout', '#blocklyDiv');
  await hold(page, dir, frame, 0.45);
  await minecraftWorkspace(page, xmlText);
  await ring(page, '#blocklyDiv');
  await hold(page, dir, frame, seconds);
}

async function timeline(page, course, dir, frame) {
  if (course.slug === 'sensi-city') {
    await page.evaluate(() => localStorage.removeItem('sensi-blocks-lesson-1'));
    await page.reload({ waitUntil: 'networkidle2' });
    await prepare(page);
    await clickText(page, 'התחילו בשיעור 1');
    await sleep(500);
    await caption(page, '1. בוחרים בלוקים מהכלים', 'התוכנית נבנית בגרירה');
    await spot(page, '.blocklyToolboxDiv, #blocklyDiv');
    await ghostMove(page, 'אם חשוך', '.blocklyToolboxDiv', '#blocklyDiv');
    await hold(page, dir, frame, 1.1);
    await ghostMove(page, 'הדלק פנס', '.blocklyToolboxDiv', '#blocklyDiv');
    await hold(page, dir, frame, 1.1);
    await caption(page, '2. מסמנים מה השתנה בעיר', 'אור / חיישן / פידבק');
    await spot(page, '#robotCanvas');
    await ring(page, '#sensorLight');
    await page.evaluate(() => { try { window.toggleEnv?.('light'); } catch {} });
    await hold(page, dir, frame, 2.3);
    await caption(page, '3. בודקים לפני הרצה', 'המערכת מחזירה משוב לתלמיד');
    await clearRing(page);
    await spot(page, '#precheckButton, #precheckPanel');
    await page.evaluate(() => { try { window.checkProgramBeforeRun?.(); } catch {} });
    await hold(page, dir, frame, 2.7);
    return;
  }

  if (course.slug === 'sisi') {
    await caption(page, '1. בונים מסלול בפקודות', 'הפקודות נכנסות לרצף');
    await spot(page, '.commands, .controls, .side-card');
    await clickText(page, 'דוגמת פתרון');
    await hold(page, dir, frame, 1.2);
    await ring(page, '#program');
    await hold(page, dir, frame, 1.5);
    await caption(page, '2. מריצים ורואים תוצאה', 'סיסי עוברת בדרך לכוכבים ולדגל');
    await spot(page, '#grid, .grid');
    await clearRing(page);
    await page.evaluate(() => {
      try {
        window.SisiSuccessDialog?.clear?.();
        window.resetRobot?.();
        const cmds = ['right','left','up','up','up','right','right','right','down','up','right'];
        window.program = cmds;
        window.renderProgram?.();
      } catch {}
    });
    await hold(page, dir, frame, 0.5);
    await page.evaluate(() => window.runProgram?.());
    await hold(page, dir, frame, 6);
    return;
  }

  if (course.slug === 'python-turtle') {
    await caption(page, '1. בלוקים הופכים ל־Python', 'הקוד מופיע ליד הבלוקים');
    await spot(page, '#blocklyDiv, .code-box');
    await ghostMove(page, 'זוז קדימה', '#blocklyDiv', '.code-box');
    await hold(page, dir, frame, 1.1);
    await ghostMove(page, 'פנה ימינה', '#blocklyDiv', '.code-box');
    await hold(page, dir, frame, 1.1);
    await caption(page, '2. מריצים ורואים ציור', 'הצב מצייר לפי הפקודות');
    await spot(page, '#stage, .canvas-card, #drawCanvas');
    await page.click('#demoBtn').catch(() => {});
    await hold(page, dir, frame, 0.7);
    await page.click('#runBtn').catch(() => {});
    await hold(page, dir, frame, 5.2);
    return;
  }

  if (course.slug === 'webcode') {
    await caption(page, '1. בלוקים בונים אתר', 'כל בלוק משנה HTML / CSS / JS');
    await spot(page, '#blocklyDiv');
    await ghostMove(page, 'כותרת', '.blocklyToolboxDiv', '#blocklyDiv');
    await hold(page, dir, frame, 1);
    await ghostMove(page, 'פסקה', '.blocklyToolboxDiv', '#blocklyDiv');
    await hold(page, dir, frame, 1);
    await page.evaluate(() => { try { window.runCode?.(); } catch {} });
    await caption(page, '2. פותחים קוד שנוצר', 'רואים HTML, CSS ו־JavaScript');
    await page.evaluate(() => {
      try {
        window.showGeneratedCode?.();
        document.querySelector('#codePeek')?.scrollIntoView({ block: 'nearest' });
      } catch {}
    });
    await spot(page, '#codePeek');
    await hold(page, dir, frame, 1.2);
    await page.evaluate(() => document.querySelector('.editor-tabs button:nth-child(1)')?.click());
    await ring(page, '#htmlCode');
    await hold(page, dir, frame, 1.4);
    await page.evaluate(() => document.querySelector('.editor-tabs button:nth-child(2)')?.click());
    await ring(page, '#cssCode');
    await hold(page, dir, frame, 1.4);
    await page.evaluate(() => document.querySelector('.editor-tabs button:nth-child(3)')?.click());
    await ring(page, '#jsCode');
    await hold(page, dir, frame, 1.4);
    await caption(page, '3. התוצאה משתנה בתצוגה', 'האתר החי מתעדכן לפי הבלוקים');
    await clearRing(page);
    await spot(page, '#previewPanel, iframe');
    await hold(page, dir, frame, 2.4);
    return;
  }

  if (course.slug === 'minecraft') {
    const xmlStart = '<xml><block type="event_start" x="40" y="34"></block></xml>';
    const xmlSay = '<xml><block type="event_start" x="40" y="34"><next><block type="say"><field name="TEXT">אני בונה מגדל!</field></block></next></block></xml>';
    const xmlWood = '<xml><block type="event_start" x="40" y="34"><next><block type="say"><field name="TEXT">אני בונה מגדל!</field><next><block type="place_block"><field name="COLOR">wood</field></block></next></block></next></block></xml>';
    const xmlUpOne = '<xml><block type="event_start" x="40" y="34"><next><block type="say"><field name="TEXT">אני בונה מגדל!</field><next><block type="place_block"><field name="COLOR">wood</field><next><block type="move_direction"><field name="DIR">up</field><field name="STEP">full</field></block></next></block></next></block></next></block></xml>';
    const xmlGold = '<xml><block type="event_start" x="40" y="34"><next><block type="say"><field name="TEXT">אני בונה מגדל!</field><next><block type="place_block"><field name="COLOR">wood</field><next><block type="move_direction"><field name="DIR">up</field><field name="STEP">full</field><next><block type="place_block"><field name="COLOR">gold</field></block></next></block></next></block></next></block></next></block></xml>';
    const xmlFull = '<xml><block type="event_start" x="40" y="34"><next><block type="say"><field name="TEXT">אני בונה מגדל!</field><next><block type="place_block"><field name="COLOR">wood</field><next><block type="move_direction"><field name="DIR">up</field><field name="STEP">full</field><next><block type="place_block"><field name="COLOR">gold</field><next><block type="move_direction"><field name="DIR">up</field><field name="STEP">full</field><next><block type="place_block"><field name="COLOR">diamond</field></block></next></block></next></block></next></block></next></block></next></block></next></block></xml>';

    await caption(page, '1. מתחילים ממשטח ריק', 'אין קוד — עכשיו בונים אותו');
    await spot(page, '#blocklyDiv');
    await minecraftWorkspace(page, '');
    await hold(page, dir, frame, 1);
    await caption(page, '2. גוררים בלוקים ומרכיבים תוכנית', 'כל בלוק מוסיף פעולה בעולם');
    await minecraftAdd(page, dir, frame, 'כאשר לוחצים ▶️', xmlStart);
    await minecraftAdd(page, dir, frame, 'אמור: אני בונה מגדל', xmlSay);
    await minecraftAdd(page, dir, frame, 'הנח בלוק עץ', xmlWood);
    await minecraftAdd(page, dir, frame, 'עלה למעלה', xmlUpOne);
    await minecraftAdd(page, dir, frame, 'הנח בלוק זהב', xmlGold);
    await minecraftAdd(page, dir, frame, 'עלה + יהלום', xmlFull, 1);
    await caption(page, '3. מריצים ורואים מה נבנה', 'העולם משתנה לפי הבלוקים');
    await clearRing(page);
    await spot(page, '#world, .world');
    await page.evaluate(async () => {
      try { await runProgram(); } catch {}
    });
    await ring(page, '#world');
    await hold(page, dir, frame, 3);
  }
}

async function render(course) {
  if (course.slug === 'sisi') {
    const source = path.join(MARKETING, 'sisi-marketing-demo-gemini-child8-synced.mp4');
    const out = path.join(MARKETING, 'sisi-silent-motion-preview.mp4');
    if (!fs.existsSync(source)) throw new Error(`Missing Sisi source video: ${source}`);
    run(FFMPEG, ['-y', '-i', source, '-an', '-vf', 'setpts=0.38*PTS,format=yuv420p', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-movflags', '+faststart', out], { stdio: 'inherit' });
    return out;
  }

  const dir = path.join(FRAME_ROOT, course.slug);
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  const browser = await puppeteer.launch({
    executablePath: CHROMIUM,
    headless: 'new',
    timeout: 120000,
    userDataDir: path.join('/tmp', `silent-motion-${course.slug}-${Date.now()}`),
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu', '--no-first-run']
  });
  const page = await browser.newPage();
  await page.goto(`${BASE_URL}${course.url}`, { waitUntil: 'networkidle2', timeout: 90000 });
  await prepare(page);
  const frame = { value: 0 };
  await caption(page, course.title, 'הצצה מהירה מתוך השיעור');
  await hold(page, dir, frame, 0.7);
  await timeline(page, course, dir, frame);
  await browser.close();
  const out = path.join(MARKETING, `${course.slug}-silent-motion-preview.mp4`);
  run(FFMPEG, ['-y', '-framerate', String(FPS), '-i', path.join(dir, 'frame-%05d.png'), '-vf', 'format=yuv420p', '-an', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-movflags', '+faststart', out], { stdio: 'inherit' });
  return out;
}

const selected = process.env.COURSE ? courses.filter((course) => course.slug === process.env.COURSE) : courses;
const outputs = [];
for (const course of selected) outputs.push(await render(course));
console.log(JSON.stringify(outputs, null, 2));
