import { TIMELINE_ORDER } from '../data/questions'

export function computeRiskScore(answers) {
  const baseScore = answers.risk?.riskScore || 3

  let modifier = 0
  if (answers.deepDive) {
    if (answers.deepDive['savings-pct']) {
      modifier += answers.deepDive['savings-pct'].modifier || 0
    }
    if (answers.deepDive['experience']) {
      modifier += answers.deepDive['experience'].modifier || 0
    }
  }

  return Math.max(1, Math.min(5, Math.round(baseScore + modifier)))
}

export function timelineAtLeast(userTimeline, minTimeline) {
  const userIdx = TIMELINE_ORDER.indexOf(userTimeline)
  const minIdx = TIMELINE_ORDER.indexOf(minTimeline)
  if (userIdx === -1 || minIdx === -1) return true
  return userIdx >= minIdx
}
