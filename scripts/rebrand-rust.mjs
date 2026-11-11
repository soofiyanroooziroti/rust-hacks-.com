import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const placeholderPath = path.join(root, 'public', 'images', 'placeholder.webp');

/** Minimal neutral 960×540 WebP (solid #2a2a2e). */
function writePlaceholderWebp() {
  const base64 =
    'UklGRiQAAABXRUJQVlA4WAoAAAAQAAAADwAABwAAQUxQSAwAAAARBxAREYiI/gcA';
  fs.mkdirSync(path.dirname(placeholderPath), { recursive: true });
  fs.writeFileSync(placeholderPath, Buffer.from(base64, 'base64'));
}

function walk(dir, files = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ent.name === 'node_modules' || ent.name === 'dist' || ent.name === '.astro') continue;
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, files);
    else if (/\.(ts|tsx|astro|mjs|json|md|css)$/.test(ent.name)) files.push(p);
  }
  return files;
}

const textReplacements = [
  ['cheatsfordeltaforce.com', 'rust-hacks.com'],
  ['https://cheatsfordeltaforce.com', 'https://rust-hacks.com'],
  ['/products/delta-force-cheats/', '/product/'],
  ['delta-force-cheats', 'rust-cheat'],
  ['hwid-spoofer', 'spoofer'],
  ['/go/delta-force', '/go/rust'],
  ['deltaForce', 'rustHack'],
  ['Delta Force Cheats', 'Rust Hacks'],
  ['Delta Force cheats', 'Rust Hacks'],
  ['Delta Force Cheat', 'Rust Hack'],
  ['Delta Force cheat', 'Rust hack'],
  ['Delta Force', 'Rust'],
  ['Anti-Cheat Expert (ACE)', 'EasyAnti-Cheat (EAC)'],
  ['Anti-Cheat Expert', 'EasyAnti-Cheat'],
  ['TITLE_PREFIX = \'Delta Force cheats\'', "TITLE_PREFIX = 'Rust Hacks'"],
  ['Delta Force — modules online', 'Rust — modules online'],
  ['Delta Force Hacks', 'Rust Hacks'],
  ['cheat loader', 'hack loader'],
  ['Cheat loader', 'Hack loader'],
  ['cheat card', 'hack card'],
  ['Cheat card', 'Hack card'],
  ['the cheat', 'the hack'],
  ['The cheat', 'The hack'],
  ['Game cheat', 'Game hack'],
  ['email address', 'portal account'],
  ['order email', 'portal order ID'],
  ['Order email', 'Portal order ID'],
  ['mailto:', ''],
];

const bannedPhrases = [
  /\bundetected\b/gi,
  /\bsafe\b/gi,
];

function patchFile(file) {
  let text = fs.readFileSync(file, 'utf8');
  let next = text;
  for (const [from, to] of textReplacements) {
    next = next.split(from).join(to);
  }
  if (file.endsWith('.json') || file.endsWith('.md') || file.includes('en.json')) {
    for (const re of bannedPhrases) {
      next = next.replace(re, (m) => (m.toLowerCase() === 'safe' ? 'stable' : 'reliable'));
    }
  }
  if (next !== text) fs.writeFileSync(file, next, 'utf8');
}

writePlaceholderWebp();
const src = path.join(root, 'src');
const publicDir = path.join(root, 'public');
for (const file of [...walk(src), ...walk(publicDir)]) {
  if (file.includes('rebrand-rust.mjs')) continue;
  patchFile(file);
}
for (const f of ['astro.config.mjs', 'public/_redirects', 'README.md'].map((p) => path.join(root, p))) {
  if (fs.existsSync(f)) patchFile(f);
}

console.log('Rebrand pass complete.');
