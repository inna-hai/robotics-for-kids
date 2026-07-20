import { readFileSync, writeFileSync } from 'node:fs';
import vm from 'node:vm';

const code = readFileSync(new URL('./pygame-lessons.js', import.meta.url), 'utf8');
const { PYGAME_LESSONS, SOURCE_ENRICHMENT } = vm.runInNewContext(`${code}\n({ PYGAME_LESSONS, SOURCE_ENRICHMENT })`, {});

const lines = [];
lines.push('# Pygame — מערכי שיעור ללומדה');
lines.push('');
lines.push('מקור: תוכן מעובד ממערכי Pygame בדרייב, נשמר כקובץ קריא כדי שהלומדה לא תהיה תלויה בפתיחת Drive בזמן שיעור.');
lines.push('');
lines.push('> הערה: קבצי המקור הגולמיים מהדרייב לא מיועדים ל־Git. הקובץ הזה הוא גרסה מעובדת וקומפקטית ללומדה.');
lines.push('');
lines.push('## מבנה שיעור מומלץ');
lines.push('');
for (const item of PYGAME_LESSONS[0]?.timing || []) lines.push(`- ${item}`);
lines.push('');

for (const lesson of PYGAME_LESSONS) {
  const src = SOURCE_ENRICHMENT[lesson.id] || {};
  lines.push(`## שיעור ${lesson.id}: ${lesson.title}`);
  lines.push('');
  lines.push(`- **מושג מרכזי:** ${lesson.concept}`);
  lines.push(`- **תוצר:** ${lesson.product}`);
  lines.push(`- **מטרה:** ${lesson.goal}`);
  lines.push('');
  lines.push('### הסבר לתלמיד');
  lines.push('');
  lines.push(lesson.explain);
  lines.push('');
  lines.push('### תרגולים בלומדה');
  lines.push('');
  for (const p of lesson.practice || []) lines.push(`- ${p}`);
  lines.push('');
  lines.push('### דגש מדריך');
  lines.push('');
  lines.push(lesson.teacher);
  lines.push('');
  if (src.source || src.examples || src.tasks) {
    lines.push('### מתוך המערך המקורי');
    lines.push('');
    if (src.source) lines.push(src.source);
    lines.push('');
    if (src.examples?.length) {
      lines.push('#### דוגמאות קוד / מושגים');
      lines.push('');
      for (const ex of src.examples) lines.push(`- \`${String(ex).replaceAll('`', '\\`')}\``);
      lines.push('');
    }
    if (src.tasks?.length) {
      lines.push('#### משימות מקור');
      lines.push('');
      for (const task of src.tasks) lines.push(`- ${task}`);
      lines.push('');
    }
  }
}

writeFileSync(new URL('./pygame-lessons.md', import.meta.url), lines.join('\n'), 'utf8');
console.log(JSON.stringify({ lessons: PYGAME_LESSONS.length, chars: lines.join('\n').length }, null, 2));
