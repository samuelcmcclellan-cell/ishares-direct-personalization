# Claude Code Prompt — Spotlight Model 2, Larger Icons, New Defaults, Radar Chart

## Context

This is a React + Vite app (`src/`) for a portfolio personalization demo. It uses Tailwind CSS 4, Lucide React icons, Framer Motion animations, and Recharts for charts. The app has three sections: Overview, Models (three operating model cards), and a Prototype section containing a multi-step questionnaire that matches users to one of 33 portfolios.

Key files you'll be editing:

- `src/components/models/ModelCard.jsx` — renders each of the 3 model cards in a grid
- `src/components/models/ModelsSection.jsx` — the section containing all 3 model cards
- `src/components/prototype/PrototypeSection.jsx` — the interactive demo section, has a yellow badge reading "Interactive Demo — Model 2: AI-Guided Portfolios"
- `src/components/prototype/steps/FinancialPictureStep.jsx` — slider-based assumptions form with 5 fields (currentAge, retirementAge, currentSavings, savingsRate, annualIncome) and a projection AreaChart
- `src/components/prototype/ResultsView.jsx` — displays the recommended portfolio, risk gauge, explanations, pie chart, and holdings table
- `src/logic/scoringUtils.js` — `computeRiskScore()` function that calculates a 1–10 risk score from multiple behavioral/financial signals
- `src/data/models.js` — `OPERATING_MODELS` array with 3 model objects (id 1, 2, 3)
- `src/components/overview/ValuePillars.jsx` — 3 value pillar cards with icons
- `src/components/overview/ProblemStatement.jsx` — problem/opportunity cards with icons
- `src/components/prototype/steps/GoalStep.jsx` — goal selection with icons

Design tokens: green `#028E53`, yellow accent `#FEDC00`, light bg `#F5F5EB`, border `#E5E5DD`, text `#4A4A4A`, muted `#7A7A7A`.

---

## Changes to implement

### 1. Put a bigger spotlight on "AI-Guided Portfolios" (Model 2)

Make Model 2 visually dominant across the app. Apply all of these:

**In `ModelsSection.jsx` + `ModelCard.jsx`:**
- Give the Model 2 card a distinct "featured" treatment: a yellow `#FEDC00` left border (or top border) that's 3–4px wide, a subtle yellow glow shadow (`shadow-[0_0_20px_rgba(254,220,0,0.25)]`), and slightly larger scale (`scale-[1.03]`) compared to Models 1 and 3. Add a small "Featured" or "Live Demo Below" pill badge in the top-right corner of the Model 2 card using the yellow accent color.
- Pass a `featured` boolean prop from `ModelsSection.jsx` to `ModelCard.jsx` for `model.id === 2`.
- In `ModelCard.jsx`, conditionally apply the featured styles when `featured` is true. The featured card's icon container should be larger (w-14 h-14 instead of w-12 h-12) with a stronger yellow background (`bg-[#FEDC00]/50` instead of `/30`).

**In `PrototypeSection.jsx`:**
- Make the yellow badge ("Interactive Demo — Model 2: AI-Guided Portfolios") bigger and more prominent. Increase text to `text-lg`, icon to `w-6 h-6`, padding to `px-6 py-3`. Add a pulsing animation using Framer Motion (a subtle scale pulse from 1.0 to 1.02 repeating every 2 seconds) on the badge.
- Below the badge, increase the heading "Try It Yourself" from `text-3xl` to `text-4xl`.

### 2. Use more and larger icons throughout

Systematically upgrade icon sizes and add icons where they're currently missing:

**Global icon size upgrades:**
- `ModelCard.jsx`: Icon inside the yellow square goes from `w-6 h-6` → `w-7 h-7` (and `w-8 h-8` for the featured card). The container goes from `w-12 h-12` → `w-14 h-14`.
- `ValuePillars.jsx`: Pillar icons — increase from whatever they are now to at least `w-8 h-8` inside `w-16 h-16` containers.
- `ProblemStatement.jsx`: Increase problem/opportunity icons to `w-7 h-7` inside `w-14 h-14` containers.
- `GoalStep.jsx`: If goal option icons exist, increase them to `w-8 h-8`.
- `ResultsView.jsx`: The "Why This Portfolio" explanation icons are currently `w-3.5 h-3.5` inside `w-7 h-7` containers — increase to `w-5 h-5` inside `w-10 h-10` containers.

**Add icons where missing:**
- In the `FinancialPictureStep.jsx` sliders, add a small icon to the left of each slider label:
  - `currentAge` → `Calendar` icon
  - `retirementAge` → `Sunset` icon
  - `currentSavings` → `PiggyBank` icon
  - `savingsRate` → `TrendingUp` icon
  - `annualIncome` → `DollarSign` icon
  - Size: `w-4 h-4` inline with the label text, color `#7A7A7A`
- Import these from `lucide-react`.

### 3. Update default assumptions in `FinancialPictureStep.jsx`

Change the `SLIDERS` array default values (these are the base defaults before smart defaults kick in):

```
currentAge:     35  (already 35, no change)
retirementAge:  70  (currently 65, change to 70)
currentSavings: 100000  (currently 50000, change to 100000)
savingsRate:    10  (already 10, no change)
annualIncome:   200000  (currently 100000, change to 200000)
```

Also update the fallback `base` object inside the `getSmartDefaults()` function (around line 117–122) to match:
```js
const base = {
  currentAge: inferredAge,
  retirementAge: Math.max(inferredAge + 5, 70),  // was 65, now 70
  currentSavings: 100000,   // was 50000
  savingsRate: 10,          // unchanged
  annualIncome: 200000,     // was 100000
}
```

### 4. Add a radar chart mapping the user's risk profile characteristics

Add a new `RadarChart` component to the `ResultsView` that visualizes the user's profile across the dimensions that feed into the risk score. Use Recharts' `RadarChart`, `PolarGrid`, `PolarAngleAxis`, `PolarRadiusAxis`, and `Radar` components (Recharts is already installed).

**New file: `src/components/prototype/RiskRadarChart.jsx`**

This component receives the user's `answers` object and computes normalized 0–10 scores for these 6 dimensions:

1. **Risk Tolerance** — from `answers.risk.riskScore` (already 1–10)
2. **Growth Preference** — from `answers['risk-preference'].riskNudge`, map the -2 to +2 range to 0–10 (so -2→0, 0→5, +2→10)
3. **Time Horizon** — from `answers.timeline.id`, map: `under-2`→2, `2-5`→4, `5-10`→6, `10-20`→8, `20+`→10
4. **Financial Cushion** — derived from financial-picture answers: combine currentSavings (normalized against max 2M) and emergency fund status from deep-dive if available. Simple approach: `Math.min(10, Math.round(answers['financial-picture']?.currentSavings / 200000))`
5. **Experience Level** — from `answers.deepDive?.experience` if available: `never`→1, `under-1`→3, `1-5`→6, `5-plus`→9. Default to 5 if deep-dive was skipped.
6. **Behavioral Stability** — from fomo-reaction: `fomoScore` of -1→8 (cautious=stable), 0→6, 1→5, 3→2 (FOMO-prone=unstable). Default 5.

**Chart design:**
- Use the green color `#028E53` with 20% fill opacity for the radar area
- `PolarGrid` with `stroke="#E5E5DD"`
- `PolarAngleAxis` labels in `text-xs` with fill `#4A4A4A`
- Max domain `[0, 10]` on the radius axis, hide radius labels to keep it clean
- Wrap in a `ResponsiveContainer` with height 280
- Add a heading: "Your Investor Profile" styled like the other section headings (`text-sm font-semibold uppercase tracking-wider text-[#7A7A7A] mb-4`)

**Integration in `ResultsView.jsx`:**
- Import `RiskRadarChart` and place it in a new full-width section between the "Why This Portfolio" explanations block and the asset allocation / about grid. Wrap it in the same card style used by adjacent sections: `bg-[#F5F5EB] border border-[#E5E5DD] rounded-2xl p-6 mb-8`.
- Pass `answers` as a prop down through: `PrototypeSection.jsx` → `ResultsView` → `RiskRadarChart`. The `answers` object is already available in `PrototypeSection.jsx` as `q.answers`. Add it to the `ResultsView` component's props alongside the existing `portfolio`, `riskScore`, `explanations`, `profileNarrative`, and `onReset`.

---

## Quality bar

- All new UI should match the existing design language: rounded-2xl cards, `#F5F5EB` backgrounds, `#E5E5DD` borders, the green/yellow/black palette, Inter font, Tailwind utility classes.
- Test that the app builds and runs without errors (`npm run dev`).
- Icons should feel proportional — don't go so large they overwhelm text, but large enough to be visually prominent decorative elements.
- The radar chart should look polished with no overlapping labels. If axis labels are long, abbreviate them (e.g., "Behavioral Stability" → "Stability").
- The Model 2 spotlight should be noticeable but tasteful — not garish.
