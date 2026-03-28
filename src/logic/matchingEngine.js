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

export function matchPortfolio(answers) {
  const riskScore = computeRiskScore(answers)
  const goal = answers.goal?.id
  const timeline = resolveTimeline(answers)
  const preferences = answers.preferences || {}
  const themes = answers.themes || {}

  // 1. Near-term capital preservation auto-trigger
  if ((goal === 'home' || goal === 'education') && timeline === 'under-2') {
    const nearTermMatch = PORTFOLIOS.find(p => p.id === 'near-term-reserve')
    if (nearTermMatch) return { portfolio: applyThemeOverlays(nearTermMatch, themes), riskScore }
  }

  // 2. Preference-based variants
  if (preferences.taxAware) {
    const taxMatch = PORTFOLIOS.find(p => p.preference === 'taxAware')
    if (taxMatch) return { portfolio: applyThemeOverlays(taxMatch, themes), riskScore }
  }

  if (preferences.intl) {
    const intlMatch = PORTFOLIOS.find(p => p.preference === 'intl')
    if (intlMatch) return { portfolio: applyThemeOverlays(intlMatch, themes), riskScore }
  }

  if (preferences.income || goal === 'income') {
    const incomeMatch = PORTFOLIOS.find(p => p.preference === 'income')
    if (incomeMatch) return { portfolio: applyThemeOverlays(incomeMatch, themes), riskScore }
  }

  // 3. Investment style variants
  const style = answers['investment-style']?.id
  if (style === 'index') {
    const indexMatch = PORTFOLIOS.find(p => p.style === 'index')
    if (indexMatch) return { portfolio: applyThemeOverlays(indexMatch, themes), riskScore }
  }
  if (style === 'active') {
    const activeMatch = PORTFOLIOS.find(p => p.style === 'active')
    if (activeMatch) return { portfolio: applyThemeOverlays(activeMatch, themes), riskScore }
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

  // Select closest risk score match, ties break toward growth
  candidates.sort((a, b) => {
    const diffA = Math.abs(a.riskScore - riskScore)
    const diffB = Math.abs(b.riskScore - riskScore)
    if (diffA !== diffB) return diffA - diffB
    return b.riskScore - a.riskScore // break tie toward growth
  })

  return { portfolio: applyThemeOverlays(candidates[0], themes), riskScore }
}
