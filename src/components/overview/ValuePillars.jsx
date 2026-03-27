import { Target, Blocks, Scale, Shield } from 'lucide-react'
import { VALUE_PILLARS } from '../../data/content'

const ICONS = { Target, Blocks, Scale, Shield }

export function ValuePillars() {
  return (
    <div className="py-16">
      <h2 className="text-3xl font-bold tracking-tight text-center mb-4">How It Works</h2>
      <p className="text-[#7A7A7A] text-center mb-12 max-w-2xl mx-auto">
        Four pillars that make iShares Direct Personalization possible.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {VALUE_PILLARS.map((pillar, i) => {
          const Icon = ICONS[pillar.icon]
          return (
            <div
              key={i}
              className="bg-white border border-[#E5E5DD] rounded-2xl p-6 hover:shadow-[0_0_12px_rgba(0,0,0,0.08)] hover:border-[#B9B9AF] transition-all duration-200"
            >
              <div className="w-12 h-12 rounded-lg bg-[#FEDC00]/30 flex items-center justify-center mb-4">
                <Icon className="w-6 h-6 text-black" />
              </div>
              <h3 className="text-base font-semibold mb-2">{pillar.title}</h3>
              <p className="text-sm text-[#4A4A4A] leading-relaxed">{pillar.description}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
