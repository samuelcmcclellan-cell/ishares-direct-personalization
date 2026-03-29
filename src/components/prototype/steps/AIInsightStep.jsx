import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, MessageSquare, Send } from 'lucide-react'
import { generateQuestion, analyzeResponse } from '../../../services/aiInsight'

const MIN_RESPONSE_LENGTH = 20

const LOADING_MESSAGES = {
  first: { generating: 'Thinking about your situation…', analyzing: 'Understanding your perspective…' },
  second: { generating: 'Reviewing your full profile…', analyzing: 'Synthesizing your priorities…' },
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
  const insightStep = step === 'first' ? 'first' : 'second'
  const [phase, setPhase] = useState(() => {
    if (answer?.question && answer?.response) return 'asking'
    return 'idle'
  })
  const [question, setQuestion] = useState(() => answer?.question || null)
  const [userResponse, setUserResponse] = useState(() => answer?.response || '')
  const [error, setError] = useState(null)
  const textareaRef = useRef(null)
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
        setPhase('asking')
      }
    }
    fetchQuestion()

    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [insightStep])

  // Focus textarea when question appears
  useEffect(() => {
    if (phase === 'asking' && textareaRef.current) {
      const timer = setTimeout(() => textareaRef.current?.focus(), 300)
      return () => clearTimeout(timer)
    }
  }, [phase])

  const handleSubmit = async () => {
    if (userResponse.trim().length < MIN_RESPONSE_LENGTH) return

    setPhase('analyzing')
    const { analysis } = await analyzeResponse(insightStep, allAnswers, question, userResponse.trim())

    const result = {
      question,
      response: userResponse.trim(),
      analysis,
    }

    setPhase('complete')
    onSelect(result)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const isResponseValid = userResponse.trim().length >= MIN_RESPONSE_LENGTH

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">
        {insightStep === 'first' ? 'Let\u2019s go a bit deeper' : 'One last question'}
      </h2>
      <p className="text-[#7A7A7A] mb-6">
        {insightStep === 'first'
          ? 'Your numbers tell part of the story. Help us understand the person behind them.'
          : 'Before we build your portfolio, we want to make sure we understand what matters most to you.'}
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

            {/* User response area */}
            <div className="pl-11">
              <textarea
                ref={textareaRef}
                value={userResponse}
                onChange={e => setUserResponse(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Share your thoughts…"
                rows={4}
                className="w-full px-5 py-4 bg-white border-2 border-[#E5E5DD] rounded-2xl text-sm leading-relaxed resize-none transition-colors duration-200 focus:outline-none focus:border-[#028E53] placeholder:text-[#B9B9AF]"
              />

              <div className="flex items-center justify-between mt-3">
                <p className={`text-xs transition-colors duration-200 ${
                  isResponseValid ? 'text-[#028E53]' : 'text-[#B9B9AF]'
                }`}>
                  {isResponseValid
                    ? 'Ready to continue'
                    : `Write a bit more (${Math.max(0, MIN_RESPONSE_LENGTH - userResponse.trim().length)} chars needed)`}
                </p>

                <button
                  onClick={handleSubmit}
                  disabled={!isResponseValid}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
                    isResponseValid
                      ? 'bg-black text-white hover:bg-[#333] shadow-sm'
                      : 'bg-[#E5E5DD] text-[#B9B9AF] cursor-not-allowed'
                  }`}
                >
                  <Send className="w-4 h-4" />
                  Continue
                </button>
              </div>

              {error && (
                <p className="text-xs text-red-500 mt-2">{error}</p>
              )}
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
