/**
 * Chunked JSON translation for large i18n / seo files.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  protectContent,
  restoreContent,
  placeholdersRestored,
  scrubForbiddenClaims,
  stripCodeFences,
} from './gemini-protect.mjs';

const projectRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const CHUNK_MAX_KEYS = Number(process.env.TRANSLATE_JSON_CHUNK_KEYS ?? 40);
const CHUNK_PARSE_RETRIES = 3;

let glossaryKeep = null;

function loadGlossaryKeep() {
  if (glossaryKeep) return glossaryKeep;
  const file = path.join(projectRoot, 'src/i18n/glossary.json');
  try {
    const { keep } = JSON.parse(fs.readFileSync(file, 'utf8'));
    glossaryKeep = Array.isArray(keep) ? keep : [];
  } catch {
    glossaryKeep = [];
  }
  return glossaryKeep;
}

/** Count object keys recursively (array elements counted by their subtree). */
export function countJsonKeys(value) {
  if (value === null || typeof value !== 'object') return 0;
  if (Array.isArray(value)) {
    return value.reduce((sum, item) => sum + countJsonKeys(item), 0);
  }
  let n = Object.keys(value).length;
  for (const v of Object.values(value)) {
    n += countJsonKeys(v);
  }
  return n;
}

/** Split a JSON object into chunks of ~maxKeys keys (structure preserved). */
export function splitJsonIntoChunks(obj, maxKeys = CHUNK_MAX_KEYS) {
  if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) {
    return [obj];
  }
  const chunks = [];
  let batch = {};
  let batchCount = 0;

  const flush = () => {
    if (batchCount > 0) {
      chunks.push(batch);
      batch = {};
      batchCount = 0;
    }
  };

  for (const [key, val] of Object.entries(obj)) {
    const n = 1 + countJsonKeys(val);
    if (n > maxKeys) {
      flush();
      const inner = splitJsonIntoChunks(val, maxKeys);
      for (const part of inner) {
        chunks.push({ [key]: part });
      }
      continue;
    }
    if (batchCount + n > maxKeys) flush();
    batch[key] = val;
    batchCount += n;
  }
  flush();
  return chunks.length ? chunks : [obj];
}

export function deepMergeTranslated(base, part) {
  const out = structuredClone(base);
  for (const [k, v] of Object.entries(part)) {
    if (
      v &&
      typeof v === 'object' &&
      !Array.isArray(v) &&
      out[k] &&
      typeof out[k] === 'object' &&
      !Array.isArray(out[k])
    ) {
      out[k] = deepMergeTranslated(out[k], v);
    } else {
      out[k] = v;
    }
  }
  return out;
}

function keyPathSet(obj, prefix = '') {
  const set = new Set();
  if (obj === null || typeof obj !== 'object') return set;
  if (Array.isArray(obj)) {
    obj.forEach((el, i) => {
      for (const p of keyPathSet(el, `${prefix}[${i}]`)) set.add(p);
    });
    return set;
  }
  for (const key of Object.keys(obj)) {
    const p = prefix ? `${prefix}.${key}` : key;
    set.add(p);
    for (const sub of keyPathSet(obj[key], p)) set.add(sub);
  }
  return set;
}

export function sameJsonStructure(a, b) {
  const sa = [...keyPathSet(a)].sort().join('\n');
  const sb = [...keyPathSet(b)].sort().join('\n');
  return sa === sb;
}

const PLACEHOLDER_RE = /\[\[T\d+\]\]|\{[^}]+\}|%\d*\$?[sdif]|%\w|%\./gi;

function collectPlaceholdersFromStrings(obj, out = []) {
  if (typeof obj === 'string') {
    const matches = obj.match(PLACEHOLDER_RE);
    if (matches) out.push(...matches);
    return out;
  }
  if (Array.isArray(obj)) {
    for (const item of obj) collectPlaceholdersFromStrings(item, out);
    return out;
  }
  if (obj && typeof obj === 'object') {
    for (const v of Object.values(obj)) collectPlaceholdersFromStrings(v, out);
  }
  return out;
}

function collectGlossaryHits(obj, terms) {
  const hits = [];
  const blob = JSON.stringify(obj);
  for (const term of terms) {
    if (term && blob.includes(term)) hits.push(term);
  }
  return hits;
}

export function validateTranslatedChunk(sourceChunk, translatedChunk) {
  if (!sameJsonStructure(sourceChunk, translatedChunk)) {
    return { ok: false, reason: 'structure keys mismatch' };
  }
  const translatedBlob = JSON.stringify(translatedChunk);
  const placeholders = [...new Set(collectPlaceholdersFromStrings(sourceChunk))];
  for (const ph of placeholders) {
    if (!translatedBlob.includes(ph)) {
      return { ok: false, reason: `missing placeholder ${ph}` };
    }
  }
  const glossary = loadGlossaryKeep();
  for (const term of collectGlossaryHits(sourceChunk, glossary)) {
    if (!translatedBlob.includes(term)) {
      return { ok: false, reason: `missing glossary term ${term}` };
    }
  }
  return { ok: true };
}

function walkStringLeaves(obj, path, leaves) {
  if (typeof obj === 'string') {
    leaves.push({ path: [...path], value: obj });
    return;
  }
  if (Array.isArray(obj)) {
    obj.forEach((item, i) => walkStringLeaves(item, [...path, i], leaves));
    return;
  }
  if (obj && typeof obj === 'object') {
    for (const [k, v] of Object.entries(obj)) {
      walkStringLeaves(v, [...path, k], leaves);
    }
  }
}

function setAtPath(root, pathParts, value) {
  let cur = root;
  for (let i = 0; i < pathParts.length - 1; i++) {
    cur = cur[pathParts[i]];
  }
  cur[pathParts[pathParts.length - 1]] = value;
}

function parseGeminiJson(text, map) {
  let out = stripCodeFences(text);
  out = scrubForbiddenClaims(restoreContent(out, map));
  if (!placeholdersRestored(out, map)) {
    throw new Error('placeholder restore incomplete');
  }
  return JSON.parse(out);
}

async function translateSingleString(value, locale, langName, geminiGenerate) {
  const payload = { text: value };
  const raw = JSON.stringify(payload);
  const { text: protectedText, map } = protectContent(raw);
  const prompt = `Translate the JSON value "text" from English to ${langName} (${locale}).
Return ONLY valid JSON: {"text":"..."}.
Keep every [[T#]] placeholder, {curly} placeholders, %s style tokens, and HTML tags exactly as in the source string.
Never use the words "undetected" or "safe".

JSON:
${protectedText}`;
  const response = await geminiGenerate(prompt, { jsonMode: true });
  const parsed = parseGeminiJson(response, map);
  if (typeof parsed?.text !== 'string') throw new Error('single-string translate missing text field');
  return parsed.text;
}

async function translateChunkOneByOne(sourceChunk, locale, langName, geminiGenerate, sleep, delayMs) {
  const out = structuredClone(sourceChunk);
  const leaves = [];
  walkStringLeaves(out, [], leaves);
  for (const { path: leafPath, value } of leaves) {
    if (typeof value !== 'string' || !value.trim()) continue;
    const translated = await translateSingleString(value, locale, langName, geminiGenerate);
    setAtPath(out, leafPath, translated);
    await sleep(delayMs);
  }
  const check = validateTranslatedChunk(sourceChunk, out);
  if (!check.ok) throw new Error(check.reason);
  return out;
}

async function translateOneChunk({
  sourceChunk,
  locale,
  langName,
  buildPrompt,
  geminiGenerate,
  sleep,
  delayMs,
  chunkLabel,
}) {
  const chunkStr = JSON.stringify(sourceChunk, null, 2);
  const { text: protectedText, map } = protectContent(chunkStr);
  const prompt = buildPrompt(locale, protectedText);
  let lastParseErr;

  for (let attempt = 0; attempt < CHUNK_PARSE_RETRIES; attempt++) {
    try {
      const response = await geminiGenerate(prompt, { jsonMode: true });
      const parsed = parseGeminiJson(response, map);
      const check = validateTranslatedChunk(sourceChunk, parsed);
      if (!check.ok) {
        throw new Error(check.reason);
      }
      return parsed;
    } catch (err) {
      lastParseErr = err;
      await sleep(delayMs * (attempt + 1));
    }
  }

  console.error(
    `translate: ${chunkLabel} chunk parse/validate failed after ${CHUNK_PARSE_RETRIES} tries (${lastParseErr?.message}); keys ${JSON.stringify(Object.keys(sourceChunk))}; falling back to per-string translate`,
  );

  try {
    return await translateChunkOneByOne(sourceChunk, locale, langName, geminiGenerate, sleep, delayMs);
  } catch (err) {
    console.error(
      `translate: ${chunkLabel} one-by-one fallback failed: ${err.message}; chunk ${JSON.stringify(sourceChunk).slice(0, 500)}`,
    );
    throw err;
  }
}

/**
 * Translate a parsed JSON document in chunks; returns merged object (does not write disk).
 */
export async function translateJsonDocument({
  sourceObj,
  locale,
  langName,
  buildPrompt,
  geminiGenerate,
  sleep,
  delayMs,
  fileLabel,
}) {
  const chunks = splitJsonIntoChunks(sourceObj, CHUNK_MAX_KEYS);
  let merged = {};

  for (let i = 0; i < chunks.length; i++) {
    const chunkLabel = `${fileLabel} chunk ${i + 1}/${chunks.length}`;
    console.log(`translate: ${chunkLabel}…`);
    const translated = await translateOneChunk({
      sourceChunk: chunks[i],
      locale,
      langName,
      buildPrompt,
      geminiGenerate,
      sleep,
      delayMs,
      chunkLabel,
    });
    merged = deepMergeTranslated(merged, translated);
    await sleep(delayMs);
  }

  if (!sameJsonStructure(sourceObj, merged)) {
    throw new Error(`${fileLabel}: merged output structure does not match source`);
  }

  return merged;
}
