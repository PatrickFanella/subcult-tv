---
type: work
status: draft
created: 2026-08-27
updated: 2026-09-03
tags:
- domain/content
- topic/omarchy
- topic/plugin-release
- draft
goal-publish-date: null
hard-due-date: null
publish-target: null
related-resources: null
soft-due-date: null
stage: seed
threads: null
title: Omarchy Shelfish Plugin
work-type: social-post
---

[[001 Projects/Works/Works Index|← Works Index]] • [[001 Projects/Works/Social Posts/Social Posts Workbench|Social Posts Workbench]] • [[Home]]

---
## Patreon post

### I built Shelfish for the Omarchy bar

I like plugin containers in principle. In practice, widgets inside one stopped behaving like normal Omarchy plugins.

Some looked inactive to other plugins. Some lost interactions. Popups and text fields could behave differently, because the container loaded another copy of the widget and ignored the instance already in the bar.

So I built Shelfish.

Shelfish organizes existing Omarchy bar widgets into collapsible groups. It keeps each widget's original instance alive, along with its settings, state, popup behavior, and plugin identity.

You can:

- Create named groups.
- Pick an icon for each group.
- Set the order of groups and their members.
- Reveal widgets to the left or right of the group icon.
- Add a Shelfish settings shortcut to a group.
- Automatically reveal a group when an explicitly configured status changes.

It took more care than I expected. Moving QML objects between containers broke anchored widgets, so Shelfish groups the original bar entries. That keeps native behavior and keeps third-party widgets compatible.

Wayland keyboard focus needed a fix too. The first settings panel looked focused, but keystrokes sometimes went to the application behind it. Shelfish now uses Omarchy's keyboard-aware panel component, and I verified it by creating a group through synthetic Wayland input.

The latest security pass tightened two more boundaries:

- Third-party plugin and group names always render as plain text.
- Cross-plugin status polling accepts only small scalar values and enforces limits on paths, depth, strings, and total snapshot size.

Shelfish is open source under the MIT license.

Repository:  
https://github.com/PatrickFanella/omarchy-plugin-shelfish

Install:

```bash
omarchy plugin add https://github.com/PatrickFanella/omarchy-plugin-shelfish.git --enable
```

The current release is `v1.0.6`. Its Omarchy Plugins marketplace submission is still under review.

---

## Instagram post

My Omarchy bar got crowded, so I built Shelfish.

It puts the widgets already in your bar into collapsible groups without recreating them. Their state, popups, settings, and native interactions keep working.

Each group gets a name and icon, its own widget order, a left or right reveal direction, and an optional shortcut to Shelfish settings. The settings UI has an icon grid and a two-column plugin manager.

It's open source and on GitHub now. The Omarchy Plugins listing is under review.

Link in bio, or search for:

`patrickfanella/omarchy-plugin-shelfish`

#Omarchy #Quickshell #Hyprland

---

## Twitter/X post

Shelfish is an Omarchy plugin I wrote to fold bar widgets into collapsible groups. It groups the widgets already in your bar and doesn't load copies, so their popups and state keep working. MIT licensed:

https://github.com/PatrickFanella/omarchy-plugin-shelfish

---

## Twitter/X thread

**1/6**

I built Shelfish because my Omarchy bar was crowded, and the container approaches I tried changed how some plugins behaved.

Shelfish groups the original bar widgets. It doesn't load duplicate copies.

https://github.com/PatrickFanella/omarchy-plugin-shelfish

**2/6**

Because it's the same instance, each widget keeps its:

• Plugin identity  
• Runtime state  
• Settings  
• Popup behavior  
• Click and keyboard interactions  

Other plugins still see it as an active Omarchy widget.

**3/6**

Every Shelfish group has a configurable name and icon.

You can order the groups, order the widgets inside each group, and choose whether the widgets appear to the left or right when revealed.

**4/6**

The settings panel has an icon grid and a two-column manager.

Available plugins are on the left. Members of the selected group are on the right, with controls for ordering and removal.

**5/6**

There's also a settings shortcut you can put in a group.

The real manager stays a stable Omarchy bar entry. The shortcut opens the same settings panel without duplicating the service.

**6/6**

The latest release hardens third-party boundaries: plugin names render as plain text, and status polling accepts only bounded scalar values.

Shelfish is MIT licensed. Install it with:

`omarchy plugin add https://github.com/PatrickFanella/omarchy-plugin-shelfish.git --enable`

Marketplace listing link, found pasted into 6/6. The Patreon and Instagram drafts say the listing is still under review, so confirm it is live before adding it to the thread:

https://omarchyplugins.com/plugin.html?id=io.github.patrickfanella.shelfish
