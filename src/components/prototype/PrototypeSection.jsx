import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react'
import { SectionWrapper } from '../layout/SectionWrapper'
import { Button } from '../shared/Button'
import { ProgressBar } from './ProgressBar'
import { GoalStep } from './steps/GoalStep'
import { TimelineStep } from './steps/TimelineStep'
import { RiskStep } from './steps/RiskStep'
import { RiskDeepDivePrompt, RiskDeepDive } from './steps/RiskDeepDive'
import { PreferencesStep } from './steps/PreferencesStep'
import { ReviewStep } from './steps/ReviewStep'
import { ResultsView } from './ResultsView'
import { useQuestionnaire } from '../../hooks/useQuestionnaire'
import { matchPortfolio } from '../../logic/matchingEngine'

function StepRenderer({ step, answers, setAnswer, handleDeepDiveChoice, onEdit }) {
  if (!step) return null

  switch (step.id) {
    case 'goal':
      return <GoalStep step={step} answer={answers.goal} onSelect={v => setAnswer('goal', v)} />
    case 'timeline':
      return <TimelineStep step={step} answer={answers.timeline} onSelect={v => setAnswer('timeline', v)} />
    case 'risk':
      return <RiskStep step={step} answer={answers.risk} onSelect={v => setAnswer('risk', v)} />
    case 'deep-dive-prompt':
      return <RiskDeepDivePrompt onChoice={handleDeepDiveChoice} />
    case 'deep-dive':
      return <RiskDeepDive step={step} answer={answers.deepDive} onSelect={v => setAnswer('deepDive', v)} />
    case 'preferences':
      return <PreferencesStep step={step} answer={answers.preferences} onSelect={v => setAnswer('preferences', v)} />
    case 'review':
      return <ReviewStep answers={answers} onEdit={onEdit} />
    default:
      return null
  }
}

export function PrototypeSection() {
  const q = useQuestionnaire()

  const result = useMemo(() => {
    if (!q.showResults) return null
    return matchPortfolio({
      goal: q.answers.goal,
      timeline: q.answers.timeline,
      risk: q.answers.risk,
      deepDive: q.answers.deepDive,
      preferences: q.answers.preferences,
    })
  }, [q.showResults, q.answers])

  const canGoNext = () => {
    const step = q.currentStepData
    if (!step) return false
    if (step.id === 'deep-dive-prompt') return false
    if (step.id === 'review') return false
    if (step.id === 'preferences') return true
    if (step.id === 'deep-dive') {
      const dd = q.answers.deepDive || {}
      return dd['savings-pct'] && dd['experience']
    }
    return !!q.answers[step.id]
  }

  const isReviewStep = q.currentStepData?.id === 'review'
  const isDeepDivePrompt = q.currentStepData?.id === 'deep-dive-prompt'

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
          Interactive Demo — Model 1: Curated Essentials
        </span>
        <h2 className="text-3xl font-bold tracking-tight mb-4">Try It Yourself</h2>
        <p className="text-[#4A4A4A] max-w-2xl mx-auto">
          Experience how a self-directed investor would be matched to a personalized portfolio. This demonstrates the simplest operating model with ~5 core portfolios.
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

            <AnimatePresence mode="wait">
              <motion.div
                key={q.currentStepData?.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                <StepRenderer
                  step={q.currentStepData}
                  answers={q.answers}
                  setAnswer={q.setAnswer}
                  handleDeepDiveChoice={q.handleDeepDiveChoice}
                  onEdit={handleEdit}
                />
              </motion.div>
            </AnimatePresence>

            {!isDeepDivePrompt && (
              <div className="flex justify-between mt-10 pt-6 border-t border-[#E5E5DD]">
                <Button
                  variant="ghost"
                  onClick={q.goBack}
                  disabled={q.currentStep === 0}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Back
                </Button>

                {isReviewStep ? (
                  <Button onClick={q.submit}>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Get My Portfolio
                  </Button>
                ) : (
                  <Button onClick={q.goNext} disabled={!canGoNext()}>
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </SectionWrapper>
  )
}
