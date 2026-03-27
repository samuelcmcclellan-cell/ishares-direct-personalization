export function Button({ children, variant = 'primary', size = 'md', onClick, disabled, className = '' }) {
  const base = 'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed'

  const variants = {
    primary: 'bg-black hover:bg-[#333] text-white',
    secondary: 'bg-white hover:bg-[#F5F5EB] text-black border border-[#E5E5DD] hover:border-[#B9B9AF]',
    ghost: 'bg-transparent hover:bg-[#F5F5EB] text-[#4A4A4A] hover:text-black',
    highlight: 'bg-[#FEDC00] hover:bg-[#E6C800] text-black',
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3.5 text-base',
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  )
}
