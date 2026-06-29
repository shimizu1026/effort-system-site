(function () {
  'use strict';

  const accordion = document.getElementById('companiesAccordion');
  if (!accordion) return;

  const panels = accordion.querySelectorAll('.companies__panel');
  const canHoverAccordion = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  if (!canHoverAccordion) {
    panels.forEach((panel) => {
      panel.addEventListener('click', () => {
        const isOpen = panel.classList.contains('is-open');
        panels.forEach((item) => item.classList.remove('is-open'));
        if (!isOpen) panel.classList.add('is-open');
      });
    });
    return;
  }

  panels.forEach((panel) => {
    panel.setAttribute('tabindex', '0');
    panel.addEventListener('focusin', () => {
      panels.forEach((item) => item.classList.remove('is-open'));
      panel.classList.add('is-open');
    });
  });

  accordion.addEventListener('focusout', (event) => {
    if (!accordion.contains(event.relatedTarget)) {
      panels.forEach((item) => item.classList.remove('is-open'));
    }
  });
})();
