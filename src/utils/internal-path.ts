import { PRODUCT_BASE } from '../config/site';

export function withTrailingSlash(path: string): string {
  if (!path || path.startsWith('http') || path.startsWith('#') || path.startsWith('mailto:')) {
    return path;
  }
  const [pathname, hash = ''] = path.split('#');
  const normalized = pathname === '/' || pathname.endsWith('/') ? pathname : `${pathname}/`;
  return hash ? `${normalized}#${hash}` : normalized;
}

export const LEGACY_PATH_MAP: Record<string, string> = {
  '/cheats': PRODUCT_BASE,
  '/cheats/': PRODUCT_BASE,
  '/cheats/elite': `${PRODUCT_BASE}rust-cheat/`,
  '/cheats/elite/': `${PRODUCT_BASE}rust-cheat/`,
  '/products/delta-force-cheats': PRODUCT_BASE,
  '/products/delta-force-cheats/': PRODUCT_BASE,
  '/products/delta-force-cheats/delta-force-cheats': `${PRODUCT_BASE}rust-cheat/`,
  '/products/delta-force-cheats/delta-force-cheats/': `${PRODUCT_BASE}rust-cheat/`,
  '/products/delta-force-cheats/hwid-spoofer': `${PRODUCT_BASE}spoofer/`,
  '/products/delta-force-cheats/hwid-spoofer/': `${PRODUCT_BASE}spoofer/`,
  '/products/delta-force-cheats/ugc': `${PRODUCT_BASE}ugc/`,
  '/products/delta-force-cheats/ugc/': `${PRODUCT_BASE}ugc/`,
  '/contact': '/support/',
  '/contact/': '/support/',
};

export function normalizeInternalPath(href: string): string {
  if (!href || href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('/go/')) {
    return href;
  }

  const hashIndex = href.indexOf('#');
  const rawPath = hashIndex >= 0 ? href.slice(0, hashIndex) : href;
  const hash = hashIndex >= 0 ? href.slice(hashIndex) : '';

  let pathname = rawPath.startsWith('/') ? rawPath : `/${rawPath}`;
  pathname = LEGACY_PATH_MAP[pathname] ?? pathname;

  return withTrailingSlash(pathname) + hash;
}
