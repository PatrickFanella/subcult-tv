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
goal-publish-date:
hard-due-date:
publish-target:
related-resources:
soft-due-date:
stage: seed
threads:
title: Omarchy Super Productivity Plugin
work-type: social-post
---

[[001 Projects/Works/Works Index|← Works Index]] • [[001 Projects/Works/Social Posts/Social Posts Workbench|Social Posts Workbench]] • [[Home]]

---
## Patreon post

### I built a Super Productivity plugin for Omarchy

I use Super Productivity for planning, but I wanted the task I was working on to stay visible without keeping the app open.

So I built **Super Productivity for Omarchy**, a top-bar plugin that connects to Super Productivity's local REST API.

It shows the current task, tracks the countdown, and turns the timer into overtime when the estimate runs out. When no task is active, the bar shows the next scheduled task and its start time.

Open the panel to:

- Browse today's tasks in chronological order
- Expand parent tasks and subtasks
- Start or complete a task
- Stop tracking or extend the current estimate
- Add tasks with Super Productivity shorthand
- Enable "Add & switch" when creating a task
- Configure scheduled alerts, timer alerts, sounds, and volume
- Navigate the full interface with the keyboard

Parent rows only reveal their subtasks. Tracking starts from the explicit **Start** button, which prevents accidental switches.

The plugin also handles some awkward Super Productivity behavior around completed subtasks. If Super Productivity promotes the parent after a subtask completes, the plugin either starts the next eligible sibling or safely clears the promoted parent.

### Install it

```bash
omarchy plugin add https://github.com/patrickfanella/omarchy-superproductivity.git --enable
```

You need:

- Omarchy with Shell plugins
- The Super Productivity desktop app
- Its local REST API enabled
- Python 3.10 or newer

The project is open source under the MIT license.

Repository:

https://github.com/PatrickFanella/omarchy-superproductivity

I have also submitted it to the Omarchy plugin marketplace and requested consideration for Super Productivity's community integrations list.

If you use both Omarchy and Super Productivity, try it and tell me where the workflow still feels rough.

**Suggested media:** `assets/demo.gif`, followed by `assets/screenshots/live-panel.png`

---

## Instagram post

I wanted my current Super Productivity task visible without keeping the app open, so I built an Omarchy top-bar plugin.

It shows:

• Current task and countdown  
• Overtime after the estimate expires  
• Next scheduled task  
• Chronological Today list  
• Parent tasks and subtasks  
• Start, Complete, Stop, and Extend controls  
• Quick Add with Super Productivity shorthand  
• Scheduled and timer alerts with custom sound and volume  

Parent rows only reveal more information. A task starts only when you press its Start button.

It connects through Super Productivity's local REST API and runs entirely on the local machine.

GitHub: `PatrickFanella/omarchy-superproductivity`

Install:

`omarchy plugin add https://github.com/patrickfanella/omarchy-superproductivity.git --enable`

#Omarchy #SuperProductivity #LinuxDesktop #OpenSource #ProductivityTools #Hyprland

**Suggested media:** `assets/screenshots/live-panel.png`

---

## Twitter/X post

I built a Super Productivity plugin for the Omarchy top bar.

Current-task countdown, overtime, scheduled alerts, chronological Today tasks, subtasks, Quick Add, keyboard controls, and local REST API integration.

MIT licensed:

https://github.com/PatrickFanella/omarchy-superproductivity

**Suggested media:** `assets/demo.gif`

---

## Twitter/X thread

**1/8**

I wanted my current Super Productivity task visible without keeping the app open.

So I built an Omarchy top-bar plugin that connects to Super Productivity's local REST API.

https://github.com/PatrickFanella/omarchy-superproductivity

**2/8**

The bar shows the current task and its remaining estimate.

When the estimate runs out, the timer switches to signed overtime instead of sitting at zero.

If nothing is active, it shows the next scheduled task and start time.

**3/8**

The panel includes a chronological Today list.

Scheduled tasks appear first. Parent tasks stay grouped with their subtasks, and orphaned tasks remain visible instead of disappearing.

**4/8**

You can start, stop, complete, and extend tasks without opening Super Productivity.

Parent rows only expand or collapse. Tracking starts exclusively through the Start button, which prevents accidental task switches.

**5/8**

Quick Add supports Super Productivity shorthand:

`Write report 30m +Work #focus @tomorrow`

A persistent Add & switch checkbox controls whether the new task becomes active immediately.

**6/8**

Alerts work for timer expiry and scheduled starts.

You can configure the sound, volume, urgency, and whether alerts run at all. Scheduled alerts still fire while another unrelated task is active.

**7/8**

The full panel is keyboard accessible.

Tab through controls, use J/K or arrow keys for tasks, C to complete, `/` to search, Home to return to the top, and Escape to close.

**8/8**

Install it with:

`omarchy plugin add https://github.com/patrickfanella/omarchy-superproductivity.git --enable`

Requirements: Omarchy, the Super Productivity desktop app, its local REST API, and Python 3.10+.

MIT licensed and open source.
