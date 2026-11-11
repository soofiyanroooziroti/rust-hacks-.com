import type { Block, ProductLocaleBundle, ProductLocalePack, SlideText } from './product-locale-types';
import type { ProductFeatureGroup, ProductOverview, ProductSlide, SystemRequirement } from './product-types';
import {
  acquisitionSteps,
  cheatsContent,
  spooferContent,
  ugcContent,
} from './product-catalog-en';

function slidesFromImages(images: ProductSlide[]): SlideText[] {
  return images.map((img) => ({
    alt: img.alt,
    caption: img.caption,
    captionDesc: img.captionDesc,
  }));
}

function bundleFromCheats(content: {
  images: ProductSlide[];
  overview: ProductOverview;
  body: Block[];
  goodToKnow: string;
  limitations: string;
  systemRequirements: SystemRequirement[];
  featureGroups: ProductFeatureGroup[];
}): ProductLocaleBundle {
  return {
    groupNames: content.featureGroups.map((group) => group.name),
    descs: content.featureGroups.flatMap((group) => group.items.map((item) => item.desc ?? '')),
    slides: slidesFromImages(content.images),
    overview: content.overview,
    body: content.body,
    goodToKnow: content.goodToKnow,
    limitations: content.limitations,
    requirements: content.systemRequirements.map((req) => req.text),
  };
}

function bundleFromUtility(
  content: {
    images: ProductSlide[];
    overview: ProductOverview;
    body: Block[];
    goodToKnow: string;
    limitations: string;
    systemRequirements: SystemRequirement[];
    fullFeatures: string[];
    featureGroups?: ProductFeatureGroup[];
  },
): ProductLocaleBundle {
  const base: ProductLocaleBundle = {
    slides: slidesFromImages(content.images),
    overview: content.overview,
    body: content.body,
    goodToKnow: content.goodToKnow,
    limitations: content.limitations,
    requirements: content.systemRequirements.map((req) => req.text),
    features: content.fullFeatures,
  };
  if (content.featureGroups?.length) {
    return {
      ...base,
      groupNames: content.featureGroups.map((group) => group.name),
      descs: content.featureGroups.flatMap((group) => group.items.map((item) => item.desc ?? '')),
      features: content.featureGroups.flatMap((group) => group.items.map((item) => item.name)),
    };
  }
  return base;
}

/** English source for product page long copy (translate to other locales). */
export function buildEnglishProductLocalePack(): ProductLocalePack {
  return {
    steps: acquisitionSteps.map(({ title, desc }) => ({ title, desc })),
    howToGet: 'How to get {name}',
    cheats: bundleFromCheats(cheatsContent),
    spoofer: bundleFromUtility(spooferContent),
    ugc: bundleFromUtility(ugcContent),
  };
}
