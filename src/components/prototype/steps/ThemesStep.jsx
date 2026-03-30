import { Brain, Zap, Building2, Shield, MinusCircle } from 'lucide-react'

const ICONS = { Brain, Zap, Factory: Building2, Shield, MinusCircle }

export function ThemesStep({ step, answer, onSelect }) {
  const selected = answer || {}

  const toggle = (optionId) => {
    if (optionId === 'none') {
      // "No preference" clears all others
      onSelect({ none: true })
      return
    }
    const next = { ...selected }
    delete next.none // clear "none" when selecting a theme
    if (next[optionId]) {
      delete next[optionId]
    } else {
      next[optionId] = true
    }
    onSelect(Object.keys(next).length > 0 ? next : undefined)
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">{step.title}</h2>
      <p className="text-[#7A7A7A] mb-6">{step.description}</p>
      <div className="flex flex-col gap-3">
        {step.options.map(option => {
          const Icon = ICONS[option.icon]
          const isSelected = !!selected[option.id]
          return (
            <button
              key={option.id}
              onClick={() => toggle(option.id)}
              className={`flex items-center gap-4 px-5 py-4 rounded-2xl border-2 text-left transition-all duration-150 cursor-pointer ${
                isSelected
                  ? 'border-[#028E53] bg-[#028E53]/5'
                  : 'border-[#E5E5DD] bg-[#F5F5EB] hover:border-[#B9B9AF]'
              }`}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                isSelected ? 'bg-[#028E53]/10' : 'bg-white'
              }`}>
                {Icon && <Icon className={`w-5 h-5 ${isSelected ? 'text-[#028E53]' : 'text-[#7A7A7A]'}`} />}
              </div>
              <div className="flex-1">
                <div className="font-semibold text-sm">{option.label}</div>
                <div className="text-xs text-[#7A7A7A] mt-0.5">{option.description}</div>
              </div>
              <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 ${
                isSelected ? 'border-[#028E53] bg-[#028E53]' : 'border-[#B9B9AF]'
              }`}>
                {isSelected && (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
