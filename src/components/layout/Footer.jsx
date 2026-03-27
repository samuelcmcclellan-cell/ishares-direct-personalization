export function Footer() {
  return (
    <footer className="bg-black text-white py-16 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-lg font-bold">iShares</span>
          <span className="text-[10px] font-semibold tracking-widest uppercase bg-[#FEDC00] text-black px-2 py-0.5 rounded">
            Direct Personalization
          </span>
        </div>
        <p className="text-xs text-[#999] leading-relaxed max-w-3xl">
          <strong className="text-white">For illustrative purposes only.</strong> This prototype is a concept demonstration and does not constitute investment advice, a recommendation, or an offer to buy or sell any security. All portfolio allocations, ETF selections, and return estimates shown are hypothetical and for discussion purposes only. Past performance does not guarantee future results. Investing involves risk, including possible loss of principal. iShares and BlackRock are registered trademarks of BlackRock, Inc.
        </p>
        <div className="mt-6 pt-6 border-t border-[#333] text-xs text-[#666]">
          Internal Concept Prototype — Not for Distribution
        </div>
      </div>
    </footer>
  )
}
