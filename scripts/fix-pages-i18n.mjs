import fs from 'node:fs';
import path from 'node:path';

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== '[locale]') walk(full, out);
    else if (entry.isDirectory() && entry.name === '[locale]') {
      for (const sub of fs.readdirSync(full, { withFileTypes: true })) {
        if (sub.isFile() && sub.name.endsWith('.astro')) out.push(path.join(full, sub.name));
      }
    } else if (entry.isFile() && entry.name.endsWith('.astro')) out.push(full);
  }
  return out;
}

for (const file of walk(path.join(process.cwd(), 'src', 'pages'))) {
  let content = fs.readFileSync(file, 'utf8');
  if (!content.includes('t.')) continue;
  if (content.includes('getTranslations')) continue;
  const rel = path.relative(path.dirname(file), 'src/i18n').replace(/\\/g, '/');
  const nl = content.includes('\r\n') ? '\r\n' : '\n';
  const inject = `import { getLocaleFromAstro, getTranslations } from '${rel}';${nl}const locale = getLocaleFromAstro(Astro);${nl}const t = getTranslations(locale);${nl}`;
  content = content.replace(`---${nl}`, `---${nl}${inject}`);
  fs.writeFileSync(file, content);
  console.log('ok', file);
}
