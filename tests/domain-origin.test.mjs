import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const legacyHostname = ['eoa', 'ryanjennin.gs'].join('.');
const canonicalHostname = 'entanglementofages.com';

function trackedFiles() {
  return execFileSync('git', ['ls-files', '-z'])
    .toString('utf8')
    .split('\0')
    .filter(Boolean);
}

test('tracked files contain no legacy public hostname', () => {
  const needle = Buffer.from(legacyHostname);
  const offenders = trackedFiles().filter(path => readFileSync(path).includes(needle));
  assert.deepEqual(offenders, []);
});

test('GitHub Pages CNAME uses the canonical series hostname', () => {
  assert.equal(readFileSync('CNAME', 'utf8').trim(), canonicalHostname);
});
