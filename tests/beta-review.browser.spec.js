const { test, expect } = require('@playwright/test');

const base = process.env.SITE_BASE_URL || 'http://127.0.0.1:4173/';
const reviewUrl = (params = '') => new URL('beta/review/' + params, base).href;
const books = [
  'the-fatherless',
  'neurion',
  'age-of-embers',
  'age-of-forms',
];
const synthetic = {
  impact: 'Opening scene — wonder, ⁂, “quotation”, apostrophe\'s and naïve.\nSecond line.',
  pacing: 'Chapter 3\nChapter 8',
  confusion: 'Who decides? — Why?',
  priority: '1. Clarity\n2. Character agency',
};

function expectedReview(book, version, answers = synthetic) {
  return [
    'Entanglement of Ages — Beta Reader Review', '',
    `Book: ${book}`, `Beta version: ${version}`, '',
    'What stayed with you?', answers.impact, '',
    'Where did the story slow down?', answers.pacing, '',
    'What was confusing or unconvincing?', answers.confusion, '',
    'What would you change first?', answers.priority,
  ].join('\n');
}

async function fillReview(page, answers = synthetic) {
  for (const [name, value] of Object.entries(answers)) {
    await page.locator(`textarea[name="${name}"]`).fill(value);
  }
}

async function interceptEmailEncoding(page) {
  // Chrome should not invoke any real mail handler. Inspect the exact two
  // pieces encoded for the mailto subject/body without modifying site source.
  await page.addInitScript(() => {
    window.__encodedFeedback = [];
    const original = window.encodeURIComponent;
    window.encodeURIComponent = value => {
      window.__encodedFeedback.push(String(value));
      return original(value);
    };
  });
}

async function mockClipboard(page, { reject = false } = {}) {
  await page.addInitScript(shouldReject => {
    window.__clipboardWrites = [];
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: async value => {
          if (shouldReject) throw new Error('synthetic permission rejection');
          window.__clipboardWrites.push(String(value));
        },
      },
    });
  }, reject);
}

test('each canonical book/version deep link selects only its requested edition', async ({ page }) => {
  for (const book of books) {
    const version = '0.1.0-beta.99';
    const response = await page.goto(reviewUrl(`?book=${book}&version=${version}`));
    expect(response?.status()).toBe(200);
    await expect(page.locator('#book')).toHaveValue(book);
    await expect(page.locator('#version')).toHaveValue(version);
    await expect(page.getByRole('heading', { name: 'Share your reading experience' })).toBeVisible();
  }
  await page.goto(reviewUrl('?book=../../source&version=../../private'));
  await expect(page.locator('#book')).toHaveValue('');
  await expect(page.locator('#version')).toHaveValue('');
});

test('required fields and invalid beta version block email composition', async ({ page }) => {
  await interceptEmailEncoding(page);
  await page.goto(reviewUrl());
  await page.getByRole('button', { name: 'Open email to submit' }).click();
  expect(await page.locator('#book').evaluate(input => input.validity.valueMissing)).toBe(true);
  await expect.poll(() => page.evaluate(() => window.__encodedFeedback.length)).toBe(0);

  await page.locator('#book').selectOption('neurion');
  await page.locator('#version').fill('0.1.0');
  await fillReview(page);
  await page.getByRole('button', { name: 'Open email to submit' }).click();
  expect(await page.locator('#version').evaluate(input => input.validity.patternMismatch)).toBe(true);
  await expect.poll(() => page.evaluate(() => window.__encodedFeedback.length)).toBe(0);

  await page.locator('#version').fill('0.1.0-beta.99');
  await page.locator('#impact').fill('');
  await page.getByRole('button', { name: 'Open email to submit' }).click();
  expect(await page.locator('#impact').evaluate(input => input.validity.valueMissing)).toBe(true);
  await expect.poll(() => page.evaluate(() => window.__encodedFeedback.length)).toBe(0);
});

test('mailto composes exact recipient-bound subject and Unicode multiline review without sending', async ({ page }) => {
  await interceptEmailEncoding(page);
  const book = 'the-fatherless';
  const version = '0.1.0-beta.99';
  await page.goto(reviewUrl(`?book=${book}&version=${version}`));
  await fillReview(page);
  expect(await page.locator('form').getAttribute('action')).toBe('mailto:info@ryanjennin.gs');
  await page.getByRole('button', { name: 'Open email to submit' }).click();

  await expect.poll(() => page.evaluate(() => window.__encodedFeedback.length)).toBe(2);
  const [subject, body] = await page.evaluate(() => window.__encodedFeedback);
  expect(subject).toBe(`Entanglement of Ages beta review — ${book} — ${version}`);
  expect(body).toBe(expectedReview(book, version));
  await expect(page.locator('#feedback-status')).toContainText('not sent until you send the message');
});

test('clipboard fallback preserves all answers and reports copy success', async ({ page }) => {
  await mockClipboard(page);
  await page.goto(reviewUrl('?book=age-of-embers&version=0.1.0-beta.99'));
  await fillReview(page);
  await page.getByRole('button', { name: 'Copy feedback' }).click();
  await expect.poll(() => page.evaluate(() => window.__clipboardWrites.length)).toBe(1);
  const copied = (await page.evaluate(() => window.__clipboardWrites))[0];
  expect(copied).toBe(expectedReview('age-of-embers', '0.1.0-beta.99'));
  await expect(page.locator('#feedback-status')).toContainText('Review copied.');
});

test('clipboard rejection provides a usable manual fallback rather than a false success', async ({ page }) => {
  await mockClipboard(page, { reject: true });
  await page.goto(reviewUrl('?book=neurion&version=0.1.0-beta.99'));
  await fillReview(page);
  await page.getByRole('button', { name: 'Copy feedback' }).click();
  await expect(page.locator('#feedback-status')).toContainText('Clipboard access unavailable');
  await expect(page.locator('#feedback-status')).not.toContainText('Review copied.');
});

test('long answers stay bounded and the generated review retains line breaks', async ({ page }) => {
  await mockClipboard(page);
  await page.goto(reviewUrl('?book=age-of-forms&version=0.1.0-beta.99'));
  const nearLimit = ('↔ language\n').repeat(120).slice(0, 1199);
  expect(nearLimit).toHaveLength(1199);
  for (const name of Object.keys(synthetic)) {
    await page.locator(`textarea[name="${name}"]`).fill(nearLimit);
  }
  await page.getByRole('button', { name: 'Copy feedback' }).click();
  const writes = await page.evaluate(() => window.__clipboardWrites);
  expect(writes).toHaveLength(1);
  // Assert all FOUR maximum-length answers survived, not just one substring.
  expect(writes[0].split(nearLimit)).toHaveLength(5);
  for (const name of Object.keys(synthetic)) {
    await expect(page.locator(`textarea[name="${name}"]`)).toHaveValue(nearLimit);
  }
  await page.locator('#impact').fill('x'.repeat(1201));
  await expect(page.locator('#impact')).toHaveValue('x'.repeat(1200));
});

for (const viewport of [
  { name: 'mobile', width: 375, height: 812 },
  { name: 'desktop', width: 1440, height: 900 },
]) {
  test(`${viewport.name} review form is visible, keyboard-operable and has no horizontal overflow`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto(reviewUrl());
    await expect(page.getByRole('heading', { name: 'Share your reading experience' })).toBeVisible();
    await expect(page.getByLabel('Book', { exact: true })).toBeVisible();
    await expect(page.getByLabel('Beta version')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Copy feedback' })).toBeVisible();
    expect(await page.evaluate(() =>
      document.documentElement.scrollWidth - document.documentElement.clientWidth
    )).toBeLessThanOrEqual(1);
    await page.getByLabel('Beta version').focus();
    await expect(page.getByLabel('Beta version')).toBeFocused();
    const accessible = await page.locator('#feedback-status').getAttribute('aria-live');
    expect(accessible).toBe('polite');
  });
}

test('live form code does not make a network submission or store unpublished answers', async ({ page }) => {
  await mockClipboard(page);
  const clientRequests = [];
  page.on('request', request => {
    if (request.method() !== 'GET') clientRequests.push(`${request.method()} ${request.url()}`);
  });
  await page.goto(reviewUrl('?book=the-fatherless&version=0.1.0-beta.99'));
  await fillReview(page);
  await page.getByRole('button', { name: 'Copy feedback' }).click();
  await expect.poll(() => page.evaluate(() => window.__clipboardWrites.length)).toBe(1);
  expect(clientRequests).toEqual([]);
  const privacy = await page.evaluate(() => ({
    robots: document.querySelector('meta[name=robots]')?.content,
    formAction: document.querySelector('#reader-review')?.action,
    note: document.querySelector('main')?.textContent.includes('The site does not collect or store your answers.'),
  }));
  expect(privacy.robots).toBe('noindex, nofollow');
  expect(privacy.formAction).toBe('mailto:info@ryanjennin.gs');
  expect(privacy.note).toBe(true);
});
