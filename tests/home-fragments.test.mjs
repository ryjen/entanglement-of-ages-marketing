import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const SOURCE = path.join(ROOT, 'src');

function htmlPages(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const full = path.join(directory, entry.name);
    return entry.isDirectory() ? htmlPages(full) : entry.isFile() && entry.name.endsWith('.html') ? [full] : [];
  });
}

test('all cross-page homepage fragment links have a real target', () => {
  const homepage = fs.readFileSync(path.join(SOURCE, 'index.html'), 'utf8');
  const targetIds = new Set([...homepage.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]));
  for (const file of htmlPages(SOURCE)) {
    const route = path.relative(SOURCE, file).replace(/index\.html$/, '');
    const currentUrl = new URL(route, 'https://entanglementofages.com/');
    const html = fs.readFileSync(file, 'utf8');
    for (const match of html.matchAll(/\bhref="([^"]*#[^"]+)"/g)) {
      const target = new URL(match[1], currentUrl);
      if (target.origin !== currentUrl.origin || target.pathname !== '/' || !target.hash) continue;
      const fragment = decodeURIComponent(target.hash.slice(1));
      assert.ok(targetIds.has(fragment),
        `${path.relative(ROOT, file)}: ${match[1]} points to missing homepage #${fragment}`);
    }
  }
});
