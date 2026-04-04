import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, ChevronLeft, Calendar, Sunset, PiggyBank, TrendingUp, DollarSign } from 'lucide-react'
import { Button } from '../../shared/Button'
import { formatDollar } from '../../../logic/projectionUtils'

const AGE_FROM_FOLLOWUP = {
  'under-30': 25, '30-39': 35, '40-49': 45, '50-59': 55, '60-plus': 65,
}

const SMART_DEFAULTS = {
  retirement: {
    'under-30': { currentSavings: 50000, savingsRate: 10, annualIncome: 120000 },
    '30-39': { currentSavings: 150000, savingsRate: 12, annualIncome: 200000 },
    '40-49': { currentSavings: 300000, savingsRate: 12, annualIncome: 250000 },
    '50-59': { currentSavings: 500000, savingsRate: 14, annualIncome: 250000 },
    '60-plus': { currentSavings: 700000, savingsRate: 12, annualIncome: 200000 },
  },
  education: { _default: { currentSavings: 25000, savingsRate: 6, annualIncome: 100000 } },
  home: {
    'under-50k': { currentSavings: 15000, savingsRate: 13, annualIncome: 75000 },
    '50k-100k': { currentSavings: 30000, savingsRate: 14, annualIncome: 100000 },
    '100k-200k': { currentSavings: 60000, savingsRate: 13, annualIncome: 140000 },
    'over-200k': { currentSavings: 120000, savingsRate: 12, annualIncome: 200000 },
  },
  'wealth-building': { _default: { currentSavings: 50000, savingsRate: 9, annualIncome: 110000 } },
  income: { _default: { currentSavings: 150000, savingsRate: 7, annualIncome: 90000 } },
  emergency: { _default: { currentSavings: 5000, savingsRate: 15, annualIncome: 75000 } },
}

function getSmartDefaults(goal, goalFollowup) {
  const goalId = goal?.id
  const followupId = goalFollowup?.id
  const inferredAge = followupId ? (AGE_FROM_FOLLOWUP[followupId] || 35) : 35
  const base = {
    currentAge: inferredAge,
    retirementAge: Math.max(inferredAge + 5, 70),
    currentSavings: 100000, savingsRate: 10, annualIncome: 200000,
  }
  if (!goalId || !SMART_DEFAULTS[goalId]) return base
  const goalDefaults = SMART_DEFAULTS[goalId]
  const match = goalDefaults[followupId] || goalDefaults._default
  return match ? { ...base, ...match } : base
}

const MINI_STEP_DEFS = [
  { key: 'currentAge', question: 'How old are you?', Icon: Calendar, min: 18, max: 75, step: 1, format: v => `${v} years` },
  { key: 'retirementAge', question: 'When do you plan to retire?', Icon: Sunset, min: 50, max: 80, step: 1, format: v => `${v} years`, retirementOnly: true },
  { key: 'currentSavings', question: 'How much have you saved so far?', Icon: PiggyBank, min: 0, max: 2000000, step: 5000, format: formatDollar },
  { key: 'annualIncome', question: "What's your annual income?", Icon: DollarSign, min: 0, max: 500000, step: 5000, format: formatDollar },
  { key: 'savingsRate', question: 'What percentage do you save?', Icon: TrendingUp, min: 0, max: 30, step: 1, format: v => `${v}%` },
]

export function FinancialMiniSteps({ step, answer, onSelect, goal, goalFollowup, onComplete }) {
  const isRetirement = goal?.id === 'retirement'
  const defaults = getSmartDefaults(goal, goalFollowup)
  const [values, setValues] = useState(answer || defaults)
  const [subStep, setSubStep] = useState(0)
  const [direction, setDirection] = useState(1)

  const activeSliders = useMemo(() =>
    MINI_STEP_DEFS.filter(s => !s.retirementOnly || isRetirement),
    [isRetirement]
  )
  const totalSubSteps = activeSliders.length
  const currentSlider = activeSliders[subStep]

  useEffect(() => {
    if (!answer) setValues(getSmartDefaults(goal, goalFollowup))
  }, [goal?.id, goalFollowup?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { onSelect(values) }, [values]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleChange = (key, val) => {
    setValues(prev => {
      const next = { ...prev, [key]: Number(val) }
      if (key === 'currentAge' && next.retirementAge <= Number(val)) next.retirementAge = Number(val) + 1
      return next
    })
  }

  const goForward = () => { if (subStep < totalSubSteps - 1) { setDirection(1); setSubStep(s => s + 1) } }
  const goBackward = () => { if (subStep > 0) { setDirection(-1); setSubStep(s => s - 1) } }

  const fillPercent = (slider) => ((values[slider.key] - slider.min) / (slider.max - slider.min)) * 100
  const derivedMonthly = Math.round(values.annualIncome * values.savingsRate / 100 / 12)
  const isLastSlider = subStep === activeSliders.length - 1

  const slideVariants = {
    enter: (dir) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir) => ({ x: dir > 0 ? -80 : 80, opacity: 0 }),
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">{step.title}</h2>
      <p className="text-[#7A7A7A] mb-4">{step.description}</p>

      {/* Progress dots */}
      <div className="flex items-center justify-center gap-1.5 mb-6">
        {Array.from({ length: totalSubSteps }).map((_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === subStep ? 'w-6 bg-[#028E53]' : i < subStep ? 'w-1.5 bg-[#028E53]/40' : 'w-1.5 bg-[#E5E5DD]'
            }`}
          />
        ))}
      </div>

      <AnimatePresence mode="wait" custom={direction}>
        {currentSlider && (
          <motion.div
            key={currentSlider.key}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="max-w-md mx-auto"
          >
            <div className="text-center mb-8">
              <div className="w-14 h-14 rounded-2xl bg-[#028E53]/10 flex items-center justify-center mx-auto mb-4">
                <currentSlider.Icon className="w-7 h-7 text-[#028E53]" />
              </div>
              <h3 className="text-lg font-semibold mb-1">{currentSlider.question}</h3>
              <div className="text-3xl font-bold text-[#028E53]">
                {currentSlider.format(values[currentSlider.key])}
              </div>
            </div>

            <div className="px-2">
              <input
                type="range"
                min={currentSlider.min}
                max={currentSlider.max}
                step={currentSlider.step}
                value={values[currentSlider.key]}
                onChange={e => handleChange(currentSlider.key, e.target.value)}
                className="slider-input w-full"
                style={{ '--fill': `${fillPercent(currentSlider)}%` }}
              />
              <div className="flex justify-between text-[10px] text-[#B9B9AF] mt-1">
                <span>{currentSlider.format(currentSlider.min)}</span>
                <span>{currentSlider.format(currentSlider.max)}</span>
              </div>
              {currentSlider.key === 'savingsRate' && (
                <div className="text-xs text-[#028E53] font-medium mt-2 text-center">
                  {formatDollar(derivedMonthly)}/mo &middot; {formatDollar(derivedMonthly * 12)}/yr
                </div>
              )}
            </div>

            <div className="flex justify-between mt-8">
              {subStep > 0 ? (
                <Button variant="ghost" onClick={goBackward}>
                  <ChevronLeft className="w-4 h-4 mr-1" /> Back
                </Button>
              ) : <div />}
              <Button onClick={isLastSlider ? onComplete : goForward}>
                {isLastSlider ? 'Continue' : 'Next'} <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
