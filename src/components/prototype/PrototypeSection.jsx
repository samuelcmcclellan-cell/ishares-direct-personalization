import { useMemo, useRef, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, Sparkles } from 'lucide-react'
import { SectionWrapper } from '../layout/SectionWrapper'
import { Button } from '../shared/Button'
import { ProgressBar } from './ProgressBar'
import { GoalStep } from './steps/GoalStep'
import { GoalFollowUpStep } from './steps/GoalFollowUpStep'
import { FinancialPictureStep } from './steps/FinancialPictureStep'
import { TimelineStep } from './steps/TimelineStep'
import { RiskStep } from './steps/RiskStep'
import { RiskDeepDivePrompt, RiskDeepDive } from './steps/RiskDeepDive'
import { ThemesStep } from './steps/ThemesStep'
import { PreferencesStep } from './steps/PreferencesStep'
import { ReviewStep } from './steps/ReviewStep'
import { ResultsView } from './ResultsView'
import { useQuestionnaire } from '../../hooks/useQuestionnaire'
import { matchPortfolio } from '../../logic/matchingEngine'

// Steps where clicking an option auto-advances (no Next button needed)
const AUTO_ADVANCE_STEPS = new Set([
  'goal', 'goal-followup', 'timeline', 'risk',
  'account-type', 'investment-style', 'goal-conditional',
])

// Steps that need a Next / submit button
const NEEDS_NEXT = new Set(['deep-dive', 'preferences', 'financial-picture', 'themes'])

function StepRenderer({ step, answers, onSelect, handleDeepDiveChoice, onEdit }) {
  if (!step) return null

  switch (step.id) {
    case 'goal':
      return <GoalStep step={step} answer={answers.goal} onSelect={v => onSelect('goal', v)} />
    case 'goal-followup':
      return <GoalFollowUpStep step={step} answer={answers['goal-followup']} onSelect={v => onSelect('goal-followup', v)} />
    case 'financial-picture':
      return <FinancialPictureStep step={step} answer={answers['financial-picture']} onSelect={v => onSelect('financial-picture', v)} goalFollowup={answers['goal-followup']} />
    case 'account-type':
      return <GoalFollowUpStep step={step} answer={answers['account-type']} onSelect={v => onSelect('account-type', v)} />
    case 'goal-conditional':
      return <GoalFollowUpStep step={step} answer={answers['goal-conditional']} onSelect={v => onSelect('goal-conditional', v)} />
    case 'timeline':
      return <TimelineStep step={step} answer={answers.timeline} onSelect={v => onSelect('timeline', v)} />
    case 'risk':
      return <RiskStep step={step} answer={answers.risk} onSelect={v => onSelect('risk', v)} />
    case 'investment-style':
      return <GoalFollowUpStep step={step} answer={answers['investment-style']} onSelect={v => onSelect('investment-style', v)} />
    case 'themes':
      return <ThemesStep step={step} answer={answers.themes} onSelect={v => onSelect('themes', v)} />
    case 'deep-dive-prompt':
      return <RiskDeepDivePrompt onChoice={handleDeepDiveChoice} />
    case 'deep-dive':
      return <RiskDeepDive step={step} answer={answers.deepDive} onSelect={v => onSelect('deepDive', v)} />
    case 'preferences':
      return <PreferencesStep step={step} answer={answers.preferences} onSelect={v => onSelect('preferences', v)} />
    case 'review':
      return <ReviewStep answers={answers} onEdit={onEdit} />
    default:
      return null
  }
}

export function PrototypeSection() {
  const q = useQuestionnaire()
  const autoAdvanceTimer = useRef(null)

  const result = useMemo(() => {
    if (!q.showResults) return null
    return matchPortfolio({
      goal: q.answers.goal,
      timeline: q.answers.timeline,
      risk: q.answers.risk,
      deepDive: q.answers.deepDive,
      preferences: q.answers.preferences,
      'goal-followup': q.answers['goal-followup'],
      'financial-picture': q.answers['financial-picture'],
      'account-type': q.answers['account-type'],
      'investment-style': q.answers['investment-style'],
      'goal-conditional': q.answers['goal-conditional'],
      themes: q.answers.themes,
    })
  }, [q.showResults, q.answers])

  // Clean up timer on unmount
  useEffect(() => () => {
    if (autoAdvanceTimer.current) clearTimeout(autoAdvanceTimer.current)
  }, [])

  const handleSelect = useCallback((stepId, value) => {
    q.setAnswer(stepId, value)

    const currentId = q.currentStepData?.id
    if (AUTO_ADVANCE_STEPS.has(currentId)) {
      if (autoAdvanceTimer.current) clearTimeout(autoAdvanceTimer.current)
      autoAdvanceTimer.current = setTimeout(() => {
        q.goNext()
      }, 350)
    }
  }, [q])

  const canGoNext = () => {
    const step = q.currentStepData
    if (!step) return false
    if (step.id === 'deep-dive-prompt') return false
    if (step.id === 'review') return false
    if (step.id === 'preferences') return true
    if (step.id === 'themes') return true
    if (step.id === 'financial-picture') return true // sliders always have valid defaults
    if (step.id === 'deep-dive') {
      const dd = q.answers.deepDive || {}
      return dd['savings-pct'] && dd['experience'] && dd['emergency-fund']
        && dd['income-stability'] && dd['withdrawal-likelihood'] && dd['checking-behavior']
    }
    return !!q.answers[step.id]
  }

  const isReviewStep = q.currentStepData?.id === 'review'
  const isDeepDivePrompt = q.currentStepData?.id === 'deep-dive-prompt'
  const currentStepId = q.currentStepData?.id
  const showNextButton = NEEDS_NEXT.has(currentStepId)
  const showBackButton = !isDeepDivePrompt && q.currentStep > 0

  const handleEdit = (stepId) => {
    const idx = q.activeSteps.findIndex(s => s.id === stepId)
    if (idx >= 0) {
      while (q.currentStep > idx) q.goBack()
    }
  }

  return (
    <SectionWrapper id="prototype" className="bg-[#F5F5EB] border-t border-[#E5E5DD]">
      <div className="text-center mb-12">
        <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-black bg-[#FEDC00] px-3 py-1 rounded-full mb-4">
          <Sparkles className="w-3 h-3" />
          Interactive Demo — Model 2: AI-Guided Portfolios
        </span>
        <h2 className="text-3xl font-bold tracking-tight mb-4">Try It Yourself</h2>
        <p className="text-[#4A4A4A] max-w-2xl mx-auto">
          Experience how an AI-guided intake adapts questions based on your responses and matches you to a personalized portfolio from a curated library.
        </p>
      </div>

      <div className="max-w-3xl mx-auto bg-white border border-[#E5E5DD] rounded-2xl p-8 md:p-10 shadow-[0_0_24px_rgba(0,0,0,0.06)]">
        {q.showResults && result ? (
          <ResultsView
            portfolio={result.portfolio}
            riskScore={result.riskScore}
            onReset={q.reset}
          />
        ) : (
          <>
            <ProgressBar
              progress={q.progress}
              currentStep={q.currentStep}
              totalSteps={q.totalSteps}
            />

            <motion.div
              key={q.currentStepData?.id + '-' + q.currentStep}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              <StepRenderer
                step={q.currentStepData}
                answers={q.answers}
                onSelect={handleSelect}
                handleDeepDiveChoice={q.handleDeepDiveChoice}
                onEdit={handleEdit}
              />
            </motion.div>

            {/* Navigation — only show when needed */}
            {(showBackButton || showNextButton || isReviewStep) && !isDeepDivePrompt && (
              <div className="flex justify-between mt-10 pt-6 border-t border-[#E5E5DD]">
                {showBackButton ? (
                  <Button
                    variant="ghost"
                    onClick={q.goBack}
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Back
                  </Button>
                ) : <div />}

                {isReviewStep ? (
                  <Button onClick={q.submit}>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Get My Portfolio
                  </Button>
                ) : showNextButton ? (
                  <Button onClick={q.goNext} disabled={!canGoNext()}>
                    Continue
                  </Button>
                ) : null}
              </div>
            )}
          </>
        )}
      </div>
    </SectionWrapper>
  )
}
