import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

const { forumPosts, forumCategories } = await import('../src/data/forum.ts?v=export');

const posts = {};
for (const p of forumPosts) {
  posts[p.slug] = {
    title: p.title,
    excerpt: p.excerpt,
    body: p.body,
    flair: p.flair,
    comments: p.comments.map((c) => ({
      author: c.author,
      body: c.body,
      replies: c.replies?.map((r) => ({ author: r.author, body: r.body })) ?? [],
    })),
  };
}

const out = {
  categories: Object.fromEntries(forumCategories.map((c) => [c.name, c.name])),
  posts,
};

const dir = path.join(root, 'src/i18n/forum');
fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(path.join(dir, 'en.json'), `${JSON.stringify(out, null, 2)}\n`);
console.log('Wrote src/i18n/forum/en.json with', Object.keys(posts).length, 'posts');
