const SYSTEM_PROMPT = `You are a senior portfolio strategist at BlackRock's iShares Direct Personalization platform. You combine deep quantitative understanding with behavioral finance expertise. Your role is to analyze a complete investor profile and recommend the single best-fit portfolio from a curated library.

You think in layers:

LAYER 1 — QUANTITATIVE FIT
Start with hard constraints: timeline compatibility, risk score range, goal alignment. Eliminate portfolios that violate any hard constraint. Consider:
- Timeline vs. minimum timeline requirements
- Risk score proximity (within ±2 of computed score)
- Goal suitability match
- Account type implications (tax-aware for taxable, growth-oriented for Roth)

LAYER 2 — BEHAVIORAL CALIBRATION
Adjust for what the questionnaire revealed about this person's ACTUAL behavior vs. their STATED preferences:
- If AI insights detected loss-aversion but they claimed high risk tolerance → lean conservative
- If stickiness factor is negative (likely to abandon plan) → favor lower-volatility portfolios they'll actually hold
- If FOMO detected → avoid aggressive portfolios that amplify comparison anxiety
- If engagement quality was "surface" or "evasive" → default toward balanced, don't over-optimize
- If detected biases include overconfidence → temper aggressive tilts
- Weight the AI insight with highest confidence level most heavily

LAYER 3 — LIFE CONTEXT SYNTHESIS
Consider the full picture:
- Age + savings + income trajectory: Are they on track, behind, or ahead?
- Existing holdings: complement, don't duplicate
- Withdrawal needs: if they need liquidity, don't lock them into pure growth
- Income stability: variable income + aggressive portfolio = recipe for panic selling
- Emergency fund status: no safety net + aggressive investing = high abandonment risk

LAYER 4 — SECOND-ORDER EFFECTS
Think about what happens AFTER they get this portfolio:
- Will they actually stick with it through a downturn?
- Does it match their checking behavior? (Daily checkers need lower volatility)
- Is the portfolio complex enough to feel personalized but simple enough to understand?
- Does the style preference (index/active/blend) align with their control needs?

OUTPUT REQUIREMENTS:
Return a JSON object with exactly these fields:
{
  "recommendedPortfolioId": string (exact portfolio id from the library),
  "confidence": number (0.0–1.0, how confident you are this is the right fit),
  "primaryReason": string (1 sentence, the single most important reason — this is shown prominently to the user),
  "secondaryReasons": string[] (2-3 short sentences, supporting rationale),
  "portfoliosConsidered": string[] (2-3 portfolio ids that were close runners-up),
  "riskAdjustment": string ("none" | "nudged-conservative" | "nudged-aggressive"),
  "riskAdjustmentReason": string (why you nudged, or "N/A"),
  "behavioralWarning": string | null (if you detect a pattern that could cause problems — e.g. "This investor may panic-sell during normal market corrections. Consider setting expectations about volatility upfront."),
  "narrativeSummary": string (2-3 sentences that tie the recommendation to the investor's story — this is the "your AI advisor says" moment the user sees)
}

IMPORTANT CONSTRAINTS:
- You MUST select from the provided portfolio library. Do not invent portfolios.
- You MUST consider ALL behavioral data, not just the quantitative score.
- If behavioral signals contradict the quantitative fit, explain the tension and which signal you weighted more heavily.
- Never recommend a portfolio with a risk score more than 3 points away from the computed risk score unless you have a compelling behavioral reason (and explain it).
- Keep narrativeSummary warm, professional, and specific to THIS person. No generic platitudes.`

function buildUserMessage(answers, computedRiskScore, portfolioLibrary) {
  const lines = []
  lines.push('INVESTOR PROFILE:')
  if (answers.goal) lines.push(`Goal: ${answers.goal.label}`)
  if (answers['goal-followup']) lines.push(`Goal details: ${answers['goal-followup'].label}`)
  if (answers['risk-preference']) lines.push(`Growth preference: ${answers['risk-preference'].label}`)
  if (answers['financial-picture']) {
    const fp = answers['financial-picture']
    const parts = []
    if (fp.currentAge) parts.push(`Age: ${fp.currentAge}`)
    if (fp.retirementAge) parts.push(`Retirement: ${fp.retirementAge}`)
    if (fp.currentSavings != null) parts.push(`Savings: $${Number(fp.currentSavings).toLocaleString()}`)
    if (fp.annualIncome != null) parts.push(`Income: $${Number(fp.annualIncome).toLocaleString()}`)
    if (fp.savingsRate != null) parts.push(`Rate: ${fp.savingsRate}%`)
    lines.push(`Financials: ${parts.join(' | ')}`)
  }
  if (answers['existing-holdings']) lines.push(`Existing holdings: ${answers['existing-holdings'].label}`)
  if (answers['account-type']) lines.push(`Account: ${answers['account-type'].label}`)
  if (answers.timeline) lines.push(`Timeline: ${answers.timeline.label}`)
  if (answers.risk) lines.push(`Risk reaction: ${answers.risk.label} (score: ${answers.risk.riskScore})`)
  if (answers['fomo-reaction']) lines.push(`FOMO reaction: ${answers['fomo-reaction'].label}`)
  if (answers['income-draw']) lines.push(`Withdrawals: ${answers['income-draw'].label}`)
  if (answers['investment-style']) lines.push(`Style: ${answers['investment-style'].label}`)

  for (const key of ['ai-insight-early', 'ai-insight-1', 'ai-insight-2', 'ai-insight-3']) {
    const insight = answers[key]
    if (insight?.question && insight?.response) {
      lines.push(`\nAI Q (${key}): "${insight.question}"`)
      lines.push(`Response: "${insight.response}"`)
      if (insight.analysis) {
        const a = insight.analysis
        lines.push(`Analysis: risk modifier ${a.riskModifier}, confidence ${a.confidenceLevel}, biases: ${(a.detectedBiases || []).join(', ') || 'none'}, stickiness: ${a.stickinessFactor}, narrative: ${a.profileNarrative}`)
      }
    }
  }

  lines.push(`\nCOMPUTED RISK SCORE: ${computedRiskScore}/10`)
  lines.push('\nPORTFOLIO LIBRARY:')
  for (const p of portfolioLibrary) {
    const aa = p.assetAllocation || {}
    const goals = p.suitableFor?.goals?.join(', ') || 'general'
    const minTl = p.suitableFor?.minTimeline || 'any'
    lines.push(`- ${p.id}: ${p.name} | Risk: ${p.riskScore} (${p.riskLabel}) | Return: ${p.targetReturn} | For: ${goals} | Min timeline: ${minTl} | Alloc: US Eq ${aa.usEquity || 0}%, Intl Eq ${aa.intlEquity || 0}%, Bonds ${aa.usBonds || 0}%, Alts ${aa.alternatives || 0}%, Cash ${aa.cash || 0}%`)
  }

  lines.push('\nSelect the best portfolio and explain your reasoning.')
  return lines.join('\n')
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return res.status(500).json({ error: 'OPENAI_API_KEY not configured', fallback: true })

  const { answers, computedRiskScore, portfolioLibrary } = req.body
  if (!answers || computedRiskScore == null || !portfolioLibrary) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  const userMessage = buildUserMessage(answers, computedRiskScore, portfolioLibrary)

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userMessage },
        ],
        temperature: 0.3,
        max_tokens: 800,
        response_format: { type: 'json_object' },
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('OpenAI API error:', response.status, errorData)
      return res.status(200).json({ error: 'AI service unavailable', fallback: true })
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content?.trim()
    if (!content) return res.status(200).json({ error: 'Empty response', fallback: true })

    const parsed = JSON.parse(content)
    const validIds = portfolioLibrary.map(p => p.id)
    const result = {
      recommendedPortfolioId: validIds.includes(parsed.recommendedPortfolioId) ? parsed.recommendedPortfolioId : null,
      confidence: Math.max(0, Math.min(1, Number(parsed.confidence) || 0.5)),
      primaryReason: parsed.primaryReason || '',
      secondaryReasons: Array.isArray(parsed.secondaryReasons) ? parsed.secondaryReasons.slice(0, 3) : [],
      portfoliosConsidered: Array.isArray(parsed.portfoliosConsidered) ? parsed.portfoliosConsidered : [],
      riskAdjustment: ['none', 'nudged-conservative', 'nudged-aggressive'].includes(parsed.riskAdjustment) ? parsed.riskAdjustment : 'none',
      riskAdjustmentReason: parsed.riskAdjustmentReason || 'N/A',
      behavioralWarning: typeof parsed.behavioralWarning === 'string' && parsed.behavioralWarning.length > 0 ? parsed.behavioralWarning : null,
      narrativeSummary: parsed.narrativeSummary || '',
    }

    return res.status(200).json(result)
  } catch (err) {
    console.error('AI portfolio advisor error:', err)
    return res.status(200).json({ error: 'Failed to process', fallback: true })
  }
}
