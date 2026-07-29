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
   6. CONTACT FORM SUBMISSION (With Location Metadata & Professional UI)
   ========================================================================== */
async function getGeoMetadata() {
  const meta = {
    ip: 'غير معروف',
    country: 'غير معروف',
    city: 'غير معروف',
    org: 'غير معروف',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'غير معروف',
    language: navigator.language || 'ar',
    screen: `${window.screen.width}x${window.screen.height}`,
    userAgent: navigator.userAgent
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1800);

    const res = await fetch('https://ipapi.co/json/', { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      meta.ip = data.ip || meta.ip;
      meta.country = data.country_name || meta.country;
      meta.city = data.city || meta.city;
      meta.org = data.org || meta.org;
    }
  } catch (e) {
    // Fallback if IP lookup fails or times out
  }
  return meta;
}

function initContactForm() {
  const form = document.getElementById('contact-form');
  const emailInput = document.getElementById('contact-email');
  const honeyInput = document.getElementById('contact-honey');
  const submitBtn = document.getElementById('contact-submit');
  const feedback = document.getElementById('form-feedback');

  if (!form) return;

  const FORMSUBMIT_TOKEN = '63044dcb243f3a64704b00e72500939c';

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // 1. فحص حقل المصيدة (Honeypot) للتصدي للروبوتات
    if (honeyInput && honeyInput.value !== '') {
      console.warn('Bot detected via honeypot.');
      return;
    }

    const email = emailInput.value.trim();
    if (!email) return;

    const currentLang = document.documentElement.getAttribute('lang') || 'ar';
    const btnSpan = submitBtn.querySelector('span');
    const originalText = btnSpan ? btnSpan.textContent : submitBtn.textContent;

    // حالة الإرسال
    submitBtn.disabled = true;
    submitBtn.style.opacity = '0.7';
    if (btnSpan) {
      btnSpan.textContent = currentLang === 'en' ? 'Processing...' : 'جاري معالجة الطلب...';
    }

    feedback.className = 'form-feedback-card';
    feedback.style.display = 'none';

    // 2. جلب معلومات موقع وجهاز الزائر
    const geo = await getGeoMetadata();
    const locationStr = geo.country !== 'غير معروف' ? `${geo.city}, ${geo.country}` : 'موقع غير معروف';

    try {
      const response = await fetch(`https://formsubmit.co/ajax/${FORMSUBMIT_TOKEN}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          _subject: `طلب تواصل جديد من [${locationStr}]`,
          "البريد الإلكتروني": email,
          "الموقع الجغرافي": `${geo.city} - ${geo.country}`,
          "عنوان الـ IP": geo.ip,
          "مزود الإنترنت (ISP)": geo.org,
          "المنطقة الزمنية": geo.timezone,
          "لغة المتصفح": geo.language,
          "دقة الشاشة": geo.screen,
          "نوع الجهاز والمتصفح": geo.userAgent,
          "وقت الإرسال": new Date().toLocaleString(currentLang === 'en' ? 'en-US' : 'ar-SA')
        })
      });

      if (response.ok) {
        // إخفاء نموذج الإدخال وملاحظة الخصوصية وعرض بطاقة النجاح الاحترافية
        form.style.display = 'none';
        const privacyNote = document.getElementById('privacy-note');
        if (privacyNote) privacyNote.style.display = 'none';

        const successTitle = currentLang === 'en'
          ? 'Request Received Successfully!'
          : 'تم استلام طلبك بنجاح!';
        
        const successDesc = currentLang === 'en'
          ? 'Thank you for reaching out. The Romman Labs team will review your message and connect with you shortly.'
          : 'شكراً لاقتطاعك جزءاً من وقتك للتواصل معنا. تم تسجيل بريدك بنجاح، وسيتواصل معك فريق رمان لابز في أقرب وقت.';

        feedback.innerHTML = `
          <div class="feedback-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          <div class="feedback-title">${successTitle}</div>
          <div class="feedback-desc">${successDesc}</div>
        `;
        feedback.className = 'form-feedback-card success';
        form.reset();
      } else {
        throw new Error('Server response not ok');
      }
    } catch (err) {
      feedback.textContent = currentLang === 'en'
        ? 'Something went wrong. Please try again or contact us directly.'
        : 'حدث خطأ أثناء الإرسال. يرجى المحاولة مرة أخرى.';
      feedback.className = 'form-feedback-card error';
      feedback.style.display = 'block';
    } finally {
      submitBtn.disabled = false;
      submitBtn.style.opacity = '1';
      if (btnSpan) {
        btnSpan.textContent = originalText;
      }
    }
  });
}
