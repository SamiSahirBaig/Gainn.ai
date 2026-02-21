/**
 * CostBreakdown — horizontal bar chart showing cost categories.
 *
 * Props:
 *  - costs: { seeds: 3000, fertilizer: 8000, ... }
 *  - totalCost: number
 *  - currency: string (default "₹")
 */

const COST_LABELS = {
    seeds: { label: 'Seeds', color: '#10b981' },
    fertilizer: { label: 'Fertilizer', color: '#3b82f6' },
    pesticide: { label: 'Pesticide', color: '#f59e0b' },
    irrigation: { label: 'Irrigation', color: '#06b6d4' },
    labor: { label: 'Labor', color: '#8b5cf6' },
    sowing: { label: 'Sowing', color: '#ec4899' },
    harvesting: { label: 'Harvesting', color: '#ef4444' },
    equipment: { label: 'Equipment', color: '#64748b' },
    transport: { label: 'Transport', color: '#f97316' },
    storage: { label: 'Storage', color: '#14b8a6' },
    misc: { label: 'Miscellaneous', color: '#a1a1aa' },
}

export default function CostBreakdown({ costs, totalCost, currency = '₹' }) {
    if (!costs || Object.keys(costs).length === 0) return null

    const total = totalCost || Object.values(costs).reduce((s, v) => s + v, 0)
    const entries = Object.entries(costs)
        .filter(([, v]) => v > 0)
        .sort((a, b) => b[1] - a[1])

    return (
        <div className="space-y-2.5">
            {entries.map(([key, value]) => {
                const meta = COST_LABELS[key] || { label: key, color: '#a1a1aa' }
                const pct = total > 0 ? ((value / total) * 100) : 0
                return (
                    <div key={key}>
                        <div className="flex items-center justify-between text-xs mb-0.5">
                            <span className="text-gray-600 font-medium">{meta.label}</span>
                            <span className="text-gray-800 font-semibold">
                                {currency}{value.toLocaleString('en-IN')}
                                <span className="text-gray-400 font-normal ml-1">({pct.toFixed(0)}%)</span>
                            </span>
                        </div>
                        <div className="w-full h-2.5 rounded-full bg-gray-100 overflow-hidden">
                            <div
                                className="h-full rounded-full transition-all duration-700"
                                style={{ width: `${pct}%`, backgroundColor: meta.color }}
                            />
                        </div>
                    </div>
                )
            })}
            <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-sm font-bold">
                <span className="text-gray-700">Total Cost / hectare</span>
                <span className="text-gray-900">{currency}{total.toLocaleString('en-IN')}</span>
            </div>
        </div>
    )
}
