import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const indexHtml = readFileSync(join(root, 'index.html'), 'utf8');
const lessonsData = readFileSync(join(root, 'js', 'lessons-data.js'), 'utf8');
const lessonSlidesHtml = readFileSync(join(root, 'slides', 'lesson.html'), 'utf8');
const feedbackWidgetJs = readFileSync(join(root, 'js', 'feedback-widget.js'), 'utf8');
const teachersHtml = readFileSync(join(root, 'teachers.html'), 'utf8');

const tests = [];
function test(name, fn) {
  tests.push({ name, fn });
}

function assertIncludes(source, needle, message = `Missing: ${needle}`) {
  assert.ok(source.includes(needle), message);
}

function assertMatches(source, regex, message = `Missing pattern: ${regex}`) {
  assert.match(source, regex, message);
}

function lessonObjectSource(id) {
  const marker = `id: ${id},`;
  const start = lessonsData.indexOf(marker);
  assert.notEqual(start, -1, `Lesson ${id} was not found in lessons-data.js`);
  const next = lessonsData.indexOf(`id: ${id + 1},`, start + marker.length);
  return lessonsData.slice(start, next === -1 ? undefined : next);
}

function cssRule(selector) {
  const start = indexHtml.indexOf(selector);
  assert.notEqual(start, -1, `CSS selector was not found: ${selector}`);
  const open = indexHtml.indexOf('{', start);
  const close = indexHtml.indexOf('}', open);
  assert.notEqual(open, -1, `CSS rule has no opening brace: ${selector}`);
  assert.notEqual(close, -1, `CSS rule has no closing brace: ${selector}`);
  return indexHtml.slice(open + 1, close);
}

test('lesson 7 has a visible goal at the end of the line', () => {
  assertIncludes(indexHtml, "ctx.fillText('🏁', line.end.x, line.end.y - 30)");
  assertIncludes(indexHtml, "ctx.arc(line.end.x, line.end.y, 20, 0, Math.PI * 2)");
  assertIncludes(indexHtml, "ctx.fillText('יעד', line.end.x, line.end.y + 2)");
  assertMatches(indexHtml, /const\s+reachedGoal\s*=\s*canSenseGoal\(\)/);
});

test('lesson 7 goal sensor is wired from Blockly toolbox to condition evaluation and UI chip', () => {
  assertIncludes(indexHtml, 'id="sensorGoal"');
  assertMatches(indexHtml, /sensors:\s*\[[^\]]*'sensor_goal'[^\]]*\]/);
  assertIncludes(indexHtml, "Blockly.Blocks['sensor_goal']");
  assertIncludes(indexHtml, "appendField('🏁 חיישן יעד =')");
  assertIncludes(indexHtml, "case 'sensor_goal':");
  assertIncludes(indexHtml, "return val === 'YES' ? canSenseGoal() : !canSenseGoal();");
  assertIncludes(indexHtml, "document.getElementById('goalText').textContent = currentLesson === 7");
  assertIncludes(indexHtml, "document.getElementById('sensorGoal').classList.toggle('active', currentLesson === 7 && sensesGoal);");
});

test('lesson 7 goal sensor uses a dedicated goal check rather than reusing the wall/touch sensor', () => {
  assertMatches(indexHtml, /function\s+canSenseGoal\s*\(\)\s*{[\s\S]*?currentLesson\s*!==\s*7[\s\S]*?getLesson7LinePoints\(\)\.end[\s\S]*?getLineSensorPoint\(\)[\s\S]*?<=\s*34;[\s\S]*?}/);
  const goalFunction = indexHtml.match(/function\s+canSenseGoal\s*\(\)\s*{([\s\S]*?)\n\s*}/)?.[1] || '';
  assert.doesNotMatch(goalFunction, /environment\.obstacle/, 'Goal sensor should not depend on the wall/obstacle environment');
});

test('lesson 7 lesson plan mentions the goal in focus, blocks, tasks, and success condition', () => {
  const lesson7 = lessonObjectSource(7);
  assertIncludes(lesson7, "sensorFocus: 'קו/ניגודיות + יעד'");
  assertIncludes(lesson7, "codingConcept: 'לולאה חוזרת וזיהוי יעד'");
  assertIncludes(lesson7, 'חיישן יעד = הגעתי ליעד');
  assertIncludes(lesson7, "environment: ['line', 'contrast', 'route', 'goal']");
  assertIncludes(lesson7, 'בדקו עם חיישן יעד אם סנסי הגיע לסוף המסלול');
});

test('sensor chips layout is responsive and cannot grow outside the robot panel', () => {
  assertMatches(indexHtml, /\.sensors-bar\s*{[\s\S]*?display:\s*grid;[\s\S]*?grid-template-columns:\s*repeat\(auto-fit, minmax\(112px, 1fr\)\);[\s\S]*?max-width:\s*100%;/);
  assertMatches(indexHtml, /\.sensor-chip\s*{[\s\S]*?min-width:\s*0;[\s\S]*?max-width:\s*100%;[\s\S]*?overflow:\s*hidden;/);
  assertMatches(indexHtml, /\.sensor-chip span:last-child\s*{[\s\S]*?text-overflow:\s*ellipsis;[\s\S]*?white-space:\s*nowrap;/);
  const activeSensorChipRule = cssRule('.sensor-chip.active');
  assertIncludes(activeSensorChipRule, 'transform: translateY(-1px);');
  assert.ok(!activeSensorChipRule.includes('transform: scale(1.05);'), 'Active sensor chips should not scale and overflow');
});

test('motion control is shown only in lessons that use movement or security motion', () => {
  const overridesBlock = indexHtml.match(/const\s+lessonControlOverrides\s*=\s*\{[\s\S]*?\n\s*\};/)?.[0] || '';
  for (const lesson of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 14]) {
    const lessonOverride = overridesBlock.match(new RegExp(`${lesson}:\\s*\\{[\\s\\S]*?\\n\\s*\\}`))?.[0] || '';
    assert.doesNotMatch(lessonOverride, /sensorMotion/, `Lesson ${lesson} should not show sensorMotion`);
    assert.doesNotMatch(lessonOverride, /envMotion/, `Lesson ${lesson} should not show envMotion`);
  }
});

test('line off is not exposed as a separate environment button', () => {
  assert.doesNotMatch(indexHtml, /id="envLineOff"/);
  assert.doesNotMatch(indexHtml, /toggleEnv\('lineOff'\)/);
});

test('lesson sensor and environment controls are focused per lesson instead of cumulative', () => {
  const overridesBlock = indexHtml.match(/const\s+lessonControlOverrides\s*=\s*\{[\s\S]*?\n\s*\};/)?.[0] || '';
  const getList = (lesson, key) => {
    const lessonOverride = overridesBlock.match(new RegExp(`${lesson}:\\s*\\{[\\s\\S]*?\\n\\s*\\}`))?.[0] || '';
    const listSource = lessonOverride.match(new RegExp(`${key}:\\s*\\[([^\\]]*)\\]`))?.[1] || '';
    return [...listSource.matchAll(/'([^']+)'/g)].map((match) => match[1]);
  };

  const expectedByLesson = {
    1: { sensors: ['sensorLight'], env: ['envLight'] },
    2: { sensors: ['sensorSound'], env: ['envSound'] },
    3: { sensors: ['sensorTouch'], env: ['envObstacle'] },
    4: { sensors: ['sensorSmell'], env: ['envSmoke'] },
    5: { sensors: ['sensorTemp'], env: ['envTemperatureHot'] },
    6: { sensors: ['sensorColor'], env: ['envRecycleColor'] },
    7: { sensors: ['sensorLine', 'sensorGoal'], env: [] },
    8: { sensors: ['sensorCars', 'sensorPedestrian'], env: ['envCars', 'envPedestrian'] },
    9: { sensors: ['sensorPeople', 'sensorLight'], env: ['envPeople', 'envLight'] },
    10: { sensors: ['sensorSoil', 'sensorTemp'], env: ['envSoilDry', 'envTemperatureHot'] },
    11: { sensors: ['sensorLight', 'sensorPeople', 'sensorArmed', 'sensorSafeTouch', 'sensorDoor'], env: ['envLight', 'envPeople', 'envRemoveVisitor', 'envArmedMode', 'envSafeTouch', 'envDoorOpen'] },
    12: { sensors: ['sensorTouch'], env: ['envObstacle'] },
    13: { sensors: ['sensorLight', 'sensorMotion', 'sensorSound'], env: ['envLight', 'envMotion', 'envSound'] },
    14: { sensors: ['sensorSmell', 'sensorTemp', 'sensorTouch'], env: ['envSmoke', 'envTemperatureHot', 'envObstacle'] }
  };

  for (const [lesson, expected] of Object.entries(expectedByLesson)) {
    assert.deepEqual(getList(lesson, 'sensors'), expected.sensors, `Lesson ${lesson} should show only its own sensor chips`);
    assert.deepEqual(getList(lesson, 'env'), expected.env, `Lesson ${lesson} should show only its own environment controls`);
  }
});

test('environment controls stay in one horizontal scroll row with side arrows and reset below', () => {
  const envScrollWrapRule = cssRule('.env-scroll-wrap');
  assertIncludes(indexHtml, '<div class="env-scroll-shell" aria-label="כפתורי סביבה עם חיצים לגלילה לרוחב">');
  assertIncludes(indexHtml, '<button class="env-scroll-arrow left" type="button" onclick="scrollEnvButtons(1)"');
  assertIncludes(indexHtml, '<button class="env-scroll-arrow right" type="button" onclick="scrollEnvButtons(-1)"');
  assertIncludes(indexHtml, 'function scrollEnvButtons(direction)');
  assertIncludes(indexHtml, 'function updateEnvScrollControls()');
  assertIncludes(indexHtml, "document.getElementById('envScrollWrap')");
  assertIncludes(indexHtml, "shell.classList.toggle('no-scroll', !needsScroll);");
  assertIncludes(indexHtml, "if (!scroller || shell?.classList.contains('no-scroll')) return;");
  assertIncludes(indexHtml, "scroller.scrollBy({ left: direction * -220, behavior: 'smooth' });");
  assertIncludes(indexHtml, '<div class="env-scroll-wrap" id="envScrollWrap" aria-label="גללו לרוחב כדי לראות עוד כפתורי סביבה">');
  assertIncludes(envScrollWrapRule, 'overflow-x: auto;');
  assertIncludes(envScrollWrapRule, 'overflow-y: hidden;');
  assertIncludes(envScrollWrapRule, 'scrollbar-width: none;');
  assertIncludes(envScrollWrapRule, 'direction: rtl;');
  assertIncludes(indexHtml, '.env-scroll-wrap::-webkit-scrollbar');
  assertIncludes(indexHtml, 'display: none;');

  const envButtonsRule = cssRule('.env-buttons');
  assertIncludes(envButtonsRule, 'display: flex;');
  assertIncludes(envButtonsRule, 'flex-wrap: nowrap;');
  assertIncludes(envButtonsRule, 'width: max-content;');
  assertIncludes(envButtonsRule, 'overflow: visible;');

  assertIncludes(cssRule('.env-scroll-arrow'), 'position: absolute;');
  assertIncludes(cssRule('.env-scroll-shell.no-scroll'), 'padding-inline: 0;');
  assertIncludes(cssRule('.env-scroll-shell.no-scroll .env-scroll-arrow'), 'display: none;');
  assertIncludes(cssRule('.env-reset-row'), 'margin-top: 0.75rem;');
  assert.ok(!cssRule('.env-btn.active').includes('scale'), 'Active environment buttons should not scale into the scrollbar area');
  assertIncludes(indexHtml, '<div class="env-reset-row">');
  assertIncludes(indexHtml, 'class="env-reset-btn" onclick="resetEnv()"');
  assert.ok(indexHtml.indexOf('<div class="env-reset-row">') > indexHtml.indexOf('<div class="env-scroll-shell"'));
});

test('lesson 9 people drawing only appears when students are enabled and is raised above the grass', () => {
  assertIncludes(indexHtml, 'const isPresenceCard = currentLesson === 9 && i === 0;');
  assertIncludes(indexHtml, 'if (!environment.people) return;');
  assertIncludes(indexHtml, "ctx.fillText('🧑‍🎓🧑‍🏫', xs[i], y - 46);");
  assertIncludes(indexHtml, "ctx.fillText('יש תלמידים', xs[i], y - 4);");
  assert.doesNotMatch(indexHtml, /isPresenceCard \? \(environment\.people \? '🧑‍🎓🧑‍🏫' : '🏫'\)/);
});

test('lesson 8 and 11 mission boards are compact and positioned at the top-right', () => {
  assertIncludes(indexHtml, 'const compactMission = currentLesson === 8 || currentLesson === 11;');
  assertIncludes(indexHtml, 'const boardX = currentLesson === 8 ? canvas.width - 238 : currentLesson === 11 ? canvas.width - 220 : canvas.width * 0.56;');
  assertIncludes(indexHtml, 'const boardY = currentLesson === 8 ? 48 : currentLesson === 11 ? 40 : canvas.height * 0.12;');
  assertIncludes(indexHtml, 'const boardW = currentLesson === 8 ? 210 : currentLesson === 11 ? 198 : canvas.width * 0.36;');
  assertIncludes(indexHtml, 'const boardH = currentLesson === 8 ? 78 : currentLesson === 11 ? 74 : 135;');
  assertIncludes(indexHtml, "ctx.fillText('🎯 משימה', boardX + boardW - 12, boardY + 17);");
});

test('lesson 8 traffic light stays compact', () => {
  assertIncludes(indexHtml, 'ctx.roundRect(lightX - 17, lightY - 34, 34, 66, 9);');
  assertIncludes(indexHtml, 'ctx.arc(lightX, lightY - 17, 9, 0, Math.PI * 2);');
  assertIncludes(indexHtml, 'ctx.arc(lightX, lightY + 15, 9, 0, Math.PI * 2);');
  assertIncludes(indexHtml, "ctx.fillText(robot.trafficLightGreen ? 'ירוק' : 'אדום', lightX, y + 48);");
});

test('lesson 8 removed instruction labels are not present', () => {
  assert.ok(!indexHtml.includes('לחצו על מכוניות'));
  assert.ok(!indexHtml.includes('לחצו על הולך רגל'));
});

test('lesson 8 cars and pedestrian only render when enabled, move horizontally, and stay visible when stopped', () => {
  assertIncludes(indexHtml, 'const activeLesson8Object = (i === 0 && environment.pedestrian) || (i === 2 && environment.cars);');
  assertIncludes(indexHtml, 'if (!activeLesson8Object) {');
  assertIncludes(indexHtml, 'const isStopped = (i === 2 && robot.trafficCarsStopped) || (i === 0 && robot.pedestrianStopped);');
  assertIncludes(indexHtml, 'const motion = isStopped ? 0 : Math.sin(t * 2.4) * 24;');
  assertIncludes(indexHtml, 'const objectX = xs[i] + motion;');
  assertIncludes(indexHtml, 'const objectY = y - 8;');
  assertIncludes(indexHtml, 'if (i === 0 && motion < 0) {');
  assertIncludes(indexHtml, 'ctx.scale(-1, 1);');
});

test('lesson 8 stop/start blocks for cars and pedestrian are available and update state correctly', () => {
  for (const blockType of ['stop_cars', 'start_cars', 'stop_pedestrian', 'start_pedestrian']) {
    assertMatches(indexHtml, new RegExp(`(movement|actions):\\s*\\[[^\\]]*'${blockType}'[^\\]]*\\]`));
    assertIncludes(indexHtml, `Blockly.Blocks['${blockType}']`);
    assertIncludes(indexHtml, `case '${blockType}':`);
  }
  assertMatches(indexHtml, /case 'stop_cars':[\s\S]*?robot\.trafficCarsStopped\s*=\s*true;[\s\S]*?break;/);
  assertMatches(indexHtml, /case 'start_cars':[\s\S]*?robot\.trafficCarsStopped\s*=\s*false;[\s\S]*?break;/);
  assertMatches(indexHtml, /case 'stop_pedestrian':[\s\S]*?robot\.pedestrianStopped\s*=\s*true;[\s\S]*?break;/);
  assertMatches(indexHtml, /case 'start_pedestrian':[\s\S]*?robot\.pedestrianStopped\s*=\s*false;[\s\S]*?break;/);
});

test('environment toggles and reset clear stopped traffic/pedestrian states', () => {
  assertMatches(indexHtml, /function\s+toggleEnv\s*\(type\)\s*{[\s\S]*?if \(type === 'cars'\) robot\.trafficCarsStopped = false;[\s\S]*?if \(type === 'pedestrian'\) robot\.pedestrianStopped = false;/);
  assertMatches(indexHtml, /function\s+resetEnv\s*\(\)\s*{[\s\S]*?robot\.trafficCarsStopped = false;[\s\S]*?robot\.pedestrianStopped = false;[\s\S]*?robot\.vehicleStopped = false;/);
});

test('lesson 8 educational data includes stop and continue traffic blocks', () => {
  const lesson8 = lessonObjectSource(8);
  assertIncludes(lesson8, 'עצור מכוניות');
  assertIncludes(lesson8, 'המשך מכוניות');
  assertIncludes(lesson8, 'עצור הולך רגל');
  assertIncludes(lesson8, 'המשך הולך רגל');
});

test('lesson 11 has student-built arming rules with visitors, safe touch, door and alarm wired', () => {
  const lesson11 = lessonObjectSource(11);
  assertIncludes(lesson11, 'משמרת לילה במוזיאון החכם');
  assertIncludes(lesson11, 'כללי דריכה + תנועה + דלת');
  assertIncludes(lesson11, 'תנאים מקוננים');
  assertIncludes(lesson11, 'פתיחת סיפור — האור האחרון במוזיאון');
  assertIncludes(lessonsData, 'תרגיל 1 — מי דורך את השמירה?');
  assertIncludes(lessonsData, 'בתוך ה”אם”: 🔐 שמירה — דרוך');
  assertIncludes(lessonsData, 'בלי אף בלוק “שמירה — דרוך”');
  assertIncludes(lessonsData, 'התוכנית עונה לשאלה: מי דורך את השמירה');
  assertIncludes(indexHtml, "sensors: ['sensor_armed', 'sensor_light', 'sensor_people', 'sensor_safe_touch', 'sensor_door']");
  assertIncludes(indexHtml, "currentLesson === 11 ? ' דריכה ידנית' : ' מערכת דרוכה'");
  assertIncludes(indexHtml, 'Lesson 11 does not auto-arm from sensors');
  assertIncludes(indexHtml, "Blockly.Blocks['action_security_mode']");
  assertIncludes(indexHtml, 'function handlePeopleEnv()');
  assertIncludes(indexHtml, 'function removeMuseumVisitor()');
  assertIncludes(indexHtml, 'הוסף מבקר');
  assertIncludes(indexHtml, 'הורד מבקר');
  assertIncludes(indexHtml, 'each click on “הוסף מבקר” adds a visible person in the hall');
  assertIncludes(indexHtml, 'Visitors enter from different sides; new visitors push the group toward the vault');
  assertIncludes(indexHtml, 'Faces are intentionally clean at this small size');
  assertIncludes(indexHtml, 'Museum floor has no hard horizontal edge at all');
  assertIncludes(indexHtml, 'Dark gray museum floor');
  assertIncludes(indexHtml, 'No green stripe and no straight floor boundary');
  assertIncludes(indexHtml, '.robot-stage.museum-stage .ground');
  assertIncludes(indexHtml, 'display: none;');
  assertIncludes(indexHtml, 'Lesson 11 has no separate ground strip');
  assertIncludes(indexHtml, "classList.toggle('museum-stage', num === 11)");
  assertIncludes(indexHtml, 'const visitors = [');
  assertIncludes(indexHtml, 'Visitors face different directions');
  assertIncludes(indexHtml, 'facing: -1');
  assertIncludes(indexHtml, 'facing: 1');
  assertIncludes(indexHtml, 'automatic arming triggers should not turn on the manual-arm button');
  assertIncludes(indexHtml, "lesson11ArmedBtn.classList.toggle('active', Boolean(environment.armedMode))");
  assertIncludes(indexHtml, 'הרבה מבקרים');
  assertIncludes(indexHtml, 'אין מבקרים');
  assertIncludes(indexHtml, 'קצת מבקרים');
  assertIncludes(indexHtml, 'museumVisitorCount > 5');
  assertIncludes(indexHtml, "currentLesson === 11 ? '🚪 דלת צדדית פתוחה?' : '🚪 דלת פתוחה?'");
  assertIncludes(indexHtml, "currentLesson === 11 ? '🚨 אזעקת מוזיאון' : '🚨 אזעקה'");
  assertIncludes(lessonSlidesHtml, 'אם 🔐 מערכת שמירה דרוכה');
  assertIncludes(lessonSlidesHtml, 'אם ✋ נגיעה בכספת');
  assert.doesNotMatch(lessonSlidesHtml, /אם 👤 תנועה ליד הכספת/);
  assertIncludes(lessonSlidesHtml, '🔐 שמירה — דרוך');
  assertIncludes(lessonSlidesHtml, '20260719-lesson11-safe-touch-v7');
  assertIncludes(lessonSlidesHtml, 'אם 🚪 דלת צדדית פתוחה');
  for (const id of ['sensorLight', 'sensorPeople', 'sensorArmed', 'sensorMotion', 'sensorSafeTouch', 'sensorDoor']) {
    assertIncludes(indexHtml, `id="${id}"`);
  }
  for (const envId of ['envLight', 'envPeople', 'envRemoveVisitor', 'envArmedMode', 'envSafeTouch', 'envDoorOpen']) {
    assertIncludes(indexHtml, `id="${envId}"`);
  }
  for (const blockType of ['sensor_armed', 'sensor_light', 'sensor_people', 'sensor_safe_touch', 'sensor_door', 'action_security_mode', 'action_alarm']) {
    assertMatches(indexHtml, new RegExp(`(sensors|actions):\\s*\\[[^\\]]*'${blockType}'[^\\]]*\\]`));
    assertIncludes(indexHtml, `Blockly.Blocks['${blockType}']`);
  }
  assertIncludes(indexHtml, "case 'sensor_armed':");
  assertIncludes(indexHtml, "case 'sensor_people':");
  assertIncludes(indexHtml, "case 'sensor_safe_touch':");
  assertIncludes(indexHtml, "case 'action_security_mode':");
  assertIncludes(indexHtml, "case 'sensor_door':");
  assertIncludes(indexHtml, "case 'action_alarm':");
  assertIncludes(indexHtml, "armedMode: false");
  assertIncludes(indexHtml, "doorOpen: false");
});

test('lesson 11 no longer exposes motion-near-safe as a lesson block', () => {
  const lesson11 = lessonObjectSource(11);
  assert.doesNotMatch(lesson11, /אם תנועה ליד הכספת/);
  assert.doesNotMatch(lessonSlidesHtml, /תנועה ליד הכספת/);
  assertIncludes(lesson11, 'אם נגיעה בכספת');
});

test('lesson 11 has a dedicated illustrated museum scene', () => {
  assertIncludes(indexHtml, 'function drawLesson11MuseumScene(lesson)');
  assertIncludes(indexHtml, 'drawLesson11MuseumScene(lesson);');
  assertIncludes(indexHtml, 'אולם הכספת — מוזיאון העיר');
  assertIncludes(indexHtml, 'Clear luxury museum scene');
  assertIncludes(indexHtml, 'Large outer gold frame reaches almost to the bottom');
  assertIncludes(indexHtml, 'const frameH = h - frameY - 8;');
  assertIncludes(indexHtml, 'Soft museum lighting');
  assertIncludes(indexHtml, 'museumLightsOn');
  assertIncludes(indexHtml, 'Big smoked glass window');
  assertIncludes(indexHtml, 'Soft floor contact shadow only');
  assertIncludes(indexHtml, 'No background box behind the vault');
  assertIncludes(indexHtml, 'Box-like vault: clear rectangular gold frame');
  assertIncludes(indexHtml, 'no extra box or plinth');
  assertIncludes(indexHtml, 'const safeY = h * 0.30;');
  assertIncludes(indexHtml, 'Luxurious realistic trophy inside the safe');
  assertIncludes(indexHtml, 'trophyGlow');
  assertIncludes(indexHtml, 'trophyGold');
  assertIncludes(indexHtml, 'trophyScale = 0.58');
  assertIncludes(indexHtml, 'const safeX = w * 0.73;');
  assertIncludes(indexHtml, 'const armed = isSystemArmed();');
  assertIncludes(indexHtml, 'Security laser line');
  assertIncludes(indexHtml, 'Side door sits at the far right corner of the gold frame');
  assertIncludes(indexHtml, 'Start Sensi beside the vault');
  assertIncludes(indexHtml, 'robot.y = canvas.height * 0.48;');
  assertIncludes(indexHtml, 'Alarm above the side door');
  assertIncludes(indexHtml, 'far right corner of the gold frame');
  assertIncludes(indexHtml, 'no black box when inactive');
  assertIncludes(indexHtml, 'No extra label under the safe');
  assertIncludes(indexHtml, 'Historical street-view exhibits in gold frames');
  assertIncludes(indexHtml, 'Realistic tiny city landscapes');
  assertIncludes(indexHtml, 'bridge/river view');
  assertIncludes(indexHtml, 'drawMapExhibit');
  assertMatches(indexHtml, /if \(currentLesson === 11\) \{\s*\n\s*drawLesson11MuseumScene\(lesson\);\s*\n\s*return;\s*\n\s*\}/);
});

test('lesson 10 is upgraded into an engaging smart-garden challenge', () => {
  const lesson10 = lessonObjectSource(10);
  for (const text of [
    'הצלת הגינה מצמא',
    'לחות אדמה + חום + חיסכון במים',
    'אם אדמה יבשה וצמאה',
    'אם יום חם בגינה',
    'אם מצב המים = יבש',
    'אם מצב המים = תקין',
    'אם מצב המים = עודף מים',
    'פתח טפטפות',
    'סגור טפטפות לחיסכון'
  ]) {
    assertIncludes(lesson10, text);
  }
  assertIncludes(indexHtml, 'function drawLesson10GardenScene(lesson)');
  assertIncludes(indexHtml, "const labelText = 'בודק חיישנים';");
  assertIncludes(indexHtml, 'Clarify Sensi\'s garden role directly on the robot, without an extra frame.');
  assert.doesNotMatch(indexHtml, /ctx\.ellipse\(0, 27, 45, 14/);
  assertIncludes(indexHtml, "ctx.fillStyle = '#052e16';");
  assertIncludes(indexHtml, 'ctx.strokeText(labelText, 0, 39);');
  assertIncludes(indexHtml, 'ctx.fillText(labelText, 0, 39);');
  assert.doesNotMatch(indexHtml, /id="sensorWaterStatus"/);
  assertIncludes(indexHtml, "Blockly.Blocks['sensor_water_status']");
  assertIncludes(indexHtml, 'case \'sensor_water_status\':');
  assertIncludes(indexHtml, 'function getGardenWaterStatus()');
  assertIncludes(indexHtml, 'Integrated garden sign — part of the illustration, not a floating UI card.');
  assertIncludes(indexHtml, 'Compact garden water-status gauge: dry / OK / too much water.');
  assert.doesNotMatch(indexHtml, /יבש — צריך להשקות|עודף מים — לסגור/);
  assertMatches(indexHtml, /case 'action_water':[\s\S]*?currentLesson === 10 && wasWatering && !nextWaterOn[\s\S]*?environment\.soilDry = false;[\s\S]*?envSoilDry[\s\S]*?classList\.remove\('active'\)/);
  assertMatches(indexHtml, /function toggleEnv\(type\)[\s\S]*?type === 'soilDry'[\s\S]*?gardenRecoveryStartedAt = environment\.soilDry \? null : gardenRecoveryStartedAt/);
  assertIncludes(indexHtml, 'Pleasant days recover in five seconds; hot days start more wilted and recover in ten seconds.');
  assertIncludes(indexHtml, 'const recoveryDurationMs = hot ? 10000 : 5000;');
  assertIncludes(indexHtml, 'const dryStartProgress = hot ? 0 : 0.28;');
  assertIncludes(indexHtml, 'One flower morphs from wilted to blooming — no separate second flower.');
  assert.doesNotMatch(indexHtml, /fillText\(healthy \? '🌸' : '🥀'/);
  assert.doesNotMatch(indexHtml, /fillText\('🌸'/);
  assertIncludes(indexHtml, 'הגנן החכם');
  assertIncludes(indexHtml, "if (currentLesson === 10) {");
  assertMatches(indexHtml, /10:\s*\{[\s\S]*?sensors:\s*\[[^\]]*'sensor_soil'[^\]]*'sensor_temperature'[^\]]*'sensor_water_status'[^\]]*\]/);
  assertMatches(indexHtml, /10:\s*\{[\s\S]*?sensors:\s*\[[^\]]*'sensorSoil'[^\]]*'sensorTemp'[^\]]*\]/);
  assertIncludes(indexHtml, "currentLesson === 10 ? '☀️ יום חם בגינה ='");
  assertIncludes(indexHtml, "currentLesson === 10 ? '🌱 חיישן אדמה ='");
  assertIncludes(indexHtml, "currentLesson === 10 ? '💧 טפטפות'");
  assertIncludes(lessonsData, 'חום משנה את זמן ההשקיה');
  assertIncludes(lessonsData, 'אדמה קובעת אם משקים; חום קובע כמה זמן');
  assertIncludes(lessonsData, 'פתיחת סיפור — הגינה מבקשת עזרה');
  assertIncludes(lessonsData, 'כלל ההחלטה — מי קובע מה?');
  assertIncludes(lessonsData, 'האדמה קובעת אם בכלל משקים. החום קובע כמה זמן משקים');
  assertIncludes(lessonsData, 'אדמה קובעת אם משקים → חום קובע כמה זמן → טפטפות נסגרות לחיסכון');
  assertIncludes(lessonSlidesHtml, '5 שניות ביום נעים או 10 שניות ביום חם');
  assertIncludes(lessonSlidesHtml, 'אדמה קובעת אם משקים · חום קובע כמה זמן · טפטפות נסגרות לחיסכון');
  assert.doesNotMatch(lessonSlidesHtml, /משקה קצר|חכה 2 שניות|דורש בדיקה זהירה יותר/);
  assertIncludes(lessonSlidesHtml, 'אם כבר צריך להשקות, האם משקים 5 שניות ביום נעים או 10 שניות ביום חם?');
  assert.doesNotMatch(lesson10, /חום, קורא את מד מצב המים, ואז פותח|משקה קצר|חכה 2 שניות/);
  assert.doesNotMatch(lessonsData, /אם יום חם בגינה → אמור “בודק גינה”/);
  assertIncludes(lessonsData, 'אם 🌱 חיישן אדמה = יבשה וצמאה');
  assertIncludes(lessonsData, '💧 טפטפות — פתח להשקיה');
  assertIncludes(lessonsData, 'אם ☀️ יום חם בגינה = יום חם');
  assertIncludes(lessonSlidesHtml, 'function expandAnswerBlocks(answerBlocks)');
  assertIncludes(lessonSlidesHtml, "const parts = text.split('→')");
  assertIncludes(lessonSlidesHtml, "parts.flatMap(part => part.split('+'))");
  assertIncludes(indexHtml, 'function workspaceStorageKey(lessonNum = currentLesson)');
  assertIncludes(indexHtml, 'localStorage.setItem(workspaceStorageKey(lessonNum), xmlText);');
  assertIncludes(indexHtml, "window.addEventListener('beforeunload', () => saveWorkspaceForLesson(currentLesson));");
  assertIncludes(indexHtml, "window.addEventListener('pagehide', () => saveWorkspaceForLesson(currentLesson));");
  assertIncludes(indexHtml, 'restoreWorkspaceForLesson(currentLesson);');
  assertIncludes(indexHtml, 'function resetBlocks()');
  assertIncludes(indexHtml, "localStorage.removeItem(workspaceStorageKey(currentLesson));");
  assertIncludes(indexHtml, 'איפוס בלוקים');
  assertMatches(indexHtml, /function selectLesson\(num\)[\s\S]*?saveWorkspaceForLesson\(previousLesson\)[\s\S]*?restoreWorkspaceForLesson\(num\)/);
});

test('app initializes before full window load so welcome buttons respond quickly', () => {
  assertIncludes(indexHtml, 'function initializeApp()');
  assertIncludes(indexHtml, 'DOMContentLoaded');
  assertIncludes(indexHtml, 'Blockly can be slow/blocked');
  assertIncludes(indexHtml, "window.addEventListener('load', initializeApp");
});


test('lesson 11 final summary slide answers its question', () => {
  assertIncludes(lessonSlidesHtml, 'Number(lesson.id) === 11');
  assertIncludes(lessonSlidesHtml, 'למה לא מפעילים אזעקה על כל תנועה?');
  assertIncludes(lessonSlidesHtml, 'משפט סיכום:</strong> חיישן → תנאי → פעולה.');
  assertIncludes(lessonSlidesHtml, '20260719-lesson11-safe-touch-v7');
  assertIncludes(lessonsData, 'כותב סיכום: חיישן → תנאי → פעולה');
});

test('feedback button stays low in lessons but avoids lower navigation in presentations', () => {
  assertMatches(feedbackWidgetJs, /\.rfw-button\{[^}]*bottom:16px/);
  assertIncludes(feedbackWidgetJs, '.rfw-slide-page .rfw-button{bottom:92px}');
  assertIncludes(feedbackWidgetJs, '.rfw-slide-page .rfw-button{bottom:86px}');
  assertIncludes(feedbackWidgetJs, "document.body.classList.add('rfw-slide-page');");
  assertIncludes(lessonSlidesHtml, 'body class="presentation-page"');
  assertIncludes(lessonSlidesHtml, 'body.presentation-page .rfw-button { bottom: 92px !important; }');
  assert.doesNotMatch(teachersHtml, /teacher-guide-page|body\.teacher-guide-page/);
});

test('lesson 14 exposes all rescue-story blocks used by the lesson exercises', () => {
  const lesson14 = lessonObjectSource(14);
  for (const blockLabel of [
    'אם חום מסוכן',
    'אם עשן בזירה',
    'אם חסם במסלול',
    'אמור הודעת חילוץ',
    'הפעל אזעקה',
    'הפעל רחפן חילוץ',
    'בחר נתיב בטוח',
    'עקוף לפי נתיב בטוח',
    'התקדם בזהירות'
  ]) {
    assertIncludes(lesson14, blockLabel);
  }
  for (const blockType of ['move_forward', 'route_turn', 'sensor_temperature', 'sensor_smell', 'sensor_obstacle', 'action_say', 'action_alarm', 'action_fan', 'action_safe_route']) {
    assertMatches(indexHtml, new RegExp(`(movement|sensors|actions):\\s*\\[[^\\]]*'${blockType}'[^\\]]*\\]`));
    assertIncludes(indexHtml, `Blockly.Blocks['${blockType}']`);
  }
  assertIncludes(indexHtml, "currentLesson === 14 ? '⬆️ התקדם בזהירות' : '⬆️ זוז קדימה'");
  assertIncludes(indexHtml, "currentLesson === 14 ? '🧭 עקוף לפי נתיב בטוח' : '🧭 סובב לפי המסלול'");
  assertIncludes(indexHtml, "currentLesson === 14 ? 'יוצא לחילוץ' : currentLesson === 11 ? 'בודק את האולם' : 'שלום!'");
});

let passed = 0;
for (const { name, fn } of tests) {
  try {
    fn();
    passed += 1;
    console.log(`✓ ${name}`);
  } catch (error) {
    console.error(`✗ ${name}`);
    console.error(error.stack || error.message);
    process.exitCode = 1;
    break;
  }
}

if (!process.exitCode) {
  console.log(`\n${passed}/${tests.length} regression tests passed.`);
}
