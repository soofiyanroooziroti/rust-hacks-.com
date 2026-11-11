import type { IconName } from '../components/icons/types';
import { normalizeInternalPath, productPath, ROUTES, localizedPath, localizedRoutes, cheatPath } from '../utils/path-core';

export type FaqTopic =
  | 'all'
  | 'plans'
  | 'esp'
  | 'scripts'
  | 'safety'
  | 'products'
  | 'blog'
  | 'setup';

export interface SiteFaqItem {
  id: string;
  topic: FaqTopic;
  icon: IconName;
  q: string;
  a: string;
  aHtml?: string;
  scopes?: string[];
}

function link(text: string, href: string): string {
  return `<a href="${normalizeInternalPath(href)}">${text}</a>`;
}

const cheats = link('Rust Hacks', productPath('rust-cheat'));
const productsHub = link('products page', ROUTES.products);
const hwid = link('HWID Spoofer', productPath('spoofer'));
const ugc = link('UGC Account recovery', productPath('ugc'));

export const siteFaqs: SiteFaqItem[] = [
  {
    id: 'status',
    topic: 'setup',
    icon: 'faqStatus',
    q: 'Where do I check if the loader is current?',
    a: `After a Rust or EasyAnti-Cheat update, open the ${link('status page', ROUTES.status)}. If the label is green, you can use the loader. Keep using it until the label is red or blue.`,
  },
  {
    id: 'after-buy',
    topic: 'setup',
    icon: 'faqAfterBuy',
    q: 'What happens after I buy?',
    a: 'Checkout opens the portal with the loader for the product you paid for. Save a config after you tune it. HVCI, core isolation, TPM, and secure boot stay on.',
  },
  {
    id: 'ban-risk',
    topic: 'safety',
    icon: 'faqBanRisk',
    q: 'Can I get banned?',
    a: 'Yes. EasyAnti-Cheat can act on the account. Nothing on this site is a guarantee that a session stays clean.',
  },
  {
    id: 'hwid-ban-risk',
    topic: 'safety',
    icon: 'faqBanRisk',
    q: 'What is an HWID flag, and does the hack key fix it?',
    a: `A hardware flag follows the PC. New accounts can fail on that machine and work on another. That is the ${hwid}, sold separately. It does not undo an account-only restriction, and lifetime on ${cheats} does not include it.`,
  },
  {
    id: 'platforms',
    topic: 'setup',
    icon: 'faqPlatforms',
    q: 'Which PCs are supported?',
    a: 'Windows 10 or 11 on Intel or AMD, with HVCI, core isolation, TPM, and secure boot on. macOS and Linux are not supported.',
  },
  {
    id: 'license-move',
    topic: 'products',
    icon: 'faqLicenseMove',
    q: 'Can I move a key to another PC?',
    a: 'Open support with the portal order ID. A machine that fails new accounts is an HWID Spoofer purchase, not a free move of the hack key.',
  },
  {
    id: 'products-page',
    topic: 'products',
    icon: 'faqProductsPage',
    q: 'What is for sale?',
    a: `${cheats}, the ${hwid}, and ${ugc} are listed on the ${productsHub}. Rust Hacks and UGC are $35 for 30 days or $150 lifetime; the HWID spoofer is $50 for 30 days or $150 lifetime. They are three checkouts.`,
  },
  {
    id: 'plans-same-price',
    topic: 'plans',
    icon: 'faqComparePlans',
    q: 'Does $150 lifetime include the spoofer?',
    a: 'No. Lifetime on Rust Hacks is that product only. The HWID spoofer and UGC recovery are separate keys at the same prices. A monthly start does not promise a credit toward lifetime.',
    scopes: ['rust-cheat', 'spoofer', 'ugc'],
  },
  {
    id: 'aim-vs-camera',
    topic: 'esp',
    icon: 'faqWhatIsEsp',
    q: 'Is camera FOV the same slider as aim FOV?',
    a: 'No. Camera FOV changes how wide the view is. Aim FOV is only the cone the assist searches. Set the camera first, then retune aim FOV.',
    scopes: ['rust-cheat'],
  },
  {
    id: 'esp-clutter',
    topic: 'esp',
    icon: 'faqWhatIsEsp',
    q: 'Why does player ESP cover the fight?',
    a: 'Start with box or skeleton, health, and distance. Add gear levels only if you read them. A max distance drops far operators. Name ESP is a separate toggle, not a replacement for those labels.',
    scopes: ['rust-cheat'],
  },
  {
    id: 'not-dma',
    topic: 'scripts',
    icon: 'faqExternalLoader',
    q: 'Is this a DMA card?',
    a: 'No. Rust Hacks is a Windows loader from checkout. A DMA device is a different product and is not what this key delivers. Do not run a file that arrived from a search result.',
    scopes: ['rust-cheat'],
  },
  {
    id: 'ugc-scope',
    topic: 'products',
    icon: 'faqProductsPage',
    q: 'What does UGC Account recovery do?',
    a: `${ugc} is an appeal workspace: templates, evidence lists, and follow-up. It is not a guaranteed unban, and it is not the HWID spoofer.`,
    scopes: ['ugc'],
  },
  {
    id: 'spoofer-scope',
    topic: 'products',
    icon: 'faqProductsPage',
    q: 'When is the HWID spoofer the right buy?',
    a: `Use ${hwid} when a new account fails on one PC and works on another. It does not fix an account-only restriction. Buy ${ugc} for that case instead.`,
    scopes: ['spoofer'],
  },
  {
    id: 'stickiness-vs-smooth',
    topic: 'scripts',
    icon: 'faqExternalLoader',
    q: 'Is stickiness the same control as smooth?',
    a: 'No. Smooth slows how fast the crosshair closes the gap. Stickiness holds the assist on the current operator a little longer when they strafe or leave the edge of the cone. Speed is a third slider: how fast the assist moves once a target is already inside that cone. Change one, then save the config.',
    scopes: ['rust-cheat'],
  },
  {
    id: 'visible-check',
    topic: 'scripts',
    icon: 'faqWhatIsEsp',
    q: 'Does visible check stop labels through cover?',
    a: 'No. Visible check only gates aim assist: it engages when the operator is in line of sight, not through solid cover. Skeleton, box, and name ESP are separate toggles and can still draw when that check is on.',
    scopes: ['rust-cheat'],
  },
  {
    id: 'ignore-knocked',
    topic: 'esp',
    icon: 'faqWhatIsEsp',
    q: 'Why does the assist stay on a downed operator?',
    a: 'Turn on Ignore Knocked so aim assist skips operators who are already down. Show Knocked is only a visual switch that keeps those bodies on the overlay. One does not turn the other off.',
    scopes: ['rust-cheat'],
  },
  {
    id: 'bone-and-filter',
    topic: 'scripts',
    icon: 'faqExternalLoader',
    q: 'What does bone selection do if the aim filter is already on?',
    a: 'The aimbot filter limits which models the assist may pick. Bone selection then chooses Closest, Head, Neck, or Chest as the preferred hitbox on those models. Set the filter first, then the bone.',
    scopes: ['rust-cheat'],
  },
  {
    id: 'controller-binds',
    topic: 'setup',
    icon: 'faqPlatforms',
    q: 'Can I put aim assist on a controller without a remap tool?',
    a: 'Yes. This build has two aim keys, and one of them can be a native controller bind. You do not install a separate remap app for that second key.',
    scopes: ['rust-cheat'],
  },
  {
    id: 'squad-read',
    topic: 'esp',
    icon: 'faqWhatIsEsp',
    q: 'How do I tell squads apart without more boxes?',
    a: 'Use team number, hero name, and view direction. A head circle marks the head hitbox. Snaplines run from your view to a player. Leave helmet, armor, and chest-bag levels off until you actually read them.',
    scopes: ['rust-cheat'],
  },
  {
    id: 'loot-price-floor',
    topic: 'esp',
    icon: 'faqWhatIsEsp',
    q: 'Loot names still cover every container. What do I cut first?',
    a: 'Set a minimum price so cheap items drop off. Keep player corpses, AI corpses, and computers as their own markers instead of turning the whole loot group off. Color, size, transparency, and brightness sit on the player visual group, not on this price floor.',
    scopes: ['rust-cheat'],
  },
  {
    id: 'scale-and-crosshair',
    topic: 'scripts',
    icon: 'faqExternalLoader',
    q: 'Do arm scale and weapon scale move the same model?',
    a: 'No. Arms scale offset moves the arms on X, Y, and Z. Weapon scale offset moves the gun on its own axes. Enable Crosshair only draws a fixed center mark. Third person is a separate hotkey and does not change either scale.',
    scopes: ['rust-cheat'],
  },
  {
    id: 'combat-mode',
    topic: 'scripts',
    icon: 'faqExternalLoader',
    q: 'Does combat mode turn aim assist off?',
    a: 'No. Combat mode hides the markers you pick: player, AI, item, dead container, or computer. Aim assist, camera width, and weapon options stay on until you toggle those groups yourself.',
    scopes: ['rust-cheat'],
  },
  {
    id: 'encryption-bypass',
    topic: 'setup',
    icon: 'faqStatus',
    q: 'What is the encryption bypass toggle?',
    a: 'It is a Misc menu option in this build. It is not a second product and it is not a hardware card. Leave it off unless the current note on rust-hacks.com says to use it for this client.',
    scopes: ['rust-cheat'],
  },
];

export function getLandingFaqs(): SiteFaqItem[] {
  return siteFaqs.filter((f) =>
    ['status', 'after-buy', 'ban-risk', 'hwid-ban-risk', 'platforms', 'license-move', 'products-page'].includes(f.id),
  );
}

export function getAllFaqs(): SiteFaqItem[] {
  return siteFaqs.filter((f) => f.topic !== 'all');
}

export const SITE_FAQ_SECTION_COPY = {
  eyebrow: 'All topics',
  title: 'Browse by category',
  subtitle: 'Plans, visuals, the loader, the spoofer, UGC, and setup.',
} as const;

export const SITE_FAQ_FILTER_TOPICS: FaqTopic[] = [
  'all',
  'plans',
  'esp',
  'scripts',
  'safety',
  'products',
  'blog',
  'setup',
];

export const CONTEXTUAL_FAQ_SECTION_COPY = {
  eyebrow: 'FAQ',
  title: 'Questions about this page',
  subtitle: 'Answers tied to what you are reading—visit the FAQ page for every topic.',
} as const;

export function faqFilterTopicsForItems(items: SiteFaqItem[]): FaqTopic[] {
  const present = new Set(items.map((item) => item.topic));
  const topics: FaqTopic[] = ['all'];
  for (const topic of SITE_FAQ_FILTER_TOPICS) {
    if (topic !== 'all' && present.has(topic)) topics.push(topic);
  }
  return topics;
}

export function getProductFaqs(slug: string, _kind: 'tier' | 'utility'): SiteFaqItem[] {
  const general = siteFaqs.filter((f) => !f.scopes);
  const scoped = siteFaqs.filter((f) => f.scopes?.includes(slug));
  const combined = [...scoped, ...general];
  const seen = new Set<string>();
  return combined.filter((item) => {
    if ((slug === 'spoofer' || slug === 'ugc') && item.id === 'status') return false;
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

const defaultBlogFaqs: SiteFaqItem[] = [
  {
    id: 'blog-default-1',
    topic: 'blog',
    icon: 'faqBlogDefault1',
    q: 'Are blog guides official product documentation?',
    a: `Articles explain workflows and link to ${cheats}. The feature list on that page is the checkout source of truth.`,
  },
  {
    id: 'blog-default-2',
    topic: 'blog',
    icon: 'faqBlogDefault2',
    q: 'Need help applying this guide?',
    a: 'Open support with your portal order ID and the article title. Include the exact loader text if something fails.',
  },
  {
    id: 'blog-default-3',
    topic: 'blog',
    icon: 'faqBlogDefault3',
    q: 'Will settings in this article work next patch?',
    a: 'Re-check after every Rust or ACE update. Reload a saved config instead of copying old slider values from a post.',
  },
];

const blogFaqsBySlug: Record<string, SiteFaqItem[]> = {
  'best-rust-hacks': [
    {
      id: 'best-rust-hacks-1',
      topic: 'blog',
      icon: 'faqBlogDefault1',
      q: 'What do hacks for rust cover on this menu?',
      a: 'Hacks for rust on this page means one Windows loader: visual labels, aim options, weapon options, misc view and movement toggles, and config sliders. It is not a set of separate tier keys.',
    },
    {
      id: 'best-rust-hacks-2',
      topic: 'blog',
      icon: 'faqBlogDefault2',
      q: 'Do hacks for rust include a second product?',
      a: 'No. Hacks for rust here are the hack loader only. Hardware-profile tools and account appeal templates are different product pages and different keys.',
    },
    {
      id: 'best-rust-hacks-3',
      topic: 'blog',
      icon: 'faqBlogDefault3',
      q: 'How should I compare hacks for rust before paying?',
      a: 'Read the feature groups on the product page, then compare 30-day access at $35 with lifetime access at $150. The longer key does not add modules.',
    },
  ],
  'esp-for-rust': [
    {
      id: 'esp-for-rust-1',
      topic: 'blog',
      icon: 'faqBlogDefault1',
      q: 'What is a rust esp hack on this loader?',
      a: 'A rust esp hack here is the collectables, dropped-item, and vehicle label set: wood, berries, hemp, food, dropped items, and vehicles, each with its own toggle, color, or distance slider.',
    },
    {
      id: 'esp-for-rust-2',
      topic: 'blog',
      icon: 'faqBlogDefault2',
      q: 'Does a rust esp hack show animals or traps?',
      a: 'Not in this article’s scope. A rust esp hack for animals and a rust esp hack for traps live in their own guides. This page stays on collectables, items, and vehicles.',
    },
    {
      id: 'esp-for-rust-3',
      topic: 'blog',
      icon: 'faqBlogDefault3',
      q: 'Can I turn a rust esp hack group off during a fight?',
      a: 'Yes. Each collectables, dropped-item, and vehicle group has its own toggle. Turn a group off when the labels crowd the screen, then turn it back on when you need that layer again.',
    },
  ],
  'hwid-spoofer-rust': [
    {
      id: 'hwid-spoofer-rust-1',
      topic: 'blog',
      icon: 'faqBlogDefault1',
      q: 'What is a rust hwid ban?',
      a: 'A rust hwid ban is a hardware-style flag tied to the PC, not only the game login. A new account on that same unchanged machine can still fail while the same account works on a different PC.',
    },
    {
      id: 'hwid-spoofer-rust-2',
      topic: 'blog',
      icon: 'faqBlogDefault2',
      q: 'What is an hwid in this context?',
      a: 'What is an hwid: it is the set of identifiers a PC presents, such as disk, network, or GPU-related values. A hardware tool tries to present a different fingerprint. It does not delete an account penalty.',
    },
    {
      id: 'hwid-spoofer-rust-3',
      topic: 'blog',
      icon: 'faqBlogDefault3',
      q: 'Does a rust hwid ban get cleared by an appeal template?',
      a: 'No. A rust hwid ban follows the machine. Appeal templates are for the account case. They are different problems and different products.',
    },
  ],
  'how-to-get-unbanned-from-rust': [
    {
      id: 'how-to-get-unbanned-1',
      topic: 'blog',
      icon: 'faqBlogDefault1',
      q: 'Is a rust unban guaranteed?',
      a: 'No. A rust unban is not something this site can force. The appeal workspace organizes evidence, timing, and follow-up. The platform still decides the case.',
    },
    {
      id: 'how-to-get-unbanned-2',
      topic: 'blog',
      icon: 'faqBlogDefault2',
      q: 'What belongs in a rust ban fix plan?',
      a: 'A rust ban fix plan is a checklist: order ID, account details, restriction screenshots, and a timeline. It does not rotate hardware identifiers and it does not add aim or visual modules.',
    },
    {
      id: 'how-to-get-unbanned-3',
      topic: 'blog',
      icon: 'faqBlogDefault3',
      q: 'When is a rust unban the wrong product?',
      a: 'When every new account fails on one PC and works on another, that pattern is a hardware flag, not a rust unban case. Read the hardware guide before you buy an appeal workspace.',
    },
  ],
  'aimbot-for-rust': [
    {
      id: 'aimbot-for-rust-1',
      topic: 'blog',
      icon: 'faqBlogDefault1',
      q: 'What does a rust aimbot hack include?',
      a: 'A rust aimbot hack on this menu is a toggle, an aimbot FOV slider, an FOV circle, a smoothing slider, a custom aim bone, and a custom aim key. Those are the aim controls. Nothing else on this page is part of that list.',
    },
    {
      id: 'aimbot-for-rust-2',
      topic: 'blog',
      icon: 'faqBlogDefault2',
      q: 'Does a rust aimbot hack remove recoil?',
      a: 'No. A rust aimbot hack does not include weapon options. Recoil, spread, and sway live on the weapon-options guide, not in the aim group.',
    },
    {
      id: 'aimbot-for-rust-3',
      topic: 'blog',
      icon: 'faqBlogDefault3',
      q: 'Should I change every rust aimbot hack slider at once?',
      a: 'No. Change one control, save the config, and test. A wide FOV plus low smoothing is a different feel from a narrow FOV plus higher smoothing.',
    },
  ],
  'rust-hack-features': [
    {
      id: 'rust-hack-features-1',
      topic: 'blog',
      icon: 'faqBlogDefault1',
      q: 'Where is the rust hack menu for config?',
      a: 'The rust hack menu config group holds the watermark toggle, font slider, icon size, corner size, box width, skeleton size, game width, update FPS, and renderer FPS. It does not add aim or visual modules.',
    },
    {
      id: 'rust-hack-features-2',
      topic: 'blog',
      icon: 'faqBlogDefault2',
      q: 'What does a rust hack config save?',
      a: 'A rust hack config stores the slider values you set in that group so the next launch can reload them. It does not freeze the game client or the EAC build.',
    },
    {
      id: 'rust-hack-features-3',
      topic: 'blog',
      icon: 'faqBlogDefault3',
      q: 'Will a rust hack menu layout survive a patch?',
      a: 'Not always. After a Rust or EAC update, reopen the status note and reload the rust hack config instead of copying old slider values from a screenshot.',
    },
  ],
  'rust-hack-download': [
    {
      id: 'rust-hack-download-1',
      topic: 'blog',
      icon: 'faqBlogDefault1',
      q: 'What is the rust hack setup order?',
      a: 'Rust hack setup is: confirm the product page, finish checkout, open the portal from that order, read the portal note, then launch. The portal file is the download. A search result is not.',
    },
    {
      id: 'rust-hack-download-2',
      topic: 'blog',
      icon: 'faqBlogDefault2',
      q: 'Can I skip rust hack setup and use an old file?',
      a: 'No. Rust hack setup starts from the current portal file. An older zip from a friend can be a stale build after the client moves.',
    },
    {
      id: 'rust-hack-download-3',
      topic: 'blog',
      icon: 'faqBlogDefault3',
      q: 'What should a rust hack setup ticket include?',
      a: 'The portal order ID and the exact loader text. A rust hack setup question without those two lines is hard to match to an order.',
    },
  ],
  'rust-animal-esp-hack': [
    {
      id: 'rust-animal-esp-1',
      topic: 'blog',
      icon: 'faqBlogDefault1',
      q: 'What is rust wolf esp?',
      a: 'Rust wolf esp is the wolf toggle inside animal ESP, with the shared animal color and animal distance slider. It labels wolves. It does not label players, nodes, or traps.',
    },
    {
      id: 'rust-animal-esp-2',
      topic: 'blog',
      icon: 'faqBlogDefault2',
      q: 'What is rust bear esp?',
      a: 'Rust bear esp is the bear toggle, and polar bear is its own toggle beside it. Both sit under animal ESP with boar, deer, horse, and chicken.',
    },
    {
      id: 'rust-animal-esp-3',
      topic: 'blog',
      icon: 'faqBlogDefault3',
      q: 'Can I use rust wolf esp without rust bear esp?',
      a: 'Yes. Each animal has its own toggle. Leave rust bear esp off if you only want wolves, or the other way around, and set one distance for the animal group.',
    },
  ],
  'rust-trap-esp-hack': [
    {
      id: 'rust-trap-esp-1',
      topic: 'blog',
      icon: 'faqBlogDefault1',
      q: 'What is rust auto turret esp?',
      a: 'Rust auto turret esp is the auto turret toggle inside the trap group, with the shared trap color and trap distance slider. It marks auto turrets. It does not mark animals or dropped guns.',
    },
    {
      id: 'rust-trap-esp-2',
      topic: 'blog',
      icon: 'faqBlogDefault2',
      q: 'What is rust landmine esp?',
      a: 'Rust landmine esp is the land mines toggle in that same trap group, next to shotgun traps, snap traps, flame turrets, and SAM sites.',
    },
    {
      id: 'rust-trap-esp-3',
      topic: 'blog',
      icon: 'faqBlogDefault3',
      q: 'Should rust auto turret esp and rust landmine esp stay on together?',
      a: 'Only if you want both layers. Turn rust landmine esp on when you are moving through a base approach, and rust auto turret esp when turrets are the thing you need to see. Each one can be off on its own.',
    },
  ],
  'rust-no-recoil-hack': [
    {
      id: 'rust-no-recoil-1',
      topic: 'blog',
      icon: 'faqBlogDefault1',
      q: 'What is a rust no spread hack?',
      a: 'A rust no spread hack is the No Spread toggle in weapon options. It sits beside No Recoil, No Sway, and No Bob. It is not an aimbot control.',
    },
    {
      id: 'rust-no-recoil-2',
      topic: 'blog',
      icon: 'faqBlogDefault2',
      q: 'What is a rust no sway hack?',
      a: 'A rust no sway hack is the No Sway toggle in the same weapon group. Yaw and pitch recoil are separate toggles from sway.',
    },
    {
      id: 'rust-no-recoil-3',
      topic: 'blog',
      icon: 'faqBlogDefault3',
      q: 'Does a rust no spread hack include peek or bow toggles?',
      a: 'Those are other rows in weapon options: Instant Bow, Instant Eoka, Instant Compound, peek keys, and the neck keys. A rust no spread hack is only the spread row. Turn on only the rows you mean to test.',
    },
  ],
  'rust-fov-changer-hack': [
    {
      id: 'rust-fov-changer-1',
      topic: 'blog',
      icon: 'faqBlogDefault1',
      q: 'What is a rust fullbright hack?',
      a: 'A rust fullbright hack is the Fullbright toggle in misc options. Bright Night is a separate toggle. Neither one is the FOV changer, and neither one is an aim control.',
    },
    {
      id: 'rust-fov-changer-2',
      topic: 'blog',
      icon: 'faqBlogDefault2',
      q: 'Does a rust fullbright hack change movement?',
      a: 'No. Movement rows are their own toggles: Spiderman, Infinite Jump, Low Gravity, Climb Assist, No Fall Damage, and Flyhack. A rust fullbright hack only changes the light view.',
    },
    {
      id: 'rust-fov-changer-3',
      topic: 'blog',
      icon: 'faqBlogDefault3',
      q: 'Where is the FOV value next to a rust fullbright hack?',
      a: 'FOV Changer and the FOV value slider are separate from Fullbright. Zoom and Zoom Key are separate again. Set the view row you want, then leave the others off until you know you need them.',
    },
  ],
};

export function getBlogFaqs(_tag: string, slug: string): SiteFaqItem[] {
  return blogFaqsBySlug[slug] ?? defaultBlogFaqs;
}

export const compareRows = [
  { feature: 'Aimbot options', icon: 'comparePlayerEsp' as const, lite: true, pro: true, elite: true },
  { feature: 'Player ESP', icon: 'compareWardLocator' as const, lite: true, pro: true, elite: true },
  { feature: 'Loot filter', icon: 'compareRuneTimer' as const, lite: true, pro: true, elite: true },
  { feature: 'Weapon options', icon: 'compareZoomHack' as const, lite: true, pro: true, elite: true },
  { feature: 'Camera FOV', icon: 'compareStreamproof' as const, lite: true, pro: true, elite: true },
  { feature: 'Config save', icon: 'compareCloudBackup' as const, lite: true, pro: true, elite: true },
];
