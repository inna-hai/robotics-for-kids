(function () {
  if (!window.Blockly) return;

  const lesson = window.CRAFTOM_CURRENT_MINECRAFT_LESSON;
  const blocklyDiv = document.getElementById('craftomBlockly');
  const codeOutput = document.getElementById('makeCodeSnippet');
  const workspaceCard = document.querySelector('.makecode-workspace');
  if (!lesson || !blocklyDiv || !codeOutput) return;

  const esc = value => String(value || '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
  const commandName = text => String(text || 'run').replace(/[^A-Za-z0-9_]/g, '_') || 'run';
  let activeCodeMode = 'javascript';
  let visibleMode = 'blocks';

  if (!window.__craftomMinecraftBlocksDefined) {
    window.__craftomMinecraftBlocksDefined = true;
    Blockly.defineBlocksWithJsonArray([
      {
        type: 'mc_on_chat',
        message0: 'on chat command %1',
        args0: [{ type: 'field_input', name: 'COMMAND', text: 'deliver' }],
        message1: 'run %1',
        args1: [{ type: 'input_statement', name: 'DO' }],
        colour: 215,
        tooltip: 'player.onChat command in Minecraft MakeCode',
      },
      {
        type: 'mc_forever',
        message0: 'forever',
        message1: 'do %1',
        args1: [{ type: 'input_statement', name: 'DO' }],
        colour: 120,
        tooltip: 'loops.forever',
      },
      {
        type: 'mc_if_var',
        message0: 'if %1',
        args0: [{ type: 'field_dropdown', name: 'VAR', options: [['running', 'running'], ['routeOpen', 'routeOpen'], ['stationFull', 'stationFull']] }],
        message1: 'then %1',
        args1: [{ type: 'input_statement', name: 'DO' }],
        message2: 'else %1',
        args2: [{ type: 'input_statement', name: 'ELSE' }],
        previousStatement: null,
        nextStatement: null,
        colour: 120,
        tooltip: 'if / else condition',
      },
      {
        type: 'mc_set_boolean',
        message0: 'set %1 to %2',
        args0: [
          { type: 'field_dropdown', name: 'VAR', options: [['running', 'running'], ['routeOpen', 'routeOpen'], ['stationFull', 'stationFull']] },
          { type: 'field_dropdown', name: 'VALUE', options: [['true', 'true'], ['false', 'false']] }
        ],
        previousStatement: null,
        nextStatement: null,
        colour: 120,
        tooltip: 'set a Boolean variable',
      },
      {
        type: 'mc_teleport_agent',
        message0: 'agent teleport to player',
        previousStatement: null,
        nextStatement: null,
        colour: 35,
        tooltip: 'agent.teleportToPlayer',
      },
      {
        type: 'mc_move_agent',
        message0: 'agent move %1 by %2',
        args0: [
          { type: 'field_dropdown', name: 'DIR', options: [['forward', 'FORWARD'], ['back', 'BACK'], ['up', 'UP'], ['down', 'DOWN'], ['left', 'LEFT'], ['right', 'RIGHT']] },
          { type: 'field_number', name: 'STEPS', value: 5, min: 1, max: 64 }
        ],
        previousStatement: null,
        nextStatement: null,
        colour: 35,
        tooltip: 'agent.move',
      },
      {
        type: 'mc_turn_agent',
        message0: 'agent turn %1',
        args0: [{ type: 'field_dropdown', name: 'TURN', options: [['left', 'LEFT_TURN'], ['right', 'RIGHT_TURN']] }],
        previousStatement: null,
        nextStatement: null,
        colour: 35,
        tooltip: 'agent.turn',
      },
      {
        type: 'mc_place_agent',
        message0: 'agent place %1',
        args0: [{ type: 'field_dropdown', name: 'DIR', options: [['down', 'DOWN'], ['forward', 'FORWARD']] }],
        previousStatement: null,
        nextStatement: null,
        colour: 35,
        tooltip: 'agent.place',
      },
      {
        type: 'mc_pause',
        message0: 'pause (ms) %1',
        args0: [{ type: 'field_number', name: 'MS', value: 500, min: 100, max: 10000 }],
        previousStatement: null,
        nextStatement: null,
        colour: 120,
        tooltip: 'loops.pause',
      },
      {
        type: 'mc_say',
        message0: 'player say %1',
        args0: [{ type: 'field_input', name: 'TEXT', text: 'המשלוח הגיע' }],
        previousStatement: null,
        nextStatement: null,
        colour: 290,
        tooltip: 'player.say',
      },
    ]);
  }

  function blockXml(type, fields = {}, statements = '', next = '') {
    const fieldXml = Object.entries(fields).map(([name, value]) => `<field name="${name}">${esc(value)}</field>`).join('');
    return `<block type="${type}">${fieldXml}${statements}${next}</block>`;
  }

  function statement(name, xml) {
    return `<statement name="${name}">${xml}</statement>`;
  }

  function next(xml) {
    return `<next>${xml}</next>`;
  }

  function chain(blocks) {
    if (!blocks.length) return '';
    const [first, ...rest] = blocks;
    return rest.reduceRight((tail, block) => block(tail), first(''));
  }

  function simpleDelivery(command, steps = 5) {
    return blockXml('mc_on_chat', { COMMAND: command }, statement('DO', chain([
      tail => blockXml('mc_teleport_agent', {}, '', next(tail)),
      tail => blockXml('mc_move_agent', { DIR: 'FORWARD', STEPS: steps }, '', next(tail)),
    ])));
  }

  function deliveryWithTurn(command) {
    return blockXml('mc_on_chat', { COMMAND: command }, statement('DO', chain([
      tail => blockXml('mc_teleport_agent', {}, '', next(tail)),
      tail => blockXml('mc_move_agent', { DIR: 'FORWARD', STEPS: 4 }, '', next(tail)),
      tail => blockXml('mc_turn_agent', { TURN: 'LEFT_TURN' }, '', next(tail)),
      tail => blockXml('mc_move_agent', { DIR: 'FORWARD', STEPS: 3 }, '', next(tail)),
    ])));
  }

  function deliveryWithPackage(command) {
    return blockXml('mc_on_chat', { COMMAND: command }, statement('DO', chain([
      tail => blockXml('mc_teleport_agent', {}, '', next(tail)),
      tail => blockXml('mc_move_agent', { DIR: 'FORWARD', STEPS: 5 }, '', next(tail)),
      tail => blockXml('mc_place_agent', { DIR: 'DOWN' }, '', next(tail)),
      tail => blockXml('mc_say', { TEXT: 'המשלוח הגיע' }, '', next(tail)),
    ])));
  }

  function cycle(command = 'cycle') {
    return blockXml('mc_on_chat', { COMMAND: command }, statement('DO', chain([
      tail => blockXml('mc_teleport_agent', {}, '', next(tail)),
      tail => blockXml('mc_move_agent', { DIR: 'FORWARD', STEPS: 5 }, '', next(tail)),
      tail => blockXml('mc_place_agent', { DIR: 'DOWN' }, '', next(tail)),
      tail => blockXml('mc_turn_agent', { TURN: 'LEFT_TURN' }, '', next(tail)),
      tail => blockXml('mc_turn_agent', { TURN: 'LEFT_TURN' }, '', next(tail)),
      tail => blockXml('mc_move_agent', { DIR: 'FORWARD', STEPS: 5 }, '', next(tail)),
    ])));
  }

  function runningLoop() {
    const start = blockXml('mc_on_chat', { COMMAND: 'start' }, statement('DO', blockXml('mc_set_boolean', { VAR: 'running', VALUE: 'true' })));
    const forever = blockXml('mc_forever', {}, statement('DO', blockXml('mc_if_var', { VAR: 'running' }, statement('DO', chain([
      tail => blockXml('mc_move_agent', { DIR: 'FORWARD', STEPS: 5 }, '', next(tail)),
      tail => blockXml('mc_place_agent', { DIR: 'DOWN' }, '', next(tail)),
      tail => blockXml('mc_turn_agent', { TURN: 'LEFT_TURN' }, '', next(tail)),
      tail => blockXml('mc_turn_agent', { TURN: 'LEFT_TURN' }, '', next(tail)),
      tail => blockXml('mc_move_agent', { DIR: 'FORWARD', STEPS: 5 }, '', next(tail)),
      tail => blockXml('mc_pause', { MS: 500 }, '', next(tail)),
    ])))));
    const stop = `<block type="mc_on_chat" x="40" y="190"><field name="COMMAND">stop</field>${statement('DO', blockXml('mc_set_boolean', { VAR: 'running', VALUE: 'false' }))}</block>`;
    const foreverWithPosition = forever.replace('<block type="mc_forever">', '<block type="mc_forever" x="40" y="330">');
    return `${start}${stop}${foreverWithPosition}`;
  }

  function statusBlocks() {
    const open = blockXml('mc_on_chat', { COMMAND: 'open' }, statement('DO', chain([
      tail => blockXml('mc_set_boolean', { VAR: 'routeOpen', VALUE: 'true' }, '', next(tail)),
      tail => blockXml('mc_say', { TEXT: 'הדרך פתוחה' }, '', next(tail)),
    ])));
    const closeBody = statement('DO', chain([
      tail => blockXml('mc_set_boolean', { VAR: 'routeOpen', VALUE: 'false' }, '', next(tail)),
      tail => blockXml('mc_say', { TEXT: 'הדרך חסומה' }, '', next(tail)),
    ]));
    const close = `<block type="mc_on_chat" x="40" y="190"><field name="COMMAND">close</field>${closeBody}</block>`;
    return `${open}${close}`;
  }

  function conditionalRoute() {
    return blockXml('mc_on_chat', { COMMAND: 'start' }, statement('DO', blockXml('mc_if_var', { VAR: 'routeOpen' },
      statement('DO', chain([
        tail => blockXml('mc_move_agent', { DIR: 'FORWARD', STEPS: 5 }, '', next(tail)),
        tail => blockXml('mc_say', { TEXT: 'ממשיכים במסלול' }, '', next(tail)),
      ])) + statement('ELSE', blockXml('mc_say', { TEXT: 'ממתינים לפתיחת הדרך' }))
    )));
  }

  function smartRule() {
    return blockXml('mc_on_chat', { COMMAND: 'test' }, statement('DO', blockXml('mc_if_var', { VAR: 'stationFull' },
      statement('DO', blockXml('mc_say', { TEXT: 'התחנה מלאה - עוברים לתחנה אחרת' })) +
      statement('ELSE', chain([
        tail => blockXml('mc_move_agent', { DIR: 'FORWARD', STEPS: 5 }, '', next(tail)),
        tail => blockXml('mc_place_agent', { DIR: 'DOWN' }, '', next(tail)),
        tail => blockXml('mc_say', { TEXT: 'החבילה נמסרה' }, '', next(tail)),
      ]))
    )));
  }

  function starterXml() {
    const byLesson = {
      1: simpleDelivery('deliver', 5),
      2: deliveryWithTurn('deliver'),
      3: deliveryWithPackage('deliver'),
      4: deliveryWithTurn('deliver'),
      5: deliveryWithPackage('deliver'),
      6: cycle('cycle'),
      7: runningLoop(),
      8: runningLoop(),
      9: statusBlocks(),
      10: conditionalRoute(),
      11: conditionalRoute(),
      12: smartRule(),
      13: blockXml('mc_on_chat', { COMMAND: 'plan' }, statement('DO', chain([
        tail => blockXml('mc_say', { TEXT: 'מערכת 1: קו משלוחים' }, '', next(tail)),
        tail => blockXml('mc_say', { TEXT: 'מערכת 2: שער או תחנת איסוף' }, '', next(tail)),
      ]))),
      14: deliveryWithPackage('start'),
      15: cycle('test'),
      16: cycle('demo'),
    };
    return `<xml xmlns="https://developers.google.com/blockly/xml">${byLesson[lesson.id] || byLesson[1]}</xml>`;
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
      <category name="Loops & Logic" colour="120">
        <block type="mc_forever"></block>
        <block type="mc_if_var"></block>
        <block type="mc_set_boolean"></block>
        <block type="mc_pause"></block>
      </category>
      <category name="Player" colour="290"><block type="mc_say"></block></category>
    </xml>`;
  }

  const workspace = Blockly.inject('craftomBlockly', {
    media: 'js/vendor/blockly/media/',
    rtl: false,
    trashcan: true,
    scrollbars: true,
    toolbox: toolboxXml(),
    zoom: { controls: true, wheel: true, startScale: .88, maxScale: 1.35, minScale: .45 },
  });

  const parser = new DOMParser();
  Blockly.Xml.domToWorkspace(parser.parseFromString(starterXml(), 'text/xml').documentElement, workspace);

  function indent(level) {
    return '    '.repeat(level);
  }

  function chainCode(block, mode, level = 0) {
    const lines = [];
    let current = block;
    while (current) {
      lines.push(blockCode(current, mode, level));
      current = current.getNextBlock();
    }
    return lines.filter(Boolean).join('\\n');
  }

  function statementCode(block, mode, level) {
    const body = chainCode(block, mode, level + 1);
    return body || `${indent(level + 1)}pass`;
  }

  function blockCode(block, mode, level) {
    const i = indent(level);
    const py = mode === 'python';
    if (block.type === 'mc_on_chat') {
      const command = block.getFieldValue('COMMAND') || 'run';
      if (py) {
        const name = commandName(command);
        return `${i}def on_chat_${name}():\\n${statementCode(block.getInputTargetBlock('DO'), mode, level)}\\n${i}player.on_chat("${command}", on_chat_${name})`;
      }
      return `${i}player.onChat("${command}", function () {\\n${statementCode(block.getInputTargetBlock('DO'), mode, level)}\\n${i}})`;
    }
    if (block.type === 'mc_forever') {
      if (py) return `${i}def on_forever():\\n${statementCode(block.getInputTargetBlock('DO'), mode, level)}\\n${i}loops.forever(on_forever)`;
      return `${i}loops.forever(function () {\\n${statementCode(block.getInputTargetBlock('DO'), mode, level)}\\n${i}})`;
    }
    if (block.type === 'mc_if_var') {
      const variable = block.getFieldValue('VAR');
      if (py) {
        return `${i}if ${variable}:\\n${statementCode(block.getInputTargetBlock('DO'), mode, level)}\\n${i}else:\\n${statementCode(block.getInputTargetBlock('ELSE'), mode, level)}`;
      }
      return `${i}if (${variable}) {\\n${statementCode(block.getInputTargetBlock('DO'), mode, level)}\\n${i}} else {\\n${statementCode(block.getInputTargetBlock('ELSE'), mode, level)}\\n${i}}`;
    }
    if (block.type === 'mc_set_boolean') {
      const value = block.getFieldValue('VALUE');
      return `${i}${block.getFieldValue('VAR')} = ${py ? value === 'true' ? 'True' : 'False' : value}`;
    }
    if (block.type === 'mc_teleport_agent') return `${i}agent.teleportToPlayer()`;
    if (block.type === 'mc_move_agent') return `${i}agent.move(${block.getFieldValue('DIR')}, ${Number(block.getFieldValue('STEPS') || 1)})`;
    if (block.type === 'mc_turn_agent') return `${i}agent.turn(${block.getFieldValue('TURN')})`;
    if (block.type === 'mc_place_agent') return `${i}agent.place(${block.getFieldValue('DIR')})`;
    if (block.type === 'mc_pause') return `${i}loops.pause(${Number(block.getFieldValue('MS') || 500)})`;
    if (block.type === 'mc_say') return `${i}player.say("${block.getFieldValue('TEXT') || ''}")`;
    return '';
  }

  function workspaceCode(mode) {
    const tops = workspace.getTopBlocks(true);
    const variables = [];
    if (tops.some(block => block.getDescendants(false).some(item => ['mc_set_boolean', 'mc_if_var'].includes(item.type) && item.getFieldValue('VAR') === 'running'))) variables.push(mode === 'python' ? 'running = False' : 'let running = false');
    if (tops.some(block => block.getDescendants(false).some(item => ['mc_set_boolean', 'mc_if_var'].includes(item.type) && item.getFieldValue('VAR') === 'routeOpen'))) variables.push(mode === 'python' ? 'routeOpen = True' : 'let routeOpen = true');
    if (tops.some(block => block.getDescendants(false).some(item => ['mc_set_boolean', 'mc_if_var'].includes(item.type) && item.getFieldValue('VAR') === 'stationFull'))) variables.push(mode === 'python' ? 'stationFull = False' : 'let stationFull = false');
    return [...variables, ...tops.map(block => chainCode(block, mode, 0))].filter(Boolean).join('\\n\\n');
  }

  function updateCode() {
    codeOutput.textContent = workspaceCode(activeCodeMode);
  }

  function renderMode() {
    const showBlocks = visibleMode === 'blocks';
    blocklyDiv.hidden = !showBlocks;
    codeOutput.hidden = showBlocks;
    workspaceCard?.classList.toggle('show-code', !showBlocks);
    if (!showBlocks) updateCode();
    if (showBlocks) setTimeout(() => Blockly.svgResize(workspace), 50);
  }

  document.querySelectorAll('[data-craftom-code-mode]').forEach(button => {
    button.addEventListener('click', () => {
      visibleMode = button.dataset.craftomCodeMode;
      if (visibleMode !== 'blocks') activeCodeMode = visibleMode;
      document.querySelectorAll('[data-craftom-code-mode]').forEach(item => item.classList.toggle('active', item === button));
      renderMode();
    });
  });

  workspace.addChangeListener(event => {
    if (!event.isUiEvent) updateCode();
  });
  updateCode();
  renderMode();
})();
