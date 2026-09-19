import assert from 'node:assert/strict';
import test from 'node:test';
import { existsSync, readFileSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const read = file => readFileSync(new URL(file, root), 'utf8');
const page = read('cyber-city-lesson-3.html');
const js = read('js/cyber-city-lesson-3.js');
const course = read('cyber-city-course.html');
const homepage = read('index.html');
const lesson2 = read('cyber-city-lesson-2.html');

function includes(source, text, msg = `Missing ${text}`) {
  assert.ok(source.includes(text), msg);
}

test('Lesson 3 page exists and loads its lesson video', () => {
  assert.ok(existsSync(new URL('cyber-city-lesson-3.html', root)), 'Lesson 3 page should exist');
  includes(page, '<title>Cyber AI Builders — שיעור 3</title>');
  includes(page, 'Mission 03');
  includes(page, 'URL Detective');
  includes(page, 'marketing/cyber-city-lesson3-overview.mp4');
  includes(page, 'marketing/cyber-city-lesson3-overview-poster.jpg');
  includes(page, 'js/cyber-city-lesson-3.js');
});

test('Lesson 3 has one explanatory video for each station', () => {
  for (const id of ['brief', 'parts', 'strings', 'checker', 'cases', 'report']) {
    includes(js, `marketing/cyber-city-lesson3-${id}.mp4`);
    includes(js, `marketing/cyber-city-lesson3-${id}-poster.jpg`);
  }
  includes(js, 'function renderStationVideo()');
  includes(js, '<span>לפני שמתחילים</span>');
});

test('Lesson 3 teaches URL checking with short English code names', () => {
  includes(js, 'url = input("url: ")');
  includes(js, 'if "login" in url:');
  includes(js, 'url.startswith("https")');
  includes(js, 'Link Checker');
  includes(js, 'risk += 25');
  assert.ok(!js.includes('פחד'), 'Lesson 3 should avoid rejected wording');
});

test('Lesson 3 is linked from the course, catalog and lesson 2', () => {
  includes(course, 'href="cyber-city-lesson-3.html"');
  includes(course, 'URL Detective');
  includes(course, '<b>9</b>שיעורים בנויים כרגע');
  includes(homepage, 'href="cyber-city-lesson-3.html"');
  includes(lesson2, 'href="cyber-city-lesson-3.html"');
});
