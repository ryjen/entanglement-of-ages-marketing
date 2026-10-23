import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';

const path = 'src/beta/review/index.html';
const html = fs.readFileSync(path, 'utf8');
const manifest = JSON.parse(fs.readFileSync('public-manifest.json', 'utf8'));

test('review entry is a public-safe noindex page with manifest provenance', () => {
  const record = manifest.artifacts.find(item => item.path === path);
  assert.equal(record?.canonical_url, '/beta/review/');
  assert.equal(record?.approval_state, 'approved');
  assert.equal(record?.checksum_sha256, crypto.createHash('sha256').update(html).digest('hex'));
  assert.match(html, /name="robots" content="noindex, nofollow"/);
  assert.doesNotMatch(html, /github\.com\/ryjen\/entanglement-of-ages\/issues/);
});

test('reader feedback goes through explicit private email, not public storage', () => {
  assert.match(html, /action="mailto:reviews@entanglementofages\.com"/);
  assert.match(html, /const mail = 'mailto:reviews@entanglementofages\.com\?subject='/);
  assert.match(html, /Review copied\. Paste it into an email to reviews@entanglementofages\.com/);
  assert.doesNotMatch(html, /info@ryanjennin\.gs/);
  assert.match(html, /window\.location\.href = mail/);
  assert.match(html, /not sent until you send the message/);
  assert.match(html, /navigator\.clipboard\.writeText/);
  assert.doesNotMatch(html, /\bfetch\s*\(|localStorage|sessionStorage|navigator\.sendBeacon/);
});

test('review form accepts all four canonical book identifiers without private source identifiers', () => {
  for (const slug of ['the-fatherless', 'neurion', 'age-of-embers', 'age-of-forms']) {
    assert.ok(html.includes(`value="${slug}"`), slug);
  }
  assert.match(html, /id="version"[^>]+required/);
  assert.doesNotMatch(html, /source-revision|Source revision|[0-9a-f]{40}/i);
  for (const name of ['impact','pacing','confusion','priority']) {
    assert.match(html, new RegExp(`name="${name}"`));
  }
});
