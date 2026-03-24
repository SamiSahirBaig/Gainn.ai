import SuitabilityScore from './SuitabilityScore'

// Suitability to stars
const starsFor = (score) => {
    if (score >= 90) return '⭐⭐⭐⭐⭐'
    if (score >= 75) return '⭐⭐⭐⭐'
    if (score >= 60) return '⭐⭐⭐'
    if (score >= 40) return '⭐⭐'
    return '⭐'
}

const matchLabel = (score) => {
    if (score >= 90) return { text: 'Best Match!', bg: 'bg-emerald-100', color: 'text-emerald-700' }
    if (score >= 75) return { text: 'Great Match', bg: 'bg-emerald-50', color: 'text-emerald-600' }
    if (score >= 60) return { text: 'Good Match', bg: 'bg-amber-50', color: 'text-amber-600' }
    return { text: 'Fair Match', bg: 'bg-gray-50', color: 'text-gray-500' }
}

const borderColor = (score) => {
    if (score >= 85) return 'border-l-emerald-400'
    if (score >= 65) return 'border-l-amber-400'
    return 'border-l-gray-300'
}

export default function CropCard({ crop, rank, onViewDetails }) {
    const {
        name, icon, suitability, yield: yieldVal, profit,
        season, description, revenue, totalCost, roi,
        marketInfo,
    } = crop

    const match = matchLabel(suitability)
    const stars = starsFor(suitability)

    // "Why this crop?"  checklist
    const reasons = []
    if (suitability >= 70) reasons.push({ ok: true, text: 'Good for your land' })
    else reasons.push({ ok: false, text: 'Not ideal for your land' })

    if (marketInfo?.demand === 'high') reasons.push({ ok: true, text: 'High market demand' })
    else if (marketInfo?.demand === 'medium') reasons.push({ ok: true, text: 'Moderate market demand' })
    else reasons.push({ ok: false, text: 'Low market demand' })

    if (season) reasons.push({ ok: true, text: `Best season: ${season}` })
    if (roi > 50) reasons.push({ ok: true, text: 'Very profitable' })
    else if (roi > 20) reasons.push({ ok: true, text: 'Profitable' })

    return (
        <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 border-l-4 ${borderColor(suitability)} p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group relative`}>
            {/* Top: Icon + Name + Rank */}
            <div className="flex items-center gap-3 mb-3">
                <div className="w-14 h-14 rounded-xl bg-primary-50 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                    {icon}
                </div>
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-gray-900">{name}</h3>
                        {rank <= 3 && (
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${rank === 1 ? 'bg-amber-100 text-amber-700' :
                                    rank === 2 ? 'bg-gray-100 text-gray-600' :
                                        'bg-orange-50 text-orange-600'
                                }`}>
                                #{rank}
                            </span>
                        )}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{season}</p>
                </div>
            </div>

            {/* Stars + Match label */}
            <div className="flex items-center gap-2 mb-3">
                <span className="text-base tracking-wide">{stars}</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${match.bg} ${match.color}`}>
                    {match.text}
                </span>
            </div>

            {/* BIG profit number */}
            <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-xl p-4 mb-3 text-center">
                <p className="text-xs text-gray-500 font-medium mb-1">💰 Estimated Profit</p>
                <p className="text-3xl font-extrabold text-emerald-700 tracking-tight">
                    ₹{(profit || 0).toLocaleString('en-IN')}
                </p>
                {yieldVal && (
                    <p className="text-xs text-gray-400 mt-1">Yield: {yieldVal} tonnes/hectare</p>
                )}
            </div>

            {/* Simple revenue vs cost bar */}
            {revenue > 0 && totalCost > 0 && (
                <div className="mb-3">
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                        <span className="text-emerald-600 font-medium">💚 Revenue ₹{revenue.toLocaleString('en-IN')}</span>
                        <span className="text-red-400 font-medium">💸 Cost ₹{totalCost.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="w-full h-3 rounded-full bg-red-100 overflow-hidden">
                        <div
                            className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all duration-700"
                            style={{ width: `${Math.min(100, (revenue / (revenue + totalCost)) * 100)}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Why this crop — checklist */}
            <div className="space-y-1.5 mb-3">
                {reasons.slice(0, 4).map((r, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                        <span className={r.ok ? 'text-emerald-500' : 'text-red-400'}>
                            {r.ok ? '✅' : '❌'}
                        </span>
                        <span className="text-gray-600">{r.text}</span>
                    </div>
                ))}
            </div>

            {/* View Details button */}
            {onViewDetails && (
                <button
                    type="button"
                    onClick={() => onViewDetails(name)}
                    className="w-full py-3 text-sm font-bold text-primary-600 bg-primary-50 rounded-xl hover:bg-primary-100 transition-colors"
                >
                    See Details →
                </button>
            )}
        </div>
    )
}
