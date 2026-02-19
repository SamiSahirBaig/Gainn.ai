const mockAnalyses = [
    { id: 1, land: 'Green Valley Farm', date: '2026-02-18', crop: 'Rice', status: 'Completed' },
    { id: 2, land: 'Hilltop Estate', date: '2026-02-17', crop: 'Wheat', status: 'Completed' },
    { id: 3, land: 'Riverside Plot', date: '2026-02-16', crop: 'Sugarcane', status: 'In Progress' },
    { id: 4, land: 'Sunrise Acres', date: '2026-02-15', crop: 'Cotton', status: 'Pending' },
    { id: 5, land: 'Mountain View', date: '2026-02-14', crop: 'Maize', status: 'Completed' },
]

const statusStyles = {
    Completed: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    'In Progress': 'bg-amber-50 text-amber-700 ring-amber-600/20',
    Pending: 'bg-gray-50 text-gray-600 ring-gray-500/20',
}

export default function RecentAnalyses() {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Recent Analyses</h3>
                <a href="#" className="text-xs font-medium text-primary-600 hover:text-primary-700 transition-colors">
                    View all →
                </a>
            </div>

            <div className="divide-y divide-gray-50">
                {mockAnalyses.map((item) => (
                    <div
                        key={item.id}
                        className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50/50 transition-colors"
                    >
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="w-9 h-9 rounded-lg bg-primary-50 flex items-center justify-center text-sm flex-shrink-0">
                                🌾
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">{item.land}</p>
                                <p className="text-xs text-gray-400">{item.date}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                            <span className="hidden sm:inline text-sm text-gray-600">{item.crop}</span>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset ${statusStyles[item.status]}`}>
                                {item.status}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
