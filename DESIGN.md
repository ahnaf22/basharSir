---
name: পড়া হবে! (AI Home Tutor Bangladesh)
description: A dark slate study desk where one chalk-white card is always the thing to do next.
colors:
  slate: "#0D1814"
  slate-raised: "#13221C"
  slate-active: "#1A2D26"
  slate-track: "#22382F"
  hairline: "rgba(237, 232, 218, 0.10)"
  hairline-strong: "rgba(237, 232, 218, 0.20)"
  chalk: "#EDE8DA"
  chalk-soft: "#B5B9AA"
  chalk-faint: "#8E9A90"
  marigold: "#FFB238"
  marigold-ink: "#241600"
  marigold-edge: "#B97400"
  board-ink: "#14201B"
  board-ink-soft: "#4A5650"
  chalk-track: "#D6CFBD"
  chalk-inset: "#E3DDCC"
  redpen: "#FF6152"
  tick: "#7FD6A0"
  ice: "#9CCFE8"
  paper: "#F3EBD5"
  paper-rule: "#B9CDE0"
  exercise-ink: "#22408F"
typography:
  display:
    fontFamily: "Anek Bangla, Hind Siliguri, Noto Sans Bengali, system-ui, sans-serif"
    fontSize: "clamp(2rem, 3.6vw, 2.9rem)"
    fontWeight: 750
    lineHeight: 1.1
    fontVariation: "'wdth' 80"
  headline:
    fontFamily: "Anek Bangla, Hind Siliguri, Noto Sans Bengali, system-ui, sans-serif"
    fontSize: "clamp(1.7rem, 3vw, 2.5rem)"
    fontWeight: 780
    lineHeight: 1.12
    fontVariation: "'wdth' 78"
  title:
    fontFamily: "Anek Bangla, Hind Siliguri, Noto Sans Bengali, system-ui, sans-serif"
    fontSize: "1.3rem"
    fontWeight: 700
    lineHeight: 1.2
    fontVariation: "'wdth' 85"
  figure:
    fontFamily: "Anek Bangla, Hind Siliguri, Noto Sans Bengali, system-ui, sans-serif"
    fontSize: "1.9rem"
    fontWeight: 750
    lineHeight: 1.1
    fontVariation: "'wdth' 85"
  body:
    fontFamily: "Hind Siliguri, Noto Sans Bengali, system-ui, sans-serif"
    fontSize: "15.5px"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Hind Siliguri, Noto Sans Bengali, system-ui, sans-serif"
    fontSize: "0.8rem"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "0.03em"
rounded:
  sm: "7px"
  md: "12px"
  lg: "16px"
  xl: "22px"
  xxl: "26px"
  full: "999px"
spacing:
  xs: "6px"
  sm: "10px"
  md: "14px"
  lg: "22px"
  gutter: "clamp(16px, 3vw, 36px)"
components:
  button-go:
    backgroundColor: "{colors.board-ink}"
    textColor: "{colors.chalk}"
    rounded: "{rounded.full}"
    padding: "0 26px"
    height: "56px"
  button-cta-marigold:
    backgroundColor: "{colors.marigold}"
    textColor: "{colors.marigold-ink}"
    rounded: "{rounded.full}"
    padding: "0 18px"
    height: "44px"
  nav-item:
    backgroundColor: "transparent"
    textColor: "{colors.chalk-soft}"
    rounded: "{rounded.md}"
    padding: "8px 12px"
    height: "42px"
  nav-item-active:
    backgroundColor: "{colors.slate-active}"
    textColor: "{colors.chalk}"
  panel:
    backgroundColor: "{colors.slate-raised}"
    textColor: "{colors.chalk}"
    rounded: "{rounded.xl}"
    padding: "22px"
  now-card:
    backgroundColor: "{colors.chalk}"
    textColor: "{colors.board-ink}"
    rounded: "{rounded.xxl}"
    padding: "32px"
  chip:
    textColor: "{colors.chalk-soft}"
    rounded: "{rounded.full}"
    padding: "3px 10px"
  search:
    backgroundColor: "{colors.slate-raised}"
    textColor: "{colors.chalk}"
    rounded: "{rounded.full}"
    height: "44px"
---

# Design System: পড়া হবে! (AI Home Tutor Bangladesh)

## Overview

**Creative North Star: "The Night Study Desk"**

The student opens the app in the evening, on a phone, with a textbook next to them. The interface is a dark slate desk lit by one marigold lamp. The sidebar is the shelf and the main column is the desk top. Everything quiet sits on the slate. One chalk-white card, the "এখন পড়ো" (study now) card, is the single bright surface and always answers the question *what do I do next?* Chalk text, a handful of exercise-book details and a hand-lettered accent make it feel like a tutor's board, not a SaaS dashboard.

Density is calm and readable. A summary sentence leads each screen and the numbers come after it. Bangla is the primary script, so display type is condensed and heavy while body copy stays open and roomy at 15.5px with a 1.6 line height, because Bangla conjuncts need the space. Colour is rare and meaningful. Marigold means "act or progress here", green means done, red pen means attention, ice blue means protection (streak freeze).

The system is flat. Depth comes from tonal slate layers and hairline rules, with a hard 2px pressed edge under the main buttons. It is tactile in the way a chunky physical button is, and there are no ambient glows.

**Key Characteristics:**
- One bright chalk card per screen; everything else stays on slate.
- Condensed, heavy Bangla display type over an open, readable body face.
- Marigold is the only action colour and appears on a small fraction of any screen.
- Flat tonal layering with 1px hairlines; buttons have a hard pressed lower edge.
- A summary sentence first, a ledger strip instead of stat tiles, no internal codes.
- Exercise-book details (ruled paper, handwritten accent) appear only in the places that stand for the student's own work.

## Colors

A slate-and-chalk palette with a single marigold accent and three small status hues.

In code these are Tailwind `desk-*` roles backed by CSS variables on `.student-desk`: `desk-accent*` and `desk-ink*` for the marigold and board ink, `desk-paper` / `-paper-2` / `-paper-3` for ruled-paper cards, `desk-line*` for rules, and the contextual text roles `desk-text`, `desk-text-2`, `desk-muted` (chalk on the desk, ink on paper). Feature components use these roles, never raw Tailwind slate, white or teal.

### Primary
- **Marigold Lamp** (#FFB238): the only action colour. Primary actions on slate, the current nav icon, progress fills, the logo mark, links in panel headers, the focus ring. Its ink pair is **Burnt Umber Ink** (#241600) for text on marigold, and **Marigold Edge** (#B97400) for the pressed lower edge of marigold buttons.

### Secondary
- **Tick Green** (#7FD6A0): completed work and ticks only.
- **Red Pen** (#FF6152): the notification dot and corrections. It never decorates. On paper surfaces the red pen text is `--paper-red-ink` (#B8281D, 5.3:1) and strokes or borders use `--paper-red` (#D2382B); muted paper text is `--paper-muted` (#65625A), ticks on paper `--tick-ink` (#1D7A45), and the pressed edge of marigold buttons `--marigold-deep` (#B97400). All are CSS variables in `globals.css`.
- **Frost Ice** (#9CCFE8): streak-freeze protection only.

### Neutral
- **Night Slate** (#0D1814): the page background and sidebar.
- **Raised Slate** (#13221C): panels, ledger, search, quota card.
- **Active Slate** (#1A2D26): the active nav row and pill backgrounds.
- **Track Slate** (#22382F): empty progress tracks and unfilled week boxes.
- **Chalk** (#EDE8DA): primary text on slate and the bright "now" card surface.
- **Soft Chalk** (#B5B9AA): secondary text on slate. **Faint Chalk** (#8E9A90): captions, labels, and placeholders.
- **Board Ink** (#14201B): text and buttons on the chalk card. **Board Ink Soft** (#4A5650): secondary text on the chalk card.
- **Chalk Track** (#D6CFBD) and **Chalk Inset** (#E3DDCC): the empty step track and the input well inside the chalk card.
- **Hairline** (rgba(237,232,218,0.10)) and **Strong Hairline** (0.20): every border and divider on slate.
- **Exercise Paper** (#F3EBD5), **Paper Rule** (#B9CDE0) and **Exercise Ink** (#22408F): the ruled-notebook look of the answer-script thumbnail. They are used only where the student's own handwritten work is shown.

### Named Rules
**The One Lamp Rule.** Marigold is used on a small fraction of any screen. If two marigold things compete, one of them is wrong.
**The Chalk-Card Text Rule.** Anything on a chalk or paper surface uses Board Ink, never Chalk. Light text on a light card is a bug.
**The Meaning-Only Hue Rule.** Green, red and ice carry fixed meanings (done, attention, protected). They are never used for decoration or subject theming beyond a small subject swatch.

## Typography

**Display Font:** Anek Bangla (with Hind Siliguri, Noto Sans Bengali, system-ui), used with width axis values between 78 and 92 so headings are condensed
**Body Font:** Hind Siliguri (with Noto Sans Bengali, system-ui)
**Hand Font:** Atma, for the one handwritten accent
**Mono:** system mono, for the `/` keyboard hint only

**Character:** A heavy, condensed Bangla display face carries headlines and numbers, set against a plain, generous body face. The pairing reads like chalk headings over neat notebook writing.

### Hierarchy
- **Display** (750, clamp(2rem, 3.6vw, 2.9rem), 1.1, width 80): the one greeting headline per screen; a single word may be marigold.
- **Headline** (780, clamp(1.7rem, 3vw, 2.5rem), 1.12, width 78, max ~22ch, balanced wrap): the title of what to study now, on the chalk card.
- **Title** (700, 1.3rem, 1.2, width 85): panel headings.
- **Figure** (750, 1.9rem, 1.1, width 85, tabular numerals): ledger values. A small unit follows in body type at 0.85rem, in Faint Chalk.
- **Body** (400, 15.5px, 1.6): paragraphs and rows. Keep summary sentences to about 44em.
- **Label** (400, 0.8rem, 0.03em tracking): captions, group labels, helper lines.

### Named Rules
**The Open Bangla Body Rule.** Body line height never drops below 1.5. Bangla matras and conjuncts collide at tighter leading.
**The Bangla Numerals Rule.** Numbers shown to students are Bangla digits (০–৯) with tabular alignment where figures line up.

## Layout

The app is a two-column grid: a 252px sticky sidebar and a fluid main column. The main content sits in a column capped at 1240px with a fluid side gutter (clamp(16px, 3vw, 36px)) and 22px gaps between blocks. The page has no outer frame, no margin and no card border around the app; the slate runs edge to edge.

The first screen reads top to bottom: a hello row (date, greeting, one summary sentence), a four-cell ledger strip, then the chalk "now" card. Below sit two-column panels (routine and mastery) and a three-column bottom row (achievements, answer-script upload, next test).

Responsive behaviour:
- **≤1180px:** the bottom row becomes two columns with the first panel spanning the full width.
- **≤1020px:** the sidebar collapses to a 76px icon rail (labels, pills, quota and plan card hidden); the ledger becomes two columns.
- **≤720px:** the sidebar disappears and a fixed five-tab bar takes over (আজ, রুটিন, Tutor raised in the middle, টেস্ট, আরও). Content must keep clear of the safe-area insets and the bar.
- **≤420px:** tighten padding further; touch targets stay at 44px.
Interactive targets are at least 44px tall everywhere, including nav rows (42px minimum with 8px padding).

## Elevation & Depth

Flat by default. Depth comes from stepping up through the slate ramp (Night → Raised → Active → Track) and from 1px hairlines, not from shadows. The only shadows are (1) the hard pressed lower edge under the two main buttons, (2) a soft drop under the tilted exercise-paper thumbnail and floating menus, and (3) a glow under the raised Tutor tab on phones. The sticky top bar uses a translucent slate with a 12px backdrop blur and a hairline underneath.

### Shadow Vocabulary
- **Pressed Edge** (`box-shadow: 0 2px 0 #000`): the big dark "go" button on the chalk card.
- **Marigold Pressed Edge** (`box-shadow: 0 2px 0 #B97400`): the marigold call-to-action button.
- **Paper Lift** (`box-shadow: 0 8px 14px -8px rgba(0,0,0,.8)`): the tilted notebook thumbnail only.
- **Tutor Tab Glow** (`box-shadow: 0 8px 18px -6px rgba(255,178,56,.5)`): the raised Tutor tab in the phone bar.
- **Menu Float** (`box-shadow: 0 14px 30px -10px rgba(0,0,0,.7)`): popovers and floating toggles.

### Named Rules
**The Flat-By-Default Rule.** A surface at rest has no shadow. Shadows mark only a pressable edge or something that floats above the page.

## Shapes

Corners are generously rounded and scale with the size of the container: 7px for checkboxes and blocks, 12px for nav rows, 16px for inset cards and input wells, 20–22px for panels and the ledger, 26px for the chalk card, and full pills (999px) for buttons, chips, search and avatars. The signature silhouette is a "speech-bubble" tile: three rounded corners and one tight 3–4px corner on the bottom-left (logo mark and the Tutor avatar, with the same tail flipped on tutor replies). Dashed hairline borders mean "not yet filled" (empty mastery blocks, the upload zone, the plan card). Solid borders mean "has content".

## Components

### Buttons
- **Shape:** full pill (999px).
- **Go (primary on the chalk card):** Board Ink fill, Chalk text, 56px tall with 26px side padding, display type at width 92 and weight 700, with a 2px black pressed edge. On hover it lifts 2px and the arrow slides 4px right.
- **Marigold CTA (primary on slate):** Marigold fill, Burnt Umber Ink text, 44px tall, 18px side padding, display type, with a marigold-edge pressed lower edge. It lifts 1px on hover.
- **Outline (row actions such as "start"):** transparent, 1px strong hairline, Chalk text, 36px tall; hover turns the border and text marigold. The active row's start button fills marigold.
- **Icon button:** 44px circle, transparent, hover Raised Slate.

### Chips
- **Style:** 0.78rem, pill, 1px strong hairline, Soft Chalk text, no fill. Marigold-tinted chips (marigold at 14% fill, marigold text) mark "new" or partial progress.

### Cards / Containers
- **Panel:** Raised Slate, 1px hairline, 22px radius, 22px padding. Its header is a title on the left, a marigold text link on the right and an optional one-line helper below.
- **Chalk "now" card:** Chalk fill, Board Ink text, 26px radius, up to 32px padding, with a faint 28px ring cropped at the top-right corner. Inside: a breadcrumb with a "live" pill (Board Ink fill, marigold text, blinking dot), the headline, a five-step progress track and an "ask the tutor" input in Chalk Inset.
- **Ledger strip:** one container with 20px radius and vertical hairline dividers. Four cells hold a label, a figure and a small visual (week ticks, a ring, nothing more).
- **Inset row:** Night Slate fill inside a panel, 16px radius, hairline border (mastery rows).

### Inputs / Fields
- **Search:** pill, Raised Slate fill, 1px hairline, 44px tall, a `/` keyboard hint on the right. On focus the border turns marigold.
- **Ask field (on the chalk card):** Chalk Inset well, 16px radius, with the tutor avatar on the left and a Board Ink "ask" button on the right.
- **Focus:** a 2px marigold outline with a 2px offset on every focusable element.

### Navigation
- **Sidebar rows:** 42px tall, 12px radius, icon (20px, 1.7 stroke) plus label, Soft Chalk text. Hover moves to Raised Slate and Chalk text. The active row is Active Slate with Chalk text and a marigold icon, and carries `aria-current="page"`. Group labels ("পড়া", "একসাথে") are 0.75rem Faint Chalk. A small pill sits at the right (marigold-tinted for "নতুন", slate for counts such as "৩–৫ জন").
- **Quota and plan:** a Raised Slate card with a 6px marigold meter at the bottom of the sidebar, then a dashed-border plan card that links to billing.
- **Phone tab bar:** five tabs on translucent Raised Slate with a top hairline. The active tab shows a marigold icon with Chalk text. The Tutor tab is raised: a marigold tile with the speech-bubble corner, lifted 18px above the bar.

### Timeline row (signature)
A routine row holds a time, a square 22px tick box, a title with a subject swatch and duration, and an outline start button. Rows are separated by dashed hairlines. Done rows strike through the title in Tick Green and fill the box green. The row that is on now turns its time marigold.

### Mastery blocks (signature)
One block per learning objective. An empty block is a dashed outline, a partial block is a solid marigold outline with a faint fill, and a mastered block is filled green. The legend tells the student that a block turns green at the mastery threshold shown by the backend.

## Do's and Don'ts

### Do:
- **Do** keep one chalk-white card per screen for the next thing to do; place all other content on the slate ramp.
- **Do** put Board Ink (#14201B) text on every chalk or paper surface, including inner-page cards.
- **Do** use marigold for the primary action and the current location only, and pair it with Burnt Umber Ink (#241600) text.
- **Do** lead a screen with a summary sentence, then the details; use the ledger strip for the numbers.
- **Do** show honest empty states with dashed outlines and a next action, as the mastery blocks do.
- **Do** give every interactive element a 44px target and the 2px marigold focus ring.
- **Do** show digits in Bangla numerals and keep body line height at 1.5 or more.

### Don't:
- **Don't** use a row of equal stat tiles. Use the ledger strip and a summary sentence.
- **Don't** show internal codes, ids or state names to students (for example `STU-2026-DEMO`, `BADGE_STREAK_3D`, `CHECK_PREREQUISITES`). Use plain Bangla.
- **Don't** add drop shadows or glows to panels. Panels are flat with a hairline.
- **Don't** place light Chalk text on a light surface.
- **Don't** give the app a frame, outer margin or border radius around the whole page; the slate runs edge to edge.
- **Don't** use green, red or ice blue for decoration; they keep their fixed meanings.
- **Don't** let the landing page's global styles leak into the study desk; the desk's styles stay scoped to it.
