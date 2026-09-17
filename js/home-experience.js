(function (window, document) {
  'use strict';

  const root = document.documentElement;
  const body = document.body;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const charts = [];

  if (!body.classList.contains('home-immersive')) return;

  function initHomeMotion() {
    const gsap = window.gsap;
    const ScrollTrigger = window.ScrollTrigger;
    if (!gsap || !ScrollTrigger || reducedMotion) return;

    gsap.registerPlugin(ScrollTrigger);
    const intro = gsap.timeline({ defaults: { ease: 'power3.out' } });
    intro
      .from('#navbar', { y: -24, autoAlpha: 0, duration: 0.65 })
      .from('.hero-kicker', { x: -34, autoAlpha: 0, duration: 0.65 }, '-=0.25')
      .from('.hero-title > span', { yPercent: 105, autoAlpha: 0, rotateX: -18, stagger: 0.12, duration: 1.05 }, '-=0.35')
      .from('.hero-copy', { y: 18, autoAlpha: 0, duration: 0.65 }, '-=0.5')
      .from('.hero-actions .hero-button', { y: 18, autoAlpha: 0, stagger: 0.1, duration: 0.55 }, '-=0.35')
      .from('.hero-status span', { x: 18, autoAlpha: 0, stagger: 0.08, duration: 0.5 }, '-=0.4')
      .from('.scroll-down-bar', { y: -12, autoAlpha: 0, duration: 0.45 }, '-=0.3');

    gsap.to('.hero-shell', {
      yPercent: 20,
      autoAlpha: 0.18,
      ease: 'none',
      scrollTrigger: {
        trigger: '#banner',
        start: 'top top',
        end: 'bottom 20%',
        scrub: 0.9
      }
    });

    gsap.to('.hero-webgl', {
      yPercent: 12,
      scale: 1.08,
      ease: 'none',
      scrollTrigger: {
        trigger: '#banner',
        start: 'top top',
        end: 'bottom top',
        scrub: 1.1
      }
    });

    gsap.from('.home-observatory', {
      y: 70,
      autoAlpha: 0,
      scale: 0.97,
      duration: 1,
      scrollTrigger: { trigger: '.home-observatory', start: 'top 92%', once: true }
    });
    gsap.from('.observatory-heading > *', {
      y: 24,
      autoAlpha: 0,
      stagger: 0.08,
      duration: 0.7,
      scrollTrigger: { trigger: '.observatory-heading', start: 'top 88%', once: true }
    });
    gsap.from('.stat-tile', {
      y: 30,
      autoAlpha: 0,
      stagger: 0.07,
      duration: 0.68,
      scrollTrigger: { trigger: '.stats-grid', start: 'top 90%', once: true }
    });
    gsap.from('.chart-panel', {
      y: 34,
      autoAlpha: 0,
      stagger: 0.1,
      duration: 0.75,
      scrollTrigger: { trigger: '.charts-grid', start: 'top 91%', once: true }
    });

    gsap.utils.toArray('.index-card').forEach(function (card, index) {
      const image = card.querySelector('.index-img img');
      gsap.from(card, {
        y: 24,
        autoAlpha: 0,
        scale: 0.99,
        duration: 0.45,
        delay: (index % 3) * 0.03,
        scrollTrigger: { trigger: card, start: 'top 99%', once: true }
      });
      if (image) {
        gsap.fromTo(image, { yPercent: -5, scale: 1.08 }, {
          yPercent: 5,
          scale: 1.08,
          ease: 'none',
          scrollTrigger: { trigger: card, start: 'top bottom', end: 'bottom top', scrub: 1 }
        });
      }
    });
  }

  function initHeroPointer() {
    const banner = document.getElementById('banner');
    if (!banner || reducedMotion) return;

    banner.addEventListener('pointermove', function (event) {
      const rect = banner.getBoundingClientRect();
      banner.style.setProperty('--hero-x', `${((event.clientX - rect.left) / rect.width) * 100}%`);
      banner.style.setProperty('--hero-y', `${((event.clientY - rect.top) / rect.height) * 100}%`);
    }, { passive: true });
  }

  function initThreeScene() {
    const canvas = document.getElementById('hero-webgl');
    const banner = document.getElementById('banner');
    if (!canvas || !banner || !window.THREE || reducedMotion) return;

    let renderer;
    try {
      renderer = new window.THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    } catch (error) {
      canvas.hidden = true;
      return;
    }

    const scene = new window.THREE.Scene();
    const camera = new window.THREE.PerspectiveCamera(55, 1, 0.1, 100);
    camera.position.z = 7;

    const group = new window.THREE.Group();
    scene.add(group);

    const particleCount = window.innerWidth < 768 ? 420 : 820;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const colorA = new window.THREE.Color('#4eeaff');
    const colorB = new window.THREE.Color('#8291ff');

    for (let i = 0; i < particleCount; i += 1) {
      const radius = 2.5 + Math.random() * 3.8;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta) + 1.8;
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta) * 0.72;
      positions[i * 3 + 2] = radius * Math.cos(phi);
      const mixed = colorA.clone().lerp(colorB, Math.random());
      colors[i * 3] = mixed.r;
      colors[i * 3 + 1] = mixed.g;
      colors[i * 3 + 2] = mixed.b;
    }

    const particlesGeometry = new window.THREE.BufferGeometry();
    particlesGeometry.setAttribute('position', new window.THREE.BufferAttribute(positions, 3));
    particlesGeometry.setAttribute('color', new window.THREE.BufferAttribute(colors, 3));

    const particleMaterial = new window.THREE.PointsMaterial({
      size: window.innerWidth < 768 ? 0.024 : 0.032,
      transparent: true,
      opacity: 0.78,
      vertexColors: true,
      blending: window.THREE.AdditiveBlending,
      depthWrite: false
    });
    group.add(new window.THREE.Points(particlesGeometry, particleMaterial));

    const wireMaterial = new window.THREE.LineBasicMaterial({
      color: '#4eeaff',
      transparent: true,
      opacity: 0.11,
      blending: window.THREE.AdditiveBlending
    });
    const wire = new window.THREE.LineSegments(
      new window.THREE.WireframeGeometry(new window.THREE.IcosahedronGeometry(2.25, 2)),
      wireMaterial
    );
    wire.position.x = 1.8;
    group.add(wire);

    const pointer = { x: 0, y: 0 };
    banner.addEventListener('pointermove', function (event) {
      pointer.x = (event.clientX / window.innerWidth - 0.5) * 0.42;
      pointer.y = (event.clientY / window.innerHeight - 0.5) * 0.28;
    }, { passive: true });

    function resize() {
      const rect = banner.getBoundingClientRect();
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));
      renderer.setSize(rect.width, rect.height, false);
      camera.aspect = rect.width / rect.height;
      camera.updateProjectionMatrix();
    }

    let animationId;
    const clock = new window.THREE.Clock();
    function render() {
      const elapsed = clock.getElapsedTime();
      group.rotation.y += (pointer.x - group.rotation.y) * 0.018;
      group.rotation.x += (-pointer.y - group.rotation.x) * 0.018;
      group.rotation.z = Math.sin(elapsed * 0.14) * 0.06;
      wire.rotation.x = elapsed * 0.055;
      wire.rotation.y = elapsed * 0.075;
      renderer.render(scene, camera);
      animationId = window.requestAnimationFrame(render);
    }

    resize();
    render();
    window.addEventListener('resize', resize, { passive: true });
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        window.cancelAnimationFrame(animationId);
      } else {
        render();
      }
    });
  }

  function getChartColors() {
    const styles = getComputedStyle(root);
    return {
      text: styles.getPropertyValue('--text-color').trim() || '#45576b',
      muted: styles.getPropertyValue('--sec-text-color').trim() || '#8493a3',
      line: styles.getPropertyValue('--line-color').trim() || 'rgba(127, 147, 166, .18)'
    };
  }

  function animateNumber(element, value) {
    if (!element) return;
    if (reducedMotion) {
      element.textContent = value;
      return;
    }
    if (window.gsap) {
      const counter = { value: 0 };
      window.gsap.to(counter, {
        value: value,
        duration: 1.1,
        ease: 'power3.out',
        onUpdate: function () {
          element.textContent = Math.round(counter.value);
        }
      });
      return;
    }
    const start = performance.now();
    const duration = 900;
    function frame(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      element.textContent = Math.round(value * eased);
      if (progress < 1) window.requestAnimationFrame(frame);
    }
    window.requestAnimationFrame(frame);
  }

  function renderCharts(yearCounts, categoryCounts) {
    if (!window.echarts) {
      document.querySelectorAll('.chart-canvas').forEach(function (element) {
        element.textContent = '可视化引擎暂未加载，统计数据仍可正常浏览。';
        element.classList.add('chart-fallback');
      });
      return;
    }
    const colors = getChartColors();
    const yearElement = document.getElementById('chart-years');
    const categoryElement = document.getElementById('chart-categories');
    const years = Object.keys(yearCounts).sort();
    const categories = Object.entries(categoryCounts).sort(function (a, b) { return b[1] - a[1]; }).slice(0, 6);

    if (yearElement) {
      const chart = window.echarts.init(yearElement);
      chart.setOption({
        animationDuration: reducedMotion ? 0 : 900,
        grid: { left: 12, right: 12, top: 28, bottom: 10, containLabel: true },
        tooltip: { trigger: 'axis', backgroundColor: 'rgba(6, 20, 34, .92)', borderColor: 'rgba(78, 234, 255, .24)', textStyle: { color: '#eafaff' } },
        xAxis: { type: 'category', data: years, boundaryGap: false, axisLine: { lineStyle: { color: colors.line } }, axisTick: { show: false }, axisLabel: { color: colors.muted } },
        yAxis: { type: 'value', minInterval: 1, splitNumber: 3, axisLabel: { color: colors.muted }, splitLine: { lineStyle: { color: colors.line, type: 'dashed' } } },
        series: [{
          name: '文章',
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 8,
          data: years.map(function (year) { return yearCounts[year]; }),
          lineStyle: { width: 3, color: '#4eeaff', shadowColor: 'rgba(78, 234, 255, .35)', shadowBlur: 14 },
          itemStyle: { color: '#4eeaff', borderColor: '#ffffff', borderWidth: 2 },
          areaStyle: { color: new window.echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(78, 234, 255, .32)' }, { offset: 1, color: 'rgba(78, 234, 255, 0)' }]) }
        }]
      });
      charts.push(chart);
    }

    if (categoryElement) {
      const chart = window.echarts.init(categoryElement);
      chart.setOption({
        animationDuration: reducedMotion ? 0 : 1000,
        color: ['#4eeaff', '#6b8cff', '#a16eff', '#65d6b4', '#ffc86b', '#ff7898'],
        tooltip: { trigger: 'item', backgroundColor: 'rgba(6, 20, 34, .92)', borderColor: 'rgba(78, 234, 255, .24)', textStyle: { color: '#eafaff' } },
        legend: { bottom: 0, icon: 'circle', itemWidth: 7, itemHeight: 7, textStyle: { color: colors.muted, fontSize: 10 } },
        series: [{
          type: 'pie',
          radius: ['46%', '69%'],
          center: ['50%', '43%'],
          avoidLabelOverlap: true,
          itemStyle: { borderColor: 'rgba(5, 16, 29, .15)', borderWidth: 3, borderRadius: 7 },
          label: { show: false },
          emphasis: { scaleSize: 7, label: { show: true, color: colors.text, fontWeight: 700, formatter: '{b}\n{c}' } },
          data: categories.map(function (item) { return { name: item[0], value: item[1] }; })
        }]
      });
      charts.push(chart);
    }
  }

  function loadArchiveData() {
    fetch('/local-search.xml')
      .then(function (response) {
        if (!response.ok) throw new Error('Archive unavailable');
        return response.text();
      })
      .then(function (xmlText) {
        const xml = new DOMParser().parseFromString(xmlText, 'text/xml');
        const entries = Array.from(xml.querySelectorAll('entry'));
        const years = {};
        const categories = {};
        const tags = new Set();

        entries.forEach(function (entry) {
          const url = (entry.querySelector('url') || {}).textContent || '';
          const match = url.match(/^\/(20\d{2})\//);
          if (match) years[match[1]] = (years[match[1]] || 0) + 1;
          entry.querySelectorAll('category').forEach(function (category) {
            const name = category.textContent.trim();
            if (name) categories[name] = (categories[name] || 0) + 1;
          });
          entry.querySelectorAll('tag').forEach(function (tag) {
            const name = tag.textContent.trim();
            if (name) tags.add(name);
          });
        });

        const topCategory = Object.entries(categories).sort(function (a, b) { return b[1] - a[1]; })[0];
        animateNumber(document.getElementById('stat-posts'), entries.length);
        animateNumber(document.getElementById('stat-years'), Object.keys(years).length);
        animateNumber(document.getElementById('stat-tags'), tags.size);
        const categoryLabel = document.getElementById('stat-category');
        if (categoryLabel) categoryLabel.textContent = topCategory ? topCategory[0] : '持续探索';
        renderCharts(years, categories);
      })
      .catch(function () {
        document.querySelectorAll('.chart-canvas').forEach(function (element) {
          element.textContent = '数据加载失败，请稍后重试。';
          element.classList.add('chart-fallback');
        });
      });
  }

  function syncCharts() {
    charts.forEach(function (chart) { chart.resize(); });
  }

  initHeroPointer();
  initHomeMotion();
  initThreeScene();
  loadArchiveData();
  window.addEventListener('resize', syncCharts, { passive: true });

  const themeObserver = new MutationObserver(function () {
    window.setTimeout(function () {
      charts.forEach(function (chart) { chart.dispose(); });
      charts.length = 0;
      loadArchiveData();
    }, 80);
  });
  themeObserver.observe(root, { attributes: true, attributeFilter: ['data-user-color-scheme'] });
})(window, document);
