import type { AstroGlobal } from 'astro';
import { defaultLocale, isLocale, type Locale } from '../i18n/locales';
import { getLocaleFromPath } from '../i18n/routing';
import { getLocalizedPath } from './localized-path';
import {
  cheatPath,
  localizedPath,
  localizedRoutes,
  productPath,
  ROUTES,
  normalizeInternalPath,
  LEGACY_PATH_MAP,
  withTrailingSlash,
} from './path-core';

export { localePath, stripLocaleFromPath } from '../i18n/routing';
export {
  cheatPath,
  localizedPath,
  localizedRoutes,
  productPath,
  ROUTES,
  normalizeInternalPath,
  LEGACY_PATH_MAP,
  withTrailingSlash,
} from './path-core';
export { getLocalizedPath, blogPostPath } from './localized-path';

function getLocaleFromAstro(astro: Pick<AstroGlobal, 'currentLocale' | 'url'>): Locale {
  const fromPath = getLocaleFromPath(astro.url.pathname);
  if (fromPath !== defaultLocale) {
    return fromPath;
  }
  if (isLocale(astro.currentLocale ?? undefined)) {
    return astro.currentLocale as Locale;
  }
  return defaultLocale;
}

export function localeHref(astro: Pick<AstroGlobal, 'currentLocale' | 'url'>, href: string): string {
  return localizedPath(href, getLocaleFromAstro(astro));
}

export function localizeInternalLinksInHtml(html: string, locale: Locale): string {
  const localized = String(html).replace(/href="(\/[^"]*)"/g, (full, path: string) => {
    if (path.startsWith('/go/')) return full;
    return `href="${getLocalizedPath(path, locale)}"`;
  });
  return localized.replace(/<a\b([^>]*?)>/gi, (tag) => {
    const href = tag.match(/href="([^"]*)"/)?.[1] ?? '';
    if (!href.includes('zadeyo.com') && !href.includes('/go/')) return tag;
    if (/\brel=/.test(tag)) {
      return tag.replace(/\brel="[^"]*"/, 'rel="sponsored nofollow noopener"');
    }
    return tag.replace(/>$/, ' rel="sponsored nofollow noopener">');
  });
}
