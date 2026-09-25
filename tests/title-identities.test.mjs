import assert from "node:assert/strict";
import test from "node:test";
import { identityFindings, validateIdentities } from "../tools/validate-title-identities.mjs";

test("rejects retired relative-era labels in active public content",()=>{
  assert.ok(identityFindings("src/books/index.html","This was once the "+["pre","quel"].join("")+".").length);
  assert.ok(identityFindings("README.md","The "+["se","quel"].join("")+" route remains.").length);
});

test("rejects retired first-book implementation identities",()=>{
  const retired=["ori","ginal"].join("");
  assert.ok(identityFindings(`src/styles/${retired}.v1.css`,"").length);
  assert.ok(identityFindings("src/index.html",`<body data-theme="${retired}">`).length);
});

test("allows ordinary semantic use of original",()=>{
  assert.deepEqual(identityFindings("docs/image-provenance.md","Project-generated original artwork."),[]);
});

test("keeps historical reference snapshots outside active identity enforcement",()=>{
  const retired=["pre","quel"].join("");
  assert.deepEqual(validateIdentities(["docs/references/old.md"],()=>`Historical ${retired} wording.`),[]);
});
