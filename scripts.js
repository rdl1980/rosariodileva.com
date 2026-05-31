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

// ── Reading progress bar ──────────────────────────────────────────────────────
(function () {
  'use strict';

  var bar = document.createElement('div');
  bar.id = 'reading-progress';
  bar.setAttribute('role', 'progressbar');
  bar.setAttribute('aria-label', 'Avanzamento lettura');
  bar.setAttribute('aria-valuenow', '0');
  bar.setAttribute('aria-valuemin', '0');
  bar.setAttribute('aria-valuemax', '100');
  document.body.prepend(bar);

  function update() {
    var scrollTop  = window.scrollY;
    var docHeight  = document.documentElement.scrollHeight - window.innerHeight;
    var pct = docHeight > 0 ? Math.min(100, (scrollTop / docHeight) * 100) : 0;
    bar.style.width = pct + '%';
    bar.setAttribute('aria-valuenow', Math.round(pct));
  }

  window.addEventListener('scroll', update, { passive: true });
  update();
}());

// ── Countdown lancio ──────────────────────────────────────────────────────────
(function () {
  'use strict';

  var wrap = document.getElementById('hero-countdown');
  if (!wrap) return;

  // 11 giugno 2026 mezzanotte ora italiana (UTC+2)
  var LAUNCH = new Date('2026-06-11T00:00:00+02:00').getTime();

  var elDays  = document.getElementById('hcd-days');
  var elHours = document.getElementById('hcd-hours');
  var elMins  = document.getElementById('hcd-mins');
  var elSecs  = document.getElementById('hcd-secs');
  var heroTag = document.querySelector('.hero-tag span:last-child');

  function pad(n) { return String(n).padStart(2, '0'); }

  function tick() {
    var diff = LAUNCH - Date.now();

    if (diff <= 0) {
      wrap.innerHTML = '<div class="hcd-live">// ora disponibile</div>';
      if (heroTag) heroTag.textContent = '// ora disponibile';
      return;
    }

    elDays.textContent  = pad(Math.floor(diff / 86400000));
    elHours.textContent = pad(Math.floor((diff % 86400000) / 3600000));
    elMins.textContent  = pad(Math.floor((diff % 3600000)  / 60000));
    elSecs.textContent  = pad(Math.floor((diff % 60000)    / 1000));

    setTimeout(tick, 1000);
  }

  tick();
}());

// ── Back to top ───────────────────────────────────────────────────────────────
(function () {
  'use strict';

  var btn = document.createElement('button');
  btn.id = 'back-to-top';
  btn.setAttribute('aria-label', 'Torna in cima');
  btn.textContent = '↑';
  document.body.appendChild(btn);

  window.addEventListener('scroll', function () {
    btn.classList.toggle('btt-visible', window.scrollY > 400);
  }, { passive: true });

  btn.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}());

// ── Share — copia link ────────────────────────────────────────────────────────
(function () {
  'use strict';

  document.addEventListener('click', function (e) {
    var btn = e.target.closest('.bd-share-copy');
    if (!btn) return;

    var url = btn.dataset.url || window.location.href;
    navigator.clipboard.writeText(url).then(function () {
      var orig = btn.textContent;
      btn.textContent = '// link copiato ✓';
      btn.classList.add('copied');
      setTimeout(function () {
        btn.textContent = orig;
        btn.classList.remove('copied');
      }, 2000);
    }).catch(function () {
      // fallback per browser senza clipboard API
      var ta = document.createElement('textarea');
      ta.value = url;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    });
  });
}());

// ── Lightbox (gallery) ───────────────────────────────────────────────────────
(function () {
  'use strict';

  const tiles = [...document.querySelectorAll('.gallery-tile[data-src]')];
  if (!tiles.length) return;

  // Build overlay DOM
  const overlay = document.createElement('div');
  overlay.id = 'lb-overlay';
  overlay.className = 'lb-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'Visualizzatore immagini');
  overlay.innerHTML =
    '<button class="lb-close" aria-label="Chiudi">✕</button>' +
    '<div class="lb-img-wrap"><img class="lb-img" src="" alt="" /></div>' +
    '<button class="lb-prev" aria-label="Immagine precedente">←</button>' +
    '<button class="lb-next" aria-label="Immagine successiva">→</button>' +
    '<div class="lb-caption" aria-live="polite"></div>' +
    '<div class="lb-counter" aria-hidden="true"></div>';
  document.body.appendChild(overlay);

  const img     = overlay.querySelector('.lb-img');
  const caption = overlay.querySelector('.lb-caption');
  const counter = overlay.querySelector('.lb-counter');
  const btnClose = overlay.querySelector('.lb-close');
  const btnPrev  = overlay.querySelector('.lb-prev');
  const btnNext  = overlay.querySelector('.lb-next');

  let current = 0;

  function show(index) {
    current = ((index % tiles.length) + tiles.length) % tiles.length;
    const tile = tiles[current];
    img.src = tile.dataset.src;
    img.alt = tile.dataset.alt || '';
    caption.textContent = tile.dataset.caption || '';
    counter.textContent = (current + 1) + ' / ' + tiles.length;
  }

  function open(index) {
    show(index);
    overlay.classList.add('lb-open');
    document.body.style.overflow = 'hidden';
    btnClose.focus();
  }

  function close() {
    overlay.classList.remove('lb-open');
    document.body.style.overflow = '';
    tiles[current].focus();
  }

  // Wire tiles
  tiles.forEach(function (tile, i) {
    tile.setAttribute('tabindex', '0');
    tile.setAttribute('role', 'button');
    tile.setAttribute('aria-label', 'Apri immagine: ' + (tile.dataset.caption || ''));
    tile.addEventListener('click', function () { open(i); });
    tile.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(i); }
    });
  });

  btnClose.addEventListener('click', close);
  btnPrev.addEventListener('click',  function () { show(current - 1); });
  btnNext.addEventListener('click',  function () { show(current + 1); });

  // Close on backdrop click
  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) close();
  });

  // Keyboard navigation
  document.addEventListener('keydown', function (e) {
    if (!overlay.classList.contains('lb-open')) return;
    if (e.key === 'Escape')     close();
    if (e.key === 'ArrowLeft')  show(current - 1);
    if (e.key === 'ArrowRight') show(current + 1);
  });
}());

// ── Cookie consent banner ────────────────────────────────────────────────────
(function () {
  'use strict';

  const CONSENT_KEY = 'rdl-cookie-consent';
  if (localStorage.getItem(CONSENT_KEY)) return;

  const banner = document.createElement('div');
  banner.id = 'cookie-banner';
  banner.setAttribute('role', 'dialog');
  banner.setAttribute('aria-label', 'Consenso cookie');
  banner.innerHTML =
    '<div class="ck-inner">' +
      '<p class="ck-text">Questo sito usa <strong>Google Fonts</strong> (servizio esterno) per la tipografia. ' +
      'Nessun cookie di profilazione. ' +
      '<a href="/contatti">Privacy policy</a>.</p>' +
      '<div class="ck-btns">' +
        '<button class="ck-accept" type="button">Accetta</button>' +
        '<button class="ck-reject" type="button">Solo necessari</button>' +
      '</div>' +
    '</div>';

  document.body.appendChild(banner);
  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      banner.classList.add('ck-visible');
    });
  });

  function dismiss(choice) {
    localStorage.setItem(CONSENT_KEY, choice);
    banner.classList.remove('ck-visible');
    banner.addEventListener('transitionend', function () { banner.remove(); }, { once: true });
  }

  banner.querySelector('.ck-accept').addEventListener('click', function () { dismiss('accepted'); });
  banner.querySelector('.ck-reject').addEventListener('click', function () { dismiss('rejected'); });
}());
