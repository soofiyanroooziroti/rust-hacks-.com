import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { resolveDistDir } from './dist-dir.mjs';
import { checkPlaybookPlaceholderCopy, printPlaybookQaChecklist } from './playbook-qa.mjs';
import {
  CHECKOUT_PATH_REDIRECTS,
  CHECKOUT_URLS,
  resolveCheckoutPathRedirect,
} from '../src/config/checkout-redirects.mjs';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = resolveDistDir();
const SITE = 'https://rust-hacks.com';
const errors = [];
const reports = [];

const { PAGE_KEYWORDS, PRODUCT_PAGE_KEYWORDS } = await import(
  pathToFileURL(path.join(root, 'src/config/keywords.ts')).href,
);

/** @param {string} msg */
function fail(msg) {
  errors.push(msg);
}

/** @param {string} msg */
function note(msg) {
  reports.push(msg);
}

/** @returns {string[]} */
function walkHtmlFiles(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const name of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, name.name);
    if (name.isDirectory()) walkHtmlFiles(full, acc);
    else if (name.name.endsWith('.html')) acc.push(full);
  }
  return acc;
}

/** @param {string} file */
function relFromDist(file) {
  return file.slice(dist.length).replace(/\\/g, '/');
}

/** @param {string} pathname */
function pathnameToDistFile(pathname) {
  const p = pathname.endsWith('/') ? pathname : `${pathname}/`;
  if (p === '/') return path.join(dist, 'index.html');
  if (p === '/404/') {
    const flat = path.join(dist, '404.html');
    if (fs.existsSync(flat)) return flat;
  }
  const nested404 = p.match(/^(\/(?:[a-z]{2}(?:-[a-z]+)?)\/)404\/$/);
  if (nested404) {
    const flat = path.join(dist, p.replace(/^\//, '').replace(/\/$/, '.html'));
    if (fs.existsSync(flat)) return flat;
    return path.join(dist, p.replace(/^\//, ''), 'index.html');
  }
  return path.join(dist, p.replace(/^\//, ''), 'index.html');
}

/** @param {string} urlPath */
function urlPathFromDistHtml(file) {
  let rel = relFromDist(file).replace(/index\.html$/, '');
  if (rel === '404.html') return '/404/';
  if (rel.endsWith('/404.html')) {
    const prefix = rel.replace(/404\.html$/, '');
    return prefix ? `/${prefix}/404/` : '/404/';
  }
  if (rel === '' || rel === '/') return '/';
  return `/${rel}`.replace(/\/+/g, '/');
}

/** @param {string} rel */
function isEnglishPrimaryPage(rel) {
  const normalized = rel.replace(/^\/+/, '');
  return !/^(?:fr|tr|pt-br|es|de|pl|th)\//.test(normalized);
}

/** @param {string} html */
function stripTags(html) {
  return html.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

/** @param {string} html @param {string} tag */
function matchAll(html, re) {
  return [...html.matchAll(re)];
}

/** @param {string} loc */
function isRedirectStubHtml(file) {
  if (!fs.existsSync(file)) return true;
  const html = fs.readFileSync(file, 'utf8');
  return /<title>Redirecting to:/i.test(html);
}

/** @returns {Set<string>} */
function loadSitemapLocs() {
  const locs = new Set();
  const files = fs
    .readdirSync(dist)
    .filter((f) => f.startsWith('sitemap') && f.endsWith('.xml'));
  for (const file of files) {
    const xml = fs.readFileSync(path.join(dist, file), 'utf8');
    if (!xml.includes('<loc>')) continue;
    for (const m of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
      locs.add(m[1].trim());
    }
  }
  return locs;
}

function checkRobots() {
  const robotsPath = path.join(dist, 'robots.txt');
  if (!fs.existsSync(robotsPath)) {
    fail('robots.txt missing in dist');
    return;
  }
  const text = fs.readFileSync(robotsPath, 'utf8');
  if (!/Disallow:\s*\/go\//i.test(text)) fail('robots.txt missing Disallow: /go/');
  if (!/Sitemap:\s*https:\/\/rust-hacks\.com\/sitemap/i.test(text)) {
    fail('robots.txt missing sitemap URL for rust-hacks.com');
  }
}

function checkSitemaps() {
  const locs = loadSitemapLocs();
  const urlsetFiles = [...locs].filter((loc) => loc.endsWith('.xml'));
  const pageLocs = [...locs].filter((loc) => !loc.endsWith('.xml'));

  for (const loc of pageLocs) {
    if (!loc.startsWith(SITE)) {
      fail(`Sitemap URL not on ${SITE}: ${loc}`);
      continue;
    }
    const pathname = new URL(loc).pathname;
    if (pathname.startsWith('/go/')) fail(`Sitemap includes /go/ URL: ${loc}`);
    if (pathname.includes('search-index.json')) fail(`Sitemap includes search-index: ${loc}`);
    if (pathname.includes('pagefind')) fail(`Sitemap includes pagefind: ${loc}`);

    const file = pathnameToDistFile(pathname);
    if (!fs.existsSync(file)) {
      fail(`Sitemap URL has no dist page: ${loc}`);
      continue;
    }
    if (isRedirectStubHtml(file)) fail(`Sitemap URL is redirect stub: ${loc}`);

  }

  if (urlsetFiles.length === 0 && pageLocs.length === 0) {
    fail('No sitemap URLs found in dist');
  }
}

const CHECKOUT_BY_PATH = {
  '/go/rust': CHECKOUT_URLS.rustHack,
  '/go/rust/': CHECKOUT_URLS.rustHack,
  '/go/spoofer': CHECKOUT_URLS.hwidSpoofer,
  '/go/spoofer/': CHECKOUT_URLS.hwidSpoofer,
  '/go/hwid-spoofer': CHECKOUT_URLS.hwidSpoofer,
  '/go/hwid-spoofer/': CHECKOUT_URLS.hwidSpoofer,
  '/go/ugc': CHECKOUT_URLS.ugc,
  '/go/ugc/': CHECKOUT_URLS.ugc,
};

const SPEC_KEY_TO_PATH = {
  rustHack: '/go/rust',
  hwidSpoofer: '/go/spoofer',
  ugc: '/go/ugc',
};

function checkCheckoutConfig() {
  for (const [p, expected] of Object.entries(CHECKOUT_BY_PATH)) {
    const fromMap = CHECKOUT_PATH_REDIRECTS.get(p);
    if (fromMap !== expected) {
      fail(`checkout-redirects.mjs ${p} ? ${fromMap} (expected ${expected})`);
    }
    const resolved = resolveCheckoutPathRedirect(p);
    if (resolved !== expected) {
      fail(`resolveCheckoutPathRedirect(${p}) ? ${resolved} (expected ${expected})`);
    }
  }

  for (const [key, goPath] of Object.entries(SPEC_KEY_TO_PATH)) {
    const expected = CHECKOUT_BY_PATH[`${goPath}/`] ?? CHECKOUT_BY_PATH[goPath];
    if (!expected) fail(`Missing checkout mapping for spec key ${key}`);
  }

  const redirectsPath = path.join(root, 'public', '_redirects');
  const servePath = path.join(root, 'scripts', 'serve.mjs');
  const middlewarePath = path.join(root, 'src', 'middleware.ts');
  for (const f of [redirectsPath, servePath, middlewarePath]) {
    if (!fs.existsSync(f)) fail(`Missing checkout-related file: ${f}`);
  }
  const serveText = fs.readFileSync(servePath, 'utf8');
  const mwText = fs.readFileSync(middlewarePath, 'utf8');
  const redirectsText = fs.readFileSync(redirectsPath, 'utf8');
  if (!serveText.includes('resolveCheckoutPathRedirect')) {
    fail('serve.mjs does not use resolveCheckoutPathRedirect');
  }
  if (mwText.includes('prerender') && mwText.includes('/go/')) {
    fail('middleware.ts must not prerender /go/ pages');
  }
  for (const [p, expected] of Object.entries(CHECKOUT_BY_PATH)) {
    if (!redirectsText.includes(`${p} ${expected}`) && !redirectsText.includes(`${p} ${expected} 302`)) {
      if (!redirectsText.includes(expected)) {
        fail(`public/_redirects missing checkout redirect for ${p}`);
      }
    }
  }

  const goDir = path.join(dist, 'go');
  if (fs.existsSync(goDir)) {
    for (const file of walkHtml(goDir)) {
      fail(`dist must not ship HTML under /go/ (use _redirects only): ${relFromDist(file)}`);
    }
  }
}

/** @param {string} dir */
function walkHtml(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    if (fs.statSync(full).isDirectory()) walkHtml(full, out);
    else if (name.endsWith('.html')) out.push(full);
  }
  return out;
}

/** @param {string} href @param {string} fromFile */
function resolveInternal(href, fromFile) {
  if (
    !href ||
    href.startsWith('#') ||
    href.startsWith('mailto:') ||
    href.startsWith('tel:') ||
    href.startsWith('data:') ||
    href.startsWith('blob:')
  ) {
    return { type: 'skip' };
  }
  if (href.startsWith('http://') || href.startsWith('https://')) {
    if (href.includes('localhost') || href.includes('127.0.0.1')) return { type: 'bad', href };
    return { type: 'external' };
  }
  if (href.includes('<') || href.includes('>')) return { type: 'skip' };

  let target = href;
  if (target.startsWith('//')) return { type: 'external' };
  if (!target.startsWith('/')) {
    const base = urlPathFromDistHtml(fromFile);
    const dir = base.endsWith('/') ? base : `${base}/`;
    target = new URL(target, `https://x.invalid${dir}`).pathname;
  }
  const hashSplit = target.split('#');
  let pathPart = hashSplit[0];
  const hash = hashSplit[1] ?? '';
  const qIndex = pathPart.indexOf('?');
  if (qIndex >= 0) pathPart = pathPart.slice(0, qIndex);
  const pathname = pathPart.endsWith('/') ? pathPart : `${pathPart}/`;
  return { type: 'internal', pathname, hash: hash ? `#${hash}` : '', anchor: hash };
}

/** @param {string} html */
function collectIds(html) {
  const ids = new Set();
  for (const m of html.matchAll(/\sid=["']([^"']+)["']/gi)) ids.add(m[1]);
  return ids;
}

const htmlFiles = walkHtmlFiles(dist);
const titles = new Map();
const descriptions = new Map();
const idCache = new Map();

function htmlForPathname(pathname) {
  const file = pathnameToDistFile(pathname);
  if (!idCache.has(file)) {
    idCache.set(file, fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '');
  }
  return { file, html: idCache.get(file) };
}

function checkHtmlPages() {
  for (const file of htmlFiles) {
    const html = fs.readFileSync(file, 'utf8');
    const pageLabel = relFromDist(file);

    if (isRedirectStubHtml(file)) continue;

    const noindex = /name=["']robots["'][^>]+content=["'][^"']*noindex/i.test(html);
    const englishPrimary = isEnglishPrimaryPage(pageLabel);

    if (html.includes('localhost') || html.includes('127.0.0.1')) {
      fail(`${pageLabel}: contains localhost URL`);
    }

    const titlesFound = matchAll(html, /<title[^>]*>([\s\S]*?)<\/title>/gi);
    if (titlesFound.length !== 1) fail(`${pageLabel}: expected 1 <title>, found ${titlesFound.length}`);

    const descFound = matchAll(html, /<meta[^>]+name=["']description["'][^>]*>/gi);
    const descContent = descFound
      .map((m) => m[0].match(/content=["']([^"']*)["']/i)?.[1])
      .filter(Boolean);
    if (descContent.length !== 1) {
      fail(`${pageLabel}: expected 1 meta description, found ${descContent.length}`);
    }

    const h1Found = matchAll(html, /<h1[\s>]/gi);
    if (h1Found.length !== 1) fail(`${pageLabel}: expected 1 <h1>, found ${h1Found.length}`);

    const canon = matchAll(html, /<link[^>]+rel=["']canonical["'][^>]*>/gi);
    const canonHref = canon.map((m) => m[0].match(/href=["']([^"']+)["']/i)?.[1]).filter(Boolean);
    if (canonHref.length !== 1) fail(`${pageLabel}: expected 1 canonical, found ${canonHref.length}`);
    else if (!noindex) {
      const href = canonHref[0];
      const pathname = urlPathFromDistHtml(file);
      const expectedPath = pathname.endsWith('/') ? pathname : `${pathname}/`;
      const expected = `${SITE}${expectedPath === '/' ? '/' : expectedPath}`;
      if (!href.startsWith(SITE)) fail(`${pageLabel}: canonical not absolute on ${SITE}: ${href}`);
      else if (new URL(href).pathname.replace(/\/$/, '') !== expectedPath.replace(/\/$/, '')) {
        fail(`${pageLabel}: canonical ${href} does not self-reference ${expected}`);
      }
    }

    for (const prop of ['og:title', 'og:description', 'og:image']) {
      const tags = matchAll(
        html,
        new RegExp(`<meta[^>]+property=["']${prop.replace(/:/g, ':')}["'][^>]*>`, 'gi'),
      );
      if (tags.length !== 1) {
        fail(`${pageLabel}: expected 1 ${prop}, found ${tags.length}`);
        continue;
      }
      if (prop === 'og:image') {
        const content = tags[0][0].match(/content=["']([^"']+)["']/i)?.[1];
        if (content && !content.startsWith('https://')) fail(`${pageLabel}: og:image not absolute: ${content}`);
      }
    }

    for (const name of ['twitter:card', 'twitter:title', 'twitter:description']) {
      const tags = matchAll(html, new RegExp(`<meta[^>]+name=["']${name}["'][^>]*>`, 'gi'));
      if (tags.length < 1) fail(`${pageLabel}: missing ${name}`);
    }

    const titleText = titlesFound[0]?.[1]?.replace(/&amp;/g, '&').replace(/&#39;/g, "'").trim() ?? '';
    const descText = descContent[0] ?? '';
    if (englishPrimary) {
      if (titleText.length > 60) fail(`${pageLabel}: title over 60 chars (${titleText.length})`);
      if (descText.length > 160) fail(`${pageLabel}: description over 160 chars (${descText.length})`);

      if (titles.has(titleText)) {
        fail(`Duplicate title "${titleText}" (${titles.get(titleText)} and ${pageLabel})`);
      } else titles.set(titleText, pageLabel);

      if (descriptions.has(descText)) {
        fail(`Duplicate description (${descriptions.get(descText)} and ${pageLabel})`);
      } else descriptions.set(descText, pageLabel);
    }

    for (const m of html.matchAll(/<img\b[^>]*>/gi)) {
      const tag = m[0];
      if (!/\balt=/.test(tag)) fail(`${pageLabel}: <img> missing alt`);
      if (!/\bwidth=/.test(tag)) fail(`${pageLabel}: <img> missing width`);
      if (!/\bheight=/.test(tag)) fail(`${pageLabel}: <img> missing height`);
    }

    for (const m of html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
      try {
        JSON.parse(m[1].trim());
      } catch {
        fail(`${pageLabel}: invalid JSON-LD block`);
      }
    }
  }
}

function isHomePath(pathname) {
  return pathname === '/' || pathname.match(/^\/[a-z]{2}(-[a-z]+)?\/$/);
}

function isEnglishPath(pathname) {
  return !pathname.match(/^\/(?:fr|tr|pt-br|es|de|pl|th)(\/|$)/);
}

function checkKeywords() {
  const homeKw = 'rust hacks';
  for (const file of htmlFiles) {
    if (isRedirectStubHtml(file)) continue;
    const html = fs.readFileSync(file, 'utf8');
    const pathname = urlPathFromDistHtml(file);
    if (!isEnglishPath(pathname)) continue;
    const titleRaw = stripTags(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? '');
    const title = titleRaw.toLowerCase();
    const titleWithoutSiteSuffix = title.replace(/\s*\|\s*rust hacks\s*$/i, '').trim();
    const h1 = stripTags(html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1] ?? '').toLowerCase();

    const onHome = isHomePath(pathname);

    if (onHome && pathname === '/') {
      if (!title.includes(homeKw) || !h1.includes(homeKw)) {
        fail(`Home (en) missing "${homeKw}" in title and h1`);
      }
    } else if (!onHome && !pathname.includes('/status/') && pathname !== '/blog/best-rust-hacks/') {
      if (h1.includes(homeKw) || titleWithoutSiteSuffix.includes(homeKw)) {
        fail(`${relFromDist(file)}: "${homeKw}" in title/h1 outside home`);
      }
    }

    const productMatch = pathname.match(/\/product\/([^/]+)\/$/);
    if (productMatch) {
      const slug = productMatch[1];
      const expected = PRODUCT_PAGE_KEYWORDS[slug];
      if (expected) {
        if (!title.includes(expected) && !h1.includes(expected.toLowerCase())) {
          fail(`${pathname}: product page missing keyword "${expected}" in title/h1`);
        }
      }
    }
  }
}

function checkInternalLinks() {
  for (const file of htmlFiles) {
    const from = relFromDist(file);
    const html = fs.readFileSync(file, 'utf8');
    const links = [
      ...html.matchAll(/\shref=["']([^"']+)["']/gi),
      ...html.matchAll(/\ssrc=["']([^"']+)["']/gi),
    ];
    for (const m of links) {
      const href = m[1];
      const resolved = resolveInternal(href, file);
      if (resolved.type === 'bad') fail(`${from}: localhost in link ${href}`);
      if (resolved.type !== 'internal') continue;

      const { pathname, anchor } = resolved;
      if (pathname.startsWith('/go/')) {
        const stub = pathnameToDistFile(pathname);
        if (!fs.existsSync(stub) && !CHECKOUT_PATH_REDIRECTS.has(pathname.replace(/\/$/, ''))) {
          /* /go/ may be middleware-only */
        }
        continue;
      }

      let targetFile = pathnameToDistFile(pathname);
      if (pathname.endsWith('/404/')) {
        const loc = pathname.replace(/^\//, '').replace(/\/$/, '');
        const flat404 = path.join(dist, `${loc}.html`.replace(/\//g, path.sep));
        const nested404 = path.join(dist, loc, 'index.html');
        if (fs.existsSync(flat404)) targetFile = flat404;
        else if (fs.existsSync(nested404)) targetFile = nested404;
      }
      const assetFile = path.join(dist, pathname.replace(/^\//, '').replace(/\/$/, ''));
      const exists =
        fs.existsSync(targetFile) ||
        fs.existsSync(assetFile) ||
        fs.existsSync(`${assetFile}.html`) ||
        fs.existsSync(path.join(dist, pathname.replace(/^\//, '')));

      if (!exists && !pathname.includes('.')) {
        fail(`${from}: broken internal link ${href}`);
      }

      if (anchor) {
        if (/^category=/.test(anchor) && /\/forum\/$/.test(pathname)) continue;
        const id = anchor.startsWith('#') ? anchor.slice(1) : anchor;
        if (id.startsWith('u/') && /\/forum\//.test(pathname)) continue;
        const { html: targetHtml } = htmlForPathname(pathname);
        if (targetHtml) {
          const ids = collectIds(targetHtml);
          if (!ids.has(id)) fail(`${from}: anchor #${id} missing on ${pathname}`);
        }
      }
    }
  }
}

function checkBuyButtons() {
  for (const file of htmlFiles) {
    const from = relFromDist(file);
    const html = fs.readFileSync(file, 'utf8');
    for (const m of html.matchAll(/<a\b[^>]*data-checkout-buy[^>]*>/gi)) {
      const tag = m[0];
      const href = tag.match(/href=["']([^"']+)["']/i)?.[1];
      if (!href?.includes('/go/') && !href?.includes('zadeyo.com')) {
        fail(`${from}: Buy button (data-checkout-buy) not checkout hop: ${href}`);
      }
      const rel = tag.match(/rel=["']([^"']+)["']/i)?.[1] ?? '';
      if (!/nofollow/.test(rel) || !/sponsored/.test(rel)) {
        fail(`${from}: Buy button missing rel="nofollow sponsored"`);
      }
    }
    for (const m of html.matchAll(/<a\b[^>]*href=["'][^"']*\/go\/[^"']*["'][^>]*>/gi)) {
      const tag = m[0];
      if (tag.includes('data-checkout-buy')) continue;
      if (!/catalog-card|Buy now|buy now|Jetzt kaufen|Comprar/i.test(html.slice(m.index, m.index + 400))) continue;
      const rel = tag.match(/rel=["']([^"']+)["']/i)?.[1] ?? '';
      if (!/nofollow/.test(rel) || !/sponsored/.test(rel)) {
        fail(`${from}: Buy link to checkout missing nofollow sponsored`);
      }
    }
  }
}

/** @param {string} s */
function codePointLen(s) {
  return [...s].length;
}

/** Playbook: EN home, about, blog index title/description lengths + about word count. */
function checkPlaybookLandingSeo() {
  const specs = [
    { rel: 'index.html', label: 'home' },
    { rel: 'about/index.html', label: 'about', minWords: 400 },
    { rel: 'blog/index.html', label: 'blog index' },
  ];
  for (const spec of specs) {
    const file = path.join(dist, ...spec.rel.split('/'));
    if (!fs.existsSync(file)) {
      fail(`playbook SEO: missing ${spec.label} (${spec.rel})`);
      continue;
    }
    const html = fs.readFileSync(file, 'utf8');
    const title = stripTags(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? '');
    const desc =
      html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i)?.[1] ??
      html.match(/<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["']/i)?.[1] ??
      '';
    const tLen = codePointLen(title);
    const dLen = codePointLen(desc);
    if (tLen < 50) fail(`${spec.rel}: title under 50 chars (${tLen}): ${title}`);
    if (tLen > 60) fail(`${spec.rel}: title over 60 chars (${tLen})`);
    if (dLen < 140) fail(`${spec.rel}: description under 140 chars (${dLen})`);
    if (dLen > 165) fail(`${spec.rel}: description over 165 chars (${dLen})`);
    if (spec.minWords) {
      const words = stripTags(html).split(/\s+/).filter(Boolean).length;
      if (words < spec.minWords) {
        fail(`${spec.rel}: body under ${spec.minWords} words (${words})`);
      }
    }
  }
}

function checkBlogIndexPlaceholder() {
  for (const file of htmlFiles) {
    const rel = relFromDist(file);
    if (rel !== 'blog/index.html') continue;
    const html = fs.readFileSync(file, 'utf8');
    const text = stripTags(html).toLowerCase();
    for (const phrase of ['will be published here', 'no articles yet', 'coming soon']) {
      if (text.includes(phrase)) {
        fail(`${rel}: blog index placeholder copy (${phrase})`);
      }
    }
  }
}

function checkSecurityHeaders() {
  const headersFile = path.join(dist, '_headers');
  if (!fs.existsSync(headersFile)) {
    fail('dist/_headers missing (security headers)');
    return;
  }
  const text = fs.readFileSync(headersFile, 'utf8');
  for (const needle of [
    'Strict-Transport-Security',
    'X-Frame-Options',
    'X-Content-Type-Options',
    'Referrer-Policy',
    'Content-Security-Policy',
  ]) {
    if (!text.includes(needle)) fail(`dist/_headers missing ${needle}`);
  }
}

function checkInlineCriticalMedia() {
  const file = path.join(dist, 'index.html');
  if (!fs.existsSync(file)) return;
  const html = fs.readFileSync(file, 'utf8');
  if (!/@media\s*\(\s*max-width:\s*639px\s*\)/.test(html)) {
    fail('index.html: missing inline @media 639px (BaseLayout critical CSS)');
  }
  if (!/@media\s*\(\s*min-width:\s*1024px\s*\)/.test(html)) {
    fail('index.html: missing inline @media 1024px (BaseLayout critical CSS)');
  }
}

function checkForumStructuredData() {
  /** @param {unknown} node @param {string} ctx */
  function assertCommentTree(node, ctx) {
    if (!node || typeof node !== 'object') return;
    const c = /** @type {Record<string, unknown>} */ (node);
    const author = c.author;
    if (!author || typeof author !== 'object') {
      fail(`${ctx}: Comment missing author object`);
      return;
    }
    const a = /** @type {Record<string, unknown>} */ (author);
    if (a['@type'] !== 'Person' || typeof a.name !== 'string' || !a.name.trim()) {
      fail(`${ctx}: Comment author must be Person with name`);
    }
    if (typeof a.url !== 'string' || !a.url.includes('/forum/') || !a.url.includes('#u/')) {
      fail(`${ctx}: Comment author missing forum profile url`);
    }
    if (typeof c.datePublished !== 'string' || !c.datePublished.includes('T')) {
      fail(`${ctx}: Comment missing ISO datePublished`);
    }
    const nested = c.comment;
    if (Array.isArray(nested)) {
      nested.forEach((child, i) => assertCommentTree(child, `${ctx} reply[${i}]`));
    }
  }

  /** @param {unknown} parsed */
  function flattenJsonLd(parsed) {
    const out = [];
    const visit = (node) => {
      if (!node || typeof node !== 'object') return;
      const record = /** @type {Record<string, unknown>} */ (node);
      if (Array.isArray(record['@graph'])) {
        for (const child of record['@graph']) visit(child);
        return;
      }
      out.push(record);
    };
    if (Array.isArray(parsed)) parsed.forEach(visit);
    else visit(parsed);
    return out;
  }

  for (const file of htmlFiles) {
    const rel = relFromDist(file);
    if (!/\/forum\/[^/]+\/index\.html$/.test(rel) || rel === 'forum/index.html') continue;
    const html = fs.readFileSync(file, 'utf8');
    let found = false;
    for (const m of html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
      let parsed;
      try {
        parsed = JSON.parse(m[1].trim());
      } catch {
        continue;
      }
      for (const node of flattenJsonLd(parsed)) {
        if (node['@type'] !== 'DiscussionForumPosting') continue;
        found = true;
        const author = node.author;
        if (!author || author['@type'] !== 'Person' || !author.url?.includes('#u/')) {
          fail(`${rel}: DiscussionForumPosting author missing Person url`);
        }
        if (typeof node.datePublished !== 'string' || !node.datePublished.includes('T')) {
          fail(`${rel}: DiscussionForumPosting missing datePublished`);
        }
        if (typeof node.text !== 'string' || !node.text.trim()) {
          fail(`${rel}: DiscussionForumPosting missing text`);
        }
        const count = Number(node.commentCount ?? 0);
        const comments = node.comment;
        if (count > 0 && (!Array.isArray(comments) || comments.length === 0)) {
          fail(`${rel}: commentCount ${count} but no comment objects in JSON-LD`);
        }
        if (Array.isArray(comments)) {
          comments.forEach((c, i) => assertCommentTree(c, `${rel} comment[${i}]`));
        }
      }
    }
    if (!found) fail(`${rel}: missing DiscussionForumPosting JSON-LD`);
  }
}

function checkNoWeeklyPlans() {
  for (const file of htmlFiles) {
    const html = fs.readFileSync(file, 'utf8');
    const from = relFromDist(file);
    if (/\bWeekly\b/.test(html)) {
      fail(`${from}: contains Weekly plan label`);
    }
    if (/plan=weekly/i.test(html)) {
      fail(`${from}: contains plan=weekly`);
    }
  }
}

function checkContentFlags() {
  for (const file of htmlFiles) {
    const html = fs.readFileSync(file, 'utf8');
    const from = relFromDist(file);
    if (/href=["']mailto:/i.test(html)) note(`${from}: mailto link present`);
    if (from.includes('/blog/') && from !== 'blog/index.html') {
      const body = html.split('<article')[1] ?? html;
      if (/'">/.test(body)) note(`${from}: blog body contains '">'`);
      if ((body.match(/<a\b/gi) ?? []).length > 5) note(`${from}: blog body has many inline links`);
    }
    if (/<24h|24\/7/i.test(html)) note(`${from}: contains <24h or 24/7 claim`);
  }
  const home = path.join(dist, 'index.html');
  if (fs.existsSync(home)) {
    const html = fs.readFileSync(home, 'utf8');
    const heroStats = html.match(/hero-stat|data-hero-stat|stat-value/gi);
    if (heroStats) note('index.html: hero stat elements present (review copy)');
  }
}

checkPlaybookPlaceholderCopy({ htmlFiles, relFromDist, isRedirectStubHtml, fail, stripTags, fs });

checkRobots();
checkSitemaps();
checkCheckoutConfig();
checkHtmlPages();
checkKeywords();
checkInternalLinks();
checkForumStructuredData();
checkBuyButtons();
checkNoWeeklyPlans();
checkPlaybookLandingSeo();
checkBlogIndexPlaceholder();
checkSecurityHeaders();
checkInlineCriticalMedia();
checkContentFlags();

if (reports.length) {
  console.log('Content flags (report only):');
  for (const r of reports) console.log(`  � ${r}`);
}

if (errors.length) {
  console.error('verify-site failed:');
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}

console.log(`verify-site passed (${htmlFiles.length} HTML files, dist: ${dist}).`);
printPlaybookQaChecklist(htmlFiles.length);
