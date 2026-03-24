import { useState } from 'react'

/**
 * LandDataPanel — Shows auto-fetched environmental data with loading states.
 *
 * Props:
 *  - data: { soil, elevation, climate, area_hectares, centroid }
 *  - loading: boolean
 *  - error: string | null
 *  - onOverride(field, value) — when farmer edits a value
 */

const FIELDS = [
    { key: 'area', label: 'Land Area', unit: 'hectares', icon: '📐', path: 'area_hectares', tooltip: 'Calculated from your drawn boundary' },
    { key: 'elevation', label: 'Elevation', unit: 'm', icon: '⛰️', path: 'elevation.elevation_meters', tooltip: 'Height above sea level' },
    { key: 'soil_type', label: 'Soil Type', unit: '', icon: '🧱', path: 'soil.soil_type', tooltip: 'Classified from texture percentages (clay/sand/silt)' },
    { key: 'ph_level', label: 'Soil pH', unit: '', icon: '🧪', path: 'soil.ph_level', tooltip: 'Acidity level: 0-6 acidic, 7 neutral, 8-14 alkaline' },
    { key: 'organic_matter', label: 'Organic Matter', unit: '%', icon: '🌿', path: 'soil.organic_matter', tooltip: 'Percentage of organic carbon in soil' },
    { key: 'nitrogen', label: 'Nitrogen (N)', unit: 'mg/kg', icon: '🟢', path: 'soil.nitrogen', tooltip: 'Essential for leaf growth' },
    { key: 'phosphorus', label: 'Phosphorus (P)', unit: 'mg/kg', icon: '🟡', path: 'soil.phosphorus', tooltip: 'Important for root development' },
    { key: 'potassium', label: 'Potassium (K)', unit: 'mg/kg', icon: '🟠', path: 'soil.potassium', tooltip: 'Helps in disease resistance' },
    { key: 'temperature', label: 'Temperature', unit: '°C', icon: '🌡️', path: 'climate.temperature', tooltip: 'Current temperature at location' },
    { key: 'humidity', label: 'Humidity', unit: '%', icon: '💧', path: 'climate.humidity', tooltip: 'Current atmospheric moisture' },
    { key: 'rainfall', label: 'Annual Rainfall', unit: 'mm', icon: '🌧️', path: 'climate.rainfall_annual', tooltip: 'Estimated annual precipitation' },
    { key: 'rainfall_pattern', label: 'Rainfall Pattern', unit: '', icon: '📊', path: 'climate.rainfall_pattern', tooltip: 'Low < 600mm, Moderate 600-1000mm, High 1000-1800mm, Very High > 1800mm' },
]

function getNestedValue(obj, path) {
    return path.split('.').reduce((o, k) => o?.[k], obj)
}

function DataSourceBadge({ source }) {
    if (!source) return null
    const colors = {
        soilgrids: 'bg-blue-100 text-blue-700',
        'open-elevation': 'bg-emerald-100 text-emerald-700',
        openweathermap: 'bg-amber-100 text-amber-700',
        synthetic: 'bg-gray-100 text-gray-500',
    }
    return (
        <span className={`inline-block text-[10px] px-1.5 py-0.5 rounded-full font-medium ${colors[source] || colors.synthetic}`}>
            {source === 'synthetic' ? '⚡ estimated' : `✓ ${source}`}
        </span>
    )
}

export default function LandDataPanel({ data, loading, error }) {
    const [expanded, setExpanded] = useState(true)

    if (!data && !loading) return null

    return (
        <div className="mt-4 rounded-xl border border-gray-200 bg-white overflow-hidden">
            {/* Header */}
            <button
                type="button"
                onClick={() => setExpanded(!expanded)}
                className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-emerald-50 to-blue-50 hover:from-emerald-100 hover:to-blue-100 transition-colors"
            >
                <div className="flex items-center gap-2">
                    <span className="text-lg">🛰️</span>
                    <span className="font-semibold text-sm text-gray-800">Auto-Detected Land Data</span>
                    {data && (
                        <DataSourceBadge source={data.soil?.data_source || data.climate?.data_source} />
                    )}
                </div>
                <span className="text-gray-400 text-xs">{expanded ? '▲ collapse' : '▼ expand'}</span>
            </button>

            {/* Loading */}
            {loading && (
                <div className="px-4 py-8 text-center">
                    <div className="inline-block w-8 h-8 border-3 border-primary-200 border-t-primary-500 rounded-full animate-spin mb-3" />
                    <p className="text-sm text-gray-500">Fetching environmental data from satellites & APIs...</p>
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="px-4 py-3 bg-red-50 text-sm text-red-600">
                    ⚠️ {error}. Using estimated values.
                </div>
            )}

            {/* Data grid */}
            {expanded && data && !loading && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-px bg-gray-100 p-px">
                    {FIELDS.map((field) => {
                        const value = getNestedValue(data, field.path)
                        if (value === undefined || value === null) return null

                        return (
                            <div
                                key={field.key}
                                className="bg-white p-3 hover:bg-gray-50 transition-colors group relative"
                                title={field.tooltip}
                            >
                                <div className="flex items-center gap-1.5 mb-1">
                                    <span className="text-sm">{field.icon}</span>
                                    <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wide">{field.label}</span>
                                </div>
                                <div className="text-lg font-bold text-gray-900">
                                    {typeof value === 'number' ? value.toLocaleString() : value}
                                    {field.unit && (
                                        <span className="text-xs font-normal text-gray-400 ml-1">{field.unit}</span>
                                    )}
                                </div>
                                {/* Tooltip on hover */}
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-[10px] rounded-md hidden group-hover:block whitespace-nowrap z-10">
                                    {field.tooltip}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
