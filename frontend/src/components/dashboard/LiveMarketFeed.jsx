import { useState, useEffect, useCallback } from 'react'
import marketService from '@/services/marketService'

const TREND_STYLES = {
    up: { color: 'text-emerald-600', bg: 'bg-emerald-50', arrow: '↑', dot: '🟢' },
    down: { color: 'text-red-500', bg: 'bg-red-50', arrow: '↓', dot: '🔴' },
    stable: { color: 'text-gray-500', bg: 'bg-gray-50', arrow: '→', dot: '⚪' },
}

const FALLBACK_CROPS = [
    { name: 'Rice', icon: '🌾', price: 2100, change_pct: 3.2, trend: 'up', trend_label: 'Rising', demand: 'high', unit: 'quintal' },
    { name: 'Wheat', icon: '🌿', price: 2400, change_pct: 1.5, trend: 'up', trend_label: 'Rising', demand: 'high', unit: 'quintal' },
    { name: 'Tomato', icon: '🍅', price: 1500, change_pct: -8.3, trend: 'down', trend_label: 'Falling', demand: 'high', unit: 'quintal' },
    { name: 'Onion', icon: '🧅', price: 1400, change_pct: 5.7, trend: 'up', trend_label: 'Rising', demand: 'high', unit: 'quintal' },
    { name: 'Potato', icon: '🥔', price: 1200, change_pct: 0.5, trend: 'stable', trend_label: 'Stable', demand: 'medium', unit: 'quintal' },
    { name: 'Cotton', icon: '🏵️', price: 5600, change_pct: -2.1, trend: 'down', trend_label: 'Falling', demand: 'medium', unit: 'quintal' },
    { name: 'Soybean', icon: '🫘', price: 3900, change_pct: 4.2, trend: 'up', trend_label: 'Rising', demand: 'medium', unit: 'quintal' },
    { name: 'Mustard', icon: '🌻', price: 4800, change_pct: 2.8, trend: 'up', trend_label: 'Rising', demand: 'high', unit: 'quintal' },
    { name: 'Maize', icon: '🌽', price: 1900, change_pct: -1.2, trend: 'stable', trend_label: 'Stable', demand: 'medium', unit: 'quintal' },
    { name: 'Turmeric', icon: '🟡', price: 8500, change_pct: 6.1, trend: 'up', trend_label: 'Rising', demand: 'medium', unit: 'quintal' },
]

export default function LiveMarketFeed() {
    const [crops, setCrops] = useState(FALLBACK_CROPS)
    const [loading, setLoading] = useState(true)
    const [lastUpdated, setLastUpdated] = useState(null)
    const [dataSource, setDataSource] = useState('estimated')
    const [expanded, setExpanded] = useState(false)

    const fetchPrices = useCallback(async () => {
        try {
            const res = await marketService.getLivePrices()
            const data = res.data
            if (data?.crops?.length > 0) {
                setCrops(data.crops)
                setDataSource(data.data_source || 'estimated')
            }
        } catch (err) {
            console.warn('Live prices fetch failed:', err)
        } finally {
            setLoading(false)
            setLastUpdated(new Date())
        }
    }, [])

    useEffect(() => { fetchPrices() }, [fetchPrices])

    // Auto-refresh every 5 minutes
    useEffect(() => {
        const interval = setInterval(fetchPrices, 5 * 60 * 1000)
        return () => clearInterval(interval)
    }, [fetchPrices])

    const visibleCrops = expanded ? crops : crops.slice(0, 6)

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        📈 Live Market Prices
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                        {dataSource === 'AGMARKNET' ? '🟢 Live from AGMARKNET' : '🟡 Estimated prices'}
                        {lastUpdated && ` • Updated ${lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                    </p>
                </div>
                <button
                    onClick={fetchPrices}
                    className="text-sm text-gray-400 hover:text-primary-500 transition-colors px-3 py-1.5 rounded-lg hover:bg-primary-50"
                    title="Refresh prices"
                >
                    🔄 Refresh
                </button>
            </div>

            {/* Crop prices grid */}
            {loading ? (
                <div className="flex items-center justify-center py-8">
                    <div className="w-6 h-6 rounded-full border-2 border-primary-200 border-t-primary-500 animate-spin" />
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                        {visibleCrops.map(crop => {
                            const style = TREND_STYLES[crop.trend] || TREND_STYLES.stable
                            return (
                                <div
                                    key={crop.name}
                                    className={`flex items-center gap-3 px-3.5 py-3 rounded-xl border transition-all hover:shadow-sm ${crop.trend === 'up' ? 'border-emerald-100 hover:border-emerald-200' :
                                            crop.trend === 'down' ? 'border-red-100 hover:border-red-200' :
                                                'border-gray-100 hover:border-gray-200'
                                        }`}
                                >
                                    <span className="text-2xl flex-shrink-0">{crop.icon}</span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-gray-900 truncate">{crop.name}</p>
                                        <p className="text-base font-bold text-gray-800 tabular-nums">
                                            ₹{crop.price?.toLocaleString()}<span className="text-[10px] text-gray-400 font-normal">/{crop.unit || 'q'}</span>
                                        </p>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                        <p className={`text-sm font-bold ${style.color} tabular-nums`}>
                                            {style.arrow} {Math.abs(crop.change_pct)}%
                                        </p>
                                        <p className={`text-[10px] ${style.color}`}>{crop.trend_label}</p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    {/* Show more/less */}
                    {crops.length > 6 && (
                        <button
                            onClick={() => setExpanded(!expanded)}
                            className="w-full mt-3 py-2 text-xs text-gray-400 hover:text-primary-500 transition-colors rounded-lg hover:bg-gray-50"
                        >
                            {expanded ? '▲ Show less' : `▼ Show all ${crops.length} crops`}
                        </button>
                    )}
                </>
            )}
        </div>
    )
}
