import { SectionWrapper } from '../layout/SectionWrapper'
import { HeroBlock } from './HeroBlock'
import { ProblemStatement } from './ProblemStatement'
import { ValuePillars } from './ValuePillars'

export function OverviewSection() {
  return (
    <SectionWrapper id="overview" className="pt-16 bg-[#F5F5EB]">
      <HeroBlock />
      <ProblemStatement />
      <ValuePillars />
    </SectionWrapper>
  )
}
