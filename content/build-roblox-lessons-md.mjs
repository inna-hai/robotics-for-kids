import { readFileSync, writeFileSync } from 'node:fs';
import vm from 'node:vm';

const js = readFileSync(new URL('./roblox-lessons.js', import.meta.url), 'utf8');
const { ROBLOX_LESSONS } = vm.runInNewContext(`${js}\n({ROBLOX_LESSONS})`, {});
let md = '# Roblox 10+ — מערכי שיעור ללומדה\n\nקורס Roblox Studio לגיל 10+: בנייה, Properties, Luau, אירועים, פונקציות, טבלאות ופרויקטים.\n\n';
for (const l of ROBLOX_LESSONS) {
  md += `## שיעור ${l.id}: ${l.title}\n\n`;
  md += `- יחידה: ${l.unit}\n- תוצר: ${l.product}\n- מושג מרכזי: ${l.concept}\n\n`;
  md += `### מה עושים ב־Studio\n${(l.studio || []).map(x => `- ${x}`).join('\n')}\n\n`;
  md += `### Properties / מושגים\n${(l.properties || []).map(x => `- ${x}`).join('\n')}\n\n`;
  md += `### קוד לדוגמה\n\`\`\`lua\n${(l.code || []).join('\n')}\n\`\`\`\n\n`;
  md += `### תרגול\n${(l.practice || []).map(x => `- ${x}`).join('\n')}\n\n`;
  if (l.teacher) md += `### דגש מדריך\n${l.teacher}\n\n`;
}
writeFileSync(new URL('./roblox-lessons.md', import.meta.url), md, 'utf8');
