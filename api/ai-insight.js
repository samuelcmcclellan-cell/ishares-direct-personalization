const FALLBACK_QUESTIONS = {
  first: "When you think about your financial future, what keeps you up at night — or what excites you most? Understanding your emotional relationship with money helps us build a portfolio that you'll actually stick with.",
  second: "Looking at the full picture of what you've shared, what's the one thing you'd want your portfolio to get absolutely right — even if it meant compromising on something else?",
}

const NEUTRAL_ANALYSIS = {
  riskModifier: 0,
  timelineConfidence: 'medium',
  behavioralNotes: 'Standard risk profile based on questionnaire data.',
  suggestedEmphasis: 'balanced',
}

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

function formatAnswers(answers) {
  const lines = []
  if (answers.goal) lines.push(`Goal: ${answers.goal.label}`)
  if (answers['goal-followup']) lines.push(`Goal details: ${answers['goal-followup'].label}`)
  if (answers['risk-preference']) lines.push(`Growth vs. Stability preference: ${answers['risk-preference'].label}`)
  if (answers['financial-picture']) lines.push(`Financial picture: ${formatFinancialPicture(answers['financial-picture'])}`)
  if (answers['existing-holdings']) lines.push(`Existing investments: ${answers['existing-holdings'].label}`)
  if (answers['account-type']) lines.push(`Account type: ${answers['account-type'].label}`)
  if (answers['goal-conditional']) lines.push(`Goal conditional: ${answers['goal-conditional'].label}`)
  if (answers.timeline) lines.push(`Investment timeline: ${answers.timeline.label}`)
  if (answers.risk) lines.push(`Risk tolerance (20% drop reaction): ${answers.risk.label}`)
  if (answers['fomo-reaction']) lines.push(`FOMO reaction: ${answers['fomo-reaction'].label}`)
  if (answers['income-draw']) lines.push(`Withdrawal expectation: ${answers['income-draw'].label}`)
  if (answers['investment-style']) lines.push(`Investment style: ${answers['investment-style'].label}`)
  if (answers.themes) {
    const active = Object.entries(answers.themes).filter(([id, v]) => v && id !== 'none').map(([id]) => id)
    if (active.length > 0) lines.push(`Themes: ${active.join(', ')}`)
  }
  if (answers['ai-insight-1']?.response) lines.push(`Earlier behavioral insight response: "${answers['ai-insight-1'].response}"`)
  return lines.join('\n')
}

// Randomized question angle selection for variety
const FIRST_QUESTION_ANGLES = [
  `Probe their emotional relationship with financial uncertainty. How do they *feel* when markets are volatile? What emotions come up — excitement, dread, numbness?`,
  `Explore financial anxiety vs. confidence. Do they feel in control of their financial trajectory, or does money stress them out? What would change if they felt truly financially secure?`,
  `Ask about a past financial decision they're proud of — or one they regret. Real experiences reveal risk tolerance better than hypotheticals.`,
  `Explore overconfidence or humility. Do they think they're better at investing than average? What's their track record like? Sometimes overconfidence is riskier than inexperience.`,
  `Ask a scenario question: "Imagine you just inherited $50,000 from a relative. What's your first instinct — invest it all immediately, research for weeks, put it in savings, or spend some?" The instinct reveals a lot.`,
  `Probe the gap between financial aspirations and daily behavior. Do they actually save as much as they think they should? Is there a disconnect between their goals and their habits?`,
  `Ask about their financial role models. Who do they look up to financially, and why? This reveals values and assumptions about wealth.`,
  `Explore what "enough" means to them. Is there a number where they'd feel financially free? Or does the goalpost keep moving? This reveals whether they'll stick with a plan.`,
]

const SECOND_QUESTION_ANGLES = [
  `Look for contradictions between stated risk tolerance and actual behavior signals. If they say "buy the dip" but check daily, what's really going on?`,
  `Pressure-test their timeline. Are they *really* thinking 20+ years, or is that aspirational? What would make them abandon the plan early?`,
  `Ask what would make them lose sleep about their portfolio. The answer reveals their true risk threshold — not the one they reported in the questionnaire.`,
  `Probe what "success" looks like for this portfolio in 1 year. If they say "beating the S&P 500" that's different from "didn't lose money" or "stayed on track with my savings goal."`,
  `Explore whether they're investing for themselves or for someone else (family, kids, partner). Stewardship changes risk tolerance in ways people don't report.`,
  `Ask about their last financial regret or a time they panicked about money. Past behavior under stress is the best predictor of future behavior.`,
]

function pickRandomAngle(angles) {
  return angles[Math.floor(Math.random() * angles.length)]
}

function buildSystemPrompt(action, step, answers) {
  const userProfile = formatAnswers(answers)

  const guardrails = `
GUARDRAILS:
- Keep all language professional and appropriate for a financial services context.
- If the user's response contains inappropriate, offensive, or off-topic content, do not engage with it. For question generation, return a neutral follow-up question. For analysis, return neutral defaults with a generic behavioralNotes like "Standard risk profile based on questionnaire data."
- Never provide specific investment advice, specific fund recommendations, or guarantee returns.
- Keep questions concise (1-3 sentences max).`

  if (action === 'generate-question') {
    const angle = step === 'first'
      ? pickRandomAngle(FIRST_QUESTION_ANGLES)
      : pickRandomAngle(SECOND_QUESTION_ANGLES)

    if (step === 'first') {
      return `You are an intake assistant for a portfolio recommendation tool at BlackRock's iShares Direct Personalization platform. You are conducting an intelligent investor profile assessment.

The user has just completed the early portion of their questionnaire. Here is everything we know so far:

${userProfile}

Your task: Generate ONE personalized, open-ended question that probes the user's behavioral or emotional relationship with their finances. You have their numbers — now you need to understand how they *feel*.

ANGLE FOR THIS QUESTION (use this as your primary direction, but adapt to the user's specific profile):
${angle}

Do NOT ask about numbers, timelines, or account types — we already have those. Ask about the person behind the numbers. Make the question feel personal and specific to what you see in their profile — avoid generic questions.

Return ONLY the question text, no preamble or labels.
${guardrails}`
    } else {
      return `You are an intake assistant for a portfolio recommendation tool at BlackRock's iShares Direct Personalization platform. You are conducting the final stage of an intelligent investor profile assessment.

The user has completed nearly all of their questionnaire. Here is their full profile:

${userProfile}

Your task: Generate ONE synthesizing question that pressure-tests their profile for internal tensions, contradictions, or unresolved priorities. You're looking for the signal that helps us make the *right* recommendation, not just a technically correct one.

ANGLE FOR THIS QUESTION (use this as your primary direction, but adapt based on actual tensions you see in the profile):
${angle}

Look for patterns like:
- Aggressive growth preference but short timeline or low savings — what's driving the urgency?
- Conservative risk tolerance but wealth-building goal — are they being too cautious?
- High savings rate but emergency fund goal — is this temporary or a long-term posture?
- Theme selections that seem at odds with their risk profile
- Gap between their stated risk tolerance and their growth-stability preference
- FOMO-driven responses paired with conservative preferences — conflicted investor
- Plans to draw income but growth-oriented goal — needs resolution

Ask a question that gets at their deeper priorities or helps resolve an apparent tension. Be specific — reference what you actually see in their data.

Return ONLY the question text, no preamble or labels.
${guardrails}`
    }
  }

  if (action === 'analyze-response') {
    return `You are an analytical engine for a portfolio recommendation tool at BlackRock's iShares Direct Personalization platform. You are analyzing a user's free-text response to a behavioral question.

User profile:
${userProfile}

Your task: Analyze the user's response and return a JSON object with exactly these fields:

{
  "riskModifier": <number between -2.5 and 2.5>,
  "timelineConfidence": <"short" | "medium" | "long">,
  "behavioralNotes": <1-2 sentence insight suitable for display to the user, written in third person>,
  "suggestedEmphasis": <"growth" | "stability" | "income" | "balanced">
}

Scoring guidance for riskModifier:
- Strong positive (up to +2.5): User shows exceptional confidence, genuine long-term thinking, emotional resilience under pressure, demonstrated comfort with volatility, strong financial security, past experience riding out downturns
- Moderate positive (+1.0 to +1.5): User shows general confidence, reasonable long-term outlook, good emotional stability
- Near zero: Balanced, no strong signal either way
- Moderate negative (-1.0 to -1.5): User shows some anxiety, moderate short-term focus, some financial stress
- Strong negative (down to -2.5): User shows significant anxiety, strong short-term focus, financial stress, high loss aversion, life instability, FOMO-driven behavior, or clear signs they'd abandon a growth-oriented plan

Don't be afraid to use the full range. A user who describes panic-selling or extreme financial anxiety deserves a -2.0 or lower. A user who calmly describes riding out 2008 or COVID without flinching deserves +2.0 or higher. The goal is signal strength — moderate values are for moderate signals.

For timelineConfidence: Does their response suggest they're thinking short-term ("short"), have a balanced view ("medium"), or are genuinely long-term oriented ("long")? Pay attention to language about "quick returns," "ASAP," or "eventually" vs "decades" or "legacy."

For suggestedEmphasis: Based on their emotional and behavioral signals, what portfolio emphasis would serve them best? Use "income" if they express need for cash flow, yield, or financial dependence on the portfolio. Use "stability" if anxiety dominates. Use "growth" if they show patience and resilience. Use "balanced" only if signals are truly mixed.

For behavioralNotes: Write a brief, professional insight that could appear on their portfolio recommendation page. Example: "Shows strong emotional resilience and long-term perspective, supporting a growth-oriented allocation."

Return ONLY valid JSON, no markdown fences, no explanation.
${guardrails}`
  }

  return ''
}

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
        max_tokens: action === 'generate-question' ? 200 : 300,
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

      // Validate and clamp fields (wider range: ±2.5)
      const validated = {
        riskModifier: Math.max(-2.5, Math.min(2.5, Number(analysis.riskModifier) || 0)),
        timelineConfidence: ['short', 'medium', 'long'].includes(analysis.timelineConfidence)
          ? analysis.timelineConfidence : 'medium',
        behavioralNotes: typeof analysis.behavioralNotes === 'string' && analysis.behavioralNotes.length > 0
          ? analysis.behavioralNotes : NEUTRAL_ANALYSIS.behavioralNotes,
        suggestedEmphasis: ['growth', 'stability', 'income', 'balanced'].includes(analysis.suggestedEmphasis)
          ? analysis.suggestedEmphasis : 'balanced',
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
