import type { AcquisitionStep, ProductSlide, SystemRequirement } from './product-types';
import type { Block } from './product-locale-types';
import { rustLoaderFeatureGroups } from './rust-loader-feature-groups';
import { spooferFeatureGroups } from './spoofer-feature-groups';

const PLACEHOLDER = '/images/placeholder.webp';
const RUST_LOADER = '/images/products';

const gallery = {
  hero: {
    src: `${RUST_LOADER}/zadeyo-rust-visual-esp.webp`,
    alt: 'Rust Hacks loader – Visual ESP menu on Windows PC',
    caption: 'Visual ESP',
    captionDesc: 'Player, scientist, and world label toggles in the loader.',
  },
  world: {
    src: `${RUST_LOADER}/zadeyo-rust-2-world.webp`,
    alt: 'Rust Hacks loader – world and resource ESP on Windows PC',
    caption: 'World ESP',
    captionDesc: 'Ores, collectables, traps, and vehicles in one overlay.',
  },
  aim: {
    src: `${RUST_LOADER}/zadeyo-rust-3-aimbot.webp`,
    alt: 'Rust Hacks loader – aimbot options on Windows PC',
    caption: 'Aimbot options',
    captionDesc: 'FOV, smoothing, and target rules for PvP.',
  },
  weapon: {
    src: `${RUST_LOADER}/zadeyo-rust-4-weapon.webp`,
    alt: 'Rust Hacks loader – weapon options on Windows PC',
    caption: 'Weapon options',
    captionDesc: 'Recoil, spread, sway, and bow helpers.',
  },
  misc: {
    src: `${RUST_LOADER}/zadeyo-rust-5-misc.webp`,
    alt: 'Rust Hacks loader – misc and config options on Windows PC',
    caption: 'Misc & config',
    captionDesc: 'Movement, view, and config save/load rows.',
  },
};

function slide(...keys: (keyof typeof gallery)[]): ProductSlide[] {
  return keys.map((k) => gallery[k]);
}

export const acquisitionSteps: AcquisitionStep[] = [
  {
    num: '01',
    title: 'Check status',
    desc: 'Confirm modules are online on rust-hacks.com before you buy—especially after a Rust or EasyAnti-Cheat update.',
  },
  {
    num: '02',
    title: 'Pick a plan',
    desc: 'Choose monthly or lifetime—same USD pricing on every product in the lineup.',
  },
  {
    num: '03',
    title: 'Secure checkout',
    desc: 'Complete checkout on the portal. Your license unlocks with instant delivery.',
  },
  {
    num: '04',
    title: 'Install & verify',
    desc: 'Follow the setup guide, load a conservative preset, and test on a low-stakes server before main wipe play.',
  },
];

/** Spoofer and UGC product pages — no loader status check step. */
export const utilityAcquisitionSteps: AcquisitionStep[] = acquisitionSteps.slice(1).map((step, index) => ({
  ...step,
  num: String(index + 1).padStart(2, '0'),
}));

export const utilitySlides = {
  spoofer: [
    {
      src: '/images/products/cs2-spoofer-hero.webp',
      alt: 'HWID spoofer on Windows PC',
      caption: 'HWID spoofer',
      captionDesc: 'Hardware fingerprint tools before you relaunch.',
    },
    {
      src: '/images/products/cs2-spoofer-phoenix-board.webp',
      alt: 'Phoenix Satano HWID spoofer hardware fingerprint rotation on Windows PC',
      caption: 'Phoenix board',
      captionDesc: 'Disk, MAC, and GPU ID rotation.',
    },
    {
      src: '/images/products/cs2-spoofer-phoenix-wh.webp',
      alt: 'Phoenix WH-Satano spoofer branding on Windows PC',
      caption: 'Phoenix WH',
      captionDesc: 'Spoofer workspace used on every store.',
    },
  ],
  ugc: [
    {
      src: '/images/products/ugc-account-recovery.webp',
      alt: 'UGC Account recovery appeal workspace on Windows PC',
      caption: 'Account recovery',
      captionDesc: 'Templates, evidence lists, and follow-up in one workspace.',
    },
  ],
} as const;

export const cheatsContent = {
  images: slide('hero', 'world', 'aim', 'weapon', 'misc'),
  goodToKnow:
    'Rust and EasyAnti-Cheat (EAC) update often. Confirm availability on rust-hacks.com before you launch. Overlay behavior may differ in menus or spectator views after patches.',
  limitations:
    'Third-party software can violate game terms and lead to bans. You use this software at your own risk. Compatibility can change after game, EAC, or Windows updates without notice.',
  systemRequirements: [
    { icon: 'reqWindows', text: 'Windows 10/11' },
    { icon: 'reqCpu', text: 'Intel/AMD' },
    { icon: 'reqShieldGuide', text: 'HVCI ON' },
    { icon: 'reqSettings', text: 'CORE ISOLATION ON' },
    { icon: 'shieldCheck', text: 'TPM ON' },
    { icon: 'reqShieldAccount', text: 'SECURE BOOT ON' },
  ] as SystemRequirement[],
  featureGroups: rustLoaderFeatureGroups,
  overview: {
    title: 'Built for Rust on Windows PC',
    paragraphs: [
      'Rust Hacks ships six menu groups—Visual ESP (two panels), Weapon Options, Aimbot Options, Misc Options, and Config Options—for wipe and monument play. Updates ship while your key is active, with Discord help for setup.',
      'Always check availability on rust-hacks.com before you launch, especially after an EasyAnti-Cheat (EAC) or client patch.',
    ],
  },
  body: [
    { type: 'h2', text: 'Modules included' },
    {
      type: 'p',
      text: 'Visual ESP Features, Visual ESP Features 2, Weapon Options, Aimbot Options, Misc Options, and Config Options. The full list with a short note on each toggle is in the feature section on this page.',
    },
    { type: 'h2', text: 'Plans' },
    {
      type: 'p',
      text: 'Monthly $35 USD or lifetime $150 USD. Instant digital delivery worldwide after checkout.',
    },
  ] as Block[],
};

export const spooferContent = {
  images: [...utilitySlides.spoofer],
  goodToKnow:
    'HWID tools change how your PC fingerprint appears—they do not remove account bans by themselves. Follow portal guides before launching Rust again.',
  limitations:
    'Spoofing carries technical risk and may violate game terms. Results vary by ban type and driver setup. Use only on systems you own.',
  systemRequirements: [
    { icon: 'reqWindows', text: 'Windows 10 or 11 64-bit with administrator rights.' },
    { icon: 'reqRestorePoint', text: 'Create a restore point before running hardware tools.' },
    { icon: 'reqWifi', text: 'Stable internet for activation and verification steps.' },
  ] as SystemRequirement[],
  featureGroups: spooferFeatureGroups,
  fullFeatures: spooferFeatureGroups.flatMap((group) => group.items.map((item) => item.name)),
  overview: {
    title: 'Rust HWID spoofer workflow',
    paragraphs: [
      'HWID Spoofer focuses on hardware profile rotation when you need a clean machine context before relaunching Rust after a hardware flag.',
      'Monthly and lifetime USD plans use the same checkout flow as the rest of the lineup.',
    ],
  },
  body: [
    { type: 'h2', text: 'When to use it' },
    {
      type: 'p',
      text: 'Use when fresh accounts fail on one PC but work elsewhere—not for account-only bans. Pair with conservative hack presets after verification.',
    },
    { type: 'h2', text: 'Plans' },
    { type: 'p', text: 'Monthly $50 USD (P30D) or lifetime $150 USD (P99Y).' },
  ] as Block[],
};

export const ugcContent = {
  images: [...utilitySlides.ugc],
  goodToKnow:
    'Gather portal order ID, account details, and restriction screenshots before opening a ticket. UGC structures appeals—it does not bypass platform review.',
  limitations:
    'UGC does not guarantee account restoration. Results vary by case type and platform policy.',
  systemRequirements: [
    { icon: 'reqWindows', text: 'Windows 10 or 11 (64-bit).' },
    { icon: 'reqWifi', text: 'Internet access for workflow sync and updates.' },
    { icon: 'reqSettings', text: 'Administrator access for installation.' },
  ] as SystemRequirement[],
  fullFeatures: [
    'Custom appeal workflows',
    'Multi-platform recovery workspace',
    'Template library',
    'Automation for repetitive steps',
    'Restriction tracking dashboard',
    'Secure portal delivery',
    'Monthly and lifetime USD plans',
  ],
  overview: {
    title: 'Rust account recovery workspace',
    paragraphs: [
      'Rust account recovery helps organize ban appeals and restriction cases with templates, evidence lists, and follow-up reminders.',
      'Instant digital delivery after secure checkout, with Discord support for setup questions.',
    ],
  },
  body: [
    { type: 'h2', text: 'Rust ban fix workflows' },
    {
      type: 'p',
      text: 'Build custom appeal paths, automate dispute steps, and track case status when Rust accounts are locked or restricted after an EAC action.',
    },
    { type: 'h2', text: 'Rust ban fix checklist' },
    {
      type: 'p',
      text: 'Templates walk through evidence, timing, and follow-up so a rust ban fix plan stays organized instead of scattered across chat logs.',
    },
    { type: 'h2', text: 'Plans' },
    { type: 'p', text: 'Monthly $35 USD or lifetime $150 USD.' },
  ] as Block[],
};
