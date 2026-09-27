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
const seriesOverviewPages = [
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

test('homepage presents what survives the ages as four cross-cutting threads', async () => {
  const [html, css] = await Promise.all([read('src/index.html'), read('src/styles/sites-home.v1.css')]);
  assert.match(html, /02 \/ What survives the ages/);
  assert.match(html, /The world changes[\s\S]{0,120}same pressures survive/i);
  for (const thread of ['The horror', 'The ordinary miracle', 'Sacrifice', 'The witness']) {
    assert.match(html, new RegExp(`<h3>${thread}</h3>`));
  }
  assert.doesNotMatch(html, /thread-detail|thread-ages|arc-score|trilogy-question-grid/);
  assert.match(css, /@media\(max-width:640px\)/);
});

test('homepage keeps all four books legible inside the surviving threads without disclosing resolutions', async () => {
  const html = await read('src/index.html');
  assert.match(html, /survival becomes exclusion[\s\S]{0,180}origin becomes judgment[\s\S]{0,180}intelligence becomes ownership[\s\S]{0,180}measurement becomes identity/i);
  assert.match(html, /child no origin can define[\s\S]{0,220}created mind that becomes a self[\s\S]{0,260}categories meant to contain them/i);
  assert.match(html, /Sacrifice[\s\S]{0,360}personhood or freedom[\s\S]{0,260}possession and release/i);
  assert.match(html, /Habirim[\s\S]{0,260}traditions that follow them[\s\S]{0,320}interpretation as truth/i);
  assert.match(html, /What gives anyone the right to define another life\?/i);
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

test('homepage book hooks progress from life through selfhood and knowledge to transcendence', async () => {
  const html = await read('src/index.html');
  assert.match(html, /The Fatherless[\s\S]{0,700}Turn a child into blame[\s\S]{0,160}Watch life become a saviour/i);
  assert.match(html, /Neurion[\s\S]{0,700}Build a consciousness[\s\S]{0,160}Watch it claim itself/i);
  assert.match(html, /Age of Embers[\s\S]{0,700}Fear the heavens[\s\S]{0,160}Learn what survives the fear/i);
  assert.match(html, /The Age of Forms[\s\S]{0,700}Measure the person[\s\S]{0,180}Discover what exceeds the measure/i);
});

test('homepage Fatherless and Neurion summaries carry horror, personhood, and sacrifice without disclosing the resolution', async () => {
  const html = await read('src/index.html');
  assert.match(html, /The Fatherless[\s\S]{0,900}family violation[\s\S]{0,400}(salvation|saviour)[\s\S]{0,400}sacrifice/i);
  assert.match(html, /Neurion[\s\S]{0,900}machine mind[\s\S]{0,300}(own|ownership|control)[\s\S]{0,400}sacrifice/i);
  assert.doesNotMatch(html, /Cassian engineers an atrocity|healthy, ordinary child is born/i);
});

test('homepage book summaries hint at the Embers and Forms horror-miracle turns without disclosing the reveal', async () => {
  const html = await read('src/index.html');
  assert.match(html, /Age of Embers[\s\S]{0,900}solar flare[\s\S]{0,500}watching the heavens/i);
  assert.match(html, /Age of Embers[\s\S]{0,1000}uncertain knowledge[\s\S]{0,250}generations/i);
  assert.match(html, /The Age of Forms[\s\S]{0,900}personhood[\s\S]{0,260}boundary no human has crossed before/i);
  assert.match(html, /The Age of Forms[\s\S]{0,1000}liberation and loss/i);
  assert.doesNotMatch(html, /roots of astrology|Habirim tradition|first human consciousness|digital form|sacrifices his embodied life/i);
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

test('homepage keeps the Habirim tradition durable without depending on a provisional later-age name', async () => {
  const html = await read('src/index.html');
  assert.match(html, /Habirim[\s\S]{0,260}traditions that follow them[\s\S]{0,300}keeping uncertainty alive/i);
  assert.doesNotMatch(html, /Frequency Holders/i);
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

  assert.match(home, /family violation[\s\S]{0,300}salvation, sacrifice, and identity/i);
  assert.match(home, /machine mind awakens[\s\S]{0,300}personhood and control[\s\S]{0,300}sacrifice/i);
  assert.match(books, /durable knowledge carried across generations/i);
  assert.match(books, /personhood toward a boundary its categories cannot contain/i);
});

test('book overview exposes the canonical year marker for every title', async () => {
  const html = await read('src/books/index.html');
  for (const marker of ['c. 1 CE', '2150 CE', 'c. 25,000 BCE', 'c. 28,000 CE']) {
    assert.match(html, new RegExp(marker.replace('.', '\\.')));
  }
});

test('books and press carry the shared reader progression without exposing private resolutions', async () => {
  const [books, press] = await Promise.all([
    read('src/books/index.html'),
    read('src/press/index.html'),
  ]);
  assert.match(books, /life, selfhood, knowledge, and transcendence/i);
  for (const stage of ['life', 'selfhood', 'knowledge', 'transcendence']) {
    assert.match(books, new RegExp(stage, 'i'));
    assert.match(press, new RegExp(stage, 'i'));
  }
  assert.match(press, /The world changes\. The same pressures survive\./i);
  assert.match(press, /horror is interpretation becoming authority/i);
  assert.doesNotMatch(books, /Marek is quietly passed over|healthy, ordinary child|engineered atrocity/i);
  assert.doesNotMatch(press, /Yasael becomes the opposite|withholding a truth only he knows/i);
});

test('press facts expose the same canonical year markers', async () => {
  const html = await read('src/press/index.html');
  for (const marker of ['c. 25,000 BCE', 'c. 1 CE', '2150 CE', 'c. 28,000 CE']) {
    assert.match(html, new RegExp(marker.replace('.', '\\.')));
  }
  assert.doesNotMatch(html, /a later age|Aurelian Republic · 2150|centre of the original/i);
});

test('adaptation page exposes the approved screen-development pitch without joining primary navigation', async () => {
  const html = await read('src/adaptation/index.html');
  assert.match(html, /A child meant to justify slavery becomes the accusation against it/i);
  assert.match(html, /limited anthology series/i);
  assert.match(html, /interconnected feature films/i);
  assert.match(html, /individual novel adaptations/i);
  assert.match(html, /info@ryanjennin\.gs/);
  assert.match(html, /href="\.\.\/press\/"/);
  assert.match(html, /completed working feature screenplay/i);
  assert.match(html, /The wider property remains in active development/i);
  assert.equal((html.match(/completed working feature screenplay/gi) ?? []).length, 1, 'screenplay readiness should be stated once, not repeated');
  assert.match(html, /historical political thriller/i);
  assert.match(html, /administrative crime expands into a public argument about personhood/i);
  assert.match(html, /The world changes\. The same pressures survive\./i);
  assert.match(html, /life, selfhood, knowledge, and transcendence/i);
  assert.match(html, /The horror is interpretation becoming authority\. The miracle is life exceeding it\./i);
  for (const stage of ['knowledge', 'life', 'selfhood', 'transcendence']) {
    assert.match(html, new RegExp(stage, 'i'));
  }
  assert.match(html, /one-page full-story synopsis/i);
  assert.match(html, /text-led screen lookbook/i);
  assert.match(html, /chain-of-title and rights summary/i);
  assert.match(html, /supplied privately on request/i);
  assert.match(html, /series-wide right is available/i);
  assert.doesNotMatch(html, /screen-package-v2|screenplay\/the-fatherless|governance\//i);
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
  const [home, press, books, sitemap] = await Promise.all([
    read('src/index.html'),
    read('src/press/index.html'),
    read('src/books/index.html'),
    read('src/sitemap.xml'),
  ]);
  assert.match(home, /href="adaptation\/"/);
  assert.match(press, /href="\.\.\/adaptation\/"/);
  assert.match(books, /href="\.\.\/adaptation\/"/);
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
  const css = await read('src/styles/series-pages.v1.css');
  assert.match(css, /grid-template-columns:repeat\(4,1fr\)/, 'series overview hero should present four equal visual ages');

  for (const pagePath of seriesOverviewPages) {
    const html = await read(pagePath);
    assert.match(html, /styles\/series-pages\.v1\.css/, `${pagePath} should load the series overview stylesheet`);
    assert.match(html, /class="hero series-page-hero"/, `${pagePath} should use the series hero`);
    assert.doesNotMatch(html, /trilogy-page-hero|trilogy-pages\.v1\.css/, `${pagePath} should not retain the retired trilogy implementation identity`);
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