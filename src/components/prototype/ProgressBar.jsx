import { motion, AnimatePresence } from 'framer-motion'
import { Check } from 'lucide-react'

const PHASES = [
  { label: 'Goal', contextLabel: 'Understanding your goals', stepIds: ['goal', 'goal-followup', 'risk-preference'] },
  { label: 'Finances', contextLabel: 'Building your financial picture', stepIds: ['financial-picture', 'account-type', 'goal-conditional'] },
  { label: 'Risk', contextLabel: 'Calibrating your risk profile', stepIds: ['timeline', 'risk', 'ai-insight-3', 'deep-dive-prompt', 'deep-dive'] },
  { label: 'Style', contextLabel: 'Defining your investment style', stepIds: ['investment-style', 'themes', 'preferences'] },
  { label: 'Review', contextLabel: 'Review your profile', stepIds: ['review'] },
]

// AI insight steps sit between phases — give them contextual labels
const AI_STEP_LABELS = {
  'ai-insight-1': 'Getting to know you',
  'ai-insight-2': 'One last question',
  'ai-insight-3': 'Testing your instincts',
  'existing-holdings': 'Building your financial picture',
  'fomo-reaction': 'Calibrating your risk profile',
  'income-draw': 'Defining your investment style',
}

function getActivePhase(activeSteps, currentStepIndex) {
  if (!activeSteps || !activeSteps[currentStepIndex]) return null
  const currentId = activeSteps[currentStepIndex].id

  // Check AI/misc steps first
  if (AI_STEP_LABELS[currentId]) {
    return {
      contextLabel: AI_STEP_LABELS[currentId],
      phaseIndex: -1,
    }
  }

  for (let i = 0; i < PHASES.length; i++) {
    if (PHASES[i].stepIds.includes(currentId)) {
      return {
        contextLabel: PHASES[i].contextLabel,
        phaseIndex: i,
      }
    }
  }
  return null
}

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

// SVG arc progress ring
function ProgressRing({ progress, size = 32, strokeWidth = 2.5 }) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (progress / 100) * circumference

  return (
    <svg width={size} height={size} className="shrink-0 -rotate-90">
      {/* Track */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#E5E5DD"
        strokeWidth={strokeWidth}
      />
      {/* Fill */}
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="black"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      />
    </svg>
  )
}

export function ProgressBar({ progress, currentStep, totalSteps, activeSteps, onPhaseClick }) {
  const active = getActivePhase(activeSteps, currentStep)
  const contextLabel = active?.contextLabel || ''

  return (
    <div className="mb-6">
      {/* Compact contextual header */}
      <div className="flex items-center gap-3">
        {/* Progress ring */}
        <ProgressRing progress={progress} />

        {/* Phase label + step counter */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={contextLabel}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="text-sm font-semibold text-black leading-tight truncate"
            >
              {contextLabel}
            </motion.div>
          </AnimatePresence>
          <div className="text-[11px] text-[#B9B9AF] mt-0.5">
            Step {currentStep + 1} of {totalSteps}
          </div>
        </div>

        {/* Phase dots — compact, clickable */}
        <div className="flex items-center gap-1.5 shrink-0">
          {PHASES.map((phase, i) => {
            const status = getPhaseStatus(phase, activeSteps || [], currentStep)
            const firstIdx = getFirstStepIndex(phase, activeSteps || [])
            const isClickable = status === 'completed' && onPhaseClick

            return (
              <button
                key={phase.label}
                type="button"
                title={phase.label}
                onClick={() => isClickable && onPhaseClick(firstIdx)}
                className={`transition-all duration-200 ${
                  isClickable ? 'cursor-pointer' : 'cursor-default'
                }`}
                disabled={!isClickable}
              >
                {status === 'completed' ? (
                  <div className="w-5 h-5 rounded-full bg-black flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" strokeWidth={3} />
                  </div>
                ) : status === 'active' ? (
                  <div className="w-5 h-5 rounded-full bg-black ring-3 ring-black/10 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-white rounded-full" />
                  </div>
                ) : (
                  <div className="w-5 h-5 rounded-full border-[1.5px] border-[#D5D5CC] bg-white" />
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
