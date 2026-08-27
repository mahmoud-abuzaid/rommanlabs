document.addEventListener('DOMContentLoaded', () => {
  const root = document.documentElement;
  const themeButton = document.getElementById('theme-toggle');
  const langButton = document.getElementById('lang-toggle');
  const langText = document.getElementById('lang-text');
  const menuButton = document.getElementById('menu-toggle');
  const mobileNav = document.getElementById('mobile-nav');

  function applyTheme(theme) {
    root.dataset.theme = theme;
    localStorage.setItem('romman-theme', theme);
    themeButton.setAttribute('aria-label', theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
  }
  function applyLanguage(lang) {
    root.lang = lang;
    root.dir = lang === 'ar' ? 'rtl' : 'ltr';
    langText.textContent = lang === 'ar' ? 'EN' : 'ع';
    document.querySelectorAll('[data-ar][data-en]').forEach((element) => {
      const value = element.dataset[lang];
      if (element instanceof HTMLInputElement) element.placeholder = value;
      else element.textContent = value;
    });
    localStorage.setItem('romman-lang', lang);
  }

  applyTheme(localStorage.getItem('romman-theme') || (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'));
  applyLanguage(localStorage.getItem('romman-lang') || 'ar');
  themeButton.addEventListener('click', () => applyTheme(root.dataset.theme === 'dark' ? 'light' : 'dark'));
  langButton.addEventListener('click', () => applyLanguage(root.lang === 'ar' ? 'en' : 'ar'));
  menuButton.addEventListener('click', () => {
    const open = mobileNav.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', String(open));
  });
  mobileNav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
    mobileNav.classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
  }));

  const observer = new IntersectionObserver((entries, currentObserver) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('visible');
      currentObserver.unobserve(entry.target);
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));

  const form = document.getElementById('contact-form');
  const email = document.getElementById('contact-email');
  const submit = document.getElementById('contact-submit');
  const feedback = document.getElementById('form-feedback');
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const lang = root.lang || 'ar';
    const label = submit.querySelector('span');
    const original = label.textContent;
    submit.disabled = true;
    label.textContent = lang === 'ar' ? 'جارٍ الإرسال' : 'Sending';
    feedback.textContent = '';
    try {
      const response = await fetch('https://formsubmit.co/ajax/63044dcb243f3a64704b00e72500939c', {
        method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ _subject: 'طلب تواصل جديد من موقع رمان لابز', email: email.value.trim() })
      });
      if (!response.ok) throw new Error('Request failed');
      form.reset();
      feedback.textContent = lang === 'ar' ? 'وصلنا طلبك. سنتواصل معك قريبًا.' : 'We received your request. We will be in touch soon.';
    } catch {
      feedback.textContent = lang === 'ar' ? 'تعذر الإرسال الآن. راسلنا على hello@rommanlabs.com' : 'Could not send. Email hello@rommanlabs.com';
    } finally {
      submit.disabled = false;
      label.textContent = original;
    }
  });
});
