import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const academy = readFileSync(new URL('cyber-city-academy.html', root), 'utf8');
const js = readFileSync(new URL('js/cyber-city-missions.js', root), 'utf8');
const css = readFileSync(new URL('css/cyber-city-academy.css', root), 'utf8');

test('Cyber City lesson 1 has a clear student navigation bar', () => {
  assert.ok(academy.includes('class="student-nav-panel"'), 'lesson should expose a dedicated student navigation panel');
  assert.ok(academy.includes('id="currentStepLabel"'), 'lesson should show the current mission number');
  assert.ok(academy.includes('id="currentStepName"'), 'lesson should show the current mission name');
  assert.ok(js.includes('short:'), 'station data should include short child-friendly labels');
  assert.ok(js.includes('משימה ${state.station + 1} מתוך ${stations.length}'), 'navigation should render mission count');
  assert.ok(js.includes('`הבא: ${nextStation.short}`'), 'next button should name the next mission');
  assert.ok(!js.includes('קיבלתי משימה'), 'brief should not ask students to acknowledge the mission with an extra button');
  assert.ok(js.includes("if (state.station === 0)"), 'moving forward from the brief should complete it automatically');
  assert.ok(css.includes('.student-nav-panel'), 'navigation panel should have dedicated styling');
  assert.ok(css.includes('grid-template-columns: repeat(8, minmax(0, 1fr))'), 'desktop navigation should show all 8 missions at once');
});
