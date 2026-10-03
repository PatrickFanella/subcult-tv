# SUBCULT / Studio for Gitea

A dark Gitea theme based on Studio's selected **Culture / poster press** system and subcult.tv: purple fields, acid-green actions, straight borders and offset shadows. Oswald headlines, Space Grotesk body text and JetBrains Mono labels/code use locally served, licensed fonts. The carried-forward SUBCULT marks are copied byte-for-byte from Studio's outlined exports.

Purple is reserved for identity and the homepage field. Working surfaces remain dark. Diff additions and removals, warnings, errors and focus have distinct colors. Small text on purple uses dark ink; green-on-purple is avoided for text. Markdown heading styles, avatar circles and custom issue-label colors remain under Gitea/user control.

## Build

Run `python3 integrations/gitea/build.py` from the repository root. This creates `custom/`, a provenance record and `subcult-studio-gitea.zip`. No third-party Python packages are needed. Edit `theme.css`, then rebuild; the generated theme includes the pinned Gitea 1.27.3 dark baseline, so missing semantic tokens retain their upstream definitions. Its MIT license is included alongside font licenses. The zip contains only the selected assets, CSS, instructions and provenance.

Run `python3 integrations/gitea/audit.py` after building to check selected asset hashes, SVG parsing, CSS asset paths, archive contents and text/background contrast. See `verification.md` for the browser checks and their limits.

## Install on our Gitea

The observed October 2 deployment runs Gitea 1.27.3 on Almaz. Its host custom directory is `/mnt/spektr/server/dev/data/gitea/gitea`, mounted as `/data/gitea`. The existing theme is `subcult-theme`; this package has a separate name, `subcult-studio`.

1. Preserve `conf/app.ini` and any existing `public/assets/css/theme-subcult-studio.css` and `public/assets/subcult-studio/` before installation.
2. Copy the contents of this package's `custom/` into that custom directory, preserving Gitea's file ownership and read access.
3. Add `subcult-studio` to `[ui] THEMES`. To use it as the site default, set `DEFAULT_THEME = subcult-studio`. Keep the previous theme and built-in themes in the list.
4. Restart Gitea for the configuration change, then select **SUBCULT / Studio** in the appearance settings for accounts that have a saved preference. Reload pages to load the stylesheet.

Configuration changes need a restart. Subsequent CSS edits may require a cache refresh. Default-theme selection does not override existing user preferences. Rollback: restore the saved config, restart, and remove only this package's files once no account is using it.

## Review locally

Run `python3 integrations/gitea/preview.py --upstream http://GITEA_CONTAINER_IP:3000`. Open `http://127.0.0.1:18771/`. The loopback preview reads anonymous pages/assets from Gitea and substitutes this theme. It does not forward cookies, authorization headers or mutations. It does not reproduce authenticated dashboards or editor workflows. `/__subcult/specimen` contains explicitly marked synthetic control/diff specimens. Stop with Ctrl-C.

Check the homepage, Explore, a public repository/README, a code file, a commit diff, sign-in, dropdowns and mobile navigation. Verify fonts, keyboard focus, contrast, overflow and errors. CSS selectors and the pinned baseline should be reviewed when upgrading Gitea. No templates or JavaScript are required for installation.
