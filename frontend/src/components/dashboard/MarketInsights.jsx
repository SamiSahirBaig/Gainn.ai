import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import marketService from '@/services/marketService'

const FALLBACK_INSIGHTS = {
    hot_crops: [
        { name: 'Onion', icon: '🧅', tip: 'Onion prices are rising — sell now!' },
        { name: 'Wheat', icon: '🌿', tip: 'Wheat prices are good — consider selling' },
    ],
    cold_crops: [
        { name: 'Cotton', icon: '🏵️', tip: 'Cotton prices are falling — wait to sell' },
        { name: 'Tomato', icon: '🍅', tip: 'Tomato prices are low — hold if possible' },
    ],
    best_prices: [
        { name: 'Turmeric', icon: '🟡', price: 8500, unit: 'quintal' },
        { name: 'Cotton', icon: '🏵️', price: 5600, unit: 'quintal' },
        { name: 'Mustard', icon: '🌻', price: 4800, unit: 'quintal' },
    ],
    opportunities: [
        { name: 'Rice', icon: '🌾', reason: 'High demand for Rice and prices rising' },
        { name: 'Wheat', icon: '🌿', reason: 'High demand for Wheat' },
    ],
    summary: 'Mixed market. Onion prices are up, Cotton prices are down.',
}

export default function MarketInsights() {
    const [insights, setInsights] = useState(FALLBACK_INSIGHTS)
    const [loading, setLoading] = useState(true)
    const { t } = useTranslation()

    useEffect(() => {
        async function fetchInsights() {
            try {
                const res = await marketService.getInsights()
                if (res.data) setInsights(res.data)
            } catch (err) {
                console.warn('Insights fetch failed:', err)
            } finally {
                setLoading(false)
            }
        }
        fetchInsights()
    }, [])

    if (loading) {
        return (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-center justify-center py-6">
                    <div className="w-5 h-5 rounded-full border-2 border-primary-200 border-t-primary-500 animate-spin" />
                </div>
            </div>
        )
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                {t('insights.title')}
            </h3>

            {/* Summary */}
            {insights.summary && (
                <p className="text-sm text-gray-600 bg-gray-50 rounded-xl px-4 py-2.5 mb-4">
                    {insights.summary}
                </p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Sell Now */}
                {insights.hot_crops?.length > 0 && (
                    <div className="bg-emerald-50/50 rounded-xl p-3.5 border border-emerald-100">
                        <p className="text-sm font-bold text-emerald-700 mb-2">{t('insights.sellNow')}</p>
                        <div className="space-y-2">
                            {insights.hot_crops.map((c, i) => (
                                <div key={i} className="flex items-start gap-2">
                                    <span className="text-lg">{c.icon}</span>
                                    <p className="text-xs text-emerald-700">{c.tip}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Wait */}
                {insights.cold_crops?.length > 0 && (
                    <div className="bg-red-50/50 rounded-xl p-3.5 border border-red-100">
                        <p className="text-sm font-bold text-red-600 mb-2">{t('insights.waitToSell')}</p>
                        <div className="space-y-2">
                            {insights.cold_crops.map((c, i) => (
                                <div key={i} className="flex items-start gap-2">
                                    <span className="text-lg">{c.icon}</span>
                                    <p className="text-xs text-red-600">{c.tip}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Best Prices */}
            {insights.best_prices?.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs font-bold text-gray-500 uppercase mb-2">{t('insights.highestPrices')}</p>
                    <div className="flex gap-3">
                        {insights.best_prices.map((c, i) => (
                            <div key={i} className="flex items-center gap-1.5 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100">
                                <span className="text-base">{c.icon}</span>
                                <span className="text-xs font-bold text-amber-700">₹{c.price?.toLocaleString()}/{c.unit === 'quintal' ? 'q' : c.unit}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Opportunities */}
            {insights.opportunities?.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs font-bold text-gray-500 uppercase mb-2">{t('insights.goodOpportunities')}</p>
                    <div className="space-y-1.5">
                        {insights.opportunities.map((c, i) => (
                            <div key={i} className="flex items-center gap-2 text-xs text-gray-600">
                                <span>{c.icon}</span>
                                <span>{c.reason}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
