import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { chromium } from 'playwright';

const root = new URL('../../', import.meta.url).pathname;
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8' };
const server = createServer(async (request, response) => {
  try {
    const pathname = new URL(request.url, 'http://localhost').pathname;
    const relative = pathname === '/' ? 'webcode.html' : pathname.replace(/^\/+/, '');
    const file = normalize(join(root, relative));
    if (!file.startsWith(normalize(root))) throw new Error('forbidden');
    const body = await readFile(file);
    response.writeHead(200, { 'Content-Type': mime[extname(file)] || 'application/octet-stream' });
    response.end(body);
  } catch {
    response.writeHead(404).end('not found');
  }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const port = server.address().port;

let browser;
try {
  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ locale: 'he-IL' });
  const externalBlocklyRequests = [];
  await page.route('https://unpkg.com/**', route => {
    externalBlocklyRequests.push(route.request().url());
    return route.abort();
  });
  await page.goto(`http://127.0.0.1:${port}/webcode-play.html?lesson=1`, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.WEBCODE_LESSONS?.length === 30 && typeof window.Blockly === 'object');

  const runtime = await page.evaluate(() => {
    const paragraphRule = window.WEBCODE_LESSONS[0].exercises
      .flatMap(exercise => exercise.check?.qualityBlocklyFields || [])
      .find(rule => rule.type === 'web_paragraph');
    const encoded = jsLiteral('hello "kid" \\ path');
    const syntaxError = validateJavaScriptSyntax(`const value = ${encoded};`);
    const sourceScripts = [...document.scripts].map(script => script.src).filter(Boolean);
    const progressEvents = [];
    window.addEventListener('hai:classroom-progress', event => progressEvents.push(event.detail));
    currentExercise().check = {};
    checkExercise();
    return {
      encodedRoundTrip: JSON.parse(encoded),
      syntaxError: syntaxError?.message || '',
      paragraphRule,
      sourceScripts,
      progressEvents,
      startupFallback: typeof window.showWebCodeStartupError,
    };
  });

  assert.equal(externalBlocklyRequests.length, 0, 'the page must not request Blockly from unpkg');
  assert.equal(runtime.encodedRoundTrip, 'hello "kid" \\ path');
  assert.equal(runtime.syntaxError, '');
  assert.ok(runtime.paragraphRule.minChars >= 12 && runtime.paragraphRule.minWords >= 3);
  assert.equal(runtime.startupFallback, 'function');
  assert.ok(runtime.sourceScripts.some(url => /\/js\/webcode-lessons\.js\?v=/.test(url)));
  assert.ok(!runtime.sourceScripts.some(url => url.includes('webcode-lessons-code-bridge')));
  assert.equal(runtime.progressEvents.length, 1);
  assert.deepEqual(runtime.progressEvents[0], { lessonId: '1', activityId: 'exercise-1', status: 'completed', score: 100 });

  await page.goto(`http://127.0.0.1:${port}/webcode-play.html?lesson=2&exercise=9`, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.WEBCODE_LESSONS?.length === 30 && typeof window.Blockly === 'object');
  const manualSelection = await page.evaluate(() => {
    if(Number(currentExercise().id) !== 9) selectExercise(9);
    activateCodeTab('css');
    const editor = document.getElementById('cssCode');
    editor.focus();
    editor.setSelectionRange(0, Math.min(12, editor.value.length));
    lastGeneratedCodeSelection = null;
    const captured = captureManualCodeSelection();
    return {
      captured,
      blockType: lastGeneratedCodeSelection?.blockType || '',
      accepted: hasRequiredCodeSelection(currentExercise().check),
      requiredBlockTypes: currentExercise().check.requiresCodeSelectionBlockTypes || [],
    };
  });
  assert.equal(manualSelection.captured, true, 'the probe must capture a manual code-line selection');
  assert.equal(manualSelection.blockType, 'manual_code_line');
  assert.ok(manualSelection.requiredBlockTypes.length > 0, 'the exercise must require specific generated block types');
  assert.equal(manualSelection.accepted, false, 'a manual code-line selection must not bypass a required Blockly block selection');
  console.log('✓ WebCode loads locally, escapes generated strings, validates paragraphs, requires code selection, and reports classroom progress');
} finally {
  if (browser) await browser.close();
  await new Promise(resolve => server.close(resolve));
}
