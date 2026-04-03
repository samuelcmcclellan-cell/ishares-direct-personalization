# Prompt: Feedback Round — Question Tree, Savings Limits, and Strategy Deck Fixes

Make the following changes across the Model 2 app and strategy deck. Do NOT change any other behavior or styling.

---

## 1. Soften the retirement age question (question tree)

**File:** `src/data/questions.js`

In the `GOAL_FOLLOWUPS.retirement` object (around line 253), the current `title` is `"How old are you today?"`. Change it to something softer like:

```js
title: "What stage of your career are you in?",
description: "This helps us estimate your investment horizon to retirement.",
```

Keep the same option IDs and `impliedTimeline` values — only change `title`. The age-range labels (`"Under 30"`, `"30–39"`, etc.) should stay as-is since the feedback said the range groups are good.

**Important:** Do NOT touch the `FinancialPictureStep` — it has its own `currentAge` slider that the user wants to keep.

Search the rest of `questions.js` (the `STEPS` array and `GOAL_CONDITIONALS` object) to confirm there are no other questions with "how old" wording. If you find any, soften them the same way.

---

## 2. Push savings upper limits higher

**File:** `src/components/prototype/steps/FinancialPictureStep.jsx`

In the `SLIDERS` array (line 4–9), increase the upper bounds:

| Slider key      | Current max | New max     |
|-----------------|-------------|-------------|
| `currentSavings`| 2,000,000   | 10,000,000  |
| `annualIncome`  | 500,000     | 1,000,000   |

Also update `SMART_DEFAULTS` (lines 81–107) to push the higher age brackets up:

- `retirement['50-59']`: change `currentSavings` from `400000` to `750000`
- `retirement['60-plus']`: change `currentSavings` from `600000` to `1200000`, change `annualIncome` from `100000` to `150000`
- `income._default`: change `currentSavings` from `150000` to `300000`

These are suggestions — use your judgment on reasonable defaults for high-net-worth users, but the key point is the slider maximums MUST go up to $10M savings and $1M income.

---

## 3. Fix "8 risk-scored portfolios" on slide 2

**File:** `build-deck.cjs`

In the `m2Items` array (around line 240–245), the second bullet currently reads:

```js
"8 risk-scored portfolios from 27 iShares ETFs",
```

The app actually has 33 portfolios (10 core risk-scored + 23 goal/style/tax-aware variants). Change this to accurately reflect the count:

```js
"33 risk-scored portfolios from 27 iShares ETFs",
```

---

## 4. Fix bullet point alignment in slide 2 model cards

**File:** `build-deck.cjs`

The bullet points inside each model card are misaligned with the card titles. The issue is the bullet items for each model use the same x-position as the title text, but the bullet character `"•  "` adds visual indentation that makes them look offset.

Review the x-positions for the card titles vs. bullet text for all three models:
- Model 1: title at `x: 0.65`, bullets also at `x: 0.65`
- Model 2: title at `x: 3.73`, bullets also at `x: 3.73`
- Model 3: title at `x: 6.82`, bullets also at `x: 6.82`

Nudge each bullet block's x-position LEFT by about `0.05` so the bullet text (after the dot) visually aligns with the title text above it. For example:
- Model 1 bullets: `x: 0.60` (was `0.65`)
- Model 2 bullets: `x: 3.68` (was `3.73`)
- Model 3 bullets: `x: 6.77` (was `6.82`)

Test by regenerating the deck (`node build-deck.cjs`) and visually checking the output.

---

## 5. Remove timeline/cost footer from each model card

**File:** `build-deck.cjs`

Delete the three footer stat blocks at the bottom of each card. These are the `s2.addText([...])` calls that render:
- Model 1 footer (lines ~208–217): `"4–6 wks  ·  $  ·  No AI"`
- Model 2 footer (lines ~256–265): `"3–6 mos  ·  $$$  ·  High AI"`
- Model 3 footer (lines ~304–313): `"6–12 mos  ·  $$$$  ·  Very High AI"`

Remove all three of these `s2.addText([ ... ])` blocks entirely.

---

## After all changes

1. Run `node build-deck.cjs` to regenerate the .pptx
2. Copy the new .pptx from `public/deck/` to `dist/deck/` if the dist folder exists
3. Run `npm run dev` to verify the app still works — specifically navigate through the Model 2 questionnaire and confirm:
   - The retirement follow-up no longer says "How old are you?"
   - The Financial Picture sliders go up to $10M savings and $1M income
   - The strategy deck slide 2 says "33 risk-scored portfolios"
