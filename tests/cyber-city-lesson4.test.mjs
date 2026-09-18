import assert from 'node:assert/strict';
import test from 'node:test';
import { existsSync, readFileSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const read = file => readFileSync(new URL(file, root), 'utf8');
const page = read('cyber-city-lesson-4.html');
const js = read('js/cyber-city-lesson-4.js');
const course = read('cyber-city-course.html');
const homepage = read('index.html');
const lesson3 = read('cyber-city-lesson-3.html');

function includes(source, text, msg = `Missing ${text}`) {
  assert.ok(source.includes(text), msg);
}

test('Lesson 4 page exists and loads its overview video', () => {
  assert.ok(existsSync(new URL('cyber-city-lesson-4.html', root)), 'Lesson 4 page should exist');
  includes(page, '<title>Cyber AI Builders — שיעור 4</title>');
  includes(page, 'Mission 04');
  includes(page, 'Message Detective');
  includes(page, 'marketing/cyber-city-lesson4-overview.mp4');
  includes(page, 'marketing/cyber-city-lesson4-overview-poster.jpg');
  includes(page, 'js/cyber-city-lesson-4.js');
});

test('Lesson 4 has one explanatory video for each station', () => {
  for (const id of ['brief', 'signals', 'conditions', 'scanner', 'cases', 'report']) {
    includes(js, `marketing/cyber-city-lesson4-${id}.mp4`);
    includes(js, `marketing/cyber-city-lesson4-${id}-poster.jpg`);
  }
  includes(js, 'function renderStationVideo()');
  includes(js, '<span>לפני שמתחילים</span>');
});

test('Lesson 4 deepens if and in without introducing loops or lists', () => {
  includes(js, 'msg = input("message: ")');
  includes(js, 'if "urgent" in msg:');
  includes(js, 'risk += ${signal.points}');
  includes(js, 'Message Risk Scanner');
  assert.ok(!js.includes('for word'), 'Lesson 4 should not introduce for loops');
  assert.ok(!js.includes('words = ['), 'Lesson 4 should not introduce lists');
});

test('Lesson 4 is linked from the course, catalog and lesson 3', () => {
  includes(course, 'href="cyber-city-lesson-4.html"');
  includes(course, 'Message Detective');
  includes(course, '<b>6</b>שיעורים בנויים כרגע');
  includes(homepage, 'href="cyber-city-lesson-4.html"');
  includes(lesson3, 'href="cyber-city-lesson-4.html"');
});
