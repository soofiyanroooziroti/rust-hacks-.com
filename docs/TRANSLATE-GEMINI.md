# Rust Hacks site — Gemini translate (rust-hacks.com)

Primary game keyword (EN): **Rust hacks**

## 1. Language routes

| Locale | URL prefix | Example home |
|--------|------------|--------------|
| `en` | *(none)* | `https://rust-hacks.com/` |
| `fr` | `/fr/` | `https://rust-hacks.com/fr/` |
| `tr` | `/tr/` | `https://rust-hacks.com/tr/` |
| `pt-br` | `/pt-br/` | `https://rust-hacks.com/pt-br/` |
| `es` | `/es/` | `https://rust-hacks.com/es/` |
| `de` | `/de/` | `https://rust-hacks.com/de/` |
| `pl` | `/pl/` | `https://rust-hacks.com/pl/` |
| `th` | `/th/` | `https://rust-hacks.com/th/` |

Keep `scripts/locale-ship.mjs` in sync with `src/i18n/config.ts`.

---

## 2. What Gemini translates (file map)

| Kind | English source | Output per locale |
|------|----------------|-------------------|
| UI + page copy | `src/i18n/en.json` | `src/i18n/{locale}.json` |
| SEO title/meta | `src/i18n/seo/en.json` | `src/i18n/seo/{locale}.json` |
| Blog posts | `src/content/blog/en/*.md` | `src/content/blog/{locale}/*.md` |

Glossary (protected in `scripts/gemini-protect.mjs`): `src/i18n/glossary.json`.

Local SEO hints for **`seo`** jobs: `scripts/locale-seo-keywords.json`.

Regenerate **English only** from TypeScript (does not wipe locale files):

```powershell
npm.cmd run i18n:export-en
```

Full regenerate including English placeholders for every locale (destructive to translations):

```powershell
npx tsx scripts/generate-i18n-entry.ts
```

---

## 3. Terminal — run translate (Windows PowerShell)

```powershell
cd c:\Users\soofi\Downloads\Websites\cheats-for-deltaforce-.com
```

**.env**:

```env
GEMINI_API_KEY=your_key_here
```

Optional:

```env
GEMINI_MODEL=gemini-2.5-flash-lite
TRANSLATE_DELAY_MS=2500
```

### Full ship (7 non-English locales, all kinds)

```powershell
npm.cmd run translate
```

`translate` does **not** refresh `en.json` first (so finished locales are skipped). After you edit English in TypeScript, run `npm.cmd run i18n:export-en` once, then translate—or use `npm.cmd run translate:refresh-en`.

Resumes automatically: skips files newer than English source unless placeholders still match English (`hero.subtitle`, etc.) or you force:

```powershell
$env:FORCE_TRANSLATE='1'; npm.cmd run translate
```

### One locale at a time

```powershell
$env:TRANSLATE_LOCALES='fr'; npm.cmd run translate
$env:TRANSLATE_LOCALES='de'; npm.cmd run translate
```

### By content type

`TRANSLATE_KINDS` accepts `i18n` (same as CS2 `ui` / `pages`), `seo`, and `blog`:

```powershell
$env:TRANSLATE_KINDS='seo'; npm.cmd run translate
$env:TRANSLATE_KINDS='i18n'; npm.cmd run translate
$env:TRANSLATE_KINDS='blog'; npm.cmd run translate

# CS2-style aliases still work:
$env:TRANSLATE_KINDS='ui'; npm.cmd run translate
$env:TRANSLATE_KINDS='pages'; npm.cmd run translate

$env:TRANSLATE_LOCALES='fr'; $env:TRANSLATE_KINDS='seo,i18n'; npm.cmd run translate
```

Clear env between runs:

```powershell
Remove-Item Env:TRANSLATE_LOCALES -ErrorAction SilentlyContinue
Remove-Item Env:TRANSLATE_KINDS -ErrorAction SilentlyContinue
```

### After translate

```powershell
npm.cmd run check:seo
npm.cmd run build:i18n-test
npm.cmd run verify
```

Same as **cheats-for-cs2-.com** (`docs/TRANSLATE-GEMINI.md` §4). `verify-site.mjs` enforces playbook landing SEO, `_headers`, checkout `/go/` rules, forum `#category=`, and build hygiene.

```powershell
npm.cmd run build
```

---

## 4. SEO rules

- One primary keyword per URL — do not repeat home “Rust hacks” in every title.
- Titles ≤ 60 chars, descriptions ≤ 160 where possible.
- Localized SEO lives in `src/i18n/seo/{locale}.json`.
