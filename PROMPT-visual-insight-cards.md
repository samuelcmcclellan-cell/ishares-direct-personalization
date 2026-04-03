# Prompt: Add Visual Thumbnails to Educational Insight Cards

## Context

This is a React + Vite app (Tailwind CSS, Framer Motion, Lucide icons). It's a portfolio personalization questionnaire. Throughout the questionnaire steps, educational insight cards appear linking to BlackRock content ("Student of the Market," "Advisor Outlook," "Inside the Market"). These cards are rendered by `src/components/prototype/MarketInsight.jsx` and their content is defined in `src/data/educationalInsights.js`.

**The problem:** The cards are entirely text-based — a teaser line that expands to show a paragraph and a source link. There are no visuals at all. The user sees a small beige bar with text, which is easy to scroll past and doesn't convey the value of the linked content. The source link is buried at the bottom of the expanded text.

## What to build

Redesign the `MarketInsight` card component to be visually rich and link-forward. For each of the 11 educational insights, create a compelling visual thumbnail and display it prominently on the card alongside the source link. The goal is to make these cards feel like content previews you'd want to click — similar to article cards on a media site.

## Step-by-step instructions

### 1. Generate thumbnail images for each insight

For each of the 11 entries in `src/data/educationalInsights.js`, create a thumbnail image (PNG, roughly 600×340px or 16:9-ish). Each thumbnail should look like a screenshot of a bold, typographic slide — large white text on a dark or branded background (use BlackRock's palette: deep black `#000000`, dark charcoal `#1C1C1C`, or dark green `#003B2E` backgrounds with white or `#FEDC00` yellow accent text). Include:

- A short punchy headline derived from the insight's `teaser` or `sourceLabel` (not the full teaser — something tighter, 3-8 words)
- A subtle accent element — a thin colored rule, a small chart icon, or a geometric shape
- The series name in smaller text (e.g., "Student of the Market" or "Advisor Outlook")

Use any method you prefer to generate these — an HTML canvas script, programmatic SVG-to-PNG, or a Node script. Save them to `public/insights/` with filenames matching the insight keys: `goal.png`, `risk-preference.png`, `financial-picture.png`, `existing-holdings.png`, `account-type.png`, `timeline.png`, `risk.png`, `fomo-reaction.png`, `income-draw.png`, `investment-style.png`, `themes.png`, `preferences.png`.

### 2. Add an `image` field to each insight in the data file

In `src/data/educationalInsights.js`, add an `image` property to each entry pointing to the corresponding thumbnail:

```js
"goal": {
  teaser: "Your goal shapes everything — here's why it matters",
  content: "...",
  sourceUrl: "https://...",
  sourceLabel: "Student of the Market — March 2026",
  image: "/insights/goal.png"    // ← add this
},
```

Do this for all 11 entries.

### 3. Redesign `src/components/prototype/MarketInsight.jsx`

Replace the current collapsed-bar design with a visually prominent card. The new design should:

- **Always show the thumbnail image** (not hidden behind an expand toggle). The image should be the dominant visual element — at least 200px tall on desktop, full-width within the card.
- **Overlay or position the source link directly on or adjacent to the image** so the connection between the visual and the link is immediate. A clean approach: place a semi-transparent dark gradient at the bottom of the image with the source label as a link in white text, plus a small external-link icon.
- **Keep the teaser text visible** — show it below the image as a one-liner.
- **Make the content expandable** — the full paragraph text can still expand/collapse on click, but the image + teaser + link should always be visible without expanding.
- **Maintain the existing color palette:** beige background `#F5F5EB`, border `#E5E5DD`, text `#4A4A4A`, muted `#7A7A7A`/`#B9B9AF`. The card itself should feel like a content preview embedded in the questionnaire, not a banner ad.
- **Keep using Framer Motion** for the expand/collapse animation on the content paragraph.
- **Keep the component's prop interface** (`teaser`, `content`, `sourceUrl`, `sourceLabel`) and add `image` as a new prop.

Here's a rough layout guide (not rigid — use your design judgment):

```
┌─────────────────────────────────┐
│                                 │
│     [Thumbnail Image]           │
│     ░░░░░░░░░░░░░░░░░░░░░░░░░  │  ← gradient overlay at bottom
│     ░  📄 Student of the Market │  ← source link on the image
│                                 │
├─────────────────────────────────┤
│ 📖 Your goal shapes everything  │  ← teaser + expand toggle
│    — here's why it matters      │
│                                 │
│ [expanded content if open]      │
└─────────────────────────────────┘
```

### 4. Update all step components that use `MarketInsight`

The following 7 step files spread the insight props with `{...EDUCATIONAL_INSIGHTS["key"]}`. Since you're adding the `image` field to the data objects and the spread operator will pass it through automatically, **no changes should be needed in the step files** — but verify this is the case. The step files are:

- `src/components/prototype/steps/GoalStep.jsx` → key `"goal"`
- `src/components/prototype/steps/GoalFollowUpStep.jsx` → dynamic key from `step.id`
- `src/components/prototype/steps/FinancialPictureStep.jsx` → key `"financial-picture"`
- `src/components/prototype/steps/TimelineStep.jsx` → key `"timeline"`
- `src/components/prototype/steps/RiskStep.jsx` → key `"risk"`
- `src/components/prototype/steps/ThemesStep.jsx` → key `"themes"`
- `src/components/prototype/steps/PreferencesStep.jsx` → key `"preferences"`

### 5. Verify

Run `npm run dev` and click through the questionnaire. Confirm:
- Each step that shows an insight card now displays the thumbnail image
- The source link is visually tied to the image (on it or immediately adjacent)
- The expand/collapse for the full content paragraph still works
- The cards look polished on both desktop and mobile widths
- Images load correctly from `/insights/`

## Design quality bar

This should feel like a premium editorial content integration — think Bloomberg or iShares article preview cards. Clean, high-contrast thumbnails. No placeholder feel. The images should make the user *want* to click through to the source content.
