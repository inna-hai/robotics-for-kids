import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

function loadWindow(file) {
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  vm.runInContext(readFileSync(new URL(`../${file}`, import.meta.url), 'utf8'), sandbox, { filename: file });
  return sandbox.window;
}

function parsePlayPage(file) {
  const html = readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
  const toolboxTypes = new Set([...html.matchAll(/<block type="([^"]+)"/g)].map(match => match[1]));
  const mapSource = html.match(/const blockKeyToType = \{([^}]+)\}/s)?.[1] || '';
  const blockKeyToType = Object.fromEntries([...mapSource.matchAll(/(\w+):'([^']+)'/g)].map(match => [match[1], match[2]]));
  return { html, toolboxTypes, blockKeyToType };
}

function checkCourse({ lessons, playPage, courseName }) {
  assert.ok(playPage.html.includes('renderAppWorkflow'), `${courseName} play page should render app workflow fallback`);
  assert.ok(playPage.html.includes('missingToolboxBlocks'), `${courseName} play page should detect unavailable toolbox blocks`);
  assert.ok(playPage.html.includes('id="workspaceTitle"'), `${courseName} play page should expose workspaceTitle for dynamic app-mode titles`);
  assert.ok(!playPage.html.includes('אזור עבודה — System Check Alpha'), `${courseName} play page should not hard-code the old System Check workspace title`);
  for (const lesson of lessons) {
    const expectedTypes = (lesson.blocks || [])
      .map(key => [key, playPage.blockKeyToType[key]])
      .filter(([, type]) => type && type !== 'tello_comment' && type !== 'tello_safety_check' && type !== 'tello_share');
    const unmapped = (lesson.blocks || []).filter(key => !playPage.blockKeyToType[key]);
    assert.equal(unmapped.length, 0, `${courseName} lesson ${lesson.id} has unmapped block keys: ${unmapped.join(', ')}`);
    const missingToolbox = expectedTypes.filter(([, type]) => !playPage.toolboxTypes.has(type));
    if (lesson.workspaceMode) {
      assert.ok(lesson.appWorkflow?.length >= 3 || lesson.setupSteps?.length >= 3, `${courseName} lesson ${lesson.id} external workflow mode needs concrete app/setup steps`);
    } else if (missingToolbox.length === 0) {
      assert.ok(expectedTypes.length > 0, `${courseName} lesson ${lesson.id} internal Blockly lesson should have expected blocks`);
    } else {
      assert.ok(
        playPage.html.includes('externalWorkspaceModes') && playPage.html.includes('missingToolboxBlocks.length === 0'),
        `${courseName} lesson ${lesson.id} with missing toolbox blocks must be protected by app workflow fallback`
      );
    }
  }
}

test('Tello grade 5 lesson 4 is upgraded into a DroneBlocks App loop lesson', () => {
  const lessons = loadWindow('js/tello-edu-grade5-lessons.js').TELLO_EDU_GRADE5_LESSONS;
  const lesson = lessons[3];
  assert.equal(lesson.workspaceMode, 'droneblocks-app');
  assert.match(lesson.title, /מופע הרחפנים החכם/);
  assert.match(lesson.story, /Verity Studios/);
  assert.match(lesson.mission, /Loop ×4/);
  assert.match(lesson.mission, /Loop ×3/);
  assert.ok(lesson.lessonFlow.length >= 8);
  assert.ok(lesson.exercises.length >= 8);
  assert.ok(lesson.appWorkflow.length >= 5);
  assert.match(lesson.deliverable, /Share Link|צילום מסך/);
});


test('Mission Lab lessons 4-7 progress from app Grid Scan to physical flight, rescue scan, and camera data', () => {
  const lessons = loadWindow('js/tello-mission-lab-lessons.js').TELLO_MISSION_LAB_LESSONS;
  const lesson4 = lessons[3];
  const lesson5 = lessons[4];
  const lesson6 = lessons[5];
  const lesson7 = lessons[6];
  assert.equal(lesson4.workspaceMode, 'droneblocks-app');
  assert.match(lesson4.title, /Grid Scan/);
  assert.match(lesson4.story, /SeeTree/);
  assert.match(lesson4.mission, /משתנים מוצגים כהרחבה בלבד/);
  assert.ok(lesson4.appWorkflow.length >= 6);
  assert.ok(lesson4.exercises.some(ex => /Coverage/.test(ex.title)));
  assert.equal(lesson5.workspaceMode, 'physical-lab');
  assert.match(lesson5.mission, /Yaw Right 90/);
  assert.match(lesson5.mission, /scan_distance/);
  assert.match(lesson5.mission, /30in/);
  assert.ok(lesson5.appWorkflow.some(step => /אישור/.test(step.detail)));
  assert.ok(lesson5.assessment.some(item => /scan_distance/.test(item)));
  assert.equal(lesson6.workspaceMode, 'physical-lab');
  assert.match(lesson6.title, /איתור ניצולים|Grid Scan/);
  assert.match(lesson6.mission, /Forward 80cm/);
  assert.ok(lesson6.appWorkflow.some(step => /Physical Debugging|דיבוג/.test(step.title + step.detail)));
  assert.equal(lesson7.workspaceMode, 'physical-lab');
  assert.match(lesson7.title, /מצלמה|שומרי היערות/);
  assert.match(lesson7.mission, /Take Photo/);
  assert.ok(lesson7.appWorkflow.some(step => /Data Retrieval|תמונות|גלר/.test(step.title + step.detail)));
  assert.match(lesson4.visualDiagram?.src || '', /grid-scan-diagram\.svg/);
  assert.match(lesson5.visualDiagram?.src || '', /research-first-flight-diagram\.svg/);
  assert.match(lesson6.visualDiagram?.src || '', /search-grid-scan-diagram\.svg/);
  assert.match(lesson7.visualDiagram?.src || '', /camera-sos-scan-diagram\.svg/);
});

test('Tello play pages do not require unavailable lesson blocks in the internal Blockly toolbox', () => {
  const grade5Lessons = loadWindow('js/tello-edu-grade5-lessons.js').TELLO_EDU_GRADE5_LESSONS;
  const missionLabLessons = loadWindow('js/tello-mission-lab-lessons.js').TELLO_MISSION_LAB_LESSONS;
  checkCourse({ lessons: grade5Lessons, playPage: parsePlayPage('tello-edu-grade5-play.html'), courseName: 'Grade 5 Tello EDU' });
  checkCourse({ lessons: missionLabLessons, playPage: parsePlayPage('tello-mission-lab-play.html'), courseName: 'Grade 6 Mission Lab' });
});
