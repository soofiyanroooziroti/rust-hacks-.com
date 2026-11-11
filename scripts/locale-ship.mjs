/**
 * Keep in sync with src/i18n/config.ts
 */
export const defaultLocale = 'en';

export const shipLocales = ['en'];

export const nonDefaultShipLocales = shipLocales.filter((l) => l !== defaultLocale);

/** @type {Record<string, string>} */
export const langName = {
  fr: 'French',
  tr: 'Turkish',
  'pt-br': 'Brazilian Portuguese',
  es: 'Spanish',
  de: 'German',
  pl: 'Polish',
  th: 'Thai',
};

export function localeFromPathname(pathname) {
  const seg = pathname.split('/').filter(Boolean)[0]?.toLowerCase();
  if (seg && nonDefaultShipLocales.includes(seg)) return seg;
  return defaultLocale;
}
