import { useScrollSpy } from '../../hooks/useScrollSpy'

const NAV_ITEMS = [
  { id: 'overview', label: 'Overview' },
  { id: 'models', label: 'Operating Models' },
  { id: 'prototype', label: 'Try It' },
]

export function Navbar() {
  const activeId = useScrollSpy(['overview', 'models', 'prototype'])

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#E5E5DD]">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-lg font-bold tracking-tight text-black">iShares</span>
          <span className="text-[10px] font-semibold tracking-widest uppercase text-black bg-[#FEDC00] px-2 py-0.5 rounded">
            Direct Personalization
          </span>
        </div>

        <div className="flex items-center gap-1">
          {NAV_ITEMS.map(item => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                activeId === item.id
                  ? 'text-black bg-[#F5F5EB]'
                  : 'text-[#7A7A7A] hover:text-black hover:bg-[#FAFAF7]'
              }`}
            >
              {item.label}
            </a>
          ))}
        </div>

        <div className="text-xs text-[#B9B9AF] font-medium">
          Concept Prototype
        </div>
      </div>
    </nav>
  )
}
