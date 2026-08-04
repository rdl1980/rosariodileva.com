const { test, expect } = require('@playwright/test');
const BASE = 'http://localhost:3002';
function url(slug) {
  return slug === '' ? BASE + '/' : BASE + '/' + slug + '.html';
}

// ── F16: newsletter form ──────────────────────────────────────────────────────
test.describe('F16 - newsletter inline form', () => {

  test('index: form ha input email e bottone submit', async ({ page }) => {
    await page.goto(url(''));
    await expect(page.locator('#nl-strip-form input[type="email"]')).toBeVisible();
    await expect(page.locator('#nl-strip-form button[type="submit"]')).toBeVisible();
  });

  test('index: submit email valida apre substack precompilato', async ({ page }) => {
    await page.goto(url(''));
    const [popup] = await Promise.all([
      page.waitForEvent('popup'),
      page.locator('#nl-strip-form input[type="email"]').fill('test@example.com'),
      page.locator('#nl-strip-form button[type="submit"]').click(),
    ]);
    await popup.waitForLoadState('domcontentloaded');
    expect(decodeURIComponent(popup.url())).toContain('rosariodileva.substack.com');
    expect(decodeURIComponent(popup.url())).toContain('test@example.com');
    await popup.close();
  });

  test('index: submit vuoto non apre popup', async ({ page }) => {
    await page.goto(url(''));
    let popped = false;
    page.on('popup', () => { popped = true; });
    await page.locator('#nl-strip-form button[type="submit"]').click();
    await page.waitForTimeout(400);
    expect(popped).toBe(false);
  });

  test('mobile 375px: form impilato verticalmente', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(url(''));
    const ib = await page.locator('#nl-strip-form .nl-strip-input').boundingBox();
    const bb = await page.locator('#nl-strip-form button').boundingBox();
    expect(bb.y).toBeGreaterThan(ib.y + ib.height - 5);
  });

  test('hero ghost CTA punta a /algoritmo', async ({ page }) => {
    await page.goto(url(''));
    await expect(page.locator('.hero-cta .btn.ghost')).toHaveAttribute('href', '/algoritmo');
  });

  const slugs = ['algoritmo','diario','noraya','autore','gallery','libri','contatti','newsletter'];
  for (const s of slugs) {
    test(s + ': nl-strip form presente', async ({ page }) => {
      await page.goto(url(s));
      await expect(page.locator('#nl-strip-form input[type="email"]')).toBeVisible();
    });
  }
});

// ── F18: sitemap ──────────────────────────────────────────────────────────────
test.describe('F18 - sitemap', () => {
  test('contiene /algoritmo e /diario', async ({ page }) => {
    await page.goto(BASE + '/sitemap.xml');
    const body = await page.content();
    expect(body).toContain('/algoritmo');
    expect(body).toContain('/diario');
  });
  test('/algoritmo ha priority 0.95', async ({ page }) => {
    await page.goto(BASE + '/sitemap.xml');
    const body = await page.content();
    const i = body.indexOf('/algoritmo');
    expect(body.slice(i, i + 200)).toContain('0.95');
  });
  test('/libri ha priority 0.7', async ({ page }) => {
    await page.goto(BASE + '/sitemap.xml');
    const body = await page.content();
    const i = body.indexOf('/libri');
    expect(body.slice(i, i + 200)).toContain('0.7');
  });
});

// ── F19: AggregateRating ──────────────────────────────────────────────────────
test.describe('F19 - AggregateRating JSON-LD', () => {
  test('diario.html: Book ha aggregateRating valido', async ({ page }) => {
    await page.goto(url('diario'));
    const data = await page.evaluate(() =>
      JSON.parse(document.querySelector('script[type="application/ld+json"]').textContent)
    );
    const book = data['@graph'].find(n => n['@type'] === 'Book');
    expect(book.aggregateRating['@type']).toBe('AggregateRating');
    expect(parseFloat(book.aggregateRating.ratingValue)).toBeGreaterThan(0);
    expect(parseInt(book.aggregateRating.reviewCount)).toBeGreaterThan(0);
  });
});

// ── F20: OG image ─────────────────────────────────────────────────────────────
test.describe('F20 - OG image', () => {
  test('contatti: og:image usa rosario.jpg', async ({ page }) => {
    await page.goto(url('contatti'));
    const og = await page.evaluate(() =>
      document.querySelector('meta[property="og:image"]')?.content
    );
    expect(og).toContain('rosario.jpg');
  });
  test('contatti: twitter:image usa rosario.jpg', async ({ page }) => {
    await page.goto(url('contatti'));
    const tw = await page.evaluate(() =>
      document.querySelector('meta[name="twitter:image"]')?.content
    );
    expect(tw).toContain('rosario.jpg');
  });
  test('diario: og:image dimensioni 366x544', async ({ page }) => {
    await page.goto(url('diario'));
    const w = await page.evaluate(() =>
      document.querySelector('meta[property="og:image:width"]')?.content
    );
    const h = await page.evaluate(() =>
      document.querySelector('meta[property="og:image:height"]')?.content
    );
    expect(w).toBe('366');
    expect(h).toBe('544');
  });
  test('newsletter: og:image dimensioni 366x544', async ({ page }) => {
    await page.goto(url('newsletter'));
    const w = await page.evaluate(() =>
      document.querySelector('meta[property="og:image:width"]')?.content
    );
    const h = await page.evaluate(() =>
      document.querySelector('meta[property="og:image:height"]')?.content
    );
    expect(w).toBe('366');
    expect(h).toBe('544');
  });
});

// ── F26: FAQ schema ───────────────────────────────────────────────────────────
test.describe('F26 - FAQ schema', () => {
  test('algoritmo.html: FAQPage con almeno 3 Q&A', async ({ page }) => {
    await page.goto(url('algoritmo'));
    const data = await page.evaluate(() =>
      JSON.parse(document.querySelector('script[type="application/ld+json"]').textContent)
    );
    const faq = data['@graph'].find(n => n['@type'] === 'FAQPage');
    expect(faq).toBeDefined();
    expect(faq.mainEntity.length).toBeGreaterThanOrEqual(3);
    expect(faq.mainEntity[0]['@type']).toBe('Question');
    expect(faq.mainEntity[0].acceptedAnswer['@type']).toBe('Answer');
  });
});

// ── F30: Person schema ────────────────────────────────────────────────────────
test.describe('F30 - Person schema @graph', () => {
  test('autore.html: un unico script JSON-LD con @graph', async ({ page }) => {
    await page.goto(url('autore'));
    const count = await page.evaluate(() =>
      document.querySelectorAll('script[type="application/ld+json"]').length
    );
    expect(count).toBe(1);
  });
  test('autore.html: Person ha @id, knowsAbout, sameAs (>= 4)', async ({ page }) => {
    await page.goto(url('autore'));
    const data = await page.evaluate(() =>
      JSON.parse(document.querySelector('script[type="application/ld+json"]').textContent)
    );
    const person = data['@graph'].find(n => n['@type'] === 'Person');
    expect(person['@id']).toContain('autore#author');
    expect(Array.isArray(person.knowsAbout)).toBe(true);
    expect(person.sameAs.length).toBeGreaterThanOrEqual(4);
    expect(person.sameAs.some(s => s.includes('instagram.com'))).toBe(true);
    expect(person.sameAs.some(s => s.includes('substack.com'))).toBe(true);
    expect(person.sameAs.some(s => s.includes('x.com'))).toBe(true);
  });
});

// ── F40: 404 migliorata ───────────────────────────────────────────────────────
test.describe('F40 - 404 page', () => {
  test('404: tre CTA (home, algoritmo, contatti)', async ({ page }) => {
    await page.goto(url('404'));
    const ctas = page.locator('.not-found-cta a');
    await expect(ctas).toHaveCount(3);
    await expect(ctas.nth(0)).toHaveAttribute('href', '/');
    await expect(ctas.nth(1)).toHaveAttribute('href', '/algoritmo');
    await expect(ctas.nth(2)).toHaveAttribute('href', '/contatti');
  });
  test('404: sezione "forse cercavi" con 5 link', async ({ page }) => {
    await page.goto(url('404'));
    await expect(page.locator('.not-found-links')).toBeVisible();
    await expect(page.locator('.not-found-links ul a')).toHaveCount(5);
  });
});

// ── F43: Breadcrumb visuale ───────────────────────────────────────────────────
test.describe('F43 - Breadcrumb visuale', () => {
  const cases = [
    { slug: 'algoritmo',  levels: 2 },
    { slug: 'diario',     levels: 3 },
    { slug: 'libri',      levels: 2 },
    { slug: 'noraya',     levels: 3 },
    { slug: 'autore',     levels: 2 },
    { slug: 'gallery',    levels: 2 },
    { slug: 'contatti',   levels: 2 },
    { slug: 'newsletter', levels: 2 },
    { slug: 'privacy',    levels: 2 },
  ];
  for (const { slug, levels } of cases) {
    test(slug + ': breadcrumb visibile (' + levels + ' livelli)', async ({ page }) => {
      await page.goto(url(slug));
      const nav = page.locator('nav.breadcrumb');
      await expect(nav).toBeVisible();
      await expect(nav.locator('.breadcrumb-item')).toHaveCount(levels);
      await expect(nav.locator('.breadcrumb-item').first()).toContainText('Home');
      await expect(nav.locator('.breadcrumb-item').last()).toHaveAttribute('aria-current', 'page');
    });
  }
  test('index: nessun breadcrumb (homepage)', async ({ page }) => {
    await page.goto(url(''));
    await expect(page.locator('nav.breadcrumb')).toHaveCount(0);
  });
});

// ── F47: ReadAction ───────────────────────────────────────────────────────────
test.describe('F47 - ReadAction su Book schema', () => {
  for (const slug of ['', 'algoritmo']) {
    test((slug || 'index') + ': Book.potentialAction e ReadAction verso bookabook', async ({ page }) => {
      await page.goto(url(slug));
      const data = await page.evaluate(() =>
        JSON.parse(document.querySelector('script[type="application/ld+json"]').textContent)
      );
      const nodes = data['@graph'] || [data];
      const book = nodes.find(n => n['@type'] === 'Book');
      expect(book).toBeDefined();
      expect(book.potentialAction['@type']).toBe('ReadAction');
      expect(book.potentialAction.target).toContain('bookabook.it');
    });
  }
});

// ── F34: Consent Mode v2 ─────────────────────────────────────────────────────
test.describe('F34 - Google Consent Mode v2', () => {
  const slugs = ['', 'algoritmo', 'contatti', 'newsletter', 'autore', 'diario'];
  for (const slug of slugs) {
    test((slug || 'index') + ': HTML ha consent default denied', async ({ page }) => {
      // domcontentloaded: il test legge solo l'HTML inline, non deve attendere
      // le risorse esterne (widget Substack, GA) che in CI possono essere lente
      await page.goto(url(slug), { waitUntil: 'domcontentloaded' });
      const html = await page.content();
      expect(html).toContain("analytics_storage: 'denied'");
      expect(html).toContain('wait_for_update: 500');
    });
  }
  test('index: click Accetta aggiorna analytics_storage a granted', async ({ page }) => {
    await page.goto(url(''));
    const acceptBtn = page.locator('.ck-accept');
    if (await acceptBtn.isVisible()) {
      let grantedCalled = false;
      await page.exposeFunction('__testConsentGranted', () => { grantedCalled = true; });
      await page.evaluate(() => {
        const orig = window.gtag;
        window.gtag = function(...args) {
          if (args[0] === 'consent' && args[1] === 'update' && args[2]?.analytics_storage === 'granted') {
            window.__testConsentGranted();
          }
          if (orig) orig.apply(this, args);
        };
      });
      await acceptBtn.click();
      await page.waitForTimeout(300);
      expect(grantedCalled).toBe(true);
    }
  });
});

// ── F28: Substack preview ─────────────────────────────────────────────────────
test.describe('F28 - Substack RSS preview', () => {
  test('index: sezione #substack-preview visibile', async ({ page }) => {
    await page.goto(url(''));
    await expect(page.locator('#substack-preview')).toBeVisible();
  });
  test('index: label e link "tutti gli articoli"', async ({ page }) => {
    await page.goto(url(''));
    await expect(page.locator('.substack-preview-label')).toBeVisible();
    await expect(page.locator('.substack-preview-all')).toHaveAttribute(
      'href', 'https://rosariodileva.substack.com'
    );
  });
  test('index: container #substack-posts nel DOM', async ({ page }) => {
    await page.goto(url(''));
    await expect(page.locator('#substack-posts')).toBeAttached();
  });
});

// ── F41: Substack widget ──────────────────────────────────────────────────────
test.describe('F41 - Substack custom widget', () => {
  test('newsletter: #custom-substack-embed nel DOM', async ({ page }) => {
    await page.goto(url('newsletter'));
    await expect(page.locator('#custom-substack-embed')).toBeAttached();
  });
  test('newsletter: CustomSubstackWidget configurato con colori amber', async ({ page }) => {
    await page.goto(url('newsletter'));
    // Attende che il widget JS si esegua
    await page.waitForTimeout(500);
    const config = await page.evaluate(() => window.CustomSubstackWidget);
    expect(config?.substackUrl).toContain('rosariodileva.substack.com');
    expect(config?.colors?.primary).toBe('#c9a25f');
  });
});

// ── F2: Dossier personaggi ────────────────────────────────────────────────────
test.describe('F2 - Dossier personaggi', () => {
  test('personaggi: 7 fascicoli presenti', async ({ page }) => {
    await page.goto(url('personaggi'));
    await expect(page.locator('.dossier-card')).toHaveCount(7);
  });
  test('personaggi: accordion apre e chiude il fascicolo', async ({ page }) => {
    await page.goto(url('personaggi'));
    const head = page.locator('.dossier-card[data-file="002"] .dossier-head');
    const body = page.locator('.dossier-card[data-file="002"] .dossier-body');
    await expect(head).toHaveAttribute('aria-expanded', 'false');
    await head.click();
    await expect(head).toHaveAttribute('aria-expanded', 'true');
    await expect(body).toBeVisible();
    await expect(body.locator('.dossier-threat')).toContainText('risorsa critica');
    await head.click();
    await expect(head).toHaveAttribute('aria-expanded', 'false');
  });
  test('personaggi: breadcrumb a 3 livelli', async ({ page }) => {
    await page.goto(url('personaggi'));
    await expect(page.locator('nav.breadcrumb .breadcrumb-item')).toHaveCount(3);
  });
  test('personaggi: Book schema con 7 character', async ({ page }) => {
    await page.goto(url('personaggi'));
    const data = await page.evaluate(() =>
      JSON.parse(document.querySelector('script[type="application/ld+json"]').textContent)
    );
    const book = data['@graph'].find(n => n['@type'] === 'Book');
    expect(book.character.length).toBe(7);
  });
  test('nav: voce Personaggi presente su index', async ({ page }) => {
    await page.goto(url(''));
    await expect(page.locator('.nav-menu a[href="/personaggi"]')).toHaveText('Personaggi');
  });
});

// ── F4: Quiz quale personaggio sei ───────────────────────────────────────────
test.describe('F4 - Quiz personaggio', () => {
  test('quiz: intro visibile, stage e risultato nascosti', async ({ page }) => {
    await page.goto(url('quiz'));
    await expect(page.locator('#quiz-intro')).toBeVisible();
    await expect(page.locator('#quiz-stage')).toBeHidden();
    await expect(page.locator('#quiz-result')).toBeHidden();
  });
  test('quiz: percorso completo produce un risultato', async ({ page }) => {
    await page.goto(url('quiz'));
    await page.click('#quiz-start');
    for (let i = 0; i < 6; i++) {
      await expect(page.locator('#quiz-progress-label')).toContainText('domanda ' + (i + 1) + ' / 6');
      await page.locator('.quiz-option').first().click();
    }
    await expect(page.locator('#quiz-result')).toBeVisible();
    await page.waitForTimeout(900); // scramble reveal
    const name = await page.locator('#quiz-result-name').textContent();
    expect(name.length).toBeGreaterThan(2);
    await expect(page.locator('#quiz-share-x')).toHaveAttribute('href', /twitter\.com/);
    await expect(page.locator('#quiz-share-wa')).toHaveAttribute('href', /wa\.me/);
  });
  test('quiz: percorso estremo produce Noraya (risultato raro)', async ({ page }) => {
    await page.goto(url('quiz'));
    await page.click('#quiz-start');
    const picks = [3, 3, 3, 3, 1, 3];
    for (const idx of picks) {
      await page.locator('.quiz-option').nth(idx).click();
    }
    await page.waitForTimeout(900);
    await expect(page.locator('#quiz-result-name')).toHaveText('Noraya');
    const rare = await page.evaluate(() =>
      document.getElementById('quiz-result').classList.contains('quiz-result-rare')
    );
    expect(rare).toBe(true);
  });
  test('quiz: rifai il test riparte dalla prima domanda', async ({ page }) => {
    await page.goto(url('quiz'));
    await page.click('#quiz-start');
    for (let i = 0; i < 6; i++) await page.locator('.quiz-option').first().click();
    await page.click('#quiz-retry');
    await expect(page.locator('#quiz-progress-label')).toContainText('domanda 1 / 6');
  });
  test('sitemap: contiene /personaggi e /quiz', async ({ page }) => {
    await page.goto(BASE + '/sitemap.xml');
    const body = await page.content();
    expect(body).toContain('/personaggi');
    expect(body).toContain('/quiz');
  });
});

// ─────────────────────────────────────────────────────────────
// F5 — Gioco "Test di Turing inverso" (/algoritmo)
// ─────────────────────────────────────────────────────────────
test.describe('F5 - Turing game', () => {
  test('algoritmo: sezione gioco presente con 4 pad e stato iniziale', async ({ page }) => {
    await page.goto(url('algoritmo'), { waitUntil: 'domcontentloaded' });
    await expect(page.locator('#turing-game')).toBeVisible();
    await expect(page.locator('.tg-pad')).toHaveCount(4);
    await expect(page.locator('#tg-start')).toBeVisible();
    await expect(page.locator('#tg-over')).toBeHidden();
  });
  test('gioco: partita deterministica, errore produce game over con verdetto', async ({ page }) => {
    await page.goto(url('algoritmo'), { waitUntil: 'domcontentloaded' });
    // sequenza deterministica: sempre pad 0
    await page.evaluate(() => { Math.random = () => 0; });
    await page.click('#tg-start');
    // round 1: aspetta "ripeti" e completa col pad giusto
    await expect(page.locator('#tg-msg')).toHaveText('// ripeti.', { timeout: 5000 });
    await page.click('.tg-pad-0');
    // round 2: aspetta conferma round 1, poi la nuova fase "ripeti", e sbaglia col pad 1
    await expect(page.locator('#tg-msg')).toHaveText('// registrato.', { timeout: 5000 });
    await expect(page.locator('#tg-level')).toHaveText('2', { timeout: 5000 });
    await expect(page.locator('#tg-msg')).toHaveText('// ripeti.', { timeout: 8000 });
    await page.click('.tg-pad-1');
    await expect(page.locator('#tg-over')).toBeVisible();
    await expect(page.locator('#tg-final')).toHaveText('1');
    await expect(page.locator('#tg-verdict')).toContainText('stampanti');
    // link condivisione popolati
    const href = await page.locator('#tg-share-x').getAttribute('href');
    expect(href).toContain('x.com/intent/tweet');
    expect(href).toContain('livello%201');
  });
});

// ─────────────────────────────────────────────────────────────
// F6 — Area stampa (/stampa)
// ─────────────────────────────────────────────────────────────
test.describe('F6 - Area stampa', () => {
  test('stampa: pagina carica con press kit e materiali', async ({ page }) => {
    await page.goto(url('stampa'), { waitUntil: 'domcontentloaded' });
    await expect(page.locator('h1')).toContainText('Area');
    await expect(page.locator('a[href="assets/stampa/press-kit.zip"]')).toBeVisible();
    await expect(page.locator('.press-card')).toHaveCount(6);
  });
  test('stampa: download raggiungibili e footer link presente ovunque', async ({ page }) => {
    const files = [
      'assets/stampa/press-kit.zip',
      'assets/stampa/copertina-hd.jpg',
      'assets/stampa/scheda-libro.pdf',
    ];
    for (const f of files) {
      const res = await page.request.head(BASE + '/' + encodeURI(f));
      expect(res.status(), f).toBe(200);
    }
    await page.goto(url('algoritmo'), { waitUntil: 'domcontentloaded' });
    await expect(page.locator('footer a[href="/stampa"]')).toHaveCount(1);
  });
});

// ─────────────────────────────────────────────────────────────
// F10 — Anteprima Substack servita dal sito, senza proxy
// ─────────────────────────────────────────────────────────────
test.describe('F10 - Anteprima Substack', () => {
  test('assets/substack.json e valido e con link https', async ({ page }) => {
    const res = await page.request.get(BASE + '/assets/substack.json');
    expect(res.status()).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data.posts)).toBe(true);
    expect(data.posts.length).toBeGreaterThan(0);
    for (const p of data.posts) {
      expect(p.link).toMatch(/^https:\/\/rosariodileva\.substack\.com\//);
      expect(p.title.length).toBeGreaterThan(0);
      expect(p.title).not.toMatch(/[<>]/);
      expect(p.desc || '').not.toMatch(/[<>]/);
    }
  });
  test('home: le card si popolano dal JSON locale', async ({ page }) => {
    await page.goto(url(''), { waitUntil: 'domcontentloaded' });
    await expect(page.locator('#substack-posts .sp-card')).toHaveCount(3);
    const primo = page.locator('#substack-posts .sp-card-link').first();
    await expect(primo).toHaveAttribute('href', /^https:\/\/rosariodileva\.substack\.com\//);
    await expect(primo).toHaveAttribute('rel', /noopener/);
  });
  test('nessun proxy di terze parti nel codice del feed', async ({ page }) => {
    const res = await page.request.get(BASE + '/scripts.js');
    const js = await res.text();
    expect(js).not.toContain('allorigins');
    expect(js).not.toMatch(/corsproxy|cors-anywhere|thingproxy/i);
  });
});

// ─────────────────────────────────────────────────────────────
// F9 — Eventi: nulla di scaduto presentato come futuro
// ─────────────────────────────────────────────────────────────
test.describe('F9 - Eventi', () => {
  test('eventi: gli eventi con data passata stanno in archivio', async ({ page }) => {
    await page.goto(url('eventi'), { waitUntil: 'domcontentloaded' });
    const data = await page.evaluate(() =>
      JSON.parse(document.querySelector('script[type="application/ld+json"]').textContent)
    );
    const eventi = data['@graph'].filter(n => n['@type'] === 'Event');
    expect(eventi.length).toBeGreaterThan(0);
    const oggi = new Date();
    for (const ev of eventi) {
      const passato = new Date(ev.startDate) < oggi;
      const card = page.locator(`.eventi-card[aria-label*="${ev.startDate.slice(0, 4)}"]`).first();
      // un evento passato non deve piu' comparire come "upcoming"
      if (passato) {
        await expect(page.locator('.eventi-upcoming')).toHaveCount(0);
        await expect(card).toHaveClass(/eventi-past/);
      }
    }
  });
  test('eventi: nessun invito ad agire su una data gia' + " " + 'passata', async ({ page }) => {
    await page.goto(url('eventi'), { waitUntil: 'domcontentloaded' });
    // "aggiungi al calendario" su un evento concluso e' un invito a vuoto
    await expect(page.locator('.eventi-past a[href*="calendar.google.com"]')).toHaveCount(0);
    await expect(page.locator('.eventi-next')).toBeVisible();
    await expect(page.locator('.eventi-next a[href="/newsletter"]')).toHaveCount(1);
  });
});

// ─────────────────────────────────────────────────────────────
// F7 — Recensioni (/algoritmo)
// ─────────────────────────────────────────────────────────────
test.describe('F7 - Recensioni', () => {
  test('algoritmo: 4 card recensione, stelle solo sulle due di Amazon', async ({ page }) => {
    await page.goto(url('algoritmo'), { waitUntil: 'domcontentloaded' });
    await expect(page.locator('.review-card')).toHaveCount(4);
    await expect(page.locator('.review-stars')).toHaveCount(2);
    await expect(page.locator('#recensioni')).toContainText('Valerio Di Rosa');
    await expect(page.locator('#recensioni')).toContainText('Marianna Borriello');
    await expect(page.locator('#recensioni')).toContainText('La Penna nel Cassetto');
    await expect(page.locator('#recensioni')).toContainText("L'identitario");
  });
  test('algoritmo: link a tutte le recensioni Amazon', async ({ page }) => {
    await page.goto(url('algoritmo'), { waitUntil: 'domcontentloaded' });
    const more = page.locator('.bd-reviews-more a').first();
    await expect(more).toHaveAttribute('href', /amazon\.it\/product-reviews\/B0H1F48YCT/);
  });
  test('algoritmo: Book schema ha 4 Review, rating sulle due Amazon', async ({ page }) => {
    await page.goto(url('algoritmo'), { waitUntil: 'domcontentloaded' });
    const data = await page.evaluate(() =>
      JSON.parse(document.querySelector('script[type="application/ld+json"]').textContent)
    );
    const book = data['@graph'].find(n => n['@type'] === 'Book');
    expect(book.review.length).toBe(4);
    const rated = book.review.filter(r => r.reviewRating);
    expect(rated.length).toBe(2);
    rated.forEach(r => expect(r.reviewRating.ratingValue).toBe('5'));
    expect(book.aggregateRating).toBeUndefined();
    const testate = book.review.filter(r => r.author['@type'] === 'Organization');
    expect(testate.length).toBe(2);
    testate.forEach(r => expect(r.url).toMatch(/^https:\/\//));
  });
  test('stampa: rassegna con i due articoli e link esterni corretti', async ({ page }) => {
    await page.goto(url('stampa'), { waitUntil: 'domcontentloaded' });
    await expect(page.locator('#rassegna')).toBeVisible();
    const items = page.locator('.press-news-item');
    await expect(items).toHaveCount(2);
    await expect(page.locator('#rassegna')).toContainText("L'identitario");
    await expect(page.locator('#rassegna')).toContainText('Emilio Caserta');
    for (const link of await page.locator('.press-news-link').all()) {
      expect(await link.getAttribute('href')).toMatch(/^https:\/\//);
      expect(await link.getAttribute('rel')).toContain('noopener');
    }
  });
  test('stampa: 4 citazioni pubblicabili con fonte attribuita', async ({ page }) => {
    await page.goto(url('stampa'), { waitUntil: 'domcontentloaded' });
    await expect(page.locator('#citazioni .press-quote')).toHaveCount(4);
    await expect(page.locator('#citazioni .press-quote-tag')).toHaveCount(4);
    await expect(page.locator('#citazioni')).toContainText('Emilio Caserta');
    await expect(page.locator('#citazioni a[href*="lidentitario.com"]')).toHaveCount(1);
  });
  test('algoritmo: il link alla rassegna punta a /stampa#rassegna', async ({ page }) => {
    await page.goto(url('algoritmo'), { waitUntil: 'domcontentloaded' });
    await expect(page.locator('.bd-reviews-more a[href="/stampa#rassegna"]')).toHaveCount(1);
  });
});

// ─────────────────────────────────────────────────────────────
// F8 — Instagram embed con gating del consenso (/contatti)
// ─────────────────────────────────────────────────────────────
test.describe('F8 - Instagram embed', () => {
  test('contatti: senza consenso mostra la facciata, nessuno script IG', async ({ page }) => {
    await page.goto(url('contatti'), { waitUntil: 'domcontentloaded' });
    await expect(page.locator('#ig-facade')).toBeVisible();
    await expect(page.locator('#ig-embeds')).toBeHidden();
    await expect(page.locator('.instagram-media')).toHaveCount(3);
    const script = await page.locator('script[src*="instagram.com/embed.js"]').count();
    expect(script).toBe(0);
  });
  test('contatti: click "Mostra i post" carica lo script e rivela gli embed', async ({ page }) => {
    await page.goto(url('contatti'), { waitUntil: 'domcontentloaded' });
    await page.click('#ig-load');
    await expect(page.locator('#ig-facade')).toBeHidden();
    await expect(page.locator('#ig-embeds')).toBeVisible();
    const script = await page.locator('script[src*="instagram.com/embed.js"]').count();
    expect(script).toBe(1);
  });
  test('contatti: con consenso pregresso auto-carica gli embed', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('rdl-cookie-consent','accepted'));
    await page.goto(url('contatti'), { waitUntil: 'domcontentloaded' });
    await expect(page.locator('#ig-facade')).toBeHidden();
    const script = await page.locator('script[src*="instagram.com/embed.js"]').count();
    expect(script).toBe(1);
  });
});
