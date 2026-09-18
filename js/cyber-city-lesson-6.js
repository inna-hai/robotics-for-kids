(function () {
  const stations = [
    { id: 'brief', short: 'פתיחה', title: 'פתיחת משימה: תקלה בשער העיר', time: '10 דקות', goal: 'מקבלים קריאת חירום: שער העיר לא נפתח, וצריך להבין איפה בקשת הרשת נתקעת או נחשפת.', type: 'brief' },
    { id: 'map', short: 'מפה', title: 'Route Builder: בונים מסלול אינטרנט', time: '15 דקות', goal: 'מסדרים משחק מסלול שמראה איך שם אתר הופך לכתובת IP ואיך בקשה חוזרת מהשרת.', type: 'map' },
    { id: 'packet', short: 'Packet', title: 'Packet Log: מה רואים בלוג תעבורה?', time: '20 דקות', goal: 'קוראים רשומת תעבורה ומזהים source, destination, protocol, path ו־encrypted.', type: 'packet' },
    { id: 'python', short: 'Python', title: 'Python Packet Inspector', time: '20 דקות', goal: 'בונים בדיקת Python שמזהה HTTP גלוי, התחברות, סיסמה ויעד חשוד בתוך לוג מסומלץ.', type: 'python' },
    { id: 'cases', short: 'הרצה', title: 'מריצים על תעבורת אימון', time: '15 דקות', goal: 'משווים כמה רשומות רשת ורואים למה HTTPS מוצפן פחות מסוכן מ־HTTP גלוי עם login.', type: 'cases' },
    { id: 'report', short: 'דוח', title: 'דוח Network Defender', time: '10 דקות', goal: 'מסבירים מה עבר ברשת, מה היה גלוי, מה היה מוצפן ומה ההחלטה של צוות ההגנה.', type: 'report' }
  ];

  const packetSignals = [
    { id: 'http', label: 'HTTP גלוי', code: '"http://" in pkt', meaning: 'תעבורה בלי שכבת HTTPS יכולה לחשוף נתונים בדרך', points: 35 },
    { id: 'login', label: 'פעולת התחברות', code: '"login" in pkt', meaning: 'כניסה לחשבון דורשת הצפנה וזהות יעד ברורה', points: 20 },
    { id: 'password', label: 'שדה סיסמה', code: '"password" in pkt', meaning: 'סיסמה בלוג היא סימן חירום לחקירה', points: 35 },
    { id: 'unknown', label: 'יעד לא מוכר', code: '"unknown" in pkt', meaning: 'יעד לא מוכר דורש בדיקה לפני שממשיכים', points: 20 },
    { id: 'https', label: 'HTTPS מוצפן', code: '"https://" in pkt', meaning: 'HTTPS לא מבטל סיכון, אבל מצמצם חשיפה בדרך', points: -25 }
  ];

  const packetCases = [
    {
      id: 'portal',
      title: 'כניסה לפורטל כיתה',
      src: '10.0.0.23',
      dns: 'school.example -> 203.0.113.24',
      dst: '203.0.113.24',
      proto: 'HTTPS',
      path: '/login',
      encrypted: 'true',
      log: 'src=10.0.0.23 dns=school.example dst=203.0.113.24 proto=https path=/login encrypted=true',
      signals: ['login', 'https'],
      action: 'התעבורה מוצפנת. עדיין בודקים שהכתובת מוכרת לפני כניסה.'
    },
    {
      id: 'coins',
      title: 'בקשת מטבעות חשודה',
      src: '10.0.0.23',
      dns: 'free-coins.example -> 198.51.100.77',
      dst: '198.51.100.77',
      proto: 'HTTP',
      path: '/login?password=',
      encrypted: 'false',
      log: 'src=10.0.0.23 dns=free-coins.example dst=198.51.100.77 proto=http path=/login?password= encrypted=false',
      signals: ['http', 'login', 'password', 'unknown'],
      action: 'עוצרים. יש HTTP גלוי וגם סיסמה בנתיב. לא שולחים פרטים ומדווחים.'
    },
    {
      id: 'dns',
      title: 'שאילתת DNS',
      src: '10.0.0.23',
      dns: 'game.example -> 203.0.113.55',
      dst: '8.8.8.8',
      proto: 'DNS',
      path: 'query game.example',
      encrypted: 'false',
      log: 'src=10.0.0.23 dns=query game.example dst=8.8.8.8 proto=dns path=query encrypted=false',
      signals: [],
      action: 'זו שאילתת DNS רגילה בסביבת האימון. היא רק שואלת לאיזו כתובת IP לפנות.'
    },
    {
      id: 'download',
      title: 'הורדה מיעד לא מוכר',
      src: '10.0.0.23',
      dns: 'unknown-download.example -> 192.0.2.88',
      dst: '192.0.2.88',
      proto: 'HTTP',
      path: '/update.exe',
      encrypted: 'false',
      log: 'src=10.0.0.23 dns=unknown-download.example dst=192.0.2.88 proto=http path=/update.exe encrypted=false unknown=true',
      signals: ['http', 'unknown'],
      action: 'בודקים מקור לפני הורדה. יעד לא מוכר ב־HTTP הוא סיבה לעצור.'
    }
  ];

  const packetInvestigationQuestions = [
    {
      id: 'protocol',
      title: 'מה הפרוטוקול אומר לנו?',
      options: [
        { id: 'secure', text: 'HTTPS אומר שהתוכן מוצפן בדרך', correctFor: ['portal'], feedback: 'נכון. HTTPS מצפין את התוכן בדרך, אבל עדיין בודקים שהיעד מוכר.' },
        { id: 'open', text: 'HTTP אומר שהתוכן עלול להיות גלוי בדרך', correctFor: ['coins', 'download'], feedback: 'נכון. HTTP בלי הצפנה הוא סימן שצריך להיזהר, במיוחד כשיש התחברות או הורדה.' },
        { id: 'lookup', text: 'DNS הוא רק תרגום שם אתר לכתובת', correctFor: ['dns'], feedback: 'נכון. DNS לא מחזיר דף אתר, הוא עוזר למצוא את כתובת ה־IP.' }
      ]
    },
    {
      id: 'risk',
      title: 'מה הסימן הכי חשוב לבדוק?',
      options: [
        { id: 'password', text: 'סיסמה או login בתוך HTTP', correctFor: ['coins'], feedback: 'בול. סיסמה ב־HTTP גלוי היא סימן עצירה ברור.' },
        { id: 'unknown', text: 'יעד לא מוכר או הורדה חשודה', correctFor: ['download'], feedback: 'נכון. כשיעד לא מוכר שולח הורדה ב־HTTP, עוצרים ובודקים מקור.' },
        { id: 'known', text: 'יעד מוכר עם HTTPS', correctFor: ['portal'], feedback: 'נכון. זה נראה נמוך סיכון, אבל עדיין מאמתים שהכתובת מוכרת.' },
        { id: 'dns-only', text: 'שאלת DNS רגילה', correctFor: ['dns'], feedback: 'נכון. זו רשומת תרגום, לא שליחת סיסמה ולא הורדה.' }
      ]
    },
    {
      id: 'action',
      title: 'מה החלטת ההגנה?',
      options: [
        { id: 'allow', text: 'ממשיכים בזהירות אחרי אימות כתובת', correctFor: ['portal', 'dns'], feedback: 'נכון. אין סימן חירום, אבל Network Defender תמיד מאמת יעד.' },
        { id: 'stop', text: 'עוצרים, לא שולחים פרטים ומדווחים', correctFor: ['coins', 'download'], feedback: 'נכון. כשיש HTTP גלוי עם סיסמה/יעד לא מוכר, לא ממשיכים.' },
        { id: 'ignore', text: 'מתעלמים כי כל Packet בטוח', correctFor: [], feedback: 'לא. Packet יכול להיות רגיל או מסוכן; בודקים מקור, יעד, פרוטוקול ותוכן.' }
      ]
    }
  ];

  const routePieces = [
    {
      id: 'https',
      label: 'HTTPS',
      icon: '🔒',
      code: 'encrypted=true',
      simple: 'שומר על התוכן בדרך.',
      explain: 'HTTPS אומר שהתוכן מוצפן בדרך. עדיין בודקים יעד, אבל פחות קל לקרוא את המידע באמצע.',
      wrong: 'HTTPS לא מתחיל את המסלול ולא מתרגם כתובת. הוא שכבת הגנה שמוסיפים כשכבר שולחים מידע בדרך.'
    },
    {
      id: 'device',
      label: 'מחשב',
      icon: '💻',
      code: 'source',
      simple: 'כאן מתחילה הבקשה.',
      explain: 'המחשב של התלמיד הוא נקודת ההתחלה. בלוג רשת קוראים לזה source.',
      wrong: 'המחשב הוא נקודת ההתחלה של הבקשה. הוא לא השרת שמחזיר תשובה ולא הכתובת של היעד.'
    },
    {
      id: 'server',
      label: 'שרת',
      icon: '🖥️',
      code: 'destination',
      simple: 'המקום שמחזיר את האתר או התשובה.',
      explain: 'השרת הוא היעד. הוא מקבל בקשה ומחזיר תגובה, למשל דף התחברות או קובץ.',
      wrong: 'שרת לא מתרגם שם אתר. הוא היעד שאליו מגיעים אחרי שכבר יודעים את כתובת ה־IP.'
    },
    {
      id: 'dns',
      label: 'DNS',
      icon: '🔎',
      code: 'name -> IP',
      simple: 'מתרגם שם אתר לכתובת.',
      explain: 'DNS הוא כמו איש קשר של האינטרנט: נותנים לו שם אתר, והוא מחזיר כתובת IP.',
      wrong: 'DNS לא מחזיר את דף האתר עצמו. התפקיד שלו הוא לתרגם שם אתר לכתובת IP.'
    },
    {
      id: 'ip',
      label: 'IP',
      icon: '📍',
      code: '203.0.113.24',
      simple: 'הכתובת שאליה הרשת יודעת להגיע.',
      explain: 'IP הוא מספר כתובת של מחשב או שרת ברשת. בלי IP, המידע לא יודע לאן ללכת.',
      wrong: 'IP היא הכתובת. היא לא מי שמתרגם את שם האתר, ולא מי שמחזיר את הדף.'
    }
  ];

  const routeSlots = [
    { id: 'start', expected: 'device', label: '1. מי מתחיל?' },
    { id: 'lookup', expected: 'dns', label: '2. מי מתרגם שם אתר?' },
    { id: 'address', expected: 'ip', label: '3. מה הכתובת?' },
    { id: 'target', expected: 'server', label: '4. מי מקבל את הבקשה?' },
    { id: 'protect', expected: 'https', label: '5. מה מגן בדרך?' }
  ];

  const state = {
    station: 0,
    xp: 0,
    risk: 0,
    caseFile: [],
    completed: new Set(),
    watchedConcepts: new Set(),
    conceptTasks: {},
    selectedRoutePiece: '',
    route: {},
    activeCase: 'coins',
    packetInvestigation: {},
    packetText: 'src=10.0.0.23 dns=free-coins.example dst=198.51.100.77 proto=http path=/login?password= encrypted=false unknown=true',
    pythonRan: false,
    report: { seen: '', signals: '', action: '' }
  };

  const mediaVersion = '20260918-packet-v63';
  const mediaUrl = path => `${path}?v=${mediaVersion}`;
  let routeDrag = null;
  let ignoreRouteClick = false;

  const stationVideos = {
    brief: { title: 'סרטון פתיחה', text: 'מהו חדר בקרה של רשת ולמה חוקרי סייבר מסתכלים על תעבורה.', src: 'marketing/cyber-city-lesson6-brief.mp4', poster: 'marketing/cyber-city-lesson6-brief-poster.jpg' },
    map: { title: 'סרטון מפת רשת', text: 'מחשב, DNS, כתובת IP ושרת: המסלול שהמידע עובר בדרך.', src: 'marketing/cyber-city-lesson6-map.mp4', poster: 'marketing/cyber-city-lesson6-map-poster.jpg' },
    packet: { title: 'סרטון Packet Log', text: 'איך קוראים רשומת תעבורה ומזהים מקור, יעד, פרוטוקול והצפנה.', src: 'marketing/cyber-city-lesson6-packet.mp4', poster: 'marketing/cyber-city-lesson6-packet-poster.jpg' },
    python: { title: 'סרטון Python Inspector', text: 'איך if ו-in בודקים סימנים בתוך לוג תעבורה מסומלץ.', src: 'marketing/cyber-city-lesson6-python.mp4', poster: 'marketing/cyber-city-lesson6-python-poster.jpg' },
    cases: { title: 'סרטון הרצה', text: 'מריצים את הבודק על כמה רשומות ומחליטים מה דורש עצירה.', src: 'marketing/cyber-city-lesson6-cases.mp4', poster: 'marketing/cyber-city-lesson6-cases-poster.jpg' },
    report: { title: 'סרטון דוח סיום', text: 'איך מסבירים ממצא רשת כמו צוות הגנה מקצועי.', src: 'marketing/cyber-city-lesson6-report.mp4', poster: 'marketing/cyber-city-lesson6-report-poster.jpg' }
  };

  const conceptVideos = [
    { id: 'packet', title: 'Packet', text: 'מהי חבילת מידע, למה האינטרנט מחלק מידע לחלקים קטנים, ומה אפשר ללמוד ממנה.', src: 'marketing/cyber-city-lesson6-concept-packet.mp4', poster: 'marketing/cyber-city-lesson6-concept-packet-poster.jpg', task: 'מה Packet מכיל?', options: ['מקור, יעד ופרוטוקול', 'רק שם משתמש', 'רק צבע של אתר'], answer: 'מקור, יעד ופרוטוקול' },
    { id: 'device', title: 'מחשב / Source', text: 'מאיפה הבקשה מתחילה ומה זה source בלוג רשת.', src: 'marketing/cyber-city-lesson6-concept-device.mp4', poster: 'marketing/cyber-city-lesson6-concept-device-poster.jpg', task: 'מה זה Source?', options: ['המחשב שממנו הבקשה יוצאת', 'השרת שמחזיר אתר', 'הסיסמה של המשתמש'], answer: 'המחשב שממנו הבקשה יוצאת' },
    { id: 'dns', title: 'DNS', text: 'איך שם אתר הופך לכתובת שהרשת מבינה.', src: 'marketing/cyber-city-lesson6-concept-dns.mp4', poster: 'marketing/cyber-city-lesson6-concept-dns-poster.jpg', task: 'מה DNS עושה?', options: ['מתרגם שם אתר לכתובת IP', 'מצפין סיסמאות', 'מוחק קבצים חשודים'], answer: 'מתרגם שם אתר לכתובת IP' },
    { id: 'ip', title: 'IP', text: 'מהי כתובת IP ולמה צריך אותה לפני שמגיעים לשרת.', src: 'marketing/cyber-city-lesson6-concept-ip.mp4', poster: 'marketing/cyber-city-lesson6-concept-ip-poster.jpg', task: 'למה צריך IP?', options: ['כדי לדעת לאיזו כתובת לשלוח מידע', 'כדי לבחור סיסמה חזקה', 'כדי לפתוח מצלמה'], answer: 'כדי לדעת לאיזו כתובת לשלוח מידע' },
    { id: 'server', title: 'שרת / Destination', text: 'מי מקבל את הבקשה ומחזיר תשובה.', src: 'marketing/cyber-city-lesson6-concept-server.mp4', poster: 'marketing/cyber-city-lesson6-concept-server-poster.jpg', task: 'מה תפקיד השרת?', options: ['לקבל בקשה ולהחזיר תשובה', 'להמציא כתובת IP', 'לסמן כל אתר כמסוכן'], answer: 'לקבל בקשה ולהחזיר תשובה' },
    { id: 'https', title: 'HTTPS', text: 'מה מצפין את התוכן בדרך ומה הוא לא מבטיח.', src: 'marketing/cyber-city-lesson6-concept-https.mp4', poster: 'marketing/cyber-city-lesson6-concept-https-poster.jpg', task: 'מה HTTPS מוסיף?', options: ['הצפנה של התוכן בדרך', 'תרגום שם אתר לכתובת', 'הוכחה שכל אתר בטוח'], answer: 'הצפנה של התוכן בדרך' }
  ];

  const $ = id => document.getElementById(id);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));

  function say(text) { $('assistantText').textContent = text; }
  function addCase(item) { if (!state.caseFile.includes(item)) state.caseFile.push(item); }
  function addXp(amount) { state.xp = Math.max(0, Math.min(100, state.xp + amount)); }
  function complete(id) {
    if (!state.completed.has(id)) {
      state.completed.add(id);
      addXp(Math.ceil(100 / stations.length));
    }
  }
  function calcRisk(signals) {
    let risk = 0;
    packetSignals.forEach(signal => { if (signals.has(signal.id)) risk += signal.points; });
    return Math.max(0, Math.min(100, risk));
  }
  function setRisk(value, text) {
    state.risk = Math.max(0, Math.min(100, value));
    $('riskScore').textContent = `${state.risk}%`;
    $('riskFill').style.width = `${state.risk}%`;
    $('riskFill').className = state.risk >= 70 ? 'high' : state.risk >= 40 ? 'medium' : 'low';
    $('riskText').textContent = text || 'Packet Risk התעדכן לפי סימני התעבורה.';
  }
  function recommendation(risk) {
    if (risk >= 70) return 'עוצרים את הפעולה, לא שולחים פרטים ומדווחים לצוות ההגנה.';
    if (risk >= 40) return 'בודקים יעד, פרוטוקול ומקור לפני שממשיכים.';
    return 'אין סימן חירום בלוג הזה, אבל עדיין מאמתים שהיעד מוכר.';
  }
  function progress() { return Math.round((state.completed.size / stations.length) * 100); }
  function pieceById(id) { return routePieces.find(piece => piece.id === id); }
  function routeCorrectCount() {
    return routeSlots.filter(slot => state.route[slot.id] === slot.expected).length;
  }
  function routeIsComplete() {
    return routeCorrectCount() === routeSlots.length;
  }
  function conceptsWatchedCount() {
    return conceptVideos.filter(video => state.watchedConcepts.has(video.id) && state.conceptTasks[video.id] === video.answer).length;
  }
  function conceptsAreComplete() {
    return conceptsWatchedCount() === conceptVideos.length;
  }
  function conceptTaskStatus(video) {
    const selected = state.conceptTasks[video.id];
    if (!selected) return '';
    return selected === video.answer ? 'correct' : 'wrong';
  }
  function routeFeedback() {
    if (!conceptsAreComplete()) {
      return `לפני המשחק משלימים סרטון ומשימה לכל מושג. נשארו ${conceptVideos.length - conceptsWatchedCount()} מושגים.`;
    }
    if (state.selectedRoutePiece) {
      const piece = pieceById(state.selectedRoutePiece);
      return `נבחר: ${piece.label}. עכשיו לחצו על המקום המתאים במסלול.`;
    }
    const filled = routeSlots.filter(slot => state.route[slot.id]).length;
    if (!filled) return 'בחרו חלק מהרשימה ואז שימו אותו במקום הנכון במסלול מלמעלה למטה.';
    if (routeIsComplete()) return 'המסלול נכון: מחשב -> DNS -> IP -> שרת -> HTTPS.';
    return `${routeCorrectCount()} מתוך ${routeSlots.length} חלקים במקום הנכון. לחצו על חלק שגוי כדי להחזיר אותו ליד ולנסות שוב.`;
  }
  function explainRoutePlacement(slot, piece, isCorrect) {
    if (isCorrect) return `נכון: ${piece.label} מתאים ל־"${slot.label}". ${piece.explain}`;
    return `לא בדיוק: ${piece.label} לא מתאים ל־"${slot.label}". ${piece.wrong}`;
  }
  function placeRoutePiece(slotId, pieceId) {
    const slot = routeSlots.find(item => item.id === slotId);
    const piece = pieceById(pieceId);
    if (!slot || !piece) return;
    state.route[slot.id] = piece.id;
    state.selectedRoutePiece = '';
    say(explainRoutePlacement(slot, piece, state.route[slot.id] === slot.expected));
  }
  function activeInvestigationAnswers() {
    if (!state.packetInvestigation[state.activeCase]) state.packetInvestigation[state.activeCase] = {};
    return state.packetInvestigation[state.activeCase];
  }
  function packetQuestionChoice(question, optionId) {
    return question.options.find(option => option.id === optionId);
  }
  function isPacketAnswerCorrect(question, option, caseId = state.activeCase) {
    return Boolean(option?.correctFor?.includes(caseId));
  }
  function packetInvestigationCorrectCount(caseId = state.activeCase) {
    const answers = state.packetInvestigation[caseId] || {};
    return packetInvestigationQuestions.filter(question => {
      const option = packetQuestionChoice(question, answers[question.id]);
      return isPacketAnswerCorrect(question, option, caseId);
    }).length;
  }
  function packetInvestigationComplete(caseId = state.activeCase) {
    return packetInvestigationCorrectCount(caseId) === packetInvestigationQuestions.length;
  }
  function activePacketQuestion(caseId = state.activeCase) {
    const answers = state.packetInvestigation[caseId] || {};
    return packetInvestigationQuestions.find(question => {
      const option = packetQuestionChoice(question, answers[question.id]);
      return !isPacketAnswerCorrect(question, option, caseId);
    }) || packetInvestigationQuestions.at(-1);
  }
  function analyzePacket(text) {
    const lower = text.toLowerCase();
    const signals = new Set();
    if (lower.includes('http://') || lower.includes('proto=http')) signals.add('http');
    if (lower.includes('login')) signals.add('login');
    if (lower.includes('password')) signals.add('password');
    if (lower.includes('unknown')) signals.add('unknown');
    if (lower.includes('https://') || lower.includes('proto=https') || lower.includes('encrypted=true')) signals.add('https');
    return {
      signals,
      risk: calcRisk(signals),
      lines: [
        `"http" in pkt: ${signals.has('http') ? 'true' : 'false'}`,
        `"login" in pkt: ${signals.has('login') ? 'true' : 'false'}`,
        `"password" in pkt: ${signals.has('password') ? 'true' : 'false'}`,
        `"unknown" in pkt: ${signals.has('unknown') ? 'true' : 'false'}`,
        `"https" in pkt: ${signals.has('https') ? 'true' : 'false'}`
      ]
    };
  }

  function renderShell() {
    const station = stations[state.station];
    const nextStation = stations[state.station + 1];
    $('stationTime').textContent = station.time;
    $('stationTitle').textContent = station.title;
    $('stationGoal').textContent = station.goal;
    $('currentStepLabel').textContent = `משימה ${state.station + 1} מתוך ${stations.length}`;
    $('currentStepName').textContent = station.short;
    $('xpLabel').textContent = state.xp;
    $('progressLabel').textContent = `${progress()}%`;
    $('prevStation').disabled = state.station === 0;
    $('nextStation').textContent = state.station === stations.length - 1 ? 'סיום' : `הבא: ${nextStation.short}`;
    $('stationNav').style.gridTemplateColumns = `repeat(${stations.length}, minmax(0, 1fr))`;
    $('stationNav').innerHTML = stations.map((item, index) => `
      <button class="station-tab ${index === state.station ? 'active' : ''} ${state.completed.has(item.id) ? 'done' : ''}" type="button" data-station="${index}" aria-label="מעבר אל משימה ${index + 1}: ${esc(item.title)}">
        <em>${index + 1}</em>
        <strong>${esc(item.short)}</strong>
        <span>${esc(item.time)}</span>
      </button>
    `).join('');
    $('stationNav').querySelectorAll('[data-station]').forEach(button => {
      button.addEventListener('click', () => {
        state.station = Number(button.dataset.station);
        render();
      });
    });
    $('caseFile').innerHTML = state.caseFile.length ? state.caseFile.map(item => `<span>${esc(item)}</span>`).join('') : '<em>עדיין אין ממצאים בתיק.</em>';
  }

  function renderStationVideo() {
    const video = stationVideos[stations[state.station].id];
    if (!video) return '';
    return `
      <section class="stage-video-card" aria-label="${esc(video.title)}">
        <div class="stage-video-copy">
          <span>לפני שמתחילים</span>
          <h3>${esc(video.title)}</h3>
          <p>${esc(video.text)}</p>
        </div>
        <video controls preload="metadata" playsinline poster="${esc(mediaUrl(video.poster))}">
          <source src="${esc(mediaUrl(video.src))}" type="video/mp4">
        </video>
      </section>
    `;
  }

  function renderBrief() {
    return `
      <section class="brief-grid">
        <article class="big-card">
          <span class="card-kicker">Packet Patrol</span>
          <img class="lab-visual" src="assets/cyber-city/packet-lab.svg" alt="חדר בקרה של תעבורת רשת">
          <h3>קריאת חירום: שער העיר לא נפתח.</h3>
          <p>תושבים מנסים להיכנס לפורטל העיר, אבל חלק מהבקשות נראות חשודות. צוות Network Defender צריך להבין אם הבקשה נתקעה ב־DNS, הגיעה לשרת הנכון, או חשפה מידע בדרך.</p>
          <p>Packet הוא חבילת מידע קטנה שעוברת ברשת. במקום לשלוח הכול כגוש אחד, האינטרנט מעביר חבילות קטנות עם פרטים כמו מקור, יעד ופרוטוקול. בשיעור עובדים רק על לוגים מסומלצים שנבנו ללומדה.</p>
        </article>
        <article class="tool-card">
          <span>המשימה שלכם</span>
          <h3>למצוא איזו תעבורה בטוחה ואיזו דורשת עצירה.</h3>
          <p>קודם בונים את המסלול, אחר כך חוקרים Packet Log, ואז נותנים ל־Python לבדוק הרבה רשומות מהר יותר.</p>
        </article>
        <article class="tool-card">
          <span>מה לומדים בפועל?</span>
          <ol>
            <li><strong>Packet</strong> הוא חבילת מידע קטנה שעוברת בין מחשב לשרת.</li>
            <li><strong>IP</strong> הוא כתובת של מחשב או שרת ברשת.</li>
            <li><strong>DNS</strong> מתרגם שם אתר לכתובת IP.</li>
            <li><strong>HTTP/HTTPS</strong> מספרים אם התעבורה גלויה או מוצפנת.</li>
            <li><strong>Python</strong> בודק סימנים בתוך לוג תעבורה.</li>
          </ol>
        </article>
      </section>
    `;
  }

  function renderMap() {
    const selectedPiece = pieceById(state.selectedRoutePiece);
    const conceptsComplete = conceptsAreComplete();
    return `
      <section class="concept-gate" aria-label="סרטוני מושגים לפני משחק המסלול">
        <article class="tool-card concept-gate-intro">
          <span>לפני התרגיל</span>
          <h3>מתחילים ממה זה Packet ולמה צריך להבין אותו.</h3>
          <p>לכל מושג יש סרטון קצר ומשימת הבנה קטנה. אשרו את הסרטון ופתרו את המשימה כדי לפתוח את המשחק.</p>
          <strong>${conceptsWatchedCount()}/${conceptVideos.length}</strong>
        </article>
        <div class="concept-video-grid">
          ${conceptVideos.map(video => {
            const watched = state.watchedConcepts.has(video.id);
            const taskStatus = conceptTaskStatus(video);
            const done = watched && taskStatus === 'correct';
            return `
              <article class="concept-video-card ${done ? 'done' : ''} ${taskStatus === 'wrong' ? 'needs-fix' : ''}">
                <div>
                  <span>${done ? 'הושלם' : watched ? 'סרטון אושר' : 'ממתין לאישור'}</span>
                  <h4>${esc(video.title)}</h4>
                  <p>${esc(video.text)}</p>
                </div>
                <video controls preload="metadata" playsinline data-concept-video="${esc(video.id)}" poster="${esc(mediaUrl(video.poster))}">
                  <source src="${esc(mediaUrl(video.src))}" type="video/mp4">
                </video>
                <button class="button concept-done-button" type="button" data-confirm-concept="${esc(video.id)}" ${watched ? 'disabled' : ''}>
                  ${watched ? 'אושר' : 'סיימתי לראות'}
                </button>
                <div class="concept-mini-task ${taskStatus}" aria-label="תרגול קצר: ${esc(video.title)}">
                  <b>משימה קטנה</b>
                  <p>${esc(video.task)}</p>
                  <div>
                    ${video.options.map(option => `
                      <button class="${state.conceptTasks[video.id] === option ? 'selected' : ''}" type="button" data-concept-answer="${esc(video.id)}" data-answer="${esc(option)}">
                        ${esc(option)}
                      </button>
                    `).join('')}
                  </div>
                  ${taskStatus === 'correct' ? '<small>נכון, אפשר להמשיך.</small>' : taskStatus === 'wrong' ? '<small>כמעט. נסו שוב לפי הסרטון.</small>' : '<small>בחרו תשובה אחת.</small>'}
                </div>
              </article>
            `;
          }).join('')}
        </div>
      </section>
      <section class="route-game" aria-label="משחק בניית מסלול אינטרנט">
        <article class="tool-card route-game-board">
          <span>משחק מסלול</span>
          <h3>בנו את הדרך של בקשה לאתר.</h3>
          <p>${conceptsComplete ? 'סדרו את המסלול מלמעלה למטה: גררו חלק אל המקום המתאים. אפשר גם לעבוד בלחיצות: לוחצים על חלק ואז על מקום במסלול.' : 'המסלול נעול כרגע. אשרו כל סרטון ופתרו את המשימה הקטנה שמתחתיו.'}</p>
          <div class="route-slots" dir="rtl">
            ${routeSlots.map(slot => {
              const piece = pieceById(state.route[slot.id]);
              const isCorrect = state.route[slot.id] === slot.expected;
              return `
                <button class="route-slot ${piece ? 'filled' : ''} ${isCorrect ? 'correct' : ''}" type="button" data-route-slot="${slot.id}" ${conceptsComplete ? '' : 'disabled'} aria-label="${esc(slot.label)}">
                  <small dir="rtl">${esc(slot.label)}</small>
                  ${piece ? `
                    <strong dir="rtl"><span>${esc(piece.icon)}</span>${esc(piece.label)}</strong>
                    <em>${esc(piece.code)}</em>
                  ` : '<strong dir="rtl">שחררו כאן</strong>'}
                </button>
              `;
            }).join('')}
          </div>
        </article>
        <article class="tool-card route-pieces-card">
          <span>חלקים לבנייה</span>
          <h3>מה כל חלק אומר?</h3>
          <div class="route-pieces">
            ${routePieces.map(piece => `
              <button class="${state.selectedRoutePiece === piece.id ? 'selected' : ''}" type="button" data-route-piece="${piece.id}" draggable="true" ${conceptsComplete ? '' : 'disabled'}>
                <b>${esc(piece.icon)}</b>
                <span>
                  <strong>${esc(piece.label)}</strong>
                  <small>${esc(piece.simple)}</small>
                </span>
              </button>
            `).join('')}
          </div>
        </article>
        <article class="scanner-preview route-feedback-card">
          <span>הסבר פשוט</span>
          <strong>${routeCorrectCount()}/${routeSlots.length}</strong>
          <p>${selectedPiece ? esc(selectedPiece.explain) : esc(routeFeedback())}</p>
          <div class="run-summary">
            <b>המסלול הנכון</b>
            <small dir="ltr">Computer -> DNS -> IP -> Server -> HTTPS</small>
          </div>
          <button class="button" type="button" data-save-map>${!conceptsComplete ? 'השלימו סרטונים ומשימות' : routeIsComplete() ? 'שמור והמשך לתחנה הבאה' : 'סדרו את כל המסלול'}</button>
        </article>
      </section>
    `;
  }

  function renderPacket() {
    const active = packetCases.find(item => item.id === state.activeCase) || packetCases[1];
    const answers = activeInvestigationAnswers();
    const correctCount = packetInvestigationCorrectCount(active.id);
    const currentQuestion = activePacketQuestion(active.id);
    const selectedId = answers[currentQuestion.id];
    const selectedOption = packetQuestionChoice(currentQuestion, selectedId);
    const selectedCorrect = isPacketAnswerCorrect(currentQuestion, selectedOption, active.id);
    const completeInvestigation = packetInvestigationComplete(active.id);
    return `
      <section class="packet-investigation">
        <article class="tool-card packet-brief-card">
          <span>מיני־חקירה</span>
          <h3>בחרו רשומה אחת וחקרו אותה צעד־צעד</h3>
          <p>Packet Log הוא שורת תצפית קצרה: מקור, יעד, פרוטוקול והאם התוכן מוצפן. עכשיו עונים על שאלה אחת בכל פעם.</p>
          <div class="packet-case-tabs">
            ${packetCases.map(item => `
              <button class="${state.activeCase === item.id ? 'selected' : ''}" type="button" data-investigation-case="${item.id}">
                <strong>${esc(item.title)}</strong>
                <small dir="ltr">${esc(item.proto)} · encrypted=${esc(item.encrypted)}</small>
              </button>
            `).join('')}
          </div>
        </article>
        <article class="tool-card packet-log-card">
          <span>הרשומה שבודקים עכשיו</span>
          <h3>${esc(active.title)}</h3>
          <div class="packet-log-pills" dir="ltr">
            <b>${esc(active.proto)}</b>
            <small>encrypted=${esc(active.encrypted)}</small>
          </div>
          <dl class="packet-log-facts" dir="ltr">
            <div><dt>src</dt><dd>${esc(active.src)}</dd></div>
            <div><dt>dst</dt><dd>${esc(active.dst)}</dd></div>
            <div><dt>dns</dt><dd>${esc(active.dns)}</dd></div>
            <div><dt>path</dt><dd>${esc(active.path)}</dd></div>
          </dl>
          <details>
            <summary>הצג שורת לוג מלאה</summary>
            <pre><code>${esc(active.log)}</code></pre>
          </details>
        </article>
        <article class="tool-card packet-question-card">
          <span>שאלת חקירה</span>
          <h3>${correctCount}/${packetInvestigationQuestions.length} תשובות נכונות</h3>
          <div class="packet-progress-dots" aria-label="התקדמות שאלות">
            ${packetInvestigationQuestions.map(question => {
              const option = packetQuestionChoice(question, answers[question.id]);
              return `<i class="${isPacketAnswerCorrect(question, option, active.id) ? 'done' : question.id === currentQuestion.id ? 'active' : ''}"></i>`;
            }).join('')}
          </div>
          <div class="packet-question ${selectedId ? selectedCorrect ? 'correct' : 'wrong' : ''}">
            <b>${esc(currentQuestion.title)}</b>
            <div>
              ${currentQuestion.options.map(option => `
                <button class="${selectedId === option.id ? 'selected' : ''}" type="button" data-packet-answer="${esc(currentQuestion.id)}" data-answer="${esc(option.id)}">
                  ${esc(option.text)}
                </button>
              `).join('')}
            </div>
            ${selectedId ? `<small>${esc(selectedOption.feedback)}${selectedCorrect && !completeInvestigation ? ' עברו לשאלה הבאה.' : ''}</small>` : '<small>בחרו תשובה לפי הפרוטוקול, היעד והתוכן.</small>'}
          </div>
          <button class="button" type="button" data-save-packet>${completeInvestigation ? 'שמור חקירה והמשך לפייתון' : 'ענו נכון על כל השאלות'}</button>
        </article>
      </section>
    `;
  }

  function renderPython() {
    const hasInput = state.packetText.trim().length > 0;
    const output = state.pythonRan && hasInput ? analyzePacket(state.packetText).lines.join('\n') : 'הפלט יופיע כאן אחרי לחיצה על הרצה.';
    return `
      <section class="builder-grid console-lab">
        <article class="tool-card console-run-card">
          <span>Python Packet Inspector</span>
          <h3>הקוד בודק לוג תעבורה ומחשב Packet Risk.</h3>
          <div class="console-steps" aria-label="שלבי בדיקת תעבורה">
            <div><b>1</b><span>מכניסים רשומת תעבורה.</span></div>
            <div><b>2</b><span>לוחצים על הרצה.</span></div>
            <div><b>3</b><span>קוראים אילו סימנים נמצאו.</span></div>
          </div>
          <label>Packet log
            <input class="lab-input" type="text" data-packet-text value="${esc(state.packetText)}" dir="ltr" lang="en">
          </label>
        </article>
        <article class="code-panel">
          <div class="code-panel-toolbar">
            <span>Python</span>
            <button class="button run-console-button code-run-button" type="button" data-run-python>
              <span class="play-icon" aria-hidden="true"></span>
              <span>הרצה</span>
            </button>
          </div>
          <pre><code>pkt = input("packet log: ")
risk = 0
if "http" in pkt:
    risk += 35
if "login" in pkt:
    risk += 20
if "password" in pkt:
    risk += 35
if "unknown" in pkt:
    risk += 20
if "https" in pkt:
    risk -= 25
print("Risk:", risk)</code></pre>
          <div class="terminal-output console-output ${state.pythonRan && hasInput ? 'has-output' : ''}">
            <strong>פלט</strong>
            <p ${state.pythonRan && hasInput ? 'dir="ltr" lang="en"' : 'dir="rtl" lang="he"'}>${esc(output)}</p>
          </div>
        </article>
      </section>
    `;
  }

  function renderCases() {
    const active = packetCases.find(item => item.id === state.activeCase) || packetCases[0];
    const signals = new Set(active.signals);
    const risk = calcRisk(signals);
    return `
      <section class="builder-grid">
        <article class="tool-card">
          <span>תעבורת אימון להרצה</span>
          <h3>בחרו רשומה והריצו עליה את ה־Packet Inspector.</h3>
          <div class="mini-options">
            ${packetCases.map(item => `
              <button class="${state.activeCase === item.id ? 'selected' : ''}" type="button" data-packet-case="${item.id}">
                <strong>${esc(item.title)}</strong>
                <small dir="ltr">${esc(item.proto)} · ${esc(item.dst)}</small>
              </button>
            `).join('')}
          </div>
        </article>
        <article class="scanner-preview run-result-panel">
          <span>תוצאת בדיקה</span>
          <strong>${risk}%</strong>
          <div class="risk-track"><div class="${risk >= 70 ? 'high' : risk >= 40 ? 'medium' : 'low'}" style="width:${risk}%"></div></div>
          <div class="run-summary">
            <b>${esc(active.title)}</b>
            <small dir="ltr">${esc(active.log)}</small>
          </div>
          <ul class="run-signal-list">
            ${packetSignals.map(signal => `
              <li class="${signals.has(signal.id) ? 'active' : ''}">
                <span>${esc(signal.label)}</span>
                <strong>${signals.has(signal.id) ? `${signal.points > 0 ? '+' : ''}${signal.points}` : '0'}</strong>
              </li>
            `).join('')}
          </ul>
          <p>${esc(active.action || recommendation(risk))}</p>
          <button class="button" type="button" data-save-case>שמור בדיקה</button>
        </article>
      </section>
    `;
  }

  function renderReport() {
    return `
      <section class="report-grid">
        <article class="tool-card">
          <span>Network Defense Report</span>
          <h3>מסבירים את בדיקת התעבורה ב־3 שורות.</h3>
          <label>1. איזו תעבורה ראיתם?
            <textarea data-report-field="seen" placeholder="לדוגמה: HTTP ליעד לא מוכר עם path של login">${esc(state.report.seen)}</textarea>
          </label>
          <label>2. אילו סימנים מצאתם?
            <textarea data-report-field="signals" placeholder="לדוגמה: HTTP גלוי, password, unknown">${esc(state.report.signals)}</textarea>
          </label>
          <label>3. מה החלטת ההגנה?
            <textarea data-report-field="action" placeholder="לדוגמה: עוצרים, לא שולחים פרטים, מדווחים">${esc(state.report.action)}</textarea>
          </label>
          <button class="button" type="button" data-check-report>בדוק וקבל תג</button>
        </article>
        <article class="badge-card">
          <span>תוצר שיעור 6</span>
          <strong>Packet Inspector</strong>
          <p>התלמיד יצא עם כלי שבודק לוג תעבורה, מזהה HTTP גלוי, התחברות, סיסמה ויעד חשוד, ומסביר החלטת הגנה.</p>
          <div class="defender-summary">
            <b>מה אני יודע עכשיו?</b>
            <ul>
              <li><strong>Packet</strong> הוא חבילת מידע קטנה עם מקור, יעד ופרוטוקול.</li>
              <li><strong>DNS</strong> מתרגם שם אתר לכתובת IP.</li>
              <li><strong>IP</strong> הוא הכתובת שאליה שולחים מידע.</li>
              <li><strong>Server</strong> מקבל בקשה ומחזיר תשובה.</li>
              <li><strong>HTTPS</strong> מצפין את התוכן בדרך.</li>
              <li><strong>Python</strong> עוזר לבדוק הרבה Packets מהר.</li>
            </ul>
          </div>
          <div class="network-defender-badge" aria-label="תג Network Defender">
            <span>NETWORK DEFENDER</span>
            <strong>Packet Patrol</strong>
            <small>יודע לקרוא תעבורה, לזהות סיכון, ולהסביר החלטת הגנה</small>
          </div>
        </article>
      </section>
    `;
  }

  function renderContent() {
    const type = stations[state.station].type;
    if (type === 'brief') return renderBrief();
    if (type === 'map') return renderMap();
    if (type === 'packet') return renderPacket();
    if (type === 'python') return renderPython();
    if (type === 'cases') return renderCases();
    return renderReport();
  }

  function bindDynamicEvents() {
    document.querySelectorAll('[data-concept-video]').forEach(video => {
      video.addEventListener('ended', () => {
        say('הסרטון הסתיים. אם המושג ברור, לחצו “סיימתי לראות”.');
      });
    });
    document.querySelectorAll('[data-confirm-concept]').forEach(button => {
      button.addEventListener('click', () => {
        const conceptId = button.dataset.confirmConcept;
        state.watchedConcepts.add(conceptId);
        const watched = conceptsWatchedCount();
        say(watched === conceptVideos.length ? 'כל סרטוני המושגים והמשימות הושלמו. עכשיו אפשר להתחיל לבנות את המסלול.' : `הסרטון אושר. עכשיו פתרו גם את המשימה הקטנה של המושג.`);
        render({ preserveScroll: true });
      });
    });
    document.querySelectorAll('[data-concept-answer]').forEach(button => {
      button.addEventListener('click', () => {
        const conceptId = button.dataset.conceptAnswer;
        const video = conceptVideos.find(item => item.id === conceptId);
        state.conceptTasks[conceptId] = button.dataset.answer;
        const correct = video && state.conceptTasks[conceptId] === video.answer;
        const completed = conceptsWatchedCount();
        if (correct && state.watchedConcepts.has(conceptId)) {
          say(completed === conceptVideos.length ? 'כל המושגים הושלמו. עכשיו אפשר להתחיל את Route Builder.' : `נכון. הושלמו ${completed}/${conceptVideos.length} מושגים.`);
        } else if (correct) {
          say('התשובה נכונה. עכשיו לחצו גם “סיימתי לראות” כדי לאשר את הסרטון.');
        } else {
          say('כמעט. חזרו למשפט המרכזי בסרטון ונסו לבחור שוב.');
        }
        render({ preserveScroll: true });
      });
    });
    document.querySelectorAll('[data-route-piece]').forEach(button => {
      button.addEventListener('click', event => {
        if (!conceptsAreComplete()) {
          event.preventDefault();
          say(routeFeedback());
          return;
        }
        if (ignoreRouteClick) {
          event.preventDefault();
          return;
        }
        state.selectedRoutePiece = button.dataset.routePiece;
        const piece = pieceById(state.selectedRoutePiece);
        say(`${piece.label}: ${piece.explain}`);
        render({ preserveScroll: true });
      });
      button.addEventListener('pointerdown', event => {
        if (!conceptsAreComplete()) return;
        if (event.button !== undefined && event.button !== 0) return;
        startRoutePointerDrag(event, button);
      });
      button.addEventListener('dragstart', event => {
        if (!conceptsAreComplete()) {
          event.preventDefault();
          return;
        }
        state.selectedRoutePiece = button.dataset.routePiece;
        event.dataTransfer.setData('text/plain', button.dataset.routePiece);
        event.dataTransfer.effectAllowed = 'move';
      });
    });
    document.querySelectorAll('[data-route-slot]').forEach(button => {
      button.addEventListener('dragover', event => {
        if (!conceptsAreComplete()) return;
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
      });
      button.addEventListener('drop', event => {
        event.preventDefault();
        if (!conceptsAreComplete()) {
          say(routeFeedback());
          return;
        }
        const pieceId = event.dataTransfer.getData('text/plain') || state.selectedRoutePiece;
        if (!pieceId) {
          say('גררו חלק מהרשימה אל אחד המקומות במסלול.');
          return;
        }
        placeRoutePiece(button.dataset.routeSlot, pieceId);
        render({ preserveScroll: true });
      });
      button.addEventListener('click', () => {
        if (!conceptsAreComplete()) {
          say(routeFeedback());
          return;
        }
        if (ignoreRouteClick) return;
        if (!state.selectedRoutePiece) {
          const placed = state.route[button.dataset.routeSlot];
          if (placed) {
            state.selectedRoutePiece = placed;
            delete state.route[button.dataset.routeSlot];
            say('החלק חזר ליד. עכשיו אפשר לשים אותו במקום אחר.');
          } else {
            say('קודם בחרו חלק מהרשימה למטה, ואז לחצו על מקום במסלול.');
          }
          render({ preserveScroll: true });
          return;
        }
        placeRoutePiece(button.dataset.routeSlot, state.selectedRoutePiece);
        render({ preserveScroll: true });
      });
    });
    document.querySelector('[data-save-map]')?.addEventListener('click', () => {
      let movedToNextStation = false;
      if (!conceptsAreComplete()) {
        say(routeFeedback());
      } else if (routeIsComplete()) {
        complete('map');
        addCase('Route Builder: נבנה מסלול מחשב -> DNS -> IP -> שרת -> HTTPS');
        say('מעולה. עכשיו ברור מה זה DNS, למה צריך IP, ומה HTTPS מוסיף בדרך.');
        const packetStationIndex = stations.findIndex(station => station.id === 'packet');
        if (packetStationIndex !== -1) {
          state.station = packetStationIndex;
          movedToNextStation = true;
        }
      } else {
        say(routeFeedback());
      }
      render({ preserveScroll: !movedToNextStation });
    });
    document.querySelector('[data-save-packet]')?.addEventListener('click', () => {
      const active = packetCases.find(item => item.id === state.activeCase) || packetCases[0];
      if (!packetInvestigationComplete(active.id)) {
        say(`עוד לא. יש ${packetInvestigationCorrectCount(active.id)}/${packetInvestigationQuestions.length} תשובות נכונות בחקירה.`);
        render({ preserveScroll: true });
        return;
      }
      complete('packet');
      addCase(`Packet Log: נחקרה רשומת "${active.title}" והתקבלה החלטת הגנה`);
      state.packetText = active.log;
      say('מעולה. עכשיו יש לכם חקירה ידנית. בתחנה הבאה Python יעשה את אותה בדיקה מהר יותר.');
      const pythonStationIndex = stations.findIndex(station => station.id === 'python');
      if (pythonStationIndex !== -1) state.station = pythonStationIndex;
      render();
    });
    document.querySelectorAll('[data-investigation-case]').forEach(button => {
      button.addEventListener('click', () => {
        state.activeCase = button.dataset.investigationCase;
        const active = packetCases.find(item => item.id === state.activeCase);
        const risk = calcRisk(new Set(active?.signals || []));
        state.packetText = active?.log || state.packetText;
        setRisk(risk, active?.action || recommendation(risk));
        say('בחרתם רשומת תעבורה אחרת. עכשיו ענו על שאלות החקירה שלה.');
        render({ preserveScroll: true });
      });
    });
    document.querySelectorAll('[data-packet-answer]').forEach(button => {
      button.addEventListener('click', () => {
        const questionId = button.dataset.packetAnswer;
        const question = packetInvestigationQuestions.find(item => item.id === questionId);
        const option = packetQuestionChoice(question, button.dataset.answer);
        activeInvestigationAnswers()[questionId] = button.dataset.answer;
        const correct = isPacketAnswerCorrect(question, option);
        say(correct ? option.feedback : `${option.feedback} בדקו שוב את ה־protocol, היעד וה־path.`);
        render({ preserveScroll: true });
      });
    });
    document.querySelector('[data-packet-text]')?.addEventListener('input', event => {
      state.packetText = event.target.value;
      state.pythonRan = false;
    });
    document.querySelector('[data-run-python]')?.addEventListener('click', () => {
      if (state.packetText.trim()) {
        const analysis = analyzePacket(state.packetText);
        state.pythonRan = true;
        complete('python');
        setRisk(analysis.risk, recommendation(analysis.risk));
        addCase('Python: הורץ Packet Inspector על לוג תעבורה');
        say('יפה. Python בדק סימנים בתוך pkt, וכל תנאי שינה את Packet Risk.');
      } else {
        say('הכניסו לוג תעבורה לפני ההרצה.');
      }
      render();
    });
    document.querySelectorAll('[data-packet-case]').forEach(button => {
      button.addEventListener('click', () => {
        state.activeCase = button.dataset.packetCase;
        const active = packetCases.find(item => item.id === state.activeCase);
        const risk = calcRisk(new Set(active?.signals || []));
        state.packetText = active?.log || state.packetText;
        setRisk(risk, active?.action || recommendation(risk));
        render();
      });
    });
    document.querySelector('[data-save-case]')?.addEventListener('click', () => {
      const active = packetCases.find(item => item.id === state.activeCase) || packetCases[0];
      const risk = calcRisk(new Set(active.signals));
      complete('cases');
      addCase(`הרצה: ${active.title} · Risk ${risk}%`);
      setRisk(risk, active.action);
      say('בדיקה נשמרה. עכשיו מסבירים את ההחלטה כמו צוות Network Defender.');
      render();
    });
    document.querySelectorAll('[data-report-field]').forEach(field => {
      field.addEventListener('input', () => {
        state.report[field.dataset.reportField] = field.value;
      });
    });
    document.querySelector('[data-check-report]')?.addEventListener('click', () => {
      const ok = Object.values(state.report).every(value => value.trim().length >= 10);
      if (ok) {
        complete('report');
        addCase('Network Defense Report: הוגש דוח תעבורה');
        say('שיעור 6 הושלם. חקרתם תעבורה ובניתם Packet Inspector.');
      } else {
        say('כתבו משפט קצר בכל שדה. הדוח צריך להסביר את התעבורה, הסימנים והחלטת ההגנה.');
      }
      render();
    });
  }

  function render(options = {}) {
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;
    renderShell();
    $('stationContent').innerHTML = renderStationVideo() + renderContent();
    bindDynamicEvents();
    if (options.preserveScroll) {
      const restoreScroll = () => {
        window.scrollTo({ left: scrollX, top: scrollY, behavior: 'auto' });
      };
      requestAnimationFrame(() => {
        restoreScroll();
        requestAnimationFrame(restoreScroll);
      });
    }
  }

  function startRoutePointerDrag(event, button) {
    const pieceId = button.dataset.routePiece;
    routeDrag = {
      pieceId,
      button,
      startX: event.clientX,
      startY: event.clientY,
      moved: false,
      ghost: null
    };
    button.setPointerCapture?.(event.pointerId);

    const move = moveEvent => {
      if (!routeDrag || routeDrag.pieceId !== pieceId) return;
      const dx = moveEvent.clientX - routeDrag.startX;
      const dy = moveEvent.clientY - routeDrag.startY;
      if (!routeDrag.moved && Math.hypot(dx, dy) < 6) return;
      if (!routeDrag.ghost) {
        routeDrag.moved = true;
        routeDrag.ghost = button.cloneNode(true);
        routeDrag.ghost.classList.add('route-drag-ghost');
        routeDrag.ghost.style.width = `${button.offsetWidth}px`;
        document.body.appendChild(routeDrag.ghost);
      }
      routeDrag.ghost.style.left = `${moveEvent.clientX}px`;
      routeDrag.ghost.style.top = `${moveEvent.clientY}px`;
      moveEvent.preventDefault();
    };

    const up = upEvent => {
      document.removeEventListener('pointermove', move);
      document.removeEventListener('pointerup', up);
      document.removeEventListener('pointercancel', cancel);
      const drag = routeDrag;
      routeDrag = null;
      if (!drag?.moved) return;
      ignoreRouteClick = true;
      setTimeout(() => { ignoreRouteClick = false; }, 0);
      drag.ghost?.remove();
      const target = document.elementFromPoint(upEvent.clientX, upEvent.clientY)?.closest?.('[data-route-slot]');
      if (target) {
        placeRoutePiece(target.dataset.routeSlot, drag.pieceId);
      } else {
        say('שחררו את החלק בתוך אחד המקומות במסלול.');
      }
      render({ preserveScroll: true });
      upEvent.preventDefault();
    };

    const cancel = () => {
      document.removeEventListener('pointermove', move);
      document.removeEventListener('pointerup', up);
      document.removeEventListener('pointercancel', cancel);
      routeDrag?.ghost?.remove();
      routeDrag = null;
    };

    document.addEventListener('pointermove', move, { passive: false });
    document.addEventListener('pointerup', up);
    document.addEventListener('pointercancel', cancel);
  }

  $('nextStation').addEventListener('click', () => {
    if (state.station === 0) {
      complete('brief');
      addCase('פתיחה: משימת Packet Patrol הוצגה');
    }
    if (state.station < stations.length - 1) state.station += 1;
    render();
  });
  $('prevStation').addEventListener('click', () => {
    if (state.station > 0) state.station -= 1;
    render();
  });
  $('resetLab').addEventListener('click', () => {
    state.station = 0;
    state.xp = 0;
    state.risk = 0;
    state.caseFile = [];
    state.completed.clear();
    state.watchedConcepts.clear();
    state.conceptTasks = {};
    state.selectedRoutePiece = '';
    state.route = {};
    state.activeCase = 'coins';
    state.packetInvestigation = {};
    state.packetText = 'src=10.0.0.23 dns=free-coins.example dst=198.51.100.77 proto=http path=/login?password= encrypted=false unknown=true';
    state.pythonRan = false;
    state.report = { seen: '', signals: '', action: '' };
    setRisk(0, 'הסיכון יתעדכן אחרי בדיקת לוג תעבורה.');
    say('התחלנו מחדש. בואו נחקור תעבורת רשת עם Python ותנאי if.');
    render();
  });

  render();
}());
