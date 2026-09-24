const { test, expect } = require('@playwright/test');

const base = process.env.SITE_BASE_URL || 'http://127.0.0.1:4173/';
const siteUrl = route => new URL(route, base).href;

async function boxCenterX(locator) {
  const box = await locator.boundingBox();
  expect(box).not.toBeNull();
  return box.x + box.width / 2;
}

test('mobile Sites-derived hero remains legible without horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto(siteUrl(''), { waitUntil: 'networkidle' });
  await expect(page.locator('#hero-title')).toContainText('Entanglement');
  await expect(page.locator('.hero-art img')).toBeVisible();
  await expect(page.locator('#books')).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});

test('homepage keeps the Sites editorial rhythm and usable community and newsletter actions', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(siteUrl(''), { waitUntil: 'networkidle' });
  await expect(page.locator('.book-grid article')).toHaveCount(4);
  await expect(page.locator('.thread-list article')).toHaveCount(3);
  await expect(page.locator('.timeline li')).toHaveCount(4);
  await expect(page.locator('a.community-link').first()).toHaveAttribute('href', /github\.com\/ryjen\/entanglement-of-ages-marketing\/discussions/);
  await expect(page.locator('form[action*="embed-subscribe/entanglement-of-ages"] input[type=email]')).toHaveCount(1);
});

test('About keeps Entanglement intact at mobile width and 200% text sizing', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto(siteUrl('about/'), { waitUntil: 'networkidle' });

  const word = page.locator('#page-title .title-lock');
  await expect(word).toHaveText('Entanglement');
  expect(await word.evaluate(element => element.getClientRects().length)).toBe(1);

  await page.evaluate(() => { document.documentElement.style.fontSize = '200%'; });
  expect(await word.evaluate(element => element.getClientRects().length)).toBe(1);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  const box = await word.boundingBox();
  expect(box).not.toBeNull();
  expect(box.x).toBeGreaterThanOrEqual(-1);
  expect(box.x + box.width).toBeLessThanOrEqual(376);
});
