const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const puppeteer = require('puppeteer-core');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;

const ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'marketing', 'sisi-video-frames-gemini-synced');
const SILENT_MP4 = path.join(ROOT, 'marketing', 'sisi-marketing-demo-gemini-synced-silent.mp4');
const AUDIO_MP3 = path.join(ROOT, 'marketing', 'sisi-gemini-child8-leda.mp3');
const OUT_MP4 = path.join(ROOT, 'marketing', 'sisi-marketing-demo-gemini-child8-synced.mp4');
const FPS = 15;
let frame = 0;
function cleanDir(dir){ fs.rmSync(dir,{recursive:true,force:true}); fs.mkdirSync(dir,{recursive:true}); }
function framePath(){ return path.join(OUT_DIR, `frame-${String(frame++).padStart(5,'0')}.png`); }
function run(args){ const r=spawnSync(ffmpegPath,args,{stdio:'inherit'}); if(r.status) process.exit(r.status); }

(async()=>{
  cleanDir(OUT_DIR);
  const browser = await puppeteer.launch({
    executablePath:'/usr/bin/chromium-browser', headless:'new', timeout:120000,
    userDataDir:path.join('/tmp',`sisi-gemini-sync-${Date.now()}`),
    args:['--no-sandbox','--disable-dev-shm-usage','--disable-gpu','--no-first-run','--noerrdialogs','--font-render-hinting=none']
  });
  const page=await browser.newPage();
  await page.setViewport({width:1280,height:720,deviceScaleFactor:1});
  await page.goto('http://127.0.0.1:3137/space-play.html?lesson=1',{waitUntil:'networkidle2'});
  await page.addStyleTag({content:`
    body{overflow:hidden!important;background:linear-gradient(135deg,#eef7ff,#fff7ed)!important;}
    .hero{display:none!important}.shell{width:1240px!important;margin:0 auto!important;overflow:visible!important}.play-layout{margin-top:18px!important;gap:18px!important;grid-template-columns:minmax(0,1fr) 390px!important;align-items:stretch!important;transition:transform .75s ease,filter .75s ease;transform-origin:0 48%;}.game-card,.side-card{box-shadow:0 18px 45px rgba(15,23,42,.14)!important}.platform-home-link,#rfw-launcher{display:none!important}.fact,.space-guide{display:none!important}.grid{max-width:520px!important;margin:0 auto!important}.side-card{max-height:690px!important;overflow:hidden!important}.nav-lessons{display:none!important}
    body.zoomCommands .play-layout{transform:scale(1.32) translateX(118px) translateY(8px)} body.zoomCommands .game-card{filter:saturate(.75) brightness(.96)} body.zoomCommands #marketingCaption{transform:scale(.86);transform-origin:right bottom;right:24px;bottom:18px;max-width:650px}
    #marketingCaption{position:fixed;right:36px;bottom:26px;z-index:99999;max-width:760px;background:rgba(15,23,42,.86);color:white;border-radius:24px;padding:16px 22px;font:900 30px/1.25 Rubik,Arial,sans-serif;box-shadow:0 18px 42px rgba(15,23,42,.28);direction:rtl;text-align:right;backdrop-filter:blur(8px);transition:transform .75s ease,right .75s ease,bottom .75s ease,max-width .75s ease}
    #marketingCaption small{display:block;font-size:17px;font-weight:800;color:#c7f9ff;margin-top:5px}.spotlight{outline:7px solid #facc15!important;box-shadow:0 0 0 12px rgba(250,204,21,.28),0 20px 40px rgba(15,23,42,.22)!important;transition:.2s}.grid.spotlight{border-radius:30px}.program.spotlight,#result.spotlight,.controls.spotlight{border-radius:20px;padding:10px}.control.flash,.btn.flash{animation:pulseMarketing .8s ease 1}.marker-label{position:fixed;z-index:99998;background:#fff;border:4px solid #facc15;border-radius:999px;padding:9px 15px;font:900 24px/1 Rubik,Arial,sans-serif;color:#0f172a;box-shadow:0 16px 36px rgba(15,23,42,.24);direction:rtl;display:flex;align-items:center;gap:7px;white-space:nowrap}.marker-label:after{content:'';position:absolute;width:42px;height:4px;background:#facc15;border-radius:999px;transform-origin:right center}.marker-label.sisi:after{right:100%;top:50%;transform:rotate(12deg)}.marker-label.flag:after{right:100%;top:50%;transform:rotate(-16deg)}.marker-ring{position:fixed;z-index:99997;border:7px solid #facc15;border-radius:22px;box-shadow:0 0 0 10px rgba(250,204,21,.25);pointer-events:none;animation:ringPulse 1.1s ease-in-out infinite}@keyframes ringPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.08)}}@keyframes pulseMarketing{0%,100%{transform:scale(1)}50%{transform:scale(1.07);box-shadow:0 0 0 10px rgba(34,197,94,.24)}}
  `});
  await page.evaluate(()=>{ const c=document.createElement('div'); c.id='marketingCaption'; c.innerHTML='אני משחק עם סיסי <small>בונים מסלול, מריצים, ומקבלים פידבק</small>'; document.body.appendChild(c); });
  async function caption(title,sub=''){ await page.evaluate((title,sub)=>{document.getElementById('marketingCaption').innerHTML=`${title}${sub?`<small>${sub}</small>`:''}`},title,sub); }
  async function clearSpot(){ await page.evaluate(()=>document.querySelectorAll('.spotlight,.flash').forEach(el=>el.classList.remove('spotlight','flash'))); }
  async function spot(sel){ await clearSpot(); await page.$eval(sel,el=>el.classList.add('spotlight')); }
  async function zoom(on){ await page.evaluate(on=>document.body.classList.toggle('zoomCommands',on),on); }
  async function flash(sel){ await page.$eval(sel,el=>el.classList.add('flash')); }
  async function snap(){ await page.screenshot({path:framePath(),type:'png'}); }
  async function hold(sec){ for(let i=0;i<Math.round(sec*FPS);i++) await snap(); }
  async function waitSnap(ms){ await new Promise(r=>setTimeout(r,ms)); await snap(); }
  async function showMarkers(on){ await page.evaluate((on)=>{
    document.querySelectorAll('.marker-label,.marker-ring').forEach(el=>el.remove());
    if(!on) return;
    const add = (cls, text) => { const el=document.createElement('div'); el.className=cls; el.textContent=text; document.body.appendChild(el); return el; };
    const position = (kind, selector, text, labelOffset) => {
      const cell = document.querySelector(selector);
      if(!cell) return;
      const rect = cell.getBoundingClientRect();
      const pad = 7;
      const ring = add(`marker-ring ${kind}`, '');
      ring.style.left = `${rect.left - pad}px`;
      ring.style.top = `${rect.top - pad}px`;
      ring.style.width = `${rect.width + pad * 2}px`;
      ring.style.height = `${rect.height + pad * 2}px`;
      const label = add(`marker-label ${kind}`, text);
      label.style.left = `${rect.left + labelOffset.x}px`;
      label.style.top = `${rect.top + labelOffset.y}px`;
    };
    position('sisi', '.cell.robot', '🤖 סיסי פה', { x: -105, y: -70 });
    position('flag', '.cell.goal', '🏁 הדגל שם', { x: -25, y: -58 });
    document.querySelectorAll('.cell.star').forEach((cell, index) => {
      const rect = cell.getBoundingClientRect();
      const pad = 7;
      const ring = add('marker-ring star', '');
      ring.style.left = `${rect.left - pad}px`;
      ring.style.top = `${rect.top - pad}px`;
      ring.style.width = `${rect.width + pad * 2}px`;
      ring.style.height = `${rect.height + pad * 2}px`;
      if (index === 0) {
        const label = add('marker-label star', '⭐ כוכבים בדרך');
        label.style.left = `${rect.left - 118}px`;
        label.style.top = `${rect.top + 68}px`;
      }
    });
  }, on); }

  await zoom(false); await caption('סיסי צריכה להגיע לדגל','קודם מסתכלים על הלוח, הכוכבים והדגל'); await spot('.grid'); await hold(1.3); await showMarkers(true); await hold(4.0); await showMarkers(false); await hold(0.7);
  await caption('אני בונה דרך שעוברת בכוכבים','זום לפקודות — כל לחיצה מוסיפה צעד'); await spot('.controls'); await zoom(true); await hold(2.2);
  const cmds=['right','left','up','up','up','right','right','right','down','up','right'];
  const delays=[1.45,1.15,1.45,1.35,1.45,1.15,1.15,1.2,1.35,1.2,1.0];
  for(let i=0;i<cmds.length;i++){
    const sel=`[data-cmd="${cmds[i]}"]`;
    await flash(sel); await page.click(sel); await waitSnap(180); await page.evaluate(sel=>document.querySelector(sel)?.classList.remove('flash'),sel); await spot('#program'); await hold(delays[i]);
  }
  await caption('המסלול מוכן','עכשיו לוחצים הרצה'); await zoom(false); await clearSpot(); await flash('#run'); await hold(1.0);
  // For the marketing render only: play Sisi's route manually at a precise pace,
  // while keeping the real Sisi board/result UI. This makes star collection align with narration.
  await page.evaluate(() => { window.SisiSuccessDialog?.clear?.(); resetRobot(); setResult('סיסי יוצאת לדרך...'); });
  await caption('סיסי זזה לפי הפקודות','היא עוברת דרך הכוכבים ואז ממשיכה לדגל');
  const runStepDelay = 1.28;
  for (const cmd of cmds) {
    for(let i=0;i<Math.round(runStepDelay*FPS);i++){ await new Promise(r=>setTimeout(r,1000/FPS)); await snap(); }
    await page.evaluate((cmd) => step(cmd), cmd);
    await snap();
  }
  await page.evaluate(() => {
    const message = `יש! סיסי הגיעה ליעד וגם אספה ${collected.size} כוכבים!`;
    setResult(message, true);
    saveStudentProgress('completed');
    window.SisiSuccessDialog?.show({ message, lessons, lesson, onRepeat: repeatCurrentLesson });
  });
  await hold(0.7);
  await caption('וואו, הצלחתי!','גם כוכבים, גם הדגל — ואם טועים, מתקנים ומנסים שוב'); await spot('#result'); await hold(1.8);
  await page.evaluate(() => {
    window.SisiSuccessDialog?.clear?.();
    document.getElementById('sisi-success-dialog')?.remove();
  });
  await caption('ככה לומדים דרך משחק','בונים • מריצים • משתפרים'); await clearSpot(); await spot('.grid'); await hold(5.4);
  await browser.close();
  run(['-y','-framerate',String(FPS),'-i',path.join(OUT_DIR,'frame-%05d.png'),'-vf','format=yuv420p','-c:v','libx264','-preset','medium','-crf','18','-movflags','+faststart',SILENT_MP4]);
  run(['-y','-i',SILENT_MP4,'-i',AUDIO_MP3,'-c:v','copy','-c:a','aac','-b:a','160k','-shortest','-movflags','+faststart',OUT_MP4]);
  run(['-hide_banner','-i',OUT_MP4]);
  console.log(OUT_MP4);
})();
