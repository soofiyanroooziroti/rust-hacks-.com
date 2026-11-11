import { PRODUCT_BASE } from '../config/site';
import { defaultLocale, type Locale } from '../i18n/locales';
import { localePath as i18nLocalePath } from '../i18n/routing';
import { normalizeInternalPath } from './internal-path';

export const ROUTES = {
  home: '/',
  blog: '/blog/',
  forum: '/forum/',
  products: PRODUCT_BASE,
  productsElite: `${PRODUCT_BASE}rust-cheat/`,
  productsUtilities: `${PRODUCT_BASE}utilities/`,
  faq: '/faq/',
  terms: '/terms/',
  about: '/about/',
  support: '/support/',
  privacy: '/privacy/',
  status: '/status/',
} as const;

export function localizedPath(href: string, locale: Locale): string {
  return i18nLocalePath(normalizeInternalPath(href), locale);
}

export function productPath(slug: string, locale: Locale = defaultLocale): string {
  return localizedPath(`${PRODUCT_BASE}${slug}/`, locale);
}

export function cheatPath(slug: string, locale: Locale = defaultLocale): string {
  return productPath(slug, locale);
}

export function localizedRoutes(locale: Locale = defaultLocale) {
  return {
    home: localizedPath('/', locale),
    blog: localizedPath('/blog/', locale),
    forum: localizedPath('/forum/', locale),
    products: localizedPath(PRODUCT_BASE, locale),
    productsElite: localizedPath(`${PRODUCT_BASE}rust-cheat/`, locale),
    productsUtilities: localizedPath(`${PRODUCT_BASE}utilities/`, locale),
    faq: localizedPath('/faq/', locale),
    terms: localizedPath('/terms/', locale),
    about: localizedPath('/about/', locale),
    support: localizedPath('/support/', locale),
    privacy: localizedPath('/privacy/', locale),
    status: localizedPath('/status/', locale),
  } as const;
}

export { normalizeInternalPath, LEGACY_PATH_MAP, withTrailingSlash } from './internal-path';
