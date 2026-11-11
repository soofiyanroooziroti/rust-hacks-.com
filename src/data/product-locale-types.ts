import type { ProductOverview } from './products';

export type SlideText = { alt: string; caption: string; captionDesc: string };
export type Block = { type: 'h2' | 'p'; text: string };

export type CatalogKind = 'cheats' | 'spoofer' | 'ugc';

export type ProductLocaleBundle = {
  groupNames?: string[];
  descs?: string[];
  slides: SlideText[];
  overview: ProductOverview;
  body: Block[];
  goodToKnow: string;
  limitations: string;
  requirements: string[];
  features?: string[];
};

export type ProductLocalePack = {
  steps: { title: string; desc: string }[];
  howToGet: string;
  cheats: ProductLocaleBundle;
  spoofer: ProductLocaleBundle;
  ugc: ProductLocaleBundle;
};
