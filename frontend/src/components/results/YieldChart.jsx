import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const COLORS = ['#22c55e', '#16a34a', '#15803d', '#4ade80', '#86efac']

export default function YieldChart({ crops }) {
    const data = crops.map((c) => ({
        name: c.name,
        yield: c.yield,
    }))

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="mb-4">
                <h3 className="font-semibold text-gray-900">Yield Prediction</h3>
                <p className="text-xs text-gray-400 mt-0.5">Expected yield in tons per hectare</p>
            </div>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'white',
                                border: '1px solid #e2e8f0',
                                borderRadius: '12px',
                                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                                fontSize: '13px',
                            }}
                            formatter={(value) => [`${value} tons/ha`, 'Yield']}
                        />
                        <Bar dataKey="yield" radius={[8, 8, 0, 0]} barSize={40}>
                            {data.map((_, i) => (
                                <Cell key={i} fill={COLORS[i % COLORS.length]} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}
