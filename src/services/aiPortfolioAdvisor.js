export async function getPortfolioRecommendation(answers, computedRiskScore, portfolioLibrary) {
  const res = await fetch('/api/ai-portfolio-advisor', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ answers, computedRiskScore, portfolioLibrary }),
  })
  const data = await res.json()
  return data
}
