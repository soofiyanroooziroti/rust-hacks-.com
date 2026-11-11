import EmblaCarousel, { type EmblaCarouselType } from 'embla-carousel';
import Autoplay from 'embla-carousel-autoplay';

export const HERO_AUTOPLAY_MS = 4800;

const heroApis = new WeakMap<HTMLElement, EmblaCarouselType>();

type AutoplayPlugin = ReturnType<typeof Autoplay>;

type HeroProgressController = {
  stop: () => void;
};

function applyProgressScale(progressEl: HTMLElement, scale: number) {
  progressEl.style.transform = `scaleX(${Math.min(1, Math.max(0, scale))})`;
}

function bindHeroDots(
  wrapper: HTMLElement,
  api: EmblaCarouselType,
  autoplay: AutoplayPlugin,
): HeroProgressController {
  const dotsRoot = wrapper.querySelector('[data-hero-embla-dots]');
  if (!dotsRoot) return { stop: () => undefined };

  const dots = Array.from(dotsRoot.querySelectorAll<HTMLButtonElement>('[data-hero-embla-dot]'));
  let progressRaf = 0;

  const activeProgress = () => {
    const index = api.selectedScrollSnap();
    return dots[index]?.querySelector<HTMLElement>('[data-hero-embla-progress]');
  };

  const stopProgressLoop = () => {
    cancelAnimationFrame(progressRaf);
    progressRaf = 0;
  };

  const tickProgress = () => {
    const progress = activeProgress();
    if (progress) {
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reducedMotion) {
        applyProgressScale(progress, 1);
      } else if (autoplay.isPlaying()) {
        const remaining = autoplay.timeUntilNext();
        if (remaining !== null) {
          const elapsed = HERO_AUTOPLAY_MS - remaining;
          applyProgressScale(progress, elapsed / HERO_AUTOPLAY_MS);
        }
      }
    }
    progressRaf = requestAnimationFrame(tickProgress);
  };

  const startProgressLoop = () => {
    stopProgressLoop();
    progressRaf = requestAnimationFrame(tickProgress);
  };

  const syncProgress = () => {
    const index = api.selectedScrollSnap();
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    dots.forEach((dot, i) => {
      const progress = dot.querySelector<HTMLElement>('[data-hero-embla-progress]');
      if (!progress) return;

      progress.classList.remove('hero-embla-progress--running', 'hero-embla-progress--paused', 'hero-embla-progress--filled');

      if (i !== index) {
        applyProgressScale(progress, 0);
        return;
      }

      if (reducedMotion) {
        progress.classList.add('hero-embla-progress--filled');
        applyProgressScale(progress, 1);
        return;
      }

      applyProgressScale(progress, 0);
    });
  };

  const updateDots = () => {
    const index = api.selectedScrollSnap();
    dots.forEach((dot, i) => {
      const active = i === index;
      dot.dataset.active = active ? 'true' : 'false';
      dot.setAttribute('aria-selected', active ? 'true' : 'false');
    });
    syncProgress();
  };

  const resetAutoplayTimer = () => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (autoplay.isPlaying()) autoplay.reset();
  };

  dots.forEach((dot) => {
    const index = Number(dot.getAttribute('data-hero-embla-dot'));
    dot.addEventListener('click', () => {
      api.scrollTo(index);
      resetAutoplayTimer();
    });
  });

  api.on('select', updateDots);
  api.on('reInit', updateDots);

  updateDots();
  startProgressLoop();

  return { stop: stopProgressLoop };
}

function bindArrows(
  carouselRoot: HTMLElement,
  api: EmblaCarouselType,
  onUserNav?: () => void,
) {
  const previousButton = carouselRoot.querySelector<HTMLButtonElement>('[data-sw-carousel-previous]');
  const nextButton = carouselRoot.querySelector<HTMLButtonElement>('[data-sw-carousel-next]');

  previousButton?.addEventListener('click', (event) => {
    event.preventDefault();
    api.scrollPrev();
    onUserNav?.();
  });

  nextButton?.addEventListener('click', (event) => {
    event.preventDefault();
    api.scrollNext();
    onUserNav?.();
  });
}

function bindHeroSlideImages(viewport: HTMLElement) {
  viewport.querySelectorAll('img').forEach((img, index) => {
    if (index > 0) img.loading = 'lazy';
    img.decoding = 'async';
    img.draggable = false;
  });
}

function bindDragUX(viewport: HTMLElement, api: EmblaCarouselType) {
  viewport.querySelectorAll('img').forEach((img) => {
    img.draggable = false;
  });

  let dragMoved = false;

  const setDragging = (dragging: boolean) => {
    viewport.classList.toggle('is-dragging', dragging);
    viewport.dataset.dragging = dragging ? 'true' : 'false';
  };

  api.on('pointerDown', () => {
    dragMoved = false;
    setDragging(true);
  });
  api.on('scroll', () => {
    dragMoved = true;
  });
  api.on('pointerUp', () => setDragging(false));

  viewport.addEventListener(
    'click',
    (event) => {
      if (dragMoved) {
        dragMoved = false;
        event.preventDefault();
        event.stopPropagation();
      }
    },
    true,
  );
}

function initHeroCarousels(root: ParentNode = document) {
  const wraps = [...root.querySelectorAll<HTMLElement>('[data-hero-embla-wrap]')].filter(
    (wrapper) => wrapper.dataset.heroEmblaInited !== 'true',
  );

  if (!wraps.length) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  wraps.forEach((wrapper) => {
    try {
      const carouselRoot = wrapper.querySelector<HTMLElement>('[data-hero-embla]');
      if (!carouselRoot) return;

      const viewport =
        wrapper.querySelector<HTMLElement>('[data-hero-embla-viewport]') ??
        carouselRoot.querySelector<HTMLElement>('[data-sw-carousel-viewport]');
      if (!viewport) {
        console.error('Hero Embla failed to initialize: viewport element not found');
        return;
      }

      const existingApi = heroApis.get(wrapper);
      existingApi?.destroy();

      const autoplay: AutoplayPlugin = Autoplay({
        delay: HERO_AUTOPLAY_MS,
        playOnInit: !reducedMotion,
        stopOnInteraction: false,
        stopOnMouseEnter: false,
        stopOnFocusIn: false,
      });

      const api = EmblaCarousel(
        viewport,
        {
          loop: true,
          duration: 20,
          dragFree: false,
          watchDrag: true,
        },
        [autoplay],
      );

      wrapper.dataset.heroEmblaInited = 'true';
      heroApis.set(wrapper, api);

      const progress = bindHeroDots(wrapper, api, autoplay);
      const resetAutoplayTimer = () => {
        if (!reducedMotion && autoplay.isPlaying()) autoplay.reset();
      };
      bindArrows(carouselRoot, api, resetAutoplayTimer);
      bindHeroSlideImages(viewport);
      bindDragUX(viewport, api);

      api.on('destroy', progress.stop);

      if (reducedMotion) {
        autoplay.stop();
        return;
      }

      if (!reducedMotion && !document.hidden) {
        autoplay.play();
      }
    } catch (error) {
      console.error('Hero Embla failed to initialize:', error);
    }
  });
}

let heroEmblaBootstrapped = false;

export function setupHeroEmbla() {
  const run = () => initHeroCarousels(document);

  if (!heroEmblaBootstrapped) {
    heroEmblaBootstrapped = true;
    document.addEventListener('astro:page-load', run);
    window.addEventListener('load', run, { once: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run, { once: true });
  } else {
    run();
  }
}
