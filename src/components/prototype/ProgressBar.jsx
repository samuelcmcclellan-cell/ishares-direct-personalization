import { motion } from 'framer-motion'

const PHASES = [
  { label: 'Goal', stepIds: ['goal', 'goal-followup', 'risk-preference'] },
  { label: 'Finances', stepIds: ['financial-picture', 'account-type', 'goal-conditional'] },
  { label: 'Risk', stepIds: ['timeline', 'risk', 'deep-dive-prompt', 'deep-dive'] },
  { label: 'Style', stepIds: ['investment-style', 'themes', 'preferences'] },
  { label: 'Review', stepIds: ['review'] },
]

function getPhaseStatus(phase, activeSteps, currentStepIndex) {
  const stepIndices = phase.stepIds
    .map(id => activeSteps.findIndex(s => s.id === id))
    .filter(i => i !== -1)

  if (stepIndices.length === 0) return 'future'

  const minIdx = Math.min(...stepIndices)
  const maxIdx = Math.max(...stepIndices)

  if (currentStepIndex > maxIdx) return 'completed'
  if (currentStepIndex >= minIdx && currentStepIndex <= maxIdx) return 'active'
  return 'future'
}

function getFirstStepIndex(phase, activeSteps) {
  for (const id of phase.stepIds) {
    const idx = activeSteps.findIndex(s => s.id === id)
    if (idx !== -1) return idx
  }
  return -1
}

export function ProgressBar({ progress, currentStep, totalSteps, activeSteps, onPhaseClick }) {
  return (
    <div className="mb-8">
      {/* Breadcrumb phases */}
      <div className="flex items-center justify-between mb-4 relative">
        {/* Connecting line */}
        <div className="absolute top-[11px] left-0 right-0 h-px bg-[#E5E5DD] z-0" />

        {PHASES.map((phase, i) => {
          const status = getPhaseStatus(phase, activeSteps || [], currentStep)
          const firstIdx = getFirstStepIndex(phase, activeSteps || [])
          const isClickable = status === 'completed' && onPhaseClick

          return (
            <button
              key={phase.label}
              type="button"
              onClick={() => isClickable && onPhaseClick(firstIdx)}
              className={`flex flex-col items-center gap-1.5 z-10 bg-transparent border-none px-1 ${
                isClickable ? 'cursor-pointer' : 'cursor-default'
              }`}
              disabled={!isClickable}
            >
              {/* Circle */}
              <div className={`w-[22px] h-[22px] rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                status === 'completed'
                  ? 'bg-black border-black'
                  : status === 'active'
                    ? 'bg-black border-black ring-4 ring-black/10'
                    : 'bg-white border-[#D5D5CC]'
              }`}>
                {status === 'completed' && (
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
                {status === 'active' && (
                  <div className="w-2 h-2 bg-white rounded-full" />
                )}
              </div>
              {/* Label */}
              <span className={`text-[11px] leading-tight transition-colors duration-200 ${
                status === 'completed'
                  ? 'text-black font-semibold'
                  : status === 'active'
                    ? 'text-black font-semibold'
                    : 'text-[#B9B9AF] font-medium'
              }`}>
                {phase.label}
              </span>
            </button>
          )
        })}
      </div>

      {/* Progress bar */}
      <div className="h-0.5 bg-[#E5E5DD] rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-black rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}
