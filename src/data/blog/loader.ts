import { defaultLocale, isLocale, type Locale } from '../../i18n/locales';
import { applyBlogHeroFromManifest } from '../site-images';
import { blogDateToIso, blogDateToTimestamp } from './dates';
import type { BlogPostFull } from './types';

const rawModules = import.meta.glob<string>('../../content/blog/**/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
});

function parseFrontmatter(raw: string): BlogPostFull {
  if (!raw.startsWith('---')) {
    throw new Error('Blog markdown missing frontmatter');
  }
  const end = raw.indexOf('\n---', 3);
  const data = JSON.parse(raw.slice(3, end)) as BlogPostFull;
  return data;
}

function localeFromModulePath(modulePath: string): Locale | null {
  const match = modulePath.match(/content\/blog\/([^/]+)\/[^/]+\.md$/);
  const code = match?.[1];
  return isLocale(code) ? code : null;
}

function slugFromModulePath(modulePath: string): string | null {
  const match = modulePath.match(/\/([^/]+)\.md$/);
  return match?.[1] ?? null;
}

const postsByLocale = new Map<Locale, BlogPostFull[]>();
const slugLocales = new Map<string, Set<Locale>>();

for (const [modulePath, raw] of Object.entries(rawModules)) {
  const locale = localeFromModulePath(modulePath);
  const slug = slugFromModulePath(modulePath);
  if (!locale || !slug) continue;
  let post = parseFrontmatter(raw);
  post.slug = post.slug || slug;
  if (!post.dateIso && post.date) {
    post.dateIso = blogDateToIso(post.date);
  }
  post = applyBlogHeroFromManifest(post);
  const list = postsByLocale.get(locale) ?? [];
  list.push(post);
  postsByLocale.set(locale, list);
  const set = slugLocales.get(post.slug) ?? new Set<Locale>();
  set.add(locale);
  slugLocales.set(post.slug, set);
}

for (const [locale, list] of postsByLocale) {
  list.sort(
    (a, b) =>
      blogDateToTimestamp(b.dateIso ?? b.date) - blogDateToTimestamp(a.dateIso ?? a.date),
  );
  postsByLocale.set(locale, list);
}

export function getBlogLocalesForSlug(slug: string): Locale[] {
  return [...(slugLocales.get(slug) ?? new Set<Locale>([defaultLocale]))];
}

export function getBlogPostsForLocale(locale: Locale): BlogPostFull[] {
  return postsByLocale.get(locale) ?? [];
}

export function getBlogPost(locale: Locale, slug: string): BlogPostFull | undefined {
  const locPosts = postsByLocale.get(locale) ?? [];
  return locPosts.find((p) => p.slug === slug);
}

export function getAllBlogSlugs(locale: Locale = defaultLocale): string[] {
  return getBlogPostsForLocale(locale).map((p) => p.slug);
}

export function getPrefixedBlogStaticPaths(): { slug: string; locale: Locale }[] {
  const paths: { slug: string; locale: Locale }[] = [];
  for (const [slug, locs] of slugLocales) {
    for (const locale of locs) {
      if (locale !== defaultLocale) {
        paths.push({ slug, locale });
      }
    }
  }
  return paths;
}
