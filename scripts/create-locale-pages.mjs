import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const pages = path.join(root, 'src', 'pages', '[locale]');

const files = {
  'index.astro': `---
import { localeOnlyPaths } from '../../i18n/paths';
export function getStaticPaths() { return localeOnlyPaths(); }
import '../../pages/index.astro';
---
`,
};

// Simpler: thin re-exports won't work in Astro. Write proper wrappers.
const wrappers = {
  'index.astro': `---
import { localeOnlyPaths } from '../../i18n/paths';
export function getStaticPaths() { return localeOnlyPaths(); }
import BaseLayout from '../../layouts/BaseLayout.astro';
import HeroSection from '../../components/HeroSection.astro';
import FeaturesSection from '../../components/FeaturesSection.astro';
import WhySetupSection from '../../components/WhySetupSection.astro';
import ProductsSection from '../../components/ProductsSection.astro';
import WorkflowSection from '../../components/WorkflowSection.astro';
import ExploreSection from '../../components/ExploreSection.astro';
import ContentSections from '../../components/ContentSections.astro';
import { resolvePageSeo } from '../../config/seo';
import { faqPageSchema, organizationSchema, websiteSchema } from '../../utils/schema';
import { getLandingFaqs } from '../../data/faq';
import { heroSlides } from '../../data/products';
import { heroLcpPreload } from '../../utils/responsiveImage';
const locale = Astro.params.locale!;
const seo = resolvePageSeo('/', locale);
const homeFaqs = getLandingFaqs();
const heroLcp = heroLcpPreload(heroSlides[0]!.src);
---
<BaseLayout title={seo.title} description={seo.description} jsonLd={[websiteSchema(), organizationSchema(), faqPageSchema(homeFaqs.map((f, i) => ({ num: String(i + 1).padStart(2, '0'), q: f.q, a: f.a.replace(/<[^>]+>/g, '') })))]}>
  <link slot="head" rel="preload" as="image" href={heroLcp.href} imagesrcset={heroLcp.srcset} imagesizes={heroLcp.sizes} type="image/webp" fetchpriority="high" />
  <HeroSection /><FeaturesSection /><ProductsSection /><WhySetupSection /><WorkflowSection /><ExploreSection /><ContentSections />
</BaseLayout>`,
  'faq.astro': `---
import { localeOnlyPaths } from '../../i18n/paths';
export function getStaticPaths() { return localeOnlyPaths(); }
import '../../pages/faq.astro';
---
`,
};

fs.mkdirSync(pages, { recursive: true });
for (const [name, body] of Object.entries(wrappers)) {
  if (name === 'faq.astro') continue; // faq needs locale-aware duplicate
  fs.writeFileSync(path.join(pages, name), body);
}

console.log('Created locale page stubs');
