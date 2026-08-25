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
  { slug: 'minecraft', url: '/minecraft-play.html?lesson=9', title: 'Minecraft' }
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
    #motionCursor{position:fixed;left:0;top:0;z-index:1000000;width:38px;height:38px;pointer-events:none;opacity:0;transform:translate(-80px,-80px);filter:drop-shadow(0 6px 8px rgba(15,23,42,.42))}
    #motionCursor svg{width:38px;height:38px;display:block}
    #motionCursor.down{filter:drop-shadow(0 2px 4px rgba(15,23,42,.34))}
    #motionCursor.down svg{transform:scale(.88);transform-origin:6px 6px}
    #motionCursor.dragging::after{display:none}
    #motionDragChip{position:fixed;left:0;top:0;z-index:999999;direction:rtl;border-radius:14px;padding:10px 16px;min-width:150px;text-align:center;background:linear-gradient(135deg,#fb923c,#facc15);color:#111827;border:3px solid rgba(17,24,39,.22);font:900 21px Rubik,Arial,sans-serif;box-shadow:0 16px 34px rgba(15,23,42,.28);pointer-events:none;opacity:0;transform:translate(-120px,-120px)}
    .motion-ring{position:fixed;z-index:999997;border:6px solid #22c55e;border-radius:18px;box-shadow:0 0 0 8px rgba(34,197,94,.18);pointer-events:none;animation:pulseRing .72s ease-in-out infinite alternate}
    body.motion-webcode-focus .lesson-panel{display:none!important}
    body.motion-webcode-focus .main{grid-template-columns:minmax(0,1.45fr) minmax(370px,.9fr)!important;gap:.8rem!important;padding:.75rem!important}
    body.motion-webcode-focus .editor-panel,body.motion-webcode-focus .preview-panel{min-height:0!important;border-radius:22px!important}
    body.motion-webcode-focus #blocksStage{padding:0!important}
    body.motion-webcode-focus .blockly-top{padding:.5rem .75rem!important}
    body.motion-webcode-focus #motionCaption{right:20px!important;bottom:16px!important;font-size:23px!important;max-width:620px!important}
    body.motion-sensi-focus .header{height:54px!important;padding:.34rem .75rem!important}
    body.motion-sensi-focus .home-link,body.motion-sensi-focus .logo,body.motion-sensi-focus .lesson-tabs,body.motion-sensi-focus .presentation-link{display:none!important}
    body.motion-sensi-focus .play-buttons{margin-inline-start:auto!important}
    body.motion-sensi-focus .main-container{grid-template-columns:minmax(0,1fr) minmax(560px,1.55fr)!important;gap:.8rem!important;padding:.75rem!important;overflow:hidden!important}
    body.motion-sensi-focus .robot-section{padding:.65rem!important;border-radius:22px!important}
    body.motion-sensi-focus .robot-title{font-size:1rem!important;margin-bottom:.45rem!important}
    body.motion-sensi-focus .sensor-chip,body.motion-sensi-focus .env-btn{font-size:.72rem!important;min-height:42px!important}
    body.motion-sensi-focus .lesson-drawer,body.motion-sensi-focus .drawer-toggle,.precheck-panel .check-panel-close{display:none!important}
    body.motion-sensi-focus .blocks-section{border-radius:22px!important;box-shadow:0 0 0 8px rgba(34,197,94,.22),0 18px 60px rgba(15,23,42,.22)!important}
    body.motion-sensi-focus .blocks-header{padding:.65rem 1rem!important;font-size:1.18rem!important}
    body.motion-sensi-focus .blockly-workspace-shell{grid-template-columns:minmax(0,1fr) 34px!important;grid-template-rows:minmax(0,1fr) 34px!important}
    body.motion-sensi-focus .blockly-scroll-btn{width:31px!important;height:31px!important}
    body.motion-sensi-code-zoom .robot-section{opacity:.18!important;filter:blur(1px)!important}
    body.motion-sensi-code-zoom .blocks-section{position:fixed!important;left:50px!important;right:auto!important;top:64px!important;width:1180px!important;height:630px!important;z-index:999991!important;border:8px solid #22c55e!important;border-radius:28px!important;box-shadow:0 0 0 9999px rgba(15,23,42,.36),0 24px 80px rgba(15,23,42,.44)!important}
    body.motion-sensi-code-zoom .blocks-header{font-size:1.45rem!important;padding:.8rem 1.2rem!important}
    body.motion-sensi-code-zoom #motionCaption{right:28px!important;bottom:22px!important;max-width:680px!important}
    body.motion-sensi-stage-zoom .blocks-section{opacity:.18!important;filter:blur(1px)!important}
    body.motion-sensi-stage-zoom .robot-section{position:fixed!important;left:70px!important;right:auto!important;top:64px!important;width:1140px!important;height:630px!important;z-index:999990!important;border:8px solid #facc15!important;border-radius:28px!important;box-shadow:0 0 0 9999px rgba(15,23,42,.34),0 24px 80px rgba(15,23,42,.44)!important}
    body.motion-sensi-stage-zoom #robotCanvas{min-height:360px!important}
    body.motion-code-zoom .lesson-panel,body.motion-code-zoom .preview-panel{opacity:.18;filter:blur(1px)}
    body.motion-code-zoom .lesson-panel{display:none!important}
    body.motion-code-zoom .editor-panel{position:fixed!important;left:58px!important;right:auto!important;top:70px!important;width:1164px!important;height:620px!important;z-index:999991!important;border:8px solid #22c55e!important;border-radius:28px!important;box-shadow:0 0 0 9999px rgba(15,23,42,.38),0 24px 80px rgba(15,23,42,.44)!important}
    body.motion-code-zoom #blocksStage{flex:0 0 250px!important;min-height:250px!important}
    body.motion-code-zoom #codePeek{display:flex!important;flex:1!important;max-height:none!important;min-height:0!important;border-top:5px solid #22c55e!important}
    body.motion-code-zoom #codePeek summary{font-size:27px!important;padding:12px 18px!important}
    body.motion-code-zoom #codePeek .code-box{display:flex!important;flex:1!important;min-height:0!important}
    body.motion-code-zoom .editor-tabs button{font-size:25px!important;padding:12px!important}
    body.motion-code-zoom textarea{font-size:30px!important;line-height:1.32!important;padding:18px!important}
    body.motion-world-zoom .code-panel,body.motion-world-zoom .lesson-info,body.motion-world-zoom .status{opacity:.2;filter:blur(1px)}
    body.motion-world-zoom #world{position:fixed!important;left:94px!important;right:auto!important;top:72px!important;width:1090px!important;height:590px!important;z-index:999990!important;border-width:10px!important;border-color:#facc15!important;border-radius:26px!important;box-shadow:0 0 0 9999px rgba(15,23,42,.35),0 24px 80px rgba(15,23,42,.44)!important}
    @keyframes pulseRing{from{transform:scale(.98);opacity:.68}to{transform:scale(1.03);opacity:1}}
  `});
  await page.evaluate(() => {
    const caption = document.createElement('div');
    caption.id = 'motionCaption';
    caption.innerHTML = 'הצצה מהירה מתוך השיעור <small>בלי קריינות — רואים מה עושים בפועל</small>';
    document.body.appendChild(caption);
    const cursor = document.createElement('div');
    cursor.id = 'motionCursor';
    cursor.innerHTML = '<svg viewBox="0 0 44 44" aria-hidden="true"><path d="M7 4 34 28 21 30 16 41 10 39 15 29 5 35Z" fill="#fff" stroke="#0f172a" stroke-width="3" stroke-linejoin="round"/></svg>';
    document.body.appendChild(cursor);
    const chip = document.createElement('div');
    chip.id = 'motionDragChip';
    document.body.appendChild(chip);
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

async function liveHold(page, dir, frame, seconds) {
  const frames = Math.max(1, Math.round(seconds * FPS));
  for (let i = 0; i < frames; i += 1) {
    await sleep(1000 / FPS);
    await snap(page, dir, frame);
  }
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

async function selectorPoint(page, selector, fallback, xRatio = 0.5, yRatio = 0.5) {
  return page.evaluate(({ selector, fallback, xRatio, yRatio }) => {
    const rect = document.querySelector(selector)?.getBoundingClientRect();
    if (!rect) return fallback;
    return {
      x: rect.left + rect.width * xRatio,
      y: rect.top + rect.height * yRatio
    };
  }, { selector, fallback, xRatio, yRatio });
}

async function setCursor(page, x, y, down = false, chip = '') {
  await page.evaluate(({ x, y, down, chip }) => {
    const cursor = document.getElementById('motionCursor');
    if (cursor) {
      cursor.style.opacity = '1';
      cursor.style.transform = `translate(${x}px, ${y}px)`;
      cursor.classList.toggle('down', down);
      cursor.classList.toggle('dragging', !!chip);
      cursor.dataset.chip = chip || '';
    }
    const dragChip = document.getElementById('motionDragChip');
    if (dragChip) {
      dragChip.textContent = chip;
      dragChip.style.opacity = chip ? '1' : '0';
      dragChip.style.transform = `translate(${x - 84}px, ${y - 8}px)`;
    }
  }, { x, y, down, chip });
}

async function moveCursor(page, dir, frame, from, to, seconds, { down = false, chip = '' } = {}) {
  const frames = Math.max(1, Math.round(seconds * FPS));
  for (let i = 0; i < frames; i += 1) {
    const t = frames === 1 ? 1 : i / (frames - 1);
    const eased = t < 0.5 ? 2 * t * t : 1 - ((-2 * t + 2) ** 2) / 2;
    const x = from.x + (to.x - from.x) * eased;
    const y = from.y + (to.y - from.y) * eased;
    await setCursor(page, x, y, down, chip);
    await snap(page, dir, frame);
  }
}

async function minecraftDropPoint(page) {
  return page.evaluate(() => {
    const divRect = document.querySelector('#blocklyDiv')?.getBoundingClientRect();
    const fallback = divRect
      ? { x: divRect.left + divRect.width * 0.62, y: divRect.top + 78 }
      : { x: 445, y: 136 };
    if (!window.workspace || !divRect) return fallback;
    const blocks = workspace.getAllBlocks(false)
      .filter((block) => block.isRendered?.() && block.getSvgRoot?.())
      .map((block) => block.getSvgRoot().getBoundingClientRect())
      .filter((rect) => rect.width > 6 && rect.height > 6)
      .sort((a, b) => (a.bottom - b.bottom) || (b.left - a.left));
    if (!blocks.length) return fallback;
    const last = blocks[blocks.length - 1];
    return {
      x: Math.max(divRect.left + 80, Math.min(divRect.right - 120, last.left + last.width * 0.52)),
      y: Math.max(divRect.top + 70, Math.min(divRect.bottom - 48, last.bottom + 16))
    };
  });
}

async function minecraftAdd(page, dir, frame, label, beforeXml, afterXml, seconds = 0.75) {
  await minecraftWorkspace(page, beforeXml);
  const from = await selectorPoint(page, '.blocklyFlyout', { x: 680, y: 250 }, 0.58, 0.24);
  const to = await minecraftDropPoint(page);
  await setCursor(page, from.x, from.y, false);
  await hold(page, dir, frame, 0.18);
  await setCursor(page, from.x, from.y, true, label);
  await hold(page, dir, frame, 0.14);
  await moveCursor(page, dir, frame, from, to, 0.88, { down: true, chip: label });
  await hold(page, dir, frame, 0.12);
  await minecraftWorkspace(page, afterXml);
  await setCursor(page, to.x, to.y, false, '');
  await ring(page, '#blocklyDiv');
  await hold(page, dir, frame, seconds);
}

function minecraftXmlChain(items) {
  const chain = items
    .slice()
    .reverse()
    .reduce((next, item) => {
      const fields = Object.entries(item.fields || {})
        .map(([name, value]) => `<field name="${name}">${value}</field>`)
        .join('');
      return `<block type="${item.type}">${fields}${next ? `<next>${next}</next>` : ''}</block>`;
    }, '');
  return `<xml>${chain}</xml>`;
}

function webcodeXmlChain(items) {
  const chain = items
    .slice()
    .reverse()
    .reduce((next, item) => {
      const fields = Object.entries(item.fields || {})
        .map(([name, value]) => `<field name="${name}">${value}</field>`)
        .join('');
      return `<block type="${item.type}">${fields}${next ? `<next>${next}</next>` : ''}</block>`;
    }, '');
  return `<xml xmlns="https://developers.google.com/blockly/xml"><block type="page_start" x="130" y="70">${chain ? `<next>${chain}</next>` : ''}</block></xml>`;
}

async function webcodeWorkspace(page, xmlText) {
  await page.evaluate((xmlText) => {
    localStorage.removeItem(`webcodeLessonState:v2:${lesson.id}`);
    if (!blocklyWorkspace || !window.Blockly) return;
    blocklyReady = false;
    blocklyWorkspace.clear();
    Blockly.Xml.domToWorkspace(parseBlocklyXml(xmlText), blocklyWorkspace);
    blocklyReady = true;
    lastGeneratedCodeSelection = null;
    generateCodeFromBlockly();
    Blockly.svgResize(blocklyWorkspace);
    setTimeout(alignBlocklyStarterBlocksRight, 40);
  }, xmlText);
}

async function webcodeDropPoint(page) {
  return page.evaluate(() => {
    const divRect = document.querySelector('#blocklyDiv')?.getBoundingClientRect();
    const fallback = divRect
      ? { x: divRect.left + divRect.width * 0.56, y: divRect.top + 92 }
      : { x: 520, y: 170 };
    if (!window.blocklyWorkspace || !divRect) return fallback;
    const blocks = blocklyWorkspace.getAllBlocks(false)
      .filter((block) => block.isRendered?.() && block.getSvgRoot?.())
      .map((block) => block.getSvgRoot().getBoundingClientRect())
      .filter((rect) => rect.width > 6 && rect.height > 6)
      .sort((a, b) => (a.bottom - b.bottom) || (b.left - a.left));
    if (!blocks.length) return fallback;
    const last = blocks[blocks.length - 1];
    return {
      x: Math.max(divRect.left + 110, Math.min(divRect.right - 150, last.left + last.width * 0.5)),
      y: Math.max(divRect.top + 88, Math.min(divRect.bottom - 46, last.bottom + 18))
    };
  });
}

async function webcodeAdd(page, dir, frame, label, beforeXml, afterXml, seconds = 0.75) {
  await webcodeWorkspace(page, beforeXml);
  const from = await selectorPoint(page, '.blocklyFlyout,.blocklyToolboxDiv', { x: 945, y: 210 }, 0.5, 0.25);
  const to = await webcodeDropPoint(page);
  await setCursor(page, from.x, from.y, false);
  await hold(page, dir, frame, 0.14);
  await setCursor(page, from.x, from.y, true, label);
  await hold(page, dir, frame, 0.12);
  await moveCursor(page, dir, frame, from, to, 0.78, { down: true, chip: label });
  await hold(page, dir, frame, 0.08);
  await webcodeWorkspace(page, afterXml);
  await setCursor(page, to.x, to.y, false, '');
  await ring(page, '#blocklyDiv');
  await hold(page, dir, frame, seconds);
  await clearRing(page);
}

function sensiLessonOneXml(items) {
  const makeStatement = (item, next = '') => {
    const fields = Object.entries(item.fields || {})
      .map(([name, value]) => `<field name="${name}">${value}</field>`)
      .join('');
    if (item.type === 'control_if') {
      const statements = item.do
        .slice()
        .reverse()
        .reduce((innerNext, child) => makeStatement(child, innerNext), '');
      return `<block type="control_if">${fields}<value name="COND"><block type="sensor_light"><field name="VAL">DARK</field></block></value><statement name="DO">${statements}</statement>${next ? `<next>${next}</next>` : ''}</block>`;
    }
    return `<block type="${item.type}">${fields}${next ? `<next>${next}</next>` : ''}</block>`;
  };

  const chain = items
    .slice()
    .reverse()
    .reduce((next, item) => makeStatement(item, next), '');
  return `<xml xmlns="https://developers.google.com/blockly/xml"><block type="event_start" x="430" y="70">${chain ? `<next>${chain}</next>` : ''}</block></xml>`;
}

async function sensiWorkspace(page, xmlText) {
  await page.evaluate((xmlText) => {
    localStorage.removeItem(workspaceStorageKey(currentLesson));
    if (!workspace || !window.Blockly) return;
    isRestoringWorkspace = true;
    try {
      workspace.clear();
      if (xmlText) {
        const xml = Blockly.utils.xml.textToDom(xmlText);
        Blockly.Xml.domToWorkspace(xml, workspace);
      }
      Blockly.svgResize(workspace);
      workspace.scrollCenter?.();
      const metrics = workspace.getMetrics?.();
      if (metrics && typeof workspace.scroll === 'function') {
        workspace.scroll(-(metrics.contentLeft || 0) + 40, -(metrics.contentTop || 0) + 20);
      }
      saveWorkspaceForLesson(currentLesson);
    } finally {
      isRestoringWorkspace = false;
    }
  }, xmlText);
}

async function sensiDropPoint(page) {
  return page.evaluate(() => {
    const divRect = document.querySelector('#blocklyDiv')?.getBoundingClientRect();
    const fallback = divRect
      ? { x: divRect.left + divRect.width * 0.58, y: divRect.top + 84 }
      : { x: 820, y: 160 };
    if (!window.workspace || !divRect) return fallback;
    const blocks = workspace.getAllBlocks(false)
      .filter((block) => block.isRendered?.() && block.getSvgRoot?.())
      .map((block) => block.getSvgRoot().getBoundingClientRect())
      .filter((rect) => rect.width > 6 && rect.height > 6)
      .sort((a, b) => (a.bottom - b.bottom) || (b.left - a.left));
    if (!blocks.length) return fallback;
    const last = blocks[blocks.length - 1];
    return {
      x: Math.max(divRect.left + 120, Math.min(divRect.right - 130, last.left + last.width * 0.54)),
      y: Math.max(divRect.top + 74, Math.min(divRect.bottom - 54, last.bottom + 18))
    };
  });
}

async function sensiAdd(page, dir, frame, label, beforeXml, afterXml, seconds = 0.75) {
  await sensiWorkspace(page, beforeXml);
  const from = await selectorPoint(page, '.blocklyFlyout,.blocklyToolboxDiv', { x: 1140, y: 210 }, 0.55, 0.28);
  const to = await sensiDropPoint(page);
  await setCursor(page, from.x, from.y, false);
  await hold(page, dir, frame, 0.16);
  await setCursor(page, from.x, from.y, true, label);
  await hold(page, dir, frame, 0.12);
  await moveCursor(page, dir, frame, from, to, 0.86, { down: true, chip: label });
  await hold(page, dir, frame, 0.1);
  await sensiWorkspace(page, afterXml);
  await setCursor(page, to.x, to.y, false, '');
  await ring(page, '#blocklyDiv');
  await hold(page, dir, frame, seconds);
  await clearRing(page);
}

async function minecraftClickRun(page, dir, frame) {
  const from = await selectorPoint(page, '#blocklyDiv', { x: 360, y: 260 }, 0.45, 0.5);
  const to = await selectorPoint(page, '.btn.run', { x: 675, y: 24 }, 0.5, 0.5);
  await moveCursor(page, dir, frame, from, to, 0.55);
  await setCursor(page, to.x, to.y, true);
  await hold(page, dir, frame, 0.2);
  await setCursor(page, to.x, to.y, false);
  await page.evaluate(() => document.querySelector('.btn.run')?.classList.add('motion-spot'));
}

async function timeline(page, course, dir, frame) {
  if (course.slug === 'sensi-city') {
    await page.evaluate(() => localStorage.removeItem('sensi-blocks-lesson-1'));
    await page.reload({ waitUntil: 'networkidle2' });
    await prepare(page);
    await clickText(page, 'התחילו בשיעור 1');
    await sleep(500);
    await page.evaluate(() => {
      document.body.classList.add('motion-sensi-focus');
      document.getElementById('lessonDrawer')?.classList.remove('open');
      try {
        Blockly.svgResize(workspace);
      } catch {}
    });
    const plan = [
      {
        label: 'אם חשוך',
        type: 'control_if',
        do: [
          { type: 'action_street_light', fields: { STATE: 'ON' } }
        ]
      },
      {
        label: 'אמור הודעה',
        type: 'action_say',
        fields: { TEXT: 'מצאתי חושך - מדליק פנס!' }
      }
    ];
    const xmlSteps = [
      { label: 'בלוק התחלה', xml: sensiLessonOneXml([]), seedOnly: true },
      { label: 'אם חשוך', xml: sensiLessonOneXml(plan.slice(0, 1)) },
      { label: 'אמור הודעה', xml: sensiLessonOneXml(plan) }
    ];

    let currentXml = '';
    await sensiWorkspace(page, currentXml);
    await caption(page, '1. מתחילים ממשטח בלוקים ריק', 'עכשיו רואים את התוכנית שנבנית בפועל');
    await spot(page, '#blocklyDiv');
    await hold(page, dir, frame, 0.8);
    await caption(page, '2. גוררים בלוקים לתוכנית', 'הסמן מביא את הבלוק למקום הנכון');
    for (const step of xmlSteps) {
      await sensiAdd(page, dir, frame, step.label, currentXml, step.xml, step.seedOnly ? 0.45 : 0.8);
      currentXml = step.xml;
    }
    await caption(page, '3. זום על הקוד בבלוקים', 'רואים התחלה, תנאי, חיישן ופעולות');
    await page.evaluate(() => {
      document.body.classList.add('motion-sensi-code-zoom');
      try {
        Blockly.svgResize(workspace);
        workspace.zoomToFit?.();
      } catch {}
    });
    await spot(page, '#blocklyDiv');
    await ring(page, '#blocklyDiv');
    await hold(page, dir, frame, 2.8);
    await page.evaluate(() => document.body.classList.remove('motion-sensi-code-zoom'));
    await clearRing(page);
    await caption(page, '4. משנים מצב בעיר', 'מפעילים חושך כדי לבדוק את התוכנית');
    await spot(page, '#robotCanvas');
    await ring(page, '#sensorLight');
    await page.evaluate(() => { try { window.toggleEnv?.('light'); } catch {} });
    await hold(page, dir, frame, 1.6);
    await caption(page, '5. בודקים לפני הרצה', 'המערכת מחזירה משוב לתלמיד');
    await clearRing(page);
    await spot(page, '#precheckButton, #precheckPanel');
    await page.evaluate(() => { try { window.checkProgramBeforeRun?.(); } catch {} });
    await hold(page, dir, frame, 1.4);
    await caption(page, '6. לוחצים הפעל ורואים תוצאה', 'זום לקאנבס: סנסי מגיבה לקוד שנבנה');
    await page.evaluate(() => document.body.classList.add('motion-sensi-stage-zoom'));
    await clearRing(page);
    await ring(page, '#robotCanvas');
    const runPoint = await selectorPoint(page, '.btn-run', { x: 670, y: 26 }, 0.5, 0.5);
    const from = await selectorPoint(page, '#blocklyDiv', { x: 880, y: 350 }, 0.45, 0.5);
    await moveCursor(page, dir, frame, from, runPoint, 0.55);
    await setCursor(page, runPoint.x, runPoint.y, true);
    await hold(page, dir, frame, 0.18);
    await setCursor(page, runPoint.x, runPoint.y, false);
    await page.evaluate(() => { try { window.runCode?.(); } catch {} });
    await liveHold(page, dir, frame, 4.4);
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
    const plan = [
      { label: 'עיצוב שמיים', type: 'web_theme', fields: { THEME: 'sky' } },
      { label: 'כותרת אתר', type: 'web_title', fields: { TEXT: 'האתר הראשון שלי' } },
      { label: 'פסקה', type: 'web_paragraph', fields: { TEXT: 'אני בונה עמוד אמיתי בעזרת בלוקים' } },
      { label: 'סמל גדול', type: 'web_emoji', fields: { EMOJI: '🚀' } },
      { label: 'כפתור עובד', type: 'web_button', fields: { LABEL: 'לחצו להפתעה', MESSAGE: 'הכפתור עובד 🎉' } },
      { label: 'שתי קוביות מידע', type: 'web_columns', fields: { A: 'HTML בונה מבנה', B: 'CSS מוסיף עיצוב' } },
      { label: 'חתימה', type: 'web_footer', fields: { TEXT: 'נבנה ב-WebCode Lab' } }
    ];
    const xmlSteps = [1, 3, 4, 6, plan.length - 1].map((index) => ({
      label: plan[index].label,
      xml: webcodeXmlChain(plan.slice(0, index + 1))
    }));
    await page.evaluate(() => {
      document.body.classList.add('motion-webcode-focus');
      try {
        document.querySelector('.main')?.classList.remove('lesson-collapsed');
        document.querySelector('#lessonPanel')?.classList.remove('collapsed');
        document.documentElement.style.setProperty('--preview-width', '390px');
        window.Blockly && blocklyWorkspace && setTimeout(() => Blockly.svgResize(blocklyWorkspace), 80);
      } catch {}
    });
    let currentXml = webcodeXmlChain([]);
    await webcodeWorkspace(page, currentXml);
    await caption(page, '1. מתחילים מעמוד ריק', 'הבלוקים ייצרו את האתר והתוצאה תופיע משמאל');
    await spot(page, '#blocklyDiv');
    await hold(page, dir, frame, 0.8);
    await caption(page, '2. גוררים בלוקים שבונים אתר', 'כותרת, טקסט, סמל וכפתור נכנסים לשרשרת');
    for (const step of xmlSteps) {
      await webcodeAdd(page, dir, frame, step.label, currentXml, step.xml, 0.75);
      currentXml = step.xml;
    }
    await page.evaluate(() => { try { window.runCode?.(); } catch {} });
    await caption(page, '3. פותחים קוד שנוצר מהבלוקים', 'רואים בגדול HTML, CSS ו־JavaScript');
    await page.evaluate(() => {
      try {
        window.showGeneratedCode?.();
        document.querySelector('#codePeek')?.scrollIntoView({ block: 'nearest' });
        document.body.classList.add('motion-code-zoom');
      } catch {}
    });
    await spot(page, '#codePeek');
    await hold(page, dir, frame, 1);
    await page.evaluate(() => document.querySelector('.editor-tabs button:nth-child(1)')?.click());
    await ring(page, '#htmlCode');
    await hold(page, dir, frame, 2.1);
    await page.evaluate(() => document.querySelector('.editor-tabs button:nth-child(2)')?.click());
    await ring(page, '#cssCode');
    await hold(page, dir, frame, 2.1);
    await page.evaluate(() => document.querySelector('.editor-tabs button:nth-child(3)')?.click());
    await ring(page, '#jsCode');
    await hold(page, dir, frame, 2.1);
    await caption(page, '4. חוזרים לתוצאה', 'האתר החי נבנה מהבלוקים שהורכבו');
    await page.evaluate(() => document.body.classList.remove('motion-code-zoom'));
    await clearRing(page);
    await spot(page, '#previewPanel, iframe');
    await ring(page, '#previewPanel');
    await hold(page, dir, frame, 2.2);
    return;
  }

  if (course.slug === 'minecraft') {
    const plan = [
      { label: 'כאשר לוחצים ▶️', type: 'event_start' },
      { label: 'אמור: בונים בית', type: 'say', fields: { TEXT: 'אני בונה בית פיקסלים!' } },
      { label: 'קיר עץ', type: 'place_block', fields: { COLOR: 'wood' } },
      { label: 'זוז ימינה', type: 'move_direction', fields: { DIR: 'right', STEP: 'full' } },
      { label: 'קיר עץ', type: 'place_block', fields: { COLOR: 'wood' } },
      { label: 'זוז ימינה', type: 'move_direction', fields: { DIR: 'right', STEP: 'full' } },
      { label: 'קיר עץ', type: 'place_block', fields: { COLOR: 'wood' } },
      { label: 'זוז ימינה', type: 'move_direction', fields: { DIR: 'right', STEP: 'full' } },
      { label: 'קיר עץ', type: 'place_block', fields: { COLOR: 'wood' } },
      { label: 'זוז ימינה', type: 'move_direction', fields: { DIR: 'right', STEP: 'full' } },
      { label: 'קיר עץ', type: 'place_block', fields: { COLOR: 'wood' } },
      { label: 'חוזרים להתחלת השורה', type: 'move_direction', fields: { DIR: 'left', STEP: 'full' } },
      { label: 'שמאלה', type: 'move_direction', fields: { DIR: 'left', STEP: 'full' } },
      { label: 'שמאלה', type: 'move_direction', fields: { DIR: 'left', STEP: 'full' } },
      { label: 'שמאלה', type: 'move_direction', fields: { DIR: 'left', STEP: 'full' } },
      { label: 'עולים שורה', type: 'move_direction', fields: { DIR: 'up', STEP: 'full' } },
      { label: 'קיר עץ', type: 'place_block', fields: { COLOR: 'wood' } },
      { label: 'זוז ימינה', type: 'move_direction', fields: { DIR: 'right', STEP: 'full' } },
      { label: 'קיר עץ', type: 'place_block', fields: { COLOR: 'wood' } },
      { label: 'זוז ימינה', type: 'move_direction', fields: { DIR: 'right', STEP: 'full' } },
      { label: 'דלת זהב', type: 'place_block', fields: { COLOR: 'gold' } },
      { label: 'זוז ימינה', type: 'move_direction', fields: { DIR: 'right', STEP: 'full' } },
      { label: 'קיר עץ', type: 'place_block', fields: { COLOR: 'wood' } },
      { label: 'זוז ימינה', type: 'move_direction', fields: { DIR: 'right', STEP: 'full' } },
      { label: 'קיר עץ', type: 'place_block', fields: { COLOR: 'wood' } },
      { label: 'חוזרים ועולים', type: 'move_direction', fields: { DIR: 'left', STEP: 'full' } },
      { label: 'שמאלה', type: 'move_direction', fields: { DIR: 'left', STEP: 'full' } },
      { label: 'שמאלה', type: 'move_direction', fields: { DIR: 'left', STEP: 'full' } },
      { label: 'שמאלה', type: 'move_direction', fields: { DIR: 'left', STEP: 'full' } },
      { label: 'עולים שורה', type: 'move_direction', fields: { DIR: 'up', STEP: 'full' } },
      { label: 'קיר עץ', type: 'place_block', fields: { COLOR: 'wood' } },
      { label: 'זוז ימינה', type: 'move_direction', fields: { DIR: 'right', STEP: 'full' } },
      { label: 'קיר עץ', type: 'place_block', fields: { COLOR: 'wood' } },
      { label: 'זוז ימינה', type: 'move_direction', fields: { DIR: 'right', STEP: 'full' } },
      { label: 'דלת זהב', type: 'place_block', fields: { COLOR: 'gold' } },
      { label: 'זוז ימינה', type: 'move_direction', fields: { DIR: 'right', STEP: 'full' } },
      { label: 'קיר עץ', type: 'place_block', fields: { COLOR: 'wood' } },
      { label: 'זוז ימינה', type: 'move_direction', fields: { DIR: 'right', STEP: 'full' } },
      { label: 'קיר עץ', type: 'place_block', fields: { COLOR: 'wood' } },
      { label: 'למרכז הגג', type: 'move_direction', fields: { DIR: 'left', STEP: 'full' } },
      { label: 'שמאלה', type: 'move_direction', fields: { DIR: 'left', STEP: 'full' } },
      { label: 'שמאלה', type: 'move_direction', fields: { DIR: 'left', STEP: 'full' } },
      { label: 'עולים לגג', type: 'move_direction', fields: { DIR: 'up', STEP: 'full' } },
      { label: 'גג אדום', type: 'place_block', fields: { COLOR: 'red' } },
      { label: 'ימינה', type: 'move_direction', fields: { DIR: 'right', STEP: 'full' } },
      { label: 'גג אדום', type: 'place_block', fields: { COLOR: 'red' } },
      { label: 'ימינה', type: 'move_direction', fields: { DIR: 'right', STEP: 'full' } },
      { label: 'גג אדום', type: 'place_block', fields: { COLOR: 'red' } },
      { label: 'מרכז הגג', type: 'move_direction', fields: { DIR: 'left', STEP: 'full' } },
      { label: 'עולים לשפיץ', type: 'move_direction', fields: { DIR: 'up', STEP: 'full' } },
      { label: 'בלוק גג עליון', type: 'place_block', fields: { COLOR: 'red' } },
      { label: 'סיימתי את הבית', type: 'say', fields: { TEXT: 'בית הפיקסלים מוכן!' } }
    ];
    const xmlSteps = [0, 1, 10, 24, 38, plan.length - 1].map((index) => ({
      index,
      label: index < 2 ? plan[index].label : ['שורת בסיס רחבה', 'קומה עם דלת', 'גג אדום', 'בית פיקסלים שלם'][Math.min(3, Math.max(0, [10, 24, 38, plan.length - 1].indexOf(index)))],
      xml: minecraftXmlChain(plan.slice(0, index + 1))
    }));

    await caption(page, '1. מתחילים ממשטח ריק', 'אין קוד — עכשיו בונים אותו');
    await spot(page, '#blocklyDiv');
    await minecraftWorkspace(page, '');
    await hold(page, dir, frame, 1);
    await caption(page, '2. בוחרים שיעור מתקדם יותר', 'שיעור 9: מציור לדגם בלוקים');
    await ring(page, '#lessonMissionBoard');
    await hold(page, dir, frame, 1.1);
    await clearRing(page);
    await caption(page, '3. גוררים בלוקים ומרכיבים תוכנית', 'הסמן נשאר צמוד לבלוק בזמן הגרירה');
    let currentXml = '';
    for (const step of xmlSteps) {
      await minecraftAdd(page, dir, frame, step.label, currentXml, step.xml, step.index < 2 ? 0.5 : 0.8);
      currentXml = step.xml;
    }
    await caption(page, '4. לוחצים הרצה', 'העכבר מפעיל את התוכנית');
    await clearRing(page);
    await minecraftClickRun(page, dir, frame);
    await caption(page, '5. זום־אין לתוצאה', 'רואים בית פיקסלים גדול נבנה מהבלוקים');
    await page.evaluate(() => {
      try {
        document.body.classList.add('motion-world-zoom');
        runProgram();
      } catch {}
    });
    await ring(page, '#world');
    await liveHold(page, dir, frame, 24);
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
