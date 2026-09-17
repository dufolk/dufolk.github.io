(function (window, document) {
  'use strict';

  var body = document.body;
  var gsap = window.gsap;
  var ScrollTrigger = window.ScrollTrigger;
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  var pageTypes = [
    ['page-post', 'main article.post-content'],
    ['page-about', '.geek-about'],
    ['page-categories', 'main #board .category-list'],
    ['page-tags', 'main #board .tagcloud'],
    ['page-links', 'main #board .links'],
    ['page-archives', 'main #board .list-group .list-group-item-title'],
    ['page-404', 'body main script'],
    ['page-generic', 'main #board article.page-content'],
    ['page-index', 'main .index-card']
  ];

  pageTypes.some(function (item) {
    if (!document.querySelector(item[1])) return false;
    body.classList.add(item[0]);
    return true;
  });

  if (!body.classList.contains('home-immersive') && !body.classList.contains('about-immersive')) {
    body.classList.add('site-refined');
  }

  if (!gsap || !ScrollTrigger) {
    body.classList.add('motion-fallback');
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  gsap.defaults({ ease: 'power3.out', duration: 0.85 });

  function reveal(targets, options) {
    var elements = gsap.utils.toArray(targets);
    if (!elements.length) return;
    if (reducedMotion) {
      gsap.set(elements, { clearProps: 'all' });
      return;
    }

    var settings = options || {};
    elements.forEach(function (element, index) {
      gsap.fromTo(element, {
        autoAlpha: 0,
        y: settings.y == null ? 34 : settings.y,
        x: settings.x || 0,
        scale: settings.scale || 1,
        rotateX: settings.rotateX || 0
      }, {
        autoAlpha: 1,
        y: 0,
        x: 0,
        scale: 1,
        rotateX: 0,
        duration: settings.duration || 0.8,
        delay: (index % (settings.staggerGroup || 6)) * (settings.stagger || 0.045),
        scrollTrigger: {
          trigger: element,
          start: settings.start || 'top 91%',
          once: true
        }
      });
    });
  }

  function initPageIntro() {
    if (reducedMotion || body.classList.contains('home-immersive') || body.classList.contains('about-immersive')) return;
    var timeline = gsap.timeline();
    timeline
      .from('#navbar', { y: -22, autoAlpha: 0, duration: 0.55 })
      .from('#banner .banner-text', { y: 26, autoAlpha: 0, duration: 0.8 }, '-=0.2')
      .from('#banner .post-meta', { y: 12, autoAlpha: 0, duration: 0.5 }, '-=0.5');

    var banner = document.getElementById('banner');
    if (banner) {
      gsap.to(banner, {
        backgroundPosition: '50% 62%',
        ease: 'none',
        scrollTrigger: {
          trigger: banner,
          start: 'top top',
          end: 'bottom top',
          scrub: 0.8
        }
      });
    }
  }

  function initReadingProgress() {
    var bar = document.querySelector('.reading-progress span');
    var article = document.querySelector('.post-content');
    if (!bar || !article) return;

    gsap.set(bar, { scaleX: 0, transformOrigin: 'left center' });
    ScrollTrigger.create({
      trigger: article,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: function (self) {
        gsap.set(bar, { scaleX: self.progress });
      }
    });
  }

  function initGenericReveals() {
    if (body.classList.contains('home-immersive') || body.classList.contains('about-immersive')) return;

    if (body.classList.contains('page-post')) {
      reveal('.markdown-body > h1, .markdown-body > h2, .markdown-body > h3', {
        y: 22,
        duration: 0.65,
        start: 'top 92%'
      });
      reveal('.markdown-body > p, .markdown-body > blockquote, .markdown-body > ul, .markdown-body > ol', {
        y: 18,
        duration: 0.65,
        start: 'top 94%'
      });
      reveal('.markdown-body > figure, .markdown-body > pre, .markdown-body > .code-wrapper, .markdown-body > table, .markdown-body > img', {
        y: 28,
        scale: 0.985,
        duration: 0.75
      });
      reveal('.license-box, .post-prevnext, #comments', { y: 24 });
      return;
    }

    var selectorMap = {
      'page-index': '.index-card',
      'page-archives': '#board .list-group > .h4, #board .list-group > .h5, #board .list-group > a.list-group-item',
      'page-categories': '#board .category-list > .category',
      'page-tags': '#board .tagcloud > a',
      'page-links': '#board .links > .card, #board .custom, #comments',
      'page-generic': '#board article.page-content > *',
      'page-404': '#banner .banner-text, .lost-signal > *'
    };

    Object.keys(selectorMap).some(function (pageClass) {
      if (!body.classList.contains(pageClass)) return false;
      reveal(selectorMap[pageClass], {
        y: 20,
        scale: 0.99,
        duration: 0.42,
        stagger: 0.03,
        start: 'top 99%'
      });
      return true;
    });
  }

  function initMagneticElements() {
    if (!finePointer || reducedMotion) return;
    var targets = gsap.utils.toArray('.hero-button, .about-primary, .about-icon, #scroll-top-button');

    targets.forEach(function (element) {
      element.addEventListener('pointermove', function (event) {
        var rect = element.getBoundingClientRect();
        gsap.to(element, {
          x: (event.clientX - rect.left - rect.width / 2) * 0.16,
          y: (event.clientY - rect.top - rect.height / 2) * 0.16,
          duration: 0.35,
          overwrite: true
        });
      });
      element.addEventListener('pointerleave', function () {
        gsap.to(element, { x: 0, y: 0, duration: 0.55, ease: 'elastic.out(1, 0.45)' });
      });
    });
  }

  function initCardTilt() {
    if (!finePointer || reducedMotion) return;
    var cards = gsap.utils.toArray('.index-card, .links .card-body, .stat-tile, .about-project-grid > article');

    cards.forEach(function (card) {
      card.addEventListener('pointermove', function (event) {
        var rect = card.getBoundingClientRect();
        var px = (event.clientX - rect.left) / rect.width - 0.5;
        var py = (event.clientY - rect.top) / rect.height - 0.5;
        card.style.setProperty('--pointer-x', ((px + 0.5) * 100) + '%');
        card.style.setProperty('--pointer-y', ((py + 0.5) * 100) + '%');
        gsap.to(card, {
          rotateY: px * 3.5,
          rotateX: py * -3,
          y: -5,
          transformPerspective: 900,
          duration: 0.35,
          overwrite: true
        });
      });
      card.addEventListener('pointerleave', function () {
        gsap.to(card, { rotateX: 0, rotateY: 0, y: 0, duration: 0.6, ease: 'power3.out' });
      });
    });
  }

  function initAmbientMotion() {
    if (reducedMotion) return;
    gsap.to('.site-ambient-orb-a', { xPercent: 18, yPercent: 12, duration: 16, repeat: -1, yoyo: true, ease: 'sine.inOut' });
    gsap.to('.site-ambient-orb-b', { xPercent: -14, yPercent: -10, duration: 19, repeat: -1, yoyo: true, ease: 'sine.inOut' });
    gsap.to('.site-ambient-grid', {
      yPercent: 8,
      ease: 'none',
      scrollTrigger: { trigger: document.documentElement, start: 'top top', end: 'bottom bottom', scrub: 1.2 }
    });
  }

  function initFooter() {
    reveal('footer .container', { y: 18, duration: 0.65, start: 'top 98%' });
    reveal('#pagination > *', { y: 14, duration: 0.5, start: 'top 96%' });
  }

  function initOverlayMotion() {
    if (!window.jQuery || reducedMotion) return;
    window.jQuery('#modalSearch').on('shown.bs.modal', function () {
      gsap.fromTo('#modalSearch .modal-dialog', {
        y: 24,
        autoAlpha: 0,
        scale: 0.97
      }, {
        y: 0,
        autoAlpha: 1,
        scale: 1,
        duration: 0.55,
        ease: 'power3.out'
      });
      gsap.from('#modalSearch .modal-header, #modalSearch .modal-body > *', {
        y: 14,
        autoAlpha: 0,
        stagger: 0.055,
        duration: 0.45,
        delay: 0.08
      });
    });
    window.jQuery(document).on('shown.bs.collapse hidden.bs.collapse', function () {
      ScrollTrigger.refresh();
    });
  }

  initPageIntro();
  initReadingProgress();
  initGenericReveals();
  initMagneticElements();
  initCardTilt();
  initAmbientMotion();
  initFooter();
  initOverlayMotion();

  window.addEventListener('load', function () {
    ScrollTrigger.refresh();
    body.classList.add('motion-ready');
  });
})(window, document);
