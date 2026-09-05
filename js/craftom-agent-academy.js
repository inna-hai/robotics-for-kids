(function () {
  const lesson = window.CRAFTOM_CURRENT_MINECRAFT_LESSON;
  const academy = lesson?.detail?.academy;
  const canvas = document.getElementById('academyCanvas');
  const codeInput = document.getElementById('academyCode');
  const exerciseList = document.getElementById('academyExerciseList');
  const checksEl = document.getElementById('academyChecks');
  const feedbackEl = document.getElementById('academyFeedback');
  const progressEl = document.getElementById('academyProgress');
  const runButton = document.getElementById('academyRun');
  const resetButton = document.getElementById('academyReset');

  if (!academy || !canvas || !codeInput || !exerciseList || !checksEl || !feedbackEl || !runButton || !resetButton) return;

  const ctx = canvas.getContext('2d');
  const start = { x: 112, y: 230 };
  const station = { x: 322, y: 230 };
  const cell = 42;
  let activeExercise = 0;
  let runState = null;

  const starters = [
    `player.onChat("deliver", function () {
    agent.teleportToPlayer()
})`,
    `player.onChat("deliver", function () {
    agent.teleportToPlayer()
    agent.move(FORWARD, 3)
})`,
    `player.onChat("deliver", function () {
    agent.teleportToPlayer()
    agent.move(FORWARD, 5)
})`,
    `player.onChat("deliver", function () {
    agent.teleportToPlayer()
    agent.move(FORWARD, 5)
})`,
    `player.onChat("deliver", function () {
    agent.teleportToPlayer()
    agent.move(FORWARD, 5)
    player.say("delivery arrived")
})`,
    `player.onChat("deliver", function () {
    agent.teleportToPlayer()
    agent.move(FORWARD, 8)
    player.say("delivery arrived")
})`,
  ];

  function esc(value) {
    return String(value || '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
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
      errors: [],
    };
  }

  function parseCommands(code) {
    const lines = String(code || '').split(/\r?\n/).map(line => line.trim()).filter(Boolean);
    const commands = [];
    const state = defaultState();

    for (const line of lines) {
      const chat = line.match(/player\.(?:onChat|on_chat)\(["']([^"']+)["']/);
      if (chat) {
        state.sawChat = chat[1] === 'deliver';
        continue;
      }
      if (/agent\.(?:teleportToPlayer|teleport_to_player)\(\)/.test(line)) {
        commands.push({ type: 'teleport' });
        continue;
      }
      const move = line.match(/agent\.move\(\s*(FORWARD|BACK|LEFT|RIGHT)\s*,\s*(\d+)\s*\)/);
      if (move) {
        commands.push({ type: 'move', direction: move[1], steps: Number(move[2]) });
        continue;
      }
      const turn = line.match(/agent\.turn\(\s*(LEFT_TURN|RIGHT_TURN)\s*\)/);
      if (turn) {
        commands.push({ type: 'turn', turn: turn[1] });
        continue;
      }
      const place = line.match(/agent\.place\(\s*(DOWN|FORWARD)\s*\)/);
      if (place) {
        commands.push({ type: 'place', direction: place[1] });
        continue;
      }
      const say = line.match(/player\.say\(\s*["']([^"']+)["']\s*\)/);
      if (say) {
        commands.push({ type: 'say', text: say[1] });
      }
    }

    return { commands, state };
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

  function runProgram(code) {
    const parsed = parseCommands(code);
    const state = parsed.state;
    for (const command of parsed.commands) {
      if (command.type === 'teleport') {
        state.x = start.x;
        state.y = start.y;
        state.heading = 0;
        state.sawTeleport = true;
      } else if (command.type === 'move') {
        applyMove(state, command);
      } else if (command.type === 'turn') {
        state.heading += command.turn === 'LEFT_TURN' ? -90 : 90;
        state.turns.push(command.turn);
      } else if (command.type === 'place') {
        state.packages.push({ x: state.x, y: state.y, direction: command.direction });
      } else if (command.type === 'say') {
        state.says.push(command.text);
      }
    }
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
        ['יש הודעת player.say', state.says.length > 0],
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
    ctx.fillStyle = '#eef8f2';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = '#d8e8e0';
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
    ctx.font = '700 16px Rubik, Arial';
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
    for (const segment of state.path) {
      ctx.beginPath();
      ctx.moveTo(segment.x1, segment.y1);
      ctx.lineTo(segment.x2, segment.y2);
      ctx.stroke();
    }

    for (const pkg of state.packages) {
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(pkg.x - 12, pkg.y - 12, 24, 24);
      ctx.strokeStyle = '#92400e';
      ctx.lineWidth = 2;
      ctx.strokeRect(pkg.x - 12, pkg.y - 12, 24, 24);
    }

    ctx.save();
    ctx.translate(state.x, state.y);
    ctx.rotate((state.heading * Math.PI) / 180);
    ctx.fillStyle = '#0f766e';
    ctx.beginPath();
    ctx.moveTo(24, 0);
    ctx.lineTo(-18, -18);
    ctx.lineTo(-12, 0);
    ctx.lineTo(-18, 18);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    if (state.says.length) {
      const text = state.says[state.says.length - 1];
      ctx.fillStyle = 'rgba(255,255,255,.94)';
      ctx.strokeStyle = '#bfdbfe';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(255, 44, 250, 48, 10);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#1d4ed8';
      ctx.font = '700 15px Rubik, Arial';
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
    feedbackEl.textContent = passed ? 'התרגיל עבר. אפשר לעבור לתרגיל הבא.' : 'הריצו, הסתכלו על ההדמיה, ותקנו דבר אחד בקוד.';
    feedbackEl.className = `academy-feedback ${passed ? 'pass' : 'fail'}`;
    progressEl.textContent = `תרגיל ${activeExercise + 1} מתוך ${academy.exercises.length}`;
  }

  function resetExercise() {
    codeInput.value = starters[activeExercise] || starters[0];
    renderExercises();
    runState = runProgram(codeInput.value);
    drawWorld(runState);
    renderChecks(evaluate(runState));
  }

  runButton.addEventListener('click', () => {
    runState = runProgram(codeInput.value);
    drawWorld(runState);
    renderChecks(evaluate(runState));
  });

  resetButton.addEventListener('click', resetExercise);
  codeInput.addEventListener('input', () => {
    feedbackEl.textContent = 'הקוד השתנה. לחצו הרצה כדי לבדוק.';
    feedbackEl.className = 'academy-feedback';
  });

  resetExercise();
})();
