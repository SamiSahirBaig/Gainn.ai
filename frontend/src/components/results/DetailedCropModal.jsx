import { useState, useEffect } from 'react'
import analysisService from '@/services/analysisService'
import CostBreakdown from './CostBreakdown'

const CROP_ICONS = {
    rice: '🌾', wheat: '🌿', sugarcane: '🎋', cotton: '🏵️', maize: '🌽',
    soybean: '🫘', potato: '🥔', tomato: '🍅', lentil: '🫘', mustard: '🌻',
    turmeric: '🟡', groundnut: '🥜', millet: '🌾', sorghum: '🌿', barley: '🌿',
    chickpea: '🫘', sunflower: '🌻', onion: '🧅', banana: '🍌', coconut: '🥥',
    mango: '🥭', orange: '🍊', jute: '🌿', cabbage: '🥬',
}

const TABS = [
    { key: 'overview', label: '📊 Overview' },
    { key: 'costs', label: '💰 Costs' },
    { key: 'market', label: '🏪 Market' },
    { key: 'growing', label: '🌱 Growing Guide' },
]

function Badge({ children, color = 'gray' }) {
    const colors = {
        green: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
        yellow: 'bg-amber-50 text-amber-700 ring-amber-200',
        red: 'bg-red-50 text-red-700 ring-red-200',
        blue: 'bg-blue-50 text-blue-700 ring-blue-200',
        gray: 'bg-gray-50 text-gray-600 ring-gray-200',
    }
    return (
        <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ring-1 ring-inset ${colors[color] || colors.gray}`}>
            {children}
        </span>
    )
}

function StatCard({ label, value, sub, color = 'gray' }) {
    const colors = {
        green: 'from-emerald-50 to-emerald-100/50 text-emerald-700',
        blue: 'from-blue-50 to-blue-100/50 text-blue-700',
        red: 'from-red-50 to-red-100/50 text-red-700',
        amber: 'from-amber-50 to-amber-100/50 text-amber-700',
        gray: 'from-gray-50 to-gray-100/50 text-gray-700',
    }
    return (
        <div className={`rounded-xl p-4 bg-gradient-to-br ${colors[color] || colors.gray}`}>
            <p className="text-[11px] font-medium opacity-70">{label}</p>
            <p className="text-lg font-bold mt-0.5">{value}</p>
            {sub && <p className="text-[11px] opacity-60 mt-0.5">{sub}</p>}
        </div>
    )
}

export default function DetailedCropModal({ analysisId, cropName, onClose }) {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [tab, setTab] = useState('overview')

    useEffect(() => {
        if (!analysisId || !cropName) return
        setLoading(true)
        analysisService.getCropDetail(analysisId, cropName)
            .then(res => { setData(res.data); setError(null) })
            .catch(err => { setError(err.message || 'Failed to load'); setData(null) })
            .finally(() => setLoading(false))
    }, [analysisId, cropName])

    const icon = CROP_ICONS[cropName?.toLowerCase()] || '🌱'

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-primary-50 to-emerald-50">
                    <div className="flex items-center gap-3">
                        <span className="text-3xl">{icon}</span>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">{cropName}</h2>
                            {data?.suitability && (
                                <div className="flex items-center gap-2 mt-0.5">
                                    <Badge color={data.suitability.suitability_score >= 75 ? 'green' : data.suitability.suitability_score >= 50 ? 'yellow' : 'red'}>
                                        {data.suitability.suitability_score}% match
                                    </Badge>
                                    <Badge color="blue">{data.suitability.category}</Badge>
                                </div>
                            )}
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex px-6 pt-2 gap-1 border-b border-gray-100">
                    {TABS.map(t => (
                        <button
                            key={t.key}
                            onClick={() => setTab(t.key)}
                            className={`px-3 py-2 text-xs font-medium rounded-t-lg transition-colors ${tab === t.key
                                    ? 'bg-primary-50 text-primary-700 border-b-2 border-primary-500'
                                    : 'text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-6 py-5">
                    {loading && (
                        <div className="flex items-center justify-center py-16">
                            <div className="w-8 h-8 rounded-full border-3 border-primary-200 border-t-primary-500 animate-spin" />
                        </div>
                    )}
                    {error && (
                        <div className="p-4 rounded-xl bg-red-50 text-red-700 text-sm">{error}</div>
                    )}
                    {data && !loading && (
                        <>
                            {tab === 'overview' && <OverviewTab data={data} />}
                            {tab === 'costs' && <CostsTab data={data} />}
                            {tab === 'market' && <MarketTab data={data} />}
                            {tab === 'growing' && <GrowingTab data={data} />}
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

// ── Tab content components ──────────────────────────

function OverviewTab({ data }) {
    const { profit, yield_prediction, suitability } = data
    return (
        <div className="space-y-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <StatCard label="Suitability" value={`${suitability?.suitability_score || 0}%`} color="green" />
                <StatCard
                    label="Expected Yield"
                    value={`${yield_prediction?.predicted_yield || 0} t/ha`}
                    sub={yield_prediction?.min_yield ? `Range: ${yield_prediction.min_yield}–${yield_prediction.max_yield}` : null}
                    color="blue"
                />
                <StatCard
                    label="Net Profit"
                    value={`₹${(profit?.profit || 0).toLocaleString('en-IN')}`}
                    sub={profit?.profit_per_hectare ? `₹${profit.profit_per_hectare.toLocaleString('en-IN')}/ha` : null}
                    color={profit?.profit > 0 ? 'green' : 'red'}
                />
                <StatCard
                    label="ROI"
                    value={`${profit?.roi || 0}%`}
                    color={profit?.roi >= 50 ? 'green' : profit?.roi >= 0 ? 'amber' : 'red'}
                />
            </div>

            {/* Profit summary */}
            <div className="rounded-xl border border-gray-100 p-4 space-y-2">
                <h4 className="text-sm font-semibold text-gray-700">💰 Profit Summary</h4>
                <div className="grid grid-cols-3 gap-3 text-center">
                    <div>
                        <p className="text-xs text-gray-400">Revenue</p>
                        <p className="text-sm font-bold text-emerald-600">₹{(profit?.revenue || 0).toLocaleString('en-IN')}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-400">Total Cost</p>
                        <p className="text-sm font-bold text-red-500">₹{(profit?.total_cost || 0).toLocaleString('en-IN')}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-400">Net Profit</p>
                        <p className={`text-sm font-bold ${profit?.profit >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                            ₹{(profit?.profit || 0).toLocaleString('en-IN')}
                        </p>
                    </div>
                </div>
            </div>

            {/* Suitability breakdown */}
            {suitability?.breakdown && (
                <div className="rounded-xl border border-gray-100 p-4 space-y-2">
                    <h4 className="text-sm font-semibold text-gray-700">📈 Suitability Breakdown</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {Object.entries(suitability.breakdown).map(([key, val]) => (
                            <div key={key} className="text-center p-2 rounded-lg bg-gray-50">
                                <p className="text-[11px] text-gray-400 capitalize">{key}</p>
                                <p className="text-sm font-bold text-gray-700">{val}%</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Confidence */}
            {yield_prediction?.confidence != null && (
                <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>Prediction confidence:</span>
                    <div className="flex-1 h-2 rounded-full bg-gray-100 max-w-32">
                        <div
                            className="h-full rounded-full bg-primary-400 transition-all"
                            style={{ width: `${(yield_prediction.confidence * 100)}%` }}
                        />
                    </div>
                    <span className="font-medium">{(yield_prediction.confidence * 100).toFixed(0)}%</span>
                </div>
            )}
        </div>
    )
}

function CostsTab({ data }) {
    const { cost_breakdown, cost_phases, profit, land_size } = data
    return (
        <div className="space-y-5">
            <p className="text-sm text-gray-500">
                Cost breakdown per hectare for <span className="font-medium text-gray-700">{data.crop_name}</span>
                {land_size > 1 && <> × {land_size} ha = <span className="font-bold">₹{(profit?.total_cost || 0).toLocaleString('en-IN')}</span> total</>}
            </p>

            <CostBreakdown costs={cost_breakdown} totalCost={null} />

            {/* Phased summary */}
            {cost_phases && (
                <div className="rounded-xl border border-gray-100 p-4 space-y-3">
                    <h4 className="text-sm font-semibold text-gray-700">📅 Cost by Phase</h4>
                    {Object.entries(cost_phases).map(([phase, items]) => {
                        const phaseTotal = Object.values(items).reduce((s, v) => s + v, 0)
                        if (phaseTotal === 0) return null
                        const labels = { pre_sowing: '🌱 Pre-Sowing', growing: '☀️ Growing', harvest: '🌾 Harvest', post_harvest: '📦 Post-Harvest' }
                        return (
                            <div key={phase} className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">{labels[phase] || phase}</span>
                                <span className="font-semibold text-gray-800">₹{phaseTotal.toLocaleString('en-IN')}</span>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

function MarketTab({ data }) {
    const { market_info } = data
    if (!market_info) return <p className="text-sm text-gray-400">No market data available.</p>

    const volatilityColor = { low: 'green', medium: 'yellow', high: 'red' }
    const demandColor = { low: 'red', medium: 'yellow', high: 'green' }

    return (
        <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3">
                <StatCard
                    label="Market Price"
                    value={`₹${(market_info.price_per_ton || 0).toLocaleString('en-IN')}`}
                    sub="per ton"
                    color="blue"
                />
                <StatCard
                    label="Revenue Potential"
                    value={`₹${(data.profit?.revenue || 0).toLocaleString('en-IN')}`}
                    sub={`${data.land_size} hectare${data.land_size !== 1 ? 's' : ''}`}
                    color="green"
                />
            </div>

            <div className="rounded-xl border border-gray-100 p-4 space-y-3">
                <h4 className="text-sm font-semibold text-gray-700">📈 Market Analysis</h4>
                <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">Price Volatility</span>
                        <Badge color={volatilityColor[market_info.volatility] || 'gray'}>
                            {market_info.volatility || 'unknown'}
                        </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">Demand Level</span>
                        <Badge color={demandColor[market_info.demand] || 'gray'}>
                            {market_info.demand || 'unknown'}
                        </Badge>
                    </div>
                </div>
            </div>

            <div className="p-3 rounded-lg bg-blue-50 text-xs text-blue-700">
                💡 Prices are based on average market rates. Actual prices may vary by region, season, and quality.
            </div>
        </div>
    )
}

function GrowingTab({ data }) {
    const { growing_guide } = data
    if (!growing_guide) return <p className="text-sm text-gray-400">No growing data available.</p>

    return (
        <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3">
                <StatCard label="Season" value={growing_guide.season_name} color="green" />
                <StatCard label="Duration" value={`${growing_guide.growth_duration || '?'} days`} color="blue" />
            </div>

            <div className="rounded-xl border border-gray-100 p-4 space-y-3">
                <h4 className="text-sm font-semibold text-gray-700">📅 Calendar</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                        <p className="text-xs text-gray-400 mb-1">Sowing Months</p>
                        <div className="flex flex-wrap gap-1">
                            {(growing_guide.sowing_months || []).map(m => (
                                <Badge key={m} color="green">{m}</Badge>
                            ))}
                        </div>
                    </div>
                    <div>
                        <p className="text-xs text-gray-400 mb-1">Harvest Months</p>
                        <div className="flex flex-wrap gap-1">
                            {(growing_guide.harvest_months || []).map(m => (
                                <Badge key={m} color="yellow">{m}</Badge>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="rounded-xl border border-gray-100 p-4 space-y-3">
                <h4 className="text-sm font-semibold text-gray-700">🌡️ Requirements</h4>
                <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm">
                    {growing_guide.temp_range?.[0] != null && (
                        <div className="flex justify-between">
                            <span className="text-gray-500">Temperature</span>
                            <span className="font-medium">{growing_guide.temp_range[0]}–{growing_guide.temp_range[1]} °C</span>
                        </div>
                    )}
                    {growing_guide.rainfall_range?.[0] != null && (
                        <div className="flex justify-between">
                            <span className="text-gray-500">Rainfall</span>
                            <span className="font-medium">{growing_guide.rainfall_range[0]}–{growing_guide.rainfall_range[1]} mm</span>
                        </div>
                    )}
                    {growing_guide.ph_range?.[0] != null && (
                        <div className="flex justify-between">
                            <span className="text-gray-500">Soil pH</span>
                            <span className="font-medium">{growing_guide.ph_range[0]}–{growing_guide.ph_range[1]}</span>
                        </div>
                    )}
                    {growing_guide.water_requirement != null && (
                        <div className="flex justify-between">
                            <span className="text-gray-500">Water Need</span>
                            <span className="font-medium">{growing_guide.water_requirement} mm</span>
                        </div>
                    )}
                    <div className="flex justify-between">
                        <span className="text-gray-500">Irrigation</span>
                        <Badge color={growing_guide.irrigation_required ? 'yellow' : 'green'}>
                            {growing_guide.irrigation_required ? 'Required' : 'Rain-fed OK'}
                        </Badge>
                    </div>
                </div>
            </div>

            {growing_guide.soil_types?.length > 0 && (
                <div className="rounded-xl border border-gray-100 p-4 space-y-2">
                    <h4 className="text-sm font-semibold text-gray-700">🏔️ Suitable Soils</h4>
                    <div className="flex flex-wrap gap-1.5">
                        {growing_guide.soil_types.map(s => (
                            <Badge key={s} color="gray">{s}</Badge>
                        ))}
                    </div>
                </div>
            )}

            {growing_guide.npk_required && (
                <div className="rounded-xl border border-gray-100 p-4 space-y-2">
                    <h4 className="text-sm font-semibold text-gray-700">🧪 NPK Requirements (kg/ha)</h4>
                    <div className="grid grid-cols-3 gap-3 text-center">
                        <div className="p-2 rounded-lg bg-blue-50">
                            <p className="text-[11px] text-blue-400">Nitrogen</p>
                            <p className="text-sm font-bold text-blue-700">{growing_guide.npk_required.nitrogen || 0}</p>
                        </div>
                        <div className="p-2 rounded-lg bg-amber-50">
                            <p className="text-[11px] text-amber-400">Phosphorus</p>
                            <p className="text-sm font-bold text-amber-700">{growing_guide.npk_required.phosphorus || 0}</p>
                        </div>
                        <div className="p-2 rounded-lg bg-pink-50">
                            <p className="text-[11px] text-pink-400">Potassium</p>
                            <p className="text-sm font-bold text-pink-700">{growing_guide.npk_required.potassium || 0}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
