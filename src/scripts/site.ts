function initFonts() {
  const root = document.documentElement;

  const markReady = () => {
    root.classList.remove('fonts-pending');
    root.classList.add('fonts-ready');
  };

  if (!document.fonts?.ready) {
    markReady();
    return;
  }

  document.fonts.ready.then(markReady).catch(markReady);
}

function normalizeNavPath(pathname: string): string {
  const stripped = pathname.replace(/\/index\.html$/, '');
  if (stripped === '' || stripped === '/') return '/';
  return stripped.endsWith('/') ? stripped.slice(0, -1) : stripped;
}

/** `/` or `/tr` — locale home only, not every page under that prefix. */
function isLocaleHomePath(path: string): boolean {
  if (path === '/') return true;
  const segment = path.split('/').filter(Boolean)[0]?.toLowerCase();
  if (!segment) return false;
  const locales = ['en'];
  return path.split('/').filter(Boolean).length === 1 && locales.includes(segment);
}

function initNavHighlight() {
  const update = () => {
    const path = normalizeNavPath(window.location.pathname);
    const hash = window.location.hash;

    document.querySelectorAll<HTMLAnchorElement>('[data-nav-link]').forEach((link) => {
      const href = link.getAttribute('href') ?? '';
      let linkPath = '/';
      let linkHash = '';

      try {
        const url = new URL(href, window.location.origin);
        linkPath = normalizeNavPath(url.pathname);
        linkHash = url.hash;
      } catch {
        const [pathPart, hashPart] = href.split('#');
        linkPath = normalizeNavPath(pathPart || '/');
        linkHash = hashPart ? `#${hashPart}` : '';
      }

      let isActive = false;

      if (isLocaleHomePath(linkPath) && !linkHash) {
        isActive = path === linkPath && !hash;
      } else if (linkHash) {
        isActive = path === linkPath && hash === linkHash;
      } else {
        isActive = path === linkPath || path.startsWith(`${linkPath}/`);
      }

      link.classList.toggle('is-active', isActive);
      if (isActive) {
        link.setAttribute('aria-current', linkHash ? 'true' : 'page');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  };

  update();
  window.addEventListener('hashchange', update);
}

let searchModulePromise: Promise<typeof import('./site-search.js')> | null = null;

function loadSiteSearchModule() {
  if (!searchModulePromise) {
    searchModulePromise = import('./site-search.js');
  }
  return searchModulePromise;
}

function initDeferredSiteSearch() {
  document.addEventListener(
    'click',
    (event) => {
      const btn = (event.target as Element | null)?.closest<HTMLButtonElement>('[data-site-search-open]');
      if (!btn) return;
      if (btn.dataset.searchPrimed === 'true') return;
      event.preventDefault();
      event.stopImmediatePropagation();
      void loadSiteSearchModule().then((m) => {
        m.attachSiteSearch();
        btn.dataset.searchPrimed = 'true';
        m.openSiteSearch(btn);
      });
    },
    true,
  );

  document.addEventListener('keydown', (event) => {
    if (isTypingField(event.target)) return;

    const slashOnly = event.key === '/' && !event.ctrlKey && !event.metaKey && !event.altKey;
    const ctrlSlash = event.key === '/' && (event.ctrlKey || event.metaKey);
    if (!slashOnly && !ctrlSlash) return;

    event.preventDefault();
    void loadSiteSearchModule().then((m) => {
      m.attachSiteSearch();
      m.openSiteSearch(document.querySelector<HTMLButtonElement>('[data-site-search-open]'));
    });
  });
}

function isTypingField(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  if (!el) return false;
  if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT') return true;
  return el.isContentEditable;
}

function onAstroPageLoad() {
  initNavHighlight();
  scheduleSearchQueryHighlight();
  void loadSiteSearchModule().then((m) => {
    m.resetSiteSearchBinding();
  });
  document.querySelectorAll<HTMLButtonElement>('[data-site-search-open]').forEach((btn) => {
    delete btn.dataset.searchPrimed;
  });
}

function initInPageScroll() {
  document.querySelectorAll<HTMLElement>('[data-scroll-target]').forEach((el) => {
    el.addEventListener('click', (event) => {
      const id = el.getAttribute('data-scroll-target');
      if (!id) return;

      const target = document.getElementById(id);
      if (!target) return;

      event.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

function initSkipLink() {
  document.querySelectorAll<HTMLElement>('[data-skip-to-main]').forEach((button) => {
    button.addEventListener('click', () => {
      const main = document.getElementById('main-content');
      if (!main) return;

      main.setAttribute('tabindex', '-1');
      main.focus({ preventScroll: false });
      main.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

function initFaqFilters() {
  document.querySelectorAll('[data-faq-filters]').forEach((container) => {
    const section = container.closest('[data-faq-section]');
    const list = section?.querySelector('[data-faq-list]');
    if (!list) return;

    const items = list.querySelectorAll<HTMLElement>('[data-faq-topic]');
    const chips = container.querySelectorAll<HTMLButtonElement>('[data-faq-filter]');

    chips.forEach((chip) => {
      chip.addEventListener('click', () => {
        const topic = chip.getAttribute('data-faq-filter');
        chips.forEach((c) => c.classList.toggle('is-active', c === chip));
        items.forEach((item) => {
          const itemTopic = item.getAttribute('data-faq-topic');
          const show = topic === 'all' || itemTopic === topic;
          item.toggleAttribute('data-hidden', !show);
        });
      });
    });
  });
}

function initThemeMetaColor() {
  const metaTheme = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  if (!metaTheme) return;

  const update = () => {
    metaTheme.content = document.documentElement.classList.contains('dark') ? '#7F3DEE' : '#f5f7fa';
  };

  update();
  const observer = new MutationObserver(update);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
}

function scheduleSearchQueryHighlight() {
  const query = new URLSearchParams(window.location.search).get('q')?.trim() ?? '';
  if (query.length < 2) return;

  const run = () => {
    void import('./search-query-highlight.js');
  };

  if ('requestIdleCallback' in window) {
    requestIdleCallback(run, { timeout: 2500 });
  } else {
    setTimeout(run, 1);
  }
}

let heroBootstrapScheduled = false;

function scheduleHeroEmbla() {
  if (heroBootstrapScheduled) return;
  const wraps = document.querySelectorAll('[data-hero-embla-wrap]');
  if (!wraps.length) return;
  heroBootstrapScheduled = true;

  const run = () => {
    void import('./hero-embla.ts').then((m) => m.setupHeroEmbla());
  };

  const start = () => {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(run, { timeout: 2500 });
    } else {
      setTimeout(run, 1);
    }
  };

  const observer = new IntersectionObserver(
    (entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        observer.disconnect();
        start();
      }
    },
    { rootMargin: '120px' },
  );

  wraps.forEach((wrap) => observer.observe(wrap));
}

function scheduleDeferredClient() {
  const run = () => {
    void import('./language-switcher.ts').then((m) => m.setupLanguageSwitchers());
    void import('./header-nav.ts').then((m) => m.setupHeaderNav());
    void import('./forum-index.ts').then((m) => m.setupForumIndex());
    void import('./products-carousel.ts').then((m) => m.setupProductsCarousel());
    initFaqFilters();
    initInPageScroll();
    initNavHighlight();
    scheduleHeroEmbla();
  };

  if ('requestIdleCallback' in window) {
    requestIdleCallback(run, { timeout: 3000 });
  } else {
    setTimeout(run, 1);
  }
}

function bootSite() {
  initFonts();
  initSkipLink();
  initThemeMetaColor();
  initDeferredSiteSearch();
  scheduleSearchQueryHighlight();
  void import('./catalog-card.ts').then((m) => m.setupCatalogCards());
  scheduleDeferredClient();
  document.addEventListener('astro:page-load', onAstroPageLoad);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootSite);
} else {
  bootSite();
}
