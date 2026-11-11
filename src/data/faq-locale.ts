import { defaultLocale, getTranslations, type Locale } from '../i18n';
import type { SiteFaqItem } from './faq';
import {
  CONTEXTUAL_FAQ_SECTION_COPY,
  SITE_FAQ_FILTER_TOPICS,
  SITE_FAQ_SECTION_COPY,
  getBlogFaqs as getBlogFaqsEn,
  siteFaqs,
} from './faq';

function faqsFromLocale(locale?: Locale | null): SiteFaqItem[] | undefined {
  const loc = locale ?? defaultLocale;
  const items = getTranslations(loc).faq?.items;
  if (!items || !Array.isArray(items) || items.length === 0) return undefined;
  const first = items[0] as Record<string, unknown>;
  if (typeof first.id === 'string' && typeof first.topic === 'string') {
    return items as unknown as SiteFaqItem[];
  }
  return undefined;
}

const LANDING_FAQ_IDS = [
  'status',
  'after-buy',
  'ban-risk',
  'hwid-ban-risk',
  'platforms',
  'license-move',
  'products-page',
] as const;

export function getLandingFaqs(locale?: Locale | null): SiteFaqItem[] {
  const localized = faqsFromLocale(locale);
  const pool = localized ?? siteFaqs;
  return pool.filter((f) => (LANDING_FAQ_IDS as readonly string[]).includes(f.id));
}

export function getAllFaqs(locale?: Locale | null): SiteFaqItem[] {
  const localized = faqsFromLocale(locale);
  const pool = localized ?? siteFaqs;
  return pool.filter((f) => f.topic !== 'all');
}

export function getProductFaqs(
  slug: string,
  kind: 'tier' | 'utility',
  locale?: Locale | null,
): SiteFaqItem[] {
  void kind;
  const pool = faqsFromLocale(locale) ?? siteFaqs;
  const general = pool.filter((f) => !f.scopes);
  const scoped = pool.filter((f) => f.scopes?.includes(slug));
  const combined = [...scoped, ...general];
  const seen = new Set<string>();
  return combined.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

export function getBlogFaqs(tag: string, slug: string, locale?: Locale | null): SiteFaqItem[] {
  const pool = faqsFromLocale(locale);
  if (pool) {
    const blogItems = pool.filter((f) => f.topic === 'blog');
    if (blogItems.length > 0) return blogItems;
  }
  return getBlogFaqsEn(tag, slug);
}

export function getSiteFaqSectionCopy(variant: 'full' | 'contextual', locale?: Locale | null) {
  const loc = locale ?? defaultLocale;
  const t = getTranslations(loc);
  const section = t.siteFaqSection;
  if (variant === 'full') {
    return {
      eyebrow: section?.allTopicsEyebrow ?? SITE_FAQ_SECTION_COPY.eyebrow,
      title: section?.allTopicsTitle ?? SITE_FAQ_SECTION_COPY.title,
      subtitle: section?.allTopicsSubtitle ?? SITE_FAQ_SECTION_COPY.subtitle,
    };
  }
  return {
    eyebrow: section?.contextualEyebrow ?? CONTEXTUAL_FAQ_SECTION_COPY.eyebrow,
    title: section?.contextualTitle ?? CONTEXTUAL_FAQ_SECTION_COPY.title,
    subtitle: section?.contextualSubtitle ?? CONTEXTUAL_FAQ_SECTION_COPY.subtitle,
  };
}

export { SITE_FAQ_FILTER_TOPICS, faqFilterTopicsForItems } from './faq';
