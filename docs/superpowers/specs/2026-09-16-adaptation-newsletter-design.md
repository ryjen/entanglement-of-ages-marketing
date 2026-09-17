# Screen adaptation and newsletter design

Date: 2026-09-16
Tracking: #122
Private canon/rights sync: ryjen/entanglement-of-ages#390

## Objective

Add a producer-facing adaptation surface for *Entanglement of Ages* and make newsletter signup materially easier to discover, without changing the static-site deployment model or introducing subscriber storage into this repository.

## Constraints

- Preserve the current public/private boundary: adaptation copy must remain premise-level and spoiler-safe.
- Keep creative rights reserved and route adaptation/rights inquiries through the existing industry contact.
- Keep the reader journey primary. Adaptation remains a contextual industry route rather than a primary navigation item.
- Reuse the existing Buttondown account and double-opt-in flow.
- Do not add a backend, API key, secret, database, or server-side subscriber processing.
- Preserve a no-email subscription alternative via the existing Atom feed.
- Keep the site functional without JavaScript.

## Public information architecture

Add a stable secondary route:

`/adaptation/`

The route is linked from:

1. `/press/` as the primary industry path;
2. the homepage in the existing contribution/industry area;
3. contextual footer or utility links where the current site pattern allows it.

Do not add `Adaptation` to the six-item primary navigation.

Update `sitemap.xml`, the publication manifest, and any route/link contracts that enumerate public pages.

## Adaptation page

The adaptation page is a concise screen-development surface, not a duplicate press kit.

### Hero

Position the property as literary IP for screen development:

- *Entanglement of Ages*
- four eras, one recurring dramatic pressure;
- stories about the reasons people and systems invent to own, define, rank, or save another life.

### Core screen hook

Lead with *The Fatherless* as the concrete dramatic entry point:

> A child meant to justify slavery becomes the accusation against it.

Use the existing approved public premise: an elite slaveholder manufactures a private scandal among people he owns; the resulting child is intended as proof that domination is necessary, but becomes evidence against the logic that created the atrocity.

Do not expose private ending logic, hidden correspondences, or unpublished canon.

### Adaptation shape

Present the property as intentionally format-flexible rather than prescribing a buyer's development model:

- limited anthology series;
- interconnected feature films;
- individual novel adaptations.

Describe the four settings at premise level:

- *Age of Embers* — prehistoric survival, guarded fire, migration, memory;
- *The Fatherless* — institutional ownership, law, lineage, consent;
- *Neurion* — synthetic personhood, intelligence, authorship, restraint;
- *The Age of Forms* — abundance, ranking, selection, comparative human value.

### Development state

State the current public development status already approved by the site:

- *The Fatherless*, *Neurion*, and *Age of Embers* have beta manuscripts;
- *The Age of Forms* is in editorial development/revision.

Avoid implying that screen rights have been optioned or that production partners are attached.

### Rights and contact

- State that screen/adaptation rights are available for discussion unless and until the public rights state changes.
- Link to `/press/` for approved assets and project facts.
- Route confidential inquiries to the existing industry email (`info@ryanjennin.gs`).
- Preserve the repository's All Rights Reserved boundary.

## Newsletter integration

### Provider

Keep Buttondown as the subscriber system. The existing legacy username/slug `thefatherless` may remain; public-facing site copy should use *Entanglement of Ages* branding.

### Embedded form

Use Buttondown's documented static HTML endpoint directly from the browser:

`https://buttondown.com/api/emails/embed-subscribe/thefatherless`

Form requirements:

- `method="post"`;
- input `type="email"` and `name="email"`;
- hidden `embed=1` field where required by Buttondown's embed flow;
- hidden `tag` inputs for source attribution when useful (for example `release-updates` plus `source-home` or `source-news`);
- submit button with explicit subscription wording;
- visible privacy copy that the email is sent directly to Buttondown, confirmation is required, and unsubscribe is available from every email.

The site must not persist, log, proxy, or process subscriber email addresses.

### Placement

1. Homepage: one compact signup section after the primary story/edition content, before the final contribution/utility material.
2. News: replace or augment the existing outbound signup button with the embedded form; retain Atom as the alternative.
3. Adaptation page: do not foreground the newsletter, but a compact footer-level signup is acceptable if it follows the site-wide pattern.

Avoid modal popups, exit-intent prompts, or repeated sticky signup UI.

## Data flow and privacy

```text
reader browser
    -> POST email directly to Buttondown embed endpoint
    -> Buttondown opt-in/confirmation flow
    -> subscriber list managed by Buttondown
```

No subscriber PII crosses the GitHub Pages deployment or repository tooling.

Failure behavior:

- HTML validation must catch missing `name="email"` or malformed form fields.
- If Buttondown is unavailable, the site remains readable and the Atom feed remains usable.
- No JavaScript-only success path.

## Visual treatment

Reuse the existing editorial visual system rather than introducing a new adaptation-specific theme.

- Adaptation page should feel like the current Press & Industry page, with cinematic hero artwork already approved for public use.
- Newsletter form should be a compact editorial callout, not another large card grid.
- Maintain current focus states, contrast, touch targets, responsive typography, and reduced-motion behavior.

## Expected implementation surfaces

Likely files:

- `src/adaptation/index.html` (new)
- `src/index.html`
- `src/news/index.html`
- `src/press/index.html`
- relevant shared stylesheet(s), only if existing form/action styles are insufficient
- `src/sitemap.xml`
- `public-manifest.json`
- public route/link/browser contract tests or tooling inputs as required
- reader information architecture documentation if the route inventory is authoritative there

Do not add client-side frameworks or a bespoke subscription script.

## Validation

Before completion:

1. Run the repository's full `mise run check` path.
2. Verify source/publication manifest integrity.
3. Validate HTML and accessibility semantics for the email form.
4. Verify `/adaptation/` canonical URL, metadata, links, and sitemap inclusion.
5. Verify newsletter form action, `name="email"`, hidden fields, and Buttondown source tags.
6. Run browser smoke tests for desktop/mobile layout and keyboard interaction.
7. Verify no private canon, private repository coordinates, secrets, or subscriber data are introduced.
8. Confirm all public adaptation copy remains consistent with the current private series architecture and public rights policy.

## Rollout

Ship as one focused marketing-site pull request tied to #122. Keep the existing Buttondown username during this change; renaming or moving the Buttondown account is a separate operational change only if later desired.
