/**
 * ImpactChart — bar chart showing score/yield/profit change per crop.
 */
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts'

export default function ImpactChart({ baseline, simulated }) {
    const origCrops = baseline?.results?.top_recommendations || []
    const simCrops = simulated?.simulated_recommendations || []

    // Build comparison data
    const simMap = Object.fromEntries(simCrops.map(c => [c.name, c]))
    const data = origCrops.map(c => {
        const sim = simMap[c.name] || {}
        const scoreDiff = ((sim.suitability_score || 0) - (c.suitability_score || 0)).toFixed(1)
        const yieldDiff = ((sim.predicted_yield || 0) - (c.predicted_yield || 0)).toFixed(2)
        const profitDiff = Math.round((sim.estimated_profit || 0) - (c.estimated_profit || 0))
        return {
            name: c.name,
            scoreDiff: parseFloat(scoreDiff),
            yieldDiff: parseFloat(yieldDiff),
            profitDiff,
        }
    })

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h3 className="font-semibold text-gray-900 mb-1">Impact Analysis</h3>
            <p className="text-xs text-gray-400 mb-5">
                Change in suitability score per crop under the simulated scenario
            </p>

            <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis
                            dataKey="name"
                            tick={{ fontSize: 12, fill: '#94a3b8' }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <YAxis
                            tick={{ fontSize: 12, fill: '#94a3b8' }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'white',
                                border: '1px solid #e2e8f0',
                                borderRadius: '12px',
                                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                                fontSize: '13px',
                            }}
                            formatter={(value, name) => {
                                const label = name === 'scoreDiff' ? 'Score Δ' : name === 'yieldDiff' ? 'Yield Δ' : 'Profit Δ'
                                return [value, label]
                            }}
                        />
                        <Legend
                            formatter={(value) => {
                                const map = { scoreDiff: 'Score Change', yieldDiff: 'Yield Change', profitDiff: 'Profit Change (₹)' }
                                return <span className="text-xs text-gray-500">{map[value] || value}</span>
                            }}
                        />
                        <Bar dataKey="scoreDiff" radius={[6, 6, 0, 0]} maxBarSize={32}>
                            {data.map((d, i) => (
                                <Cell key={i} fill={d.scoreDiff >= 0 ? '#22c55e' : '#ef4444'} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-3 gap-3 mt-5">
                {[
                    { label: 'Avg Score Δ', val: (data.reduce((s, d) => s + d.scoreDiff, 0) / (data.length || 1)).toFixed(1), unit: '' },
                    { label: 'Avg Yield Δ', val: (data.reduce((s, d) => s + d.yieldDiff, 0) / (data.length || 1)).toFixed(2), unit: 't/ha' },
                    { label: 'Avg Profit Δ', val: Math.round(data.reduce((s, d) => s + d.profitDiff, 0) / (data.length || 1)).toLocaleString('en-IN'), unit: '₹' },
                ].map(({ label, val, unit }) => (
                    <div key={label} className="text-center p-3 rounded-xl bg-gray-50">
                        <p className="text-[10px] text-gray-400 uppercase">{label}</p>
                        <p className={`text-lg font-bold mt-0.5 ${parseFloat(String(val).replace(/,/g, '')) >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                            {parseFloat(String(val).replace(/,/g, '')) > 0 ? '+' : ''}{val} {unit}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    )
}
