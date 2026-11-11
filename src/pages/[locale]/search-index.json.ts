import { localeOnlyPaths } from '../../i18n/paths';
import type { APIRoute } from 'astro';
import type { Locale } from '../../i18n/locales';
import { buildSearchIndex, searchIndexResponse } from '../../data/search-index';

export function getStaticPaths() {
  return localeOnlyPaths();
}

export const prerender = true;

export const GET: APIRoute = ({ params }) => {
  const locale = params.locale as Locale;
  return searchIndexResponse(buildSearchIndex(locale));
};
