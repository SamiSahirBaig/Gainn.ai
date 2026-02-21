import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const COLORS = ['#22c55e', '#16a34a', '#15803d', '#a3e635', '#84cc16', '#65a30d', '#4ade80', '#34d399', '#059669', '#10b981']

export default function PriceComparison({ crops }) {
    const data = crops.map(c => ({
        name: c.name.length > 10 ? c.name.slice(0, 9) + '…' : c.name,
        fullName: c.name,
        price: c.price,
        profit: c.profit || 0,
    })).sort((a, b) => b.price - a.price)

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h3 className="font-semibold text-gray-900 mb-1">Price Comparison</h3>
            <p className="text-xs text-gray-400 mb-4">Current market price per ton (₹)</p>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} layout="vertical" margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                        <XAxis type="number" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
                        <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#374151' }} axisLine={false} tickLine={false} width={80} />
                        <Tooltip
                            contentStyle={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '12px' }}
                            formatter={(v, name) => [`₹${v.toLocaleString('en-IN')}`, name === 'price' ? 'Price/ton' : 'Profit/ha']}
                            labelFormatter={(_, payload) => payload?.[0]?.payload?.fullName || ''}
                        />
                        <Bar dataKey="price" radius={[0, 6, 6, 0]} maxBarSize={24}>
                            {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}
