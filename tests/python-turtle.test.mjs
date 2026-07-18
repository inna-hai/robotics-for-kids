import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../python-turtle.html', import.meta.url), 'utf8');
const codequest = readFileSync(new URL('../codequest.html', import.meta.url), 'utf8');
const research = readFileSync(new URL('../PYTHON_TURTLE_RESEARCH.md', import.meta.url), 'utf8');

assert.match(html, /פייתון מצייר/);
assert.match(html, /גוררים בלוקים ורואים קוד Python/);
assert.match(html, /https:\/\/unpkg\.com\/blockly\/blockly\.min\.js/);
assert.match(html, /const TURTLE_LESSONS = \[/);
assert.match(html, /type:'py_forward'/);
assert.match(html, /type:'py_right'/);
assert.doesNotMatch(html, /type:'field_angle'/, 'angle widget is avoided because it is brittle in RTL classrooms');
assert.match(html, /numericField\(block,'ANGLE',90\)/);
assert.match(html, /type:'py_repeat'/);
assert.match(html, /student-steps/);
assert.match(html, /פתיחה: הריצו קנבס ריק/);
assert.match(html, /גררו “חזור 4 פעמים”/);
assert.match(html, /אתגר משולש: 3 חזרות ו־120 מעלות/);
assert.match(html, /אתגר משושה: 6 חזרות ו־60 מעלות/);
assert.match(html, /בחרו צבע עט לפני הציור/);
assert.match(html, /קבעו length = 70/);
assert.match(html, /0–10/);
assert.match(html, /82–90/);
assert.match(html, /type:'py_set_length'/);
assert.match(html, /type:'py_forward_length'/);
assert.match(html, /type:'py_grow_length'/);
assert.match(html, /length =  \$\{numericField\(block,'VALUE',100\)\}|length = \$\{numericField\(block,'VALUE',100\)\}/);
assert.match(html, /forward\(length\)/);
assert.match(html, /forwardVar/);
assert.match(html, /for i in range/);
assert.match(html, /from turtle import \*/);
assert.match(html, /קוד Python שנוצר/);
assert.match(html, /active-code-line/);
assert.match(html, /data-block-id/);
assert.match(html, /highlightSelectedCode/);
assert.match(html, /<svg viewBox="0 0 64 64"/, 'use our own turtle SVG instead of platform-dependent emoji');
assert.match(html, /circle cx="51" cy="32"/, 'custom turtle head points right at heading 0');
assert.match(html, /rotate\(\$\{turtle\.heading\}deg\)/, 'SVG turtle already faces right, so no visual offset is needed');
assert.doesNotMatch(html, /turtle\.heading \+ 180/);
assert.match(html, /startEmptyLesson/);
assert.match(html, /initialLessonFromUrl/);
assert.match(html, /searchParams\.set\('lesson'/);
assert.doesNotMatch(html, /href="codequest\.html"/, 'new turtle course must not link students back to old CodeQuest course');
assert.match(html, /כל השיעורים/);
assert.match(html, /פייתון מצייר/);
assert.doesNotMatch(html, /MVP חדש לכיתה/);
assert.doesNotMatch(html, /setLesson\(1\); loadDemo\(\);/, 'opening a lesson must not auto-load the solution');
assert.match(html, /מאפסים את הציור/);
assert.match(html, /await sleep\(450\)/);
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
