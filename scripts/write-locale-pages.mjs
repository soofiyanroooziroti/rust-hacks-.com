import fs from 'node:fs';
import path from 'node:path';

const base = path.join(process.cwd(), 'src', 'pages', '[locale]');

function write(rel, body) {
  const file = path.join(base, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, body, 'utf8');
}

const pathsBlock = `import { localeOnlyPaths } from '../../i18n/paths';

export function getStaticPaths() {
  return localeOnlyPaths();
}
`;

write(
  'index.astro',
  `${pathsBlock}
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

<BaseLayout
  title={seo.title}
  description={seo.description}
  jsonLd={[websiteSchema(), organizationSchema(), faqPageSchema(homeFaqs.map((f, i) => ({ num: String(i + 1).padStart(2, '0'), q: f.q, a: f.a.replace(/<[^>]+>/g, '') })))]}
>
  <link
    slot="head"
    rel="preload"
    as="image"
    href={heroLcp.href}
    imagesrcset={heroLcp.srcset}
    imagesizes={heroLcp.sizes}
    type="image/webp"
    fetchpriority="high"
  />
  <HeroSection />
  <FeaturesSection />
  <ProductsSection />
  <WhySetupSection />
  <WorkflowSection />
  <ExploreSection />
  <ContentSections />
</BaseLayout>
`,
);

const legalTemplate = (pageKey, pathKey, breadcrumb) => `${pathsBlock}
import BaseLayout from '../../layouts/BaseLayout.astro';
import LegalPage from '../../components/LegalPage.astro';
import { getTranslations } from '../../i18n';
import { resolvePageSeo } from '../../config/seo';
import { breadcrumbSchema, organizationSchema, webPageSchema } from '../../utils/schema';
import { localizedPath } from '../../utils/path';

const locale = Astro.params.locale!;
const t = getTranslations(locale);
const seo = resolvePageSeo('${pathKey}', locale);
const content = t.legalPages.${pageKey};
---

<BaseLayout
  title={seo.title}
  description={seo.description}
  jsonLd={[
    organizationSchema(),
    webPageSchema({ name: content.title, description: content.description, url: localizedPath('${pathKey}', locale) }),
    breadcrumbSchema([
      { name: t.breadcrumbs.home, path: localizedPath('/', locale) },
      { name: '${breadcrumb}', path: localizedPath('${pathKey}', locale) },
    ]),
  ]}
>
  <LegalPage title={content.title} description={content.description} breadcrumbLabel="${breadcrumb}" sections={content.sections} />
</BaseLayout>
`;

write('about.astro', legalTemplate('about', '/about/', 'About'));
write('privacy.astro', legalTemplate('privacy', '/privacy/', 'Privacy'));
write('terms.astro', legalTemplate('terms', '/terms/', 'Terms'));

write(
  'support.astro',
  `${pathsBlock}
import BaseLayout from '../../layouts/BaseLayout.astro';
import ContactSupportSection from '../../components/ContactSupportSection.astro';
import { getTranslations } from '../../i18n';
import { resolvePageSeo } from '../../config/seo';
import { breadcrumbSchema, webPageSchema } from '../../utils/schema';
import { localizedPath } from '../../utils/path';

const locale = Astro.params.locale!;
const t = getTranslations(locale);
const seo = resolvePageSeo('/support/', locale);
---

<BaseLayout
  title={seo.title}
  description={seo.description}
  jsonLd={[
    webPageSchema({ name: seo.title, description: seo.description, url: localizedPath('/support/', locale) }),
    breadcrumbSchema([
      { name: t.breadcrumbs.home, path: localizedPath('/', locale) },
      { name: t.support.title, path: localizedPath('/support/', locale) },
    ]),
  ]}
>
  <ContactSupportSection />
</BaseLayout>
`,
);

write(
  'faq.astro',
  `${pathsBlock}
import BaseLayout from '../../layouts/BaseLayout.astro';
import { getAllFaqs } from '../../data/faq';
import { getTranslations } from '../../i18n';
import { resolvePageSeo } from '../../config/seo';
import { breadcrumbSchema, faqPageSchema, webPageSchema } from '../../utils/schema';
import Breadcrumbs from '../../components/Breadcrumbs.astro';
import SiteFaqSection from '../../components/SiteFaqSection.astro';
import SectionHeader from '../../components/SectionHeader.astro';
import { localizedPath } from '../../utils/path';

const locale = Astro.params.locale!;
const t = getTranslations(locale);
const seo = resolvePageSeo('/faq/', locale);
const faqs = getAllFaqs();
---

<BaseLayout
  title={seo.title}
  description={seo.description}
  jsonLd={[
    webPageSchema({ name: t.faqPage.schemaName, description: t.faqPage.schemaDescription, url: localizedPath('/faq/', locale) }),
    faqPageSchema(faqs.map((f, i) => ({ num: String(i + 1).padStart(2, '0'), q: f.q, a: f.a.replace(/<[^>]+>/g, '') }))),
    breadcrumbSchema([
      { name: t.breadcrumbs.home, path: localizedPath('/', locale) },
      { name: t.breadcrumbs.faq, path: localizedPath('/faq/', locale) },
    ]),
  ]}
>
  <section class="border-b border-border bg-muted/10 py-8 md:py-12">
    <div class="mx-auto max-w-6xl px-5">
      <Breadcrumbs items={[
        { name: t.breadcrumbs.home, path: localizedPath('/', locale) },
        { name: t.breadcrumbs.faq, path: localizedPath('/faq/', locale) },
      ]} />
      <div class="mt-6">
        <SectionHeader eyebrow={t.faqPage.eyebrow} title={t.faqPage.title} desc={t.faqPage.subtitle} titleId="faq-page-title" heading="h1" />
      </div>
    </div>
  </section>
  <SiteFaqSection items={faqs} variant="full" titleId="faq-page-list" />
</BaseLayout>
`,
);

write(
  '404.astro',
  `${pathsBlock}
import BaseLayout from '../../layouts/BaseLayout.astro';
import Icon from '../../components/icons/Icon.astro';
import { Button } from '@/components/starwind/button';
import { getTranslations } from '../../i18n';
import { localizedRoutes } from '../../utils/path';

const locale = Astro.params.locale!;
const t = getTranslations(locale);
const routes = localizedRoutes(locale);
const pageTitle = \`\${t.notFound.metaTitleSuffix} | \${t.site.name}\`;
---

<BaseLayout title={pageTitle} description={t.notFound.metaDescription} noindex={true}>
  <section class="py-16 md:py-24">
    <div class="mx-auto max-w-lg px-5 text-center">
      <p class="text-sm font-semibold uppercase tracking-wider text-primary">{t.notFound.code}</p>
      <h1 class="mt-3 text-3xl font-bold uppercase md:text-4xl">{t.notFound.title}</h1>
      <p class="mt-4 text-muted-foreground">{t.notFound.description}</p>
      <div class="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button as="a" href={routes.home} variant="primary">{t.notFound.backHome}<Icon name="arrowRight" size={17} /></Button>
        <Button as="a" href={routes.products} variant="outline">{t.notFound.viewProducts}</Button>
        <Button as="a" href={routes.forum} variant="outline">{t.notFound.openForum}</Button>
      </div>
    </div>
  </section>
</BaseLayout>
`,
);

write(
  'search-index.json.ts',
  `${pathsBlock}
import type { APIRoute } from 'astro';
import type { Locale } from '../../i18n/locales';
import { buildSearchIndex, searchIndexResponse } from '../../data/search-index';

export const prerender = true;

export const GET: APIRoute = ({ params }) => {
  const locale = params.locale as Locale;
  return searchIndexResponse(buildSearchIndex(locale));
};
`,
);

console.log('Locale pages written');
