/** Blog index topic filters + custom sort menu. */

const BLOG_SORT_VALUES = new Set(['newest', 'oldest', 'short', 'long']);

const blogIndexControllers = new WeakMap<HTMLElement, AbortController>();
let blogIndexLifecycleBound = false;

function closeSortMenu(wrap: HTMLElement) {
  const trigger = wrap.querySelector<HTMLButtonElement>('[data-blog-sort-trigger]');
  const menu = wrap.querySelector<HTMLElement>('[data-blog-sort-menu]');
  if (!menu || menu.hidden) return;
  menu.hidden = true;
  trigger?.setAttribute('aria-expanded', 'false');
}

function initBlogIndexFilters(root: HTMLElement) {
  if (root.dataset.blogIndexBound === 'true') return;

  blogIndexControllers.get(root)?.abort();
  const abort = new AbortController();
  blogIndexControllers.set(root, abort);
  root.dataset.blogIndexBound = 'true';
  const { signal } = abort;

  const grid = root.querySelector<HTMLElement>('#blog-grid');
  const emptyEl = root.querySelector<HTMLElement>('#blog-empty');
  const sortWrap = root.querySelector<HTMLElement>('[data-blog-sort-wrap]');
  if (!grid) return;

  const emptyMessage = root.getAttribute('data-empty-message') ?? 'No articles match this filter.';

  const filters = [...root.querySelectorAll<HTMLButtonElement>('[data-blog-filter]')];
  if (!filters.length) return;

  const sortTrigger = sortWrap?.querySelector<HTMLButtonElement>('[data-blog-sort-trigger]');
  const sortMenu = sortWrap?.querySelector<HTMLElement>('[data-blog-sort-menu]');
  const sortLabel = sortWrap?.querySelector<HTMLElement>('[data-blog-sort-label]');
  const sortOptions = sortWrap
    ? [...sortWrap.querySelectorAll<HTMLButtonElement>('[data-blog-sort-option]')]
    : [];

  let currentSort =
    sortOptions.find((btn) => btn.getAttribute('aria-selected') === 'true')?.getAttribute(
      'data-blog-sort-option',
    ) ?? 'newest';

  const gridCards = () => [...grid.querySelectorAll<HTMLElement>('[data-blog-card]')];

  const activeTag = () =>
    filters.find((btn) => btn.getAttribute('aria-pressed') === 'true')?.getAttribute('data-blog-filter') ??
    'all';

  const compareCards = (a: HTMLElement, b: HTMLElement, sort: string) => {
    const tsA = Number(a.getAttribute('data-ts') ?? 0);
    const tsB = Number(b.getAttribute('data-ts') ?? 0);
    const readA = Number(a.getAttribute('data-read-minutes') ?? 0);
    const readB = Number(b.getAttribute('data-read-minutes') ?? 0);
    if (sort === 'oldest') return tsA - tsB;
    if (sort === 'short') return readA - readB;
    if (sort === 'long') return readB - readA;
    return tsB - tsA;
  };

  const setVisible = (el: HTMLElement, match: boolean) => {
    el.classList.toggle('hidden', !match);
    el.toggleAttribute('hidden', !match);
  };

  const setSortUi = (sort: string) => {
    for (const btn of sortOptions) {
      const active = btn.getAttribute('data-blog-sort-option') === sort;
      btn.setAttribute('aria-selected', active ? 'true' : 'false');
      if (active && sortLabel) {
        sortLabel.textContent = btn.getAttribute('data-blog-sort-label') ?? btn.textContent ?? sort;
      }
    }
  };

  const apply = (sortOverride?: string) => {
    const tag = activeTag();
    const sort = sortOverride ?? currentSort;
    if (!BLOG_SORT_VALUES.has(sort)) return;
    currentSort = sort;
    setSortUi(sort);

    const items = gridCards();
    const sorted = [...items].sort((a, b) => compareCards(a, b, sort));
    sorted.forEach((el) => grid.appendChild(el));

    let visibleCount = 0;
    items.forEach((el) => {
      const match = tag === 'all' || el.getAttribute('data-tag') === tag;
      setVisible(el, match);
      if (match) visibleCount += 1;
    });

    if (emptyEl) {
      emptyEl.classList.toggle('hidden', visibleCount > 0);
      emptyEl.toggleAttribute('hidden', visibleCount > 0);
      emptyEl.textContent = emptyMessage;
    }
  };

  filters.forEach((btn) => {
    btn.addEventListener(
      'click',
      () => {
        filters.forEach((b) => b.setAttribute('aria-pressed', 'false'));
        btn.setAttribute('aria-pressed', 'true');
        apply();
      },
      { signal },
    );
  });

  sortTrigger?.addEventListener(
    'click',
    (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (!sortMenu) return;
      const willOpen = sortMenu.hidden;
      sortMenu.hidden = !willOpen;
      sortTrigger.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
    },
    { signal },
  );

  sortOptions.forEach((btn) => {
    btn.addEventListener(
      'click',
      (event) => {
        event.preventDefault();
        event.stopPropagation();
        const next = btn.getAttribute('data-blog-sort-option') ?? 'newest';
        if (sortWrap) closeSortMenu(sortWrap);
        apply(next);
      },
      { signal },
    );
  });

  document.addEventListener(
    'click',
    (event) => {
      if (!sortWrap || !sortMenu || sortMenu.hidden) return;
      const target = event.target;
      if (target instanceof Node && sortWrap.contains(target)) return;
      closeSortMenu(sortWrap);
    },
    { signal },
  );

  document.addEventListener(
    'keydown',
    (event) => {
      if (event.key === 'Escape' && sortWrap) closeSortMenu(sortWrap);
    },
    { signal },
  );

  apply();
}

function resetBlogIndexRoots() {
  document.querySelectorAll<HTMLElement>('[data-blog-index]').forEach((root) => {
    delete root.dataset.blogIndexBound;
    blogIndexControllers.get(root)?.abort();
    blogIndexControllers.delete(root);
  });
}

export function setupBlogIndexFilters() {
  const run = () => {
    document.querySelectorAll<HTMLElement>('[data-blog-index]').forEach((root) => {
      if (!document.contains(root)) return;
      initBlogIndexFilters(root);
    });
  };

  if (!blogIndexLifecycleBound) {
    blogIndexLifecycleBound = true;
    document.addEventListener('astro:before-swap', resetBlogIndexRoots);
    document.addEventListener('astro:page-load', run);
  }

  run();
}
