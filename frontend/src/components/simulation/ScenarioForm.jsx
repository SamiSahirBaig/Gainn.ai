/**
 * ScenarioForm — slider controls for simulation parameters.
 */

const SLIDERS = [
    { key: 'tempChange', label: 'Temperature Change', unit: '°C', min: -5, max: 10, step: 0.5, icon: '🌡️' },
    { key: 'rainfallChange', label: 'Rainfall Change', unit: '%', min: -50, max: 100, step: 5, icon: '🌧️' },
    { key: 'soilDegradation', label: 'Soil Degradation', unit: '%', min: 0, max: 50, step: 1, icon: '🌱' },
    { key: 'priceChange', label: 'Market Price Change', unit: '%', min: -50, max: 50, step: 5, icon: '💰' },
    { key: 'costChange', label: 'Input Cost Change', unit: '%', min: -20, max: 100, step: 5, icon: '📦' },
]

function Slider({ config, value, onUpdate }) {
    const { key, label, unit, min, max, step, icon } = config
    const pct = ((value - min) / (max - min)) * 100

    const color = value > 0
        ? 'text-red-500'
        : value < 0
            ? 'text-blue-500'
            : 'text-gray-500'

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">{icon} {label}</span>
                <span className={`text-sm font-bold tabular-nums ${color}`}>
                    {value > 0 ? '+' : ''}{value}{unit}
                </span>
            </div>
            <div className="relative">
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={value}
                    onChange={(e) => onUpdate(key, parseFloat(e.target.value))}
                    className="w-full h-2 rounded-full appearance-none cursor-pointer accent-primary-500"
                    style={{
                        background: `linear-gradient(to right, #22c55e ${pct}%, #e5e7eb ${pct}%)`,
                    }}
                />
                <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                    <span>{min}{unit}</span>
                    <span>{max}{unit}</span>
                </div>
            </div>
        </div>
    )
}

export default function ScenarioForm({ params, onChange }) {
    const handleUpdate = (key, value) => {
        onChange({ ...params, [key]: value })
    }

    const handleReset = () => {
        onChange({ tempChange: 0, rainfallChange: 0, soilDegradation: 0, priceChange: 0, costChange: 0 })
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-5">
                <h3 className="font-semibold text-gray-900">Scenario Parameters</h3>
                <button
                    onClick={handleReset}
                    className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                >
                    Reset all
                </button>
            </div>
            <div className="space-y-5">
                {SLIDERS.map((cfg) => (
                    <Slider key={cfg.key} config={cfg} value={params[cfg.key]} onUpdate={handleUpdate} />
                ))}
            </div>
        </div>
    )
}
