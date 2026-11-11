import { defaultLocale, isLocale, type Locale } from './locales';

export function getLocaleFromPath(pathname: string): Locale {
  const segments = pathname.split('/').filter(Boolean);
  const first = segments[0];
  if (isLocale(first)) return first;
  return defaultLocale;
}

export function stripLocaleFromPath(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length > 0 && isLocale(segments[0]!)) {
    const rest = segments.slice(1).join('/');
    return rest ? `/${rest}/` : '/';
  }
  let path = pathname || '/';
  if (!path.startsWith('/')) path = `/${path}`;
  if (path !== '/' && !path.endsWith('/')) path = `${path}/`;
  return path;
}

export function localePath(path: string, locale: Locale): string {
  if (path.startsWith('http') || path.startsWith('mailto:') || path.startsWith('/go/')) {
    return path;
  }
  const hashIndex = path.indexOf('#');
  const raw = hashIndex >= 0 ? path.slice(0, hashIndex) : path;
  const hash = hashIndex >= 0 ? path.slice(hashIndex) : '';
  let normalized = raw || '/';
  if (!normalized.startsWith('/')) normalized = `/${normalized}`;
  if (normalized !== '/' && !normalized.endsWith('/')) normalized = `${normalized}/`;

  const stripped = stripLocaleFromPath(normalized);
  if (locale === defaultLocale) {
    return stripped + hash;
  }
  if (stripped === '/') {
    return `/${locale}/${hash}`;
  }
  const localized = stripped.startsWith('/') ? `/${locale}${stripped}` : `/${locale}/${stripped}`;
  return localized + hash;
}
