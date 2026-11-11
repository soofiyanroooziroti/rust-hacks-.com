import type { IconName } from '../components/icons/types';

export interface SiteConfig {
  name: string;
  domain: string;
  title: string;
  description: string;
  discord: string;
}

export interface NavLink {
  href: string;
  label: string;
  ariaLabel?: string;
  /** When the target section exists on the current page, scroll instead of navigating. */
  scrollTarget?: string;
}

export interface FeatureItem {
  title: string;
  subtitle: string;
  desc: string;
  tags: string[];
  bullets?: string[];
  /** Tailwind classes: sm:col-span-2 stack; lg: explicit col/row start + span */
  bento?: string;
}

export interface TierCard {
  badge: string;
  tier: string;
  name: string;
  title: string;
  desc: string;
  features: string[];
  more: number;
  href: string;
  variant: 'essential' | 'popular' | 'limited';
}

export interface ProductCard {
  badge: string;
  category: string;
  title: string;
  subtitle: string;
  desc: string;
  features: string[];
  more: number;
  href: string;
}

export interface BlogPost {
  tag: string;
  title: string;
  slug: string;
  image: string;
  imageAlt?: string;
  desc: string;
  date: string;
  readTime: string;
}

export interface FaqItem {
  num: string;
  q: string;
  a: string;
}

export interface StepItem {
  step: string;
  title: string;
  desc: string;
}

export interface ToolkitItem {
  num: string;
  label: string;
  title: string;
  desc: string;
}

export interface WorkflowItem {
  num: string;
  phase: string;
  title: string;
  desc: string;
}

export interface WhyCompareRow {
  title: string;
  desc: string;
}

export interface WhyMetric {
  value: string;
  title: string;
  desc: string;
}

export interface Translations {
  site: SiteConfig;
  nav: NavLink[];
  headerNavLabels: Record<
    'home' | 'products' | 'features' | 'blog' | 'forum' | 'faq' | 'support',
    string
  >;
  navMore: string;
  navShort: Record<
    'home' | 'products' | 'features' | 'blog' | 'forum' | 'faq' | 'support',
    string
  >;
  hero: {
    status: string;
    eyebrow: string;
    titleLine1: string;
    titleLine2: string;
    subtitle: string;
    ctaPrimary: string;
    ctaDiscord: string;
    modesLabel: string;
    modes: string[];
    metrics: { label: string; strong: string }[];
  };
  features: {
    eyebrow: string;
    title: string;
    subtitle: string;
    items: FeatureItem[];
  };
  whyUs: {
    eyebrow: string;
    title: string;
    subtitle: string;
    usLabel: string;
    otherLabel: string;
    rows: WhyCompareRow[];
    metrics: WhyMetric[];
  };
  setup: {
    eyebrow: string;
    titleLead: string;
    titleHighlight: string;
    intro: string;
    ctaPrimary: string;
    ctaSecondary: string;
    ctaPrimaryHref: string;
    ctaSecondaryHref: string;
    statusStrip: {
      aceStatusCta: string;
      aceStatusHref: string;
      perks: { icon: IconName; label: string }[];
    };
    steps: StepItem[];
  };
  compatibility: {
    eyebrow: string;
    title: string;
    subtitle: string;
    items: string[];
  };
  cheats: {
    eyebrow: string;
    title: string;
    subtitle: string;
    viewAll: string;
    explore: string;
    items: TierCard[];
  };
  products: {
    eyebrow: string;
    title: string;
    subtitle: string;
    viewAll: string;
    get: string;
    explore: string;
    items: ProductCard[];
  };
  blog: {
    eyebrow: string;
    title: string;
    subtitle: string;
    latestTitle: string;
    latestSubtitle: string;
    filterAll: string;
    sortLabel: string;
    sortNewest: string;
    sortOldest: string;
    sortShortRead: string;
    sortLongRead: string;
    emptyFilter: string;
    emptyCatalog: string;
    viewAll: string;
    read: string;
    items: BlogPost[];
  };
  toolkit: {
    eyebrow: string;
    title: string;
    subtitle: string;
    items: ToolkitItem[];
  };
  workflow: {
    eyebrow: string;
    badge: string;
    titleBefore: string;
    titleHighlight: string;
    titleAfter?: string;
    subtitle: string;
    ctaLabel: string;
    ctaHref: string;
    ctaSecondary: string;
    ctaSecondaryHref: string;
    items: WorkflowItem[];
  };
  fieldNotes: {
    eyebrow: string;
    title: string;
    items: { num: string; title: string; desc: string }[];
  };
  support: {
    eyebrow: string;
    title: string;
    subtitle: string;
    channels: {
      icon: string;
      title: string;
      desc: string;
      linkLabel: string;
      href: string;
    }[];
    ticketTitle: string;
    ticketItems: { title: string; desc: string }[];
  };
  faq: {
    eyebrow: string;
    title: string;
    subtitle: string;
    items: FaqItem[];
  };
  footer: {
    tagline: string;
    explore: string;
    exploreLinks: NavLink[];
    support: string;
    legal: string;
    moreSites: string;
    privacy: string;
    terms: string;
    about: string;
    resourceLinks?: { label: string; ariaLabel: string; href?: string }[];
  };
  legalPages: {
    about: {
      title: string;
      description: string;
      sections: { heading: string; paragraphs: string[] }[];
    };
    privacy: {
      title: string;
      description: string;
      sections: { heading: string; paragraphs: string[] }[];
    };
    terms: {
      title: string;
      description: string;
      sections: { heading: string; paragraphs: string[] }[];
    };
    support: {
      title: string;
      description: string;
    };
  };
  sectionSearch?: {
    blogHeading: string;
    supportHeading?: string;
  };
  ui: {
    skipLink: string;
    browseCheats: string;
    browseCheatsMobile: string;
    homeAria: string;
    checkoutAria: string;
    discordAria: string;
    menuOpen: string;
    menuClose: string;
    themeLight: string;
    themeDark: string;
    searchPlaceholder?: string;
    searchEmpty?: string;
    searchNoResults?: string;
    searchCloseAria?: string;
    searchTitle?: string;
    searchOpenAria?: string;
  };
  language?: { label: string; selectAria: string };
  exploreSection?: Record<string, unknown>;
  pricing?: Record<string, string>;
  notFound?: Record<string, string>;
  status?: Record<string, string>;
  forum?: Record<string, string>;
  readingTools?: Record<string, string>;
  blogArticle?: Record<string, string>;
  breadcrumbs?: Record<string, string>;
  faqPage?: Record<string, string>;
  siteFaqSection?: Record<string, string>;
  catalog?: Record<string, string>;
}
