# Experimental Sound Studio — website design system

**Reference:** [ess.org](https://ess.org/)  
**Observed:** October 2, 2026  
**Purpose:** Document the visual system used by the current ESS website as a reference for designers and developers.  
**Status:** An independent analysis of the public site, not an official ESS brand guide.

## 1. Scope and evidence

This document combines rendered desktop observations with inspection of the live theme stylesheet and computed styles. The pages inspected were the [homepage](https://ess.org/), [events index](https://ess.org/events/), [40th Anniversary event](https://ess.org/event/40th-celebration/), and [contact page](https://ess.org/connect/).

Values identified as **source-confirmed** come from the public CSS. Descriptions identified as **interpretation** explain how those choices work together. Responsive rules are source-confirmed, but a mobile rendering was not verified: two browser resize attempts timed out. Playback, carousel interaction, form submission, account flows, and a complete accessibility audit were outside this inspection.

The theme stylesheet inspected was [main-C0pJd8fx.css](https://ess.org/wp-content/themes/ess/dist/assets/main-C0pJd8fx.css). Selected rules are preserved in [evidence/css-rules.json](evidence/css-rules.json). Screenshots below record the desktop state; the browser reported a viewport of 1402 × 876 CSS pixels and saved reduced-size images.

## 2. Visual direction

**Interpretation:** ESS combines the scale and density of an experimental music poster with the structure of an editorial publication. Pale pink supplies a continuous canvas. Near-black rules divide that canvas into contiguous modules. Compressed display lettering gives headings strong vertical emphasis, while geometric sans-serif text carries descriptions and practical details.

The site’s sound identity is expressed through waveform graphics, tape and equipment imagery, a jack-like navigation icon, and a framed archive player. These references recur within the layout rather than forming a separate decorative layer.

Five principles describe the observed system:

1. **Build a continuous grid.** Adjacent modules share visual boundaries, with little or no external gutter.
2. **Let typography establish hierarchy.** Large compressed headings lead; small tracked uppercase labels organize navigation and metadata.
3. **Keep the interface palette narrow.** Pink, near-black, and white form the shell. Event artwork supplies additional color.
4. **Use sound as a visual vocabulary.** Waveforms and equipment-like frames connect the interface to the organization’s work.
5. **Give each module internal space.** Generous padding separates content even where modules touch.

### Homepage reference

![ESS homepage: black navigation, pink canvas, event artwork, and split promotional layout](images/home-desktop.png)

## 3. Color system

The following names and values are **source-confirmed CSS custom properties**.

| Token | Value | Role |
| --- | --- | --- |
| `--color-pink` | `#FBDDDD` | Page canvas, default cards, light text and borders on dark panels, pink button variant |
| `--color-black` | `#231F20` | Primary text, grid rules, navigation, player, dark cards |
| `--color-white` | `#FFFFFF` | Form fields, light panels, navigation text, copy on dark imagery |
| `--color-success` | `#146E14` | Success feedback styling |
| `--color-error` | `#E73232` | Error feedback and invalid field borders |
| `--color-warning` | `#F1C45B` | Declared warning token; usage not established in inspected pages |
| `--color-disabled` | `#5C5C5C` | Inactive player controls and timeline details |

The default `--bg-color` is pink and `--text-color` is near-black. Text selection reverses to near-black with pink text. Dark card variants use pink headings and white body copy. Image-backed category cards use white text over layered darkened artwork.

**Interpretation:** Saturated green and hot pink in event posters belong to the content imagery. They should not be treated as additional interface tokens without further brand evidence.

## 4. Typography

### Font roles

| Role | Family | Source-confirmed weights | Use |
| --- | --- | --- | --- |
| Display | **F37 Judge** | 500, 700 | Page titles, cards, event titles, player title |
| Body and interface | **Space Grotesk** | 300, 400, 500, 700 declared | Descriptions, navigation, metadata, links, fields, buttons |
| Alternate display | **Obviously** (`obviously` in CSS) | 600 observed | Footer identity/address band; player cue-point heading rule |

The F37 Judge font files specify **compressed** cuts. F37 Judge and Space Grotesk are served from the ESS theme’s font directory; Obviously is provided through the linked Adobe Fonts stylesheet. This inspection identifies fonts and their use; it does not establish permission to redistribute the font files.

### Base heading scale

The root font size is 16px. Headings use uppercase transformation, 1px tracking, balanced wrapping, and weight 700 unless a component overrides those rules.

| Level | Fluid size rule | Range at a 16px root | Base line height |
| --- | --- | --- | --- |
| H1 | `clamp(4.5rem, 6.5vw, 6.5rem)` | 72–104px | 0.9 |
| H2 | `clamp(3rem, 4.5vw, 4.5rem)` | 48–72px | 0.9 |
| H3 | `clamp(2.5rem, 3.5vw, 3.5rem)` | 40–56px | 1.1 |
| H4 | `clamp(2rem, 2.5vw, 2.5rem)` | 32–40px | 1.3 inherited |
| H5 | `clamp(1.5rem, 2vw, 2rem)` | 24–32px | 1.3 inherited |
| H6 | `clamp(1.25rem, 1.5vw, 1.5rem)` | 20–24px | 1.4 |

Component titles can override the semantic heading scale. Most `.card__title` elements use `--title-size: clamp(3.875rem, 6vw, 6.25rem)`, or 62–100px, with line height 0.9. This means an H3 category card can be visually much larger than an event-entry H3.

Event titles use weight 500, line height 0.9, and 32px type; when the containing block reaches 550px, they increase to 45.2px. Entry descriptions increase from 16px to 20px at the same container threshold. Body text uses a default line height of 1.5, with medium weight common in card descriptions.

Navigation and metadata use Space Grotesk, uppercase transformation, bold weight, and approximately 1.5–1.8px tracking. Metadata is generally 14px; labels and standard underlined CTAs are 14.8px; navigation and buttons are 16px.

**Interpretation:** The compressed font supports long artist and event names at large sizes. The more open body face keeps practical information readable beneath the dense headings.

## 5. Layout and spacing

### Page shell

The site caps the shared header, main content, and footer at **1600px**, centered horizontally. Body padding changes by viewport:

| Width | Outer padding |
| --- | --- |
| Below 544px | 8px |
| 544–1199px | 16px |
| 1200px and above | 20px; body top padding removed |

At **992px and above**, the main grid has a flexible content column and a **36% sidebar**. A slider can span both columns. Below that breakpoint, the desktop main grid is not applied. The footer uses a related 64%/36% division from 1200px.

### Borders and shape

`--border-width` is 2px. The default border uses half that value, giving a **1px rule**; the thick variant uses **2px**. Touching 1px borders can appear as a heavier shared divider. The source values are more useful than subpixel border measurements from a zoomed browser.

Most cards, fields, and buttons are square. Rounded geometry is selective:

- 8px radius for navigation framing and the menu button.
- 50px top-right radius on the archive player, with 45px on its inset frame.
- 50px top-right radius on selected light/dark card interiors from 768px.
- Circular playback control.

**Interpretation:** The selective curved corner suggests equipment housings while preserving the square editorial grid.

### Internal spacing

| Component | Smaller layout | Larger layout |
| --- | --- | --- |
| Standard card interior | 48px vertical / 16px horizontal | From 768px: 74px / 42px |
| Content card interior | 48px / 16px | From 768px: 48px / 42px |
| Sidebar card interior | 32px / 16px | From 768px: 32px / 32px |
| Event entry | 48px / 16px | From 768px: 48px / 42px |
| Event image-to-copy gap | 24px | Container ≥550px: 48px |
| CTA group gap | 16px | 16px |
| Field horizontal inset | 24px | 24px |

These values recur in the implementation, but the CSS does not expose a named spacing-token scale. Treat them as a documented component rhythm rather than an official abstract scale.

## 6. Component system

### Navigation

A dark horizontal masthead contains a white ESS wordmark, framed primary links, and a separate framed jack-like icon. Connect, Support, and Shop appear in an upper utility row on the inspected desktop layout.

The source specifies a 64px header below 1200px and a 95px header from 1200px. Logo width changes from 156px to 250px. Below 1200px, a Menu button replaces the desktop arrangement; its expandable wrapper is dark, scrollable, and sized using viewport height. The header is sticky in this smaller layout and becomes relatively positioned on desktop. Open-menu CSS locks page scrolling and fixes the header. Menu interaction was not exercised.

### Title panel and breadcrumbs

A pink bordered title panel establishes the page name with oversized F37 Judge text. Compact tracked uppercase breadcrumbs sit beneath it. Event detail adds a Share action. The title is integrated into the grid rather than floating above it.

### Event entry

![Events index: poster-led entries alongside the audio player and category cards](images/events-desktop.png)

Each event is a bordered pink row with a poster column and a text column. Metadata precedes the title; a short description follows. Location can appear as a secondary detail.

The entry grid uses a 100px image column and a 24px gap by default. At a container width of 550px, these become 146px and 48px. Tall artwork uses an aspect ratio of **142:202**, approximately 0.70. Images use `object-fit: cover` and a thick border. Description truncation is implemented with a two-line clamp.

### Event detail

![Event detail: title, details, description, and poster in separate bordered modules](images/event-detail-desktop.png)

The left column separates title, practical details, and long description into bordered sections. The right column contains the archive player and event artwork. Metadata stays compact and uppercase, while paragraphs retain mixed case. This repeats the index’s typography and border vocabulary at a different content density.

### Category and promotional cards

Category cards combine a large display title, short description, and underlined View Events action. The events sidebar uses darkened photographic backgrounds with white type. The CSS layers a near-black overlay, pink tint, black color layer, and source image; background blending supplies a consistent treatment across different photos.

Other declared card variants include solid dark, white interiors, image stacks, full-width images, social rows, and corner-line artwork. Homepage modules show the broader promotional vocabulary. Exact use of every declared variant was not independently verified.

### Audio archive player

The player is a near-black module inside a pink wrapper. An inset pink border and rounded top-right corner distinguish it from ordinary cards. Its display title sits above circular playback controls, time labels, a scrubber, and a waveform region.

The inspected state read Nothing Currently Playing and Select a Recording. Controls used the disabled gray token. The CSS also defines album art, active track information, cue points, and compact variants. Those active states are source-derived; playback was not tested.

### Buttons and text actions

Solid buttons use 16px bold uppercase Space Grotesk, 1.8px tracking, 2px borders, and square corners. Default colors are near-black with white text. White and pink variants reverse or soften the surface. Standard padding is approximately 13.2px × 32px, changing to 16px × 36px from 768px.

Hover is defined as a left-to-right fill using a pseudo-element, with text color reversal. Disabled buttons use 50% opacity and suppress pointer events. Underlined CTAs are a separate, lighter action style: bold tracked uppercase text with a 2px underline. Hover/focus pulls the underline closer to the letters.

### Forms and newsletter

Fields use white backgrounds, near-black text, 2px borders, square corners, a 64px height, and 24px horizontal padding. Labels are bold uppercase text with 1.75px tracking. The newsletter joins an email field to a pink Sign Up button inside a dark panel with a pink heading.

The contact page uses the same field vocabulary for topic selection, name, email, phone, inquiry, and membership choices. CSS defines success/error message panels, error field borders, and disabled states. No form was submitted during inspection.

### Footer

The footer continues the bordered grid with utility links, social icons, and a near-black identity/address band. The band uses pink Obviously text at weight 600. Sponsor copy and copyright sit below on the pink canvas. Smaller-layout CSS stacks the identity band and provides a separate vertical utility-link arrangement.

## 7. Imagery, icons, and decoration

The header wordmark is an SVG asset. Posters remain strongly colored and retain their own visual identities. Photography in category cards receives a common dark treatment. Homepage imagery includes recording equipment; source assets also include corner-line patterns and sound-wave SVGs.

Wave graphics appear at module boundaries and can overlap panel edges. CSS uses layered clipped polygons for some sawtooth wave treatments, plus SVG assets for others. Some wave decoration is hidden below 768px. Icons generally inherit text color through `currentColor`; metadata uses small calendar, clock, and location marks.

**Interpretation:** Preserve the relationship among poster artwork, typography, and structural lines when adapting the system. Replacing the contiguous grid with widely separated rounded cards would change its character more than changing a small color accent.

## 8. Responsive behavior

The important source thresholds are:

| Threshold | Confirmed rule |
| --- | --- |
| 544px viewport | Outer padding increases to 16px |
| 768px viewport | Larger card insets, button padding, some decoration and curved interiors |
| 992px viewport | Main content/sidebar grid begins; player layout changes |
| 1200px viewport | Full desktop navigation, 20px outer padding, desktop footer arrangement |
| 1400px viewport | Footer utility text increases from 12px to 13.2px |
| 1500px viewport | Header top margin switches from the utility-row offset to body padding |
| 550px container | Event image width, text size, title size, and internal gap increase |

Viewport and container thresholds serve different purposes. A large viewport can still contain a narrow entry. Use the entry’s available width to choose its compact or expanded presentation.

Mobile stacking and navigation behavior are documented from CSS, not a successful mobile screenshot. Verify title wrapping, image crops, menu focus handling, and newsletter fit on real smaller viewports before reproducing the system.

## 9. Motion and interaction

The common transition is **250ms ease-out**. Declared effects include underline movement, button fill, a 1.03 logo hover scale, and a 1.1 social-icon hover scale. Loading CSS defines a 750ms repeating background slide. Form feedback includes a shake animation.

The reduced-motion media query shortens animation and transition duration to 0.01ms and limits animation iteration to one. This is source-confirmed support, not a full behavioral accessibility verification.

## 10. Accessibility considerations

The inspected page contains a Skip to Content link, and CSS makes it visible on focus. The audio player exposes a region name and the scrubber has an accessible label. Links retain underlines in many contexts, and the primary palette gives a strong visual distinction between text and surfaces.

Further verification is needed for keyboard focus visibility across all components, menu focus management, carousel controls, contrast over photographs, active player behavior, form feedback announcements, and long uppercase title legibility. Low-emphasis gray player text also needs a context-specific contrast check. This document makes no WCAG conformance claim.

## 11. Reusable design specification

The following is a compact reference using the confirmed source values. It is not the complete production stylesheet.

```css
:root {
  --color-pink: #fbdddd;
  --color-black: #231f20;
  --color-white: #fff;
  --color-success: #146e14;
  --color-error: #e73232;
  --color-warning: #f1c45b;
  --color-disabled: #5c5c5c;

  --font-header: "F37 Judge", sans-serif;
  --font-header-alt: "obviously", sans-serif;
  --font-body: "Space Grotesk", sans-serif;

  --border-width: 2px;
  --border-default: calc(var(--border-width) / 2) solid var(--color-black);
  --border-default-thick: var(--border-width) solid var(--color-black);
  --border-radius: .5rem;
  --container-max-width: 1600px;
  --transition-speed: .25s;
  --transition-easing: ease-out;
  --title-size: clamp(3.875rem, 6vw, 6.25rem);
}
```

**Suggested adaptation rules — interpretation, not ESS policy:**

- Use pink as the continuous page canvas and near-black as the structural ink.
- Build layouts from adjoining bordered modules with generous internal padding.
- Use compressed display type for headings and a geometric sans-serif for reading and controls.
- Keep navigation, metadata, and action labels tracked and uppercase.
- Reserve curved corners for specific equipment-like components.
- Let event artwork supply varied color while keeping controls within the core palette.
- Use wave decoration at deliberate structural boundaries.
- Preserve semantic heading order even where component size differs from the base heading scale.

## 12. Source inventory and limits

| Source | Evidence used |
| --- | --- |
| [Homepage](https://ess.org/) | Promotional split layout, artwork, navigation, sound motifs |
| [Events](https://ess.org/events/) | Event entries, category cards, empty player, newsletter, footer |
| [Event detail](https://ess.org/event/40th-celebration/) | Title, breadcrumbs, details, description, poster layout |
| [Contact](https://ess.org/connect/) | Shared form presentation and sidebar modules |
| [Theme CSS](https://ess.org/wp-content/themes/ess/dist/assets/main-C0pJd8fx.css) | Exact tokens, font declarations, component rules, media/container queries, motion |
| [Selected CSS evidence](evidence/css-rules.json) | Local snapshot of relevant public rules |

Screenshots are supporting reference captures from the public site. This document does not establish ownership or reuse rights for ESS branding, photographs, posters, or commercial fonts. It documents the current public implementation; it does not infer an unpublished brand manual or the designer’s stated intent.
