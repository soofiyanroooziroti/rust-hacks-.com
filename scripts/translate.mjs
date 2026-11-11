/**
 * npm run translate — Gemini translations for i18n/seo JSON and blog posts.
 * Requires GEMINI_API_KEY in .env (dotenv). Resumes: skips up-to-date targets.
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import {
  protectContent,
  restoreContent,
  placeholdersRestored,
  scrubForbiddenClaims,
  stripCodeFences,
} from './gemini-protect.mjs';
import { translateJsonDocument } from './translate-json-chunks.mjs';
import { langName, nonDefaultShipLocales } from './locale-ship.mjs';
import localeSeoKeywords from './locale-seo-keywords.json' with { type: 'json' };

const root = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(root, '..');
dotenv.config({ path: path.join(projectRoot, '.env') });

const MODEL_PRIMARY = process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite';
const MODEL_FALLBACKS = ['gemini-2.5-flash-lite', 'gemini-2.0-flash-lite'];
let activeModel = MODEL_PRIMARY;
const API_KEY = process.env.GEMINI_API_KEY;
const DELAY_MS = Number(process.env.TRANSLATE_DELAY_MS ?? 2500);
const FORCE = process.env.FORCE_TRANSLATE === '1';
if (process.argv.includes('--forum')) {
  process.env.TRANSLATE_KINDS = 'forum,forum-ui';
}

const LOCALES = nonDefaultShipLocales;
const LANG_NAME = langName;
const i18nEnPath = path.join(projectRoot, 'src/i18n/en.json');
const seoEnPath = path.join(projectRoot, 'src/i18n/seo/en.json');
const forumEnPath = path.join(projectRoot, 'src/i18n/forum/en.json');
const productEnPath = path.join(projectRoot, 'src/i18n/product/en.json');

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function isEmptyJsonFile(filePath) {
  if (!fs.existsSync(filePath)) return true;
  try {
    const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    return !parsed || (typeof parsed === 'object' && !Array.isArray(parsed) && Object.keys(parsed).length === 0);
  } catch {
    return true;
  }
}

function readEnI18n() {
  try {
    return JSON.parse(fs.readFileSync(i18nEnPath, 'utf8'));
  } catch {
    return null;
  }
}

function readEnSeo() {
  try {
    return JSON.parse(fs.readFileSync(seoEnPath, 'utf8'));
  } catch {
    return null;
  }
}

/** Locale files still copied from English must not skip translate. */
function i18nForumUiIncomplete(dest, locale) {
  if (locale === 'en') return false;
  if (isEmptyJsonFile(dest)) return true;
  const en = readEnI18n();
  if (!en?.forum) return false;
  try {
    const parsed = JSON.parse(fs.readFileSync(dest, 'utf8'));
    const enForum = en.forum;
    const locForum = parsed?.forum;
    const enKeys = Object.keys(enForum);
    const locKeys = locForum && typeof locForum === 'object' ? Object.keys(locForum) : [];
    if (locKeys.length < enKeys.length) return true;
    if (locForum?.sortPopular === enForum.sortPopular) return true;
    if (locForum?.exploreGuides === enForum.exploreGuides) return true;
    return false;
  } catch {
    return true;
  }
}

function i18nBundleIncomplete(dest, locale) {
  if (locale === 'en') return false;
  if (isEmptyJsonFile(dest)) return true;
  const en = readEnI18n();
  if (!en) return true;
  try {
    const parsed = JSON.parse(fs.readFileSync(dest, 'utf8'));
    if (!Array.isArray(parsed?.hero?.modes) || parsed.hero.modes.length < 4) return true;
    if (!Array.isArray(parsed?.features?.items) || parsed.features.items.length < 3) return true;
    if (parsed?.hero?.subtitle === en?.hero?.subtitle) return true;
    if (parsed?.exploreSection?.title === en?.exploreSection?.title) return true;
    if (i18nForumUiIncomplete(dest, locale)) return true;
    return false;
  } catch {
    return true;
  }
}

function seoBundleIncomplete(dest, locale) {
  if (locale === 'en') return false;
  if (isEmptyJsonFile(dest)) return true;
  const en = readEnSeo();
  if (!en) return true;
  try {
    const parsed = JSON.parse(fs.readFileSync(dest, 'utf8'));
    if (parsed?.site?.description === en?.site?.description) return true;
    const home = parsed?.pages?.['/'];
    const homeEn = en?.pages?.['/'];
    if (home?.title === homeEn?.title && home?.description === homeEn?.description) return true;
    return false;
  } catch {
    return true;
  }
}

function isMainI18nJson(dest) {
  return path.dirname(dest) === path.join(projectRoot, 'src/i18n');
}

function isSeoJson(dest) {
  return path.dirname(dest) === path.join(projectRoot, 'src/i18n/seo');
}

function isForumJson(dest) {
  return path.dirname(dest) === path.join(projectRoot, 'src/i18n/forum');
}

function isProductJson(dest) {
  return path.dirname(dest) === path.join(projectRoot, 'src/i18n/product');
}

function readEnProduct() {
  try {
    return JSON.parse(fs.readFileSync(productEnPath, 'utf8'));
  } catch {
    return null;
  }
}

function productBundleIncomplete(dest, locale) {
  if (locale === 'en') return false;
  if (!fs.existsSync(dest)) return true;
  const en = readEnProduct();
  if (!en?.cheats?.overview?.title) return true;
  try {
    const parsed = JSON.parse(fs.readFileSync(dest, 'utf8'));
    if (parsed?.cheats?.overview?.title === en.cheats.overview.title) return true;
    return false;
  } catch {
    return true;
  }
}

function readEnForum() {
  try {
    return JSON.parse(fs.readFileSync(forumEnPath, 'utf8'));
  } catch {
    return null;
  }
}

function forumBundleIncomplete(dest, locale) {
  if (locale === 'en') return false;
  if (isEmptyJsonFile(dest)) return true;
  const en = readEnForum();
  if (!en?.posts || Object.keys(en.posts).length === 0) return true;
  try {
    const parsed = JSON.parse(fs.readFileSync(dest, 'utf8'));
    const enSlug = Object.keys(en.posts)[0];
    const locPost = parsed?.posts?.[enSlug];
    const enPost = en.posts[enSlug];
    if (!locPost?.title || locPost.title === enPost?.title) return true;
    return false;
  } catch {
    return true;
  }
}

function blogBundleIncomplete(dest, src) {
  if (!fs.existsSync(dest)) return true;
  try {
    const enRaw = fs.readFileSync(src, 'utf8');
    const destRaw = fs.readFileSync(dest, 'utf8');
    const en = parseBlogFrontmatter(enRaw);
    const destEnd = destRaw.indexOf('\n---', 3);
    const destData = JSON.parse(destRaw.slice(3, destEnd));
    if (destData?.title === en?.title && destData?.desc === en?.desc) return true;
    return false;
  } catch {
    return true;
  }
}

function isUpToDate(src, dest, locale, kind) {
  if (FORCE || !fs.existsSync(dest)) return false;
  if (kind === 'blog' && blogBundleIncomplete(dest, src)) return false;
  if (kind === 'forum-ui' && isMainI18nJson(dest) && i18nForumUiIncomplete(dest, locale)) return false;
  if (isMainI18nJson(dest) && i18nBundleIncomplete(dest, locale)) return false;
  if (isSeoJson(dest) && seoBundleIncomplete(dest, locale)) return false;
  if (isForumJson(dest) && forumBundleIncomplete(dest, locale)) return false;
  if (isProductJson(dest) && productBundleIncomplete(dest, locale)) return false;
  return fs.statSync(dest).mtimeMs >= fs.statSync(src).mtimeMs;
}

function includeKind(kinds, ...aliases) {
  if (!kinds?.length) return true;
  return aliases.some((a) => kinds.includes(a));
}

function buildJobs() {
  const jobs = [];
  const blogEnDir = path.join(projectRoot, 'src/content/blog/en');

  const localeFilter = process.env.TRANSLATE_LOCALES?.split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const locales = localeFilter?.length ? LOCALES.filter((l) => localeFilter.includes(l)) : LOCALES;
  const kinds = process.env.TRANSLATE_KINDS?.split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  for (const locale of locales) {
    if (includeKind(kinds, 'i18n', 'ui', 'pages')) {
      jobs.push({
        kind: 'json',
        locale,
        src: i18nEnPath,
        dest: path.join(projectRoot, 'src/i18n', `${locale}.json`),
      });
    }
    if (includeKind(kinds, 'forum-ui')) {
      jobs.push({
        kind: 'forum-ui',
        locale,
        src: i18nEnPath,
        dest: path.join(projectRoot, 'src/i18n', `${locale}.json`),
      });
    }
    if (includeKind(kinds, 'seo')) {
      jobs.push({
        kind: 'seo',
        locale,
        src: seoEnPath,
        dest: path.join(projectRoot, 'src/i18n/seo', `${locale}.json`),
      });
    }
    if (includeKind(kinds, 'forum')) {
      jobs.push({
        kind: 'forum',
        locale,
        src: forumEnPath,
        dest: path.join(projectRoot, 'src/i18n/forum', `${locale}.json`),
      });
    }
    if (includeKind(kinds, 'product') && fs.existsSync(productEnPath)) {
      jobs.push({
        kind: 'product',
        locale,
        src: productEnPath,
        dest: path.join(projectRoot, 'src/i18n/product', `${locale}.json`),
      });
    }
  }

  if (fs.existsSync(blogEnDir) && includeKind(kinds, 'blog')) {
    for (const file of fs.readdirSync(blogEnDir).filter((f) => f.endsWith('.md'))) {
      const src = path.join(blogEnDir, file);
      for (const locale of locales) {
        jobs.push({
          kind: 'blog',
          locale,
          src,
          dest: path.join(projectRoot, 'src/content/blog', locale, file),
        });
      }
    }
  }

  return jobs.filter((j) => !isUpToDate(j.src, j.dest, j.locale, j.kind));
}

async function geminiGenerate(prompt, { jsonMode = false } = {}) {
  const models = [activeModel, ...MODEL_FALLBACKS.filter((m) => m !== activeModel)];
  let lastErr;
  for (const model of models) {
    for (let attempt = 0; attempt < 8; attempt++) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(API_KEY)}`;
      const generationConfig = { temperature: 0.2 };
      if (jsonMode) generationConfig.responseMimeType = 'application/json';
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig,
        }),
      });
      if (res.status === 429 || res.status === 503) {
        lastErr = new Error(`Gemini ${res.status}`);
        lastErr.status = res.status;
        await sleep(DELAY_MS * 2 ** Math.min(attempt, 5));
        continue;
      }
      if (res.status === 404) {
        lastErr = new Error(`Gemini model ${model} unavailable`);
        break;
      }
      if (!res.ok) {
        throw new Error(`Gemini HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`);
      }
      activeModel = model;
      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error('Gemini empty response');
      return text;
    }
  }
  throw lastErr ?? new Error('Gemini request failed');
}

function jsonPrompt(locale, protectedText) {
  return `You are a professional translator for a gaming software website.
Translate this JSON file from English to ${LANG_NAME[locale]} (${locale}).
Rules:
- Return ONLY valid JSON, no markdown fences or commentary.
- Keep every JSON key unchanged (id, href, slug, domain, discord, icon, topic, bento, tags, etc.).
- Translate human-readable string values only.
- Keep every placeholder like [[T1]], [[T2]] exactly as-is (do not translate or remove them).
- Keep brand "Rust Hacks", domain rust-hacks.com, USD prices, product slugs, and external URLs in English/Latin where shown.
- Do not translate footer "More sites" link labels for Unturned, Aion 2, or CS2 — leave those product names as in English.
- Never use the words "undetected" or "safe".
- Write natural native copy for gamers; avoid word-for-word English calques.

JSON to translate:
${protectedText}`;
}

function seoPrompt(locale, protectedText) {
  const hints = localeSeoKeywords[locale] ?? {};
  return `You are an SEO copywriter and translator for a Rust (PC) software store.
Translate this SEO JSON from English to ${LANG_NAME[locale]} (${locale}).

Local keyword guidance (use naturally in titles/descriptions — do NOT keyword-stuff):
- Home primary: ${hints.homePrimary ?? 'Rust hacks'}
- Cheats product: ${hints.cheatsProduct ?? 'Rust hack'}
- HWID spoofer: ${hints.spoofer ?? 'Rust HWID spoofer'}
- UGC recovery: ${hints.ugc ?? 'UGC account recovery'}
- Related terms natives search: ${hints.terms ?? 'aimbot, ESP, loot, spoofer, EAC'}

Rules:
- Return ONLY valid JSON, same structure and keys as input.
- Translate title and description strings in site.* and pages.* paths.
- One primary keyword focus per page path (mirror English intent, local wording).
- Title ≤ 60 characters where possible; meta description ≤ 160 characters.
- Keep paths as keys unchanged (/product/rust-cheat/, etc.).
- Keep brand "Rust Hacks", domain rust-hacks.com, USD prices, and product slugs in English.
- Never use the words "undetected" or "safe".
- Rust, EAC, HWID, ESP, aimbot may stay Latin where gamers expect them.

JSON to translate:
${protectedText}`;
}

function productJsonPrompt(locale, protectedText) {
  return `You are a professional translator for a Rust (PC) software product store.
Translate this product-page JSON from English to ${LANG_NAME[locale]} (${locale}).

Rules:
- Return ONLY valid JSON, same structure and keys as input.
- Translate all human-readable strings (overview, body, steps, goodToKnow, limitations, requirements, groupNames, descs, slides, features arrays).
- Keep JSON keys unchanged (cheats, spoofer, ugc, steps, howToGet, etc.).
- Keep placeholder {name} in howToGet exactly as-is.
- Keep brand "Rust Hacks", domain rust-hacks.com, USD prices, P30D, P99Y, Discord, EAC, HWID, UGC, ESP, aimbot, FOV, RGB where gamers expect Latin.
- Feature option names like "FOV", "Smooth", "Skeleton" may stay English if that is standard in ${LANG_NAME[locale]} gaming UI; translate groupNames and all description sentences fully.
- Never use the words "undetected" or "safe".

JSON to translate:
${protectedText}`;
}

function forumJsonPrompt(locale, protectedText) {
  return `You are a professional translator for a gaming software community forum (Rust on PC).
Translate this forum JSON from English to ${LANG_NAME[locale]} (${locale}).

Rules:
- Return ONLY valid JSON, same structure and keys as input.
- Translate categories.* display names and posts.* title, excerpt, body strings, flair, and comment/reply bodies.
- Keep post slug keys unchanged (ace-status-before-launch, etc.).
- Keep author names unchanged (HarborWatch, NightRaid, etc.).
- Keep every [[T#]] placeholder exactly as-is.
- Keep brand "Rust Hacks", domain rust-hacks.com, and product paths in English/Latin where shown.
- Never use the words "undetected" or "safe".

JSON to translate:
${protectedText}`;
}

function parseBlogFrontmatter(raw) {
  const end = raw.indexOf('\n---', 3);
  return JSON.parse(raw.slice(3, end));
}

function blogDateIsoFromEn(date) {
  const raw = String(date ?? '').trim();
  const iso = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return iso[0].slice(0, 10);
  const mdy = raw.match(/^([A-Za-z.]+)\s+(\d{1,2}),?\s+(\d{4})$/);
  if (mdy) {
    const months = {
      jan: 1,
      feb: 2,
      mar: 3,
      apr: 4,
      may: 5,
      jun: 6,
      jul: 7,
      aug: 8,
      sep: 9,
      oct: 10,
      nov: 11,
      dec: 12,
    };
    const key = mdy[1].replace(/\./g, '').slice(0, 3).toLowerCase();
    const mon = months[key];
    if (mon) {
      return `${mdy[3]}-${String(mon).padStart(2, '0')}-${String(Number(mdy[2])).padStart(2, '0')}`;
    }
  }
  return null;
}

function mergeBlogMetaFromEnglish(enRaw, data) {
  const en = parseBlogFrontmatter(enRaw);
  data.slug = en.slug;
  data.image = en.image;
  data.featured = en.featured;
  data.tag = en.tag;
  const iso = blogDateIsoFromEn(en.date);
  if (iso) data.dateIso = iso;
}

function blogPrompt(locale, protectedText) {
  const inner = protectedText.startsWith('---')
    ? protectedText.slice(protectedText.indexOf('\n', 3) + 1, protectedText.indexOf('\n---', 3))
    : protectedText;
  return `You are a professional translator for a gaming software website.
Translate this blog post JSON frontmatter from English to ${LANG_NAME[locale]} (${locale}).
Rules:
- Return ONLY valid JSON (no markdown fences, no --- lines).
- Keep slug, image, date, featured, tag unchanged; translate title, desc, readTime, and body text fields.
- Keep every placeholder like [[T1]] exactly as-is.
- Preserve HTML tags inside strings.
- Never use the words "undetected" or "safe".

JSON:
${inner}`;
}

async function translateForumUiJob(job) {
  const en = readEnI18n();
  if (!en?.forum) {
    throw new Error('src/i18n/en.json missing forum section — run npm run i18n:export-en');
  }
  const sourceObj = { forum: en.forum };
  const fileLabel = path.relative(projectRoot, job.dest);
  const buildPrompt = (locale, protectedText) => jsonPrompt(locale, protectedText);
  const translated = await translateJsonDocument({
    sourceObj,
    locale: job.locale,
    langName: LANG_NAME[job.locale],
    buildPrompt,
    geminiGenerate,
    sleep,
    delayMs: DELAY_MS,
    fileLabel: `${fileLabel} forum UI`,
  });
  let localeRoot = {};
  if (fs.existsSync(job.dest)) {
    localeRoot = JSON.parse(fs.readFileSync(job.dest, 'utf8'));
  }
  localeRoot.forum = translated.forum;
  fs.mkdirSync(path.dirname(job.dest), { recursive: true });
  fs.writeFileSync(job.dest, `${JSON.stringify(localeRoot, null, 2)}\n`, 'utf8');
  console.log(`ok ${fileLabel} (forum UI)`);
  await sleep(DELAY_MS);
}

async function translateJsonJob(job) {
  if (job.kind !== 'json' && job.kind !== 'seo' && job.kind !== 'forum' && job.kind !== 'product') {
    throw new Error(`translateJsonJob: unexpected kind ${job.kind}`);
  }
  const raw = fs.readFileSync(job.src, 'utf8');
  const sourceObj = JSON.parse(raw);
  const fileLabel = path.relative(projectRoot, job.dest);
  const buildPrompt = (locale, protectedText) => {
    if (job.kind === 'seo') return seoPrompt(locale, protectedText);
    if (job.kind === 'forum') return forumJsonPrompt(locale, protectedText);
    if (job.kind === 'product') return productJsonPrompt(locale, protectedText);
    return jsonPrompt(locale, protectedText);
  };
  const merged = await translateJsonDocument({
    sourceObj,
    locale: job.locale,
    langName: LANG_NAME[job.locale],
    buildPrompt,
    geminiGenerate,
    sleep,
    delayMs: DELAY_MS,
    fileLabel,
  });
  fs.mkdirSync(path.dirname(job.dest), { recursive: true });
  fs.writeFileSync(job.dest, `${JSON.stringify(merged, null, 2)}\n`, 'utf8');
  console.log(`ok ${fileLabel}`);
  await sleep(DELAY_MS);
}

async function translateJob(job) {
  if (job.kind === 'forum-ui') {
    return translateForumUiJob(job);
  }
  if (job.kind === 'json' || job.kind === 'seo' || job.kind === 'forum' || job.kind === 'product') {
    return translateJsonJob(job);
  }

  const raw = fs.readFileSync(job.src, 'utf8');
  const { text: protectedText, map } = protectContent(raw);
  const prompt = blogPrompt(job.locale, protectedText);

  let lastErr;
  for (let attempt = 0; attempt < 8; attempt++) {
    try {
      let out = await geminiGenerate(prompt, { jsonMode: true });
      out = stripCodeFences(out);
      out = scrubForbiddenClaims(restoreContent(out, map));
      if (!placeholdersRestored(out, map)) {
        throw new Error('placeholder restore incomplete');
      }
      let normalized;
      const data = JSON.parse(out.startsWith('---') ? out.slice(3, out.indexOf('\n---', 3)) : out);
      mergeBlogMetaFromEnglish(raw, data);
      normalized = `---\n${JSON.stringify(data, null, 2)}\n---\n`;
      fs.mkdirSync(path.dirname(job.dest), { recursive: true });
      fs.writeFileSync(job.dest, normalized, 'utf8');
      console.log(`ok ${path.relative(projectRoot, job.dest)}`);
      await sleep(DELAY_MS);
      return;
    } catch (err) {
      lastErr = err;
      const wait = DELAY_MS * 2 ** Math.min(attempt, 4);
      const retryable =
        err.status === 429 ||
        err.status === 503 ||
        err instanceof SyntaxError ||
        String(err.message).includes('429') ||
        String(err.message).includes('503') ||
        String(err.message).includes('fetch failed') ||
        String(err.message).includes('placeholder') ||
        String(err.message).includes('JSON') ||
        String(err.message).includes('blog') ||
        String(err.message).includes('Gemini HTTP');
      if (retryable) {
        await sleep(wait);
        continue;
      }
      throw err;
    }
  }
  const detail = lastErr?.message ? `: ${lastErr.message}` : '';
  throw new Error(`failed ${job.dest}${detail}`);
}

function ensureEnglishExport() {
  const needs =
    !fs.existsSync(i18nEnPath) ||
    isEmptyJsonFile(i18nEnPath) ||
    !fs.existsSync(seoEnPath) ||
    isEmptyJsonFile(seoEnPath);
  if (needs || (FORCE && process.env.I18N_EXPORT_BEFORE_TRANSLATE === '1')) {
    console.log('translate: refreshing src/i18n/en.json and seo/en.json from en.ts…');
    const script = path.join(root, 'export-i18n-en.mjs');
    const run = spawnSync('npx', ['tsx', script], { cwd: projectRoot, stdio: 'inherit', shell: true });
    if (run.status !== 0) {
      process.exit(run.status ?? 1);
    }
  }
  const forumEn = readEnForum();
  if (!forumEn?.posts || Object.keys(forumEn.posts).length === 0) {
    console.log('translate: refreshing src/i18n/forum/en.json from forum data…');
    const script = path.join(root, 'export-forum-en.mjs');
    const run = spawnSync('npx', ['tsx', script], { cwd: projectRoot, stdio: 'inherit', shell: true });
    if (run.status !== 0) {
      process.exit(run.status ?? 1);
    }
  }
}

async function main() {
  if (!API_KEY) {
    console.error('Missing GEMINI_API_KEY in .env');
    process.exit(1);
  }
  ensureEnglishExport();
  const jobs = buildJobs();
  console.log(`translate: ${jobs.length} file(s) pending`);
  if (jobs.length === 0) {
    console.log('translate: nothing to do (all targets up to date). Run npm run i18n:export-en only when English JSON changed.');
    return;
  }
  for (const job of jobs) {
    const label = path.relative(projectRoot, job.dest);
    console.log(`translate: working on ${label} (${job.kind})…`);
    await translateJob(job);
  }
  console.log('translate: done');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
