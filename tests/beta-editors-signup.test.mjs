import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
const path='src/beta/editors/index.html';
const html=fs.readFileSync(path,'utf8');
const home=fs.readFileSync('src/index.html','utf8');
const books=fs.readFileSync('src/books/index.html','utf8');
const sitemap=fs.readFileSync('src/sitemap.xml','utf8');
const manifest=JSON.parse(fs.readFileSync('public-manifest.json','utf8'));
test('beta editor route remains public and manifest-approved',()=>{
 const entry=manifest.artifacts.find(x=>x.path===path);
 assert.equal(entry?.canonical_url,'/beta/editors/');
 assert.equal(entry?.approval_state,'approved');
 assert.equal(entry?.checksum_sha256,crypto.createHash('sha256').update(html).digest('hex'));
 assert.match(html,/Beta editors and early readers/);
 assert.match(home,/href="beta\/editors\/"/);
 assert.match(books,/href="\.\.\/beta\/editors\/"/);
 assert.match(sitemap,/entanglementofages\.com\/beta\/editors\//);
});
test('beta signup remains fail-closed pending provider acceptance',()=>{
 assert.match(html,/Registration opening later/);
 assert.match(html,/No email addresses are being collected/);
 assert.match(html,/Consent records, sender contact details, and delivery/);
 assert.doesNotMatch(html,/<form\b|<input\b|<button\b|<script\b|embed-subscribe|metadata__beta_editor_opt_in/i);
});
test('only approved readers receive private manuscripts',()=>{
 assert.match(html,/Only approved invitees receive private reading material/);
 assert.match(html,/not grant manuscript access/);
 assert.match(html,/do not post email addresses/);
 assert.doesNotMatch(html,/\.epub|download=["']/);
});
