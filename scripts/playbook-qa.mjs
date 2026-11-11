/**
 * Astro marketing site playbook — 7-item QA (automated in verify-site).
 * Manual: item 5 (desktop + mobile spot-check / Lighthouse on prod preview).
 */

const PLACEHOLDER_PHRASES = [
  'lorem ipsum',
  'will be published here',
  'no articles yet',
  'coming soon',
  'your content here',
  'insert text here',
  '[fill]',
];

/** @param {{ htmlFiles: string[], relFromDist: (f: string) => string, isRedirectStubHtml: (f: string) => boolean, fail: (m: string) => void, stripTags: (h: string) => string, fs: typeof import('node:fs') }} ctx */
export function checkPlaybookPlaceholderCopy(ctx) {
  const { htmlFiles, relFromDist, isRedirectStubHtml, fail, stripTags, fs } = ctx;
  for (const file of htmlFiles) {
    if (isRedirectStubHtml(file)) continue;
    const rel = relFromDist(file);
    const text = stripTags(fs.readFileSync(file, 'utf8')).toLowerCase();
    for (const phrase of PLACEHOLDER_PHRASES) {
      if (text.includes(phrase)) {
        fail(`playbook QA #4: ${rel} contains placeholder copy (${phrase})`);
      }
    }
  }
}

/** @param {number} htmlFileCount */
export function printPlaybookQaChecklist(htmlFileCount) {
  console.log('');
  console.log('Playbook QA checklist (7 items):');
  console.log('  [1/7] Whole build — npm run build / build:i18n-test OK; verify-site scanned dist (no missing pages)');
  console.log('  [2/7] sitemap.xml + robots.txt — present and aligned with shipped routes');
  console.log('  [3/7] Store + affiliate links — /go/ hops and Buy CTAs match checkout config');
  console.log('  [4/7] Original copy — no placeholder phrases in built HTML');
  console.log('  [5/7] Desktop + mobile — YOU: spot-check key URLs + Lighthouse on prod preview');
  console.log('  [6/7] Every page — exactly one <title>, meta description, and <h1>');
  console.log('  [7/7] Images — every <img> has alt + width/height; build runs image optimize');
  console.log(`  (${htmlFileCount} HTML files in dist)`);
  console.log('  Run before ship: npm run qa');
  console.log('');
}
