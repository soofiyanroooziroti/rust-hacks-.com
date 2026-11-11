/** Plan toggle + animated price on catalog product cards. */

type Plan = { id: string; priceUsd: number; priceNote: string; label: string };

function formatPrice(usd: number): string {
  return `$${usd}`;
}

function formatPlanLine(plan: Plan): string {
  const suffix = plan.id === 'monthly' ? ' monthly' : ' lifetime';
  return `${formatPrice(plan.priceUsd)}${suffix}`;
}

function initCatalogCard(root: HTMLElement) {
  if (root.dataset.catalogBound === 'true') return;
  root.dataset.catalogBound = 'true';

  const buyUrl = root.getAttribute('data-buy-url');
  const plansRaw = root.getAttribute('data-plans');
  if (!buyUrl || !plansRaw) return;

  let plans: Plan[] = [];
  try {
    plans = JSON.parse(plansRaw) as Plan[];
  } catch {
    return;
  }

  const priceLine = root.querySelector<HTMLElement>('[data-catalog-price-line]');
  const buyBtn = root.querySelector<HTMLAnchorElement>('.catalog-card__buy');
  const toggleButtons = [...root.querySelectorAll<HTMLButtonElement>('[data-catalog-plan]')];
  if (!priceLine || !buyBtn || !toggleButtons.length) return;

  let activeId = toggleButtons.find((b) => b.getAttribute('aria-pressed') === 'true')?.dataset.catalogPlan ?? plans[0]?.id ?? 'monthly';

  const planById = (id: string) => plans.find((p) => p.id === id) ?? plans[0];

  const syncBuyHref = (planId: string) => {
    const separator = buyUrl.includes('?') ? '&' : '?';
    buyBtn.href = `${buyUrl}${separator}plan=${planId}`;
  };

  const renderPrice = (plan: Plan, animate: boolean) => {
    const apply = () => {
      priceLine.textContent = formatPlanLine(plan);
    };

    if (!animate) {
      apply();
      return;
    }

    priceLine.classList.add('is-changing');
    window.setTimeout(() => {
      apply();
      priceLine.classList.remove('is-changing');
    }, 120);
  };

  const setPlan = (planId: string, animate = true) => {
    const plan = planById(planId);
    if (!plan) return;
    activeId = plan.id;
    toggleButtons.forEach((btn) => {
      const active = btn.dataset.catalogPlan === plan.id;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-pressed', String(active));
    });
    renderPrice(plan, animate);
    syncBuyHref(plan.id);
  };

  toggleButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.catalogPlan;
      if (!id || id === activeId) return;
      setPlan(id, true);
    });
  });

  setPlan(activeId, false);
}

export function setupCatalogCards() {
  const run = () => {
    document.querySelectorAll<HTMLElement>('[data-catalog-card]').forEach((root) => {
      if (!document.contains(root)) return;
      initCatalogCard(root);
    });
  };

  run();
  document.addEventListener('astro:page-load', run);
}
