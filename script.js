/**
 * ROMMAN LABS — Accessible, Fast, Bilingual Frontend Engine
 */

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initLanguage();
  initScrollReveals();
  initHeroCanvas();
  initCursorFollower();
});

/* ==========================================================================
   1. THEME MANAGEMENT (DARK / LIGHT)
   ========================================================================== */
function initTheme() {
  const themeToggleBtn = document.getElementById('theme-toggle');
  const savedTheme = localStorage.getItem('romman-theme') || 'dark';
  
  applyTheme(savedTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
      const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
      applyTheme(nextTheme);
      localStorage.setItem('romman-theme', nextTheme);
    });
  }
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  const themeIcon = document.getElementById('theme-icon');
  if (themeIcon) {
    themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
  }
}

/* ==========================================================================
   2. BILINGUAL MANAGEMENT (ARABIC / ENGLISH)
   ========================================================================== */
function initLanguage() {
  const langToggleBtn = document.getElementById('lang-toggle');
  const savedLang = localStorage.getItem('romman-lang') || 'ar';

  applyLanguage(savedLang);

  if (langToggleBtn) {
    langToggleBtn.addEventListener('click', () => {
      const currentLang = document.documentElement.getAttribute('lang') || 'ar';
      const nextLang = currentLang === 'ar' ? 'en' : 'ar';
      applyLanguage(nextLang);
      localStorage.setItem('romman-lang', nextLang);
    });
  }
}

function applyLanguage(lang) {
  document.documentElement.setAttribute('lang', lang);
  document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');

  const langBtnText = document.getElementById('lang-text');
  if (langBtnText) {
    langBtnText.textContent = lang === 'ar' ? 'English' : 'عربي';
  }

  // Update all translatable elements
  const elements = document.querySelectorAll('[data-ar][data-en]');
  elements.forEach(el => {
    const text = el.getAttribute(`data-${lang}`);
    if (text) {
      if (el.tagName === 'INPUT' && el.type === 'email') {
        el.placeholder = text;
      } else {
        el.textContent = text;
      }
    }
  });
}

/* ==========================================================================
   3. SCROLL REVEALS
   ========================================================================== */
function initScrollReveals() {
  const revealElements = document.querySelectorAll('.reveal-on-scroll');

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  revealElements.forEach(el => observer.observe(el));
}

/* ==========================================================================
   4. CANVAS PARTICLE BACKGROUND
   ========================================================================== */
function initHeroCanvas() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d', { alpha: true });
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }, { passive: true });

  const particles = [];
  const particleCount = 35;

  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.8,
      vy: (Math.random() - 0.5) * 0.8,
      radius: 2.5 + Math.random() * 3,
      color: Math.random() > 0.4 ? '#c41e3a' : '#e6b85c',
      alpha: 0.2 + Math.random() * 0.6
    });
  }

  function render() {
    ctx.clearRect(0, 0, width, height);

    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0 || p.x > width) p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha;
      ctx.fill();
    });

    requestAnimationFrame(render);
  }

  render();
}

/* ==========================================================================
   5. CURSOR FOLLOWER
   ========================================================================== */
function initCursorFollower() {
  const follower = document.getElementById('cursor-follower');
  if (!follower) return;

  let posX = -300, posY = -300;

  window.addEventListener('mousemove', (e) => {
    posX += (e.clientX - posX) * 0.15;
    posY += (e.clientY - posY) * 0.15;
    follower.style.transform = `translate3d(${e.clientX - 140}px, ${e.clientY - 140}px, 0)`;
  }, { passive: true });
}
