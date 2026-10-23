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
  expect(parsed.pathname).toBe('editors@entanglementofages.com');
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
    await expect(page.getByRole('link', { name: 'editors@entanglementofages.com' })).toHaveAttribute('href', 'mailto:editors@entanglementofages.com');
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
  });
}
