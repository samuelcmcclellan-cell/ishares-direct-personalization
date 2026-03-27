import { useState, useCallback, useMemo } from 'react'
import { STEPS, GOAL_FOLLOWUPS } from '../data/questions'

export function useQuestionnaire() {
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState({})
  const [skipDeepDive, setSkipDeepDive] = useState(false)
  const [showResults, setShowResults] = useState(false)

  const activeSteps = useMemo(() => {
    const goalId = answers.goal?.id
    const followup = goalId ? GOAL_FOLLOWUPS[goalId] : null

    const steps = []
    for (const step of STEPS) {
      if (step.id === 'deep-dive-prompt' && skipDeepDive) continue
      if (step.id === 'deep-dive' && skipDeepDive) continue
      steps.push(step)
      // Insert goal follow-up right after the goal step
      if (step.id === 'goal' && followup) {
        steps.push(followup)
      }
    }
    return steps
  }, [skipDeepDive, answers.goal?.id])

  const totalSteps = activeSteps.length
  const progress = Math.round(((currentStep + 1) / totalSteps) * 100)
  const currentStepData = activeSteps[currentStep]

  const setAnswer = useCallback((stepId, value) => {
    setAnswers(prev => {
      const next = { ...prev, [stepId]: value }
      // When goal changes, clear the follow-up answer since it's goal-specific
      if (stepId === 'goal' && prev.goal?.id !== value?.id) {
        delete next['goal-followup']
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
    handleDeepDiveChoice,
    submit,
    reset,
  }
}
