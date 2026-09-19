import assert from 'node:assert/strict';
import test from 'node:test';
import { existsSync, readFileSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const read = file => readFileSync(new URL(file, root), 'utf8');
const page = read('cyber-city-lesson-8.html');
const js = read('js/cyber-city-lesson-8.js');
const course = read('cyber-city-course.html');
const homepage = read('index.html');
const lesson7 = read('cyber-city-lesson-7.html');

function includes(source, text, msg = `Missing ${text}`) {
  assert.ok(source.includes(text), msg);
}

test('Lesson 8 page exists and loads its overview video', () => {
  assert.ok(existsSync(new URL('cyber-city-lesson-8.html', root)), 'Lesson 8 page should exist');
  includes(page, '<title>Cyber AI Builders — שיעור 8 Ethical Hacker Lab</title>');
  includes(page, 'Mission 08');
  includes(page, 'Ethical Hacker Lab');
  includes(page, 'Login Defense Kit');
  includes(page, '20260919-ethical-hacker-v1');
  includes(page, 'marketing/cyber-city-lesson7-overview.mp4');
  includes(page, 'marketing/cyber-city-lesson7-overview-poster.jpg');
  includes(page, 'js/cyber-city-lesson-8.js');
});

test('Lesson 8 has animated videos for every station and concept', () => {
  for (const id of ['overview', 'concepts', 'login', 'terminal', 'python', 'report']) {
    includes(js + page, `marketing/cyber-city-lesson7-${id}.mp4`);
    includes(js + page, `marketing/cyber-city-lesson7-${id}-poster.jpg`);
  }
  for (const id of ['ethics', 'target', 'vulnerability', 'exploit', 'fix', 'terminal']) {
    includes(js, `marketing/cyber-city-lesson7-concept-${id}.mp4`);
    includes(js, `marketing/cyber-city-lesson7-concept-${id}-poster.jpg`);
  }
  includes(js, 'conceptVideos');
  includes(js, 'conceptTasks');
  includes(js, 'data-concept-answer');
  includes(js, 'סיימתי לראות');
});

test('Lesson 8 teaches ethical attack only inside a toy lab', () => {
  includes(js, 'מערכת צעצוע');
  includes(js, 'לבדוק מערכת אימון שקיבלנו אישור לבדוק');
  includes(js, 'Vulnerability');
  includes(js, 'Exploit');
  includes(js, 'Fix');
  includes(js, 'Login Toy');
  includes(js, 'Linux Terminal Missions');
  includes(js, 'ls');
  includes(js, 'cat login_policy.txt');
  includes(js, 'grep unlimited login_policy.txt');
  includes(js, 'Python Defense Checker');
  includes(js, 'Login Defense Kit');
  includes(js, 'Ethical Hacker Report');
  assert.ok(!js.includes('fetch('), 'Lesson 8 should not fetch live websites');
  assert.ok(!js.includes('XMLHttpRequest'), 'Lesson 8 should not open network requests');
});

test('Lesson 8 is linked from the course, catalog and lesson 7', () => {
  includes(course, 'href="cyber-city-lesson-8.html"');
  includes(course, 'Ethical Hacker Lab');
  includes(course, '<b>9</b>שיעורים בנויים כרגע');
  includes(homepage, 'href="cyber-city-lesson-8.html"');
  includes(lesson7, 'href="cyber-city-lesson-8.html"');
});
