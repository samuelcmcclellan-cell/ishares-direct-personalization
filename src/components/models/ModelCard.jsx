import { LayoutGrid, MessageSquare, BrainCircuit } from 'lucide-react'
import { Badge } from '../shared/Badge'

const ICONS = { LayoutGrid, MessageSquare, BrainCircuit }

export function ModelCard({ model, onClick, featured }) {
  const Icon = ICONS[model.icon]

  return (
    <div
      onClick={onClick}
      className={`bg-white border rounded-2xl p-6 hover:border-[#B9B9AF] hover:shadow-[0_0_12px_rgba(0,0,0,0.08)] transition-all duration-200 cursor-pointer group ${
        featured
          ? 'border-l-4 border-l-[#FEDC00] border-[#E5E5DD] shadow-[0_0_20px_rgba(254,220,0,0.25)] scale-[1.03]'
          : 'border-[#E5E5DD]'
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`${featured ? 'w-14 h-14 bg-[#FEDC00]/50' : 'w-14 h-14 bg-[#FEDC00]/30'} rounded-lg flex items-center justify-center`}>
          <Icon className={`${featured ? 'w-8 h-8' : 'w-7 h-7'} text-black`} />
        </div>
        <div className="flex flex-col items-end gap-1">
          {featured && (
            <span className="text-[10px] font-bold uppercase tracking-wide text-black bg-[#FEDC00] px-2 py-0.5 rounded-full">Live Demo Below</span>
          )}
          <span className="text-xs font-mono text-[#B9B9AF]">Model {model.id}</span>
        </div>
      </div>

      <h3 className="text-lg font-semibold mb-1">{model.name}</h3>
      <p className="text-sm text-[#028E53] font-medium mb-3">{model.tagline}</p>
      <p className="text-sm text-[#4A4A4A] leading-relaxed mb-4 line-clamp-2">{model.description}</p>

      <div className="flex flex-wrap gap-2 mb-4">
        <Badge>{model.personalizationDepth}</Badge>
        <Badge>{model.costToBuild}</Badge>
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
