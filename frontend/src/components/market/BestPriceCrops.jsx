import { useTranslation } from 'react-i18next'

const TREND_STYLE = {
    up: { color: 'text-emerald-600', arrow: '↑', bg: 'bg-emerald-50' },
    down: { color: 'text-red-500', arrow: '↓', bg: 'bg-red-50' },
    stable: { color: 'text-gray-500', arrow: '→', bg: 'bg-gray-50' },
}

export default function BestPriceCrops({ crops }) {
    const { t } = useTranslation()
    if (!crops?.length) return null

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h2 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
                {t('market.bestPrices')}
            </h2>
            <p className="text-xs text-gray-400 mb-3">{t('market.bestPricesSubtitle')}</p>

            <div className="space-y-2">
                {crops.map((crop, index) => {
                    const ts = TREND_STYLE[crop.trend] || TREND_STYLE.stable
                    return (
                        <div
                            key={crop.name}
                            className="flex items-center gap-3 p-3 rounded-xl bg-amber-50/30 border border-amber-100 hover:border-amber-200 transition-all"
                        >
                            {/* Rank */}
                            <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center text-xs font-bold text-amber-700 flex-shrink-0">
                                {index + 1}
                            </div>

                            <span className="text-2xl flex-shrink-0">{crop.icon}</span>

                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-bold text-gray-900">{crop.name}</h4>
                                <p className="text-xs text-gray-400">{crop.tip}</p>
                            </div>

                            <div className="text-right flex-shrink-0">
                                <p className="text-lg font-extrabold text-gray-900 tabular-nums">
                                    ₹{crop.price?.toLocaleString()}
                                </p>
                                {crop.change_pct != null && (
                                    <p className={`text-xs font-bold ${ts.color} tabular-nums`}>
                                        {ts.arrow} {Math.abs(crop.change_pct)}%
                                    </p>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
