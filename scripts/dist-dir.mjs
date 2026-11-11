import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

/** Astro static → dist/; @astrojs/cloudflare → dist/client/. */
export function resolveDistDir() {
  const candidates = [path.join(root, 'dist', 'client'), path.join(root, 'dist')];
  for (const dir of candidates) {
    if (fs.existsSync(path.join(dir, 'sitemap-0.xml'))) return dir;
  }
  for (const dir of candidates) {
    if (
      fs.existsSync(path.join(dir, 'sitemap-index.xml')) ||
      fs.existsSync(path.join(dir, 'index.html'))
    ) {
      return dir;
    }
  }
  return path.join(root, 'dist');
}
