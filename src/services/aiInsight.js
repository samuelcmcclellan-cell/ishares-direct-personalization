const FALLBACK_QUESTIONS = {
  first: {
    question: "What's the one money decision that still keeps you up at night — or the one you're most proud of?",
    options: [
      "A past loss that still stings — I replay what I should have done differently",
      "A smart move I made early — it gave me confidence to keep going",
      "I haven't made any big money decisions yet — that's part of why I'm here",
      "I try not to dwell on past decisions — I'd rather focus on what's next"
    ]
  },
  second: {
    question: "If your portfolio could only get one thing absolutely right, what would it be?",
    options: [
      "Protect what I have — I can't afford to lose it",
      "Grow aggressively — I have time to recover from setbacks",
      "Generate steady income I can count on",
      "Stay balanced — I want growth without losing sleep"
    ]
  },
  third: {
    question: "Your portfolio drops 15% while the overall market is flat. A colleague just moved to cash and feels great about it. What do you actually do?",
    options: [
      "Follow their lead — cash sounds safe right now",
      "Hold steady but check my account daily until it recovers",
      "Ignore the noise — I trust my plan and don't look",
      "See it as a buying opportunity and add more"
    ]
  },
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
      const fb = FALLBACK_QUESTIONS[step]
      return { question: fb.question, options: fb.options, fallback: true }
    }

    const data = await res.json()
    return {
      question: data.question || FALLBACK_QUESTIONS[step].question,
      options: data.options || FALLBACK_QUESTIONS[step].options,
      fallback: !!data.fallback,
    }
  } catch {
    const fb = FALLBACK_QUESTIONS[step]
    return { question: fb.question, options: fb.options, fallback: true }
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
