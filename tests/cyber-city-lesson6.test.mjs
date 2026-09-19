import assert from 'node:assert/strict';
import test from 'node:test';
import { existsSync, readFileSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const read = file => readFileSync(new URL(file, root), 'utf8');
const page = read('cyber-city-lesson-6.html');
const js = read('js/cyber-city-lesson-6.js');
const course = read('cyber-city-course.html');
const homepage = read('index.html');
const lesson5 = read('cyber-city-lesson-5.html');

function includes(source, text, msg = `Missing ${text}`) {
  assert.ok(source.includes(text), msg);
}

test('Lesson 6 page exists and loads its overview video', () => {
  assert.ok(existsSync(new URL('cyber-city-lesson-6.html', root)), 'Lesson 6 page should exist');
  includes(page, '<title>Cyber AI Builders — שיעור 6 Packet Patrol</title>');
  includes(page, 'Mission 06');
  includes(page, 'Packet Patrol');
  includes(page, 'שער העיר לא נפתח');
  includes(page, '20260918-packet-v63');
  includes(page, 'marketing/cyber-city-lesson6-overview.mp4');
  includes(page, 'marketing/cyber-city-lesson6-overview-poster.jpg');
  includes(page, 'js/cyber-city-lesson-6.js');
});

test('Lesson 6 has one explanatory video for each station', () => {
  for (const id of ['brief', 'map', 'packet', 'python', 'cases', 'report']) {
    includes(js, `marketing/cyber-city-lesson6-${id}.mp4`);
    includes(js, `marketing/cyber-city-lesson6-${id}-poster.jpg`);
  }
  includes(js, 'function renderStationVideo()');
  includes(js, '<span>לפני שמתחילים</span>');
});

test('Lesson 6 teaches packet logs in a controlled training lab', () => {
  assert.ok(existsSync(new URL('assets/cyber-city/packet-lab.svg', root)), 'Lesson 6 packet illustration should exist');
  includes(js, 'assets/cyber-city/packet-lab.svg');
  includes(js, 'Computer -> DNS -> IP -> Server -> HTTPS');
  includes(js, 'Route Builder: בונים מסלול אינטרנט');
  includes(js, 'תקלה בשער העיר');
  includes(js, 'DNS הוא כמו איש קשר של האינטרנט');
  includes(js, 'IP הוא מספר כתובת של מחשב או שרת ברשת');
  includes(js, 'explainRoutePlacement');
  includes(js, 'data-route-piece');
  includes(js, 'data-route-slot');
  includes(js, 'draggable="true"');
  includes(js, "addEventListener('drop'");
  includes(js, 'routeIsComplete()');
  includes(js, 'pkt = input("packet log: ")');
  includes(js, 'if "password" in pkt:');
  includes(js, 'packetInvestigationQuestions');
  includes(js, 'data-packet-answer');
  includes(js, 'שאלת חקירה');
  includes(js, 'activePacketQuestion');
  includes(js, 'packet-case-tabs');
  includes(js, 'Python יעשה את אותה בדיקה מהר יותר');
  includes(js, 'Packet Inspector');
  includes(js, 'NETWORK DEFENDER');
  includes(js, 'מה אני יודע עכשיו?');
  includes(js, 'לוגים מסומלצים');
  assert.ok(!js.includes('fetch('), 'Lesson 6 should not fetch live websites');
  assert.ok(!js.includes('XMLHttpRequest'), 'Lesson 6 should not open network requests');
  includes(js, 'proto=http');
});

test('Lesson 6 is linked from the course, catalog and lesson 5', () => {
  includes(course, 'href="cyber-city-lesson-6.html"');
  includes(course, 'Packet Patrol');
  includes(course, '<b>7</b>שיעורים בנויים כרגע');
  includes(homepage, 'href="cyber-city-lesson-6.html"');
  includes(lesson5, 'href="cyber-city-lesson-6.html"');
});
