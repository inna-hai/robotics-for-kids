import assert from 'node:assert/strict';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import { chromium } from 'playwright';

const root = process.cwd();
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml' };
const server = http.createServer(async (req, res) => {
  const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  const file = path.resolve(root, `.${pathname === '/' ? '/index.html' : pathname}`);
  if (!file.startsWith(`${root}${path.sep}`)) return res.writeHead(403).end();
  try {
    const info = await stat(file);
    if (!info.isFile()) throw new Error('not a file');
    res.writeHead(200, { 'content-type': types[path.extname(file)] || 'application/octet-stream' });
    createReadStream(file).pipe(res);
  } catch {
    res.writeHead(404).end();
  }
});

await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const { port } = server.address();
const browser = await chromium.launch({ headless: true });

try {
  const page = await browser.newPage();
  await page.goto(`http://127.0.0.1:${port}/python-turtle-advanced.html?lesson=23`, { waitUntil: 'networkidle' });
  const result = await page.evaluate(() => {
    const repeat = workspace.newBlock('py_repeat');
    repeat.initSvg(); repeat.render(); repeat.setFieldValue('4', 'TIMES'); repeat.moveBy(40, 40);
    const forward = workspace.newBlock('py_forward');
    forward.initSvg(); forward.render(); forward.setFieldValue('100', 'STEPS');
    repeat.getInput('DO').connection.connect(forward.previousConnection);
    const right = workspace.newBlock('py_right');
    right.initSvg(); right.render(); right.setFieldValue('90', 'ANGLE');
    forward.nextConnection.connect(right.previousConnection);
    selectLesson23CodeLine(forward.id);
    const deleted = deleteLesson23SelectedLine();
    generatePython();
    return {
      deleted,
      repeatBodyType: repeat.getInputTargetBlock('DO')?.type || null,
      code: document.querySelector('#pythonCode').innerText,
    };
  });
  assert.equal(result.deleted, true);
  assert.equal(result.repeatBodyType, 'py_right', 'deleting the first loop-body line must keep the next line inside repeat');
  assert.match(result.code, /for i in range\(4\):\n\s{4}right\(90\)/);
  console.log('✓ deleting the first repeat-body line preserves loop structure');

  await page.goto(`http://127.0.0.1:${port}/python-turtle-advanced.html?lesson=21&exercise=4&unlock=1`, { waitUntil: 'networkidle' });
  const unrelatedLoopErrors = await page.evaluate(() => {
    workspace.clear();
    const xml = '<xml><block type="py_python"><next><block type="py_repeat"><field name="TIMES">6</field><statement name="DO"><block type="py_forward"><field name="STEPS">30</field><next><block type="py_right"><field name="ANGLE">60</field></block></next></block></statement></block></next></block></xml>';
    Blockly.Xml.domToWorkspace(Blockly.utils.xml.textToDom(xml), workspace);
    return validateExercise();
  });
  assert.ok(unrelatedLoopErrors.length > 0, 'lesson 21 exercise 4 must reject an unrelated generic loop');
  console.log('✓ lesson 21 exercise 4 rejects unrelated loops');

  const missingSunColorErrors = await page.evaluate(() => {
    workspace.clear();
    const xml = '<xml><block type="py_python"><next><block type="py_repeat"><field name="TIMES">18</field><statement name="DO"><block type="py_forward"><field name="STEPS">5</field><next><block type="py_right"><field name="ANGLE">10</field></block></next></block></statement></block></next></block></xml>';
    Blockly.Xml.domToWorkspace(Blockly.utils.xml.textToDom(xml), workspace);
    return validateExercise();
  });
  assert.ok(missingSunColorErrors.length > 0, 'lesson 21 exercise 4 must require an explicit sun color');
  console.log('✓ lesson 21 exercise 4 requires an explicit sun color');

  await page.goto(`http://127.0.0.1:${port}/python-turtle-advanced.html?lesson=21&exercise=5&unlock=1`, { waitUntil: 'networkidle' });
  const unrelatedRayErrors = await page.evaluate(() => {
    workspace.clear();
    const xml = '<xml><block type="py_python"><next><block type="py_repeat"><field name="TIMES">6</field><statement name="DO"><block type="py_forward"><field name="STEPS">30</field><next><block type="py_right"><field name="ANGLE">60</field></block></next></block></statement></block></next></block></xml>';
    Blockly.Xml.domToWorkspace(Blockly.utils.xml.textToDom(xml), workspace);
    return validateExercise();
  });
  assert.ok(unrelatedRayErrors.length > 0, 'lesson 21 exercise 5 must reject a generic hexagon loop');
  console.log('✓ lesson 21 exercise 5 rejects a generic hexagon');

  await page.goto(`http://127.0.0.1:${port}/python-turtle-advanced.html?lesson=21&exercise=8&unlock=1`, { waitUntil: 'networkidle' });
  const missingDetailErrors = await page.evaluate(() => {
    workspace.clear();
    const xml = '<xml><block type="py_python"><next><block type="py_repeat"><field name="TIMES">18</field><statement name="DO"><block type="py_forward"><field name="STEPS">5</field><next><block type="py_right"><field name="ANGLE">10</field></block></next></block></statement></block></next></block></xml>';
    Blockly.Xml.domToWorkspace(Blockly.utils.xml.textToDom(xml), workspace);
    return validateExercise();
  });
  assert.ok(missingDetailErrors.length > 0, 'lesson 21 exercise 8 must require a separate repeated detail');
  console.log('✓ lesson 21 exercise 8 requires a repeated detail');

  await page.goto(`http://127.0.0.1:${port}/python-turtle.html?l=23`, { waitUntil: 'networkidle' });
  assert.equal(
    new URL(page.url()).pathname,
    '/python-turtle-advanced.html',
    'legacy ?l= advanced lesson links must redirect to the advanced application',
  );
  console.log('✓ legacy advanced lesson links redirect to the advanced application');
} finally {
  await browser.close();
  await new Promise(resolve => server.close(resolve));
}
