/* =========================================================
 * Fluid Theme Modern Interaction Script
 * 
 * Features:
 * 1. Top Reading Progress Bar (顶部阅读进度条)
 * 2. Magic Hover Effect on Cards (卡片鼠标跟随光晕特效)
 * 3. Dynamic Title when leaving page (页面失焦动态标题)
 * ========================================================= */

document.addEventListener('DOMContentLoaded', function () {
  
  // ==========================================
  // 1. 顶部阅读进度条 (Reading Progress Bar)
  // ==========================================
  function initProgressBar() {
    // 只在文章详情页启用 (If we are on a post page)
    if (!document.querySelector('.markdown-body')) return;

    // 创建进度条元素
    const progressBar = document.createElement('div');
    progressBar.id = 'reading-progress-bar';
    progressBar.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 0%;
      height: 3px;
      background: linear-gradient(90deg, #29d, #ff6b6b);
      z-index: 99999;
      transition: width 0.1s ease;
      box-shadow: 0 0 10px rgba(41, 21, 21, 0.5);
    `;
    document.body.appendChild(progressBar);

    // 监听滚动事件计算进度
    window.addEventListener('scroll', function () {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;
      
      const windowHeight = scrollHeight - clientHeight;
      const progress = (scrollTop / windowHeight) * 100;
      
      progressBar.style.width = progress + '%';
    });
  }

  // ==========================================
  // 2. 卡片光晕特效 (Magic Hover Spotlight Effect)
  // ==========================================
  function initMagicCards() {
    const cards = document.querySelectorAll('.index-card');
    if (!cards.length) return;

    cards.forEach(card => {
      card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left; // x position within the element.
        const y = e.clientY - rect.top;  // y position within the element.
        
        // 只有在浅色模式下才显示明显的光晕，深色模式稍微弱一点
        const isDarkMode = document.documentElement.getAttribute('data-user-color-scheme') === 'dark';
        const alpha = isDarkMode ? '0.1' : '0.05';
        
        card.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(41, 21, 21, ${alpha}), transparent 50%), var(--board-bg-color, #fff)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.background = 'var(--board-bg-color, #fff)';
      });
    });
  }

  // ==========================================
  // 3. 动态网页标题 (Dynamic Page Title)
  // ==========================================
  function initDynamicTitle() {
    const originTitle = document.title;
    let titleTime;

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        document.title = '(つェ⊂) 我藏好了哦~ ' + originTitle;
        clearTimeout(titleTime);
      } else {
        document.title = '(*´∇｀*) 被你发现啦~ ' + originTitle;
        titleTime = setTimeout(function () {
          document.title = originTitle;
        }, 2000);
      }
    });
  }

  // 初始化所有功能
  initProgressBar();
  initMagicCards();
  initDynamicTitle();
});
