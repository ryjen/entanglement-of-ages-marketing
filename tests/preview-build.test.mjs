import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { neutralizePreviewHtml, securePreviewBuild } from '../tools/preview-build.mjs';

test('preview neutralizes signup without disrupting surrounding layout or leaking email fields', () => {
  const input = `<main><form class="join" action="https://buttondown.com/api/emails/embed-subscribe/entanglement-of-ages" method="post">
<label for="mail">Email</label><input id="mail" name="email" type="email" required>
<input type="hidden" name="tag" value="beta-editor-interest">
<button type="submit">Join</button></form><a href="/books/">Books</a></main>`;
  const out = neutralizePreviewHtml(input);
  assert.equal(out.signupsDisabled, 1);
  assert.match(out.html, /<form class="join" action="#" method="get" data-preview-inert="true" aria-disabled="true">/);
  assert.match(out.html, /<input id="mail" type="email" required disabled>/);
  assert.match(out.html, /<button type="submit" disabled>/);
  assert.doesNotMatch(out.html, /name="email"|name="tag"|<input type="hidden"|action="https:\/\//);
  assert.match(out.html, /signups are disabled/);
  assert.match(out.html, /<a href="\/books\/">Books<\/a>/);
});

test('preview fails closed for unexpected third-party form actions', () => {
  assert.throws(() => neutralizePreviewHtml('<form action="https://example.com/collect" method="post"><input name="email"></form>'), /external form action/);
  assert.throws(() => neutralizePreviewHtml('<form action="https://buttondown.com/api/emails/embed-subscribe/entanglement-of-ages" method="get"></form>'), /unexpected Buttondown form method/);
});

test('only two reviewed source newsletter signups are eligible for preview suppression', () => {
  const pages = ['src/index.html', 'src/beta/editors/index.html', 'src/news/index.html'];
  for (const file of pages) {
    const out = neutralizePreviewHtml(fs.readFileSync(file, 'utf8'));
    assert.equal(out.signupsDisabled, 1, `expected exactly one newsletter form in ${file}`);
    assert.match(out.html, /data-preview-inert="true"/);
    assert.match(out.html, /signups are disabled/);
  }
});

test('a deployed preview build disables both forms and writes noindex headers', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'eoa-preview-test-'));
  try {
    fs.mkdirSync(path.join(root, 'beta', 'editors'), { recursive: true });
    for (const relative of ['index.html', 'beta/editors/index.html', 'news/index.html']) {
      const source = fs.readFileSync(path.join('src', relative), 'utf8');
      fs.writeFileSync(path.join(root, relative), source);
    }
    securePreviewBuild(root);
    for (const relative of ['index.html', 'beta/editors/index.html', 'news/index.html']) {
      const html = fs.readFileSync(path.join(root, relative), 'utf8');
      assert.match(html, /data-preview-inert="true"/);
      assert.doesNotMatch(html, new RegExp('<form[^>]*action="https?://', 'i'));
      assert.match(html, /signups are disabled/);
    }
    assert.match(fs.readFileSync(path.join(root, '_headers'), 'utf8'), /X-Robots-Tag: noindex, nofollow/);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});
