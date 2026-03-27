import { useState, useCallback, useMemo } from 'react'
import { STEPS } from '../data/questions'

export function useQuestionnaire() {
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState({})
  const [skipDeepDive, setSkipDeepDive] = useState(false)
  const [showResults, setShowResults] = useState(false)

  const activeSteps = useMemo(() => {
    return STEPS.filter(step => {
      if (step.id === 'deep-dive-prompt' && skipDeepDive) return false
      if (step.id === 'deep-dive' && skipDeepDive) return false
      return true
    })
  }, [skipDeepDive])

  const totalSteps = activeSteps.length
  const progress = Math.round(((currentStep + 1) / totalSteps) * 100)
  const currentStepData = activeSteps[currentStep]

  const setAnswer = useCallback((stepId, value) => {
    setAnswers(prev => ({ ...prev, [stepId]: value }))
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
      // When we skip, activeSteps loses 2 items (deep-dive-prompt + deep-dive).
      // Current step is on deep-dive-prompt. After filtering, the step at this
      // same index will be the preferences step, so we don't need to change index.
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
