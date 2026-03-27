import { motion } from 'framer-motion'

export function ProgressBar({ progress, currentStep, totalSteps }) {
  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs text-[#7A7A7A]">Step {currentStep + 1} of {totalSteps}</span>
        <span className="text-xs text-[#7A7A7A]">{progress}%</span>
      </div>
      <div className="h-1 bg-[#E5E5DD] rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-black rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}
