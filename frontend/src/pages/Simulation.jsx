import { useState, useCallback, useEffect } from 'react'
import ScenarioForm from '@/components/simulation/ScenarioForm'
import ComparisonView from '@/components/simulation/ComparisonView'
import ImpactChart from '@/components/simulation/ImpactChart'
import analysisService from '@/services/analysisService'

const PRESETS = {
    drought: { label: '🏜️ Drought', tempChange: 3, rainfallChange: -40, soilDegradation: 15, priceChange: 10, costChange: 5 },
    flood: { label: '🌊 Flood', tempChange: -1, rainfallChange: 80, soilDegradation: 20, priceChange: -5, costChange: 15 },
    climate2c: { label: '🌡️ Climate +2°C', tempChange: 2, rainfallChange: -10, soilDegradation: 5, priceChange: 5, costChange: 10 },
    marketCrash: { label: '📉 Market Crash', tempChange: 0, rainfallChange: 0, soilDegradation: 0, priceChange: -30, costChange: 0 },
    costSpike: { label: '💸 Input Cost +50%', tempChange: 0, rainfallChange: 0, soilDegradation: 0, priceChange: 0, costChange: 50 },
    ideal: { label: '✨ Ideal Conditions', tempChange: 0, rainfallChange: 15, soilDegradation: -5, priceChange: 10, costChange: -10 },
}

const DEFAULT_PARAMS = { tempChange: 0, rainfallChange: 0, soilDegradation: 0, priceChange: 0, costChange: 0 }

export default function Simulation() {
    const [params, setParams] = useState({ ...DEFAULT_PARAMS })
    const [analysisId, setAnalysisId] = useState('')
    const [baseline, setBaseline] = useState(null)
    const [simulated, setSimulated] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    // Auto-load latest analysis ID from localStorage
    useEffect(() => {
        try {
            const stored = localStorage.getItem('gainnai_latest_analysis')
            if (stored) {
                const { id } = JSON.parse(stored)
                if (id) setAnalysisId(String(id))
            }
        } catch { /* ignore */ }
    }, [])

    const runSimulation = useCallback(async () => {
        if (!analysisId) { setError('Enter an analysis ID first'); return }
        setLoading(true)
        setError(null)

        try {
            // Fetch original analysis
            const { data: orig } = await analysisService.getAnalysis(analysisId)
            setBaseline(orig)

            // Run simulation
            const { data: sim } = await analysisService.simulate(analysisId, {
                temp_change: params.tempChange,
                rainfall_change: params.rainfallChange,
            })
            setSimulated(sim)
        } catch (err) {
            setError(err.message || 'Simulation failed. Make sure the analysis ID is valid and you are logged in.')
        } finally {
            setLoading(false)
        }
    }, [analysisId, params])

    const applyPreset = (key) => {
        const { label, ...values } = PRESETS[key]
        setParams(values)
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">What-If Simulation</h1>
                <p className="text-sm text-gray-500 mt-1">
                    Test how changing conditions affect your crop recommendations.
                </p>
            </div>

            {/* Preset buttons */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Preset Scenarios</h3>
                <div className="flex flex-wrap gap-2">
                    {Object.entries(PRESETS).map(([key, { label }]) => (
                        <button
                            key={key}
                            onClick={() => applyPreset(key)}
                            className="px-4 py-2 text-sm font-medium rounded-xl border border-gray-200 bg-gray-50 hover:bg-primary-50 hover:border-primary-300 hover:text-primary-700 transition-all duration-200"
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Form + Analysis ID */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2">
                    <ScenarioForm params={params} onChange={setParams} />
                </div>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col gap-4">
                    <label className="text-sm font-semibold text-gray-700">Analysis ID</label>
                    <input
                        type="number"
                        value={analysisId}
                        onChange={(e) => setAnalysisId(e.target.value)}
                        placeholder="e.g. 1"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all"
                    />
                    <button
                        onClick={runSimulation}
                        disabled={loading}
                        className="w-full py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-primary-500 to-emerald-500 hover:from-primary-600 hover:to-emerald-600 shadow-lg shadow-primary-500/25 transition-all disabled:opacity-50"
                    >
                        {loading ? 'Simulating…' : '🚀 Run Simulation'}
                    </button>
                    {error && <p className="text-xs text-red-500">{error}</p>}
                </div>
            </div>

            {/* Results */}
            {baseline && simulated && (
                <>
                    <ComparisonView baseline={baseline} simulated={simulated} />
                    <ImpactChart baseline={baseline} simulated={simulated} />
                </>
            )}
        </div>
    )
}
