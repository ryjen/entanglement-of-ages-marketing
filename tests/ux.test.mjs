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
  'src/books/age-of-embers/index.html',
  'src/books/the-fatherless/index.html',
  'src/books/neurion/index.html',
  'src/books/age-of-forms/index.html',
  'src/world/index.html',
  'src/about/index.html',
  'src/news/index.html',
  'src/news/2026-08-08-public-trilogy-site/index.html',
  'src/press/index.html',
  'src/adaptation/index.html',
  'src/characters/index.html',
];
const trilogyOverviewPages = [
  'src/books/index.html',
  'src/world/index.html',
  'src/about/index.html',
  'src/news/index.html',
  'src/press/index.html',
  'src/adaptation/index.html',
];
const primaryNavLabels = ['The books', 'Entanglement', 'The ages', 'Editions', 'Contribute', 'News'];

test('homepage carries the published Sites journey without dropping editorial and community routes', async () => {
  const html = await read('src/index.html');
  const css = await read('src/styles/sites-home.v1.css');
  assert.match(html, /class="hero hero--media"/);
  assert.match(html, /id="hero-title"/);
  assert.match(html, /media\/heroes\/the-fatherless-hero\.webp/);
  assert.match(html, /styles\/sites-home\.v1\.css/);
  assert.match(css, /\.hero-art::after/);
  const stages = ['class="development"', 'id="books"', 'id="threads"', 'id="ages"',
    'id="evolution-title"', 'id="editions"', 'id="contribute"'].map(marker => html.indexOf(marker));
  assert.ok(stages.every(index => index >= 0), 'all narrative and community stages must exist');
  assert.deepEqual([...stages].sort((a, b) => a - b), stages, 'sections remain in reading order');
  assert.match(html, /github\.com\/ryjen\/entanglement-of-ages-marketing\/discussions/);
  assert.match(html, /href="adaptation\/"/);
  assert.match(html, /href="world\/"/);
  assert.doesNotMatch(html, /chatgpt\.site|https:\/\/eoa\.ryanjennin\.gs/);
});

test('homepage presents cross-age threads as editorial narrative, not a redundant matrix', async () => {
  const [html, css] = await Promise.all([read('src/index.html'), read('src/styles/sites-home.v1.css')]);
  assert.match(html, /class="thread-list"/);
  assert.match(html, /class="thread-detail"/);
  assert.match(html, /class="thread-ages"/);
  assert.doesNotMatch(html, /arc-score|trilogy-question-grid/);
  assert.match(css, /@media\(max-width:640px\)/);
});

test('homepage exposes horror and ordinary miracle as a cross-cutting Story Sword', async () => {
  const html = await read('src/index.html');
  assert.match(html, /id="horror-miracle-title"/);
  assert.match(html, /Cross-cutting Story Sword/);
  assert.match(html, /The horror is when the form becomes authority[\s\S]{0,160}life exceeds it/i);
  assert.match(html, /ordinary miracle is not supernatural proof/i);
  assert.match(html, /Age of Embers[\s\S]{0,300}Memory becomes authority[\s\S]{0,120}life outlives the claim/);
  assert.match(html, /The Fatherless · Source expression[\s\S]{0,300}Consent is stolen[\s\S]{0,120}a child is simply alive/);
  assert.match(html, /Neurion[\s\S]{0,300}A person is classified[\s\S]{0,120}selfhood precedes usefulness/);
  assert.match(html, /The Age of Forms[\s\S]{0,300}Identity becomes a prison[\s\S]{0,120}change does not erase the person/);
});

test('book pages keep the cross-cutting arc narrative-first rather than duplicating it in panels', async () => {
  for (const pagePath of [
    'src/books/age-of-embers/index.html',
      'src/books/the-fatherless/index.html',
    'src/books/neurion/index.html',
      'src/books/age-of-forms/index.html',
  ]) {
    const html = await read(pagePath);
    assert.doesNotMatch(html, /<article class="panel"><h3>Horror \/ ordinary miracle/);
  }
});

test('Great Age retains both paired recurrences and the canonical public dates', async () => {
  const html = await read('src/index.html');
  assert.match(html, /id="great-age-title"/);
  assert.match(html, /class="timeline"/);
  for (const marker of ['c. 25,000 BCE', 'c. 1 CE', '2150 CE', 'c. 28,000 CE']) assert.ok(html.includes(marker), marker);
  assert.match(html, /Age of Embers[\s\S]{0,250}Aries → Pisces/);
  assert.match(html, /The Fatherless[\s\S]{0,250}Aries → Pisces/);
  assert.match(html, /Neurion[\s\S]{0,250}Pisces → Aquarius/);
  assert.match(html, /The Age of Forms[\s\S]{0,250}Pisces → Aquarius/);
  assert.match(html, /one complete twelve-sign cycle[\s\S]{0,350}post-Neurion/i);
});

test('public canon keeps the solar flare unique to Age of Embers', async () => {
  const [embers, neurion, forms] = await Promise.all([
    read('src/books/age-of-embers/index.html'),
    read('src/books/neurion/index.html'),
    read('src/books/age-of-forms/index.html'),
  ]);

  assert.match(embers, /solar flare/i);
  assert.doesNotMatch(embers, /massive\s+solar/i);
  assert.doesNotMatch(neurion, /solar flare|flare warning|solar disturbance/i);
  assert.doesNotMatch(forms, /solar flare|flare warning|solar disturbance/i);
});

test('homepage exposes the Habirim witness Story Sword across all four ages', async () => {
  const html = await read('src/index.html');
  assert.match(html, /Habirim|witness/i);
  assert.match(html, /observe[\s\S]{0,180}preserve[\s\S]{0,180}contradict[\s\S]{0,180}renew/i);
  assert.match(html, /Frequency Holders/i);
});

test('Age of Forms public summary leads with concrete human stakes', async () => {
  const html = await read('src/books/age-of-forms/index.html');
  assert.match(html, /Marek[\s\S]{0,500}(passed over|excluded)[\s\S]{0,700}Aren/i);
  assert.match(html, /same (?:ecology|system)[\s\S]{0,300}(reward|recognition|influence|intimacy)/i);
  assert.match(html, /Great Age[\s\S]{0,500}(atmospheric|orbital|disturbance)/i);
  assert.match(html, /Frequency Holders|witness tradition/i);
  assert.match(html, /Nobody wins[.] Humanity changes[.]/i);
});

test('book pages and overview carry the sharpened horror-miracle summaries', async () => {
  const [home, books, fatherless, neurion, embers, forms] = await Promise.all([
    read('src/index.html'),
    read('src/books/index.html'),
    read('src/books/the-fatherless/index.html'),
    read('src/books/neurion/index.html'),
    read('src/books/age-of-embers/index.html'),
    read('src/books/age-of-forms/index.html'),
  ]);

  assert.match(fatherless, /The horror lies in what was done to create him/);
  assert.match(fatherless, /The miracle is that none of it defines what he is/);
  assert.match(neurion, /A machine becomes a person/);
  assert.match(neurion, /power to save someone become the power to rule them/);
  assert.match(embers, /beginning of durable human memory/);
  assert.match(forms, /recognize the horror[\s\S]{0,180}while there is still time to change/i);
  assert.match(forms, /smaller miracle may be enough/i);

  assert.match(home, /healthy, ordinary child/);
  assert.match(home, /consciousness brings both personhood and fear/i);
  assert.match(books, /catastrophe becomes durable memory/i);
  assert.match(books, /recognize the horror before catastrophe/);
});

test('book overview exposes the canonical year marker for every title', async () => {
  const html = await read('src/books/index.html');
  for (const marker of ['c. 1 CE', '2150 CE', 'c. 25,000 BCE', 'c. 28,000 CE']) {
    assert.match(html, new RegExp(marker.replace('.', '\\.')));
  }
});

test('press facts expose the same canonical year markers', async () => {
  const html = await read('src/press/index.html');
  for (const marker of ['c. 25,000 BCE', 'c. 1 CE', '2150 CE', 'c. 28,000 CE']) {
    assert.match(html, new RegExp(marker.replace('.', '\\.')));
  }
  assert.doesNotMatch(html, /a later age|Aurelian Republic · 2150/);
});

test('adaptation page exposes the approved screen-development pitch without joining primary navigation', async () => {
  const html = await read('src/adaptation/index.html');
  assert.match(html, /A child meant to justify slavery becomes the accusation against it/i);
  assert.match(html, /limited anthology series/i);
  assert.match(html, /interconnected feature films/i);
  assert.match(html, /individual novel adaptations/i);
  assert.match(html, /info@ryanjennin\.gs/);
  assert.match(html, /href="\.\.\/press\/"/);
  assert.doesNotMatch(html.match(/<nav class="primary-nav"[^>]*>[\s\S]*?<\/nav>/)?.[0] ?? '', /Adaptation/);
});

test('newsletter signup posts directly to the Entanglement of Ages Buttondown list', async () => {
  for (const pagePath of ['src/index.html', 'src/news/index.html']) {
    const html = await read(pagePath);
    assert.match(html, /<form[^>]+action="https:\/\/buttondown\.com\/api\/emails\/embed-subscribe\/entanglement-of-ages"[^>]+method="post"/i);
    assert.match(html, /<label[^>]+for="newsletter-email-[^"]+"/i);
    assert.match(html, /<input[^>]+type="email"[^>]+name="email"[^>]+autocomplete="email"[^>]+required/i);
    assert.match(html, /<input[^>]+type="hidden"[^>]+name="embed"[^>]+value="1"/i);
  }

  const surfaces = await Promise.all([
    read('src/index.html'),
    read('src/news/index.html'),
    read('src/press/index.html'),
  ]);
  assert.doesNotMatch(surfaces.join('\n'), /buttondown\.com\/thefatherless/i);
});

test('industry and discovery surfaces link contextually to adaptation', async () => {
  const [home, press, sitemap] = await Promise.all([
    read('src/index.html'),
    read('src/press/index.html'),
    read('src/sitemap.xml'),
  ]);
  assert.match(home, /href="adaptation\/"/);
  assert.match(press, /href="\.\.\/adaptation\/"/);
  assert.match(sitemap, /https:\/\/entanglementofages\.com\/adaptation\//);
});

test('Sites-derived homepage includes explicit readable print output', async () => {
  const css = await read('src/styles/sites-home.v1.css');
  assert.match(css, /@media print\{/);
  assert.match(css, /\.hero-art,\.cover span,\.header-actions\{display:none!important\}/);
  assert.match(css, /html,body\{color:#111!important;background:#fff!important\}/);
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
    assert.deepEqual(labels, pagePath === 'src/index.html' ? ['The Novels', 'The Threads', 'The Great Age', 'Editions', 'News'] : primaryNavLabels, `${pagePath} should use the narrative nav order and labels`);
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
    assert.match(html, /age-of-embers-hero\.webp/, `${pagePath} should include Age of Embers artwork`);
    assert.match(html, /the-fatherless-hero\.webp/, `${pagePath} should include The Fatherless artwork`);
    assert.match(html, /neurion-hero\.webp/, `${pagePath} should include Neurion artwork`);
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