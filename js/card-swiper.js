(function () {
  'use strict';

  const stage = document.querySelector('[data-card-swiper]');
  if (!stage || typeof gsap === 'undefined') return;

  const track = stage.querySelector('.card-swiper__track');
  const endpoint = stage.dataset.cmsEndpoint;

  if (!track || !endpoint) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const DURATION = prefersReducedMotion ? 0.01 : 0.7;
  const EASE = 'power2.inOut';
  const SWIPE_THRESHOLD = 48;
  const AUTOPLAY_DELAY = 2500;

  const STACK = {
    active: { x: 0, y: 0, scale: 1, rotation: 0, opacity: 1, zIndex: 30 },
    behind1: { x: -44, y: 22, scale: 0.94, rotation: -5, opacity: 0.88, zIndex: 20 },
    behind2: { x: -88, y: 44, scale: 0.88, rotation: -8, opacity: 0.65, zIndex: 10 },
    hidden: { x: -108, y: 52, scale: 0.86, rotation: -10, opacity: 0, zIndex: 0 },
    leaving: { x: -124, y: 60, scale: 0.84, rotation: -12, opacity: 0, zIndex: 1 },
    enter: { x: -108, y: 52, scale: 0.86, rotation: -10, opacity: 0, zIndex: 5 },
  };

  let slideEls = [];
  let activeIndex = 0;
  let isAnimating = false;
  let pointerStartX = 0;
  let autoplayTimer = null;

  function getOffset(index, baseIndex = activeIndex) {
    const total = slideEls.length;
    return (index - baseIndex + total) % total;
  }

  function positionForOffset(offset) {
    if (offset === 0) return STACK.active;
    if (offset === 1) return STACK.behind1;
    if (offset === 2) return STACK.behind2;
    return STACK.hidden;
  }

  function motionProps(pos) {
    return {
      xPercent: -50,
      yPercent: -50,
      x: pos.x,
      y: pos.y,
      scale: pos.scale,
      rotation: pos.rotation,
      opacity: pos.opacity,
      force3D: true,
    };
  }

  function setSlideState(el, pos) {
    gsap.set(el, motionProps(pos));
    el.style.zIndex = String(pos.zIndex);
  }

  function applyStackImmediate() {
    slideEls.forEach((el, index) => {
      const offset = getOffset(index);
      const pos = positionForOffset(offset);
      setSlideState(el, pos);
      el.classList.toggle('is-active', offset === 0);
      el.classList.toggle('is-behind-1', offset === 1);
      el.classList.toggle('is-behind-2', offset === 2);
      el.style.pointerEvents = offset === 0 ? 'auto' : 'none';
      el.setAttribute('aria-hidden', offset === 0 ? 'false' : 'true');
    });
  }

  function renderSlides(items) {
    track.innerHTML = items
      .map(
        (item, index) => `
      <li class="card-swiper__slide${index === 0 ? ' is-active' : ''}" data-index="${index}">
        <a href="${item.url}" class="card-swiper__card" target="_blank" rel="noopener noreferrer">
          <img src="${item.image}" alt="" width="400" height="500" loading="lazy" />
          <div class="card-swiper__label">
            <span class="card-swiper__category">${item.category}</span>
            <span class="card-swiper__name">${item.name}</span>
          </div>
        </a>
      </li>`
      )
      .join('');

    slideEls = Array.from(track.querySelectorAll('.card-swiper__slide'));
  }

  function animateTransition(newIndex, direction) {
    if (isAnimating || slideEls.length < 2) return;

    isAnimating = true;
    stopAutoplay();

    const tl = gsap.timeline({
      onComplete: () => {
        activeIndex = newIndex;
        applyStackImmediate();
        isAnimating = false;
        startAutoplay();
      },
    });

    slideEls.forEach((el, index) => {
      const targetOffset = getOffset(index, newIndex);
      const targetPos = positionForOffset(targetOffset);
      const isLeavingFront = direction === 1 && index === activeIndex;
      const isEnteringFront = direction === -1 && targetOffset === 0;

      if (isLeavingFront) {
        tl.to(
          el,
          {
            ...motionProps(STACK.leaving),
            duration: DURATION,
            ease: EASE,
            onStart: () => {
              el.style.zIndex = String(STACK.leaving.zIndex);
            },
          },
          0
        );
        return;
      }

      if (isEnteringFront) {
        gsap.set(el, motionProps(STACK.enter));
        el.style.zIndex = String(STACK.enter.zIndex);
        tl.to(
          el,
          {
            ...motionProps(STACK.active),
            duration: DURATION,
            ease: EASE,
            onStart: () => {
              el.style.zIndex = String(STACK.active.zIndex);
            },
          },
          0
        );
        return;
      }

      tl.to(
        el,
        {
          ...motionProps(targetPos),
          duration: DURATION,
          ease: EASE,
          onStart: () => {
            el.style.zIndex = String(targetPos.zIndex);
          },
        },
        0
      );
    });
  }

  function goNext() {
    animateTransition((activeIndex + 1) % slideEls.length, 1);
  }

  function goPrev() {
    animateTransition((activeIndex - 1 + slideEls.length) % slideEls.length, -1);
  }

  function startAutoplay() {
    stopAutoplay();
    if (prefersReducedMotion || slideEls.length < 2) return;

    autoplayTimer = window.setInterval(() => {
      if (isAnimating || document.hidden) return;
      goNext();
    }, AUTOPLAY_DELAY);
  }

  function stopAutoplay() {
    if (autoplayTimer) {
      window.clearInterval(autoplayTimer);
      autoplayTimer = null;
    }
  }

  function bindEvents() {
    stage.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        goNext();
      }
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        goPrev();
      }
    });

    stage.addEventListener('mouseenter', stopAutoplay);
    stage.addEventListener('mouseleave', startAutoplay);
    stage.addEventListener('focusin', stopAutoplay);
    stage.addEventListener('focusout', startAutoplay);

    stage.addEventListener(
      'pointerdown',
      (event) => {
        if (event.pointerType === 'mouse' && event.button !== 0) return;
        pointerStartX = event.clientX;
        stopAutoplay();
      },
      { passive: true }
    );

    stage.addEventListener(
      'pointerup',
      (event) => {
        const deltaX = event.clientX - pointerStartX;
        if (!isAnimating && Math.abs(deltaX) >= SWIPE_THRESHOLD) {
          if (deltaX < 0) goNext();
          else goPrev();
          return;
        }
        startAutoplay();
      },
      { passive: true }
    );

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stopAutoplay();
      else startAutoplay();
    });
  }

  async function init() {
    try {
      const res = await fetch(endpoint);
      if (!res.ok) throw new Error('Products fetch failed');
      const data = await res.json();

      if (!data.items?.length) {
        track.innerHTML = '<li class="card-swiper__empty">スライドを読み込めませんでした。</li>';
        return;
      }

      renderSlides(data.items);
      applyStackImmediate();
      bindEvents();
      startAutoplay();
    } catch {
      track.innerHTML = '<li class="card-swiper__empty">スライドを読み込めませんでした。</li>';
    }
  }

  init();
})();
