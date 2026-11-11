import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const enPath = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'src', 'i18n', 'en.json');
const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));

en.site = {
  ...en.site,
  name: 'Rust Hacks',
  domain: 'rust-hacks.com',
  title: 'Rust Hacks',
  description:
    'Rust hacks and rust game hacks for Windows PC—player visuals, resource filters, and raid tools. Compare the hack loader, HWID spoofer, and account recovery on rust-hacks.com.',
};

en.nav = [
  { href: '/', label: 'Home' },
  { href: '/product/', label: 'Products' },
  { href: '/product/rust-cheat/#features', label: 'Features' },
  { href: '/blog/', label: 'Blog' },
  { href: '/forum/', label: 'Forum' },
  { href: '/faq/', label: 'FAQ' },
  { href: '/support/', label: 'Support' },
];

en.hero = {
  status: 'Rust — modules online',
  eyebrow: 'Windows PC',
  titleLine1: 'Rust Hacks',
  titleLine2: 'Rust Hacks',
  subtitle:
    'Rust hacks and rust game hacks for Windows PC—player visuals, resource filters, raid overlays, and monument reads, with instant delivery and Discord support.',
  ctaPrimary: 'View products',
  ctaDiscord: 'Buy now',
  modesLabel: 'Modes',
  modes: ['Vanilla', 'Modded', 'Monthly', 'Wipe day'],
  metrics: [
    { label: 'Anti-cheat', strong: 'EAC' },
    { label: 'Platform', strong: 'Windows PC' },
    { label: 'Plans', strong: '$35 / $150' },
    { label: 'Support', strong: '24/7' },
  ],
};

en.features.title = 'Rust Hacks: Everything you need in one package';
en.features.subtitle = 'Player visuals, world markers, aim tuning, and camera tools for Rust on Windows PC.';

en.cheats = {
  eyebrow: 'Game hack',
  title: 'Rust Hacks',
  subtitle: 'Aim tuning, player visuals, world markers, and misc tools for Windows PC.',
  viewAll: 'View details',
  explore: 'Explore',
  items: [
    {
      badge: 'Active',
      tier: 'Full suite',
      name: 'Rust',
      title: 'Rust Hacks',
      desc: 'Rust hack for wipe and monument play—player visuals, world markers, aim tuning, and config saves.',
      features: [
        'Aimbot · FOV · smooth · bones',
        'Player ESP · box · health',
        'Stash · TC · recycler markers',
        'Turret and trap labels',
        'Camera FOV and config save',
      ],
      more: 32,
      href: '/product/rust-cheat/',
      variant: 'popular',
    },
  ],
};

en.products = {
  eyebrow: 'Products',
  title: 'Hacks, monthly and lifetime plans for Rust',
  subtitle:
    'Rust hack loader, HWID spoofer and UGC account recovery for Windows PC. Each is $35 monthly or $150 lifetime, sold as a separate checkout.',
  viewAll: 'View details',
  get: 'Buy now',
  explore: 'Explore',
  items: [
    {
      badge: 'Active',
      category: 'HWID spoofer',
      title: 'HWID Spoofer',
      subtitle: 'Hardware ID recovery',
      desc: 'Rust HWID spoofer with cleaner—rotate disk, MAC, and GPU IDs before relaunching after hardware flags.',
      features: [
        'Hardware spoofer + cleaner',
        'Compatibility scan',
        'Verification steps',
        'Portal workflow',
      ],
      more: 4,
      href: '/product/spoofer/',
    },
    {
      badge: 'Active',
      category: 'UGC Account recovery',
      title: 'UGC Account recovery',
      subtitle: 'Appeals & recovery',
      desc: 'Rust account recovery workspace—custom appeal workflows, templates, and restriction tracking.',
      features: [
        'Custom appeal workflows',
        'Multi-platform profiles',
        'Template library',
        'Status dashboard',
      ],
      more: 4,
      href: '/product/ugc/',
    },
  ],
};

en.whyUs.usLabel = 'Rust Hacks';
en.whyUs.title = 'Ranked tooling backed by patches—not promises';
en.whyUs.subtitle =
  'One hack product, one HWID spoofer, and one account recovery workspace. Prices stay $35 monthly or $150 lifetime, and a ban is still possible under EasyAnti-Cheat.';

if (en.setup) {
  en.setup.ctaPrimaryHref = '/product/';
  en.setup.intro =
    'Getting started is checkout, the portal loader, then a saved config. Check the site after an EasyAnti-Cheat update before you launch Rust.';
  if (en.setup.statusStrip) en.setup.statusStrip.aceStatusCta = 'Check EAC status';
}

if (en.compatibility) {
  en.compatibility.subtitle = 'Check the site after a Rust or EAC update before you launch.';
}

fs.writeFileSync(enPath, `${JSON.stringify(en, null, 2)}\n`, 'utf8');
console.log('Patched en.json');
