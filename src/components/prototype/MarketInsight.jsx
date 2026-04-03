import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, ChevronDown, ExternalLink } from 'lucide-react'

export function MarketInsight({ teaser, content, sourceUrl, sourceLabel = 'BlackRock Inside the Market', image }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="mb-5">
      <div className="bg-[#F5F5EB] border border-[#E5E5DD] rounded-xl overflow-hidden">
        {/* Compact card: teaser + source link always visible */}
        <div className="flex items-start gap-3 px-4 py-3">
          {/* Left accent + icon */}
          <div className="flex-shrink-0 mt-0.5">
            <BookOpen className="w-4 h-4 text-[#7A7A7A]" />
          </div>

          {/* Text content */}
          <div className="flex-1 min-w-0">
            {/* Teaser — clickable to expand */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center gap-1.5 w-full text-left cursor-pointer"
            >
              <span className="text-sm text-[#4A4A4A] font-medium leading-snug">{teaser}</span>
              <motion.div
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="shrink-0 ml-auto"
              >
                <ChevronDown className="w-3.5 h-3.5 text-[#B9B9AF]" />
              </motion.div>
            </button>

            {/* Source link — always visible */}
            {sourceUrl && (
              <a
                href={sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 mt-1.5 text-xs text-[#7A7A7A] hover:text-black transition-colors group"
              >
                <ExternalLink className="w-3 h-3 shrink-0 opacity-60 group-hover:opacity-100" />
                <span className="underline underline-offset-2 decoration-[#B9B9AF] group-hover:decoration-black">{sourceLabel}</span>
              </a>
            )}
          </div>
        </div>

        {/* Expandable content */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-3 pl-11 text-xs text-[#4A4A4A] leading-relaxed">
                {content}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
