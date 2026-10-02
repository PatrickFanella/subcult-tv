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

I liked the idea behind plugin containers, but I kept running into one problem: widgets inside a container stopped behaving like normal Omarchy plugins.

Some appeared inactive to other plugins. Some lost interactions. Popups and text fields could behave differently because the container loaded another copy of the widget instead of using its existing bar instance.

So I built Shelfish.

Shelfish organizes existing Omarchy bar widgets into collapsible groups. It keeps each widget’s original instance alive, along with its settings, state, popup behavior, and plugin identity.

You can:

- Create named groups.
- Pick an icon for each group.
- Set the order of groups and their members.
- Reveal widgets to the left or right of the group icon.
- Add a Shelfish settings shortcut to a group.
- Automatically reveal a group when an explicitly configured status changes.

The implementation ended up requiring more care than I expected. Moving QML objects between containers broke anchored widgets, so Shelfish now groups the original bar entries instead. That preserves native behavior and keeps third-party widgets compatible.

I also had to fix Wayland keyboard focus. The first settings panel looked focused, but keystrokes sometimes went to the application behind it. Shelfish now uses Omarchy’s keyboard-aware panel component, and I verified it by creating a group through synthetic Wayland input.

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

My Omarchy bar was getting crowded, so I built Shelfish.

Shelfish puts existing bar widgets into collapsible groups without recreating them. Their state, popups, settings, and native interactions stay intact.

Each group can have its own:

• Name and icon  
• Widget order  
• Left or right reveal direction  
• Shelfish settings shortcut  

The settings UI also includes an icon grid and two-column plugin manager.

Shelfish is open source and available now on GitHub. The Omarchy Plugins listing is under review.

Link in bio, or search for:

`patrickfanella/omarchy-plugin-shelfish`

#Omarchy #Quickshell #LinuxDesktop #OpenSource #Hyprland

---

## Twitter/X post

I built Shelfish, an Omarchy plugin that organizes bar widgets into collapsible groups without recreating them.

Pick group icons, order widgets, and reveal them left or right while preserving native popups and state.

MIT licensed:  
https://github.com/PatrickFanella/omarchy-plugin-shelfish

---

## Twitter/X thread

**1/6**

I built Shelfish because my Omarchy bar was crowded, and existing container approaches changed how some plugins behaved.

Shelfish groups the original bar widgets instead of loading duplicate copies.

https://github.com/PatrickFanella/omarchy-plugin-shelfish

**2/6**

That distinction matters.

Each widget keeps its original:

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

Available plugins appear on the left. Members of the selected group appear on the right, with controls for ordering and removal.

**5/6**

Shelfish also has a groupable settings shortcut.

The real manager remains a stable Omarchy bar entry. The shortcut can sit inside a group and open the same settings panel without duShelfish also has a groupable settings shortcut.

The real manager remains a stable Omarchy bar entry. The shortcut can sit inside a group and open the same settings panel without duplicating the service.plicating the service.

**6/6**

The latest release also hardens third-party boundaries.

Plugin names render as plain text, and status polling accepts only bounded scalar values.

https://omarchyplugins.com/plugin.html?id=io.github.patrickfanella.shelfish
Shelfish is MIT licensed. Install it with:

`omarchy plugin add https://github.com/PatrickFanella/omarchy-plugin-shelfish.git --enable`
