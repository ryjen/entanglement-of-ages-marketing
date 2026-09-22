# Adaptation Page and Newsletter Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a spoiler-safe screen-adaptation surface and accessible Buttondown newsletter signup to the public *Entanglement of Ages* site.

**Architecture:** Keep the site static and manifest-authoritative. Add one `/adaptation/` HTML page, reuse the existing editorial and button/action primitives, post newsletter emails directly from the browser to Buttondown, and extend existing Node UX contracts so stale newsletter identities, missing form semantics, and route regressions fail CI.

**Tech Stack:** Static HTML/CSS, Node 24 built-in test runner, existing `mise` task graph, Playwright browser smoke, GitHub Pages, Buttondown hosted subscription endpoint.

**Spec:** `docs/superpowers/specs/2026-09-16-adaptation-newsletter-design.md`

## Global Constraints

- Keep adaptation secondary to the reader journey; do not add it to the six-item primary navigation.
- Keep all adaptation copy at public `premise` spoiler tier.
- Do not add a backend, secret, API key, subscriber database, or JavaScript submission wrapper.
- Newsletter form action must be `https://buttondown.com/api/emails/embed-subscribe/entanglement-of-ages` with `method="post"`.
- Use one source-attribution `tag` per form (`source-home` or `source-news`). Buttondown permits repeated tags, but this repository's HTML validator rejects duplicate form-control names.
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

- [ ] Add `src/adaptation/index.html` to `publicHtmlPages` and `trilogyOverviewPages` so existing shared navigation and four-age hero tests apply automatically.
- [ ] Add a test that reads `src/adaptation/index.html` and requires the approved Fatherless hook, all three format-flexible adaptation options, `info@ryanjennin.gs`, a link to `../press/`, and no `Adaptation` primary-nav item.
- [ ] Add a test that requires Home and News to contain a POST form targeting `https://buttondown.com/api/emails/embed-subscribe/entanglement-of-ages`, a visible associated label, an email input named `email` with `required` and `autocomplete="email"`, and hidden `embed=1`.
- [ ] In the same newsletter contract, read Home, News, and Press and assert that `buttondown.com/thefatherless` is absent.
- [ ] Add a contextual-routing test requiring Home → `adaptation/`, Press → `../adaptation/`, and sitemap inclusion of `https://entanglementofages.com/adaptation/`.
- [ ] Commit only `tests/ux.test.mjs`, open a draft PR, and verify CI is RED because the adaptation page and new newsletter surfaces do not exist yet.

The tests should use the repository's existing `node:test`/`assert` style and real static files rather than mocks.

---

### Task 2: Implement the adaptation page and newsletter surfaces

**Files:**
- Create: `src/adaptation/index.html`
- Modify: `src/index.html`
- Modify: `src/news/index.html`
- Modify: `src/press/index.html`
- Modify: `src/sitemap.xml`
- Modify: `docs/reader-information-architecture.md`

**Interfaces:**
- Consumes: existing four-age hero assets, six-item primary navigation, Buttondown static HTML subscription endpoint, existing industry contact.
- Produces: `/adaptation/`, homepage/news newsletter forms, and contextual industry links without adding a backend or new CSS layer.

- [ ] Create `src/adaptation/index.html` using the existing Press/About editorial-page structure and the four-image `trilogy-page-hero`. Use `base.v1.css`, `original.v1.css`, `editorial.v1.css`, and `trilogy-pages.v1.css`.
- [ ] Use the hero positioning: `Screen & adaptation`, `Entanglement of Ages for the screen`, and the approved premise that four eras revisit reasons people and systems invent to own, define, rank, or save another life.
- [ ] Lead the page with `A child meant to justify slavery becomes the accusation against it.` and the already-public Fatherless premise.
- [ ] Include the phrases `limited anthology series`, `interconnected feature films`, and `individual novel adaptations` as non-prescriptive format possibilities.
- [ ] Summarize the four settings at premise level and state the current public development status: *The Fatherless*, *Neurion*, and *Age of Embers* have beta manuscripts; *The Age of Forms* is in editorial revision/development.
- [ ] Add `mailto:info@ryanjennin.gs` as the confidential adaptation/rights route and `../press/` for approved industry assets. Do not claim rights are optioned, unencumbered, or available on stated terms.
- [ ] On Home, add one compact `home-endmatter__row` after Editions and before Editorial Development containing the Buttondown form. Use `newsletter-email-home`, `name="email"`, `autocomplete="email"`, `required`, hidden `embed=1`, and `tag=source-home`. Add concise Buttondown privacy/confirmation/unsubscribe copy and a contextual `adaptation/` link outside primary navigation.
- [ ] On News, replace the stale outbound signup with the same form using `newsletter-email-news` and `tag=source-news`; keep the Atom alternative visible.
- [ ] On Press, add a contextual link to `../adaptation/` near positioning/contact without changing primary navigation.
- [ ] Reuse existing `.actions`, `.button`, and `.button--quiet` styles for the form so the change adds no CSS and stays inside the 33 KiB budget.
- [ ] Add `/adaptation/` to `src/sitemap.xml` and to the Industry/press pathway plus route inventory in `docs/reader-information-architecture.md`; retain the six-item primary-nav rule.
- [ ] Verify the Task 1 tests are GREEN before manifest/checksum work. Publication checks may still fail until Task 3.

---

### Task 3: Register governed artifacts and refresh checksums

**Files:**
- Modify: `public-manifest.json`

**Interfaces:**
- Consumes: exact bytes of all changed approved files under `src/`.
- Produces: manifest-backed deployable adaptation page and valid checksums for all changed approved artifacts.

- [ ] Compute the exact SHA-256 of `src/adaptation/index.html` after its final content is fixed.
- [ ] Add a `screen-adaptation` manifest entry adjacent to `press-industry` with path `src/adaptation/index.html`, title `Screen & Adaptation`, `content_type: "press"`, `spoiler_tier: "premise"`, `approval_state: "approved"`, `rights_status: "repository-authored"`, `provenance_class: "public-native"`, canonical URL `/adaptation/`, replacement status `current`, and the computed checksum.
- [ ] Compute and refresh exact SHA-256 values for every changed approved manifest-backed artifact, including Home, News, Press, sitemap if governed as approved, and the new adaptation page.
- [ ] Run `node tools/validate-manifest-checksums.mjs`; expected result: PASS.
- [ ] Run `mise run contracts`, `mise run source`, `mise run build`, `mise run html`, `mise run css`, and `mise run validate`; expected result: all PASS with no stale newsletter URL, unmanifested deployable file, checksum mismatch, or validation failure.

---

### Task 4: Full browser validation and PR completion

**Files:**
- Modify: `tests/browser-smoke.spec.js` to include `/adaptation/` in the mobile/desktop reader and hero matrices.
- Modify only other scoped files if verification exposes a defect.

**Interfaces:**
- Consumes: final manifest-backed site.
- Produces: CI-green PR tied to #122.

- [ ] Run the complete `mise run check` gate in CI; require contracts, publication/source checks, build, HTML/CSS validation, packaging, and Chromium browser smoke to pass.
- [ ] Require `/adaptation/` to pass both mobile/desktop overflow/readability checks and rendered hero-contrast checks.
- [ ] Inspect the final diff and confirm no private paths/canon leaked into `src/`, no `buttondown.com/thefatherless` remains, `/adaptation/` is absent from primary navigation, and changed approved artifacts have valid checksums.
- [ ] Update issue #122 with the PR and verification evidence. Do not close #122 until the PR is merged.
