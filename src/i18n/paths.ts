import { nonDefaultLocales, type Locale } from './locales';

/** Static paths for pages under src/pages/[locale]/* (non-English only). */
export function localeOnlyPaths() {
  return nonDefaultLocales.map((locale) => ({ params: { locale } }));
}

/** Cross-product of slug paths and locales for [locale]/.../[slug] routes. */
export function localeSlugPaths(slugs: string[], localesFilter?: Locale[]) {
  const list = localesFilter ?? nonDefaultLocales;
  return slugs.flatMap((slug) => list.map((locale) => ({ params: { slug, locale } })));
}
