import type { FaqItem } from '../i18n/types';
import type { ForumComment } from '../data/forum';
import { getTranslations, defaultLocale } from '../i18n';
const t = getTranslations(defaultLocale);
import { SUPPORT_EMAIL } from '../config/site';
import { SITE_ORIGIN, absoluteAssetUrl, canonicalUrl, getOrganizationSameAs } from '../config/seo';
import { socialShareImage } from './responsiveImage';
import { PAGE_SEO } from '../config/pageSeo';
import { getProductPlans, type ProductPlanId } from '../data/productPricing';

export interface BreadcrumbItem {
  name: string;
  path: string;
}

export function breadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: canonicalUrl(item.path),
    })),
  };
}

export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: t.site.name,
    url: `${SITE_ORIGIN}/`,
    inLanguage: 'en-US',
    description: PAGE_SEO['/'].description,
  };
}

export function organizationSchema() {
  const sameAs = getOrganizationSameAs();
  const contactPoint = {
    '@type': 'ContactPoint',
    contactType: 'customer support',
    url: canonicalUrl('/support/'),
    availableLanguage: ['English'],
    areaServed: 'Worldwide',
    ...(SUPPORT_EMAIL ? { email: SUPPORT_EMAIL } : {}),
  };

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: t.site.name,
    url: `${SITE_ORIGIN}/`,
    logo: `${SITE_ORIGIN}/logo.webp`,
    hasMerchantReturnPolicy: merchantReturnPolicySchema(),
    ...(SUPPORT_EMAIL ? { email: SUPPORT_EMAIL } : {}),
    ...(sameAs.length > 0 ? { sameAs } : {}),
    contactPoint: [contactPoint],
  };
}

export function collectionPageSchema(input: { name: string; description: string; url: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: input.name,
    description: input.description,
    url: canonicalUrl(input.url),
    inLanguage: 'en-US',
    isPartOf: {
      '@type': 'WebSite',
      name: t.site.name,
      url: `${SITE_ORIGIN}/`,
    },
  };
}

export function webPageSchema(input: { name: string; description: string; url: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: input.name,
    description: input.description,
    url: canonicalUrl(input.url),
    inLanguage: 'en-US',
    isPartOf: {
      '@type': 'WebSite',
      name: t.site.name,
      url: `${SITE_ORIGIN}/`,
    },
  };
}

export function faqPageSchema(items: FaqItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  };
}

export function itemListSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      url: canonicalUrl(item.url),
    })),
  };
}

export function forumAuthorProfileUrl(author: string): string {
  const handle = encodeURIComponent(author.trim());
  return `${canonicalUrl('/forum/')}#u/${handle}`;
}

function forumPersonSchema(author: string) {
  return {
    '@type': 'Person' as const,
    name: author,
    url: forumAuthorProfileUrl(author),
  };
}

function forumDisplayDateToIso(displayDate: string): string {
  const parsed = new Date(displayDate);
  if (Number.isNaN(parsed.getTime())) return new Date().toISOString();
  return new Date(Date.UTC(parsed.getFullYear(), parsed.getMonth(), parsed.getDate(), 12, 0, 0)).toISOString();
}

function forumAgeToIso(baseIso: string, age: string): string {
  const base = new Date(baseIso);
  const match = age.trim().match(/^(\d+)\s*(m|h|d)\s+ago$/i);
  if (!match || Number.isNaN(base.getTime())) return baseIso;
  const amount = Number.parseInt(match[1], 10);
  const unit = match[2].toLowerCase();
  const when = new Date(base);
  if (unit === 'm') when.setUTCMinutes(when.getUTCMinutes() - amount);
  else if (unit === 'h') when.setUTCHours(when.getUTCHours() - amount);
  else when.setUTCDate(when.getUTCDate() - amount);
  return when.toISOString();
}

type ForumSchemaComment = {
  '@type': 'Comment';
  text: string;
  author: ReturnType<typeof forumPersonSchema>;
  datePublished: string;
  comment?: ForumSchemaComment[];
  interactionStatistic?: {
    '@type': 'InteractionCounter';
    interactionType: string;
    userInteractionCount: number;
  };
};

function forumCommentSchema(comment: ForumComment, postPublishedIso: string): ForumSchemaComment {
  const node: ForumSchemaComment = {
    '@type': 'Comment',
    text: comment.body,
    author: forumPersonSchema(comment.author),
    datePublished: forumAgeToIso(postPublishedIso, comment.age),
  };
  if (comment.replies?.length) {
    node.comment = comment.replies.map((reply) => forumCommentSchema(reply, postPublishedIso));
  }
  if (comment.score > 0) {
    node.interactionStatistic = {
      '@type': 'InteractionCounter',
      interactionType: 'https://schema.org/LikeAction',
      userInteractionCount: comment.score,
    };
  }
  return node;
}

export function discussionForumPostingSchema(input: {
  name: string;
  text: string;
  url: string;
  author: string;
  date: string;
  comments: ForumComment[];
  commentCount: number;
  upvotes?: number;
}) {
  const datePublished = forumDisplayDateToIso(input.date);
  const pageUrl = canonicalUrl(input.url);

  return {
    '@context': 'https://schema.org',
    '@type': 'DiscussionForumPosting',
    headline: input.name,
    text: input.text,
    url: pageUrl,
    mainEntityOfPage: pageUrl,
    datePublished,
    author: forumPersonSchema(input.author),
    commentCount: input.commentCount,
    ...(input.comments.length
      ? { comment: input.comments.map((comment) => forumCommentSchema(comment, datePublished)) }
      : {}),
    ...(input.upvotes != null && input.upvotes > 0
      ? {
          interactionStatistic: {
            '@type': 'InteractionCounter',
            interactionType: 'https://schema.org/LikeAction',
            userInteractionCount: input.upvotes,
          },
        }
      : {}),
    isPartOf: { '@type': 'CollectionPage', name: 'Community Discussions', url: canonicalUrl('/forum/') },
  };
}

function offerUrl(path: string): string {
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return canonicalUrl(path);
}

const MERCHANT_COUNTRIES = [
  'US', 'GB', 'CA', 'AU', 'DE', 'FR', 'ES', 'IT', 'NL', 'BE', 'PL', 'BR', 'MX', 'JP', 'KR', 'IN',
  'SG', 'NZ', 'SE', 'NO', 'CH', 'AT', 'IE', 'PT', 'DK', 'FI', 'AE', 'SA', 'IL', 'TW', 'HK', 'TH',
  'VN', 'TR', 'AR', 'ZA',
] as const;

function merchantReturnPolicySchema() {
  return {
    '@type': 'MerchantReturnPolicy' as const,
    applicableCountry: [...MERCHANT_COUNTRIES],
    returnPolicyCategory: 'https://schema.org/MerchantReturnNotPermitted',
    url: canonicalUrl('/terms/'),
  };
}

function digitalShippingDetails(currency: string) {
  const deliveryTime = {
    '@type': 'ShippingDeliveryTime' as const,
    handlingTime: { '@type': 'QuantitativeValue' as const, minValue: 0, maxValue: 0, unitCode: 'DAY' },
    transitTime: { '@type': 'QuantitativeValue' as const, minValue: 0, maxValue: 1, unitCode: 'DAY' },
  };
  return MERCHANT_COUNTRIES.map((addressCountry) => ({
    '@type': 'OfferShippingDetails' as const,
    shippingRate: { '@type': 'MonetaryAmount' as const, value: '0', currency },
    shippingDestination: { '@type': 'DefinedRegion' as const, addressCountry },
    deliveryTime,
  }));
}

function eligibleDuration(planId: ProductPlanId): string {
  return planId === 'mon' ? 'P30D' : 'P99Y';
}

export function productSchema(input: {
  name: string;
  description: string;
  url: string;
  offerUrl: string;
  image?: string;
  sku?: string;
  productSlug?: string;
}) {
  const plans = getProductPlans(input.productSlug ?? input.sku ?? 'rust-cheat');
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: input.name,
    description: input.description,
    sku: input.sku ?? input.url.replace(/\//g, '-'),
    brand: {
      '@type': 'Brand',
      name: t.site.name,
    },
    ...(input.image ? { image: absoluteAssetUrl(input.image) } : {}),
    offers: plans.map((plan) => ({
      '@type': 'Offer',
      url: offerUrl(input.offerUrl),
      price: String(plan.priceUsd),
      priceCurrency: 'USD',
      availability: 'https://schema.org/OnlineOnly',
      itemCondition: 'https://schema.org/NewCondition',
      eligibleDuration: eligibleDuration(plan.id),
      shippingDetails: digitalShippingDetails('USD'),
      hasMerchantReturnPolicy: merchantReturnPolicySchema(),
      seller: {
        '@type': 'Organization',
        name: t.site.name,
      },
    })),
  };
}

/** @deprecated Prefer productSchema for product/cheat detail pages. */
export function softwareApplicationSchema(input: {
  name: string;
  description: string;
  url: string;
  image?: string;
  offerUrl?: string;
}) {
  return productSchema({
    name: input.name,
    description: input.description,
    url: input.url,
    offerUrl: input.offerUrl ?? input.url,
    image: input.image,
  });
}

export function articleSchema(input: {
  name: string;
  description: string;
  url: string;
  image: string;
  datePublished: string;
  dateModified?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: input.name,
    description: input.description,
    url: canonicalUrl(input.url),
    image: absoluteAssetUrl(socialShareImage(input.image)),
    datePublished: input.datePublished,
    dateModified: input.dateModified ?? input.datePublished,
    inLanguage: 'en-US',
    author: {
      '@type': 'Organization',
      name: t.site.name,
    },
    publisher: {
      '@type': 'Organization',
      name: t.site.name,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_ORIGIN}/logo.webp`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl(input.url),
    },
  };
}

export function parseBlogDate(date: string): string {
  const parsed = Date.parse(date);
  if (Number.isNaN(parsed)) return new Date().toISOString().slice(0, 10);
  return new Date(parsed).toISOString().slice(0, 10);
}
