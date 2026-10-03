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

I plan in Super Productivity, and I wanted the task I'm on to stay visible without keeping the app open.

So I built **Super Productivity for Omarchy**, a top-bar plugin that connects to Super Productivity's local REST API.

The bar shows the current task and counts down its estimate. When the estimate runs out, the timer goes into overtime. When no task is active, the bar shows the next scheduled task and its start time.

Open the panel to:

- Browse today's tasks in chronological order
- Expand parent tasks and subtasks
- Start or complete a task
- Stop tracking or extend the current estimate
- Add tasks with Super Productivity shorthand
- Enable "Add & switch" when creating a task
- Configure scheduled alerts, timer alerts, sounds, and volume
- Navigate the full interface with the keyboard

Parent rows only reveal their subtasks. Tracking starts from the explicit **Start** button, so you can't switch tasks by accident.

The plugin also handles an awkward bit of Super Productivity behavior around completed subtasks. If Super Productivity promotes the parent after a subtask completes, the plugin either starts the next eligible sibling or safely clears the promoted parent.

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

I've submitted it to the Omarchy plugin marketplace and asked for it to be considered for Super Productivity's community integrations list.

If you use both Omarchy and Super Productivity, try it and tell me where it still feels rough.

**Suggested media:** `assets/demo.gif`, followed by `assets/screenshots/live-panel.png`

---

## Instagram post

I wanted my current Super Productivity task on screen without keeping the app open, so I built an Omarchy top-bar plugin for it.

In the bar: the current task and its countdown, overtime after the estimate expires, or the next scheduled task when nothing is running.

In the panel:

• Chronological Today list  
• Parent tasks and subtasks  
• Start, Complete, Stop, and Extend controls  
• Quick Add with Super Productivity shorthand  
• Scheduled and timer alerts with custom sound and volume  

Parent rows only show more. A task starts only when you press its Start button.

It connects through Super Productivity's local REST API and runs entirely on the local machine.

GitHub: `PatrickFanella/omarchy-superproductivity`

Install:

`omarchy plugin add https://github.com/patrickfanella/omarchy-superproductivity.git --enable`

#Omarchy #SuperProductivity #Hyprland

**Suggested media:** `assets/screenshots/live-panel.png`

---

## Twitter/X post

New Omarchy plugin: your current Super Productivity task in the top bar. It counts down the estimate, goes into overtime when you run past it, and lists today's tasks in a keyboard-driven panel. MIT licensed:

https://github.com/PatrickFanella/omarchy-superproductivity

**Suggested media:** `assets/demo.gif`

---

## Twitter/X thread

**1/8**

My Super Productivity task list lives in an app I don't keep open. I wanted the current task visible anyway.

So I built an Omarchy top-bar plugin that connects to Super Productivity's local REST API.

https://github.com/PatrickFanella/omarchy-superproductivity

**2/8**

The bar shows the current task and how much of its estimate is left.

When the estimate runs out, the timer switches to signed overtime. It doesn't sit at zero.

If nothing is active, it shows the next scheduled task and start time.

**3/8**

The panel lists today's tasks in chronological order.

Scheduled tasks come first. Parent tasks stay grouped with their subtasks, and orphaned tasks stay visible.

**4/8**

You can start, stop, complete, and extend tasks without opening Super Productivity.

Parent rows only expand or collapse. Tracking starts only from the Start button, so there are no accidental task switches.

**5/8**

Quick Add takes Super Productivity shorthand:

`Write report 30m +Work #focus @tomorrow`

A persistent Add & switch checkbox decides whether the new task becomes active right away.

**6/8**

Alerts fire on timer expiry and on scheduled starts.

You can set the sound, volume, and urgency, or turn alerts off. Scheduled alerts still fire while another unrelated task is active.

**7/8**

The whole panel works from the keyboard.

Tab through controls, use J/K or arrow keys for tasks, C to complete, `/` to search, Home to return to the top, and Escape to close.

**8/8**

Install it with:

`omarchy plugin add https://github.com/patrickfanella/omarchy-superproductivity.git --enable`

Requirements: Omarchy, the Super Productivity desktop app, its local REST API, and Python 3.10+.

MIT licensed and open source.
