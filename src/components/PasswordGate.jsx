import { useState } from 'react'

const CORRECT_PASSWORD = 'GPS2026$'

export function PasswordGate({ children }) {
  const [password, setPassword] = useState('')
  const [authenticated, setAuthenticated] = useState(false)
  const [error, setError] = useState(false)

  if (authenticated) return children

  const handleSubmit = (e) => {
    e.preventDefault()
    if (password === CORRECT_PASSWORD) {
      setAuthenticated(true)
      setError(false)
    } else {
      setError(true)
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F5EB] flex items-center justify-center px-6">
      <div className="bg-white border border-[#E5E5DD] rounded-2xl p-10 max-w-sm w-full shadow-[0_0_24px_rgba(0,0,0,0.06)] text-center">
        <div className="mb-6">
          <span className="text-2xl font-bold tracking-tight">iShares</span>
          <div className="mt-2">
            <span className="text-[10px] font-semibold tracking-widest uppercase bg-[#FEDC00] text-black px-2 py-0.5 rounded">
              Direct Personalization
            </span>
          </div>
          <div className="mt-2.5">
            <span className="text-[9px] tracking-wider uppercase text-[#B9B9AF] border border-[#E5E5DD] px-2 py-0.5 rounded-full">
              Experimental Prototype
            </span>
          </div>
        </div>

        <p className="text-sm text-[#7A7A7A] mb-6">
          This prototype is password protected.<br />
          Enter the access code to continue.
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(false) }}
            placeholder="Access code"
            className="w-full px-4 py-3 border border-[#E5E5DD] rounded-lg text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors bg-white"
            autoFocus
          />
          {error && (
            <p className="text-xs text-[#D92B2B] mt-2">Incorrect password. Please try again.</p>
          )}
          <button
            type="submit"
            className="w-full mt-4 px-4 py-3 bg-black hover:bg-[#333] text-white font-semibold rounded-lg transition-colors cursor-pointer text-sm"
          >
            Enter
          </button>
        </form>

        <div className="mt-6 space-y-1">
          <p className="text-[10px] text-[#B9B9AF]">
            Built by Sam McClellan with Claude Opus 4.6
          </p>
          <p className="text-[10px] text-[#B9B9AF]">
            Internal use only — not for distribution
          </p>
        </div>
      </div>
    </div>
  )
}
