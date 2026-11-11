const DESKTOP_NAV_MQ = '(min-width: 68.75rem)';
const NAV_COMPACT_HYSTERESIS_PX = 8;

function prefersInlineNav(): boolean {
  if (!window.matchMedia(DESKTOP_NAV_MQ).matches) return false;
  const pill = document.querySelector('.site-header-pill');
  return Boolean(pill && !pill.classList.contains('is-nav-compact'));
}

function availableNavSlotWidth(pill: Element): number {
  const logo = pill.querySelector('.site-header-logo');
  const actions = pill.querySelector('.header-actions');
  if (!logo || !actions) return 0;

  const slack = 8;
  const reserve = 12;
  const pillRect = pill.getBoundingClientRect();
  const logoRect = logo.getBoundingClientRect();
  const actionsRect = actions.getBoundingClientRect();
  const columnGap = Number.parseFloat(getComputedStyle(pill).columnGap || '0') || 0;

  return (
    pillRect.width -
    logoRect.width -
    actionsRect.width -
    columnGap * 2 -
    slack * 2 -
    reserve
  );
}

function measureNavIntrinsicWidth(pill: Element): number {
  const navWrap = pill.querySelector<HTMLElement>('.header-nav-wrap');
  const navPill = pill.querySelector<HTMLElement>('.header-nav-pill');
  if (!navWrap || !navPill) return 0;

  navWrap.classList.add('is-nav-measure');
  const width = navPill.scrollWidth;
  navWrap.classList.remove('is-nav-measure');
  return width;
}

function shouldUseCompactNav(pill: Element): boolean {
  const wasCompact = pill.classList.contains('is-nav-compact');
  const needed = measureNavIntrinsicWidth(pill);
  const available = availableNavSlotWidth(pill);

  if (needed <= 0 || available <= 0) return false;

  if (wasCompact) {
    return needed > available - NAV_COMPACT_HYSTERESIS_PX;
  }
  return needed > available + NAV_COMPACT_HYSTERESIS_PX;
}

type NavMoreRoot = HTMLElement & { _navMoreAbort?: AbortController; _navMoreMo?: MutationObserver };

function closeNavMoreDropdown(root?: HTMLElement | null) {
  const openRoot =
    root ??
    document.querySelector<HTMLElement>('[data-header-nav-more].is-open');
  if (!openRoot) return;
  const trigger = openRoot.querySelector<HTMLButtonElement>('[data-nav-more-trigger]');
  const menu = openRoot.querySelector<HTMLElement>('[data-nav-more-menu]');
  openRoot.classList.remove('is-open');
  trigger?.setAttribute('aria-expanded', 'false');
  menu?.setAttribute('aria-hidden', 'true');
}

function updateMoreNavTrigger() {
  const trigger = document.querySelector<HTMLButtonElement>('[data-nav-more-trigger]');
  const menu = document.querySelector('[data-nav-more-menu]');
  if (!trigger || !menu) return;
  const anyActive = menu.querySelector('[data-nav-link].is-active');
  trigger.classList.toggle('is-active', Boolean(anyActive));
  if (anyActive) {
    trigger.setAttribute('aria-current', 'true');
  } else {
    trigger.removeAttribute('aria-current');
  }
}

let navMoreDropdownDocBound = false;

function setupNavMoreDropdown() {
  const root = document.querySelector<NavMoreRoot>('[data-header-nav-more]');
  const trigger = document.querySelector<HTMLButtonElement>('[data-nav-more-trigger]');
  const menu = document.querySelector<HTMLElement>('[data-nav-more-menu]');
  if (!root || !trigger || !menu) return;

  root._navMoreAbort?.abort();
  root._navMoreMo?.disconnect();
  root._navMoreAbort = new AbortController();
  const signal = root._navMoreAbort.signal;

  const close = () => closeNavMoreDropdown(root);

  const open = () => {
    if (!prefersInlineNav()) return;
    root.classList.add('is-open');
    trigger.setAttribute('aria-expanded', 'true');
    menu.setAttribute('aria-hidden', 'false');
  };

  const toggle = () => {
    if (root.classList.contains('is-open')) close();
    else open();
  };

  trigger.addEventListener(
    'click',
    (event) => {
      event.stopPropagation();
      toggle();
    },
    { signal },
  );

  menu.querySelectorAll<HTMLAnchorElement>('[data-nav-link]').forEach((link) => {
    link.addEventListener('click', close, { signal });
  });

  if (!navMoreDropdownDocBound) {
    navMoreDropdownDocBound = true;

    document.addEventListener('click', (event) => {
      const openEl = document.querySelector<HTMLElement>('[data-header-nav-more].is-open');
      if (!openEl) return;
      const target = event.target;
      if (target instanceof Node && openEl.contains(target)) return;
      closeNavMoreDropdown(openEl);
    });

    document.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape') return;
      const openEl = document.querySelector<HTMLElement>('[data-header-nav-more].is-open');
      if (!openEl) return;
      event.preventDefault();
      const openTrigger = openEl.querySelector<HTMLButtonElement>('[data-nav-more-trigger]');
      closeNavMoreDropdown(openEl);
      openTrigger?.focus();
    });

    window.addEventListener(
      'hashchange',
      () => {
        requestAnimationFrame(updateMoreNavTrigger);
      },
      { passive: true },
    );

    document.addEventListener('astro:page-load', () => {
      closeNavMoreDropdown();
      requestAnimationFrame(updateMoreNavTrigger);
    });
  }

  const mo = new MutationObserver(() => updateMoreNavTrigger());
  root._navMoreMo = mo;
  menu.querySelectorAll('[data-nav-link]').forEach((link) => {
    mo.observe(link, { attributes: true, attributeFilter: ['class'] });
  });

  close();
  requestAnimationFrame(updateMoreNavTrigger);
}

function updateHeaderNavLayout() {
  const pill = document.querySelector('.site-header-pill');
  if (!pill) return;

  if (!window.matchMedia(DESKTOP_NAV_MQ).matches) {
    pill.classList.remove('is-nav-compact');
    return;
  }

  const wasCompact = pill.classList.contains('is-nav-compact');
  const shouldCompact = shouldUseCompactNav(pill);

  if (shouldCompact !== wasCompact) {
    pill.classList.toggle('is-nav-compact', shouldCompact);
    if (shouldCompact) closeNavMoreDropdown();
  }
  updateMoreNavTrigger();
}

function throttleRaf(callback: () => void) {
  let scheduled = false;
  return () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      callback();
      scheduled = false;
    });
  };
}

type MenuWithAbort = HTMLElement & { _headerMenuAbort?: AbortController };

function getFocusableElements(root: HTMLElement): HTMLElement[] {
  const selector =
    'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';
  return Array.from(root.querySelectorAll<HTMLElement>(selector)).filter(
    (el) => !el.hasAttribute('disabled') && el.getAttribute('aria-hidden') !== 'true',
  );
}

function setupHeaderMenu() {
  const root = document.querySelector<MenuWithAbort>('[data-header-menu]');
  const dialog = document.querySelector<HTMLDialogElement>('[data-header-menu-dialog]');
  const openBtn = document.querySelector<HTMLButtonElement>('[data-header-menu-open]');
  const closeBtn = document.querySelector<HTMLButtonElement>('[data-header-menu-close]');
  const panel = dialog?.querySelector<HTMLElement>('.header-menu-panel');

  if (!root || !dialog || !openBtn || !panel) return;

  root._headerMenuAbort?.abort();
  root._headerMenuAbort = new AbortController();
  const signal = root._headerMenuAbort.signal;

  const setExpanded = (open: boolean) => {
    openBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
  };

  const unlockScroll = () => {
    document.body.classList.remove('header-menu-scroll-lock');
  };

  const close = () => {
    if (!dialog.open) return;
    dialog.close();
  };

  const open = () => {
    if (dialog.open || prefersInlineNav()) return;
    document.body.classList.add('header-menu-scroll-lock');
    dialog.showModal();
    setExpanded(true);
    const focusables = getFocusableElements(panel);
    focusables[0]?.focus();
  };

  dialog.addEventListener(
    'close',
    () => {
      unlockScroll();
      setExpanded(false);
      openBtn.focus();
    },
    { signal },
  );

  dialog.addEventListener(
    'cancel',
    (event) => {
      event.preventDefault();
      close();
    },
    { signal },
  );

  dialog.addEventListener(
    'click',
    (event) => {
      if (event.target === dialog) close();
    },
    { signal },
  );

  openBtn.addEventListener('click', open, { signal });
  closeBtn?.addEventListener('click', close, { signal });

  panel.querySelectorAll<HTMLAnchorElement>('.header-drawer-nav [data-nav-link]').forEach((link) => {
    link.addEventListener('click', close, { signal });
  });

  panel.querySelector('.header-drawer-cta')?.addEventListener('click', close, { signal });

  dialog.addEventListener(
    'keydown',
    (event) => {
      if (event.key !== 'Tab' || !dialog.open) return;
      const focusables = getFocusableElements(panel);
      if (focusables.length === 0) return;
      const first = focusables[0]!;
      const last = focusables[focusables.length - 1]!;
      const active = document.activeElement as HTMLElement | null;

      if (event.shiftKey) {
        if (active === first || !panel.contains(active)) {
          event.preventDefault();
          last.focus();
        }
      } else if (active === last) {
        event.preventDefault();
        first.focus();
      }
    },
    { signal },
  );

  const onViewportChange = () => {
    if (prefersInlineNav() && dialog.open) {
      close();
    }
  };

  window.addEventListener('resize', throttleRaf(onViewportChange), { passive: true, signal });
  window.matchMedia(DESKTOP_NAV_MQ).addEventListener('change', onViewportChange, { signal });

  if (dialog.open) {
    close();
  }
  setExpanded(false);
  unlockScroll();
}

let headerNavLayoutListenersBound = false;

function initHeaderNav() {
  updateHeaderNavLayout();
  if (!headerNavLayoutListenersBound) {
    headerNavLayoutListenersBound = true;
    const remeasure = throttleRaf(updateHeaderNavLayout);
    window.addEventListener('resize', remeasure, { passive: true });
    window.matchMedia(DESKTOP_NAV_MQ).addEventListener('change', remeasure);
    document.fonts?.ready.then(remeasure).catch(() => {});

    const pill = document.querySelector('.site-header-pill');
    if (typeof ResizeObserver !== 'undefined' && pill) {
      new ResizeObserver(remeasure).observe(pill);
    }
  }

  document.querySelectorAll<HTMLElement>('[data-floating-nav]').forEach((shell) => {
    if (shell.dataset.headerScrollInit !== 'true') {
      shell.dataset.headerScrollInit = 'true';
      const update = () => {
        shell.classList.toggle('is-scrolled', window.scrollY > 10);
      };
      update();
      window.addEventListener('scroll', throttleRaf(update), { passive: true });
    } else {
      shell.classList.toggle('is-scrolled', window.scrollY > 10);
    }
  });

  setupHeaderMenu();
  setupNavMoreDropdown();
}

export function setupHeaderNav() {
  initHeaderNav();
  document.addEventListener('astro:page-load', initHeaderNav);
}

document.addEventListener('astro:before-swap', () => {
  const dialog = document.querySelector<HTMLDialogElement>('[data-header-menu-dialog]');
  if (dialog?.open) dialog.close();
  document.body.classList.remove('header-menu-scroll-lock');
});
