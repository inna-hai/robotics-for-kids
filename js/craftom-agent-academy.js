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
  const start = { x: 112, y: 230 };
  const station = { x: 322, y: 230 };
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

  const hints = [
    'פתחו את Agent וחפשו בלוק שמזמן את ה-Agent לנקודת ההתחלה.',
    'חפשו ב-Agent פקודת move. המספר המדויק מופיע במשימה, אבל צריך לגרור את הבלוק לבד.',
    'השלד כבר זז, אבל המרחק קצר מדי. נסו לשנות רק את המספר בתוך move.',
    'בדקו איפה ה-Agent נעצר ביחס לתחנה ושנו את מספר הצעדים עד שהוא מגיע קרוב.',
    'המסלול כבר כמעט עובד. חסרה פקודת הודעה מסוף ההרצה באזור Player.',
    'זו משימת דיבוג: אל תוסיפו רצף חדש, חפשו מספר אחד שגורם ל-Agent לעבור את התחנה.'
  ];

  function starterXml() {
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
      packages: [],
      says: [],
      sawChat: false,
      sawTeleport: false,
      moves: [],
      turns: [],
    };
  }

  function applyMove(state, command) {
    const directionOffset = { FORWARD: 0, RIGHT: 90, BACK: 180, LEFT: -90 }[command.direction] || 0;
    const radians = ((state.heading + directionOffset) * Math.PI) / 180;
    const from = { x: state.x, y: state.y };
    state.x += Math.cos(radians) * command.steps * cell;
    state.y += Math.sin(radians) * command.steps * cell;
    state.x = Math.max(52, Math.min(canvas.width - 52, state.x));
    state.y = Math.max(74, Math.min(canvas.height - 52, state.y));
    state.path.push({ x1: from.x, y1: from.y, x2: state.x, y2: state.y });
    state.moves.push(command);
  }

  function walkBlocks(block, state) {
    let current = block;
    while (current) {
      if (current.type === 'mc_on_chat') {
        state.sawChat = current.getFieldValue('COMMAND') === 'deliver';
        walkBlocks(current.getInputTargetBlock('DO'), state);
      } else if (current.type === 'mc_teleport_agent') {
        state.x = start.x;
        state.y = start.y;
        state.heading = 0;
        state.sawTeleport = true;
      } else if (current.type === 'mc_move_agent') {
        applyMove(state, {
          direction: current.getFieldValue('DIR'),
          steps: Number(current.getFieldValue('STEPS') || 1),
        });
      } else if (current.type === 'mc_turn_agent') {
        const turn = current.getFieldValue('TURN');
        state.heading += turn === 'LEFT_TURN' ? -90 : 90;
        state.turns.push(turn);
      } else if (current.type === 'mc_place_agent') {
        state.packages.push({ x: state.x, y: state.y, direction: current.getFieldValue('DIR') });
      } else if (current.type === 'mc_say') {
        state.says.push(current.getFieldValue('TEXT') || '');
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

  function evaluate(state) {
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

  function drawWorld(state = defaultState()) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#eaf7ef';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = '#d6e8dc';
    ctx.lineWidth = 1;
    for (let x = 20; x < canvas.width; x += cell) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 20; y < canvas.height; y += cell) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    ctx.fillStyle = '#c7d2fe';
    ctx.fillRect(start.x - 44, start.y - 44, 88, 88);
    ctx.fillStyle = '#1e3a8a';
    ctx.font = '800 16px Rubik, Arial';
    ctx.textAlign = 'center';
    ctx.fillText('מחסן', start.x, start.y + 6);

    ctx.fillStyle = '#bbf7d0';
    ctx.fillRect(station.x - 48, station.y - 44, 96, 88);
    ctx.fillStyle = '#166534';
    ctx.fillText('תחנה', station.x, station.y + 6);

    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 12;
    ctx.setLineDash([8, 12]);
    ctx.beginPath();
    ctx.moveTo(start.x + 52, start.y);
    ctx.lineTo(station.x - 56, station.y);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 7;
    ctx.lineCap = 'round';
    state.path.forEach(segment => {
      ctx.beginPath();
      ctx.moveTo(segment.x1, segment.y1);
      ctx.lineTo(segment.x2, segment.y2);
      ctx.stroke();
    });

    state.packages.forEach(pkg => {
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(pkg.x - 12, pkg.y - 12, 24, 24);
      ctx.strokeStyle = '#92400e';
      ctx.lineWidth = 2;
      ctx.strokeRect(pkg.x - 12, pkg.y - 12, 24, 24);
    });

    ctx.save();
    ctx.translate(state.x, state.y);
    ctx.rotate((state.heading * Math.PI) / 180);
    ctx.fillStyle = 'rgba(15, 23, 42, .18)';
    ctx.beginPath();
    ctx.ellipse(0, 21, 28, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0f766e';
    ctx.strokeStyle = '#064e3b';
    ctx.lineWidth = 2;
    ctx.fillRect(-19, -15, 38, 32);
    ctx.strokeRect(-19, -15, 38, 32);
    ctx.fillStyle = '#14b8a6';
    ctx.fillRect(-14, -28, 28, 18);
    ctx.strokeRect(-14, -28, 28, 18);
    ctx.fillStyle = '#d1fae5';
    ctx.fillRect(-8, -23, 5, 5);
    ctx.fillRect(4, -23, 5, 5);
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(18, -5, 12, 10);
    ctx.strokeRect(18, -5, 12, 10);
    ctx.fillStyle = '#34d399';
    ctx.fillRect(-13, 17, 8, 11);
    ctx.fillRect(5, 17, 8, 11);
    ctx.restore();

    if (state.says.length) {
      const text = state.says[state.says.length - 1];
      ctx.fillStyle = 'rgba(255,255,255,.96)';
      ctx.strokeStyle = '#bfdbfe';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(255, 44, 250, 48, 10);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#1d4ed8';
      ctx.font = '800 15px Rubik, Arial';
      ctx.fillText(text, 380, 74);
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
    feedbackEl.textContent = passed ? 'התרגיל עבר. אפשר להמשיך לתרגיל הבא.' : 'עוד לא. הסתכלו על ההדמיה, תקנו בלוק אחד והריצו שוב.';
    feedbackEl.className = `academy-feedback ${passed ? 'pass' : 'fail'}`;
    progressEl.textContent = `תרגיל ${activeExercise + 1} מתוך ${academy.exercises.length}`;
  }

  function updatePython() {
    pythonOutput.textContent = workspaceCode();
  }

  function runAndCheck() {
    updatePython();
    const state = runProgram();
    drawWorld(state);
    renderChecks(evaluate(state));
  }

  function resetExercise() {
    workspace.clear();
    Blockly.Xml.domToWorkspace(new DOMParser().parseFromString(starterXml(), 'text/xml').documentElement, workspace);
    renderExercises();
    setTimeout(() => Blockly.svgResize(workspace), 20);
    runAndCheck();
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
    const hint = hints[activeExercise] || academy.exercises[activeExercise]?.hint || 'התחילו מפקודת chat ואז הוסיפו פקודת Agent אחת.';
    feedbackEl.textContent = `רמז: ${hint}`;
    feedbackEl.className = 'academy-feedback';
  });

  resetExercise();
})();
