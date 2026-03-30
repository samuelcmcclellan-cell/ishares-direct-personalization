import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Download, ArrowLeft } from 'lucide-react'
import { OPERATING_MODELS } from '../data/models'

const MODEL_COLORS = ['#00A854', '#F6693D', '#FFB800']
const AI_LABELS = ['No AI', 'High AI', 'Very High AI']

function Slide1() {
  const points = [
    '75M+ self-directed investors want guidance but won\'t pay for an advisor — they need a product-embedded solution.',
    'Schwab, Vanguard, and Wealthfront are racing to own the personalization layer. iShares isn\'t in the race yet.',
    'The path forward: start with simple allocation models, then layer in AI-driven personalization over time.',
  ]

  return (
    <div className="bg-white rounded-lg shadow-2xl aspect-video p-[6%] pb-[8%] flex flex-col relative overflow-hidden">
      {/* Yellow left accent bar */}
      <div className="absolute left-0 top-0 bottom-0 w-[1.2%] bg-[#FFD100]" />

      <h1 className="text-[clamp(22px,3.4vw,36px)] font-black leading-[1.1] mb-[4%] pl-[3%]">
        From ETF Provider<br />to Personalization Engine
      </h1>

      <p className="text-[clamp(11px,1.4vw,15px)] text-[#666] mb-[4%] pl-[3%] max-w-[85%]">
        iShares has the scale, lineup, and brand to guide self-directed investors from product selection to personalized portfolios.
      </p>

      <div className="w-[30%] h-[3px] bg-[#FFD100] mb-[5%] ml-[3%]" />

      <div className="flex flex-col gap-[3%] pl-[3%]">
        {points.map((point, i) => (
          <p key={i} className="text-[clamp(9px,1.2vw,13px)] text-[#333] leading-[1.6] max-w-[90%]">
            {point}
          </p>
        ))}
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 h-[7%] bg-[#333] flex items-center justify-center px-[4%]">
        <span className="text-[clamp(5px,0.65vw,7px)] text-white font-bold tracking-wide">
          FOR INTERNAL USE ONLY. NOT FOR DISTRIBUTION. THIS MATERIAL IS NOT INVESTMENT ADVICE.
        </span>
        <span className="absolute right-[3%] text-[clamp(6px,0.85vw,9px)] text-white">1</span>
      </div>
    </div>
  )
}

function Slide2() {
  return (
    <div className="bg-white rounded-lg shadow-2xl aspect-video flex flex-col relative overflow-hidden" style={{ padding: '3.5% 5% 7% 5%' }}>
      <h1 className="text-[clamp(20px,2.8vw,30px)] font-black leading-tight mb-[0.3%]">
        Three Ways to Build This
      </h1>

      <p className="text-[clamp(8px,1vw,12px)] text-[#666] mb-[1.2%] max-w-[90%] leading-snug">
        A spectrum from fast-to-market simplicity to full AI-powered portfolio intelligence. Start anywhere, evolve over time.
      </p>

      {/* Progress dots */}
      <div className="flex items-center mb-[1%]">
        <div className="flex-1 h-[2px] bg-[#E5E5E5]" />
        {MODEL_COLORS.map((color, i) => (
          <div key={i} className="flex items-center">
            <div className="w-[clamp(10px,1.4vw,16px)] h-[clamp(10px,1.4vw,16px)] rounded-full shrink-0" style={{ backgroundColor: color }} />
            {i < 2 && <div className="flex-1 min-w-[80px] h-[2px] bg-[#E5E5E5]" />}
          </div>
        ))}
        <div className="flex-1 h-[2px] bg-[#E5E5E5]" />
      </div>

      {/* Three model cards */}
      <div className="grid grid-cols-3 gap-[3%] flex-1 min-h-0">
        {OPERATING_MODELS.map((model, i) => (
          <div key={model.id} className="flex flex-col min-h-0">
            {/* Model label */}
            <span className="text-[clamp(7px,0.75vw,9px)] font-bold tracking-[0.15em] uppercase mb-[1.5%]" style={{ color: MODEL_COLORS[i] }}>
              Model {model.id}
            </span>

            {/* Card */}
            <div className="border border-[#E5E5E5] rounded flex flex-col flex-1 min-h-0 overflow-hidden">
              {/* Top color bar */}
              <div className="h-[3px] shrink-0" style={{ backgroundColor: MODEL_COLORS[i] }} />

              <div className="px-[7%] pt-[4%] pb-[3%] flex flex-col flex-1 min-h-0">
                <h3 className="text-[clamp(11px,1.2vw,15px)] font-bold leading-tight">
                  {model.name}
                </h3>
                <p className="text-[clamp(7px,0.85vw,10px)] italic mt-[1%] mb-[4%] leading-snug" style={{ color: MODEL_COLORS[i] }}>
                  {model.tagline}
                </p>

                {/* Bullet points */}
                <div className="flex flex-col gap-[4%] flex-1 min-h-0">
                  {(model.bullets || []).map((bullet, j) => (
                    <div key={j} className="flex items-start gap-[3%]">
                      <span className="text-[clamp(7px,0.8vw,10px)] leading-none mt-[2px] shrink-0" style={{ color: MODEL_COLORS[i] }}>•</span>
                      <span className="text-[clamp(7px,0.85vw,10px)] text-[#333] leading-snug">{bullet}</span>
                    </div>
                  ))}
                </div>

                {/* Bottom row: timeline, cost, AI level */}
                <div className="flex items-center gap-[8%] mt-auto pt-[4%] border-t border-[#E5E5E5] shrink-0">
                  <span className="text-[clamp(7px,0.8vw,10px)] font-semibold text-[#333]">{model.timeToMarket}</span>
                  <span className="text-[clamp(7px,0.8vw,10px)] font-bold" style={{ color: MODEL_COLORS[i] }}>{model.costToBuild}</span>
                  <span className="text-[clamp(7px,0.8vw,10px)] text-[#999]">{AI_LABELS[i]}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 h-[7%] bg-[#333] flex items-center justify-center px-[4%]">
        <span className="text-[clamp(5px,0.65vw,7px)] text-white font-bold tracking-wide">
          FOR INTERNAL USE ONLY. NOT FOR DISTRIBUTION. THIS MATERIAL IS NOT INVESTMENT ADVICE.
        </span>
        <span className="absolute right-[3%] text-[clamp(6px,0.85vw,9px)] text-white">2</span>
      </div>
    </div>
  )
}

const SLIDES = [
  { label: 'The Opportunity', component: Slide1 },
  { label: 'Three Ways to Build This', component: Slide2 },
]

export function DeckPage() {
  const [active, setActive] = useState(0)
  const SlideComponent = SLIDES[active].component

  return (
    <div className="min-h-screen bg-[#1a1a1a] flex flex-col">
      {/* Top bar */}
      <div className="bg-[#111] border-b border-[#333] px-6 py-4 flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center gap-2 text-sm text-[#999] hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to app
        </Link>

        <div className="flex items-center gap-3">
          <span className="text-lg font-bold text-white tracking-tight">iShares</span>
          <span className="text-[10px] font-semibold tracking-widest uppercase text-black bg-[#FFD100] px-2 py-0.5 rounded">
            Strategy Deck
          </span>
        </div>

        <a
          href="/deck/iShares_Direct_Personalization_2_Slides.pptx"
          download
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-white text-black hover:bg-[#e5e5e5] transition-colors"
        >
          <Download className="w-4 h-4" />
          Download .pptx
        </a>
      </div>

      {/* Slide toggle */}
      <div className="flex justify-center gap-2 py-4">
        {SLIDES.map((slide, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all cursor-pointer ${
              active === i
                ? 'bg-white text-black'
                : 'bg-[#333] text-[#999] hover:bg-[#444] hover:text-white'
            }`}
          >
            {slide.label}
          </button>
        ))}
      </div>

      {/* Slide viewer */}
      <div className="flex-1 flex items-center justify-center px-6 pb-8">
        <div className="relative w-full max-w-5xl">
          {/* Nav arrows */}
          <button
            onClick={() => setActive(Math.max(0, active - 1))}
            disabled={active === 0}
            className="absolute left-[-48px] top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[#333] hover:bg-[#444] flex items-center justify-center transition-colors disabled:opacity-20 disabled:cursor-default cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <button
            onClick={() => setActive(Math.min(SLIDES.length - 1, active + 1))}
            disabled={active === SLIDES.length - 1}
            className="absolute right-[-48px] top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[#333] hover:bg-[#444] flex items-center justify-center transition-colors disabled:opacity-20 disabled:cursor-default cursor-pointer"
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </button>

          {/* Live slide */}
          <motion.div
            key={active}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.25 }}
          >
            <SlideComponent />
          </motion.div>

          {/* Slide counter */}
          <div className="text-center mt-4 text-sm text-[#666]">
            Slide {active + 1} of {SLIDES.length}
          </div>
        </div>
      </div>
    </div>
  )
}
