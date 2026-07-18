(() => {
  const lessons = window.CODEQUEST_LESSONS || [];
  const colors = ['blue', 'green', 'yellow', 'pink', 'purple'];
  const params = new URLSearchParams(location.search);
  let active = Math.max(0, Math.min(lessons.length - 1, Number(params.get('lesson') || 1) - 1));
  let state = null;
  let hintIndex = 0;

  function baseState() {
    return {
      x: 0,
      y: 2,
      dir: 'right',
      penDown: true,
      penColor: 'green',
      turtleX: 90,
      turtleY: 180,
      angle: 0,
      path: [],
      width: 6,
      height: 5,
      tiles: {},
      bridges: {},
      items: { '4,2': 'star', '5,2': 'key', '1,2': 'key' },
      collected: [],
      vars: {},
      actions: [],
      log: [],
      errors: []
    };
  }

  function qs(id) { return document.getElementById(id); }
  function cleanArg(value) {
    const raw = String(value || '').trim();
    const unquoted = raw.replace(/^['"]|['"]$/g, '').trim();
    if (Object.prototype.hasOwnProperty.call(state.vars, unquoted)) return state.vars[unquoted];
    return unquoted;
  }

  function parseValue(expr) {
    const raw = String(expr || '').trim();
    const quoted = raw.match(/^['"](.*)['"]$/);
    if (quoted) return quoted[1];
    if (/^\d+$/.test(raw)) return Number(raw);
    if (raw === 'True') return true;
    if (raw === 'False') return false;
    const add = raw.match(/^(\w+)\s*\+\s*(\d+)$/);
    if (add) return Number(state.vars[add[1]] || 0) + Number(add[2]);
    if (Object.prototype.hasOwnProperty.call(state.vars, raw)) return state.vars[raw];
    return raw;
  }
  function key(x = state.x, y = state.y) { return `${x},${y}`; }

  function commandsForLesson(lesson) {
    const turtle = [
      ['step = 70', 'משתנה צעד'],
      ['forward(step)', 'קדימה לפי משתנה'],
      ['color("green")', 'צבע ירוק'],
      ['color("yellow")', 'צבע צהוב'],
      ['color("blue")', 'צבע כחול'],
      ['forward(80)', 'קדימה 80'],
      ['right(90)', 'ימינה 90°'],
      ['left(90)', 'שמאלה 90°'],
      ['penup()', 'להרים עט'],
      ['pendown()', 'להוריד עט']
    ];
    const basics = [
      ['say("שלום!")', 'אמור'],
      ['move("right")', 'זוז ימינה'],
      ['move("left")', 'זוז שמאלה'],
      ['move("up")', 'זוז למעלה'],
      ['move("down")', 'זוז למטה'],
      ['place_tile("green")', 'אריח ירוק'],
      ['place_tile("yellow")', 'אריח צהוב'],
      ['build_bridge()', 'בנה גשר'],
      ['collect("key")', 'אסוף מפתח']
    ];
    const variables = [
      ['color = "green"', 'משתנה צבע'],
      ['name = "נובה"', 'משתנה שם'],
      ['score = 0', 'ניקוד התחלתי'],
      ['score = score + 10', 'הוסף ניקוד'],
      ['has_key = True', 'יש מפתח'],
      ['say(score)', 'הצג ניקוד'],
      ['say(name)', 'הצג שם']
    ];
    const conditions = [
      ['if has_key:\n    open_gate()', 'אם יש מפתח'],
      ['else:\n    say("חפשו מפתח")', 'אחרת רמז'],
      ['open_gate()', 'פתח שער']
    ];
    if (lesson.turtleMode) return turtle;
    if (lesson.id >= 11) return [...variables, ...conditions, ...basics];
    if (lesson.id >= 6) return [...variables, ...basics];
    return basics;
  }

  function insertCodeSnippet(snippet) {
    const editor = qs('code');
    const start = editor.selectionStart ?? editor.value.length;
    const end = editor.selectionEnd ?? editor.value.length;
    const before = editor.value.slice(0, start);
    const after = editor.value.slice(end);
    const needsNewlineBefore = before && !before.endsWith('\n');
    const needsNewlineAfter = after && !snippet.endsWith('\n');
    const text = `${needsNewlineBefore ? '\n' : ''}${snippet}${needsNewlineAfter ? '\n' : ''}`;
    editor.value = before + text + after;
    const pos = (before + text).length;
    editor.focus();
    editor.setSelectionRange(pos, pos);
  }

  function exercisesForLesson(lesson) {
    if (window.getCodeQuestExercises) return window.getCodeQuestExercises(lesson);
    return lesson.exercises || [];
  }

  function renderExercises(lesson) {
    const list = qs('exerciseList');
    if (!list) return;
    list.innerHTML = exercisesForLesson(lesson).map(item => `<li>${item}</li>`).join('');
  }

  function renderCommandBank(lesson) {
    const bank = qs('commandBank');
    if (!bank) return;
    bank.innerHTML = commandsForLesson(lesson).map(([code, label]) => `<button type="button" class="command-chip" draggable="true" data-code="${code.replace(/&/g,'&amp;').replace(/"/g,'&quot;')}" title="${label}">${code.replace(/</g,'&lt;')}</button>`).join('');
    bank.querySelectorAll('.command-chip').forEach((chip) => {
      chip.addEventListener('click', () => insertCodeSnippet(chip.dataset.code));
      chip.addEventListener('dragstart', (event) => event.dataTransfer.setData('text/plain', chip.dataset.code));
    });
    const editor = qs('code');
    editor.addEventListener('dragover', (event) => { event.preventDefault(); editor.classList.add('drop-target'); });
    editor.addEventListener('dragleave', () => editor.classList.remove('drop-target'));
    editor.addEventListener('drop', (event) => {
      event.preventDefault();
      editor.classList.remove('drop-target');
      insertCodeSnippet(event.dataTransfer.getData('text/plain'));
    });
  }

  function renderLessons() {
    qs('lessonList').innerHTML = lessons.map((lesson, index) => `
      <button class="lesson-btn ${index === active ? 'active' : ''} ${lesson.status !== 'ready' ? 'locked' : ''}" onclick="location.href='codequest-play.html?lesson=${lesson.id}'">
        <b>${lesson.status === 'ready' ? '▶️' : '🔒'} ${lesson.id}. ${lesson.title}</b>
        <small>${lesson.unit} · ${lesson.concept}</small>
      </button>
    `).join('');
  }

  function renderTurtleCanvas() {
    const canvas = qs('turtleCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    for (let x = 40; x < canvas.width; x += 40) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,canvas.height); ctx.stroke(); }
    for (let y = 40; y < canvas.height; y += 40) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(canvas.width,y); ctx.stroke(); }
    for (const seg of state.path) {
      ctx.strokeStyle = seg.color;
      ctx.lineWidth = 7;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(seg.x1, seg.y1);
      ctx.lineTo(seg.x2, seg.y2);
      ctx.stroke();
    }
    ctx.save();
    ctx.translate(state.turtleX, state.turtleY);
    ctx.rotate(state.angle * Math.PI / 180);
    ctx.font = '34px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🤖', 0, 0);
    ctx.restore();
  }

  function renderWorld() {
    const grid = qs('grid');
    grid.innerHTML = '';
    for (let y = 0; y < state.height; y++) {
      for (let x = 0; x < state.width; x++) {
        const cell = document.createElement('div');
        const k = `${x},${y}`;
        cell.className = 'cell';
        if (x === 2 && y === 2) cell.classList.add('water');
        if (x === 5 && y === 2) cell.classList.add('goal');
        if (state.tiles[k]) cell.classList.add(`tile-${state.tiles[k]}`);
        if (state.bridges[k]) cell.classList.add('bridge');
        if (state.items[k] && !state.collected.includes(state.items[k])) cell.classList.add(state.items[k]);
        if (state.x === x && state.y === y) cell.innerHTML = `<span class="player dir-${state.dir}" aria-label="רובוט פייתון"><span class="player-body">🤖</span><span class="player-label">Robot</span></span>`;
        grid.appendChild(cell);
      }
    }
  }

  function loadLesson(index = active) {
    active = index;
    hintIndex = 0;
    state = baseState();
    const lesson = lessons[active];
    document.body.classList.toggle('turtle-mode', Boolean(lesson.turtleMode));
    qs('lessonTitle').textContent = `שיעור ${lesson.id}: ${lesson.title}`;
    qs('unitTag').textContent = lesson.unit;
    qs('conceptTag').textContent = lesson.concept;
    qs('story').textContent = lesson.story;
    qs('challenge').textContent = lesson.challenge;
    qs('goals').innerHTML = `<b>מטרות:</b> ${(lesson.goals && lesson.goals.length) ? lesson.goals.join(' · ') : 'השיעור מתוכנן לשלב הבא'}`;
    qs('code').value = lesson.starterCode || '';
    qs('code').disabled = lesson.status !== 'ready';
    const slidesLink = qs('slidesLink');
    if (slidesLink) slidesLink.href = `codequest-slides.html?lesson=${lesson.id}&v=exercises-links-1`;
    renderCommandBank(lesson);
    renderExercises(lesson);
    qs('output').textContent = lesson.status === 'ready' ? 'לחצו “הרצה” כדי לראות את הדמות מבצעת את הקוד.' : 'השיעור נמצא בתוכנית, אבל עדיין לא פתוח ב-MVP.';
    qs('hint').textContent = 'רמזים יופיעו כאן בזמן עבודה.';
    qs('teacherFlow').innerHTML = (lesson.teacherFlow && lesson.teacherFlow.length ? lesson.teacherFlow : defaultTeacherFlow()).map(x => `<li>${x}</li>`).join('');
    setFeedback(lesson.status === 'ready' ? 'מוכן להרצה' : 'מתוכנן להמשך', '');
    renderLessons();
    renderWorld();
    renderTurtleCanvas();
  }

  function defaultTeacherFlow() {
    return ['10 דק׳ פתיחת סיפור ואתגר', '15 דק׳ הדגמת קוד', '20 דק׳ שינוי קוד מוכן', '25 דק׳ כתיבה עצמאית', '10 דק׳ דיבאג ושיפור', '10 דק׳ הצגת פתרונות'];
  }

  function setFeedback(text, type) {
    const el = qs('feedback');
    el.textContent = text;
    el.className = `feedback ${type || ''}`;
  }

  function say(text) {
    state.actions.push('say');
    state.log.push(`say: ${cleanArg(text)}`);
  }

  function turnRight() {
    const order = ['right', 'down', 'left', 'up'];
    state.dir = order[(order.indexOf(state.dir) + 1) % order.length];
    state.angle = (state.angle + 90) % 360;
    state.actions.push('right');
    state.log.push('right 90');
  }

  function turnLeft() {
    const order = ['right', 'up', 'left', 'down'];
    state.dir = order[(order.indexOf(state.dir) + 1) % order.length];
    state.angle = (state.angle + 270) % 360;
    state.actions.push('left');
    state.log.push('left 90');
  }

  function setColor(colorValue) {
    const color = cleanArg(colorValue);
    if (!colors.includes(color)) {
      state.errors.push(`צבע לא מוכר: ${color}. צבעים אפשריים: ${colors.join(', ')}`);
      return;
    }
    state.penColor = color;
    state.actions.push(`color:${color}`);
    state.log.push(`color ${color}`);
  }

  function penUp() {
    state.penDown = false;
    state.actions.push('penup');
    state.log.push('penup');
  }

  function penDown() {
    state.penDown = true;
    state.actions.push('pendown');
    state.log.push('pendown');
  }

  function forward(distanceValue) {
    const distance = Math.max(1, Number(cleanArg(distanceValue) || 60));
    const x1 = state.turtleX;
    const y1 = state.turtleY;
    const radians = state.angle * Math.PI / 180;
    state.turtleX += Math.cos(radians) * distance;
    state.turtleY += Math.sin(radians) * distance;
    state.turtleX = Math.max(24, Math.min(616, state.turtleX));
    state.turtleY = Math.max(24, Math.min(396, state.turtleY));
    if (state.penDown) state.path.push({ x1, y1, x2: state.turtleX, y2: state.turtleY, color: state.penColor });

    const gridSteps = Math.max(1, Math.round(distance / 60));
    for (let i = 0; i < gridSteps; i++) {
      move(state.dir);
      if (state.penDown && !state.errors.length) placeTile(state.penColor);
    }
    state.actions.push('forward');
    state.log.push(`forward ${distance}`);
  }

  function move(direction) {
    const dir = cleanArg(direction);
    const deltas = { right: [1, 0], left: [-1, 0], up: [0, -1], down: [0, 1] };
    if (!deltas[dir]) {
      state.errors.push(`כיוון לא מוכר: ${dir}`);
      return;
    }
    const [dx, dy] = deltas[dir];
    const nx = state.x + dx;
    const ny = state.y + dy;
    if (nx < 0 || nx >= state.width || ny < 0 || ny >= state.height) {
      state.errors.push('אי אפשר לצאת מגבולות העולם');
      return;
    }
    if (nx === 2 && ny === 2 && !state.bridges['2,2']) {
      state.errors.push('יש מים בדרך — צריך build_bridge() לפני המעבר');
      return;
    }
    state.x = nx;
    state.y = ny;
    state.actions.push(`move:${dir}`);
    state.log.push(`move ${dir}`);
  }

  function placeTile(colorValue) {
    const color = cleanArg(colorValue);
    if (!colors.includes(color)) {
      state.errors.push(`צבע לא מוכר: ${color}. צבעים אפשריים: ${colors.join(', ')}`);
      return;
    }
    state.tiles[key()] = color;
    state.actions.push(`tile:${color}`);
    state.log.push(`place_tile ${color}`);
  }

  function buildBridge() {
    state.bridges['2,2'] = true;
    state.actions.push('bridge');
    state.log.push('build_bridge');
  }

  function collect(itemValue) {
    const item = cleanArg(itemValue);
    const here = state.items[key()];
    if (here === item) {
      state.collected.push(item);
      state.actions.push(`collect:${item}`);
      state.log.push(`collect ${item}`);
    } else {
      state.errors.push(`אין כאן ${item} לאיסוף`);
    }
  }

  function openGate() {
    state.actions.push('open_gate');
    state.log.push('open_gate');
    state.tiles['5,2'] = 'yellow';
  }

  function evalCondition(condition) {
    const raw = String(condition || '').trim();
    if (Object.prototype.hasOwnProperty.call(state.vars, raw)) return Boolean(state.vars[raw]);
    const equals = raw.match(/^(\w+)\s*==\s*['"]?([^'"]+)['"]?$/);
    if (equals) return String(state.vars[equals[1]]) === equals[2];
    return false;
  }

  function executeLine(line) {
    let match;
    if ((match = line.match(/^say\((.*)\)$/))) say(match[1]);
    else if ((match = line.match(/^forward\((.*)\)$/))) forward(match[1]);
    else if (line === 'forward()') forward(1);
    else if ((match = line.match(/^right\((.*)\)$/))) turnRight();
    else if (line === 'right()') turnRight();
    else if ((match = line.match(/^left\((.*)\)$/))) turnLeft();
    else if (line === 'left()') turnLeft();
    else if ((match = line.match(/^color\((.*)\)$/))) setColor(match[1]);
    else if (line === 'penup()') penUp();
    else if (line === 'pendown()') penDown();
    else if ((match = line.match(/^move\((.*)\)$/))) move(match[1]);
    else if ((match = line.match(/^place_tile\((.*)\)$/))) placeTile(match[1]);
    else if (line === 'build_bridge()') buildBridge();
    else if (line === 'open_gate()') openGate();
    else if ((match = line.match(/^collect\((.*)\)$/))) collect(match[1]);
    else if ((match = line.match(/^([a-zA-Z_]\w*)\s*=\s*(.+)$/))) {
      state.vars[match[1]] = parseValue(match[2]);
      state.actions.push('variable');
      state.log.push(`variable ${match[1]} = ${state.vars[match[1]]}`);
    } else {
      state.errors.push(`פקודה לא נתמכת עדיין ב-MVP: ${line}`);
    }
  }

  function runCode() {
    const lesson = lessons[active];
    if (lesson.status !== 'ready') return;
    state = baseState();
    const code = qs('code').value;
    const rawLines = code.split('\n').filter(line => line.trim() && !line.trim().startsWith('#'));

    for (let i = 0; i < rawLines.length; i++) {
      const original = rawLines[i];
      const line = original.trim();
      let match;
      if ((match = line.match(/^if\s+(.+):$/))) {
        const condition = evalCondition(match[1]);
        const next = rawLines[i + 1] || '';
        const hasIndentedNext = /^\s+/.test(next);
        if (condition && hasIndentedNext) executeLine(next.trim());
        if (hasIndentedNext) i++;
        const maybeElse = (rawLines[i + 1] || '').trim();
        if (maybeElse === 'else:') {
          const elseLine = rawLines[i + 2] || '';
          if (!condition && /^\s+/.test(elseLine)) executeLine(elseLine.trim());
          i += /^\s+/.test(elseLine) ? 2 : 1;
        }
      } else if (line === 'else:') {
        state.errors.push('else חייב להגיע אחרי if');
      } else {
        executeLine(line);
      }
    }

    renderWorld();
    renderTurtleCanvas();
    const ok = checkLesson(lesson);
    qs('output').textContent = formatOutput();
    if (state.errors.length) setFeedback('יש באגים לתקן', 'bad');
    else if (ok) setFeedback('האתגר הושלם ✅', 'ok');
    else setFeedback('הקוד רץ, אבל עוד לא עומד בכל תנאי האתגר', 'bad');
  }

  function formatOutput() {
    const parts = [];
    parts.push(state.log.length ? state.log.join('\n') : 'לא בוצעו פעולות');
    if (state.errors.length) parts.push('\nשגיאות:\n' + state.errors.join('\n'));
    parts.push(`\nמיקום דמות: (${state.x}, ${state.y}) · כיוון: ${state.dir}`);
    parts.push(`אריחים: ${Object.keys(state.tiles).length}`);
    if (state.path.length) parts.push(`קווי ציור: ${state.path.length}`);
    if (state.collected.length) parts.push(`נאסף: ${state.collected.join(', ')}`);
    const vars = Object.entries(state.vars).map(([name, value]) => `${name}=${value}`);
    if (vars.length) parts.push(`משתנים: ${vars.join(', ')}`);
    return parts.join('\n');
  }

  function checkLesson(lesson) {
    if (!lesson.checks || !lesson.checks.length) return !state.errors.length;
    return lesson.checks.every(check => {
      if (check === 'say') return state.actions.includes('say');
      if (check === 'bridge') return state.actions.includes('bridge');
      if (check === 'open_gate') return state.actions.includes('open_gate');
      if (check === 'forward') return state.actions.includes('forward');
      if (check === 'right') return state.actions.includes('right');
      if (check === 'left') return state.actions.includes('left');
      if (check.startsWith('color:')) return state.actions.includes(check);
      if (check.startsWith('move:')) return state.actions.includes(check);
      if (check.startsWith('tile:')) return state.actions.includes(check);
      if (check.startsWith('collect:')) return state.actions.includes(check);
      if (check.startsWith('tiles:')) return Object.keys(state.tiles).length >= Number(check.split(':')[1]);
      if (check.startsWith('colors:')) return new Set(Object.values(state.tiles)).size >= Number(check.split(':')[1]);
      if (check.startsWith('var:')) return Object.prototype.hasOwnProperty.call(state.vars, check.split(':')[1]);
      if (check.startsWith('score>=')) return Number(state.vars.score || 0) >= Number(check.split('>=')[1]);
      if (check.startsWith('vartrue:')) return state.vars[check.split(':')[1]] === true;
      if (check === 'x>=3') return state.x >= 3;
      if (check === 'y<=1') return state.y <= 1;
      return true;
    });
  }

  function showHint() {
    const lesson = lessons[active];
    const hints = lesson.hints && lesson.hints.length ? lesson.hints : ['השיעור הזה עדיין בתכנון.'];
    qs('hint').textContent = `רמז: ${hints[hintIndex % hints.length]}`;
    hintIndex++;
  }

  function openRoadmap() {
    const groups = {};
    lessons.forEach(lesson => {
      groups[lesson.unit] ||= [];
      groups[lesson.unit].push(lesson);
    });
    qs('roadmap').innerHTML = Object.entries(groups).map(([unit, items]) => `
      <div class="unit"><h3>${unit}</h3><ol>${items.map(item => `<li>${item.title}</li>`).join('')}</ol></div>
    `).join('');
    qs('roadmapModal').classList.add('open');
  }

  function closeRoadmap() { qs('roadmapModal').classList.remove('open'); }

  function resetRunOnly() {
    state = baseState();
    renderWorld();
    renderTurtleCanvas();
    qs('output').textContent = 'הריצה אופסה. הקוד נשאר כמו שכתבתם — לחצו הרצה כדי להריץ שוב.';
    qs('hint').textContent = 'רמזים יופיעו כאן בזמן עבודה.';
    setFeedback('הריצה אופסה', '');
  }

  window.CodeQuest = {
    selectLesson: loadLesson,
    runCode,
    resetLesson: resetRunOnly,
    showHint,
    openRoadmap,
    closeRoadmap
  };

  document.addEventListener('DOMContentLoaded', () => loadLesson(active));
})();
