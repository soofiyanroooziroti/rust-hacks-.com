/** Forum index “Search discussions” field — focus-safe wiring + query matching. */

function stripDiacritics(value: string): string {
  try {
    return value.normalize('NFD').replace(/\p{M}/gu, '');
  } catch {
    return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }
}

export function normalizeForumSearch(value: string): string {
  return stripDiacritics(value.replace(/\u00a0/g, ' '))
    .toLocaleLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

const TOKEN_ALIASES: Record<string, string[]> = {
  forums: ['forum'],
  forum: ['forums'],
  discussions: ['discussion'],
  discussion: ['discussions'],
};

function tokenVariants(token: string): string[] {
  const variants = new Set<string>([token]);
  for (const alt of TOKEN_ALIASES[token] ?? []) variants.add(alt);
  return [...variants];
}

function haystackHasToken(haystack: string, token: string): boolean {
  if (!token) return true;
  return tokenVariants(token).some((variant) => haystack.includes(variant));
}

function searchTokens(query: string): string[] {
  const normalized = normalizeForumSearch(query);
  if (!normalized) return [];
  return normalized.split(' ').filter((token) => token.length >= 1);
}

export function cardMatchesForumQuery(haystack: string, query: string): boolean {
  const tokens = searchTokens(query);
  if (tokens.length === 0) return true;
  return tokens.every((token) => haystackHasToken(haystack, token));
}

export function cardSearchHaystack(card: HTMLElement): string {
  const fromDataset =
    card.dataset.forumSearchText?.trim() ||
    card.getAttribute('data-forum-search-text')?.trim() ||
    '';
  if (fromDataset) return normalizeForumSearch(fromDataset);
  return normalizeForumSearch(card.textContent ?? '');
}

export type ForumDiscussionsSearchHandle = {
  getQuery: () => string;
  isActive: () => boolean;
  matchesCard: (card: HTMLElement) => boolean;
};

type AttachOptions = {
  signal: AbortSignal;
  onQueryChange: () => void;
};

export function attachForumDiscussionsSearch(
  forumRoot: HTMLElement,
  options: AttachOptions,
): ForumDiscussionsSearchHandle | null {
  const field = forumRoot.querySelector<HTMLElement>('[data-forum-discussions-search]');
  const input = field?.querySelector<HTMLInputElement>('[data-forum-discussions-search-input]');
  if (!field || !input) return null;

  const clearButton = field.querySelector<HTMLButtonElement>('[data-forum-discussions-search-clear]');

  const getQuery = () => input.value;
  const isActive = () => normalizeForumSearch(getQuery()).length > 0;

  const syncClearVisibility = () => {
    if (!clearButton) return;
    const show = normalizeForumSearch(getQuery()).length > 0;
    clearButton.hidden = !show;
    clearButton.toggleAttribute('hidden', !show);
  };

  const syncSearchInUrl = () => {
    const raw = getQuery();
    const q = normalizeForumSearch(raw);
    const url = new URL(window.location.href);
    if (q.length >= 1) url.searchParams.set('q', raw.trim());
    else url.searchParams.delete('q');
    const next = `${url.pathname}${url.search}${url.hash}`;
    const current = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    if (current !== next) history.replaceState(null, '', next);
  };

  let rafId = 0;
  const notifyChange = () => {
    syncClearVisibility();
    syncSearchInUrl();
    options.onQueryChange();
  };

  const scheduleNotify = () => {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(() => {
      rafId = 0;
      notifyChange();
    });
  };

  input.addEventListener(
    'input',
    () => {
      scheduleNotify();
    },
    { signal: options.signal },
  );

  input.addEventListener(
    'keydown',
    (event) => {
      if (event.key === 'Escape') {
        input.value = '';
        input.blur();
        notifyChange();
      }
    },
    { signal: options.signal },
  );

  clearButton?.addEventListener(
    'click',
    (event) => {
      event.preventDefault();
      event.stopPropagation();
      input.value = '';
      input.focus();
      notifyChange();
    },
    { signal: options.signal },
  );

  field.addEventListener(
    'mousedown',
    (event) => {
      if (event.target === input || input.contains(event.target as Node)) return;
      event.preventDefault();
      input.focus({ preventScroll: true });
    },
    { signal: options.signal },
  );

  field.addEventListener(
    'click',
    (event) => {
      event.stopPropagation();
    },
    { signal: options.signal },
  );

  const initialQuery = new URLSearchParams(window.location.search).get('q')?.trim();
  if (initialQuery) input.value = initialQuery;
  syncClearVisibility();

  return {
    getQuery,
    isActive,
    matchesCard: (card) => cardMatchesForumQuery(cardSearchHaystack(card), getQuery()),
  };
}
