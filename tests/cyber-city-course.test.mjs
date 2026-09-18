import assert from 'node:assert/strict';
import test from 'node:test';
import { existsSync, readFileSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const read = file => readFileSync(new URL(file, root), 'utf8');
const homepage = read('index.html');
const course = read('cyber-city-course.html');

function includes(source, text, msg = `Missing ${text}`) {
  assert.ok(source.includes(text), msg);
}

test('Cyber City course page is linked from the all-courses catalog', () => {
  includes(homepage, '<h3>Cyber City Academy</h3>');
  includes(homepage, 'href="cyber-city-course.html"');
  includes(homepage, 'href="cyber-city-lesson-2.html"');
  includes(homepage, 'href="cyber-city-lesson-3.html"');
  includes(homepage, 'href="cyber-city-lesson-4.html"');
  includes(homepage, 'href="cyber-city-lesson-5.html"');
  includes(homepage, 'href="cyber-city-lesson-6.html"');
  assert.ok(existsSync(new URL('cyber-city-course.html', root)), 'Cyber City course page should exist');
});

test('Cyber City course page follows the course overview pattern', () => {
  includes(course, '<title>Cyber AI Builders — קורס סייבר לילדים</title>');
  includes(course, 'class="platform-home-link"');
  includes(course, 'כיתה ז׳');
  includes(course, 'גיל 12');
  includes(course, '90 דקות למפגש');
  includes(course, 'Cyber Safety Scanner');
  includes(course, 'Python Risk Engine');
  includes(course, 'URL Detective');
  includes(course, 'Message Detective');
  includes(course, 'Password Lab');
  includes(course, 'Packet Patrol');
  includes(course, 'Crypto Lab');
  includes(course, 'Digital Forensics / CTF');
  includes(course, 'href="cyber-city-academy.html"');
  includes(course, 'href="cyber-city-lesson-2.html"');
  includes(course, 'href="cyber-city-lesson-3.html"');
  includes(course, 'href="cyber-city-lesson-4.html"');
  includes(course, 'href="cyber-city-lesson-5.html"');
  includes(course, 'href="cyber-city-lesson-6.html"');
  includes(course, 'href="index.html"');
});

test('Cyber City course page avoids rejected and redundant classroom copy', () => {
  assert.ok(!course.includes('שפה שמתאימה לכיתה'), 'Course page should not show the redundant language card');
  assert.ok(!course.includes('כדי לא לערבב שפות'), 'Course page should not show the redundant code-language explanation card');
  assert.ok(!course.includes('פחד'), 'Course page should not use the word Inna rejected');
  assert.ok(!course.includes('קצב קל'), 'Course page should not use softened pacing copy Inna rejected');
});
