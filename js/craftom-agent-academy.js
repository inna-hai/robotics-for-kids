(function () {
  const params = new URLSearchParams(location.search);
  const lesson = window.getCraftomMinecraftLesson?.(params.get('lesson') || 1);
  const academy = lesson?.detail?.academy;
  const blocklyDiv = document.getElementById('academyBlockly');
  const pythonOutput = document.getElementById('academyPython');
  const canvas = document.getElementById('academyCanvas');
  const exerciseList = document.getElementById('academyExerciseList');
  const checksEl = document.getElementById('academyChecks');
  const feedbackEl = document.getElementById('academyFeedback');
  const progressEl = document.getElementById('academyProgress');
  const runButton = document.getElementById('academyRun');
  const resetButton = document.getElementById('academyReset');
  const hintButton = document.getElementById('academyHint');
  const completeEl = document.getElementById('academyComplete');
  const completeBackLink = document.getElementById('academyCompleteBackLink');

  if (!academy || !window.Blockly || !blocklyDiv || !pythonOutput || !canvas || !exerciseList || !checksEl || !feedbackEl) return;

  // Lessons with if routeOpen get a button that switches the road between open and blocked.
  const conditionCriteria = ['condition', 'conditionState', 'elseBranch', 'elseSay', 'repeatOrCondition', 'thenSay', 'openSays', 'blockedSays', 'openDelivers', 'openArrivalSay', 'blockedStays', 'openReaches', 'blockedReaches', 'blockedDelivers', 'blockedAvoidsBarrier', 'blockedSaysAbout'];
  const usesRouteState = (academy.exercises || []).some(exercise => (exercise.criteria || []).some(criterion => conditionCriteria.includes(criterion.type)));
  let routeToggle = null;
  if (usesRouteState) {
    canvas.insertAdjacentHTML('beforebegin', '<button type="button" class="btn secondary academy-route-toggle" id="academyRouteToggle"></button>');
    routeToggle = document.getElementById('academyRouteToggle');
  }

  // Loop exercises that count packages must place them from inside the repeat, not by copying place blocks after it.
  academy.exercises?.forEach(exercise => {
    const types = (exercise.criteria || []).map(criterion => criterion.type);
    const isLoopExercise = types.some(type => type === 'repeat' || type === 'repeatTimes');
    if (isLoopExercise && types.includes('placeCount') && !types.includes('placeInRepeat')) {
      exercise.criteria.push({ label: 'כל הנחות החבילה נמצאות בתוך ה-repeat', type: 'placeInRepeat' });
    }
  });

  // Only the switch from deliver to start is explained; other lessons keep their missions short on purpose.
  const chatCommand = academy.command || 'deliver';
  const previousLesson = Number(lesson.id) > 1 ? window.getCraftomMinecraftLesson?.(Number(lesson.id) - 1) : null;
  const previousCommand = previousLesson ? (previousLesson.detail?.academy?.command || 'deliver') : null;
  if (chatCommand === 'start' && previousCommand === 'deliver' && academy.exercises?.[0]) {
    academy.exercises[0].mission += ' מה זו פקודת start? זו המילה שבבלוק on chat command: כשכותבים start בצ׳אט של Minecraft, ה-Agent מריץ את כל הבלוקים שבתוכו. מה ההבדל מ-deliver? deliver הפעיל משלוח אחד, ו-start מפעיל קו משלוחים שחוזר שוב ושוב בעזרת repeat. מבחינת הקוד שתיהן עובדות אותו דבר, רק השם מתאר מה הקוד עושה.';
  }

  const ctx = canvas.getContext('2d');
  const defaultStart = { x: 112, y: 230 };
  const defaultStation = { x: 322, y: 230 };
  const start = academy.world?.start || defaultStart;
  const station = academy.world?.station || defaultStation;
  const routeTiles = academy.world?.routeTiles || [
    { x: start.x + 42, y: start.y },
    { x: start.x + 84, y: start.y },
    { x: start.x + 126, y: start.y },
    { x: start.x + 168, y: start.y },
    { x: station.x - 28, y: station.y },
  ];
  const cell = 42;
  // Lessons whose exercises never check the station (e.g. loop lessons that drop packages along the line) hide it,
  // so students don't think the courier missed a target.
  const stationCriteria = ['reachedStation', 'packageNearStation', 'arrivalSayAfterMove', 'openDelivers', 'openReaches', 'blockedReaches', 'blockedDelivers'];
  const showStation = (academy.exercises || []).some(exercise => (exercise.criteria || []).some(criterion => stationCriteria.includes(criterion.type)));
  let activeExercise = 0;
  let visibleMode = 'blocks';
  const completedExercises = new Set();
  let academyCompletionReported = false;
  // Every visit starts fresh: work in progress (boards), correct solutions of this visit (passed) and the board
  // each exercise started from (basis) live only in memory. Correct solutions are also kept in the browser
  // (previousSolutions) so the student can look at what they did before, but they are never loaded automatically.
  const boardsKey = `craftom-academy-solutions:${lesson?.id || 1}`;
  let previousSolutions = {};
  try { previousSolutions = JSON.parse(localStorage.getItem(boardsKey) || '{}') || {}; } catch (_) { previousSolutions = {}; }
  const savedBoards = {};
  const passedBoards = {};
  const boardBasis = {};

  // Each block keeps its English MakeCode text and gets a short Hebrew label at the end, plus a Hebrew tooltip.
  const hebrewBlockHelp = {
    mc_on_chat: ['כשכותבים בצ׳אט', 'כשכותבים את המילה הזו בצ׳אט של Minecraft, כל הבלוקים שבתוך run רצים.'],
    mc_teleport_agent: ['זימון לנקודת ההתחלה', 'מביא את ה-Agent לנקודת ההתחלה, ליד השחקן.'],
    mc_move_agent: ['תזוזה', 'מזיז את ה-Agent מספר צעדים בכיוון שבחרתם.'],
    mc_turn_agent: ['פנייה', 'מסובב את ה-Agent ימינה או שמאלה, בלי לזוז מהמקום.'],
    mc_place_agent: ['הנחת חבילה', 'down: מניח את החבילה על הרצפה מתחת ל-Agent. forward: מניח את החבילה במשבצת שמול ה-Agent.'],
    mc_say: ['הודעה בצ׳אט', 'כותב הודעה בצ׳אט של המשחק.'],
    mc_repeat: ['חזרה', 'חוזר על הבלוקים שבתוך do מספר פעמים.'],
    mc_if_route_open: ['תנאי', 'בודק אם הדרך פתוחה (true) או חסומה (false). אם התנאי נכון רץ then, ואחרת רץ else.'],
  };
  function withHebrewLabels(definitions) {
    return definitions.map(definition => {
      const help = hebrewBlockHelp[definition.type];
      if (!help) return definition;
      const args = [...(definition.args0 || [])];
      args.push({ type: 'field_label', text: `· ${help[0]}`, class: 'academy-he-label' });
      return { ...definition, message0: `${definition.message0} %${args.length}`, args0: args, tooltip: help[1] };
    });
  }

  function persistBoards() {
    try { localStorage.setItem(boardsKey, JSON.stringify(previousSolutions)); } catch (_) { /* storage full or blocked */ }
  }

  const esc = value => String(value || '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
  const commandName = text => String(text || 'run').replace(/[^A-Za-z0-9_]/g, '_') || 'run';
  const teacherReturnQuery = () => {
    if (params.get('teacherReturn') !== '1') return '';
    const next = new URLSearchParams();
    next.set('teacherReturn', '1');
    next.set('lesson', String(lesson.id));
    const classroomId = params.get('classroomId');
    if (classroomId) next.set('classroomId', classroomId);
    return next.toString();
  };
  const lessonUrl = () => {
    const suffix = teacherReturnQuery();
    return `craftom-minecraft-lesson-${lesson.id}.html${suffix ? `?${suffix}` : ''}`;
  };
  const teacherManagementUrl = () => {
    const next = new URLSearchParams();
    const classroomId = params.get('classroomId');
    if (classroomId) next.set('classroomId', classroomId);
    next.set('lesson', String(lesson.id));
    return `kugel-teacher.html?${next.toString()}`;
  };
  const renderTeacherReturnAction = () => {
    if (params.get('teacherReturn') !== '1') return;
    document.getElementById('teacherReturnAction')?.remove();
    document.body.insertAdjacentHTML('afterbegin', `
      <div class="teacher-return-action" id="teacherReturnAction">
        <a class="btn secondary" href="${teacherManagementUrl()}">חזרה לניהול שיעור מורה</a>
      </div>
    `);
  };

  document.title = `${academy.title} | ${lesson.title}`;
  document.getElementById('academyKicker').textContent = `שיעור ${lesson.id} - ${lesson.title}`;
  document.getElementById('academyTitle').textContent = academy.title;
  document.getElementById('academyStory').textContent = academy.story;
  document.getElementById('lessonBackLink').href = lessonUrl();
  if (completeBackLink) completeBackLink.href = lessonUrl();
  renderTeacherReturnAction();

  if (!window.__craftomAcademyBlocksDefined) {
    window.__craftomAcademyBlocksDefined = true;
    Blockly.defineBlocksWithJsonArray(withHebrewLabels([
      {
        type: 'mc_on_chat',
        message0: 'on chat command %1',
        args0: [{ type: 'field_input', name: 'COMMAND', text: 'deliver' }],
        message1: 'run %1',
        args1: [{ type: 'input_statement', name: 'DO' }],
        colour: 215,
        tooltip: 'המילה שכותבים בצ׳אט של Minecraft כדי להפעיל את הקוד שבתוך הבלוק.',
      },
      {
        type: 'mc_teleport_agent',
        message0: 'agent teleport to player',
        previousStatement: null,
        nextStatement: null,
        colour: 35,
      },
      {
        type: 'mc_move_agent',
        message0: 'agent move %1 by %2',
        args0: [
          { type: 'field_dropdown', name: 'DIR', options: [['forward · קדימה', 'FORWARD'], ['back · אחורה', 'BACK'], ['left · שמאלה', 'LEFT'], ['right · ימינה', 'RIGHT']] },
          { type: 'field_number', name: 'STEPS', value: 5, min: 1, max: 16 }
        ],
        previousStatement: null,
        nextStatement: null,
        colour: 35,
      },
      {
        type: 'mc_turn_agent',
        message0: 'agent turn %1',
        args0: [{ type: 'field_dropdown', name: 'TURN', options: [['left · שמאלה', 'LEFT_TURN'], ['right · ימינה', 'RIGHT_TURN']] }],
        previousStatement: null,
        nextStatement: null,
        colour: 35,
      },
      {
        type: 'mc_place_agent',
        message0: 'agent place %1',
        args0: [{ type: 'field_dropdown', name: 'DIR', options: [['down · למטה', 'DOWN'], ['forward · קדימה', 'FORWARD']] }],
        previousStatement: null,
        nextStatement: null,
        colour: 35,
        tooltip: 'down: מניח את החבילה על הרצפה מתחת ל-Agent. forward: מניח את החבילה במשבצת שמול ה-Agent.',
      },
      {
        type: 'mc_say',
        message0: 'player say %1',
        args0: [{ type: 'field_input', name: 'TEXT', text: 'המשלוח הגיע' }],
        previousStatement: null,
        nextStatement: null,
        colour: 290,
      },
      {
        type: 'mc_repeat',
        message0: 'repeat %1 times',
        args0: [{ type: 'field_number', name: 'TIMES', value: 2, min: 1, max: 8 }],
        message1: 'do %1',
        args1: [{ type: 'input_statement', name: 'DO' }],
        previousStatement: null,
        nextStatement: null,
        colour: 120,
      },
      {
        type: 'mc_if_route_open',
        message0: 'if routeOpen is %1',
        args0: [{ type: 'field_dropdown', name: 'STATE', options: [['true · פתוחה', 'OPEN'], ['false · חסומה', 'BLOCKED']] }],
        message1: 'then %1',
        args1: [{ type: 'input_statement', name: 'DO' }],
        message2: 'else %1',
        args2: [{ type: 'input_statement', name: 'ELSE' }],
        previousStatement: null,
        nextStatement: null,
        colour: 180,
      },
    ]));
  }

  function fieldXml(fields = {}) {
    return Object.entries(fields).map(([name, value]) => `<field name="${name}">${esc(value)}</field>`).join('');
  }

  function blockXml(type, fields = {}, statements = '', next = '') {
    return `<block type="${type}">${fieldXml(fields)}${statements}${next}</block>`;
  }

  function statement(name, xml) {
    return `<statement name="${name}">${xml}</statement>`;
  }

  function next(xml) {
    return `<next>${xml}</next>`;
  }

  function chain(blocks) {
    return blocks.reduceRight((tail, block) => block(tail), '');
  }

  function onChat(blocks, command = 'deliver') {
    return blockXml('mc_on_chat', { COMMAND: command }, statement('DO', chain(blocks)));
  }

  function blockFromSpec(spec = {}) {
    if (spec.type === 'teleport') return tail => blockXml('mc_teleport_agent', {}, '', next(tail));
    if (spec.type === 'move') return tail => blockXml('mc_move_agent', { DIR: spec.direction || 'FORWARD', STEPS: spec.steps || 1 }, '', next(tail));
    if (spec.type === 'turn') return tail => blockXml('mc_turn_agent', { TURN: spec.turn || 'RIGHT_TURN' }, '', next(tail));
    if (spec.type === 'place') return tail => blockXml('mc_place_agent', { DIR: spec.direction || 'DOWN' }, '', next(tail));
    if (spec.type === 'say') return tail => blockXml('mc_say', { TEXT: spec.text || '' }, '', next(tail));
    if (spec.type === 'repeat') {
      return tail => {
        const body = (spec.blocks || []).map(blockFromSpec).filter(Boolean);
        return blockXml('mc_repeat', { TIMES: spec.times || 2 }, statement('DO', chain(body)), next(tail));
      };
    }
    if (spec.type === 'ifRoute') {
      return tail => {
        const thenBody = (spec.then || []).map(blockFromSpec).filter(Boolean);
        const elseBody = (spec.else || []).map(blockFromSpec).filter(Boolean);
        return blockXml('mc_if_route_open', { STATE: spec.state || 'OPEN' }, statement('DO', chain(thenBody)) + statement('ELSE', chain(elseBody)), next(tail));
      };
    }
    return null;
  }

  const hints = [
    'פתחו את Agent וחפשו בלוק שמזמן את ה-Agent לנקודת ההתחלה.',
    'חפשו ב-Agent פקודת move. המספר המדויק מופיע במשימה, אבל צריך לגרור את הבלוק לבד.',
    'השלד כבר זז, אבל המרחק קצר מדי. נסו לשנות רק את המספר בתוך move.',
    'בדקו איפה ה-Agent נעצר ביחס לתחנה ושנו את מספר הצעדים עד שהוא מגיע קרוב.',
    'המסלול כבר כמעט עובד. חסרה פקודת הודעה מסוף ההרצה באזור Player.',
    'זו משימת דיבוג: אל תוסיפו רצף חדש, חפשו מספר אחד שגורם ל-Agent לעבור את התחנה.'
  ];

  function starterXml(index = activeExercise) {
    const exercise = academy.exercises[index];
    if (exercise?.starter?.blocks) {
      const blocks = exercise.starter.blocks.map(blockFromSpec).filter(Boolean);
      const command = exercise.starter.command || academy.command || 'deliver';
      return `<xml xmlns="https://developers.google.com/blockly/xml">${onChat(blocks, command)}</xml>`;
    }
    const starts = [
      onChat([
        tail => blockXml('mc_move_agent', { DIR: 'FORWARD', STEPS: 1 }, '', next(tail)),
      ]),
      onChat([
        tail => blockXml('mc_teleport_agent', {}, '', next(tail)),
      ]),
      onChat([
        tail => blockXml('mc_teleport_agent', {}, '', next(tail)),
        tail => blockXml('mc_move_agent', { DIR: 'FORWARD', STEPS: 3 }, '', next(tail)),
      ]),
      onChat([
        tail => blockXml('mc_teleport_agent', {}, '', next(tail)),
        tail => blockXml('mc_move_agent', { DIR: 'FORWARD', STEPS: 3 }, '', next(tail)),
      ]),
      onChat([
        tail => blockXml('mc_teleport_agent', {}, '', next(tail)),
        tail => blockXml('mc_move_agent', { DIR: 'FORWARD', STEPS: 5 }, '', next(tail)),
      ]),
      onChat([
        tail => blockXml('mc_teleport_agent', {}, '', next(tail)),
        tail => blockXml('mc_move_agent', { DIR: 'FORWARD', STEPS: 8 }, '', next(tail)),
        tail => blockXml('mc_say', { TEXT: 'delivery arrived' }, '', next(tail)),
      ]),
    ];
    return `<xml xmlns="https://developers.google.com/blockly/xml">${starts[index] || starts[0]}</xml>`;
  }

  function toolboxXml() {
    return `<xml xmlns="https://developers.google.com/blockly/xml">
      <category name="Events" colour="215"><block type="mc_on_chat"><field name="COMMAND">${esc(academy.command || 'deliver')}</field></block></category>
      <category name="Agent" colour="35">
        <block type="mc_teleport_agent"></block>
        <block type="mc_move_agent"></block>
        <block type="mc_turn_agent"></block>
        <block type="mc_place_agent"></block>
      </category>
      <category name="Loops" colour="120">
        <block type="mc_repeat"></block>
      </category>
      <category name="Logic" colour="180">
        <block type="mc_if_route_open"></block>
      </category>
      <category name="Player" colour="290"><block type="mc_say"></block></category>
    </xml>`;
  }

  const workspace = Blockly.inject('academyBlockly', {
    media: 'js/vendor/blockly/media/',
    rtl: false,
    trashcan: true,
    scrollbars: true,
    toolbox: toolboxXml(),
    zoom: { controls: true, wheel: true, startScale: .86, maxScale: 1.35, minScale: .45 },
  });

  function indent(level) {
    return '    '.repeat(level);
  }

  function chainCode(block, level = 0) {
    const lines = [];
    let current = block;
    while (current) {
      lines.push(blockCode(current, level));
      current = current.getNextBlock();
    }
    return lines.filter(Boolean).join('\n');
  }

  function statementCode(block, level) {
    return chainCode(block, level + 1) || `${indent(level + 1)}pass`;
  }

  function blockCode(block, level) {
    const i = indent(level);
    if (block.type === 'mc_on_chat') {
      const command = block.getFieldValue('COMMAND') || 'run';
      const name = commandName(command);
      return `${i}# כשכותבים "${command}" בצ׳אט, הקוד שבפנים רץ\n${i}def on_chat_${name}():\n${statementCode(block.getInputTargetBlock('DO'), level)}\n${i}player.on_chat("${command}", on_chat_${name})`;
    }
    // Each line of Python gets a short Hebrew comment, like comments in real code.
    const directionHe = { FORWARD: 'קדימה', BACK: 'אחורה', LEFT: 'שמאלה', RIGHT: 'ימינה', DOWN: 'למטה' };
    if (block.type === 'mc_teleport_agent') return `${i}agent.teleportToPlayer()  # מזמן את ה-Agent אליך`;
    if (block.type === 'mc_move_agent') {
      const steps = Number(block.getFieldValue('STEPS') || 1);
      return `${i}agent.move(${block.getFieldValue('DIR')}, ${steps})  # זז ${steps} צעדים ${directionHe[block.getFieldValue('DIR')] || ''}`;
    }
    if (block.type === 'mc_turn_agent') return `${i}agent.turn(${block.getFieldValue('TURN')})  # פונה ${block.getFieldValue('TURN') === 'LEFT_TURN' ? 'שמאלה' : 'ימינה'}`;
    if (block.type === 'mc_place_agent') return `${i}agent.place(${block.getFieldValue('DIR')})  # מניח חבילה ${directionHe[block.getFieldValue('DIR')] || ''}`;
    if (block.type === 'mc_say') return `${i}player.say("${block.getFieldValue('TEXT') || ''}")  # הודעה בצ׳אט`;
    if (block.type === 'mc_repeat') {
      const times = Number(block.getFieldValue('TIMES') || 2);
      return `${i}for count in range(${times}):  # חוזר ${times} פעמים\n${statementCode(block.getInputTargetBlock('DO'), level)}`;
    }
    if (block.type === 'mc_if_route_open') {
      const value = block.getFieldValue('STATE') === 'BLOCKED' ? 'False' : 'True';
      return `${i}if routeOpen == ${value}:  # אם הדרך ${value === 'True' ? 'פתוחה' : 'חסומה'}\n${statementCode(block.getInputTargetBlock('DO'), level)}\n${i}else:  # אחרת\n${statementCode(block.getInputTargetBlock('ELSE'), level)}`;
    }
    return '';
  }

  function workspaceCode() {
    return workspace.getTopBlocks(true).map(block => chainCode(block)).filter(Boolean).join('\n\n');
  }

  // The city's road state, switched with the button above the simulation in lessons that use if routeOpen.
  let worldRouteOpen = true;

  function defaultState(routeOpen = worldRouteOpen) {
    return {
      routeOpen,
      x: start.x,
      y: start.y,
      heading: 0,
      path: [],
      frames: [],
      packages: [],
      says: [],
      sawChat: false,
      sawTeleport: false,
      actions: [],
      moves: [],
      turns: [],
      repeats: [],
      conditions: [],
      commands: [],
    };
  }

  // A player say message stays on screen for a few frames and then disappears, so a message inside a loop
  // shows up again in each round instead of staying on forever.
  const sayBubbleFrames = 3;

  function visualSnapshot(state) {
    state.bubble = state.bubbleTtl > 0 ? state.bubbleText : null;
    state.bubbleTtl = Math.max(0, (state.bubbleTtl || 0) - 1);
    const conditionBubble = state.conditionTtl > 0 ? state.conditionBubble : null;
    state.conditionTtl = Math.max(0, (state.conditionTtl || 0) - 1);
    return {
      blockId: state.currentBlockId || null,
      conditionBubble,
      bubble: state.bubble,
      routeOpen: state.routeOpen,
      x: state.x,
      y: state.y,
      heading: state.heading,
      path: state.path.slice(),
      packages: state.packages.slice(),
      says: state.says.slice(),
    };
  }

  function applyMove(state, command) {
    const directionOffset = { FORWARD: 0, RIGHT: 90, BACK: 180, LEFT: -90 }[command.direction] || 0;
    const radians = ((state.heading + directionOffset) * Math.PI) / 180;
    const steps = Math.max(1, Number(command.steps || 1));
    const moveStart = { x: state.x, y: state.y };
    for (let stepIndex = 0; stepIndex < steps; stepIndex += 1) {
      const from = { x: state.x, y: state.y };
      state.x += Math.cos(radians) * cell;
      state.y += Math.sin(radians) * cell;
      state.x = Math.max(52, Math.min(canvas.width - 52, state.x));
      state.y = Math.max(74, Math.min(canvas.height - 52, state.y));
      state.path.push({ x1: from.x, y1: from.y, x2: state.x, y2: state.y, step: state.path.length + 1 });
      state.frames.push(visualSnapshot(state));
    }
    state.moves.push({ ...command, from: moveStart, to: { x: state.x, y: state.y } });
  }

  function hasNestedBlock(block, type) {
    let current = block;
    while (current) {
      if (current.type === type) return true;
      for (const input of current.inputList || []) {
        if (hasNestedBlock(input.connection?.targetBlock?.(), type)) return true;
      }
      current = current.getNextBlock();
    }
    return false;
  }

  function walkBlocks(block, state) {
    let current = block;
    while (current) {
      // Frames remember which block was running, so the animation can highlight it.
      state.currentBlockId = current.id;
      if (current.type === 'mc_on_chat') {
        state.sawChat = current.getFieldValue('COMMAND') === 'deliver';
        state.commands.push(current.getFieldValue('COMMAND') || '');
        state.actions.push({ type: 'chat', command: current.getFieldValue('COMMAND') || '' });
        walkBlocks(current.getInputTargetBlock('DO'), state);
      } else if (current.type === 'mc_teleport_agent') {
        state.x = start.x;
        state.y = start.y;
        state.heading = 0;
        state.sawTeleport = true;
        if ((state.repeatDepth || 0) > 0) state.teleportInRepeat = true;
        state.actions.push({ type: 'teleport' });
        state.frames.push(visualSnapshot(state));
      } else if (current.type === 'mc_move_agent') {
        const command = {
          direction: current.getFieldValue('DIR'),
          steps: Number(current.getFieldValue('STEPS') || 1),
        };
        state.actions.push({ type: 'move', ...command });
        applyMove(state, command);
      } else if (current.type === 'mc_turn_agent') {
        const turn = current.getFieldValue('TURN');
        state.heading += turn === 'LEFT_TURN' ? -90 : 90;
        state.turns.push(turn);
        state.actions.push({ type: 'turn', turn });
        state.frames.push(visualSnapshot(state));
      } else if (current.type === 'mc_place_agent') {
        // forward puts the package one cell in front of the Agent; down leaves it where the Agent stands.
        const placeDirection = current.getFieldValue('DIR');
        const placeRadians = (state.heading * Math.PI) / 180;
        const placeOffset = placeDirection === 'FORWARD' ? cell : 0;
        state.packages.push({ x: state.x + Math.cos(placeRadians) * placeOffset, y: state.y + Math.sin(placeRadians) * placeOffset, direction: placeDirection, inRepeat: (state.repeatDepth || 0) > 0 });
        state.actions.push({ type: 'place', direction: current.getFieldValue('DIR') });
        state.frames.push(visualSnapshot(state));
      } else if (current.type === 'mc_say') {
        state.says.push(current.getFieldValue('TEXT') || '');
        state.bubbleText = current.getFieldValue('TEXT') || '';
        state.bubbleTtl = sayBubbleFrames;
        state.actions.push({ type: 'say', text: current.getFieldValue('TEXT') || '', inRepeat: (state.repeatDepth || 0) > 0 });
        state.frames.push(visualSnapshot(state));
      } else if (current.type === 'mc_repeat') {
        const times = Math.max(1, Number(current.getFieldValue('TIMES') || 1));
        state.repeats.push(times);
        state.actions.push({ type: 'repeat', times });
        state.repeatDepth = (state.repeatDepth || 0) + 1;
        for (let index = 0; index < times; index += 1) {
          state.currentBlockId = current.id;
          state.frames.push(visualSnapshot(state));
          walkBlocks(current.getInputTargetBlock('DO'), state);
        }
        state.repeatDepth -= 1;
      } else if (current.type === 'mc_if_route_open') {
        const routeState = current.getFieldValue('STATE') || 'OPEN';
        const hasElse = Boolean(current.getInputTargetBlock('ELSE'));
        const elseHasSay = hasNestedBlock(current.getInputTargetBlock('ELSE'), 'mc_say');
        const thenHasSay = hasNestedBlock(current.getInputTargetBlock('DO'), 'mc_say');
        state.conditions.push({ state: routeState, hasElse, elseHasSay, thenHasSay });
        state.actions.push({ type: 'condition', state: routeState, hasElse });
        // "routeOpen is true" holds when the road is open; "is false" holds when it is blocked.
        const conditionHolds = (routeState === 'OPEN') === (state.routeOpen !== false);
        // Pause on the condition with a bubble that shows what it read and which branch runs.
        state.conditionBubble = {
          reading: `routeOpen = ${state.routeOpen !== false ? 'true' : 'false'}`,
          decision: conditionHolds ? 'התנאי נכון ← מתבצע then' : 'התנאי לא נכון ← מתבצע else',
          holds: conditionHolds,
        };
        state.conditionTtl = 4;
        for (let pause = 0; pause < 3; pause += 1) state.frames.push(visualSnapshot(state));
        walkBlocks(current.getInputTargetBlock(conditionHolds ? 'DO' : 'ELSE'), state);
      }
      current = current.getNextBlock();
    }
  }

  function runProgram(routeOpen = worldRouteOpen) {
    const state = defaultState(routeOpen);
    workspace.getTopBlocks(true).forEach(block => walkBlocks(block, state));
    return state;
  }

  function isNear(point, target, radius = 46) {
    return Math.hypot(point.x - target.x, point.y - target.y) <= radius;
  }

  // A success/delivery message is checked by meaning, not exact text: it must say something positive about
  // arriving, delivering or succeeding, and must not be negative ("לא הצלחתי", "failed").
  const successWords = new RegExp([
    // Hebrew: arrival, delivery, reporting, finishing, success, thanks, praise and positive wishes
    'הגיע', 'הגעת', 'הגענו', 'הגעה', 'נמסר', 'מסרתי', 'מסרנו', 'מסירה', 'משלוח', 'חבילה', 'חבילות', 'נשלח', 'שלחנו', 'סופק', 'הובל',
    'דווח', 'דיווח', 'הודענו', 'הודעתי', 'הצלח', 'בהצלחה', 'מוצלח', 'הושלם', 'השלמנו', 'מושלם', 'סיים', 'סיום', 'הסתיים', 'נגמר', 'גמרנו', 'גמרתי',
    'מוכן', 'בוצע', 'ביצעתי', 'ביצענו', 'עבד', 'עובד', 'פועל', 'הכל טוב', 'הכול טוב', 'טוב מאוד', 'בדרך', 'יצא', 'יצאנו',
    'תודה', 'תהנ', 'בתאבון', 'כל הכבוד', 'מעולה', 'מצוין', 'נהדר', 'נפלא', 'יופי', 'אחלה', 'סבבה', 'הידד', 'יש!', 'ניצחנו', 'אלוף', 'אלופ', 'וואו', 'סחתיין', 'כיף', 'שמח',
    'ברוך הבא', 'ברוכים הבאים',
    // English
    'arriv', '\\bhere\\b', 'deliver', 'sent', 'shipped', 'report', 'success', 'succeed', 'complete', 'done', 'finish', 'ready', 'work', 'mission',
    'thank', 'enjoy', 'great', 'good', 'awesome', 'amazing', 'cool', 'wow', 'yay', 'hooray', 'welcome', 'well done', 'nice', 'perfect', 'win', 'happy', '\\bok\\b', '\\byes\\b',
    // Positive emoji
    '✅', '✔', '🎉', '👍', '🥳', '😀', '😃', '😊', '📦', '🚚', '⭐', '🏆'
  ].join('|'), 'iu');
  const negativeWords = /((^|[\s,.!?])(לא|אין|בלי)(?=[\s,.!?]|$)|נכשל|כישלון|שגיאה|תקלה|נתקע|אבד|הלך לאיבוד|fail|error|\bnot\b|n't|\bno\b|\bnever\b|lost|stuck|wrong|problem)/i;
  // An opening / planning message: it says what is about to happen (starting, planning, marking, the city, the delivery).
  const openingWords = /(מתחיל|מתחילים|נתחיל|התחלה|יוצא|יוצאים|נצא|מוכן|מוכנים|תוכנית|מתכנן|מתכננים|נתכנן|תכנון|מסמן|מסמנים|נסמן|סימון|מפה|ממפים|מערכת|מערכות|עיר|בונים|נבנה|בנייה|הולכים|להניח|מניח|מניחים|נניח|חבילה|חבילות|תחנה|לנסוע|נוסע|נוסעים|ניסע|להגיע|נגיע|לסמן|בודק|בודקים|נבדוק|start|begin|plan|ready|map|city|system|build|let'?s|deliver|going to|check)/i;
  function isOpeningMessage(text) {
    const value = String(text || '').trim();
    // A message that reports the end ("arrived", "delivered") is not an opening.
    return value.length > 1 && openingWords.test(value) && !/((^|[^ל])הגיע|נמסר|הסתיים|arrived|delivered|finished)/i.test(value);
  }
  // A message for the open road: it says the road is open or that the courier goes on.
  const openRoadWords = /(פתוח|פתוחה|פנוי|פנויה|אפשר לעבור|עוברים|עובר|נוסע|נוסעים|יוצא|יוצאים|ממשיך|ממשיכים|בדרך|open|clear|go|drive|pass|on my way)/i;
  function isOpenRoadMessage(text) {
    const value = String(text || '').trim();
    return value.length > 1 && openRoadWords.test(value) && !/(לא פתוח|חסומ|closed|blocked)/i.test(value);
  }

  // A message about the blocked road: it mentions the block, waiting, stopping or taking another way.
  const blockedWords = /(חסו|חסימ|סגור|נסגר|מחסום|ממתינ|ממתין|מחכ|המתנ|עוקפ|עוקף|עקיפ|דרך אחרת|דרך חלופית|מסלול חלופי|מסלול אחר|חוזר|חוזרים|חזרה|נשאר|נשארים|אי אפשר|לא ניתן|לא אפשר|לא פתוח|לא פתוחה|תקוע|עוצר|עצירה|block|closed|wait|detour|another way|other way|around|stop|go back|return|stay|can't|cannot|not open)/i;
  function isBlockedMessage(text) {
    return blockedWords.test(String(text || '').trim());
  }

  function isSuccessMessage(text) {
    const value = String(text || '').trim();
    return value.length > 0 && successWords.test(value) && !negativeWords.test(value);
  }

  // A move matches when the step count is right and it goes the intended way. Another direction also counts
  // if it brings the Agent closer to the station (e.g. "turn left" + "move back" instead of "turn right" + "move forward").
  function moveMatches(move, criterion) {
    if (!move || move.steps !== Number(criterion.steps)) return false;
    if (move.direction === (criterion.direction || 'FORWARD')) return true;
    return Math.hypot(move.to.x - station.x, move.to.y - station.y) < Math.hypot(move.from.x - station.x, move.from.y - station.y) - 1;
  }

  // Advanced exercises can mark delivery points along the line, given in steps from the warehouse.
  function dropPointPositions() {
    // A number is steps east of the warehouse; [dx, dy] is a cell offset (negative dy is up).
    return (academy.exercises[activeExercise]?.dropPoints || []).map(point => Array.isArray(point)
      ? { x: start.x + point[0] * cell, y: start.y + point[1] * cell }
      : { x: start.x + point * cell, y: start.y });
  }

  function criterionPass(state, criterion) {
    const firstMove = state.moves[0];
    const secondMove = state.moves[1];
    const firstMoveAction = state.actions.findIndex(action => action.type === 'move');
    const firstTurnAction = state.actions.findIndex(action => action.type === 'turn');
    const reachedStation = isNear(state, station, criterion.radius || 74);
    const hasArrivalSay = state.says.some(isSuccessMessage);
    const hasPackageNearStation = state.packages.some(pkg => isNear(pkg, station, criterion.radius || 52));
    const hasReturnToStart = isNear(state, start, criterion.radius || 52);

    if (criterion.type === 'chatDeliver') return state.sawChat;
    if (criterion.type === 'command') return state.commands.includes(criterion.command || academy.command || 'deliver');
    if (criterion.type === 'teleport') return state.sawTeleport;
    if (criterion.type === 'moveCount') return state.moves.length >= Number(criterion.min || 1);
    if (criterion.type === 'firstMove') return moveMatches(firstMove, criterion);
    if (criterion.type === 'secondMove') return moveMatches(secondMove, criterion);
    if (criterion.type === 'anyMove') return state.moves.some(move => moveMatches(move, criterion));
    if (criterion.type === 'turn') return criterion.turn ? state.turns.includes(criterion.turn) : state.turns.length > 0;
    if (criterion.type === 'repeat') return state.repeats.length > 0;
    if (criterion.type === 'repeatTimes') return state.repeats.some(times => times === Number(criterion.times || 2));
    if (criterion.type === 'condition') return state.conditions.length > 0;
    if (criterion.type === 'repeatOrCondition') return state.repeats.length > 0 || state.conditions.length > 0;
    if (criterion.type === 'conditionState') return state.conditions.some(condition => condition.state === (criterion.state || 'OPEN'));
    if (criterion.type === 'elseBranch') return state.conditions.some(condition => condition.hasElse);
    if (criterion.type === 'elseSay') return state.conditions.some(condition => condition.elseHasSay);
    if (criterion.type === 'moveBeforeTurn') return firstMoveAction > -1 && firstTurnAction > -1 && firstMoveAction < firstTurnAction;
    if (criterion.type === 'turnBeforeSecondMove') {
      const moveActions = state.actions.map((action, index) => action.type === 'move' ? index : -1).filter(index => index > -1);
      return firstTurnAction > -1 && moveActions.length > 1 && firstTurnAction < moveActions[1];
    }
    if (criterion.type === 'reachedStation') return reachedStation;
    if (criterion.type === 'place') return state.packages.length > 0;
    if (criterion.type === 'placeDirection') return state.packages.some(pkg => pkg.direction === (criterion.direction || 'DOWN'));
    if (criterion.type === 'packageNearStation') return hasPackageNearStation;
    if (criterion.type === 'thenSay') return state.conditions.some(condition => condition.thenHasSay);
    if (criterion.type === 'openSays') return runProgram(true).says.some(isOpenRoadMessage);
    if (criterion.type === 'openingSay') return state.says.some(isOpeningMessage);
    if (criterion.type === 'blockedSaysAbout') return runProgram(false).says.some(isBlockedMessage);
    if (criterion.type === 'blockedSays') return runProgram(false).says.some(isBlockedMessage);
    if (criterion.type === 'openArrivalSay') return runProgram(true).says.some(isSuccessMessage);
    if (criterion.type === 'openReaches') return isNear(runProgram(true), station, criterion.radius || 52);
    if (criterion.type === 'blockedReaches') return isNear(runProgram(false), station, criterion.radius || 52);
    if (criterion.type === 'blockedDelivers') return runProgram(false).packages.some(pkg => isNear(pkg, station, criterion.radius || 52));
    if (criterion.type === 'blockedAvoidsBarrier') {
      // The barrier stands on the road two and a half cells east of the warehouse.
      const barrierX = start.x + cell * 2.5;
      return !runProgram(false).path.some(segment => Math.abs(segment.y1 - start.y) < 4 && Math.abs(segment.y2 - start.y) < 4
        && Math.min(segment.x1, segment.x2) < barrierX && Math.max(segment.x1, segment.x2) > barrierX);
    }
    if (criterion.type === 'openDelivers') return runProgram(true).packages.some(pkg => isNear(pkg, station, criterion.radius || 52));
    if (criterion.type === 'blockedStays') {
      const blocked = runProgram(false);
      return isNear(blocked, start, 20) && blocked.packages.length === 0;
    }
    if (criterion.type === 'sayAfterLoop') {
      // A success message outside any loop, placed after the last loop has finished.
      const lastRepeat = state.actions.map(action => action.type).lastIndexOf('repeat');
      return lastRepeat > -1 && state.actions.some((action, index) => index > lastRepeat && action.type === 'say' && !action.inRepeat && isSuccessMessage(action.text));
    }
    if (criterion.type === 'endsWithSay') {
      const last = state.actions[state.actions.length - 1];
      return state.says.length > 1 && last?.type === 'say' && (isSuccessMessage(last.text) || isOpeningMessage(last.text));
    }
    if (criterion.type === 'maxBlocks') return workspace.getAllBlocks(false).length <= Number(criterion.max);
    if (criterion.type === 'sayCount') return state.says.filter(isSuccessMessage).length >= Number(criterion.min || 1);
    if (criterion.type === 'placeBlockCount') return workspace.getAllBlocks(false).filter(block => block.type === 'mc_place_agent').length <= Number(criterion.max || 1);
    if (criterion.type === 'endsAtCell') {
      const facing = ((state.heading % 360) + 360) % 360;
      return isNear(state, { x: start.x + criterion.dx * cell, y: start.y + criterion.dy * cell }, 12)
        && (criterion.heading === undefined || facing === criterion.heading);
    }
    if (criterion.type === 'packagesAtCell') {
      const target = { x: start.x + criterion.dx * cell, y: start.y + criterion.dy * cell };
      return state.packages.length >= Number(criterion.min || 1) && state.packages.every(pkg => isNear(pkg, target, 18));
    }
    if (criterion.type === 'packageAtCell') return state.packages.some(pkg => isNear(pkg, { x: start.x + criterion.dx * cell, y: start.y + criterion.dy * cell }, 18));
    if (criterion.type === 'onDropPoints') {
      const points = dropPointPositions();
      return points.length > 0 && state.packages.length === points.length
        && points.every(point => state.packages.some(pkg => isNear(pkg, point, 18)))
        && state.packages.every(pkg => points.some(point => isNear(pkg, point, 18)));
    }
    if (criterion.type === 'teleportOutsideRepeat') return state.sawTeleport && !state.teleportInRepeat;
    if (criterion.type === 'placeInRepeat') return state.packages.length > 0 && state.packages.every(pkg => pkg.inRepeat);
    if (criterion.type === 'singlePackage') return state.packages.length === 1;
    if (criterion.type === 'placeCount') return state.packages.length >= Number(criterion.min || 1);
    if (criterion.type === 'returnToStart') return hasReturnToStart;
    if (criterion.type === 'say') return state.says.some(text => String(text || '').trim().length > 0);
    if (criterion.type === 'arrivalSay') return hasArrivalSay;
    if (criterion.type === 'arrivalSayAfterMove') {
      const lastMoveAction = state.actions.map(action => action.type).lastIndexOf('move');
      return lastMoveAction > -1 && state.actions.some((action, index) => index > lastMoveAction && action.type === 'say' && isSuccessMessage(action.text));
    }
    if (criterion.type === 'staysOnStartRow') return Math.abs(state.y - start.y) < Number(criterion.maxDelta || 8);
    return false;
  }

  function evaluate(state) {
    const exercise = academy.exercises[activeExercise];
    if (exercise?.criteria?.length) {
      return exercise.criteria.map(criterion => ({ label: criterion.label, pass: criterionPass(state, criterion) }));
    }
    const firstMove = state.moves[0];
    const reachedStation = isNear(state, station, 74);
    const hasArrivalSay = state.says.some(isSuccessMessage);
    const criteria = [
      [
        ['פקודת deliver קיימת', state.sawChat],
        ['ה-Agent מזומן לנקודת ההתחלה', state.sawTeleport],
      ],
      [
        ['יש פקודת move', state.moves.length > 0],
        ['הצעד הראשון הוא 3', firstMove?.direction === 'FORWARD' && firstMove.steps === 3],
      ],
      [
        ['שיניתם את מספר הצעדים', firstMove?.steps >= 5],
        ['ה-Agent נשאר על השביל', Math.abs(state.y - start.y) < 8],
      ],
      [
        ['ה-Agent מגיע לתחנת היעד', reachedStation],
        ['המסלול עדיין מתחיל מ-deliver', state.sawChat && state.sawTeleport],
      ],
      [
        ['יש הודעת player say', state.says.length > 0],
        ['ההודעה מסבירה שהמשלוח הגיע', hasArrivalSay],
      ],
      [
        ['מספר התנועה תוקן ל-5', state.moves.some(move => move.direction === 'FORWARD' && move.steps === 5)],
        ['אחרי התיקון ה-Agent מגיע קרוב לתחנה', reachedStation],
      ],
    ][activeExercise] || [];
    return criteria.map(([label, pass]) => ({ label, pass: Boolean(pass) }));
  }

  function drawBlock(x, y, w, h, topColor, sideColor, depth = 9, stroke = 'rgba(15, 23, 42, .22)') {
    ctx.fillStyle = sideColor;
    ctx.fillRect(x, y + depth, w, h);
    ctx.fillStyle = topColor;
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h);
    ctx.beginPath();
    ctx.moveTo(x, y + h);
    ctx.lineTo(x, y + h + depth);
    ctx.lineTo(x + w, y + h + depth);
    ctx.lineTo(x + w, y + h);
    ctx.stroke();
  }

  function drawPixelGrass() {
    ctx.fillStyle = '#5f9f3b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let x = -10; x < canvas.width; x += cell) {
      for (let y = -8; y < canvas.height; y += cell) {
        const alt = ((x / cell) + (y / cell)) % 2 === 0;
        ctx.fillStyle = alt ? '#69ad43' : '#579438';
        ctx.fillRect(x, y, cell, cell);
        ctx.strokeStyle = 'rgba(29, 78, 41, .25)';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, cell, cell);
      }
    }

    [
      { x: 492, y: 35, w: 88, h: 132 },
      { x: 18, y: 310, w: 132, h: 58 },
    ].forEach(water => {
      drawBlock(water.x, water.y, water.w, water.h, '#1d8fd1', '#12669d', 7, 'rgba(12, 74, 110, .42)');
      ctx.fillStyle = 'rgba(191, 219, 254, .42)';
      for (let i = 0; i < water.w; i += 24) ctx.fillRect(water.x + i + 6, water.y + 18, 13, 4);
    });
  }

  function drawCobbleTile(x, y, w = 40, h = 32) {
    drawBlock(x - w / 2, y - h / 2, w, h, '#a8b0b6', '#717b85', 8, '#48515a');
    ctx.strokeStyle = 'rgba(55, 65, 81, .35)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x - w / 2 + 12, y - h / 2);
    ctx.lineTo(x - w / 2 + 12, y + h / 2);
    ctx.moveTo(x + 4, y - h / 2);
    ctx.lineTo(x + 4, y + h / 2);
    ctx.moveTo(x - w / 2, y - 1);
    ctx.lineTo(x + w / 2, y - 1);
    ctx.stroke();
  }

  function drawWoodCrate(x, y, w = 86, h = 68) {
    drawBlock(x - w / 2, y - h / 2, w, h, '#b8792b', '#7c4a18', 12, '#5f3712');
    ctx.strokeStyle = 'rgba(95, 55, 18, .75)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x - w / 2 + 14, y - h / 2);
    ctx.lineTo(x - w / 2 + 14, y + h / 2);
    ctx.moveTo(x + w / 2 - 14, y - h / 2);
    ctx.lineTo(x + w / 2 - 14, y + h / 2);
    ctx.moveTo(x - w / 2, y - h / 2 + 20);
    ctx.lineTo(x + w / 2, y - h / 2 + 20);
    ctx.stroke();
  }

  function drawStationBlock(x, y) {
    drawBlock(x - 50, y - 42, 100, 78, '#ded6c0', '#9b8c6d', 13, '#66543a');
    drawBlock(x - 38, y - 56, 76, 20, '#7c2d12', '#451a03', 8, '#451a03');
    ctx.fillStyle = '#362617';
    ctx.fillRect(x - 10, y + 6, 20, 30);
    ctx.fillStyle = '#60a5fa';
    ctx.fillRect(x - 35, y - 19, 18, 16);
    ctx.fillRect(x + 18, y - 19, 18, 16);
    ctx.fillStyle = '#fef3c7';
    ctx.strokeStyle = '#5f3712';
    ctx.lineWidth = 2;
    ctx.roundRect(x - 46, y - 84, 92, 36, 7);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#422006';
    ctx.font = '900 24px Rubik, Arial';
    ctx.textAlign = 'center';
    ctx.fillText('תחנה', x, y - 57);
  }

  function roundedBox(x, y, w, h, r, fill, stroke) {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
    ctx.fillStyle = fill;
    ctx.fill();
    if (stroke) {
      ctx.strokeStyle = stroke;
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }

  // The courier rides upright on a motorbike; its heading is shown by where it looks and an arrow on the ground.
  function drawAgent(state) {
    const radians = (state.heading * Math.PI) / 180;
    const lookX = Math.round(Math.cos(radians) * 2);
    const lookY = Math.round(Math.sin(radians) * 2);
    const facingLeft = Math.cos(radians) < -0.5;
    ctx.save();
    ctx.translate(state.x, state.y);

    // ground shadow and heading arrow
    ctx.fillStyle = 'rgba(15, 23, 42, .28)';
    ctx.beginPath();
    ctx.ellipse(0, 31, 24, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.save();
    ctx.translate(Math.cos(radians) * 30, 31 + Math.sin(radians) * 12);
    ctx.rotate(radians);
    ctx.fillStyle = '#facc15';
    ctx.strokeStyle = '#713f12';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(7, 0);
    ctx.lineTo(-5, -6);
    ctx.lineTo(-2, 0);
    ctx.lineTo(-5, 6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    if (facingLeft) ctx.scale(-1, 1);

    // motorbike: wheels, frame, delivery box and headlight (side view, facing right)
    function wheel(cx) {
      ctx.fillStyle = '#111827';
      ctx.beginPath();
      ctx.arc(cx, 21, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#9ca3af';
      ctx.beginPath();
      ctx.arc(cx, 21, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }
    wheel(-17);
    wheel(18);
    ctx.fillStyle = '#dc2626';
    ctx.strokeStyle = '#7f1d1d';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-22, 12);
    ctx.lineTo(-8, 10);
    ctx.lineTo(10, 10);
    ctx.lineTo(19, 0);
    ctx.lineTo(23, 3);
    ctx.lineTo(18, 16);
    ctx.lineTo(-16, 17);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    roundedBox(-12, 4, 18, 6, 3, '#1f2937', '#111827');
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(19, 0);
    ctx.lineTo(16, -10);
    ctx.lineTo(11, -12);
    ctx.stroke();
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(23, 5, 3, 0, Math.PI * 2);
    ctx.fill();

    // delivery box on the back
    roundedBox(-30, -10, 17, 17, 3, '#f59e0b', '#78350f');
    ctx.strokeStyle = '#fde68a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-21.5, -10);
    ctx.lineTo(-21.5, 7);
    ctx.stroke();

    // rider: leg, vest, arm to the handlebar
    ctx.strokeStyle = '#1e3a8a';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(-3, 6);
    ctx.lineTo(6, 8);
    ctx.lineTo(7, 16);
    ctx.stroke();
    roundedBox(-11, -16, 17, 23, 6, '#f97316', '#9a3412');
    ctx.fillStyle = '#fff7ed';
    ctx.beginPath();
    ctx.arc(-1, -6, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#c2410c';
    ctx.font = '900 5px Rubik, Arial';
    ctx.textAlign = 'center';
    ctx.fillText('A', -1, -4);
    ctx.strokeStyle = '#f3c69c';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(2, -11);
    ctx.lineTo(11, -11);
    ctx.stroke();

    // head with skin-tone face and courier cap
    ctx.fillStyle = '#f3c69c';
    ctx.strokeStyle = '#a16207';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(-1, -26, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#e8b083';
    ctx.beginPath();
    ctx.arc(-10, -25, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#dc2626';
    ctx.strokeStyle = '#7f1d1d';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-11, -28);
    ctx.quadraticCurveTo(-10, -39, -1, -39);
    ctx.quadraticCurveTo(9, -39, 9, -28);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    roundedBox(4, -31, 11, 4, 2, '#b91c1c', '#7f1d1d');
    ctx.fillStyle = '#fde047';
    ctx.beginPath();
    ctx.arc(-3, -34, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(4, -24, 3, 3.3, 0, 0, Math.PI * 2);
    ctx.fill();
    const pupilX = facingLeft ? -lookX : lookX;
    ctx.fillStyle = '#1f2937';
    ctx.beginPath();
    ctx.arc(4 + pupilX * 0.6, -24 + lookY * 0.6, 1.7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(244, 114, 182, .5)';
    ctx.beginPath();
    ctx.ellipse(3, -19, 2.5, 1.6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#7c2d12';
    ctx.lineWidth = 1.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(6, -19, 2.5, 0.1 * Math.PI, 0.7 * Math.PI);
    ctx.stroke();

    ctx.restore();
  }

  // Aerial (top-down) view of an automatic boom gate. The post stands beside the road (north side).
  // Closed (lift 0): the arm lies across the road. Open (lift 1): the arm is raised, so from above it looks
  // short and casts a long shadow on the ground.
  const gateClosedAngle = 0;
  const gateOpenAngle = 1;
  let gateAngle = gateOpenAngle;
  let gateAnimating = false;

  function drawBoomGate(lift, blocked) {
    const pivotX = start.x + cell * 2.5;
    const pivotY = start.y - 24;
    const armLength = 50;
    const raise = lift * Math.PI / 2;
    const projected = Math.max(8, armLength * Math.cos(raise));
    const shadowLength = armLength * Math.sin(raise) * 0.75;
    // shadow of the raised arm, cast toward the bottom right
    if (shadowLength > 1) {
      ctx.save();
      ctx.translate(pivotX + 3, pivotY + 3);
      ctx.rotate(Math.PI / 4);
      ctx.fillStyle = 'rgba(15, 23, 42, .25)';
      ctx.fillRect(0, -3, shadowLength, 6);
      ctx.restore();
    }
    // the arm seen from above
    ctx.save();
    ctx.translate(pivotX, pivotY);
    ctx.rotate(Math.PI / 2);
    if (projected > 1) {
      ctx.fillStyle = 'rgba(15, 23, 42, .25)';
      ctx.fillRect(3, -1, projected, 7);
      const stripes = 6;
      for (let stripe = 0; stripe < stripes; stripe += 1) {
        ctx.fillStyle = stripe % 2 ? '#ffffff' : '#dc2626';
        ctx.fillRect(stripe * (projected / stripes), -3.5, projected / stripes, 7);
      }
      ctx.strokeStyle = '#7f1d1d';
      ctx.lineWidth = 1.2;
      ctx.strokeRect(0, -3.5, projected, 7);
    }
    ctx.restore();
    // the post housing seen from above, with its shadow and status light
    ctx.fillStyle = 'rgba(15, 23, 42, .3)';
    ctx.fillRect(pivotX - 6, pivotY - 6, 16, 16);
    ctx.fillStyle = '#64748b';
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(pivotX - 9, pivotY - 9, 16, 16, 3);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = blocked ? '#ef4444' : '#22c55e';
    ctx.beginPath();
    ctx.arc(pivotX - 1, pivotY - 1, 3.5, 0, Math.PI * 2);
    ctx.fill();
    if (blocked && !gateAnimating) {
      ctx.fillStyle = '#7f1d1d';
      ctx.font = '900 22px Rubik, Arial';
      ctx.textAlign = 'center';
      ctx.fillText('דרך חסומה', pivotX, start.y + 48);
    }
  }

  // Bubble above the boom gate: what the if read, and which branch it chose.
  function drawConditionBubble(bubble) {
    const x = start.x + cell * 2.5;
    const y = Math.max(6, start.y - 168);
    const width = 310;
    const height = 78;
    ctx.fillStyle = 'rgba(15, 23, 42, .92)';
    ctx.strokeStyle = bubble.holds ? '#22c55e' : '#f97316';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(x - width / 2, y, width, height, 8);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x - 6, y + height);
    ctx.lineTo(x, y + height + 8);
    ctx.lineTo(x + 6, y + height);
    ctx.closePath();
    ctx.fillStyle = 'rgba(15, 23, 42, .92)';
    ctx.fill();
    ctx.textAlign = 'center';
    ctx.fillStyle = '#e2e8f0';
    ctx.font = '800 22px ui-monospace, Menlo, monospace';
    ctx.direction = 'ltr';
    ctx.fillText(bubble.reading, x, y + 30);
    ctx.direction = 'rtl';
    ctx.fillStyle = bubble.holds ? '#86efac' : '#fdba74';
    ctx.font = '900 22px Rubik, Arial';
    ctx.fillText(bubble.decision, x, y + 63);
    ctx.direction = 'inherit';
  }

  function animateGate(targetAngle) {
    const from = gateAngle;
    const startedAt = performance.now();
    gateAnimating = true;
    function step(now) {
      const t = Math.min(1, (now - startedAt) / 500);
      gateAngle = from + (targetAngle - from) * (1 - Math.pow(1 - t, 3));
      drawWorld();
      if (t < 1) {
        requestAnimationFrame(step);
        return;
      }
      gateAnimating = false;
      drawWorld();
    }
    requestAnimationFrame(step);
  }

  function drawWorld(state = defaultState()) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPixelGrass();

    ctx.fillStyle = 'rgba(15, 23, 42, .22)';
    ctx.fillRect(34, 32, canvas.width - 68, canvas.height - 64);
    ctx.strokeStyle = 'rgba(219, 234, 254, .32)';
    ctx.lineWidth = 2;
    ctx.strokeRect(34, 32, canvas.width - 68, canvas.height - 64);

    // The stone path leads to the station, so it is hidden together with it.
    if (showStation && !academy.world?.hidePath) routeTiles.forEach(tile => drawCobbleTile(tile.x, tile.y, tile.w || 34, tile.h || 28));

    drawWoodCrate(start.x, start.y + 4, 92, 74);
    ctx.fillStyle = '#fff7ed';
    ctx.strokeStyle = '#5f3712';
    ctx.lineWidth = 2;
    ctx.roundRect(start.x - 46, start.y - 80, 92, 36, 7);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#422006';
    ctx.font = '900 24px Rubik, Arial';
    ctx.textAlign = 'center';
    ctx.fillText('מחסן', start.x, start.y - 53);

    if (showStation) drawStationBlock(station.x, station.y);

    // Road-state lessons show an automatic boom gate on the road: the arm lies across the road when blocked and
    // is raised upright when open. Switching the road animates the arm.
    if (usesRouteState && state.conditionBubble) drawConditionBubble(state.conditionBubble);
    if (usesRouteState) drawBoomGate(gateAnimating ? gateAngle : (state.routeOpen === false ? gateClosedAngle : gateOpenAngle), state.routeOpen === false);

    dropPointPositions().forEach((point, index) => {
      ctx.fillStyle = 'rgba(250, 204, 21, .35)';
      ctx.strokeStyle = '#ca8a04';
      ctx.lineWidth = 3;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.roundRect(point.x - 19, point.y - 19, 38, 38, 8);
      ctx.fill();
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#713f12';
      ctx.font = '900 19px Rubik, Arial';
      ctx.textAlign = 'center';
      if (!(showStation && isNear(point, station, 20))) ctx.fillText(`${academy.dropPointLabel || 'מסירה'} ${index + 1}`, point.x, point.y - 25);
    });

    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    state.path.forEach(segment => {
      ctx.beginPath();
      ctx.moveTo(segment.x1, segment.y1);
      ctx.lineTo(segment.x2, segment.y2);
      ctx.stroke();
    });
    state.path.forEach((segment, index) => {
      const markerSize = 26;
      ctx.fillStyle = '#fde047';
      ctx.strokeStyle = '#713f12';
      ctx.lineWidth = 2;
      ctx.fillRect(segment.x2 - markerSize / 2, segment.y2 - markerSize / 2, markerSize, markerSize);
      ctx.strokeRect(segment.x2 - markerSize / 2, segment.y2 - markerSize / 2, markerSize, markerSize);
      ctx.fillStyle = '#422006';
      ctx.font = '900 18px Rubik, Arial';
      ctx.textAlign = 'center';
      ctx.fillText(String(index + 1), segment.x2, segment.y2 + 6);
    });

    function drawPackage(pkg) {
      drawBlock(pkg.x - 14, pkg.y - 18, 28, 26, '#f59e0b', '#92400e', 7, '#78350f');
      ctx.strokeStyle = '#78350f';
      ctx.beginPath();
      ctx.moveTo(pkg.x, pkg.y - 18);
      ctx.lineTo(pkg.x, pkg.y + 8);
      ctx.moveTo(pkg.x - 14, pkg.y - 5);
      ctx.lineTo(pkg.x + 14, pkg.y - 5);
      ctx.stroke();
    }

    // forward packages sit on their own cell; packages placed down are drawn small at the Agent's feet
    // after the Agent, so they stay visible instead of hiding under it.
    state.packages.filter(pkg => pkg.direction === 'FORWARD').forEach(drawPackage);
    drawAgent(state);
    state.packages.filter(pkg => pkg.direction !== 'FORWARD').forEach(pkg => {
      ctx.save();
      ctx.translate(pkg.x + 14, pkg.y + 16);
      ctx.scale(0.62, 0.62);
      drawPackage({ x: 0, y: 0 });
      ctx.restore();
    });

    if (state.bubble) {
      const text = state.bubble;
      ctx.fillStyle = 'rgba(15, 23, 42, .92)';
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(164, 18, 440, 74, 10);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#f8fafc';
      ctx.font = '900 27px Rubik, Arial';
      ctx.textAlign = 'center';
      ctx.fillText(text, 384, 64);
    }
  }

  function renderExercises() {
    exerciseList.innerHTML = academy.exercises.map((exercise, index) => `
      <button type="button" class="${index === activeExercise ? 'active' : ''}${completedExercises.has(index) ? ' done' : ''}" data-academy-exercise="${index}">
        <span>${index + 1}</span>
        <strong>${esc(exercise.title)}</strong>
        <small>${esc(exercise.mission)}</small>
        ${previousSolutions[index] && !completedExercises.has(index) ? '<em class="academy-done-before">✓ בוצע בעבר</em>' : ''}
      </button>
    `).join('');
    exerciseList.querySelectorAll('[data-academy-exercise]').forEach(button => {
      button.addEventListener('click', () => {
        const target = Number(button.dataset.academyExercise || 0);
        if (target === activeExercise) return;
        saveBoard();
        activeExercise = target;
        openExercise();
      });
    });
  }

  function reportProgress(activityId, metadata = {}) {
    window.dispatchEvent(new CustomEvent('hai:classroom-progress', {
      detail: {
        lessonId: String(lesson.id),
        activityId,
        status: 'completed',
        score: 100,
        metadata
      }
    }));
  }

  function renderAcademyCompletion() {
    const doneCount = completedExercises.size;
    const total = academy.exercises.length;
    progressEl.textContent = `הושלמו ${doneCount} מתוך ${total} תרגילים`;
    if (!completeEl) return;
    const allDone = total > 0 && doneCount >= total;
    // The completion window opens once, when the last exercise passes; the student can close it and keep practicing.
    if (!allDone) completeEl.hidden = true;
    if (allDone && !academyCompletionReported) {
      completeEl.hidden = false;
      academyCompletionReported = true;
      reportProgress('academy-complete', { completedExercises: doneCount, totalExercises: total });
    }
  }

  // The board that was run, saved as the exercise's correct solution if every check passes.
  let lastRunBoardXml = '';

  function renderChecks(checks) {
    const boardXml = lastRunBoardXml;
    checksEl.innerHTML = checks.map(check => `<div class="${check.pass ? 'pass' : 'fail'}"><span>${check.pass ? '✓' : '·'}</span>${esc(check.label)}</div>`).join('');
    const passed = checks.length > 0 && checks.every(check => check.pass);
    if (passed) {
      if (boardXml) {
        passedBoards[activeExercise] = boardXml;
        previousSolutions[activeExercise] = boardXml;
        persistBoards();
      }
      completedExercises.add(activeExercise);
      renderExercises();
      reportProgress(`academy-exercise-${activeExercise + 1}`, { completedExercises: completedExercises.size, totalExercises: academy.exercises.length });
    }
    const allDone = academy.exercises.length > 0 && completedExercises.size >= academy.exercises.length;
    feedbackEl.textContent = passed && allDone
      ? 'כל תרגילי האקדמיה הושלמו וההתקדמות נשמרה. אפשר לחזור לשיעור.'
      : passed
        ? 'התרגיל עבר וההצלחה נשמרה.'
        : 'עוד לא. הסתכלו על ההדמיה, תקנו בלוק אחד והריצו שוב.';
    feedbackEl.className = `academy-feedback ${passed ? 'pass' : 'fail'}`;
    renderAcademyCompletion();
  }

  function updatePython() {
    pythonOutput.textContent = workspaceCode();
  }

  // Run speed chosen by the student (slow / normal / fast), remembered in the browser.
  const speedDelays = { slow: 600, normal: 260, fast: 90 };
  let runSpeed = 'normal';
  try { runSpeed = localStorage.getItem('craftom-academy-speed') || 'normal'; } catch (_) { /* storage blocked */ }
  if (!speedDelays[runSpeed]) runSpeed = 'normal';
  function runSpeedDelay() {
    return speedDelays[runSpeed];
  }
  runButton.insertAdjacentHTML('afterend', `<label class="academy-speed">קצב הרצה
    <select id="academySpeed">
      <option value="slow">איטי</option>
      <option value="normal">רגיל</option>
      <option value="fast">מהיר</option>
    </select></label>`);
  const speedSelect = document.getElementById('academySpeed');
  speedSelect.value = runSpeed;
  speedSelect.addEventListener('change', () => {
    runSpeed = speedDelays[speedSelect.value] ? speedSelect.value : 'normal';
    try { localStorage.setItem('craftom-academy-speed', runSpeed); } catch (_) { /* storage blocked */ }
  });

  let animationRunId = 0;

  function animateRun(state, checks) {
    const frames = state.frames.length ? state.frames : [state];
    const runId = animationRunId;
    let frameIndex = 0;
    runButton.disabled = true;

    function drawFrame() {
      if (runId !== animationRunId) {
        workspace.highlightBlock(null);
        return;
      }
      const frame = frames[Math.min(frameIndex, frames.length - 1)];
      drawWorld(frame);
      // Highlight the block that is running right now.
      workspace.highlightBlock(frame.blockId || null);
      if (frameIndex < frames.length - 1) {
        frameIndex += 1;
        setTimeout(drawFrame, runSpeedDelay());
        return;
      }
      setTimeout(() => { if (runId === animationRunId) workspace.highlightBlock(null); }, 600);
      runButton.disabled = false;
      renderChecks(checks);
    }

    drawFrame();
  }

  function runAndCheck(options = {}) {
    const animate = options.animate !== false;
    updatePython();
    const state = runProgram();
    const checks = evaluate(state);
    lastRunBoardXml = currentBoardXml();
    animationRunId += 1;
    if (animate) {
      animateRun(state, checks);
      return;
    }
    runButton.disabled = false;
    drawWorld(state);
    renderChecks(checks);
  }

  function emptyBoardXml() {
    return '<xml xmlns="https://developers.google.com/blockly/xml"></xml>';
  }

  function currentBoardXml() {
    return Blockly.Xml.domToText(Blockly.Xml.workspaceToDom(workspace));
  }

  function saveBoard() {
    savedBoards[activeExercise] = currentBoardXml();
  }

  // Exercise 1 starts empty; later exercises continue from the last correct solution of the previous exercise,
  // or from the student's latest attempt there. If the student skipped ahead, use the exercise scaffold.
  function entryBoardXml(index) {
    // Debug exercises always start from their own broken code instead of the previous solution.
    if (academy.exercises[index]?.debugStart) return starterXml(index);
    if (index === 0) return emptyBoardXml();
    if (passedBoards[index - 1]) return passedBoards[index - 1];
    if (savedBoards[index - 1]) return savedBoards[index - 1];
    return starterXml(index);
  }

  // Loading a board is not a student edit, so it must not trigger the "you changed the blocks" listener.
  function loadBoard(xml) {
    Blockly.Events.disable();
    try {
      workspace.clear();
      Blockly.Xml.domToWorkspace(new DOMParser().parseFromString(xml, 'text/xml').documentElement, workspace);
    } finally {
      Blockly.Events.enable();
    }
  }

  // Nothing is checked until the student clicks "הרצה ובדיקה".
  function showExercise(message) {
    workspace.highlightBlock(null);
    renderPreviousButton();
    renderBlockCounter();
    animationRunId += 1;
    runButton.disabled = false;
    renderExercises();
    setTimeout(() => Blockly.svgResize(workspace), 20);
    updatePython();
    drawWorld();
    checksEl.innerHTML = evaluate(defaultState()).map(check => `<div class="fail"><span>·</span>${esc(check.label)}</div>`).join('');
    feedbackEl.textContent = message;
    feedbackEl.className = 'academy-feedback';
    renderAcademyCompletion();
  }

  // Work in progress is kept only while it still builds on the same starting board; once the previous
  // exercise has a newer correct solution, the exercise restarts from it.
  function openExercise() {
    // Exercises about getting around the barrier open with the road blocked, so the barrier is visible right away.
    const detourCriteria = ['blockedReaches', 'blockedAvoidsBarrier', 'blockedDelivers'];
    if (routeToggle && (academy.exercises[activeExercise]?.criteria || []).some(criterion => detourCriteria.includes(criterion.type))) {
      worldRouteOpen = false;
      gateAngle = gateClosedAngle;
      renderRouteToggle();
    }
    const entry = entryBoardXml(activeExercise);
    const keepWork = savedBoards[activeExercise] && (boardBasis[activeExercise] === undefined || boardBasis[activeExercise] === entry);
    boardBasis[activeExercise] = entry;
    loadBoard(keepWork ? savedBoards[activeExercise] : entry);
    saveBoard();
    const exercise = academy.exercises[activeExercise];
    showExercise(exercise?.debugStart
      ? (exercise.freshStartMessage || 'תרגיל דיבוג: הקוד בלוח מכיל באג. הריצו אותו, הסתכלו בהדמיה ומצאו מה לא עובד.')
      : activeExercise === 0
        ? 'גררו בלוקים ללוח ולחצו הרצה ובדיקה כדי לראות אם צדקתם.'
        : 'ממשיכים מהקוד של התרגיל הקודם. שנו לפי המשימה ולחצו הרצה ובדיקה.');
  }

  function resetExercise() {
    boardBasis[activeExercise] = entryBoardXml(activeExercise);
    loadBoard(boardBasis[activeExercise]);
    saveBoard();
    showExercise('הלוח חזר לנקודת ההתחלה של התרגיל.');
  }

  document.querySelectorAll('[data-academy-mode]').forEach(button => {
    button.addEventListener('click', () => {
      visibleMode = button.dataset.academyMode || 'blocks';
      document.querySelectorAll('[data-academy-mode]').forEach(item => item.classList.toggle('active', item === button));
      blocklyDiv.hidden = visibleMode !== 'blocks';
      pythonOutput.hidden = visibleMode !== 'python';
      updatePython();
      if (visibleMode === 'blocks') setTimeout(() => Blockly.svgResize(workspace), 20);
    });
  });

  workspace.addChangeListener(event => {
    if (!event.isUiEvent) {
      renderBlockCounter();
      saveBoard();
      updatePython();
      feedbackEl.textContent = 'שיניתם את הבלוקים. לחצו הרצה ובדיקה.';
      feedbackEl.className = 'academy-feedback';
    }
  });

  function renderRouteToggle() {
    if (!routeToggle) return;
    routeToggle.textContent = worldRouteOpen ? 'מצב הדרך: פתוחה (true) · לחצו כדי לחסום' : 'מצב הדרך: חסומה (false) · לחצו כדי לפתוח';
    routeToggle.classList.toggle('blocked', !worldRouteOpen);
  }

  routeToggle?.addEventListener('click', () => {
    worldRouteOpen = !worldRouteOpen;
    renderRouteToggle();
    animationRunId += 1;
    runButton.disabled = false;
    animateGate(worldRouteOpen ? gateOpenAngle : gateClosedAngle);
    feedbackEl.textContent = worldRouteOpen ? 'הדרך פתוחה עכשיו. לחצו הרצה ובדיקה.' : 'הדרך חסומה עכשיו. לחצו הרצה ובדיקה.';
    feedbackEl.className = 'academy-feedback';
  });
  renderRouteToggle();


  runButton.addEventListener('click', runAndCheck);
  resetButton.addEventListener('click', resetExercise);
  // Exercises with a block limit show a live counter under the board.
  blocklyDiv.insertAdjacentHTML('afterend', '<div class="academy-block-counter" id="academyBlockCounter" style="display:none"></div>');
  const blockCounter = document.getElementById('academyBlockCounter');
  function renderBlockCounter() {
    const max = academy.exercises[activeExercise]?.maxBlocks;
    blockCounter.style.display = max ? '' : 'none';
    if (!max) return;
    const count = workspace.getAllBlocks(false).length;
    blockCounter.textContent = `בלוקים: ${count} / ${max}`;
    blockCounter.classList.toggle('over', count > max);
  }

  // Shows the correct solution the student saved in an earlier visit, only when they ask for it.
  hintButton.insertAdjacentHTML('afterend', '<button class="btn secondary" id="academyPrevious" type="button" style="display:none">הפתרון הקודם שלי</button>');
  const previousButton = document.getElementById('academyPrevious');
  function renderPreviousButton() {
    previousButton.style.display = previousSolutions[activeExercise] ? '' : 'none';
  }
  previousButton.addEventListener('click', () => {
    if (!previousSolutions[activeExercise]) return;
    loadBoard(previousSolutions[activeExercise]);
    saveBoard();
    showExercise('זה הפתרון שעבר בפעם הקודמת. אפשר להריץ אותו, לשנות אותו, או ללחוץ איפוס כדי להתחיל שוב.');
  });

  if (completeEl) {
    completeEl.insertAdjacentHTML('beforeend', '<button class="btn secondary" id="academyCompleteClose" type="button">להמשיך לתרגל</button>');
    document.getElementById('academyCompleteClose')?.addEventListener('click', () => { completeEl.hidden = true; });
  }

  hintButton.addEventListener('click', () => {
    const hint = academy.exercises[activeExercise]?.hint || hints[activeExercise] || 'התחילו מפקודת chat ואז הוסיפו פקודת Agent אחת.';
    // When a message's content is checked, the hint also suggests a few example messages.
    const types = (academy.exercises[activeExercise]?.criteria || []).map(criterion => criterion.type);
    const examples = [];
    if (types.some(type => ['arrivalSay', 'arrivalSayAfterMove', 'openArrivalSay', 'sayAfterLoop', 'sayCount'].includes(type))) {
      examples.push('הודעת הצלחה, למשל: "המשלוח הגיע", "החבילה נמסרה", "סיימנו! 🎉"');
    }
    if (types.includes('openingSay')) {
      examples.push('הודעת פתיחה שמסבירה מה הולכים לעשות, למשל: "נניח חבילה על כל מערכת בעיר", "השליח יוצא להניח חבילה בתחנה"');
    }
    if (types.includes('openSays')) {
      examples.push('הודעה לדרך פתוחה, למשל: "הדרך פתוחה, יוצאים"');
    }
    if (types.includes('endsWithSay')) {
      examples.push('הודעת סיכום, למשל: "הנחנו חבילה על כל המערכות ובתחנה"');
    }
    if (types.some(type => ['blockedSays', 'blockedSaysAbout'].includes(type))) {
      examples.push('הודעת חסימה, למשל: "הדרך חסומה", "ממתין לפתיחת הדרך", "עוקף בדרך אחרת"');
    }
    feedbackEl.textContent = `רמז: ${hint}${examples.length ? ` דוגמאות: ${examples.join('. ')}.` : ''}`;
    feedbackEl.className = 'academy-feedback';
  });

  openExercise();
})();
