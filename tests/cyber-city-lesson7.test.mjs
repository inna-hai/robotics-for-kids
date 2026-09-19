import assert from 'node:assert/strict';
import test from 'node:test';
import { existsSync, readFileSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const read = file => readFileSync(new URL(file, root), 'utf8');
const page = read('cyber-city-lesson-7.html');
const js = read('js/cyber-city-lesson-7.js');
const course = read('cyber-city-course.html');
const homepage = read('index.html');
const lesson6 = read('cyber-city-lesson-6.html');

function includes(source, text, msg = `Missing ${text}`) {
  assert.ok(source.includes(text), msg);
}

test('Lesson 7 is a lighter Linux Evidence Basics lesson', () => {
  assert.ok(existsSync(new URL('cyber-city-lesson-7.html', root)), 'Lesson 7 page should exist');
  includes(page, '<title>Cyber AI Builders — שיעור 7 Linux Evidence Basics</title>');
  includes(page, 'Mission 07');
  includes(page, 'Linux Evidence Basics');
  includes(page, 'Linux Evidence Card');
  includes(page, '20260919-linux-basics-v1');
  includes(page, 'marketing/cyber-city-lesson7-terminal.mp4');
  includes(page, 'js/cyber-city-lesson-7.js');
});

test('Lesson 7 focuses only on basic terminal evidence commands', () => {
  includes(js, 'pwd');
  includes(js, 'ls');
  includes(js, 'cd evidence');
  includes(js, 'cat login_policy.txt');
  includes(js, 'grep unlimited login_policy.txt');
  includes(js, 'grep hint login_policy.txt');
  includes(js, 'grep success attempts.log');
  includes(js, 'terminalFileSystem');
  includes(js, 'terminalTasks');
  includes(js, 'Linux Evidence Card');
  includes(js, 'בשיעור הבא ניקח את הראיות האלה ונבדוק אותן עם Python Defense Checker');
  assert.ok(!js.includes("title: 'Python Defense Checker'"), 'Lesson 7 should not include the advanced Python station');
  assert.ok(!js.includes('selectedFixes'), 'Lesson 7 should not include the password policy fix system');
  assert.ok(!js.includes('fetch('), 'Lesson 7 should not fetch live websites');
});

test('Lesson 7 is linked from the course, catalog and lesson 6', () => {
  includes(course, 'href="cyber-city-lesson-7.html"');
  includes(course, 'Linux Evidence Basics');
  includes(course, '<b>9</b>שיעורים בנויים כרגע');
  includes(homepage, 'href="cyber-city-lesson-7.html"');
  includes(lesson6, 'href="cyber-city-lesson-7.html"');
});
