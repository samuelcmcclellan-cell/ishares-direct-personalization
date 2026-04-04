import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, Sparkles, AlertTriangle, ChevronRight } from 'lucide-react'
import { getPortfolioRecommendation } from '../../../services/aiPortfolioAdvisor'
import { computeRiskScore } from '../../../logic/scoringUtils'
import { PORTFOLIOS } from '../../../data/portfolios'
import { Button } from '../../shared/Button'

const THINKING_MESSAGES = [
  'Your AI advisor is analyzing your complete profile\u2026',
  'Weighing behavioral signals\u2026',
  'Selecting the best-fit portfolio\u2026',
]

export function AIPortfolioAdvisorStep({ answer, onSelect, allAnswers }) {
  const [phase, setPhase] = useState(() => answer ? 'complete' : 'loading')
  const [messageIndex, setMessageIndex] = useState(0)
  const [result, setResult] = useState(answer || null)
  const allAnswersRef = useRef(allAnswers)
  allAnswersRef.current = allAnswers
  const calledRef = useRef(false)
  const advancedRef = useRef(false)

  // Cycle through thinking messages
  useEffect(() => {
    if (phase !== 'loading') return
    const timer = setInterval(() => setMessageIndex(i => (i + 1) % THINKING_MESSAGES.length), 2000)
    return () => clearInterval(timer)
  }, [phase])

  // Fetch recommendation on mount
  useEffect(() => {
    if (answer || calledRef.current) return
    calledRef.current = true

    async function fetchRecommendation() {
      const answers = allAnswersRef.current
      const riskScore = computeRiskScore(answers)
      const portfolioLibrary = PORTFOLIOS.map(p => ({
        id: p.id, name: p.name, riskScore: p.riskScore, riskLabel: p.riskLabel,
        targetReturn: p.targetReturn, suitableFor: p.suitableFor, assetAllocation: p.assetAllocation,
      }))
      try {
        const data = await getPortfolioRecommendation(answers, riskScore, portfolioLibrary)
        if (data.error || data.fallback) {
          setResult(null)
          setPhase('reveal')
          onSelect(null)
          return
        }
        setResult(data)
        setPhase('reveal')
      } catch {
        setPhase('reveal')
        onSelect(null)
      }
    }
    fetchRecommendation()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleAdvance = useCallback(() => {
    if (advancedRef.current) return
    advancedRef.current = true
    onSelect(result)
  }, [result, onSelect])

  // Auto-advance 3s after reveal
  useEffect(() => {
    if (phase !== 'reveal' || !result) return
    const timer = setTimeout(handleAdvance, 3000)
    return () => clearTimeout(timer)
  }, [phase, result, handleAdvance])

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">Your AI Advisor</h2>
      <p className="text-[#7A7A7A] mb-6">
        We&rsquo;re analyzing everything you&rsquo;ve told us to find your ideal portfolio.
      </p>

      <AnimatePresence mode="wait">
        {phase === 'loading' && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-16"
          >
            <motion.div
              animate={{ scale: [1, 1.15, 1], opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="w-16 h-16 rounded-full bg-[#028E53]/10 flex items-center justify-center mb-6"
            >
              <Brain className="w-8 h-8 text-[#028E53]" />
            </motion.div>
            <AnimatePresence mode="wait">
              <motion.p
                key={messageIndex}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
                className="text-sm text-[#7A7A7A]"
              >
                {THINKING_MESSAGES[messageIndex]}
              </motion.p>
            </AnimatePresence>
          </motion.div>
        )}

        {(phase === 'reveal' || phase === 'complete') && result && (
          <motion.div
            key="reveal"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            {/* Narrative summary */}
            <div className="bg-[#F5F5EB] border border-[#E5E5DD] rounded-2xl p-6 mb-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FEDC00]/20 flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5 text-[#028E53]" />
                </div>
                <p className="text-sm leading-relaxed text-[#4A4A4A]">{result.narrativeSummary}</p>
              </div>
            </div>

            {/* Primary reason */}
            <div className="border-l-4 border-[#028E53] pl-4 mb-4">
              <p className="text-sm font-semibold text-black">{result.primaryReason}</p>
            </div>

            {/* Secondary reasons */}
            {result.secondaryReasons?.length > 0 && (
              <ul className="space-y-2 mb-4 pl-4">
                {result.secondaryReasons.map((r, i) => (
                  <li key={i} className="text-sm text-[#4A4A4A] flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#028E53] mt-1.5 shrink-0" />
                    {r}
                  </li>
                ))}
              </ul>
            )}

            {/* Behavioral warning */}
            {result.behavioralWarning && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                  <p className="text-xs text-amber-800 leading-relaxed">{result.behavioralWarning}</p>
                </div>
              </div>
            )}

            <div className="flex justify-center mt-6">
              <Button onClick={handleAdvance}>
                See My Portfolio <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </motion.div>
        )}

        {phase === 'reveal' && !result && (
          <motion.div
            key="fallback"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8"
          >
            <p className="text-sm text-[#7A7A7A]">AI analysis complete. Let&rsquo;s see your portfolio.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
