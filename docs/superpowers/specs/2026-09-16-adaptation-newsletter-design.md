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
- Do not imply that screen rights have been optioned, encumbered, or formally offered on specific terms; the public page invites adaptation and rights inquiries and leaves substantive rights status to private discussion.

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

- *Entanglement of Ages*;
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

- Say that screen/adaptation and rights inquiries are welcome; do not make a stronger representation about availability or encumbrances on the public page.
- Link to `/press/` for approved assets and project facts.
- Route confidential inquiries to the existing industry email (`info@ryanjennin.gs`).
- Preserve the repository's All Rights Reserved boundary.

## Newsletter integration

### Provider

Use the existing *Entanglement of Ages* Buttondown newsletter:

`https://buttondown.com/entanglement-of-ages`

The newsletter identity already matches the public project, so there is no legacy-slug migration in scope. Existing site references to `buttondown.com/thefatherless` are stale and must be replaced.

Before release, verify the subscriber-visible Buttondown configuration remains coherent with the public site:

- newsletter display name is *Entanglement of Ages*;
- description reflects the four-book project;
- author/from name clearly identifies Ryan Jennings / Entanglement of Ages;
- sender or reply-to address is current;
- confirmation, archive, and unsubscribe surfaces use the current project identity.

### Embedded form

Use Buttondown's static HTML subscription endpoint directly from the browser:

`https://buttondown.com/api/emails/embed-subscribe/entanglement-of-ages`

Form requirements:

- `method="post"`;
- input `type="email"`, `name="email"`, `required`, and `autocomplete="email"`;
- a visible `<label>` associated with the email input;
- hidden `embed=1` field;
- one hidden `tag` for source attribution: `source-home` on Home or `source-news` on News;
- do not add a second `tag` control merely to mark `release-updates`: Buttondown accepts repeated tags, but this repository's HTML validator rejects duplicate form-control names, and the newsletter identity already conveys the release/project-update purpose;
- submit button with explicit subscription wording;
- no JavaScript `fetch` wrapper around the form;
- no email address in a query string, client log, analytics event, or repository-controlled storage;
- visible privacy copy explaining that the email is submitted directly to Buttondown, confirmation may be required, and unsubscribe is available from sent emails.

The standard HTML flow may navigate from the site to Buttondown when Buttondown needs to display validation, CAPTCHA, confirmation, or related subscriber UI. That navigation is expected progressive behavior, not a failure. Do not promise an inline-only success state unless a different Buttondown embed mechanism is deliberately adopted later.

The site must not persist, log, proxy, or process subscriber email addresses.

### Placement

1. Homepage: add one compact signup row within `home-endmatter`, after Planned editions and before Editorial development. This keeps the newsletter visible without adding another large card section.
2. News: replace the stale outbound `thefatherless` signup link with the embedded *Entanglement of Ages* form; retain Atom as the alternative.
3. Adaptation page: do not foreground the newsletter. A footer-level or utility link to News is sufficient; avoid adding a third prominent signup form unless later evidence justifies it.

Avoid modal popups, exit-intent prompts, or repeated sticky signup UI.

## Consent continuity

Keep Buttondown as the system of record for subscriber consent/status; the marketing repository must not duplicate subscriber data.

If any current subscribers originally opted in while the project was branded primarily as *The Fatherless*, preserve the original scope of project, manuscript, publication, excerpt, and release updates. The first relevant send can briefly acknowledge that *The Fatherless* now sits within the broader *Entanglement of Ages* project rather than silently broadening the list into unrelated author marketing.

For Canadian commercial-email compliance, treat the list as potentially subject to CASL whenever a message has a commercial purpose: preserve evidence of consent, clearly identify the sender/contact, and keep a working unsubscribe mechanism in every applicable message.

## Data flow and privacy

```text
reader browser
    -> POST email directly to Buttondown embed endpoint
    -> Buttondown validation / CAPTCHA / opt-in flow as required
    -> subscriber list and consent state managed by Buttondown
```

No subscriber PII crosses the GitHub Pages deployment or repository tooling.

Failure behavior:

- HTML validation must catch missing `name="email"`, `required`, label association, or malformed form fields.
- If Buttondown is unavailable, the site remains readable and the Atom feed remains usable.
- No JavaScript-only success path.
- Cross-origin navigation to Buttondown for validation/CAPTCHA is acceptable and expected.

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
- `docs/reader-information-architecture.md` to add `/adaptation/` as a secondary industry route

Do not add client-side frameworks or a bespoke subscription script.

## Publication governance

The adaptation page is a governed public artifact:

- content type: `press` (or another existing explicitly supported industry content type if validation requires it);
- spoiler tier: `premise`;
- approval state: `approved` only after the final copy review;
- rights status: `repository-authored`;
- provenance class: `public-native`;
- stable canonical URL: `/adaptation/`;
- checksum generated for the exact approved bytes.

Every changed approved public artifact must receive a refreshed checksum and pass the repository's negative-regression/publication-boundary checks.

## Validation

Before completion:

1. Run the repository's full `mise run check` path.
2. Verify source/publication manifest integrity and refreshed checksums for every changed approved artifact.
3. Validate HTML and accessibility semantics for the email form, including visible label, `required`, `autocomplete="email"`, and keyboard operation.
4. Verify `/adaptation/` canonical URL, metadata, links, sitemap inclusion, and secondary-navigation treatment.
5. Verify newsletter form action is exactly `https://buttondown.com/api/emails/embed-subscribe/entanglement-of-ages`, with `name="email"`, `embed=1`, exactly one source-attribution `tag`, POST method, and no JavaScript submission interception.
6. Verify all repository-controlled newsletter links use `https://buttondown.com/entanglement-of-ages` rather than the stale `thefatherless` URL.
7. Verify the browser follows Buttondown-hosted validation/CAPTCHA responses correctly rather than treating navigation away as an error.
8. Run browser smoke tests for desktop/mobile layout and keyboard interaction, including `/adaptation/` in both reader-layout and hero-contrast matrices.
9. Verify no private canon, private repository coordinates, secrets, or subscriber data are introduced.
10. Confirm all public adaptation copy remains consistent with the current private series architecture and public rights policy.
11. Manually verify Buttondown's subscriber-visible display name, description, sender identity, confirmation page, and unsubscribe path before release. Do not submit a real test address without an address explicitly intended for testing.
12. Before the next send, review the email template/footer for sender identification, current contact information, and working unsubscribe behavior.

## Rollout

Ship as one focused marketing-site pull request tied to #122. The current Buttondown identity is already `entanglement-of-ages`; no newsletter migration is part of this change.
