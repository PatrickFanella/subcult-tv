"""Dedhed's tape-shelf identity: vector masters for the shared pack builder.

Source: the Dedhed design proposal (docs/design/ in the dedhed repository) built from
the taper cassette photographs in docs/inspo/. The mark is an original cassette shell;
the shelf motif is a rack of spine labels. Sample tape labels name shows the way a
taper writes them; they are illustration, not catalog entries or claims.
"""
import subprocess
from PIL import ImageFont
import design_helpers as H

T, rect, line = H.txt, H.rect, H.line

# Label stock from the 1985 typed collection. Used only for grouping; text stays on every label.
STOCK = ['#efe9d8', '#e6d7a7', '#8fb7d6', '#e9c53a', '#efe9d8']
SAMPLE_TAPES = [
    ('Grateful Dead', '4/17/71', 'I', 'Princeton, N.J.'),
    ('Grateful Dead', '5/8/77', 'II', 'Barton Hall, Ithaca'),
    ('Grateful Dead', '2/13/70', 'I · II', 'Fillmore East, N.Y.C.'),
    ('Grateful Dead', '6/16/85', 'II', 'Greek Theater, Berkeley'),
    ('Grateful Dead', '10/31/71', '', 'Columbus, Ohio'),
]

_widths = {}
def width(s, font, size, weight=400):
    key = (font, weight)
    if key not in _widths:
        _widths[key] = subprocess.check_output(['fc-match', '-f', '%{file}', font + ':weight=' + ('bold' if weight >= 600 else 'regular')]).decode()
    return ImageFont.truetype(_widths[key], int(size)).getlength(s)


def mark(d, x, y, size):
    """A cassette shell seen face on: label paper, window, two hubs and the red stripe."""
    mono = d.get('mono'); ink, paper, red = d['fg'], d['bg'], d['accent']
    s = rect(8, 28, 144, 104, ink, 7)
    s += rect(20, 38, 120, 50, paper, 2)                       # label
    s += rect(20, 84, 120, 6, ink if mono else red)            # Maxell red stripe
    s += rect(42, 50, 76, 30, ink, 2)                          # window
    for cx in (58, 102):
        s += f'<circle cx="{cx}" cy="65" r="11" fill="{paper}"/>'
        s += f'<circle cx="{cx}" cy="65" r="4" fill="{ink}"/>'
        for a in (0, 60, 120):
            s += f'<rect x="{cx-1.5}" y="54" width="3" height="22" fill="{ink}" transform="rotate({a} {cx} 65)"/>'
        s += f'<circle cx="{cx}" cy="65" r="5.5" fill="{paper}"/>'
    s += f'<circle cx="{58}" cy="65" r="2.5" fill="{ink}"/><circle cx="102" cy="65" r="2.5" fill="{ink}"/>'
    for cx in (26, 134):                                        # screw holes
        s += f'<circle cx="{cx}" cy="120" r="3" fill="{paper}"/>'
    s += rect(66, 112, 28, 10, paper, 1)                        # capstan notch
    return f'<g transform="translate({x} {y}) scale({size/160})">{s}</g>'


def wordmark(d, x, y, maxw=730, size=91):
    """Lowercase typed wordmark with the red record dot."""
    w = width('dedhed', d['display'], size, 700)
    if w > maxw:
        size = int(size * maxw / w); w = width('dedhed', d['display'], size, 700)
    dot = d['fg'] if d.get('mono') else d['accent']
    return T(x, y, 'dedhed', size, d['fg'], d['display'], 700) + f'<circle cx="{x + w + size * .18}" cy="{y - size * .08}" r="{size * .09}" fill="{dot}"/>'


def spine(d, x, y, w, h, tape, stock, i):
    """One cassette spine: brand tab, label, end. Typed text in the display face."""
    mono = d.get('mono'); ink = d['fg']
    label = d['bg'] if mono else stock
    fs = min(h * .42, w / 20)          # typed label size; narrow shelves get smaller type
    tab = fs * 3.2; end_w = fs * 3.6   # brand tab and end scale with the type, not the slot
    s = rect(x, y, w, h, '#c9c6bb' if not mono else 'none', 2, ink if mono else None)
    s += rect(x, y, tab, h, ink, 2) + rect(x + tab - 2, y, 3, h, ink)
    s += rect(x + tab, y + h * .09, w - tab - end_w - fs * .3, h * .82, label)
    s += T(x + tab * .5 - width('TDK', d.get('support', d['label']), fs * .62, 700) / 2, y + h * .5 + fs * .25, 'TDK', fs * .62, d['bg'], d.get('support', d['label']), 700)
    band, date, setn, venue = tape
    tx = x + tab + fs * .75; ty = y + h * .5 + fs * .38
    s += T(tx, ty, band, fs, ink, d['display'], 700)
    tx += width(band, d['display'], fs, 700) + h * .35
    s += T(tx, ty, date, fs, ink, d['display'])
    tx += width(date, d['display'], fs) + h * .35
    if setn and tx + width(setn, d['display'], fs * .9, 700) <= x + w - end_w - fs * .5:
        s += T(tx, ty, setn, fs * .9, ink, d['display'], 700); tx += width(setn, d['display'], fs * .9, 700) + fs * .8
    room = x + w - end_w - fs * .5 - tx
    if room >= fs * 5: s += T(tx, ty, venue, fs * .8, ink, d['display'], maxw=room)   # narrow shelves drop the venue, as a crowded label would
    s += T(x + w - end_w + fs * .3, y + h * .5 + fs * .3, f'{44 + i * 7}:{(12 + i * 9) % 60:02d}', fs * .7, ink, d['label'])
    return s


def shelf(d, x, y, w, h, rows=5):
    """A pine rack with one spine per slot."""
    mono = d.get('mono')
    s = rect(x, y, w, h, 'none' if mono else d['secondary'], 3, d['fg'] if mono else None)
    gap = h * .035; rh = (h - gap * (rows + 1)) / rows
    for i in range(rows):
        yy = y + gap + i * (rh + gap)
        if not mono: s += line(x, yy + rh + gap * .5, x + w, yy + rh + gap * .5, '#6b4a27', 2)
        s += spine(d, x + gap, yy, w - gap * 2, rh, SAMPLE_TAPES[i % len(SAMPLE_TAPES)], STOCK[i % len(STOCK)], i)
    return f'<g data-art="tape-shelf">{s}</g>'


def banner(d):
    s = rect(0, 0, 1200, 400, d['bg'])
    s += wordmark(d, 44, 108, size=74)
    s += T(44, 146, d['tag'], 16, d['safe_label'], d['label'])
    s += line(44, 166, 560, 166, d['fg'], 3)
    for i, h in enumerate(d['headline']): s += T(44, 240 + i * 66, h, 58, d['fg'], d['display'], 700, maxw=540)
    s += T(44, 358, 'Dedhed / by SUBCULT · private pilot', 17, d['safe_label'], d['label'])
    s += shelf(d, 620, 36, 540, 328)
    return s


def post(d):
    s = rect(0, 0, 600, 600, d['bg'])
    s += T(36, 49, d['tag'], 14, d['safe_label'], d['label'], maxw=400) + line(36, 72, 564, 72, d['fg'], 3)
    s += mark(d, 460, 24, 104)
    for i, h in enumerate(d['headline']): s += T(36, 150 + i * 60, h, 52, d['fg'], d['display'], 700, maxw=528)
    s += shelf(d, 36, 250, 528, 250, rows=4)
    s += line(36, 527, 564, 527, d['fg'], 2) + T(36, 566, 'ON-DEMAND SETS · ONE SHARED STATION', 14, d['safe_label'], d['label'])
    return s


GUIDE_NOTE = """## Notes for this pack

Dedhed is a private concert-tape library and shared radio station for Grateful Dead recordings. Its identity is called The Tape Shelf. It comes from the taper cassette collections photographed in the product repository's docs/inspo/: typed and handwritten spine labels, cream and colored label stock, black and clear shells, red Maxell and TDK tabs, and pine racks. The user approved the cream paper backdrop on October 2, 2026.

### Name and mark

Write Dedhed in prose. In artwork, use the lowercase `dedhed` wordmark with its red record dot. The mark is an original cassette shell: label, red stripe, window, two hubs, screw holes and capstan notch. The shell and hubs are solid shapes, so the mark stays legible at 32 pixels. Monochrome variants turn the stripe to ink.

### Color

Paper (#efe9d8) is the field. Ink (#1f1d1a) carries text and the mark. Tab red (#c8102e, 5.3:1 on paper) is reserved for the record dot, brand tabs, the deck's top rule and the primary key. Pine (#c58b4e) is the rack behind spines and is never a text color. Colored label stock groups tapes and never replaces text.

### Type

Liberation Serif stands in for the Times/Georgia typed-label voice. Liberation Mono is the typewriter voice for counters, lineage and eyebrows. Public Sans sets interface prose and Barlow Condensed sets brand tabs. Band, date, set and venue are data and go in the typed voice; explanations go in the interface voice. Sets are roman numerals. The spine is the list item: a tab, a label and an end.

### Limits

The sample tape labels in this pack name real Grateful Dead shows the way a taper writes them. They are illustration, not catalog entries. The band name describes what the archive holds and implies no endorsement. Dedhed is a private pilot on a loopback address with no public domain. A recording being available from its source never authorizes public relay, and artwork must not claim otherwise. The product keeps credits, track order and uncertain set boundaries, and shows the uncertainty as a warning sticker instead of hiding it.

## Voice

Dedhed copy sounds like a taper labelling spines at the kitchen table: date first, venue second, source notes in the shorthand a head would recognize. It is affectionate, unfussy and a little corny on purpose. Do not quote lyrics, use tie-dye clichés or "long strange trip", or suggest official endorsement or a public station. Every piece of copy says this is a private pilot.

The full voice and its sample lines are in [the voice guide](../../../../content/VOICE.md)."""

PRODUCT_SECTION = """## Product site and design system

`landing.html` is a static landing page for the product, built on the design-system tokens. It shows the masthead, the rack, the shared-radio panel and the pilot boundary. Its tape labels and station state are samples.

`product/` holds web exports: `favicon.svg`, `apple-touch-icon.png`, `hero.svg` and `og.png` (1200×630, no URL). Text is outlined. Copy them into the product. To change one, regenerate it here with `dedhed_product_assets.py`; do not edit the copies.

`design-system/` is a copy of the proposal in the product repository's docs/design/:

- `README.md`: what the source photographs show, the token groups, the type voices, motion rules and the component list.
- `tokens.css`: every token as a CSS custom property, plus the spine, rack, key, field, sticker, reel, counter, VU meter and masthead primitives.
- `examples/`: four pages, the specimen sheet, the rack, the J-card and the deck.
- `source-provenance.json`: the source path and the SHA-256 of each file as it was copied on 2026-10-02.

The product repository stays the editing source for the design system. This copy is for the Studio gallery and the admin bundle.

On 2026-10-03 Studio reworded the sample and explanatory copy in `landing.html`, `design-system/README.md` and the example pages `01-specimen.html`, `02-rack.html` and `04-deck.html` to follow the voice guide. Since that date their wording differs from the product repository's. Tape and show data, tokens, class names and `tokens.css` are unchanged, and `03-jcard.html` is byte-identical to the source. `source-provenance.json` lists which copies differ. `dedhed_product_assets.py` re-copies the product files only when `DEDHED_SOURCE` is set, and doing so replaces the Studio wording.

"""
