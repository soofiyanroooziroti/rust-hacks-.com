import type { APIRoute } from 'astro';
import { buildRssFeed } from '../utils/rss';

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(buildRssFeed(), {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
