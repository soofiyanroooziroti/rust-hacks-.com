/** Forum index sort, category filters, search, and pagination. */

import {
  attachForumDiscussionsSearch,
  normalizeForumSearch,
  type ForumDiscussionsSearchHandle,
} from './forum-discussions-search.ts';

function setCardVisible(card: HTMLElement, visible: boolean) {
  card.hidden = !visible;
  card.toggleAttribute('hidden', !visible);
  if (visible) card.removeAttribute('aria-hidden');
  else card.setAttribute('aria-hidden', 'true');
}

const CATEGORY_FILTER_ALIASES: Record<string, string> = {
  general: 'general',
  community: 'community',
  guides: 'guidesbuilds',
  guidesbuilds: 'guidesbuilds',
  'guides-builds': 'guidesbuilds',
  patch: 'patchtalk',
  patchtalk: 'patchtalk',
  'patch-talk': 'patchtalk',
};

function resolveCategoryFilter(raw: string | null | undefined): string {
  if (!raw || raw === 'all') return 'all';
  const key = raw.toLowerCase().replace(/[^a-z0-9-]/g, '');
  return CATEGORY_FILTER_ALIASES[key] ?? key;
}

function readCategoryFilter(): string {
  const hash = window.location.hash.replace(/^#/, '');
  if (hash) {
    const fromHash = new URLSearchParams(hash).get('category');
    if (fromHash) return resolveCategoryFilter(fromHash);
  }
  return resolveCategoryFilter(new URLSearchParams(window.location.search).get('category'));
}

const forumIndexControllers = new WeakMap<HTMLElement, AbortController>();
let forumIndexPageLoadBound = false;

function initForumIndex(root: HTMLElement) {
  if (root.dataset.forumIndexBound === 'true') return;

  forumIndexControllers.get(root)?.abort();
  const abort = new AbortController();
  forumIndexControllers.set(root, abort);
  const { signal } = abort;

  const forumUrl = root.dataset.forumUrl ?? '/forum/';
  const discussionOne = root.dataset.discussionOne ?? 'discussion';
  const discussionMany = root.dataset.discussionMany ?? 'discussions';
  const showingRange =
    root.dataset.showingRange ?? 'Showing {from}–{to} of {total}';
  const zeroDiscussions = root.dataset.zeroDiscussions ?? '0 discussions';

  const list = root.querySelector<HTMLElement>('.forum-post-list');
  if (!list) {
    forumIndexControllers.delete(root);
    return;
  }

  root.dataset.forumIndexBound = 'true';

  const cards = () => [...root.querySelectorAll<HTMLElement>('[data-forum-card]')];
  const sortButtons = () => [...root.querySelectorAll<HTMLButtonElement>('[data-forum-sort]')];
  const filterButtons = () => [...root.querySelectorAll<HTMLButtonElement>('[data-forum-filter]')];
  const pagination = root.querySelector<HTMLElement>('[data-forum-pagination]');
  const pageButtons = root.querySelector<HTMLElement>('[data-page-buttons]');
  const pageStatus = root.querySelector<HTMLElement>('[data-page-status]');
  const countStatus = root.querySelector<HTMLElement>('[data-forum-count]');
  const visibleCount = root.querySelector<HTMLElement>('[data-forum-visible-count]');
  const emptyState = root.querySelector<HTMLElement>('[data-forum-empty]');
  const previousButton = root.querySelector<HTMLButtonElement>('[data-page-previous]');
  const nextButton = root.querySelector<HTMLButtonElement>('[data-page-next]');

  const pageSize = 20;
  let currentPage = 1;
  let activeFilter = readCategoryFilter();

  let search: ForumDiscussionsSearchHandle | null = attachForumDiscussionsSearch(root, {
    signal,
    onQueryChange: () => {
      currentPage = 1;
      updateForum();
    },
  });

  if (!search) {
    search = {
      getQuery: () => '',
      isActive: () => false,
      matchesCard: () => true,
    };
  }

  const syncCategoryInUrl = () => {
    const url = new URL(window.location.href);
    const q = url.searchParams.get('q');
    const next =
      activeFilter === 'all'
        ? q
          ? `${forumUrl}?q=${encodeURIComponent(q)}`
          : forumUrl
        : q
          ? `${forumUrl}?q=${encodeURIComponent(q)}#category=${encodeURIComponent(activeFilter)}`
          : `${forumUrl}#category=${encodeURIComponent(activeFilter)}`;
    history.replaceState(null, '', next);
  };

  const compareCards = (a: HTMLElement, b: HTMLElement, sort: string) => {
    if (sort === 'latest') {
      return Number(b.dataset.published ?? 0) - Number(a.dataset.published ?? 0);
    }
    if (sort === 'top') {
      const commentDiff = Number(b.dataset.comments ?? 0) - Number(a.dataset.comments ?? 0);
      if (commentDiff !== 0) return commentDiff;
      return Number(b.dataset.upvotes ?? 0) - Number(a.dataset.upvotes ?? 0);
    }
    const upDiff = Number(b.dataset.upvotes ?? 0) - Number(a.dataset.upvotes ?? 0);
    if (upDiff !== 0) return upDiff;
    return Number(a.dataset.order ?? 0) - Number(b.dataset.order ?? 0);
  };

  const updateForum = () => {
    const sort =
      sortButtons().find((button) => button.getAttribute('aria-pressed') === 'true')?.dataset.forumSort ??
      'latest';
    const searchActive = search!.isActive();
    const categoryForMatch = searchActive ? 'all' : activeFilter;

    const ordered = [...cards()].sort((a, b) => compareCards(a, b, sort));
    const matching = ordered.filter((card) => {
      const matchesCategory = categoryForMatch === 'all' || card.dataset.category === categoryForMatch;
      if (!matchesCategory) return false;
      return search!.matchesCard(card);
    });

    const pageCount = Math.max(1, Math.ceil(matching.length / pageSize));
    currentPage = Math.min(currentPage, pageCount);
    const firstVisible = (currentPage - 1) * pageSize;
    const visibleCards = new Set(matching.slice(firstVisible, firstVisible + pageSize));

    ordered.forEach((card) => {
      setCardVisible(card, visibleCards.has(card));
      list.append(card);
    });

    const countLabel = matching.length === 1 ? discussionOne : discussionMany;
    if (countStatus) countStatus.textContent = `${matching.length} ${countLabel}`;
    if (visibleCount) visibleCount.textContent = `${matching.length} ${countLabel}`;
    if (emptyState) emptyState.hidden = matching.length > 0;
    if (pagination) pagination.hidden = matching.length <= pageSize;
    if (pageStatus) {
      pageStatus.textContent = matching.length
        ? showingRange
            .replace('{from}', String(firstVisible + 1))
            .replace('{to}', String(Math.min(firstVisible + pageSize, matching.length)))
            .replace('{total}', String(matching.length))
        : zeroDiscussions;
    }
    if (previousButton) previousButton.disabled = currentPage <= 1;
    if (nextButton) nextButton.disabled = currentPage >= pageCount;

    if (pageButtons) {
      pageButtons.replaceChildren(
        ...Array.from({ length: pageCount }, (_, index) => {
          const button = document.createElement('button');
          const page = index + 1;
          button.type = 'button';
          button.textContent = String(page);
          button.setAttribute('aria-label', `Page ${page}`);
          if (page === currentPage) button.setAttribute('aria-current', 'page');
          button.addEventListener('click', () => {
            currentPage = page;
            updateForum();
          });
          return button;
        }),
      );
    }
  };

  root.addEventListener(
    'click',
    (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const sortButton = target.closest<HTMLButtonElement>('[data-forum-sort]');
      if (sortButton && root.contains(sortButton)) {
        sortButtons().forEach((item) => {
          const active = item === sortButton;
          item.classList.toggle('is-active', active);
          item.setAttribute('aria-pressed', String(active));
        });
        currentPage = 1;
        updateForum();
        return;
      }

      const filterButton = target.closest<HTMLButtonElement>('[data-forum-filter]');
      if (filterButton && root.contains(filterButton)) {
        activeFilter = resolveCategoryFilter(filterButton.dataset.forumFilter ?? 'all');
        filterButtons().forEach((item) => {
          const active = item === filterButton;
          item.classList.toggle('is-active', active);
          item.setAttribute('aria-pressed', String(active));
        });
        currentPage = 1;
        syncCategoryInUrl();
        updateForum();
      }
    },
    { signal },
  );

  previousButton?.addEventListener(
    'click',
    () => {
      currentPage = Math.max(1, currentPage - 1);
      updateForum();
    },
    { signal },
  );
  nextButton?.addEventListener(
    'click',
    () => {
      currentPage += 1;
      updateForum();
    },
    { signal },
  );

  const applyFilterUi = (filter: string) => {
    const match = filterButtons().find((button) => button.dataset.forumFilter === filter);
    filterButtons().forEach((item) => {
      const active = match ? item === match : item.dataset.forumFilter === 'all';
      item.classList.toggle('is-active', active);
      item.setAttribute('aria-pressed', String(active));
    });
    if (!match) activeFilter = 'all';
  };

  const initialFilter = filterButtons().find((button) => button.dataset.forumFilter === activeFilter);
  if (initialFilter) {
    applyFilterUi(activeFilter);
  } else {
    activeFilter = 'all';
    applyFilterUi('all');
  }

  window.addEventListener(
    'hashchange',
    () => {
      activeFilter = readCategoryFilter();
      applyFilterUi(activeFilter);
      currentPage = 1;
      updateForum();
    },
    { signal },
  );

  if (normalizeForumSearch(search.getQuery()).length > 0) {
    currentPage = 1;
  }
  updateForum();
}

function resetForumIndexRoots() {
  document.querySelectorAll<HTMLElement>('[data-forum-index]').forEach((root) => {
    delete root.dataset.forumIndexBound;
    forumIndexControllers.get(root)?.abort();
    forumIndexControllers.delete(root);
  });
}

export function setupForumIndex() {
  const run = () => {
    document.querySelectorAll<HTMLElement>('[data-forum-index]').forEach((root) => {
      if (!document.contains(root)) return;
      initForumIndex(root);
    });
  };

  if (!forumIndexPageLoadBound) {
    forumIndexPageLoadBound = true;
    document.addEventListener('astro:before-swap', resetForumIndexRoots);
    document.addEventListener('astro:page-load', run);
  }

  run();
}
