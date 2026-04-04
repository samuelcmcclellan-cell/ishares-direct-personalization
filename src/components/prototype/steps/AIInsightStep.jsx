import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, MessageSquare } from 'lucide-react'
import { generateQuestion, analyzeResponse } from '../../../services/aiInsight'
import { Card } from '../../shared/Card'

const LOADING_MESSAGES = {
  early: { generating: 'Getting to know you…', analyzing: 'Noting that down…' },
  first: { generating: 'Thinking about your situation…', analyzing: 'Understanding your perspective…' },
  second: { generating: 'Reviewing your full profile…', analyzing: 'Synthesizing your priorities…' },
  third: { generating: 'Building a scenario from your profile…', analyzing: 'Calibrating your risk posture…' },
}

function LoadingState({ message }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="flex flex-col items-center justify-center py-12"
    >
      <div className="w-12 h-12 rounded-full bg-[#028E53]/10 flex items-center justify-center mb-4">
        <Sparkles className="w-6 h-6 text-[#028E53] animate-pulse" />
      </div>
      <p className="text-[#7A7A7A] text-sm animate-pulse">{message}</p>
    </motion.div>
  )
}

export function AIInsightStep({ step, answer, onSelect, allAnswers }) {
  const insightStep = step
  const [phase, setPhase] = useState(() => {
    if (answer?.question && answer?.response) return 'complete'
    return 'idle'
  })
  const [question, setQuestion] = useState(() => answer?.question || null)
  const [options, setOptions] = useState(() => answer?.options || null)
  const [selectedOption, setSelectedOption] = useState(() => answer?.response || null)
  const allAnswersRef = useRef(allAnswers)
  allAnswersRef.current = allAnswers

  // Auto-generate question on mount (if no saved answer)
  useEffect(() => {
    if (answer?.question) return
    let cancelled = false

    async function fetchQuestion() {
      setPhase('generating')
      const result = await generateQuestion(insightStep, allAnswersRef.current)
      if (!cancelled) {
        setQuestion(result.question)
        setOptions(result.options || [])
        setPhase('asking')
      }
    }
    fetchQuestion()

    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [insightStep])

  const handleOptionClick = async (option) => {
    setSelectedOption(option)
    setPhase('analyzing')

    const { analysis } = await analyzeResponse(insightStep, allAnswers, question, option)

    const result = {
      question,
      options,
      response: option,
      analysis,
    }

    setPhase('complete')
    onSelect(result)
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">
        {insightStep === 'early' ? 'Before we dig into numbers\u2026'
          : insightStep === 'first' ? 'Let\u2019s go a bit deeper'
          : insightStep === 'third' ? 'Let\u2019s make this real'
          : 'One last question'}
      </h2>
      <p className="text-[#7A7A7A] mb-6">
        {insightStep === 'early'
          ? 'We noticed something interesting about your choices so far.'
          : insightStep === 'first'
          ? 'Help us understand the person behind the numbers.'
          : insightStep === 'third'
            ? 'Let\u2019s see how you\u2019d handle a real scenario.'
            : 'Before we build your portfolio, one more thing.'}
      </p>

      <AnimatePresence mode="popLayout">
        {(phase === 'generating' || phase === 'idle') && (
          <LoadingState
            key="generating"
            message={LOADING_MESSAGES[insightStep].generating}
          />
        )}

        {phase === 'asking' && question && (
          <motion.div
            key="asking"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
          >
            {/* AI Question bubble */}
            <div className="flex gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-[#028E53]/10 flex items-center justify-center shrink-0 mt-0.5">
                <MessageSquare className="w-4 h-4 text-[#028E53]" />
              </div>
              <div className="flex-1 bg-[#F5F5EB] border border-[#E5E5DD] rounded-2xl rounded-tl-md px-5 py-4">
                <p className="text-sm leading-relaxed">{question}</p>
              </div>
            </div>

            {/* Multiple choice options */}
            <div className="pl-11 flex flex-col gap-3 max-w-lg">
              {(options || []).map((option, i) => (
                <Card
                  key={i}
                  hover
                  selected={selectedOption === option}
                  onClick={() => handleOptionClick(option)}
                  className="px-5 py-4 cursor-pointer"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm leading-relaxed">{option}</p>
                    <div className={`w-4 h-4 rounded-full border-2 transition-all shrink-0 ${
                      selectedOption === option
                        ? 'border-black bg-black'
                        : 'border-[#B9B9AF]'
                    }`} />
                  </div>
                </Card>
              ))}
            </div>
          </motion.div>
        )}

        {phase === 'analyzing' && (
          <LoadingState
            key="analyzing"
            message={LOADING_MESSAGES[insightStep].analyzing}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
