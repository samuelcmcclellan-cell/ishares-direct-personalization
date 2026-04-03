# Fix AI Insight Question Quality — Make Questions Shorter and Punchier

## Problem

The AI-generated questions in the questionnaire are too long and wordy. Example of what gets generated now:

> "If you had begun your investment journey 5 years ago with your current savings of $500K and a strong focus on growth, how would your perspective on risk and volatility have evolved over time?"

That's 35+ words of meandering setup before the user even knows what they're being asked. Users should read the question and immediately know what to answer.

## Target file

`/api/ai-insight.js` — all changes are in this single file.

## Changes

### 1. Rewrite the `TECHNIQUES` array (lines ~373-380)

Replace the current `TECHNIQUES` array with tighter descriptions that discourage verbose setup clauses. The current descriptions actively template wordy questions (e.g., the counterfactual says "If you had started investing 5 years ago...").

```js
const TECHNIQUES = [
  { id: 'scenario', label: 'Specific Scenario', desc: 'Drop them into a moment: "Your portfolio just dropped 25% in 3 months. What\'s your first move?"' },
  { id: 'retrospective', label: 'Retrospective', desc: 'Ask about a real past moment with money — a decision, a loss, a windfall. Keep it tight.' },
  { id: 'third-person', label: 'Third Person', desc: 'Ask them to advise someone in their exact situation. One sentence setup, one sentence question.' },
  { id: 'forced-choice', label: 'Forced Choice', desc: 'Two options, pick one. "Would you rather [X] or [Y]?" Both must be plausible and revealing.' },
  { id: 'counterfactual', label: 'What-If', desc: 'One sharp hypothetical. "What if your savings doubled overnight — what changes?" No multi-clause setups.' },
  { id: 'future-self', label: 'Future Self', desc: 'One question from the perspective of their older self looking back at this moment.' },
]
```

### 2. Rewrite the HARD REQUIREMENTS in the `first` insight prompt (lines ~473-478)

Replace the current HARD REQUIREMENTS block inside the `step === 'first'` section of `buildSystemPrompt` with:

```
HARD REQUIREMENTS — your question will be rejected if any of these fail:
1. MAXIMUM 30 WORDS. No exceptions. Count them. If it's over 30 words, cut it down.
2. The question MUST feel personalized — reference their actual profile details (numbers, goal, risk level, etc.) so it couldn't be asked to just anyone.
3. The question must NOT be answerable by someone who hasn't provided this profile.
4. No preamble. No "I noticed...", no "Based on your profile...", no "Given that you...". Start with the punch.
5. Never start with a subordinate clause ("If you had...", "Considering that...", "With your..."). Lead with the question or the scenario.
6. Use the Technique above to frame the question, but keep it tight.

GOOD examples (notice: short, specific, direct):
- "You've saved $500K but picked maximum growth. What's the worst outcome you've actually pictured?"
- "Your $200K drops to $140K in 6 months. What's your first call — hold, sell, or buy more?"
- "At 28 with $30K saved, what's making you play it so safe?"
- "Would you rather miss a 20% rally or sit through a 20% crash? Which one stings more?"

BAD examples (too long, too much setup, meandering):
- "If you had begun your investment journey 5 years ago with your current savings of $500K and a strong focus on growth, how would your perspective on risk and volatility have evolved?"
- "Given that you're currently 35 years old with $200,000 in savings and a preference for aggressive growth, how would you describe your emotional reaction if your portfolio experienced a significant downturn?"
- "Thinking about your current financial situation where you earn $150K annually and have saved $80K, what would you say is the primary factor that influences your approach to investment risk?"
```

### 3. Rewrite the HARD REQUIREMENTS in the `second` insight prompt (lines ~495-501)

Replace the current HARD REQUIREMENTS block inside the `else` (second insight) section with:

```
HARD REQUIREMENTS — your question will be rejected if any of these fail:
1. MAXIMUM 30 WORDS. No exceptions. Count them.
2. The question MUST feel personalized — reference their actual profile details so it couldn't be asked to just anyone.
3. The question must NOT be answerable by a generic person.
4. Do NOT repeat the emotional territory of the earlier behavioral question (shown above). Find a NEW angle.
5. If a HIGH-severity observation exists above, name the tension directly. Don't dance around it.
6. No preamble. No subordinate clause openers ("If you...", "Given that...", "Considering..."). Start with the punch.
7. Use the Technique above to frame the question, but brevity wins over technique fidelity.

GOOD examples:
- "You want wealth-building but said you'd sell in a crash. Which instinct wins when it's real money?"
- "Your savings rate is 25% but your balance is only $18K. What happened?"
- "If your portfolio gets one thing right and one thing wrong, what matters most?"

BAD examples:
- "Looking at the totality of your financial profile including your goal of wealth building, your conservative risk tolerance, and your 20-year timeline, what would you say is the single most important outcome..."
```

### 4. Rewrite the SCENARIO REQUIREMENTS in the `third` insight prompt (lines ~447-454)

Replace the current SCENARIO REQUIREMENTS block with:

```
SCENARIO REQUIREMENTS:
1. Use their real numbers to make the scenario feel personal: savings ($${(answers['financial-picture']?.currentSavings || 0).toLocaleString()}), income ($${(answers['financial-picture']?.annualIncome || 0).toLocaleString()}), age (${answers['financial-picture']?.currentAge || 'unknown'}), goal (${answers.goal?.label || 'unspecified'}).
2. Create tension with their stated risk behavior — they said they'd "${answers.risk?.label || 'unknown'}" during a 20% drop.
3. Do NOT repeat the 20% drop scenario. Use a different angle: prolonged bear market, sector crash, life event + market event, or social pressure.
4. MAXIMUM 40 WORDS for the full scenario + question. Two sentences max: one for the setup, one for the question.
5. No preamble. Jump straight in. The scenario IS the question.
6. If a HIGH-severity observation exists above, your scenario MUST target it.

GOOD example: "Six months in, your $500K is now $380K and still falling. Your partner wants you to sell everything. What do you tell them — and do you mean it?"

BAD example: "Imagine that over the course of the next 12 months, your portfolio which currently sits at $500,000 experiences a prolonged downturn due to macroeconomic headwinds, falling approximately 25% to around $375,000, while simultaneously your colleague at work mentions that they moved their entire portfolio to cash three months ago and are feeling very confident about that decision. Walk me through what would go through your mind in that situation and what concrete steps you would consider taking."
```

### 5. Update the fallback questions to match the new brevity standard (lines 1-5)

Replace the `FALLBACK_QUESTIONS` object:

```js
const FALLBACK_QUESTIONS = {
  first: "What's the one money decision that still keeps you up at night — or the one you're most proud of?",
  second: "If your portfolio could only get one thing absolutely right, what would it be?",
  third: "Your portfolio drops 15% while the overall market is flat. A colleague just moved to cash and feels great about it. What do you actually do?",
}
```

## What NOT to change

- Do NOT modify `computeProfileObservations` — the tension detection logic is good.
- Do NOT modify the `FIRST_CATEGORIES` or `SECOND_CATEGORIES` arrays — those are fine.
- Do NOT modify `pickAngleCombination` — the selection logic is fine.
- Do NOT modify ANY of the `analyze-response` prompts — only the `generate-question` prompts need fixing.
- Do NOT modify `formatAnswers`, `formatFinancialPicture`, or any of the label maps.

## Testing

After making changes, test by running through the questionnaire at least twice. For each AI question that appears, check:
1. Is it under 30 words? (40 for the third/scenario question)
2. Does it reference a specific fact from the user's profile?
3. Could you read it in one breath?
4. Does the user immediately know what they're being asked?
