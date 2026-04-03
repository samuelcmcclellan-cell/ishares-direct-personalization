# Expand to 10 Risk Portfolios + Style Variants + Deeper Questions

## Overview

This is a significant expansion of the portfolio protocol. Three things change:

1. **10 risk-score portfolios** instead of 5 (finer granularity across the risk spectrum)
2. **More deep-dive questions** after the "Fine-tune" gate (4 questions instead of 2), which provide the signal needed to spread users across 10 levels instead of 5
3. **Style- and preference-triggered variant portfolios** that activate based on investment-style and preference toggles (currently collected but unused)

No ESG portfolios. Do not add ESG-related preferences, portfolios, or ETFs.

Read every file referenced below before making any changes. Understand the full pipeline: questions → scoring → matching → rendering.

---

## Part 1: Expand to a 1–10 Risk Scale

### A. Update the risk question in `src/data/questions.js`

Change the `riskScore` values on the risk step options to a 1–10 scale with even spacing:

```
"Sell everything"              → riskScore: 2
"Sell some to limit losses"    → riskScore: 4
"Hold steady and wait it out"  → riskScore: 6
"Buy more at lower prices"     → riskScore: 8
"Significantly increase"       → riskScore: 10
```

This gives a base score with gaps (2, 4, 6, 8, 10) that the deep-dive modifiers will fill in to produce any score from 1–10.

### B. Update `src/logic/scoringUtils.js`

Change the clamp range from `Math.max(1, Math.min(5, ...))` to `Math.max(1, Math.min(10, ...))`.

### C. Update the risk gauge in `src/components/prototype/ResultsView.jsx`

The `RiskGauge` component currently hardcodes `[1, 2, 3, 4, 5].map(...)` and uses `RISK_COLORS` keyed 1–5. Update both:

```javascript
const RISK_COLORS = {
  1: 'bg-[#028E53]',   // green
  2: 'bg-[#028E53]',
  3: 'bg-[#5EAA3E]',
  4: 'bg-[#5EAA3E]',
  5: 'bg-[#E6A800]',   // yellow
  6: 'bg-[#E6A800]',
  7: 'bg-[#E87722]',   // orange
  8: 'bg-[#E87722]',
  9: 'bg-[#D92B2B]',   // red
  10: 'bg-[#D92B2B]',
}
```

Map over `[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]` instead of `[1, 2, 3, 4, 5]`. Make the gauge segments narrower (e.g., `w-4` instead of `w-8`) so 10 fit comfortably. Update the label to `{score}/10`.

---

## Part 2: Add Deep-Dive Questions

### Current state

The deep-dive step (`type: "multi-question"`) has 2 questions: `savings-pct` and `experience`. These are gated behind the "Want more precise recommendations?" prompt.

### Add 4 new questions to the deep-dive step

Add these to the `questions` array in the deep-dive step in `src/data/questions.js`. Each question follows the same shape: `{ id, label, options: [{ id, label, modifier }] }`.

**Question 3: Emergency Fund**
```javascript
{
  id: "emergency-fund",
  label: "Do you have 3–6 months of expenses saved outside this investment?",
  options: [
    { id: "yes-full",   label: "Yes, 6+ months",       modifier: 1 },
    { id: "yes-partial", label: "Yes, 3–6 months",      modifier: 0.5 },
    { id: "building",    label: "I'm still building it", modifier: 0 },
    { id: "no",          label: "No",                    modifier: -1 },
  ],
}
```
Rationale: A solid emergency fund means this portfolio isn't the last line of defense — the investor can afford to take more risk.

**Question 4: Income Stability**
```javascript
{
  id: "income-stability",
  label: "How would you describe your income?",
  options: [
    { id: "very-stable",  label: "Very stable (salaried, tenured, etc.)",  modifier: 0.5 },
    { id: "stable",       label: "Stable with some variability",           modifier: 0 },
    { id: "variable",     label: "Variable (commission, freelance, gig)",  modifier: -0.5 },
    { id: "uncertain",    label: "Currently uncertain or between jobs",    modifier: -1 },
  ],
}
```
Rationale: Variable or uncertain income means the investor may need to liquidate during downturns — favor capital preservation.

**Question 5: Unexpected Withdrawal**
```javascript
{
  id: "withdrawal-likelihood",
  label: "How likely are you to need some of this money unexpectedly in the next 2 years?",
  options: [
    { id: "very-unlikely", label: "Very unlikely",        modifier: 0.5 },
    { id: "unlikely",      label: "Unlikely",             modifier: 0 },
    { id: "possible",      label: "Possible",             modifier: -0.5 },
    { id: "likely",        label: "Likely",               modifier: -1 },
  ],
}
```
Rationale: Near-term liquidity needs demand a more conservative posture regardless of stated risk tolerance.

**Question 6: Checking Behavior**
```javascript
{
  id: "checking-behavior",
  label: "If your portfolio dropped 15% this month, how soon would you look at it?",
  options: [
    { id: "quarterly",  label: "Whenever my next quarterly review is", modifier: 1 },
    { id: "monthly",    label: "End of the month",                     modifier: 0.5 },
    { id: "weekly",     label: "Within a week",                        modifier: 0 },
    { id: "daily",      label: "I'd check daily",                      modifier: -0.5 },
    { id: "immediately", label: "Immediately",                         modifier: -1 },
  ],
}
```
Rationale: This is a behavioral (revealed preference) risk signal — complements the stated preference from the risk question. Someone who checks daily will panic-sell regardless of what they said they'd do.

### Update the deep-dive gate text

In `src/data/questions.js`, change the deep-dive-prompt description from "Two quick follow-up questions" to "A few quick follow-up questions". Also update the `RiskDeepDivePrompt` component in `src/components/prototype/steps/RiskDeepDive.jsx` — change the hardcoded "Two quick follow-up questions" text to match.

### Update the deep-dive validation in `src/components/prototype/PrototypeSection.jsx`

The `canGoNext` function currently checks `dd['savings-pct'] && dd['experience']`. Update this to require all 6 questions:

```javascript
if (step.id === 'deep-dive') {
  const dd = q.answers.deepDive || {}
  return dd['savings-pct'] && dd['experience'] && dd['emergency-fund']
    && dd['income-stability'] && dd['withdrawal-likelihood'] && dd['checking-behavior']
}
```

### Update scoring in `src/logic/scoringUtils.js`

The `computeRiskScore` function currently reads modifiers from `answers.deepDive['savings-pct']` and `answers.deepDive['experience']`. Add the 4 new ones in the same pattern:

```javascript
if (answers.deepDive) {
  const ddKeys = ['savings-pct', 'experience', 'emergency-fund',
                  'income-stability', 'withdrawal-likelihood', 'checking-behavior']
  for (const key of ddKeys) {
    if (answers.deepDive[key]) {
      modifier += answers.deepDive[key].modifier || 0
    }
  }
}
```

This replaces the two individual `if` blocks with a loop over all deep-dive question IDs.

---

## Part 3: Define 10 Risk-Score Portfolios in `src/data/portfolios.js`

Replace the existing 5 core portfolios (conservative through aggressive) with these 10. Keep the same object shape. All `holdings` weights must sum to 100. All `assetAllocation` values must sum to 100. Do NOT modify the two existing preference-triggered portfolios (Tax-Aware and Income & Growth).

### Portfolio 1 — Ultra-Conservative
- **id**: `ultra-conservative`
- **riskScore**: 1
- **riskLabel**: "Ultra-Conservative"
- **targetReturn**: "2–3%"
- **Concept**: Near-cash capital preservation. Designed for people who cannot tolerate any principal loss.
- **assetAllocation**: usEquity: 5, intlEquity: 5, usBonds: 75, alternatives: 0, cash: 15
- **holdings**: SHY (35%), AGG (20%), TIP (15%), IUSB (5%), IVV (5%), IEFA (5%), cash implied in allocation (15%)
  - Note: cash doesn't need an ETF — just reflect it in assetAllocation. Holdings that ARE ETFs should sum to 85.
- **suitableFor**: goals: ["home", "income"], minTimeline: "under-2"

### Portfolio 2 — Conservative
- **id**: `conservative`
- **riskScore**: 2
- **riskLabel**: "Conservative"
- **targetReturn**: "3–5%"
- **assetAllocation**: usEquity: 15, intlEquity: 10, usBonds: 65, alternatives: 0, cash: 10
- **holdings**: AGG (30%), SHY (15%), TIP (10%), IUSB (10%), IVV (10%), BLCR (5%), IEFA (10%), MUB (10%)
- **suitableFor**: goals: ["home", "retirement", "income"], minTimeline: "under-2"

### Portfolio 3 — Moderately Conservative
- **id**: `mod-conservative`
- **riskScore**: 3
- **riskLabel**: "Moderately Conservative"
- **targetReturn**: "4–6%"
- **assetAllocation**: usEquity: 25, intlEquity: 10, usBonds: 55, alternatives: 0, cash: 10
- **holdings**: AGG (25%), IUSB (10%), TIP (10%), SHY (10%), IVV (15%), BLCR (10%), IEFA (10%), IEMG (5%), LQD (5%)
- **suitableFor**: goals: ["home", "retirement", "income", "education"], minTimeline: "2-5"

### Portfolio 4 — Conservative Balanced
- **id**: `conservative-balanced`
- **riskScore**: 4
- **riskLabel**: "Conservative Balanced"
- **targetReturn**: "5–7%"
- **assetAllocation**: usEquity: 35, intlEquity: 15, usBonds: 45, alternatives: 0, cash: 5
- **holdings**: IVV (15%), BLCR (10%), DYNF (5%), IEFA (10%), IEMG (5%), AGG (25%), IUSB (10%), TIP (10%), LQD (5%), SHY (5%)
- **suitableFor**: goals: ["retirement", "home", "income", "wealth-building", "education"], minTimeline: "2-5"

### Portfolio 5 — Balanced
- **id**: `balanced`
- **riskScore**: 5
- **riskLabel**: "Balanced"
- **targetReturn**: "6–8%"
- **assetAllocation**: usEquity: 40, intlEquity: 15, usBonds: 40, alternatives: 0, cash: 5
- **holdings**: IVV (15%), BLCR (15%), DYNF (5%), IJH (5%), IEFA (10%), IEMG (5%), AGG (20%), IUSB (10%), TIP (5%), LQD (5%)
- **suitableFor**: goals: ["retirement", "wealth-building", "education", "home"], minTimeline: "5-10"

### Portfolio 6 — Balanced Growth
- **id**: `balanced-growth`
- **riskScore**: 6
- **riskLabel**: "Balanced Growth"
- **targetReturn**: "6–9%"
- **assetAllocation**: usEquity: 50, intlEquity: 20, usBonds: 25, alternatives: 0, cash: 5
- **holdings**: IVV (20%), BLCR (15%), DYNF (10%), IJH (5%), IEFA (15%), IEMG (5%), AGG (15%), LQD (5%), TIP (5%)
- **suitableFor**: goals: ["retirement", "wealth-building", "education"], minTimeline: "5-10"

### Portfolio 7 — Growth
- **id**: `growth`
- **riskScore**: 7
- **riskLabel**: "Growth"
- **targetReturn**: "7–10%"
- **assetAllocation**: usEquity: 55, intlEquity: 25, usBonds: 17, alternatives: 0, cash: 3
- **holdings**: IVV (20%), BLCR (15%), DYNF (15%), IJH (5%), IEFA (15%), IEMG (10%), AGG (10%), LQD (5%), TIP (5%)
- **suitableFor**: goals: ["retirement", "wealth-building", "education"], minTimeline: "10-20"

### Portfolio 8 — Aggressive Growth
- **id**: `aggressive-growth`
- **riskScore**: 8
- **riskLabel**: "Aggressive Growth"
- **targetReturn**: "8–11%"
- **assetAllocation**: usEquity: 60, intlEquity: 25, usBonds: 15, alternatives: 0, cash: 0
- **holdings**: IVV (20%), BLCR (15%), DYNF (15%), IJH (5%), IJR (5%), IEFA (15%), IEMG (10%), AGG (10%), LQD (5%)
- **suitableFor**: goals: ["retirement", "wealth-building"], minTimeline: "10-20"

### Portfolio 9 — Aggressive
- **id**: `aggressive`
- **riskScore**: 9
- **riskLabel**: "Aggressive"
- **targetReturn**: "9–12%"
- **assetAllocation**: usEquity: 65, intlEquity: 28, usBonds: 7, alternatives: 0, cash: 0
- **holdings**: IVV (20%), DYNF (15%), BLCR (15%), IJH (5%), IJR (5%), ITOT (5%), IEFA (15%), IEMG (13%), AGG (7%)
- **suitableFor**: goals: ["retirement", "wealth-building"], minTimeline: "20+"

### Portfolio 10 — Maximum Growth
- **id**: `max-growth`
- **riskScore**: 10
- **riskLabel**: "Maximum Growth"
- **targetReturn**: "10–13%"
- **assetAllocation**: usEquity: 67, intlEquity: 31, usBonds: 2, alternatives: 0, cash: 0
- **holdings**: IVV (20%), DYNF (17%), BLCR (15%), IJH (5%), IJR (5%), ITOT (5%), IEFA (15%), IEMG (15%), AGG (3%)
- **suitableFor**: goals: ["retirement", "wealth-building"], minTimeline: "20+"

---

## Part 4: Style- and Preference-Triggered Variant Portfolios

These portfolios sit alongside the 10 core risk portfolios and are selected when a specific preference toggle or investment-style answer matches. They are NOT selected by risk-score matching — they are selected by explicit routing in the matching engine.

### Variant A — Global Explorer (preference: `intl`)
- **id**: `global-explorer`
- **preference**: `intl`
- **riskScore**: 6
- **riskLabel**: "Balanced Growth — Global"
- **targetReturn**: "7–10%"
- **Concept**: International-heavy for investors who want meaningful non-US exposure. ~45% international.
- **assetAllocation**: usEquity: 30, intlEquity: 45, usBonds: 15, alternatives: 0, cash: 10
- **holdings**: IEFA (20%), IEMG (15%), IXUS (10%), IVV (15%), BLCR (10%), DYNF (5%), AGG (10%), EMB (5%), TIP (5%), SHY (5%)
- **suitableFor**: goals: ["retirement", "wealth-building", "education"], minTimeline: "5-10"

### Variant B — All-Index Core (style: `index`)
- **id**: `all-index-core`
- **style**: `index`
- **riskScore**: 6
- **riskLabel**: "Balanced Growth — Index"
- **targetReturn**: "6–8%"
- **Concept**: Pure low-cost index portfolio. ZERO active ETFs. No BLCR, DYNF, BINC, BALI, BAI, or POWR.
- **assetAllocation**: usEquity: 50, intlEquity: 20, usBonds: 25, alternatives: 0, cash: 5
- **holdings**: IVV (25%), ITOT (10%), IJH (5%), IJR (5%), IEFA (15%), IXUS (5%), AGG (15%), IUSB (5%), TIP (5%), SHY (5%), IEMG (5%)
- **suitableFor**: goals: ["retirement", "wealth-building", "education", "home"], minTimeline: "5-10"

### Variant C — Active Alpha (style: `active`)
- **id**: `active-alpha`
- **style**: `active`
- **riskScore**: 7
- **riskLabel**: "Growth — Active"
- **targetReturn**: "7–11%"
- **Concept**: Leans heavily into BlackRock active strategies for alpha. BLCR, DYNF, BINC, and BALI as core.
- **assetAllocation**: usEquity: 55, intlEquity: 15, usBonds: 25, alternatives: 0, cash: 5
- **holdings**: BLCR (20%), DYNF (20%), BALI (10%), IVV (10%), IEFA (10%), IEMG (5%), BINC (15%), AGG (5%), LQD (5%)
- **suitableFor**: goals: ["retirement", "wealth-building"], minTimeline: "5-10"

### Variant D — Near-Term Reserve (auto-triggered)
- **id**: `near-term-reserve`
- **riskScore**: 1
- **riskLabel**: "Capital Preservation"
- **targetReturn**: "3–4%"
- **Concept**: Ultra-short-duration for home/education goals within 1–3 years. Capital preservation first.
- **assetAllocation**: usEquity: 10, intlEquity: 5, usBonds: 75, alternatives: 0, cash: 10
- **holdings**: SHY (30%), AGG (20%), IUSB (10%), TIP (15%), IVV (10%), BLCR (5%), IEFA (5%), MUB (5%)
- **suitableFor**: goals: ["home", "education"], minTimeline: "under-2"

---

## Part 5: Update the Matching Engine (`src/logic/matchingEngine.js`)

The matching priority order becomes:

```
1. Near-term auto-trigger  (goal is home/education AND timeline is under-2)
2. Preference variants     (taxAware → intl → income, in that order)
3. Style variants          (index → active)
4. Core risk-score match   (10 portfolios, goal + timeline filtered, closest score)
```

Here is the updated routing logic for the `matchPortfolio` function. Insert the new checks after the existing preference checks and before the goal-filtering logic:

```javascript
// 1. Near-term capital preservation
const timeline = resolveTimeline(answers)
if ((goal === 'home' || goal === 'education') && timeline === 'under-2') {
  const nearTermMatch = PORTFOLIOS.find(p => p.id === 'near-term-reserve')
  if (nearTermMatch) return { portfolio: applyThemeOverlays(nearTermMatch, themes), riskScore }
}

// 2. Preference-based variants (existing taxAware and income checks stay, add intl)
if (preferences.taxAware) {
  const taxMatch = PORTFOLIOS.find(p => p.preference === 'taxAware')
  if (taxMatch) return { portfolio: applyThemeOverlays(taxMatch, themes), riskScore }
}
if (preferences.intl) {
  const intlMatch = PORTFOLIOS.find(p => p.preference === 'intl')
  if (intlMatch) return { portfolio: applyThemeOverlays(intlMatch, themes), riskScore }
}
if (preferences.income || goal === 'income') {
  const incomeMatch = PORTFOLIOS.find(p => p.preference === 'income')
  if (incomeMatch) return { portfolio: applyThemeOverlays(incomeMatch, themes), riskScore }
}

// 3. Investment style variants
const style = answers['investment-style']?.id
if (style === 'index') {
  const indexMatch = PORTFOLIOS.find(p => p.style === 'index')
  if (indexMatch) return { portfolio: applyThemeOverlays(indexMatch, themes), riskScore }
}
if (style === 'active') {
  const activeMatch = PORTFOLIOS.find(p => p.style === 'active')
  if (activeMatch) return { portfolio: applyThemeOverlays(activeMatch, themes), riskScore }
}

// 4. Core risk-score matching (existing goal/timeline/risk logic, unchanged)
```

### Change the tie-breaker

On the final sort (the risk-score match tiebreaker), change from `a.riskScore - b.riskScore` (conservative) to `b.riskScore - a.riskScore` (growth-leaning). When two portfolios are equidistant, the more aggressive one should win — this counteracts the system's overall conservative tendencies.

---

## Part 6: Add Missing Theme Overlay

In `src/data/portfolios.js`, add to `THEME_OVERLAYS`:

```javascript
innovation: { ticker: "DYNF", weight: 10, label: "Innovation & Disruption" },
```

The `innovation` option exists in the themes question but has no corresponding overlay. Using DYNF (BlackRock's factor rotation ETF) as the proxy since it captures disruptive, momentum-driven companies.

---

## Part 7: Update the Goal Follow-Up Risk Nudges

The wealth-building follow-up in `GOAL_FOLLOWUPS` has risk nudges scaled for a 1–5 system. Scale them up for 1–10:

```
"Maximum growth"        → riskNudge: 1
"Steady growth"         → riskNudge: -1
"Preserve & grow slowly" → riskNudge: -2
```

Similarly, the retirement-older conditional nudges in `GOAL_CONDITIONALS`:

```
"Yes, significant savings" → riskNudge: 1
"No, this is my primary"   → riskNudge: -1
```

---

## What NOT to change

- Do not modify `PortfolioPieChart.jsx` — it renders any asset allocation dynamically
- Do not modify `HoldingsTable.jsx` — it renders any holdings array
- Do not remove the Tax-Aware Growth or Income & Growth preference portfolios
- Do not change the `BENCHMARK_60_40` object
- Do not change the flow architecture in `useQuestionnaire.js` — the deep-dive step already supports N questions via the `multi-question` type
- Do not add any ESG-related portfolios, preferences, or ETFs

---

## Verification

After making all changes, trace these scenarios through the full pipeline (risk question → deep-dive modifiers → goal/timeline → matching) and confirm the computed risk score and matched portfolio:

1. **25-year-old, retirement, "buy more" (base 8), never invested (-0.5), >50% savings (-0.5), no emergency fund (-1), stable income (+0.5), very unlikely withdrawal (+0.5), checks monthly (+0.5)**
   → Score: 8 + (-0.5) + (-0.5) + (-1) + 0.5 + 0.5 + 0.5 = 7.5 → rounds to 8 → Aggressive Growth (85% equity). Reasonable for a young, employed investor with some behavioral caution.

2. **22-year-old, wealth-building, "max growth" nudge (+1), "hold steady" (base 6), 5+ years exp (+0.5), under 10% savings (0), 6+ months emergency (+1), very stable income (+0.5), very unlikely withdrawal (+0.5), checks quarterly (+1)**
   → Score: 6 + 1 + 0.5 + 0 + 1 + 0.5 + 0.5 + 1 = 10 → clamped to 10 → Maximum Growth (98% equity). Correct for a young, experienced, financially secure, risk-tolerant investor.

3. **58-year-old, retirement, "sell some" (base 4), significant savings nudge (+1), 1-5yr exp (0), 25-50% savings (-0.25), partial emergency (+0.5), stable income (0), possible withdrawal (-0.5), checks weekly (0)**
   → Score: 4 + 1 + 0 + (-0.25) + 0.5 + 0 + (-0.5) + 0 = 4.75 → rounds to 5 → Balanced (55% equity / 40% bonds). Reasonable for a near-retiree with moderate risk tolerance.

4. **30-year-old, wealth-building, "preserve & grow" nudge (-2), "hold steady" (base 6), skips deep-dive**
   → Score: 6 + (-2) = 4 → Conservative Balanced (50% equity). Appropriate — they explicitly asked for preservation.

5. **Any age, any goal, picks "Pure index investing"**
   → Bypasses risk-score matching entirely → All-Index Core. Confirm zero active ETFs.

6. **Home buyer, timeline "under 2 years"**
   → Auto-routed to Near-Term Reserve regardless of risk score. Confirm ~85% bonds+cash.

7. **User toggles "Strong international exposure"**
   → Routed to Global Explorer. Confirm intl equity ≥ 40%.

8. **User who skips deep-dive, "hold steady" (base 6), no special preferences, blend style**
   → Score: 6, no modifiers → Balanced Growth (65% equity). The "blend" style falls through to normal matching.

Run the app and walk through each scenario to confirm correct portfolio rendering.
