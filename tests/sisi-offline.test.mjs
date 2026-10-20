import assert from 'node:assert/strict';
import fs from 'node:fs';

const hub = fs.readFileSync(new URL('../sisi.html', import.meta.url), 'utf8');
const worker = fs.readFileSync(new URL('../sisi-sw.js', import.meta.url), 'utf8');
const client = fs.readFileSync(new URL('../js/sisi-offline.js', import.meta.url), 'utf8');
const manifest = JSON.parse(fs.readFileSync(new URL('../sisi.webmanifest', import.meta.url), 'utf8'));

assert.match(hub, /sisi\.webmanifest/);
assert.match(hub, /id="sisi-offline-download"/);
assert.match(hub, /js\/sisi-offline\.js/);
assert.equal(manifest.start_url, '/sisi.html?source=offline-app');
assert.match(worker, /\/api\/classroom\/progress/);
assert.match(worker, /SISI_CACHE_DOWNLOAD/);
assert.match(worker, /SISI_PROGRESS_QUEUED/);
assert.match(client, /navigator\.serviceWorker\.register\('\/sisi-sw\.js'/);

for (const lesson of ['space', 'music', 'ocean', 'detective', 'kitchen', 'dino', 'art', 'weather', 'factory', 'garden', 'park', 'mail', 'cinema', 'escape', 'finale']) {
  assert.match(worker, new RegExp(`['\"]${lesson}['\"]`), `offline pack should include ${lesson}`);
}

console.log('sisi offline checks passed');
