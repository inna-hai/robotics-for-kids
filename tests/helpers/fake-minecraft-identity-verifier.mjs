import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import { createServer } from 'node:http';

function signature(secret, timestamp, method, requestTarget, bodyHash) {
  return createHmac('sha256', secret)
    .update(`${timestamp}\n${method}\n${requestTarget}\n${bodyHash}`)
    .digest('hex');
}

export async function startFakeMinecraftIdentityVerifier({ secret, responses = new Map(), delayMs = 0 } = {}) {
  const calls = [];
  const server = createServer(async (req, res) => {
    const url = new URL(req.url, 'http://127.0.0.1');
    const chunks = [];
    let bodyBytes = 0;
    for await (const chunk of req) {
      bodyBytes += chunk.length;
      if (bodyBytes > 4096) {
        res.writeHead(413, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: 'body_too_large' }));
      }
      chunks.push(chunk);
    }
    const rawBody = Buffer.concat(chunks).toString('utf8');
    let body = {};
    try { body = JSON.parse(rawBody || '{}'); } catch {}
    const timestamp = String(req.headers['x-hai-timestamp'] || '');
    const supplied = String(req.headers['x-hai-signature'] || '').replace(/^sha256=/, '');
    const bodyHash = createHash('sha256').update(rawBody).digest('hex');
    const expected = signature(secret, timestamp, req.method, url.pathname, bodyHash);
    const suppliedBuffer = Buffer.from(supplied, 'hex');
    const expectedBuffer = Buffer.from(expected, 'hex');
    const signed = suppliedBuffer.length === expectedBuffer.length && timingSafeEqual(suppliedBuffer, expectedBuffer);
    calls.push({ method: req.method, pathname: url.pathname, upn: body.upn, playerName: body.playerName, signed });
    if (!signed) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'invalid_signature' }));
    }
    const key = String(body.upn || '');
    const configured = responses.get(key) || { status: 404, body: { code: 'user_not_found' } };
    const effectiveDelay = Number(configured.delayMs ?? delayMs);
    if (effectiveDelay) await new Promise((resolve) => setTimeout(resolve, effectiveDelay));
    res.writeHead(configured.status || 200, { 'Content-Type': configured.contentType || 'application/json' });
    if (Object.hasOwn(configured, 'rawBody')) return res.end(configured.rawBody);
    return res.end(JSON.stringify(configured.body));
  });
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  const { port } = server.address();
  return {
    baseUrl: `http://127.0.0.1:${port}`,
    calls,
    close: () => new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve())),
  };
}
