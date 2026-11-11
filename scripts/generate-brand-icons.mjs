import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const root = process.cwd();
const publicDir = path.join(root, 'public');
const originalPath = path.join(publicDir, 'images', 'logo-original.png');

if (!fs.existsSync(originalPath)) {
  console.error('Missing public/images/logo-original.png — add the full uncropped logo there first.');
  process.exit(1);
}

const SQUARE = 512;
const pad = { r: 0, g: 0, b: 0, alpha: 0 };

const squarePng = await sharp(originalPath)
  .resize(SQUARE, SQUARE, { fit: 'contain', background: pad })
  .png()
  .toBuffer();

await sharp(squarePng).webp({ quality: 86, lossless: false, alphaQuality: 100 }).toFile(path.join(publicDir, 'logo.webp'));

const faviconCandidates = [
  path.join(publicDir, 'images', 'favicon-original.jpg'),
  path.join(publicDir, 'images', 'favicon-original.png'),
  path.join(root, 'favicon.jpg'),
];

const faviconSource = faviconCandidates.find((p) => fs.existsSync(p));

if (!faviconSource) {
  console.log('logo.webp updated. Favicon source missing — existing favicon files unchanged.');
  console.log('Add public/images/favicon-original.jpg (or root favicon.jpg) then re-run to refresh favicons.');
  process.exit(0);
}

const sizes = [
  { name: 'favicon-32.png', size: 32 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'favicon-16.png', size: 16 },
  { name: 'favicon-48.png', size: 48 },
];

for (const { name, size } of sizes) {
  await sharp(faviconSource)
    .resize(size, size, { fit: 'cover', position: 'centre' })
    .png()
    .toFile(path.join(publicDir, name));
}

await sharp(faviconSource)
  .resize(32, 32, { fit: 'cover', position: 'centre' })
  .png()
  .toFile(path.join(publicDir, 'favicon.ico'));

console.log(`logo.webp from logo-original.png; favicons from ${path.basename(faviconSource)}.`);
