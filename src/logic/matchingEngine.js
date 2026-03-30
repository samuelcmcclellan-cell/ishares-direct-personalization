import { PORTFOLIOS, THEME_OVERLAYS } from '../data/portfolios'
import { computeRiskScore, resolveTimeline, timelineAtLeast } from './scoringUtils'

function applyThemeOverlays(portfolio, themes) {
  if (!themes || Object.keys(themes).length === 0) return portfolio

  const activeThemes = Object.entries(themes)
    .filter(([id, selected]) => selected && id !== 'none' && THEME_OVERLAYS[id])
    .map(([id]) => THEME_OVERLAYS[id])

  if (activeThemes.length === 0) return portfolio

  // Deep-clone holdings to avoid mutating the source PORTFOLIOS array
  const newHoldings = portfolio.holdings.map(h => ({ ...h }))

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

  // Existing holdings context
  const holdings = answers['existing-holdings']
  if (holdings?.holdingsSignal === 'bond-heavy') {
    explanations.push({ icon: 'BarChart3', text: 'Since your existing holdings lean toward bonds, this portfolio tilts toward equity for better overall diversification' })
  } else if (holdings?.holdingsSignal === 'equity-heavy') {
    explanations.push({ icon: 'BarChart3', text: 'Your existing equity-heavy holdings suggest a more balanced approach here' })
  }

  // FOMO reaction
  const fomo = answers['fomo-reaction']
  if (fomo?.fomoScore >= 3) {
    explanations.push({ icon: 'Brain', text: 'Your sensitivity to relative performance suggests a portfolio you can stick with through market cycles' })
  }

  // Income draw
  const draw = answers['income-draw']
  if (draw?.drawSignal === 'regular' || draw?.drawSignal === 'lump') {
    explanations.push({ icon: 'DollarSign', text: 'Expected withdrawals favor more liquid, lower-volatility holdings' })
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
    const themeLabels = { ai: 'AI & Technology', 'clean-energy': 'Clean Energy', 'power-infra': 'Power & Infrastructure', defense: 'Defense & Aerospace' }
    const names = activeThemes.map(([id]) => themeLabels[id] || id).join(', ')
    explanations.push({ icon: 'Sparkles', text: `Thematic overlays add exposure to ${names}` })
  }

  // Deep-dive calibration
  if (answers.deepDive) {
    const answered = Object.keys(answers.deepDive).length
    explanations.push({ icon: 'SlidersHorizontal', text: `Fine-tuned with ${answered} additional data points from your detailed profile` })
  }

  // AI behavioral insights — surface when they meaningfully shifted the result
  const ai1 = answers['ai-insight-1']
  const ai2 = answers['ai-insight-2']
  const totalAiModifier = (ai1?.analysis?.riskModifier || 0) + (ai2?.analysis?.riskModifier || 0)

  if (Math.abs(totalAiModifier) >= 1.5) {
    // AI had a significant influence — show a prominent explanation
    const direction = totalAiModifier > 0 ? 'growth-oriented' : 'more conservative'
    explanations.push({ icon: 'Brain', text: `Your behavioral responses guided a ${direction} allocation (AI confidence: ${totalAiModifier > 0 ? '+' : ''}${totalAiModifier.toFixed(1)} risk adjustment)` })
  }

  // Show individual AI notes only if AI didn't already get a combined explanation
  if (Math.abs(totalAiModifier) < 1.5) {
    if (ai1?.analysis?.behavioralNotes && ai1.analysis.behavioralNotes !== 'Standard risk profile based on questionnaire data.') {
      explanations.push({ icon: 'Brain', text: ai1.analysis.behavioralNotes })
    }
    if (ai2?.analysis?.behavioralNotes && ai2.analysis.behavioralNotes !== 'Standard risk profile based on questionnaire data.') {
      explanations.push({ icon: 'Brain', text: ai2.analysis.behavioralNotes })
    }
  }

  // AI timeline confidence mismatch
  const aiTimelineConf1 = ai1?.analysis?.timelineConfidence
  const aiTimelineConf2 = ai2?.analysis?.timelineConfidence
  if ((aiTimelineConf1 === 'short' || aiTimelineConf2 === 'short') && timeline && ['10-20', '20+'].includes(timeline)) {
    explanations.push({ icon: 'Clock', text: 'Your responses suggest shorter-term thinking than your stated timeline — we adjusted toward more stability' })
  }

  return explanations
}

/**
 * Find the best preference variant given risk score.
 * Picks the variant closest to the computed risk score.
 */
function findBestPreferenceVariant(preference, riskScore) {
  const variants = PORTFOLIOS.filter(p => p.preference === preference)
  if (variants.length === 0) return null
  variants.sort((a, b) => Math.abs(a.riskScore - riskScore) - Math.abs(b.riskScore - riskScore))
  return variants[0]
}

/**
 * Find the best style variant given risk score.
 */
function findBestStyleVariant(style, riskScore) {
  const variants = PORTFOLIOS.filter(p => p.style === style)
  if (variants.length === 0) return null
  variants.sort((a, b) => Math.abs(a.riskScore - riskScore) - Math.abs(b.riskScore - riskScore))
  return variants[0]
}

export function matchPortfolio(answers) {
  const riskScore = computeRiskScore(answers)
  const goal = answers.goal?.id
  const timeline = resolveTimeline(answers)
  const preferences = answers.preferences || {}
  const themes = answers.themes || {}
  const explanations = buildExplanations(answers, riskScore)

  // Collect AI emphasis signals
  const aiEmphasis1 = answers['ai-insight-1']?.analysis?.suggestedEmphasis
  const aiEmphasis2 = answers['ai-insight-2']?.analysis?.suggestedEmphasis
  // Use the most recent non-balanced emphasis, or fall back to first
  const aiEmphasis = (aiEmphasis2 && aiEmphasis2 !== 'balanced') ? aiEmphasis2
    : (aiEmphasis1 && aiEmphasis1 !== 'balanced') ? aiEmphasis1
    : null

  // Income draw signal can act as an implicit income preference
  const drawSignal = answers['income-draw']?.drawSignal
  const implicitIncome = drawSignal === 'regular' && !preferences.income

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

  // 2. Preference-based variants (now risk-tiered)
  if (preferences.taxAware) {
    const taxMatch = findBestPreferenceVariant('taxAware', riskScore)
    if (taxMatch) return result(taxMatch)
  }

  if (preferences.intl) {
    const intlMatch = findBestPreferenceVariant('intl', riskScore)
    if (intlMatch) return result(intlMatch)
  }

  if (preferences.income || goal === 'income' || implicitIncome) {
    const incomeMatch = findBestPreferenceVariant('income', riskScore)
    if (incomeMatch) return result(incomeMatch)
  }

  // AI emphasis can nudge toward income portfolios even without explicit preference
  if (aiEmphasis === 'income' && !preferences.income && goal !== 'income') {
    const incomeMatch = findBestPreferenceVariant('income', riskScore)
    if (incomeMatch) return result(incomeMatch)
  }

  // 3. Investment style variants (now risk-tiered)
  const style = answers['investment-style']?.id
  if (style === 'index') {
    const indexMatch = findBestStyleVariant('index', riskScore)
    if (indexMatch) return result(indexMatch)
  }
  if (style === 'active') {
    const activeMatch = findBestStyleVariant('active', riskScore)
    if (activeMatch) return result(activeMatch)
  }

  // 4. Goal-variant matching — check for goal-specific portfolios first
  if (goal) {
    const goalVariants = PORTFOLIOS.filter(p => p.goalVariant === goal)
    if (goalVariants.length > 0) {
      // Filter by timeline compatibility
      let candidates = goalVariants
      if (timeline) {
        const timeFiltered = candidates.filter(p => timelineAtLeast(timeline, p.suitableFor.minTimeline))
        if (timeFiltered.length > 0) candidates = timeFiltered
      }
      // Pick closest risk score
      candidates.sort((a, b) => Math.abs(a.riskScore - riskScore) - Math.abs(b.riskScore - riskScore))
      if (candidates.length > 0) return result(candidates[0])
    }
  }

  // 5. Core risk-score matching (fallback)
  let candidates = PORTFOLIOS.filter(p => !p.preference && !p.style && !p.goalVariant && p.id !== 'near-term-reserve')

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
  candidates.sort((a, b) => {
    const diffA = Math.abs(a.riskScore - riskScore)
    const diffB = Math.abs(b.riskScore - riskScore)
    if (diffA !== diffB) return diffA - diffB

    // Use AI emphasis as tiebreaker
    if (aiEmphasis) {
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
