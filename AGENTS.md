# SUBCULT website and Studio

Read `/home/onnwee/.codex/RTK.md` and `/home/onnwee/.homelab/HOMELAB.md` before workspace work. Prefix shell commands with `rtk`. Apply the unslop skill to user-facing prose and documentation.

This repository is private. The root owns the public website, authenticated admin interface and Go API. `studio/` owns production sources: branding, media, references, social/Patreon content and preparation automation. Read `studio/AGENTS.md` before changing those sources.

Public assets require an explicit selection and source hashes. Keep `studio/`, private bundles, credentials and runtime state out of frontend build contexts and public output. Preserve the authenticated catalog and asset allowlist.

Preserve unrelated edits and active worktrees. The repository consolidation does not deploy the website or activate preparation jobs. Follow `docs/REPOSITORY-CONSOLIDATION.md` before switching consumers or retiring the old repository.

Run checks relevant to the changed components. Studio checks are `make check-studio check-studio-automation`. `make -C studio check-cutover` checks installed Kvant consumers after activation; it is not a portable CI check.

<!-- managed-project-skills:start -->
Studio (`studio/`) owns brand masters, content and preparation automation; each product repository owns its implementation and technical claims; the SUBCULT vault owns planning. `.agent-skills.json` records the generated selection.
For writing or reviewing social posts, captions, devlog entries, Patreon editions, supporter or product copy, or tuning the drafting prompts, read `.agents/skills/social-craft/SKILL.md`.
For selecting or refining a design system and producing its brand guides, tokens or asset pack, read `.agents/skills/studio-brand-system/SKILL.md`. Studio references are available at https://subcult.tv/admin/studio/references and in `studio/references/`.
For creating or cataloging design reference studies, read `.agents/skills/studio-reference-study/SKILL.md`. For comparing products and exports with selected brand rules, read `.agents/skills/studio-brand-audit/SKILL.md`. For preparing or integrating selected assets into a product, read `.agents/skills/studio-brand-handoff/SKILL.md`.
<!-- managed-project-skills:end -->
