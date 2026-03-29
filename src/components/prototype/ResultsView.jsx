import { motion } from 'framer-motion'
import { ArrowLeft, RotateCcw, Target, Clock, Shield, TrendingUp, Receipt, Globe, DollarSign, BarChart3, Zap, Sparkles, SlidersHorizontal, AlertCircle, Brain } from 'lucide-react'
import { PortfolioPieChart } from './PortfolioPieChart'
import { HoldingsTable } from './HoldingsTable'
import { Button } from '../shared/Button'

const RISK_COLORS = {
  1: 'bg-[#028E53]',
  2: 'bg-[#028E53]',
  3: 'bg-[#5EAA3E]',
  4: 'bg-[#5EAA3E]',
  5: 'bg-[#E6A800]',
  6: 'bg-[#E6A800]',
  7: 'bg-[#E87722]',
  8: 'bg-[#E87722]',
  9: 'bg-[#D92B2B]',
  10: 'bg-[#D92B2B]',
}

function RiskGauge({ score }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
          <div
            key={i}
            className={`w-4 h-2 rounded-full transition-all ${
              i <= score ? RISK_COLORS[score] : 'bg-[#E5E5DD]'
            }`}
          />
        ))}
      </div>
      <span className="text-xs text-[#7A7A7A]">{score}/10</span>
    </div>
  )
}

const ICON_MAP = {
  Target, Clock, Shield, TrendingUp, Receipt, Globe,
  DollarSign, BarChart3, Zap, Sparkles, SlidersHorizontal, AlertCircle, Brain,
}

export function ResultsView({ portfolio, riskScore, explanations, onReset }) {
  if (!portfolio) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-8">
        <button
          onClick={onReset}
          className="flex items-center gap-2 text-sm text-[#7A7A7A] hover:text-black transition-colors cursor-pointer mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Start over
        </button>

        <div className="text-xs text-[#028E53] font-semibold uppercase tracking-wider mb-2">Your Recommended Portfolio</div>
        <h2 className="text-3xl font-bold mb-2">{portfolio.name}</h2>
        <p className="text-[#4A4A4A] mb-4">{portfolio.subtitle}</p>

        <div className="flex flex-wrap items-center gap-6">
          <div>
            <div className="text-xs text-[#B9B9AF] mb-1">Risk Profile</div>
            <RiskGauge score={riskScore} />
          </div>
          <div>
            <div className="text-xs text-[#B9B9AF] mb-1">Risk Label</div>
            <span className="text-sm font-medium">{portfolio.riskLabel}</span>
          </div>
          <div>
            <div className="text-xs text-[#B9B9AF] mb-1">Illustrative Return</div>
            <span className="text-sm font-semibold">{portfolio.targetReturn} annualized</span>
          </div>
        </div>

        {portfolio.themeOverlays && portfolio.themeOverlays.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {portfolio.themeOverlays.map(theme => (
              <span key={theme} className="inline-flex items-center gap-1 px-3 py-1 bg-[#FEDC00]/20 border border-[#FEDC00]/40 rounded-full text-xs font-medium text-black">
                {theme}
              </span>
            ))}
          </div>
        )}
      </div>

      {explanations && explanations.length > 0 && (
        <div className="bg-[#F5F5EB] border border-[#E5E5DD] rounded-2xl p-6 mb-8">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-[#7A7A7A] mb-4">Why This Portfolio</h3>
          <div className="space-y-3">
            {explanations.map((item, i) => {
              const IconComponent = ICON_MAP[item.icon] || Target
              return (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-white border border-[#E5E5DD] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <IconComponent className="w-3.5 h-3.5 text-[#4A4A4A]" />
                  </div>
                  <p className="text-sm text-[#4A4A4A] leading-relaxed">{item.text}</p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-[#F5F5EB] border border-[#E5E5DD] rounded-2xl p-6">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-[#7A7A7A] mb-4">Asset Allocation</h3>
          <PortfolioPieChart allocation={portfolio.assetAllocation} />
        </div>

        <div className="bg-[#F5F5EB] border border-[#E5E5DD] rounded-2xl p-6">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-[#7A7A7A] mb-4">About This Portfolio</h3>
          <p className="text-sm text-[#4A4A4A] leading-relaxed mb-6">{portfolio.description}</p>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-xl p-3 border border-[#E5E5DD]">
              <div className="text-xs text-[#B9B9AF] mb-1">Holdings</div>
              <div className="text-lg font-bold">{portfolio.holdings.length} ETFs</div>
            </div>
            <div className="bg-white rounded-xl p-3 border border-[#E5E5DD]">
              <div className="text-xs text-[#B9B9AF] mb-1">Equity / Fixed Income</div>
              <div className="text-lg font-bold">
                {portfolio.assetAllocation.usEquity + portfolio.assetAllocation.intlEquity} / {portfolio.assetAllocation.usBonds + (portfolio.assetAllocation.alternatives || 0)}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-[#E5E5DD] rounded-2xl p-6 mb-8">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-[#7A7A7A] mb-4">Portfolio Holdings</h3>
        <HoldingsTable holdings={portfolio.holdings} />
      </div>

      <div className="flex gap-3">
        <Button onClick={onReset} variant="secondary">
          <RotateCcw className="w-4 h-4 mr-2" />
          Try Different Answers
        </Button>
      </div>

      <p className="mt-8 text-xs text-[#B9B9AF] leading-relaxed max-w-2xl">
        This portfolio recommendation is for illustrative purposes only and does not constitute investment advice. All return estimates are hypothetical. Actual performance will vary. Consult a qualified financial advisor before making investment decisions.
      </p>
    </motion.div>
  )
}
