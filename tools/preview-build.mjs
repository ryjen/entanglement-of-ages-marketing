#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const BUTTONDOWN_ACTION = 'https://buttondown.com/api/emails/embed-subscribe/entanglement-of-ages';
const EXPECTED_SIGNUP_FILES = ['beta/editors/index.html', 'index.html', 'news/index.html'];
const PREVIEW_MESSAGE = 'Preview only — newsletter and beta-editor signups are disabled.';

// Pure transformation for the deployable *build output*, never approved source.
export function neutralizePreviewHtml(html) {
  let count = 0;
  const output = html.replace(/<form\b[^>]*>[\s\S]*?<\/form>/gi, original => {
    const opening = original.match(/^<form\b[^>]*>/i)?.[0];
    if (!opening || !opening.includes(BUTTONDOWN_ACTION)) return original;
    if (!/\bmethod="post"/i.test(opening)) throw new Error('unexpected Buttondown form method');
    if (/<(?:select|textarea)\b/i.test(original)) throw new Error('unknown signup input requires review');
    count += 1;
    const inertOpening = opening
      .replace(/\saction="[^"]*"/i, ' action="#"')
      .replace(/\smethod="post"/i, ' method="get"')
      .replace(/>$/, ' data-preview-inert="true" aria-disabled="true">');
    return original
      .replace(opening, inertOpening)
      .replace(/<input\b[^>]*>/gi, tag => {
        if (/\btype="hidden"/i.test(tag)) return '';
        return tag.replace(/\sname="[^"]*"/gi, '').replace(/>$/, ' disabled>');
      })
      .replace(/<button\b[^>]*>/gi, tag => tag.replace(/>$/, ' disabled>'))
      .replace(/<\/form>$/i, `<p class="small" role="status"><strong>${PREVIEW_MESSAGE}</strong></p></form>`)
      .replace(/^[ ]+$/gm, '');
  });
  if (/<form\b[^>]*action="https?:\/\//i.test(output)) {
    throw new Error('external form action in preview output: fail closed');
  }
  return { html: output, signupsDisabled: count };
}

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const dest = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(dest) : entry.isFile() && dest.endsWith('.html') ? [dest] : [];
  });
}

export function securePreviewBuild(dist = 'dist') {
  const found = [];
  for (const file of walk(dist)) {
    const relative = path.relative(dist, file).split(path.sep).join('/');
    const original = fs.readFileSync(file, 'utf8');
    const changed = neutralizePreviewHtml(original);
    if (changed.signupsDisabled) {
      if (changed.signupsDisabled !== 1) throw new Error(`unexpected signup count: ${relative}`);
      found.push(relative);
      fs.writeFileSync(file, changed.html);
    }
  }
  assert.deepEqual(found.sort(), EXPECTED_SIGNUP_FILES);
  // Cloudflare Pages serves this output-only file; not part of the canonical source manifest.
  fs.writeFileSync(path.join(dist, '_headers'), '/*\n  X-Robots-Tag: noindex, nofollow\n  Referrer-Policy: no-referrer\n');
  console.log(`Preview hardened: ${found.join(', ')} (no signup submissions)`);
}

function run(relative, args = []) {
  console.log(`Preview verification: ${relative} ${args.join(' ')}`);
  execFileSync(process.execPath, [relative, ...args], { stdio: 'inherit' });
}
function bin(binary, args) {
  execFileSync(path.join('node_modules', '.bin', binary), args, { stdio: 'inherit' });
}
function build() {
  // Cloudflare runs npm install first. Mirror the site's normal source/build/package checks.
  run('tools/validate-media-integrity.mjs');
  run('tools/site.mjs', ['source']);
  run('tools/validate-canonical-origin.mjs');
  run('tools/validate-release-state.mjs');
  run('tools/validate-public-language.mjs');
  run('tools/validate-title-identities.mjs');
  const contractTests = fs.readdirSync('tests').filter(f => f.endsWith('.test.mjs')).sort().map(f => path.join('tests', f));
  execFileSync(process.execPath, ['--test', ...contractTests], { stdio: 'inherit' });
  run('tools/site.mjs', ['build']);
  run('tools/site.mjs', ['validate']);
  run('tools/version-built-media.mjs');
  run('tools/validate-built-media.mjs');
  bin('html-validate', ['src/**/*.html', 'dist/**/*.html']);
  bin('stylelint', ['src/**/*.css', 'dist/**/*.css']);
  securePreviewBuild();
  bin('html-validate', ['dist/**/*.html']);
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try { build(); } catch (error) { console.error(error); process.exitCode = 1; }
}
