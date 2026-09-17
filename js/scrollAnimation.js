(function (window, document) {
  'use strict';

  const body = document.body;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const pageTypes = [
    ['page-post', 'main article.post-content'],
    ['page-about', 'main article.about-content'],
    ['page-categories', 'main #board .category-list'],
    ['page-tags', 'main #board .tagcloud'],
    ['page-links', 'main #board .links'],
    ['page-archives', 'main #board .list-group .list-group-item-title'],
    ['page-index', 'main .index-card']
  ];

  pageTypes.some(function (item) {
    if (!document.querySelector(item[1])) return false;
    body.classList.add(item[0]);
    return true;
  });

  if (!body.classList.contains('home-immersive')) {
    body.classList.add('site-refined');
  }

  function initPointerEffects() {
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (reducedMotion || !finePointer) return;

    const canvas = document.createElement('canvas');
    canvas.className = 'particle-fx-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    body.appendChild(canvas);

    const context = canvas.getContext('2d');
    if (!context) {
      canvas.remove();
      return;
    }

    const particles = [];
    const colors = ['78, 234, 255', '104, 155, 255', '161, 116, 255', '217, 251, 255'];
    const maxParticles = 180;
    let frameId = 0;
    let lastX = 0;
    let lastY = 0;
    let lastEmit = 0;
    let hasPointerPosition = false;

    function resizeCanvas() {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(window.innerWidth * ratio);
      canvas.height = Math.round(window.innerHeight * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    }

    function addParticle(x, y, options) {
      if (particles.length >= maxParticles) particles.shift();
      particles.push({
        x: x,
        y: y,
        vx: options.vx,
        vy: options.vy,
        life: options.life,
        maxLife: options.life,
        size: options.size,
        color: options.color,
        drag: options.drag,
        gravity: options.gravity
      });
      if (!frameId) frameId = window.requestAnimationFrame(renderParticles);
    }

    function emitTrail(event) {
      if (!hasPointerPosition) {
        lastX = event.clientX;
        lastY = event.clientY;
        hasPointerPosition = true;
        return;
      }

      const now = performance.now();
      const dx = event.clientX - lastX;
      const dy = event.clientY - lastY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (now - lastEmit > 14 && distance > 3) {
        const count = Math.min(3, Math.max(1, Math.round(distance / 18)));
        for (let i = 0; i < count; i += 1) {
          addParticle(event.clientX + (Math.random() - 0.5) * 5, event.clientY + (Math.random() - 0.5) * 5, {
            vx: -dx * 0.035 + (Math.random() - 0.5) * 0.45,
            vy: -dy * 0.035 + (Math.random() - 0.5) * 0.45,
            life: 24 + Math.random() * 16,
            size: 0.8 + Math.random() * 1.5,
            color: colors[Math.floor(Math.random() * colors.length)],
            drag: 0.94,
            gravity: -0.003
          });
        }
        lastEmit = now;
      }

      lastX = event.clientX;
      lastY = event.clientY;
    }

    function emitBurst(x, y) {
      const count = 26;
      for (let i = 0; i < count; i += 1) {
        const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.16;
        const speed = 1.1 + Math.random() * 2.8;
        addParticle(x, y, {
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 34 + Math.random() * 24,
          size: 1.1 + Math.random() * 2.2,
          color: colors[Math.floor(Math.random() * colors.length)],
          drag: 0.965,
          gravity: 0.018
        });
      }
    }

    function renderParticles() {
      context.clearRect(0, 0, window.innerWidth, window.innerHeight);
      context.globalCompositeOperation = 'lighter';

      for (let i = particles.length - 1; i >= 0; i -= 1) {
        const particle = particles[i];
        particle.life -= 1;
        if (particle.life <= 0) {
          particles.splice(i, 1);
          continue;
        }

        particle.vx *= particle.drag;
        particle.vy = particle.vy * particle.drag + particle.gravity;
        particle.x += particle.vx;
        particle.y += particle.vy;

        const progress = particle.life / particle.maxLife;
        const radius = particle.size * (0.45 + progress * 0.55);
        context.beginPath();
        context.fillStyle = `rgba(${particle.color}, ${Math.pow(progress, 1.7) * 0.72})`;
        context.arc(particle.x, particle.y, radius, 0, Math.PI * 2);
        context.fill();
      }

      context.globalCompositeOperation = 'source-over';
      frameId = particles.length ? window.requestAnimationFrame(renderParticles) : 0;
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas, { passive: true });
    document.addEventListener('pointermove', emitTrail, { passive: true });
    document.addEventListener('pointerdown', function (event) {
      if (event.button === 0) emitBurst(event.clientX, event.clientY);
    }, { passive: true });
  }

  initPointerEffects();

  const selectors = {
    'page-index': ['.index-card'],
    'page-post': [
      '.markdown-body > h1', '.markdown-body > h2', '.markdown-body > h3',
      '.markdown-body > p', '.markdown-body > blockquote', '.markdown-body > figure',
      '.markdown-body > pre', '.markdown-body > ul', '.markdown-body > ol',
      '.post-content .license-box', '.post-content .post-prevnext', '#comments'
    ],
    'page-about': ['.about-avatar', '.about-info', '.about-content .markdown-body > *'],
    'page-archives': ['main #board .list-group > .h4', 'main #board .list-group > .h5', 'main #board .list-group > a.list-group-item'],
    'page-categories': ['main #board .category-list > .category'],
    'page-tags': ['main #board .tagcloud > a'],
    'page-links': ['main #board .links > .card', 'main #board .custom', 'main #board #comments']
  };

  const pageClass = Object.keys(selectors).find(function (name) {
    return body.classList.contains(name);
  });
  const targets = pageClass
    ? Array.from(document.querySelectorAll(selectors[pageClass].join(',')))
    : [];

  if (!targets.length || reducedMotion || !('IntersectionObserver' in window)) {
    targets.forEach(function (target) {
      target.classList.add('reveal-item', 'is-visible');
      target.style.setProperty('--state', '1');
    });
    return;
  }

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      entry.target.style.setProperty('--state', '1');
      observer.unobserve(entry.target);
    });
  }, {
    rootMargin: '0px 0px -7% 0px',
    threshold: 0.06
  });

  targets.forEach(function (target, index) {
    target.classList.add('reveal-item');
    target.style.setProperty('--state', '0');
    target.style.setProperty('--reveal-delay', `${Math.min(index % 5, 4) * 55}ms`);
    observer.observe(target);
  });
})(window, document);