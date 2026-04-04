import { useMemo } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts'
import { computeProjection, formatDollar, formatDollarFull, GOAL_HORIZONS } from '../../logic/projectionUtils'

function MonteCarloTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const d = payload[0]?.payload
  if (!d) return null
  return (
    <div className="bg-white border border-[#E5E5DD] rounded-lg shadow-lg px-3 py-2 text-xs">
      <div className="font-semibold mb-1">Age {d.age}</div>
      <div className="flex justify-between gap-4"><span className="text-[#028E53]/40">Bull (90th)</span><span className="font-mono">{formatDollarFull(d.bull)}</span></div>
      <div className="flex justify-between gap-4"><span className="text-[#028E53]/60">Above Avg</span><span className="font-mono">{formatDollarFull(d.aboveAvg)}</span></div>
      <div className="flex justify-between gap-4 font-semibold"><span className="text-[#028E53]">Expected</span><span className="font-mono">{formatDollarFull(d.expected)}</span></div>
      <div className="flex justify-between gap-4"><span className="text-[#028E53]/60">Below Avg</span><span className="font-mono">{formatDollarFull(d.belowAvg)}</span></div>
      <div className="flex justify-between gap-4"><span className="text-[#028E53]/40">Bear (10th)</span><span className="font-mono">{formatDollarFull(d.bear)}</span></div>
    </div>
  )
}

export function MonteCarloProjectionChart({ financialData, expectedReturn, goalId, portfolioName, riskLabel }) {
  if (!financialData) return null

  const isRetirement = goalId === 'retirement'
  const endAge = isRetirement
    ? financialData.retirementAge
    : (financialData.currentAge + (GOAL_HORIZONS[goalId] || 20))
  const years = Math.max(1, endAge - financialData.currentAge)

  const chartData = useMemo(() => {
    const rates = [expectedReturn - 0.03, expectedReturn - 0.015, expectedReturn, expectedReturn + 0.015, expectedReturn + 0.03]
    const projections = rates.map(r =>
      computeProjection(financialData.currentAge, endAge, financialData.currentSavings, financialData.annualIncome, financialData.savingsRate, r)
    )
    return projections[2].map((d, i) => ({
      age: d.age,
      bear: projections[0][i].value,
      belowAvg: projections[1][i].value,
      expected: projections[2][i].value,
      aboveAvg: projections[3][i].value,
      bull: projections[4][i].value,
      base: projections[0][i].value,
      outerLow: Math.max(0, projections[1][i].value - projections[0][i].value),
      innerLow: Math.max(0, projections[2][i].value - projections[1][i].value),
      innerHigh: Math.max(0, projections[3][i].value - projections[2][i].value),
      outerHigh: Math.max(0, projections[4][i].value - projections[3][i].value),
    }))
  }, [financialData.currentAge, endAge, financialData.currentSavings, financialData.annualIncome, financialData.savingsRate, expectedReturn])

  const finalData = chartData.length > 0 ? chartData[chartData.length - 1] : null

  return (
    <div>
      <h3 className="text-sm font-semibold uppercase tracking-wider text-[#7A7A7A] mb-1">Your Projected Outcomes</h3>
      <p className="text-xs text-[#7A7A7A] mb-4">
        {years}-year projection &middot; {(expectedReturn * 100).toFixed(1)}% expected return with {portfolioName}
      </p>

      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={chartData} margin={{ top: 10, right: 15, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E5DD" />
          <XAxis
            dataKey="age"
            tick={{ fontSize: 10, fill: '#7A7A7A' }}
            tickLine={false}
            axisLine={{ stroke: '#E5E5DD' }}
            interval={Math.max(1, Math.floor(years / 6))}
          />
          <YAxis
            tick={{ fontSize: 10, fill: '#7A7A7A' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={formatDollar}
            width={55}
          />
          <Tooltip content={<MonteCarloTooltip />} />
          <Area type="monotone" dataKey="base" stackId="band" fill="transparent" stroke="none" legendType="none" />
          <Area type="monotone" dataKey="outerLow" stackId="band" fill="#028E53" fillOpacity={0.1} stroke="none" legendType="none" />
          <Area type="monotone" dataKey="innerLow" stackId="band" fill="#028E53" fillOpacity={0.2} stroke="none" legendType="none" />
          <Area type="monotone" dataKey="innerHigh" stackId="band" fill="#028E53" fillOpacity={0.2} stroke="none" legendType="none" />
          <Area type="monotone" dataKey="outerHigh" stackId="band" fill="#028E53" fillOpacity={0.1} stroke="none" legendType="none" />
          <Area type="monotone" dataKey="expected" fill="none" stroke="#028E53" strokeWidth={2.5} dot={false} legendType="none" />
        </AreaChart>
      </ResponsiveContainer>

      {finalData && (
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="text-center p-3 bg-[#028E53]/5 rounded-xl border border-[#028E53]/10">
            <div className="text-[10px] text-[#7A7A7A] uppercase tracking-wider">Bear (10th)</div>
            <div className="text-sm font-bold text-[#7A7A7A]">{formatDollar(finalData.bear)}</div>
          </div>
          <div className="text-center p-3 bg-[#028E53]/10 rounded-xl border border-[#028E53]/20">
            <div className="text-[10px] text-[#028E53] uppercase tracking-wider font-semibold">Expected</div>
            <div className="text-lg font-bold text-[#028E53]">{formatDollar(finalData.expected)}</div>
          </div>
          <div className="text-center p-3 bg-[#028E53]/5 rounded-xl border border-[#028E53]/10">
            <div className="text-[10px] text-[#7A7A7A] uppercase tracking-wider">Bull (90th)</div>
            <div className="text-sm font-bold text-[#7A7A7A]">{formatDollar(finalData.bull)}</div>
          </div>
        </div>
      )}

      <p className="text-[10px] text-[#B9B9AF] mt-3 text-center">
        Based on illustrative return assumptions for the {riskLabel} portfolio. Past performance does not guarantee future results.
      </p>
    </div>
  )
}
