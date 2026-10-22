# Status: registration closed

The live public page is informational and does not submit or collect email. The Buttondown form below is a design for a future activation PR after all controls in issue #166 are verified. Merging the informational page is not consent or release approval.

# Beta editors signup: provider and sending contract

Public route: `/beta/editors/`. Source: `src/beta/editors/index.html`. This is an **interest list**, not manuscript or review access. The public project never stores subscriber addresses or private editor correspondence.

## Provider boundaries

- Once activated after issue #166, the public page should post an ordinary browser form directly to Buttondown's `embed-subscribe/entanglement-of-ages` endpoint; do not convert this into a JavaScript `fetch` request or include account tokens.
- The single hidden `tag=beta-editor-interest` marks an interest cohort within the **existing series newsletter**; this is not a distinct subscriber database, approval state, or separate newsletter. Buttondown adds that tag to existing subscriber tags.
- The unchecked-by-default required `metadata__beta_editor_opt_in` checkbox sends the **specific** notice ID `eoa-beta-editors-v1-2026-10-22` only when a visitor actively checks it. This field does not on its own prove consent was stored: configure a Buttondown subscriber metadata text field with key `beta_editor_opt_in` and verify that the exact value is retained for both new and returning confirmed subscribers. If Buttondown does not retain it, **stop**; change the design or obtain evidence of an equivalent provider-held consent record before publication.
- Buttondown normally requires email confirmation before a new subscriber becomes active. Verify this setting and record evidence of activation time/status in Buttondown (privately), rather than assuming an HTML successful submission proves consent.
- The opt-in notice ID is bound to the exact checkbox wording reviewed in PR #165. Material changes to purpose, sender, or receiving scope require a new notice ID and publication checksum review; do not reinterpret historical responses.

## What people actually consent to

The proposed form would request both (a) **beta/editorial invitations and reading opportunities** and (b) **occasional development or release updates** for the same series newsletter. It does not say the editor list is a separate editorial-only mailing list. Do not add unrelated marketing or partner broadcasts without separate authorization. If an editorial-only list becomes necessary, use an independently controlled subscriber audience and revise the wording/registration flow before claiming separation.

- Editorial selection/outreach: target `beta-editor-interest` **and confirmed/active** subscribers only. Send private reading material only after manual approval through the existing authoring/editorial process, never by tagging or auto-subscription.
- Series release mail: target only the subscriber population whose recorded consent actually covers series news; exclude unsubscribed/unactivated recipients.
- Retagged existing subscribers: verify prior consent, metadata preservation, and whether resubmitting replays confirmation. Do not assume tagged addresses were previously authorized for every purpose.
- Do not copy subscriber emails, consent data, mail logs, manuscripts, or replies into this public repository, public GitHub issues, or screenshots.
- Honor unsubscribe and suppression across both audience types. Do not use the interest list to contact people who have withdrawn consent.

## Production acceptance checklist

- [ ] Confirm Buttondown plan permits tags and verify the tag's spelling.
- [ ] Configure and verify that `metadata__beta_editor_opt_in` is persisted with value `eoa-beta-editors-v1-2026-10-22` for a test subscriber. Check new confirmed signups and returning subscribers, including timestamps/status, and confirm the existing subscriber's other tags remain.
- [ ] Confirm consent and confirmation records can demonstrate who opted in, when, for which version/purpose, and that a withdrawal can be honored. Store evidence privately and define appropriate retention.
- [ ] **CASL identification gate:** before publicly collecting signups for promotional emails, provide a valid current *postal mailing address* and a contact channel in the request for consent and outgoing email footer, verify sender identity (Ryan Jennings), and check the live page wording against the actual provider flow. An email address or web URL alone does **not** substitute for the postal address. Do not invent or publish an author's private residential address; select an authorized business/PO box mailing address and obtain approval before updating approved copy.
- [ ] Verify Buttondown mails expose a functional unsubscribe mechanism and that unsubscribe takes effect; verify any sender/physical-address configuration in Buttondown as well as the public request.
- [ ] Verify mobile/desktop submission, confirmation, invalid email, and existing subscriber semantics with **controlled addresses**, sanitized evidence only.
- [ ] Perform independent review and receiving-main deployment verification. Do not activate registration until all gates are met; the informational-only page may be deployed separately.

The public form's browser tests intercept submissions: they do **not** create real Buttondown subscribers. Track provider acceptance in public issue #166 without revealing personal data.

## Source references

- https://docs.buttondown.com/building-your-subscriber-base — native embed endpoint and `metadata__<key>` inputs
- https://docs.buttondown.com/tags — additive tags, Basic-plan availability
- https://docs.buttondown.com/double-opt-in — confirmation default
- https://crtc.gc.ca/eng/com500/faq500.htm — consent, identification, unsubscribe and record-keeping
- https://crtc.gc.ca/eng/archive/2012/2012-548.htm — request-for-consent postal address and consent auditability
