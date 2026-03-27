import { motion } from 'framer-motion'

export function SectionWrapper({ id, children, className = '', dark = false }) {
  return (
    <section id={id} className={`py-24 px-6 ${dark ? 'bg-black text-white' : ''} ${className}`}>
      <motion.div
        className="max-w-7xl mx-auto"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        {children}
      </motion.div>
    </section>
  )
}
