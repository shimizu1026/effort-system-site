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

  const STACK = {
    active: { x: 0, y: 0, scale: 1, rotation: 0, opacity: 1, zIndex: 30 },
    behind1: { x: -44, y: 22, scale: 0.94, rotation: -5, opacity: 0.88, zIndex: 20 },
    behind2: { x: -88, y: 44, scale: 0.88, rotation: -8, opacity: 0.65, zIndex: 10 },
    hidden: { x: -108, y: 52, scale: 0.86, rotation: -10, opacity: 0, zIndex: 0 },
    enter: { x: -108, y: 52, scale: 0.86, rotation: -10, opacity: 0, zIndex: 5 },
  };

  let slideEls = [];
  let activeIndex = 0;
  let isAnimating = false;
  let pointerStartX = 0;

  function getOffset(index) {
    const total = slideEls.length;
    return (index - activeIndex + total) % total;
  }

  function stackProps(pos) {
    return {
      xPercent: -50,
      yPercent: -50,
      x: pos.x,
      y: pos.y,
      scale: pos.scale,
      rotation: pos.rotation,
      opacity: pos.opacity,
      zIndex: pos.zIndex,
    };
  }

  function positionForOffset(offset) {
    if (offset === 0) return STACK.active;
    if (offset === 1) return STACK.behind1;
    if (offset === 2) return STACK.behind2;
    return STACK.hidden;
  }

  function applyStackImmediate() {
    slideEls.forEach((el, index) => {
      const offset = getOffset(index);
      const pos = positionForOffset(offset);
      gsap.set(el, stackProps(pos));
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
        <a href="${item.url}" class="card-swiper__card">
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

  function goNext() {
    if (isAnimating || slideEls.length < 2) return;

    isAnimating = true;
    const total = slideEls.length;
    const current = slideEls[activeIndex];
    const nextIndex = (activeIndex + 1) % total;
    const thirdIndex = (activeIndex + 2) % total;
    const fourthIndex = (activeIndex + 3) % total;

    const tl = gsap.timeline({
      onComplete: () => {
        activeIndex = nextIndex;
        applyStackImmediate();
        isAnimating = false;
      },
    });

    tl.to(
      current,
      {
        ...stackProps({
          x: STACK.hidden.x - 16,
          y: STACK.hidden.y + 8,
          scale: STACK.hidden.scale,
          rotation: STACK.hidden.rotation,
          opacity: 0,
          zIndex: 0,
        }),
        duration: DURATION,
        ease: EASE,
      },
      0
    );

    tl.to(slideEls[nextIndex], { ...stackProps(STACK.active), duration: DURATION, ease: EASE }, 0);

    if (total > 2) {
      tl.to(slideEls[thirdIndex], { ...stackProps(STACK.behind1), duration: DURATION, ease: EASE }, 0);
    }

    if (total > 3) {
      tl.fromTo(
        slideEls[fourthIndex],
        stackProps(STACK.enter),
        { ...stackProps(STACK.behind2), duration: DURATION, ease: EASE },
        0
      );
    }
  }

  function goPrev() {
    if (isAnimating || slideEls.length < 2) return;

    isAnimating = true;
    const total = slideEls.length;
    const current = slideEls[activeIndex];
    const prevIndex = (activeIndex - 1 + total) % total;
    const secondIndex = (activeIndex + 1) % total;
    const thirdIndex = (activeIndex + 2) % total;

    gsap.set(slideEls[prevIndex], stackProps(STACK.enter));

    const tl = gsap.timeline({
      onComplete: () => {
        activeIndex = prevIndex;
        applyStackImmediate();
        isAnimating = false;
      },
    });

    tl.to(slideEls[prevIndex], { ...stackProps(STACK.active), duration: DURATION, ease: EASE }, 0);

    tl.to(current, { ...stackProps(STACK.behind1), duration: DURATION, ease: EASE }, 0);

    if (total > 2) {
      tl.to(slideEls[secondIndex], { ...stackProps(STACK.behind2), duration: DURATION, ease: EASE }, 0);
    }

    if (total > 3) {
      tl.to(slideEls[thirdIndex], { ...stackProps(STACK.hidden), duration: DURATION, ease: EASE }, 0);
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

    stage.addEventListener(
      'pointerdown',
      (event) => {
        if (event.pointerType === 'mouse' && event.button !== 0) return;
        pointerStartX = event.clientX;
      },
      { passive: true }
    );

    stage.addEventListener(
      'pointerup',
      (event) => {
        if (isAnimating) return;
        const deltaX = event.clientX - pointerStartX;
        if (Math.abs(deltaX) < SWIPE_THRESHOLD) return;
        if (deltaX < 0) goNext();
        else goPrev();
      },
      { passive: true }
    );
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
    } catch {
      track.innerHTML = '<li class="card-swiper__empty">スライドを読み込めませんでした。</li>';
    }
  }

  init();
})();
