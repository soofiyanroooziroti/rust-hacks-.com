import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const blogDir = path.join(root, 'src/content/blog/en');
const errors = [];

function parseFrontmatter(raw) {
  const end = raw.indexOf('\n---', 3);
  return JSON.parse(raw.slice(3, end));
}

const posts = fs
  .readdirSync(blogDir)
  .filter((f) => f.endsWith('.md'))
  .map((f) => {
    const raw = fs.readFileSync(path.join(blogDir, f), 'utf8');
    const data = parseFrontmatter(raw);
    return { file: f, ...data };
  });

const titles = new Map();
const slugs = new Set();

for (const post of posts) {
  const url = `/blog/${post.slug}/`;
  if (slugs.has(post.slug)) errors.push(`Duplicate slug: ${post.slug}`);
  slugs.add(post.slug);

  if (!post.title?.trim()) errors.push(`${post.file}: missing title`);
  if (!post.desc?.trim()) errors.push(`${post.file}: missing desc`);
  if (!post.date?.trim()) errors.push(`${post.file}: missing date`);
  if (!post.readTime?.trim()) errors.push(`${post.file}: missing readTime`);

  const titleLen = post.title?.length ?? 0;
  const descLen = post.desc?.length ?? 0;
  if (titleLen > 70) errors.push(`${url}: title ${titleLen} chars (target ≤60–70)`);
  if (descLen > 160) errors.push(`${url}: description ${descLen} chars (max 160)`);

  if (titles.has(post.title)) {
    errors.push(`Duplicate title: "${post.title}" (${titles.get(post.title)} & ${post.file})`);
  } else titles.set(post.title, post.file);
}

console.log(`Blog SEO: ${posts.length} EN posts checked.`);
if (errors.length) {
  console.error(errors.map((e) => `  - ${e}`).join('\n'));
  process.exit(1);
}
console.log('Blog SEO check passed (unique titles, meta lengths, required fields).');
