import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const read = (relative) => fs.readFileSync(path.join(ROOT, relative), "utf8");

const readerOrder = [
  ["the-fatherless", "The Fatherless"],
  ["neurion", "Neurion"],
  ["age-of-embers", "Age of Embers"],
  ["age-of-forms", "The Age of Forms"],
];

function inOrder(text, titles) {
  let previous = -1;
  for (const title of titles) {
    const position = text.indexOf(title, previous + 1);
    assert.ok(position > previous, `Missing or out-of-order title: ${title}`);
    previous = position;
  }
}

test("book overview uses canonical discovery numbering, not timeline numbering", () => {
  const books = read("src/books/index.html");
  const cards = [...books.matchAll(/<article class="panel"><p class="theme-mark">([\s\S]*?)<\/article>/g)];
  assert.equal(cards.length, 4);
  assert.deepEqual(cards.map((card) => card[1].match(/<h3>([^<]+)<\/h3>/)?.[1]), readerOrder.map(([, title]) => title));
  for (const [index, card] of cards.entries()) {
    assert.match(card[1], new RegExp(`^(?:First|Second|Third|Fourth) novel`));
    assert.match(card[1], new RegExp(`href="${readerOrder[index][0]}/"`));
  }
});

test("public about and press present concepts, titles and artwork in reader order", () => {
  const about = read("src/about/index.html");
  const aboutConcept = about.match(/<h2>The form changes<\/h2>\s*<p>([\s\S]*?)<\/p>/)?.[1];
  assert.ok(aboutConcept, "Missing series concept paragraph");
  inOrder(aboutConcept, readerOrder.map(([, title]) => `<em>${title}</em>`));

  const press = read("src/press/index.html");
  const pressTitles = press.match(/<dt>Books \(reader order\)<\/dt><dd>([\s\S]*?)<\/dd>/)?.[1];
  assert.ok(pressTitles, "Press needs explicitly labeled reader-order titles");
  inOrder(pressTitles, readerOrder.map(([, title]) => `<em>${title}</em>`));

  const assetCards = [...press.matchAll(/<a class="press-asset" href="\.\.\/media\/heroes\/([a-z-]+)-hero\.webp"/g)];
  assert.deepEqual(assetCards.map((card) => card[1]), readerOrder.map(([slug]) => slug));
});

test("the world timeline is separately identified as chronology", () => {
  const world = read("src/world/index.html");
  assert.match(world, /chronological order/i);
  assert.match(read("README.md"), /reader\/discovery order/);
});
