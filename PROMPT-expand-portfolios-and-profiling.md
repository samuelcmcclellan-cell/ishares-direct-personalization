# Prompt: Expand Portfolios, Strengthen AI Influence, and Deepen User Profiling

## Context

This is a Next.js portfolio personalization app. The decision pipeline flows:
1. User answers questionnaire (`src/data/questions.js` defines steps, `src/hooks/useQuestionnaire.js` manages flow)
2. Risk score is computed (`src/logic/scoringUtils.js` — base score + additive modifiers, clamped 1–10)
3. Portfolio is matched (`src/logic/matchingEngine.js` — tiered: hard overrides → preference variants → style variants → core risk-score matching with goal/timeline filters)
4. Theme overlays are applied post-selection (`matchingEngine.js:applyThemeOverlays`)
5. Explanations are built for the UI (`matchingEngine.js:buildExplanations`)
6. AI behavioral questions are generated and analyzed server-side (`api/ai-insight.js` using OpenAI)

Currently there are 16 portfolios: 10 core (risk 1–10), plus `tax-aware-balanced`, `income-focused`, `global-explorer`, `all-index-core`, `active-alpha`, and `near-term-reserve`. THEME_OVERLAYS has 4 entries (ai/BAI, clean-energy/POWR, dividend/DGRO, innovation/DYNF).

**IMPORTANT**: Before making any changes, do a `git show HEAD:<filepath>` for each file you plan to edit. The working tree files are truncated — the committed versions in git are the complete, correct source. Restore any truncated files from git before editing.

### ETF reference (what each ticker actually is)

Several ETFs in the current codebase are mislabeled or used incorrectly. Here's what they actually are — use this as the source of truth when building portfolios and theme overlays:

| Ticker | Full name | What it actually is | Role |
|---|---|---|---|
| **BAI** | iShares A.I. Innovation and Tech Active ETF | Actively managed global AI/tech equities (NVIDIA, Broadcom, TSMC). 51 holdings, 0.55% ER. | Thematic — AI exposure |
| **DYNF** | iShares U.S. Equity Factor Rotation Active ETF | Actively rotates across 5 factors (quality, value, size, min-vol, momentum) based on market regime. NOT innovation. | Core holding — smart-beta factor exposure |
| **POWR** | iShares U.S. Power Infrastructure ETF | Tracks S&P U.S. Power Infrastructure Select Index — grid operators, utilities, electrical equipment. Converted from FILL (global energy producers) in Oct 2025. NOT clean energy. | Thematic — power/grid infrastructure |
| **ICLN** | iShares Global Clean Energy ETF | 133 global clean energy companies — solar, wind, hydro, biofuels. 0.39% ER. | Thematic — actual clean energy |
| **DGRO** | iShares Core Dividend Growth ETF | US equities with consistently growing dividends. Morningstar Gold. 0.04% ER. | Drop from theme overlays per requirements |
| **BALI** | iShares U.S. Large Cap Premium Income Active ETF | Covered-call income strategy on large-cap US stocks. BlackRock Systematic team. 189 holdings. | Income-oriented portfolios |
| **BINC** | iShares Flexible Income Active ETF | Multi-sector active bond fund (Rick Rieder). HY, EM debt, CLOs, securitized. ~5.6% yield. | Income/bond allocation |
| **IDEF** | iShares Defense Industrials Active ETF | Defense & aerospace companies (RTX, Lockheed, Palantir). NOT "defensive equity." | Thematic only if you want a defense theme — don't use as a generic "low-vol" holding |
| **BLCR** | iShares Large Cap Core Active ETF | Active US large-cap equity | Core holding — active large-cap |
| **IVV** | iShares Core S&P 500 ETF | S&P 500 index | Core holding — US large-cap index |
| **IEFA** | iShares Core MSCI EAFE ETF | Developed int'l ex-US | Core holding — int'l developed |
| **IEMG** | iShares Core MSCI Emerging Markets ETF | Emerging markets | Core holding — EM |
| **IJH** | iShares Core S&P Mid-Cap ETF | US mid-cap | Core holding |
| **IJR** | iShares Core S&P Small-Cap ETF | US small-cap | Core holding |
| **ITOT** | iShares Core S&P Total U.S. Stock Market ETF | Total US market | Core holding |
| **IXUS** | iShares Core MSCI Total International Stock ETF | Total international | Core holding |
| **AGG** | iShares Core U.S. Aggregate Bond ETF | US investment-grade bonds | Core holding — bonds |
| **IUSB** | iShares Core Total USD Bond Market ETF | Broad US bonds | Core holding — bonds |
| **TIP** | iShares TIPS Bond ETF | Inflation-protected bonds | Core holding — inflation hedge |
| **SHY** | iShares 1-3 Year Treasury Bond ETF | Short-term treasuries | Core holding — near-cash |
| **LQD** | iShares iBoxx $ Investment Grade Corporate Bond ETF | IG corporate bonds | Core holding — credit |
| **MUB** | iShares National Muni Bond ETF | Municipal bonds | Tax-aware portfolios |
| **HYG** | iShares iBoxx $ High Yield Corporate Bond ETF | High-yield corporate bonds | Income/higher-risk bond exposure |
| **EMB** | iShares J.P. Morgan USD Emerging Markets Bond ETF | EM sovereign debt in USD | Int'l/income bond exposure |

## What to do

Make three coordinated changes across the codebase. All changes must keep the app building and running — the questionnaire flow, scoring math, matching logic, theme overlays, explanation builder, and results UI must all work end-to-end.

### 1. Roughly double the portfolio count (~32 total)

The current 10 core portfolios map 1:1 with risk scores 1–10. Expand this so there's more differentiation — users with similar risk scores but different goals, timelines, or behavioral profiles should land on meaningfully different portfolios.

Guidelines for the new portfolios:
- **Create goal-oriented variants for the core risk tiers** — e.g., a risk-5 portfolio optimized for retirement accumulation looks different from a risk-5 portfolio for education savings. Not every risk level needs every goal variant — use judgment about where the differentiation actually matters.
- **Create timeline-sensitive variants** — a risk-7 investor with a 20+ year horizon can hold different things than a risk-7 investor with a 10-year horizon.
- **Expand the preference and style variants** — right now each preference (taxAware, intl, income) maps to a single fixed portfolio regardless of risk score. Consider having at least a conservative and aggressive version of each, or make them risk-tiered.
- **ETF usage rules**:
  - **DYNF** is a factor rotation fund. Use it as a core holding for smart-beta exposure in growth-oriented portfolios. Do NOT label it as "innovation."
  - **POWR** is U.S. power infrastructure, not clean energy. Use it in a power/infrastructure theme if you want, or as a holding in portfolios where infrastructure exposure makes sense. Do NOT label it as "clean energy."
  - **ICLN** is the actual clean energy ETF. Use this for the clean energy theme overlay.
  - **BAI** stays as the AI theme. In growth and aggressive portfolios, consider giving it a meaningful allocation (5–10%) as a core holding, not just a theme overlay.
  - **BALI** is a covered-call premium income fund. Use it in income-focused and conservative-income portfolios where the yield matters.
  - **BINC** is an active multi-sector bond fund. Use it where you'd want flexible fixed income (already in `active-alpha`, could appear in more income-oriented portfolios).
  - **IDEF** is defense industrials (Lockheed, RTX, Palantir) — only use it if you create a defense/infrastructure theme. Don't use it as generic "low volatility" or "defensive equity."
  - Drop **DGRO** from theme overlays entirely.
  - Add other iShares ETFs from the reference table where they make portfolio sense. Every portfolio's holdings weights must sum to 100.
- **Fix theme overlays**: Replace the current mislabeled entries. The themes question in `questions.js` and the `THEME_OVERLAYS` object in `portfolios.js` must match. Suggested rework:
  - `ai` → BAI (keep, correct as-is)
  - `clean-energy` → swap POWR for **ICLN** and fix the label/description
  - `innovation` → DYNF is wrong for this. Pick a different theme entirely (power infrastructure with POWR? defense with IDEF? or just drop this theme and replace with something else). Use judgment.
  - `dividend` → drop DGRO per requirements. Either remove the dividend theme or replace it.
- **Fix the shallow-clone bug** in `applyThemeOverlays` (line 14 of `matchingEngine.js`). It does `[...portfolio.holdings]` but the inner `{ticker, weight}` objects are shared references — mutations bleed back into the `PORTFOLIOS` source array. Deep-clone the holding objects.
- **Update `suitableFor`** on each portfolio with accurate `goals` arrays and `minTimeline` values.
- **Update the matching engine** to take advantage of the expanded portfolio set. The preference/style overrides (tiers 2 and 3) need rethinking if you're adding risk-tiered variants of those. Use the computed risk score to pick the best variant rather than always returning a single fixed portfolio.

### 2. Give AI behavioral insights more weight in matching

Currently the two AI insight questions contribute `riskModifier` (±1.5 each, ±3.0 combined) and `suggestedEmphasis` (used only as a minor tiebreaker). The AI analysis also returns `timelineConfidence` and `behavioralNotes` — but `timelineConfidence` is never consumed.

Make the AI insights more influential:
- **Increase the `riskModifier` range** — consider ±2.0 or ±2.5 per question instead of ±1.5. Update the clamp in `api/ai-insight.js` and the analysis system prompt's scoring guidance to match.
- **Wire in `timelineConfidence`** — if the AI detects the user is thinking shorter-term than their stated timeline, that should matter. Have `computeRiskScore` or `matchPortfolio` use this signal. Maybe it applies a downward nudge, or maybe it influences the timeline filtering in matching.
- **Wire in `suggestedEmphasis` more directly** — right now it's only a tiebreaker in the sort. If the AI says "income" and the user didn't toggle the income preference, maybe the matching engine should still consider income-oriented portfolios. Use your judgment on how strong this signal should be — it shouldn't override explicit user choices, but it should be more than a tiebreaker.
- **Add more variance to the AI question generation** — the system prompts in `api/ai-insight.js` currently produce similar styles of questions. Add more diversity: sometimes probe financial anxiety, sometimes probe overconfidence, sometimes ask scenario-based questions ("imagine you just inherited $50K..."), sometimes ask about financial role models or past decisions. The goal is that repeated users get noticeably different questions. Adjust the temperature or add randomized prompt elements to the system prompts.
- **Update `buildExplanations`** to surface the AI's influence more clearly when it meaningfully shifted the result.

### 3. Add 2–3 new questionnaire questions to deepen profiling

The current questionnaire has a good flow but there are profiling gaps. Add a small number of new questions — prioritize signal-to-noise ratio over volume. The UX should stay smooth (no one wants to answer 30 questions).

Areas where new questions would help:
- **Existing holdings or portfolio experience** — does the user already hold investments? This is different from the deep-dive "experience" question (which asks duration). Knowing they already have a 401k heavy in bonds might push equity-heavier here.
- **Concentration comfort** — are they OK with a few big bets, or do they want broad diversification? This could influence how many holdings are in the portfolio and how concentrated the weights are.
- **Reaction to missing out** — the current risk question only probes loss aversion. FOMO/regret-from-inaction is a separate behavioral dimension that matters for portfolio stickiness.
- **Income needs timing** — for non-income-goal users, do they expect to draw from this portfolio at some point? This is partially covered by the deep-dive withdrawal-likelihood question, but making it a first-class question (not gated behind the deep-dive opt-in) would capture it for more users.

You don't have to use all of these — pick the 2–3 that add the most differentiation signal with the least friction. Add them to `STEPS` in `questions.js`, make sure `useQuestionnaire.js` handles them in the flow, wire their answers into `computeRiskScore` as modifiers or into `matchPortfolio` as matching signals, and have `buildExplanations` reference them when relevant.

## Important constraints

- **Restore truncated files first**: `git checkout HEAD -- src/logic/scoringUtils.js src/logic/matchingEngine.js src/data/portfolios.js src/data/questions.js` before editing.
- **All holdings arrays must sum to 100.** Validate this programmatically after you're done.
- **Every portfolio needs `id`, `name`, `subtitle`, `riskScore`, `riskLabel`, `targetReturn`, `description`, `assetAllocation`, `holdings`, and `suitableFor`.** Variant portfolios also need `preference` or `style` fields so the matching engine can find them.
- **The matching engine must always return a result.** The fail-open pattern (if a filter eliminates everything, skip the filter) must be preserved.
- **Test the scoring math.** After making changes, verify with a few example answer objects that `computeRiskScore` produces sensible numbers and `matchPortfolio` returns appropriate portfolios. Log or console.log some test cases.
- **Keep the OpenAI API contract stable.** The analysis response must still return `{ riskModifier, timelineConfidence, behavioralNotes, suggestedEmphasis }`. You can add fields, but don't remove or rename existing ones.
- **Don't break the ResultsView.** It reads `portfolio.name`, `portfolio.holdings`, `portfolio.assetAllocation`, `portfolio.targetReturn`, `portfolio.riskLabel`, `portfolio.themeOverlays`, `riskScore`, and `explanations`. All of these must still be present in the output of `matchPortfolio`.
