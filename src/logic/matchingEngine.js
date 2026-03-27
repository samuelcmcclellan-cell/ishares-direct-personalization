import { PORTFOLIOS } from '../data/portfolios'
import { computeRiskScore, timelineAtLeast } from './scoringUtils'

export function matchPortfolio(answers) {
  const riskScore = computeRiskScore(answers)
  const goal = answers.goal?.id
  const timeline = answers.timeline?.id
  const preferences = answers.preferences || {}

  // Check for preference-based variants first
  if (preferences.taxAware) {
    const taxMatch = PORTFOLIOS.find(p => p.preference === 'taxAware')
    if (taxMatch) return { portfolio: taxMatch, riskScore }
  }

  if (preferences.income || goal === 'income') {
    const incomeMatch = PORTFOLIOS.find(p => p.preference === 'income')
    if (incomeMatch) return { portfolio: incomeMatch, riskScore }
  }

  // Filter by goal compatibility
  let candidates = PORTFOLIOS.filter(p => !p.preference)

  if (goal) {
    const goalFiltered = candidates.filter(p => p.suitableFor.goals.includes(goal))
    if (goalFiltered.length > 0) candidates = goalFiltered
  }

  // Filter by timeline compatibility
  if (timeline) {
    const timeFiltered = candidates.filter(p => timelineAtLeast(timeline, p.suitableFor.minTimeline))
    if (timeFiltered.length > 0) candidates = timeFiltered
  }

  // Select closest risk score match, ties break conservative
  candidates.sort((a, b) => {
    const diffA = Math.abs(a.riskScore - riskScore)
    const diffB = Math.abs(b.riskScore - riskScore)
    if (diffA !== diffB) return diffA - diffB
    return a.riskScore - b.riskScore // break tie toward conservative
  })

  return { portfolio: candidates[0], riskScore }
}
