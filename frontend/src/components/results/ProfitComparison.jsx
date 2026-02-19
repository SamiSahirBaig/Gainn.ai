import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const COLORS = ['#3b82f6', '#6366f1', '#8b5cf6', '#06b6d4', '#0ea5e9']

export default function ProfitComparison({ crops }) {
    const data = crops.map((c) => ({
        name: c.name,
        profit: c.profit,
    }))

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="mb-4">
                <h3 className="font-semibold text-gray-900">Profit Comparison</h3>
                <p className="text-xs text-gray-400 mt-0.5">Estimated profit in ₹ per acre</p>
            </div>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                        <XAxis type="number" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false}
                            tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                        <YAxis dataKey="name" type="category" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} width={80} />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'white',
                                border: '1px solid #e2e8f0',
                                borderRadius: '12px',
                                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                                fontSize: '13px',
                            }}
                            formatter={(value) => [`₹${value.toLocaleString('en-IN')}/acre`, 'Profit']}
                        />
                        <Bar dataKey="profit" radius={[0, 8, 8, 0]} barSize={28}>
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
