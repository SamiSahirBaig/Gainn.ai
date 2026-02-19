const trendColors = {
    up: 'text-emerald-600 bg-emerald-50',
    down: 'text-red-600 bg-red-50',
    neutral: 'text-gray-600 bg-gray-50',
}

const trendArrows = {
    up: '↑',
    down: '↓',
    neutral: '→',
}

export default function StatsCard({ title, value, icon, trend, trendDirection = 'up', subtitle }) {
    return (
        <div className="relative bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 overflow-hidden group">
            {/* Accent gradient bar */}
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary-400 to-primary-600 rounded-l-2xl" />

            <div className="flex items-start justify-between">
                <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-500">{title}</p>
                    <p className="text-2xl font-bold text-gray-900 tracking-tight">{value}</p>
                    {subtitle && (
                        <p className="text-xs text-gray-400">{subtitle}</p>
                    )}
                </div>
                <div className="w-11 h-11 rounded-xl bg-primary-50 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                    {icon}
                </div>
            </div>

            {trend && (
                <div className="mt-3 flex items-center gap-1.5">
                    <span className={`inline-flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full ${trendColors[trendDirection]}`}>
                        {trendArrows[trendDirection]} {trend}
                    </span>
                    <span className="text-xs text-gray-400">vs last month</span>
                </div>
            )}
        </div>
    )
}
