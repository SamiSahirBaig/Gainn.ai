import { useTranslation } from 'react-i18next'

export default function BestMarkets({ markets }) {
    const { t } = useTranslation()

    if (!markets?.length) {
        return (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <h2 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
                    {t('market.bestMarkets')}
                </h2>
                <p className="text-sm text-gray-400 mt-2">{t('market.analyzeLandFirst')}</p>
                <div className="mt-3 text-center p-6 bg-gray-50 rounded-xl">
                    <span className="text-4xl">🗺️</span>
                    <p className="text-sm text-gray-500 mt-2">{t('market.noLocation')}</p>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h2 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
                {t('market.bestMarkets')}
            </h2>
            <p className="text-xs text-gray-400 mb-3">{t('market.bestMarketsSubtitle')}</p>

            <div className="space-y-2">
                {markets.map((market) => (
                    <div
                        key={market.id || market.name}
                        className="p-3 rounded-xl bg-blue-50/30 border border-blue-100 hover:border-blue-200 transition-all"
                    >
                        <div className="flex items-start justify-between gap-2">
                            <div>
                                <h4 className="text-sm font-bold text-gray-900">{market.name}</h4>
                                <p className="text-xs text-gray-400">{market.city}, {market.state}</p>
                            </div>
                            <div className="text-right flex-shrink-0">
                                {market.distance_km > 0 && (
                                    <span className="text-xs font-medium text-blue-600">
                                        📍 {market.distance_km} km
                                    </span>
                                )}
                                {market.rating > 0 && (
                                    <p className="text-[10px] text-amber-500">
                                        {'⭐'.repeat(Math.round(market.rating))}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Crops sold */}
                        {market.crops?.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                                {market.crops.map(c => (
                                    <span key={c} className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-600 font-medium">
                                        {c}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Type badge */}
                        <div className="flex items-center gap-2 mt-2">
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500">{market.type}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
