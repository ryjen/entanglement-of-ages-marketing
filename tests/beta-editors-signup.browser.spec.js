const { test, expect } = require('@playwright/test');

const base = process.env.SITE_BASE_URL || 'http://127.0.0.1:4173/';
const routeUrl = new URL('beta/editors/', base).href;
const buttondown = 'https://buttondown.com/api/emails/embed-subscribe/entanglement-of-ages';
const noticeId = 'eoa-beta-editors-v1-2026-10-22';

async function stubButtondown(page, submissions) {
  await page.route(buttondown, async route => {
    const request = route.request();
    submissions.push({ method: request.method(), url: request.url(), fields: Object.fromEntries(new URLSearchParams(request.postData() || '')) });
    await route.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: '<!doctype html><html lang="en"><title>Test confirmation</title><body>Test confirmation — no subscriber created.</body></html>' });
  });
}

test('invalid email and missing opt-in cannot submit to the provider', async ({ page }) => {
  const submissions = [];
  await stubButtondown(page, submissions);
  await page.goto(routeUrl);
  await page.getByRole('button', { name: 'Join the beta editors list' }).click();
  await expect(page.getByLabel('Email address')).toBeFocused();
  expect(submissions).toHaveLength(0);

  await page.getByLabel('Email address').fill('not-an-email');
  await page.getByRole('button', { name: 'Join the beta editors list' }).click();
  expect(await page.getByLabel('Email address').evaluate(el => el.validity.typeMismatch)).toBe(true);
  expect(submissions).toHaveLength(0);

  await page.getByLabel('Email address').fill('test-editor@example.invalid');
  await page.getByRole('button', { name: 'Join the beta editors list' }).click();
  expect(await page.locator('#beta-editor-consent').evaluate(el => el.validity.valueMissing)).toBe(true);
  expect(submissions).toHaveLength(0);
});

test('checked consent submits only bounded fields and does not call Buttondown in CI', async ({ page }) => {
  const submissions = [];
  await stubButtondown(page, submissions);
  await page.goto(routeUrl);
  await page.getByLabel('Email address').fill('test-editor@example.invalid');
  await page.locator('#beta-editor-consent').check();
  await page.getByRole('button', { name: 'Join the beta editors list' }).click();
  await expect.poll(() => submissions.length).toBe(1);
  expect(submissions[0]).toEqual({
    method: 'POST', url: buttondown,
    fields: {
      email: 'test-editor@example.invalid',
      metadata__beta_editor_opt_in: noticeId,
      embed: '1',
      tag: 'beta-editor-interest',
    },
  });
  await expect(page.getByText('Test confirmation — no subscriber created.')).toBeVisible();
});

for (const viewport of [
  { name: 'mobile', width: 375, height: 812 },
  { name: 'desktop', width: 1440, height: 900 },
]) {
  test(`${viewport.name} signup is accessible, opt-in is initially unchecked, and has no horizontal overflow`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto(routeUrl);
    await expect(page.getByRole('heading', { name: 'Join the beta editors list.' })).toBeVisible();
    await expect(page.getByLabel('Email address')).toBeVisible();
    await expect(page.locator('#beta-editor-consent')).not.toBeChecked();
    await page.locator('#beta-editor-consent').focus();
    await expect(page.locator('#beta-editor-consent')).toBeFocused();
    await page.keyboard.press('Space');
    await expect(page.locator('#beta-editor-consent')).toBeChecked();
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
    await expect(page.getByText(/existing series newsletter/)).toBeVisible();
    await expect(page.getByRole('link', { name: 'info@ryanjennin.gs' })).toHaveAttribute('href', 'mailto:info@ryanjennin.gs');
  });
}
