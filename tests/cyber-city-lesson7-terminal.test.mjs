import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('..', import.meta.url);
const html = readFileSync(join(root.pathname, 'cyber-city-lesson-7.html'), 'utf8');
const js = readFileSync(join(root.pathname, 'js', 'cyber-city-lesson-7.js'), 'utf8');
const css = readFileSync(join(root.pathname, 'css', 'cyber-city-academy.css'), 'utf8');

assert.ok(html.includes('20260919-hacker-terminal-v3'), 'lesson 7 cache key should include the upgraded terminal version');
assert.ok(js.includes('terminalFileSystem'), 'lesson 7 should use a simulated terminal filesystem');
assert.ok(js.includes('terminalTasks'), 'lesson 7 should define concrete Linux terminal tasks');
assert.ok(js.includes("accepts: ['pwd']"), 'terminal practice should include pwd');
assert.ok(js.includes("accepts: ['ls']"), 'terminal practice should include ls');
assert.ok(js.includes("accepts: ['cd evidence']"), 'terminal practice should include cd');
assert.ok(js.includes('cat login_policy.txt'), 'terminal practice should include cat on the policy file');
assert.ok(js.includes('grep unlimited login_policy.txt'), 'terminal practice should include grep for unlimited attempts');
assert.ok(js.includes('grep hint login_policy.txt'), 'terminal practice should include grep for exposed hints');
assert.ok(js.includes('grep success attempts.log'), 'terminal practice should include grep on login attempts');
assert.ok(js.includes('completedTerminalTasks'), 'terminal progress should be tracked per task');
assert.ok(js.includes('command not available in this training lab'), 'terminal must stay inside the closed training lab');
assert.ok(js.includes('terminalFeedback'), 'terminal should give a learning reaction after commands');
assert.ok(js.includes('Linux is case-sensitive'), 'terminal should teach case-sensitive command mistakes');
assert.ok(js.includes('terminal-found-badges'), 'terminal should celebrate newly found evidence');
assert.ok(css.includes('.linux-lab'), 'upgraded Linux lab should have dedicated layout styles');
assert.ok(css.includes('.terminal-task-list'), 'terminal tasks should have visible checklist styling');
assert.ok(css.includes('.terminal-screen'), 'terminal should render like a real command screen');
assert.ok(css.includes('.terminal-live-feedback'), 'terminal should have a prominent live feedback panel');
assert.ok(css.includes('.terminal-found-badges'), 'terminal evidence discoveries should have badge styling');
