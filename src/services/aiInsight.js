const FALLBACK_QUESTIONS = {
  first: "What's the one money decision that still keeps you up at night — or the one you're most proud of?",
  second: "If your portfolio could only get one thing absolutely right, what would it be?",
  third: "Your portfolio drops 15% while the overall market is flat. A colleague just moved to cash and feels great about it. What do you actually do?",
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
