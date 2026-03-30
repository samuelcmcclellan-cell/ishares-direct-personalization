import { TIMELINE_ORDER } from '../data/questions'

const TIMELINE_UPLIFT = {
  '20+': 1.0,
  '10-20': 0.5,
  '5-10': 0,
  '2-5': 0,
  'under-2': 0,
}

export function computeRiskScore(answers) {
  const baseScore = answers.risk?.riskScore || 3

  let modifier = 0

  // Deep-dive modifiers
  if (answers.deepDive) {
    const ddKeys = ['savings-pct', 'experience', 'emergency-fund',
                    'income-stability', 'withdrawal-likelihood', 'checking-behavior']
    for (const key of ddKeys) {
      if (answers.deepDive[key]) {
        modifier += answers.deepDive[key].modifier || 0
      }
    }
  }

  // Goal follow-up risk nudge
  const followup = answers['goal-followup']
  if (followup?.riskNudge) {
    modifier += followup.riskNudge
  }

  // Universal growth vs. stability preference (1-5 scale)
  const riskPref = answers['risk-preference']
  if (riskPref?.riskNudge) {
    modifier += riskPref.riskNudge
  }

  // Goal-conditional risk nudge (e.g., retirement savings situation)
  const conditional = answers['goal-conditional']
  if (conditional?.riskNudge) {
    modifier += conditional.riskNudge
  }

  // Existing holdings signal — if user is bond-heavy elsewhere, push equity here
  const holdings = answers['existing-holdings']
  if (holdings?.holdingsSignal === 'bond-heavy') {
    modifier += 0.5
  } else if (holdings?.holdingsSignal === 'equity-heavy') {
    modifier -= 0.5
  } else if (holdings?.holdingsSignal === 'none') {
    modifier -= 0.25 // first-time investor, nudge slightly conservative
  }

  // FOMO / regret-from-inaction reaction
  const fomo = answers['fomo-reaction']
  if (fomo?.fomoScore != null) {
    // fomoScore: 3 = FOMO-driven (bad for stickiness, nudge conservative)
    // fomoScore: -1 = cautious about others' high returns (already conservative)
    if (fomo.fomoScore >= 3) {
      modifier -= 0.5 // FOMO-prone: nudge conservative for stickiness
    } else if (fomo.fomoScore <= -1) {
      modifier -= 0.25 // naturally cautious
    }
  }

  // Income draw expectation
  const draw = answers['income-draw']
  if (draw?.drawSignal === 'regular') {
    modifier -= 0.75
  } else if (draw?.drawSignal === 'lump') {
    modifier -= 0.5
  } else if (draw?.drawSignal === 'partial') {
    modifier -= 0.25
  }

  // AI insight modifiers (wider range: ±2.5 each, ±5.0 combined)
  const aiInsight1 = answers['ai-insight-1']
  if (aiInsight1?.analysis?.riskModifier) {
    modifier += aiInsight1.analysis.riskModifier
  }
  const aiInsight2 = answers['ai-insight-2']
  if (aiInsight2?.analysis?.riskModifier) {
    modifier += aiInsight2.analysis.riskModifier
  }

  // AI timeline confidence — if AI thinks user is shorter-term than stated, nudge down
  const aiTimelineConf1 = aiInsight1?.analysis?.timelineConfidence
  const aiTimelineConf2 = aiInsight2?.analysis?.timelineConfidence
  const timeline = resolveTimeline(answers)
  const longTimelines = ['10-20', '20+']
  if (timeline && longTimelines.includes(timeline)) {
    if (aiTimelineConf1 === 'short' || aiTimelineConf2 === 'short') {
      modifier -= 1.0 // AI detects short-term thinking despite long stated timeline
    } else if (aiTimelineConf1 === 'medium' && aiTimelineConf2 === 'short') {
      modifier -= 0.75
    }
  }

  // Timeline uplift — long horizons counterbalance inexperience penalties
  if (timeline && TIMELINE_UPLIFT[timeline]) {
    modifier += TIMELINE_UPLIFT[timeline]
  }

  return Math.max(1, Math.min(10, Math.round(baseScore + modifier)))
}

/**
 * Resolve effective timeline — if the goal follow-up implies a timeline,
 * use it as a hint (user can still override on the timeline step).
 */
export function resolveTimeline(answers) {
  return answers.timeline?.id || answers['goal-followup']?.impliedTimeline || null
}

export function timelineAtLeast(userTimeline, minTimeline) {
  const userIdx = TIMELINE_ORDER.indexOf(userTimeline)
  const minIdx = TIMELINE_ORDER.indexOf(minTimeline)
  if (userIdx === -1 || minIdx === -1) return true
  return userIdx >= minIdx
}
