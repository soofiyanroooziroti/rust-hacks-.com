/** Home Explore grid — reveal on scroll + cursor spotlight (once). */

function setupExploreSection(root: HTMLElement) {
  if (root.dataset.exploreBound === 'true') return;
  root.dataset.exploreBound = 'true';

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fineHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  const reveal = () => {
    root.classList.add('is-revealed');
  };

  if (reducedMotion) {
    reveal();
  } else {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          reveal();
          observer.disconnect();
        }
      },
      { threshold: 0.08, rootMargin: '0px 0px -4% 0px' },
    );
    observer.observe(root);
  }

  if (!fineHover || reducedMotion) return;

  root.addEventListener('pointermove', (event) => {
    const card = (event.target as Element | null)?.closest<HTMLElement>('[data-explore-card]');
    if (!card) return;
    const rect = card.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    card.style.setProperty('--spot-x', `${x}%`);
    card.style.setProperty('--spot-y', `${y}%`);
  });
}

export function initExploreSections() {
  document.querySelectorAll<HTMLElement>('[data-explore-section]').forEach(setupExploreSection);
}
