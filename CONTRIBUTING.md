# Contributing

This repository is a public publication surface. Do not use it for drafting, canon development, editorial notes, research, private publishing records, or unreleased creative material.

## Editorial participation

All four *Entanglement of Ages* novels have beta manuscripts; *The Age of Forms* is entering private reader testing. Editors, beta readers, and subject-matter readers can learn about future participation at the [beta editors information page](https://entanglementofages.com/beta/editors/). Registration is closed and no email is collected on that page. A future, verified Buttondown signup would tag editorial interest; subscriptions will not grant manuscript access. The public editorial-interest issue form remains available for an optional detailed contribution proposal without personal contact information.

The planned email-interest flow would use the existing Buttondown newsletter with a `beta-editor-interest` tag, **not** a separate service or access list. The proposed consent will include occasional series development/release updates, but the form is not yet active. Subscriber metadata and confirmation records must be verified with Buttondown before use; see [beta editors signup operations](docs/beta-editor-signup.md). Send any editorial-only campaign to the tagged confirmed cohort, and send series updates only under the explicitly accepted scope. An interest tag is not an approval or manuscript entitlement.

The public issue is intake only. Use it to describe the kind of contribution you are interested in, relevant background, and the scope you would like to review. Do **not** post manuscript text, spoilers, unreleased canon, raw editorial feedback, private correspondence, contracts, payment details, email addresses, phone numbers, or other unnecessary personal information.

Private manuscript access and substantive editorial work are coordinated separately. External feedback is treated as evidence rather than authority and is handled under the private project's editorial-operations rules before any resulting change becomes canon or approved public material.

Public pull requests to this repository remain limited to publication-safe marketing/site material; an editorial-interest issue does not grant access to private source material or change that boundary.

## Publication boundary

- Every file under `src/` is deployable and must have exactly one entry in `public-manifest.json`.
- `src/` may contain only `placeholder`, `approved`, or `published` artifacts whose replacement status is `current`.
- Candidate, withdrawn, and superseded material must not live under `src/`; use `staging/` when a public-repository staging record is appropriate.
- The build is manifest-driven. Unmanifested files are rejected rather than copied to `dist/`.

## Before opening a pull request

- Confirm every public artifact has a manifest entry.
- Confirm spoiler tier, approval state, rights status, provenance class, replacement status, and checksum where required.
- For media, record creator class, rights basis, attribution requirement, and metadata-review state.
- Strip embedded metadata, or explicitly mark it `reviewed-retained` and document why retention is safe and necessary.
- Do not include private repository paths or identifiers, private issue/revision references, correspondence, credentials, or internal rationale.
- Keep candidate, withdrawn, and superseded material outside `src/`.
- Review unexpectedly large text additions as possible manuscript/draft leakage.
- Run the same entrypoint used by CI:

```sh
mise run check
```

JavaScript is the only custom scripting language. Generic runtime/task management belongs in `mise.toml`; publication/build/media/deployment-diagnostic project logic belongs in `tools/site.mjs`; browser behavior belongs in Playwright specs.

## Review expectations

Public-content changes require human review for spoilers, rights, provenance, privacy, metadata, attribution, and final diff scope. Automation is a guardrail, not an approval authority.

Any change to an approved or published artifact requires a new checksum and re-review.
