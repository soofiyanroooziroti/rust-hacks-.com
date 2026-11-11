import type { BlogBlock } from './blog/types';
import { getBlogPostsForLocale } from './blog/loader';
import { defaultLocale } from '../i18n/locales';
import { siteFaqs } from './faq';
import { getForumPostsForLocale } from './forum-i18n';
import { getProductPages } from './products';
import { STATUS_RECENT_UPDATES } from './status';
import { getTranslations, localePath } from '../i18n';
import type { Locale } from '../i18n/locales';
import type { Translations } from '../i18n/types';
import { resolvePageSeo } from '../config/seo';
import { ROUTES, getLocalizedPath, productPath } from '../utils/path';

export type SearchEntryType =
  | 'Page'
  | 'Product'
  | 'Features'
  | 'Plans'
  | 'Blog'
  | 'FAQ'
  | 'Forum'
  | 'Support'
  | 'Status';

export interface SearchIndexEntry {
  title: string;
  description: string;
  url: string;
  type: SearchEntryType;
  text: string;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function blogBlocksToText(blocks: BlogBlock[]): string {
  const parts: string[] = [];
  for (const block of blocks) {
    if (block.type === 'ul') parts.push(...block.items);
    else if (block.type === 'table') {
      parts.push(...block.headers, ...block.rows.flat());
    } else if (block.type === 'cta') {
      parts.push(block.title, block.text);
    } else {
      parts.push(block.text);
    }
  }
  return parts.join(' ');
}

function homepageSearchText(t: Translations): string {
  const parts: string[] = [
    t.site.description,
    t.hero.subtitle,
    t.features.title,
    t.features.subtitle,
    t.products.title,
    t.products.subtitle,
    ...t.nav.map((link) => link.label),
  ];

  for (const item of t.features.items) {
    parts.push(item.title, item.subtitle, item.desc, ...item.tags, ...(item.bullets ?? []));
  }

  for (const card of t.products.items) {
    parts.push(card.badge, card.category, card.title, card.subtitle, card.desc, ...card.features);
  }

  return parts.filter(Boolean).join(' ');
}

export function buildSearchIndex(locale: Locale = defaultLocale): SearchIndexEntry[] {
  const t = getTranslations(locale);
  const blogPosts = getBlogPostsForLocale(locale);
  const productPages = getProductPages(locale);
  const entries: SearchIndexEntry[] = [];
  const featuresUrl = `${productPath('rust-cheat', locale)}#features`;

  entries.push({
    title: t.site.title,
    description: t.site.description,
    url: localePath('/', locale),
    type: 'Page',
    text: homepageSearchText(t),
  });

  const productsHubSeo = resolvePageSeo(ROUTES.products, locale);
  entries.push({
    title: productsHubSeo.title,
    description: productsHubSeo.description,
    url: localePath(ROUTES.products, locale),
    type: 'Product',
    text: [productsHubSeo.title, productsHubSeo.description, t.products.subtitle, '$35 monthly', '$150 lifetime']
      .filter(Boolean)
      .join(' '),
  });

  for (const product of productPages) {
    const url = productPath(product.slug, locale);
    const seo = resolvePageSeo(url, locale);
    entries.push({
      title: product.title,
      description: seo.description || product.subtitle || product.desc,
      url,
      type: 'Product',
      text: [
        product.desc,
        product.subtitle,
        ...product.features,
        ...product.fullFeatures,
        product.overview?.title,
        ...(product.overview?.paragraphs ?? []),
        '$35',
        '$150',
      ]
        .filter(Boolean)
        .join(' '),
    });

    if (product.featureGroups?.length) {
      for (const group of product.featureGroups) {
        for (const item of group.items) {
          entries.push({
            title: item.name,
            description: group.name,
            url: featuresUrl,
            type: 'Features',
            text: [group.name, item.name, item.desc ?? ''].filter(Boolean).join(' '),
          });
        }
      }
      entries.push({
        title: 'Rust hack features',
        description: 'Aimbot, player ESP, loot filters, weapon options, and misc modules on the hack product page.',
        url: featuresUrl,
        type: 'Features',
        text: product.fullFeatures.join(' '),
      });
    }
  }

  const plansUrl = localePath(ROUTES.products, locale);
  const productsSeo = resolvePageSeo(ROUTES.products, locale);
  entries.push({
    title: 'Plans — $35 monthly & $150 lifetime',
    description: 'Compare one-month and lifetime checkout for Rust Hacks ($35), HWID spoofer ($50), and UGC recovery ($35).',
    url: plansUrl,
    type: 'Plans',
    text: [
      productsSeo.title,
      productsSeo.description,
      '$35 monthly',
      '$50 monthly',
      '$150 lifetime',
      '$35',
      '$50',
      '$150',
    ]
      .filter(Boolean)
      .join(' '),
  });

  const statusSeo = resolvePageSeo(ROUTES.status, locale);
  entries.push({
    title: statusSeo.title,
    description: statusSeo.description,
    url: localePath(ROUTES.status, locale),
    type: 'Status',
    text: [
      statusSeo.title,
      statusSeo.description,
      ...STATUS_RECENT_UPDATES.flatMap((entry) => [entry.title, entry.summary, entry.when]),
    ].join(' '),
  });

  const faqSeo = resolvePageSeo(ROUTES.faq, locale);
  entries.push({
    title: t.faq.title,
    description: t.faq.subtitle,
    url: localePath(ROUTES.faq, locale),
    type: 'FAQ',
    text: [t.faq.title, t.faq.subtitle, faqSeo.description].filter(Boolean).join(' '),
  });

  for (const faq of siteFaqs) {
    const answer = stripHtml(faq.aHtml ?? faq.a);
    entries.push({
      title: faq.q,
      description: answer.slice(0, 160),
      url: localePath(ROUTES.faq, locale),
      type: 'FAQ',
      text: `${faq.q} ${answer}`,
    });
  }

  const supportSeo = resolvePageSeo(ROUTES.support, locale);
  entries.push({
    title: t.legalPages.support.title,
    description: t.legalPages.support.description,
    url: localePath(ROUTES.support, locale),
    type: 'Support',
    text: [
      t.legalPages.support.title,
      t.legalPages.support.description,
      t.support.subtitle,
      ...t.support.channels.map((c) => `${c.title} ${c.desc}`),
    ].join(' '),
  });

  if (blogPosts.length > 0) {
    entries.push({
      title: t.blog.title,
      description: t.blog.subtitle,
      url: localePath(ROUTES.blog, locale),
      type: 'Blog',
      text: [t.blog.title, t.blog.subtitle, t.blog.latestSubtitle].filter(Boolean).join(' '),
    });
  }

  for (const post of blogPosts) {
    entries.push({
      title: post.title,
      description: post.desc,
      url: getLocalizedPath(`/blog/${post.slug}/`, locale),
      type: 'Blog',
      text: [post.title, post.desc, post.tag, blogBlocksToText(post.body)].filter(Boolean).join(' '),
    });
  }

  const forumSeo = resolvePageSeo(ROUTES.forum, locale);
  const localizedForumPosts = getForumPostsForLocale(locale);
  if (localizedForumPosts.length > 0) {
    entries.push({
      title: forumSeo.title,
      description: forumSeo.description,
      url: localePath(ROUTES.forum, locale),
      type: 'Forum',
      text: [forumSeo.title, forumSeo.description].filter(Boolean).join(' '),
    });
    for (const post of localizedForumPosts) {
      entries.push({
        title: post.title,
        description: post.excerpt,
        url: localePath(`/forum/${post.slug}/`, locale),
        type: 'Forum',
        text: [post.title, post.excerpt, post.category, ...post.body, post.sourceTitle ?? ''].filter(Boolean).join(' '),
      });
    }
  }

  return entries;
}

export function searchIndexResponse(entries: SearchIndexEntry[]): Response {
  return new Response(JSON.stringify(entries), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
