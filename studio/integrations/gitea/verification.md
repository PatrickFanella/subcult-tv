# Gitea theme verification — October 2, 2026

Authoring host: Almaz. Source: `/home/onnwee/Projects/subcult/subcult-studio`, branch `feat/subcult-gitea-theme`, base `acd4021582da3eacb35a06e1ac4436718b90f32d`. The integration is local uncommitted work. Branding masters and existing production assets were preserved.

Observed runtime: Gitea 1.27.3. The theme package is named `subcult-studio`; production was not changed. Browser review temporarily replaced CSS in the collaborative preview tab, with byte-identical font/mark assets embedded as data URLs. The installable CSS instead references same-origin packaged assets.

## Passed

- `python3 integrations/gitea/build.py`: generated CSS, selected fonts/marks/licenses, SHA-256 provenance and zip.
- `python3 integrations/gitea/audit.py`: eleven selected asset hashes, SVG XML parsing, CSS asset paths, archive selection and twenty-one contrast pairs. Lowest tested text contrast is 4.58:1 for dark ink on the brand purple. This is a selected-role audit, not a complete accessibility audit.
- Python compilation for the build, audit and preview utilities; whitespace checks for authored integration files.
- Loopback preview: twelve asset responses matched the packaged bytes; the synthetic specimen rendered HTML; a POST to the preview was rejected with 501 without forwarding to Gitea.
- Collaborative browser: Explore and the CLPR repository listing at desktop width; homepage and sign-in DOM/style checks; five font faces loaded on the repository/Explore view. The homepage used Oswald for its title. No horizontal overflow on these inspected desktop pages.
- Homepage at 390 × 844: no horizontal overflow. Mobile menu expanded after clicking its existing navigation toggle; its links stayed within the viewport.
- Repository Watch/Star/Fork controls: paper text on dark ink after correction, rather than inherited dark text on a dark button.
- Synthetic states: green, purple, red and yellow badges resolve to dark ink text. Clicking the specimen input produced the lavender focus border and a two-pixel focus outline. Primary, purple and destructive buttons resolved to the intended contrasting backgrounds/text.

## Limits

The browser redirected the attempted commit diff to sign-in. Authenticated dashboard, settings and editor workflows were not exercised. Code/diff colors were reviewed with explicit synthetic fixtures and contrast measurements; they are not evidence of a rendered authenticated diff.

Desktop screenshots were captured during early iterations. Subsequent screenshot calls failed in the T3 preview client even while navigation, evaluation and click tools remained functional, so those earlier images do not represent every final correction. Local port navigation from the collaborative browser also failed; packaged asset serving was verified on Almaz directly.

The local proxy was stopped after verification. The collaborative preview can retain the temporary CSS until navigation or reload; it does not persist changes to Gitea.
