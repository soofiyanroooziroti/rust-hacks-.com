import type { APIRoute } from 'astro';
import { defaultLocale } from '../i18n/locales';
import { buildSearchIndex, searchIndexResponse } from '../data/search-index';

export const prerender = true;

export const GET: APIRoute = () => searchIndexResponse(buildSearchIndex(defaultLocale));
