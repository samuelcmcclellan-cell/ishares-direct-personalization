# Prompt: Add a Third AI Insight — Behavioral Scenario Stress Test

## Context

Model 2's questionnaire already has two AI-powered conversational moments (see `prompts/add-ai-insight-question.md` for the original spec). The first insight (after financial-picture) probes **emotional/behavioral** factors. The second (after themes) **synthesizes** the full profile and pressure-tests contradictions. Both work, but there's a gap: the app collects explicit risk behavior data through two multiple-choice questions — the 20% drop reaction (`risk` step, base riskScore 2-10) and the FOMO reaction (`fomo-reaction` step, fomoScore -1 to 3) — and simply takes those answers at face value. A real financial advisor wouldn't. They'd probe whether the stated tolerance is genuine conviction or aspirational self-image.

We're adding a **third AI insight** that gives the model a completely different perspective: **scenario-based behavioral prediction**. The AI takes the user's actual numbers and stated risk answers and constructs a personalized "what would you do" scenario, then analyzes whether the user's narrative response confirms or contradicts their multiple-choice risk posture.

Three AI lenses, three different angles on the same person:
1. **Insight 1** — "How do you *feel* about your financial situation?" (emotional intelligence)
2. **Insight 3 (new)** — "Here's a realistic scenario built from your profile — what would you *do*?" (behavioral prediction)
3. **Insight 2** — "Looking at everything, what *matters most*?" (priority synthesis)

## Placement

Insert `ai-insight-3` into the questionnaire flow **after `fomo-reaction` and before `income-draw`**.

Current flow in `src/data/questions.js` STEPS array:
```
... → risk → fomo-reaction → income-draw → investment-style → ...
```

New flow:
```
... → risk → fomo-reaction → AI-INSIGHT-3 → income-draw → investment-style → ...
```

At this point the AI has access to: goal, goal-followup, risk-preference (1-5 with riskNudge), financial-picture (age, retirement age, savings, income, savings rate), existing-holdings, AI Insight 1's question + response + analysis (including riskModifier and behavioralNotes), account-type, goal-conditional (if applicable), timeline, risk (the 20% drop answer with base riskScore), and fomo-reaction (with fomoScore). This is exactly the right moment — all the behavioral risk data is collected but hasn't been acted on yet.

## Files to Modify

### 1. `src/data/questions.js` — Add the step definition

Add a new step object in the STEPS array between `fomo-reaction` (line ~104) and `income-draw` (line ~108):

```js
{
  id: "ai-insight-3",
  title: "Let's make this real",
  description: "Numbers and choices only go so far. Let's see how you'd handle a scenario built from your actual situation.",
  type: "ai-insight",
  insightStep: "third",
},
```

### 2. `src/services/aiInsight.js` — Support the third step

Update the `FALLBACK_QUESTIONS` object to add a `third` key. The fallback should be something like:

> "Imagine it's 12 months from now. Your portfolio is down 15% while the market overall is flat. A colleague mentions they moved everything to cash last month and 'feel great about it.' Walk me through what goes through your head and what you'd actually do."

This fallback is good because it combines a portfolio loss with social pressure — both themes the questionnaire has already measured via multiple-choice, but now in free-text form.

Update `generateQuestion()` and `analyzeResponse()` — these already accept a `step` parameter (`'first'` or `'second'`). They pass it to the API endpoint. No structural change needed, just make sure `'third'` flows through the same way.

### 3. `api/ai-insight.js` — Backend support for the third insight

**Profile Observation Engine (`computeProfileObservations`):** Add a `step === 'third'` branch that examines the risk behavioral data specifically. New observation detectors to add:

- `RISK_BRAVADO`: `riskScore >= 8` (buy-more or buy-aggressive on 20% drop) AND `riskPrefId <= 3` (balanced or lower on growth-stability scale). Hook: "They claim they'd buy aggressively in a crash, but their growth preference is moderate — is this real conviction or just what they think a smart investor would say?"
- `FOMO_CONTRADICTS_RISK`: `fomoScore >= 3` (would switch strategies) AND `riskScore >= 8` (buy during drops). Hook: "Claims to be a contrarian buyer in downturns but also chases others' returns — these are opposing instincts. Which one shows up under real pressure?"
- `CAUTIOUS_BUT_EXPERIENCED`: `holdingsSignal === 'equity-heavy'` AND `riskScore <= 4`. Hook: "Already holds aggressive assets but says they'd sell in a downturn — have they actually lived through one, or did they inherit/auto-invest into this position?"
- `ALL_SIGNALS_ALIGNED`: `riskPrefId >= 4` AND `riskScore >= 8` AND `fomoScore <= 1`. Hook: "Every risk signal points the same direction — high conviction, low FOMO, aggressive stance. Is this genuine self-knowledge or has the user figured out the 'right' answers?"

Also incorporate first AI insight results if available:
- `AI1_ANXIETY_VS_RISK_BRAVADO`: `ai1.riskModifier < -0.5` AND `riskScore >= 8`. Hook: "First open-ended response revealed financial anxiety, but the behavioral questions show aggressive risk tolerance — the written words told a different story than the checkboxes."

**System prompt for question generation (`step === 'third'`):**

The system prompt should instruct the model to:
- Construct a **realistic, personalized financial scenario** using the user's actual numbers (their savings amount, income, age, goal).
- The scenario should involve a market event or life event that creates tension with their stated risk behavior.
- For example, if the user said they'd "buy more at lower prices" after a 20% drop, the scenario might describe their specific savings dropping by $X (calculated from their actual savings) while they're Y years from their goal.
- Ask the user to walk through what they'd think and do — not just a one-word answer, but their reasoning.
- The question should feel like an advisor saying "Let me paint a picture for you..." — vivid but professional.
- Do NOT repeat the exact 20% drop scenario from the multiple-choice question. Use a different angle: maybe a prolonged bear market (down 25% over 6 months), a sector crash affecting their chosen themes, or a combined life event + market event.

Include the same guardrails as the other insight prompts.

**System prompt for response analysis (`step === 'third'`):**

The analysis should return the standard JSON structure but with particular attention to:
- `riskModifier` (-1.5 to 1.5): Calibrated by comparing the user's narrative response against their multiple-choice answers. If the narrative confirms the stated risk posture, modifier stays near 0. If it reveals hidden anxiety despite aggressive multiple-choice answers, push negative. If it reveals genuine conviction behind conservative answers (e.g., "I know my risk tolerance is low but I'd still hold through a dip because I trust the long-term plan"), push slightly positive.
- `behavioralNotes`: Focus on the gap (or alignment) between stated and revealed risk tolerance. This note should say something the multiple-choice answers alone couldn't tell you.
- `suggestedEmphasis`: Weight this toward what the narrative reveals about the user's *actual* comfort zone, not their aspirational one.
- `profileNarrative`: Frame as a behavioral archetype like "Disciplined contrarian" or "Aspirational risk-taker" or "Pragmatic safety-seeker."

**Format the answer context** to include:
- Financial picture summary (age, savings, income, retirement age, savings rate)
- Goal and timeline
- Risk preference (1-5 label)
- 20% drop reaction (human-readable label from `RISK_LABELS`)
- FOMO reaction (human-readable label from `FOMO_LABELS`)
- AI Insight 1 question, response, and analysis (especially `behavioralNotes` and `riskModifier`)
- All observations from `computeProfileObservations(answers, 'third')`

### 4. `src/components/prototype/steps/AIInsightStep.jsx` — Support the third step

The component is already reusable and differentiates by `insightStep` prop. Add support for `'third'`:

- In the `LOADING_MESSAGES` object (line ~8), add:
  ```js
  third: { generating: 'Building a scenario from your profile…', analyzing: 'Calibrating your risk posture…' },
  ```
- In the JSX heading/description block (line ~97), add a third branch for `insightStep === 'third'`:
  - Title: `"Let's make this real"`
  - Description: `"Numbers and choices only go so far. Let's see how you'd handle a scenario built from your actual situation."`

### 5. `src/hooks/useQuestionnaire.js` — State management

- When the goal changes and dependent answers are cleared (the existing `delete next['ai-insight-1']` / `delete next['ai-insight-2']` block), also clear `ai-insight-3`.

### 6. `src/logic/scoringUtils.js` — Wire the third modifier into risk scoring

The existing `computeRiskScore` function accumulates modifiers. Currently it does NOT actually read AI insight modifiers (this is a known gap — the original prompt spec calls for it in section 5 but it wasn't wired in). When adding the third insight, also wire ALL THREE AI modifiers into scoring:

```js
// AI Insight modifiers (behavioral calibration)
const ai1 = answers['ai-insight-1']?.analysis
const ai2 = answers['ai-insight-2']?.analysis
const ai3 = answers['ai-insight-3']?.analysis
if (ai1?.riskModifier) modifier += ai1.riskModifier
if (ai2?.riskModifier) modifier += ai2.riskModifier
if (ai3?.riskModifier) modifier += ai3.riskModifier
```

Add this block after the existing holdings-signal modifier and before the timeline uplift. With three AI insights, the maximum AI-driven swing is ±4.5, but in practice the third insight's modifier will often push back *toward center* (confirming or tempering), not stack in the same direction as the first two. This is by design — the scenario question is a calibration check, not an amplifier.

### 7. `src/logic/matchingEngine.js` — Explanations and tiebreaker

In `buildExplanations()`, add the `behavioralNotes` from `ai-insight-3` to the explanations array. Use icon `'Eye'` (from lucide-react) and prefix with "Behavioral insight: ". Only include if the notes exist and aren't the neutral default.

The third insight's `suggestedEmphasis` should serve as a **secondary tiebreaker** — if Insight 2's emphasis and Insight 3's emphasis agree, that's a strong signal. If they disagree, prefer Insight 3's (the scenario-based one) because revealed behavior is more reliable than stated priorities.

### 8. `src/components/prototype/PrototypeSection.jsx` — Step rendering and data flow

This file hardcodes each AI insight step in three places. All three must be updated:

**a) AUTO_ADVANCE_STEPS set (line ~22-27):**
The current set includes `'ai-insight-1'` and `'ai-insight-2'`. Add `'ai-insight-3'`:
```js
const AUTO_ADVANCE_STEPS = new Set([
  'goal', 'goal-followup', 'risk-preference', 'timeline', 'risk',
  'account-type', 'investment-style', 'goal-conditional',
  'existing-holdings', 'fomo-reaction', 'income-draw',
  'ai-insight-1', 'ai-insight-2', 'ai-insight-3',
])
```

**b) StepRenderer switch statement (line ~35-76):**
Add a new case after `ai-insight-2` (line ~47):
```js
case 'ai-insight-3':
  return <AIInsightStep step="third" answer={answers['ai-insight-3']} onSelect={v => onSelect('ai-insight-3', v)} allAnswers={answers} />
```

**c) matchPortfolio call (line ~86-104):**
The `result` useMemo passes individual answer keys to `matchPortfolio()`. Add `'ai-insight-3'` to the object:
```js
'ai-insight-3': q.answers['ai-insight-3'],
```
Place it right after the existing `'ai-insight-2': q.answers['ai-insight-2'],` line (~102).

### 9. `src/components/prototype/ProgressBar.jsx` — Phase grouping

The ProgressBar defines 5 phases with explicit stepId lists (line ~3-8). The new `ai-insight-3` step sits between `fomo-reaction` and `income-draw`, which falls within the **Risk** phase. Add `'ai-insight-3'` to the Risk phase's `stepIds` array:

```js
{ label: 'Risk', stepIds: ['timeline', 'risk', 'ai-insight-3', 'deep-dive-prompt', 'deep-dive'] },
```

Note: `fomo-reaction` is not currently in any phase's stepIds (it's a dynamically injected step handled by the existing logic). The `ai-insight-3` step should appear in the Risk phase since it's a behavioral risk calibration step that fires right after the risk behavioral questions.

### 10. Review step — Show the third exchange

If there's a review/summary step that displays previous AI insight exchanges (question + truncated response), add `ai-insight-3` to that display. Label it "Behavioral scenario" to distinguish it from "Personal insight" and "Priority check."

---

## Slide & Deck Updates

Adding a third AI insight changes the Model 2 description in several places: the data model that feeds the web-rendered slide, the PowerPoint build script, and related copy. All three must stay in sync.

### 11. `src/data/models.js` — Model 2 data (feeds the web slide)

This file is the single source of truth for the web-rendered Slide 2 on the DeckPage (`src/pages/DeckPage.jsx`). The DeckPage reads `OPERATING_MODELS` and renders each model's `bullets` array directly (line ~98 of DeckPage.jsx). Update Model 2 (id: 2) in three places:

**a) `description` field (line ~41):**
Change:
```
"A 12+ step adaptive questionnaire with 2 AI open-text insight prompts profiles each investor…"
```
To:
```
"A 12+ step adaptive questionnaire with 3 AI open-text insight prompts profiles each investor, then a multi-factor scoring engine matches them to one of 8 risk-scored model portfolios built from a 27-ETF library spanning core index, fixed income, dividend, ESG, and BlackRock active strategies. Optional thematic overlays (AI, Clean Energy, Infrastructure, Defense) inject and boost thematic positions."
```

**b) `intakeExperience` field (line ~43):**
Change from `"12-step adaptive intake + 2 AI insights"` to:
```
"12-step adaptive intake + 3 AI insights"
```

**c) `bullets` array (line ~50-55):**
Change the first bullet from:
```
"12-step adaptive intake + 2 AI open-text insights"
```
To:
```
"12-step adaptive intake + 3 AI open-text insights"
```

**d) `userJourney` field (line ~69):**
Change:
```
"Investor completes a 12-step adaptive questionnaire with AI-generated open-text insights…"
```
This text doesn't mention a count, so no change is strictly needed — but if you want to be precise, update to:
```
"Investor completes a 12-step adaptive questionnaire with 3 AI-generated open-text insights → multi-factor scoring engine computes a composite risk score from 6+ behavioral and financial signals → matches to the best-fit portfolio from 8 risk-scored models built from 27 ETFs → optional thematic overlays (AI, Clean Energy, Infrastructure, Defense) customize the allocation."
```

### 12. `build-deck.cjs` — PowerPoint generation (Slide 2, Model 2 card)

The PowerPoint is generated by `build-deck.cjs` and saved to `public/deck/iShares_Direct_Personalization_2_Slides.pptx`. The `m2Items` array (line ~240-245) contains the Model 2 bullet points rendered inside the orange card on Slide 2.

**Update the `m2Items` array (line 240-245):**
Change the first item from:
```js
"12-step adaptive intake + 2 AI open-text insights",
```
To:
```js
"12-step adaptive intake + 3 AI open-text insights",
```

The full updated array should be:
```js
const m2Items = [
  "12-step adaptive intake + 3 AI open-text insights",
  "8 risk-scored portfolios from 27 iShares ETFs",
  "Multi-factor scoring from 6+ behavioral signals",
  "Theme overlays: AI, Clean, Infra, Defense",
];
```

**After updating**, regenerate the .pptx by running:
```bash
node build-deck.cjs
```

This writes the new file to `public/deck/iShares_Direct_Personalization_2_Slides.pptx`. Verify the regenerated file opens cleanly and the Model 2 card shows the updated bullet.

### 13. `src/pages/DeckPage.jsx` — Web slide rendering (verify, no code change needed)

`DeckPage.jsx` renders Slide 2 by mapping over `OPERATING_MODELS` and rendering each model's `bullets` array (line ~98). Since the bullets come from `models.js` (updated in step 11), no code change is needed in DeckPage.jsx itself — the web slide will automatically reflect the new bullet text.

**However, verify** that the slide renders cleanly after the `models.js` change. The bullet text is slightly longer ("3 AI" vs "2 AI") and should still fit within the card. If the card layout uses `clamp()` font sizing and percentage-based widths (which it does — see `text-[clamp(7px,0.85vw,10px)]` on line ~101), the longer text should flow naturally. Just visually confirm after the change.

---

## What Must Not Change

- The 10 core portfolios and their data structure
- The existing 2 AI insight steps (positions, prompts, analysis structure)
- The risk drop test and FOMO reaction multiple-choice questions and their scoring
- The deep-dive questions, modifiers, and skip logic
- The goal, financial-picture, timeline, and theme steps
- All existing observation detectors in `computeProfileObservations`
- The overall visual design language
- Slide 1 ("The Opportunity") content — unchanged
- Model 1 and Model 3 content in both `models.js` and `build-deck.cjs` — unchanged
- The DeckPage layout, navigation, download button, and footer — unchanged

## Success Criteria

When this is done:
1. A user going through the questionnaire answers the 20% drop and FOMO questions, then gets a vivid, personalized scenario that uses their actual numbers and goal — not a generic hypothetical.
2. The user's narrative response is analyzed for alignment or gap between their stated risk answers and their revealed behavior under a realistic scenario.
3. The third insight's modifier acts as a calibration check on the risk score — pulling aggressive-stated/anxiety-revealed users back toward safety, and nudging conservative-stated/conviction-revealed users slightly higher.
4. The results page shows the behavioral insight alongside the existing explanations.
5. All three AI modifiers are wired into `scoringUtils.js` (fixing the existing gap where insights 1 and 2 weren't connected to scoring).
6. The whole thing degrades gracefully if the API is unreachable — fallback question, neutral analysis, no scoring impact.
7. **The web-rendered Slide 2** (DeckPage) shows "3 AI open-text insights" in the Model 2 card — verified visually.
8. **The PowerPoint file** (`public/deck/iShares_Direct_Personalization_2_Slides.pptx`) is regenerated with the updated Model 2 bullet and opens cleanly.
9. The `models.js` description, intakeExperience, bullets, and userJourney all consistently reflect 3 AI insights.
