import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { HERO } from '../../data/content'

function AnimatedCounter({ value, prefix = '', suffix = '', duration = 2000 }) {
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    const startTime = Date.now()
    const tick = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(eased * value)
      if (progress < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [value, duration])

  const formatted = Number.isInteger(value) ? Math.round(display).toLocaleString() : display.toFixed(1)

  return (
    <span className="tabular-nums">
      {prefix}{formatted}{suffix}
    </span>
  )
}

export function HeroBlock() {
  return (
    <div className="text-center pt-24 pb-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-black leading-[1.1]">
          {HERO.headline}
        </h1>
        <p className="mt-6 text-lg md:text-xl text-[#4A4A4A] max-w-3xl mx-auto leading-relaxed">
          {HERO.subheadline}
        </p>
        <a
          href="/deck/iShares_Direct_Personalization_2_Slides.pptx"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold rounded-lg bg-black text-white hover:bg-[#222] transition-colors"
        >
          View Strategy Deck
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
        </a>
      </motion.div>

      <motion.div
        className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        {HERO.stats.map((stat, i) => (
          <div key={i} className="text-center">
            <div className="text-4xl font-extrabold text-black">
              <AnimatedCounter
                value={stat.value}
                prefix={stat.prefix || ''}
                suffix={stat.suffix || ''}
              />
            </div>
            <div className="mt-2 text-sm text-[#7A7A7A]">{stat.label}</div>
          </div>
        ))}
      </motion.div>
    </div>
  )
}
