import { useTranslation } from 'react-i18next'

export default function HighDemandCrops({ crops }) {
    const { t } = useTranslation()
    if (!crops?.length) return null

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h2 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
                {t('market.highDemand')}
            </h2>
            <p className="text-xs text-gray-400 mb-3">{t('market.highSubtitle')}</p>

            <div className="space-y-2">
                {crops.map((crop) => (
                    <div
                        key={crop.name}
                        className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50/50 border border-emerald-100 hover:border-emerald-200 transition-all"
                    >
                        <span className="text-2xl flex-shrink-0">{crop.icon}</span>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <h4 className="text-sm font-bold text-gray-900">{crop.name}</h4>
                                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold">
                                    {crop.tag || '🔥 Hot'}
                                </span>
                            </div>
                            <p className="text-xs text-emerald-600 mt-0.5">{crop.tip}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                            <p className="text-sm font-bold text-gray-900">
                                ₹{crop.price?.toLocaleString()}
                            </p>
                            <p className="text-[10px] text-emerald-600">
                                ↑ {crop.trend_label || t('market.rising')}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
