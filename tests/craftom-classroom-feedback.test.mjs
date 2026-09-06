import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const feedbackScript = '<script src="/js/feedback-widget.js?v=20260906-craftom-classrooms-1"></script>';
const requiredPages = [
  'classroom-admin.html',
  'teacher-classrooms.html',
  'classroom-entry.html',
  'kugel-teacher.html',
  'kugel-student.html',
  'craftom-agent-academy.html',
  ...Array.from({ length: 16 }, (_, index) => `craftom-minecraft-lesson-${index + 1}.html`),
];

for (const page of requiredPages) {
  const html = readFileSync(join(root, page), 'utf8');
  const occurrences = html.split(feedbackScript).length - 1;
  assert.equal(occurrences, 1, `${page} must load the shared feedback widget exactly once`);
  assert.ok(html.indexOf(feedbackScript) < html.lastIndexOf('</body>'), `${page} must load feedback before </body>`);
}

const widget = readFileSync(join(root, 'js', 'feedback-widget.js'), 'utf8');
assert.match(widget, /🐞 דיווח \/ רעיון/, 'the connected widget must expose the report button');
assert.match(widget, /fetch\('\/api\/feedback'/, 'the connected widget must submit through the existing feedback API');
assert.match(widget, /window\.location\.pathname \+ window\.location\.search/, 'reports must identify the current classroom or Craftom page');
assert.match(widget, /body:has\(#hai-user-badge\) \.rfw-button\{bottom:/, 'the report button must stay above the persistent user badge');

console.log(`✓ feedback reporting is connected to ${requiredPages.length} classroom and Craftom pages`);
