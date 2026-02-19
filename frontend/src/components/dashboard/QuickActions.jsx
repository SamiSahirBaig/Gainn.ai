import { Link } from 'react-router-dom'

const actions = [
    {
        label: 'New Analysis',
        description: 'Analyze a new land parcel',
        icon: '🔬',
        to: '/land-analysis',
        gradient: 'from-primary-500 to-emerald-500',
    },
    {
        label: 'View Reports',
        description: 'Check past analysis reports',
        icon: '📋',
        to: '#',
        gradient: 'from-blue-500 to-cyan-500',
    },
    {
        label: 'Market Prices',
        description: 'Live crop market data',
        icon: '💰',
        to: '#',
        gradient: 'from-amber-500 to-orange-500',
    },
    {
        label: 'Weather Forecast',
        description: 'Check local weather',
        icon: '🌤️',
        to: '#',
        gradient: 'from-violet-500 to-purple-500',
    },
]

export default function QuickActions() {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
                {actions.map((action) => (
                    <Link
                        key={action.label}
                        to={action.to}
                        className="group relative p-4 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 overflow-hidden"
                    >
                        {/* Hover gradient overlay */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />

                        <span className="text-2xl block mb-2 group-hover:scale-110 transition-transform">{action.icon}</span>
                        <p className="text-sm font-semibold text-gray-900">{action.label}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{action.description}</p>
                    </Link>
                ))}
            </div>
        </div>
    )
}
