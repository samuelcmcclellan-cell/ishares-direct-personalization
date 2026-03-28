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
    <div className="w-full flex flex-col items-center">
      <div className="w-full h-64">
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={75}
              outerRadius={110}
              paddingAngle={3}
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
      </div>
      <div className="mt-4 mx-auto w-fit grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5">
        {data.map((entry, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
            <span className="text-[13px] font-medium text-[#4A4A4A]">{entry.name} {entry.value}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}
