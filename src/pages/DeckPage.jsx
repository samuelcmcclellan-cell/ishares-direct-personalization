import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Download, ArrowLeft } from 'lucide-react'

const SLIDES = [
  { label: 'The Opportunity', image: '/deck/slide-1.jpg' },
  { label: 'Three Ways to Build This', image: '/deck/slide-2.jpg' },
]

export function DeckPage() {
  const [active, setActive] = useState(0)

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

          {/* Slide image */}
          <motion.div
            key={active}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.25 }}
          >
            <img
              src={SLIDES[active].image}
              alt={SLIDES[active].label}
              className="w-full rounded-lg shadow-2xl"
              draggable={false}
            />
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
