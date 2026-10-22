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

test('editor-interest page is an approved, discoverable, manifest-backed public route', () => {
  const entry = manifest.artifacts.find(item => item.path === path);
  assert.equal(entry?.canonical_url, '/beta/editors/');
  assert.equal(entry?.approval_state, 'approved');
  assert.equal(entry?.checksum_sha256, crypto.createHash('sha256').update(html).digest('hex'));
  assert.match(html, /<h1>Join the beta editors list\.<\/h1>/);
  assert.match(sitemap, /https:\/\/entanglementofages\.com\/beta\/editors\//);
  assert.match(home, /href="beta\/editors\/"/);
  assert.match(books, /href="\.\.\/beta\/editors\/"/);
});

test('email signups go directly to a tagged Buttondown interest segment', () => {
  assert.match(html, /action="https:\/\/buttondown\.com\/api\/emails\/embed-subscribe\/entanglement-of-ages" method="post"/);
  assert.match(html, /name="email" autocomplete="email"[^>]+required/);
  assert.match(html, /type="checkbox" name="metadata__beta_editor_opt_in" value="eoa-beta-editors-v1-2026-10-22" required/);
  assert.match(html, /This subscribes me to the existing series newsletter/);
  assert.match(html, /For questions or consent withdrawal/);
  assert.match(html, /mailto:info@ryanjennin\.gs/);
  assert.match(html, /name="embed" value="1"/);
  assert.match(html, /name="tag" value="beta-editor-interest"/);
  assert.doesNotMatch(html, /<script|\bfetch\s*\(|localStorage|sessionStorage|sendBeacon/);
});

test('beta interest grants no manuscript access and requires no public personal-data disclosure', () => {
  assert.match(html, /Only approved invitees receive private reading material/);
  assert.match(html, /not a manuscript download/);
  assert.match(html, /do not post email addresses/);
  assert.match(html, /unsubscribe at any time/);
  assert.doesNotMatch(html, /\/beta\/review\/|\.epub|download=["']/);
});
