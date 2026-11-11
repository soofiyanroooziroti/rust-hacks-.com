import type { SitemapItem } from '@astrojs/sitemap';
import { getBlogPostsForLocale } from '../data/blog/loader';
import { forumPosts } from '../data/forum';
import { blogDateToIso } from '../data/blog/dates';
import { defaultLocale } from '../i18n/locales';
import { SITE_URL } from './site';

const blogPosts = getBlogPostsForLocale(defaultLocale);

const blogLastmod = new Map(
  blogPosts.map((post) => [`/blog/${post.slug}/`, blogDateToIso(post.date)] as const),
);

const forumLastmod = new Map(
  forumPosts.map((post) => [`/forum/${post.slug}/`, blogDateToIso(post.date)] as const),
);

function pathnameFromUrl(url: string): string {
  const path = new URL(url).pathname;
  return path.endsWith('/') ? path : `${path}/`;
}

function contentLastmod(path: string): string | undefined {
  const blogMatch = path.match(/^(?:\/[a-z]{2}(?:-[a-z]{2})?)?(\/blog\/[^/]+\/)$/);
  if (blogMatch) return blogLastmod.get(blogMatch[1]);
  return forumLastmod.get(path);
}

export function sitemapSerialize(item: SitemapItem): SitemapItem | undefined {
  const path = pathnameFromUrl(item.url);
  item.url = `${SITE_URL}${path}`;

  if (
    path.includes('/404') ||
    path.startsWith('/go/') ||
    path.startsWith('/cheats/') ||
    path.startsWith('/contact') ||
    path.includes('/rss.xml')
  ) {
    return undefined;
  }

  const dated = contentLastmod(path);
  if (dated) item.lastmod = dated;
  else delete item.lastmod;

  if (path === '/') {
    item.priority = 1;
    item.changefreq = 'weekly';
    return item;
  }

  if (path === '/blog/') {
    item.priority = 0.9;
    item.changefreq = 'weekly';
    return item;
  }

  if (path === '/forum/') {
    item.priority = 0.8;
    item.changefreq = 'daily';
    return item;
  }

  if (path.startsWith('/forum/')) {
    item.priority = 0.6;
    item.changefreq = 'weekly';
    return item;
  }

  if (path.startsWith('/blog/')) {
    item.priority = 0.7;
    item.changefreq = 'monthly';
    const blogDated = contentLastmod(path);
    if (blogDated) item.lastmod = blogDated;
    else delete item.lastmod;
    return item;
  }

  if (path.startsWith('/products/')) {
    item.priority = 0.8;
    item.changefreq = 'weekly';
    return item;
  }

  if (
    path === '/about/' ||
    path === '/support/' ||
    path === '/privacy/' ||
    path === '/terms/' ||
    path === '/faq/' ||
    path.startsWith('/status/')
  ) {
    if (path.startsWith('/status/')) {
      return undefined;
    }
    item.priority = 0.5;
    item.changefreq = 'yearly';
    return item;
  }

  item.priority = 0.6;
  item.changefreq = 'monthly';
  return item;
}
