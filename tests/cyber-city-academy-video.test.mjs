import assert from 'node:assert/strict';
import test from 'node:test';
import { existsSync, readFileSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const academy = readFileSync(new URL('cyber-city-academy.html', root), 'utf8');

test('Cyber City lesson 1 embeds the explainer video', () => {
  assert.ok(academy.includes('class="lesson-video-card"'), 'lesson page should include the video section');
  assert.ok(academy.includes('marketing/cyber-city-lesson1-explainer.mp4'), 'lesson page should load the lesson 1 MP4');
  assert.ok(academy.includes('controls preload="metadata" playsinline'), 'video should be playable without autoplay');
  assert.ok(existsSync(new URL('marketing/cyber-city-lesson1-explainer.mp4', root)), 'lesson 1 MP4 should exist');
});
