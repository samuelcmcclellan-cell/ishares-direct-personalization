import { STEPS } from '../../../data/questions'

function getAnswerDisplay(stepId, answer) {
  if (!answer) return 'Not answered'

  switch (stepId) {
    case 'goal':
    case 'timeline':
    case 'risk':
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

export function ReviewStep({ answers, onEdit }) {
  const reviewableSteps = STEPS.filter(s =>
    s.type !== 'review' && s.type !== 'deep-dive-gate' && answers[s.id] !== undefined
  )

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">Review your selections</h2>
      <p className="text-[#7A7A7A] mb-8">Confirm your choices or go back to adjust.</p>
      <div className="flex flex-col gap-3 max-w-lg">
        {reviewableSteps.map(step => (
          <div
            key={step.id}
            className="flex items-center justify-between px-5 py-4 bg-[#F5F5EB] border border-[#E5E5DD] rounded-2xl"
          >
            <div>
              <div className="text-xs text-[#B9B9AF] uppercase tracking-wider mb-1">
                {step.id === 'deep-dive' ? 'Deep Dive' : step.id.charAt(0).toUpperCase() + step.id.slice(1)}
              </div>
              <div className="text-sm font-medium">{getAnswerDisplay(step.id, answers[step.id])}</div>
            </div>
            <button
              onClick={() => onEdit(step.id)}
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
