const LEVELS = {
    high: { bg: 'bg-green-50', text: 'text-green-700', bar: 'bg-green-500', emoji: '🔥', label: 'High Demand' },
    medium: { bg: 'bg-amber-50', text: 'text-amber-700', bar: 'bg-amber-400', emoji: '📊', label: 'Moderate' },
    low: { bg: 'bg-gray-50', text: 'text-gray-500', bar: 'bg-gray-300', emoji: '📉', label: 'Low Demand' },
}

export default function DemandIndicator({ cropName, demand = 'medium', season = 'Kharif' }) {
    const cfg = LEVELS[demand] || LEVELS.medium
    const barCount = demand === 'high' ? 5 : demand === 'medium' ? 3 : 1

    return (
        <div className={`rounded-xl p-4 ${cfg.bg} flex items-center gap-4`}>
            <span className="text-2xl">{cfg.emoji}</span>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{cropName}</p>
                <p className={`text-xs font-medium ${cfg.text}`}>{cfg.label}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">Peak: {season} season</p>
            </div>
            <div className="flex gap-0.5 items-end h-5">
                {[1, 2, 3, 4, 5].map(i => (
                    <div
                        key={i}
                        className={`w-1.5 rounded-full transition-all ${i <= barCount ? cfg.bar : 'bg-gray-200'}`}
                        style={{ height: `${i * 4}px` }}
                    />
                ))}
            </div>
        </div>
    )
}
