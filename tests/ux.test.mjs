import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = relative => readFile(path.join(root, relative), 'utf8');

const publicHtmlPages = [
  'src/index.html',
  'src/books/index.html',
  'src/books/prequel/index.html',
  'src/books/age-of-embers/index.html',
  'src/books/the-fatherless/index.html',
  'src/books/sequel/index.html',
  'src/books/neurion/index.html',
  'src/books/age-of-forms/index.html',
  'src/world/index.html',
  'src/about/index.html',
  'src/news/index.html',
  'src/news/2026-08-08-public-trilogy-site/index.html',
  'src/press/index.html',
  'src/characters/index.html',
];
const trilogyOverviewPages = [
  'src/books/index.html',
  'src/world/index.html',
  'src/about/index.html',
  'src/news/index.html',
  'src/press/index.html',
];
const primaryNavLabels = ['The books', 'Entanglement', 'The ages', 'Editions', 'Contribute', 'News'];

test('homepage keeps a focused story-first journey', async () => {
  const html = await read('src/index.html');
  const heroStart = html.indexOf('<section class="hero hero--trilogy');
  const heroEnd = html.indexOf('</section>', heroStart);
  assert.ok(heroStart >= 0 && heroEnd > heroStart, 'homepage hero must exist');
  const hero = html.slice(heroStart, heroEnd);
  const heroActions = [...hero.matchAll(/<a class="button(?: button--quiet)?"[^>]*>([^<]+)<\/a>/g)].map(match => match[1].trim());
  assert.deepEqual(heroActions, ['Enter the cycle', 'See what connects the ages']);

  const stages = [
    html.search(/class="[^"]*\bbeta-status\b[^"]*"/),
    html.indexOf('id="books"'), html.indexOf('id="entanglement"'), html.indexOf('id="ages"'),
    html.indexOf('id="evolution-title"'), html.indexOf('id="editions"'), html.indexOf('id="contribute"'),
  ];
  assert.ok(stages.every(index => index >= 0), 'all narrative journey stages must exist');
  assert.deepEqual([...stages].sort((a,b) => a-b), stages, 'narrative stages should appear in intentional order');
  assert.match(html, /styles\/home\.v2\.css/);
  assert.match(html, /styles\/arcs\.v1\.css/);
  assert.doesNotMatch(html, /home-polish|layout-polish|narrative\.v1/);
});

test('homepage arc treatment stays readable and avoids the retired question-card layer', async () => {
  const [html, css] = await Promise.all([read('src/index.html'), read('src/styles/arcs.v1.css')]);
  assert.match(html, /class="arc-score"/);
  assert.match(html, /class="story-sword-note"/);
  assert.doesNotMatch(html, /trilogy-question-grid/);
  assert.match(css, /@media\(max-width:52rem\)/, 'narrative layout should include a compact mobile treatment');
});

test('Great Age is a primary paired recurrence arc with canonical public dates', async () => {
  const html = await read('src/index.html');
  assert.match(html, /id="great-age-title"/);
  assert.match(html, /class="evolution-line great-age-line"/);
  assert.match(html, /c\. 25,000 BCE/);
  assert.match(html, /c\. 1 CE/);
  assert.match(html, /2150 CE/);
  assert.match(html, /c\. 28,000 CE/);
  assert.match(html, /Age of Embers[\s\S]{0,500}Aries → Pisces/);
  assert.match(html, /The Fatherless[\s\S]{0,500}Aries → Pisces/);
  assert.match(html, /Neurion[\s\S]{0,500}Pisces → Aquarius/);
  assert.match(html, /The Age of Forms[\s\S]{0,700}Pisces → Aquarius/);
  assert.match(html, /one complete twelve-sign cycle[\s\S]{0,700}post-Neurion/i);
});

test('book overview exposes the canonical year marker for every title', async () => {
  const html = await read('src/books/index.html');
  for (const marker of ['c. 1 CE', '2150 CE', 'c. 25,000 BCE', 'c. 28,000 CE']) {
    assert.match(html, new RegExp(marker.replace('.', '\\.')));
  }
});

test('homepage print treatment remains legible after CSS consolidation', async () => {
  const css = await read('src/styles/arcs.v1.css');
  assert.match(css, /@media print\{[\s\S]*\.home-page \*\{color:#000!important;text-shadow:none!important\}/);
  assert.match(css, /\.home-page \.hero__media,\.era-card__media,\.era-card::after\{display:none\}/);
  assert.match(css, /\.era-card__copy\{position:static\}/);
});

test('news index identifies News as the current primary destination', async () => {
  const html = await read('src/news/index.html');
  assert.match(html, /<a href="\.\.\/news\/" aria-current="page">News<\/a>/);
});

test('all public HTML surfaces share the narrative primary navigation contract', async () => {
  for (const pagePath of publicHtmlPages) {
    const html = await read(pagePath);
    const nav = html.match(/<nav class="primary-nav"[^>]*>([\s\S]*?)<\/nav>/);
    assert.ok(nav, `${pagePath} must contain the primary navigation`);
    const labels = [...nav[1].matchAll(/<a\b[^>]*>([^<]+)<\/a>/g)].map(match => match[1].trim());
    assert.deepEqual(labels, primaryNavLabels, `${pagePath} should use the narrative nav order and labels`);
    assert.doesNotMatch(nav[1], />Books</);
    assert.doesNotMatch(nav[1], />World</);
    assert.doesNotMatch(nav[1], /#trilogy/);
  }
});

test('series-level overview pages use the shared four-age hero treatment', async () => {
  const css = await read('src/styles/trilogy-pages.v1.css');
  assert.match(css, /grid-template-columns:repeat\(4,1fr\)/, 'series overview hero should present four equal visual ages');

  for (const pagePath of trilogyOverviewPages) {
    const html = await read(pagePath);
    assert.match(html, /styles\/trilogy-pages\.v1\.css/, `${pagePath} should load the trilogy overview stylesheet`);
    assert.match(html, /class="hero trilogy-page-hero"/, `${pagePath} should use the trilogy hero`);
    assert.match(html, /age-of-embers-hero\.webp/, `${pagePath} should include prequel artwork`);
    assert.match(html, /fatherless-original-hero\.webp/, `${pagePath} should include original artwork`);
    assert.match(html, /neurion-hero\.webp/, `${pagePath} should include sequel artwork`);
    assert.match(html, /age-of-forms-hero\.webp/, `${pagePath} should include Book IV artwork`);
  }
});

test('mobile reader navigation stays compact and touch sized', async () => {
  const css = await read('src/styles/base.v1.css');

  assert.match(css, /min-height:\s*2\.75rem;/, 'navigation should preserve a 44px-equivalent touch target');
  assert.doesNotMatch(
    css,
    /grid-template-columns:\s*repeat\(auto-fit,\s*minmax\(min\(9rem,\s*100%\),\s*1fr\)\)/,
    'mobile navigation should not return to full-width grid cells',
  );
  assert.match(
    css,
    /\.primary-nav ul \{\s*display: flex;\s*flex-wrap: wrap;\s*gap: 0\.25rem 0\.4rem;/s,
    'mobile navigation should wrap compact links',
  );
  assert.match(
    css,
    /\.primary-nav a \{\s*width: auto;\s*justify-content: flex-start;\s*padding-inline: 0\.55rem;\s*border: 0;\s*border-bottom: 1px solid var\(--border\);/s,
    'mobile links should remain compact without losing a visible affordance',
  );
});
