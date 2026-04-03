import { MarketInsight } from '../MarketInsight'
import { EDUCATIONAL_INSIGHTS } from '../../../data/educationalInsights'

export function PreferencesStep({ step, answer, onSelect }) {
  const prefs = answer || {}

  const toggle = (id) => {
    onSelect({ ...prefs, [id]: !prefs[id] })
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">{step.title}</h2>
      <p className="text-[#7A7A7A] mb-8">{step.description}</p>
      {EDUCATIONAL_INSIGHTS["preferences"] && (
        <MarketInsight {...EDUCATIONAL_INSIGHTS["preferences"]} />
      )}
      <div className="flex flex-col gap-4 max-w-lg">
        {step.options.map(option => (
          <div
            key={option.id}
            onClick={() => toggle(option.id)}
            className="flex items-center justify-between px-5 py-4 bg-white border border-[#E5E5DD] rounded-2xl hover:border-[#B9B9AF] transition-all cursor-pointer"
          >
            <div>
              <h3 className="font-semibold text-sm">{option.label}</h3>
              <p className="text-xs text-[#B9B9AF] mt-0.5">{option.description}</p>
            </div>
            <div className={`w-11 h-6 rounded-full transition-all duration-200 relative ${
              prefs[option.id] ? 'bg-black' : 'bg-[#E5E5DD]'
            }`}>
              <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-200 ${
                prefs[option.id] ? 'left-5.5' : 'left-0.5'
              }`} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
