import { Card } from '../../shared/Card'

export function GoalFollowUpStep({ step, answer, onSelect }) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">{step.title}</h2>
      <p className="text-[#7A7A7A] mb-8">{step.description}</p>
      <div className="flex flex-col gap-3 max-w-lg">
        {step.options.map(option => (
          <Card
            key={option.id}
            hover
            selected={answer?.id === option.id}
            onClick={() => onSelect(option)}
            className="px-5 py-4 flex items-center justify-between"
          >
            <div>
              <h3 className="font-semibold text-sm">{option.label}</h3>
              <p className="text-xs text-[#B9B9AF] mt-0.5">{option.description}</p>
            </div>
            <div className={`w-4 h-4 rounded-full border-2 transition-all ${
              answer?.id === option.id
                ? 'border-black bg-black'
                : 'border-[#B9B9AF]'
            }`} />
          </Card>
        ))}
      </div>
    </div>
  )
}
