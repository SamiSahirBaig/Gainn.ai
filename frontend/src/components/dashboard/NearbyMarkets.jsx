import { useState, useEffect, useCallback } from 'react'
import MarketCard from './MarketCard'
import MarketMap from './MarketMap'
import marketService from '@/services/marketService'

const RADIUS_OPTIONS = [25, 50, 100, 200]
const SORT_OPTIONS = [
    { value: 'distance', label: '📍 Nearest' },
    { value: 'best_price', label: '💰 Best Price' },
    { value: 'demand', label: '🔥 Demand' },
]

// Default coordinates (central India) — used when no land is stored
const DEFAULT_LAT = 20.5937
const DEFAULT_LNG = 78.9629

export default function NearbyMarkets() {
    const [markets, setMarkets] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [radius, setRadius] = useState(200)
    const [sortBy, setSortBy] = useState('distance')
    const [selectedMarket, setSelectedMarket] = useState(null)
    const [userLat, setUserLat] = useState(DEFAULT_LAT)
    const [userLng, setUserLng] = useState(DEFAULT_LNG)

    // Try to get land coordinates from localStorage, or fall back to API
    useEffect(() => {
        // First check localStorage (fast)
        try {
            const stored = localStorage.getItem('gainnai_latest_land')
            if (stored) {
                const land = JSON.parse(stored)
                if (land.latitude && land.longitude) {
                    setUserLat(land.latitude)
                    setUserLng(land.longitude)
                    return // got it from localStorage
                }
            }
        } catch { /* ignore */ }

        // If not in localStorage, fetch user's latest land from API
        const fetchLatestLand = async () => {
            try {
                const res = await import('@/services/api').then(m => m.default.get('/api/v1/lands/?limit=1'))
                const lands = res.data
                if (Array.isArray(lands) && lands.length > 0) {
                    const land = lands[0]
                    if (land.latitude && land.longitude) {
                        setUserLat(land.latitude)
                        setUserLng(land.longitude)
                        // Cache for next time
                        localStorage.setItem('gainnai_latest_land', JSON.stringify({
                            latitude: land.latitude,
                            longitude: land.longitude,
                            size: land.size,
                            name: land.name,
                        }))
                    }
                }
            } catch { /* ignore — will use default coords */ }
        }
        fetchLatestLand()
    }, [])

    const fetchMarkets = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const res = await marketService.getNearbyMarkets(userLat, userLng, radius, null, sortBy)
            setMarkets(res.data?.markets || [])
        } catch (err) {
            console.warn('Market fetch error, using fallback:', err)
            setError('Could not reach market service')
            // Provide minimal fallback
            setMarkets(FALLBACK_MARKETS.map((m, i) => ({
                ...m,
                distance_km: Math.round(10 + i * 15),
                travel_time_min: Math.round(15 + i * 20),
            })))
        } finally {
            setLoading(false)
        }
    }, [userLat, userLng, radius, sortBy])

    useEffect(() => { fetchMarkets() }, [fetchMarkets])

    const handleMarketSelect = useCallback((market) => {
        setSelectedMarket(prev => prev?.id === market.id ? null : market)
    }, [])

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            {/* Header with controls */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <div>
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        🏪 Nearby Markets
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                        {markets.length} market{markets.length !== 1 ? 's' : ''} within {radius} km
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {/* Radius selector */}
                    <div className="flex items-center gap-1 bg-gray-50 rounded-lg p-0.5">
                        {RADIUS_OPTIONS.map(r => (
                            <button
                                key={r}
                                onClick={() => setRadius(r)}
                                className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-all ${radius === r
                                    ? 'bg-white text-primary-700 shadow-sm'
                                    : 'text-gray-400 hover:text-gray-600'
                                    }`}
                            >
                                {r} km
                            </button>
                        ))}
                    </div>
                    {/* Sort */}
                    <select
                        value={sortBy}
                        onChange={e => setSortBy(e.target.value)}
                        className="text-[11px] bg-gray-50 border-0 rounded-lg px-2 py-1.5 text-gray-600 font-medium focus:ring-2 focus:ring-primary-200"
                    >
                        {SORT_OPTIONS.map(s => (
                            <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Map */}
            <MarketMap
                userLat={userLat}
                userLng={userLng}
                markets={markets}
                radiusKm={radius}
                selectedMarket={selectedMarket?.id}
                onMarketSelect={handleMarketSelect}
            />

            {/* Market cards */}
            <div className="mt-4">
                {loading && (
                    <div className="flex items-center justify-center py-8">
                        <div className="w-6 h-6 rounded-full border-2 border-primary-200 border-t-primary-500 animate-spin" />
                    </div>
                )}
                {error && !loading && (
                    <p className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg mb-3">
                        ⚠️ {error} — showing cached market data
                    </p>
                )}
                {!loading && markets.length === 0 && (
                    <p className="text-sm text-gray-400 text-center py-6">
                        No markets found within {radius} km. Try increasing the radius.
                    </p>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 max-h-80 overflow-y-auto pr-1">
                    {markets.slice(0, 9).map(m => (
                        <MarketCard
                            key={m.id}
                            market={m}
                            compact
                            selected={selectedMarket?.id === m.id}
                            onSelect={handleMarketSelect}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}

// Minimal fallback when backend is unreachable
const FALLBACK_MARKETS = [
    { id: 'f1', name: 'Azadpur Mandi', city: 'New Delhi', state: 'Delhi', type: 'APMC', lat: 28.7041, lng: 77.1025, rating: 4.2, crops_traded: ['Rice', 'Wheat', 'Potato'], operating_hours: '04:00 AM - 02:00 PM', prices: [{ crop: 'Rice', price_per_ton: 18900, trend: 'up', trend_pct: 5 }, { crop: 'Wheat', price_per_ton: 23100, trend: 'stable', trend_pct: 1 }], demand_supply: { Rice: { demand: 'high', supply: 'balanced' } } },
    { id: 'f2', name: 'Vashi APMC', city: 'Navi Mumbai', state: 'Maharashtra', type: 'APMC', lat: 19.076, lng: 73.007, rating: 4.5, crops_traded: ['Onion', 'Tomato', 'Rice'], operating_hours: '24 hrs', prices: [{ crop: 'Onion', price_per_ton: 15120, trend: 'up', trend_pct: 8 }, { crop: 'Tomato', price_per_ton: 16200, trend: 'down', trend_pct: -3 }], demand_supply: { Onion: { demand: 'high', supply: 'undersupply' } } },
    { id: 'f3', name: 'Koyambedu Market', city: 'Chennai', state: 'Tamil Nadu', type: 'Wholesale', lat: 13.0732, lng: 80.1937, rating: 4.0, crops_traded: ['Rice', 'Banana', 'Turmeric'], operating_hours: '02:00 AM - 12:00 PM', prices: [{ crop: 'Rice', price_per_ton: 18540, trend: 'stable', trend_pct: 2 }, { crop: 'Banana', price_per_ton: 12360, trend: 'up', trend_pct: 4 }], demand_supply: { Rice: { demand: 'high', supply: 'balanced' } } },
]
