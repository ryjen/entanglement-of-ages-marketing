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
  const link = html.match(/href="(mailto:editors@entanglementofages\.com\?[^"]+)">Compose beta-editor application<\/a>/)?.[1];
  assert.ok(link, 'expected prefilled mailto');
  assert.doesNotMatch(link, /\+/); // RFC 6068 mailto uses percent-encoded spaces
  assert.match(link, /%0D%0A/);
  const parsed = new URL(link.replaceAll('&amp;', '&'));
  assert.equal(parsed.pathname, 'editors@entanglementofages.com');
  assert.equal(parsed.searchParams.get('subject'), 'Entanglement of Ages - Beta editor interest');
  const body = parsed.searchParams.get('body');
  for (const name of ['The Fatherless', 'Neurion', 'Age of Embers', 'The Age of Forms']) assert.ok(body.includes(name));
  assert.match(body, /kind of feedback/);
  assert.match(body, /Availability \(optional\)/);
  assert.match(html, /If your email app does not open/);
  assert.match(html, /mailto:editors@entanglementofages\.com/);
  assert.doesNotMatch(html, /info@ryanjennin\.gs/);
  assert.match(html, /sent only when you choose to send it/);
});
test('editorial application has no web-based collection and no newsletter enrollment', () => {
  assert.match(html, /not automatically added to the series newsletter/);
  assert.match(html, /not stored by this website/);
  assert.match(html, /Only approved invitees receive private reading material/);
  assert.doesNotMatch(html, /<form\b|<input\b|<button\b|<script\b|embed-subscribe|metadata__beta_editor_opt_in/i);
  assert.doesNotMatch(html, /\.epub|download=["']|issues\/new\?template=editorial-interest/);
});

test('invited content reviewers are directed to the Google Play Books library', () => {
  assert.match(html, /Already invited to read\?/);
  assert.match(html, /https:\/\/play\.google\.com\/books/);
  assert.match(html, /Google Books search library is different/);
  assert.match(html, /same Google Account that was invited/);
  assert.match(html, /support\.google\.com\/books\/partner\/answer\/3156893/);
});

test('browser smoke includes beta-editor E2E coverage in the mandatory check gate', () => {
  const site = fs.readFileSync('tools/site.mjs', 'utf8');
  const start = site.indexOf('export async function runBrowserSmoke(');
  const end = site.indexOf('async function cli()', start);
  assert.ok(start >= 0 && end > start, 'browser smoke command must exist');
  assert.match(site.slice(start, end), /tests\/beta-editors-signup\.browser\.spec\.js/);
});

test('one-time contribution proposal is inactive and independent of free editorial participation', () => {
  assert.match(html, /Beta reading and editorial feedback are free/);
  assert.match(html, /Contributions are not open yet/);
  assert.match(html, /Proposed levels, in USD, paid once/);
  assert.match(html, /No contribution would grant private manuscript repository access/);
  assert.ok(html.indexOf('id="signup-title"') < html.indexOf('id="invited-reader-access"'), 'editorial application should precede troubleshooting');
  const sponsorLinks = [...html.matchAll(/href="(https:\/\/github\.com\/sponsors[^"]*)"/g)].map(match => match[1]);
  assert.deepEqual(sponsorLinks, ['https://github.com/sponsors/hackelia-micrantha']);
  assert.match(html, /Sponsorship there does not purchase books, literary patron benefits, or editorial access/);
  const literary = html.match(/<section aria-labelledby="support-series">([\s\S]*?)<\/section>/)?.[1];
  assert.ok(literary, 'expected separate literary support section');
  assert.doesNotMatch(literary, /<a\b|<form\b|<button\b/);
  assert.doesNotMatch(html, /paypal\.com\/checkout|checkout\.stripe\.com|buymeacoffee\.com|ko-fi\.com/i);
});
