#!/usr/bin/env node
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = __dirname;
const PORT = Number(process.env.PORT || process.argv[2] || 3032);
const DATA_DIR = path.join(ROOT, 'data');
const FEEDBACK_FILE = path.join(DATA_DIR, 'feedback.jsonl');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml; charset=utf-8',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
};

function send(res, status, body, type = 'application/json; charset=utf-8') {
  res.writeHead(status, {
    'Content-Type': type,
    'Cache-Control': status >= 400 ? 'no-store' : 'no-store',
    'X-Content-Type-Options': 'nosniff',
  });
  res.end(body);
}

function readBody(req, maxBytes = 64 * 1024) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.setEncoding('utf8');
    req.on('data', chunk => {
      data += chunk;
      if (Buffer.byteLength(data, 'utf8') > maxBytes) {
        reject(new Error('payload_too_large'));
        req.destroy();
      }
    });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

function cleanText(value, max = 2000) {
  return String(value || '').replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);
}

async function handleFeedback(req, res) {
  if (req.method !== 'POST') return send(res, 405, JSON.stringify({ error: 'Method not allowed' }));
  try {
    const raw = await readBody(req);
    const body = JSON.parse(raw || '{}');
    const kind = body.kind === 'feature' ? 'feature' : 'bug';
    const message = cleanText(body.message, 3000);
    const page = cleanText(body.page, 500);
    const lesson = cleanText(body.lesson, 80);
    const contact = cleanText(body.contact, 200);

    if (message.length < 5) {
      return send(res, 400, JSON.stringify({ error: 'נא לכתוב לפחות כמה מילים.' }));
    }

    fs.mkdirSync(DATA_DIR, { recursive: true });
    const item = {
      id: crypto.randomUUID(),
      kind,
      message,
      page,
      lesson,
      contact,
      userAgent: cleanText(req.headers['user-agent'], 500),
      ip: cleanText(req.headers['x-forwarded-for'] || req.socket.remoteAddress, 120),
      createdAt: new Date().toISOString(),
      status: 'open',
    };
    fs.appendFileSync(FEEDBACK_FILE, JSON.stringify(item) + '\n', 'utf8');
    return send(res, 201, JSON.stringify({ ok: true, id: item.id }));
  } catch (error) {
    const status = error.message === 'payload_too_large' ? 413 : 400;
    return send(res, status, JSON.stringify({ error: 'לא הצלחנו לשמור את הדיווח.' }));
  }
}

function serveStatic(req, res) {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  let pathname = decodeURIComponent(url.pathname);
  if (pathname === '/') pathname = '/index.html';
  const filePath = path.normalize(path.join(ROOT, pathname));
  if (!filePath.startsWith(ROOT + path.sep)) return send(res, 403, 'Forbidden', 'text/plain; charset=utf-8');

  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) return send(res, 404, 'Not found', 'text/plain; charset=utf-8');
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, {
      'Content-Type': MIME[ext] || 'application/octet-stream',
      'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=300',
      'X-Content-Type-Options': 'nosniff',
    });
    fs.createReadStream(filePath).pipe(res);
  });
}

const server = http.createServer((req, res) => {
  if (req.url.startsWith('/api/feedback')) return handleFeedback(req, res);
  return serveStatic(req, res);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Robotics15 server listening on http://0.0.0.0:${PORT}`);
});
