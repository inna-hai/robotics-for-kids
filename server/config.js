'use strict';

const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'data');
const ATTACHMENTS_DIR = path.join(DATA_DIR, 'feedback-attachments');
const FEEDBACK_FILE = path.join(DATA_DIR, 'feedback.jsonl');
const ADMIN_TOKEN_FILE = path.join(DATA_DIR, 'admin-token.txt');
const SUMMER_USERS_FILE = path.join(DATA_DIR, 'summer-users.json');
const SUMMER_DB_FILE = path.join(DATA_DIR, 'summer-subscriptions.sqlite');
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30;

module.exports = {
  ADMIN_TOKEN_FILE,
  ATTACHMENTS_DIR,
  DATA_DIR,
  FEEDBACK_FILE,
  ROOT,
  SESSION_TTL_MS,
  SUMMER_DB_FILE,
  SUMMER_USERS_FILE,
};
