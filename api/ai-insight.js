const FALLBACK_QUESTIONS = {
  first: "When you think about your financial future, what keeps you up at night — or what excites you most? Understanding your emotional relationship with money helps us build a portfolio that you'll actually stick with.",
  second: "Looking at the full picture of what you've shared, what's the one thing you'd want your portfolio to get absolutely right — even if it meant compromising on something else?",
}

const NEUTRAL_ANALYSIS = {
  riskModifier: 0,
  timelineConfidence: 'medium',
  behavioralNotes: 'Standard risk profile based on questionnaire data.',
  suggestedEmphasis: 'balanced',
  confidenceLevel: 0.5,
  detectedBiases: [],
  engagementQuality: 'moderate',
  stickinessFactor: 0,
  profileNarrative: 'Balanced investor',
}

const VALID_BIASES = [
  'loss-aversion', 'overconfidence', 'status-quo-bias', 'anchoring',
  'recency-bias', 'herding', 'mental-accounting', 'optimism-bias',
  'sunk-cost-fallacy', 'disposition-effect',
]

// ── Profile Observation Engine ──────────────────────────────────

function computeProfileObservations(answers, step) {
  const observations = []
  const fp = answers['financial-picture'] || {}
  const age = fp.currentAge || 0
  const savings = fp.currentSavings || 0
  const income = fp.annualIncome || 0
  const savingsRate = fp.savingsRate || 0
  const goalId = answers.goal?.id
  const riskPrefId = parseInt(answers['risk-preference']?.id) || 3
  const holdingsSignal = answers['existing-holdings']?.holdingsSignal
  const riskId = answers.risk?.id
  const riskScore = answers.risk?.riskScore || 0
  const timelineId = answers.timeline?.id
  const fomoScore = answers['fomo-reaction']?.fomoScore
  const drawSignal = answers['income-draw']?.drawSignal
  const followupId = answers['goal-followup']?.id

  // ── Tension detectors (contradictions) ──

  if (riskPrefId >= 4 && savings < 25000 && age > 30) {
    observations.push({
      id: 'AGGRESSIVE_GROWTH_LOW_SAVINGS',
      severity: 'high',
      summary: `Wants aggressive growth (${riskPrefId}/5) but has only $${savings.toLocaleString()} saved at age ${age}`,
      hook: 'What is driving the urgency for aggressive growth with relatively early-stage savings? Is this ambition or anxiety?',
    })
  }

  if (riskPrefId <= 2 && (timelineId === '20+' || followupId === 'under-30' || followupId === '30-39')) {
    observations.push({
      id: 'CONSERVATIVE_LONG_HORIZON',
      severity: 'high',
      summary: `Very conservative preference (${riskPrefId}/5) despite a 20+ year horizon`,
      hook: 'With decades ahead, what is making them so cautious? A past experience? Or just temperament?',
    })
  }

  if (goalId === 'wealth-building' && (riskId === 'sell-all' || riskId === 'sell-some')) {
    observations.push({
      id: 'GROWTH_GOAL_LOW_RISK',
      severity: 'high',
      summary: 'Wants to build wealth but would sell during a 20% drawdown',
      hook: 'The goal says growth but the instinct says safety — which one is the real priority?',
    })
  }

  if (goalId === 'income' && age > 0 && age < 35) {
    observations.push({
      id: 'INCOME_GOAL_YOUNG',
      severity: 'medium',
      summary: `Seeking income generation at age ${age} — unusually young for an income focus`,
      hook: 'Why income now instead of growth? Is there a near-term financial need, or a philosophical preference for cash flow?',
    })
  }

  if (fomoScore >= 3 && riskPrefId <= 2) {
    observations.push({
      id: 'FOMO_PLUS_CONSERVATIVE',
      severity: 'high',
      summary: "Would switch strategies to chase a friend's returns, but prefers conservative allocation",
      hook: 'Classic conflicted investor — wants safety but hates missing out. Which instinct wins under pressure?',
    })
  }

  if (savingsRate > 20 && goalId === 'emergency') {
    observations.push({
      id: 'HIGH_SAVINGS_RATE_EMERGENCY',
      severity: 'medium',
      summary: `Saving ${savingsRate}% of income but goal is building an emergency fund`,
      hook: 'High discipline but no safety net yet — did something happen recently, or is this a fresh financial start?',
    })
  }

  if (holdingsSignal === 'equity-heavy' && (riskId === 'sell-all' || riskId === 'sell-some')) {
    observations.push({
      id: 'EQUITY_HEAVY_RISK_AVERSE',
      severity: 'high',
      summary: 'Current portfolio is equity-heavy but instinct is to sell during drawdowns',
      hook: 'They own aggressive assets but react conservatively — are they in the wrong portfolio, or just anxious?',
    })
  }

  if (holdingsSignal === 'none' && riskPrefId >= 5) {
    observations.push({
      id: 'NO_INVESTMENTS_MAX_GROWTH',
      severity: 'high',
      summary: 'Zero investing experience but wants maximum growth',
      hook: 'Never invested but wants the most aggressive approach — confidence or naivety? Have they thought about how a real -30% feels?',
    })
  }

  if ((timelineId === 'under-2' || timelineId === '2-5') && riskPrefId >= 4) {
    observations.push({
      id: 'SHORT_TIMELINE_GROWTH_PREF',
      severity: 'high',
      summary: `Short timeline (${timelineId} years) but wants growth-oriented approach (${riskPrefId}/5)`,
      hook: 'Growth takes time to recover from downturns — what happens if the market drops right before they need the money?',
    })
  }

  if ((drawSignal === 'regular' || drawSignal === 'lump') && goalId === 'wealth-building') {
    observations.push({
      id: 'DRAWS_PLANNED_GROWTH_GOAL',
      severity: 'medium',
      summary: 'Plans to withdraw from the portfolio but goal is wealth building',
      hook: 'Hard to build wealth while drawing it down — is the withdrawal a one-time exception or an ongoing reality?',
    })
  }

  // ── Notable pattern detectors ──

  if (holdingsSignal === 'none') {
    observations.push({
      id: 'FIRST_TIME_INVESTOR',
      severity: 'medium',
      summary: 'First-time investor with no existing holdings',
      hook: 'What has prevented them from investing until now — lack of knowledge, lack of trust, or just timing?',
    })
  }

  if (income > 150000 && savings < 50000) {
    observations.push({
      id: 'HIGH_EARNER_LOW_SAVINGS',
      severity: 'high',
      summary: `Earns $${(income/1000).toFixed(0)}K but has only $${(savings/1000).toFixed(0)}K saved`,
      hook: 'High income with low savings suggests lifestyle spending or a recent career change — understanding why matters for stickiness.',
    })
  }

  if (age > 0 && age < 30 && riskPrefId <= 2) {
    observations.push({
      id: 'YOUNG_AND_CONSERVATIVE',
      severity: 'medium',
      summary: `Age ${age} but very conservative (${riskPrefId}/5) — unusual for someone with decades ahead`,
      hook: 'What experience is driving extreme caution at a young age? A family story? A personal loss?',
    })
  }

  if ((timelineId === 'under-2' || timelineId === '2-5') && goalId && goalId !== 'emergency') {
    observations.push({
      id: 'APPROACHING_GOAL',
      severity: 'medium',
      summary: `Near-term goal (${goalId}) with only ${timelineId} year timeline`,
      hook: 'With the goal approaching, the tension between growth and protection becomes acute — which matters more right now?',
    })
  }

  if (savingsRate > 15 && savings < 20000 && age > 25) {
    observations.push({
      id: 'SAVINGS_VELOCITY_MISMATCH',
      severity: 'medium',
      summary: `Saving ${savingsRate}% of income but only $${savings.toLocaleString()} accumulated at age ${age}`,
      hook: 'High savings rate but low balance — just starting, or was there a reset (job change, life event, debt payoff)?',
    })
  }

  if (goalId === 'education' && age > 35) {
    observations.push({
      id: 'STEWARDSHIP_SIGNAL',
      severity: 'medium',
      summary: `Education savings goal at age ${age} — likely saving for children`,
      hook: 'Investing for a child changes the emotional stakes — the regret of underfunding education vs. the risk of losing what you saved.',
    })
  }

  if (income > 0 && savings > 0 && savingsRate > 0 && savings < income * 0.1 && savingsRate >= 10) {
    observations.push({
      id: 'LIFESTYLE_INFLATION',
      severity: 'medium',
      summary: `Despite saving ${savingsRate}% of $${(income/1000).toFixed(0)}K income, accumulated savings are low relative to earnings`,
      hook: 'The savings habit is there but the balance tells a different story — what has been competing for these dollars?',
    })
  }

  // For step 2, check first AI response for signals
  if (step === 'second' && answers['ai-insight-1']?.analysis) {
    const ai1 = answers['ai-insight-1'].analysis
    if (ai1.riskModifier < -1.5) {
      observations.push({
        id: 'AI1_DETECTED_HIGH_ANXIETY',
        severity: 'high',
        summary: `First behavioral response showed significant anxiety (risk modifier: ${ai1.riskModifier.toFixed(1)})`,
        hook: 'Their earlier response revealed real financial stress — is this situational or a deep pattern?',
      })
    }
    if (ai1.riskModifier > 1.5) {
      observations.push({
        id: 'AI1_DETECTED_HIGH_CONFIDENCE',
        severity: 'medium',
        summary: `First behavioral response showed strong confidence (risk modifier: +${ai1.riskModifier.toFixed(1)})`,
        hook: 'They came across as very confident earlier — is that backed by real experience, or is it overconfidence?',
      })
    }
  }

  return observations
}

// ── Enriched Profile Formatting ─────────────────────────────────

function formatFinancialPicture(fp) {
  if (!fp) return 'Not provided'
  const parts = []
  if (fp.currentAge) parts.push(`Age: ${fp.currentAge}`)
  if (fp.retirementAge) parts.push(`Target retirement: ${fp.retirementAge}`)
  if (fp.currentSavings != null) parts.push(`Current savings: $${Number(fp.currentSavings).toLocaleString()}`)
  if (fp.annualIncome != null) parts.push(`Annual income: $${Number(fp.annualIncome).toLocaleString()}`)
  if (fp.savingsRate != null) parts.push(`Savings rate: ${fp.savingsRate}%`)
  return parts.join(' | ')
}

const RISK_LABELS = {
  'sell-all': 'Very risk-averse (would sell everything in a 20% drop)',
  'sell-some': 'Risk-averse (would reduce exposure in a 20% drop)',
  'hold': 'Moderate (would hold steady through a 20% drop)',
  'buy-more': 'Risk-tolerant (would buy more in a 20% drop)',
  'buy-aggressive': 'Very risk-tolerant (would significantly increase position in a 20% drop)',
}

const FOMO_LABELS = {
  'switch': 'FOMO-driven — would want to switch to a friend\'s higher-returning strategy',
  'curious': 'Mildly curious but wouldn\'t change course',
  'indifferent': 'Unaffected by others\' returns',
  'cautious': 'Suspicious of others\' high returns — sees risk, not opportunity',
}

const DRAW_LABELS = {
  'no-draw': 'Purely accumulation — won\'t touch it for years',
  'maybe-partial': 'May need a partial withdrawal within 3-5 years',
  'regular-draw': 'Will draw periodically — needs the portfolio to generate withdrawable income',
  'lump-sum': 'Plans one large withdrawal — saving toward a specific payout',
}

function formatAnswers(answers) {
  const lines = []
  if (answers.goal) lines.push(`Goal: ${answers.goal.label}`)
  if (answers['goal-followup']) lines.push(`Goal details: ${answers['goal-followup'].label}`)
  if (answers['risk-preference']) {
    const pref = parseInt(answers['risk-preference'].id)
    const desc = pref <= 2 ? '(leans heavily toward stability)' : pref >= 4 ? '(leans heavily toward growth)' : '(balanced)'
    lines.push(`Growth vs. Stability: ${answers['risk-preference'].label} ${desc}`)
  }
  if (answers['financial-picture']) lines.push(`Financial picture: ${formatFinancialPicture(answers['financial-picture'])}`)
  if (answers['existing-holdings']) {
    const h = answers['existing-holdings']
    lines.push(`Existing investments: ${h.label} (signal: ${h.holdingsSignal || 'unknown'})`)
  }
  if (answers['account-type']) lines.push(`Account type: ${answers['account-type'].label}`)
  if (answers['goal-conditional']) lines.push(`Goal context: ${answers['goal-conditional'].label}`)
  if (answers.timeline) lines.push(`Investment timeline: ${answers.timeline.label}`)
  if (answers.risk) lines.push(`Risk tolerance: ${RISK_LABELS[answers.risk.id] || answers.risk.label}`)
  if (answers['fomo-reaction']) lines.push(`Reaction to underperformance: ${FOMO_LABELS[answers['fomo-reaction'].id] || answers['fomo-reaction'].label}`)
  if (answers['income-draw']) lines.push(`Withdrawal plans: ${DRAW_LABELS[answers['income-draw'].drawSignal] || answers['income-draw'].label}`)
  if (answers['investment-style']) lines.push(`Investment style preference: ${answers['investment-style'].label}`)
  if (answers.themes) {
    const active = Object.entries(answers.themes).filter(([id, v]) => v && id !== 'none').map(([id]) => id)
    if (active.length > 0) lines.push(`Thematic interests: ${active.join(', ')}`)
  }
  if (answers['ai-insight-1']?.response) {
    lines.push(`\nEarlier behavioral question: "${answers['ai-insight-1'].question}"`)
    lines.push(`Their response: "${answers['ai-insight-1'].response}"`)
    if (answers['ai-insight-1'].analysis?.behavioralNotes) {
      lines.push(`Our analysis: ${answers['ai-insight-1'].analysis.behavioralNotes}`)
    }
  }
  return lines.join('\n')
}

// ── Combinatorial Angle System ──────────────────────────────────

const FIRST_CATEGORIES = [
  { id: 'loss-psychology', label: 'Loss Psychology', desc: 'How they process financial loss — real or hypothetical. What does losing money actually feel like to them?' },
  { id: 'confidence-calibration', label: 'Confidence Calibration', desc: 'Are they overconfident or underconfident about their investing ability? Do they know what they don\'t know?' },
  { id: 'money-origin', label: 'Money Origin Story', desc: 'Formative experiences that shaped their relationship with money — family, upbringing, early jobs, windfalls, or setbacks.' },
  { id: 'decision-style', label: 'Decision Paralysis vs. Impulse', desc: 'How they make financial decisions under uncertainty — do they overthink or shoot from the hip?' },
  { id: 'financial-identity', label: 'Financial Identity', desc: 'How money relates to their self-image, values, and life goals. What does financial success mean to them personally?' },
  { id: 'time-perception', label: 'Time Perception', desc: 'How they actually experience waiting for financial outcomes. Can they truly be patient, or does "long-term" feel abstract?' },
  { id: 'control-trust', label: 'Control vs. Trust', desc: 'Do they need to feel in control of every investment decision, or can they delegate and trust a system?' },
  { id: 'social-comparison', label: 'Social Comparison', desc: 'How others\' financial situations affect their behavior — keeping up, competing, or ignoring.' },
  { id: 'scarcity-abundance', label: 'Scarcity vs. Abundance Mindset', desc: 'Do they operate from a mindset of "there\'s never enough" or "there\'s plenty if I\'m smart about it"?' },
  { id: 'felt-risk', label: 'Intellectual vs. Felt Risk', desc: 'The gap between their theoretical risk tolerance and how risk actually feels in their body. Head vs. gut.' },
]

const SECOND_CATEGORIES = [
  { id: 'contradiction', label: 'Internal Contradiction Resolution', desc: 'Directly address a specific tension or contradiction in their profile. Name it and ask them to resolve it.' },
  { id: 'priority-hierarchy', label: 'Priority Hierarchy', desc: 'Force them to rank competing goals or values — safety vs. growth, now vs. later, self vs. family.' },
  { id: 'worst-case', label: 'Worst Case Acceptance', desc: 'What is the real floor they can tolerate? Not hypothetical — what would actually happen to their life?' },
  { id: 'success-definition', label: 'Success Definition', desc: 'What does "this portfolio is working" look like in 1 year? 5 years? What would disappoint them?' },
  { id: 'commitment-test', label: 'Commitment Testing', desc: 'What would make them abandon the plan? A market crash? A life change? A better offer?' },
  { id: 'stewardship', label: 'Stewardship vs. Self', desc: 'Who are they really doing this for? Themselves, family, legacy? Stewardship changes everything.' },
  { id: 'regret-minimization', label: 'Regret Minimization', desc: 'Which outcome would they regret more: missing out on gains, or losing money they had?' },
  { id: 'self-awareness', label: 'Behavioral Self-Awareness', desc: 'How well do they know their own patterns? Do they recognize their biases, or are they blind to them?' },
]

const TECHNIQUES = [
  { id: 'scenario', label: 'Specific Scenario', desc: 'Start with "Imagine..." and paint a vivid, specific situation relevant to their profile.' },
  { id: 'retrospective', label: 'Retrospective', desc: 'Ask about a real past experience: "Tell me about a time when..." or "Think back to..."' },
  { id: 'third-person', label: 'Third Person', desc: 'Ask them to advise someone else with their exact profile: "If your best friend had your exact financial situation..."' },
  { id: 'forced-choice', label: 'Forced Choice Trade-off', desc: 'Present two options and force a pick: "Would you rather X or Y?" Make both options plausible.' },
  { id: 'counterfactual', label: 'Counterfactual', desc: 'Ask about an alternate timeline: "If you had started investing 5 years ago..." or "If you woke up tomorrow with double your savings..."' },
  { id: 'future-self', label: 'Future Self', desc: 'Ask them to consult their future self: "What would your 65-year-old self say about this decision?"' },
]

function pickAngleCombination(step, observations) {
  const categories = step === 'first' ? FIRST_CATEGORIES : SECOND_CATEGORIES
  const highSeverity = observations.filter(o => o.severity === 'high')

  let category
  // For Q2 with a high-severity tension, always use contradiction resolution
  if (step === 'second' && highSeverity.length > 0) {
    category = SECOND_CATEGORIES.find(c => c.id === 'contradiction')
  } else {
    // Weight toward categories relevant to observations
    const relevantCategories = observations.length > 0
      ? categories.filter(c => {
          // Map observation IDs to relevant categories
          if (c.id === 'loss-psychology' && observations.some(o => o.id.includes('RISK_AVERSE') || o.id.includes('LOW_RISK'))) return true
          if (c.id === 'confidence-calibration' && observations.some(o => o.id.includes('MAX_GROWTH') || o.id.includes('OVERCONFIDENCE') || o.id.includes('CONFIDENCE'))) return true
          if (c.id === 'social-comparison' && observations.some(o => o.id.includes('FOMO'))) return true
          if (c.id === 'time-perception' && observations.some(o => o.id.includes('TIMELINE') || o.id.includes('HORIZON'))) return true
          if (c.id === 'scarcity-abundance' && observations.some(o => o.id.includes('LOW_SAVINGS') || o.id.includes('EMERGENCY'))) return true
          if (c.id === 'felt-risk' && observations.some(o => o.id.includes('EQUITY_HEAVY') || o.id.includes('CONSERVATIVE'))) return true
          return false
        })
      : []

    // 60% chance to pick a relevant category, 40% fully random
    if (relevantCategories.length > 0 && Math.random() < 0.6) {
      category = relevantCategories[Math.floor(Math.random() * relevantCategories.length)]
    } else {
      category = categories[Math.floor(Math.random() * categories.length)]
    }
  }

  const technique = TECHNIQUES[Math.floor(Math.random() * TECHNIQUES.length)]
  return { category, technique }
}

// ── System Prompt Builder ───────────────────────────────────────

function buildSystemPrompt(action, step, answers) {
  const userProfile = formatAnswers(answers)
  const observations = computeProfileObservations(answers, step)
  const observationsBlock = observations.length > 0
    ? observations.map(o => `- [${o.severity.toUpperCase()}] ${o.summary}\n  Hook: ${o.hook}`).join('\n')
    : '- No strong tensions or outliers detected. Probe for behavioral nuance the questionnaire couldn\'t capture.'

  const guardrails = `
GUARDRAILS:
- Keep all language professional and appropriate for a financial services context.
- If the user's response contains inappropriate, offensive, or off-topic content, do not engage with it. For question generation, return a neutral follow-up question. For analysis, return neutral defaults.
- Never provide specific investment advice, specific fund recommendations, or guarantee returns.`

  if (action === 'generate-question') {
    const angle = pickAngleCombination(step, observations)

    if (step === 'first') {
      return `You are an intake assistant for a portfolio recommendation tool at BlackRock's iShares Direct Personalization platform. You are a sharp financial advisor who notices things about each investor that a generic questionnaire can't capture.

INVESTOR PROFILE:
${userProfile}

NOTABLE OBSERVATIONS ABOUT THIS PERSON (build your question around one of these):
${observationsBlock}

QUESTION APPROACH:
Category: ${angle.category.label} — ${angle.category.desc}
Technique: ${angle.technique.label} — ${angle.technique.desc}

HARD REQUIREMENTS — your question will be rejected if any of these fail:
1. Your question MUST reference at least one specific number or fact from the profile above (their age, savings amount, goal type, income, risk preference level, or existing holdings).
2. Your question MUST NOT be answerable by someone who hasn't provided this specific profile. If a generic person could answer it, it's too vague.
3. Keep to 1-3 sentences. No preamble, no "I noticed that...", no "Based on your profile...". Jump straight into the question.
4. Do NOT start with "How do you feel about..." — find a more specific, sharper entry point.
5. Use the Technique above to FRAME the question (e.g., if Scenario, start with "Imagine..."; if Retrospective, start with "Think back to...").

Return ONLY the question text.
${guardrails}`
    } else {
      return `You are an intake assistant for a portfolio recommendation tool at BlackRock's iShares Direct Personalization platform. You are conducting the final stage of an intelligent investor profile assessment. You are a sharp financial advisor doing a final gut-check before building their portfolio.

FULL INVESTOR PROFILE:
${userProfile}

NOTABLE OBSERVATIONS ABOUT THIS PERSON (build your question around one of these):
${observationsBlock}

QUESTION APPROACH:
Category: ${angle.category.label} — ${angle.category.desc}
Technique: ${angle.technique.label} — ${angle.technique.desc}

HARD REQUIREMENTS — your question will be rejected if any of these fail:
1. Your question MUST reference at least one specific number or fact from the profile above.
2. Your question MUST NOT be answerable by someone who hasn't provided this specific profile.
3. Keep to 1-3 sentences. No preamble. Jump straight in.
4. Do NOT repeat the emotional territory of the earlier behavioral question (shown in the profile above). Find a genuinely NEW angle.
5. If a HIGH-severity observation exists above, your question MUST address it directly. Name the tension.
6. Use the Technique above to FRAME the question.

Return ONLY the question text.
${guardrails}`
    }
  }

  if (action === 'analyze-response') {
    return `You are an analytical engine for a portfolio recommendation tool at BlackRock's iShares Direct Personalization platform. You are analyzing a user's free-text response to a behavioral question.

User profile:
${userProfile}

Profile observations we detected:
${observationsBlock}

Your task: Analyze the user's response and return a JSON object with ALL of these fields:

{
  "riskModifier": <number between -2.5 and 2.5>,
  "timelineConfidence": <"short" | "medium" | "long">,
  "behavioralNotes": <1-2 sentence insight for display, written in third person>,
  "suggestedEmphasis": <"growth" | "stability" | "income" | "balanced">,
  "confidenceLevel": <number 0.0 to 1.0>,
  "detectedBiases": <array of strings from: "loss-aversion", "overconfidence", "status-quo-bias", "anchoring", "recency-bias", "herding", "mental-accounting", "optimism-bias", "sunk-cost-fallacy", "disposition-effect">,
  "engagementQuality": <"deep" | "moderate" | "surface" | "evasive">,
  "stickinessFactor": <number -1.0 to 1.0>,
  "profileNarrative": <1 sentence investor archetype label>
}

FIELD-BY-FIELD GUIDANCE:

riskModifier (-2.5 to +2.5):
- Strong positive (up to +2.5): Exceptional confidence, genuine long-term thinking, emotional resilience, demonstrated comfort with volatility, past experience riding out downturns
- Near zero: Balanced, no strong signal
- Strong negative (down to -2.5): Significant anxiety, short-term focus, financial stress, high loss aversion, FOMO-driven behavior, signs they'd abandon a growth plan
- USE THE FULL RANGE. Panic-selling descriptions → -2.0 or lower. Calmly riding out 2008 → +2.0 or higher.

timelineConfidence: Does their response suggest short-term thinking ("short"), balanced ("medium"), or genuinely long-term ("long")? Watch for "quick returns," "ASAP" vs "decades," "legacy."

behavioralNotes: Brief professional insight for the portfolio page. Example: "Shows strong emotional resilience and genuine long-term perspective, supporting a growth allocation."

suggestedEmphasis: "income" if they need cash flow. "stability" if anxiety dominates. "growth" if patient and resilient. "balanced" only if truly mixed.

confidenceLevel (0.0 to 1.0): YOUR confidence in this assessment. High (0.8+) if their response was detailed, clear, and emotionally revealing. Low (0.0-0.3) if vague, off-topic, contradictory, or joke response. This dampens the influence of riskModifier when you're unsure.

detectedBiases: Identify behavioral finance biases evident in their response. Empty array [] if none. Common ones:
- "loss-aversion": disproportionate focus on not losing vs. gaining
- "overconfidence": believes they can beat the market or time it, underestimates risk
- "herding": references what others are doing, friends' strategies, popular trends
- "recency-bias": extrapolates from recent market conditions (bull/bear)
- "status-quo-bias": strong resistance to change, comfort with current approach even if suboptimal
- "anchoring": fixated on a specific number (purchase price, target, past high)
- "optimism-bias": unrealistic expectations about returns or timeline

engagementQuality: How thoughtfully did they engage?
- "deep": detailed, introspective, reveals genuine thinking
- "moderate": reasonable answer but surface-level
- "surface": minimal effort, generic platitudes
- "evasive": avoids the question, deflects, or gives irrelevant response

stickinessFactor (-1.0 to 1.0): How likely are they to stick with the portfolio plan?
- Positive (toward +1.0): Shows discipline, patience, plan-orientation, past history of follow-through
- Near zero: Unclear
- Negative (toward -1.0): Impulsive, emotionally reactive, likely to panic-sell or chase performance, no clear plan commitment

profileNarrative: One sentence investor archetype. Be specific and insightful, not generic. Examples:
- "Disciplined saver with a clear retirement vision and genuine comfort with market volatility"
- "Anxious first-time investor whose growth ambitions outpace their emotional risk capacity"
- "Experienced but FOMO-prone investor who needs guardrails against chasing performance"
- "Cautious accumulator saving for a child's education with a stewardship mindset"
Do NOT use generic labels like "Balanced investor" or "Moderate risk taker."

Return ONLY valid JSON, no markdown fences, no explanation.
${guardrails}`
  }

  return ''
}

// ─��� API Handler ─────────────────────────────────────────────────

export default async function handler(req, res) {
  // CORS headers for local dev
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return res.status(500).json({
      error: 'OPENAI_API_KEY not configured',
      fallback: true,
    })
  }

  const { action, step, answers, question, userResponse } = req.body

  if (!action || !step || !answers) {
    return res.status(400).json({ error: 'Missing required fields: action, step, answers' })
  }

  if (action !== 'generate-question' && action !== 'analyze-response') {
    return res.status(400).json({ error: 'Invalid action. Use "generate-question" or "analyze-response".' })
  }

  const systemPrompt = buildSystemPrompt(action, step, answers)

  let userMessage
  if (action === 'generate-question') {
    userMessage = 'Generate a personalized question for this investor.'
  } else {
    if (!question || !userResponse) {
      return res.status(400).json({ error: 'analyze-response requires question and userResponse fields' })
    }
    userMessage = `Question asked: "${question}"\n\nUser's response: "${userResponse}"`
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        temperature: action === 'generate-question' ? 0.95 : 0.4,
        max_tokens: action === 'generate-question' ? 200 : 500,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('OpenAI API error:', response.status, errorData)

      if (action === 'generate-question') {
        return res.status(200).json({ question: FALLBACK_QUESTIONS[step], fallback: true })
      }
      return res.status(200).json({ analysis: NEUTRAL_ANALYSIS, fallback: true })
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content?.trim()

    if (!content) {
      if (action === 'generate-question') {
        return res.status(200).json({ question: FALLBACK_QUESTIONS[step], fallback: true })
      }
      return res.status(200).json({ analysis: NEUTRAL_ANALYSIS, fallback: true })
    }

    if (action === 'generate-question') {
      return res.status(200).json({ question: content })
    }

    // Parse analysis JSON
    try {
      // Strip markdown fences if present
      const cleaned = content.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()
      const analysis = JSON.parse(cleaned)

      // Validate and clamp all fields
      const validated = {
        // Existing fields
        riskModifier: Math.max(-2.5, Math.min(2.5, Number(analysis.riskModifier) || 0)),
        timelineConfidence: ['short', 'medium', 'long'].includes(analysis.timelineConfidence)
          ? analysis.timelineConfidence : 'medium',
        behavioralNotes: typeof analysis.behavioralNotes === 'string' && analysis.behavioralNotes.length > 0
          ? analysis.behavioralNotes : NEUTRAL_ANALYSIS.behavioralNotes,
        suggestedEmphasis: ['growth', 'stability', 'income', 'balanced'].includes(analysis.suggestedEmphasis)
          ? analysis.suggestedEmphasis : 'balanced',
        // New fields
        confidenceLevel: Math.max(0, Math.min(1, Number(analysis.confidenceLevel) || 0.5)),
        detectedBiases: Array.isArray(analysis.detectedBiases)
          ? analysis.detectedBiases.filter(b => VALID_BIASES.includes(b))
          : [],
        engagementQuality: ['deep', 'moderate', 'surface', 'evasive'].includes(analysis.engagementQuality)
          ? analysis.engagementQuality : 'moderate',
        stickinessFactor: Math.max(-1, Math.min(1, Number(analysis.stickinessFactor) || 0)),
        profileNarrative: typeof analysis.profileNarrative === 'string' && analysis.profileNarrative.length > 0
          && analysis.profileNarrative !== 'Balanced investor'
          ? analysis.profileNarrative : NEUTRAL_ANALYSIS.profileNarrative,
      }

      return res.status(200).json({ analysis: validated })
    } catch (parseErr) {
      console.error('Failed to parse AI analysis:', parseErr, content)
      return res.status(200).json({ analysis: NEUTRAL_ANALYSIS, fallback: true })
    }
  } catch (err) {
    console.error('AI insight error:', err)

    if (action === 'generate-question') {
      return res.status(200).json({ question: FALLBACK_QUESTIONS[step], fallback: true })
    }
    return res.status(200).json({ analysis: NEUTRAL_ANALYSIS, fallback: true })
  }
}
