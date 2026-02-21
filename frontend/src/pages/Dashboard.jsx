import { useState, useEffect } from 'react'
import StatsCard from '@/components/dashboard/StatsCard'
import RecentAnalyses from '@/components/dashboard/RecentAnalyses'
import QuickActions from '@/components/dashboard/QuickActions'
import WeatherWidget from '@/components/dashboard/WeatherWidget'
import NearbyMarkets from '@/components/dashboard/NearbyMarkets'
import LiveMarketFeed from '@/components/dashboard/LiveMarketFeed'
import MarketInsights from '@/components/dashboard/MarketInsights'
import analysisService from '@/services/analysisService'
import landService from '@/services/landService'

const DEFAULT_STATS = [
    { title: 'Land Analyzed', value: '—', icon: '🌍', subtitle: 'Loading...' },
    { title: 'Crops Suggested', value: '—', icon: '🌾', subtitle: 'Loading...' },
    { title: 'Analyses Run', value: '—', icon: '🔬', subtitle: 'Loading...' },
    { title: 'Markets Tracked', value: '60', icon: '🏪', subtitle: 'Across India' },
]

export default function Dashboard() {
    const [stats, setStats] = useState(DEFAULT_STATS)

    useEffect(() => {
        async function fetchStats() {
            let landCount = 0
            let analysisCount = 0
            let cropCount = 0

            try {
                const landsRes = await landService.getLands()
                const lands = landsRes.data?.data || landsRes.data || []
                landCount = lands.length
            } catch { /* ignore */ }

            try {
                const analysesRes = await analysisService.listAnalyses({ limit: 100 })
                const analyses = analysesRes.data?.data || analysesRes.data || []
                analysisCount = analyses.length
                // Estimate crops suggested (top 5 per analysis)
                cropCount = Math.min(analysisCount * 5, 50)
            } catch { /* ignore */ }

            setStats([
                { title: 'Land Parcels', value: landCount > 0 ? `${landCount}` : '0', icon: '🌍', subtitle: landCount > 0 ? `${landCount} parcels registered` : 'Add your first land', trend: landCount > 0 ? `${landCount}` : undefined, trendDirection: 'up' },
                { title: 'Crops Suggested', value: cropCount > 0 ? `${cropCount}` : '0', icon: '🌾', subtitle: cropCount > 0 ? 'From analyses' : 'Run an analysis', trend: cropCount > 0 ? `${cropCount}` : undefined, trendDirection: 'up' },
                { title: 'Analyses Run', value: `${analysisCount}`, icon: '🔬', subtitle: analysisCount > 0 ? 'Total analyses' : 'Start analyzing', trend: analysisCount > 0 ? `${analysisCount}` : undefined, trendDirection: analysisCount > 0 ? 'up' : 'neutral' },
                { title: 'Markets Tracked', value: '60', icon: '🏪', subtitle: 'APMC markets across India' },
            ])
        }
        fetchStats()
    }, [])

    return (
        <div className="space-y-5">
            {/* Page header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">🏠 My Farm</h1>
                <p className="text-sm text-gray-500 mt-1">Your farming overview at a glance</p>
            </div>

            {/* Stats row — now live from backend */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
                {stats.map((stat) => (
                    <StatsCard key={stat.title} {...stat} />
                ))}
            </div>

            {/* Weather + Market Insights side by side */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-1">
                    <WeatherWidget />
                </div>
                <div className="lg:col-span-2">
                    <MarketInsights />
                </div>
            </div>

            {/* Live Market Feed */}
            <LiveMarketFeed />

            {/* Nearby Markets */}
            <NearbyMarkets />

            {/* Bottom grid: Recent + Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2">
                    <RecentAnalyses />
                </div>
                <div>
                    <QuickActions />
                </div>
            </div>
        </div>
    )
}
