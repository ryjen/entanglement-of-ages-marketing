# Canonical Domain Cutover Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make `https://entanglementofages.com/` the sole canonical series hostname across the public marketing repository and synchronize the private series metadata.

**Architecture:** Treat the hostname as a governed publication invariant rather than a cosmetic search/replace. Add a repository-wide regression guard, update every tracked public URL and Pages `CNAME`, refresh manifest checksums for changed governed artifacts, then synchronize the private release metadata and public-domain governance record in a separate coordinated PR.

**Tech Stack:** Static HTML/XML/text, Node.js contract tests, GitHub Pages, `public-manifest.json`, GitHub Actions.

**Spec:** GitHub issue `ryjen/entanglement-of-ages-marketing#129`.

## Global Constraints

- Canonical origin is `https://entanglementofages.com`.
- GitHub Pages `CNAME` is `entanglementofages.com`.
- No tracked marketing-repository file may retain the legacy public hostname.
- Manifest-backed files must keep exact SHA-256 checksums coherent after URL changes.
- The private series repository must use the same canonical URLs in public-domain governance and reader release metadata.
- Full marketing `mise run check` and deployment verification must pass before merge.

---

### Task 1: Add the canonical-host regression contract

**Files:**
- Create: `tests/domain-origin.test.mjs`

- [ ] Add a test that scans all Git-tracked files and reports any legacy-host occurrence without embedding that hostname literally in the test source.
- [ ] Assert `CNAME` is exactly `entanglementofages.com`.
- [ ] Run contract CI and verify RED on the current site state.

### Task 2: Cut over the public marketing repository

**Files:**
- Modify: `CNAME`
- Modify: `src/**/*.html`, `src/feed.xml`, `src/sitemap.xml`, `src/robots.txt`
- Modify: `tools/validate-canonical-origin.mjs`
- Modify: deployment/domain documentation containing the old origin
- Modify: `public-manifest.json`

- [ ] Replace the legacy hostname with `entanglementofages.com` in every tracked file except the regression test, which constructs the legacy value at runtime.
- [ ] Refresh exact SHA-256 entries for every changed manifest-backed artifact.
- [ ] Verify zero literal legacy-host matches remain in tracked files.
- [ ] Run the complete public-site gate and browser tests.

### Task 3: Synchronize the private series repository

**Files:**
- Modify: `governance/public-domain.md`
- Modify: `books/readers/release-metadata.toml`

- [ ] Replace all public canonical URLs with the new domain.
- [ ] Verify no legacy-host references remain in tracked private-repo files.
- [ ] Run the repository's relevant metadata/tests gate.

### Task 4: Integrate and verify deployment

- [ ] Open coordinated PRs in both repositories and link them to marketing issue #129.
- [ ] Require green CI on the marketing PR and private-repo PR.
- [ ] Merge the private metadata synchronization and public site cutover in a controlled sequence.
- [ ] Verify `https://entanglementofages.com/`, `/adaptation/`, feed, sitemap, canonical tags, and GitHub Pages deployment after merge.
- [ ] Close #129 only after deployed HTTPS verification succeeds.
