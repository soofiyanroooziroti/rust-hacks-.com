import fs from 'node:fs';
import path from 'node:path';

function i18nImportPath(file) {
  const rel = path.relative(path.dirname(file), path.join(process.cwd(), 'src', 'i18n')).replace(/\\/g, '/');
  return rel.startsWith('.') ? rel : `./${rel}`;
}

function fixFile(file) {
  let content = fs.readFileSync(file, 'utf8');
  if (!content.includes('t.')) return;
  if (content.includes('const t = getTranslations')) return;
  if (!content.startsWith('---')) return;

  const i18n = i18nImportPath(file);
  if (!content.includes('getLocaleFromAstro')) {
    content = content.replace(
      '---\n',
      `---\nimport { getLocaleFromAstro, getTranslations } from '${i18n}';\n`,
    );
  }
  const close = content.indexOf('\n---\n', 4);
  if (close < 0) return;
  const front = content.slice(0, close + 1);
  const rest = content.slice(close + 1);
  if (front.includes('const t = getTranslations')) return;
  const inject = '\nconst locale = getLocaleFromAstro(Astro);\nconst t = getTranslations(locale);\n';
  content = front + inject + rest;
  fs.writeFileSync(file, content);
  console.log('fixed', path.relative(process.cwd(), file));
}

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'starwind') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (/\.astro$/.test(entry.name)) fixFile(full);
  }
}

walk(path.join(process.cwd(), 'src', 'components'));
walk(path.join(process.cwd(), 'src', 'pages'));
