import { useState, useCallback, useMemo } from 'react'
import { STEPS, GOAL_FOLLOWUPS, GOAL_CONDITIONALS } from '../data/questions'

function getGoalConditionalKey(answers) {
  const goalId = answers.goal?.id
  if (!goalId) return null

  if (goalId === 'retirement') {
    // Show retirement-older conditional if age >= 50 (from financial picture or goal-followup)
    const fp = answers['financial-picture']
    const followup = answers['goal-followup']
    const age = fp?.currentAge || 0
    const followupAge = followup?.id
    if (age >= 50 || followupAge === '50-59' || followupAge === '60-plus') {
      return 'retirement-older'
    }
    return null
  }

  if (goalId === 'home') return 'home'
  if (goalId === 'education') return 'education'
  return null
}

export function useQuestionnaire() {
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState({})
  const [skipDeepDive, setSkipDeepDive] = useState(false)
  const [showResults, setShowResults] = useState(false)

  const activeSteps = useMemo(() => {
    const goalId = answers.goal?.id
    const followup = goalId ? GOAL_FOLLOWUPS[goalId] : null
    const conditionalKey = getGoalConditionalKey(answers)
    const conditional = conditionalKey ? GOAL_CONDITIONALS[conditionalKey] : null

    const steps = []
    for (const step of STEPS) {
      if (step.id === 'deep-dive-prompt' && skipDeepDive) continue
      if (step.id === 'deep-dive' && skipDeepDive) continue

      steps.push(step)

      // Insert goal follow-up right after the goal step
      if (step.id === 'goal' && followup) {
        steps.push(followup)
      }

      // Insert goal-conditional after account-type
      if (step.id === 'account-type' && conditional) {
        steps.push(conditional)
      }
    }
    return steps
  }, [
    skipDeepDive,
    answers.goal?.id,
    answers['goal-followup']?.id,
    answers['financial-picture']?.currentAge,
  ])

  const totalSteps = activeSteps.length
  const progress = Math.round(((currentStep + 1) / totalSteps) * 100)
  const currentStepData = activeSteps[currentStep]

  const setAnswer = useCallback((stepId, value) => {
    setAnswers(prev => {
      const next = { ...prev, [stepId]: value }
      // When goal changes, clear dependent answers
      if (stepId === 'goal' && prev.goal?.id !== value?.id) {
        delete next['goal-followup']
        delete next['goal-conditional']
        delete next['ai-insight-1']
        delete next['ai-insight-2']
        delete next['ai-insight-3']
        delete next['ai-insight-early']
        delete next['ai-portfolio-advisor']
      }
      return next
    })
  }, [])

  const goNext = useCallback(() => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(prev => prev + 1)
    }
  }, [currentStep, totalSteps])

  const goBack = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }, [currentStep])

  const goToStep = useCallback((idx) => {
    if (idx >= 0 && idx < currentStep) {
      setCurrentStep(idx)
    }
  }, [currentStep])

  const handleDeepDiveChoice = useCallback((wantDeepDive) => {
    if (!wantDeepDive) {
      setSkipDeepDive(true)
    } else {
      setSkipDeepDive(false)
      goNext()
    }
  }, [goNext])

  const submit = useCallback(() => {
    setShowResults(true)
  }, [])

  const reset = useCallback(() => {
    setCurrentStep(0)
    setAnswers({})
    setSkipDeepDive(false)
    setShowResults(false)
  }, [])

  return {
    currentStep,
    currentStepData,
    activeSteps,
    totalSteps,
    progress,
    answers,
    showResults,
    setAnswer,
    goNext,
    goBack,
    goToStep,
    handleDeepDiveChoice,
    submit,
    reset,
  }
}
