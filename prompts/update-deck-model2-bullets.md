# Prompt: Update Strategy Deck — Model 2 Description to Match Actual App

## Context

The strategy deck in `build-deck.cjs` has a 2-slide presentation. Slide 2 ("Three Ways to Build This") describes three operating models as cards. The **Model 2 card** (lines 220–265) currently has stale bullet points that don't reflect the actual working prototype. The app has evolved significantly since the deck was written.

## What's wrong (current Model 2 bullets at lines 240–244)

```js
const m2Items = [
  "AI-adaptive conversation profiles investors",
  "Matches to 15–20 pre-built model portfolios",
  "Full iShares + BlackRock active ETFs",
  "AI personalizes; humans curate portfolios",
];
```

These are vague and inaccurate vs. what the app actually does:

- **"15–20 pre-built model portfolios"** → The app has **8 risk-scored portfolios** (ultra-conservative through aggressive-growth), defined in `src/data/portfolios.js` as the `PORTFOLIOS` array. Each has a `riskScore` from 1–8.
- **"AI-adaptive conversation"** is underselling it → The app has a **12+ step adaptive questionnaire** (`src/data/questions.js` STEPS array) that dynamically injects goal-followup and goal-conditional steps based on answers. It includes 2 AI free-text insight prompts (`ai-insight-1`, `ai-insight-2`), an optional 6-question deep-dive calibration, financial picture sliders with live projection charts, FOMO reaction gauging, income draw signals, and investment style selection.
- **"Full iShares + BlackRock active ETFs"** → The app uses a specific **27-ETF library** (`src/data/etfs.js` ETF_DATA object) spanning 6 categories: core index (IVV, ITOT, IJH, IJR, IEFA, IXUS, IEMG), fixed income (AGG, IUSB, SHY, TIP, LQD, HYG, EMB, MUB), dividend (DGRO, DVY), ESG (ESGU, ESGD), and BlackRock active strategies (DYNF, BLCR, BALI, BAI, BINC, POWR).
- **"AI personalizes; humans curate portfolios"** → More precisely: a multi-factor risk scoring engine (`src/logic/scoringUtils.js` `computeRiskScore()`) computes a composite score from base risk reaction + 6 modifier sources (deep-dive answers, goal-followup riskNudge, risk-preference scale, goal-conditional nudge, existing holdings signal, timeline uplift), then `src/logic/matchingEngine.js` `matchPortfolio()` matches to the nearest portfolio and applies **theme overlays** (AI, Clean Energy, Power & Infrastructure, Defense & Aerospace) that add or boost thematic ETF positions and renormalize weights.

## Task

Update the `m2Items` array on lines 240–244 of `build-deck.cjs` to replace all 4 bullets with ones that accurately describe what Model 2 actually does. Keep the same tone and brevity as the existing deck (short punchy bullet points that fit on a small card — roughly 6–8 words each, max ~50 characters per bullet).

The new bullets should convey these 4 truths:
1. **Adaptive intake** — 12+ step questionnaire that adapts based on answers + 2 AI open-text insights
2. **Portfolio matching** — 8 risk-scored model portfolios with 27 iShares/BlackRock ETFs
3. **Multi-factor scoring** — risk score from 6+ signal sources (behavioral, financial, preference)
4. **Theme overlays** — optional thematic tilts (AI, Clean Energy, Infrastructure, Defense)

Do NOT change anything else in the file — same formatting, same structure, same helper functions. Only update the 4 strings in the `m2Items` array.

## After editing

1. Run `node build-deck.cjs` from the project root to regenerate the .pptx file at `public/deck/iShares_Direct_Personalization_2_Slides.pptx`
2. Verify the file was created with no errors
3. Commit the changes to both `build-deck.cjs` and the regenerated `.pptx` file:
   - Stage: `build-deck.cjs` and `public/deck/iShares_Direct_Personalization_2_Slides.pptx`
   - Commit message: "Update Model 2 deck bullets to reflect actual prototype capabilities"
4. Push to deploy on Vercel: `git push`
