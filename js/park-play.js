const params = new URLSearchParams(location.search);
const lessonId = Number(params.get('lesson') || 1);
const lessons = window.PARK_LESSONS || [];
const controls = window.PARK_CONTROLS || {};
const settings = window.PARK_SETTINGS || {};
const lesson = lessons.find((item) => item.id === lessonId) || lessons[0];
let selectedControl = null;
let selectedSetting = null;
let selectedMiniPlan = null;

const miniPlans = {
  1: { question: 'מה עוד יעזור לבוקר להתחיל רגוע?', correct: 'quietMusic', options: [
    { id: 'flashLights', icon: '✨', text: 'אורות מהבהבים חזקים' },
    { id: 'quietMusic', icon: '🎵', text: 'מוזיקה חלשה בכניסה' },
    { id: 'fastSpin', icon: '⚡', text: 'סיבוב מהיר במיוחד' }
  ], result: 'המוזיקה החלשה מוסיפה אווירה נעימה בלי להלחיץ.' },
  2: { question: 'מה כדאי להכין ליד התחנה?', correct: 'lineSign', options: [
    { id: 'bigBubbles', icon: '🫧', text: 'המון בועות על המסילה' },
    { id: 'darkStage', icon: '🌙', text: 'לכבות את האורות בתחנה' },
    { id: 'lineSign', icon: '🎟️', text: 'שלט קטן לתור מסודר' }
  ], result: 'שלט לתור עוזר לילדים לעלות לרכבת בנחת.' },
  3: { question: 'מה עוד יעזור למופע להרגיש ברור וחגיגי?', correct: 'stageMusic', options: [
    { id: 'stageMusic', icon: '🎵', text: 'מוזיקת רקע בינונית' },
    { id: 'restCorner', icon: '🪑', text: 'פינת מנוחה שקטה' },
    { id: 'slowWheel', icon: '🎡', text: 'גלגל ענק איטי' }
  ], result: 'מוזיקת רקע בינונית מחזקת את המופע בלי להשתלט עליו.' },
  4: { question: 'מה עוד מתאים לאזור הכניסה?', correct: 'welcomeSign', options: [
    { id: 'strongLights', icon: '✨', text: 'אורות חזקים בעיניים' },
    { id: 'welcomeSign', icon: '👋', text: 'שלט ברוכים הבאים' },
    { id: 'fastTrain', icon: '🚂', text: 'רכבת מהירה בכניסה' }
  ], result: 'שלט קבלת פנים מתאים לאזור רגוע שבו אנשים נכנסים.' },
  5: { question: 'מה עוד יוסיף למסיבת הסיום?', correct: 'partyMusic', options: [
    { id: 'quietCorner', icon: '🤫', text: 'שקט מוחלט' },
    { id: 'closedGate', icon: '🚧', text: 'שער סגור' },
    { id: 'partyMusic', icon: '🎵', text: 'מוזיקה שמחה' }
  ], result: 'מוזיקה שמחה מחזקת את תחושת החגיגה.' },
  6: { question: 'מה עוד מתאים לילדים שרוצים סיבוב שמח?', correct: 'seatCheck', options: [
    { id: 'seatCheck', icon: '✅', text: 'בדיקת מושבים לפני הסיבוב' },
    { id: 'sleepSign', icon: '😴', text: 'שלט נא לישון' },
    { id: 'darkLights', icon: '🌑', text: 'לכבות הכול' }
  ], result: 'בדיקת מושבים מתאימה לפני שמתחילים סיבוב.' },
  7: { question: 'מה עוד מתאים לתצפית מהגובה?', correct: 'photoSpot', options: [
    { id: 'loudMusic', icon: '🔊', text: 'מוזיקה חזקה מאוד' },
    { id: 'photoSpot', icon: '📸', text: 'נקודת צילום למעלה' },
    { id: 'waterDrops', icon: '💧', text: 'טיפות מים על החלון' }
  ], result: 'נקודת צילום מתאימה למתקן שרואים ממנו את כל המקום.' },
  8: { question: 'מה עוד יעזור לנסיעה במסילה להיות נעימה?', correct: 'gentleBell', options: [
    { id: 'scarySound', icon: '😱', text: 'צליל מפחיד וחזק' },
    { id: 'tooManyBubbles', icon: '🫧', text: 'בועות שמסתירות את המסילה' },
    { id: 'gentleBell', icon: '🔔', text: 'צלצול קטן לפני היציאה' }
  ], result: 'צלצול קטן מכין את הילדים לנסיעה בלי להפחיד.' },
  9: { question: 'מה עוד יכול לעזור לקהל בזמן מופע?', correct: 'clearSeats', options: [
    { id: 'clearSeats', icon: '🪑', text: 'מקומות ישיבה מול הבמה' },
    { id: 'closedCurtain', icon: '🎭', text: 'וילון סגור כל הזמן' },
    { id: 'quietDark', icon: '🌑', text: 'חושך בלי אורות' }
  ], result: 'מקומות ישיבה מול הבמה עוזרים לקהל לראות את המופע.' },
  10: { question: 'מה עוד ישמור על פינת המנוחה נעימה?', correct: 'waterTable', options: [
    { id: 'partyBubbles', icon: '🫧', text: 'מסיבת בועות חזקה' },
    { id: 'waterTable', icon: '💧', text: 'שולחן מים קטן' },
    { id: 'fastCarousel', icon: '🎠', text: 'קרוסלה מהירה ליד הכיסאות' }
  ], result: 'שולחן מים מתאים לפינה רגועה שבה נחים.' },
  11: { question: 'מה עוד יוסיף חגיגה בלי להגזים?', correct: 'smallStars', options: [
    { id: 'hugeNoise', icon: '📣', text: 'רעש חזק מאוד' },
    { id: 'turnOffShow', icon: '🔌', text: 'לכבות את המופע' },
    { id: 'smallStars', icon: '⭐', text: 'כוכבים קטנים לקישוט' }
  ], result: 'כוכבים קטנים מוסיפים חגיגה בלי להשתלט על המופע.' },
  12: { question: 'מה עוד מתאים לסיום יום בלונה פארק?', correct: 'goodbyeSign', options: [
    { id: 'goodbyeSign', icon: '👋', text: 'שלט תודה ולהתראות' },
    { id: 'newLongLine', icon: '🎟️', text: 'לפתוח תור ארוך חדש' },
    { id: 'extraLoud', icon: '🔊', text: 'מוזיקה חזקה מאוד כשעייפים' }
  ], result: 'שלט פרידה סוגר את יום הכיף בצורה נעימה.' }
};

function shuffled(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

const miniPlanSource = miniPlans[lesson.id] || miniPlans[1];
const miniPlan = { ...miniPlanSource, options: shuffled(miniPlanSource.options) };




const gentleHints = {
  1: {
    control: 'רמז: חפשו מתקן שאפשר לראות ממנו את הלונה פארק מלמעלה, בקצב רגוע.',
    wrongControl: 'נסו לחשוב איזה מתקן עולה גבוה אבל יכול לזוז בקצב מאוד רגוע.',
    setting: 'המתקן מתאים. עכשיו חשבו איזו הגדרה תעזור לילדים קטנים לא להיבהל.',
    miniPlan: 'הפקודה מתאימה. עכשיו הוסיפו משהו קטן שיעשה התחלה נעימה ושקטה.'
  },
  2: {
    control: 'רמז: חפשו מתקן שנוסע על מסילה ומתאים לילדים שרוצים סיבוב כיפי.',
    wrongControl: 'נסו לבחור מתקן שמתקדם במסילה, ולא מתקן שנשאר במקום ומסתובב.',
    setting: 'המתקן מתאים. עכשיו בחרו קצב כיפי — לא איטי מדי ולא מהיר מדי.',
    miniPlan: 'הפקודה מתאימה. עכשיו הוסיפו משהו שיעזור לילדים לעלות בצורה מסודרת.'
  },
  3: {
    control: 'רמז: חפשו משהו שעוזר לראות טוב יותר כשמתחיל להחשיך.',
    wrongControl: 'נסו לבחור דבר שעוזר לבמה להיות ברורה לעיניים של הקהל.',
    setting: 'הדבר שבחרתם מתאים. עכשיו חשבו אם במופע חשוך צריך מעט, בינוני או הרבה ממנו.',
    miniPlan: 'הפקודה מתאימה. עכשיו הוסיפו משהו קטן שיכול ללוות מופע בלי להפריע.'
  },
  4: {
    control: 'רמז: חפשו משהו שיוצר אווירה בכניסה, אבל עדיין מאפשר לאנשים לדבר.',
    wrongControl: 'נסו לבחור דבר ששומעים אותו ברקע, ולא מתקן שעולים עליו.',
    setting: 'הדבר שבחרתם מתאים. עכשיו חשבו איזו עוצמה לא תפריע לקניית כרטיסים.',
    miniPlan: 'הפקודה מתאימה. עכשיו הוסיפו משהו שמקבל את פני האורחים בנעימות.'
  },
  5: {
    control: 'רמז: חפשו אפקט שרואים באוויר ומתאים למסיבת סיום.',
    wrongControl: 'נסו לבחור משהו שממלא את האזור באווירה חגיגית, לא מתקן נסיעה.',
    setting: 'האפקט מתאים. עכשיו חשבו איזו כמות מתאימה למסיבה גדולה ושמחה.',
    miniPlan: 'הפקודה מתאימה. עכשיו הוסיפו עוד משהו שיכול להפוך מסיבה לשמחה.'
  },
  6: {
    control: 'רמז: חפשו מתקן שמסתובב ומתאים לילדים שרוצים סיבוב שמח.',
    wrongControl: 'נסו לבחור מתקן של סיבוב במקום, לא מתקן שנוסע במסילה.',
    setting: 'המתקן מתאים. עכשיו בחרו קצב שמח אבל לא מהיר מדי.',
    miniPlan: 'הפקודה מתאימה. עכשיו הוסיפו פעולה קטנה שכדאי לעשות לפני שמתחילים סיבוב.'
  },
  7: {
    control: 'רמז: חפשו מתקן גבוה במיוחד שרואים ממנו את כל המקום.',
    wrongControl: 'נסו לבחור מתקן שמתאים לתצפית מלמעלה, לא לנסיעה במסילה.',
    setting: 'המתקן מתאים. עכשיו בחרו קצב עדין ולא מפחיד.',
    miniPlan: 'הפקודה מתאימה. עכשיו הוסיפו משהו שמתאים למקום עם נוף יפה.'
  },
  8: {
    control: 'רמז: חפשו מתקן שנוסע במסילה ועושה סיבוב קצר.',
    wrongControl: 'נסו לבחור מתקן שמתקדם בדרך משלו, ולא רק מסתובב במקום.',
    setting: 'המתקן מתאים. עכשיו בחרו קצב שמרגיש מרגש אבל נעים.',
    miniPlan: 'הפקודה מתאימה. עכשיו הוסיפו סימן קטן שמכין את הילדים ליציאה.'
  },
  9: {
    control: 'רמז: חפשו מה יכול לגרום לבמה לבלוט בזמן מופע.',
    wrongControl: 'נסו לבחור משהו שעוזר לקהל לראות את הבמה טוב יותר.',
    setting: 'הדבר שבחרתם מתאים. עכשיו חשבו איזו עוצמה תבליט את הבמה.',
    miniPlan: 'הפקודה מתאימה. עכשיו הוסיפו משהו שיעזור לקהל לצפות במופע בנחת.'
  },
  10: {
    control: 'רמז: חפשו משהו שיכול להיות נעים ברקע של פינת מנוחה.',
    wrongControl: 'נסו לבחור דבר שמתאים לאווירה שקטה, לא לאטרקציה רועשת.',
    setting: 'הדבר שבחרתם מתאים. עכשיו בחרו עוצמה שלא תפריע לאנשים לנוח.',
    miniPlan: 'הפקודה מתאימה. עכשיו הוסיפו משהו שמתאים לאנשים שיושבים ונחים.'
  },
  11: {
    control: 'רמז: חפשו אפקט יפה באוויר שמתאים לחגיגה קטנה.',
    wrongControl: 'נסו לבחור משהו חגיגי שרואים סביב הבמה, אבל שלא מסתיר את המופע.',
    setting: 'האפקט מתאים. עכשיו בחרו כמות מורגשת, אבל לא מוגזמת.',
    miniPlan: 'הפקודה מתאימה. עכשיו הוסיפו קישוט קטן שלא משתלט על החגיגה.'
  },
  12: {
    control: 'רמז: חפשו מתקן מסתובב שמתאים לסיום שמח של היום.',
    wrongControl: 'נסו לבחור מתקן של סיבוב שמח, לא משהו מהיר או רועש מדי.',
    setting: 'המתקן מתאים. עכשיו בחרו קצב שמתאים לילדים שכבר קצת עייפים.',
    miniPlan: 'הפקודה מתאימה. עכשיו הוסיפו משהו קטן שסוגר את היום בצורה נעימה.'
  }
};

function setResult(text, success = false) {
  const result = document.getElementById('result');
  result.textContent = text;
  result.style.color = success ? '#15803d' : '#7e22ce';
}

function renderOptions(containerId, items, selected, type) {
  document.getElementById(containerId).innerHTML = Object.entries(items).map(([id, item]) => `
    <button type="button" class="option-card ${selected === id ? 'active' : ''}" data-${type}="${id}">
      <span class="option-icon">${item.icon}</span><span>${item.label}</span>
    </button>
  `).join('');
  document.querySelectorAll(`[data-${type}]`).forEach((button) => {
    button.addEventListener('click', () => {
      if (type === 'control') selectedControl = button.dataset.control;
      if (type === 'setting') selectedSetting = button.dataset.setting;
      renderAll();
    });
  });
}

function renderMiniPlan() {
  const question = document.getElementById('mini-plan-question');
  const box = document.getElementById('mini-plan-options');
  if (!question || !box) return;
  question.textContent = miniPlan.question;
  box.innerHTML = miniPlan.options.map((item) => `
    <button type="button" class="option-card ${selectedMiniPlan === item.id ? 'active' : ''}" data-mini-plan="${item.id}">
      <span class="option-icon">${item.icon}</span><span>${item.text}</span>
    </button>
  `).join('');
  document.querySelectorAll('[data-mini-plan]').forEach((button) => {
    button.addEventListener('click', () => {
      selectedMiniPlan = button.dataset.miniPlan;
      renderAll();
    });
  });
}

function renderCommandPreview() {
  const control = selectedControl ? controls[selectedControl] : null;
  const setting = selectedSetting ? settings[selectedSetting] : null;
  document.getElementById('command-preview').innerHTML = `
    <span>${control ? control.icon : '🎛️'}</span>
    <b>הפעל</b>
    <span>${control ? control.label : 'בחרו מתקן'}</span>
    <b>במצב</b>
    <span>${setting ? `${setting.icon} ${setting.label}` : 'בחרו הגדרה'}</span>
  `;
}

function renderRideStage() {
  const control = selectedControl ? controls[selectedControl] : controls[lesson.control];
  const setting = selectedSetting ? settings[selectedSetting] : null;
  const levelClass = selectedSetting || (selectedControl ? 'medium' : 'empty');
  document.getElementById('ride-stage').innerHTML = `
    <div class="ride ${levelClass} ${selectedControl || lesson.control}">
      <div class="ride-icon">${control.icon}</div>
      <div class="ride-label">${control.label}</div>
      <div class="ride-setting">${setting ? setting.label : 'עוד לא נבחרה הגדרה'}</div>
    </div>
  `;
}

function renderAll() {
  renderOptions('control-options', controls, selectedControl, 'control');
  renderOptions('setting-options', settings, selectedSetting, 'setting');
  renderMiniPlan();
  renderCommandPreview();
  renderRideStage();
  renderNextStep(false);
  setResult('');
}

function runCommand() {
  if (!selectedControl || !selectedSetting || !selectedMiniPlan) {
    setResult('צריך לבחור מתקן, הגדרה ותוספת קטנה ללונה פארק.');
    return;
  }
  const controlOk = selectedControl === lesson.control;
  const settingOk = selectedSetting === lesson.setting;
  const miniPlanOk = selectedMiniPlan === miniPlan.correct;
  if (controlOk && settingOk && miniPlanOk) {
    const reason = lesson.successReason ? ` ${lesson.successReason}` : '';
    setResult(`מצוין! ${lesson.commandText}. ${lesson.result}${reason} ${miniPlan.result} 🎉`, true);
    window.SisiCourseCertificate?.show({ lessons, lesson });
    renderNextStep(true);
    return;
  }
  if (!controlOk && !settingOk) {
    setResult('כמעט. גם המתקן וגם ההגדרה לא מתאימים לסיפור.');
  } else if (!controlOk) {
    setResult('ההגדרה מתאימה, אבל צריך לבחור את המתקן הנכון בלונה פארק.');
  } else if (!settingOk) {
    setResult('המתקן נכון, אבל ההגדרה לא מתאימה לצורך של הילדים.');
  } else {
    setResult('המתקן וההגדרה נכונים. בדקו שוב את התוספת הקטנה שהוספתם ללונה פארק.');
  }
  renderNextStep(false);
}

function showHint() {
  const hint = gentleHints[lesson.id];
  if (hint) {
    if (!selectedControl) {
      setResult(hint.control);
    } else if (selectedControl !== lesson.control) {
      setResult(hint.wrongControl);
    } else if (!selectedSetting || selectedSetting !== lesson.setting) {
      setResult(hint.setting);
    } else if (!selectedMiniPlan || selectedMiniPlan !== miniPlan.correct) {
      setResult(hint.miniPlan);
    } else {
      setResult('נראה שבחרתם הכול נכון — אפשר להריץ!');
    }
    renderNextStep(false);
    return;
  }

  setResult('רמז: קראו שוב את הסיפור וחפשו מה הכי מתאים למצב של הילדים.');
  renderNextStep(false);
}

function clearCommand() {
  selectedControl = null;
  selectedSetting = null;
  selectedMiniPlan = null;
  renderAll();
}

function nextTarget() {
  const currentIndex = lessons.findIndex((item) => item.id === lesson.id);
  const nextLesson = lessons[currentIndex + 1];
  if (nextLesson) return { href: `park-play.html?lesson=${nextLesson.id}`, label: `➡️ המשך למתקן ${nextLesson.id}` };
  return { href: 'mail.html', label: '✉️ לשיעור הבא' };
}

function renderNextStep(show = false) {
  const box = document.getElementById('next-step');
  if (!box) return;
  if (!show) { box.innerHTML = ''; return; }
  const target = nextTarget();
  box.innerHTML = `<div class="next-step-note">המתקן הוגדר נכון! ממשיכים למתקן הבא בלונה פארק.</div><a class="btn" href="${target.href}">${target.label}</a>`;
  window.SisiSuccessDialog?.show({ message: box.querySelector('.next-step-note')?.textContent || 'כל הכבוד! אפשר להמשיך קדימה או לנסות שוב.', lessons, lesson, nextHref: target.href, nextLabel: target.label, onRepeat: () => window.location.reload() });
}

function init() {
  document.getElementById('page-title').textContent = `${lesson.emoji} ${lesson.title}`;
  document.getElementById('page-subtitle').textContent = `שיעור 11 • פקודה עם הגדרה • ${lesson.concept}`;
  document.getElementById('lesson-heading').textContent = `מתקן ${lesson.id}: ${lesson.title}`;
  document.getElementById('lesson-emoji').textContent = lesson.emoji;
  document.getElementById('story').textContent = lesson.story;
  document.getElementById('learning-note').innerHTML = `<b>רגע למידה:</b> ${lesson.learningNote}`;
  document.getElementById('goal-chip').textContent = lesson.challengeText || lesson.commandText;
  document.getElementById('check').addEventListener('click', runCommand);
  document.getElementById('hint').addEventListener('click', showHint);
  document.getElementById('clear').addEventListener('click', clearCommand);
  document.getElementById('lesson-nav').innerHTML = lessons.map((item) => `<a class="${item.id === lesson.id ? 'active' : ''}" href="park-play.html?lesson=${item.id}">${item.id}</a>`).join('');
  renderAll();
}

init();