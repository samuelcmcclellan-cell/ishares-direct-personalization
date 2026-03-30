import { OPERATING_MODELS, COMPARISON_DIMENSIONS, DIMENSION_COLORS } from '../../data/models'
import { Badge } from '../shared/Badge'

// Values short enough to badge; longer values render as plain text
const BADGE_VALUES = new Set([
  'Low', 'None', '$', 'High', 'Moderate', 'Medium', '$$',
  'Medium-High', 'Moderate-High', '$$$', 'Very High', '$$$$',
  '~5', '33', '15–20', '50–200+',
])

function CellValue({ value }) {
  if (BADGE_VALUES.has(value)) {
    return <Badge>{value}</Badge>
  }
  return <span className="text-xs text-[#4A4A4A] leading-snug">{value}</span>
}

export function ComparisonTable() {
  const modelCount = OPERATING_MODELS.length
  // Equal widths: label column gets same width as each model column
  const colWidth = `${Math.floor(100 / (modelCount + 1))}%`

  return (
    <div className="mt-16">
      <h3 className="text-xl font-semibold mb-6">Side-by-Side Comparison</h3>

      {/* Desktop: side-by-side table */}
      <div className="hidden md:block overflow-x-auto bg-white border border-[#E5E5DD] rounded-2xl">
        <table className="w-full text-sm table-fixed">
          <colgroup>
            <col style={{ width: colWidth }} />
            {OPERATING_MODELS.map(model => (
              <col key={model.id} style={{ width: colWidth }} />
            ))}
          </colgroup>
          <thead>
            <tr className="border-b border-[#E5E5DD]">
              <th className="text-left py-4 px-5 text-xs font-semibold uppercase tracking-wider text-[#7A7A7A]">
                Dimension
              </th>
              {OPERATING_MODELS.map(model => (
                <th key={model.id} className="text-left py-4 px-4 text-xs font-semibold uppercase tracking-wider text-black">
                  {model.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {COMPARISON_DIMENSIONS.map(dim => (
              <tr key={dim.key} className="border-b border-[#F5F5EB] hover:bg-[#FAFAF7] transition-colors">
                <td className="py-3.5 px-5">
                  <div className="font-medium text-black">{dim.label}</div>
                  <div className="text-xs text-[#B9B9AF] mt-0.5">{dim.description}</div>
                </td>
                {OPERATING_MODELS.map(model => (
                  <td key={model.id} className="py-3.5 px-4 align-top">
                    <CellValue value={model[dim.key]} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile: stacked cards */}
      <div className="block md:hidden space-y-4">
        {OPERATING_MODELS.map(model => (
          <div key={model.id} className="bg-white border border-[#E5E5DD] rounded-2xl overflow-hidden">
            <div className="py-3 px-5 border-b border-[#E5E5DD] bg-[#FAFAF7]">
              <h4 className="text-sm font-semibold uppercase tracking-wider text-black">{model.name}</h4>
            </div>
            <div className="divide-y divide-[#F5F5EB]">
              {COMPARISON_DIMENSIONS.map(dim => (
                <div key={dim.key} className="py-3 px-5 flex justify-between items-start gap-4">
                  <div className="min-w-0">
                    <div className="font-medium text-sm text-black">{dim.label}</div>
                    <div className="text-xs text-[#B9B9AF] mt-0.5">{dim.description}</div>
                  </div>
                  <div className="shrink-0 text-right">
                    <CellValue value={model[dim.key]} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
