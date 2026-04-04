import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, ChevronLeft, Calendar, Sunset, PiggyBank, TrendingUp, DollarSign, BarChart3 } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts'
import { Button } from '../../shared/Button'

const RISK_RETURN_MAP = { 1: 0.04, 2: 0.05, 3: 0.065, 4: 0.08, 5: 0.095 }
const RISK_LABEL_MAP = { 1: 'conservative', 2: 'conservative', 3: 'balanced', 4: 'growth', 5: 'aggressive growth' }

const GOAL_HORIZONS = {
  education: 10, home: 7, 'wealth-building': 20, income: 15, emergency: 3,
}

function formatDollar(v) {
  if (v >= 1000000) return `$${(v / 1000000).toFixed(1)}M`
  if (v >= 1000) return `$${Math.round(v / 1000)}K`
  return `$${v}`
}

function formatDollarFull(v) {
  return '$' + v.toLocaleString('en-US')
}

const AGE_FROM_FOLLOWUP = {
  'under-30': 25, '30-39': 35, '40-49': 45, '50-59': 55, '60-plus': 65,
}

const SMART_DEFAULTS = {
  retirement: {
    'under-30': { currentSavings: 50000, savingsRate: 10, annualIncome: 120000 },
    '30-39': { currentSavings: 150000, savingsRate: 12, annualIncome: 200000 },
    '40-49': { currentSavings: 300000, savingsRate: 12, annualIncome: 250000 },
    '50-59': { currentSavings: 500000, savingsRate: 14, annualIncome: 250000 },
    '60-plus': { currentSavings: 700000, savingsRate: 12, annualIncome: 200000 },
  },
  education: { _default: { currentSavings: 25000, savingsRate: 6, annualIncome: 100000 } },
  home: {
    'under-50k': { currentSavings: 15000, savingsRate: 13, annualIncome: 75000 },
    '50k-100k': { currentSavings: 30000, savingsRate: 14, annualIncome: 100000 },
    '100k-200k': { currentSavings: 60000, savingsRate: 13, annualIncome: 140000 },
    'over-200k': { currentSavings: 120000, savingsRate: 12, annualIncome: 200000 },
  },
  'wealth-building': { _default: { currentSavings: 50000, savingsRate: 9, annualIncome: 110000 } },
  income: { _default: { currentSavings: 150000, savingsRate: 7, annualIncome: 90000 } },
  emergency: { _default: { currentSavings: 5000, savingsRate: 15, annualIncome: 75000 } },
}

function getSmartDefaults(goal, goalFollowup) {
  const goalId = goal?.id
  const followupId = goalFollowup?.id
  const inferredAge = followupId ? (AGE_FROM_FOLLOWUP[followupId] || 35) : 35
  const base = {
    currentAge: inferredAge,
    retirementAge: Math.max(inferredAge + 5, 70),
    currentSavings: 100000, savingsRate: 10, annualIncome: 200000,
  }
  if (!goalId || !SMART_DEFAULTS[goalId]) return base
  const goalDefaults = SMART_DEFAULTS[goalId]
  const match = goalDefaults[followupId] || goalDefaults._default
  return match ? { ...base, ...match } : base
}

const MINI_STEP_DEFS = [
  { key: 'currentAge', question: 'How old are you?', Icon: Calendar, min: 18, max: 75, step: 1, format: v => `${v} years` },
  { key: 'retirementAge', question: 'When do you plan to retire?', Icon: Sunset, min: 50, max: 80, step: 1, format: v => `${v} years`, retirementOnly: true },
  { key: 'currentSavings', question: 'How much have you saved so far?', Icon: PiggyBank, min: 0, max: 2000000, step: 5000, format: formatDollar },
  { key: 'annualIncome', question: "What's your annual income?", Icon: DollarSign, min: 0, max: 500000, step: 5000, format: formatDollar },
  { key: 'savingsRate', question: 'What percentage do you save?', Icon: TrendingUp, min: 0, max: 30, step: 1, format: v => `${v}%` },
]

function computeProjection(currentAge, endAge, currentSavings, annualIncome, savingsRate, returnRate) {
  const years = Math.max(0, endAge - currentAge)
  const incomeGrowthRate = 0.03
  const data = []
  let balance = currentSavings
  for (let t = 0; t <= years; t++) {
    data.push({ year: t, age: currentAge + t, value: Math.round(Math.max(0, balance)) })
    if (t < years) {
      const yearIncome = annualIncome * Math.pow(1 + incomeGrowthRate, t)
      const yearContribution = yearIncome * savingsRate / 100
      balance = (balance + yearContribution) * (1 + returnRate)
    }
  }
  return data
}

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

export function FinancialMiniSteps({ step, answer, onSelect, goal, goalFollowup, riskPreference, onComplete }) {
  const isRetirement = goal?.id === 'retirement'
  const defaults = getSmartDefaults(goal, goalFollowup)
  const [values, setValues] = useState(answer || defaults)
  const [subStep, setSubStep] = useState(0)
  const [direction, setDirection] = useState(1)

  const activeSliders = useMemo(() =>
    MINI_STEP_DEFS.filter(s => !s.retirementOnly || isRetirement),
    [isRetirement]
  )
  const totalSubSteps = activeSliders.length + 1
  const isChartStep = subStep >= activeSliders.length
  const currentSlider = !isChartStep ? activeSliders[subStep] : null

  useEffect(() => {
    if (!answer) setValues(getSmartDefaults(goal, goalFollowup))
  }, [goal?.id, goalFollowup?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { onSelect(values) }, [values]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleChange = (key, val) => {
    setValues(prev => {
      const next = { ...prev, [key]: Number(val) }
      if (key === 'currentAge' && next.retirementAge <= Number(val)) next.retirementAge = Number(val) + 1
      return next
    })
  }

  const goForward = () => { if (subStep < totalSubSteps - 1) { setDirection(1); setSubStep(s => s + 1) } }
  const goBackward = () => { if (subStep > 0) { setDirection(-1); setSubStep(s => s - 1) } }

  const fillPercent = (slider) => ((values[slider.key] - slider.min) / (slider.max - slider.min)) * 100

  // Monte Carlo
  const riskPrefId = parseInt(riskPreference?.id) || 3
  const expectedReturn = RISK_RETURN_MAP[riskPrefId]
  const riskLabel = RISK_LABEL_MAP[riskPrefId]
  const goalId = goal?.id
  const endAge = isRetirement ? values.retirementAge : (values.currentAge + (GOAL_HORIZONS[goalId] || 20))
  const years = Math.max(1, endAge - values.currentAge)

  const chartData = useMemo(() => {
    const rates = [expectedReturn - 0.03, expectedReturn - 0.015, expectedReturn, expectedReturn + 0.015, expectedReturn + 0.03]
    const projections = rates.map(r => computeProjection(values.currentAge, endAge, values.currentSavings, values.annualIncome, values.savingsRate, r))
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
  }, [values.currentAge, endAge, values.currentSavings, values.annualIncome, values.savingsRate, expectedReturn])

  const finalData = chartData.length > 0 ? chartData[chartData.length - 1] : null
  const derivedMonthly = Math.round(values.annualIncome * values.savingsRate / 100 / 12)

  const slideVariants = {
    enter: (dir) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir) => ({ x: dir > 0 ? -80 : 80, opacity: 0 }),
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">{step.title}</h2>
      <p className="text-[#7A7A7A] mb-4">{step.description}</p>

      {/* Progress dots */}
      <div className="flex items-center justify-center gap-1.5 mb-6">
        {Array.from({ length: totalSubSteps }).map((_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === subStep ? 'w-6 bg-[#028E53]' : i < subStep ? 'w-1.5 bg-[#028E53]/40' : 'w-1.5 bg-[#E5E5DD]'
            }`}
          />
        ))}
      </div>

      <AnimatePresence mode="wait" custom={direction}>
        {!isChartStep && currentSlider && (
          <motion.div
            key={currentSlider.key}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="max-w-md mx-auto"
          >
            <div className="text-center mb-8">
              <div className="w-14 h-14 rounded-2xl bg-[#028E53]/10 flex items-center justify-center mx-auto mb-4">
                <currentSlider.Icon className="w-7 h-7 text-[#028E53]" />
              </div>
              <h3 className="text-lg font-semibold mb-1">{currentSlider.question}</h3>
              <div className="text-3xl font-bold text-[#028E53]">
                {currentSlider.format(values[currentSlider.key])}
              </div>
            </div>

            <div className="px-2">
              <input
                type="range"
                min={currentSlider.min}
                max={currentSlider.max}
                step={currentSlider.step}
                value={values[currentSlider.key]}
                onChange={e => handleChange(currentSlider.key, e.target.value)}
                className="slider-input w-full"
                style={{ '--fill': `${fillPercent(currentSlider)}%` }}
              />
              <div className="flex justify-between text-[10px] text-[#B9B9AF] mt-1">
                <span>{currentSlider.format(currentSlider.min)}</span>
                <span>{currentSlider.format(currentSlider.max)}</span>
              </div>
              {currentSlider.key === 'savingsRate' && (
                <div className="text-xs text-[#028E53] font-medium mt-2 text-center">
                  {formatDollar(derivedMonthly)}/mo &middot; {formatDollar(derivedMonthly * 12)}/yr
                </div>
              )}
            </div>

            <div className="flex justify-between mt-8">
              {subStep > 0 ? (
                <Button variant="ghost" onClick={goBackward}>
                  <ChevronLeft className="w-4 h-4 mr-1" /> Back
                </Button>
              ) : <div />}
              <Button onClick={goForward}>
                Next <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </motion.div>
        )}

        {isChartStep && (
          <motion.div
            key="chart"
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25, ease: 'easeInOut' }}
          >
            <div className="text-center mb-4">
              <div className="w-14 h-14 rounded-2xl bg-[#028E53]/10 flex items-center justify-center mx-auto mb-3">
                <BarChart3 className="w-7 h-7 text-[#028E53]" />
              </div>
              <h3 className="text-lg font-semibold">Your Projected Outcomes</h3>
              <p className="text-xs text-[#7A7A7A] mt-1">
                {years}-year projection &middot; {(expectedReturn * 100).toFixed(1)}% expected return
              </p>
            </div>

            <ResponsiveContainer width="100%" height={260}>
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
                {/* Stacked fan bands */}
                <Area type="monotone" dataKey="base" stackId="band" fill="transparent" stroke="none" legendType="none" />
                <Area type="monotone" dataKey="outerLow" stackId="band" fill="#028E53" fillOpacity={0.1} stroke="none" legendType="none" />
                <Area type="monotone" dataKey="innerLow" stackId="band" fill="#028E53" fillOpacity={0.2} stroke="none" legendType="none" />
                <Area type="monotone" dataKey="innerHigh" stackId="band" fill="#028E53" fillOpacity={0.2} stroke="none" legendType="none" />
                <Area type="monotone" dataKey="outerHigh" stackId="band" fill="#028E53" fillOpacity={0.1} stroke="none" legendType="none" />
                {/* Median line */}
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
              Based on historical return distributions for a {riskLabel} portfolio. Past performance does not guarantee future results.
            </p>

            <div className="flex justify-between mt-6">
              <Button variant="ghost" onClick={goBackward}>
                <ChevronLeft className="w-4 h-4 mr-1" /> Back
              </Button>
              <Button onClick={onComplete}>
                Continue <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
