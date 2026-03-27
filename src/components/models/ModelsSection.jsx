import { useState } from 'react'
import { SectionWrapper } from '../layout/SectionWrapper'
import { ModelCard } from './ModelCard'
import { ComparisonTable } from './ComparisonTable'
import { ModelDetailModal } from './ModelDetailModal'
import { OPERATING_MODELS } from '../../data/models'

export function ModelsSection() {
  const [selectedModel, setSelectedModel] = useState(null)

  return (
    <SectionWrapper id="models" className="border-t border-[#E5E5DD]">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold tracking-tight mb-4">Four Ways to Build This</h2>
        <p className="text-[#4A4A4A] max-w-2xl mx-auto">
          Each operating model offers a different balance of personalization depth, compliance complexity, and time to market. Click any model for details.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {OPERATING_MODELS.map(model => (
          <ModelCard
            key={model.id}
            model={model}
            onClick={() => setSelectedModel(model)}
          />
        ))}
      </div>

      <ComparisonTable />

      {selectedModel && (
        <ModelDetailModal
          model={selectedModel}
          onClose={() => setSelectedModel(null)}
        />
      )}
    </SectionWrapper>
  )
}
