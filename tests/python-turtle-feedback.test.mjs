import assert from 'node:assert/strict';
import fs from 'node:fs';

const html = fs.readFileSync(new URL('../python-turtle.html', import.meta.url), 'utf8');

assert.ok(html.includes("type:'py_color'"), 'python turtle exposes a pen-color block');
assert.ok(html.includes("field_dropdown',name:'COLOR'"), 'pen-color block uses an explicit dropdown, not only a hidden color picker');
for (const color of ['🔵 כחול', '🟢 ירוק', '🟡 צהוב', '🔴 אדום', '🟣 סגול', '🩷 ורוד', '⚫ שחור']) {
  assert.ok(html.includes(color), `pen-color dropdown includes ${color}`);
}
assert.ok(html.includes('color("${block.getFieldValue(\'COLOR\')}")'), 'generated Python still uses the chosen color value');

console.log('python turtle feedback fixes passed');
