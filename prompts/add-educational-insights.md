# Prompt: Add Educational "Market Insight" Cards to the Questionnaire

## Goal

Add contextual educational content to the questionnaire steps so users **learn about investing while answering questions**. Each step should optionally display an expandable "Market Insight" card with a relevant, topical insight drawn from BlackRock's "Inside the Market" content. The insight should feel like a helpful coach whispering context — not a wall of text that blocks progress.

---

## Design Concept

Create a new `<MarketInsight>` component that renders a collapsible card **below the step description and above the options** on applicable steps. The card should:

- Be **collapsed by default** showing only a one-line teaser with a `BookOpen` icon from lucide-react and a "Learn more" toggle
- When expanded, show 2–4 sentences of educational context + an optional "Source" link to BlackRock's Inside the Market pages
- Use the existing design language: `bg-[#F5F5EB]` background, `border border-[#E5E5DD]`, rounded corners, small text (`text-xs` or `text-sm`), muted color (`text-[#4A4A4A]`)
- Include a subtle expand/collapse animation using framer-motion (already installed)
- **Never block or delay** the user's ability to answer — it's supplementary content

---

## Architecture

### 1. New file: `src/components/prototype/MarketInsight.jsx`

Create a reusable component:

```jsx
// Props:
//   teaser: string — one-line preview shown when collapsed (max ~80 chars)
//   content: string | ReactNode — the full educational insight (2-4 sentences)
//   sourceUrl: string (optional) — URL to BlackRock Inside the Market content
//   sourceLabel: string (optional) — display text for the source link (default: "BlackRock Inside the Market")

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, ChevronDown } from 'lucide-react'
```

The component should render:
- A clickable bar with `BookOpen` icon, the teaser text, and a `ChevronDown` that rotates 180° when expanded
- An `AnimatePresence` block that reveals the full content + source link
- The source link should open in a new tab (`target="_blank" rel="noopener noreferrer"`)

### 2. New file: `src/data/educationalInsights.js`

Create a map of step IDs to insight objects. **Every insight must be factually accurate, topical, and sourced from the BlackRock content below.** Use the step ID as the key.

Here are the insights to map to each step. Write the actual teaser and content text — these are the themes and talking points to draw from:

```js
export const EDUCATIONAL_INSIGHTS = {
  // ── GOAL STEP ──
  "goal": {
    teaser: "Your goal shapes everything — here's why it matters",
    content: "Your investment goal is the single biggest driver of how your portfolio should be built. A retirement saver with 30 years has a fundamentally different risk profile than someone saving for a home purchase in 3 years. Getting clear on your 'why' upfront helps avoid costly mismatches between your timeline and your portfolio's risk level.",
    sourceUrl: "https://www.blackrock.com/us/financial-professionals/insights/inside-the-market/student-of-the-market",
    sourceLabel: "Student of the Market — March 2026"
  },

  // ── RISK PREFERENCE ──
  "risk-preference": {
    teaser: "Growth vs. stability: what history shows about the tradeoff",
    content: "Since 1928, growth-oriented stocks have outperformed conservative investments over most 10-year periods — but with significantly more volatility along the way. After the longest growth stock cycle in investing history, market leadership is now showing signs of broadening, with value stocks outperforming growth so far in 2026. The right balance depends on how much short-term turbulence you can tolerate without changing your plan.",
    sourceUrl: "https://www.blackrock.com/us/financial-professionals/insights/inside-the-market/student-of-the-market",
    sourceLabel: "Student of the Market — Growth vs. Value"
  },

  // ── FINANCIAL PICTURE ──
  "financial-picture": {
    teaser: "The power of compounding: why starting matters more than timing",
    content: "Your savings rate and time horizon interact powerfully through compounding. Even modest monthly contributions can grow substantially over 20+ years. The current economic backdrop — with Q4 2025 earnings showing a fifth consecutive quarter of double-digit growth and unemployment at 4.4% — supports the case for consistent, long-term investing rather than trying to time market entry.",
    sourceUrl: "https://www.blackrock.com/us/financial-professionals/insights/inside-the-market",
    sourceLabel: "Inside the Market — Macro Minute"
  },

  // ── EXISTING HOLDINGS ──
  "existing-holdings": {
    teaser: "Diversification is showing renewed value in 2026",
    content: "After years where concentrated stock portfolios dominated, diversification is proving its worth again. International stocks are off to their best start in decades relative to U.S. stocks, and the historic stock-bond correlation that frustrated investors in recent years has begun to ease. Understanding what you already own helps ensure your new portfolio complements rather than concentrates your exposure.",
    sourceUrl: "https://www.blackrock.com/us/financial-professionals/insights/inside-the-market/student-of-the-market",
    sourceLabel: "Student of the Market — Diversification"
  },

  // ── ACCOUNT TYPE ──
  "account-type": {
    teaser: "Account type affects your after-tax returns more than you think",
    content: "The type of account you invest in determines how — and when — your gains are taxed. A Roth IRA lets investments grow tax-free, while a traditional IRA or 401(k) defers taxes until withdrawal. For taxable accounts, tax-aware strategies like municipal bonds or tax-loss harvesting can meaningfully improve after-tax outcomes over time.",
    sourceUrl: "https://www.blackrock.com/us/financial-professionals/insights/inside-the-market/advisor-outlook",
    sourceLabel: "Advisor Outlook — March 2026"
  },

  // ── TIMELINE ──
  "timeline": {
    teaser: "Time horizon is your biggest risk management tool",
    content: "U.S. stocks recently posted nine consecutive months of gains — the longest streak since 2018. When that streak ended, history showed that forward returns were still typically positive. The longer your time horizon, the more you can weather short-term pullbacks and benefit from these recovery patterns. Short timelines demand more stability because there's less time to recover from dips.",
    sourceUrl: "https://www.blackrock.com/us/financial-professionals/insights/inside-the-market/student-of-the-market",
    sourceLabel: "Student of the Market — Winning Streaks"
  },

  // ── RISK TOLERANCE (20% drop scenario) ──
  "risk": {
    teaser: "Geopolitical shocks test investor resolve — but history favors discipline",
    content: "Major geopolitical events — from wars to oil crises — understandably create anxiety. But looking at market performance before and after major shocks over the past century, longer-term returns have generally been positive even after events that caused significant initial drawdowns. Knowing your honest reaction to a drop helps us build a portfolio you'll actually stick with when headlines get scary.",
    sourceUrl: "https://www.blackrock.com/us/financial-professionals/insights/inside-the-market/student-of-the-market",
    sourceLabel: "Student of the Market — Geopolitical Volatility"
  },

  // ── FOMO REACTION ──
  "fomo-reaction": {
    teaser: "The 'Magnificent Seven' lesson: why chasing winners can backfire",
    content: "After dominating returns in 2023 and 2024, the so-called Magnificent Seven mega-cap tech stocks are all trailing the S&P 500 so far in 2026. Market leadership broadening is historically healthier for markets. The urge to switch strategies based on someone else's recent gains often means buying high and selling low — the opposite of what builds long-term wealth.",
    sourceUrl: "https://www.blackrock.com/us/financial-professionals/insights/inside-the-market/student-of-the-market",
    sourceLabel: "Student of the Market — Market Leaders"
  },

  // ── INCOME DRAW ──
  "income-draw": {
    teaser: "Income strategies are evolving beyond traditional bonds",
    content: "With cash rates having fallen and potentially falling further, investors seeking income are looking beyond savings accounts and CDs. Multi-sector and non-traditional bond strategies have delivered higher annualized returns than cash and core bonds since late 2022. Whether you need income now or later shapes how much of your portfolio should prioritize yield versus growth.",
    sourceUrl: "https://www.blackrock.com/us/financial-professionals/insights/inside-the-market",
    sourceLabel: "Inside the Market — Income Strategies"
  },

  // ── INVESTMENT STYLE ──
  "investment-style": {
    teaser: "Index vs. active: the case for both is evolving",
    content: "Over the past three years, 53% of individual tech stocks lost money — but only 1.6% of diversified technology funds did. In a range-bound interest rate environment, active fixed income strategies have outperformed passive approaches. The right blend of index and active depends on where you invest: broad markets often favor index, while specialized segments and bonds may benefit from active management.",
    sourceUrl: "https://www.blackrock.com/us/financial-professionals/insights/inside-the-market/student-of-the-market",
    sourceLabel: "Student of the Market — Diversified Funds"
  },

  // ── THEMES ──
  "themes": {
    teaser: "AI remains a structural theme — but the opportunity is broadening",
    content: "While AI-related volatility made headlines in early 2026, earnings momentum in technology and AI investment remains strong. BlackRock maintains a preference for the AI theme given its projected boost to earnings, but also sees opportunities broadening to non-AI sectors, international markets, and infrastructure. Thematic investing works best as a complement to a diversified core — not a replacement for it.",
    sourceUrl: "https://www.blackrock.com/us/financial-professionals/insights/inside-the-market/advisor-outlook",
    sourceLabel: "Advisor Outlook — AI & Market Leadership"
  },

  // ── PREFERENCES (toggles) ──
  "preferences": {
    teaser: "International and alternative exposures are earning their place in 2026",
    content: "International equities are outperforming U.S. stocks so far in 2026, with emerging markets off to their best start versus U.S. stocks since 1994. Meanwhile, liquid alternatives like global macro and market neutral strategies have remained largely uncorrelated during equity drawdowns. These diversifiers — alongside tax-aware and income-focused strategies — can help improve risk-adjusted outcomes in a portfolio.",
    sourceUrl: "https://www.blackrock.com/us/financial-professionals/insights/inside-the-market/advisor-outlook",
    sourceLabel: "Advisor Outlook — Diversification"
  },
}
```

### 3. Integrate into existing step components

Modify these files to render `<MarketInsight>` between the description `<p>` tag and the options grid/list. Import `EDUCATIONAL_INSIGHTS` and look up the insight by the step's `id`. If no insight exists for a step, render nothing.

**Files to modify — insert `<MarketInsight>` after the `<p>` description tag and before the options container:**

- `src/components/prototype/steps/GoalStep.jsx` — Insert between the `<p className="text-[#7A7A7A] mb-8">` and the `<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">`. The step ID is always `"goal"` here.

- `src/components/prototype/steps/GoalFollowUpStep.jsx` — This component is reused for many steps (`risk-preference`, `account-type`, `existing-holdings`, `fomo-reaction`, `income-draw`, `investment-style`, and the actual `goal-followup`). It receives `step` as a prop. Insert MarketInsight between the `<p className="text-[#7A7A7A] mb-8">` and the `<div className="flex flex-col gap-3 max-w-lg">`. Use `step.id` to look up the insight: `EDUCATIONAL_INSIGHTS[step.id]`. Many step IDs reuse this component, so the lookup must be dynamic.

- `src/components/prototype/steps/FinancialPictureStep.jsx` — Insert after the step description and before the sliders section.

- `src/components/prototype/steps/RiskStep.jsx` — Insert after the description paragraph and before the risk options.

- `src/components/prototype/steps/TimelineStep.jsx` — Insert after the description paragraph and before the timeline options.

- `src/components/prototype/steps/ThemesStep.jsx` — Insert after the description paragraph and before the theme option cards.

- `src/components/prototype/steps/PreferencesStep.jsx` — Insert after the description paragraph and before the toggle switches.

**Do NOT add insights to:** `ai-insight-1`, `ai-insight-2`, `ai-insight-3` (these are AI-driven and should stay clean), `deep-dive-prompt`, `deep-dive` (these are optional fine-tuning), `review` (summary screen), or any `goal-followup` / `goal-conditional` steps (keep follow-ups fast and focused).

### 4. Filter logic

In each step component, only render the `<MarketInsight>` if an insight exists for that step ID:

```jsx
import { MarketInsight } from '../MarketInsight'
import { EDUCATIONAL_INSIGHTS } from '../../../data/educationalInsights'

// Inside the component, between description and options:
{EDUCATIONAL_INSIGHTS[step.id] && (
  <MarketInsight {...EDUCATIONAL_INSIGHTS[step.id]} />
)}
```

For `GoalStep.jsx` specifically, use `"goal"` as the hardcoded key since the step ID is always `goal`.

---

## Styling Requirements

- The insight card should use `bg-[#F5F5EB]` with `border border-[#E5E5DD]` and `rounded-xl`
- Teaser row: `flex items-center gap-2 px-4 py-3 cursor-pointer`
- `BookOpen` icon: `w-4 h-4 text-[#7A7A7A]`
- Teaser text: `text-sm text-[#4A4A4A] font-medium`
- "Learn more" / "Show less" text: `text-xs text-[#B9B9AF] ml-auto`
- Expanded content: `px-4 pb-4 text-sm text-[#4A4A4A] leading-relaxed`
- Source link: `text-xs text-[#B9B9AF] hover:text-black underline transition-colors mt-2 inline-block`
- Add `mb-6` to the outer wrapper so there's spacing before the options
- ChevronDown rotation: use framer-motion `animate={{ rotate: isOpen ? 180 : 0 }}`

---

## Content Accuracy Rules

**All insight content MUST:**
1. Be factually grounded in the BlackRock "Inside the Market" publications (Student of the Market March 2026, Advisor Outlook March 2026, Inside the Market hub)
2. Not make forward-looking promises about returns or specific investment outcomes
3. Use past tense or present tense for historical data ("markets have..." not "markets will...")
4. Link to the correct BlackRock source page
5. Be educational in tone — not promotional or advisory
6. Be concise — the expanded content should be 2–4 sentences max

**Source URLs to use:**
- Student of the Market: `https://www.blackrock.com/us/financial-professionals/insights/inside-the-market/student-of-the-market`
- Inside the Market hub: `https://www.blackrock.com/us/financial-professionals/insights/inside-the-market`
- Advisor Outlook: `https://www.blackrock.com/us/financial-professionals/insights/inside-the-market/advisor-outlook`

---

## Testing Checklist

After implementation, verify:
- [ ] Each insight card renders collapsed by default on the correct step
- [ ] Clicking expands/collapses with smooth animation
- [ ] Source links open in new tabs and point to valid BlackRock URLs
- [ ] Insights do NOT appear on AI insight steps, deep-dive, review, goal-followup, or goal-conditional steps
- [ ] The questionnaire still auto-advances correctly on single-select steps (the insight card should not interfere with `onSelect` handlers or the 350ms auto-advance timer in `PrototypeSection.jsx`)
- [ ] The app builds without errors (`npm run build`)
- [ ] Mobile responsive — cards should stack cleanly on small screens
