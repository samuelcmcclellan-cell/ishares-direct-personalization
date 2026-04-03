import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, ChevronDown } from 'lucide-react'

export function MarketInsight({ teaser, content, sourceUrl, sourceLabel = 'BlackRock Inside the Market' }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="mb-6">
      <div className="bg-[#F5F5EB] border border-[#E5E5DD] rounded-xl overflow-hidden">
        <div
          className="flex items-center gap-2 px-4 py-3 cursor-pointer"
          onClick={() => setIsOpen(!isOpen)}
        >
          <BookOpen className="w-4 h-4 text-[#7A7A7A] shrink-0" />
          <span className="text-sm text-[#4A4A4A] font-medium">{teaser}</span>
          <span className="text-xs text-[#B9B9AF] ml-auto shrink-0">
            {isOpen ? 'Show less' : 'Learn more'}
          </span>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-4 h-4 text-[#B9B9AF] shrink-0" />
          </motion.div>
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 text-sm text-[#4A4A4A] leading-relaxed">
                {content}
                {sourceUrl && (
                  <a
                    href={sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[#B9B9AF] hover:text-black underline transition-colors mt-2 inline-block"
                  >
                    {sourceLabel}
                  </a>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
