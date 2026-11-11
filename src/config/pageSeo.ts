export interface PageSeoEntry {
  title: string;
  description: string;
}

export const PAGE_SEO: Record<string, PageSeoEntry> = {
  '/': {
    title: 'Rust Hacks for Windows PC | Rust Game Hacks & Plans',
    description:
      'Rust hacks and rust game hacks for Windows PC: player visuals, resource filters, and raid tools. Compare the loader, spoofer, and account recovery now.',
  },
  '/product/': {
    title: 'Rust Game Hacks | Monthly and Lifetime Plans',
    description:
      'Rust game hacks for Windows PC: a loader, HWID spoofer, and account recovery. Loader and recovery are $35 monthly or $150 lifetime; the spoofer is $50 or $150.',
  },
  '/product/rust-cheat/': {
    title: 'Rust Hack Loader | Aim, Visuals & World Overlays',
    description:
      'Rust hack with aim tuning, player visuals, stash markers, and misc camera tools on Windows PC. $35 for 30 days or $150 lifetime.',
  },
  '/product/spoofer/': {
    title: 'Rust HWID Spoofer for Windows Hardware Flags',
    description:
      'HWID spoofer rust players use when a machine fails new accounts. $50 for 30 days or $150 lifetime on Windows PC—it does not fix an account-only ban.',
  },
  '/product/ugc/': {
    title: 'Rust Account Recovery | Ban Appeal Workspace',
    description:
      'Rust account recovery organizes ban appeals and restriction cases. Separate license from the hack loader and HWID spoofer on Windows PC.',
  },
  '/product/utilities/': {
    title: 'Compare HWID Spoofer and Account Recovery',
    description:
      'See which Windows utility fits a hardware flag and which fits an account appeal. Both check out separately from the hack loader.',
  },
  '/blog/': {
    title: 'Windows PC Guides for Setup, Visuals, and Hardware',
    description:
      'Published Windows PC guides on setup, hardware fingerprint tools, aim, visuals, and how monthly and lifetime plans differ before checkout on rust-hacks.com.',
  },
  '/forum/': {
    title: 'Community Forum | Setup, Plans, and Patch Days',
    description:
      'Forum threads on the loader, visuals, $35 monthly and $150 lifetime plans, and EAC patch days.',
  },
  '/faq/': {
    title: 'FAQ – Plans, Setup, and EAC Risk Before Checkout',
    description:
      'Answers on checkout, EAC updates, Windows requirements, hardware flags, and how the loader, spoofer, and account tool differ.',
  },
  '/support/': {
    title: 'Support | Loader, Checkout, and Portal Help',
    description:
      'Loader, checkout, and portal help for Windows tools, the HWID spoofer, and account appeals via Discord support.',
  },
  '/about/': {
    title: 'About This Rust Store | Checkout, Delivery, and Risk',
    description:
      'What this store sells, how checkout and portal delivery work, and the ban risk you accept when these Windows PC tools run after a game or anti-cheat patch.',
  },
  '/privacy/': {
    title: 'Privacy notes for analytics and cookies',
    description:
      'How rust-hacks.com handles analytics and cookies. Payment card numbers stay on the checkout provider, not on this store.',
  },
  '/terms/': {
    title: 'License terms, refunds, and acceptable use',
    description:
      'License terms, acceptable use, and the no-refund rule for the loader, HWID spoofer, and account recovery sold through rust-hacks.com.',
  },
  '/status/': {
    title: 'Rust Hacks Status & EAC Patch Notes',
    description:
      'Green means the Rust Hacks build is updated and can be used. Red means do not launch. Blue means developers are still working. Checked 10 Nov 2026.',
  },
};

export function normalizeSeoPath(pathname: string): string {
  let path = pathname || '/';
  if (!path.startsWith('/')) path = `/${path}`;
  if (path !== '/' && !path.endsWith('/')) path = `${path}/`;
  return path;
}

export function getPageSeoEntry(pathname: string): PageSeoEntry | undefined {
  return PAGE_SEO[normalizeSeoPath(pathname)];
}
