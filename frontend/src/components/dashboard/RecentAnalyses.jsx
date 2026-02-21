import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import analysisService from '@/services/analysisService'

const FALLBACK = [
    { id: 1, land: 'Sample Farm 1', date: '2026-02-20', crop: 'Rice', status: 'Completed' },
    { id: 2, land: 'Sample Farm 2', date: '2026-02-19', crop: 'Wheat', status: 'Completed' },
]

const statusStyles = {
    completed: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    in_progress: 'bg-amber-50 text-amber-700 ring-amber-600/20',
    pending: 'bg-gray-50 text-gray-600 ring-gray-500/20',
    failed: 'bg-red-50 text-red-600 ring-red-600/20',
}

const statusLabels = {
    completed: 'Completed',
    in_progress: 'In Progress',
    pending: 'Pending',
    failed: 'Failed',
}

export default function RecentAnalyses() {
    const [analyses, setAnalyses] = useState(FALLBACK)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchRecent() {
            try {
                const res = await analysisService.listAnalyses({ limit: 5 })
                const data = res.data?.data || res.data || []
                if (data.length > 0) {
                    setAnalyses(data.map(a => ({
                        id: a.id,
                        land: a.land_name || a.location || `Analysis #${a.id}`,
                        date: a.created_at ? new Date(a.created_at).toLocaleDateString() : '—',
                        crop: a.top_crop || a.recommended_crop || '—',
                        status: a.status || 'completed',
                    })))
                }
            } catch (err) {
                console.warn('Could not fetch recent analyses:', err)
            } finally {
                setLoading(false)
            }
        }
        fetchRecent()
    }, [])

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Recent Analyses</h3>
                <Link to="/results" className="text-xs font-medium text-primary-600 hover:text-primary-700 transition-colors">
                    View all →
                </Link>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-8">
                    <div className="w-5 h-5 rounded-full border-2 border-primary-200 border-t-primary-500 animate-spin" />
                </div>
            ) : (
                <div className="divide-y divide-gray-50">
                    {analyses.map((item) => {
                        const st = item.status?.toLowerCase() || 'completed'
                        return (
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
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset ${statusStyles[st] || statusStyles.completed}`}>
                                        {statusLabels[st] || item.status}
                                    </span>
                                </div>
                            </div>
                        )
                    })}
                    {analyses.length === 0 && (
                        <div className="text-center py-8 text-sm text-gray-400">
                            No analyses yet. <Link to="/land-analysis" className="text-primary-600 font-medium">Start one →</Link>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
