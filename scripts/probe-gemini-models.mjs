import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
dotenv.config({ path: path.join(root, '.env') });
const key = process.env.GEMINI_API_KEY;
if (!key) {
  console.error('Missing GEMINI_API_KEY');
  process.exit(1);
}
const tryModels = [
  process.env.GEMINI_MODEL,
  'gemini-2.5-flash-lite',
  'gemini-3.5-flash-lite',
  'gemini-2.0-flash-lite',
  'gemini-2.5-flash',
  'gemini-2.0-flash',
].filter(Boolean);

for (const m of [...new Set(tryModels)]) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${encodeURIComponent(key)}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: 'Reply with OK' }] }] }),
  });
  const body = await res.text();
  let detail = body.slice(0, 150).replace(/\s+/g, ' ');
  if (res.ok) detail = 'OK';
  console.log(`${m}\t${res.status}\t${detail}`);
}
