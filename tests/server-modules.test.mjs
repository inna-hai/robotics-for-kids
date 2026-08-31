#!/usr/bin/env node
import assert from 'node:assert/strict';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const config = require('../server/config');
const httpUtils = require('../server/http-utils');
const summerApi = require('../server/summer-api');
const summerDb = require('../server/summer-db');

assert.equal(config.ROOT, root);
assert.equal(config.DATA_DIR, path.join(root, 'data'));
assert.equal(config.SUMMER_DB_FILE, path.join(root, 'data', 'summer-subscriptions.sqlite'));

for (const name of ['cleanText', 'parseByteRange', 'readBody', 'requestUrl', 'send', 'sendWithHeaders']) {
  assert.equal(typeof httpUtils[name], 'function', `http-utils must export ${name}`);
}
for (const name of ['getSummerProfileFromRequest', 'handleStudentProgress', 'handleSummerAuth']) {
  assert.equal(typeof summerApi[name], 'function', `summer-api must export ${name}`);
}
for (const name of [
  'cleanAccessCode',
  'cleanEmail',
  'createChildRecord',
  'createChildSession',
  'createSummerSession',
  'getDefaultChild',
  'getSessionProfileByToken',
  'getUserBySessionToken',
  'hashPassword',
  'listChildrenForUser',
  'tokenHash',
  'withSummerDb',
]) {
  assert.equal(typeof summerDb[name], 'function', `summer-db must export ${name}`);
}

const normalized = httpUtils.requestUrl({ url: '//api/progress?courseId=sisi', headers: { host: 'localhost' } });
assert.equal(normalized.pathname, '/api/progress');
assert.equal(normalized.searchParams.get('courseId'), 'sisi');

console.log('server module boundary tests passed');
