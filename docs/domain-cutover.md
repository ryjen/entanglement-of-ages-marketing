# Domain Cutover — Entanglement of Ages

## Canonical public domain

The canonical public-domain target for **Entanglement of Ages** is:

- `https://entanglementofages.com/`

This is the series-level public identity for canonical metadata, feeds, sitemaps, social previews, structured data, and external links.

## Cutover contract

The production-domain migration is considered complete only when:

1. DNS and TLS are provisioned for the canonical host;
2. GitHub Pages is configured with `entanglementofages.com` as its custom domain;
3. canonical URLs, sitemap, feed, robots metadata, and absolute public links use the canonical host;
4. the previous series subdomain remains recoverable or redirects cleanly without becoming a competing canonical origin;
5. Cloudflare/GitHub Pages origin identity and HTTPS are verified;
6. repository homepage metadata and relevant external profiles use the canonical host;
7. regression tests prevent mixed canonical origins from returning.

The public marketing repository remains independent of the private authoring repository throughout the transition. The private repository may reference the public site only through governed reader/release metadata.
