import { ETF_DATA } from '../../data/etfs'

export function HoldingsTable({ holdings }) {
  const enriched = holdings.map(h => ({
    ...h,
    ...(ETF_DATA[h.ticker] || {}),
  }))

  const weightedER = enriched.reduce((acc, h) => acc + (h.expenseRatio || 0) * h.weight / 100, 0)

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[#E5E5DD]">
            <th className="text-left py-2 pr-3 text-xs font-semibold uppercase tracking-wider text-[#7A7A7A]">Ticker</th>
            <th className="text-left py-2 pr-3 text-xs font-semibold uppercase tracking-wider text-[#7A7A7A]">ETF Name</th>
            <th className="text-left py-2 pr-3 text-xs font-semibold uppercase tracking-wider text-[#7A7A7A]">Category</th>
            <th className="text-right py-2 pr-3 text-xs font-semibold uppercase tracking-wider text-[#7A7A7A]">Weight</th>
            <th className="text-right py-2 text-xs font-semibold uppercase tracking-wider text-[#7A7A7A]">Expense Ratio</th>
          </tr>
        </thead>
        <tbody>
          {enriched.map(h => (
            <tr key={h.ticker} className="border-b border-[#F5F5EB] hover:bg-[#FAFAF7] transition-colors">
              <td className="py-2.5 pr-3 font-mono font-bold text-black">{h.ticker}</td>
              <td className="py-2.5 pr-3 text-black">{h.name}</td>
              <td className="py-2.5 pr-3 text-[#7A7A7A]">{h.category}</td>
              <td className="py-2.5 pr-3 text-right font-mono">{h.weight}%</td>
              <td className="py-2.5 text-right font-mono text-[#7A7A7A]">{(h.expenseRatio * 100).toFixed(0)} bps</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t border-[#E5E5DD]">
            <td colSpan={3} className="py-2.5 text-xs font-medium text-[#7A7A7A]">Weighted Expense Ratio</td>
            <td className="py-2.5 text-right font-mono font-bold">100%</td>
            <td className="py-2.5 text-right font-mono font-bold text-[#028E53]">{(weightedER * 100).toFixed(1)} bps</td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}
