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

  // ── Contact form (Web3Forms AJAX) ───────────────────────────────────────
  const contactForm = document.getElementById('contact-form');
  const contactConfirm = document.getElementById('contact-confirm');

  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const btn = contactForm.querySelector('.send');
      const labelEl = btn.querySelector('.send-label');

      if (!contactForm.checkValidity()) {
        contactForm.reportValidity();
        return;
      }

      btn.disabled = true;
      labelEl.textContent = 'Invio in corso...';

      try {
        const data = new FormData(contactForm);
        const res = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          body: data,
        });
        const json = await res.json();

        if (json.success) {
          contactForm.style.display = 'none';
          contactConfirm.removeAttribute('hidden');
        } else {
          throw new Error(json.message || 'Errore di invio');
        }
      } catch (err) {
        labelEl.textContent = 'Errore — riprova';
        btn.disabled = false;
        console.error('[Contact form]', err);
      }
    });
  }

  // ── Noraya form (Web3Forms AJAX) ─────────────────────────────────────────
  const norayaForm = document.getElementById('noraya-form');
  const norayaConfirm = document.getElementById('noraya-confirm');

  if (norayaForm) {
    norayaForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const btn = norayaForm.querySelector('.nf-submit');
      const labelEl = btn.querySelector('.nf-submit-label');

      if (!norayaForm.checkValidity()) {
        norayaForm.reportValidity();
        return;
      }

      btn.disabled = true;
      labelEl.textContent = '// elaborazione...';

      try {
        const data = new FormData(norayaForm);
        const res = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          body: data,
        });
        const json = await res.json();

        if (json.success) {
          norayaForm.style.display = 'none';
          norayaConfirm.removeAttribute('hidden');
        } else {
          throw new Error(json.message || 'Errore di trasmissione');
        }
      } catch (err) {
        labelEl.textContent = '// errore — riprova';
        btn.disabled = false;
        console.error('[Noraya form]', err);
      }
    });
  }

})();
