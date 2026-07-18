import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../python-turtle.html', import.meta.url), 'utf8');
const codequest = readFileSync(new URL('../codequest.html', import.meta.url), 'utf8');
const research = readFileSync(new URL('../PYTHON_TURTLE_RESEARCH.md', import.meta.url), 'utf8');

assert.match(html, /Blockly → Python/);
assert.match(html, /https:\/\/unpkg\.com\/blockly\/blockly\.min\.js/);
assert.match(html, /const TURTLE_LESSONS = \[/);
assert.match(html, /type:'py_forward'/);
assert.match(html, /type:'py_right'/);
assert.doesNotMatch(html, /type:'field_angle'/, 'angle widget is avoided because it is brittle in RTL classrooms');
assert.match(html, /numericField\(block,'ANGLE',90\)/);
assert.match(html, /type:'py_repeat'/);
assert.match(html, /for i in range/);
assert.match(html, /from turtle import \*/);
assert.match(html, /קוד Python שנוצר/);
assert.match(html, /הרובוט המצייר/);
assert.match(html, /משתנים/);
assert.match(html, /תנאים/);
assert.match(html, /פונקציות/);
assert.match(codequest, /python-turtle\.html/);
assert.match(research, /Blockly \+ Python Turtle/);

const scriptBodies = [...html.matchAll(/<script(?![^>]*src=)[^>]*>([\s\S]*?)<\/script>/g)].map(m => m[1]);
assert.ok(scriptBodies.length >= 1, 'expected inline scripts');
for (const body of scriptBodies) {
  new Function(body);
}

console.log('python-turtle MVP checks passed');
