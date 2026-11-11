import { getBlogLocalesForSlug } from '../data/blog/loader';
import { defaultLocale, type Locale } from '../i18n/locales';
import { localePath as i18nLocalePath } from '../i18n/routing';
import { normalizeInternalPath } from './internal-path';

function localizedPath(href: string, locale: Locale): string {
  return i18nLocalePath(normalizeInternalPath(href), locale);
}

/** Internal URLs: blog posts use the current locale when a translation exists, otherwise English. */
export function getLocalizedPath(href: string, locale: Locale): string {
  const normalized = normalizeInternalPath(href);
  const blogMatch = normalized.match(/^\/blog\/([^/]+)\/?$/);
  if (blogMatch) {
    const slug = blogMatch[1]!;
    const locales = getBlogLocalesForSlug(slug);
    const target = locales.includes(locale) ? locale : defaultLocale;
    return localizedPath(normalized, target);
  }
  return localizedPath(normalized, locale);
}

export function blogPostPath(slug: string, locale: Locale = defaultLocale): string {
  return getLocalizedPath(`/blog/${slug}/`, locale);
}
