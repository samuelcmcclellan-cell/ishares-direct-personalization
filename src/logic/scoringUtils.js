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
    if (answers.deepDive['savings-pct']) {
      modifier += answers.deepDive['savings-pct'].modifier || 0
    }
    if (answers.deepDive['experience']) {
      modifier += answers.deepDive['experience'].modifier || 0
    }
  }

  // Goal follow-up risk nudge (e.g., wealth-building priorities)
  const followup = answers['goal-followup']
  if (followup?.riskNudge) {
    modifier += followup.riskNudge
  }

  // Timeline uplift — long horizons counterbalance inexperience penalties
  const timeline = resolveTimeline(answers)
  if (timeline && TIMELINE_UPLIFT[timeline]) {
    modifier += TIMELINE_UPLIFT[timeline]
  }

  return Math.max(1, Math.min(5, Math.round(baseScore + modifier)))
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
