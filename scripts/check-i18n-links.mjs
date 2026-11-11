/**
 * Scan i18n JSON for suspicious internal hrefs.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

const LOCALE_PREFIX =
  /^(?:fr|tr|pt-br|es|de|pl|th)(\/|$)/;

const ALLOWED_PREFIXES = [
  '/',
  '/blog/',
  '/forum/',
  '/faq/',
  '/support/',
  '/about/',
  '/privacy/',
  '/terms/',
  '/status/',
  '/products/',
  '/go/',
  'https://',
  'http://',
  'mailto:',
  '#',
];

const BAD_PATTERNS = [
  { re: /href=["']\/contact\/?["']/gi, msg: 'legacy /contact/' },
  { re: /href=["']\/cheats\//gi, msg: 'legacy /cheats/' },
  { re: /aion2-hack|dota-2|cs2-faceit/i, msg: 'wrong product/site link' },
  { re: /href=["']\s*["']/g, msg: 'empty href' },
];

function checkText(file, text) {
  const issues = [];
  for (const { re, msg } of BAD_PATTERNS) {
    re.lastIndex = 0;
    if (re.test(text)) issues.push(msg);
  }
  const hrefRe = /href=["']([^"']+)["']/gi;
  let m;
  while ((m = hrefRe.exec(text))) {
    const href = m[1];
    if (href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('/go/')) continue;
    if (href.startsWith('#')) continue;
    const pathOnly = href.split('#')[0];
    if (!pathOnly.startsWith('/')) {
      issues.push(`relative href: ${href}`);
      continue;
    }
    const ok = ALLOWED_PREFIXES.some((p) => pathOnly === p || pathOnly.startsWith(p));
    if (!ok && !LOCALE_PREFIX.test(pathOnly.replace(/^\//, ''))) {
      issues.push(`unusual href: ${href}`);
    }
  }
  return issues;
}

function walkJson(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) walkJson(full, acc);
    else if (ent.name.endsWith('.json') || ent.name.endsWith('.md')) acc.push(full);
  }
  return acc;
}

const targets = [
  path.join(root, 'src/i18n'),
  path.join(root, 'src/content/blog'),
];

const allIssues = [];
for (const dir of targets) {
  for (const file of walkJson(dir)) {
    if (file.includes(`${path.sep}seo${path.sep}`)) continue;
    const text = fs.readFileSync(file, 'utf8');
    const issues = checkText(path.relative(root, file), text);
    if (issues.length) allIssues.push({ file: path.relative(root, file), issues });
  }
}

if (allIssues.length) {
  console.error('check-i18n-links failed:');
  for (const { file, issues } of allIssues) {
    for (const issue of issues) console.error(`  ${file}: ${issue}`);
  }
  process.exit(1);
}

console.log('check-i18n-links passed.');
