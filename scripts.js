/* Rosario Di Leva — site interactions */

(function () {
  'use strict';

  // ── Nav scroll state ──────────────────────────────────────────────────────
  const nav = document.querySelector('.nav');
  function onScroll() {
    nav.classList.toggle('scrolled', window.scrollY > 30);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ── Reveal on scroll ──────────────────────────────────────────────────────
  const revealIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        revealIO.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

  document.querySelectorAll('.reveal').forEach((el) => revealIO.observe(el));

  // ── Active nav link ───────────────────────────────────────────────────────
  const sections = [...document.querySelectorAll('section[id]')];
  const navLinks = [...document.querySelectorAll('.nav-menu a')];

  const navIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        const id = e.target.id;
        navLinks.forEach((l) => {
          const isActive = l.getAttribute('href') === `#${id}`;
          l.classList.toggle('active', isActive);
          l.setAttribute('aria-current', isActive ? 'page' : 'false');
        });
      }
    });
  }, { threshold: 0.35, rootMargin: '-80px 0px -45% 0px' });

  sections.forEach((s) => navIO.observe(s));

  // ── Parallax on hero cover ────────────────────────────────────────────────
  const cover = document.querySelector('.book-cover');
  if (cover && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      if (y < 600) cover.style.transform = `translateY(${y * 0.06}px)`;
    }, { passive: true });
  }

  // ── Mobile menu ───────────────────────────────────────────────────────────
  const burger = document.querySelector('.nav-burger');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileClose = document.querySelector('.mobile-close');

  function openMobileMenu() {
    document.body.classList.add('menu-open');
    mobileMenu.classList.add('open');
    mobileMenu.setAttribute('aria-hidden', 'false');
    burger.setAttribute('aria-expanded', 'true');
    mobileClose.focus();
  }

  function closeMobileMenu() {
    document.body.classList.remove('menu-open');
    mobileMenu.classList.remove('open');
    mobileMenu.setAttribute('aria-hidden', 'true');
    burger.setAttribute('aria-expanded', 'false');
    burger.focus();
  }

  // Expose globally so inline onclick in button can call it
  window.closeMobileMenu = closeMobileMenu;

  if (burger) {
    burger.addEventListener('click', openMobileMenu);
  }

  if (mobileClose) {
    mobileClose.addEventListener('click', closeMobileMenu);
  }

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.body.classList.contains('menu-open')) {
      closeMobileMenu();
    }
  });

  // Close when a mobile menu link is clicked
  if (mobileMenu) {
    mobileMenu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', closeMobileMenu);
    });

    // Close on click outside the inner panel
    mobileMenu.addEventListener('click', (e) => {
      if (e.target === mobileMenu) closeMobileMenu();
    });
  }

  // ── Newsletter — MailerLite ───────────────────────────────────────────────
  // L'endpoint MailerLite richiede application/x-www-form-urlencoded, non multipart.
  const ML_ENDPOINT =
    'https://assets.mailerlite.com/jsonp/2372474/forms/188206273951434134/subscribe';

  const newsletterForm = document.getElementById('newsletter-form');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', async (ev) => {
      ev.preventDefault();
      if (!newsletterForm.checkValidity()) { newsletterForm.reportValidity(); return; }

      const btn = newsletterForm.querySelector('button[type="submit"]');
      if (!btn || btn.dataset.submitting) return;

      const emailInput = newsletterForm.querySelector('input[type="email"]');
      const email = emailInput ? emailInput.value.trim() : '';

      btn.dataset.submitting = '1';
      const original = btn.innerHTML;
      btn.innerHTML = '…';
      btn.disabled = true;

      try {
        const params = new URLSearchParams();
        params.append('fields[email]', email);
        params.append('ml-submit', '1');
        params.append('anticsrf', 'true');

        const res = await fetch(ML_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: params.toString(),
        });
        const json = await res.json().catch(() => ({}));

        if (json.success) {
          btn.innerHTML = '✓ iscritto';
          btn.style.background = 'var(--amber)';
          btn.style.color = '#0a0b0f';
          newsletterForm.reset();
          setTimeout(() => {
            btn.innerHTML = original;
            btn.style.background = '';
            btn.style.color = '';
            btn.disabled = false;
            delete btn.dataset.submitting;
          }, 3000);
        } else {
          throw new Error(json.message || 'error');
        }
      } catch {
        btn.innerHTML = '✗ riprova';
        btn.style.background = '#7a1010';
        btn.style.color = '#fff';
        setTimeout(() => {
          btn.innerHTML = original;
          btn.style.background = '';
          btn.style.color = '';
          btn.disabled = false;
          delete btn.dataset.submitting;
        }, 3000);
      }
    });
  }

  // ── Form contatti — Web3Forms → rosario.dileva@gmail.com ─────────────────
  // Per attivare: vai su https://web3forms.com, inserisci rosario.dileva@gmail.com,
  // ricevi la access key via email e sostituiscila qui sotto.
  const W3F_KEY = '05db0ede-01d0-4e79-b952-7d8f6b18b633';

  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', async (ev) => {
      ev.preventDefault();
      if (!contactForm.checkValidity()) { contactForm.reportValidity(); return; }

      const btn = contactForm.querySelector('button[type="submit"]');
      if (!btn || btn.dataset.submitting) return;

      btn.dataset.submitting = '1';
      const original = btn.innerHTML;
      btn.innerHTML = '…';
      btn.disabled = true;

      try {
        const data = new FormData(contactForm);
        data.append('access_key', W3F_KEY);
        data.append('subject',
          data.get('subject') || 'Nuovo messaggio dal sito rosariodileva.com');
        data.append('from_name', 'Sito rosariodileva.com');

        const res = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          body: data,
        });
        const json = await res.json().catch(() => ({}));

        if (json.success) {
          btn.innerHTML = '✓ inviato';
          btn.style.background = 'var(--amber)';
          btn.style.color = '#0a0b0f';
          contactForm.reset();
          setTimeout(() => {
            btn.innerHTML = original;
            btn.style.background = '';
            btn.style.color = '';
            btn.disabled = false;
            delete btn.dataset.submitting;
          }, 3000);
        } else {
          throw new Error(json.message || 'error');
        }
      } catch {
        btn.innerHTML = '✗ riprova';
        btn.style.background = '#7a1010';
        btn.style.color = '#fff';
        setTimeout(() => {
          btn.innerHTML = original;
          btn.style.background = '';
          btn.style.color = '';
          btn.disabled = false;
          delete btn.dataset.submitting;
        }, 3000);
      }
    });
  }

})();
