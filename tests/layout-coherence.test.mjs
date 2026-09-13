import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = relative => readFile(path.join(root, relative), 'utf8');

test('homepage uses consolidated narrative layout layers', async () => {
  const [html, homeCss, arcCss, baseCss] = await Promise.all([
    read('src/index.html'), read('src/styles/home.v2.css'), read('src/styles/arcs.v1.css'), read('src/styles/base.v1.css'),
  ]);
  assert.match(html, /styles\/home\.v2\.css/);
  assert.match(html, /styles\/arcs\.v1\.css/);
  assert.doesNotMatch(html, /home-polish|layout-polish|narrative\.v1/);
  assert.match(html, /<h1 id="hero-title"><span class="title-lock">Entanglement<\/span><span class="title-lock">of Ages<\/span><\/h1>/);
  assert.match(baseCss, /\.title-lock\{white-space:nowrap\}/);
  assert.match(homeCss, /\.home-hero__panel h1\{display:flex;flex-wrap:wrap;justify-content:center/);
  assert.match(arcCss, /\.arc-score/);
  assert.match(arcCss, /\.story-sword-note/);
});

test('About uses the shared title lock without a separate polish layer', async () => {
  const html = await read('src/about/index.html');
  assert.match(html, /About <span class="title-lock">Entanglement<\/span> of Ages/);
  assert.doesNotMatch(html, /layout-polish/);
});

test('layout remains inside the explicit 33 KiB CSS ceiling', async () => {
  const budget = JSON.parse(await read('performance-budget.json'));
  assert.equal(budget.max_css_bytes, 33792);
});
