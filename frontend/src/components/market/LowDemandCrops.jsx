export default function LowDemandCrops({ crops }) {
    if (!crops?.length) {
        return (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <h2 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
                    ⚠️ Low Demand — Avoid These
                </h2>
                <p className="text-sm text-gray-400 mt-2">No crops to avoid right now — market is healthy! ✅</p>
            </div>
        )
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h2 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
                ⚠️ Low Demand — Avoid These
            </h2>
            <p className="text-xs text-gray-400 mb-3">These crops have low demand or falling prices</p>

            <div className="space-y-2">
                {crops.map((crop) => (
                    <div
                        key={crop.name}
                        className="flex items-center gap-3 p-3 rounded-xl bg-red-50/50 border border-red-100 hover:border-red-200 transition-all"
                    >
                        <span className="text-2xl flex-shrink-0">{crop.icon}</span>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <h4 className="text-sm font-bold text-gray-900">{crop.name}</h4>
                                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-100 text-red-600 font-bold">
                                    {crop.tag}
                                </span>
                            </div>
                            <p className="text-xs text-red-500 mt-0.5">{crop.reason}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                            <p className="text-sm font-bold text-gray-900">
                                ₹{crop.price?.toLocaleString()}
                            </p>
                            <p className="text-[10px] text-red-500">
                                ↓ {crop.trend_label || 'Falling'}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
