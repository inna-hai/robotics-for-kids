import assert from 'node:assert/strict';
import test from 'node:test';
import { existsSync, readFileSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const read = file => readFileSync(new URL(file, root), 'utf8');
const page = read('cyber-city-lesson-5.html');
const js = read('js/cyber-city-lesson-5.js');
const course = read('cyber-city-course.html');
const homepage = read('index.html');
const lesson4 = read('cyber-city-lesson-4.html');

function includes(source, text, msg = `Missing ${text}`) {
  assert.ok(source.includes(text), msg);
}

test('Lesson 5 page exists and loads its overview video', () => {
  assert.ok(existsSync(new URL('cyber-city-lesson-5.html', root)), 'Lesson 5 page should exist');
  includes(page, '<title>Cyber AI Builders — שיעור 5</title>');
  includes(page, 'Mission 05');
  includes(page, 'Password Lab');
  includes(page, 'marketing/cyber-city-lesson5-overview.mp4');
  includes(page, 'marketing/cyber-city-lesson5-overview-poster.jpg');
  includes(page, 'js/cyber-city-lesson-5.js');
});

test('Lesson 5 has one explanatory video for each station', () => {
  for (const id of ['brief', 'signals', 'conditions', 'scanner', 'cases', 'report']) {
    includes(js, `marketing/cyber-city-lesson5-${id}.mp4`);
    includes(js, `marketing/cyber-city-lesson5-${id}-poster.jpg`);
  }
  includes(js, 'function renderStationVideo()');
  includes(js, '<span>לפני שמתחילים</span>');
});

test('Lesson 5 teaches len and if without introducing loops or lists', () => {
  assert.ok(existsSync(new URL('assets/cyber-city/risk-engine.svg', root)), 'Lesson 5 risk engine illustration should exist');
  includes(js, 'assets/cyber-city/risk-engine.svg');
  includes(js, 'pwd = input("password: ")');
  includes(js, 'if len(pwd) < 8:');
  includes(js, 'if "123" in pwd:');
  includes(js, 'Password Safety Checker');
  assert.ok(!js.includes('for word'), 'Lesson 5 should not introduce for loops');
  assert.ok(!js.includes('words = ['), 'Lesson 5 should not introduce lists');
});

test('Lesson 5 is linked from the course, catalog and lesson 4', () => {
  includes(course, 'href="cyber-city-lesson-5.html"');
  includes(course, 'Password Lab');
  includes(course, '<b>9</b>שיעורים בנויים כרגע');
  includes(homepage, 'href="cyber-city-lesson-5.html"');
  includes(lesson4, 'href="cyber-city-lesson-5.html"');
});
