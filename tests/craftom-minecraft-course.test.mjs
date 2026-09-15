import { readFileSync, existsSync } from 'node:fs';
import { strict as assert } from 'node:assert';
import vm from 'node:vm';

const root = new URL('../', import.meta.url);
const read = path => readFileSync(new URL(path, root), 'utf8');
const exists = path => existsSync(new URL(path, root));
const sandbox = { window: {} };

vm.createContext(sandbox);
vm.runInContext(read('js/craftom-minecraft-challenges.js'), sandbox);

const program = sandbox.window.CRAFTOM_MINECRAFT_PROGRAM;
assert.ok(program, 'Craftom Minecraft program exists');
assert.equal(program.title, 'אקדמיית ה-Agent במיינקראפט', 'program has a grade-neutral user-facing name');
assert.equal(program.grade, 'חטיבת ביניים', 'program is not locked to grade 7 in user-facing metadata');
assert.equal(program.totalChallenges, 4, 'program has 4 challenges');
assert.equal(program.totalMeetings, 16, 'program has 16 meetings');
assert.ok(program.subtitle.includes('עבודה עצמית'), 'program frames the course as a self-study lomda');
assert.ok(program.subtitle.includes('בהמשכים'), 'program frames the course as one continuing city');
assert.ok(program.outcomes.some(item => item.includes('אתה רואה')), 'student-facing outcomes use direct singular wording');
assert.ok(program.outcomes.some(item => item.includes('אתה יודע')), 'student-facing outcomes speak directly to one student');
assert.ok(!program.outcomes.some(item => item.includes('התלמידים')), 'student-facing outcomes avoid third-person student wording');
assert.ok(!program.outcomes.some(item => item.includes('אתם')), 'student-facing outcomes avoid plural wording');
assert.equal(
  program.overviewVideo,
  'marketing/craftom-program-real-minecraft-gemini-live-1x.mp4',
  'program points to the real Minecraft overview video'
);
assert.ok(exists(program.overviewVideo), 'overview video file exists');
assert.ok(exists(program.overviewPoster), 'overview video poster exists');
assert.ok(program.exitUpload.includes('צילום'), 'program has a photo upload requirement for exit tickets');
assert.ok(program.exitUpload.includes('כרטיס היציאה'), 'photo upload is tied to the exit ticket');

const [challenge1, challenge2, challenge3, challenge4] = program.challenges;
assert.equal(challenge1.title, 'הרובוט השליח', 'challenge 1 keeps the courier foundation');
assert.equal(challenge1.meetings[0][4].academy.exercises.length, 6, 'challenge 1 lesson 1 has gradual Agent academy exercises');
assert.ok(!challenge1.meetings[0][4].academy.story.includes('Python Turtle'), 'lesson 1 explains gradual work without assuming a previous Python Turtle course');
assert.ok(challenge1.meetings[0][4].goal.startsWith('בשיעור הזה'), 'lesson 1 goal speaks directly to students');
assert.ok(challenge1.meetings[0][4].academy.exercises.every(exercise => exercise.hint && !exercise.python && !exercise.blocks), 'academy exercises guide students without storing full solutions');
assert.equal(challenge1.meetings[1][4].academy.exercises.length, 6, 'challenge 1 lesson 2 has gradual Agent academy exercises');
assert.ok(challenge1.meetings[1][4].academy.story.includes('פנייה'), 'lesson 2 academy matches the turn lesson');
assert.ok(challenge1.meetings[1][4].academy.exercises.every(exercise => exercise.hint && exercise.starter && exercise.criteria && !exercise.python && !exercise.blocks), 'lesson 2 academy also guides students without storing full solutions');
assert.equal(challenge1.meetings[2][4].academy.exercises.length, 6, 'challenge 1 lesson 3 has gradual Agent academy exercises');
assert.ok(challenge1.meetings[2][4].academy.story.includes('משנה את העולם'), 'lesson 3 academy matches the package placement lesson');
assert.ok(challenge1.meetings[2][4].academy.exercises.some(exercise => exercise.criteria.some(criterion => criterion.type === 'packageNearStation')), 'lesson 3 academy checks that the package is placed near the station');
assert.ok(challenge1.meetings[2][4].academy.exercises.every(exercise => exercise.hint && exercise.starter && exercise.criteria && !exercise.python && !exercise.blocks), 'lesson 3 academy also gives scaffolds, not ready-made solutions');
assert.ok(program.lessons.every(lesson => lesson.detail.academy?.exercises?.length === 6), 'every Craftom lesson now has a 6-step Agent academy');
assert.ok(program.lessons.every(lesson => lesson.detail.academy.exercises.every(exercise => exercise.hint && exercise.starter && exercise.criteria && !exercise.python && !exercise.blocks)), 'all academies stay scaffolded without ready-made solution snippets');
assert.ok(program.lessons.every(lesson => lesson.detail.reflection), 'every lesson has a meeting-specific additional reflection question');
assert.ok(!program.lessons.some(lesson => lesson.detail.reflection.includes('אחרי הבדיקה')), 'additional reflection questions focus on the current meeting instead of a generic after-test prompt');
assert.equal(challenge2.title, 'קו המשלוחים האוטומטי', 'challenge 2 is the automatic delivery line');
assert.equal(challenge3.title, 'קו משלוחים חכם', 'challenge 3 is the smart delivery line');
assert.equal(challenge4.title, 'העיר החכמה שלי', 'challenge 4 is the personal smart city project');
assert.ok(challenge4.concept.includes('אוטומציות למערכות בעיר'), 'challenge 4 focuses on adding automations to city systems');
assert.ok(challenge4.checks[0].includes('לפחות שתי מערכות'), 'challenge 4 requires more than one city system/automation');
assert.ok(challenge4.checks[2].includes('לפחות שני רעיונות'), 'challenge 4 asks students to combine multiple programming ideas');
assert.equal(
  challenge4.video,
  'marketing/craftom-challenge4-smart-city-automations-gemini-live-1x.mp4',
  'challenge 4 points to the updated smart city automations video'
);
assert.ok(exists(challenge4.video), 'challenge 4 updated video file exists');
assert.ok(exists(challenge4.poster), 'challenge 4 updated poster exists');
assert.ok(challenge2.concept.includes('לולאות') && challenge2.command === 'start', 'challenge 2 teaches a repeatable start command');
assert.ok(challenge2.meetings[0][4].academy.story.includes('להחליף שכפול ב-repeat'), 'lesson 5 academy focuses on replacing duplicated blocks with repeat');
assert.ok(challenge2.meetings[1][4].academy.story.includes('מחזור פעולה יציב'), 'lesson 6 academy focuses on a stable out-and-back cycle');
assert.ok(challenge2.meetings[2][4].academy.story.includes('start') && challenge2.meetings[2][4].academy.story.includes('נקודת פתיחה'), 'lesson 7 academy aligns with the Minecraft start/repeat task');
assert.ok(challenge2.meetings[2][4].build.some(item => item.includes('START')), 'lesson 7 Minecraft task adds a visible start station');
assert.ok(challenge2.meetings[2][4].evidence.some(item => item.includes('חוזר להתחלה')), 'lesson 7 Minecraft evidence checks return-to-start for repeated cycles');
assert.notDeepEqual(
  challenge2.meetings[0][4].academy.exercises.map(exercise => exercise.title),
  challenge2.meetings[1][4].academy.exercises.map(exercise => exercise.title),
  'lesson 5 and 6 academy exercises are distinct'
);
for (let lessonId = 6; lessonId < 16; lessonId += 1) {
  const current = program.lessons.find(lesson => lesson.id === lessonId);
  const next = program.lessons.find(lesson => lesson.id === lessonId + 1);
  assert.notDeepEqual(
    current.detail.academy.exercises.map(exercise => exercise.title),
    next.detail.academy.exercises.map(exercise => exercise.title),
    `lesson ${lessonId} and ${lessonId + 1} academy exercise titles are not identical`
  );
  assert.notEqual(
    current.detail.code.join(' | '),
    next.detail.code.join(' | '),
    `lesson ${lessonId} and ${lessonId + 1} Minecraft code prompts are not identical`
  );
}
for (const lesson of program.lessons) {
  assert.ok(lesson.detail.learn && lesson.detail.learn.length > lesson.detail.goal.length, `lesson ${lesson.id} has a detailed learning explanation`);
  assert.notEqual(lesson.detail.learn, lesson.detail.goal, `lesson ${lesson.id} learning explanation is not a duplicate of the goal`);
  assert.ok(!lesson.detail.learn.includes('התלמידים'), `lesson ${lesson.id} learning explanation speaks directly to the student`);
}
assert.ok(challenge2.meetings[2][4].code.some(item => item.includes('on chat command start')), 'lesson 7 uses the same start command as the academy');
assert.ok(challenge2.meetings[2][4].code.some(item => item.includes('repeat')), 'lesson 7 includes the academy repeat block in the Minecraft task');
assert.ok(challenge2.meetings[2][4].code.some(item => item.includes('agent.place')), 'lesson 7 includes the academy package placement in the Minecraft task');
assert.ok(challenge2.meetings[2][4].code.some(item => item.includes('BACK')), 'lesson 7 checks that the repeated cycle returns to start');
assert.equal(
  challenge2.video,
  'marketing/craftom-challenge2-delivery-line-gemini-live-1x.mp4',
  'challenge 2 points to the updated automatic delivery line video'
);
assert.ok(exists(challenge2.video), 'challenge 2 updated video file exists');
assert.ok(exists(challenge2.poster), 'challenge 2 updated poster exists');
assert.ok(challenge3.concept.includes('if/else'), 'challenge 3 teaches conditions');
assert.ok(challenge3.checks.some(item => item.includes('מצב נראה בעולם')), 'challenge 3 requires visible Minecraft state');
assert.ok(challenge3.meetings[0][4].code.some(item => item.includes('agent.detect')), 'challenge 3 includes a Minecraft-visible state check option');
assert.ok(!challenge3.meetings[2][4].code.join(' ').includes('else pause(1000) else'), 'challenge 3 does not present two else branches as one code sequence');
assert.equal(
  challenge3.video,
  'marketing/craftom-challenge3-smart-delivery-line-gemini-live-1x.mp4',
  'challenge 3 points to the updated smart delivery line video'
);
assert.ok(exists(challenge3.video), 'challenge 3 updated video file exists');
assert.ok(exists(challenge3.poster), 'challenge 3 updated poster exists');
assert.ok(challenge4.meetings[3][1].includes('דמו'), 'challenge 4 closes with a demo lesson');
assert.ok(challenge4.meetings[0][4].exit.includes('שתי מערכות'), 'challenge 4 first exit ticket matches the multi-system final project');

const serialized = JSON.stringify(program);
assert.ok(!serialized.includes('גשר הבנאי'), 'old bridge framing was removed from the curriculum data');
assert.ok(!serialized.includes('מעבר חציה חכם'), 'old disconnected crosswalk framing was removed from the curriculum data');
assert.equal(challenge2.command, 'start', 'old bridge command was replaced with the academy-aligned start command');

const preview = read('craftom-school/preview/index.html');
const academyPage = read('craftom-agent-academy.html');
const challengePage = read('craftom-minecraft-challenge.html');
const lessonPageScript = read('js/craftom-minecraft-lesson-page.js');
assert.ok(preview.includes('programVideo'), 'preview page renders the program video element');
assert.ok(preview.includes('סרטון פתיחת התוכנית'), 'preview page labels the overview video');
assert.ok(preview.includes('program.overviewVideo'), 'preview page loads video from program data');
assert.ok(preview.includes('איך עובדים בלומדה'), 'preview explains the self-study mode before teacher materials');
assert.ok(preview.includes('20260914-teacher-return-1'), 'preview page cache-busts the direct student wording');
assert.ok(preview.includes('אקדמיית ה-Agent'), 'preview uses the neutral Agent academy name');
assert.ok(!preview.includes('Craftom Challenges • כיתה ז׳'), 'preview no longer presents the course as grade 7 only');
assert.ok(preview.includes('id="courseHeaderNav"'), 'preview home has a course navigation header');
assert.ok(preview.includes('השיעור הנוכחי'), 'preview home header links to the current lesson');
assert.ok(!preview.includes('href="./"'), 'preview home header does not link back to the unsupported directory URL');
assert.ok(preview.includes('/api/kugel/session'), 'preview home can resolve the teacher-opened current lesson');
assert.ok(preview.includes('craftom-minecraft-lesson-${lessonId}.html'), 'preview home current lesson link points to a lesson page');
assert.ok(preview.includes('craftom-minecraft-challenge.html?challenge=${challenge.id}'), 'preview home challenge links point to challenge pages');
assert.ok(academyPage.includes('id="courseHeaderNav"'), 'Agent academy page keeps the course navigation header visible');
assert.ok(academyPage.includes('craftom-minecraft-lesson-${lessonId}.html'), 'Agent academy current lesson link returns to the matching lesson');
assert.ok(academyPage.includes('craftom-minecraft-challenge.html?challenge=${challenge.id}'), 'Agent academy header links to all challenges');
assert.ok(challengePage.includes('20260914-video-first-frames-1'), 'challenge pages should load the latest first-frame challenge data');
assert.ok(challengePage.includes('rootAssetPath(challenge.video)'), 'challenge pages should connect the actual mp4 video source');
assert.ok(challengePage.includes('craftomPosterPath(challenge.poster)'), 'challenge pages should load posters through the MIME-safe endpoint');
assert.ok(challengePage.includes('video.load()'), 'challenge pages should reload the video element after assigning the source');
assert.ok(lessonPageScript.includes('id="courseHeader"'), 'lesson pages render the course header before lesson content');
assert.ok(lessonPageScript.indexOf('renderCourseHeader();') < lessonPageScript.indexOf('renderQaCourseSwitcher();'), 'lesson page header appears before the QA lesson switcher');
for (const path of ['craftom-minecraft-challenge.html', 'craftom-minecraft-students.html', 'craftom-minecraft-slides.html']) {
  const html = read(path);
  assert.ok(html.includes('id="courseHeaderNav"'), `${path} keeps the course navigation header visible`);
  assert.ok(html.includes('craftom-minecraft-challenge.html?challenge=${item.id}'), `${path} header links to all challenges`);
}

for (const path of [
  'craftom-minecraft-challenge.html',
  'craftom-minecraft-students.html',
  'craftom-minecraft-slides.html',
  'craftom-agent-academy.html',
]) {
  assert.ok(read(path).includes('20260914-teacher-return-1'), `${path} loads the updated challenge data`);
}
assert.ok(read('craftom-minecraft-lesson.html').includes('20260915-direct-student-copy-1'), 'lesson template cache-busts the updated lesson copy');

assert.ok(read('craftom-minecraft-challenge.html').includes('רצף עבודה עצמית'), 'challenge page frames the work as self-study');
assert.ok(read('craftom-minecraft-lesson.html').includes('איך עובדים לבד'), 'lesson page starts lesson detail with self-study steps');
assert.ok(read('craftom-minecraft-lesson.html').includes('מה תלמד בשיעור'), 'lesson page addresses one student directly');
assert.ok(!read('craftom-minecraft-lesson.html').includes('מה תלמדו בשיעור'), 'lesson page avoids plural lesson heading');
assert.ok(!read('craftom-minecraft-lesson.html').includes('כתבו כאן את התשובה הקצרה שלכם'), 'lesson page avoids plural exit placeholder');
assert.ok(read('craftom-minecraft-lesson.html').includes('agentAcademyCta'), 'lesson page has an academy entry button');
assert.ok(read('craftom-minecraft-lesson.html').includes('lesson-progress-nav'), 'lesson page has a progress anchor bar');
assert.ok(read('craftom-minecraft-lesson.html').includes('←'), 'lesson progress bar uses the requested arrow direction');
assert.ok(!read('craftom-minecraft-lesson.html').includes('→'), 'lesson progress bar avoids the old arrow direction');
assert.ok(read('craftom-minecraft-lesson.html').includes('href="#lessonIntro"'), 'lesson progress bar links to the intro');
assert.ok(read('craftom-minecraft-lesson.html').includes('href="#agentAcademyCta"'), 'lesson progress bar links to Agent academy');
assert.ok(read('craftom-minecraft-lesson.html').includes('href="#minecraftEntryCard"'), 'lesson progress bar links to Minecraft');
assert.ok(read('craftom-minecraft-lesson.html').includes('id="exitTicketSection"'), 'lesson progress bar has an exit ticket anchor target');
assert.ok(!read('craftom-minecraft-lesson.html').includes('ראיות Craftom'), 'student lesson page does not expose Craftom evidence checklist');
assert.ok(read('js/craftom-minecraft-lesson-page.js').includes('minecraftEntryCard'), 'lesson pages show students a Minecraft entry card');
assert.ok(read('js/craftom-minecraft-lesson-page.js').includes('minecraftEntryTopLink'), 'lesson pages keep the top Minecraft entry button');
assert.ok(read('js/craftom-minecraft-lesson-page.js').includes('כניסה ל-Minecraft'), 'top Minecraft entry button keeps student-facing wording');
assert.ok(read('js/craftom-minecraft-lesson-page.js').includes('agentAcademyTopLink'), 'lesson pages show the top Agent academy button');
assert.ok(read('js/craftom-minecraft-lesson-page.js').includes('פתיחת אקדמיית Agent'), 'top Agent academy button uses the requested wording');
assert.ok(read('js/craftom-minecraft-lesson-page.js').includes('/api/kugel/student/start'), 'lesson pages let students enter the teacher-opened Minecraft world');
assert.ok(read('js/craftom-minecraft-lesson-page.js').includes('craftom-agent-academy.html?${next.toString()}'), 'lesson page links to the separate Agent academy');
assert.ok(read('js/craftom-minecraft-lesson-page.js').includes('function agentAcademyUrl'), 'teacher-launched student previews keep the teacher return query when opening Agent academy');
assert.ok(read('js/craftom-minecraft-lesson-page.js').includes("next.set('teacherReturn', '1')"), 'Agent academy links preserve the teacher return marker');
assert.ok(!read('js/craftom-minecraft-lesson-page.js').includes('ראיות Craftom'), 'rendered student lessons hide the Craftom evidence checklist');
assert.ok(read('js/craftom-minecraft-lesson-page.js').includes('nextChallengeLink'), 'final challenge meetings can reveal a next challenge button');
assert.match(read('js/craftom-minecraft-lesson-page.js'), /if \(submission && !nextLesson && nextChallengeLink\) \{\s*nextChallengeLink\.hidden = !nextChallengeFirstLesson;/, 'a saved submission must restore next-challenge navigation after refresh');
assert.doesNotMatch(read('js/craftom-minecraft-lesson-page.js'), /\$\{submission\.(?:exitAnswer|imageName)/, 'stored student submission text must not be interpolated into innerHTML');
assert.doesNotMatch(read('js/craftom-minecraft-lesson-page.js'), /hai:classroom-progress[\s\S]{0,400}activityId: 'exit-ticket'/, 'the accepted exit-ticket must record progress only once on the server');
assert.ok(read('js/craftom-minecraft-lesson-page.js').includes('לאתגר הבא'), 'next challenge button uses student-facing wording');
assert.ok(!read('js/craftom-minecraft-lesson-page.js').includes('craftom-minecraft-slides.html?challenge=${lesson.challengeId}&lesson=${lesson.id}'), 'student lesson page does not link to instructor slides');
assert.ok(!read('js/craftom-minecraft-lesson-page.js').includes('id="studentLink"'), 'student lesson renderer removes the worksheet shortcut');
assert.ok(!read('js/craftom-minecraft-lesson-page.js').includes('id="challengeLink"'), 'student lesson renderer removes the duplicate challenge page shortcut');
assert.ok(!read('craftom-minecraft-lesson.html').includes('דף האתגר'), 'lesson template removes the duplicate challenge page shortcut');
assert.ok(read('js/craftom-minecraft-lesson-page.js').includes('קודם נכנסים לאקדמיה'), 'academy lessons clearly send students to practice before implementation');
assert.ok(read('js/craftom-minecraft-lesson-page.js').includes('מיישמים את אותו רעיון בתוך Minecraft Education'), 'academy lessons clearly distinguish practice from Minecraft implementation');
assert.ok(read('craftom-agent-academy.html').includes('academyCanvas'), 'Agent academy has a result simulation canvas');
assert.ok(read('craftom-agent-academy.html').includes('academyBlockly'), 'Agent academy has a Blockly MakeCode area');
assert.ok(read('craftom-agent-academy.html').includes('data-academy-mode="python"'), 'Agent academy has a Python tab');
assert.ok(read('craftom-agent-academy.html').includes('academyComplete'), 'Agent academy has a full-completion message');
assert.ok(read('craftom-agent-academy.html').includes('academyCompleteBackLink'), 'Agent academy completion lets students return to the lesson');
assert.ok(read('craftom-agent-academy.html').includes('זו סביבת תרגול'), 'Agent academy tells students it is a practice environment');
assert.ok(read('js/craftom-agent-academy.js').includes('renderTeacherReturnAction'), 'Agent academy shows a teacher-management return button when opened from the teacher preview');
assert.ok(read('js/craftom-agent-academy.js').includes('חזרה לניהול שיעור מורה'), 'Agent academy teacher return button uses the requested wording');
assert.ok(read('craftom-minecraft-slides.html').includes('teacherManagementUrl'), 'instructor slides can return directly to teacher lesson management');
assert.ok(read('craftom-minecraft-students.html').includes('דף עבודה עצמית'), 'student worksheet is framed as self-study');
assert.ok(!preview.includes('דף עבודה עצמית לתלמיד'), 'preview removes worksheet shortcut buttons from the course flow');
assert.ok(!read('craftom-minecraft-challenge.html').includes('craftom-minecraft-students.html?challenge=${challenge.id}'), 'challenge page removes the worksheet shortcut button');
assert.ok(!read('craftom-minecraft-lesson.html').includes('id="studentLink"'), 'lesson page removes the worksheet shortcut button');
assert.ok(read('craftom-minecraft-lesson.html').includes('העלאת תמונה'), 'lesson page asks for a photo upload in the exit ticket area');
assert.ok(read('craftom-minecraft-lesson.html').includes('id="exitTicketForm"'), 'lesson page has a real exit ticket submission form');
assert.ok(read('craftom-minecraft-lesson.html').includes('type="file"'), 'lesson page has a real photo file input');
assert.ok(read('craftom-minecraft-lesson.html').includes('id="exitReflection"'), 'lesson page adds a second meaningful exit-ticket question');
assert.ok(read('js/craftom-minecraft-lesson-page.js').includes('שאלת חשיבה נוספת'), 'lesson renderer labels the additional exit-ticket question');
assert.ok(read('js/craftom-minecraft-lesson-page.js').includes('lesson.detail.reflection || fallbackReflectionQuestion'), 'lesson renderer uses the meeting-specific reflection question');
assert.ok(!read('js/craftom-minecraft-lesson-page.js').includes('מה שיניתם או שיפרתם אחרי הבדיקה'), 'lesson renderer removes the generic after-test reflection question');
assert.ok(read('js/craftom-minecraft-lesson-page.js').includes('כתוב תשובה לשאלת החשיבה הנוספת'), 'lesson renderer requires the additional reflection answer');
assert.ok(
  read('craftom-minecraft-lesson.html').indexOf('id="exitTicket"') < read('craftom-minecraft-lesson.html').indexOf('id="exitAnswer"'),
  'exit ticket question appears directly above the answer field'
);
assert.ok(read('craftom-minecraft-lesson.html').includes('id="makeCodeSnippet"'), 'lesson page includes an embedded MakeCode snippet area');
assert.ok(read('craftom-minecraft-lesson.html').includes('id="craftomBlockly"'), 'lesson page includes a Blockly workspace');
assert.ok(read('craftom-minecraft-lesson.html').includes('data-craftom-code-mode="blocks"'), 'lesson page has a blocks tab');
assert.ok(read('craftom-minecraft-lesson.html').includes('id="makeCodeSnippet" class="makecode-code" dir="ltr" hidden'), 'generated code starts hidden instead of below blocks');
assert.ok(read('craftom-minecraft-lesson.html').includes('js/vendor/blockly/blockly.min.js'), 'lesson page loads local Blockly');
assert.ok(read('craftom-minecraft-lesson.html').includes('craftom-minecraft-code-builder.js'), 'lesson page loads the Craftom Code Builder');
assert.ok(read('craftom-minecraft-lesson.html').includes('https://minecraft.makecode.com/'), 'lesson page links or embeds MakeCode for Minecraft');
assert.ok(read('js/craftom-minecraft-lesson-page.js').includes('player.onChat("deliver"'), 'lesson renderer includes MakeCode starter code');
assert.ok(read('js/craftom-minecraft-lesson-page.js').includes('loops.forever'), 'lesson renderer includes loop starter code for challenge 2');
assert.ok(read('js/craftom-minecraft-lesson-page.js').includes('copyMakeCode'), 'lesson renderer can copy starter MakeCode');
assert.ok(read('js/craftom-minecraft-code-builder.js').includes('Blockly.inject'), 'Craftom Code Builder creates a real Blockly workspace');
assert.ok(read('js/craftom-agent-academy.js').includes('function runProgram'), 'Agent academy can simulate safe Agent commands');
assert.ok(read('js/craftom-agent-academy.js').includes('function evaluate'), 'Agent academy checks student code against exercise criteria');
assert.ok(read('js/craftom-agent-academy.js').includes('agent.move'), 'Agent academy parses Agent movement code');
assert.ok(read('js/craftom-agent-academy.js').includes("Blockly.inject('academyBlockly'"), 'Agent academy builds MakeCode with Blockly');
assert.ok(read('js/craftom-agent-academy.js').includes('category name="Loops"'), 'Agent academy keeps repeat blocks in a MakeCode-style Loops category');
assert.ok(read('js/craftom-agent-academy.js').includes('category name="Logic"'), 'Agent academy keeps condition blocks in a MakeCode-style Logic category');
assert.ok(read('js/craftom-agent-academy.js').includes("message0: 'if routeOpen is %1'"), 'Agent academy condition block is framed as a routeOpen boolean check');
assert.ok(read('js/craftom-agent-academy.js').includes('if routeOpen =='), 'Agent academy Python preview maps the condition to a boolean routeOpen check');
assert.ok(!read('js/craftom-agent-academy.js').includes('category name="Loops & Logic"'), 'Agent academy does not merge MakeCode Loops and Logic into one category');
assert.ok(read('js/craftom-agent-academy.js').includes('const hints = ['), 'Agent academy uses soft hints instead of exposing a solution chain');
assert.ok(read('js/craftom-agent-academy.js').includes("reportProgress('academy-complete'"), 'Agent academy reports full academy completion');
assert.ok(read('js/craftom-agent-academy.js').includes('completedExercises'), 'Agent academy tracks completed exercises across the lesson');
assert.ok(read('js/craftom-agent-academy.js').includes('workspace.clear();'), 'Agent academy clears old blocks before loading each exercise starter');
assert.ok(read('assets/craftom/craftom-challenges.css').includes('position: fixed'), 'Agent academy completion appears as a centered overlay');
assert.ok(!read('js/craftom-agent-academy.js').includes("academy.exercises[activeExercise]?.blocks?.join"), 'hint button does not reveal exact solution blocks');
assert.ok(read('js/craftom-minecraft-code-builder.js').includes('data-craftom-code-mode'), 'Craftom Code Builder supports code mode switching');
assert.ok(read('js/craftom-minecraft-code-builder.js').includes('player.on_chat'), 'Craftom Code Builder can generate Python-style code');
assert.ok(!read('js/craftom-minecraft-code-builder.js').includes("join('\\\\n"), 'Craftom Code Builder uses real newlines between generated code lines');
assert.ok(!read('js/craftom-minecraft-code-builder.js').includes('():\\\\n'), 'Python generated code uses real line breaks after function definitions');
assert.ok(read('js/craftom-minecraft-code-builder.js').includes('message0: \'on chat command %1\''), 'Craftom blocks use MakeCode-style English command labels');
assert.ok(read('js/craftom-minecraft-code-builder.js').includes('message0: \'agent move %1 by %2\''), 'Agent movement block label is English like MakeCode');
assert.ok(read('js/craftom-minecraft-code-builder.js').includes('category name="Loops & Logic"'), 'Blockly toolbox categories are English');
assert.ok(!read('js/craftom-minecraft-code-builder.js').includes('const [first, ...rest]'), 'Craftom starter block chains keep the intended command order');
assert.ok(!read('js/craftom-minecraft-code-builder.js').includes('message0: \'Agent זז'), 'old Hebrew movement command label is removed');
assert.ok(!read('js/craftom-minecraft-code-builder.js').includes('category name="לולאות ותנאים"'), 'old Hebrew logic category label is removed');
assert.ok(read('js/craftom-minecraft-lesson-page.js').includes('/api/craftom/exit-ticket'), 'lesson renderer posts exit tickets to the server');
assert.ok(read('server.js').includes('craftom_lesson_submissions'), 'server stores Craftom exit ticket submissions in the classroom database');
assert.ok(read('server.js').includes('getClassroomStudentFromRequest(req)'), 'server resolves Craftom submissions from the authenticated classroom session');
assert.ok(read('server.js').includes('/api/craftom/submissions'), 'server exposes authorized Craftom submission reads');
assert.ok(read('server.js').includes("pathname === '/craftom-school/preview/'"), 'server resolves Craftom preview directory URL to the home page');
assert.ok(!read('server.js').includes('craftomHeader'), 'locked Craftom pages should not include the course navigation header');
assert.ok(!read('server.js').includes('body.has-course-header'), 'locked Craftom pages should keep the login card centered without a course header');
assert.ok(read('server.js').includes("'/craftom-school/docs/craftom-submissions-summary-2026-09-10.html'"), 'Craftom change summary HTML is publicly readable');
assert.ok(read('craftom-minecraft-challenge.html').includes('program.exitUpload'), 'challenge page shows the shared photo upload requirement');
assert.ok(read('craftom-minecraft-students.html').includes('העלאת תמונה ל-Craftom'), 'student worksheet includes a Craftom photo upload field');
assert.ok(read('craftom-minecraft-slides.html').includes('program.exitUpload'), 'slides remind instructors that exit tickets include a photo upload');
assert.ok(!read('craftom-minecraft-slides.html').includes('id="backToLesson"'), 'instructor slides should not show a back-to-student-lesson button');
assert.ok(read('craftom-minecraft-slides.html').includes('id="backToTeacher"'), 'teacher-opened instructor slides include a teacher-management return button');

for (const path of [
  'craftom-minecraft-challenge.html',
  'craftom-minecraft-lesson.html',
  'js/craftom-minecraft-lesson-page.js',
]) {
  const content = read(path);
  assert.ok(!content.includes('מה המורה עושה'), `${path} does not show teacher instructions in student-facing material`);
  assert.ok(!content.includes('מצגת מדריך'), `${path} does not expose instructor slides to students`);
}
assert.ok(read('js/kugel-lesson-zero.js').includes('מצגת מדריך'), 'teacher management page keeps access to instructor slides');

console.log('craftom-minecraft-course tests passed');
