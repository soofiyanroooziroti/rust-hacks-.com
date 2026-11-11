import type { Translations } from './types';
import { PRIMARY_CHECKOUT_PATH } from '../config/checkout';
import { PRODUCT_BASE } from '../config/site';
import { productPath } from '../utils/path-core';

const productBase = PRODUCT_BASE;
const rustHackFeaturesHref = `${productPath('rust-cheat')}#features`;

export const en: Translations = {
  site: {
    name: 'Rust Hacks',
    domain: 'rust-hacks.com',
    title: 'Rust Hacks',
    description:
      'Rust Hacks for Windows PC with aimbot, player ESP, and loot filters. Compare the hack, HWID spoofer, and UGC recovery on rust-hacks.com.',
    discord: PRIMARY_CHECKOUT_PATH,
  },
  nav: [
    { href: '/', label: 'Home' },
    { href: `${productBase}`, label: 'Products' },
    { href: rustHackFeaturesHref, label: 'Features' },
    { href: '/blog/', label: 'Blog' },
    { href: '/forum/', label: 'Forum' },
    { href: '/faq/', label: 'FAQ' },
    { href: '/support/', label: 'Support' },
  ],
  headerNavLabels: {
    home: 'Home',
    products: 'Store',
    features: 'Features',
    blog: 'Blog',
    forum: 'Forum',
    faq: 'FAQ',
    support: 'Help',
  },
  navMore: 'More',
  navShort: {
    home: 'Home',
    products: 'Products',
    features: 'Features',
    blog: 'Blog',
    forum: 'Forum',
    faq: 'FAQ',
    support: 'Support',
  },
  hero: {
    status: 'Updated · can be used',
    eyebrow: 'Windows PC',
    titleLine1: 'Rust Hacks',
    titleLine2: 'Rust Hacks',
    subtitle:
      'Rust hacks and cheats for Windows PC—aimbot, player ESP, loot filters, and weapon options, with instant delivery and Discord support.',
    ctaPrimary: 'View products',
    ctaDiscord: 'Buy now',
    modesLabel: 'Modes',
    modes: ['Operations', 'Warfare', 'Extraction', 'Ranked'],
    metrics: [
      { label: 'Anti-cheat', strong: 'ACE' },
      { label: 'Platform', strong: 'Windows PC' },
      { label: 'Plans', strong: '$35 / $150' },
      { label: 'Support', strong: '24/7' },
    ],
  },
  features: {
    eyebrow: 'Features',
    title: 'Everything you need in one package',
    subtitle: 'Aimbot, player visuals, loot, weapon options, and misc options for Rust on Windows PC.',
    items: [
      {
        title: 'Aimbot',
        subtitle: 'FOV, smooth, and bone.',
        desc: 'Aim assist with a cone, a speed curve, and a bone choice so the pull stays on the operator you are already fighting.',
        bullets: [
          'FOV, smooth, speed, and stickiness',
          'Bone selection: closest, head, neck, or chest',
          'Visible check and ignore knocked',
          'Two keybinds, including a controller bind',
          'Draw FOV and a target line while you tune',
        ],
        tags: ['aimbot', 'fov', 'smooth'],
        bento: 'sm:col-span-2 lg:col-span-12 lg:col-start-1 lg:row-start-1',
      },
      {
        title: 'Player visuals',
        subtitle: 'Read a fight without a wall of labels.',
        desc: 'Skeleton, box, health, distance, and gear levels, with a max distance so far operators drop off.',
        bullets: [
          'Skeleton, head circle, box, and health',
          'Name, team number, weapon, and view direction',
          'Helmet, armor, and chest bag level',
        ],
        tags: ['player esp', 'skeleton', 'health'],
        bento: 'sm:col-span-2 lg:col-span-8 lg:col-start-1 lg:row-start-2',
      },
      {
        title: 'Loot',
        subtitle: 'Name, rarity, and price.',
        desc: 'Item labels with a minimum price filter, plus player corpses, AI corpses, and computers as separate markers.',
        bullets: ['Item name, rarity, and price', 'Minimum price filter', 'Player and AI corpses'],
        tags: ['loot', 'rarity', 'price filter'],
        bento: 'sm:col-span-2 lg:col-span-6 lg:col-start-1 lg:row-start-3',
      },
      {
        title: 'Weapon options',
        subtitle: 'Recoil, spread, and sway.',
        desc: 'Weapon options cover recoil yaw and pitch, spread, sway, and the instant draw rows. Aimbot stays its own group.',
        bullets: ['No recoil yaw and pitch', 'No spread and no sway', 'Instant eoka, compound, and bow'],
        tags: ['weapon options', 'recoil', 'spread'],
        bento: 'sm:col-span-2 lg:col-span-6 lg:col-start-7 lg:row-start-3',
      },
      {
        title: 'Camera',
        subtitle: 'View width, not aim width.',
        desc: 'Camera FOV, third person, and arm or weapon scale. Aim FOV stays in the aimbot group.',
        bullets: [
          'Camera FOV changer',
          'Third person on a hotkey',
          'Arm and weapon scale',
          'Crosshair and combat-mode hides',
        ],
        tags: ['camera fov', 'third person', 'scale'],
        bento: 'sm:col-span-2 lg:col-span-8 lg:row-span-2 lg:col-start-1 lg:row-start-4',
      },
      {
        title: 'Config',
        subtitle: 'Save the layout you tested.',
        desc: 'Store aim, visuals, loot, weapon options, and misc instead of retuning after every launch.',
        bullets: ['Save and load configs', 'One slider change at a time', 'Reload after an ACE patch'],
        tags: ['config', 'presets', 'save'],
        bento: 'sm:col-span-2 lg:col-span-4 lg:row-span-2 lg:col-start-9 lg:row-start-4',
      },
      {
        title: 'Plans',
        subtitle: '$35–$50 month or $150 lifetime.',
        desc: 'Hack and UGC are $35 monthly or $150 lifetime; the HWID spoofer is $50 monthly or $150 lifetime. Each product is its own checkout.',
        bullets: ['Monthly is 30 days', 'Lifetime does not include the spoofer', 'No weekly plan'],
        tags: ['$35', '$150', 'plans'],
        bento: 'sm:col-span-2 lg:col-span-6 lg:col-start-1 lg:row-start-6',
      },
      {
        title: 'HWID and UGC',
        subtitle: 'PC flag versus account case.',
        desc: 'The spoofer is for a machine that fails new accounts. UGC is the appeal workspace. Neither ships inside the hack key.',
        bullets: ['HWID spoofer is a separate product', 'UGC tracks appeal steps', 'Same $35 and $150 prices'],
        tags: ['hwid', 'ugc', 'separate'],
        bento: 'sm:col-span-2 lg:col-span-6 lg:col-start-7 lg:row-start-6',
      },
      {
        title: 'Windows requirements',
        subtitle: 'Leave security features on.',
        desc: 'Windows 10 or 11, Intel or AMD, with HVCI, core isolation, TPM, and secure boot on.',
        bullets: ['Windows 10 and 11', 'HVCI and core isolation on', 'TPM and secure boot on'],
        tags: ['windows', 'secure boot', 'tpm'],
        bento: 'sm:col-span-2 lg:col-span-4 lg:col-start-9 lg:row-start-2',
      },
    ],
  },
  whyUs: {
    eyebrow: 'Why us',
    title: 'Ranked tooling backed by patches—not promises',
    subtitle:
      'One cheat product, one HWID spoofer, and one UGC recovery workspace. Prices stay $35 monthly or $150 lifetime, and a ban is still possible under EasyAnti-Cheat.',
    usLabel: 'Rust Hacks',
    otherLabel: 'Typical provider',
    rows: [
      {
        title: 'Patch-day loader updates',
        desc: 'Check rust-hacks.com after a Rust or ACE update before you open the loader.',
      },
      {
        title: 'Separate aim sliders',
        desc: 'Aim smooth, FOV, and bone choice are separate sliders. Change one at a time and save the config.',
      },
      {
        title: 'Loader and config help',
        desc: 'Setup questions cover the Windows loader, saved configs, and which product matches a hardware flag versus an account case.',
      },
      {
        title: 'Separate product checkouts',
        desc: 'The hack, the HWID spoofer, and UGC recovery stay separate checkouts. Lifetime on the hack does not add the spoofer.',
      },
      {
        title: 'Saved configs',
        desc: 'Save aim, visuals, loot, weapon options, and misc settings in the config system instead of rebuilding them each launch.',
      },
      {
        title: 'HWID is its own product',
        desc: 'A machine that fails new accounts is the spoofer case. An account-only restriction is the UGC case. Neither is included with the hack key.',
      },
    ],
    metrics: [
      {
        value: 'ACE',
        title: 'Check after a patch',
        desc: 'Recheck the site after a Rust or EasyAnti-Cheat update before you launch.',
      },
      {
        value: '2',
        title: 'Plans on every card',
        desc: 'Monthly is $35 for 30 days. Lifetime is $150. There is no weekly plan.',
      },
      {
        value: '3',
        title: 'Separate products',
        desc: 'Rust Hacks, the HWID spoofer, and UGC recovery. Each one is its own key.',
      },
    ],
  },
  setup: {
    eyebrow: 'Setup guide',
    titleLead: 'From checkout to ranked queue in just',
    titleHighlight: 'three simple steps',
    intro:
      'Getting started is checkout, the portal loader, then a saved config. Check the site after an EasyAnti-Cheat update before you launch Rust.',
    ctaPrimary: 'View products',
    ctaSecondary: 'Setup FAQ',
    ctaPrimaryHref: productBase,
    ctaSecondaryHref: '/faq/',
    statusStrip: {
      aceStatusCta: 'Check ACE status',
      aceStatusHref: '/status/',
      perks: [
        { icon: 'instantDelivery', label: 'Instant delivery' },
        { icon: 'support247', label: '24/7 support' },
        { icon: 'refresh', label: 'Lifetime updates' },
      ],
    },
    steps: [
      {
        step: 'Step 1',
        title: 'Unlock portal & download loader',
        desc: 'Complete checkout, open your operator dashboard, and pull the latest patch loader build for Windows.',
      },
      {
        step: 'Step 2',
        title: 'Launch & configure modules',
        desc: 'Run the loader, then tune aim, visuals, loot, and weapon options one slider at a time.',
      },
      {
        step: 'Step 3',
        title: 'Check status, then launch',
        desc: 'Confirm the site is current for this client, then open Rust with the config you saved.',
      },
    ],
  },
  compatibility: {
    eyebrow: 'Platform support',
    title: 'Runs on your rig.',
    subtitle: 'Check the site after a Rust or ACE update before you launch.',
    items: ['Windows 10 & 11', 'Intel or AMD', 'HVCI on', 'Core isolation on', 'TPM on', 'Secure boot on', 'Discord support', 'Config save'],
  },
  cheats: {
    eyebrow: 'Game hack',
    title: 'Rust Hacks',
    subtitle: 'Aimbot, player ESP, loot filters, and weapon options for Windows PC.',
    viewAll: 'View details',
    explore: 'Explore',
    items: [
      {
        badge: 'Active',
        tier: 'Full suite',
        name: 'Rust',
        title: 'Rust Hacks',
        desc: 'Rust Hacks for operations and extraction—aimbot, player ESP, loot filters, and weapon options.',
        features: [
          'Aimbot · FOV · smooth · bones',
          'Player ESP · box · health',
          'Loot name · rarity · price',
          'Weapon options · recoil · spread',
          'Camera FOV and config save',
        ],
        more: 45,
        href: `${productBase}rust-cheat/`,
        variant: 'popular',
      },
    ],
  },
  products: {
    eyebrow: 'Products',
    title: 'Products & pricing',
    subtitle: 'Rust Hacks, HWID spoofer, and UGC Account recovery—same USD plans on Windows PC.',
    viewAll: 'View details',
    get: 'Buy now',
    explore: 'Explore',
    items: [
      {
        badge: 'Active',
        category: 'HWID spoofer',
        title: 'HWID Spoofer',
        subtitle: 'Hardware ID recovery',
        desc: 'HWID spoofer with cleaner—rotate disk, MAC, and GPU IDs before relaunching after hardware flags.',
        features: ['Hardware spoofer + cleaner', 'Compatibility scan', 'Verification steps', 'Portal workflow'],
        more: 4,
        href: `${productBase}spoofer/`,
      },
      {
        badge: 'Active',
        category: 'UGC Account recovery',
        title: 'UGC Account recovery',
        subtitle: 'Appeals & recovery',
        desc: 'UGC Account recovery workspace—custom appeal workflows, templates, and restriction tracking.',
        features: ['Custom appeal workflows', 'Multi-platform profiles', 'Template library', 'Status dashboard'],
        more: 4,
        href: `${productBase}ugc/`,
      },
    ],
  },
  blog: {
    eyebrow: 'Blog',
    title: 'Guides and updates',
    subtitle: 'Setup notes, aimbot and ESP guides, loot filters, and pricing answers for Rust on Windows PC.',
    latestTitle: 'Rust hack guides for aim, ESP, loot and setup',
    latestSubtitle: 'Filter by topic or sort to find setup guides, feature deep-dives, and patch-day notes.',
    filterAll: 'All articles',
    sortLabel: 'Sort by',
    sortNewest: 'Newest first',
    sortOldest: 'Oldest first',
    sortShortRead: 'Shortest read',
    sortLongRead: 'Longest read',
    emptyFilter: 'No articles match this filter.',
    emptyCatalog: 'Guides are coming soon. Browse products or FAQ for help today.',
    viewAll: 'View all articles',
    read: 'Read',
    items: [],
  },
  toolkit: {
    eyebrow: 'Software',
    title: 'Organized, easy to configure',
    subtitle: 'Every module is grouped for quick tuning mid-match without tabbing through chaos.',
    items: [
      { num: '01', label: 'Aim', title: 'Cone, speed, and bone', desc: 'FOV, smooth, speed, stickiness, visible check, and a head, neck, chest, or closest bone.' },
      { num: '02', label: 'Visuals', title: 'Labels you can actually read', desc: 'Skeleton, box, health, gear level, and a max distance so the fight stays clear.' },
      { num: '03', label: 'Loot', title: 'Price filter first', desc: 'Item name, rarity, price, corpses, and computers, with a minimum price so junk drops off.' },
      { num: '04', label: 'Weapon options', title: 'Recoil, spread, and sway', desc: 'Yaw, pitch, scope recoil, no spread, and no sway. Separate from the aimbot group.' },
      { num: '05', label: 'Camera', title: 'View width, not aim width', desc: 'Camera FOV, third person, arm and weapon scale, and combat-mode hides.' },
      { num: '06', label: 'Config', title: 'Save the layout', desc: 'Store the sliders you tested so the next launch does not start from zero.' },
    ],
  },
  workflow: {
    eyebrow: 'How it works',
    badge: '4 easy steps',
    titleBefore: 'From status check to',
    titleHighlight: 'saved profile.',
    subtitle: 'A straight path from a status check to a saved Rust config.',
    ctaLabel: 'View products',
    ctaHref: productBase,
    ctaSecondary: 'Setup FAQ',
    ctaSecondaryHref: '/faq/',
    items: [
      {
        num: '01',
        phase: 'Before purchase',
        title: 'Check ACE status',
        desc: 'Read rust-hacks.com after a client or EasyAnti-Cheat update before you buy or launch.',
      },
      {
        num: '02',
        phase: 'Checkout',
        title: 'Choose the product',
        desc: 'Rust Hacks, HWID Spoofer, or UGC. Hack and UGC monthly is $35; spoofer monthly is $50. Lifetime is $150. They are separate keys.',
      },
      {
        num: '03',
        phase: 'Loader',
        title: 'Launch & configure',
        desc: 'Download from the portal. Leave HVCI, core isolation, TPM, and secure boot on.',
      },
      {
        num: '04',
        phase: 'In-game',
        title: 'Save your profile',
        desc: 'When the aim cone and the ESP labels feel right, save the config.',
      },
    ],
  },
  fieldNotes: {
    eyebrow: 'Field notes',
    title: 'Built for Rust on Windows PC.',
    items: [
      { num: '01', title: 'Patch-day check', desc: 'After a Rust or EasyAnti-Cheat update, check the status page. Green means you can use the loader until it turns red or blue.' },
      { num: '02', title: 'One slider at a time', desc: 'Change FOV, smooth, or distance alone so you know which setting caused the pull or the clutter.' },
      { num: '03', title: 'Separate products', desc: 'The hack, the HWID spoofer, and UGC recovery are three checkouts. Lifetime on one does not unlock the others.' },
    ],
  },
  support: {
    eyebrow: 'Support',
    title: 'Rust support',
    subtitle: 'Let us know how we can help.',
    channels: [
      {
        icon: 'users',
        title: 'Chat before checkout',
        desc: 'Ask about the hack, the spoofer, or UGC before you pay.',
        linkLabel: 'Start checkout',
        href: PRIMARY_CHECKOUT_PATH,
      },
      {
        icon: 'messageCircle',
        title: 'Community forum',
        desc: 'Setup, aim, ESP, and plan questions with marked developer replies.',
        linkLabel: 'Open the forum',
        href: '/forum/',
      },
      {
        icon: 'navFaq',
        title: 'Read the FAQ',
        desc: 'Compatibility, bans and setup—before you buy.',
        linkLabel: 'View all FAQ',
        href: '/faq/',
      },
      {
        icon: 'clock',
        title: 'Live operators',
        desc: 'Discord engineers on shift 24/7.',
        linkLabel: 'Open contact page',
        href: '/support/',
      },
    ],
    ticketTitle: 'Include in your ticket',
    ticketItems: [
      { title: 'Portal order ID', desc: 'The address used at checkout on rust-hacks.com.' },
      { title: 'Platform', desc: 'Windows 10 or 11, and whether HVCI, core isolation, TPM, and secure boot are on.' },
      { title: 'Error detail', desc: 'The exact loader message, not a paraphrase.' },
    ],
  },
  faq: {
    eyebrow: 'FAQ',
    title: 'Straight answers before checkout.',
    subtitle: 'Compatibility, bans and access—no vague promises.',
    items: [
      {
        num: '01',
        q: 'Where do I check if Rust Hacks are online?',
        a: 'After a Rust or EasyAnti-Cheat update, open the status page. If the label is green, you can use the loader. Keep using it until the label is red or blue.',
      },
      {
        num: '02',
        q: 'What happens after I buy?',
        a: 'Checkout opens the portal with the loader. Save a config after you tune aim and visuals. Leave HVCI, core isolation, TPM, and secure boot on.',
      },
      {
        num: '03',
        q: 'Can I get banned using Rust Hacks?',
        a: 'Yes. EasyAnti-Cheat can act on the account. Nothing on this site is a guarantee that a session stays clean.',
      },
      {
        num: '04',
        q: 'Which platforms are supported?',
        a: 'Windows 10 or 11 on Intel or AMD, with HVCI, core isolation, TPM, and secure boot on. macOS and Linux are not supported.',
      },
      {
        num: '05',
        q: 'Can I move my license to a new PC?',
        a: 'A hardware flag is the HWID Spoofer, sold separately. Open a support ticket with the portal order ID if the same key needs another PC.',
      },
      {
        num: '06',
        q: 'Where are products and utilities listed?',
        a: 'Rust Hacks, HWID Spoofer, and UGC Account recovery are on the products page. Rust Hacks and UGC are $35 monthly or $150 lifetime; the HWID spoofer is $50 monthly or $150 lifetime.',
      },
    ],
  },
  footer: {
    tagline: 'Rust Hacks, HWID spoofer, and UGC recovery for Windows PC. rust-hacks.com',
    explore: 'Explore',
    exploreLinks: [
      { href: '/', label: 'Feature overview', ariaLabel: 'Features', scrollTarget: 'features' },
      { href: '/product/rust-cheat/', label: 'Rust Hacks', ariaLabel: 'Rust Hacks' },
      { href: '/product/', label: 'All products', ariaLabel: 'Products' },
      { href: '/blog/', label: 'Read patch guides', ariaLabel: 'Blog' },
      { href: '/faq/', label: 'Pre-purchase FAQ', ariaLabel: 'FAQ' },
    ],
    support: 'Support',
    legal: 'Legal',
    moreSites: 'More sites',
    privacy: 'Privacy Policy',
    terms: 'Terms & Conditions',
    about: 'About',
  },
  legalPages: {
    about: {
      title: 'About this Rust store',
      description:
        'rust-hacks.com sells Rust Hacks, an HWID spoofer, and UGC account recovery for Windows PC, with setup notes and honest ban risk.',
      sections: [
        {
          heading: 'Who we are',
          paragraphs: [
            'rust-hacks.com is a Windows PC store for Rust Hacks, an HWID spoofer, and UGC account recovery. The hack is one product: aimbot options, two player visual groups, loot filters, weapon options, and misc options. It is not a ladder of Lite, Pro, and Elite tiers, and it is not a DMA card.',
            'Rust Hacks and UGC are $35 for 30 days or $150 lifetime; the HWID spoofer is $50 for 30 days or $150 lifetime. A lifetime key on the hack does not include the spoofer or the recovery workspace. Starting on a month does not promise a credit toward lifetime.',
            'Product names on this site identify what we sell. They are not a claim that the game publisher endorses the software. Delivery is a portal download for Windows 10 or 11. You keep HVCI, core isolation, TPM, and secure boot on, then open the loader only when the site still matches the current client.',
          ],
        },
        {
          heading: 'What we publish',
          paragraphs: [
            'The [Rust Hacks](/product/rust-cheat/) page lists the menu names and the Windows requirements: Windows 10 or 11, Intel or AMD, with HVCI, core isolation, TPM, and secure boot left on. The [products page](/product/) is where you compare the hack, the [HWID Spoofer](/product/spoofer/), and [UGC Account recovery](/product/ugc/).',
            'Guides on the [blog](/blog/) explain aim FOV versus camera FOV, how loot filters work, and why a hardware flag is a different buy from an account appeal. The [forum](/forum/) is for those same questions, with developer replies marked on the thread. Read the [terms](/terms/) before checkout. Sales are final, including bans.',
            'EasyAnti-Cheat can still act on an account. Nothing here is a guarantee that a session stays clean after the next patch. Check this site after a client update before you open the loader. If the page is not current for that build, leave the software closed.',
            'Status notes on the homepage describe whether the published build still matches the client. They are not a promise that EasyAnti-Cheat will ignore the software. If you are unsure, leave the loader closed and read the matching guide on the blog before you queue again.',
          ],
        },
        {
          heading: 'Support',
          paragraphs: [
            'Loader errors, a key that will not move, and checkout questions go through the [support page](/support/). Include the portal order ID, Windows version, and the exact loader text. Do not turn HVCI, core isolation, TPM, or secure boot off because a chat message from another game said to.',
          ],
        },
      ],
    },
    privacy: {
      title: 'Privacy Policy',
      description:
        'How rust-hacks.com handles analytics, cookies, and contact data.',
      sections: [
        {
          heading: 'Information we collect',
          paragraphs: [
            'We may collect standard web analytics such as page views, device type, browser, and approximate region through Google Analytics when enabled. Checkout and license delivery happen on external checkout pages. We do not store payment card data on rust-hacks.com.',
          ],
        },
        {
          heading: 'How we use data',
          paragraphs: [
            'Analytics help us understand which guides and product pages are useful so we can improve content and fix broken links. Support tickets may retain the portal account and message content you provide until the issue is resolved.',
          ],
        },
        {
          heading: 'Cookies',
          paragraphs: [
            'We use minimal cookies required for analytics. You can block cookies in your browser settings; core site content remains accessible without them.',
          ],
        },
        {
          heading: 'Support',
          paragraphs: [
            'For privacy questions, use the options on the Support page. Purchase and refund rules are in our Terms & Conditions.',
          ],
        },
      ],
    },
    terms: {
      title: 'Terms & Conditions',
      description:
        'Purchase, license, refund, and use terms for products sold on rust-hacks.com.',
      sections: [
        {
          heading: 'Agreement',
          paragraphs: [
            'Last updated: October 2026. By using rust-hacks.com or completing checkout for any product listed here, you agree to these Terms & Conditions and our Privacy Policy.',
          ],
        },
        {
          heading: 'What you purchase',
          paragraphs: [
            'We sell Rust Hacks, an HWID spoofer, and UGC account recovery. Each product is its own license: hack and UGC are $35 for 30 days or $150 lifetime; the spoofer is $50 for 30 days or $150 lifetime, delivered through a portal and loader for Windows PC.',
            'Feature lists on each product page describe what is included at the time of purchase. Modules can change when Rust or EasyAnti-Cheat updates. A lifetime cheat key does not include the spoofer or UGC.',
          ],
        },
        {
          heading: 'Checkout and delivery',
          paragraphs: [
            'Payment and license delivery run on external checkout pages. rust-hacks.com does not process or store payment card numbers.',
            'After purchase, use the portal from your order to download the current loader before you launch Rust. Leave HVCI, core isolation, TPM, and secure boot on.',
          ],
        },
        {
          heading: 'License use',
          paragraphs: [
            'Licenses are for your personal use only. Do not share loader files, portal logins, or license keys. A hardware-ID problem is a separate HWID Spoofer purchase.',
          ],
        },
        {
          heading: 'Refunds and purchases',
          paragraphs: [
            'All sales are final once checkout completes. We do not refund change-of-mind purchases, account bans, EasyAnti-Cheat penalties, or issues caused by ignoring the setup notes or launching while the site is not current for that patch.',
            'If the product does not work as described on a supported setup—Windows 10 or 11 with HVCI, core isolation, TPM, and secure boot on, and the current loader from the portal—contact us through the Support page. Include your portal order ID, Windows version, and the exact loader text.',
            'We may, at our discretion, offer a fix, replacement access, or partial/full refund when we confirm a fault on our side. We are not obligated to approve every request.',
          ],
        },
        {
          heading: 'Availability and risk',
          paragraphs: [
            'Third-party tools for Rust can conflict with game updates and EasyAnti-Cheat. You use this software at your own risk, including possible account action.',
            'Check the homepage status banner before every session. Do not queue ranked while modules are offline or misaligned after a patch.',
          ],
        },
        {
          heading: 'Changes',
          paragraphs: [
            'We may update these terms. The “Last updated” date at the top will change when we do. Continued use of the site after changes means you accept the revised terms.',
          ],
        },
        {
          heading: 'Support',
          paragraphs: [
            'For terms, billing, or loader questions, use the buttons on the Support page. See also our Privacy Policy for how we handle site data.',
          ],
        },
      ],
    },
    support: {
      title: 'Rust support',
      description:
        'Loader, HWID spoofer, UGC, and checkout help for rust-hacks.com.',
    },
  },
  ui: {
    skipLink: 'Skip to main content',
    browseCheats: 'Try Now',
    browseCheatsMobile: 'Start checkout',
    homeAria: 'Rust Hacks home',
    checkoutAria: 'Start checkout',
    discordAria: 'Buy Rust Hacks',
    menuOpen: 'Open menu',
    menuClose: 'Close menu',
    themeLight: 'Switch to light mode',
    themeDark: 'Switch to dark mode',
    searchPlaceholder: 'Search products, guides, FAQ…',
    searchEmpty: 'Type to search the site.',
    searchNoResults: 'No results. Try another term.',
    searchCloseAria: 'Close search',
    searchTitle: 'Search',
    searchOpenAria: 'Search site',
  },
};
