import { defaultLocale, localeConfig, type LocaleConfigEntry } from './config';

export { defaultLocale } from './config';

export const locales = localeConfig.map((entry) => entry.code) as readonly ['en'];

export type Locale = (typeof locales)[number];

export const nonDefaultLocales = locales.filter((l) => l !== defaultLocale) as Exclude<
  Locale,
  typeof defaultLocale
>[];

export interface LocaleMeta {
  code: Locale;
  urlPrefix: string;
  nativeName: string;
  shortLabel: string;
  hreflang: string;
  htmlLang: string;
  dir: 'ltr' | 'rtl';
  ogLocale: string;
}

const byCode = new Map(localeConfig.map((entry) => [entry.code, entry]));

export const localeMeta: Record<Locale, LocaleMeta> = Object.fromEntries(
  locales.map((code) => {
    const entry = byCode.get(code)! as LocaleConfigEntry;
    return [
      code,
      {
        code: code as Locale,
        urlPrefix: entry.urlPrefix,
        nativeName: entry.nativeName,
        shortLabel: entry.shortLabel,
        hreflang: entry.hreflang,
        htmlLang: entry.htmlLang,
        dir: entry.dir,
        ogLocale: entry.ogLocale,
      },
    ];
  }),
) as Record<Locale, LocaleMeta>;

export function isLocale(value: string | undefined): value is Locale {
  return value != null && (locales as readonly string[]).includes(value);
}

export function localeDir(locale: Locale): 'ltr' | 'rtl' {
  return localeMeta[locale].dir;
}
