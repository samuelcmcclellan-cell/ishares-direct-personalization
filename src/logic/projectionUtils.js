export const GOAL_HORIZONS = {
  education: 10, home: 7, 'wealth-building': 20, income: 15, emergency: 3,
}

const RISK_SCORE_RETURN_MAP = {
  1: 0.025, 2: 0.04, 3: 0.05, 4: 0.06, 5: 0.07,
  6: 0.075, 7: 0.085, 8: 0.095, 9: 0.105, 10: 0.115,
}

export function formatDollar(v) {
  if (v >= 1000000) return `$${(v / 1000000).toFixed(1)}M`
  if (v >= 1000) return `$${Math.round(v / 1000)}K`
  return `$${v}`
}

export function formatDollarFull(v) {
  return '$' + v.toLocaleString('en-US')
}

export function parseTargetReturn(str) {
  if (!str) return null
  const match = str.match(/(\d+(?:\.\d+)?)\s*[\u2013\-]\s*(\d+(?:\.\d+)?)/)
  if (!match) return null
  return ((parseFloat(match[1]) + parseFloat(match[2])) / 2) / 100
}

export function getExpectedReturn(portfolio) {
  if (!portfolio) return 0.07
  const parsed = parseTargetReturn(portfolio.targetReturn)
  if (parsed) return parsed
  return RISK_SCORE_RETURN_MAP[portfolio.riskScore] || 0.07
}

export function computeProjection(currentAge, endAge, currentSavings, annualIncome, savingsRate, returnRate) {
  const years = Math.max(0, endAge - currentAge)
  const incomeGrowthRate = 0.03
  const data = []
  let balance = currentSavings
  for (let t = 0; t <= years; t++) {
    data.push({ year: t, age: currentAge + t, value: Math.round(Math.max(0, balance)) })
    if (t < years) {
      const yearIncome = annualIncome * Math.pow(1 + incomeGrowthRate, t)
      const yearContribution = yearIncome * savingsRate / 100
      balance = (balance + yearContribution) * (1 + returnRate)
    }
  }
  return data
}
