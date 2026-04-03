import { AlertTriangle, Zap } from 'lucide-react'
import { PROBLEM } from '../../data/content'

export function ProblemStatement() {
  return (
    <div className="py-16">
      <h2 className="text-3xl font-bold tracking-tight text-center mb-12">{PROBLEM.title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-[#F5F5EB] border border-[#E5E5DD] rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-14 h-14 rounded-lg bg-[#D92B2B]/10 flex items-center justify-center">
              <AlertTriangle className="w-7 h-7 text-[#D92B2B]" />
            </div>
            <h3 className="text-xl font-semibold">{PROBLEM.problem.heading}</h3>
          </div>
          <ul className="space-y-4">
            {PROBLEM.problem.points.map((point, i) => (
              <li key={i} className="flex gap-3 text-[#4A4A4A] text-sm leading-relaxed">
                <span className="text-[#D92B2B] mt-0.5 shrink-0 font-bold">&ndash;</span>
                {point}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-[#F5F5EB] border border-[#E5E5DD] rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-14 h-14 rounded-lg bg-[#FEDC00]/30 flex items-center justify-center">
              <Zap className="w-7 h-7 text-black" />
            </div>
            <h3 className="text-xl font-semibold">{PROBLEM.opportunity.heading}</h3>
          </div>
          <ul className="space-y-4">
            {PROBLEM.opportunity.points.map((point, i) => (
              <li key={i} className="flex gap-3 text-[#4A4A4A] text-sm leading-relaxed">
                <span className="text-[#028E53] mt-0.5 shrink-0 font-bold">+</span>
                {point}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
