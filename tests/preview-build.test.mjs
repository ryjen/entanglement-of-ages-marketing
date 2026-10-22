import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
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
  const pages = ['src/index.html', 'src/beta/editors/index.html'];
  for (const file of pages) {
    const out = neutralizePreviewHtml(fs.readFileSync(file, 'utf8'));
    assert.equal(out.signupsDisabled, 1, `expected exactly one newsletter form in ${file}`);
    assert.match(out.html, /data-preview-inert="true"/);
    assert.match(out.html, /signups are disabled/);
  }
});
