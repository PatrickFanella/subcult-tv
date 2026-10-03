"""Tadooer's planner identity: vector masters for the shared pack builder.

Source: the Tadooer design system (docs/design/ in subculture-collective/productivity-suite)
and the mark in apps/web/public/suite-icon.svg. Surfaces and text are Catppuccin Mocha,
accents are Dracula, one meaning each. The day motif is a planner day: a time column, task
rows, one focus session, the now line and a calendar block. Row titles are placeholders.
"""
import subprocess
from PIL import ImageFont
import design_helpers as H

T, rect, line = H.txt, H.rect, H.line

# Tokens that the pack's five roles do not carry. Values from docs/design/tokens.css.
CRUST = '#11111b'
SURFACE_0 = '#252538'
LINE = '#2e2e44'
LINE_STRONG = '#3a3a54'
PINK = '#ff79c6'      # now: the current-time line and the running focus label
TEAL = '#94e2d5'      # calendar authority
TRACKING = '-0.015em' # wordmark and page titles
SAMPLE_ROWS = [       # placeholder titles; never real data
    ('Write the release notes', '25m · 10:00', True),
    ('Plan Thursday', 'Today', False),
    ('Review the week', '15m', False),
]

_widths = {}
def width(s, font, size, weight=400):
    key = (font, weight)
    if key not in _widths:
        _widths[key] = subprocess.check_output(['fc-match', '-f', '%{file}', font + ':weight=' + ('bold' if weight >= 600 else 'regular')]).decode()
    return ImageFont.truetype(_widths[key], int(size)).getlength(s)


def tint(accent, surface, amount=.14):
    """The design system's tinted fill: the accent at 13 to 14 percent over a surface, as a solid colour."""
    a = [int(accent[i:i + 2], 16) for i in (1, 3, 5)]; s = [int(surface[i:i + 2], 16) for i in (1, 3, 5)]
    return '#' + ''.join(f'{round(sv + (av - sv) * amount):02x}' for av, sv in zip(a, s))


def mark(d, x, y, size):
    """The suite icon: three list lines and a check in a purple disc on a rounded crust tile.

    Geometry is copied from apps/web/public/suite-icon.svg (512 units). Monochrome variants
    drop the tile, draw the disc as a ring and set the lines and check in ink.
    """
    mono = d.get('mono'); ink = d['fg']
    if mono:
        s = f'<path d="M132 154h248v44H132zm0 80h170v44H132zm0 80h248v44H132z" fill="{ink}"/>'
        s += f'<circle cx="350" cy="256" r="54" fill="{d["bg"]}" stroke="{ink}" stroke-width="18"/>'
        s += f'<path d="m327 256 16 17 33-39" fill="none" stroke="{ink}" stroke-width="18" stroke-linecap="round" stroke-linejoin="round"/>'
    else:
        s = f'<rect width="512" height="512" rx="112" fill="{CRUST}" stroke="{LINE_STRONG}" stroke-width="6"/>'
        s += f'<path d="M132 154h248v44H132zm0 80h170v44H132zm0 80h248v44H132z" fill="{d["safe_label"]}"/>'
        s += f'<circle cx="350" cy="256" r="54" fill="{d["accent"]}"/>'
        s += f'<path d="m327 256 16 17 33-39" fill="none" stroke="{CRUST}" stroke-width="18" stroke-linecap="round" stroke-linejoin="round"/>'
    return f'<g transform="translate({x} {y}) scale({size / 512})">{s}</g>'


def wordmark(d, x, y, maxw=730, size=91):
    """Tadooer in Inter bold with the page-title tracking. One capital; lowercase is for identifiers."""
    w = width('Tadooer', d['display'], size, 700) - size * .015 * 6
    if w > maxw:
        size = int(size * maxw / w)
    return T(x, y, 'Tadooer', size, d['fg'], d['display'], 700).replace('<text ', f'<text letter-spacing="{TRACKING}" ', 1)


def day(d, x, y, w, h):
    """A planner day: time column, task rows on surface-0, one purple focus session, the pink now line, a teal calendar block."""
    mono = d.get('mono'); ink = d['fg']; label = d['safe_label']
    purple = ink if mono else d['accent']; pink = ink if mono else PINK; teal = ink if mono else TEAL
    surface = 'none' if mono else SURFACE_0; border = ink if mono else LINE
    fs = max(11, min(h * .085, w / 26))        # row title size; narrow panels get smaller type
    mono_fs = fs * .78
    col = fs * 4.2                              # time column width
    s = rect(x, y, w, h, 'none' if mono else d['bg'], 0)
    hours = ['09:00', '10:00', '11:00', '12:00']
    step = h / len(hours)
    for i, t in enumerate(hours):
        yy = y + i * step
        s += T(x, yy + mono_fs * 1.05, t, mono_fs, label, d['label'])
        s += line(x + col, yy + mono_fs * .7, x + w, yy + mono_fs * .7, border, 1)
    # Task rows start on the 09:00 line and leave the 11:00 slot to the calendar block.
    rx = x + col; rw = w - col; gap = step * .07; rh = (step * 2 - gap * 4) / 3
    for i, (title, meta, focus) in enumerate(SAMPLE_ROWS):
        yy = y + mono_fs * .7 + gap + i * (rh + gap)
        s += rect(rx, yy, rw, rh, surface, min(8, rh * .18), purple if focus else border)
        if focus: s += rect(rx, yy, 3, rh, purple)
        box = rh * .36
        s += rect(rx + rh * .3, yy + (rh - box) / 2, box, box, 'none', box * .25, LINE_STRONG if not mono else ink)
        s += T(rx + rh * .3 + box + rh * .3, yy + rh * .5 + fs * .36, title, fs, ink, d['body'], 500 if focus else 400, maxw=rw * .58)
        mw = width(meta, d['label'], mono_fs)
        s += T(rx + rw - mw - rh * .3, yy + rh * .5 + mono_fs * .36, meta, mono_fs, pink if focus else label, d['label'])
    # The calendar block fills the 11:00 slot: teal tint, a teal bar and tabular mono metadata.
    cy = y + 2 * step + mono_fs * .7 + gap; ch = step - gap * 2
    s += rect(rx, cy, rw, ch, 'none' if mono else tint(TEAL, SURFACE_0), min(8, ch * .18), teal if mono else None)
    s += rect(rx, cy, 3, ch, teal)
    s += T(rx + rh * .3, cy + ch * .5 + mono_fs * .36, 'Calendar · 11:00–12:00', mono_fs, teal, d['label'], maxw=rw - rh * .6)
    # The now line sits a third of the way through the 10:00 hour, with its dot in the time column.
    ny = y + step * 1.33 + mono_fs * .7
    s += line(x + col - fs * .3, ny, x + w, ny, pink, 2) + f'<circle cx="{x + col - fs * .3}" cy="{ny}" r="{fs * .22}" fill="{pink}"/>'
    return f'<g data-art="planner-day">{s}</g>'


def banner(d):
    s = rect(0, 0, 1200, 400, d['bg'])
    s += mark(d, 44, 46, 64)
    s += wordmark(d, 124, 98, size=66)
    s += T(44, 146, d['tag'], 16, d['safe_label'], d['label'])
    s += line(44, 166, 560, 166, d['accent'], 3)
    for i, h in enumerate(d['headline']): s += T(44, 236 + i * 62, h, 54, d['fg'], d['display'], 700, maxw=540)
    s += T(44, 358, 'Tadooer / by SUBCULT · private, self-hosted', 17, d['safe_label'], d['label'])
    s += day(d, 620, 36, 540, 328)
    return s


def post(d):
    s = rect(0, 0, 600, 600, d['bg'])
    s += T(36, 49, d['tag'], 14, d['safe_label'], d['label'], maxw=400) + line(36, 72, 564, 72, d['accent'], 3)
    s += mark(d, 460, 24, 104)
    for i, h in enumerate(d['headline']): s += T(36, 150 + i * 56, h, 46, d['fg'], d['display'], 700, maxw=528)
    s += day(d, 36, 250, 528, 250)
    s += line(36, 527, 564, 527, d['fg'], 2) + T(36, 566, 'ONE OWNER · EVERY DEVICE · ONE THING NOW', 14, d['safe_label'], d['label'])
    return s


GUIDE_NOTE = (
    "Identity for Tadooer, a private, self-hosted task and calendar planner for one owner, with a web app, "
    "desktop and mobile shells around the same server. The repository and service identifier stay "
    "`productivity-suite`. This promotional direction, The plan and the one thing now, was proposed by Studio "
    "on October 2, 2026 from the product's own design system; the owner has not reviewed the artwork, and the "
    "headline and all supporting copy are sample text to be replaced. Surfaces and text are Catppuccin Mocha: "
    "crust (#11111b) is the outer frame and the mark's tile, base (#1e1e2e) is the canvas, surface-0 (#252538) "
    "carries task rows, and text (#e2e6f6, 13.2:1 on base) and subtext (#a6adc8, 7.4:1) carry copy and labels. "
    "Accents are Dracula with one meaning each: purple (#bd93f9, 6.8:1) is the primary action, selection, time "
    "blocks and the focus frame; pink (#ff79c6) is now (the current-time line, the live timer, the running focus "
    "label) and nothing else; cyan (#8be9fd) is the keyboard focus ring, links and information; teal (#94e2d5) "
    "is calendar authority. Never fill a large area with a full-strength accent; tinted fills are the accent at "
    "13 to 14 percent over a surface. The mark is the suite icon: three list lines (the plan) and a check in a "
    "purple disc (the one thing being done now) on a rounded crust tile. It stays legible at 32 pixels because "
    "every shape is solid; monochrome variants drop the tile, draw the disc as a ring and set lines and check in "
    "ink. In this pack the tile carries a line-strong (#3a3a54) border, one step above crust, so its shape stays "
    "visible on dark canvases; the product icon itself has no border. The wordmark is Tadooer in Inter bold with -0.015em tracking, one capital; the app sets page titles at "
    "weight 650 on the variable font, and this pack's static Inter 700 is the nearest bundled weight. Atkinson "
    "Hyperlegible Mono carries anything that is a time, a count or a label, with tabular numerals. The planner "
    "day is the signature motif: a time column, task rows on surface-0 with one row framed purple as the focus "
    "session, the pink now line and a teal calendar block. Its row titles are placeholders, never real tasks. "
    "Tadooer has no public domain and no sign-up: artwork must not suggest a public service, show a URL or "
    "invite registration. The product's own documents never claim a feature that is not verified; copy here "
    "follows the same rule. The app is dark only; light and monochrome lockups exist for print and foreign "
    "backgrounds, not for the interface."
)

PRODUCT_SECTION = """## Product web assets and design system

`product/` holds exports for the web manifest and link previews: `favicon.svg` (outlined), `apple-touch-icon.png` (180), `icon-512.png` and `icon-maskable-512.png` (the mark inside the maskable safe zone on crust) and `og.png` (1200×630, no URL: the planner has no public domain). Copy them into `apps/web/public/`; regenerate here with `tadooer_product_assets.py` instead of editing the copies.

`design-system/` is a copy of `docs/design/` from the product repository: `README.md` (identity, direction, surfaces, accents, type, shape, component rules), `tokens.css` (every token as a CSS custom property) and `examples/01-specimen.html`. `source-provenance.json` records the source path, head commit and SHA-256 of each copied file, and names `apps/web/public/suite-icon.svg` as the mark source. The product repository stays the editing source for interface rules; promotional layouts are edited here.

"""
