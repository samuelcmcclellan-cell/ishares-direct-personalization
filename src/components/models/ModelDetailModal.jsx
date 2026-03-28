import { X, Check, AlertTriangle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Badge } from '../shared/Badge'

export function ModelDetailModal({ model, onClose }) {
  if (!model) return null

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

        <motion.div
          className="relative bg-white border border-[#E5E5DD] rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
        >
          <div className="sticky top-0 bg-white border-b border-[#E5E5DD] px-6 py-4 flex items-center justify-between rounded-t-2xl">
            <div>
              <span className="text-xs font-mono text-[#B9B9AF]">Model {model.id}</span>
              <h2 className="text-xl font-bold">{model.name}</h2>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-[#F5F5EB] hover:bg-[#E5E5DD] flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            <p className="text-[#4A4A4A] leading-relaxed">{model.description}</p>

            <div className="flex flex-wrap gap-2">
              <Badge>{model.personalizationDepth} Personalization</Badge>
              <Badge>{model.costToBuild} Cost</Badge>
              <Badge color="blue">{model.portfolioCount} Portfolios</Badge>
              <Badge color="gray">{model.timeToMarket}</Badge>
            </div>

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-[#7A7A7A] mb-3">Example User Journey</h3>
              <div className="bg-[#F5F5EB] border border-[#E5E5DD] rounded-xl p-4">
                <p className="text-sm text-[#4A4A4A] leading-relaxed">{model.userJourney}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-[#028E53] mb-3 flex items-center gap-2">
                  <Check className="w-4 h-4" /> Advantages
                </h3>
                <ul className="space-y-2">
                  {model.pros.map((pro, i) => (
                    <li key={i} className="text-sm text-[#4A4A4A] flex gap-2">
                      <span className="text-[#028E53] shrink-0">+</span>
                      {pro}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-[#E6A800] mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" /> Considerations
                </h3>
                <ul className="space-y-2">
                  {model.cons.map((con, i) => (
                    <li key={i} className="text-sm text-[#4A4A4A] flex gap-2">
                      <span className="text-[#E6A800] shrink-0">&ndash;</span>
                      {con}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-[#7A7A7A] mb-3">ETF Building Blocks</h3>
              <div className="text-sm text-[#4A4A4A]">{model.etfBuildingBlocks}</div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
