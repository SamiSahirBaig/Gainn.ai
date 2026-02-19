import { useFormContext } from 'react-hook-form'

const rainfallPatterns = [
    'Low (< 500 mm/year)',
    'Moderate (500–1000 mm/year)',
    'High (1000–2000 mm/year)',
    'Very High (> 2000 mm/year)',
]

export default function ClimateInputs() {
    const { register, watch, formState: { errors } } = useFormContext()
    const irrigationAvailable = watch('irrigationAvailable')

    const inputClass = 'w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all'

    return (
        <div className="space-y-5">
            <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">🌦️ Climate Data</h3>
                <p className="text-sm text-gray-500">Provide climate information for your area to improve prediction accuracy.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Average Temperature */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Average Temperature (°C)</label>
                    <input
                        type="number"
                        step="0.1"
                        {...register('avgTemperature', { valueAsNumber: true })}
                        className={inputClass}
                        placeholder="e.g. 28"
                    />
                    {errors.avgTemperature && <p className="mt-1 text-xs text-red-500">{errors.avgTemperature.message}</p>}
                </div>

                {/* Rainfall Pattern */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rainfall Pattern</label>
                    <select {...register('rainfallPattern')} className={inputClass}>
                        <option value="">Select rainfall…</option>
                        {rainfallPatterns.map((r) => (
                            <option key={r} value={r}>{r}</option>
                        ))}
                    </select>
                    {errors.rainfallPattern && <p className="mt-1 text-xs text-red-500">{errors.rainfallPattern.message}</p>}
                </div>

                {/* Irrigation toggle */}
                <div className="sm:col-span-2">
                    <label className="flex items-center gap-3 cursor-pointer group p-4 rounded-xl border border-gray-200 hover:border-primary-300 transition-colors">
                        <div className="relative">
                            <input
                                type="checkbox"
                                {...register('irrigationAvailable')}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 rounded-full peer-checked:bg-primary-500 transition-colors" />
                            <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow-sm peer-checked:translate-x-5 transition-transform" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-900">Irrigation Available</p>
                            <p className="text-xs text-gray-500">
                                {irrigationAvailable
                                    ? '✅ Your land has irrigation access'
                                    : 'Toggle if your land has irrigation infrastructure'}
                            </p>
                        </div>
                    </label>
                </div>
            </div>
        </div>
    )
}
