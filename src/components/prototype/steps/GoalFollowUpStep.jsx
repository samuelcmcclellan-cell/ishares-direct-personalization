import { Shield, ShieldCheck, Scale, TrendingUp, Rocket } from 'lucide-react'
import { Card } from '../../shared/Card'
import { MarketInsight } from '../MarketInsight'
import { EDUCATIONAL_INSIGHTS } from '../../../data/educationalInsights'

const ICONS = { Shield, ShieldCheck, Scale, TrendingUp, Rocket }

export function GoalFollowUpStep({ step, answer, onSelect }) {
  const hasIcons = step.options.some(o => o.icon)

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">{step.title}</h2>
      <p className="text-[#7A7A7A] mb-8">{step.description}</p>
      {EDUCATIONAL_INSIGHTS[step.id] && (
        <MarketInsight {...EDUCATIONAL_INSIGHTS[step.id]} />
      )}
      <div className="flex flex-col gap-3 max-w-lg">
        {step.options.map(option => {
          const Icon = option.icon ? ICONS[option.icon] : null
          return (
            <Card
              key={option.id}
              hover
              selected={answer?.id === option.id}
              onClick={() => onSelect(option)}
              className="px-5 py-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                {Icon && (
                  <div className="w-10 h-10 rounded-lg bg-[#FEDC00]/30 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-black" />
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-sm">{option.label}</h3>
                  <p className="text-xs text-[#B9B9AF] mt-0.5">{option.description}</p>
                </div>
              </div>
              <div className={`w-4 h-4 rounded-full border-2 transition-all shrink-0 ${
                answer?.id === option.id
                  ? 'border-black bg-black'
                  : 'border-[#B9B9AF]'
              }`} />
            </Card>
          )
        })}
      </div>
    </div>
  )
}
