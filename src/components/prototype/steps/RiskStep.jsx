import { Card } from '../../shared/Card'

const RISK_COLORS = ['text-[#028E53]', 'text-[#028E53]', 'text-[#E6A800]', 'text-[#E87722]', 'text-[#D92B2B]']

export function RiskStep({ step, answer, onSelect }) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">{step.title}</h2>
      <p className="text-[#7A7A7A] mb-8">{step.description}</p>
      <div className="flex flex-col gap-3 max-w-xl">
        {step.options.map((option, i) => (
          <Card
            key={option.id}
            hover
            selected={answer?.id === option.id}
            onClick={() => onSelect(option)}
            className="px-5 py-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-sm">{option.label}</h3>
                <p className="text-xs text-[#B9B9AF] mt-0.5">{option.description}</p>
              </div>
              <span className={`text-xs font-mono ${RISK_COLORS[i]}`}>
                {option.riskScore}/5
              </span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
