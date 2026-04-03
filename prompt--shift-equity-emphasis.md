# Shift Portfolio Allocations Toward Equities for Younger Investors

## Problem

The portfolio protocol over-allocates to fixed income for young completers. The deep-dive modifiers (experience and savings-pct) stack up to -2.0 of downward pressure with no counterbalancing upward force from having a long time horizon. A 25-year-old who answers "buy more at lower prices" (risk 4) but is a new investor with >50% of savings here lands at risk score 2 — the Moderately Conservative portfolio with 40% bonds. That's wrong for a 20+ year horizon.

## Root causes (investigate these — don't take my word for it, verify each one)

1. **No timeline/age uplift in `src/logic/scoringUtils.js`**: The `computeRiskScore` function applies deep-dive and goal-followup modifiers but never considers the user's timeline. A 20+ year horizon should push the score UP, not leave it defenseless against the experience penalty.

2. **Asymmetric modifier weights**: In `src/data/questions.js`, the deep-dive modifiers are lopsided — experience has -1.0/-0.5/0/+0.5 and savings-pct has 0/0/-0.5/-1.0. The downside pull (-2.0 max) dwarfs the upside (+0.5 max). For young investors specifically, inexperience is EXPECTED and shouldn't be penalized as heavily.

3. **Conservative tie-breaker in `src/logic/matchingEngine.js`** (line 87): When two portfolios are equidistant from the computed risk score, the engine picks the lower-risk one. This creates a systematic conservative drag.

4. **Portfolio allocation bands could be more equity-forward**: Even the "Balanced Growth" portfolio (risk 3) is only 70% equity. For someone under 30, industry-standard target-date funds typically run 85-90% equity.

## What to change

Make targeted changes across these files. Keep the overall architecture intact — this is about tuning, not a rewrite.

### A. Add a timeline uplift to `src/logic/scoringUtils.js`

Add a positive modifier when the resolved timeline is long. Suggested values:
- `20+` → +1.0
- `10-20` → +0.5
- `5-10` → 0
- shorter → 0

Apply this AFTER the existing modifiers so the long time horizon partially counterbalances inexperience penalties. Import `resolveTimeline` and `TIMELINE_ORDER` as needed — they're already in the file.

### B. Soften the deep-dive penalties in `src/data/questions.js`

Reduce the magnitude of the negative modifiers slightly:
- `experience.never`: -1 → -0.5
- `experience.under-1`: -0.5 → -0.25
- `savings-pct.over-50`: -1 → -0.5
- `savings-pct.25-50`: -0.5 → -0.25

This way inexperience still matters, but it can't singlehandedly override a stated high risk tolerance.

### C. Change the tie-breaker in `src/logic/matchingEngine.js`

On line 87, change the tie-breaking sort from `a.riskScore - b.riskScore` (conservative) to `b.riskScore - a.riskScore` (growth-leaning). A young investor on the fence should land in the more aggressive portfolio, not the more conservative one.

### D. Bump equity allocations up ~5% across the middle portfolios in `src/data/portfolios.js`

Shift the `assetAllocation` objects and corresponding `holdings` weights:
- **Mod-Conservative**: 55% equity → 60% equity, reduce usBonds from 40% → 35%
- **Balanced Growth**: 70% equity → 75% equity, reduce usBonds from 25% → 20%
- **Growth**: 85% equity → 90% equity, reduce usBonds from 15% → 10%

When adjusting holdings weights, reduce the largest bond ETF (AGG) by the same 5% you're adding to equity. Keep the `cash` allocations as-is. Leave Conservative and Aggressive portfolios untouched — their current allocations are appropriate for their risk levels.

## Verification

After making changes, trace these scenarios through the logic manually and confirm the outcomes are reasonable:

1. **25-year-old, retirement goal, never invested, >50% savings, says "buy more"** — should land in Balanced or Growth, NOT Mod-Conservative
2. **35-year-old, wealth-building, 1-5yr experience, "hold steady", 10-25% savings** — should land in Balanced Growth or higher
3. **55-year-old, retirement, 5+ years experience, "hold steady"** — should still land in Balanced or Mod-Conservative (the changes shouldn't make older investors too aggressive)
4. **22-year-old, retirement, never invested, <10% savings, "sell some"** — even this cautious young person should land no lower than Mod-Conservative given their 20+ year horizon

Log the computed risk score and matched portfolio for each scenario to confirm.
