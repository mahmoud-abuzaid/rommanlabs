/**
 * ROMMAN LABS — Accessible, Fast, Bilingual Frontend Engine
 */

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initLanguage();
  initScrollReveals();
  initHeroCanvas();
  initCursorFollower();
  initContactForm();
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

/* ==========================================================================
   6. CONTACT FORM SUBMISSION (GitHub Pages Compatible)
   ========================================================================== */
function initContactForm() {
  const form = document.getElementById('contact-form');
  const emailInput = document.getElementById('contact-email');
  const submitBtn = document.getElementById('contact-submit');
  const feedback = document.getElementById('form-feedback');

  if (!form) return;

  // ⚠️ ضع بريدك الإلكتروني هنا لاستلام الإشعارات والرسائل من زوار الموقع
  const RECIPIENT_EMAIL = 'mahmoud.abuzaid@rommanlabs.com';

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = emailInput.value.trim();
    if (!email) return;

    const currentLang = document.documentElement.getAttribute('lang') || 'ar';
    const btnSpan = submitBtn.querySelector('span');
    const originalText = btnSpan ? btnSpan.textContent : submitBtn.textContent;

    // حالة الإرسال
    submitBtn.disabled = true;
    submitBtn.style.opacity = '0.7';
    if (btnSpan) {
      btnSpan.textContent = currentLang === 'en' ? 'Sending...' : 'جاري الإرسال...';
    }

    feedback.className = 'form-feedback';
    feedback.style.display = 'none';

    try {
      const response = await fetch(`https://formsubmit.co/ajax/${RECIPIENT_EMAIL}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          email: email,
          _subject: 'طلب تواصل جديد من موقع Romman Labs',
          _template: 'table'
        })
      });

      if (response.ok) {
        feedback.textContent = currentLang === 'en'
          ? 'Thank you! We received your email and will get in touch soon.'
          : 'شكراً لتواصلك! استلمنا بريدك وسيتواصل معك فريق رمان لابز قريباً.';
        feedback.className = 'form-feedback success';
        form.reset();
      } else {
        throw new Error('Server response not ok');
      }
    } catch (err) {
      feedback.textContent = currentLang === 'en'
        ? 'Something went wrong. Please try again or contact us directly.'
        : 'حدث خطأ أثناء الإرسال. يرجى المحاولة مرة أخرى.';
      feedback.className = 'form-feedback error';
    } finally {
      submitBtn.disabled = false;
      submitBtn.style.opacity = '1';
      if (btnSpan) {
        btnSpan.textContent = originalText;
      }
    }
  });
}
