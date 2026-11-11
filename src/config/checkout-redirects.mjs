/** Checkout destinations (Zadeyo affiliate). */
export const CHECKOUT_URLS = {
  rustHack: 'https://zadeyo.com/go/SOOFIYAN?to=%2Fproducts%2Frust',
  hwidSpoofer: 'https://zadeyo.com/go/SOOFIYAN?to=%2Fproducts%2Fhwid-spoofer',
  ugc: 'https://zadeyo.com/go/SOOFIYAN?to=%2Fproducts%2Fugc',
};

export const DISCORD_INVITE_URL = 'https://discord.com/invite/2gMnnaPWq';

export const CHECKOUT_PATH_REDIRECTS = new Map([
  ['/go/discord', DISCORD_INVITE_URL],
  ['/go/discord/', DISCORD_INVITE_URL],
  ['/go/rust', CHECKOUT_URLS.rustHack],
  ['/go/rust/', CHECKOUT_URLS.rustHack],
  ['/go/spoofer', CHECKOUT_URLS.hwidSpoofer],
  ['/go/spoofer/', CHECKOUT_URLS.hwidSpoofer],
  ['/go/hwid-spoofer', CHECKOUT_URLS.hwidSpoofer],
  ['/go/hwid-spoofer/', CHECKOUT_URLS.hwidSpoofer],
  ['/go/ugc', CHECKOUT_URLS.ugc],
  ['/go/ugc/', CHECKOUT_URLS.ugc],
]);

export function resolveCheckoutPathRedirect(pathname) {
  const direct = CHECKOUT_PATH_REDIRECTS.get(pathname);
  if (direct) return direct;

  if (pathname !== '/' && !pathname.endsWith('/')) {
    return CHECKOUT_PATH_REDIRECTS.get(`${pathname}/`) ?? null;
  }

  return null;
}
