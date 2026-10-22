import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
const path = 'src/beta/editors/index.html';
const html = fs.readFileSync(path, 'utf8');
const home = fs.readFileSync('src/index.html', 'utf8');
const books = fs.readFileSync('src/books/index.html', 'utf8');
const sitemap = fs.readFileSync('src/sitemap.xml', 'utf8');
const manifest = JSON.parse(fs.readFileSync('public-manifest.json', 'utf8'));
test('editor interest route is manifest-approved and linked from home and books', () => {
  const entry = manifest.artifacts.find(x => x.path === path);
  assert.equal(entry?.canonical_url, '/beta/editors/');
  assert.equal(entry?.approval_state, 'approved');
  assert.equal(entry?.checksum_sha256, crypto.createHash('sha256').update(html).digest('hex'));
  assert.match(home, /href="beta\/editors\/"/);
  assert.match(books, /href="\.\.\/beta\/editors\/"/);
  assert.match(sitemap, /entanglementofages\.com\/beta\/editors\//);
});
test('mailto composes a private editor interest message without auto-submitting', () => {
  const link = html.match(/href="(mailto:info@ryanjennin\.gs\?[^"]+)">Compose beta-editor application<\/a>/)?.[1];
  assert.ok(link, 'expected prefilled mailto');
  assert.doesNotMatch(link, /\+/); // RFC 6068 mailto uses percent-encoded spaces, not form-style +\n  assert.match(link, /%0D%0A/);\n  const parsed = new URL(link.replaceAll('&amp;', '&'));
  assert.equal(parsed.pathname, 'info@ryanjennin.gs');
  assert.equal(parsed.searchParams.get('subject'), 'Entanglement of Ages - Beta editor interest');
  const body = parsed.searchParams.get('body');
  for (const name of ['The Fatherless', 'Neurion', 'Age of Embers', 'The Age of Forms']) assert.ok(body.includes(name));
  assert.match(body, /kind of feedback/);
  assert.match(body, /Availability \(optional\)/);
  assert.match(html, /If your email app does not open/);
  assert.match(html, /sent only when you choose to send it/);
});
test('editorial application has no web-based collection and no newsletter enrollment', () => {
  assert.match(html, /not automatically added to the series newsletter/);
  assert.match(html, /not stored by this website/);
  assert.match(html, /Only approved invitees receive private reading material/);
  assert.doesNotMatch(html, /<form\b|<input\b|<button\b|<script\b|embed-subscribe|metadata__beta_editor_opt_in/i);
  assert.doesNotMatch(html, /\.epub|download=["']|issues\/new\?template=editorial-interest/);
});
