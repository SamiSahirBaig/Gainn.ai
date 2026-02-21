export default function OpportunityCard({ crop, reason, profit, urgency = 'medium' }) {
    const urgencyStyle = {
        high: 'border-green-200 bg-green-50/50',
        medium: 'border-amber-200 bg-amber-50/50',
        low: 'border-gray-200 bg-gray-50/50',
    }
    const urgencyBadge = {
        high: { bg: 'bg-green-100 text-green-700', label: '🟢 Act Now' },
        medium: { bg: 'bg-amber-100 text-amber-700', label: '🟡 Good Time' },
        low: { bg: 'bg-gray-100 text-gray-500', label: '⚪ Monitor' },
    }
    const badge = urgencyBadge[urgency] || urgencyBadge.medium

    return (
        <div className={`rounded-2xl border p-5 ${urgencyStyle[urgency]} transition-all hover:shadow-md`}>
            <div className="flex items-start justify-between mb-3">
                <h4 className="text-sm font-bold text-gray-900">{crop}</h4>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${badge.bg}`}>{badge.label}</span>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed mb-3">{reason}</p>
            <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Est. Profit</span>
                <span className="text-sm font-bold text-green-600">₹{(profit || 0).toLocaleString('en-IN')}/ha</span>
            </div>
        </div>
    )
}
