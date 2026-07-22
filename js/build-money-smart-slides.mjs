import { writeFileSync } from 'node:fs';

const lessons = [
  {
    id: 1,
    title: 'כסף הוא בחירה',
    question: 'קיבלתם 600 ש״ח לחודש. איך תחלקו אותם?',
    color: '#0f766e',
    slides: [
      ['פתיחה', 'כסף הוא בחירה', 'קיבלתם 600 ש״ח לחודש. איך תחלקו אותם?', 'שאלה לכיתה: מה הדבר הראשון שהייתם שמים בתקציב?'],
      ['איפה כסף פוגש בני נוער?', 'כסף נמצא בהחלטות יומיומיות', 'אוכל בחוץ, בילויים, גיימינג, בגדים, מתנות, מנויים, תחבורה וחיסכון.', 'פעולה: בקשו מהתלמידים להצביע על קטגוריה אחת שהם פוגשים הכי הרבה.'],
      ['מאיפה הכסף מגיע?', 'מקורות הכנסה שונים', 'דמי כיס, עבודה, מתנות, מכירה, כסף לפי צורך והכנסה חד־פעמית.', 'דוגמה: עידו עובד קבוע; נועה עושה בייביסיטר מדי פעם. לשניהם יש הכנסה, אבל רק לאחד קל יותר לתכנן מראש.'],
      ['לאן הכסף הולך?', 'סוגי הוצאה', 'הוצאה חוזרת, מזדמנת, צפויה ובלתי צפויה.', 'דוגמה: מנוי של 30 ש״ח בחודש עולה 360 ש״ח בשנה.'],
      ['מהו תקציב?', 'תקציב הוא כלי בחירה', 'תוכנית שמראה כמה כסף צפוי להיכנס, כמה צפוי לצאת ולאילו מטרות הוא מיועד.', 'מסר: תקציב אינו עונש. הוא דרך לבחור מראש במקום להגיב בדיעבד.'],
      ['כסף מוגבל', 'מחסור', 'אי אפשר לקבל את כל מה שרוצים באותו זמן, ולכן צריך לבחור, לדחות או לוותר.', 'שאלה: מה קל לדחות ומה קשה לדחות?'],
      ['עלות אלטרנטיבית', 'המחיר של מה שלא בחרנו', 'המחיר של החלטה כולל גם את הדבר האחר שעליו ויתרנו.', 'דוגמה: נעליים ב־300 ש״ח יכולות לדחות בחודש את קניית הטלפון.'],
      ['כרית ביטחון', 'משאירים מקום להפתעות', 'סכום שנשאר פנוי להוצאות שלא תוכננו: תיקון מסך, יום הולדת, טיול, תחבורה או מנוי שנשכח.', 'פעולה: בקשו הצעות לאירועים בלתי צפויים שמתאימים לבני נוער.'],
      ['לא לכולם אותו מצב', 'החלטה תלויה בהקשר', 'דמי כיס, עבודה, כסף לפי צורך, עזרה בבית ומטרות שונות משפיעים על הבחירה.', 'דגש רגישות: אין לבקש מהתלמידים לחשוף נתונים אישיים.'],
      ['מעבר ללומדה', 'עכשיו מתנסים', 'בחרו דמות, בנו עבורה תקציב והתמודדו עם אירוע בלתי צפוי.', 'הנחיה: עבדו עם דמות אם לא נוח לעבוד עם נתונים אישיים.'],
      ['סיכום', 'שלושה משפטים לזכור', 'כסף מוגבל ולכן צריך לבחור. לכל בחירה יש עלות אלטרנטיבית. תקציב טוב משאיר מקום לבלתי צפוי.', 'שאלת יציאה: על מה ויתרתם בתקציב שבניתם?']
    ]
  },
  {
    id: 2,
    title: 'איך גורמים לנו לקנות?',
    question: 'האם קניתם פעם משהו שלא תכננתם לקנות?',
    color: '#7c3aed',
    slides: [
      ['פתיחה', 'איך גורמים לנו לקנות?', 'האם קניתם פעם משהו שלא תכננתם לקנות?', 'שאלה לכיתה: מה השפיע — מחיר, חברים, פרסומת או לחץ זמן?'],
      ['מה משפיע על קנייה?', 'החלטה לא נוצרת בחלל ריק', 'פרסומות, משפיענים, חברים, לחץ זמן, מבצעים, FOMO ונוחות התשלום.', 'פעולה: סמנו גורם אחד שמופיע הכי הרבה באפליקציות.'],
      ['צורך, רצון חשוב ורצון רגעי', 'לא כל רצון הוא בזבוז', 'אותו מוצר יכול להיות צורך או רצון לפי ההקשר.', 'דוגמה: נעליים הן צורך אם הישנות נהרסו, ורצון אם זה זוג נוסף רק בגלל מותג.'],
      ['FOMO', 'הפחד להחמיץ', 'תחושה שאם לא נפעל עכשיו, נפסיד מוצר, אירוע או הזדמנות.', 'דוגמאות: סקין מוגבל, כרטיסים אחרונים, טרנד בטיקטוק או “המבצע נגמר בעוד שעה”.'],
      ['האם מבצע באמת חוסך?', 'הנחה אינה תמיד חיסכון', '50% הנחה, אחד ועוד אחד, משלוח חינם וחודש ראשון חינם יכולים לעודד קנייה שלא תוכננה.', 'שאלה: האם חסכתי 50 ש״ח אם לא תכננתי לקנות כלל?'],
      ['המחיר האמיתי', 'לא רק המחיר שעל הכפתור', 'מחיר מוצר, משלוח, עמלות, חידוש אוטומטי, תוספות ועלות שנתית.', 'פעולה: בקשו דוגמה לעלות נסתרת שתלמידים מכירים.'],
      ['מטבעות וירטואליים', 'כסף שמרגיש פחות אמיתי', '1,000 מטבעות עולים 40 ש״ח; פריט של 750 מטבעות שווה 30 ש״ח.', 'שאלה: מה קורה ל־250 המטבעות שנותרו?'],
      ['דפוסים מניפולטיביים', 'עיצוב שדוחף החלטה', 'טיימר, כפתור ביטול מוסתר, תיבה מסומנת מראש, “נשארו רק שניים” וקושי לבטל מנוי.', 'פעולה: בלומדה התלמידים יסמנו את הטריקים במסכים מדומים.'],
      ['משפיענים ופרסום', 'אמון אינו בדיקה', 'בודקים האם התוכן ממומן, האם מוצגים חסרונות, האם המוצר מתאים לי והאם אני קונה בגלל האדם או המוצר.', 'דגש: לא לתקוף משפיענים; ללמד שאלות בדיקה.'],
      ['עצור–בדוק–בחר', 'חמש שאלות לפני קנייה', 'כמה זה עולה באמת? כמה זמן אשתמש? על מה אני מוותר? האם יש חלופה? האם עדיין ארצה את זה מחר?', 'פעולה: התלמידים בונים כרטיס אישי בלומדה.'],
      ['מעבר ללומדה', 'חושפים את הטריקים', 'זהו טריקים שיווקיים, חשבו עלות אמיתית וקבלו החלטה עבור דמות.', 'הנחיה: בקשו נימוק, לא רק בחירה.'],
      ['סיכום', 'קנייה חכמה היא קנייה מודעת', 'מבצע אינו הופך קנייה לכדאית. המחיר האמיתי כולל עלויות נסתרות. עצירה קצרה מונעת החלטות אימפולסיביות.', 'שאלת יציאה: איזה כלל קנייה תאמצו?']
    ]
  },
  {
    id: 3,
    title: 'כסף עכשיו מול כסף בעתיד',
    question: '100 ש״ח היום או 110 ש״ח בעוד שנה?',
    color: '#2563eb',
    slides: [
      ['פתיחה', 'כסף עכשיו מול כסף בעתיד', '100 ש״ח היום או 110 ש״ח בעוד שנה?', 'שאלה: כמה תוספת הייתה גורמת לכם לחכות?'],
      ['הזמן משנה את ערך הכסף', 'כסף היום וכסף בעתיד אינם מרגישים אותו דבר', 'מה אפשר לעשות בכסף היום? מה הסיכון בהמתנה? כמה ודאות יש לקבלת הכסף בעתיד?', 'דגש: אין תשובה אחת; בודקים מטרה והקשר.'],
      ['מהי ריבית?', 'מחיר הזמן של הכסף', 'ריבית היא המחיר שמשלמים או מקבלים על שימוש בכסף לאורך זמן.', 'חוסכים עשויים לקבל ריבית; לווים בדרך כלל משלמים ריבית.'],
      ['מהי קרן?', 'הסכום המקורי', 'הקרן היא סכום הכסף המקורי שעליו מחשבים ריבית.', 'דוגמה: אם הפקדתי 1,000 ש״ח, זו הקרן.'],
      ['ריבית פשוטה', 'אותה תוספת בכל שנה', '1,000 ש״ח בריבית של 5% לשנה מוסיפים 50 ש״ח בכל שנה. לאחר שלוש שנים: 1,150 ש״ח.', 'פעולה: בקשו לחשב שנה רביעית.'],
      ['ריבית דריבית', 'ריבית על הריבית', 'גם הריבית שכבר נצברה מתחילה לצבור ריבית.', 'דוגמה: שנה 1 — 1,050; שנה 2 — 1,102.50; שנה 3 — 1,157.63.'],
      ['ריבית פועלת בשני הכיוונים', 'לטובתנו או נגדנו', 'היא יכולה להגדיל חיסכון, אך גם להגדיל הלוואה, מינוס או חוב.', 'שאלה: למה חשוב להבין את זה לפני אשראי?'],
      ['מהו אשראי?', 'כסף עכשיו, החזר בעתיד', 'אשראי הוא שימוש בכסף עכשיו והחזרתו בעתיד.', 'מסר: אשראי הוא התחייבות להכנסה עתידית.'],
      ['תשלומים אינם המחיר', 'החודשי הקטן מסתיר מחיר כולל', '12 תשלומים של 95 ש״ח הם 1,140 ש״ח.', 'פעולה: שאלו איזו הצעה “מרגישה” זולה יותר ומדוע.'],
      ['סוגי תשלום', 'לא כל תשלום עתידי זהה', 'תשלום אחד, תשלומים ללא ריבית, תשלומים עם ריבית, דחיית תשלום, הלוואה ומנוי מתמשך.', 'דגש: תשלומים אינם תמיד רעים, אבל חייבים להבין תנאים.'],
      ['יכולת החזר', 'לא רק החודש הנוכחי', 'לא מספיק לבדוק אם אפשר לשלם החודש. צריך לבדוק אם אפשר לעמוד בהתחייבות לאורך כל התקופה.', 'שאלה: מה קורה אם ההכנסה יורדת?'],
      ['מעבר ללומדה', 'מחשבים ומתנסים', 'השוו ריבית פשוטה ודריבית, חשבו מחיר כולל ובדקו התחייבויות של דמות.', 'הנחיה: שימו לב לדיסקליימר בסימולטור.'],
      ['סיכום', 'ארבעה מסרים', 'ריבית היא מחיר הזמן. דריבית נצברת גם על הריבית. תשלום חודשי קטן אינו בהכרח מחיר נמוך. אשראי משתמש היום בכסף של העתיד.', 'שאלת יציאה: איזו שאלה תשאלו לפני תשלומים?']
    ]
  },
  {
    id: 4,
    title: 'איך כסף נשמר, גדל ומשמש אחרים?',
    question: 'איפה כדאי לשמור כסף שצריך בעוד חודש, ואיפה כסף שצריך בעוד חמש שנים?',
    color: '#f59e0b',
    slides: [
      ['פתיחה', 'איך כסף נשמר, גדל ומשמש אחרים?', 'איפה כדאי לשמור כסף שצריך בעוד חודש, ואיפה כסף שצריך בעוד חמש שנים?', 'שאלה: האם אותה תשובה מתאימה לשתי המטרות?'],
      ['חיסכון מול השקעה', 'שתי מטרות שונות', 'חיסכון מדגיש שמירת כסף למטרה, יציבות וזמינות. השקעה מחפשת תשואה אפשרית לצד אפשרות להפסד.', 'דגש: השקעה אינה תחליף לכסף שנדרש בקרוב.'],
      ['ארבע שאלות לפני בחירה', 'מטרה, זמן, נזילות, סיכון', 'מה המטרה? לכמה זמן הכסף יכול להישאר? כמה חשובה נזילות? כמה אי־ודאות אפשר לשאת?', 'פעולה: בחרו מטרה אחת וענו עליה בארבע השאלות.'],
      ['נזילות', 'כמה מהר הכסף זמין?', 'נזילות היא היכולת להפוך כסף לזמין במהירות וללא הפסד משמעותי.', 'דוגמה: כסף לטיול בעוד חודש צריך נזילות גבוהה.'],
      ['פיקדון ותוכנית חיסכון', 'כסף בתנאים מוגדרים', 'כסף שמופקד לתקופה ובתנאים מסוימים ועשוי לצבור ריבית.', 'בודקים: ריבית, תקופה, משיכה, יציאה מוקדמת וריבית קבועה או משתנה.'],
      ['איזו תוכנית מתאימה?', 'אין פתרון אחד לכל מטרה', 'ריבית גבוהה עם נעילה לשנה מול ריבית נמוכה עם משיכה חופשית.', 'שאלה: מה מתאים לטיול בעוד חודשיים ומה לרישיון בעוד שנה?'],
      ['קופת גמל', 'בריכה משותפת מנוהלת', 'חוסכים רבים מעבירים כסף לגוף שמנהל ומשקיע אותו לפי מסלול.', 'הערך יכול לעלות או לרדת, יש דמי ניהול ותשואות עבר אינן מבטיחות עתיד.'],
      ['חיסכון לכל ילד', 'מקרה בוחן', 'חיסכון שמצטבר לאורך שנים ויכול להתנהל במסלול בנקאי או בקופת גמל, בהתאם לבחירה ולכללים.', 'דגש: לא מציגים סכומים קבועים כי כללים משתנים.'],
      ['מהי איגרת חוב?', 'הלוואה עם תעודה', 'מדינה או חברה יכולות ללוות כסף מהציבור. מי שקונה איגרת חוב מלווה כסף למנפיק.', 'מסר: זו אינה מניה; זה קשר של חוב לפי תנאים.'],
      ['דוגמת איגרת חוב', 'מפרקים מספרים פשוטים', 'חברה מגייסת 100,000 ש״ח באמצעות 1,000 איגרות של 100 ש״ח.', 'המשקיע מלווה 100 ש״ח ומקבל ריבית והחזר לפי התנאים.'],
      ['סיכון באיגרת חוב', 'גם חוב כולל סיכון', 'האם הגוף יכול להחזיר? מתי הכסף יוחזר? מה הריבית? האם מחיר האיגרת יכול להשתנות?', 'דגש: הלוואה למדינה אינה זהה להלוואה לחברה קטנה.'],
      ['תשואה וסיכון', 'רווח אפשרי ואי־ודאות', 'תשואה היא מה שהכסף הרוויח או הפסיד. סיכון הוא האפשרות שהתוצאה תהיה שונה מהציפייה.', 'אין להציג תשואה גבוהה כהבטחה.'],
      ['פיזור', 'לא תלויים בדבר אחד', 'פיזור הוא חלוקת כסף בין כמה נכסים כדי לא להיות תלויים רק באחד.', 'דוגמה פשוטה: לא לשים את כל הביצים בסל אחד.'],
      ['אינפלציה וכוח קנייה', 'אותו מספר, פחות קנייה', 'כאשר המחירים עולים, אותו סכום כסף קונה פחות.', 'שאלה: מה קורה ל־100 ש״ח אם סל מוצרים התייקר?'],
      ['מעבר ללומדה', 'משווים אפיקים', 'התאימו אפיקים למטרות והשוו בין פיקדון, קופת גמל ואיגרת חוב לפי זמן, נזילות וסיכון.', 'הנחיה: נימוק חשוב יותר מבחירת “האפיק הכי טוב”.'],
      ['סיכום', 'אין אפיק אחד לכל מטרה', 'חיסכון והשקעה אינם אותו דבר. הזמן והנזילות משפיעים על הבחירה. תשואה כוללת סיכון ואי־ודאות.', 'דיסקליימר: זהו חינוך פיננסי, לא המלצה להשקעה.']
    ]
  },
  {
    id: 5,
    title: 'כסף דיגיטלי, הונאות ותוכנית מסכמת',
    question: 'חבר מבקש 180 ש״ח בדחיפות למספר לא מוכר. מה עושים?',
    color: '#e11d48',
    slides: [
      ['פתיחה', 'כסף דיגיטלי, הונאות ותוכנית מסכמת', 'חבר מבקש 180 ש״ח בדחיפות למספר לא מוכר. מה עושים?', 'שאלה: מה הדבר הראשון שבודקים לפני העברה?'],
      ['כסף דיגיטלי הוא כסף אמיתי', 'הקלות לא מבטלת משמעות', 'לפני העברה בודקים שם, מספר, סכום, סיבה וזהות המבקש.', 'מסר: העברה לאדם הלא נכון עלולה להיות קשה לביטול.'],
      ['אימות בערוץ אחר', 'לא מסתפקים בצ׳אט חשוד', 'מתקשרים למספר המוכר או פונים לאדם בדרך אחרת.', 'דוגמה: אם ההודעה הגיעה ממספר חדש, מתקשרים למספר הישן.'],
      ['סימני אזהרה', 'עצירה לפני פעולה', 'לחץ, פרס, קוד אימות, קישור לא מוכר, סודיות, תשלום מראש וחשבון חדש.', 'פעולה: בקשו מהכיתה לבחור את הסימן המסוכן ביותר.'],
      ['פישינג', 'הודעה שנראית אמינה', 'ניסיון לגרום לנו למסור פרטים, סיסמה או קוד באמצעות הודעה שנראית אמינה.', 'דגש: לא מוסרים קוד אימות — גם אם ההודעה מלחיצה.'],
      ['ארבע פעולות', 'תפריט תגובה', 'לפעול, לבדוק, להתייעץ או להימנע.', 'בלומדה התלמידים בוחרים פעולה לכל תרחיש ומקבלים משוב.'],
      ['חיסכון, השקעה, ספקולציה והימור', 'לא כל סיכון זהה', 'חיסכון שומר למטרה; השקעה נבדקת לפי מוצר, זמן וסיכון; ספקולציה מתמקדת בשינוי מחיר; הימור תלוי בתוצאה שאינה בשליטת המשתתף.', 'שאלה: איפה נכנסת הבטחת “רווח מהיר”?'],
      ['תשואה מובטחת?', 'סימן אזהרה חזק', 'הבטחה לרווח גבוה, מהיר וללא סיכון היא סימן אזהרה.', 'דגש: תשואה וסיכון הולכים יחד; אין ודאות ברווח.'],
      ['משפיענים והשקעות', 'בודקים אינטרס ומקור', 'בדקו האם התוכן ממומן, מה מקור המידע והאם מוצגים גם הפסדים.', 'שאלה: האם האדם שממליץ מרוויח מכך שתפעלו?'],
      ['קריפטו כמקרה בוחן', 'לא כל תנודתיות היא הונאה', 'קריפטו אינו בהכרח הונאה, אך יכול להיות תנודתי וספקולטיבי מאוד.', 'מסר: סרטון ברשת אינו תחליף לבדיקה.'],
      ['החלטה טובה מול תוצאה טובה', 'לא מודדים רק תוצאה', 'רווח מקרי אינו הופך החלטה לא מבוססת להחלטה טובה.', 'וגם הפסד אחרי בדיקה אינו מוכיח בהכרח החלטה גרועה.'],
      ['מעבר לאתגר הסיום', 'חודש בחיי הדמות', 'ליווי דמות וקבלת החלטות בתקציב, קנייה, חיסכון, אשראי, השקעה והונאה דיגיטלית.', 'הנחיה: התלמידים מסבירים את תהליך קבלת ההחלטה.'],
      ['Money Smart Plan', 'התוצר המסכם', 'תמונת מצב, תקציב, יעד, החלטת קנייה, בדיקת אשראי, בחירת אפיק ובטיחות דיגיטלית.', 'המטרה היא תוכנית בסיסית לדמות, לא חשיפת פרטים אישיים.'],
      ['שש שאלות לפני החלטה', 'כלי לחיים', 'מה המטרה? כמה זה באמת עולה? על מה אני מוותר? מה יכול להשתבש? האם בדקתי מספיק? האם כדאי להתייעץ?', 'פעולה: כל תלמיד בוחר שאלה אחת שהוא רוצה לזכור.'],
      ['סיכום הקורס', 'החלטה פיננסית חכמה', 'החלטה חכמה מבוססת על הבנת המטרה, המחיר, החלופות, הזמן, הסיכון וההשפעה העתידית.', 'שאלת סיום: איזה הרגל פיננסי אחד תרצו לשפר?']
    ]
  }
];

function page(lesson) {
  const slides = lesson.slides.map((s, idx) => `
    <section class="slide" id="slide-${idx + 1}">
      <span class="slide-count">${String(idx + 1).padStart(2, '0')}</span>
      <p class="kicker">מפגש ${lesson.id} · שקופית ${idx + 1} מתוך ${lesson.slides.length}</p>
      <h1>${s[1]}</h1>
      <h2>${s[0]}</h2>
      <p class="lead">${s[2]}</p>
      <div class="note">${s[3]}</div>
      ${idx === lesson.slides.length - 2 ? '<a class="lab-link" href="money-smart-lab.html">מעבר ללומדה</a>' : ''}
    </section>`).join('\n');
  const nav = lesson.slides.map((_, idx) => `<a href="#slide-${idx + 1}">${idx + 1}</a>`).join('');
  return `<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Money Smart Lab - מצגת מפגש ${lesson.id}: ${lesson.title}</title>
  <link href="https://fonts.googleapis.com/css2?family=Rubik:wght@400;500;700;800;900&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/platform-home-link.css">
  <style>
    :root{--accent:${lesson.color};--ink:#101828;--muted:#667085;--line:#dbe7f3;--bg:#f5f8fb}*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;font-family:Rubik,Arial,sans-serif;direction:rtl;color:var(--ink);background:radial-gradient(circle at 12% 0,color-mix(in srgb,var(--accent) 22%,transparent),transparent 28%),linear-gradient(180deg,#fbfdff,#eef5f3);line-height:1.5}.topbar{position:sticky;top:0;z-index:30;display:flex;justify-content:space-between;align-items:center;gap:12px;padding:12px 18px;background:rgba(255,255,255,.9);border-bottom:1px solid var(--line);backdrop-filter:blur(14px)}.brand{display:flex;align-items:center;gap:10px;color:var(--ink);text-decoration:none;font-weight:900}.brand span{width:42px;height:42px;border-radius:15px;background:var(--accent);color:#fff;display:grid;place-items:center}.top-actions{display:flex;gap:8px;flex-wrap:wrap}.top-actions a{border:1px solid var(--line);background:#fff;color:var(--ink);border-radius:999px;padding:8px 12px;text-decoration:none;font-weight:900}.deck{width:min(1160px,calc(100% - 28px));margin:0 auto;padding:24px 0 72px}.slide{min-height:calc(100vh - 94px);display:grid;align-content:center;position:relative;overflow:hidden;margin-bottom:28px;padding:clamp(26px,5vw,54px);border-radius:34px;background:rgba(255,255,255,.97);border:1px solid rgba(16,24,40,.1);box-shadow:0 18px 55px rgba(16,24,40,.1)}.slide:first-child{color:white;background:radial-gradient(circle at 15% 12%,rgba(255,255,255,.22),transparent 24%),linear-gradient(135deg,#111827,var(--accent))}.slide:before{content:"";position:absolute;inset:auto auto -120px -90px;width:320px;height:320px;border-radius:999px;background:color-mix(in srgb,var(--accent) 16%,transparent)}.kicker{width:max-content;max-width:100%;border-radius:999px;padding:8px 14px;background:color-mix(in srgb,var(--accent) 12%,white);color:var(--accent);font-weight:900;margin:0 0 16px}.slide:first-child .kicker{background:rgba(255,255,255,.16);color:#fff;border:1px solid rgba(255,255,255,.24)}h1{font-size:clamp(2.2rem,5.4vw,5rem);line-height:1.02;letter-spacing:-.045em;margin:0 0 10px}h2{font-size:clamp(1.15rem,2.3vw,2rem);margin:0 0 18px;color:var(--accent)}.slide:first-child h2{color:#dffdf6}.lead{font-size:clamp(1.28rem,2.7vw,2.2rem);max-width:920px;margin:0;color:#263244;font-weight:800}.slide:first-child .lead{color:#eefcff}.note{margin-top:24px;padding:18px 20px;border-radius:22px;background:#f8fbff;border:1px solid var(--line);color:var(--muted);font-size:clamp(1rem,1.5vw,1.24rem);font-weight:700;max-width:900px}.slide:first-child .note{background:rgba(255,255,255,.14);border-color:rgba(255,255,255,.22);color:#fff}.slide-count{position:absolute;top:26px;left:30px;font-size:clamp(3rem,8vw,7rem);line-height:1;font-weight:900;color:rgba(16,24,40,.08)}.slide:first-child .slide-count{color:rgba(255,255,255,.16)}.lab-link{display:inline-flex;width:max-content;margin-top:22px;border-radius:999px;padding:13px 20px;background:var(--accent);color:white;text-decoration:none;font-weight:900}.pager{position:fixed;left:16px;bottom:16px;z-index:50;display:flex;gap:6px;max-width:calc(100% - 32px);overflow:auto}.pager a{flex:0 0 auto;width:32px;height:32px;border-radius:999px;display:grid;place-items:center;background:#fff;border:1px solid var(--line);box-shadow:0 8px 24px rgba(16,24,40,.12);color:var(--ink);text-decoration:none;font-weight:900}@media(max-width:720px){.topbar{align-items:flex-start;flex-direction:column}.slide{min-height:auto;border-radius:24px}.deck{padding-top:14px}.slide-count{font-size:3rem}}@media print{.topbar,.pager,.platform-home-link{display:none}.slide{break-after:page;min-height:100vh;margin:0;border-radius:0;box-shadow:none}}
  </style>
</head>
<body>
  <a class="platform-home-link" href="index.html"><span class="platform-home-icon">🏠</span><span class="platform-home-text">לעמוד הראשי</span></a>
  <header class="topbar">
    <a class="brand" href="money-smart-slides.html"><span>${lesson.id}</span> מצגת מפגש ${lesson.id}: ${lesson.title}</a>
    <nav class="top-actions"><a href="money-smart-slides.html">כל המצגות</a><a href="money-smart-lab.html">ללומדה</a><a href="money-smart-course.html">דף קורס</a></nav>
  </header>
  <main class="deck">${slides}
  </main>
  <nav class="pager" aria-label="ניווט שקופיות">${nav}</nav>
</body>
</html>
`;
}

for (const lesson of lessons) {
  writeFileSync(`money-smart-lesson-${lesson.id}-slides.html`, page(lesson));
}

const hubCards = lessons.map(l => `<article><span>${l.id}</span><h2>${l.title}</h2><p>${l.question}</p><a href="money-smart-lesson-${l.id}-slides.html">פתח מצגת מפגש ${l.id}</a></article>`).join('\n');
writeFileSync('money-smart-slides.html', `<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Money Smart Lab - מצגות מדריך נפרדות</title>
  <link href="https://fonts.googleapis.com/css2?family=Rubik:wght@400;500;700;800;900&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/platform-home-link.css">
  <style>body{margin:0;font-family:Rubik,Arial,sans-serif;direction:rtl;color:#101828;background:radial-gradient(circle at 10% 0,#dffcf4,transparent 28%),linear-gradient(180deg,#f8fbff,#eef5f3);line-height:1.6}.shell{width:min(1120px,calc(100% - 28px));margin:auto}.hero{padding:56px 0 30px}.eyebrow{display:inline-flex;border-radius:999px;background:#eafbf6;color:#0f766e;padding:8px 14px;font-weight:900}h1{font-size:clamp(2.4rem,5vw,4.8rem);line-height:1.03;letter-spacing:-.045em;margin:14px 0}.lead{font-size:1.25rem;color:#667085;max-width:880px}.actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:20px}.actions a,.cards a{display:inline-flex;border-radius:999px;padding:11px 16px;background:#111d3a;color:#fff;text-decoration:none;font-weight:900}.actions a.secondary{background:#fff;color:#111d3a;border:1px solid #dbe7f3}.cards{display:grid;grid-template-columns:repeat(5,1fr);gap:14px;padding:24px 0 64px}.cards article{background:#fff;border:1px solid #dbe7f3;border-radius:28px;padding:20px;box-shadow:0 16px 42px rgba(16,24,40,.08);display:flex;flex-direction:column;gap:10px}.cards span{width:48px;height:48px;border-radius:18px;background:linear-gradient(135deg,#18b894,#f5b82e);display:grid;place-items:center;color:#fff;font-weight:900;font-size:1.3rem}.cards h2{font-size:1.3rem;margin:0}.cards p{color:#667085;margin:0;flex:1}.note{background:#fffbea;border:1px solid #fde68a;color:#713f12;border-radius:24px;padding:18px;margin:18px 0;font-weight:800}@media(max-width:980px){.cards{grid-template-columns:repeat(2,1fr)}}@media(max-width:620px){.cards{grid-template-columns:1fr}.hero{padding-top:38px}}</style>
</head>
<body>
  <a class="platform-home-link" href="index.html"><span class="platform-home-icon">🏠</span><span class="platform-home-text">לעמוד הראשי</span></a>
  <header class="hero"><div class="shell"><span class="eyebrow">Money Smart Lab · מצגות מדריך</span><h1>מצגת נפרדת לכל מפגש</h1><p class="lead">המצגות מלוות את ההנחיה ואינן מחליפות את הלומדה. בכל מפגש: 20–25 דקות הצגה והנחיה, 45–50 דקות עבודה בלומדה, 15–20 דקות דיון וסיכום.</p><div class="actions"><a href="money-smart-lab.html">פתח לומדה</a><a class="secondary" href="money-smart-course.html">דף קורס</a></div><div class="note">כל מצגת כוללת 11–16 שקופיות, מעט טקסט בכל שקופית, דוגמאות מחיי בני נוער, שאלות לדיון וסימון ברור של מעבר ללומדה.</div></div></header>
  <main class="shell"><section class="cards">${hubCards}</section></main>
</body>
</html>`);
console.log('Generated Money Smart separate slide decks');
