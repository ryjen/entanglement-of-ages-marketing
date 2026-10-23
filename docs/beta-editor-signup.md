# Beta editors: direct-email intake

The public site is informational; the beta editor page provides a mailto action to info@ryanjennin.gs with a suggested application outline. This is not a form, Buttondown signup, Google Forms application, Worker, or newsletter enrollment. No application records or passwords are stored by the website.

## Applicant experience

1. Open /beta/editors/; select Compose beta-editor application to open the local email client.
2. The draft includes a subject and prompts for books, feedback type, optional availability and introduction.
3. The visitor reviews and explicitly sends the email. A mailto link cannot confirm delivery or submission.
4. If an email client is not configured, the page provides the destination address and subject for manual copying.
5. Only author-approved invitees are offered private manuscript access or feedback packages.

## Invited reader access (separate from applications)

Some selected readers may receive a per-title **Google Play Books Content Reviewer** grant rather than a manuscript attachment. The invitation is manual and the reader must use the exact invited Google Account to find the full book in the [Google Play Books library](https://play.google.com/books) (or Play Books app). The **Google Books** search library is a different surface: an empty “All books” list there is not evidence that the Play Books grant failed.

If a title is missing, ask the reader privately to check the account they signed in with, then verify that the correct title has the reader's account under Partner Center **Book Catalog → title → Content → Content Reviewers**, that the change was saved, and that content processed successfully. Google's [reviewer requirements](https://support.google.com/books/partner/answer/3156893) include account/country eligibility and the requirement that the book not already be in the reviewer's library. Do not publish a book or enable sales simply to debug reviewer access.

This optional delivery method **does not** change the public email-only application route, grant access automatically, or create a reviewer-address registry. Avoid disclosing reader identities, invitation lists, manuscripts, or replies in the public repo or on the site.

## Privacy and operations

- Applications arrive in the existing email mailbox and inherit that provider's storage, retention and access protections. Never copy applicant records into public issues, PRs, web analytics, logs, marketing subscribers or the public repo.
- Respond privately only about editorial participation. Do not import applicants into Buttondown, send unsolicited release or marketing updates, or treat an enquiry as newsletter consent.
- Request minimal information: book(s), kind of feedback; optional availability and brief context. Discourage attachments, private manuscripts and sensitive information.
- Handle withdrawal or deletion requests in private email and respect the request across copies and onward correspondence.
- An editorial application is not manuscript approval; all permissions are granted manually.
- The existing Free-plan Buttondown newsletter remains separate. The Homepage and News consent/sender-information audit is still open and is not resolved by email intake.
- The mailto flow has no server-side delivery audit and cannot prove an applicant sent email.
- No hosting changes, Cloudflare project, D1, Worker, Google Form, secret, paid service or database is required.

## Validation

Run mise run check. The browser acceptance checks validate the mailto destination and subject, zero HTML forms or submission handlers, correct book order, keyboard navigation and mobile layout.
