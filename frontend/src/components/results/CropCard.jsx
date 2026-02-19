import SuitabilityScore from './SuitabilityScore'

export default function CropCard({ crop, rank }) {
    const { name, icon, suitability, yield: yieldVal, profit, season, description } = crop

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group">
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                        {icon}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900">{name}</h3>
                            {rank <= 3 && (
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${rank === 1 ? 'bg-amber-100 text-amber-700' :
                                        rank === 2 ? 'bg-gray-100 text-gray-600' :
                                            'bg-orange-50 text-orange-600'
                                    }`}>
                                    #{rank}
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-gray-400">{season}</p>
                    </div>
                </div>
                <SuitabilityScore score={suitability} label="Match" size={64} />
            </div>

            {description && (
                <p className="text-sm text-gray-500 mb-3">{description}</p>
            )}

            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-50">
                <div className="p-2.5 rounded-lg bg-emerald-50/50">
                    <p className="text-[11px] text-gray-400 font-medium">Expected Yield</p>
                    <p className="text-sm font-bold text-emerald-700">{yieldVal} tons/ha</p>
                </div>
                <div className="p-2.5 rounded-lg bg-blue-50/50">
                    <p className="text-[11px] text-gray-400 font-medium">Est. Profit</p>
                    <p className="text-sm font-bold text-blue-700">₹{profit.toLocaleString('en-IN')}/acre</p>
                </div>
            </div>
        </div>
    )
}
