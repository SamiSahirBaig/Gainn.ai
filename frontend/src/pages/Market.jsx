import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import marketService from '@/services/marketService'
import TopRecommendedCrops from '@/components/market/TopRecommendedCrops'
import HighDemandCrops from '@/components/market/HighDemandCrops'
import LowDemandCrops from '@/components/market/LowDemandCrops'
import BestPriceCrops from '@/components/market/BestPriceCrops'
import BestMarkets from '@/components/market/BestMarkets'

// Fallback data
const FALLBACK = {
    top_recommended: [
        { name: 'Wheat', icon: '🌿', price: 2400, profit_per_acre: 30000, opportunity_score: 88, demand: 'high', trend: 'up', trend_label: 'Rising', reasons: ['Prices are rising', 'High market demand', 'Best season to grow (Rabi)'] },
        { name: 'Onion', icon: '🧅', price: 1400, profit_per_acre: 40000, opportunity_score: 85, demand: 'high', trend: 'up', trend_label: 'Rising', reasons: ['Prices are rising', 'High market demand'] },
        { name: 'Mustard', icon: '🌻', price: 4800, profit_per_acre: 26000, opportunity_score: 82, demand: 'high', trend: 'up', trend_label: 'Rising', reasons: ['Good profit potential', 'High market demand'] },
        { name: 'Tomato', icon: '🍅', price: 1500, profit_per_acre: 45000, opportunity_score: 79, demand: 'high', trend: 'stable', trend_label: 'Stable', reasons: ['High market demand', 'Good profit potential'] },
        { name: 'Lentil', icon: '🫘', price: 4500, profit_per_acre: 24000, opportunity_score: 76, demand: 'high', trend: 'stable', trend_label: 'Stable', reasons: ['High market demand', 'Best season to grow (Rabi)'] },
    ],
    high_demand: [
        { name: 'Rice', icon: '🌾', price: 2100, demand: 'high', trend: 'up', trend_label: 'Rising', tag: '🔥 Hot', tip: 'Rice — sell now for best prices!' },
        { name: 'Wheat', icon: '🌿', price: 2400, demand: 'high', trend: 'up', trend_label: 'Rising', tag: '🔥 Hot', tip: 'Wheat — sell now for best prices!' },
        { name: 'Onion', icon: '🧅', price: 1400, demand: 'high', trend: 'up', trend_label: 'Rising', tag: '🔥 Hot', tip: 'Onion — sell now for best prices!' },
    ],
    low_demand: [
        { name: 'Cotton', icon: '🏵️', price: 5600, trend: 'down', trend_label: 'Falling', tag: '⚠️ Oversupply', reason: 'Prices falling — wait before selling' },
        { name: 'Cabbage', icon: '🥬', price: 1000, trend: 'down', trend_label: 'Falling', tag: '❄️ Low Demand', reason: 'Low demand — consider alternative crops' },
    ],
    best_prices: [
        { name: 'Turmeric', icon: '🟡', price: 8500, change_pct: 6.1, trend: 'up', tip: 'Price at peak — sell now!' },
        { name: 'Cotton', icon: '🏵️', price: 5600, change_pct: -2.1, trend: 'down', tip: 'Stable price' },
        { name: 'Mustard', icon: '🌻', price: 4800, change_pct: 2.8, trend: 'up', tip: 'Good price — consider selling' },
    ],
    best_markets: [],
    season: 'Rabi',
}

export default function Market() {
    const [data, setData] = useState(FALLBACK)
    const [loading, setLoading] = useState(true)
    const { t } = useTranslation()

    useEffect(() => {
        async function fetchIntelligence() {
            try {
                let lat = 20.0, lng = 78.0
                try {
                    const stored = localStorage.getItem('gainnai_latest_land')
                    if (stored) {
                        const land = JSON.parse(stored)
                        if (land.latitude) lat = land.latitude
                        if (land.longitude) lng = land.longitude
                    }
                } catch { /* ignore */ }

                const res = await marketService.getIntelligence(lat, lng)
                if (res.data) setData(res.data)
            } catch (err) {
                console.warn('Intelligence fetch failed, using fallback:', err)
            } finally {
                setLoading(false)
            }
        }
        fetchIntelligence()
    }, [])

    return (
        <div className="space-y-5">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{t('market.title')}</h1>
                <p className="text-sm text-gray-500 mt-1">
                    {t('market.subtitle')}
                </p>
                {data.season && (
                    <span className="inline-flex items-center gap-1 mt-2 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full">
                        🌱 {t('market.currentSeason')}: {data.season}
                    </span>
                )}
            </div>

            {/* Loading */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="w-8 h-8 rounded-full border-3 border-primary-200 border-t-primary-500 animate-spin" />
                </div>
            ) : (
                <>
                    {/* Section 1: Top 5 */}
                    <TopRecommendedCrops crops={data.top_recommended || []} />

                    {/* Sections 2+3: High + Low Demand */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <HighDemandCrops crops={data.high_demand || []} />
                        <LowDemandCrops crops={data.low_demand || []} />
                    </div>

                    {/* Sections 4+5: Best Prices + Best Markets */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <BestPriceCrops crops={data.best_prices || []} />
                        <BestMarkets markets={data.best_markets || []} />
                    </div>
                </>
            )}
        </div>
    )
}
