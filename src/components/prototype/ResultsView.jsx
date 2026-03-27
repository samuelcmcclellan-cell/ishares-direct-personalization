import { motion } from 'framer-motion'
import { ArrowLeft, RotateCcw } from 'lucide-react'
import { PortfolioPieChart } from './PortfolioPieChart'
import { HoldingsTable } from './HoldingsTable'
import { Button } from '../shared/Button'

const RISK_COLORS = {
  1: 'bg-[#028E53]',
  2: 'bg-[#028E53]',
  3: 'bg-[#E6A800]',
  4: 'bg-[#E87722]',
  5: 'bg-[#D92B2B]',
}

function RiskGauge({ score }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(i => (
          <div
            key={i}
            className={`w-8 h-2 rounded-full transition-all ${
              i <= score ? RISK_COLORS[score] : 'bg-[#E5E5DD]'
            }`}
          />
        ))}
      </div>
      <span className="text-xs text-[#7A7A7A]">{score}/5</span>
    </div>
  )
}

export function ResultsView({ portfolio, riskScore, onReset }) {
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
      </div>

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
