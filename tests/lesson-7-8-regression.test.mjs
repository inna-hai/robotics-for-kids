import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const indexHtml = readFileSync(join(root, 'sensi-city.html'), 'utf8');
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

test('lesson 1 stays focused on light sensor street-light logic', () => {
  const lesson1 = lessonObjectSource(1);
  assertIncludes(lesson1, "title: 'פנס רחוב חכם'");
  assertIncludes(lesson1, "sensorFocus: 'אור'");
  assertIncludes(lesson1, 'אם חיישן אור = חשוך');
  assertIncludes(lesson1, 'פנס רחוב הדלק');
  assertIncludes(lesson1, 'הפנס נדלק בלילה ונשאר כבוי ביום');
  assertIncludes(lesson1, 'חיישן אור → אם חשוך → הדלק פנס');
  assertIncludes(lesson1, 'בדקו חיישן אור במצב חשוך');
  assertNotIncludes(lesson1, 'אם מערכת שמירה דרוכה', 'Lesson 1 must not use lesson 11 security-arming wording');
});

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
  assertIncludes(indexHtml, "isLesson13HomeGuardContext() ? '🏁 סוף גדר =' : '🏁 חיישן יעד ='");
  assertIncludes(indexHtml, "case 'sensor_goal':");
  assertIncludes(indexHtml, "return val === 'YES' ? canSenseGoal() : !canSenseGoal();");
  assertIncludes(indexHtml, "document.getElementById('goalText').textContent = currentLesson === 7");
  assertIncludes(indexHtml, "document.getElementById('sensorGoal').classList.toggle('active', (currentLesson === 7 || currentLesson === 12 || isLesson13HomeGuardContext() || currentLesson === 15) && sensesGoal);");
});

test('lesson 7 goal sensor uses a dedicated goal check rather than reusing the wall/touch sensor', () => {
  assertMatches(indexHtml, /function\s+canSenseGoal\s*\(\)\s*{[\s\S]*?currentLesson\s*===\s*12[\s\S]*?getLesson12HomeTarget\(\)[\s\S]*?<=\s*90;[\s\S]*?currentLesson\s*!==\s*7[\s\S]*?getLesson7LinePoints\(\)\.end[\s\S]*?getLineSensorPoint\(\)[\s\S]*?<=\s*34;[\s\S]*?}/);
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

test('lesson 12 obstacle block detects only a real fence collision, not just a fence on the board', () => {
  assertMatches(indexHtml, /case 'sensor_obstacle': \{[\s\S]*?const obstacleDetected = currentLesson === 12 \? canSenseTouch\(\) : Boolean\(environment\.obstacle\);[\s\S]*?return val === 'YES' \? obstacleDetected : !obstacleDetected;[\s\S]*?\}/);
  assertMatches(indexHtml, /if \(currentLesson === 12\) \{[\s\S]*?return Boolean\(robot\.hitLesson12Fence\);[\s\S]*?\}/);
  assertIncludes(indexHtml, 'robot.hitLesson12Fence = true;');
  assert.doesNotMatch(indexHtml, /while \(isRunning && wouldHitLesson12Fence/, 'A movement block should report the collision and return control to the loop/next condition.');
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
    10: { sensors: ['sensorSoil', 'sensorTemp'], env: ['envSoilDry', 'envTemperatureHot'] },
    11: { sensors: ['sensorLight', 'sensorPeople', 'sensorArmed', 'sensorSafeTouch', 'sensorDoor'], env: ['envLight', 'envPeople', 'envRemoveVisitor', 'envArmedMode', 'envSafeTouch', 'envDoorOpen'] },
    12: { sensors: ['sensorTouch', 'sensorDeliveryPackage', 'sensorGoal'], env: ['envObstacle', 'envDeliveryPackage'] },
    13: { sensors: ['sensorLight', 'sensorBurglar', 'sensorHomeowner', 'sensorMotion', 'sensorSound', 'sensorGoal'], env: ['envLight', 'envBurglar', 'envHomeowner', 'envSound'] },
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
  assertIncludes(indexHtml, "canvas.height = container.clientHeight - ([9, 11, 12, 13, 15].includes(currentLesson) ? 0 : 60); // Account for ground except full-background scenes");
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
  assertIncludes(indexHtml, "if (currentLesson === 9 || isLesson15Zone('school')) return 'LOUD';");
  assertIncludes(indexHtml, "if (!environment.sound) return 'QUIET';");
  assertIncludes(indexHtml, '// Draggable Sound source');
  assertIncludes(indexHtml, 'if (environment.sound) {');
  assertIncludes(indexHtml, '// Lesson 9 keeps the left draggable speaker as the only visible noise speaker.');
  assertNotIncludes(indexHtml, "ctx.fillText('רעש בכיתה', canvas.width * 0.88, canvas.height * 0.57);");
});

test('lesson 7 mission board is compact at the top-left, while lessons 8, 9, 11, 12, 13 and 15 stay compact', () => {
  assertIncludes(indexHtml, 'const compactMission = currentLesson === 7 || currentLesson === 8 || currentLesson === 9 || currentLesson === 11 || currentLesson === 12 || currentLesson === 13 || currentLesson === 15;');
  assertIncludes(indexHtml, 'currentLesson === 12 ? (canvas.width - Math.min(250, canvas.width * 0.44)) / 2');
  assertIncludes(indexHtml, 'currentLesson === 12 ? 44');
  assertIncludes(indexHtml, 'currentLesson === 12 ? Math.min(250, canvas.width * 0.44)');
  assertIncludes(indexHtml, 'currentLesson === 12 ? 62');
  assertIncludes(indexHtml, '? { titleSize: 11, bodySize: 9, titleY: 15, line1Y: 31, line2Y: 45, line3Y: 59 }');
  assertIncludes(indexHtml, 'currentLesson === 9');
  assertIncludes(indexHtml, '? { titleSize: 11, bodySize: 9, titleY: 15, line1Y: 31, line2Y: 45, line3Y: 59 }');
  assertIncludes(indexHtml, 'currentLesson === 12');
  assertIncludes(indexHtml, '? { titleSize: 10, bodySize: 8, titleY: 12, line1Y: 25, line2Y: 38, line3Y: 51 }');
  assertIncludes(indexHtml, 'currentLesson === 13');
  assertIncludes(indexHtml, '? { titleSize: 11, bodySize: 9, titleY: 15, line1Y: 32, line2Y: 48, line3Y: 66 }');
  assertIncludes(indexHtml, ": { titleSize: 12, bodySize: 10, titleY: 17, line1Y: 37, line2Y: 53, line3Y: 68 }");
  assertIncludes(indexHtml, "ctx.fillText('🎯 משימה', boardX + boardW - 12, boardY + compactText.titleY);");
});

test('lesson 13 is a night home guard that treats homeowner motion as safe only in the advanced exercise', () => {
  const lesson13 = lessonObjectSource(13);
  assertIncludes(lesson13, "title: 'שומר בית חכם בלילה — שקט חשוד'");
  assertIncludes(lesson13, "cityZone: 'בית בלילה'");
  assertIncludes(lesson13, "sensorFocus: 'גנב + בעל הבית + תנועה + רעש'");
  assertIncludes(lessonsData, 'תרגיל 1 — סיור ובדיקת גנב');
  assertIncludes(lessonsData, 'גם בתרגיל 1 צריך לבדוק אם יש גנב ולפעול בהתאם');
  assertIncludes(lessonsData, 'תרגיל 2 — תנועה לא תמיד חשודה: בעל הבית מול גנב');
  assertIncludes(lesson13, 'בתרגיל השני מוסיפים את הרעיון שתנועה לא תמיד חשודה');
  assertIncludes(lesson13, 'גנב שקט');
  assertIncludes(indexHtml, "13: { bg: ['#0f172a', '#312e81'], place: 'בית בלילה', icon: '🌙'");
  assertIncludes(indexHtml, "objects: ['בית פרטי', 'גנב', 'משטרה']");
  assertIncludes(indexHtml, 'lesson13-home-guard-background.svg');
  assertIncludes(indexHtml, "Blockly.Blocks['sensor_burglar']");
  assertIncludes(indexHtml, "movement: ['move_forward', 'move_backward', 'turn_around', 'turn_right', 'turn_left', 'stop_vehicle']");
  assertIncludes(indexHtml, "Blockly.Blocks['turn_around']");
  assertIncludes(indexHtml, "case 'turn_around':");
  assertIncludes(indexHtml, 'robot.angle += 180;');
  assertIncludes(indexHtml, "sensors: ['sensor_light', 'sensor_burglar', 'sensor_homeowner', 'sensor_motion', 'sensor_sound', 'sensor_goal']");
  assertIncludes(indexHtml, "sensors: ['sensorLight', 'sensorBurglar', 'sensorHomeowner', 'sensorMotion', 'sensorSound', 'sensorGoal']");
  assertIncludes(indexHtml, "Blockly.Blocks['sensor_homeowner']");
  assertIncludes(indexHtml, "toggleEnv('homeowner')");
  assertIncludes(indexHtml, 'environment.sound = environment.homeowner;');
  assertIncludes(indexHtml, "phase = elapsed < 2200 ? 'approach' : elapsed < 5200 ? 'yard' : elapsed < 7800 ? 'door' : 'gone';");
  assertIncludes(indexHtml, 'door: [canvas.width * 0.50, canvas.height * 0.58]');
  assertIncludes(indexHtml, "if (person.phase === 'gone')");
  assertIncludes(indexHtml, 'environment.homeowner = false;');
  assertIncludes(indexHtml, 'environment.motion = false;');
  assertIncludes(indexHtml, 'environment.sound = false;');
  assertIncludes(indexHtml, 'let burglarEscapedAt = null;');
  assertIncludes(indexHtml, "if (!burglarCaughtAt && !burglarEscapedAt) burglarEscapedAt = Date.now();");
  assertIncludes(indexHtml, "אוי לא, הגנב ברח...");
  assertIncludes(indexHtml, 'drawLesson13HomeownerCharacter(sadHomeowner');
  assertIncludes(indexHtml, 'Start Sensi in the middle of the fence patrol line, facing the right fence end.');
  assertIncludes(indexHtml, 'robot.x = canvas.width * 0.50;');
  assertIncludes(indexHtml, 'robot.y = canvas.height * 0.78;');
  assertIncludes(indexHtml, 'function getLesson13FenceEndTargets');
  assertIncludes(indexHtml, 'סוף הגדר!');
  assertIncludes(indexHtml, 'getLesson13FenceEndTargets().some');
  assertIncludes(indexHtml, 'Natural patrol markers: small fence lamps/posts');
  assertIncludes(indexHtml, "toggleEnv('burglar')");
  assertIncludes(indexHtml, 'function getLesson13BurglarScene');
  assertIncludes(indexHtml, 'function canSenseBurglarNearby');
  assertIncludes(indexHtml, 'if (isLesson13HomeGuardContext()) return canSenseBurglarNearby() || canSenseHomeowner();');
  assertIncludes(indexHtml, 'Math.hypot(robot.x - burglar.x, robot.y - burglar.y) <= 75');
  assertIncludes(indexHtml, "actions: ['action_street_light', 'action_alarm', 'action_sound', 'action_say']");
  assertIncludes(indexHtml, 'function catchLesson13BurglarIfAlarm');
  assertIncludes(indexHtml, 'burglarCaughtAt = Date.now();');
  assertIncludes(indexHtml, "if (soundType === 'ALARM')");
  assertIncludes(indexHtml, 'robot.alarmOn = true;');
  assertIncludes(indexHtml, 'catchLesson13BurglarIfAlarm();');
  assertIncludes(indexHtml, 'if (active && robot.alarmOn && !burglarCaughtAt)');
  assertIncludes(indexHtml, 'const caught = active && Boolean(burglarCaughtAt);');
  assertIncludes(indexHtml, 'אזעקה! המשטרה הגיעה והגנב נתפס!');
  assertNotIncludes(indexHtml, "ctx.fillText(person.phase === 'inside' ? '🏠'");
  assertIncludes(indexHtml, 'isLesson13HomeGuardContext() && environment.burglar && burglarCaughtAt');
  assertIncludes(indexHtml, 'המשטרה הגיעה — הגנב נעצר');
  assertIncludes(indexHtml, "פירצה בגדר");
  assertIncludes(indexHtml, "המשטרה הגיעה — הגנב נעצר");
  assertNotIncludes(indexHtml, "המשטרה הגיעה — הגנב נתפס");
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
  assertIncludes(indexHtml, 'ctx.roundRect(lightX - 17, lightY - 39, 34, 78, 9);');
  assertIncludes(indexHtml, 'ctx.arc(lightX, lightY - 24, 8, 0, Math.PI * 2);');
  assertIncludes(indexHtml, 'ctx.arc(lightX, lightY, 8, 0, Math.PI * 2);');
  assertIncludes(indexHtml, 'ctx.arc(lightX, lightY + 24, 8, 0, Math.PI * 2);');
  assertIncludes(indexHtml, "ctx.fillText(robot.trafficLightYellow ? 'כתום' : robot.trafficLightGreen ? 'ירוק' : 'אדום', lightX, y + 48);");
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
  assertIncludes(lessonSlidesHtml, '20260720-lesson11-13-merge-v1');
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
  assertMatches(indexHtml, /case 'action_water':[\s\S]*?\(currentLesson === 10 \|\| isLesson15Zone\('garden'\)\) && wasWatering && !nextWaterOn[\s\S]*?environment\.soilDry = false;[\s\S]*?envSoilDry[\s\S]*?classList\.remove\('active'\)/);
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
  assertIncludes(lessonSlidesHtml, '20260720-lesson11-13-merge-v1');
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
  assertIncludes(indexHtml, "isLesson14RescueContext() ? '⬆️ התקדם בזהירות' : '⬆️ זוז קדימה'");
  assertIncludes(indexHtml, "isLesson14RescueContext() ? '🧭 עקוף לפי נתיב בטוח' : '🧭 סובב לפי המסלול'");
  assertIncludes(indexHtml, "isLesson14RescueContext() ? 'יוצא לחילוץ' : currentLesson === 11 ? 'בודק את האולם' : 'שלום!'");
});



test('lesson 15 greenhouse enter and exit blocks switch to lesson 10 garden background', () => {
  assertIncludes(indexHtml, 'let lesson15GardenInside = false;');
  assertIncludes(indexHtml, "Blockly.Blocks['action_enter_greenhouse']");
  assertIncludes(indexHtml, "Blockly.Blocks['action_exit_greenhouse']");
  assertIncludes(indexHtml, "this.appendDummyInput().appendField('🏡 היכנס לחממה')");
  assertIncludes(indexHtml, "this.appendDummyInput().appendField('🚪 צא מהחממה')");
  assertIncludes(indexHtml, "'action_enter_greenhouse', 'action_exit_greenhouse'");
  assertIncludes(indexHtml, "selected.id === 'garden' && lesson15GardenInside");
  assertIncludes(indexHtml, "drawLesson10GardenScene({ title: 'החממה החכמה', preserveAspect: false, plantScale: 1.16, greenhouseInterior: true });");
  assertIncludes(indexHtml, "{ id: 'garden', label: 'חממה / גינה', icon: '🌱', x: .12, y: .45");
  assertIncludes(indexHtml, 'const selected = lesson15Zones.find(zone => {');
  assertIncludes(indexHtml, 'const bw = Math.max(116, zone.w * canvas.width * .68) + 28;');
  assertIncludes(indexHtml, 'const bh = 38 + 22;');
  assertIncludes(indexHtml, 'if (greenhouseInterior) {');
  assertIncludes(indexHtml, 'const preserveAspect = lesson.preserveAspect && !lesson.greenhouseInterior;');
  assertIncludes(indexHtml, 'const greenhouseInterior = lesson.greenhouseInterior;');
  assertIncludes(indexHtml, "lesson15GreenhouseInteriorBg.src = 'assets/lesson15-greenhouse-interior.png?v=20260721-greenhouse-interior-1';");
  assertIncludes(indexHtml, 'drawImageCover(lesson15GreenhouseInteriorBg);');
  assertIncludes(indexHtml, "const zoneInfoY = (selected.id === 'garden' && lesson15GardenInside) || selected.id === 'rescue' || selected.id === 'security' ? 12 : 86;");
  assertIncludes(indexHtml, 'zoneInfoY + 20');
  assertIncludes(indexHtml, 'const tempPanelX = w * 0.36;');
  assertIncludes(indexHtml, 'const tempPanelY = 74;');
  assertIncludes(indexHtml, "ctx.fillText(hot ? '🌡️ חם מדי בחממה' : '🌿 הטמפרטורה נעימה'");
  assertIncludes(indexHtml, "ctx.fillText(hot ? '32°' : '24°'");
  assertIncludes(indexHtml, 'const meterY = greenhouseInterior ? h * 0.80 : h * 0.36;');
  assertIncludes(indexHtml, "ctx.fillText('☀️', w * 0.14, h * 0.18);");
  assertIncludes(indexHtml, 'const visiblePlantProgress = greenhouseInterior && hot && !watering ? Math.min(recoveryProgress, 0.52) : recoveryProgress;');
  assertIncludes(indexHtml, 'const shouldRecoverPlants = environment.soilDry || environment.temperatureHot;');
  assertIncludes(indexHtml, 'gardenRecoveryStartProgress = greenhouseHotWilted && !environment.soilDry ? 0.52');
  assertIncludes(indexHtml, 'visiblePlantProgress - i * 0.025');
  assertIncludes(indexHtml, 'const targetRatio = 1.68;');
  assertIncludes(indexHtml, 'const plantScale = lesson.plantScale || 1;');
  assertIncludes(indexHtml, 'ctx.scale(plantScale, plantScale);');
  assertIncludes(indexHtml, "case 'action_enter_greenhouse':");
  assertIncludes(indexHtml, "case 'action_exit_greenhouse':");
});


test('lesson 15 presentation examples match available map zones', () => {
  const lesson15 = lessonObjectSource(15);
  assertIncludes(lesson15, 'בעיה: אזור חילוץ מסוכן');
  assertNotIncludes(lesson15, 'בעיה: מרכז מחזור מתבלבל');
});


test('lesson 15 rescue zone reuses lesson 14 rescue scene and sensors', () => {
  assertIncludes(indexHtml, "{ id: 'rescue', label: 'חילוץ / חירום', icon: '🛟', x: .84, y: .36");
  assertIncludes(indexHtml, "selected.id === 'rescue'");
  assertIncludes(indexHtml, "drawLesson14RescueScene({ title: 'אזור חילוץ / חירום' });");
  assertIncludes(indexHtml, 'function isLesson14RescueContext()');
  assertIncludes(indexHtml, "return currentLesson === 14 || isLesson15Zone('rescue');");
  assertIncludes(indexHtml, 'function resetRescueScenePositions()');
  assertIncludes(indexHtml, "if (selected.id === 'rescue') resetRescueScenePositions();");
  assertIncludes(indexHtml, "const zoneInfoY = (selected.id === 'garden' && lesson15GardenInside) || selected.id === 'rescue' || selected.id === 'security' ? 12 : 86;");
  assertIncludes(indexHtml, "isLesson14RescueContext() ? ' עשן בזירה' : ' עשן'");
  assertIncludes(indexHtml, "isLesson14RescueContext() ? ' חום מסוכן'");
  assertIncludes(indexHtml, "robot.speaking = isLesson14RescueContext()");
});


test('lesson 15 garden delivery target is at the greenhouse door', () => {
  assertIncludes(indexHtml, "garden: [{ id: 'greenhouse-door', x: w * 0.17, y: h * 0.71, label: 'פתח החממה' }]");
});


test('lesson 15 homes delivery targets include all house doors', () => {
  assertIncludes(indexHtml, "{ id: 'home-left', x: w * 0.15, y: h * 0.68, label: 'פתח בית 1' }");
  assertIncludes(indexHtml, "{ id: 'home-center', x: w * 0.59, y: h * 0.74, label: 'פתח בית 2' }");
  assertIncludes(indexHtml, "{ id: 'home-right', x: w * 0.78, y: h * 0.76, label: 'פתח בית 3' }");
  assertIncludes(indexHtml, "{ id: 'home-last', x: w * 0.91, y: h * 0.76, label: 'פתח בית 4' }");
});


test('lesson 15 delivery package stays with robot across zones and drops only at close targets', () => {
  assertIncludes(indexHtml, "if (!environment.deliveryPackage) {");
  assertIncludes(indexHtml, "if ((currentLesson === 12 || currentLesson === 15) && (environment.deliveryPackage || environment.deliveryDropped))");
  assertIncludes(indexHtml, "return (currentLesson === 12 || currentLesson === 15) && Boolean(environment.deliveryPackage);");
  assertIncludes(indexHtml, "return (currentLesson === 12 || currentLesson === 15) && Boolean(environment.deliveryDropped);");
  assertIncludes(indexHtml, "if ((currentLesson === 12 || currentLesson === 15) && environment.deliveryPackage && canSenseGoal())");
  assertIncludes(indexHtml, "Math.hypot(robot.x - door.x, robot.y - door.y) <= 60");
  assertIncludes(indexHtml, "return Math.sqrt(dx * dx + dy * dy) <= 60;");
});


test('lesson 12 slide count includes all 60-minute exercises', () => {
  const lesson12 = lessonObjectSource(12);
  for (const minutes of ["12–25", "25–35", "35–50", "50–55"]) {
    assertIncludes(lesson12, `minutes: '${minutes}'`);
    assertIncludes(lessonsData, `afterFlowMinutes: '${minutes}'`);
  }
  assertIncludes(lessonsData, 'תרגיל 1 — קל: משלוח מלא בלי גדר');
  assertIncludes(lessonsData, 'תרגיל 2 — שדרוג: מזהים גדר ועוקפים');
  assertIncludes(lessonsData, 'תרגיל 3 — בדיקת שתי ריצות: בלי גדר ועם גדר');
  assertIncludes(lessonsData, 'תרגיל 4 — משפרים את העקיפה');
  assertIncludes(lessonsData, 'תרגיל 5 — שדרוג אישי קצר');
});

test('lesson 15 security patrol zone reuses lesson 13 home guard scene and sensors', () => {
  assertIncludes(indexHtml, "{ id: 'security', label: 'סיור אבטחה', icon: '🌙'");
  assertIncludes(indexHtml, "problem: 'סיור אבטחה סביב בית'");
  assertIncludes(indexHtml, "selected.id === 'security'");
  assertIncludes(indexHtml, 'function isLesson13HomeGuardContext()');
  assertIncludes(indexHtml, "return currentLesson === 13 || isLesson15Zone('security');");
  assertIncludes(indexHtml, 'function resetHomeGuardScenePositions()');
  assertIncludes(indexHtml, 'function drawLesson13SecurityScene()');
  assertIncludes(indexHtml, 'drawLesson13SecurityScene();');
  assertIncludes(indexHtml, 'if (currentLesson === 15 && !isLesson13HomeGuardContext())');
  assertIncludes(indexHtml, 'function drawLesson15BackToMapButton');
  assertIncludes(indexHtml, "const backButtonDarkScene = selected.id === 'security';");
  assertIncludes(indexHtml, "ctx.fillStyle = backButtonDarkScene ? '#ffffff' : 'rgba(15,23,42,.82)';");
  assertIncludes(indexHtml, 'drawLesson15BackToMapButton();');
  assertIncludes(indexHtml, 'isLesson13HomeGuardContext() && lesson13HomeGuardBg.complete');
  assertIncludes(indexHtml, 'if (isLesson13HomeGuardContext()) return canSenseBurglarNearby() || canSenseHomeowner();');
  assertIncludes(indexHtml, 'return isLesson13HomeGuardContext() && Boolean(environment.homeowner);');
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
