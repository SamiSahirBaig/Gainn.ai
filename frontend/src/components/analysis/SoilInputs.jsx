import { useFormContext } from 'react-hook-form'

const soilTypes = [
    'Alluvial', 'Black (Regur)', 'Red', 'Laterite', 'Desert (Arid)',
    'Mountain', 'Saline', 'Peaty', 'Clay', 'Sandy', 'Loamy',
]

export default function SoilInputs() {
    const { register, formState: { errors } } = useFormContext()

    const inputClass = 'w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all'

    return (
        <div className="space-y-5">
            <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">🧪 Soil Parameters</h3>
                <p className="text-sm text-gray-500">Enter your soil test results for accurate crop recommendations.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Soil Type */}
                <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Soil Type</label>
                    <select {...register('soilType')} className={inputClass}>
                        <option value="">Select soil type…</option>
                        {soilTypes.map((t) => (
                            <option key={t} value={t}>{t}</option>
                        ))}
                    </select>
                    {errors.soilType && <p className="mt-1 text-xs text-red-500">{errors.soilType.message}</p>}
                </div>

                {/* pH Level */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">pH Level</label>
                    <input
                        type="number"
                        step="0.1"
                        {...register('phLevel', { valueAsNumber: true })}
                        className={inputClass}
                        placeholder="0 – 14"
                    />
                    {errors.phLevel && <p className="mt-1 text-xs text-red-500">{errors.phLevel.message}</p>}
                </div>

                {/* Organic Matter */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Organic Matter (%)</label>
                    <input
                        type="number"
                        step="0.1"
                        {...register('organicMatter', { valueAsNumber: true })}
                        className={inputClass}
                        placeholder="e.g. 3.5"
                    />
                    {errors.organicMatter && <p className="mt-1 text-xs text-red-500">{errors.organicMatter.message}</p>}
                </div>

                {/* NPK */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nitrogen (kg/ha)</label>
                    <input
                        type="number"
                        step="0.1"
                        {...register('nitrogen', { valueAsNumber: true })}
                        className={inputClass}
                        placeholder="e.g. 120"
                    />
                    {errors.nitrogen && <p className="mt-1 text-xs text-red-500">{errors.nitrogen.message}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phosphorus (kg/ha)</label>
                    <input
                        type="number"
                        step="0.1"
                        {...register('phosphorus', { valueAsNumber: true })}
                        className={inputClass}
                        placeholder="e.g. 45"
                    />
                    {errors.phosphorus && <p className="mt-1 text-xs text-red-500">{errors.phosphorus.message}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Potassium (kg/ha)</label>
                    <input
                        type="number"
                        step="0.1"
                        {...register('potassium', { valueAsNumber: true })}
                        className={inputClass}
                        placeholder="e.g. 80"
                    />
                    {errors.potassium && <p className="mt-1 text-xs text-red-500">{errors.potassium.message}</p>}
                </div>
            </div>
        </div>
    )
}
