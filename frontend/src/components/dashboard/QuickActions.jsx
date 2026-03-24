import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export default function QuickActions() {
    const { t } = useTranslation()

    const actions = [
        {
            label: t('quickActions.newAnalysis'),
            description: t('quickActions.newAnalysisDesc'),
            icon: '🔬',
            to: '/land-analysis',
            gradient: 'from-primary-500 to-emerald-500',
        },
        {
            label: t('quickActions.cropResults'),
            description: t('quickActions.cropResultsDesc'),
            icon: '📋',
            to: '/results',
            gradient: 'from-blue-500 to-cyan-500',
        },
        {
            label: t('quickActions.marketPrices'),
            description: t('quickActions.marketPricesDesc'),
            icon: '💰',
            to: '/market',
            gradient: 'from-amber-500 to-orange-500',
        },
    ]

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h3 className="font-semibold text-gray-900 mb-4">{t('quickActions.title')}</h3>
            <div className="space-y-3">
                {actions.map((action) => (
                    <Link
                        key={action.to}
                        to={action.to}
                        className="group relative flex items-center gap-3 p-4 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 overflow-hidden"
                    >
                        {/* Hover gradient overlay */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />

                        <span className="text-2xl group-hover:scale-110 transition-transform">{action.icon}</span>
                        <div>
                            <p className="text-sm font-semibold text-gray-900">{action.label}</p>
                            <p className="text-xs text-gray-400">{action.description}</p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    )
}
