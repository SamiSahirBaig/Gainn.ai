const DEMAND_COLORS = {
    high: { bg: 'bg-emerald-50', text: 'text-emerald-700', ring: 'ring-emerald-200', dot: 'bg-emerald-500' },
    medium: { bg: 'bg-amber-50', text: 'text-amber-700', ring: 'ring-amber-200', dot: 'bg-amber-500' },
    low: { bg: 'bg-red-50', text: 'text-red-700', ring: 'ring-red-200', dot: 'bg-red-500' },
}

const SUPPLY_COLORS = {
    undersupply: { bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'Low Supply' },
    balanced: { bg: 'bg-amber-50', text: 'text-amber-700', label: 'Balanced' },
    oversupply: { bg: 'bg-red-50', text: 'text-red-700', label: 'Oversupply' },
}

const TREND_ICONS = { up: '↑', down: '↓', stable: '→' }
const TREND_COLORS = { up: 'text-emerald-600', down: 'text-red-500', stable: 'text-gray-400' }

const CROP_ICONS = {
    rice: '🌾', wheat: '🌿', sugarcane: '🎋', cotton: '🏵️', maize: '🌽',
    soybean: '🫘', potato: '🥔', tomato: '🍅', onion: '🧅', cabbage: '🥬',
    chickpea: '🫘', groundnut: '🥜', mustard: '🌻', turmeric: '🟡',
    banana: '🍌', mango: '🥭', orange: '🍊', jute: '🌿', sunflower: '🌻', lentil: '🫘',
}

export default function MarketCard({ market, compact = false, selected = false, onSelect }) {
    const topPrices = (market.prices || []).slice(0, compact ? 3 : 5)

    // Overall demand from demand_supply
    const dsEntries = Object.entries(market.demand_supply || {})
    const primaryDemand = dsEntries[0]?.[1]?.demand || 'medium'
    const primarySupply = dsEntries[0]?.[1]?.supply || 'balanced'
    const demandStyle = DEMAND_COLORS[primaryDemand] || DEMAND_COLORS.medium
    const supplyStyle = SUPPLY_COLORS[primarySupply] || SUPPLY_COLORS.balanced

    return (
        <div
            onClick={() => onSelect?.(market)}
            className={`bg-white rounded-2xl border p-4 transition-all duration-200 cursor-pointer ${selected
                    ? 'border-primary-400 ring-2 ring-primary-100 shadow-md'
                    : 'border-gray-100 hover:border-primary-200 hover:shadow-sm'
                }`}
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                        <span className="text-lg">🏪</span>
                        <h4 className="font-semibold text-gray-900 text-sm truncate">{market.name}</h4>
                    </div>
                    <p className="text-[11px] text-gray-400 mt-0.5 truncate">
                        {market.city}, {market.state} • {market.type}
                    </p>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                    <p className="text-sm font-bold text-primary-600">{market.distance_km} km</p>
                    <p className="text-[10px] text-gray-400">~{market.travel_time_min} min</p>
                </div>
            </div>

            {/* Crop prices */}
            {topPrices.length > 0 && (
                <div className="space-y-1 mb-2.5">
                    {topPrices.map(p => (
                        <div key={p.crop} className="flex items-center justify-between text-xs">
                            <span className="flex items-center gap-1 text-gray-600">
                                <span className="text-sm">{CROP_ICONS[p.crop?.toLowerCase()] || '🌱'}</span>
                                {p.crop}
                            </span>
                            <span className="flex items-center gap-1">
                                <span className="font-semibold text-gray-800 tabular-nums">
                                    ₹{(p.price_per_ton / 1000).toFixed(0)}k/t
                                </span>
                                <span className={`font-medium ${TREND_COLORS[p.trend] || ''}`}>
                                    {TREND_ICONS[p.trend] || ''} {Math.abs(p.trend_pct)}%
                                </span>
                            </span>
                        </div>
                    ))}
                </div>
            )}

            {/* Demand & supply badges */}
            <div className="flex items-center gap-1.5 pt-2 border-t border-gray-50">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded-full ring-1 ring-inset ${demandStyle.bg} ${demandStyle.text} ${demandStyle.ring}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${demandStyle.dot}`}></span>
                    {primaryDemand} demand
                </span>
                <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-medium rounded-full ${supplyStyle.bg} ${supplyStyle.text}`}>
                    {supplyStyle.label}
                </span>
                {market.rating > 0 && (
                    <span className="ml-auto text-[10px] text-gray-400">⭐ {market.rating}</span>
                )}
            </div>

            {/* Operating hours */}
            {!compact && market.operating_hours && (
                <p className="text-[10px] text-gray-400 mt-1.5">🕐 {market.operating_hours}</p>
            )}
        </div>
    )
}
