import fs from 'node:fs';
import path from 'node:path';
import { resolveDistDir } from './dist-dir.mjs';

const dist = resolveDistDir();
const source = path.join(dist, 'sitemap-0.xml');

if (!fs.existsSync(source)) {
  console.error(
    `finalize-sitemap: sitemap-0.xml not found under ${path.relative(process.cwd(), dist)} — run astro build first.`,
  );
  process.exit(1);
}

const raw = fs.readFileSync(source, 'utf8');
const urlCount = (raw.match(/<url>/g) ?? []).length;

if (urlCount === 0) {
  console.error('finalize-sitemap: sitemap-0.xml contains no URLs.');
  process.exit(1);
}

function formatUrlset(xml) {
  return xml
    .replace(/^<\?xml[^?]*\?>/, '<?xml version="1.0" encoding="UTF-8"?>\n')
    .replace(/<urlset([^>]*)>/, '<urlset$1>\n')
    .replace(/<\/urlset>/, '\n</urlset>\n')
    .replace(/<url>/g, '  <url>\n')
    .replace(/<\/url>/g, '\n  </url>\n')
    .replace(/<loc>/g, '    <loc>')
    .replace(/<\/loc>/g, '</loc>\n')
    .replace(/<lastmod>/g, '    <lastmod>')
    .replace(/<\/lastmod>/g, '</lastmod>\n')
    .replace(/<changefreq>/g, '    <changefreq>')
    .replace(/<\/changefreq>/g, '</changefreq>\n')
    .replace(/<priority>/g, '    <priority>')
    .replace(/<\/priority>/g, '</priority>\n');
}

const CANONICAL_ORIGIN = 'https://rust-hacks.com';

function canonicalizeHosts(xml) {
  return xml.replace(/https?:\/\/(?:www\.)?(?:cheatsfordeltaforce\.com|rust-hacks\.com)/g, CANONICAL_ORIGIN);
}

function dedupeUrlset(xml) {
  const open = xml.match(/[\s\S]*?<urlset[^>]*>/)?.[0] ?? '';
  const blocks = [...xml.matchAll(/<url>[\s\S]*?<\/url>/g)].map((match) => match[0]);
  const seen = new Set();
  const unique = [];
  for (const block of blocks) {
    const loc = block.match(/<loc>([^<]+)<\/loc>/)?.[1];
    if (!loc) continue;
    const key = loc.replace(/\/+$/, '/').toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(block);
  }
  return `${open}\n${unique.join('\n')}\n</urlset>\n`;
}

const formatted = dedupeUrlset(canonicalizeHosts(formatUrlset(raw)));
const uniqueCount = (formatted.match(/<url>/g) ?? []).length;
const relDist = path.relative(process.cwd(), dist).replace(/\\/g, '/');

fs.writeFileSync(path.join(dist, 'sitemap.xml'), formatted, 'utf8');

for (const name of fs.readdirSync(dist)) {
  if (/^sitemap-\d+\.xml$/.test(name)) fs.unlinkSync(path.join(dist, name));
}

const indexXml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${CANONICAL_ORIGIN}/sitemap.xml</loc>
  </sitemap>
</sitemapindex>
`;
fs.writeFileSync(path.join(dist, 'sitemap-index.xml'), indexXml, 'utf8');

console.log(`Sitemap finalized: ${uniqueCount} URLs → ${relDist}/sitemap.xml`);
