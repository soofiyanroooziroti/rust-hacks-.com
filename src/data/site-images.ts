import type { ProductSlide } from './product-types';

export interface SiteImageEntry {
  page: string;
  slot: string;
  file: string;
  alt: string;
  width: number;
  height: number;
}

const manifestRaw = import.meta.glob<string>('../../public/images/images.json', {
  query: '?raw',
  import: 'default',
  eager: true,
});

function loadManifest(): SiteImageEntry[] {
  const raw = Object.values(manifestRaw)[0];
  if (!raw) {
    throw new Error('Missing public/images/images.json');
  }
  return JSON.parse(raw) as SiteImageEntry[];
}

const manifest = loadManifest();

const GALLERY_SLOTS = ['gallery-1', 'gallery-2', 'gallery-3', 'gallery-4', 'gallery-5'] as const;

function entryBySlot(slot: string): SiteImageEntry | undefined {
  return manifest.find((e) => e.slot === slot);
}

export function getHomeHeroSlides(): ProductSlide[] {
  return GALLERY_SLOTS.map((slot) => {
    const entry = entryBySlot(slot);
    if (!entry) {
      throw new Error(`images.json missing slot ${slot}`);
    }
    return {
      src: entry.file,
      alt: entry.alt,
      caption: '',
      captionDesc: '',
      width: entry.width,
      height: entry.height,
    };
  });
}

export function getHomeOgImage(): { src: string; alt: string; width: number; height: number } {
  const entry = entryBySlot('gallery-1')!;
  return { src: entry.file, alt: entry.alt, width: entry.width, height: entry.height };
}

function blogSlugFromPage(page: string): string | null {
  const match = page.match(/^\/blog\/([^/]+)\/?$/);
  return match?.[1] ?? null;
}

export function getBlogHeroForSlug(slug: string): SiteImageEntry | undefined {
  return manifest.find((e) => e.slot === 'blog-hero' && blogSlugFromPage(e.page) === slug);
}

export function applyBlogHeroFromManifest<T extends { slug: string; image: string; imageAlt?: string }>(
  post: T,
): T & { imageWidth?: number; imageHeight?: number } {
  const hero = getBlogHeroForSlug(post.slug);
  if (!hero) return post;
  return {
    ...post,
    image: hero.file,
    imageAlt: hero.alt,
    imageWidth: hero.width,
    imageHeight: hero.height,
  };
}
