const RASTER_EXT = /\.(png|jpe?g|webp)$/i;

/** 400w covers ~330px card slots at 1x; 640w covers 2x retina. */
export const CARD_IMAGE_WIDTHS = [400, 640] as const;
export const CARD_IMAGE_SIZES = '(min-width: 1024px) 330px, (min-width: 640px) 50vw, 100vw';
/** Hero slider display ~280–560px; cap assets at 640w (2× retina). */
export const HERO_IMAGE_WIDTHS = [320, 640] as const;
export const HERO_IMAGE_SIZES =
  '(min-width: 1024px) 560px, (min-width: 640px) 70vw, min(100vw - 2.5rem, 640px)';
/** Thumbs ~148px CSS; 320w covers 2x DPR without pulling 640/960. */
export const THUMB_IMAGE_WIDTHS = [320, 400] as const;
export const DEFAULT_IMAGE_WIDTHS = [640, 960] as const;

export function stripRasterExt(src: string): string {
  return src.replace(RASTER_EXT, '');
}

export function webpSrc(src: string, width: number): string {
  return `${stripRasterExt(src)}-${width}.webp`;
}

/** Product WebPs are stored as a single file, same as the CS2 store. */
export function hasResponsiveWebpVariants(src: string): boolean {
  if (!RASTER_EXT.test(src)) return false;
  if (src.includes('placeholder')) return false;
  if (/\/images\/products\/[^/]+\.webp$/i.test(src)) return false;
  return true;
}

export function responsiveSrcSet(src: string, widths: readonly number[] = DEFAULT_IMAGE_WIDTHS): string {
  return widths.map((width) => `${webpSrc(src, width)} ${width}w`).join(', ');
}

/** Prefer ~640w for default `src`; srcset still allows smaller picks on mobile. */
export function defaultWebpSrc(src: string, widths: readonly number[]): string {
  const preferred = widths.includes(640) ? 640 : (widths[widths.length - 1] ?? 640);
  return webpSrc(src, preferred);
}

/** OG and JSON-LD image: 640w WebP when width variants exist. */
export function socialShareImage(src: string): string {
  if (!hasResponsiveWebpVariants(src)) return src;
  return webpSrc(src, 640);
}

const GAMEPLAY_INTRINSIC = { width: 960, height: 540 };

const PRODUCT_GALLERY_INTRINSIC = { width: 1330, height: 840 };

export function intrinsicImageSize(src: string): { width: number; height: number } {
  if (src.includes('/images/gameplay/')) return GAMEPLAY_INTRINSIC;
  if (/\/images\/products\/zadeyo-rust-[^/]+\.webp$/i.test(src)) return PRODUCT_GALLERY_INTRINSIC;
  return { width: 960, height: 540 };
}

/** Preload hints for the home hero LCP image (first slide). */
export function heroLcpPreload(src: string) {
  if (!hasResponsiveWebpVariants(src)) {
    return { href: src, srcset: '', sizes: HERO_IMAGE_SIZES };
  }
  return {
    href: webpSrc(src, 640),
    srcset: responsiveSrcSet(src, HERO_IMAGE_WIDTHS),
    sizes: HERO_IMAGE_SIZES,
  };
}
