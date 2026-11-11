export type { BlogBlock, BlogPostFull } from './blog/types';
export { getBlogLocalesForSlug, getBlogPostsForLocale, getPrefixedBlogStaticPaths } from './blog/loader';

import { defaultLocale, type Locale } from '../i18n/locales';
import {
  getAllBlogSlugs as slugsForLocale,
  getBlogPost as postForLocale,
  getBlogPostsForLocale,
} from './blog/loader';
import { blogDateToIso, blogDateToTimestamp } from './blog/dates';
import type { BlogPost } from '../i18n/types';

export function getBlogPost(slug: string, locale: Locale = defaultLocale) {
  return postForLocale(locale, slug);
}

export function getAllBlogSlugs(locale: Locale = defaultLocale) {
  return slugsForLocale(locale);
}

export function getFeaturedBlogPost(locale: Locale = defaultLocale) {
  const blogPosts = getBlogPostsForLocale(locale);
  if (blogPosts.length === 0) return undefined;
  return blogPosts.find((p) => p.featured) ?? blogPosts[0];
}

export function getNonFeaturedBlogPosts(locale: Locale = defaultLocale) {
  const blogPosts = getBlogPostsForLocale(locale);
  const featured = getFeaturedBlogPost(locale);
  return blogPosts.filter((p) => p.slug !== featured?.slug);
}

export function getFeaturedBlogPosts(limit = 3, locale: Locale = defaultLocale) {
  const blogPosts = getBlogPostsForLocale(locale);
  if (blogPosts.length === 0) return [];
  const featured = getFeaturedBlogPost(locale);
  const rest = blogPosts.filter((p) => p.slug !== featured?.slug);
  return featured ? [featured, ...rest].slice(0, limit) : blogPosts.slice(0, limit);
}

export function getRelatedBlogPosts(slug: string, limit = 3, locale: Locale = defaultLocale) {
  const blogPosts = getBlogPostsForLocale(locale);
  const current = postForLocale(locale, slug);
  if (!current) return [];

  const preferred = (current.relatedSlugs ?? [])
    .map((relatedSlug) => blogPosts.find((p) => p.slug === relatedSlug))
    .filter((post): post is NonNullable<typeof post> => post != null);
  const used = new Set([slug, ...preferred.map((p) => p.slug)]);
  const sameTag = blogPosts.filter((p) => !used.has(p.slug) && p.tag === current.tag);
  const others = blogPosts.filter((p) => !used.has(p.slug) && p.tag !== current.tag);
  return [...preferred, ...sameTag, ...others].slice(0, limit);
}

export function getBlogPostsBySlugs(slugs: string[], locale: Locale = defaultLocale) {
  const blogPosts = getBlogPostsForLocale(locale);
  return slugs
    .map((slug) => blogPosts.find((p) => p.slug === slug))
    .filter((post): post is NonNullable<typeof post> => post != null);
}

export function getRelatedBlogPostsForProduct(relatedSlugs: string[], limit = 6, locale: Locale = defaultLocale) {
  const blogPosts = getBlogPostsForLocale(locale);
  const curated = getBlogPostsBySlugs(relatedSlugs, locale);
  if (curated.length >= limit) return curated.slice(0, limit);

  const used = new Set(curated.map((p) => p.slug));
  const fill = blogPosts.filter((p) => !used.has(p.slug));
  return [...curated, ...fill].slice(0, limit);
}

export function getBlogTags(locale: Locale = defaultLocale) {
  const blogPosts = getBlogPostsForLocale(locale);
  return [...new Set(blogPosts.map((p) => p.tag))].sort((a, b) => a.localeCompare(b));
}

export function getBlogReadMinutes(readTime: string) {
  const match = readTime.match(/(\d+)/);
  return match ? Number(match[1]) : 0;
}

export function getBlogPostTimestamp(date: string) {
  return blogDateToTimestamp(date);
}

/** Full ISO instant for RSS, OG article, and JSON-LD (noon UTC on calendar day). */
export function getBlogPublicationIso(post: Pick<BlogPost, 'dateIso' | 'date'>): string {
  const day = post.dateIso?.trim() || blogDateToIso(post.date);
  if (!day) return new Date().toISOString();
  return `${day}T12:00:00.000Z`;
}

export function formatBlogReadTime(readTime: string, _locale: Locale, minReadLabel = 'min read'): string {
  const minutes = getBlogReadMinutes(readTime);
  if (!minutes) return readTime;
  return `${minutes} ${minReadLabel}`;
}

export { formatBlogDateForLocale } from './blog/dates';

/** English posts (default locale). */
export const blogPosts = getBlogPostsForLocale(defaultLocale);

/** @deprecated Use getBlogPostsForLocale */
export { getBlogPostsForLocale as blogPostsFromLocale };
