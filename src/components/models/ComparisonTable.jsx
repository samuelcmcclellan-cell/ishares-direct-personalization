import { OPERATING_MODELS, COMPARISON_DIMENSIONS } from '../../data/models'
import { Badge } from '../shared/Badge'

export function ComparisonTable() {
  const colCount = OPERATING_MODELS.length + 1
  const modelWidth = `${Math.floor(75 / OPERATING_MODELS.length)}%`

  return (
    <div className="mt-16">
      <h3 className="text-xl font-semibold mb-6">Side-by-Side Comparison</h3>
      <div className="overflow-x-auto bg-white border border-[#E5E5DD] rounded-2xl">
        <table className="w-full text-sm table-fixed">
          <colgroup>
            <col style={{ width: '25%' }} />
            {OPERATING_MODELS.map(model => (
              <col key={model.id} style={{ width: modelWidth }} />
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
                  <td key={model.id} className="py-3.5 px-4">
                    <Badge>{model[dim.key]}</Badge>
                  </td>
                ))}
              </tr>
            ))}
            <tr className="hover:bg-[#FAFAF7] transition-colors">
              <td className="py-3.5 px-5">
                <div className="font-medium text-black">ETF Types</div>
                <div className="text-xs text-[#B9B9AF] mt-0.5">Products used</div>
              </td>
              {OPERATING_MODELS.map(model => (
                <td key={model.id} className="py-3.5 px-4">
                  <span className="text-xs text-[#4A4A4A]">{model.etfTypes[0]}</span>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
