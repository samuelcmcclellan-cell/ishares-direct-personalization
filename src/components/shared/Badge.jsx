const COLOR_MAP = {
  green: 'bg-[#028E53]/10 text-[#028E53] border-[#028E53]/20',
  amber: 'bg-[#E6A800]/10 text-[#A07400] border-[#E6A800]/20',
  orange: 'bg-[#E87722]/10 text-[#C05E10] border-[#E87722]/20',
  red: 'bg-[#D92B2B]/10 text-[#D92B2B] border-[#D92B2B]/20',
  blue: 'bg-[#02ABE5]/10 text-[#0289B8] border-[#02ABE5]/20',
  gray: 'bg-[#F5F5EB] text-[#4A4A4A] border-[#E5E5DD]',
  black: 'bg-black/5 text-black border-black/10',
}

const VALUE_COLORS = {
  'Low': 'green',
  'None': 'green',
  '$': 'green',
  'High': 'amber',
  'Moderate': 'amber',
  'Medium': 'amber',
  '$$': 'amber',
  'Moderate-High': 'orange',
  'Medium-High': 'orange',
  '$$$': 'orange',
  'Very High': 'red',
  '$$$$': 'red',
}

export function Badge({ children, color, className = '' }) {
  const resolvedColor = color || VALUE_COLORS[children] || 'gray'
  const colorClasses = COLOR_MAP[resolvedColor] || COLOR_MAP.gray

  return (
    <span className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-md border ${colorClasses} ${className}`}>
      {children}
    </span>
  )
}
