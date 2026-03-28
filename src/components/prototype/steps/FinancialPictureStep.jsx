import { useState, useMemo, useEffect } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const SLIDERS = [
  { key: 'currentAge',          label: 'Current Age',          min: 18, max: 75,     step: 1,    format: v => `${v} years`,     defaultValue: 35 },
  { key: 'retirementAge',       label: 'Retirement Age',       min: 50, max: 80,     step: 1,    format: v => `${v} years`,     defaultValue: 65 },
  { key: 'currentSavings',      label: 'Current Savings',      min: 0,  max: 2000000, step: 5000, format: v => formatDollar(v),  defaultValue: 50000 },
  { key: 'monthlyContribution', label: 'Monthly Contribution', min: 0,  max: 10000,  step: 100,  format: v => formatDollar(v),  defaultValue: 500 },
  { key: 'annualIncome',        label: 'Annual Income',        min: 0,  max: 500000, step: 5000, format: v => formatDollar(v),  defaultValue: 100000 },
]

function formatDollar(v) {
  if (v >= 1000000) return `$${(v / 1000000).toFixed(1)}M`
  if (v >= 1000) return `$${Math.round(v / 1000)}K`
  return `$${v}`
}

function formatDollarFull(v) {
  return '$' + v.toLocaleString('en-US')
}

function getTaxBracket(income) {
  if (income <= 11600) return '10%'
  if (income <= 47150) return '12%'
  if (income <= 100525) return '22%'
  if (income <= 191950) return '24%'
  if (income <= 243725) return '32%'
  if (income <= 609350) return '35%'
  return '37%'
}

function computeProjection(currentAge, retirementAge, currentSavings, monthlyContribution) {
  const years = Math.max(0, retirementAge - currentAge)
  const rate = 0.07
  const data = []

  for (let t = 0; t <= years; t++) {
    const totalContributions = currentSavings + monthlyContribution * 12 * t
    // Future value: FV of lump sum + FV of annuity
    const growth = currentSavings * Math.pow(1 + rate, t) +
      monthlyContribution * 12 * ((Math.pow(1 + rate, t) - 1) / rate)

    data.push({
      year: t,
      age: currentAge + t,
      contributions: Math.round(totalContributions),
      growth: Math.round(growth),
    })
  }
  return data
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-[#E5E5DD] rounded-lg shadow-lg px-3 py-2 text-xs">
      <div className="font-semibold mb-1">Age {label}</div>
      {payload.map(p => (
        <div key={p.name} className="flex justify-between gap-4">
          <span style={{ color: p.color }}>{p.name}</span>
          <span className="font-mono">{formatDollarFull(p.value)}</span>
        </div>
      ))}
    </div>
  )
}

export function FinancialPictureStep({ step, answer, onSelect }) {
  const defaults = {
    currentAge: 35,
    retirementAge: 65,
    currentSavings: 50000,
    monthlyContribution: 500,
    annualIncome: 100000,
  }

  const [values, setValues] = useState(answer || defaults)

  // Save to parent on every change
  useEffect(() => {
    onSelect(values)
  }, [values]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleChange = (key, val) => {
    setValues(prev => {
      const next = { ...prev, [key]: Number(val) }
      // Keep retirement age >= current age + 1
      if (key === 'currentAge' && next.retirementAge <= Number(val)) {
        next.retirementAge = Number(val) + 1
      }
      return next
    })
  }

  const projection = useMemo(
    () => computeProjection(values.currentAge, values.retirementAge, values.currentSavings, values.monthlyContribution),
    [values.currentAge, values.retirementAge, values.currentSavings, values.monthlyContribution]
  )

  const projectedValue = projection.length > 0 ? projection[projection.length - 1].growth : 0
  const yearsToRetirement = values.retirementAge - values.currentAge
  const taxBracket = getTaxBracket(values.annualIncome)

  const fillPercent = (key) => {
    const s = SLIDERS.find(sl => sl.key === key)
    return ((values[key] - s.min) / (s.max - s.min)) * 100
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">{step.title}</h2>
      <p className="text-[#7A7A7A] mb-6">{step.description}</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sliders */}
        <div className="space-y-5">
          {SLIDERS.map(slider => (
            <div key={slider.key}>
              <div className="flex justify-between mb-1.5">
                <span className="text-sm text-[#4A4A4A]">{slider.label}</span>
                <span className="text-sm font-semibold">{slider.format(values[slider.key])}</span>
              </div>
              <div className="relative">
                <input
                  type="range"
                  min={slider.min}
                  max={slider.max}
                  step={slider.step}
                  value={values[slider.key]}
                  onChange={e => handleChange(slider.key, e.target.value)}
                  className="slider-input w-full"
                  style={{ '--fill': `${fillPercent(slider.key)}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-[#B9B9AF] mt-0.5">
                <span>{slider.format(slider.min)}</span>
                <span>{slider.format(slider.max)}</span>
              </div>
            </div>
          ))}

          <div className="text-xs text-[#7A7A7A] pt-2 border-t border-[#E5E5DD]">
            Estimated tax bracket: <span className="font-semibold text-black">{taxBracket}</span>
          </div>
        </div>

        {/* Chart */}
        <div>
          <div className="text-center mb-3">
            <div className="text-xs text-[#7A7A7A]">
              Projected Value ({yearsToRetirement}yr, 7% return)
            </div>
            <div className="text-3xl font-bold text-[#028E53]">
              {formatDollarFull(projectedValue)}
            </div>
          </div>

          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={projection} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E5DD" />
              <XAxis
                dataKey="age"
                tick={{ fontSize: 10, fill: '#7A7A7A' }}
                tickLine={false}
                axisLine={{ stroke: '#E5E5DD' }}
                interval={Math.max(1, Math.floor(yearsToRetirement / 6))}
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#7A7A7A' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={v => v >= 1000000 ? `$${(v/1000000).toFixed(1)}M` : v >= 1000 ? `$${Math.round(v/1000)}K` : `$${v}`}
                width={55}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: 11 }}
                iconType="circle"
                iconSize={8}
              />
              <Area
                type="monotone"
                dataKey="contributions"
                name="Contributions"
                stackId="1"
                stroke="#66BB6A"
                fill="#C8E6C9"
                fillOpacity={0.8}
              />
              <Area
                type="monotone"
                dataKey="growth"
                name="Growth"
                stroke="#028E53"
                fill="#028E53"
                fillOpacity={0.15}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
