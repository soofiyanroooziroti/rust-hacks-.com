import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'src/i18n/product');

const { buildEnglishProductLocalePack } = await import('../src/data/product-locale-export.ts');

fs.mkdirSync(outDir, { recursive: true });

const en = buildEnglishProductLocalePack();
fs.writeFileSync(path.join(outDir, 'en.json'), `${JSON.stringify(en, null, 2)}\n`, 'utf8');

console.log(`Wrote ${path.relative(root, outDir)}/en.json`);
