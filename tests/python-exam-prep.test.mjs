import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const index = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const server = readFileSync(new URL('../server.js', import.meta.url), 'utf8');

assert.match(index, /href=["']python-exam-prep\.html["']/, 'catalog should link to the Python exam-prep course');
assert.match(index, /Python Quest/, 'catalog should name the exam-prep course');
assert.match(server, /pathname === ['"]\/python-exam-prep\.html['"][\s\S]*?return ['"]python-turtle['"]/, 'exam prep should reuse the protected Python entitlement');

const page = readFileSync(new URL('../python-exam-prep.html', import.meta.url), 'utf8');
assert.match(page, /lang=["']he["'][^>]*dir=["']rtl["']/, 'course should be Hebrew RTL');
assert.match(page, /id=["']missionNav["']/, 'course should expose mission navigation');
assert.match(page, /id=["']challengePrompt["']/, 'challenge should expose its task prompt');
assert.match(page, /id=["']beginnerGuide["']/, 'challenge should teach the idea before the editor');
assert.match(page, /id=["']guideIdea["']/, 'beginner guide should explain the idea in plain language');
assert.match(page, /id=["']guideTerms["']/, 'beginner guide should explain unfamiliar symbols in context');
assert.match(page, /id=["']guideExample["']/, 'worked examples should be collapsible when the learner reaches independent work');
assert.match(page, /id=["']guideExampleCode["']/, 'beginner guide should show a worked code example');
assert.match(page, /id=["']guideSteps["']/, 'beginner guide should show small actionable steps');
assert.match(page, /id=["']codeEditor["']/, 'course should expose an editable code lab');
assert.match(page, /id=["']runCodeBtn["']/, 'course should expose a run-code action');
assert.match(page, /id=["']feedbackPanel["']/, 'course should expose immediate feedback');
assert.match(page, /id=["']predictionPanel["']/, 'course should expose a prediction step before selected runs');
assert.match(page, /id=["']checkPredictionBtn["']/, 'course should let students submit a prediction');
assert.match(page, /id=["']codeOutput["'][^>]*dir=["']auto["']/, 'output panel should auto-detect Hebrew and English direction');
assert.match(page, /vendor\/skulpt\/skulpt\.min\.js/, 'Python runtime should be served locally');
assert.match(page, /vendor\/skulpt\/skulpt-stdlib\.js/, 'Python standard library should be served locally');
assert.doesNotMatch(page, /cdn\.jsdelivr\.net\/npm\/skulpt/, 'course must not depend on a runtime CDN');
assert.match(page, /js\/student-progress\.js/, 'course should use the shared progress API');

const dataSource = readFileSync(new URL('../js/python-exam-prep-data.js', import.meta.url), 'utf8');
const context = { window: {} };
vm.runInNewContext(dataSource, context);
const missions = context.window.PYTHON_EXAM_PREP_MISSIONS;
assert.equal(missions.length, 9, 'course should include eight topic missions and a final simulation');
assert.deepEqual(Array.from(missions, mission => mission.id), [1, 2, 3, 4, 5, 6, 7, 8, 9]);
assert.ok(missions.every(mission => mission.title && mission.story && mission.concept && mission.challenges.length >= 3), 'every mission should teach a concept through at least three challenges');
const challenges = missions.flatMap(mission => mission.challenges);
assert.ok(challenges.every(challenge => challenge.title && challenge.prompt && challenge.starterCode && challenge.hint && challenge.checker), 'every challenge should be runnable and checkable');
assert.ok(challenges.every(challenge => challenge.beginnerGuide?.idea?.length >= 25), 'every challenge should explain the new idea before asking the learner to code');
assert.ok(challenges.every(challenge => challenge.beginnerGuide?.example?.code && challenge.beginnerGuide?.example?.explanation), 'every challenge should include a worked example with an explanation');
assert.ok(challenges.every(challenge => Array.isArray(challenge.beginnerGuide?.terms) && challenge.beginnerGuide.terms.length >= 1), 'every challenge should explain the code symbols it uses');
assert.ok(challenges.flatMap(challenge => challenge.beginnerGuide.terms).every(item => item.term && item.meaning), 'every code term should have a plain-language meaning');
assert.ok(challenges.every(challenge => Array.isArray(challenge.beginnerGuide?.steps) && challenge.beginnerGuide.steps.length >= 2), 'every challenge should break the work into at least two beginner-sized steps');
assert.ok(challenges.every(challenge => ['guided', 'practice', 'independent'].includes(challenge.stage)), 'every challenge should state its scaffolding stage');
assert.deepEqual(Array.from(missions[0].challenges, challenge => challenge.stage), ['guided', 'practice', 'independent'], 'the first mission should progress from guided work to independent work');
const topicText = missions.map(mission => `${mission.title} ${mission.concept} ${mission.summary || ''}`).join(' ');
for (const topic of ['פלט', 'לולאות', 'range', 'תנאים', 'דיבוג', 'ספרות', 'Turtle', 'מחרוזות', 'סימולציית מבחן']) {
  assert.match(topicText, new RegExp(topic), `course should cover ${topic}`);
}
assert.ok(missions.some(mission => mission.challenges.some(challenge => challenge.mode === 'turtle')), 'course should include a visual Turtle code challenge');
assert.ok(missions[8].challenges.length >= 5, 'final simulation should mix at least five exam-style challenges');
assert.ok(missions.flatMap(mission => mission.challenges).filter(challenge => challenge.prediction?.expected).length >= 2, 'course should assess output prediction before code execution');
const termsFor = id => challenges.find(challenge => challenge.id === id).beginnerGuide.terms.map(item => item.term).join(' ');
for (const [id, requiredTerms] of Object.entries({
  'control-energy': ['+', '"..."', 'פסיק'],
  'range-up': ['in', 'number'],
  'and-not-or': ['[...]', 'for grade in grades'],
  'turtle-square': ['turtle.Turtle()', 'pen.speed(0)', 'range(4)'],
  'stars-string': ['=='],
})) {
  for (const term of requiredTerms) assert.ok(termsFor(id).includes(term), `${id} should explain ${term} before use`);
}
const twoTriangles = challenges.find(challenge => challenge.id === 'turtle-two-triangles');
assert.doesNotMatch(twoTriangles.beginnerGuide.steps.join(' '), /ארבע השורות/, 'the triangle guide should count the three-line loop accurately');
const firstChallenge = missions[0].challenges[0];
assert.doesNotMatch(firstChallenge.prompt, /שתי השורות/, 'the first task should not claim there are two blanks when only one line is incomplete');
const sliceChallenge = missions[7].challenges.find(challenge => challenge.id === 'string-slices');
assert.ok(sliceChallenge.checker.requiredPatterns.includes('title[-3]'), 'CodeQuest letter e should use the correct negative index');

const checkerSource = readFileSync(new URL('../js/python-exam-prep-checker.js', import.meta.url), 'utf8');
vm.runInNewContext(checkerSource, context);
const checker = context.window.PythonExamChecker;
const findChallenge = challenges.find(challenge => challenge.id === 'find-text');
assert.equal(checker.evaluate({ code: 'message="go robot go"\nprint(message.find("r"))\nprint(message.find("sun"))', output: '3\n-1', checker: findChallenge.checker }).status, 'almost', 'find challenge should require the requested robot and moon searches');
assert.equal(checker.normalizeOutput(' 3  \n4\n\n'), '3\n4');
assert.equal(checker.evaluate({ code: 'print(3)', output: '3\n', checker: { expectedOutput: '3' } }).status, 'correct');
const wrong = checker.evaluate({ code: 'print(2)', output: '2', checker: { expectedOutput: '3', explain: 'בדקו את החישוב.' } });
assert.equal(wrong.status, 'wrong-output');
assert.match(wrong.message, /ציפינו/);
const almost = checker.evaluate({ code: 'print(3)', output: '3', checker: { expectedOutput: '3', requiredPatterns: ['for '] } });
assert.equal(almost.status, 'almost');
assert.match(almost.message, /הפלט נכון/);
assert.equal(checker.evaluate({ code: 'for value in range(3,7): print(value)', output: '3', checker: { expectedOutput: '3', requiredPatterns: ['range(3, 7)'] } }).status, 'correct', 'equivalent spacing should be accepted');
assert.equal(checker.evaluate({ code: 'total += number', output: '10', checker: { expectedOutput: '10', requiredPatterns: [['total = total + number', 'total += number']] } }).status, 'correct', 'listed equivalent Python forms should be accepted');
assert.equal(checker.evaluate({ code: '# for value in range(3)\nprint(3)', output: '3', checker: { expectedOutput: '3', requiredPatterns: ['for value in range(3)'] } }).status, 'almost', 'comments must not satisfy executable-code requirements');
assert.equal(checker.evaluate({ code: 'note = "for value in range(3)"\nprint(3)', output: '3', checker: { expectedOutput: '3', requiredPatterns: ['for value in range(3)'] } }).status, 'almost', 'string literals must not satisfy executable-code requirements');
assert.equal(checker.evaluate({ code: 'if False:\n    for number in range(3, 7):\n        print(number)\nprint(3)\nprint(4)\nprint(5)\nprint(6)', output: '3\n4\n5\n6', checker: { expectedOutput: '3\n4\n5\n6', requiredPatterns: ['range(3, 7)'] } }).status, 'almost', 'statically unreachable blocks must not satisfy executable-code requirements');
assert.equal(checker.evaluate({ code: 'def decoy():\n    for number in range(3, 7):\n        print(number)\nprint(3)\nprint(4)\nprint(5)\nprint(6)', output: '3\n4\n5\n6', checker: { expectedOutput: '3\n4\n5\n6', requiredPatterns: ['range(3, 7)'] } }).status, 'almost', 'uncalled function bodies must not satisfy executable-code requirements');
assert.equal(checker.evaluate({ code: 'def solve():\n    for number in range(3, 7):\n        print(number)\nsolve()', output: '3\n4\n5\n6', checker: { expectedOutput: '3\n4\n5\n6', requiredPatterns: ['range(3, 7)'] } }).status, 'correct', 'called helper functions should remain valid equivalent solutions');
const descendingRange = missions[1].challenges.find(challenge => challenge.id === 'range-down');
assert.equal(checker.evaluate({ code: 'for number in range(9, 1, -2): print(number)', output: '9\n7\n5\n3', checker: descendingRange.checker }).status, 'correct', 'equivalent range stop values should be accepted');
const energyChallenge = missions[0].challenges.find(challenge => challenge.id === 'control-energy');
assert.equal(checker.evaluate({ code: 'energy = backup + energy', output: 'energy = 9\nbackup = 4', checker: energyChallenge.checker }).status, 'correct', 'commutative addition should be accepted');
const launchChallenge = missions[1].challenges.find(challenge => challenge.id === 'while-launch');
assert.equal(checker.evaluate({ code: 'while 0 < count:\n    count -= 1', output: '3\n2\n1\nGO', checker: launchChallenge.checker }).status, 'correct', 'reversed while comparison should be accepted');
const giftChallenge = missions[3].challenges.find(challenge => challenge.id === 'gift-level');
assert.equal(checker.evaluate({ code: 'if 50 > score:\n    pass\nelif 80 > score:\n    pass', output: 'badge', checker: giftChallenge.checker }).status, 'correct', 'reversed score comparisons should be accepted');
assert.equal(checker.evaluate({ code: 'title="CodeQuest"\nprint(title[2])\nprint(title[-3])\nprint(title[:5])', output: 'd\ne\nCodeQ', checker: sliceChallenge.checker }).status, 'correct', 'equivalent open-start slices should be accepted');
const squareTrace = [[0, 0], [90, 0], [90, 90], [0, 90], [0, 0]];
const circleTrace = Array.from({ length: 25 }, (_, index) => {
  const angle = (Math.PI * 2 * index) / 24;
  return [90 * Math.cos(angle), 90 * Math.sin(angle)];
});
assert.equal(checker.turtleTraceMatches(squareTrace, { segments: 4, turn: 90, distance: 90 }), true, 'square trace should match four equal right-angle sides');
assert.equal(checker.turtleTraceMatches(circleTrace, { segments: 4, turn: 90, distance: 90 }), false, 'a circle must not pass square grading');
assert.equal(checker.turtleTraceMatches([], { segments: 4, turn: 90, distance: 90 }), false, 'a colored background without pen lines must not pass Turtle grading');
const syntax = checker.runtimeError('SyntaxError: bad input');
assert.equal(syntax.status, 'syntax-error');
assert.match(syntax.message, /תחביר/);
const timeout = checker.runtimeError('TimeLimitError: Program exceeded run time limit.');
assert.equal(timeout.status, 'timeout');
assert.match(timeout.message, /לולאה/);
const outputLimit = checker.runtimeError('OutputLimitError: too much output');
assert.equal(outputLimit.status, 'output-limit');
assert.match(outputLimit.message, /פלט/);
assert.equal(checker.evaluate({ code: 'for x in range(3):\n  pass\nfor y in range(3): pass', output: '', checker: { expectedOutput: '', minimumOccurrences: { 'for ': 2 } } }).status, 'correct');
assert.match(page, /js\/python-exam-prep-checker\.js/, 'page should load the tested feedback engine');

const appSource = readFileSync(new URL('../js/python-exam-prep.js', import.meta.url), 'utf8');
assert.match(appSource, /Sk\.execLimit\s*=\s*4000/, 'runner should stop long-running code');
assert.match(appSource, /Sk\.importMainWithBody/, 'runner should execute Python in Skulpt');
assert.match(appSource, /Sk\.TurtleGraphics\.target\s*=\s*['"]turtleCanvas['"]/, 'runner should connect Turtle to the course canvas');
assert.match(appSource, /Sk\.onBeforeImport/, 'runner should enforce an import allowlist before executing student code');
assert.match(appSource, /allowedImports\.has/, 'runner should fail closed for modules outside the allowlist');
assert.match(appSource, /inputfun/, 'runner should provide deterministic challenge input');
assert.match(appSource, /PythonExamChecker\.evaluate/, 'runner should send results through the feedback engine');
assert.match(appSource, /PythonExamChecker\.runtimeError/, 'runner should explain runtime errors');
assert.match(appSource, /predictionPassed/, 'runner should require a checked prediction before selected code runs');
assert.match(appSource, /localStorage\.setItem/, 'runner should persist progress locally');
assert.match(appSource, /Number\(state\.challengeIndex\)/, 'runner should restore the saved challenge position');
assert.doesNotMatch(appSource, /state\.challengeIndex\s*=\s*0;/, 'runner must not reset saved position on every reload');
assert.match(appSource, /StudentProgress\.save/, 'runner should sync progress through the shared API');
assert.match(appSource, /activityId:\s*`mission-\$\{mission\.id\}`/, 'progress sync should include the required activity id');
assert.match(appSource, /let isRunning\s*=\s*false/, 'runner should guard against concurrent executions');
assert.match(appSource, /if\s*\(isRunning\)\s*return/, 'runner should reject shortcut re-entry while running');
assert.match(appSource, /try\s*{[\s\S]*?startTurtleTrace[\s\S]*?Sk\.onBeforeImport[\s\S]*?finally\s*{\s*turtleTrace\?\.stop\(\);\s*isRunning = false/, 'all engine setup and trace capture should be covered by the run cleanup guard');
assert.match(appSource, /guideExample\.open\s*=\s*challenge\.stage\s*!==\s*['"]independent['"]/, 'independent challenges should not reveal the worked example before the learner asks for it');
assert.match(appSource, /MAX_OUTPUT_CHARS/, 'runner should cap output growth');
assert.match(appSource, /turtleHasDrawing/, 'Turtle grading should validate rendered canvas pixels');
assert.match(appSource, /ctrlKey|metaKey/, 'runner should support a keyboard shortcut');
assert.doesNotMatch(appSource, /\beval\s*\(|new Function\s*\(/, 'runner must not execute code through JavaScript eval');

const css = readFileSync(new URL('../css/python-exam-prep.css', import.meta.url), 'utf8');
assert.match(css, /\.mission-button\.is-complete/, 'completed missions should be visually marked');
assert.match(css, /\.feedback-correct/, 'correct feedback should have a distinct visual state');
assert.match(css, /\.feedback-syntax-error/, 'syntax feedback should have a distinct visual state');
assert.match(css, /:focus-visible/, 'keyboard focus should be visible');
assert.match(css, /prefers-reduced-motion/, 'animations should respect reduced-motion preferences');
assert.match(css, /@media\s*\(max-width:\s*850px\)/, 'course should adapt to mobile screens');
const packageJson = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
for (const script of ['js/python-exam-prep-data.js', 'js/python-exam-prep-checker.js', 'js/python-exam-prep.js']) {
  assert.match(packageJson.scripts.check, new RegExp(script.replaceAll('.', '\\.')), `${script} should be included in repository syntax checks`);
}

console.log('Python exam-prep shell, curriculum, checker, runner and experience checks passed');
