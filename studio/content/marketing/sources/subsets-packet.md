# Subsets copy packet

Draft copy grounded in [claims S1–S10](context.md). The existing brand headline remains the main campaign line. This is an introduction to the alpha, not a claim of a new release produced by this task.

## Product brief

**All your skills. Only the set you need.**

Your agent skills are a collection. A writing task and a backend change need different parts of it.

Subsets helps you find the skills on your computer, organize them into groups, and preview the set before applying it. You choose which eligible folders it may manage. Inactive skills stay in a private library, and transactions keep a checked route back.

Use the terminal interface to explore the collection, or use the command line for the same workflow. The native alpha requires Node.js 22 or newer. Linux is tested; macOS remains unverified and Windows is unsupported.

Explore Subsets: https://subsets.subcult.tv

Made by SUBCULT. Source is licensed under AGPL-3.0-only.

## Landing copy proposal

**Headline:** All your skills. Only the set you need.

**Supporting line:** Find your agent skills, group them for the work, and preview the set before applying it.

**Primary action:** Explore Subsets

**Find your collection.** See skills in supported folders, with locations and owners visible.

**Make a set for the task.** Keep everyday essentials in core, then combine groups for writing, research, or development.

**Check before applying.** Review the selection and explicitly adopt eligible folders before Subsets manages them.

**Keep a way back.** Inactive skills stay in a private library. Transaction records support checked rollback and preserve later edits by refusing a conflicting recovery.

**Practical detail:** Native npm alpha. Node.js 22+. Linux tested. Start a fresh agent session after changing a set.

## Descriptions

**Profile bio:** Choose the agent skills for the job. Discover, group, preview, and apply from your terminal. Native alpha by SUBCULT. subsets.subcult.tv

**Directory description:** Subsets is a terminal tool for managing local agent skill collections. Discover supported folders, organize skills into groups, preview changes, and apply a selection to explicitly adopted folders, with transaction records for checked rollback.

**Page title candidate:** Subsets — Choose your agent skill set

**Meta description candidate:** Find agent skills on your computer, organize them into groups, and preview a set before applying it. A terminal tool by SUBCULT.

## FAQ

**Does Subsets write skills?** It organizes the collection you have. It does not rewrite instructions or execute skill scripts.

**Does discovery show what my agent loaded?** It shows files on disk. Start a fresh agent session after applying a different set and check that client's discovery separately.

**Will it take over every skill folder?** You explicitly adopt eligible folders. Package, plugin, and installer-owned folders retain their owners.

**Can I undo an applied set?** Transactions support checked rollback. If files changed after the recorded state, recovery refuses the conflicting change so you can inspect it.

**What do I need?** The native alpha requires Node.js 22 or newer. Its standalone workflow needs no Python; the existing codex-skills adapter uses Python helpers. The TUI needs an interactive terminal.

**Which platforms are supported?** Linux is tested. macOS remains unverified; Windows is unsupported by this alpha.

**Where is it available?** The scoped package is `@subcult/subsets`. Public npm metadata was checked October 19, with the alpha tag at `0.2.0-alpha.3`. Verify current availability before publishing an installation-specific post.

**Does it sync my devices?** Automatic device synchronization is not a supported claim in this packet. Deployment of the shared skills and reading copies is managed separately.

## Social copy

**Introduction:**

> A writing task and a backend change need different parts of your agent skill collection.
>
> Subsets helps you group the skills, preview the set, and apply it to folders you choose to manage.
>
> Native alpha by SUBCULT: https://subsets.subcult.tv

**Preview angle:**

> What changes when you switch skill sets?
>
> Subsets shows the plan before you apply it. Keep the everyday essentials, add the group for this job, and start a fresh agent session.
>
> https://subsets.subcult.tv

**Four-post demo thread:**

1. All your skills. Only the set you need. Subsets helps you discover agent skills, group them, and preview a selection from your terminal. https://subsets.subcult.tv
2. Make a group from skills in your collection. Combine it with core, then inspect the preview before applying it.
3. You explicitly adopt eligible folders. Inactive skills stay in a private library, and transactions support checked rollback.
4. The native alpha needs Node 22+. Linux is tested; macOS remains unverified. Start a fresh agent session after changing sets. What would go in your first group?

Attach a completed real-workflow demo to the first post. Keep the account, link, media crop, and final composer limits in the publication review.

## Community introduction

**Title:** We made a terminal tool for choosing sets from your agent skill collection

> I'm part of SUBCULT, and we've been working on Subsets.
>
> It finds local agent skills, lets you organize groups, and previews a selection before applying it to folders you explicitly adopt. Inactive skills stay in a private library, with transactions for checked rollback.
>
> The native alpha requires Node 22+. Linux is tested; macOS remains unverified. It doesn't rewrite skills or determine whether a skill is good for your agent.
>
> I'm interested in how you organize a collection: stable sets by project, sets by task, or something else?
>
> https://subsets.subcult.tv

Use only in a community that permits project introductions. Disclose the builder connection and adapt the question to the existing discussion.

## Newsletter block

**Subject:** A smaller set for the next task

> A growing skill collection is useful until choosing what to load becomes its own chore.
>
> Subsets lets you group local agent skills, preview a selection, and apply it to folders you choose to manage. Keep everyday essentials in core and add a set for the work ahead.
>
> Explore the native alpha: https://subsets.subcult.tv

## Personal outreach draft

**Subject:** How do you organize your agent skills?

> Hi {{name}},
>
> {{Specific, verified reason their workflow is relevant.}}
>
> I'm part of SUBCULT. We built Subsets to organize local agent skills into groups and preview a selection before applying it.
>
> Would you be open to trying the alpha against a disposable skill folder and telling us where the selection workflow gets confusing?
>
> https://subsets.subcult.tv
>
> {{sender}}

This is an unsent draft. Personalize it and use an authorized outreach process.

## Technical post installation block

To select public npm for the Subcult scope, then install the alpha:

```sh
npm config set @subcult:registry https://registry.npmjs.org/
npm install -g @subcult/subsets@alpha
subsets --version
subsets roots
```

The first command updates the saved registry for the Subcult scope; keep an existing hosted-registry configuration if that is the intended source. A version response establishes the selected executable, not qualification of the apply/rollback workflow.

## 45-second demonstration brief

Goal: show a deliberate set change and a checked way back. Use disposable fixtures, an isolated registry, and ordinary skill names actually present in that fixture. Record the package version and terminal dimensions.

| Time | Actual capture | Narration/caption |
| --- | --- | --- |
| 0–5 s | A short skill collection in the terminal | “All your skills. Only the set you need.” |
| 5–13 s | Inspect folder ownership; adopt an eligible disposable folder | “Choose the folder Subsets may manage.” |
| 13–22 s | Create a group from the fixture's real skills | “Make a set for the next task.” |
| 22–30 s | Preview the intended selection | “Check the plan before applying it.” |
| 30–38 s | Apply and verify; show inactive skills retained | “Keep the rest in the library.” |
| 38–43 s | Show transaction history and successful rollback | “A recorded change. A checked way back.” |
| 43–45 s | Existing Studio end card or approved lockup | “Subsets by SUBCULT. subsets.subcult.tv” |

This is a storyboard, not a completed recording. Use the selected-tile mark and existing Personal Utility layouts. Keep commands legible at phone size, add captions, and write alt text from the finished frames. Show no private paths, account credentials, or unrelated skill contents.
