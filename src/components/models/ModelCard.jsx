import { LayoutGrid, MessageSquare, GitBranch } from 'lucide-react'
import { Badge } from '../shared/Badge'

const ICONS = { LayoutGrid, MessageSquare, GitBranch }

export function ModelCard({ model, onClick }) {
  const Icon = ICONS[model.icon]

  return (
    <div
      onClick={onClick}
      className="bg-white border border-[#E5E5DD] rounded-2xl p-6 hover:border-[#B9B9AF] hover:shadow-[0_0_12px_rgba(0,0,0,0.08)] transition-all duration-200 cursor-pointer group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-lg bg-[#FEDC00]/30 flex items-center justify-center">
          <Icon className="w-6 h-6 text-black" />
        </div>
        <span className="text-xs font-mono text-[#B9B9AF]">Model {model.id}</span>
      </div>

      <h3 className="text-lg font-semibold mb-1">{model.name}</h3>
      <p className="text-sm text-[#028E53] font-medium mb-3">{model.tagline}</p>
      <p className="text-sm text-[#4A4A4A] leading-relaxed mb-4 line-clamp-2">{model.description}</p>

      <div className="flex flex-wrap gap-2 mb-4">
        <Badge>{model.personalizationDepth}</Badge>
        <Badge>{model.implementationCost}</Badge>
        <Badge color="blue">{model.portfolioCount}</Badge>
      </div>

      <div className="flex items-center justify-between text-xs text-[#B9B9AF]">
        <span>{model.timeToMarket}</span>
        <span className="text-[#4A4A4A] group-hover:text-black transition-colors font-medium">
          View details &rarr;
        </span>
      </div>
    </div>
  )
}
