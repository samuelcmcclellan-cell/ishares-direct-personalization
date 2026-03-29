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

export async function generateQuestion(step, answers) {
  try {
    const res = await fetch('/api/ai-insight', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'generate-question', step, answers }),
    })

    if (!res.ok) {
      return { question: FALLBACK_QUESTIONS[step], fallback: true }
    }

    const data = await res.json()
    return { question: data.question || FALLBACK_QUESTIONS[step], fallback: !!data.fallback }
  } catch {
    return { question: FALLBACK_QUESTIONS[step], fallback: true }
  }
}

export async function analyzeResponse(step, answers, question, userResponse) {
  try {
    const res = await fetch('/api/ai-insight', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'analyze-response', step, answers, question, userResponse }),
    })

    if (!res.ok) {
      return { analysis: NEUTRAL_ANALYSIS, fallback: true }
    }

    const data = await res.json()
    return { analysis: data.analysis || NEUTRAL_ANALYSIS, fallback: !!data.fallback }
  } catch {
    return { analysis: NEUTRAL_ANALYSIS, fallback: true }
  }
}
