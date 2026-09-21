const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;

const apiKey = process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY;
if (!apiKey) throw new Error('GOOGLE_AI_API_KEY missing');

const scriptPath = process.argv[2] || 'marketing/sisi-gemini-child8-script.txt';
const outBase = process.argv[3] || 'marketing/sisi-gemini-child8-leda';
const model = process.argv[4] || 'gemini-2.5-pro-preview-tts';
const voiceName = process.argv[5] || 'Leda';
const text = fs.readFileSync(scriptPath, 'utf8');

function run(args) {
  const r = spawnSync(ffmpegPath, args, { stdio: 'inherit' });
  if (r.status !== 0) process.exit(r.status || 1);
}

(async () => {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
  const body = {
    contents: [{ parts: [{ text }] }],
    generationConfig: {
      responseModalities: ['AUDIO'],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName }
        }
      }
    }
  };
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'x-goog-api-key': apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) throw new Error(`${res.status} ${JSON.stringify(json).slice(0, 1000)}`);
  const data = json?.candidates?.[0]?.content?.parts?.find(p => p.inlineData)?.inlineData?.data;
  if (!data) throw new Error(`No audio data: ${JSON.stringify(json).slice(0, 1000)}`);
  fs.mkdirSync(path.dirname(outBase), { recursive: true });
  const pcm = `${outBase}.pcm`;
  const wav = `${outBase}.wav`;
  const mp3 = `${outBase}.mp3`;
  fs.writeFileSync(pcm, Buffer.from(data, 'base64'));
  run(['-y', '-f', 's16le', '-ar', '24000', '-ac', '1', '-i', pcm, wav]);
  run(['-y', '-i', wav, '-b:a', '160k', mp3]);
  run(['-hide_banner', '-i', mp3, '-f', 'null', '-']);
  console.log(mp3);
})();
