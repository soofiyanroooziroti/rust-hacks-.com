import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { en } from '../src/i18n/en.ts';
import { PAGE_SEO } from '../src/config/pageSeo.ts';
import { siteFaqs } from '../src/data/faq.ts';
import { blogPosts } from '../src/data/blog/posts.ts';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const i18nDir = path.join(root, 'src', 'i18n');
const contentBlogDir = path.join(root, 'src', 'content', 'blog', 'en');
const seoDir = path.join(i18nDir, 'seo');
const localeCodes = ['en', 'fr', 'tr', 'pt-br', 'es', 'de', 'pl', 'th'];
const exportEnOnly = process.argv.includes('--en-only');

const extraStrings = {
  language: { label: 'Language', selectAria: 'Select site language' },
  exploreSection: {
    eyebrow: 'Explore',
    title: 'Everything on the site, one click',
    titleAccent: 'away',
    subtitle: 'Jump to products, patch notes, guides, and help without hunting the menu.',
    badgeProduct: 'PRODUCT',
    badgeActive: 'Active',
    cards: {
      cheats: { title: 'Rust Hacks', desc: 'Aimbot, ESP, loot, and chams for Windows PC.' },
      spoofer: { title: 'HWID Spoofer', desc: 'Hardware profile rotation after a machine flag.' },
      ugc: { title: 'UGC Account Recovery', desc: 'Appeal workspace for locked gaming accounts.' },
      plans: { title: 'Plans', desc: 'Compare 1 Month $35 and Lifetime $150.' },
      features: { title: 'Features', desc: '15+ modules: aimbot, ESP, loot, and chams.' },
      status: { title: 'Status', desc: 'Patch notes and portal update reminders.' },
      faq: { title: 'FAQ', desc: 'Plans, setup, ACE risk, and products.' },
      support: { title: 'Support', desc: 'Loader, checkout, and portal help.' },
      blog: { title: 'Blog', desc: 'Aim, ESP, loot, and patch-day guides.' },
      forum: { title: 'Forum', desc: 'Threads with marked developer replies.' },
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
    monthlySuffix: ' monthly',
    lifetimeSuffix: ' lifetime',
    saveAmount: 'Save ${amount}',
    selectPlanAria: 'Select plan length',
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
    storeLineup: 'Store lineup',
    latestLabel: 'Latest',
  },
  forum: {
    eyebrow: 'Community',
    title: 'Rust community forum',
    subtitle: 'Setup, aim, ESP, and plan questions with marked developer replies.',
    breadcrumb: 'Forum',
    postsAria: 'Community posts',
    sortAria: 'Post sorting',
    searchPlaceholder: 'Search discussions',
    searchAria: 'Search discussions',
    voteAria: 'Discussion voting',
    fromGuide: 'From the guide:',
    comments: 'comments',
    readDiscussion: 'Read discussion',
    readGuide: 'Read the guide',
    basedOn: 'Based on:',
    paginationAria: 'Discussion pages',
    previousPage: 'Previous',
    nextPage: 'Next',
    exploreGuides: 'Explore the guides',
    sortPopular: 'Popular',
    sortLatest: 'Latest',
    sortTop: 'Most discussed',
    filterAria: 'Filter discussions by topic',
    allTopics: 'All topics',
    discussionOne: 'discussion',
    discussionMany: 'discussions',
    emptyFilter: 'No discussions match. Try another search or topic.',
    previous: 'Previous',
    next: 'Next',
    sidebarAboutTitle: 'Rust community',
    sidebarAboutCopy:
      'Questions about the cheat, the HWID spoofer, and UGC recovery. Developer replies stay on the thread.',
    sidebarTopics: 'topics',
    sidebarExploreGuides: 'Explore all guides',
    sidebarCommunities: 'Communities',
    sidebarBrowseQa: 'Browse related threads',
    sidebarBrowseAll: 'Browse all communities',
    sidebarGuidelines: 'Community guidelines',
    guideline1: 'Keep it friendly and constructive',
    guideline2: 'Stay on topic and add context',
    guideline3: 'Mark spoilers and sensitive content',
    sidebarReadGuidelines: 'Read the full guidelines',
    sidebarFootAbout: 'About · Guidelines · Privacy · Terms',
    upvoteAria: 'Upvote this discussion',
    downvoteUnavailable: 'Downvoting is unavailable',
    showingRange: 'Showing {from}–{to} of {total}',
    zeroDiscussions: '0 discussions',
    developerFlair: 'Developer',
    points: 'points',
    previewDiscussion: 'Preview discussion',
    postingUnavailable: 'Posting and voting are unavailable here',
    commentsTitle: 'Comments',
    commentsSubtitle: 'Developer replies are marked',
    detailInTopic: 'in this topic',
    detailBrowse: 'Browse discussions',
    detailMoreTitle: 'More discussions',
    detailViewAll: 'View all discussions',
  },
  readingTools: { copyLink: 'Copy link', backToTop: 'Back to top', copied: 'Copied' },
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
    mostPopular: 'Most Popular',
    popular: 'Popular',
    plusMore: '+{count} more',
    monthlySuffix: ' monthly',
    lifetimeSuffix: ' lifetime',
    saveAmount: 'Save ${amount}',
    selectPlanAria: 'Select plan length',
    utilityLabel: 'Utility',
  },
  blogSidebar: {
    ariaLabel: 'Article sidebar',
    inThisArticle: 'In this article',
    relatedGuides: 'Related guides',
    ourProducts: 'Our products',
    readingTools: 'Reading tools',
    productCheats: 'Rust Hacks',
    allProducts: 'All products',
    hwidSpoofer: 'HWID Spoofer',
    ugcRecovery: 'UGC Account recovery',
    tocAria: 'Table of contents',
  },
};

const faqFilterTopics = {
  all: 'All',
  plans: 'Plans',
  esp: 'Map hack / ESP',
  scripts: 'Scripts',
  safety: 'Safety',
  products: 'Products',
  blog: 'Blog',
  setup: 'Setup',
};

const blogExtras = {
  minRead: 'min read',
  filterByTopicAria: 'Filter articles by topic',
  continueReadingAria: 'Continue reading',
  tagLabels: {
    Review: 'Review',
    Install: 'Install',
    Safety: 'Safety',
    Plans: 'Plans',
    Aim: 'Aim',
    ESP: 'ESP',
    Loot: 'Loot',
    Visuals: 'Visuals',
    Camera: 'Camera',
  },
};

const merged = {
  ...structuredClone(en),
  ...extraStrings,
  blog: { ...structuredClone(en).blog, ...blogExtras },
  faq: {
    ...structuredClone(en).faq,
    filterTopics: faqFilterTopics,
    items: siteFaqs,
  },
  footer: {
    ...en.footer,
    resourceLinks: extraStrings.footer.resourceLinks,
  },
};

fs.mkdirSync(seoDir, { recursive: true });
fs.mkdirSync(contentBlogDir, { recursive: true });

fs.writeFileSync(path.join(i18nDir, 'en.json'), `${JSON.stringify(merged, null, 2)}\n`);

const seoEn = {
  site: { title: merged.site.title, description: merged.site.description },
  pages: PAGE_SEO,
};
fs.writeFileSync(path.join(seoDir, 'en.json'), `${JSON.stringify(seoEn, null, 2)}\n`);

if (exportEnOnly) {
  for (const post of blogPosts) {
    const { body, ...meta } = post;
    fs.writeFileSync(
      path.join(contentBlogDir, `${post.slug}.md`),
      `---\n${JSON.stringify({ ...meta, body }, null, 2)}\n---\n`,
    );
  }
  console.log(`export-en: en.json, seo/en.json, ${blogPosts.length} blog/en/*.md`);
} else {
  for (const code of localeCodes) {
    if (code === 'en') continue;
    fs.writeFileSync(path.join(i18nDir, `${code}.json`), `${JSON.stringify(merged, null, 2)}\n`);
  }
  for (const code of localeCodes) {
    if (code === 'en') continue;
    fs.writeFileSync(path.join(seoDir, `${code}.json`), `${JSON.stringify(seoEn, null, 2)}\n`);
  }
  for (const post of blogPosts) {
    const { body, ...meta } = post;
    fs.writeFileSync(
      path.join(contentBlogDir, `${post.slug}.md`),
      `---\n${JSON.stringify({ ...meta, body }, null, 2)}\n---\n`,
    );
  }
  console.log(`Generated i18n + ${blogPosts.length} blog files`);
}
