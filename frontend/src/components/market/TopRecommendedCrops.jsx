import { useTranslation } from 'react-i18next'

const DEMAND_COLORS = {
    high: { bg: 'bg-emerald-50', text: 'text-emerald-700', ring: 'ring-emerald-200' },
    medium: { bg: 'bg-amber-50', text: 'text-amber-700', ring: 'ring-amber-200' },
    low: { bg: 'bg-red-50', text: 'text-red-700', ring: 'ring-red-200' },
}

export default function TopRecommendedCrops({ crops }) {
    const { t } = useTranslation()
    if (!crops?.length) return null

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h2 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
                {t('market.topRecommended')}
            </h2>
            <p className="text-xs text-gray-400 mb-4">{t('market.topSubtitle')}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {crops.map((crop, index) => {
                    const dc = DEMAND_COLORS[crop.demand] || DEMAND_COLORS.medium
                    return (
                        <div
                            key={crop.name}
                            className={`relative rounded-xl border-2 p-4 transition-all hover:shadow-md ${index === 0 ? 'border-emerald-300 bg-emerald-50/30' :
                                index === 1 ? 'border-blue-200 bg-blue-50/20' :
                                    'border-gray-100'
                                }`}
                        >
                            {/* Rank badge */}
                            <div className={`absolute -top-2.5 left-3 px-2 py-0.5 rounded-full text-[10px] font-bold ${index === 0 ? 'bg-amber-400 text-white' :
                                index === 1 ? 'bg-gray-300 text-white' :
                                    'bg-gray-200 text-gray-500'
                                }`}>
                                #{index + 1}
                            </div>

                            {/* Crop icon + name */}
                            <div className="text-center mt-1 mb-2">
                                <span className="text-3xl block">{crop.icon}</span>
                                <h3 className="text-base font-bold text-gray-900 mt-1">{crop.name}</h3>
                            </div>

                            {/* Demand badge */}
                            <div className="text-center mb-2">
                                <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ring-1 ring-inset ${dc.bg} ${dc.text} ${dc.ring}`}>
                                    {crop.demand === 'high' ? '🔥' : ''} {crop.demand} {t('market.demand')}
                                </span>
                            </div>

                            {/* Price + profit */}
                            <div className="text-center space-y-1">
                                <p className="text-lg font-extrabold text-gray-900">
                                    ₹{crop.price?.toLocaleString()}<span className="text-[10px] font-normal text-gray-400">/q</span>
                                </p>
                                {crop.profit_per_acre && (
                                    <p className="text-xs text-emerald-600 font-medium">
                                        💰 ₹{(crop.profit_per_acre / 1000).toFixed(0)}k {t('market.profitPerAcre')}
                                    </p>
                                )}
                            </div>

                            {/* Reasons */}
                            <div className="mt-2 pt-2 border-t border-gray-100 space-y-1">
                                {crop.reasons?.slice(0, 2).map((r, i) => (
                                    <p key={i} className="text-[10px] text-gray-500 flex items-start gap-1">
                                        <span className="text-emerald-500 mt-px">✅</span> {r}
                                    </p>
                                ))}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
