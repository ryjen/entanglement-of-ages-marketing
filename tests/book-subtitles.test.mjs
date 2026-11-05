import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const read = (file) => fs.readFileSync(path.join(ROOT, file), "utf8");
const books = [
  ["the-fatherless", "The Fatherless", "Adoption of Sin"],
  ["neurion", "Neurion", "Evolution of Sin"],
  ["age-of-embers", "Age of Embers", "The Search Begins"],
  ["age-of-forms", "The Age of Forms", "Humanity Codified"],
];

test("all approved subtitles appear in discovery order without changing primary titles or routes", () => {
  for (const file of ["src/index.html", "src/books/index.html"]) {
    const html = read(file);
    let previous = -1;
    for (const [slug, title, subtitle] of books) {
      const phrase = "<h3>" + title + "</h3><p class=\"book-subtitle\">" + subtitle + "</p>";
      const next = html.indexOf(phrase, previous + 1);
      assert.ok(next > previous, file + ": missing or out-of-order " + title);
      const route = 'href="' + (file === "src/index.html" ? "books/" : "") + slug + '/"';
      assert.ok(html.includes(route), file + ": missing canonical book route");
      previous = next;
    }
  }
});

test("public Book schema declares separate subtitles; catalog names remain canonical", () => {
  for (const [slug, title, subtitle] of books) {
    const html = read("src/books/" + slug + "/index.html");
    assert.ok(html.includes('<h1 id="page-title">' + title + "</h1>"));
    assert.ok(html.includes('<p class="book-subtitle">' + subtitle + "</p>"));
    assert.ok(html.includes('"name": "' + title + '"'));
    assert.ok(html.includes('"alternativeHeadline": "' + subtitle + '"'));
    assert.ok(html.includes('<link rel="canonical" href="https://entanglementofages.com/books/' + slug + '/">'));
    assert.ok(html.includes('<meta property="og:title" content="' + title + ": " + subtitle + " · "));
    assert.ok(html.includes('<meta name="twitter:title" content="' + title + ": " + subtitle + " · "));
  }
});

test("approved public page and stylesheet digests match the publication manifest", () => {
  const manifest = JSON.parse(read("public-manifest.json"));
  const files = ["src/index.html", "src/books/index.html",
    ...books.map(([slug]) => "src/books/" + slug + "/index.html"), "src/styles/sites-home.v1.css"];
  for (const file of files) {
    const matches = manifest.artifacts.filter((a) => a.path === file);
    assert.equal(matches.length, 1, file + ": expected one manifest entry");
    assert.equal(matches[0].approval_state, "approved", file + ": expected approved state");
    const actual = createHash("sha256").update(fs.readFileSync(path.join(ROOT, file))).digest("hex");
    assert.equal(matches[0].checksum_sha256, actual, file + ": stale checksum");
  }
  const secondary = manifest.artifacts.find((a) => a.path === "src/styles/series-pages.v1.css");
  assert.equal(secondary.approval_state, "placeholder", "preserve existing asset approval state");
  assert.equal(secondary.checksum_sha256, null, "placeholder CSS has no approved checksum");
  assert.match(read("src/styles/series-pages.v1.css"), /\.book-subtitle\{/);
});
