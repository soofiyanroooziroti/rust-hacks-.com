import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const { PAGE_SEO } = await import(pathToFileURL(path.join(root, 'src/config/pageSeo.ts')).href);
const { PAGE_KEYWORDS, primaryKeywords } = await import(
  pathToFileURL(path.join(root, 'src/config/keywords.ts')).href,
);

const errors = [];
const titles = new Map();
const descriptions = new Map();
const keywordToPath = new Map();
const primaries = primaryKeywords();

function keywordPattern(keyword) {
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(?<![a-z0-9])${escaped}(?![a-z0-9])`, 'i');
}

function stripBrandSuffix(title) {
  return title.replace(/\s*\|\s*rust hacks\s*$/i, '').trim();
}

for (const [pathname, entry] of Object.entries(PAGE_SEO)) {
  const expected = PAGE_KEYWORDS[pathname] ?? null;
  const title = entry.title;
  const description = entry.description;
  const titleForKeywords = stripBrandSuffix(title);

  if (title.length > 60) errors.push(`Title over 60 chars (${title.length}): ${pathname}`);
  if (description.length > 160) errors.push(`Description over 160 chars (${description.length}): ${pathname}`);

  if (titles.has(title)) errors.push(`Duplicate title: "${title}" (${titles.get(title)} and ${pathname})`);
  else titles.set(title, pathname);

  if (descriptions.has(description)) {
    errors.push(`Duplicate description (${descriptions.get(description)} and ${pathname})`);
  } else descriptions.set(description, pathname);

  if (expected) {
    if (keywordToPath.has(expected)) {
      errors.push(`Duplicate primary keyword "${expected}" on ${keywordToPath.get(expected)} and ${pathname}`);
    } else keywordToPath.set(expected, pathname);

    const titleLower = title.toLowerCase();
    const descLower = description.toLowerCase();
    if (!titleLower.includes(expected) && pathname !== '/') {
      /* home title uses Title Case; keyword still present */
    }
    if (pathname === '/' && !titleLower.includes(expected.toLowerCase())) {
      errors.push(`Home title missing keyword "${expected}"`);
    }
  }

  for (const other of primaries) {
    if (other === expected) continue;
    if (pathname === '/' && other === 'rust game hacks') continue;
    if (pathname === '/status/' && other === 'rust hacks') continue;
    if (keywordPattern(other).test(titleForKeywords)) {
      errors.push(`Title on ${pathname} contains another page keyword "${other}"`);
    }
    if (keywordPattern(other).test(description)) {
      errors.push(`Description on ${pathname} contains another page keyword "${other}"`);
    }
  }
}

for (const [pathname, keyword] of Object.entries(PAGE_KEYWORDS)) {
  if (keyword && !PAGE_SEO[pathname]) {
    errors.push(`Missing PAGE_SEO entry for ${pathname}`);
  }
}

if (errors.length) {
  console.error('SEO keyword check failed:\n' + errors.map((e) => `  - ${e}`).join('\n'));
  process.exit(1);
}

console.log('SEO keyword check passed.');
