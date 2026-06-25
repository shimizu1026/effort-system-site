(function () {
  'use strict';

  gsap.registerPlugin(ScrollTrigger);

  const header = document.getElementById('header');

  /* ---- Hero video ---- */
  const heroVideo = document.querySelector('.hero__video');
  const heroVideoWrap = document.querySelector('.hero__video-wrap');
  const aboutBody = document.querySelector('.about__body');
  const aboutSection = document.getElementById('about');
  const companiesSection = document.getElementById('companies');

  if (heroVideo && heroVideoWrap && aboutBody && aboutSection && companiesSection) {
    const getHeaderHeight = () => header?.offsetHeight ?? 76;

    const playHero = () => {
      heroVideoWrap.classList.add('is-playing');
      heroVideo.play().catch(() => {});
    };

    heroVideo.addEventListener('loadeddata', playHero);
    heroVideo.addEventListener('canplay', playHero);

    if (heroVideo.readyState >= 2) {
      playHero();
    }

    const fadeScroll = {
      trigger: aboutBody,
      start: () => `top top+=${getHeaderHeight()}`,
      endTrigger: companiesSection,
      end: 'center center',
      scrub: 0.6,
      invalidateOnRefresh: true,
    };

    ScrollTrigger.create({
      ...fadeScroll,
      onUpdate: (self) => {
        const done = self.progress >= 0.98;
        heroVideoWrap.classList.toggle('is-hidden', done);
        aboutSection.classList.toggle('is-on-white', self.progress >= 0.15);
        document.body.classList.toggle('is-hero-done', done);
      },
    });

    gsap.fromTo('.hero__fade', { opacity: 0 }, { opacity: 1, ease: 'none', scrollTrigger: { ...fadeScroll } });

    gsap.fromTo(
      heroVideoWrap,
      { opacity: 1, filter: 'blur(0px)' },
      { opacity: 0, filter: 'blur(12px)', ease: 'none', scrollTrigger: { ...fadeScroll } }
    );

    gsap.fromTo(
      companiesSection,
      { opacity: 0 },
      { opacity: 1, ease: 'none', scrollTrigger: { ...fadeScroll } }
    );
  }

  /* ---- Header scroll ---- */
  if (header) {
    ScrollTrigger.create({
      start: 'top -80',
      onUpdate: (self) => {
        header.classList.toggle('is-scrolled', self.scroll() > 80);
      },
    });
  }

  /* ---- Page top ---- */
  const pagetop = document.getElementById('pagetop');

  if (pagetop) {
    ScrollTrigger.create({
      start: 'top -400',
      onUpdate: (self) => {
        pagetop.classList.toggle('is-visible', self.scroll() > 400);
      },
    });

    pagetop.addEventListener('click', (e) => {
      e.preventDefault();
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });
  }

  /* ---- Global menu ---- */
  const menuBtn = document.getElementById('menuBtn');
  const globalNav = document.getElementById('globalNav');
  const navBackdrop = document.getElementById('navBackdrop');
  let menuOpen = false;

  function setMenuOpen(open) {
    menuOpen = open;
    menuBtn.classList.toggle('is-open', menuOpen);
    globalNav.classList.toggle('is-open', menuOpen);
    navBackdrop.classList.toggle('is-open', menuOpen);
    document.body.classList.toggle('is-menu-open', menuOpen);
    menuBtn.setAttribute('aria-expanded', String(menuOpen));
    menuBtn.setAttribute('aria-label', menuOpen ? 'メニューを閉じる' : 'メニューを開く');
    globalNav.hidden = !menuOpen;
    navBackdrop.hidden = !menuOpen;
  }

  menuBtn.addEventListener('click', () => {
    setMenuOpen(!menuOpen);
  });

  navBackdrop.addEventListener('click', () => {
    setMenuOpen(false);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menuOpen) {
      setMenuOpen(false);
    }
  });

  globalNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      setMenuOpen(false);
    });
  });

  /* ---- Hero animation ---- */
  const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  heroTl
    .fromTo('.hero__title-line', { y: '110%', opacity: 0 }, { y: 0, opacity: 1, duration: 1.2, delay: 0.3 })
    .fromTo('.hero__lead', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9 }, '-=0.5')
    .fromTo('.hero__scroll', { opacity: 0 }, { opacity: 1, duration: 0.8 }, '-=0.3');

  gsap.fromTo('.hero-areas .hero__guide', { y: 20, opacity: 0 }, {
    scrollTrigger: {
      trigger: '#heroAreas',
      start: 'top 80%',
      toggleActions: 'play none none none',
    },
    y: 0,
    opacity: 1,
    duration: 0.8,
    ease: 'power3.out',
  });

  gsap.fromTo('.hero__area-btn', { y: 24, opacity: 0 }, {
    scrollTrigger: {
      trigger: '#heroAreas',
      start: 'top 75%',
      toggleActions: 'play none none none',
    },
    y: 0,
    opacity: 1,
    duration: 0.6,
    stagger: 0.08,
    ease: 'power3.out',
  });

  /* ---- Scroll-triggered sections ---- */
  gsap.utils.toArray('[data-animate]').forEach((el) => {
    gsap.to(el, {
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
      opacity: 1,
      y: 0,
      duration: 0.9,
      ease: 'power3.out',
    });
  });

  /* ---- Companies stack scroll ---- */
  ScrollTrigger.matchMedia({
    '(min-width: 901px)': () => {
      const stack = document.getElementById('companiesStack');
      if (!stack || !header) return;

      const cards = gsap.utils.toArray('.company-card--stack', stack);
      const stackOffset = 18;
      const scaleStep = 0.04;
      const scaleMin = 0.91;

      const syncStackTop = () => {
        stack.style.setProperty('--stack-top-base', `${header.offsetHeight}px`);
      };

      syncStackTop();

      const trigger = ScrollTrigger.create({
        trigger: stack,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 0.6,
        invalidateOnRefresh: true,
        onUpdate: () => {
          const riseRange = window.innerHeight * 0.5;

          cards.forEach((card, i) => {
            const stickTop = header.offsetHeight + i * stackOffset;
            const progress = gsap.utils.clamp(
              0,
              1,
              1 - (card.getBoundingClientRect().top - stickTop) / riseRange
            );
            gsap.set(card, { y: (1 - progress) * 96, scale: 1 });
          });

          cards.forEach((card, j) => {
            if (j === cards.length - 1) return;

            let scale = 1;
            const stickTop = header.offsetHeight + j * stackOffset;

            for (let i = j + 1; i < cards.length; i++) {
              const stickTopNext = header.offsetHeight + i * stackOffset;
              const progress = gsap.utils.clamp(
                0,
                1,
                1 - (cards[i].getBoundingClientRect().top - stickTopNext) / riseRange
              );
              const endScale = Math.max(scaleMin, 0.95 - (i - j - 1) * scaleStep);
              scale = Math.min(scale, gsap.utils.interpolate(1, endScale, progress));
            }

            const props = { scale };
            if (card.getBoundingClientRect().top <= stickTop + 1) {
              props.y = 0;
            }
            gsap.set(card, props);
          });
        },
      });

      const onResize = () => {
        syncStackTop();
        ScrollTrigger.refresh();
      };

      window.addEventListener('resize', onResize);

      return () => {
        window.removeEventListener('resize', onResize);
        trigger.kill();
        gsap.set(cards, { clearProps: 'transform' });
      };
    },
  });

  /* ---- News (CMS placeholder) ---- */
  const newsList = document.getElementById('newsList');
  const newsMonth = document.getElementById('newsMonth');
  const newsMonthTrigger = document.getElementById('newsMonthTrigger');
  const newsMonthValue = document.getElementById('newsMonthValue');
  const newsMonthList = document.getElementById('newsMonthList');
  const newsCompanyFilter = document.getElementById('newsCompanyFilter');
  const cmsEndpoint = newsList.dataset.cmsEndpoint;
  const DISPLAY_LIMIT = 3;

  const companyImages = {
    'effort-system': 'assets/images/eft-system.jpg',
    'effort-advance': 'assets/images/eft-advance.jpg',
    'eft-sanyo': 'assets/images/eft.jpg',
  };

  let allNewsItems = [];
  let activeCompany = 'effort-system';
  let activeMonth = 'all';

  /**
   * CMS連携時はこの関数の fetch 先をAPIエンドポイントに変更する。
   * 期待するレスポンス形式: { items: [{ date, title, url, company?, category?, image? }] }
   */
  async function loadNews() {
    try {
      const res = await fetch(cmsEndpoint);
      if (!res.ok) throw new Error('News fetch failed');
      const data = await res.json();
      allNewsItems = data.items.sort((a, b) => b.date.localeCompare(a.date));
      populateMonthOptions(allNewsItems);
      bindNewsFilters();
      renderNews();
    } catch {
      newsList.innerHTML =
        '<li class="news__item"><p class="news__empty">お知らせを読み込めませんでした。</p></li>';
    }
  }

  function populateMonthOptions(items) {
    const months = [...new Set(items.map((item) => item.date.slice(0, 7)))].sort((a, b) => b.localeCompare(a));

    newsMonthList.innerHTML =
      `<li>
        <button type="button" class="news__month-btn is-active" data-month="all" role="option" aria-selected="true">
          年月を選択
        </button>
      </li>` +
      months
        .map((ym) => {
          const [y, m] = ym.split('-');
          return `<li>
            <button type="button" class="news__month-btn" data-month="${ym}" role="option" aria-selected="false">
              ${y}年${m}月
            </button>
          </li>`;
        })
        .join('');
  }

  function setMonthOpen(open) {
    newsMonth.classList.toggle('is-open', open);
    newsMonthTrigger.setAttribute('aria-expanded', String(open));
  }

  function selectMonth(btn) {
    activeMonth = btn.dataset.month;
    newsMonthValue.textContent = btn.textContent.trim();

    newsMonthList.querySelectorAll('.news__month-btn').forEach((el) => {
      const isActive = el === btn;
      el.classList.toggle('is-active', isActive);
      el.setAttribute('aria-selected', String(isActive));
    });

    setMonthOpen(false);
    renderNews();
  }

  function bindNewsFilters() {
    newsMonthTrigger.addEventListener('click', () => {
      setMonthOpen(!newsMonth.classList.contains('is-open'));
    });

    newsMonthList.addEventListener('click', (e) => {
      const btn = e.target.closest('.news__month-btn');
      if (btn) selectMonth(btn);
    });

    document.addEventListener('click', (e) => {
      if (!newsMonth.contains(e.target)) {
        setMonthOpen(false);
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && newsMonth.classList.contains('is-open')) {
        setMonthOpen(false);
        newsMonthTrigger.focus();
      }
    });

    newsCompanyFilter.querySelectorAll('.news__company-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        activeCompany = btn.dataset.company;
        newsCompanyFilter.querySelectorAll('.news__company-btn').forEach((el) => {
          const isActive = el === btn;
          el.classList.toggle('is-active', isActive);
          el.setAttribute('aria-pressed', String(isActive));
        });
        renderNews();
      });
    });
  }

  function getFilteredNews() {
    return allNewsItems.filter((item) => {
      if (activeCompany !== 'all' && item.company !== activeCompany) return false;
      if (activeMonth !== 'all' && item.date.slice(0, 7) !== activeMonth) return false;
      return true;
    });
  }

  function renderNews() {
    const filtered = getFilteredNews().slice(0, DISPLAY_LIMIT);

    if (filtered.length === 0) {
      newsList.innerHTML = '<li class="news__item"><p class="news__empty">該当するお知らせはありません。</p></li>';
      return;
    }

    newsList.innerHTML = filtered
      .map((item, index) => {
        const image = item.image || companyImages[item.company] || companyImages['effort-system'];
        const category = item.category || 'お知らせ';
        const isFeatured = index === 0;

        return `
      <li class="news__item${isFeatured ? ' news__item--featured' : ''}">
        <a href="${item.url}" class="news__link">
          <div class="news__thumb">
            <img src="${image}" alt="" width="${isFeatured ? 280 : 100}" height="${isFeatured ? 210 : 72}" loading="lazy" />
          </div>
          <div class="news__body">
            <span class="news__title">${item.title}</span>
            <div class="news__meta">
              <span class="news__category">${category}</span>
              <time class="news__date" datetime="${item.date}">${formatDate(item.date)}</time>
            </div>
          </div>
          <span class="news__arrow" aria-hidden="true">→</span>
        </a>
      </li>`;
      })
      .join('');

    gsap.from('.news__item', {
      opacity: 0,
      y: 16,
      duration: 0.5,
      stagger: 0.08,
      ease: 'power2.out',
      overwrite: 'auto',
    });
  }

  function formatDate(dateStr) {
    const d = new Date(dateStr);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}.${m}.${day}`;
  }

  loadNews();
})();
