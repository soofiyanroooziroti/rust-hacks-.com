/** Static path redirects (301). Keys are pathname without query/hash. */
export const PATH_REDIRECTS = new Map([
  ['/blog', '/blog/'],
  ['/about', '/about/'],
  ['/contact', '/support/'],
  ['/contact/', '/support/'],
  ['/support', '/support/'],
  ['/privacy', '/privacy/'],
  ['/terms', '/terms/'],
  ['/faq', '/faq/'],
  ['/cheats', '/product/'],
  ['/cheats/', '/product/'],
  ['/products/dota-2-cheats', '/product/'],
  ['/products/dota-2-cheats/', '/product/'],
  ['/products/dota-2-cheats/utilities', '/product/'],
  ['/products/dota-2-cheats/utilities/', '/product/'],
  ['/products/dota-2-cheats/account-recovery', '/product/ugc/'],
  ['/products/dota-2-cheats/account-recovery/', '/product/ugc/'],
  ['/products/dota-2-cheats/elite', '/product/rust-cheat/'],
  ['/products/dota-2-cheats/elite/', '/product/rust-cheat/'],
  ['/products/dota-2-cheats/lite', '/product/rust-cheat/'],
  ['/products/dota-2-cheats/lite/', '/product/rust-cheat/'],
  ['/products/dota-2-cheats/pro', '/product/rust-cheat/'],
  ['/products/dota-2-cheats/pro/', '/product/rust-cheat/'],
  ['/products/dota-2-cheats/unlock-all', '/product/'],
  ['/products/dota-2-cheats/unlock-all/', '/product/'],
  ['/products/dota-2-cheats/hwid-spoofer', '/product/spoofer/'],
  ['/products/dota-2-cheats/hwid-spoofer/', '/product/spoofer/'],
  ['/products/delta-force-cheats', '/product/'],
  ['/products/delta-force-cheats/', '/product/'],
  ['/products/delta-force-cheats/utilities', '/product/'],
  ['/products/delta-force-cheats/utilities/', '/product/'],
  ['/products/delta-force-cheats/delta-force-cheats', '/product/rust-cheat/'],
  ['/products/delta-force-cheats/delta-force-cheats/', '/product/rust-cheat/'],
  ['/products/delta-force-cheats/hwid-spoofer', '/product/spoofer/'],
  ['/products/delta-force-cheats/hwid-spoofer/', '/product/spoofer/'],
  ['/products/delta-force-cheats/ugc', '/product/ugc/'],
  ['/products/delta-force-cheats/ugc/', '/product/ugc/'],
  ['/forum/how-to-enable-the-dota-2-console', '/forum/'],
  ['/forum/how-to-enable-the-dota-2-console/', '/forum/'],
  ['/forum/can-custom-lobby-cheat-codes-be-used-in-ranked', '/forum/'],
  ['/forum/can-custom-lobby-cheat-codes-be-used-in-ranked/', '/forum/'],
  ['/forum/what-to-check-after-a-dota-2-patch', '/forum/'],
  ['/forum/what-to-check-after-a-dota-2-patch/', '/forum/'],
  ['/forum/dota-2-lite-or-pro-hero-scripts', '/forum/'],
  ['/forum/dota-2-lite-or-pro-hero-scripts/', '/forum/'],
  ['/forum/how-to-choose-dota-2-product-tier', '/forum/'],
  ['/forum/how-to-choose-dota-2-product-tier/', '/forum/'],
  ['/blog/dota-2-lite-vs-pro', '/blog/best-rust-hacks/'],
  ['/blog/dota-2-lite-vs-pro/', '/blog/best-rust-hacks/'],
  ['/blog/how-to-buy-dota-2-cheats-2026', '/blog/rust-hack-download/'],
  ['/blog/how-to-buy-dota-2-cheats-2026/', '/blog/rust-hack-download/'],
  ['/blog/delta-force-cheats-pricing', '/blog/best-rust-hacks/'],
  ['/blog/delta-force-cheats-pricing/', '/blog/best-rust-hacks/'],
  ['/blog/how-to-download-delta-force-cheats', '/blog/rust-hack-download/'],
  ['/blog/how-to-download-delta-force-cheats/', '/blog/rust-hack-download/'],
]);

/** Paths that should not receive a forced trailing slash. */
export const TRAILING_SLASH_SKIP = /\.[a-z0-9]+$/i;

export function resolvePathRedirect(pathname) {
  const direct = PATH_REDIRECTS.get(pathname);
  if (direct) return direct;

  if (pathname !== '/' && !pathname.endsWith('/') && !TRAILING_SLASH_SKIP.test(pathname)) {
    return `${pathname}/`;
  }

  return null;
}
