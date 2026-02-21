import { useState } from 'react'
import PriceChart from '@/components/market/PriceChart'
import DemandIndicator from '@/components/market/DemandIndicator'
import OpportunityCard from '@/components/market/OpportunityCard'
import PriceComparison from '@/components/market/PriceComparison'

const CROPS_DATA = [
    { name: 'Rice', price: 18000, demand: 'high', season: 'Kharif', volatility: 0.015 },
    { name: 'Wheat', price: 22000, demand: 'high', season: 'Rabi', volatility: 0.012 },
    { name: 'Cotton', price: 55000, demand: 'medium', season: 'Kharif', volatility: 0.04 },
    { name: 'Sugarcane', price: 3500, demand: 'high', season: 'Annual', volatility: 0.008 },
    { name: 'Soybean', price: 38000, demand: 'high', season: 'Kharif', volatility: 0.025 },
    { name: 'Turmeric', price: 65000, demand: 'medium', season: 'Kharif', volatility: 0.05 },
    { name: 'Mustard', price: 48000, demand: 'medium', season: 'Rabi', volatility: 0.03 },
    { name: 'Potato', price: 12000, demand: 'high', season: 'Rabi', volatility: 0.06 },
    { name: 'Tomato', price: 15000, demand: 'high', season: 'All', volatility: 0.08 },
    { name: 'Lentil', price: 50000, demand: 'high', season: 'Rabi', volatility: 0.02 },
]

const OPPORTUNITIES = [
    { crop: 'Turmeric', reason: 'Prices surging 12% this month due to export demand. Current price near 6-month high.', profit: 45000, urgency: 'high' },
    { crop: 'Mustard', reason: 'Rabi season peak approaching. Demand expected to rise 20% in next 2 weeks.', profit: 32000, urgency: 'high' },
    { crop: 'Soybean', reason: 'Stable high demand with limited supply. Good margins for well-irrigated land.', profit: 28000, urgency: 'medium' },
    { crop: 'Cotton', reason: 'Textile sector recovery driving demand. Monitor for price corrections.', profit: 35000, urgency: 'medium' },
    { crop: 'Potato', reason: 'High volatility — prices could spike in cold storage season. Hold and sell later.', profit: 18000, urgency: 'low' },
]

export default function Market() {
    const [selectedCrop, setSelectedCrop] = useState(CROPS_DATA[0])

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Market Intelligence</h1>
                <p className="text-sm text-gray-500 mt-1">Current prices, demand trends, and selling opportunities.</p>
            </div>

            {/* Summary stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                    { label: 'Crops Tracked', value: CROPS_DATA.length, icon: '🌾' },
                    { label: 'High Demand', value: CROPS_DATA.filter(c => c.demand === 'high').length, icon: '🔥' },
                    { label: 'Best Price', value: `₹${(Math.max(...CROPS_DATA.map(c => c.price)) / 1000).toFixed(0)}k`, icon: '💰' },
                    { label: 'Opportunities', value: OPPORTUNITIES.filter(o => o.urgency === 'high').length, icon: '🎯' },
                ].map(s => (
                    <div key={s.label} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 text-center">
                        <span className="text-2xl">{s.icon}</span>
                        <p className="text-xl font-bold text-gray-900 mt-1">{s.value}</p>
                        <p className="text-[10px] text-gray-400 uppercase mt-0.5">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Crop selector + price chart */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2">
                    <PriceChart cropName={selectedCrop.name} basePrice={selectedCrop.price} volatility={selectedCrop.volatility} />
                </div>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                    <h3 className="font-semibold text-gray-900 mb-3">Select Crop</h3>
                    <div className="space-y-1.5 max-h-72 overflow-y-auto">
                        {CROPS_DATA.map(c => (
                            <button
                                key={c.name}
                                onClick={() => setSelectedCrop(c)}
                                className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all ${selectedCrop.name === c.name
                                        ? 'bg-primary-50 text-primary-700 font-semibold shadow-sm'
                                        : 'hover:bg-gray-50 text-gray-700'
                                    }`}
                            >
                                <span className="flex justify-between">
                                    <span>{c.name}</span>
                                    <span className="tabular-nums text-gray-400">₹{(c.price / 1000).toFixed(0)}k</span>
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Demand grid */}
            <div>
                <h2 className="text-lg font-bold text-gray-900 mb-3">Demand Levels</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
                    {CROPS_DATA.slice(0, 5).map(c => (
                        <DemandIndicator key={c.name} cropName={c.name} demand={c.demand} season={c.season} />
                    ))}
                </div>
            </div>

            {/* Opportunities + comparison side by side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                    <h2 className="text-lg font-bold text-gray-900 mb-3">🎯 Market Opportunities</h2>
                    <div className="space-y-3">
                        {OPPORTUNITIES.map(o => (
                            <OpportunityCard key={o.crop} {...o} />
                        ))}
                    </div>
                </div>
                <PriceComparison crops={CROPS_DATA} />
            </div>
        </div>
    )
}
