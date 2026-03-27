import { STEPS, GOAL_FOLLOWUPS } from '../../../data/questions'

function getStepLabel(stepId, answers) {
  if (stepId === 'goal-followup') {
    const goalId = answers.goal?.id
    const followup = goalId ? GOAL_FOLLOWUPS[goalId] : null
    return followup?.title || 'Follow-up'
  }
  const step = STEPS.find(s => s.id === stepId)
  return step?.title || stepId.charAt(0).toUpperCase() + stepId.slice(1)
}

function getAnswerDisplay(stepId, answer) {
  if (!answer) return 'Not answered'

  switch (stepId) {
    case 'goal':
    case 'timeline':
    case 'risk':
    case 'goal-followup':
      return answer.label
    case 'deep-dive':
      return Object.values(answer).map(a => a.label).join(', ')
    case 'preferences': {
      const active = Object.entries(answer).filter(([, v]) => v).map(([k]) => k)
      if (active.length === 0) return 'None selected'
      const labelMap = { income: 'Income', intl: 'International', taxAware: 'Tax-Aware' }
      return active.map(k => labelMap[k] || k).join(', ')
    }
    default:
      return ''
  }
}

const DISPLAY_LABELS = {
  goal: 'Goal',
  'goal-followup': 'Details',
  timeline: 'Timeline',
  risk: 'Risk Tolerance',
  'deep-dive': 'Deep Dive',
  preferences: 'Preferences',
}

export function ReviewStep({ answers, onEdit }) {
  // Build the review order dynamically
  const reviewOrder = ['goal']
  if (answers['goal-followup']) reviewOrder.push('goal-followup')
  reviewOrder.push('timeline', 'risk')
  if (answers.deepDive) reviewOrder.push('deep-dive')
  reviewOrder.push('preferences')

  const reviewableItems = reviewOrder
    .filter(id => answers[id] !== undefined || id === 'preferences')
    .map(id => ({
      id,
      label: DISPLAY_LABELS[id] || id,
      questionLabel: getStepLabel(id, answers),
      display: getAnswerDisplay(id, answers[id]),
    }))

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">Review your selections</h2>
      <p className="text-[#7A7A7A] mb-8">Confirm your choices or go back to adjust.</p>
      <div className="flex flex-col gap-3 max-w-lg">
        {reviewableItems.map(item => (
          <div
            key={item.id}
            className="flex items-center justify-between px-5 py-4 bg-[#F5F5EB] border border-[#E5E5DD] rounded-2xl"
          >
            <div>
              <div className="text-xs text-[#B9B9AF] uppercase tracking-wider mb-1">
                {item.label}
              </div>
              <div className="text-sm font-medium">{item.display}</div>
            </div>
            <button
              onClick={() => onEdit(item.id)}
              className="text-xs text-black hover:text-[#333] font-semibold transition-colors cursor-pointer underline underline-offset-2"
            >
              Edit
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
