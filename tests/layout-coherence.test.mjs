import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = relative => readFile(path.join(root, relative), 'utf8');

test('redesigned homepage uses independently published static styles and canonical source media', async () => {
  const [html, css] = await Promise.all([read('src/index.html'), read('src/styles/sites-home.v1.css')]);
  assert.match(html, /styles\/sites-home\.v1\.css/);
  assert.match(html, /<h1 id="hero-title">Entanglement<br>of <em>Ages\.<\/em><\/h1>/);
  assert.match(html, /href="https:\/\/entanglementofages\.com\/"/);
  assert.match(html, /href="books\/the-fatherless\/"/);
  assert.match(html, /media\/covers\/the-fatherless-cover\.webp/);
  assert.match(css, /\.hero-art::after/);
  assert.match(css, /@media\(max-width:640px\)/);
  assert.doesNotMatch(html, /chatgpt\.site|home-polish|layout-polish/);
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
