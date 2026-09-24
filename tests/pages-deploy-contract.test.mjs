import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const workflow = fs.readFileSync(
  path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '.github/workflows/validate.yml'),
  'utf8',
);

test('Pages deployment has the required OIDC permission', () => {
  assert.match(workflow, /id-token:\s*write/);
  assert.match(workflow, /pages:\s*write/);
});

test('Cloudflare success diagnostics require a successful Pages deployment', () => {
  assert.match(workflow, /- name: Record Cloudflare probe result\s+if: [^\n]*steps\.deployment\.outcome == 'success'[^\n]*always\(\)/);
});
