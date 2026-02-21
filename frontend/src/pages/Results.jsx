import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import CropCard from '@/components/results/CropCard'
import YieldChart from '@/components/results/YieldChart'
import ProfitComparison from '@/components/results/ProfitComparison'
import ResourceSchedule from '@/components/results/ResourceSchedule'
import analysisService from '@/services/analysisService'

const FALLBACK_CROPS = [
    { name: 'Rice (Basmati)', icon: '🌾', suitability: 92, yield: 6.8, profit: 72000, season: 'Kharif (Jun–Nov)', description: 'Excellent match for your alluvial soil with high moisture retention and moderate rainfall.' },
    { name: 'Wheat', icon: '🌿', suitability: 85, yield: 5.2, profit: 58000, season: 'Rabi (Nov–Apr)', description: 'Strong fit given your soil pH and temperature range. Good winter crop rotation option.' },
    { name: 'Sugarcane', icon: '🎋', suitability: 78, yield: 45.0, profit: 95000, season: 'Year-round', description: 'High profit potential with your irrigation setup. Requires sustained water supply.' },
    { name: 'Cotton', icon: '🏵️', suitability: 64, yield: 2.1, profit: 48000, season: 'Kharif (Apr–Oct)', description: 'Moderate suitability. Consider if your soil drainage supports cotton root development.' },
    { name: 'Maize', icon: '🌽', suitability: 58, yield: 4.5, profit: 35000, season: 'Kharif/Rabi', description: 'Decent yield potential but profit margins are lower than top recommendations.' },
]

const CROP_ICONS = { rice: '🌾', wheat: '🌿', sugarcane: '🎋', cotton: '🏵️', maize: '🌽', soybean: '🫘', potato: '🥔', tomato: '🍅', lentil: '🫘', mustard: '🌻', turmeric: '🟡', groundnut: '🥜', millet: '🌾', sorghum: '🌿', barley: '🌿', chickpea: '🫘', sunflower: '🌻', onion: '🧅', banana: '🍌', coconut: '🥥' }

function mapAnalysisTocrops(recommendations) {
    return recommendations.map(r => ({
        name: r.name,
        icon: CROP_ICONS[r.name?.toLowerCase()] || '🌱',
        suitability: Math.round(r.suitability_score || 0),
        yield: parseFloat((r.predicted_yield || 0).toFixed(1)),
        profit: Math.round(r.estimated_profit || 0),
        season: '—',
        description: r.breakdown
            ? `Soil: ${Math.round(r.breakdown.soil || 0)}% | Climate: ${Math.round(r.breakdown.climate || 0)}% | Resource: ${Math.round(r.breakdown.resource || 0)}%`
            : 'Based on land suitability analysis.',
    }))
}

export default function Results() {
    const navigate = useNavigate()
    const [crops, setCrops] = useState(null)
    const [loading, setLoading] = useState(true)
    const [analysisId, setAnalysisId] = useState(null)
    const [error, setError] = useState(null)

    useEffect(() => {
        async function fetchResults() {
            try {
                // Check for stored analysis ID
                const stored = localStorage.getItem('gainnai_latest_analysis')
                if (stored) {
                    const { id } = JSON.parse(stored)
                    setAnalysisId(id)

                    const res = await analysisService.getRecommendations(id)
                    const data = res.data
                    if (data?.recommendations?.length > 0) {
                        setCrops(mapAnalysisTocrops(data.recommendations))
                    } else {
                        setCrops(FALLBACK_CROPS)
                    }
                } else {
                    // No analysis yet → try to list user's latest
                    const res = await analysisService.listAnalyses({ limit: 1, status: 'completed' })
                    const analyses = res.data?.data || res.data || []
                    if (analyses.length > 0) {
                        const latest = analyses[0]
                        setAnalysisId(latest.id)
                        const recRes = await analysisService.getRecommendations(latest.id)
                        const data = recRes.data
                        if (data?.recommendations?.length > 0) {
                            setCrops(mapAnalysisTocrops(data.recommendations))
                        } else {
                            setCrops(FALLBACK_CROPS)
                        }
                    } else {
                        setCrops(FALLBACK_CROPS)
                    }
                }
            } catch (err) {
                console.warn('Could not fetch analysis results, using demo data:', err)
                setCrops(FALLBACK_CROPS)
            } finally {
                setLoading(false)
            }
        }
        fetchResults()
    }, [])

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="text-center space-y-3">
                    <div className="w-12 h-12 mx-auto rounded-full border-4 border-primary-200 border-t-primary-500 animate-spin" />
                    <p className="text-sm text-gray-500">Loading analysis results…</p>
                </div>
            </div>
        )
    }

    const displayCrops = crops || FALLBACK_CROPS

    return (
        <div className="space-y-6">
            {/* Page header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Analysis Results</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        {analysisId
                            ? `Analysis #${analysisId} — top crop recommendations for your land.`
                            : 'Based on your land parameters — here are the top crop recommendations.'}
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => navigate('/land-analysis')}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-500 text-white rounded-xl text-sm font-medium hover:bg-primary-600 transition-colors shadow-sm shadow-primary-500/20"
                    >
                        + New Analysis
                    </button>
                    <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:shadow-sm transition-all">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Download Report
                    </button>
                </div>
            </div>

            {/* Summary bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-gradient-to-br from-primary-500 to-emerald-500 rounded-xl p-4 text-white">
                    <p className="text-xs font-medium text-white/80">Top Crop</p>
                    <p className="text-lg font-bold mt-0.5">{displayCrops[0].name}</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-100">
                    <p className="text-xs font-medium text-gray-400">Best Suitability</p>
                    <p className="text-lg font-bold text-primary-600 mt-0.5">{displayCrops[0].suitability}%</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-100">
                    <p className="text-xs font-medium text-gray-400">Highest Yield</p>
                    <p className="text-lg font-bold text-emerald-600 mt-0.5">{Math.max(...displayCrops.map(c => c.yield))} t/ha</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-100">
                    <p className="text-xs font-medium text-gray-400">Max Profit</p>
                    <p className="text-lg font-bold text-blue-600 mt-0.5">₹{Math.max(...displayCrops.map(c => c.profit)).toLocaleString('en-IN')}</p>
                </div>
            </div>

            {/* Crop cards */}
            <div>
                <h2 className="font-semibold text-gray-900 mb-3">🌾 Recommended Crops</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {displayCrops.map((crop, i) => (
                        <CropCard key={crop.name} crop={crop} rank={i + 1} />
                    ))}
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <YieldChart crops={displayCrops} />
                <ProfitComparison crops={displayCrops} />
            </div>

            {/* Resource Schedule */}
            <ResourceSchedule />
        </div>
    )
}
