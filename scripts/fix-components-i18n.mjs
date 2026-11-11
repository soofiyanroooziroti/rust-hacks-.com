import fs from 'node:fs';

const files = [
  'src/components/WorkflowSection.astro',
  'src/components/WhySetupSection.astro',
  'src/components/ProductsSection.astro',
  'src/components/product/ProductHighlightsSection.astro',
  'src/components/HeroSection.astro',
  'src/components/FeaturesSection.astro',
  'src/components/ContentSections.astro',
  'src/components/ContactSupportSection.astro',
  'src/components/CheatsSection.astro',
  'src/components/BlogSortSelect.astro',
  'src/components/BlogCard.astro',
  'src/components/ExploreSection.astro',
  'src/components/product/ProductCheckoutPanel.astro',
];

const inject =
  "import { getLocaleFromAstro, getTranslations } from '../i18n';\r\nconst locale = getLocaleFromAstro(Astro);\r\nconst t = getTranslations(locale);\r\n";

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('getTranslations')) continue;
  if (file.includes('product/')) {
    content = content.replace('---\r\n', `---\r\nimport { getLocaleFromAstro, getTranslations } from '../../i18n';\r\nconst locale = getLocaleFromAstro(Astro);\r\nconst t = getTranslations(locale);\r\n`);
  } else {
    content = content.replace('---\r\n', `---\r\n${inject}`);
  }
  fs.writeFileSync(file, content);
  console.log('ok', file);
}
