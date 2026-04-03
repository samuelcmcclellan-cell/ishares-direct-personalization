# Prompt: Make Model 2 an AI-Powered Portfolio Recommendation Engine

## The Big Picture

This app's Model 2 ("AI-Guided Portfolios") is a step-by-step questionnaire that collects investor profile data and matches users to one of 10 core portfolios. Right now it's entirely deterministic — preset questions, preset options, hardcoded modifiers, rules-based matching. That works, but it misses the behavioral and emotional nuance that a real financial advisor would pick up on in conversation.

We're adding **two AI-powered conversational moments** into the existing flow. These aren't replacing anything — the risk-preference scale, deep-dive, themes, preferences, and all existing steps stay exactly as they are. The AI steps layer on top, turning this from a static questionnaire into something that feels like an intelligent intake.

**First AI Insight** — placed right after the Financial Picture step. At this point we know the user's goal (one of 6: Retirement, Education, Major Purchase, Wealth Building, Income Generation, Emergency Fund), their life stage from the goal-followup, their growth-vs-stability preference from the risk-preference scale (1-5), and their full financial picture (current age, retirement age, current savings, savings rate %, and annual income). The AI generates a personalized open-ended question that probes behavioral or emotional factors (how they *feel* about their financial situation, not just what the numbers are). Their free-text response is analyzed into a structured modifier that stacks into the risk scoring.

**Second AI Insight** — placed after the Themes step, near the end of the flow. By now we have nearly the complete profile: goal, finances, growth-stability preference, account type, timeline, risk tolerance, investment style, and theme preferences. The AI synthesizes everything it knows and asks a final question that gets at the user's deeper priorities or unresolved tensions in their profile (e.g., they picked "Max Growth" on the stability scale but a short timeline — what's driving that? Or they chose aggressive risk tolerance but a low savings rate — are they stretched thin?). This second analysis produces a final behavioral modifier and a portfolio emphasis signal that feeds into the matching engine.

The two insights serve different purposes: the first is *exploratory* (learning about the person early), the second is *synthesizing* (pressure-testing the full profile before recommendation).

Current flow:
```
goal → goal-followup → risk-preference → financial-picture → account-type → [goal-conditional] → timeline → risk → investment-style → themes → deep-dive-prompt → [deep-dive] → preferences → review → results
```

New flow with AI insights added:
```
goal → goal-followup → risk-preference → financial-picture → AI-INSIGHT-1 → account-type → [goal-conditional] → timeline → risk → investment-style → themes → AI-INSIGHT-2 → deep-dive-prompt → [deep-dive] → preferences → review → results
```

## Tech Stack & Architecture

- **Frontend:** React 19, Vite, Tailwind 4, Framer Motion, Recharts
- **Deployment:** Vercel (already configured — see `vercel.json`)
- **Questionnaire orchestration:** `src/hooks/useQuestionnaire.js`
- **Step definitions:** `src/data/questions.js`
- **Step components:** `src/components/prototype/steps/`
- **Main renderer:** `src/components/prototype/PrototypeSection.jsx`
- **Scoring:** `src/logic/scoringUtils.js` (risk score = base + deep-dive modifiers + risk-preference riskNudge + goal nudges + timeline uplift, capped 1-10)
- **Portfolio matching:** `src/logic/matchingEngine.js`

## Requirements

### 1. Vercel Serverless Backend

All OpenAI calls go through a Vercel Serverless Function — the API key never touches the browser. Create `api/ai-insight.js` at the project root (Vercel auto-deploys files in `api/` as serverless endpoints).

**Model:** Use `gpt-4o-mini` for all calls — it's the cheapest capable model and the payloads are small.

**Single endpoint, action-based routing.** The endpoint accepts POST requests with an `action` field:
- `generate-question` — takes collected answers and which insight step this is (`"first"` or `"second"`), returns a personalized question.
- `analyze-response` — takes collected answers, the question asked, the user's response, and which step, returns a structured JSON analysis.

**The system prompts are the heart of this feature — invest real effort in them.** They should:
- Clearly describe the role (financial advisor intake assistant for a portfolio recommendation tool).
- Include ALL collected user data formatted cleanly so the model has full context.
- For the first insight: instruct the model to ask about behavioral/emotional factors given the user's early financial profile.
- For the second insight: instruct the model to synthesize the full profile and probe priorities, tensions, or unresolved trade-offs.
- For analysis: return a JSON object with `riskModifier` (number, -1.5 to 1.5), `timelineConfidence` ("short"/"medium"/"long"), `behavioralNotes` (1-2 sentence insight suitable for display), and `suggestedEmphasis` ("growth"/"stability"/"income"/"balanced").

**Guardrails — include these in every system prompt:**
```
GUARDRAILS:
- Keep all language professional and appropriate for a financial services context.
- If the user's response contains inappropriate, offensive, or off-topic content, do not engage with it. For question generation, return a neutral follow-up question. For analysis, return neutral defaults with a generic behavioralNotes like "Standard risk profile based on questionnaire data."
```

**Error handling:** Every function should gracefully degrade. If the API key is missing, the endpoint should return a clear error that the frontend handles with fallback content. If OpenAI returns an error or the response can't be parsed, return sensible defaults (a good fallback question for generation, neutral modifiers for analysis).

**Update `vercel.json`** so `/api/*` routes aren't caught by the SPA rewrite. The existing rewrite is:
```json
{ "source": "/((?!deck/|assets/).*)", "destination": "/index.html" }
```
Add `api/` to the exclusion pattern.

**API key setup:** After implementing everything, print a clear message to the user explaining:
- They need to add `OPENAI_API_KEY` as an environment variable in Vercel (Settings → Environment Variables) for production.
- For local development, create `.env.local` with `OPENAI_API_KEY=sk-...` and use `vercel dev` instead of `vite dev` (install Vercel CLI with `npm i -g vercel`, run `vercel link` once).
- Add `.env.local` to `.gitignore`.
- The app works without a key — it just falls back to default questions and neutral scoring.

### 2. Frontend Service Layer

Create `src/services/aiInsight.js` — a thin client module that calls `/api/ai-insight` via fetch. Two exported functions: one to generate a question, one to analyze a response. Both accept the step identifier (`"first"` or `"second"`) so the backend knows which system prompt to use. Both handle errors gracefully with fallbacks — a sensible default question for generation, neutral modifiers for analysis. No API key or OpenAI URL anywhere in `src/`.

### 3. AI Insight Step Component

Create `src/components/prototype/steps/AIInsightStep.jsx` — a single reusable component used for both insight steps (differentiated by a `step` prop of `"first"` or `"second"`).

This component should feel like a **conversation**, not a form. It has four internal states:
1. **Generating** — subtle loading animation ("Thinking about your situation..."), Framer Motion
2. **Asking** — the AI question rendered in a conversational style, with a spacious textarea below for the user's response, and a Continue button disabled until they've written enough to be meaningful
3. **Analyzing** — brief loading ("Understanding your perspective...")
4. **Complete** — calls onComplete with the full data (question, response, parsed insight), then auto-advances

If the user navigates back to this step, show their previous answer pre-filled — don't re-generate the question.

Match the existing app's aesthetic (study the other step components for styling patterns — white cards, `#E5E5DD` borders, Framer Motion transitions, Tailwind).

### 4. Questionnaire Integration

Wire both AI insight steps into the flow. The step definitions go in `src/data/questions.js` — first insight after `financial-picture`, second insight after `themes`. The hook, step renderer, and navigation logic in `useQuestionnaire.js` and `PrototypeSection.jsx` need to handle the new steps. Study the existing patterns for how steps are injected, how auto-advance works, and how the back button is managed, and follow those patterns.

Keep ALL existing steps and logic intact — especially the deep-dive prompt/skip logic, theme selection, and preferences.

When the goal changes and dependent answers are cleared, also clear both AI insight answers since the questions would be stale.

### 5. Scoring & Matching Integration

Both AI insight modifiers stack into the existing scoring in `src/logic/scoringUtils.js`. The current system accumulates into a single `modifier` variable: base risk score + deep-dive modifiers + risk-preference riskNudge (±2) + goal-followup riskNudge + goal-conditional riskNudge + timeline uplift, capped at 1-10. Add both AI `riskModifier` values into that same accumulator. If both insights fire, a user could get up to ±3.0 from AI alone — which combined with deep-dive modifiers and the risk-preference scale creates meaningful differentiation.

In `src/logic/matchingEngine.js`, add the `behavioralNotes` from both insights into the results explanations (the `buildExplanations` function). Use the second insight's `suggestedEmphasis` as a tiebreaker when portfolios score equally.

In the Review step, show both AI exchanges — the question asked and the user's response (truncated if long). Make them editable (navigating back re-generates).

### 6. What Must Not Change

- The 10 core portfolios and their data structure
- The ETF definitions
- The 6 goal options and all goal-followup/goal-conditional logic
- The risk-preference (growth vs stability) scale step and its riskNudge scoring
- The financial picture step (savings rate slider, smart defaults, 3% income growth projections)
- The deep-dive questions, modifiers, and skip logic
- The themes and preferences steps
- The overall visual design language

## Success Criteria

When this is done, a user going through Model 2 should feel like the app is actually *listening* to them — not just collecting checkbox answers. The two conversational moments should feel natural in the flow: the first like an advisor leaning in after hearing your numbers, the second like a final check before making a recommendation. The results page should include the AI's behavioral insights as natural-language explanations alongside the existing rule-based ones. And the whole thing should degrade gracefully to a fully functional deterministic questionnaire if OpenAI is unreachable.
