import { STEPS, GOAL_FOLLOWUPS, GOAL_CONDITIONALS } from '../../../data/questions'

function formatDollar(v) {
  if (v >= 1000000) return `$${(v / 1000000).toFixed(1)}M`
  if (v >= 1000) return `$${Math.round(v / 1000).toLocaleString()}K`
  return `$${v}`
}

function getAnswerDisplay(stepId, answer) {
  if (!answer) return 'Not answered'

  switch (stepId) {
    case 'goal':
    case 'timeline':
    case 'risk':
    case 'goal-followup':
    case 'account-type':
    case 'investment-style':
    case 'goal-conditional':
      return answer.label
    case 'deep-dive':
      return Object.values(answer).map(a => a.label).join(', ')
    case 'financial-picture':
      return `Age ${answer.currentAge}, ${formatDollar(answer.currentSavings)} saved, ${formatDollar(answer.monthlyContribution)}/mo`
    case 'themes': {
      const activeThemes = Object.entries(answer).filter(([, v]) => v).map(([k]) => k)
      if (activeThemes.length === 0) return 'None selected'
      const themeMap = { ai: 'AI', 'clean-energy': 'Clean Energy', innovation: 'Innovation', dividend: 'Dividends', none: 'None' }
      return activeThemes.map(k => themeMap[k] || k).join(', ')
    }
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
  'financial-picture': 'Financial Picture',
  'account-type': 'Account Type',
  'goal-conditional': 'Goal Details',
  timeline: 'Timeline',
  risk: 'Risk Tolerance',
  'investment-style': 'Investment Style',
  themes: 'Investment Themes',
  'deep-dive': 'Deep Dive',
  preferences: 'Preferences',
}

export function ReviewStep({ answers, onEdit }) {
  const reviewOrder = ['goal']
  if (answers['goal-followup']) reviewOrder.push('goal-followup')
  if (answers['financial-picture']) reviewOrder.push('financial-picture')
  if (answers['account-type']) reviewOrder.push('account-type')
  if (answers['goal-conditional']) reviewOrder.push('goal-conditional')
  reviewOrder.push('timeline', 'risk')
  if (answers['investment-style']) reviewOrder.push('investment-style')
  if (answers.themes) reviewOrder.push('themes')
  if (answers.deepDive) reviewOrder.push('deep-dive')
  reviewOrder.push('preferences')

  const reviewableItems = reviewOrder
    .filter(id => answers[id] !== undefined || id === 'preferences')
    .map(id => ({
      id,
      label: DISPLAY_LABELS[id] || id,
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
