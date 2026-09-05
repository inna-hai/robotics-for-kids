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

  if (!academy || !window.Blockly || !blocklyDiv || !pythonOutput || !canvas || !exerciseList || !checksEl || !feedbackEl) return;

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
  let activeExercise = 0;
  let visibleMode = 'blocks';

  const esc = value => String(value || '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
  const commandName = text => String(text || 'run').replace(/[^A-Za-z0-9_]/g, '_') || 'run';

  document.title = `${academy.title} | ${lesson.title}`;
  document.getElementById('academyKicker').textContent = `שיעור ${lesson.id} - ${lesson.title}`;
  document.getElementById('academyTitle').textContent = academy.title;
  document.getElementById('academyStory').textContent = academy.story;
  document.getElementById('lessonBackLink').href = `craftom-minecraft-lesson-${lesson.id}.html`;

  if (!window.__craftomAcademyBlocksDefined) {
    window.__craftomAcademyBlocksDefined = true;
    Blockly.defineBlocksWithJsonArray([
      {
        type: 'mc_on_chat',
        message0: 'on chat command %1',
        args0: [{ type: 'field_input', name: 'COMMAND', text: 'deliver' }],
        message1: 'run %1',
        args1: [{ type: 'input_statement', name: 'DO' }],
        colour: 215,
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
          { type: 'field_dropdown', name: 'DIR', options: [['forward', 'FORWARD'], ['back', 'BACK'], ['left', 'LEFT'], ['right', 'RIGHT']] },
          { type: 'field_number', name: 'STEPS', value: 5, min: 1, max: 16 }
        ],
        previousStatement: null,
        nextStatement: null,
        colour: 35,
      },
      {
        type: 'mc_turn_agent',
        message0: 'agent turn %1',
        args0: [{ type: 'field_dropdown', name: 'TURN', options: [['left', 'LEFT_TURN'], ['right', 'RIGHT_TURN']] }],
        previousStatement: null,
        nextStatement: null,
        colour: 35,
      },
      {
        type: 'mc_place_agent',
        message0: 'agent place %1',
        args0: [{ type: 'field_dropdown', name: 'DIR', options: [['down', 'DOWN'], ['forward', 'FORWARD']] }],
        previousStatement: null,
        nextStatement: null,
        colour: 35,
      },
      {
        type: 'mc_say',
        message0: 'player say %1',
        args0: [{ type: 'field_input', name: 'TEXT', text: 'delivery arrived' }],
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
        args0: [{ type: 'field_dropdown', name: 'STATE', options: [['true', 'OPEN'], ['false', 'BLOCKED']] }],
        message1: 'then %1',
        args1: [{ type: 'input_statement', name: 'DO' }],
        message2: 'else %1',
        args2: [{ type: 'input_statement', name: 'ELSE' }],
        previousStatement: null,
        nextStatement: null,
        colour: 180,
      },
    ]);
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

  function starterXml() {
    const exercise = academy.exercises[activeExercise];
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
    return `<xml xmlns="https://developers.google.com/blockly/xml">${starts[activeExercise] || starts[0]}</xml>`;
  }

  function toolboxXml() {
    return `<xml xmlns="https://developers.google.com/blockly/xml">
      <category name="Events" colour="215"><block type="mc_on_chat"></block></category>
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
      return `${i}def on_chat_${name}():\n${statementCode(block.getInputTargetBlock('DO'), level)}\n${i}player.on_chat("${command}", on_chat_${name})`;
    }
    if (block.type === 'mc_teleport_agent') return `${i}agent.teleportToPlayer()`;
    if (block.type === 'mc_move_agent') return `${i}agent.move(${block.getFieldValue('DIR')}, ${Number(block.getFieldValue('STEPS') || 1)})`;
    if (block.type === 'mc_turn_agent') return `${i}agent.turn(${block.getFieldValue('TURN')})`;
    if (block.type === 'mc_place_agent') return `${i}agent.place(${block.getFieldValue('DIR')})`;
    if (block.type === 'mc_say') return `${i}player.say("${block.getFieldValue('TEXT') || ''}")`;
    if (block.type === 'mc_repeat') {
      return `${i}for count in range(${Number(block.getFieldValue('TIMES') || 2)}):\n${statementCode(block.getInputTargetBlock('DO'), level)}`;
    }
    if (block.type === 'mc_if_route_open') {
      const value = block.getFieldValue('STATE') === 'BLOCKED' ? 'False' : 'True';
      return `${i}if routeOpen == ${value}:\n${statementCode(block.getInputTargetBlock('DO'), level)}\n${i}else:\n${statementCode(block.getInputTargetBlock('ELSE'), level)}`;
    }
    return '';
  }

  function workspaceCode() {
    return workspace.getTopBlocks(true).map(block => chainCode(block)).filter(Boolean).join('\n\n');
  }

  function defaultState() {
    return {
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

  function visualSnapshot(state) {
    return {
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
    for (let stepIndex = 0; stepIndex < steps; stepIndex += 1) {
      const from = { x: state.x, y: state.y };
      state.x += Math.cos(radians) * cell;
      state.y += Math.sin(radians) * cell;
      state.x = Math.max(52, Math.min(canvas.width - 52, state.x));
      state.y = Math.max(74, Math.min(canvas.height - 52, state.y));
      state.path.push({ x1: from.x, y1: from.y, x2: state.x, y2: state.y, step: state.path.length + 1 });
      state.frames.push(visualSnapshot(state));
    }
    state.moves.push(command);
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
        state.packages.push({ x: state.x, y: state.y, direction: current.getFieldValue('DIR') });
        state.actions.push({ type: 'place', direction: current.getFieldValue('DIR') });
        state.frames.push(visualSnapshot(state));
      } else if (current.type === 'mc_say') {
        state.says.push(current.getFieldValue('TEXT') || '');
        state.actions.push({ type: 'say', text: current.getFieldValue('TEXT') || '' });
        state.frames.push(visualSnapshot(state));
      } else if (current.type === 'mc_repeat') {
        const times = Math.max(1, Number(current.getFieldValue('TIMES') || 1));
        state.repeats.push(times);
        state.actions.push({ type: 'repeat', times });
        for (let index = 0; index < times; index += 1) {
          walkBlocks(current.getInputTargetBlock('DO'), state);
        }
      } else if (current.type === 'mc_if_route_open') {
        const routeState = current.getFieldValue('STATE') || 'OPEN';
        const hasElse = Boolean(current.getInputTargetBlock('ELSE'));
        const elseHasSay = hasNestedBlock(current.getInputTargetBlock('ELSE'), 'mc_say');
        state.conditions.push({ state: routeState, hasElse, elseHasSay });
        state.actions.push({ type: 'condition', state: routeState, hasElse });
        walkBlocks(current.getInputTargetBlock(routeState === 'OPEN' ? 'DO' : 'ELSE'), state);
      }
      current = current.getNextBlock();
    }
  }

  function runProgram() {
    const state = defaultState();
    workspace.getTopBlocks(true).forEach(block => walkBlocks(block, state));
    return state;
  }

  function isNear(point, target, radius = 46) {
    return Math.hypot(point.x - target.x, point.y - target.y) <= radius;
  }

  function criterionPass(state, criterion) {
    const firstMove = state.moves[0];
    const secondMove = state.moves[1];
    const firstMoveAction = state.actions.findIndex(action => action.type === 'move');
    const firstTurnAction = state.actions.findIndex(action => action.type === 'turn');
    const reachedStation = isNear(state, station, criterion.radius || 74);
    const hasArrivalSay = state.says.some(text => /arrived|הגיע|נמסר|delivery/i.test(text));
    const hasPackageNearStation = state.packages.some(pkg => isNear(pkg, station, criterion.radius || 52));
    const hasReturnToStart = isNear(state, start, criterion.radius || 52);

    if (criterion.type === 'chatDeliver') return state.sawChat;
    if (criterion.type === 'command') return state.commands.includes(criterion.command || academy.command || 'deliver');
    if (criterion.type === 'teleport') return state.sawTeleport;
    if (criterion.type === 'moveCount') return state.moves.length >= Number(criterion.min || 1);
    if (criterion.type === 'firstMove') return firstMove?.direction === (criterion.direction || 'FORWARD') && firstMove.steps === Number(criterion.steps);
    if (criterion.type === 'secondMove') return secondMove?.direction === (criterion.direction || 'FORWARD') && secondMove.steps === Number(criterion.steps);
    if (criterion.type === 'anyMove') return state.moves.some(move => move.direction === (criterion.direction || 'FORWARD') && move.steps === Number(criterion.steps));
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
    if (criterion.type === 'placeCount') return state.packages.length >= Number(criterion.min || 1);
    if (criterion.type === 'returnToStart') return hasReturnToStart;
    if (criterion.type === 'say') return state.says.length > 0;
    if (criterion.type === 'arrivalSay') return hasArrivalSay;
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
    const hasArrivalSay = state.says.some(text => /arrived|הגיע|נמסר|delivery/i.test(text));
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
    ctx.roundRect(x - 32, y - 72, 64, 23, 5);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#422006';
    ctx.font = '900 14px Rubik, Arial';
    ctx.textAlign = 'center';
    ctx.fillText('תחנה', x, y - 56);
  }

  function drawAgent(state) {
    ctx.save();
    ctx.translate(state.x, state.y);
    ctx.rotate((state.heading * Math.PI) / 180);
    ctx.fillStyle = 'rgba(15, 23, 42, .32)';
    ctx.fillRect(-27, 25, 58, 11);
    drawBlock(-20, -14, 40, 36, '#0f9f8f', '#09685e', 7, '#053f39');
    drawBlock(-15, -38, 30, 24, '#18c7b8', '#0f766e', 6, '#053f39');
    ctx.fillStyle = '#d9fff3';
    ctx.fillRect(-9, -31, 7, 7);
    ctx.fillRect(4, -31, 7, 7);
    ctx.fillStyle = '#052e2b';
    ctx.fillRect(-7, -29, 3, 3);
    ctx.fillRect(6, -29, 3, 3);
    drawBlock(19, -6, 15, 13, '#fbbf24', '#b45309', 5, '#78350f');
    ctx.fillStyle = '#34d399';
    ctx.strokeStyle = '#065f46';
    ctx.lineWidth = 2;
    ctx.fillRect(-15, 22, 9, 14);
    ctx.fillRect(6, 22, 9, 14);
    ctx.strokeRect(-15, 22, 9, 14);
    ctx.strokeRect(6, 22, 9, 14);
    ctx.restore();
  }

  function drawWorld(state = defaultState()) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPixelGrass();

    ctx.fillStyle = 'rgba(15, 23, 42, .22)';
    ctx.fillRect(34, 32, canvas.width - 68, canvas.height - 64);
    ctx.strokeStyle = 'rgba(219, 234, 254, .32)';
    ctx.lineWidth = 2;
    ctx.strokeRect(34, 32, canvas.width - 68, canvas.height - 64);

    routeTiles.forEach(tile => drawCobbleTile(tile.x, tile.y, tile.w || 34, tile.h || 28));

    drawWoodCrate(start.x, start.y + 4, 92, 74);
    ctx.fillStyle = '#fff7ed';
    ctx.strokeStyle = '#5f3712';
    ctx.lineWidth = 2;
    ctx.roundRect(start.x - 34, start.y - 66, 68, 24, 5);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#422006';
    ctx.font = '900 14px Rubik, Arial';
    ctx.textAlign = 'center';
    ctx.fillText('מחסן', start.x, start.y - 49);

    drawStationBlock(station.x, station.y);

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
      const markerSize = 18;
      ctx.fillStyle = '#fde047';
      ctx.strokeStyle = '#713f12';
      ctx.lineWidth = 2;
      ctx.fillRect(segment.x2 - markerSize / 2, segment.y2 - markerSize / 2, markerSize, markerSize);
      ctx.strokeRect(segment.x2 - markerSize / 2, segment.y2 - markerSize / 2, markerSize, markerSize);
      ctx.fillStyle = '#422006';
      ctx.font = '900 11px Rubik, Arial';
      ctx.textAlign = 'center';
      ctx.fillText(String(index + 1), segment.x2, segment.y2 + 4);
    });

    state.packages.forEach(pkg => {
      drawBlock(pkg.x - 14, pkg.y - 18, 28, 26, '#f59e0b', '#92400e', 7, '#78350f');
      ctx.strokeStyle = '#78350f';
      ctx.beginPath();
      ctx.moveTo(pkg.x, pkg.y - 18);
      ctx.lineTo(pkg.x, pkg.y + 8);
      ctx.moveTo(pkg.x - 14, pkg.y - 5);
      ctx.lineTo(pkg.x + 14, pkg.y - 5);
      ctx.stroke();
    });

    drawAgent(state);

    if (state.says.length) {
      const text = state.says[state.says.length - 1];
      ctx.fillStyle = 'rgba(15, 23, 42, .92)';
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(244, 35, 280, 52, 6);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#f8fafc';
      ctx.font = '800 15px Rubik, Arial';
      ctx.fillText(text, 384, 67);
    }
  }

  function renderExercises() {
    exerciseList.innerHTML = academy.exercises.map((exercise, index) => `
      <button type="button" class="${index === activeExercise ? 'active' : ''}" data-academy-exercise="${index}">
        <span>${index + 1}</span>
        <strong>${esc(exercise.title)}</strong>
        <small>${esc(exercise.mission)}</small>
      </button>
    `).join('');
    exerciseList.querySelectorAll('[data-academy-exercise]').forEach(button => {
      button.addEventListener('click', () => {
        activeExercise = Number(button.dataset.academyExercise || 0);
        resetExercise();
      });
    });
  }

  function renderChecks(checks) {
    checksEl.innerHTML = checks.map(check => `<div class="${check.pass ? 'pass' : 'fail'}"><span>${check.pass ? '✓' : '·'}</span>${esc(check.label)}</div>`).join('');
    const passed = checks.length > 0 && checks.every(check => check.pass);
    feedbackEl.textContent = passed
      ? 'התרגיל עבר. המשיכו לתרגיל הבא; בסיום האקדמיה חוזרים לשיעור ומיישמים במיינקראפט.'
      : 'עוד לא. הסתכלו על ההדמיה, תקנו בלוק אחד והריצו שוב.';
    feedbackEl.className = `academy-feedback ${passed ? 'pass' : 'fail'}`;
    progressEl.textContent = `תרגיל ${activeExercise + 1} מתוך ${academy.exercises.length}`;
  }

  function updatePython() {
    pythonOutput.textContent = workspaceCode();
  }

  let animationRunId = 0;

  function animateRun(state, checks) {
    const frames = state.frames.length ? state.frames : [state];
    const runId = animationRunId;
    let frameIndex = 0;
    runButton.disabled = true;

    function drawFrame() {
      if (runId !== animationRunId) return;
      drawWorld(frames[Math.min(frameIndex, frames.length - 1)]);
      if (frameIndex < frames.length - 1) {
        frameIndex += 1;
        setTimeout(drawFrame, 260);
        return;
      }
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
    animationRunId += 1;
    if (animate) {
      animateRun(state, checks);
      return;
    }
    runButton.disabled = false;
    drawWorld(state);
    renderChecks(checks);
  }

  function resetExercise() {
    workspace.clear();
    Blockly.Xml.domToWorkspace(new DOMParser().parseFromString(starterXml(), 'text/xml').documentElement, workspace);
    renderExercises();
    setTimeout(() => Blockly.svgResize(workspace), 20);
    runAndCheck({ animate: false });
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
      updatePython();
      feedbackEl.textContent = 'שיניתם את הבלוקים. לחצו הרצה ובדיקה.';
      feedbackEl.className = 'academy-feedback';
    }
  });

  runButton.addEventListener('click', runAndCheck);
  resetButton.addEventListener('click', resetExercise);
  hintButton.addEventListener('click', () => {
    const hint = academy.exercises[activeExercise]?.hint || hints[activeExercise] || 'התחילו מפקודת chat ואז הוסיפו פקודת Agent אחת.';
    feedbackEl.textContent = `רמז: ${hint}`;
    feedbackEl.className = 'academy-feedback';
  });

  resetExercise();
})();
