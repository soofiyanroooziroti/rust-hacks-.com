import { defaultLocale, isLocale, localeMeta } from '../../i18n/locales';

const MONTH_BY_TOKEN = new Map<string, number>([
  ['jan', 0],
  ['january', 0],
  ['feb', 1],
  ['february', 1],
  ['mar', 2],
  ['march', 2],
  ['apr', 3],
  ['april', 3],
  ['may', 4],
  ['jun', 5],
  ['june', 5],
  ['jul', 6],
  ['july', 6],
  ['aug', 7],
  ['august', 7],
  ['sep', 8],
  ['sept', 8],
  ['september', 8],
  ['oct', 9],
  ['october', 9],
  ['okt', 9],
  ['nov', 10],
  ['november', 10],
  ['dec', 11],
  ['december', 11],
]);

function monthIndex(token: string): number {
  const key = token.replace(/\./g, '').trim().toLowerCase();
  const direct = MONTH_BY_TOKEN.get(key);
  if (direct != null) return direct;
  const short = key.slice(0, 3);
  return MONTH_BY_TOKEN.get(short) ?? -1;
}

function utcFromParts(year: number, month: number, day: number): number {
  if (month < 0 || month > 11 || day < 1 || day > 31) return 0;
  return Date.UTC(year, month, day);
}

function parseCalendarDate(raw: string): number {
  const iso = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return utcFromParts(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]));

  const mdy = raw.match(/^([A-Za-z\u00C0-\u024f.]+)\s+(\d{1,2}),?\s+(\d{4})$/);
  if (mdy) {
    const month = monthIndex(mdy[1]);
    if (month >= 0) return utcFromParts(Number(mdy[3]), month, Number(mdy[2]));
  }

  const dmy = raw.match(/^(\d{1,2})\s+([A-Za-z\u00C0-\u024f.]+),?\s+(\d{4})$/);
  if (dmy) {
    const month = monthIndex(dmy[2]);
    if (month >= 0) return utcFromParts(Number(dmy[3]), month, Number(dmy[1]));
  }

  const normalized = raw.replace(/\./g, ' ').replace(/\s+/g, ' ').trim();
  const ymd = normalized.match(/^(\d{4})\s+([A-Za-z\u00C0-\u024f]+)\s+(\d{1,2})$/);
  if (ymd) {
    const month = monthIndex(ymd[2]);
    if (month >= 0) return utcFromParts(Number(ymd[1]), month, Number(ymd[3]));
  }

  const t = Date.parse(raw);
  if (!Number.isNaN(t)) {
    const d = new Date(t);
    return Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
  }

  return 0;
}

export function blogDateToTimestamp(date: string): number {
  const raw = String(date ?? '').trim();
  if (!raw) return 0;
  return parseCalendarDate(raw);
}

export function blogDateToIso(date: string): string {
  const raw = String(date ?? '').trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) return raw.slice(0, 10);
  const ms = blogDateToTimestamp(raw);
  if (!ms) return new Date().toISOString().slice(0, 10);
  const d = new Date(ms);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function formatBlogDateForLocale(date: string, localeInput: string): string {
  const ms = blogDateToTimestamp(date);
  if (!ms) return date;
  const locale = isLocale(localeInput) ? localeInput : defaultLocale;
  const tag = localeMeta[locale].htmlLang;
  try {
    return new Intl.DateTimeFormat(tag, { year: 'numeric', month: 'short', day: 'numeric' }).format(
      new Date(ms),
    );
  } catch {
    return new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short', day: 'numeric' }).format(
      new Date(ms),
    );
  }
}
