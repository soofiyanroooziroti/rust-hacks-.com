import { clearSearchQueryHighlight, startSearchQueryHighlight } from './search-query-highlight';

type SearchIndexEntry = {
  title: string;
  description: string;
  url: string;
  type?: string;
  text: string;
};

let openDialogImpl: ((trigger: HTMLButtonElement | null) => void) | null = null;
let forceCloseImpl: (() => void) | null = null;

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function highlightQuery(text: string, query: string): string {
  const q = query.trim();
  if (!q) return escapeHtml(text);
  const re = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
  let html = '';
  let last = 0;
  for (const match of text.matchAll(re)) {
    const index = match.index ?? 0;
    html += escapeHtml(text.slice(last, index));
    html += `<mark class="site-search-mark">${escapeHtml(match[0])}</mark>`;
    last = index + match[0].length;
  }
  html += escapeHtml(text.slice(last));
  return html;
}

function resultTypeLabel(hit: SearchIndexEntry): string {
  if (hit.type) return hit.type;
  const path = hit.url.split('?')[0]?.split('#')[0] ?? hit.url;
  if (path.includes('/products/')) return 'Product';
  if (path.startsWith('/blog')) return 'Blog';
  if (path.startsWith('/forum')) return 'Forum';
  if (path.startsWith('/faq')) return 'FAQ';
  if (path.startsWith('/status')) return 'Status';
  if (path.startsWith('/support')) return 'Support';
  return 'Page';
}

function normalizeSearchText(value: string): string {
  return value
    .replace(/\u00a0/g, ' ')
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function queryTokens(query: string): string[] {
  const normalized = normalizeSearchText(query);
  if (!normalized) return [];

  const parts = normalized.split(' ').filter(Boolean);
  const tokens = parts.filter((token) => token.length >= 2 || /^\d+$/.test(token));

  if (tokens.length === 0) return [];
  if (tokens.length === 1) return tokens;

  const phrase = normalized;
  if (phrase.length >= 2 && !tokens.includes(phrase)) {
    return [phrase, ...tokens];
  }
  return tokens;
}

function fieldBlob(item: SearchIndexEntry): string {
  return normalizeSearchText(`${item.title} ${item.description} ${item.text}`);
}

function formatResultPath(url: string): string {
  try {
    const u = new URL(url, window.location.origin);
    return u.pathname + (u.hash || '');
  } catch {
    return url;
  }
}

function normalizePathname(pathname: string): string {
  const stripped = pathname.replace(/\/index\.html$/, '');
  if (stripped === '' || stripped === '/') return '/';
  return stripped.endsWith('/') ? stripped.slice(0, -1) : stripped;
}

function getFocusableElements(root: HTMLElement): HTMLElement[] {
  const selector =
    'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';
  return Array.from(root.querySelectorAll<HTMLElement>(selector)).filter(
    (el) => !el.hasAttribute('disabled') && el.getAttribute('aria-hidden') !== 'true',
  );
}

export function resetSiteSearchBinding() {
  forceCloseImpl?.();
  const dialog = document.getElementById('site-search-dialog');
  dialog?.removeAttribute('data-site-search-init');
  openDialogImpl = null;
  forceCloseImpl = null;
}

export function openSiteSearch(trigger: HTMLButtonElement | null = null) {
  attachSiteSearch();
  openDialogImpl?.(trigger);
}

export function attachSiteSearch() {
  const dialog = document.getElementById('site-search-dialog') as HTMLDialogElement | null;
  if (!dialog || dialog.dataset.siteSearchInit === 'true') return;

  const input = dialog.querySelector<HTMLInputElement>('[data-site-search-input]');
  const resultsEl = dialog.querySelector<HTMLElement>('[data-site-search-results]');
  const emptyEl = dialog.querySelector<HTMLElement>('[data-site-search-empty]');
  const noResultsEl = dialog.querySelector<HTMLElement>('[data-site-search-no-results]');
  const countEl = dialog.querySelector<HTMLElement>('[data-site-search-count]');
  const closeBtn = dialog.querySelector<HTMLButtonElement>('[data-site-search-close]');

  if (!input || !resultsEl || !emptyEl || !noResultsEl || !countEl) return;

  dialog.dataset.siteSearchInit = 'true';

  const dialogEl = dialog;
  const searchInput = input;
  const resultsRoot = resultsEl;
  const emptyState = emptyEl;
  const noResultsState = noResultsEl;
  const resultCount = countEl;

  let indexPromise: Promise<SearchIndexEntry[]> | null = null;

const NON_EN_LOCALES: string[] = [];

function searchIndexUrl(): string {
  const first = window.location.pathname.split('/').filter(Boolean)[0]?.toLowerCase();
  if (first && NON_EN_LOCALES.includes(first)) {
    return `/${first}/search-index.json`;
  }
  return '/search-index.json';
}
  let activeIndex = -1;
  let resultLinks: HTMLAnchorElement[] = [];
  let lastTrigger: HTMLButtonElement | null = null;
  let onDialogKeydown: ((event: KeyboardEvent) => void) | null = null;
  let onInputKeydown: ((event: KeyboardEvent) => void) | null = null;

  function loadIndex() {
    if (!indexPromise) {
      indexPromise = fetch(searchIndexUrl())
        .then((res) => {
          if (!res.ok) throw new Error('index failed');
          return res.json() as Promise<SearchIndexEntry[]>;
        })
        .catch(() => [] as SearchIndexEntry[]);
    }
    return indexPromise;
  }

  function rankResults(query: string, items: SearchIndexEntry[]): SearchIndexEntry[] {
    const tokens = queryTokens(query);
    if (!tokens.length) return [];

    const scored = items
      .map((item) => {
        const title = normalizeSearchText(item.title);
        const description = normalizeSearchText(item.description);
        const text = normalizeSearchText(item.text);
        const blob = fieldBlob(item);

        const allMatch = tokens.every(
          (token) => title.includes(token) || description.includes(token) || text.includes(token) || blob.includes(token),
        );
        if (!allMatch) return { item, score: 0 };

        let score = 0;
        for (const token of tokens) {
          if (title.includes(token)) score += 100;
          if (title.startsWith(token)) score += 50;
          if (description.includes(token)) score += 30;
          if (text.includes(token)) score += 10;
        }
        const phrase = normalizeSearchText(query);
        if (phrase.length >= 2) {
          if (title.includes(phrase)) score += 120;
          if (description.includes(phrase)) score += 40;
          if (text.includes(phrase)) score += 20;
        }
        return { item, score };
      })
      .filter((row) => row.score > 0)
      .sort((a, b) => b.score - a.score || a.item.title.localeCompare(b.item.title));

    return scored.slice(0, 8).map((row) => row.item);
  }

  function setActiveIndex(index: number) {
    resultLinks.forEach((link, i) => link.classList.toggle('is-active', i === index));
    activeIndex = index;
    resultLinks[index]?.scrollIntoView({ block: 'nearest' });
  }

  function hideCount() {
    resultCount.hidden = true;
    resultCount.textContent = '';
  }

  function resetResults() {
    resultsRoot.innerHTML = '';
    resultLinks = [];
    activeIndex = -1;
    noResultsState.hidden = true;
    hideCount();
  }

  function unbindModalKeyboard() {
    if (onDialogKeydown) {
      dialogEl.removeEventListener('keydown', onDialogKeydown);
      onDialogKeydown = null;
    }
    if (onInputKeydown) {
      searchInput.removeEventListener('keydown', onInputKeydown);
      onInputKeydown = null;
    }
  }

  function bindModalKeyboard() {
    unbindModalKeyboard();

    onDialogKeydown = (event) => {
      if (event.key !== 'Tab' || !dialogEl.open) return;
      const focusables = getFocusableElements(dialogEl);
      if (focusables.length === 0) return;
      const first = focusables[0]!;
      const last = focusables[focusables.length - 1]!;
      const active = document.activeElement as HTMLElement | null;

      if (event.shiftKey) {
        if (active === first || !dialogEl.contains(active)) {
          event.preventDefault();
          last.focus();
        }
      } else if (active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    onInputKeydown = (event) => {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        if (resultLinks.length === 0) return;
        setActiveIndex(Math.min(activeIndex + 1, resultLinks.length - 1));
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        if (resultLinks.length === 0) return;
        setActiveIndex(Math.max(activeIndex - 1, 0));
      } else if (event.key === 'Enter' && activeIndex >= 0 && resultLinks[activeIndex]) {
        event.preventDefault();
        navigateToResult(resultLinks[activeIndex].href);
      }
    };

    dialogEl.addEventListener('keydown', onDialogKeydown);
    searchInput.addEventListener('keydown', onInputKeydown);
  }

  function restoreAfterClose() {
    unbindModalKeyboard();
    document.body.classList.remove('site-search-scroll-lock');
    document.querySelectorAll<HTMLButtonElement>('[data-site-search-open]').forEach((btn) => {
      btn.setAttribute('aria-expanded', 'false');
    });
    searchInput.value = '';
    resetResults();
    emptyState.hidden = false;
    const trigger =
      lastTrigger ?? document.querySelector<HTMLButtonElement>('[data-site-search-open]');
    lastTrigger = null;
    window.requestAnimationFrame(() => trigger?.focus());
  }

  function closeDialog() {
    if (!dialogEl.open) return;
    unbindModalKeyboard();
    document.body.classList.remove('site-search-scroll-lock');
    dialogEl.close();
  }

  function forceCloseDialog() {
    if (!dialogEl.open) {
      document.body.classList.remove('site-search-scroll-lock');
      unbindModalKeyboard();
      return;
    }
    closeDialog();
  }

  forceCloseImpl = forceCloseDialog;

  function appendSearchQueryToUrl(url: URL, query: string): string {
    const trimmed = query.trim();
    const next = new URL(url.href, window.location.origin);
    next.search = '';
    if (trimmed.length >= 2) {
      next.searchParams.set('q', trimmed);
    }
    return `${next.pathname}${next.search}${next.hash}`;
  }

  function navigateToResult(rawUrl: string) {
    const query = searchInput.value;
    clearSearchQueryHighlight();

    const target = new URL(rawUrl, window.location.origin);
    const samePage = normalizePathname(window.location.pathname) === normalizePathname(target.pathname);

    closeDialog();

    window.requestAnimationFrame(() => {
      if (samePage) {
        const nextUrl = appendSearchQueryToUrl(target, query);
        history.pushState(null, '', nextUrl);
        if (target.hash) {
          const id = target.hash.slice(1);
          const el = document.getElementById(id);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
          window.dispatchEvent(new HashChangeEvent('hashchange'));
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        if (query.trim().length >= 2) {
          startSearchQueryHighlight(query.trim(), { respectHash: Boolean(target.hash) });
        }
        return;
      }

      const destination = new URL(rawUrl, window.location.origin);
      if (query.trim().length >= 2) {
        destination.searchParams.set('q', query.trim());
      }
      window.location.assign(`${destination.pathname}${destination.search}${destination.hash}`);
    });
  }

  function buildResultLink(hit: SearchIndexEntry, query: string): HTMLAnchorElement {
    const excerptPlain = hit.description || hit.text.slice(0, 200);
    const a = document.createElement('a');
    a.href = hit.url;
    a.className = 'site-search-result';
    a.setAttribute('role', 'option');

    const type = document.createElement('span');
    type.className = 'site-search-result__type';
    type.textContent = resultTypeLabel(hit);

    const title = document.createElement('span');
    title.className = 'site-search-result__title';
    title.innerHTML = highlightQuery(hit.title, query);

    const excerpt = document.createElement('span');
    excerpt.className = 'site-search-result__excerpt';
    excerpt.innerHTML = highlightQuery(excerptPlain, query);

    const path = document.createElement('span');
    path.className = 'site-search-result__path';
    path.textContent = formatResultPath(hit.url);

    a.append(type, title, excerpt, path);
    a.addEventListener('mouseenter', () => {
      const i = resultLinks.indexOf(a);
      if (i >= 0) setActiveIndex(i);
    });
    a.addEventListener('click', (event) => {
      event.preventDefault();
      navigateToResult(a.href);
    });
    return a;
  }

  async function runSearch(query: string) {
    const trimmed = query.trim();
    if (!trimmed) {
      resetResults();
      emptyState.hidden = false;
      return;
    }

    emptyState.hidden = true;
    const items = await loadIndex();
    const hits = rankResults(trimmed, items);
    resetResults();

    if (hits.length === 0) {
      noResultsState.hidden = false;
      return;
    }

    resultCount.textContent = hits.length === 1 ? '1 result' : `${hits.length} results`;
    resultCount.hidden = false;

    const fragment = document.createDocumentFragment();
    for (const hit of hits) {
      const li = document.createElement('li');
      li.setAttribute('role', 'presentation');
      const a = buildResultLink(hit, trimmed);
      li.append(a);
      fragment.append(li);
      resultLinks.push(a);
    }
    resultsRoot.append(fragment);
    setActiveIndex(0);
  }

  function openDialog(trigger: HTMLButtonElement | null) {
    clearSearchQueryHighlight();
    lastTrigger = trigger ?? document.querySelector<HTMLButtonElement>('[data-site-search-open]');
    searchInput.value = '';
    resetResults();
    emptyState.hidden = false;

    if (!dialogEl.open) {
      document.body.classList.add('site-search-scroll-lock');
      bindModalKeyboard();
      dialogEl.showModal();
    }

    void loadIndex();
    document.querySelectorAll<HTMLButtonElement>('[data-site-search-open]').forEach((btn) => {
      btn.setAttribute('aria-expanded', 'true');
    });
    window.setTimeout(() => searchInput.focus(), 0);
  }

  openDialogImpl = openDialog;

  dialogEl.addEventListener('close', restoreAfterClose);

  dialogEl.addEventListener('click', (event) => {
    if (event.target === dialogEl) closeDialog();
  });

  dialogEl.addEventListener('cancel', (event) => {
    event.preventDefault();
    closeDialog();
  });

  closeBtn?.addEventListener('click', closeDialog);

  searchInput.addEventListener('input', () => {
    clearSearchQueryHighlight();
    void runSearch(searchInput.value);
  });

  document.addEventListener('astro:before-swap', forceCloseDialog);
}
