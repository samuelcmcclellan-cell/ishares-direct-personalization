import { Card } from '../../shared/Card'

export function RiskDeepDivePrompt({ onChoice }) {
  return (
    <div className="text-center max-w-lg mx-auto">
      <div className="w-16 h-16 rounded-2xl bg-[#FEDC00]/30 flex items-center justify-center mx-auto mb-6">
        <span className="text-2xl">🎯</span>
      </div>
      <h2 className="text-2xl font-bold mb-2">Want more precise recommendations?</h2>
      <p className="text-[#7A7A7A] mb-8">Two quick follow-up questions can help us fine-tune your portfolio match.</p>
      <div className="flex gap-3 justify-center">
        <button
          onClick={() => onChoice(true)}
          className="px-6 py-3 bg-black hover:bg-[#333] text-white font-semibold rounded-lg transition-colors cursor-pointer"
        >
          Yes, fine-tune it
        </button>
        <button
          onClick={() => onChoice(false)}
          className="px-6 py-3 bg-white hover:bg-[#F5F5EB] text-[#4A4A4A] font-semibold rounded-lg border border-[#E5E5DD] transition-colors cursor-pointer"
        >
          Skip, I'm good
        </button>
      </div>
    </div>
  )
}

export function RiskDeepDive({ step, answer, onSelect }) {
  const deepDiveAnswers = answer || {}

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">{step.title}</h2>
      <p className="text-[#7A7A7A] mb-8">{step.description}</p>
      <div className="space-y-8 max-w-xl">
        {step.questions.map(question => (
          <div key={question.id}>
            <h3 className="text-sm font-semibold mb-3">{question.label}</h3>
            <div className="flex flex-col gap-2">
              {question.options.map(option => (
                <Card
                  key={option.id}
                  hover
                  selected={deepDiveAnswers[question.id]?.id === option.id}
                  onClick={() => onSelect({ ...deepDiveAnswers, [question.id]: option })}
                  className="px-4 py-3"
                >
                  <span className="text-sm">{option.label}</span>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
