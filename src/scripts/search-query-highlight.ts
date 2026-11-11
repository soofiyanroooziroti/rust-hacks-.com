const HIGHLIGHT_NAME = 'search-query';
const MAX_MATCHES = 50;
const MIN_QUERY_LENGTH = 2;
const VISIBLE_MS = 4000;
const HEADER_SCROLL_OFFSET_PX = 88;

const SKIP_PARENT_TAGS = new Set([
  'SCRIPT',
  'STYLE',
  'NOSCRIPT',
  'TEXTAREA',
  'INPUT',
  'SELECT',
  'OPTION',
]);

type HighlightSession = {
  abort: AbortController;
};

let activeSession: HighlightSession | null = null;
let hideTimer = 0;

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function clearTimers() {
  if (hideTimer) {
    window.clearTimeout(hideTimer);
    hideTimer = 0;
  }
}

function removeQueryParamFromUrl() {
  const url = new URL(window.location.href);
  if (!url.searchParams.has('q')) return;
  url.searchParams.delete('q');
  const search = url.searchParams.toString();
  const next = url.pathname + (search ? `?${search}` : '') + url.hash;
  history.replaceState(null, '', next);
}

function getMainContentRoot(): HTMLElement | null {
  const main = document.querySelector<HTMLElement>('#main-content');
  if (!main) return null;
  return main;
}

function collectMatchRanges(root: HTMLElement, query: string): Range[] {
  const needle = query.toLowerCase();
  const ranges: Range[] = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent) return NodeFilter.FILTER_REJECT;
      if (SKIP_PARENT_TAGS.has(parent.tagName)) return NodeFilter.FILTER_REJECT;
      if (parent.closest('[hidden], [aria-hidden="true"]')) return NodeFilter.FILTER_REJECT;
      const value = node.nodeValue ?? '';
      if (!value.trim()) return NodeFilter.FILTER_SKIP;
      return NodeFilter.FILTER_ACCEPT;
    },
  });

  let textNode = walker.nextNode();
  while (textNode && ranges.length < MAX_MATCHES) {
    const data = textNode.nodeValue ?? '';
    const lower = data.toLowerCase();
    let start = 0;
    while (ranges.length < MAX_MATCHES) {
      const index = lower.indexOf(needle, start);
      if (index === -1) break;
      const range = document.createRange();
      range.setStart(textNode, index);
      range.setEnd(textNode, index + needle.length);
      ranges.push(range);
      start = index + needle.length;
    }
    textNode = walker.nextNode();
  }

  return ranges;
}

function scrollToFirstMatch(range: Range) {
  const rect = range.getBoundingClientRect();
  const behavior = prefersReducedMotion() ? 'auto' : ('smooth' as ScrollBehavior);

  if (rect.width > 0 || rect.height > 0) {
    const top = window.scrollY + rect.top - HEADER_SCROLL_OFFSET_PX;
    window.scrollTo({ top: Math.max(0, top), behavior });
    return;
  }

  const element =
    range.startContainer.nodeType === Node.TEXT_NODE
      ? range.startContainer.parentElement
      : (range.startContainer as Element);
  element?.scrollIntoView({ behavior, block: 'center' });
}

function deletePageHighlight() {
  if (typeof CSS !== 'undefined' && 'highlights' in CSS) {
    CSS.highlights.delete(HIGHLIGHT_NAME);
  }
}

function bindDismissHandlers(signal: AbortSignal) {
  const onKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') clearSearchQueryHighlight();
  };

  const onClick = () => {
    clearSearchQueryHighlight();
  };

  document.addEventListener('keydown', onKeydown, { signal });
  document.addEventListener('click', onClick, { capture: true, signal });
}

export function clearSearchQueryHighlight() {
  clearTimers();
  activeSession?.abort.abort();
  activeSession = null;
  deletePageHighlight();
}

export type SearchQueryHighlightOptions = {
  /** When true, do not scroll to the first in-page match (hash navigation wins). */
  respectHash?: boolean;
};

export function startSearchQueryHighlight(
  rawQuery: string,
  options: SearchQueryHighlightOptions = {},
) {
  const query = rawQuery.trim();
  if (query.length < MIN_QUERY_LENGTH) return;

  if (typeof CSS === 'undefined' || !('highlights' in CSS) || typeof Highlight === 'undefined') {
    removeQueryParamFromUrl();
    return;
  }

  clearSearchQueryHighlight();

  removeQueryParamFromUrl();

  const root = getMainContentRoot();
  if (!root) return;

  const ranges = collectMatchRanges(root, query);
  if (ranges.length === 0) return;

  const highlight = new Highlight(...ranges);
  CSS.highlights.set(HIGHLIGHT_NAME, highlight);

  const abort = new AbortController();
  activeSession = { abort };
  bindDismissHandlers(abort.signal);

  const respectHash = options.respectHash ?? Boolean(window.location.hash);

  if (!respectHash) {
    scrollToFirstMatch(ranges[0]!);
  }

  hideTimer = window.setTimeout(() => {
    hideTimer = 0;
    clearSearchQueryHighlight();
  }, VISIBLE_MS);
}

function readQueryFromUrl(): string {
  return new URLSearchParams(window.location.search).get('q')?.trim() ?? '';
}

function initFromUrl() {
  const query = readQueryFromUrl();
  if (query.length < MIN_QUERY_LENGTH) return;

  const respectHash = Boolean(window.location.hash);
  const run = () => {
    startSearchQueryHighlight(query, { respectHash });
  };

  if (typeof requestIdleCallback === 'function') {
    requestIdleCallback(run, { timeout: 2000 });
  } else {
    window.setTimeout(run, 0);
  }
}

function initSearchQueryHighlight() {
  if (readQueryFromUrl().length < MIN_QUERY_LENGTH) return;
  initFromUrl();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSearchQueryHighlight);
} else {
  initSearchQueryHighlight();
}

document.addEventListener('astro:page-load', initSearchQueryHighlight);
document.addEventListener('astro:before-swap', clearSearchQueryHighlight);
