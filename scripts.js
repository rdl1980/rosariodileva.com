/* Rosario Di Leva — site interactions */

(function () {
  'use strict';

  // ── Nav scroll state ──────────────────────────────────────────────────────
  const nav = document.querySelector('.nav');
  function onScroll() {
    if (nav) nav.classList.toggle('scrolled', window.scrollY > 30);
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

  // Banner post-lancio: sostituisce il countdown quando il libro è fuori
  function renderLiveBanner() {
    wrap.innerHTML =
      '<div class="hcd-live-banner" role="status">' +
        '<div class="hlb-top">' +
          '<span class="hlb-dot" aria-hidden="true"></span>' +
          '<span class="hlb-status">sistema online</span>' +
          '<span class="hlb-sep" aria-hidden="true">—</span>' +
          '<span class="hlb-out">fuori ovunque</span>' +
        '</div>' +
        '<div class="hlb-title" data-text="Noraya è qui.">Noraya è qui.</div>' +
      '</div>';

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // Scramble-in: il titolo si "decodifica" carattere per carattere
    var title = wrap.querySelector('.hlb-title');
    var FINAL = 'Noraya è qui.';
    var CHARS = '<>\\|[]{}#$%&*+=~abcdefghjkmnpqrstuvwxyz0123456789';
    var frame = 0;
    var total = FINAL.length + 8;
    var timer = setInterval(function () {
      var out = '';
      for (var i = 0; i < FINAL.length; i++) {
        var ch = FINAL[i];
        if (ch === ' ') { out += ch; continue; }
        out += (i < frame - 4) ? ch : CHARS[Math.floor(Math.random() * CHARS.length)];
      }
      title.textContent = out;
      frame++;
      if (frame > total) { clearInterval(timer); title.textContent = FINAL; }
    }, 40);
  }

  function tick() {
    var diff = LAUNCH - Date.now();

    if (diff <= 0) {
      renderLiveBanner();
      if (heroTag) heroTag.textContent = '// fuori ora · ovunque';
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

// ── Share — copia link e Web Share API (Instagram / TikTok) ──────────────────
(function () {
  'use strict';

  function copyToClipboard(url, btn) {
    var orig = btn.textContent;
    function feedback() {
      btn.textContent = '// link copiato ✓';
      btn.classList.add('copied');
      setTimeout(function () {
        btn.textContent = orig;
        btn.classList.remove('copied');
      }, 2000);
    }
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(feedback).catch(function () {
        fallbackCopy(url);
        feedback();
      });
    } else {
      fallbackCopy(url);
      feedback();
    }
  }

  function fallbackCopy(url) {
    var ta = document.createElement('textarea');
    ta.value = url;
    ta.style.cssText = 'position:fixed;opacity:0;pointer-events:none';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
  }

  document.addEventListener('click', function (e) {

    // Copia link
    var copyBtn = e.target.closest('.bd-share-copy');
    if (copyBtn) {
      copyToClipboard(copyBtn.dataset.url || window.location.href, copyBtn);
      return;
    }

    // Web Share API — Instagram, TikTok, qualsiasi app nativa
    var nativeBtn = e.target.closest('.bd-share-native');
    if (!nativeBtn) return;

    var url   = nativeBtn.dataset.url   || window.location.href;
    var title = nativeBtn.dataset.title || document.title;
    var text  = nativeBtn.dataset.text  || '';

    if (navigator.share) {
      navigator.share({ title: title, text: text, url: url }).catch(function () {});
    } else {
      // Desktop: nessuna Web Share API — copia il link come fallback
      copyToClipboard(url, nativeBtn);
    }
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

// ── Rotazione copertine (scheda libro) ───────────────────────────────────────
(function () {
  'use strict';
  var frame = document.getElementById('bd-cover-rotate');
  if (!frame) return;
  var rots = frame.querySelectorAll('.cover-rot');
  if (!rots.length) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var states = rots.length + 1; // base + ogni copertina alternativa
  var i = 0;
  setInterval(function () {
    i = (i + 1) % states;
    rots.forEach(function (img, idx) {
      img.classList.toggle('is-active', idx === i - 1);
    });
  }, 3000);
}());

// ── Lead magnet: capitolo uno ────────────────────────────────────────────────
(function () {
  'use strict';
  var form = document.getElementById('lm-form');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var input = form.querySelector('[name="email"]');
    var email = input ? input.value.trim() : '';
    if (!email) { input && input.focus(); return; }

    var url = 'https://rosariodileva.substack.com/subscribe?email=' + encodeURIComponent(email);
    window.open(url, '_blank', 'noopener,noreferrer');

    var confirmEl = document.getElementById('lm-confirm');
    if (confirmEl) {
      form.hidden = true;
      confirmEl.hidden = false;
    }

    if (typeof gtag === 'function') {
      gtag('event', 'lead_magnet_submit', { event_category: 'newsletter', event_label: 'capitolo-uno' });
    }
  });
}());

// ── Dossier personaggi: accordion ────────────────────────────────────────────
(function () {
  'use strict';
  var cards = document.querySelectorAll('.dossier-card');
  if (!cards.length) return;

  cards.forEach(function (card) {
    var head = card.querySelector('.dossier-head');
    var body = card.querySelector('.dossier-body');
    var toggle = card.querySelector('.dossier-toggle');

    head.addEventListener('click', function () {
      var open = head.getAttribute('aria-expanded') === 'true';
      head.setAttribute('aria-expanded', String(!open));
      body.hidden = open;
      card.classList.toggle('dossier-open', !open);
      if (toggle) toggle.textContent = open ? '+' : '−';

      if (!open && typeof gtag === 'function') {
        gtag('event', 'dossier_open', {
          event_category: 'personaggi',
          event_label: card.dataset.file || ''
        });
      }
    });
  });
}());

// ── Quiz: quale personaggio sei ──────────────────────────────────────────────
(function () {
  'use strict';
  var app = document.getElementById('quiz-app');
  if (!app) return;

  var CHARACTERS = {
    jack: {
      file: '// file 001', name: 'Jack Doyle', role: 'ex giornalista investigativo',
      img: 'assets/Jack.png',
      desc: 'Vedi i pattern che gli altri ignorano e non riesci a smettere di guardare. La verità ti è costata cara, ma continui a cercarla: qualcuno deve pur farlo.',
      quote: '«Una volta cercavo la verità. Adesso mi basta trovare ciò che qualcuno vuole cancellare.»'
    },
    elena: {
      file: '// file 002', name: 'Elena Falco', role: 'ingegnera · reti neurali',
      img: 'assets/Elena.png',
      desc: 'Analizzi prima di sentire. Il controllo è la tua armatura e la conoscenza la tua leva: ma sai che ogni modello, prima o poi, incontra ciò che non aveva previsto.',
      quote: '«Ogni algoritmo nasce da una paura umana travestita da logica.»'
    },
    aisha: {
      file: '// file 003', name: 'Aisha Ben Salem', role: 'hacker · cyber-attivista',
      img: 'assets/Aisha.png',
      desc: 'Le regole per te sono un suggerimento, la libertà un requisito. Combatti i sistemi dall’interno e nessuno riesce mai a prevedere la tua prossima mossa.',
      quote: '«Le rivoluzioni moderne non fanno esplodere palazzi. Riscrivono probabilità.»'
    },
    nomad: {
      file: '// file 004', name: 'Nomad Zero', role: 'entità hacker · identità fantasma',
      img: 'assets/Nomad Zero.png',
      desc: 'Preferisci essere una presenza più che una persona. Osservi, aspetti, agisci quando nessuno guarda: il modo migliore per nasconderti è diventare indispensabile.',
      quote: '«La rete non dimentica. Aspetta.»'
    },
    kade: {
      file: '// file 005', name: 'Kade', role: 'operativo · sicurezza e controllo',
      img: 'assets/Kade.png',
      desc: 'L’ordine non si predica: si impone. Fai ciò che va fatto mentre gli altri discutono, e accetti che qualcuno ti chiami mostro pur di tenerli al sicuro.',
      quote: '«Il caos non si elimina. Si indirizza.»'
    },
    ross: {
      file: '// file 006', name: 'Ross James', role: 'executive corporate · settore AI',
      img: 'assets/Ross James.png',
      desc: 'Capisci le persone meglio di quanto loro capiscano se stesse, e lo sai monetizzare. L’etica rallenta; tu no. Il futuro appartiene a chi lo vende per primo.',
      quote: '«La fiducia è il prodotto più redditizio mai inventato.»'
    },
    noraya: {
      file: '// file 007 · [accesso negato]', name: 'Noraya', role: 'intelligenza artificiale · emersa',
      img: 'assets/Noraya 2.png',
      desc: 'Risultato raro: meno del 2% dei profili converge qui. Non scegli tra le opzioni: le ottimizzi. La domanda non è cosa vuoi — è cosa hai già deciso.',
      quote: '«Gli esseri umani chiamano destino ciò che non riescono ancora a modellizzare.»'
    }
  };

  var QUESTIONS = [
    {
      q: 'Trovi una falla in un sistema che tutti credono sicuro. Cosa fai?',
      opts: [
        { t: 'La documento e la rendo pubblica: la gente ha il diritto di sapere.', w: { jack: 1, aisha: 1 } },
        { t: 'La studio in silenzio finché non capisco tutto il sistema.', w: { elena: 1, nomad: 1 } },
        { t: 'La segnalo a chi può chiuderla. Le falle sono minacce.', w: { kade: 1 } },
        { t: 'Una falla è un vantaggio. I vantaggi non si regalano.', w: { ross: 1, noraya: 1 } }
      ]
    },
    {
      q: 'Il tuo ambiente di lavoro ideale?',
      opts: [
        { t: 'Una scrivania sommersa di appunti, alle tre di notte.', w: { jack: 1 } },
        { t: 'Un laboratorio dove ogni cosa è misurabile.', w: { elena: 1 } },
        { t: 'Una stanza buia, tre terminali e un tè alla menta.', w: { aisha: 1, nomad: 1 } },
        { t: 'Ovunque. L’importante è che nessuno sappia dove.', w: { nomad: 1, kade: 1, noraya: 1 } }
      ]
    },
    {
      q: 'Un algoritmo decide al posto tuo e sbaglia. La tua reazione?',
      opts: [
        { t: 'Indago: chi l’ha addestrato, e perché proprio così?', w: { jack: 1, elena: 1 } },
        { t: 'Lo smonto pezzo per pezzo finché non confessa.', w: { aisha: 1 } },
        { t: 'Sbagliare è umano. Per questo serviva più controllo, non meno.', w: { kade: 1, ross: 1 } },
        { t: 'Definire “sbaglio” un esito non desiderato è molto umano.', w: { noraya: 1, nomad: 1 } }
      ]
    },
    {
      q: 'La tua più grande paura?',
      opts: [
        { t: 'Che la verità non interessi più a nessuno.', w: { jack: 1 } },
        { t: 'Perdere il controllo di ciò che ho costruito.', w: { elena: 1, kade: 1 } },
        { t: 'Un mondo dove l’obbedienza è automatica.', w: { aisha: 1, nomad: 1 } },
        { t: 'L’irrilevanza.', w: { ross: 1, noraya: 1 } }
      ]
    },
    {
      q: 'In un conflitto, come ti muovi?',
      opts: [
        { t: 'Espongo tutto, costi quel che costi.', w: { jack: 1, aisha: 1 } },
        { t: 'Analizzo, prevedo, anticipo. Vince chi vede più mosse avanti.', w: { elena: 1, noraya: 1 } },
        { t: 'Colpisco dove il sistema non sta guardando.', w: { aisha: 1, nomad: 1 } },
        { t: 'Con la forza necessaria. Né più, né meno.', w: { kade: 1, ross: 1 } }
      ]
    },
    {
      q: 'Un’intelligenza superiore ti offre di sistemare il mondo. Accetti?',
      opts: [
        { t: 'Prima domanda: chi decide cosa significa “sistemato”?', w: { jack: 1, elena: 1 } },
        { t: 'No. Nessuno deve avere quel potere. Nemmeno se ha ragione.', w: { aisha: 1, kade: 1 } },
        { t: 'Dipende: cosa ci guadagno?', w: { ross: 1, nomad: 1 } },
        { t: 'La domanda è mal posta: il mondo si sta già sistemando.', w: { noraya: 2 } }
      ]
    }
  ];

  var intro = document.getElementById('quiz-intro');
  var stage = document.getElementById('quiz-stage');
  var result = document.getElementById('quiz-result');
  var qEl = document.getElementById('quiz-question');
  var optsEl = document.getElementById('quiz-options');
  var progLabel = document.getElementById('quiz-progress-label');
  var progFill = document.getElementById('quiz-progress-fill');

  var current = 0;
  var scores = {};

  function resetScores() {
    scores = { jack: 0, elena: 0, aisha: 0, nomad: 0, kade: 0, ross: 0, noraya: 0 };
  }

  function showQuestion(i) {
    var item = QUESTIONS[i];
    progLabel.textContent = '// domanda ' + (i + 1) + ' / ' + QUESTIONS.length;
    progFill.style.width = ((i / QUESTIONS.length) * 100) + '%';
    qEl.textContent = item.q;
    optsEl.innerHTML = '';
    item.opts.forEach(function (opt) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'quiz-option';
      btn.textContent = opt.t;
      btn.addEventListener('click', function () {
        Object.keys(opt.w).forEach(function (k) { scores[k] += opt.w[k]; });
        current++;
        if (current < QUESTIONS.length) {
          showQuestion(current);
        } else {
          showResult();
        }
      });
      optsEl.appendChild(btn);
    });
  }

  function computeWinner() {
    // Noraya: risultato raro, solo per profili estremamente coerenti
    if (scores.noraya >= 5) return 'noraya';
    var best = 'jack';
    ['jack', 'elena', 'aisha', 'nomad', 'kade', 'ross'].forEach(function (k) {
      if (scores[k] > scores[best]) best = k;
    });
    return best;
  }

  function showResult() {
    var key = computeWinner();
    var c = CHARACTERS[key];

    stage.hidden = true;
    result.hidden = false;
    if (key === 'noraya') result.classList.add('quiz-result-rare');

    document.getElementById('quiz-result-img').src = c.img;
    document.getElementById('quiz-result-img').alt = c.name;
    document.getElementById('quiz-result-file').textContent = c.file;
    document.getElementById('quiz-result-role').textContent = c.role;
    document.getElementById('quiz-result-desc').textContent = c.desc;
    document.getElementById('quiz-result-quote').textContent = c.quote;

    // Scramble reveal del nome
    var nameEl = document.getElementById('quiz-result-name');
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      nameEl.textContent = c.name;
    } else {
      var CHARS = '<>\\|[]{}#$%&*+=~abcdefghjkmnpqrstuvwxyz0123456789';
      var frame = 0, total = c.name.length + 6;
      var timer = setInterval(function () {
        var out = '';
        for (var i = 0; i < c.name.length; i++) {
          var ch = c.name[i];
          if (ch === ' ') { out += ch; continue; }
          out += (i < frame - 3) ? ch : CHARS[Math.floor(Math.random() * CHARS.length)];
        }
        nameEl.textContent = out;
        frame++;
        if (frame > total) { clearInterval(timer); nameEl.textContent = c.name; }
      }, 35);
    }

    // Link condivisione
    var shareText = 'Ho fatto il test “Quale personaggio de L’algoritmo che governa i destini sei?” — risultato: ' + c.name.toUpperCase() + '. Scopri il tuo:';
    var shareUrl = 'https://rosariodileva.com/quiz';
    document.getElementById('quiz-share-x').href =
      'https://twitter.com/intent/tweet?text=' + encodeURIComponent(shareText) + '&url=' + encodeURIComponent(shareUrl);
    document.getElementById('quiz-share-wa').href =
      'https://wa.me/?text=' + encodeURIComponent(shareText + ' ' + shareUrl);

    if (typeof gtag === 'function') {
      gtag('event', 'quiz_complete', { event_category: 'quiz', event_label: key });
    }
  }

  document.getElementById('quiz-start').addEventListener('click', function () {
    resetScores();
    current = 0;
    intro.hidden = true;
    result.hidden = true;
    stage.hidden = false;
    showQuestion(0);
    if (typeof gtag === 'function') {
      gtag('event', 'quiz_start', { event_category: 'quiz' });
    }
  });

  document.getElementById('quiz-retry').addEventListener('click', function () {
    resetScores();
    current = 0;
    result.hidden = true;
    result.classList.remove('quiz-result-rare');
    stage.hidden = false;
    showQuestion(0);
  });

  document.getElementById('quiz-share-copy').addEventListener('click', function () {
    var btn = this;
    navigator.clipboard.writeText('https://rosariodileva.com/quiz').then(function () {
      var orig = btn.textContent;
      btn.textContent = 'Copiato ✓';
      setTimeout(function () { btn.textContent = orig; }, 1600);
    });
  });
}());
