import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'public/images/images.json'), 'utf8'));
const blogDir = path.join(root, 'src/content/blog/en');

for (const entry of manifest.filter((row) => row.slot === 'blog-hero')) {
  const slug = entry.page.replace(/^\/blog\//, '').replace(/\/$/, '');
  const file = path.join(blogDir, `${slug}.md`);
  if (!fs.existsSync(file)) {
    console.warn('missing blog file:', slug);
    continue;
  }
  const raw = fs.readFileSync(file, 'utf8');
  const end = raw.indexOf('\n---', 3);
  const data = JSON.parse(raw.slice(3, end));
  data.image = entry.file;
  data.imageAlt = entry.alt;
  const body = raw.slice(end + 4);
  fs.writeFileSync(file, `---\n${JSON.stringify(data, null, 2)}\n---\n${body.replace(/^\n/, '')}`);
  console.log('patched', slug);
}
