import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

const COLORS = ['#000000', '#02ABE5', '#FEDC00', '#028E53', '#E87722', '#7A7A7A']

const LABELS = {
  usEquity: 'US Equity',
  intlEquity: 'Intl Equity',
  usBonds: 'US Bonds',
  alternatives: 'Alternatives',
  cash: 'Cash',
}

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.[0]) return null
  const { name, value } = payload[0]
  return (
    <div className="bg-white border border-[#E5E5DD] rounded-lg px-3 py-2 shadow-lg">
      <p className="text-xs text-[#7A7A7A]">{name}</p>
      <p className="text-sm font-semibold">{value}%</p>
    </div>
  )
}

export function PortfolioPieChart({ allocation }) {
  const data = Object.entries(allocation)
    .filter(([, value]) => value > 0)
    .map(([key, value]) => ({
      name: LABELS[key] || key,
      value,
    }))

  return (
    <div className="w-full h-64">
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
            animationBegin={0}
            animationDuration={800}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex flex-wrap justify-center gap-4 mt-2">
        {data.map((entry, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
            <span className="text-xs text-[#4A4A4A]">{entry.name} {entry.value}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}
