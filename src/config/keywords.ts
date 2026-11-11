/** Primary keyword per core URL (null = no dedicated keyword). */
export const PAGE_KEYWORDS: Record<string, string | null> = {
  '/': 'rust hacks',
  '/product/': 'rust game hacks',
  '/product/rust-cheat/': 'rust hack',
  '/product/spoofer/': 'rust spoofer',
  '/product/ugc/': 'rust account recovery',
};

export const PRODUCT_H1: Record<string, string> = {
  'rust-cheat': 'Rust Hack for Windows PC',
  spoofer: 'Rust HWID Spoofer',
  ugc: 'Rust account recovery tool for Windows PC',
};

export const PRODUCT_PAGE_KEYWORDS: Record<string, string> = {
  ugc: 'rust account recovery',
};

export function primaryKeywords(): string[] {
  return Object.values(PAGE_KEYWORDS).filter((k): k is string => Boolean(k));
}
