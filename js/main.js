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
        document.body.classList.toggle('is-hero-done', done);
      },
    });

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
    document.documentElement.classList.toggle('is-menu-open', menuOpen);
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
  const heroMotionReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const heroTitleText = document.querySelector('.hero__title-text');
  let heroShineFinished = false;

  const finishHeroTitleShine = () => {
    if (heroShineFinished || !heroTitleText) return;
    heroShineFinished = true;

    gsap.to(heroTitleText, {
      '--hero-white': 1,
      duration: 0.75,
      ease: 'power2.out',
      onComplete: () => {
        heroTitleText.classList.add('is-settled');
        gsap.set(heroTitleText, { clearProps: 'backgroundPosition,--hero-white' });
      },
    });
  };

  if (heroMotionReduced) {
    gsap.set('.hero__title-text, .hero__lead-line, .hero__scroll', { y: 0 });
    gsap.set('.hero__scroll', { opacity: 1 });
    heroTitleText?.classList.add('is-settled');
  } else {
    const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    heroTl.fromTo(
      '.hero__title-text',
      { y: '110%' },
      { y: 0, duration: 0.95, delay: 0.03, ease: 'power4.out' }
    );

    heroTl.fromTo(
      '.hero__lead-line',
      { y: '110%' },
      { y: 0, duration: 0.85, ease: 'power4.out' },
      '>'
    );

    heroTl.fromTo(
      '.hero__title-text',
      { backgroundPosition: '100% 50%' },
      {
        backgroundPosition: '0% 50%',
        duration: 3,
        ease: 'power2.inOut',
        onUpdate() {
          if (this.progress() >= 0.68) {
            finishHeroTitleShine();
          }
        },
        onComplete: finishHeroTitleShine,
      },
      '<-=0.35'
    );

    heroTl.fromTo('.hero__scroll', { opacity: 0 }, { opacity: 1, duration: 0.5 }, '-=0.5');
  }

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

  /* ---- CSR (CMS placeholder) ---- */
  const csrList = document.getElementById('csrList');

  if (csrList) {
    const csrEndpoint = csrList.dataset.cmsEndpoint;

    async function loadCsr() {
      try {
        const res = await fetch(csrEndpoint);
        if (!res.ok) throw new Error('CSR fetch failed');
        const data = await res.json();
        const items = data.items.sort((a, b) => b.date.localeCompare(a.date));

        if (items.length === 0) {
          csrList.innerHTML = '<li class="csr__item"><p class="csr__empty">社会貢献活動の投稿はありません。</p></li>';
          return;
        }

        csrList.innerHTML = items
          .map(
            (item) => `
          <li class="csr__item">
            <time class="csr__date" datetime="${item.date}">${formatDate(item.date)}</time>
            <h3 class="csr__title">${item.title}</h3>
            <p class="csr__body">${item.body}</p>
          </li>`
          )
          .join('');

        gsap.fromTo(
          '.csr__item',
          { opacity: 0, y: 16 },
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            stagger: 0.08,
            ease: 'power2.out',
            overwrite: 'auto',
          }
        );
      } catch {
        if (!csrList.querySelector('.csr__item')) {
          csrList.innerHTML =
            '<li class="csr__item"><p class="csr__empty">社会貢献活動を読み込めませんでした。</p></li>';
        }
      }
    }

    loadCsr();
  }

  /* ---- Recruit interaction ---- */
  const recruitLink = document.querySelector('.recruit__link');

  if (recruitLink) {
    const recruitScene = recruitLink.querySelector('.recruit__scene');
    const recruitCursor = recruitLink.querySelector('.recruit__cursor');
    const recruitCursorBody = recruitLink.querySelector('.recruit__cursor-body');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const canUseCustomCursor = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    const TIMING = {
      gather: prefersReducedMotion ? 0 : 700,
      fade: prefersReducedMotion ? 0 : 350,
      reveal: prefersReducedMotion ? 0 : 450,
    };

    let recruitTimers = [];

    const clearRecruitTimers = () => {
      recruitTimers.forEach(clearTimeout);
      recruitTimers = [];
    };

    const resetRecruitSequence = () => {
      clearRecruitTimers();
      recruitLink.classList.remove('is-active', 'is-gathered', 'is-revealed', 'is-complete');
    };

    const startRecruitSequence = () => {
      if (recruitLink.classList.contains('is-active')) return;

      resetRecruitSequence();
      recruitLink.classList.add('is-active');

      recruitTimers.push(
        setTimeout(() => {
          recruitLink.classList.add('is-gathered');
        }, TIMING.gather)
      );

      recruitTimers.push(
        setTimeout(() => {
          recruitLink.classList.add('is-revealed');
        }, TIMING.gather + TIMING.fade)
      );

      recruitTimers.push(
        setTimeout(() => {
          recruitLink.classList.add('is-complete');
        }, TIMING.gather + TIMING.fade + TIMING.reveal)
      );
    };

    recruitLink.addEventListener('mouseenter', startRecruitSequence);
    recruitLink.addEventListener('mouseleave', resetRecruitSequence);
    recruitLink.addEventListener('focusin', startRecruitSequence);
    recruitLink.addEventListener('focusout', resetRecruitSequence);

    if (canUseCustomCursor && recruitScene && recruitCursor && recruitCursorBody) {
      recruitLink.classList.add('has-custom-cursor');

      const xTo = gsap.quickTo(recruitCursorBody, 'x', { duration: 0.28, ease: 'power3.out' });
      const yTo = gsap.quickTo(recruitCursorBody, 'y', { duration: 0.28, ease: 'power3.out' });

      recruitScene.addEventListener('mousemove', (event) => {
        const rect = recruitScene.getBoundingClientRect();
        xTo(event.clientX - rect.left);
        yTo(event.clientY - rect.top);
      });

      recruitLink.addEventListener('mouseenter', () => {
        recruitCursor.classList.add('is-visible');
      });

      recruitLink.addEventListener('mouseleave', () => {
        recruitCursor.classList.remove('is-visible');
      });
    }
  }
})();
