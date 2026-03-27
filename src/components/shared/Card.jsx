export function Card({ children, className = '', hover = false, selected = false, onClick }) {
  const base = 'bg-white border rounded-2xl transition-all duration-200'
  const borderClass = selected
    ? 'border-black shadow-[0_0_0_2px_rgba(0,0,0,1)]'
    : 'border-[#E5E5DD]'
  const hoverClass = hover ? 'hover:border-[#B9B9AF] hover:shadow-[0_0_12px_rgba(0,0,0,0.08)] cursor-pointer' : ''

  return (
    <div
      onClick={onClick}
      className={`${base} ${borderClass} ${hoverClass} ${className}`}
    >
      {children}
    </div>
  )
}
