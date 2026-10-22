# Cloudflare Pages branch preview

This repository's **only production** deployment is GitHub Pages from validated `main`. Cloudflare Pages is an independent, preview-only surface; do not attach `entanglementofages.com` or enable Cloudflare production-branch deployments.

## Cloudflare project

- Project: `entanglement-of-ages-preview` (Cloudflare Pages, connected to GitHub `ryjen/entanglement-of-ages-marketing`). Its assigned project subdomain is `entanglement-of-ages-preview.pages.dev`; **this is not the branch preview URL**. Obtain the actual deployment URL from Cloudflare deployment evidence.
- Production branch: `main`, with `production_deployments_enabled=false`.
- Preview branches: **custom include** `feat/beta-editor-interest-signup-20261022`; other branch deployments disabled. Preview deployment URL is assigned by Cloudflare; record the actual URL from the deployment, never infer it.
- Build command: `npm install --no-package-lock --no-audit --no-fund && npm run build:preview`.
- Output directory: `dist`; build environment Node 24.
- Do not use GitHub-hosted Pages artifact as Cloudflare's source and do not add deploy secrets to the public repository.
- Cloudflare may not create an initial preview for an existing branch on project creation. Push a reviewed commit to the included branch to trigger the GitHub integration; then confirm the deployment environment is `preview` and the returned commit SHA matches the branch HEAD before advertising its URL.
- A preview URL is usable only when Cloudflare reports a successful deployment and a browser can verify the disabled forms and noindex header. Failed/stale deployment IDs are not preview links.

## Safety properties

`npm run build:preview` rebuilds and validates from the same approved manifest, then rewrites **built HTML only**: all three forms — the existing homepage newsletter, the News page newsletter, and the new beta-editor interest form retain their visual structure but lose working external submission actions, email input names and hidden fields. Controls are disabled and a visible preview-only notice appears. Any new external form action fails the build; exactly three reviewed signup forms must be found. The source/manifest and production build are unchanged. A deploy-only `_headers` adds `X-Robots-Tag: noindex, nofollow`; Cloudflare Pages also applies `noindex` on its preview URLs. These controls prevent this preview from becoming the unapproved Buttondown enrollment launch. They do not make the public preview URL secret.

Use Cloudflare Access for authenticated editorial previews if private material is *ever* proposed (not allowed by this public repo). The current preview contains approved public marketing assets only. Never treat `pages.dev` as the site's production origin or use it to send test subscriber data.

## Validation

Run `mise run check` for production-source CI, and separately `npm run build:preview` after installing dependencies to validate the Cloudflare build output. Check the preview URL for an inert form, no horizontal overflow, correct assets and `X-Robots-Tag`. Verify GitHub Pages on `main` was not changed.

Provider tag/metadata, postal address, consent retention, and unsubscribe remain gated by issue #166 before any live production signup launch.
