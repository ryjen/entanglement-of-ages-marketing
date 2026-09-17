# Adaptation Page and Newsletter Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a spoiler-safe screen-adaptation surface and accessible Buttondown newsletter signup to the public *Entanglement of Ages* site.

**Architecture:** Keep the site static and manifest-authoritative. Add one `/adaptation/` HTML page, reuse `editorial.v1.css` for both adaptation and form presentation, post newsletter emails directly from the browser to Buttondown, and extend existing Node UX contracts so stale newsletter identities, missing form semantics, and route regressions fail CI.

**Tech Stack:** Static HTML/CSS, Node 24 built-in test runner, existing `mise` task graph, Playwright browser smoke, GitHub Pages, Buttondown hosted subscription endpoint.

**Spec:** `docs/superpowers/specs/2026-09-16-adaptation-newsletter-design.md`

## Global Constraints

- Keep adaptation secondary to the reader journey; do not add it to the six-item primary navigation.
- Keep all adaptation copy at public `premise` spoiler tier.
- Do not add a backend, secret, API key, subscriber database, or JavaScript submission wrapper.
- Newsletter form action must be `https://buttondown.com/api/emails/embed-subscribe/entanglement-of-ages` with `method="post"`.
- No public-site reference may remain to `buttondown.com/thefatherless`.
- Preserve Atom as the no-email subscription alternative.
- Every changed approved deployable artifact must have a refreshed `public-manifest.json` checksum.
- Run the full `mise run check` gate before completion.

---

### Task 1: Add failing UX contracts for adaptation and newsletter behavior

**Files:**
- Modify: `tests/ux.test.mjs`

**Interfaces:**
- Consumes: current static pages and existing `read()` helper in `tests/ux.test.mjs`.
- Produces: CI contracts requiring `/adaptation/`, current Buttondown identity, accessible form semantics, contextual adaptation links, and sitemap coverage.

- [ ] **Step 1: Add the adaptation page to the governed public-page arrays**

Add `src/adaptation/index.html` to `publicHtmlPages` and `trilogyOverviewPages` so the existing shared-navigation and shared-four-age-hero tests apply automatically.

- [ ] **Step 2: Add a failing adaptation-page contract**

Add:

```js
test('adaptation page exposes the approved screen-development pitch without joining primary navigation', async () => {
  const html = await read('src/adaptation/index.html');
  assert.match(html, /A child meant to justify slavery becomes the accusation against it/i);
  assert.match(html, /limited anthology series/i);
  assert.match(html, /interconnected feature films/i);
  assert.match(html, /individual novel adaptations/i);
  assert.match(html, /info@ryanjennin\.gs/);
  assert.match(html, /href="\.\.\/press\/"/);
  assert.doesNotMatch(html.match(/<nav class="primary-nav"[^>]*>[\s\S]*?<\/nav>/)?.[0] ?? '', /Adaptation/);
});
```

- [ ] **Step 3: Add a failing newsletter contract**

Add:

```js
test('newsletter signup posts directly to the Entanglement of Ages Buttondown list', async () => {
  for (const pagePath of ['src/index.html', 'src/news/index.html']) {
    const html = await read(pagePath);
    assert.match(html, /<form[^>]+action="https:\/\/buttondown\.com\/api\/emails\/embed-subscribe\/entanglement-of-ages"[^>]+method="post"/i);
    assert.match(html, /<label[^>]+for="newsletter-email-[^"]+"/i);
    assert.match(html, /<input[^>]+type="email"[^>]+name="email"[^>]+required[^>]+autocomplete="email"/i);
    assert.match(html, /<input[^>]+type="hidden"[^>]+name="embed"[^>]+value="1"/i);
  }

  const surfaces = await Promise.all([
    read('src/index.html'),
    read('src/news/index.html'),
    read('src/press/index.html'),
  ]);
  assert.doesNotMatch(surfaces.join('\n'), /buttondown\.com\/thefatherless/i);
});
```

- [ ] **Step 4: Add a failing contextual-routing contract**

Add:

```js
test('industry and discovery surfaces link contextually to adaptation and newsletter routes', async () => {
  const [home, press, sitemap] = await Promise.all([
    read('src/index.html'),
    read('src/press/index.html'),
    read('src/sitemap.xml'),
  ]);
  assert.match(home, /href="adaptation\/"/);
  assert.match(press, /href="\.\.\/adaptation\/"/);
  assert.match(sitemap, /https:\/\/eoa\.ryanjennin\.gs\/adaptation\//);
});
```

- [ ] **Step 5: Commit tests only and verify RED in CI**

Commit only `tests/ux.test.mjs`, open a draft PR, and let the existing `validate.yml` workflow run. Expected result: contract tests fail because `src/adaptation/index.html` does not exist and Home/News still use stale Buttondown links.

---

### Task 2: Implement the adaptation page and newsletter surfaces

**Files:**
- Create: `src/adaptation/index.html`
- Modify: `src/index.html`
- Modify: `src/news/index.html`
- Modify: `src/press/index.html`
- Modify: `src/styles/editorial.v1.css`
- Modify: `src/sitemap.xml`
- Modify: `docs/reader-information-architecture.md`

**Interfaces:**
- Consumes: existing four-age hero assets, six-item primary navigation, Buttondown static HTML subscription endpoint, existing industry contact.
- Produces: `/adaptation/`, homepage/news newsletter forms, contextual industry links, reusable `.newsletter-form` styling.

- [ ] **Step 1: Create `src/adaptation/index.html` using the existing editorial-page pattern**

Use the same `base.v1.css`, `original.v1.css`, `editorial.v1.css`, `trilogy-pages.v1.css`, and four-image `trilogy-page-hero` composition used by `/press/`.

Required sections:

```html
<p class="eyebrow">Screen & adaptation</p>
<h1 id="page-title">Entanglement of Ages for the screen</h1>
<p class="lede">Four eras. One recurring dramatic pressure: the reasons people and systems invent to own, define, rank, or save another life.</p>
```

Core hook:

```html
<h2>A child meant to justify slavery becomes the accusation against it.</h2>
```

Format-flexible list must name `limited anthology series`, `interconnected feature films`, and `individual novel adaptations`.

Development-state copy must state that *The Fatherless*, *Neurion*, and *Age of Embers* have beta manuscripts and *The Age of Forms* is in editorial revision/development.

Rights CTA:

```html
<a class="button" href="mailto:info@ryanjennin.gs">Discuss adaptation or rights</a>
<a class="button button--quiet" href="../press/">Press & industry material</a>
```

Do not claim that rights are optioned, available on stated terms, or unencumbered.

- [ ] **Step 2: Replace homepage release-update CTA with a compact embedded form**

Insert one `home-endmatter__row` after `#editions` and before `#contribute` with:

```html
<form class="newsletter-form" action="https://buttondown.com/api/emails/embed-subscribe/entanglement-of-ages" method="post">
  <label for="newsletter-email-home">Email address</label>
  <div class="newsletter-form__controls">
    <input id="newsletter-email-home" type="email" name="email" autocomplete="email" required>
    <button class="button" type="submit">Join the newsletter</button>
  </div>
  <input type="hidden" name="embed" value="1">
  <input type="hidden" name="tag" value="release-updates">
  <input type="hidden" name="tag" value="source-home">
</form>
```

Add concise privacy copy explaining that the email goes directly to Buttondown, confirmation may be required, and unsubscribe is available from sent emails. Add a contextual `href="adaptation/"` action in the existing editorial/contribution endmatter without adding a primary-nav item.

- [ ] **Step 3: Replace News outbound signup button with the embedded form**

Use the same form structure with `id="newsletter-email-news"` and `source-news`; keep the Atom link visible as the no-email option.

- [ ] **Step 4: Add Press → Adaptation contextual link**

Add an industry CTA linking to `../adaptation/` near project positioning/contact, without changing primary navigation.

- [ ] **Step 5: Add reusable form styles to `src/styles/editorial.v1.css`**

Add focused styles only:

```css
.newsletter-form {
  display: grid;
  gap: 0.7rem;
  max-width: 42rem;
}

.newsletter-form label {
  color: var(--text);
  font-weight: 700;
}

.newsletter-form__controls {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 0.65rem;
}

.newsletter-form input[type='email'] {
  min-height: 2.75rem;
  width: 100%;
  padding: 0.65rem 0.75rem;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text);
  font: inherit;
}

.newsletter-form input[type='email']:focus-visible {
  outline: 2px solid var(--accent-strong);
  outline-offset: 2px;
}
```

At `max-width: 48rem`, collapse `.newsletter-form__controls` to one column.

- [ ] **Step 6: Update sitemap and reader IA**

Add `https://eoa.ryanjennin.gs/adaptation/` to `src/sitemap.xml`. Add `/adaptation/` as a secondary industry route under the existing Industry and press pathway in `docs/reader-information-architecture.md`; retain the six-item primary-nav rule.

- [ ] **Step 7: Verify GREEN contract intent before manifest work**

Run `node --test tests/ux.test.mjs` or CI equivalent. Expected: the new adaptation/newsletter tests pass; checksum/publication checks may still fail until Task 3.

---

### Task 3: Register governed artifacts and refresh checksums

**Files:**
- Modify: `public-manifest.json`

**Interfaces:**
- Consumes: exact bytes of all changed approved files under `src/`.
- Produces: manifest-backed deployable adaptation page and valid checksums for all changed approved artifacts.

- [ ] **Step 1: Add the adaptation manifest entry**

Add an entry adjacent to `press-industry`:

```json
{
  "id": "screen-adaptation",
  "path": "src/adaptation/index.html",
  "title": "Screen & Adaptation",
  "summary": "Producer-facing premise-level screen adaptation positioning, development state, and rights/contact route for Entanglement of Ages.",
  "content_type": "press",
  "spoiler_tier": "premise",
  "approval_state": "approved",
  "rights_status": "repository-authored",
  "provenance_class": "public-native",
  "publication_date": null,
  "canonical_url": "/adaptation/",
  "checksum_sha256": "<computed exact SHA-256>",
  "replacement_status": "current"
}
```

The actual commit must contain the computed checksum; the placeholder text above must never be committed.

- [ ] **Step 2: Refresh checksums for every changed approved artifact**

Compute SHA-256 for exact file bytes and update entries for at least:

- `src/index.html`
- `src/news/index.html`
- `src/press/index.html`
- `src/styles/editorial.v1.css`
- `src/sitemap.xml` if it is manifest-governed with `approval_state: approved`
- `src/adaptation/index.html`

Run `node tools/validate-manifest-checksums.mjs` or CI equivalent. Expected: PASS.

- [ ] **Step 3: Run source/build/contracts validation**

Run:

```sh
mise run contracts
mise run source
mise run build
mise run html
mise run css
mise run validate
```

Expected: all pass with no stale `thefatherless` URL, unmanifested deployable file, checksum mismatch, or HTML/CSS validation failure.

---

### Task 4: Full browser validation and PR completion

**Files:**
- Modify only if verification exposes a defect in files already scoped above.

**Interfaces:**
- Consumes: final manifest-backed site.
- Produces: CI-green PR tied to #122.

- [ ] **Step 1: Run the full gate**

Run `mise run check` in CI. Expected: PASS, including contracts, source validation, build, HTML/CSS validation, packaging, and Chromium browser smoke.

- [ ] **Step 2: Inspect the final PR diff**

Confirm:

- no private repository paths or canon leaked into `src/`;
- no `buttondown.com/thefatherless` string remains;
- `/adaptation/` is not in primary navigation;
- only the expected files changed;
- all changed approved `src/` artifacts have valid manifest checksums.

- [ ] **Step 3: Update issue #122 and mark implementation ready**

Add the PR link and verification evidence to #122. Do not close #122 until the implementation PR is merged.
