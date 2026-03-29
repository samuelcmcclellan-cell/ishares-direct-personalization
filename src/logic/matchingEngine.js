import { PORTFOLIOS, THEME_OVERLAYS } from '../data/portfolios'
import { computeRiskScore, resolveTimeline, timelineAtLeast } from './scoringUtils'

function applyThemeOverlays(portfolio, themes) {
  if (!themes || Object.keys(themes).length === 0) return portfolio

  const activeThemes = Object.entries(themes)
    .filter(([id, selected]) => selected && id !== 'none' && THEME_OVERLAYS[id])
    .map(([id]) => THEME_OVERLAYS[id])

  if (activeThemes.length === 0) return portfolio

  // Clone the portfolio and inject thematic holdings
  const newHoldings = [...portfolio.holdings]

  for (const overlay of activeThemes) {
    // Check if ticker already in portfolio
    const existing = newHoldings.find(h => h.ticker === overlay.ticker)
    if (existing) {
      // Boost existing weight
      existing.weight = Math.min(existing.weight + 5, 25)
    } else {
      // Add the thematic ETF, reduce the largest holding to make room
      const largest = newHoldings.reduce((a, b) => a.weight > b.weight ? a : b)
      largest.weight = Math.max(largest.weight - overlay.weight, 5)
      newHoldings.push({ ticker: overlay.ticker, weight: overlay.weight })
    }
  }

  // Normalize weights to 100
  const total = newHoldings.reduce((s, h) => s + h.weight, 0)
  if (total !== 100) {
    const scale = 100 / total
    newHoldings.forEach(h => { h.weight = Math.round(h.weight * scale) })
    // Fix rounding errors on the largest holding
    const roundingDiff = 100 - newHoldings.reduce((s, h) => s + h.weight, 0)
    if (roundingDiff !== 0) {
      const biggest = newHoldings.reduce((a, b) => a.weight > b.weight ? a : b)
      biggest.weight += roundingDiff
    }
  }

  return {
    ...portfolio,
    holdings: newHoldings,
    themeOverlays: activeThemes.map(t => t.label),
  }
}

function buildExplanations(answers, riskScore) {
  const explanations = []
  const goal = answers.goal
  const timeline = resolveTimeline(answers)
  const preferences = answers.preferences || {}
  const style = answers['investment-style']?.id
  const themes = answers.themes || {}
  const risk = answers.risk

  // Goal context
  if (goal) {
    const goalLabels = {
      retirement: 'retirement', education: 'education savings',
      home: 'major purchase', 'wealth-building': 'wealth building',
      income: 'income generation', emergency: 'emergency fund',
    }
    explanations.push({ icon: 'Target', text: `Tailored for your ${goalLabels[goal.id] || goal.label} goal` })
  }

  // Timeline
  if (timeline === '20+') {
    explanations.push({ icon: 'Clock', text: 'Your 20+ year horizon allows for higher equity exposure and long-term compounding' })
  } else if (timeline === '10-20') {
    explanations.push({ icon: 'Clock', text: 'Your 10–20 year timeline balances growth potential with gradual risk reduction' })
  } else if (timeline === 'under-2') {
    explanations.push({ icon: 'Shield', text: 'Your short timeline prioritizes capital preservation over growth' })
  } else if (timeline === '2-5') {
    explanations.push({ icon: 'Shield', text: 'Your near-term timeline favors stability with moderate growth' })
  }

  // Growth preference (1-5 scale)
  const riskPref = answers['risk-preference']
  if (riskPref) {
    const prefScore = parseInt(riskPref.id)
    if (prefScore <= 2) {
      explanations.push({ icon: 'Shield', text: 'Your preference for stability guided a more conservative allocation' })
    } else if (prefScore >= 4) {
      explanations.push({ icon: 'TrendingUp', text: 'Your growth preference supports a higher equity allocation' })
    }
  }

  // Risk tolerance
  if (risk) {
    if (risk.riskScore >= 8) {
      explanations.push({ icon: 'TrendingUp', text: 'Your high comfort with volatility supports a growth-oriented allocation' })
    } else if (risk.riskScore <= 4) {
      explanations.push({ icon: 'Shield', text: 'Your preference for stability led to a more conservative bond-heavy mix' })
    }
  }

  // Near-term trigger
  if ((goal?.id === 'home' || goal?.id === 'education' || goal?.id === 'emergency') && timeline === 'under-2') {
    explanations.push({ icon: 'AlertCircle', text: 'Short-term goal timeline triggered a capital preservation portfolio' })
  }

  // Preferences
  if (preferences.taxAware) {
    explanations.push({ icon: 'Receipt', text: 'Tax-aware positioning includes municipal bonds and tax-efficient fund placement' })
  }
  if (preferences.intl) {
    explanations.push({ icon: 'Globe', text: 'Strong international exposure diversifies beyond U.S. markets' })
  }
  if (preferences.income || goal?.id === 'income') {
    explanations.push({ icon: 'DollarSign', text: 'Income focus emphasizes dividend and yield-generating holdings' })
  }

  // Style
  if (style === 'index') {
    explanations.push({ icon: 'BarChart3', text: 'Pure index approach keeps costs low with broad market-tracking ETFs' })
  } else if (style === 'active') {
    explanations.push({ icon: 'Zap', text: 'Active strategy includes BlackRock-managed funds seeking outperformance' })
  }

  // Themes
  const activeThemes = Object.entries(themes).filter(([id, v]) => v && id !== 'none')
  if (activeThemes.length > 0) {
    const themeLabels = { ai: 'AI & Technology', 'clean-energy': 'Clean Energy', innovation: 'Innovation', dividend: 'Dividend Growers' }
    const names = activeThemes.map(([id]) => themeLabels[id] || id).join(', ')
    explanations.push({ icon: 'Sparkles', text: `Thematic overlays add exposure to ${names}` })
  }

  // Deep-dive calibration
  if (answers.deepDive) {
    const answered = Object.keys(answers.deepDive).length
    explanations.push({ icon: 'SlidersHorizontal', text: `Fine-tuned with ${answered} additional data points from your detailed profile` })
  }

  // AI behavioral insights
  const ai1 = answers['ai-insight-1']
  if (ai1?.analysis?.behavioralNotes && ai1.analysis.behavioralNotes !== 'Standard risk profile based on questionnaire data.') {
    explanations.push({ icon: 'Brain', text: ai1.analysis.behavioralNotes })
  }
  const ai2 = answers['ai-insight-2']
  if (ai2?.analysis?.behavioralNotes && ai2.analysis.behavioralNotes !== 'Standard risk profile based on questionnaire data.') {
    explanations.push({ icon: 'Brain', text: ai2.analysis.behavioralNotes })
  }

  return explanations
}

export function matchPortfolio(answers) {
  const riskScore = computeRiskScore(answers)
  const goal = answers.goal?.id
  const timeline = resolveTimeline(answers)
  const preferences = answers.preferences || {}
  const themes = answers.themes || {}
  const explanations = buildExplanations(answers, riskScore)

  const result = (portfolio) => ({
    portfolio: applyThemeOverlays(portfolio, themes),
    riskScore,
    explanations,
  })

  // 1. Near-term capital preservation auto-trigger
  if ((goal === 'home' || goal === 'education' || goal === 'emergency') && timeline === 'under-2') {
    const nearTermMatch = PORTFOLIOS.find(p => p.id === 'near-term-reserve')
    if (nearTermMatch) return result(nearTermMatch)
  }

  // 2. Preference-based variants
  if (preferences.taxAware) {
    const taxMatch = PORTFOLIOS.find(p => p.preference === 'taxAware')
    if (taxMatch) return result(taxMatch)
  }

  if (preferences.intl) {
    const intlMatch = PORTFOLIOS.find(p => p.preference === 'intl')
    if (intlMatch) return result(intlMatch)
  }

  if (preferences.income || goal === 'income') {
    const incomeMatch = PORTFOLIOS.find(p => p.preference === 'income')
    if (incomeMatch) return result(incomeMatch)
  }

  // 3. Investment style variants
  const style = answers['investment-style']?.id
  if (style === 'index') {
    const indexMatch = PORTFOLIOS.find(p => p.style === 'index')
    if (indexMatch) return result(indexMatch)
  }
  if (style === 'active') {
    const activeMatch = PORTFOLIOS.find(p => p.style === 'active')
    if (activeMatch) return result(activeMatch)
  }

  // 4. Core risk-score matching
  let candidates = PORTFOLIOS.filter(p => !p.preference && !p.style && p.id !== 'near-term-reserve')

  // Filter by goal compatibility
  if (goal) {
    const goalFiltered = candidates.filter(p => p.suitableFor.goals.includes(goal))
    if (goalFiltered.length > 0) candidates = goalFiltered
  }

  // Filter by timeline compatibility
  if (timeline) {
    const timeFiltered = candidates.filter(p => timelineAtLeast(timeline, p.suitableFor.minTimeline))
    if (timeFiltered.length > 0) candidates = timeFiltered
  }

  // Select closest risk score match, ties break by AI emphasis then toward growth
  const aiEmphasis = answers['ai-insight-2']?.analysis?.suggestedEmphasis
  candidates.sort((a, b) => {
    const diffA = Math.abs(a.riskScore - riskScore)
    const diffB = Math.abs(b.riskScore - riskScore)
    if (diffA !== diffB) return diffA - diffB

    // Use AI emphasis as tiebreaker
    if (aiEmphasis && aiEmphasis !== 'balanced') {
      const emphasisScore = (p) => {
        if (aiEmphasis === 'growth' && p.riskScore >= 7) return 1
        if (aiEmphasis === 'stability' && p.riskScore <= 4) return 1
        if (aiEmphasis === 'income' && p.preference === 'income') return 1
        return 0
      }
      const esDiff = emphasisScore(b) - emphasisScore(a)
      if (esDiff !== 0) return esDiff
    }

    return b.riskScore - a.riskScore // break tie toward growth
  })

  return result(candidates[0])
}
