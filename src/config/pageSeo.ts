export interface PageSeoEntry {
  title: string;
  description: string;
}

export const PAGE_SEO: Record<string, PageSeoEntry> = {
  '/': {
    title: 'Rust Hacks for Windows PC: ESP, Aimbot & Weapon Options',
    description:
      'Rust hacks and rust game hacks for Windows PC: player visuals, resource filters, and raid tools. Compare the loader, spoofer, and account recovery now.',
  },
  '/product/': {
    title: 'Rust Game Hacks: Monthly and Lifetime Plan Options',
    description:
      'Rust game hacks for Windows PC: a loader, HWID spoofer, and account recovery. Loader and recovery are $35 monthly or $150 lifetime; spoofer is $50 or $150.',
  },
  '/product/rust-cheat/': {
    title: 'Rust Hack for Windows PC: Aim, ESP, and Weapon Options',
    description:
      'Rust hack with aim tuning, player visuals, stash markers, and misc camera tools on Windows PC. $35 for 30 days or $150 lifetime.',
  },
  '/product/spoofer/': {
    title: 'Rust Spoofer: Windows Hardware Flags and New Accounts',
    description:
      'HWID spoofer rust players use when a machine fails new accounts. $50 for 30 days or $150 lifetime on Windows PC—it does not fix an account-only ban.',
  },
  '/product/ugc/': {
    title: 'Rust Account Recovery: Ban Appeal Workspace for Windows',
    description:
      'Rust account recovery organizes ban appeals and restriction cases. Separate license from the hack loader and HWID spoofer on Windows PC.',
  },
  '/product/utilities/': {
    title: 'Compare the HWID Tool and Account Appeal Workspace',
    description:
      'See which Windows utility fits a hardware flag and which fits an account appeal. Both check out separately from the hack loader.',
  },
  '/blog/': {
    title: 'Windows PC Guides for Aim, ESP, Loot, and Setup Notes',
    description:
      'Published Windows PC guides on setup, hardware fingerprint tools, aim, visuals, and how monthly and lifetime plans differ before checkout.',
  },
  '/forum/': {
    title: 'Forum: Rust Setup, Plans and EAC Patch Day Questions',
    description:
      'Forum threads on the loader, visuals, $35 monthly and $150 lifetime plans, and EAC patch days. Ask setup questions and compare notes.',
  },
  '/faq/': {
    title: 'FAQ: Rust Plans, Setup and EAC Risk Before You Buy',
    description:
      'FAQ answers on checkout, EAC updates, Windows requirements, hardware flags, and how the loader, spoofer and account tool differ.',
  },
  '/support/': {
    title: 'Support: Loader, Checkout, and Portal Help on Windows',
    description:
      'Loader, checkout, and portal help for Windows tools, the HWID spoofer, and account appeals via Discord support on this store.',
  },
  '/about/': {
    title: 'About This Rust Store: Checkout, Delivery, and Ban Risk',
    description:
      'What this Rust store sells, how checkout and portal delivery work, and the ban risk you accept when these Windows PC tools run after a patch.',
  },
  '/privacy/': {
    title: 'Privacy Notes: Analytics, Cookies, and Checkout Cards',
    description:
      'How rust-hacks.com handles analytics and cookies. Payment card numbers stay on the checkout provider, not on this store.',
  },
  '/terms/': {
    title: 'License Terms: Refunds, Acceptable Use, and Key Rules',
    description:
      'License terms, acceptable use, and the no-refund rule for the loader, HWID spoofer, and account recovery sold through rust-hacks.com.',
  },
  '/status/': {
    title: 'Status Board: Green, Red, and Blue EAC Patch Notes',
    description:
      'Green means the current build is updated and can be used. Red means do not launch. Blue means developers are still working. Checked 10 Nov 2026.',
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
