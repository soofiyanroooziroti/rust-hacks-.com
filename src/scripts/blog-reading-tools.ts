const RING_RADIUS = 15.5;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

type ReadingToolsState = {
  root: HTMLElement;
  article: HTMLElement;
  percentEl: HTMLElement;
  minutesEl: HTMLElement;
  ringProgress: SVGCircleElement;
  totalMinutes: number;
};

const instances = new Set<ReadingToolsState>();
let scrollScheduled = false;
let scrollListenersBound = false;

function parseReadMinutes(readTime: string): number {
  const match = readTime.match(/(\d+)/);
  return match ? Number(match[1]) : 5;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function updateProgress(state: ReadingToolsState) {
  const { article, percentEl, minutesEl, ringProgress, totalMinutes, root } = state;
  const rect = article.getBoundingClientRect();
  const articleTop = window.scrollY + rect.top;
  const articleHeight = article.offsetHeight;
  const viewport = window.innerHeight;
  const scrollRange = Math.max(articleHeight - viewport * 0.35, 1);
  const scrolled = window.scrollY - articleTop + viewport * 0.15;
  const progress = clamp(scrolled / scrollRange, 0, 1);
  const percent = Math.round(progress * 100);
  const minutesLeft = Math.max(0, Math.ceil(totalMinutes * (1 - progress)));

  percentEl.textContent = `${percent}%`;
  minutesEl.textContent = minutesLeft === 1 ? '1 min left' : `${minutesLeft} min left`;
  ringProgress.style.strokeDashoffset = `${RING_CIRCUMFERENCE * (1 - progress)}`;
  root.setAttribute('data-reading-progress', String(percent));
}

function onScrollOrResize() {
  if (scrollScheduled) return;
  scrollScheduled = true;
  requestAnimationFrame(() => {
    instances.forEach(updateProgress);
    scrollScheduled = false;
  });
}

function bindScrollListeners() {
  if (scrollListenersBound) return;
  scrollListenersBound = true;
  window.addEventListener('scroll', onScrollOrResize, { passive: true });
  window.addEventListener('resize', onScrollOrResize, { passive: true });
}

function setupReadingTools(root: HTMLElement) {
  if (root.dataset.readingToolsInit === 'true') return;

  const article = document.querySelector<HTMLElement>('[data-blog-reading-article]');
  const percentEl = root.querySelector<HTMLElement>('[data-reading-percent]');
  const minutesEl = root.querySelector<HTMLElement>('[data-reading-minutes-left]');
  const ringProgress = root.querySelector<SVGCircleElement>('[data-reading-ring-progress]');
  const copyBtn = root.querySelector<HTMLButtonElement>('[data-reading-copy]');
  const copyLabel = root.querySelector<HTMLElement>('[data-reading-copy-label]');
  const copyIconDefault = root.querySelector<HTMLElement>('[data-reading-copy-icon-default]');
  const copyIconSuccess = root.querySelector<HTMLElement>('[data-reading-copy-icon-success]');
  const topBtn = root.querySelector<HTMLButtonElement>('[data-reading-top]');

  if (!article || !percentEl || !minutesEl || !ringProgress || !copyBtn || !copyLabel) return;

  root.dataset.readingToolsInit = 'true';

  const totalMinutes = parseReadMinutes(root.getAttribute('data-read-time') ?? '5 min read');
  const postUrl = root.getAttribute('data-post-url') ?? window.location.href;

  ringProgress.style.strokeDasharray = `${RING_CIRCUMFERENCE}`;
  ringProgress.style.strokeDashoffset = `${RING_CIRCUMFERENCE}`;

  const state: ReadingToolsState = {
    root,
    article,
    percentEl,
    minutesEl,
    ringProgress,
    totalMinutes,
  };
  instances.add(state);
  bindScrollListeners();
  updateProgress(state);

  let copyResetTimer: number | undefined;

  function setCopyState(copied: boolean) {
    copyBtn.setAttribute('aria-pressed', copied ? 'true' : 'false');
    copyLabel.textContent = copied ? 'Copied' : 'Copy link';
    copyIconDefault?.classList.toggle('is-hidden', copied);
    copyIconSuccess?.classList.toggle('is-hidden', !copied);
  }

  copyBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(postUrl);
      setCopyState(true);
      if (copyResetTimer) window.clearTimeout(copyResetTimer);
      copyResetTimer = window.setTimeout(() => setCopyState(false), 2000);
    } catch {
      setCopyState(false);
    }
  });

  topBtn?.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
    });
  });
}

function initReadingTools() {
  instances.clear();
  document.querySelectorAll<HTMLElement>('[data-blog-reading-tools]').forEach((root) => {
    root.removeAttribute('data-reading-tools-init');
    setupReadingTools(root);
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initReadingTools);
} else {
  initReadingTools();
}

document.addEventListener('astro:page-load', initReadingTools);
