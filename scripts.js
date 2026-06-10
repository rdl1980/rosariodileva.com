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

// ── Share — Web Share API (Instagram · TikTok) ───────────────────────────────
(function () {
  'use strict';

  function copyLink(btn, url) {
    var orig = btn.textContent;
    function done() {
      btn.textContent = '// link copiato ✓';
      btn.classList.add('copied');
      setTimeout(function () {
        btn.textContent = orig;
        btn.classList.remove('copied');
      }, 2000);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(done).catch(function () {
        var ta = document.createElement('textarea');
        ta.value = url;
        ta.style.cssText = 'position:fixed;opacity:0;pointer-events:none;';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        done();
      });
    } else {
      var ta = document.createElement('textarea');
      ta.value = url;
      ta.style.cssText = 'position:fixed;opacity:0;pointer-events:none;';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      done();
    }
  }

  document.addEventListener('click', function (e) {
    var btn = e.target.closest('.bd-share-native');
    if (!btn) return;

    var url   = btn.dataset.url   || window.location.href;
    var title = btn.dataset.title || document.title;
    var text  = btn.dataset.text  || '';

    if (navigator.share) {
      navigator.share({ title: title, text: text, url: url }).catch(function (err) {
        // AbortError = utente ha annullato: non fare nulla
        if (err && err.name === 'AbortError') return;
        // Qualsiasi altro errore (NotAllowedError su Chrome desktop, ecc.) → copia link
        copyLink(btn, url);
      });
    } else {
      copyLink(btn, url);
    }
  });
}());

// ── Lightbox (gallery) ───────────────────────────────────────────────────────
(function () {
  'use strict';

  const tiles = [...document.querySelectorAll('.gallery-tile[data-src]')];
  if (!tiles.length) return;

  // Helpers
  function isVideo(src) {
    return /\.(mp4|webm|ogv)$/i.test(src);
  }

  // Build overlay DOM
  const overlay = document.createElement('div');
  overlay.id = 'lb-overlay';
  overlay.className = 'lb-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'Visualizzatore media');
  overlay.innerHTML =
    '<button class="lb-close" aria-label="Chiudi">✕</button>' +
    '<div class="lb-img-wrap">' +
      '<img class="lb-img" src="" alt="" style="display:none" />' +
      '<video class="lb-video" style="display:none" controls><source src="" /></video>' +
    '</div>' +
    '<button class="lb-prev" aria-label="Elemento precedente">←</button>' +
    '<button class="lb-next" aria-label="Elemento successivo">→</button>' +
    '<div class="lb-caption" aria-live="polite"></div>' +
    '<div class="lb-counter" aria-hidden="true"></div>';
  document.body.appendChild(overlay);

  const img     = overlay.querySelector('.lb-img');
  const video   = overlay.querySelector('.lb-video');
  const caption = overlay.querySelector('.lb-caption');
  const counter = overlay.querySelector('.lb-counter');
  const btnClose = overlay.querySelector('.lb-close');
  const btnPrev  = overlay.querySelector('.lb-prev');
  const btnNext  = overlay.querySelector('.lb-next');

  let current = 0;

  function show(index) {
    video.pause();
    current = ((index % tiles.length) + tiles.length) % tiles.length;
    const tile = tiles[current];
    const src = tile.dataset.src;
    const isVid = isVideo(src);

    if (isVid) {
      img.style.display = 'none';
      video.style.display = 'block';
      video.querySelector('source').src = src;
      video.load();
    } else {
      video.style.display = 'none';
      img.style.display = 'block';
      img.src = src;
    }

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
    video.pause();
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

// ── Newsletter strip form ─────────────────────────────────────────────────────
(function () {
  'use strict';

  var form = document.getElementById('nl-strip-form');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var input = form.querySelector('[name="email"]');
    var email = input ? input.value.trim() : '';
    if (!email) { input && input.focus(); return; }
    var url = 'https://rosariodileva.substack.com/subscribe?email=' + encodeURIComponent(email);
    window.open(url, '_blank', 'noopener,noreferrer');
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
    // Aggiorna Google Consent Mode v2
    if (typeof gtag === 'function') {
      gtag('consent', 'update', {
        analytics_storage: choice === 'accepted' ? 'granted' : 'denied'
      });
    }
    banner.classList.remove('ck-visible');
    banner.addEventListener('transitionend', function () { banner.remove(); }, { once: true });
  }

  banner.querySelector('.ck-accept').addEventListener('click', function () { dismiss('accepted'); });
  banner.querySelector('.ck-reject').addEventListener('click', function () { dismiss('rejected'); });
}());

// ── GA4 Event tracking (#25) ─────────────────────────────────────────────────
(function () {
  'use strict';

  function track(eventName, params) {
    if (typeof gtag === 'function') gtag('event', eventName, params || {});
  }

  document.addEventListener('click', function (e) {
    var el = e.target;

    // Acquisto — Bookabook (nav CTA, bottoni primari)
    var bk = el.closest('a[href*="bookabook.it"]');
    if (bk) { track('purchase_intent', { store: 'bookabook', location: bk.className }); return; }

    // Acquisto — Amazon
    var amz = el.closest('a[href*="amazon.it"]');
    if (amz) { track('purchase_intent', { store: 'amazon' }); return; }

    // Acquisto — Feltrinelli
    var felt = el.closest('a[href*="lafeltrinelli.it"]');
    if (felt) { track('purchase_intent', { store: 'feltrinelli' }); return; }

    // Acquisto — IBS
    var ibs = el.closest('a[href*="ibs.it"]');
    if (ibs) { track('purchase_intent', { store: 'ibs' }); return; }

    // Acquisto — Libreria Universitaria
    var lu = el.closest('a[href*="libreriauniversitaria.it"]');
    if (lu) { track('purchase_intent', { store: 'libreria_universitaria' }); return; }

    // Newsletter form submit
    var nlBtn = el.closest('#nl-strip-form button[type="submit"]');
    if (nlBtn) { track('newsletter_signup_attempt'); return; }

    // Noraya form submit
    var nfBtn = el.closest('#noraya-form button[type="submit"]');
    if (nfBtn) { track('noraya_contact_attempt'); return; }

    // Social links
    var ig = el.closest('a[href*="instagram.com"]');
    if (ig) { track('social_click', { platform: 'instagram' }); return; }

    var tw = el.closest('a[href*="x.com"], a[href*="twitter.com"]');
    if (tw) { track('social_click', { platform: 'x_twitter' }); return; }

    var sub = el.closest('a[href*="substack.com"]');
    if (sub) { track('social_click', { platform: 'substack' }); return; }
  });

  // Track newsletter form submit (l'evento submit, non il click del bottone)
  document.addEventListener('submit', function (e) {
    if (e.target && e.target.id === 'nl-strip-form') {
      var val = e.target.querySelector('[name="email"]');
      if (val && val.value.trim()) track('newsletter_signup', { method: 'inline_form' });
    }
    if (e.target && e.target.id === 'contact-form') track('contact_form_submit');
    if (e.target && e.target.id === 'noraya-form') track('noraya_contact_submit');
  });
}());

// ── Substack custom widget (#41) ─────────────────────────────────────────────
(function () {
  'use strict';
  if (!document.getElementById('custom-substack-embed')) return;
  window.CustomSubstackWidget = {
    substackUrl: 'rosariodileva.substack.com',
    placeholder:  'la tua email',
    buttonText:   'Iscriviti',
    theme:        'custom',
    colors: {
      primary: '#c9a25f',
      input:   '#14161c',
      email:   '#e8e6e1',
      text:    '#e8e6e1'
    }
  };
  var s = document.createElement('script');
  s.src = 'https://substackapi.com/widget.js';
  s.async = true;
  document.body.appendChild(s);
}());

// ── Substack RSS preview (#28) ────────────────────────────────────────────────
(function () {
  'use strict';

  var container = document.getElementById('substack-posts');
  if (!container) return;

  var RSS_URL = 'https://rosariodileva.substack.com/feed';
  // Usa un proxy CORS pubblico per il feed RSS
  var PROXY   = 'https://api.allorigins.win/get?url=' + encodeURIComponent(RSS_URL);

  function escHtml(str) {
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function formatDate(str) {
    try {
      var d = new Date(str);
      return d.toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch (e) { return str || ''; }
  }

  function renderPosts(items) {
    if (!items.length) {
      container.innerHTML = '<p class="substack-preview-empty">// nessun articolo disponibile al momento.</p>';
      return;
    }
    var html = items.slice(0, 3).map(function (item) {
      return (
        '<article class="sp-card">' +
          '<a class="sp-card-link" href="' + escHtml(item.link) + '" target="_blank" rel="noopener">' +
            '<div class="sp-card-date">' + escHtml(item.date) + '</div>' +
            '<h3 class="sp-card-title">' + escHtml(item.title) + '</h3>' +
            (item.desc ? '<p class="sp-card-desc">' + escHtml(item.desc) + '</p>' : '') +
          '</a>' +
        '</article>'
      );
    }).join('');
    container.innerHTML = html;
  }

  fetch(PROXY)
    .then(function (r) { return r.json(); })
    .then(function (data) {
      var xml = (new DOMParser()).parseFromString(data.contents, 'text/xml');
      var nodes = Array.from(xml.querySelectorAll('item'));
      var items = nodes.map(function (n) {
        var descRaw = (n.querySelector('description') || {}).textContent || '';
        // Strip HTML tags from description
        var tmp = document.createElement('div');
        tmp.innerHTML = descRaw;
        var plain = (tmp.textContent || '').trim().slice(0, 120);
        if (plain.length === 120) plain += '…';
        return {
          title: (n.querySelector('title') || {}).textContent || '',
          link:  (n.querySelector('link') || {}).textContent || '',
          date:  formatDate((n.querySelector('pubDate') || {}).textContent || ''),
          desc:  plain
        };
      });
      renderPosts(items);
    })
    .catch(function () {
      var container = document.getElementById('substack-posts');
      if (container) {
        container.innerHTML = '<p class="substack-preview-empty">// impossibile caricare gli articoli al momento.</p>';
      }
    });
}());

// ── FX: raggio di scansione (pagine libro) ───────────────────────────────────
(function () {
  'use strict';
  if (!document.body.classList.contains('fx-scan')) return;
  var beam = document.createElement('div');
  beam.className = 'fx-scanbeam';
  beam.setAttribute('aria-hidden', 'true');
  document.body.appendChild(beam);
}());

// ── FX: scramble text al passaggio del mouse ─────────────────────────────────
(function () {
  'use strict';
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var CHARS = '<>\|[]{}#$%&*+=~abcdefghjkmnpqrstuvwxyz0123456789';
  var SELECTOR = '.nav-menu a, .label, .hcd-label, .bd-stores-label, ' +
                 '.bd-genesis-label, .substack-preview-label, ' +
                 'footer .footer-col h5, .gcap span';

  document.querySelectorAll(SELECTOR).forEach(function (el) {
    // Solo elementi di puro testo, una sola volta
    if (el.children.length || el.dataset.scrambleBound) return;
    el.dataset.scrambleBound = '1';

    var original = el.textContent;
    if (!original.trim()) return;
    var running = false;

    el.addEventListener('mouseenter', function () {
      if (running) return;
      running = true;
      var frame = 0;
      var total = original.length + 6;
      var timer = setInterval(function () {
        var out = '';
        for (var i = 0; i < original.length; i++) {
          var ch = original[i];
          // Spazi e "//" restano fissi: l'identità del prefisso non si tocca
          if (ch === ' ' || ch === '/') { out += ch; continue; }
          out += (i < frame - 3) ? ch : CHARS[Math.floor(Math.random() * CHARS.length)];
        }
        el.textContent = out;
        frame++;
        if (frame > total) {
          clearInterval(timer);
          el.textContent = original;
          running = false;
        }
      }, 28);
    });
  });
}());

// ── Crossfade copertina hero ─────────────────────────────────────────────────
(function () {
  'use strict';
  var cover = document.querySelector('.book-cover');
  if (!cover || !cover.querySelector('.cover-alt')) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  setInterval(function () {
    cover.classList.toggle('show-alt');
  }, 3000);
}());
