import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const indexHtml = readFileSync(join(root, 'index.html'), 'utf8');
const lessonsData = readFileSync(join(root, 'js', 'lessons-data.js'), 'utf8');

const tests = [];
function test(name, fn) {
  tests.push({ name, fn });
}

function assertIncludes(source, needle, message = `Missing: ${needle}`) {
  assert.ok(source.includes(needle), message);
}

function assertNotIncludes(source, needle, message = `Unexpected: ${needle}`) {
  assert.ok(!source.includes(needle), message);
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

test('lesson 7 robot starts with its line sensor on the beginning of the line', () => {
  assertMatches(indexHtml, /if \(currentLesson === 7\) \{[\s\S]*?const line = getLesson7LinePoints\(\);[\s\S]*?robot\.x = line\.start\.x - 28;[\s\S]*?robot\.y = line\.start\.y;[\s\S]*?\} else \{/);
  assertIncludes(indexHtml, 'x: robot.x + Math.cos(angle) * 28,');
});

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

test('motion control is hidden before lesson 11', () => {
  const overridesBlock = indexHtml.match(/const\s+lessonControlOverrides\s*=\s*\{[\s\S]*?\n\s*\};/)?.[0] || '';
  for (const lesson of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]) {
    const lessonOverride = overridesBlock.match(new RegExp(`${lesson}:\\s*\\{[\\s\\S]*?\\n\\s*\\}`))?.[0] || '';
    assert.doesNotMatch(lessonOverride, /sensorMotion/, `Lesson ${lesson} should not show sensorMotion`);
    assert.doesNotMatch(lessonOverride, /envMotion/, `Lesson ${lesson} should not show envMotion`);
  }
});

test('line off is not exposed as a separate environment button', () => {
  assert.doesNotMatch(indexHtml, /id="envLineOff"/);
  assert.doesNotMatch(indexHtml, /toggleEnv\('lineOff'\)/);
});

test('lesson sensor and environment controls are specific to each lesson, not cumulative', () => {
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
    9: { sensors: ['sensorPeople', 'sensorSound'], env: ['envPeople', 'envSound'] },
    10: { sensors: ['sensorSoil'], env: ['envSoilDry'] },
    11: { sensors: ['sensorArmed', 'sensorMotion', 'sensorDoor'], env: ['envArmedMode', 'envMotion', 'envDoorOpen'] },
    12: { sensors: ['sensorTouch', 'sensorGoal'], env: ['envObstacle'] },
    13: { sensors: ['sensorLight', 'sensorMotion', 'sensorSound'], env: ['envLight', 'envMotion', 'envSound'] },
    14: { sensors: ['sensorSmell', 'sensorTemp', 'sensorTouch'], env: ['envSmoke', 'envTemperatureHot', 'envObstacle'] }
  };

  for (const [lesson, expected] of Object.entries(expectedByLesson)) {
    assert.deepEqual(getList(lesson, 'sensors'), expected.sensors, `Lesson ${lesson} should show only its related sensor chips`);
    assert.deepEqual(getList(lesson, 'env'), expected.env, `Lesson ${lesson} should show only its related environment controls`);
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

test('robot canvas dragging works with scaled canvas coordinates and pointer events', () => {
  assertIncludes(cssRule('.robot-stage canvas'), 'touch-action: none;');
  assertIncludes(indexHtml, 'const scaleX = rect.width ? canvas.width / rect.width : 1;');
  assertIncludes(indexHtml, 'const scaleY = rect.height ? canvas.height / rect.height : 1;');
  assertIncludes(indexHtml, 'function hitTestRobot(pos)');
  assertIncludes(indexHtml, 'hitTest(pos, robot, 56)');
  assertIncludes(indexHtml, 'canvas.addEventListener(\'pointerdown\', onDragStart);');
  assertIncludes(indexHtml, 'canvas.setPointerCapture?.(e.pointerId);');
});

test('Blockly workspace has working click buttons for vertical and horizontal scrolling', () => {
  assertIncludes(indexHtml, '<div class="blockly-workspace-shell">');
  assertIncludes(indexHtml, 'class="blockly-scroll-buttons vertical"');
  assertIncludes(indexHtml, 'class="blockly-scroll-buttons horizontal"');
  assertIncludes(indexHtml, 'onclick="scrollBlocklyCanvas(0, -240)"');
  assertIncludes(indexHtml, 'onclick="scrollBlocklyCanvas(0, 240)"');
  assertIncludes(indexHtml, 'onclick="scrollBlocklyCanvas(240, 0)" aria-label="גלול ימינה">▶</button>');
  assertIncludes(indexHtml, 'onclick="scrollBlocklyCanvas(-240, 0)" aria-label="גלול שמאלה">◀</button>');
  assertIncludes(indexHtml, 'function scrollBlocklyCanvas(deltaX, deltaY)');
  assertIncludes(indexHtml, 'workspace.scroll(-(nextX + scrollLeft), -(nextY + scrollTop));');
});

test('lesson 9 has only classroom-related action blocks including the dedicated air conditioner block', () => {
  assertIncludes(indexHtml, "actions: ['action_class_power', 'action_ac', 'action_say']");
  assertIncludes(indexHtml, "Blockly.Blocks['action_ac']");
  assertIncludes(indexHtml, ".appendField('❄️ מזגן')");
  assertIncludes(indexHtml, "case 'action_ac':");
  assertIncludes(indexHtml, "robot.speaking = robot.fanOn ? 'הפעלתי מזגן' : 'כיביתי מזגן';");
});

test('lesson 9 story uses only presence and noise sensors without classroom light sensor', () => {
  const lesson9 = lessonObjectSource(9);
  assertIncludes(lesson9, "sensorFocus: 'נוכחות + רעש'");
  assertIncludes(lesson9, 'אם הכיתה רועשת מדי');
  assertIncludes(lesson9, 'כל עוד עדיין רועש, האור נשאר כבוי');
  assertIncludes(lesson9, "environment: ['presence', 'sound']");
  assertIncludes(lessonsData, 'תרגיל 5 — אתגר שקט בכיתה');
  assertIncludes(lessonsData, 'אם עוצמת רעש = חזק מדי');
  assertIncludes(lessonsData, 'אם עוצמת רעש = שקט');
  assertIncludes(lessonsData, 'מדליקים את האור מיד אחרי הכיבוי בלי לבדוק שנהיה שקט');
  assertNotIncludes(lesson9, 'אור מהחלון');
  assertNotIncludes(lesson9, 'חלון');
  assertNotIncludes(lesson9, 'אם יש אנשים וגם חשוך');
});

test('lesson 9 uses a cute classroom background image with empty chairs and overlays people, lamp, and AC by sensor state', () => {
  assertIncludes(indexHtml, "lesson9ClassroomBg.src = 'assets/lesson9-classroom-background.png?v=20260716-students-on-chairs-2';");
  assertIncludes(indexHtml, 'if (currentLesson === 9) {');
  assertIncludes(indexHtml, '// Cute classroom background image: empty chairs by default, no grass/sky/CSS classroom drawing.');
  assertIncludes(indexHtml, '.ground.classroom-ground');
  assertIncludes(indexHtml, 'ground?.classList.toggle(\'classroom-ground\', num === 9);');
  assertIncludes(indexHtml, "canvas.height = container.clientHeight - (currentLesson === 9 ? 0 : 60); // Account for ground except classroom");
  assertIncludes(indexHtml, '// Use source-cropping instead of stretching, so the classroom stays sharp and not smeared.');
  assertIncludes(indexHtml, 'ctx.drawImage(lesson9ClassroomBg, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);');
  assertIncludes(indexHtml, '// Keep the original classroom image, but cover only the built-in ceiling lamp with a ceiling-shaped patch.');
  assertIncludes(indexHtml, 'const builtInLampMask = ctx.createLinearGradient');
  assertIncludes(indexHtml, '// Hanging ceiling lamp appears when the light is on.');
  assertIncludes(indexHtml, 'const lightIsOn = robot.streetLightOn || environment.light;');
  assertIncludes(indexHtml, 'ctx.lineTo(lampX, cordBottomY);');
  assertIncludes(indexHtml, 'ctx.roundRect(lampX - 28, ceilingY - 4, 56, 14, 7);');
  assertIncludes(indexHtml, 'ctx.arc(lampX, shadeY + 30, 16, 0, Math.PI * 2);');
  assertIncludes(indexHtml, '// Air-conditioner status overlay.');
  assertIncludes(indexHtml, 'const acIsOn = robot.fanOn;');
  assertIncludes(indexHtml, "ctx.fillText('מזגן פועל', acX, acY + 142);");
  assertIncludes(indexHtml, '// People appear only when the students sensor is active: teacher + students sitting on chairs.');
  assertIncludes(indexHtml, 'if (environment.people) {');
  assertIncludes(indexHtml, "ctx.fillText('👩‍🏫', canvas.width * 0.22, canvas.height * 0.43);");
  assertIncludes(indexHtml, 'const students = [');
  assertIncludes(indexHtml, '// Lesson 9 keeps the left draggable speaker as the only visible noise speaker.');
});

test('lesson 9 classroom owns the scene and skips generic status cards', () => {
  assertIncludes(indexHtml, "if (currentLesson === 9) {\n                    return;\n                }");
  assert.doesNotMatch(indexHtml, /isPresenceCard \? \(environment\.people \? '🧑‍🎓🧑‍🏫' : '🏫'\)/);
});

test('lesson 9 classroom noise is sensed as loud without touching the robot and only left speaker is shown', () => {
  assertIncludes(indexHtml, '// Lesson 9 classroom noise is ambient: pressing the noise sensor means the classroom is loud,');
  assertIncludes(indexHtml, "if (currentLesson === 9) return 'LOUD';");
  assertIncludes(indexHtml, "if (!environment.sound) return 'QUIET';");
  assertIncludes(indexHtml, '// Draggable Sound source');
  assertIncludes(indexHtml, 'if (environment.sound) {');
  assertIncludes(indexHtml, '// Lesson 9 keeps the left draggable speaker as the only visible noise speaker.');
  assertNotIncludes(indexHtml, "ctx.fillText('רעש בכיתה', canvas.width * 0.88, canvas.height * 0.57);");
});

test('lesson 7 mission board is compact at the top-left, while lessons 8, 9 and 11 stay compact', () => {
  assertIncludes(indexHtml, 'const compactMission = currentLesson === 7 || currentLesson === 8 || currentLesson === 9 || currentLesson === 11;');
  assertIncludes(indexHtml, 'const boardX = currentLesson === 7 ? 20 : currentLesson === 8 ? canvas.width - 218 : currentLesson === 9 ? canvas.width - 224 : currentLesson === 11 ? canvas.width - 220 : canvas.width * 0.56;');
  assertIncludes(indexHtml, 'const boardY = currentLesson === 7 ? 40 : currentLesson === 8 ? 8 : currentLesson === 9 ? 42 : currentLesson === 11 ? 40 : canvas.height * 0.12;');
  assertIncludes(indexHtml, 'const boardW = currentLesson === 7 ? 190 : currentLesson === 8 ? 210 : currentLesson === 9 ? 196 : currentLesson === 11 ? 198 : canvas.width * 0.36;');
  assertIncludes(indexHtml, 'const boardH = currentLesson === 7 ? 70 : currentLesson === 8 ? 78 : currentLesson === 9 ? 70 : currentLesson === 11 ? 74 : 135;');
  assertIncludes(indexHtml, '? { titleSize: 11, bodySize: 9, titleY: 15, line1Y: 31, line2Y: 45, line3Y: 59 }');
  assertIncludes(indexHtml, 'currentLesson === 9');
  assertIncludes(indexHtml, '? { titleSize: 11, bodySize: 9, titleY: 15, line1Y: 31, line2Y: 45, line3Y: 59 }');
  assertIncludes(indexHtml, ": { titleSize: 12, bodySize: 10, titleY: 17, line1Y: 37, line2Y: 53, line3Y: 68 }");
  assertIncludes(indexHtml, "ctx.fillText('🎯 משימה', boardX + boardW - 12, boardY + compactText.titleY);");
});

test('lesson 8 traffic light stays compact and high enough to show its pole', () => {
  assertIncludes(indexHtml, 'const crosswalkX = xs[1];');
  assertIncludes(indexHtml, 'const crosswalkW = 150;');
  assertIncludes(indexHtml, 'const lightX = crosswalkX + crosswalkW / 2 + 28;');
  assertIncludes(indexHtml, 'const lightY = y - 28;');
  assertIncludes(indexHtml, 'const poleTopY = lightY + 32;');
  assertIncludes(indexHtml, 'const poleBottomY = canvas.height - 10;');
  assertIncludes(indexHtml, 'ctx.lineTo(lightX, poleBottomY);');
  assertIncludes(indexHtml, 'ctx.roundRect(lightX - 18, poleBottomY - 4, 36, 8, 4);');
  assertIncludes(indexHtml, 'ctx.roundRect(lightX - 17, lightY - 34, 34, 66, 9);');
  assertIncludes(indexHtml, 'ctx.arc(lightX, lightY - 17, 9, 0, Math.PI * 2);');
  assertIncludes(indexHtml, 'ctx.arc(lightX, lightY + 15, 9, 0, Math.PI * 2);');
  assertIncludes(indexHtml, "ctx.fillText(robot.trafficLightGreen ? 'ירוק' : 'אדום', lightX, y + 48);");
});

test('lesson 8 removed instruction labels are not present', () => {
  assert.ok(!indexHtml.includes('לחצו על מכוניות'));
  assert.ok(!indexHtml.includes('לחצו על הולך רגל'));
});

test('lesson 8 uses a street ground and has a road/sidewalk crosswalk scene', () => {
  assertIncludes(indexHtml, '.ground.street-ground');
  assertIncludes(indexHtml, '.ground.street-ground::before');
  assertIncludes(indexHtml, 'background: transparent;');
  assertIncludes(indexHtml, 'display: none;');
  assertIncludes(indexHtml, "ground?.classList.toggle('street-ground', num === 8);");
  assertIncludes(indexHtml, 'const roadH = 92;');
  assertIncludes(indexHtml, 'const bottomSidewalkH = 14;');
  assertIncludes(indexHtml, 'const bottomSidewalkTop = canvas.height - bottomSidewalkH;');
  assertIncludes(indexHtml, 'const roadBottom = bottomSidewalkTop;');
  assertIncludes(indexHtml, 'const roadTop = roadBottom - roadH;');
  assertIncludes(indexHtml, 'const roadCenterY = roadTop + roadH / 2;');
  assertIncludes(indexHtml, 'const crosswalkY = roadCenterY;');
  assertIncludes(indexHtml, 'const bottomSidewalkEnabled = false;');
  assertIncludes(indexHtml, 'const bottomSidewalkBottom = canvas.height;');
  assertIncludes(indexHtml, 'ctx.fillStyle = \'#334155\';');
  assertIncludes(indexHtml, 'ctx.fillRect(0, roadTop, canvas.width, roadH);');
  assertIncludes(indexHtml, 'if (bottomSidewalkEnabled) {');
  assertIncludes(indexHtml, 'ctx.fillRect(0, bottomSidewalkTop, canvas.width, bottomSidewalkBottom - bottomSidewalkTop);');
  assertIncludes(indexHtml, 'ctx.moveTo(12, laneDividerY);');
  assertIncludes(indexHtml, 'ctx.lineTo(canvas.width - 12, laneDividerY);');
  assertIncludes(indexHtml, 'for (let stripeY = roadTop + 14; stripeY <= roadBottom - 14; stripeY += 16)');
  assertIncludes(indexHtml, 'ctx.roundRect(crosswalkX - crosswalkW / 2, stripeY - 5, crosswalkW, 10, 4);');
  assertIncludes(indexHtml, "ctx.fillText('מדרכה', crosswalkX, topSidewalkTop + 24);");
  assertNotIncludes(indexHtml, "ctx.fillText('מדרכה', crosswalkX, roadBottom + 18);");
});

test('lesson 8 has a crosswalk where cars and pedestrians move or stop in the right places', () => {
  assertIncludes(indexHtml, 'const activeLesson8Object = (i === 0 && environment.pedestrian) || (i === 2 && environment.cars);');
  assertIncludes(indexHtml, 'if (currentLesson === 8) {');
  assertNotIncludes(indexHtml, "ctx.fillText('מעבר חציה', crosswalkX, roadBottom + 18);");
  assertIncludes(indexHtml, 'const crosswalkW = 150;');
  assertIncludes(indexHtml, 'const crosswalkH = 54;');
  assertIncludes(indexHtml, 'const isStopped = (i === 2 && robot.trafficCarsStopped) || (i === 0 && robot.pedestrianStopped);');
  assertIncludes(indexHtml, 'const wave = t * 2.1;');
  assertIncludes(indexHtml, 'const roadLength = canvas.width + 140;');
  assertIncludes(indexHtml, 'const carProgress = (t * 92) % roadLength;');
  assertIncludes(indexHtml, 'const laneH = roadH / 2;');
  assertIncludes(indexHtml, 'const laneDividerY = roadTop + laneH;');
  assertIncludes(indexHtml, 'const laneTopY = roadTop + laneH / 2;');
  assertIncludes(indexHtml, 'const laneBottomY = laneDividerY + laneH / 2;');
  assertIncludes(indexHtml, 'const leftToRightX = isStopped ? crosswalkX - 108 : -70 + carProgress;');
  assertIncludes(indexHtml, 'const rightToLeftX = isStopped ? crosswalkX + 108 : canvas.width + 70 - carProgress;');
  assertIncludes(indexHtml, '{ x: leftToRightX, y: laneTopY, flip: true }');
  assertIncludes(indexHtml, '{ x: rightToLeftX, y: laneBottomY, flip: false }');
  assertIncludes(indexHtml, 'const pedestrianMotion = Math.sin(wave) * 58;');
  assertIncludes(indexHtml, 'const objectX = crosswalkX;');
  assertIncludes(indexHtml, 'const objectY = isStopped ? roadBottom + bottomSidewalkH - 2 : crosswalkY + pedestrianMotion;');
  assert.ok(!indexHtml.includes('המכוניות עצרו לפני מעבר החציה'));
  assert.ok(!indexHtml.includes('שתי מכוניות נוסעות בשני הנתיבים'));
  assert.ok(!indexHtml.includes('הולך הרגל עומד ליד מעבר החציה'));
  assert.ok(!indexHtml.includes('הולך רגל חוצה במעבר הלוך ושוב'));
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

test('lesson 8 educational data includes stop/continue traffic blocks and cyclic light practice', () => {
  const lesson8 = lessonObjectSource(8);
  assertIncludes(lesson8, "codingConcept: 'לולאה, תנאים ותזמון רמזור'");
  assertIncludes(lesson8, 'חזור תמיד');
  assertIncludes(lesson8, 'חכה 2 שניות');
  assertIncludes(lesson8, 'רמזור אדום');
  assertIncludes(lesson8, 'עצור מכוניות');
  assertIncludes(lesson8, 'המשך מכוניות');
  assertIncludes(lesson8, 'עצור הולך רגל');
  assertIncludes(lesson8, 'המשך הולך רגל');
  assertIncludes(lesson8, 'החליפו רמזור כל 2–3 שניות');
  assertIncludes(lessonsData, 'תרגיל 4 — רמזור מחזורי בלולאה לנצח');
  assertIncludes(lessonsData, 'אם יש גם מכוניות וגם הולך רגל, הרמזור מתחלף כל 2–3 שניות');
  assertIncludes(lessonsData, 'רמזור ירוק להולך רגל');
  assertIncludes(lessonsData, 'רמזור אדום להולך רגל');
  assertMatches(lessonsData, /'רמזור אדום להולך רגל', 'עצור הולך רגל', 'המשך מכוניות'/);
  assertIncludes(lessonsData, 'רמזור הולכי רגל מחזורי');
  assert.ok(!lessonsData.includes('ירוק למכוניות'));
  assert.ok(!lessonsData.includes('הרמזור חוזר למכוניות'));
});

test('lesson 11 has armed, motion, door sensors and alarm action wired', () => {
  const lesson11 = lessonObjectSource(11);
  assertIncludes(lesson11, 'מצב מערכת + תנועה + דלת');
  for (const id of ['sensorArmed', 'sensorMotion', 'sensorDoor']) {
    assertIncludes(indexHtml, `id="${id}"`);
  }
  for (const envId of ['envArmedMode', 'envMotion', 'envDoorOpen']) {
    assertIncludes(indexHtml, `id="${envId}"`);
  }
  for (const blockType of ['sensor_armed', 'sensor_motion', 'sensor_door', 'action_alarm']) {
    assertMatches(indexHtml, new RegExp(`(sensors|actions):\\s*\\[[^\\]]*'${blockType}'[^\\]]*\\]`));
    assertIncludes(indexHtml, `Blockly.Blocks['${blockType}']`);
  }
  assertIncludes(indexHtml, "case 'sensor_armed':");
  assertIncludes(indexHtml, "case 'sensor_motion':");
  assertIncludes(indexHtml, "case 'sensor_door':");
  assertIncludes(indexHtml, "case 'action_alarm':");
  assertIncludes(indexHtml, "armedMode: false");
  assertIncludes(indexHtml, "motion: false");
  assertIncludes(indexHtml, "doorOpen: false");
});

test('lesson 11 scene only draws active security symbols without covering cards', () => {
  assertMatches(indexHtml, /if \(currentLesson === 11\) \{[\s\S]*?const activeStates = \[environment\.doorOpen, environment\.motion, robot\.alarmOn\];[\s\S]*?if \(!activeStates\[i\]\) return;[\s\S]*?ctx\.fillText\(emojis\[i\], xs\[i\], y - 12\);[\s\S]*?return;[\s\S]*?\}/);
  const lesson11Block = indexHtml.match(/if \(currentLesson === 11\) \{[\s\S]*?return;\n\s*\}/)?.[0] || '';
  assert.ok(!lesson11Block.includes('roundRect'), 'Lesson 11 active symbols should not be drawn inside covering cards');
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
