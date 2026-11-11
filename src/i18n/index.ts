import type { AstroGlobal } from 'astro';
import { CHECKOUT, checkoutPath } from '../config/checkout';
import { DISCORD_INVITE_URL, PRODUCT_BASE } from '../config/site';
import enJson from './en.json';
import { deepMerge } from './merge';
import {
  defaultLocale,
  isLocale,
  localeMeta,
  locales,
  type Locale,
} from './locales';
import { getLocaleFromPath, localePath, stripLocaleFromPath } from './routing';
import type { NavLink, Translations } from './types';
import { getBlogLocalesForSlug } from '../data/blog/loader';

export { getLocaleFromPath, localePath, stripLocaleFromPath } from './routing';

export type { Translations } from './types';
export {
  defaultLocale,
  isLocale,
  localeMeta,
  locales,
  type Locale,
} from './locales';

const localeModules = import.meta.glob<{ default: Record<string, unknown> }>(
  './en.json',
  { eager: true },
);
const seoModules = import.meta.glob<{ default: Record<string, unknown> }>('./seo/*.json', {
  eager: true,
});

const enSource = enJson as unknown as Translations;

function jsonForLocale(locale: Locale): Record<string, unknown> | undefined {
  if (locale === defaultLocale) return enJson as Record<string, unknown>;
  return localeModules[`./${locale}.json`]?.default;
}

const NAV_PATHS = [
  '/',
  PRODUCT_BASE,
  `${PRODUCT_BASE}rust-cheat/#features`,
  '/blog/',
  '/forum/',
  '/faq/',
  '/support/',
] as const;

function attachNav(navRaw: NavLink[] | undefined, locale: Locale): NavLink[] {
  const labels = navRaw ?? enSource.nav;
  return labels.map((entry, i) => ({
    href: localePath(NAV_PATHS[i] ?? '/', locale),
    label: entry.label,
    ...(entry.scrollTarget ? { scrollTarget: entry.scrollTarget } : {}),
    ...(entry.ariaLabel ? { ariaLabel: entry.ariaLabel } : {}),
  }));
}

function localizeHref(href: string, locale: Locale): string {
  if (!href || href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('/go/')) {
    return href;
  }
  return localePath(href, locale);
}

function localizeTranslationHrefs(merged: Translations, locale: Locale): Translations {
  merged.footer.exploreLinks = merged.footer.exploreLinks.map((link) => ({
    ...link,
    href: localizeHref(link.href, locale),
  }));
  if (merged.footer.resourceLinks) {
    merged.footer.resourceLinks = merged.footer.resourceLinks.map((link, i) => {
      const enLink = enSource.footer.resourceLinks?.[i];
      const hrefs = ['/blog/', `${PRODUCT_BASE}rust-cheat/`, PRODUCT_BASE, '/support/'];
      return {
        ...link,
        href: localizeHref(hrefs[i] ?? '/', locale),
        label: link.label,
        ariaLabel: link.ariaLabel,
      };
    });
  }
  merged.setup.ctaPrimaryHref = localizeHref(merged.setup.ctaPrimaryHref, locale);
  merged.setup.ctaSecondaryHref = localizeHref(merged.setup.ctaSecondaryHref, locale);
  merged.workflow.ctaHref = localizeHref(merged.workflow.ctaHref, locale);
  merged.workflow.ctaSecondaryHref = localizeHref(merged.workflow.ctaSecondaryHref, locale);
  merged.cheats.items = merged.cheats.items.map((item) => ({
    ...item,
    href: localizeHref(item.href, locale),
  }));
  merged.products.items = merged.products.items.map((item) => ({
    ...item,
    href: localizeHref(item.href, locale),
  }));
  merged.support.channels = merged.support.channels.map((ch) => ({
    ...ch,
    href: localizeHref(ch.href, locale),
  }));
  return merged;
}

function applySupportChannelUrls(merged: Translations): void {
  merged.site.discord = DISCORD_INVITE_URL;
  for (const channel of merged.support.channels) {
    if (channel.icon === 'messageCircle') channel.href = '/forum/';
    else if (channel.icon === 'headphones' || channel.icon === 'clock') {
      channel.href = DISCORD_INVITE_URL;
    } else if (channel.icon === 'users') channel.href = checkoutPath('rustHack');
  }
  const items = merged.faq?.items;
  if (Array.isArray(items)) {
    for (const item of items) {
      if (item && typeof item === 'object' && 'aHtml' in item && typeof item.aHtml === 'string') {
        item.aHtml = item.aHtml.replace(
          /href="(?:https:\/\/levocheats\.com\/go\/SOOFIYAN\?to=%2Fdelta-force|\/go\/delta-force\/?)"/gi,
          `href="${CHECKOUT.rustHack}"`,
        );
      }
    }
  }
}

function hydrate(locale: Locale, localeRaw?: Record<string, unknown>): Translations {
  const base = structuredClone(enSource) as Translations;
  let merged = deepMerge(base, localeRaw ?? {}) as Translations;
  merged.nav = attachNav(merged.nav as NavLink[], locale);
  applySupportChannelUrls(merged);
  return localizeTranslationHrefs(merged, locale);
}

const translationCache = new Map<Locale, Translations>();

export function getTranslations(localeInput?: string | null): Translations {
  const locale: Locale = isLocale(localeInput ?? '') ? (localeInput as Locale) : defaultLocale;
  if (translationCache.has(locale)) {
    return translationCache.get(locale)!;
  }
  const t = hydrate(locale, jsonForLocale(locale));
  translationCache.set(locale, t);
  return t;
}

function getByDotPath(obj: Record<string, unknown>, key: string): unknown {
  return key.split('.').reduce<unknown>((acc, part) => {
    if (acc == null || typeof acc !== 'object') return undefined;
    return (acc as Record<string, unknown>)[part];
  }, obj);
}

/** Dot-path lookup with English fallback for missing translated keys. */
export function t(key: string, localeInput?: string | null): string {
  const locale: Locale = isLocale(localeInput ?? '') ? (localeInput as Locale) : defaultLocale;
  const locRaw = jsonForLocale(locale) ?? {};
  const enRaw = enJson as Record<string, unknown>;
  const value = getByDotPath(locRaw, key) ?? getByDotPath(enRaw, key);
  return typeof value === 'string' ? value : '';
}

export function getLocaleFromAstro(astro: Pick<AstroGlobal, 'currentLocale' | 'url'>): Locale {
  const fromPath = getLocaleFromPath(astro.url.pathname);
  if (fromPath !== defaultLocale) {
    return fromPath;
  }
  if (isLocale(astro.currentLocale ?? undefined)) {
    return astro.currentLocale as Locale;
  }
  return defaultLocale;
}

export interface AlternateLanguage {
  locale: Locale;
  hreflang: string;
  href: string;
}

function localeHasPath(basePath: string, locale: Locale): boolean {
  const blogMatch = basePath.match(/^\/blog\/([^/]+)\/?$/);
  if (blogMatch) {
    const slug = blogMatch[1]!;
    return getBlogLocalesForSlug(slug).includes(locale);
  }
  if (basePath.match(/^\/forum\/([^/]+)\/?$/)) {
    return locale === defaultLocale;
  }
  return true;
}

export function getAlternateLanguages(
  pathname: string,
  siteOrigin: string,
  options?: { blogSlug?: string; blogLocales?: Locale[] },
): AlternateLanguage[] {
  const basePath = stripLocaleFromPath(pathname);
  let candidateLocales = [...locales];

  if (options?.blogSlug && options.blogLocales) {
    const allowed = new Set(options.blogLocales);
    candidateLocales = candidateLocales.filter((l) => allowed.has(l));
  } else {
    candidateLocales = candidateLocales.filter((locale) => localeHasPath(basePath, locale));
  }

  return candidateLocales.map((locale) => ({
    locale,
    hreflang: localeMeta[locale].hreflang,
    href: `${siteOrigin.replace(/\/$/, '')}${localePath(basePath, locale)}`,
  }));
}

export function avatarSrc(style: string, seed: string) {
  return `https://api.dicebear.com/9.x/${style}/png?seed=${seed}&size=28&backgroundColor=0a0d10,7f3dee,181f26,e9a82f,11161b`;
}

export interface PageSeoEntry {
  title: string;
  description: string;
}

export function getSeoBundle(locale: Locale): Record<string, unknown> {
  return seoModules[`./seo/${locale}.json`]?.default ?? seoModules['./seo/en.json']?.default ?? {};
}

export function getPageSeoForLocale(pathname: string, locale?: Locale | null): PageSeoEntry {
  const loc: Locale = isLocale(locale ?? '') ? locale! : defaultLocale;
  const basePath = stripLocaleFromPath(pathname);
  const bundle = getSeoBundle(loc);
  const pages = (bundle.pages ?? {}) as Record<string, PageSeoEntry>;
  const siteSeo = bundle.site as PageSeoEntry | undefined;
  const entry = pages[basePath];
  if (entry) return entry;
  const tr = getTranslations(loc);
  return { title: siteSeo?.title ?? tr.site.title, description: siteSeo?.description ?? tr.site.description };
}
