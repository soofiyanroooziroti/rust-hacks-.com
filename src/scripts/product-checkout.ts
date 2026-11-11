/** Product page checkout panel — plan sync, animated total, panel glow. */

type Plan = { id: string; priceUsd: number; priceNote: string; label?: string };

function parsePrice(text: string | null | undefined): number {
  const match = text?.match(/\d+/);
  return match ? Number(match[0]) : 0;
}

function animateTotal(el: HTMLElement, target: number) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    el.textContent = `$${target}`;
    return;
  }

  const start = parsePrice(el.textContent);
  if (start === target) return;

  el.classList.add('is-animating');
  const duration = 280;
  const t0 = performance.now();

  const tick = (now: number) => {
    const progress = Math.min(1, (now - t0) / duration);
    const eased = 1 - (1 - progress) ** 3;
    const value = Math.round(start + (target - start) * eased);
    el.textContent = `$${value}`;
    if (progress < 1) requestAnimationFrame(tick);
    else el.classList.remove('is-animating');
  };

  requestAnimationFrame(tick);
}

function initProductCheckoutPanel(root: HTMLElement) {
  if (root.dataset.checkoutBound === 'true') return;
  root.dataset.checkoutBound = 'true';

  const buyUrl = root.getAttribute('data-buy-url');
  const plansRaw = root.getAttribute('data-plans');
  if (!buyUrl || !plansRaw) return;

  let plans: Plan[] = [];
  try {
    plans = JSON.parse(plansRaw) as Plan[];
  } catch {
    return;
  }

  const shell = root.querySelector<HTMLElement>('.product-checkout__shell');
  const group = root.querySelector<HTMLElement>('[data-sw-radio-group]');
  const totalEl = root.querySelector<HTMLElement>('[data-checkout-total]');
  const noteEl = root.querySelector<HTMLElement>('[data-checkout-note]');
  const buyBtn = root.querySelector<HTMLAnchorElement>('[data-checkout-buy]');
  if (!group || !totalEl || !noteEl || !buyBtn) return;

  shell?.addEventListener('mousemove', (event) => {
    if (!shell) return;
    const rect = shell.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    shell.style.setProperty('--checkout-glow-x', `${x}%`);
    shell.style.setProperty('--checkout-glow-y', `${y}%`);
  });

  shell?.addEventListener('mouseleave', () => {
    shell?.style.setProperty('--checkout-glow-x', '50%');
    shell?.style.setProperty('--checkout-glow-y', '40%');
  });

  const sync = (animate = false) => {
    const planId = group.getAttribute('data-value') ?? plans[0]?.id;
    const plan = plans.find((p) => p.id === planId) ?? plans[0];
    if (!plan) return;

    if (animate) animateTotal(totalEl, plan.priceUsd);
    else totalEl.textContent = `$${plan.priceUsd}`;

    if (animate && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      noteEl.classList.add('is-animating');
      window.setTimeout(() => {
        noteEl.textContent = plan.priceNote;
        noteEl.classList.remove('is-animating');
      }, 90);
    } else {
      noteEl.textContent = plan.priceNote;
    }

    const separator = buyUrl.includes('?') ? '&' : '?';
    buyBtn.href = `${buyUrl}${separator}plan=${plan.id}`;
  };

  let lastPlanId = group.getAttribute('data-value') ?? plans[0]?.id;

  const onPlanChange = () => {
    window.setTimeout(() => {
      const nextId = group.getAttribute('data-value') ?? plans[0]?.id;
      const animate = nextId !== lastPlanId;
      lastPlanId = nextId;
      sync(animate);
    }, 0);
  };

  group.addEventListener('click', onPlanChange);
  const observer = new MutationObserver(onPlanChange);
  observer.observe(group, { attributes: true, attributeFilter: ['data-value'] });
  sync(false);
}

export function setupProductCheckoutPanels() {
  const run = () => {
    document.querySelectorAll<HTMLElement>('[data-product-checkout]').forEach((root) => {
      if (!document.contains(root)) return;
      initProductCheckoutPanel(root);
    });
  };

  run();
  document.addEventListener('astro:page-load', run);
  document.addEventListener('astro:after-swap', run);
}
