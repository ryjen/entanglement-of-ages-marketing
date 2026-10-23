const { test, expect } = require('@playwright/test');
const base = process.env.SITE_BASE_URL || 'http://127.0.0.1:4173/';
const pageUrl = new URL('beta/editors/', base).href;
test('application link builds an email draft without any web submission', async ({ page }) => {
  const submissions = [];
  page.on('request', req => { if (req.method() !== 'GET') submissions.push(req.url()); });
  await page.goto(pageUrl);
  await expect(page.getByRole('heading', { name: 'Apply by email' })).toBeVisible();
  const link = page.getByRole('link', { name: 'Compose beta-editor application' });
  await expect(link).toBeVisible();
  const href = await link.getAttribute('href');
  const parsed = new URL(href.replaceAll('&amp;', '&'));
  expect(parsed.pathname).toBe('info@ryanjennin.gs');
  expect(parsed.searchParams.get('subject')).toBe('Entanglement of Ages - Beta editor interest');
  expect(parsed.searchParams.get('body')).toContain('The Fatherless');
  expect(parsed.searchParams.get('body')).toContain('The Age of Forms');
  expect(await page.locator('form, input, button').count()).toBe(0);
  expect(submissions).toEqual([]);
  await expect(page.getByText(/not automatically added to the series newsletter/)).toBeVisible();
});
for (const v of [
  { name: 'mobile', width: 375, height: 812 },
  { name: 'desktop', width: 1440, height: 900 },
]) {
  test(v.name + ' email-intake page is accessible without horizontal overflow', async ({ page }) => {
    await page.setViewportSize(v);
    await page.goto(pageUrl);
    await expect(page.getByRole('heading', { name: 'Beta editors and early readers.' })).toBeVisible();
    const link = page.getByRole('link', { name: 'Compose beta-editor application' });
    await link.focus();
    await expect(link).toBeFocused();
    await expect(page.getByRole('link', { name: 'info@ryanjennin.gs' })).toHaveAttribute('href', 'mailto:info@ryanjennin.gs');
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
  });
}


test('home-to-editor route exposes invited-reader instructions without an application', async ({ page }) => {
  const response = await page.goto(new URL('', base).href);
  expect(response?.status()).toBe(200);
  await page.getByRole('link', { name: /Join the beta editors list/ }).click();
  await expect(page).toHaveURL(pageUrl);
  const invited = page.getByRole('region', { name: 'Already invited to read?' });
  await expect(invited.getByRole('heading', { name: 'Already invited to read?' })).toBeVisible();
  await expect(invited).toContainText('same Google Account that was invited');
  await expect(invited).toContainText('Library / Your books');
  await expect(invited).toContainText('Google Books search library is different');
  await expect(invited.getByRole('link', { name: 'Google Play Books' })).toHaveAttribute('href', 'https://play.google.com/books');
  await expect(invited.getByRole('link', { name: /content reviewer guidance/ })).toHaveAttribute('href', 'https://support.google.com/books/partner/answer/3156893');
  await expect(page.getByRole('heading', { name: 'Apply by email' })).toBeVisible();
});

test('Google Play Books link works without accessing a real account or sending reviewer details', async ({ page }) => {
  const outbound = [];
  await page.route(/^https:\/\/play\.google\.com\/books\/?$/, async route => {
    outbound.push({ url: route.request().url(), method: route.request().method() });
    await route.fulfill({
      status: 200,
      contentType: 'text/html',
      body: '<!doctype html><html lang="en"><title>Play Books test destination</title><h1>Play Books test destination</h1></html>',
    });
  });
  await page.goto(pageUrl);
  const invited = page.getByRole('region', { name: 'Already invited to read?' });
  const playBooks = invited.getByRole('link', { name: 'Google Play Books' });
  await expect(playBooks).toHaveAttribute('href', 'https://play.google.com/books');
  await Promise.all([
    page.waitForURL(/^https:\/\/play\.google\.com\/books\/?$/),
    playBooks.click(),
  ]);
  await expect(page.getByRole('heading', { name: 'Play Books test destination' })).toBeVisible();
  expect(outbound).toEqual([{ url: 'https://play.google.com/books', method: 'GET' }]);
});

test('missing-book recovery uses private email and never provisions publisher access', async ({ page }) => {
  const mutations = [];
  page.on('request', request => {
    if (request.method() !== 'GET') mutations.push(request.url());
  });
  await page.goto(pageUrl);
  const invited = page.getByRole('region', { name: 'Already invited to read?' });
  await expect(invited).toContainText('If your book is absent');
  await expect(invited).toContainText('Reviewer access is granted separately for each title');
  await expect(invited).toContainText('Applying for editorial participation does not itself provide book access');
  const contact = invited.getByRole('link', { name: 'contact us privately' });
  await expect(contact).toHaveAttribute('href', 'mailto:info@ryanjennin.gs');
  await contact.focus();
  await expect(contact).toBeFocused();
  await expect(page).toHaveURL(pageUrl);
  expect(await page.locator('form, input, button, script').count()).toBe(0);
  expect(mutations).toEqual([]);
});
