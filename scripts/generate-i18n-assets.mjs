import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const i18nDir = path.join(root, 'src', 'i18n');
const contentBlogDir = path.join(root, 'src', 'content', 'blog', 'en');
const seoDir = path.join(i18nDir, 'seo');

const localeCodes = ['en', 'fr', 'tr', 'pt-br', 'es', 'de', 'pl', 'th'];

const extraStrings = {
  language: {
    label: 'Language',
    selectAria: 'Select site language',
  },
  exploreSection: {
    eyebrow: 'Explore',
    title: 'Everything on the site, one click',
    titleAccent: 'away',
    subtitle: 'Jump to products, patch notes, guides, and help without hunting the menu.',
    badgeProduct: 'PRODUCT',
    badgeActive: 'Active',
    cards: {
      cheats: {
        title: 'Rust Hacks',
        desc: 'Aimbot, ESP, loot, and weapon options for Windows PC.',
      },
      spoofer: {
        title: 'HWID Spoofer',
        desc: 'Hardware profile rotation after a machine flag.',
      },
      ugc: {
        title: 'UGC Account Recovery',
        desc: 'Appeal workspace for locked gaming accounts.',
      },
      plans: {
        title: 'Plans',
        desc: 'Compare 1 Month $35 and Lifetime $150.',
      },
      features: {
        title: 'Features',
        desc: '15+ modules: aimbot, ESP, loot, and weapon options.',
      },
      status: {
        title: 'Status',
        desc: 'Patch notes and portal update reminders.',
      },
      faq: {
        title: 'FAQ',
        desc: 'Plans, setup, ACE risk, and products.',
      },
      support: {
        title: 'Support',
        desc: 'Loader, checkout, and portal help.',
      },
      blog: {
        title: 'Blog',
        desc: 'Aim, ESP, loot, and patch-day guides.',
      },
      forum: {
        title: 'Forum',
        desc: 'Threads with marked developer replies.',
      },
    },
  },
  pricing: {
    checkout: 'Checkout',
    purchaseOption: 'Purchase option',
    selectSubscription: 'Select subscription',
    bestValue: 'Best value',
    savePrefix: 'Save',
    total: 'Total',
    buyNow: 'Buy now',
    oneMonth: '1 Month',
    lifetime: 'Lifetime',
    mostPopular: 'Most Popular',
    plusMore: '+N more',
  },
  notFound: {
    code: '404',
    title: 'Page not found',
    description:
      'That URL does not exist or may have moved. Head back to the homepage or browse the products.',
    metaDescription: 'The page you requested could not be found on rust-hacks.com.',
    metaTitleSuffix: 'Page not found',
    backHome: 'Back to home',
    viewProducts: 'View products',
    openForum: 'Open the forum',
  },
  status: {
    eyebrow: 'Patch notes',
    title: 'Rust module status',
    subtitle: 'Check after every Anti-Cheat Expert or client update before you launch.',
    breadcrumb: 'Status',
    aceReminderLabel: 'ACE reminder',
    recentTitle: 'Recent updates',
    activeLinePrefix: 'Last checked',
  },
  forum: {
    title: 'Rust community forum',
    subtitle: 'Setup, aim, ESP, and plan questions with marked developer replies.',
    breadcrumb: 'Forum',
  },
  readingTools: {
    copyLink: 'Copy link',
    backToTop: 'Back to top',
    copied: 'Copied',
  },
  blogArticle: {
    viewProducts: 'View products',
    moreArticles: 'More articles',
    imagePlaceholder: 'Image placeholder',
    breadcrumbBlog: 'Blog',
  },
  breadcrumbs: {
    home: 'Home',
    products: 'Products',
    blog: 'Blog',
    forum: 'Forum',
    faq: 'FAQ',
    status: 'Status',
  },
  faqPage: {
    eyebrow: 'Help center',
    title: 'FAQ for cheats, products & guides',
    subtitle:
      'Plans, aim and ESP options, the HWID spoofer, UGC recovery, and what to check after an ACE update.',
    schemaName: 'FAQ — Rust Hacks & Products',
    schemaDescription:
      'Answers about Rust Hacks, the HWID spoofer, UGC recovery, ACE risk, and checkout on rust-hacks.com.',
  },
  siteFaqSection: {
    allTopicsEyebrow: 'All topics',
    allTopicsTitle: 'Browse by category',
    allTopicsSubtitle: 'Plans, visuals, the loader, the spoofer, UGC, and setup.',
    contextualEyebrow: 'FAQ',
    contextualTitle: 'Questions about this page',
    contextualSubtitle: 'Answers tied to what you are reading—visit the FAQ page for every topic.',
  },
  footer: {
    resourceLinks: [
      { label: 'Blog archive', ariaLabel: 'Blog' },
      { label: 'Rust Hacks', ariaLabel: 'Rust Hacks' },
      { label: 'Products & utilities', ariaLabel: 'Products' },
    ],
  },
  catalog: {
    viewDetails: 'View details',
    buyNow: 'Buy now',
  },
};

async function main() {
  const { en } = await import('../src/i18n/en.ts');
  const base = structuredClone(en);
  const merged = { ...base, ...extraStrings };
  if (!merged.footer.resourceLinks) {
    merged.footer = { ...merged.footer, resourceLinks: extraStrings.footer.resourceLinks };
  } else {
    merged.footer.resourceLinks = extraStrings.footer.resourceLinks;
  }

  fs.mkdirSync(seoDir, { recursive: true });
  fs.mkdirSync(contentBlogDir, { recursive: true });

  const enJsonPath = path.join(i18nDir, 'en.json');
  fs.writeFileSync(enJsonPath, `${JSON.stringify(merged, null, 2)}\n`, 'utf8');

  for (const code of localeCodes) {
    if (code === 'en') continue;
    fs.writeFileSync(path.join(i18nDir, `${code}.json`), `${JSON.stringify(merged, null, 2)}\n`, 'utf8');
  }

  const pageSeo = (await import('../src/config/pageSeo.ts')).PAGE_SEO;
  const seoEn = {
    site: {
      title: merged.site.title,
      description: merged.site.description,
    },
    pages: pageSeo,
  };
  fs.writeFileSync(path.join(seoDir, 'en.json'), `${JSON.stringify(seoEn, null, 2)}\n`, 'utf8');
  for (const code of localeCodes) {
    if (code === 'en') continue;
    fs.writeFileSync(path.join(seoDir, `${code}.json`), `${JSON.stringify(seoEn, null, 2)}\n`, 'utf8');
  }

  const { blogPosts } = await import('../src/data/blog/posts.ts');
  for (const post of blogPosts) {
    const { body, ...meta } = post;
    const payload = { ...meta, body };
    const md = `---\n${JSON.stringify(payload, null, 2)}\n---\n`;
    fs.writeFileSync(path.join(contentBlogDir, `${post.slug}.md`), md, 'utf8');
  }

  console.log(`Wrote ${localeCodes.length} locale JSON files, SEO bundles, and ${blogPosts.length} blog posts.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
