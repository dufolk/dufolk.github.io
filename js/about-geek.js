(function () {
  'use strict';

  var root = document.querySelector('.geek-about');
  if (!root) return;

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var gsap = window.gsap;
  var ScrollTrigger = window.ScrollTrigger;
  var revealItems = Array.prototype.slice.call(root.querySelectorAll('[data-about-reveal]'));

  if (gsap && ScrollTrigger && !reduce) {
    gsap.registerPlugin(ScrollTrigger);
    gsap.set('.about-hero-copy', { autoAlpha: 1, y: 0 });
    var heroCopy = root.querySelector('.about-hero-copy');
    if (heroCopy) heroCopy.classList.add('is-visible');
    var heroTimeline = gsap.timeline({ defaults: { ease: 'power3.out' } });
    heroTimeline
      .fromTo('.about-global-nav', { y: -18, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.55 })
      .fromTo('.about-status', { x: -22, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.6 }, '-=0.2')
      .fromTo('.about-kicker', { x: -30, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.65 }, '-=0.3')
      .fromTo('#about-name span, #about-name em', { yPercent: 110, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, stagger: 0.1, duration: 0.9 }, '-=0.35')
      .fromTo('.about-role, .about-lead', { y: 20, autoAlpha: 0 }, { y: 0, autoAlpha: 1, stagger: 0.1, duration: 0.65 }, '-=0.45')
      .fromTo('.about-actions > *', { y: 16, autoAlpha: 0 }, { y: 0, autoAlpha: 1, stagger: 0.08, duration: 0.55 }, '-=0.35')
      .fromTo('.about-console-wrap', { x: 50, autoAlpha: 0, scale: 0.96 }, {
        x: 0,
        autoAlpha: 1,
        scale: 1,
        duration: 1,
        onComplete: function () {
          var heroItems = root.querySelectorAll('.about-hero [data-about-reveal]');
          Array.prototype.forEach.call(heroItems, function (item) { item.classList.add('is-visible'); });
        }
      }, '-=0.8');

    revealItems.forEach(function (item, index) {
      if (item.closest('.about-hero')) return;
      gsap.fromTo(item, {
        y: 42,
        autoAlpha: 0,
        scale: 0.985
      }, {
        y: 0,
        autoAlpha: 1,
        scale: 1,
        duration: 0.85,
        delay: (index % 4) * 0.055,
        onComplete: function () { item.classList.add('is-visible'); },
        scrollTrigger: {
          trigger: item,
          start: 'top 90%',
          once: true
        }
      });
    });
  } else {
    revealItems.forEach(function (item) { item.classList.add('is-visible'); });
  }

  var typeTarget = document.getElementById('about-type');
  var motto = typeTarget ? (typeTarget.getAttribute('data-motto') || '') : '';
  if (typeTarget && motto) {
    if (reduce) {
      typeTarget.textContent = motto;
    } else if (gsap) {
      var typeState = { length: 0 };
      gsap.to(typeState, {
        length: motto.length,
        duration: Math.max(1.2, motto.length * 0.14),
        delay: 1.15,
        ease: 'none',
        snap: { length: 1 },
        onUpdate: function () {
          typeTarget.textContent = motto.slice(0, typeState.length);
        }
      });
    } else {
      var typeIndex = 0;
      var typeTimer = window.setInterval(function () {
        typeTarget.textContent = motto.slice(0, ++typeIndex);
        if (typeIndex >= motto.length) window.clearInterval(typeTimer);
      }, 150);
    }
  }

  if (gsap && ScrollTrigger && !reduce) {
    Array.prototype.forEach.call(root.querySelectorAll('.about-metrics b'), function (element) {
      var original = element.textContent.trim();
      var match = original.match(/^(\d+)(.*)$/);
      if (!match) return;
      var target = parseInt(match[1], 10);
      var suffix = match[2];
      var digits = match[1].length;
      var counter = { value: 0 };
      gsap.to(counter, {
        value: target,
        duration: 1.15,
        ease: 'power3.out',
        snap: { value: 1 },
        onUpdate: function () {
          element.textContent = String(counter.value).padStart(digits, '0') + suffix;
        },
        scrollTrigger: { trigger: element, start: 'top 92%', once: true }
      });
    });

    gsap.utils.toArray('.about-section-head span').forEach(function (number) {
      gsap.fromTo(number, { x: -24, autoAlpha: 0 }, {
        x: 0,
        autoAlpha: 1,
        duration: 0.65,
        scrollTrigger: { trigger: number, start: 'top 90%', once: true }
      });
    });
  }

  var sections = Array.prototype.slice.call(root.querySelectorAll('.about-section[id]'));
  var railLinks = Array.prototype.slice.call(root.querySelectorAll('.about-rail a'));
  if ('IntersectionObserver' in window && sections.length) {
    var sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        railLinks.forEach(function (link) {
          link.classList.toggle('active', link.getAttribute('href') === '#' + entry.target.id);
        });
      });
    }, { rootMargin: '-30% 0px -60% 0px', threshold: 0 });
    sections.forEach(function (section) { sectionObserver.observe(section); });
  }

  var canvas = document.getElementById('about-grid-canvas');
  if (!canvas || reduce) return;
  var context = canvas.getContext('2d');
  if (!context) return;

  var width = 0;
  var height = 0;
  var dpr = 1;
  var points = [];
  var pointer = { x: -1000, y: -1000 };
  var animationFrame = 0;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    width = document.documentElement.clientWidth;
    height = document.documentElement.clientHeight;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    context.setTransform(dpr, 0, 0, dpr, 0, 0);

    var count = Math.max(24, Math.min(62, Math.round(width * height / 28000)));
    points = Array.from({ length: count }, function (_, index) {
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.14,
        vy: (Math.random() - 0.5) * 0.14,
        cyan: index % 4 !== 0
      };
    });
  }

  function drawGrid() {
    context.clearRect(0, 0, width, height);
    context.lineWidth = 1;
    context.strokeStyle = 'rgba(92, 126, 148, 0.055)';
    var size = 48;
    var offset = (window.scrollY * 0.08) % size;
    context.beginPath();
    for (var x = 0; x <= width; x += size) {
      context.moveTo(x, 0);
      context.lineTo(x, height);
    }
    for (var y = -size + offset; y <= height; y += size) {
      context.moveTo(0, y);
      context.lineTo(width, y);
    }
    context.stroke();
  }

  function draw() {
    drawGrid();
    points.forEach(function (point, index) {
      point.x += point.vx;
      point.y += point.vy;
      if (point.x < -20) point.x = width + 20;
      if (point.x > width + 20) point.x = -20;
      if (point.y < -20) point.y = height + 20;
      if (point.y > height + 20) point.y = -20;

      for (var nextIndex = index + 1; nextIndex < points.length; nextIndex++) {
        var next = points[nextIndex];
        var dx = point.x - next.x;
        var dy = point.y - next.y;
        var distance = Math.sqrt(dx * dx + dy * dy);
        if (distance > 118) continue;
        context.strokeStyle = 'rgba(76, 139, 157, ' + ((1 - distance / 118) * 0.13) + ')';
        context.beginPath();
        context.moveTo(point.x, point.y);
        context.lineTo(next.x, next.y);
        context.stroke();
      }

      var pdx = point.x - pointer.x;
      var pdy = point.y - pointer.y;
      var pointerDistance = Math.sqrt(pdx * pdx + pdy * pdy);
      if (pointerDistance < 150) {
        context.strokeStyle = 'rgba(5, 196, 185, ' + ((1 - pointerDistance / 150) * 0.36) + ')';
        context.beginPath();
        context.moveTo(point.x, point.y);
        context.lineTo(pointer.x, pointer.y);
        context.stroke();
      }

      context.fillStyle = point.cyan ? 'rgba(5, 196, 185, .42)' : 'rgba(139, 111, 199, .46)';
      context.fillRect(point.x - 1, point.y - 1, 2, 2);
    });
    animationFrame = window.requestAnimationFrame(draw);
  }

  window.addEventListener('pointermove', function (event) {
    pointer.x = event.clientX;
    pointer.y = event.clientY;
  }, { passive: true });
  window.addEventListener('resize', resize, { passive: true });
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      window.cancelAnimationFrame(animationFrame);
    } else {
      animationFrame = window.requestAnimationFrame(draw);
    }
  });

  resize();
  draw();
})();
