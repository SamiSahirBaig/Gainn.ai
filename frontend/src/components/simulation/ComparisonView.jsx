/**
 * ComparisonView — side-by-side original vs simulated recommendations.
 */

function CropRow({ crop, rank, highlight }) {
    const bg = highlight === 'up' ? 'bg-green-50' : highlight === 'down' ? 'bg-red-50' : ''
    return (
        <tr className={`border-b border-gray-50 ${bg}`}>
            <td className="py-2.5 px-3 text-sm text-gray-500">#{rank}</td>
            <td className="py-2.5 px-3 text-sm font-medium text-gray-900">{crop.name}</td>
            <td className="py-2.5 px-3 text-sm tabular-nums text-gray-700">{crop.suitability_score}</td>
            <td className="py-2.5 px-3 text-sm tabular-nums text-gray-700">{crop.predicted_yield}</td>
            <td className="py-2.5 px-3 text-sm tabular-nums text-gray-700">
                ₹{(crop.estimated_profit || 0).toLocaleString('en-IN')}
            </td>
        </tr>
    )
}

function Table({ title, badge, crops }) {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 text-sm">{title}</h3>
                {badge}
            </div>
            <table className="w-full text-left">
                <thead>
                    <tr className="border-b border-gray-100 text-xs text-gray-400 uppercase">
                        <th className="py-2 px-3">Rank</th>
                        <th className="py-2 px-3">Crop</th>
                        <th className="py-2 px-3">Score</th>
                        <th className="py-2 px-3">Yield</th>
                        <th className="py-2 px-3">Profit</th>
                    </tr>
                </thead>
                <tbody>
                    {(crops || []).map((c, i) => (
                        <CropRow key={c.name} crop={c} rank={i + 1} />
                    ))}
                    {(!crops || crops.length === 0) && (
                        <tr><td colSpan={5} className="text-center py-6 text-sm text-gray-400">No data</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    )
}

export default function ComparisonView({ baseline, simulated }) {
    const origCrops = baseline?.results?.top_recommendations || []
    const simCrops = simulated?.simulated_recommendations || []

    // Detect ranking changes
    const origBest = origCrops[0]?.name
    const simBest = simCrops[0]?.name
    const changed = origBest !== simBest

    return (
        <div>
            <div className="flex items-center gap-2 mb-3">
                <h2 className="text-lg font-bold text-gray-900">Comparison</h2>
                {changed && (
                    <span className="text-xs font-medium text-amber-700 bg-amber-50 px-3 py-1 rounded-full">
                        ⚠️ Top crop changed: {origBest} → {simBest}
                    </span>
                )}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Table
                    title="Original Recommendations"
                    badge={<span className="text-[10px] text-gray-400 py-0.5 px-2 bg-gray-50 rounded-full">Baseline</span>}
                    crops={origCrops}
                />
                <Table
                    title="Simulated Recommendations"
                    badge={<span className="text-[10px] text-primary-600 py-0.5 px-2 bg-primary-50 rounded-full">Scenario</span>}
                    crops={simCrops}
                />
            </div>
        </div>
    )
}
