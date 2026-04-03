import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts'

const TIMELINE_MAP = {
  'under-2': 2,
  '2-5': 4,
  '5-10': 6,
  '10-20': 8,
  '20+': 10,
}

const EXPERIENCE_MAP = {
  'never': 1,
  'under-1': 3,
  '1-5': 6,
  '5-plus': 9,
}

const FOMO_MAP = {
  '-1': 8,
  '0': 6,
  '1': 5,
  '3': 2,
}

function computeDimensions(answers) {
  const riskTolerance = answers.risk?.riskScore ?? 5
  const riskNudge = answers['risk-preference']?.riskNudge ?? 0
  const growthPref = Math.round(((riskNudge + 2) / 4) * 10)
  const timeHorizon = TIMELINE_MAP[answers.timeline?.id] ?? 5
  const savings = answers['financial-picture']?.currentSavings ?? 100000
  const cushion = Math.min(10, Math.round(savings / 200000))
  const experience = EXPERIENCE_MAP[answers.deepDive?.experience] ?? 5
  const fomoScore = answers['fomo-reaction']?.fomoScore
  const stability = fomoScore != null ? (FOMO_MAP[String(fomoScore)] ?? 5) : 5

  return [
    { dimension: 'Risk Tolerance', value: riskTolerance },
    { dimension: 'Growth Pref.', value: growthPref },
    { dimension: 'Time Horizon', value: timeHorizon },
    { dimension: 'Cushion', value: cushion },
    { dimension: 'Experience', value: experience },
    { dimension: 'Stability', value: stability },
  ]
}

export function RiskRadarChart({ answers }) {
  const data = computeDimensions(answers)

  return (
    <div>
      <h3 className="text-sm font-semibold uppercase tracking-wider text-[#7A7A7A] mb-4">Your Investor Profile</h3>
      <ResponsiveContainer width="100%" height={280}>
        <RadarChart data={data} cx="50%" cy="50%" outerRadius="75%">
          <PolarGrid stroke="#E5E5DD" />
          <PolarAngleAxis
            dataKey="dimension"
            tick={{ fontSize: 11, fill: '#4A4A4A' }}
          />
          <PolarRadiusAxis
            domain={[0, 10]}
            tick={false}
            axisLine={false}
          />
          <Radar
            dataKey="value"
            stroke="#028E53"
            fill="#028E53"
            fillOpacity={0.2}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}
