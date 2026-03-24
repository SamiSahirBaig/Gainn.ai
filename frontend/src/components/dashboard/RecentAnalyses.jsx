import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import analysisService from '@/services/analysisService'

const FALLBACK = [
    { id: 1, land: 'Sample Farm 1', date: '2026-02-20', crops: ['Rice', 'Wheat', 'Jute'], status: 'completed' },
    { id: 2, land: 'Sample Farm 2', date: '2026-02-19', crops: ['Turmeric', 'Sugarcane'], status: 'completed' },
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
    const { t } = useTranslation()

    useEffect(() => {
        async function fetchRecent() {
            try {
                const res = await analysisService.listAnalyses({ limit: 5 })
                const data = res.data?.data || res.data || []
                if (data.length > 0) {
                    // Also try to fetch land names
                    let landMap = {}
                    try {
                        const api = (await import('@/services/api')).default
                        const landRes = await api.get('/api/v1/lands/?limit=20')
                        const lands = landRes.data || []
                        lands.forEach(l => { landMap[l.id] = l.name })
                    } catch { /* ignore */ }

                    setAnalyses(data.map(a => {
                        // Extract crops from results
                        const topRecs = a.results?.top_recommendations || []
                        const bestCrop = a.results?.best_crop
                        const cropNames = topRecs.length > 0
                            ? topRecs.slice(0, 3).map(r => r.name)
                            : bestCrop ? [bestCrop] : []

                        return {
                            id: a.id,
                            land: landMap[a.land_id] || `Analysis #${a.id}`,
                            date: a.created_at ? new Date(a.created_at).toLocaleDateString() : '—',
                            crops: cropNames,
                            status: a.status || 'completed',
                        }
                    }))
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
                <h3 className="font-semibold text-gray-900">{t('dashboard.recentAnalyses')}</h3>
                <Link to="/results" className="text-xs font-medium text-primary-600 hover:text-primary-700 transition-colors">
                    {t('dashboard.viewAll')}
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
                                    <div className="hidden sm:flex items-center gap-1.5 flex-wrap justify-end">
                                        {(item.crops || []).length > 0 ? item.crops.map((c, i) => (
                                            <span key={i} className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-primary-50 text-primary-700">
                                                {c}
                                            </span>
                                        )) : (
                                            <span className="text-xs text-gray-400">—</span>
                                        )}
                                    </div>
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
