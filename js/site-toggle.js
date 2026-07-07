(function () {
  'use strict';

  const toggle = document.querySelector('.header__site-toggle');
  if (!toggle) return;

  const indicator = toggle.querySelector('.header__site-toggle-indicator');
  const links = [...toggle.querySelectorAll('.header__site-toggle-link')];
  if (!indicator || links.length < 2) return;

  const DURATION = 350;

  function getPos(link) {
    const toggleRect = toggle.getBoundingClientRect();
    const linkRect = link.getBoundingClientRect();
    return {
      x: linkRect.left - toggleRect.left,
      y: linkRect.top - toggleRect.top,
      w: linkRect.width,
      h: linkRect.height,
    };
  }

  function placeIndicator(link, animate) {
    const pos = getPos(link);

    if (animate) {
      indicator.style.transition =
        `transform ${DURATION}ms cubic-bezier(0.4,0,0.2,1),` +
        `width ${DURATION}ms cubic-bezier(0.4,0,0.2,1),` +
        `height ${DURATION}ms cubic-bezier(0.4,0,0.2,1),` +
        `background var(--transition)`;
    } else {
      indicator.style.transition = 'none';
    }

    indicator.style.width = `${pos.w}px`;
    indicator.style.height = `${pos.h}px`;
    indicator.style.transform = `translate(${pos.x}px, ${pos.y}px)`;

    if (!animate) {
      indicator.offsetHeight;
      indicator.style.transition = '';
    }
  }

  function setActive(link) {
    links.forEach((el) => {
      el.classList.toggle('is-active', el === link);
      if (el === link) {
        el.setAttribute('aria-current', 'page');
      } else {
        el.removeAttribute('aria-current');
      }
    });
  }

  /* レイアウト確定後に初期位置を設定（二重 rAF で確実に） */
  function init() {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const active = links.find((l) => l.classList.contains('is-active')) || links[0];
        setActive(active);
        placeIndicator(active, false);
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.addEventListener('resize', () => {
    const active = links.find((l) => l.classList.contains('is-active')) || links[0];
    placeIndicator(active, false);
  });

  links.forEach((link) => {
    link.addEventListener('click', (e) => {
      if (link.classList.contains('is-active')) {
        e.preventDefault();
        return;
      }

      e.preventDefault();
      const href = link.getAttribute('href');
      if (!href) return;

      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      setActive(link);
      placeIndicator(link, !reduced);

      setTimeout(() => {
        window.location.href = href;
      }, reduced ? 0 : DURATION);
    });
  });
})();
