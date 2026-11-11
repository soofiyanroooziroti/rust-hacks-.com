import type { Locale } from '../i18n/locales';
import type { ProductFeatureGroup, ProductOverview, ProductSlide, SystemRequirement } from './product-types';
import type { CatalogKind, ProductLocalePack } from './product-locale-types';
export type { CatalogKind, ProductLocalePack } from './product-locale-types';

const packs: Partial<Record<Locale, ProductLocalePack>> = {};

export function acquisitionCopy(locale: Locale, productName: string, slug?: string) {
  const pack = packs[locale];
  if (!pack) return null;
  const steps =
    slug === 'spoofer' || slug === 'ugc'
      ? pack.steps.filter((step) => step.title.toLowerCase() !== 'check status')
      : pack.steps;
  return {
    title: pack.howToGet.replace('{name}', productName),
    steps: steps.map((step, index) => ({
      num: String(index + 1).padStart(2, '0'),
      title: step.title,
      desc: step.desc,
    })),
  };
}

export function localizeBundle<T extends {
  images: ProductSlide[];
  overview: ProductOverview;
  body: { type: 'h2' | 'p'; text: string }[];
  goodToKnow: string;
  limitations: string;
  systemRequirements: SystemRequirement[];
  featureGroups?: ProductFeatureGroup[];
  fullFeatures: string[];
}>(locale: Locale, kind: CatalogKind, source: T): T {
  const bundle = packs[locale]?.[kind];
  if (!bundle) return source;
  const next = structuredClone(source);
  next.overview = bundle.overview;
  next.body = bundle.body;
  next.goodToKnow = bundle.goodToKnow;
  next.limitations = bundle.limitations;
  next.images = next.images.map((slide, index) => ({
    ...slide,
    ...(bundle.slides[index] ?? {}),
  }));
  next.systemRequirements = next.systemRequirements.map((req, index) => ({
    ...req,
    text: bundle.requirements[index] ?? req.text,
  }));
  if (bundle.features) next.fullFeatures = bundle.features;
  if (next.featureGroups && bundle.descs && bundle.groupNames) {
    let cursor = 0;
    next.featureGroups = next.featureGroups.map((group, groupIndex) => ({
      ...group,
      name: bundle.groupNames?.[groupIndex] ?? group.name,
      items: group.items.map((item) => ({
        ...item,
        desc: bundle.descs?.[cursor++] ?? item.desc,
      })),
    }));
    if (!bundle.features) {
      next.fullFeatures = next.featureGroups.flatMap((group) => group.items.map((item) => item.name));
    }
  }
  return next;
}
