import { Sunset, GraduationCap, Home, TrendingUp, DollarSign, Shield } from 'lucide-react'
import { Card } from '../../shared/Card'
import { MarketInsight } from '../MarketInsight'
import { EDUCATIONAL_INSIGHTS } from '../../../data/educationalInsights'

const ICONS = { Sunset, GraduationCap, Home, TrendingUp, DollarSign, Shield }

export function GoalStep({ step, answer, onSelect }) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">{step.title}</h2>
      <p className="text-[#7A7A7A] mb-8">{step.description}</p>
      {EDUCATIONAL_INSIGHTS["goal"] && (
        <MarketInsight {...EDUCATIONAL_INSIGHTS["goal"]} />
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {step.options.map(option => {
          const Icon = ICONS[option.icon]
          return (
            <Card
              key={option.id}
              hover
              selected={answer?.id === option.id}
              onClick={() => onSelect(option)}
              className="p-5"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-[#FEDC00]/30 flex items-center justify-center shrink-0">
                  <Icon className="w-8 h-8 text-black" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">{option.label}</h3>
                  <p className="text-xs text-[#7A7A7A] mt-1">{option.description}</p>
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
