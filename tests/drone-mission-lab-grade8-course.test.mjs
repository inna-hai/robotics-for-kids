import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const root = new URL('../', import.meta.url);
const homepageHtml = readFileSync(new URL('index.html', root), 'utf8');
const courseHtml = readFileSync(new URL('drone-mission-lab-grade8.html', root), 'utf8');
const playHtml = readFileSync(new URL('drone-mission-lab-grade8-play.html', root), 'utf8');
const slidesHtml = readFileSync(new URL('drone-mission-lab-grade8-slides.html', root), 'utf8');
const guideHtml = readFileSync(new URL('drone-mission-lab-grade8-guide.html', root), 'utf8');
const lessonsSource = readFileSync(new URL('js/drone-mission-lab-grade8-lessons.js', root), 'utf8');

function assertIncludes(source, needle, message = `Missing: ${needle}`) { assert.ok(source.includes(needle), message); }
function loadLessons() { const sandbox = { window: {} }; vm.createContext(sandbox); vm.runInContext(lessonsSource, sandbox); return sandbox.window; }
const data = loadLessons();

test('Drone Mission Lab exposes a 15 lesson grade 8 JavaScript photography and research scaffold', () => {
  const lessons = data.DRONE_MISSION_LAB_GRADE8_LESSONS;
  assert.equal(lessons.length, 15);
  assert.equal(JSON.stringify(lessons.map(l => l.id)), JSON.stringify(Array.from({ length: 15 }, (_, i) => i + 1)));
  assert.ok(lessons.every(l => l.durationMinutes === 90));
  assert.ok(lessons.every(l => l.grade === 'כיתה ח׳'));
  assert.ok(lessons.every(l => l.language === 'JavaScript'));
  assert.ok(lessons.every(l => l.tabletFirst === true));
  assert.ok(lessons.slice(0, 4).every(l => l.physicalFlightAllowed === false));
  assert.ok(lessons.slice(4, 9).every(l => l.physicalFlightAllowed === true));
  assert.equal(lessons[9].physicalFlightAllowed, false);
});

test('Drone Mission Lab lesson 1 implements the Antarctica simulator-only JavaScript introduction', () => {
  const lesson = data.DRONE_MISSION_LAB_GRADE8_LESSONS[0];
  assertIncludes(lesson.title, 'Antarctica');
  assertIncludes(lesson.title, 'JavaScript');
  assert.equal(lesson.physicalFlightAllowed, false);
  assertIncludes(lesson.mission, 'Meeting1_Atmospheric_Scan_JS');
  assertIncludes(lesson.mission, 'Minimal Grid');
  assertIncludes(lesson.mission, 'הרחפנים הפיזיים נשארים בארון');
  assertIncludes(lesson.visualDiagram.src, 'lesson1/antarctica-atmospheric-vertical-scan.svg');
  assert.ok(lesson.vocabulary.some(([term]) => term.includes('CamelCase')));
  assert.ok(lesson.safetyRules.some(rule => rule.includes('אין חיבור ל־TELLO WiFi')));
  assert.ok(lesson.appWorkflow.some(step => step.detail.includes('flyUp')));
});

test('Drone Mission Lab lesson 2 implements the SolarScan Box Mission comparison', () => {
  const lesson = data.DRONE_MISSION_LAB_GRADE8_LESSONS[1];
  assertIncludes(lesson.title, 'SolarScan');
  assertIncludes(lesson.concept, 'Pitch/Roll/Yaw');
  assert.equal(lesson.physicalFlightAllowed, false);
  assertIncludes(lesson.mission, 'Meeting2_SolarScan_JS');
  assertIncludes(lesson.mission, 'Meeting2_StrafingBox');
  assertIncludes(lesson.mission, 'Meeting2_YawBox');
  assertIncludes(lesson.visualDiagram.src, 'lesson2/solarscan-box-mission-strafing-vs-yaw.svg');
  assert.ok(lesson.vocabulary.some(([term]) => term.includes('Yaw')));
  assert.ok(lesson.safetyRules.some(rule => rule.includes('אין חיבור ל־TELLO WiFi')));
  assert.ok(lesson.appWorkflow.some(step => step.detail.includes('yawRight(90)')));
  assert.ok(lesson.assessment.some(item => item.includes('Strafing Box')));
  assert.ok(lesson.assessment.some(item => item.includes('Yaw Box')));
});

test('Drone Mission Lab lesson 3 implements the Mars cloud-save sensor scan mission', () => {
  const lesson = data.DRONE_MISSION_LAB_GRADE8_LESSONS[2];
  assertIncludes(lesson.title, 'Mars Sensor Scan');
  assertIncludes(lesson.concept, 'Mars Simulator');
  assert.equal(lesson.physicalFlightAllowed, false);
  assertIncludes(lesson.mission, 'Mars_Sensor_Scan_v1');
  assertIncludes(lesson.mission, 'Mars_Mission_Success');
  assertIncludes(lesson.mission, 'yawRight(180)');
  assertIncludes(lesson.visualDiagram.src, 'lesson3/mars-seismograph-sensor-scan.svg');
  assert.ok(lesson.vocabulary.some(([term]) => term.includes('Seismograph')));
  assert.ok(lesson.safetyRules.some(rule => rule.includes('Mars בלבד')));
  assert.ok(lesson.appWorkflow.some(step => step.detail.includes('Project Saved Successfully')));
  assert.ok(lesson.assessment.some(item => item.includes('Code Review') || item.includes('Share Link')));
});

test('Drone Mission Lab lesson 4 implements Methane LoopScan loops and variables', () => {
  const lesson = data.DRONE_MISSION_LAB_GRADE8_LESSONS[3];
  assertIncludes(lesson.title, 'Methane LoopScan');
  assertIncludes(lesson.concept, 'לולאת for');
  assert.equal(lesson.physicalFlightAllowed, false);
  assertIncludes(lesson.mission, 'Meeting4_GasScan_Loops_JS');
  assertIncludes(lesson.mission, 'Methane_LoopScan_Success');
  assertIncludes(lesson.mission, 'for (let i = 0; i < 4; i++)');
  assertIncludes(lesson.visualDiagram.src, 'lesson4/methane-loopscan-dynamic-square.svg');
  assert.ok(lesson.vocabulary.some(([term]) => term.includes('Infinite Loop')));
  assert.ok(lesson.safetyRules.some(rule => rule.includes('i++')));
  assert.ok(lesson.appWorkflow.some(step => step.detail.includes('distance = 60')));
  assert.ok(lesson.assessment.some(item => item.includes('let distance')));
  assert.ok(lesson.debugging.some(item => item.problem.includes('קפאה')));
});

test('Drone Mission Lab lesson 5 implements the first physical flight safety gate', () => {
  const lesson = data.DRONE_MISSION_LAB_GRADE8_LESSONS[4];
  assertIncludes(lesson.title, 'SpaceX Integrated Flight Test');
  assertIncludes(lesson.concept, 'מעבר מסימולטור למציאות');
  assert.equal(lesson.physicalFlightAllowed, true);
  assertIncludes(lesson.mission, 'Meeting4_GasScan_Loops_JS');
  assertIncludes(lesson.mission, 'TELLO-XXXXXX');
  assertIncludes(lesson.mission, 'Meeting5_Physical_Box_Calibrated');
  assertIncludes(lesson.visualDiagram.src, 'lesson5/spacex-physical-box-calibration-safe-zone.svg');
  assert.ok(lesson.vocabulary.some(([term]) => term.includes('WiFi Handshake')));
  assert.ok(lesson.safetyRules.some(rule => rule.includes('Safe Fly Zone')));
  assert.ok(lesson.safetyRules.some(rule => rule.includes('Abort')));
  assert.ok(lesson.appWorkflow.some(step => `${step.title} ${step.detail}`.includes('Pre‑Flight')));
  assert.ok(lesson.assessment.some(item => item.includes('Driver/Navigator/Safety Observer')));
  assert.ok(lesson.debugging.some(item => item.problem.includes('אדום מהיר')));
  assert.ok(lesson.commonDirections.some(([term]) => term.includes('Measure drift')));
});

test('Drone Mission Lab lesson 6 implements AeroRescue Grid Search with simulator and physical gates', () => {
  const lesson = data.DRONE_MISSION_LAB_GRADE8_LESSONS[5];
  assertIncludes(lesson.title, 'AeroRescue Grid Search');
  assertIncludes(lesson.concept, 'סריקת רשת');
  assert.equal(lesson.physicalFlightAllowed, true);
  assertIncludes(lesson.mission, 'Meeting6_GridSearch_JS');
  assertIncludes(lesson.mission, 'scanDist');
  assertIncludes(lesson.mission, 'stepDist');
  assertIncludes(lesson.mission, 'Meeting6_GridSearch_Success');
  assertIncludes(lesson.visualDiagram.src, 'lesson6/aerorescue-grid-search-scurve.svg');
  assert.ok(lesson.vocabulary.some(([term]) => term.includes('Blind Spots')));
  assert.ok(lesson.safetyRules.some(rule => rule.includes('הרצה בסימולטור')));
  assert.ok(lesson.appWorkflow.some(step => step.detail.includes('Target Log')));
  assert.ok(lesson.assessment.some(item => item.includes('Driver/Navigator/Safety Observer')));
  assert.ok(lesson.debugging.some(item => item.problem.includes('Connection Timeout')));
  assert.ok(lesson.commonDirections.some(([term]) => term.includes('stepDist')));
});

test('Drone Mission Lab lesson 7 implements InspeX autonomous photo inspection', () => {
  const lesson = data.DRONE_MISSION_LAB_GRADE8_LESSONS[6];
  assertIncludes(lesson.title, 'InspeX Autonomous Photo Inspection');
  assertIncludes(lesson.concept, 'מצלמת הרחפן');
  assert.equal(lesson.physicalFlightAllowed, true);
  assertIncludes(lesson.mission, 'Meeting7_Inspection_JS');
  assertIncludes(lesson.mission, 'tello.takePhoto()');
  assertIncludes(lesson.mission, 'Motion Blur');
  assertIncludes(lesson.mission, 'Meeting7_Inspection_Success');
  assertIncludes(lesson.visualDiagram.src, 'lesson7/inspex-autonomous-photo-inspection.svg');
  assert.ok(lesson.vocabulary.some(([term]) => term.includes('Motion Blur')));
  assert.ok(lesson.safetyRules.some(rule => rule.includes('Data Retrieval')));
  assert.ok(lesson.appWorkflow.some(step => step.detail.includes('Photo Evidence Log')));
  assert.ok(lesson.assessment.some(item => item.includes('tello.takePhoto')));
  assert.ok(lesson.debugging.some(item => item.problem.includes('מטושטשות')));
  assert.ok(lesson.commonDirections.some(([term]) => term.includes('tello.takePhoto')));
});

test('Drone Mission Lab lesson 8 implements Red Cross physical search and rescue with SOS photo evidence', () => {
  const lesson = data.DRONE_MISSION_LAB_GRADE8_LESSONS[7];
  assertIncludes(lesson.title, 'Red Cross Search & Rescue');
  assertIncludes(lesson.title, 'חיפוש והצלה');
  assertIncludes(lesson.concept, 'ניווט תלת־ממדי');
  assert.equal(lesson.workspaceMode, 'physical-drone');
  assert.equal(lesson.physicalFlightAllowed, true);
  assertIncludes(lesson.mission, 'Meeting8_SearchAndRescue_JS');
  assertIncludes(lesson.mission, 'targetDist');
  assertIncludes(lesson.mission, 'tello.flyUp');
  assertIncludes(lesson.mission, 'tello.flyRight');
  assertIncludes(lesson.mission, 'tello.yawRight');
  assertIncludes(lesson.mission, 'tello.takePhoto');
  assertIncludes(lesson.mission, 'Meeting8_RedCross_Success');
  assertIncludes(lesson.visualDiagram.src, 'lesson8/redcross-search-rescue-obstacle-photo-mission.svg');
  assert.ok(lesson.vocabulary.some(([term]) => term.includes('Data Download')));
  assert.ok(lesson.vocabulary.some(([term]) => term.includes('targetDist')));
  assert.ok(lesson.safetyRules.some(rule => rule.includes('50 ס״מ')));
  assert.ok(lesson.safetyRules.some(rule => rule.includes('קריאת המראה')));
  assert.ok(lesson.appWorkflow.some(step => step.detail.includes('Photo Evidence Log')));
  assert.ok(lesson.assessment.some(item => item.includes('Driver/Navigator/Safety Observer')));
  assert.ok(lesson.debugging.some(item => item.problem.includes('חצי־ריקה')));
  assert.ok(lesson.commonDirections.some(([term]) => term.includes('tello.yawRight')));
  assert.ok(lesson.screenshotSlides.some(shot => shot.src.includes('lesson8/redcross-search-rescue-obstacle-photo-mission.svg')));
});

test('Drone Mission Lab lesson 9 implements NASA JPL EcoFlight battery optimization', () => {
  const lesson = data.DRONE_MISSION_LAB_GRADE8_LESSONS[8];
  assertIncludes(lesson.title, 'NASA JPL EcoFlight');
  assertIncludes(lesson.title, 'אופטימיזציה');
  assertIncludes(lesson.concept, 'Telemetry');
  assertIncludes(lesson.concept, 'Code Optimization');
  assert.equal(lesson.workspaceMode, 'physical-drone');
  assert.equal(lesson.physicalFlightAllowed, true);
  assertIncludes(lesson.mission, 'Meeting8_SearchAndRescue_JS');
  assertIncludes(lesson.mission, 'Meeting9_EcoFlight_JS');
  assertIncludes(lesson.mission, 'Telemetry Bar');
  assertIncludes(lesson.mission, 'Original Consumption');
  assertIncludes(lesson.mission, 'Optimized Consumption');
  assertIncludes(lesson.mission, 'Savings %');
  assertIncludes(lesson.mission, 'Meeting9_EcoFlight_Optimized');
  assertIncludes(lesson.visualDiagram.src, 'lesson9/nasa-jpl-ecoflight-battery-optimization.svg');
  assert.ok(lesson.vocabulary.some(([term]) => term.includes('Telemetry Bar')));
  assert.ok(lesson.vocabulary.some(([term]) => term.includes('Savings %')));
  assert.ok(lesson.safetyRules.some(rule => rule.includes('ריצת אופטימיזציה')));
  assert.ok(lesson.safetyRules.some(rule => rule.includes('נוהל שתי קופסאות')));
  assert.ok(lesson.appWorkflow.some(step => step.detail.includes('Baseline Measurement')));
  assert.ok(lesson.appWorkflow.some(step => step.detail.includes('Savings %')));
  assert.ok(lesson.assessment.some(item => item.includes('Driver/Navigator/Safety Observer/Telemetry Officer')));
  assert.ok(lesson.debugging.some(item => item.problem.includes('Low Battery')));
  assert.ok(lesson.commonDirections.some(([term]) => term.includes('Telemetry Start')));
  assert.ok(lesson.screenshotSlides.some(shot => shot.src.includes('lesson9/nasa-jpl-ecoflight-battery-optimization.svg')));
});

test('Drone Mission Lab lesson 10 implements Pix4D project blueprint and City Simulator prototype', () => {
  const lesson = data.DRONE_MISSION_LAB_GRADE8_LESSONS[9];
  assertIncludes(lesson.title, 'Pix4D City Mapper Blueprint');
  assertIncludes(lesson.title, 'אפיון פרויקט הגמר');
  assertIncludes(lesson.concept, 'Software Architecture');
  assertIncludes(lesson.concept, 'Project Blueprint');
  assert.equal(lesson.workspaceMode, 'droneblocks-code');
  assert.equal(lesson.physicalFlightAllowed, false);
  assertIncludes(lesson.mission, 'טאבלטים הפוכים');
  assertIncludes(lesson.mission, 'Paper Blueprint');
  assertIncludes(lesson.mission, 'Meeting10_Project_Blueprint_JS');
  assertIncludes(lesson.mission, 'City Simulator');
  assertIncludes(lesson.mission, 'scanDist');
  assertIncludes(lesson.mission, 'safeAltitude');
  assertIncludes(lesson.mission, 'photoDelay');
  assertIncludes(lesson.mission, 'אין חיבור TELLO WiFi ואין הטסה פיזית');
  assertIncludes(lesson.visualDiagram.src, 'lesson10/pix4d-city-blueprint-prototype.svg');
  assert.ok(lesson.vocabulary.some(([term]) => term.includes('Software Architecture')));
  assert.ok(lesson.vocabulary.some(([term]) => term.includes('City Simulator')));
  assert.ok(lesson.safetyRules.some(rule => rule.includes('אין TELLO WiFi')));
  assert.ok(lesson.safetyRules.some(rule => rule.includes('טאבלטים הפוכים')));
  assert.ok(lesson.appWorkflow.some(step => step.detail.includes('Instructor Sign‑off')));
  assert.ok(lesson.assessment.some(item => item.includes('City Simulator בלבד')));
  assert.ok(lesson.debugging.some(item => item.problem.includes('City Simulator')));
  assert.ok(lesson.commonDirections.some(([term]) => term.includes('Meeting10_Project_Blueprint_JS')));
  assert.ok(lesson.screenshotSlides.some(shot => shot.src.includes('lesson10/pix4d-city-blueprint-prototype.svg')));
});

test('Drone Mission Lab lesson 11 implements physical sim-to-reality project calibration', () => {
  const lesson = data.DRONE_MISSION_LAB_GRADE8_LESSONS[10];
  assertIncludes(lesson.title, 'Launchpad Testing');
  assertIncludes(lesson.title, 'כיול אב־הטיפוס');
  assertIncludes(lesson.concept, 'בדיקות שטח פיזיות');
  assertIncludes(lesson.concept, 'Visual Debugging');
  assert.equal(lesson.workspaceMode, 'physical-drone');
  assert.equal(lesson.physicalFlightAllowed, true);
  assertIncludes(lesson.mission, 'Meeting10_Project_Blueprint_JS');
  assertIncludes(lesson.mission, 'Meeting11_Project_Calibration_JS');
  assertIncludes(lesson.mission, 'scanDist');
  assertIncludes(lesson.mission, 'safeAltitude');
  assertIncludes(lesson.mission, 'photoDelay');
  assertIncludes(lesson.mission, 'Meeting11_Project_Calibrated_Success');
  assertIncludes(lesson.visualDiagram.src, 'lesson11/spacex-jpl-sim-to-reality-calibration.svg');
  assert.ok(lesson.vocabulary.some(([term]) => term.includes('Simulation‑to‑Reality Gap')));
  assert.ok(lesson.vocabulary.some(([term]) => term.includes('Photo Offloading')));
  assert.ok(lesson.safetyRules.some(rule => rule.includes('צוות X ממריא לטיסת ניסוי')));
  assert.ok(lesson.safetyRules.some(rule => rule.includes('משנים משתנה אחד בלבד')));
  assert.ok(lesson.appWorkflow.some(step => step.detail.includes('הסרת מכסה עדשה')));
  assert.ok(lesson.appWorkflow.some(step => step.detail.includes('Photo Offloading')));
  assert.ok(lesson.assessment.some(item => item.includes('Driver/Navigator/Safety Observer')));
  assert.ok(lesson.debugging.some(item => item.problem.includes('שחורות')));
  assert.ok(lesson.debugging.some(item => item.fix.includes('tello.takePhoto();')));
  assert.ok(lesson.commonDirections.some(([term]) => term.includes('photoDelay 2→4')));
  assert.ok(lesson.screenshotSlides.some(shot => shot.src.includes('lesson11/spacex-jpl-sim-to-reality-calibration.svg')));
});

test('Drone Mission Lab follows the syllabus topics for grade 8', () => {
  const lessons = data.DRONE_MISSION_LAB_GRADE8_LESSONS;
  assertIncludes(lessons[5].title, 'סריקה וחיפוש');
  assertIncludes(lessons[5].concept, 'Grid Navigation');
  assertIncludes(lessons[6].title, 'מצלמת הרחפן');
  assertIncludes(lessons[6].mission, 'מצלם');
  assertIncludes(lessons[7].title, 'חיפוש והצלה');
  assertIncludes(lessons[8].title, 'אופטימיזציה');
  assertIncludes(lessons[8].concept, 'Telemetry');
  assertIncludes(lessons[9].title, 'Blueprint');
  assertIncludes(lessons[13].title, 'מצגת מסכמת');
  assertIncludes(lessons[14].title, 'אירוע שיא');
});

test('Drone Mission Lab pages are linked from homepage and use the hybrid model', () => {
  assertIncludes(homepageHtml, 'Drone Mission Lab');
  assertIncludes(homepageHtml, 'href="drone-mission-lab-grade8.html"');
  assertIncludes(homepageHtml, 'href="drone-mission-lab-grade8-play.html?lesson=1"');
  assertIncludes(courseHtml, 'Drone Mission Lab');
  assertIncludes(courseHtml, 'צילום ומשימות חקר');
  assertIncludes(courseHtml, 'js/drone-mission-lab-grade8-lessons.js');
  assertIncludes(courseHtml, 'drone-mission-lab-grade8-slides.html?lesson=1');
  assertIncludes(courseHtml, 'drone-mission-lab-grade8-guide.html?lesson=1');
  assertIncludes(playHtml, 'window.getDroneMissionLabGrade8Lesson');
  assertIncludes(playHtml, 'DroneBlocks Code בטאבלט');
  assertIncludes(playHtml, 'renderAppWorkflow');
  assertIncludes(slidesHtml, 'Drone Mission Lab');
  assertIncludes(guideHtml, 'מערך מדריך — Drone Mission Lab');
});

test('Drone Mission Lab grade 8 physical lessons stay separate from grade 7 and do not expose internal Blockly', () => {
  assertIncludes(playHtml, 'Drone Mission ח׳');
  assert.ok(!playHtml.includes('Drone Mission ז׳'));
  assertIncludes(playHtml, "'physical-drone'");
  assertIncludes(playHtml, "'physical-drone': '🚁 מעבדת רחפן פיזי'");
  assert.ok(data.DRONE_MISSION_LAB_GRADE8_LESSONS.slice(4, 9).every(lesson => lesson.workspaceMode === 'physical-drone'));
  assert.equal(data.DRONE_MISSION_LAB_GRADE8_LESSONS[9].workspaceMode, 'droneblocks-code');
  assert.equal(data.DRONE_MISSION_LAB_GRADE8_LESSONS[9].physicalFlightAllowed, false);
  assert.equal(data.DRONE_MISSION_LAB_GRADE8_LESSONS[10].workspaceMode, 'physical-drone');
  assert.equal(data.DRONE_MISSION_LAB_GRADE8_LESSONS[10].physicalFlightAllowed, true);
  assert.ok(data.DRONE_MISSION_LAB_GRADE8_LESSONS.slice(4, 11).every(lesson => lesson.visualDiagram?.src?.includes('assets/drone-mission-lab-grade8/lesson')));
});

test('Drone Mission Lab grade 8 guide exposes the lesson mission diagram', () => {
  assertIncludes(guideHtml, 'שרטוט משימה');
  assertIncludes(guideHtml, 'visualDiagram.src');
  assertIncludes(guideHtml, 'visual-card');
});

test('Drone Mission Lab lesson model is ready for future full lesson production', () => {
  for (const lesson of data.DRONE_MISSION_LAB_GRADE8_LESSONS) {
    assert.ok(lesson.lessonFlow.length >= 7, `lesson ${lesson.id} should have 90 minute flow`);
    assert.ok(lesson.exercises.length >= 7, `lesson ${lesson.id} should have scaffold exercises`);
    assert.ok(lesson.successCriteria.length >= 5, `lesson ${lesson.id} should have success criteria`);
    assert.ok(lesson.instructorGuide?.pedagogy?.length >= 3, `lesson ${lesson.id} should have instructor pedagogy notes`);
    assert.ok(lesson.appWorkflow?.length >= 4, `lesson ${lesson.id} should have external app workflow`);
  }
});
