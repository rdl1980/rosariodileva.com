const { test, expect } = require('@playwright/test');
const BASE = 'http://localhost:3002';

// helper: clean url → local file path
function url(slug) {
  return slug === '' ? BASE + '/' : BASE + '/' + slug + '.html';
}

// ── F16: newsletter form ──────────────────────────────────────────────────────

test.describe('F16 - newsletter form', () => {

  test('index: form ha input email e bottone submit', async ({ page }) => {
    await page.goto(url(''));
    const form = page.locator('#nl-strip-form');
    await expect(form).toBeVisible();
    await expect(form.locator('input[type="email"]')).toBeVisible();
    await expect(form.locator('button[type="submit"]')).toBeVisible();
  });

  test('index: submit con email valida apre substack con email precompilata', async ({ page }) => {
    await page.goto(url(''));
    const input = page.locator('#nl-strip-form input[type="email"]');
    const btn   = page.locator('#nl-strip-form button[type="submit"]');
    const [popup] = await Promise.all([
      page.waitForEvent('popup'),
      input.fill('test@example.com'),
      btn.click(),
    ]);
    await popup.waitForLoadState('domcontentloaded');
    const u = popup.url();
    expect(u).toContain('rosariodileva.substack.com');
    expect(decodeURIComponent(u)).toContain('test@example.com');
    await popup.close();
  });

  test('index: submit con campo vuoto non apre popup', async ({ page }) => {
    await page.goto(url(''));
    let popped = false;
    page.on('popup', () => { popped = true; });
    await page.locator('#nl-strip-form button[type="submit"]').click();
    await page.waitForTimeout(400);
    expect(popped).toBe(false);
  });

  test('mobile 375px: form si impila verticalmente', async ({ page }) => {
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

  test('sitemap contiene /algoritmo e /diario', async ({ page }) => {
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

  test('diario.html: Book ha aggregateRating', async ({ page }) => {
    await page.goto(url('diario'));
    const data = await page.evaluate(() => {
      const s = document.querySelector('script[type="application/ld+json"]');
      return JSON.parse(s.textContent);
    });
    const book = data['@graph'].find(n => n['@type'] === 'Book');
    expect(book).toBeDefined();
    expect(book.aggregateRating).toBeDefined();
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

  test('diario: og:image:width = 366, height = 544', async ({ page }) => {
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

  test('newsletter: og:image:width = 366, height = 544', async ({ page }) => {
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
