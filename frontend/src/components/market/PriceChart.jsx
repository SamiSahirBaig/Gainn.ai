import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

// Mock 30-day price history
function generatePriceHistory(basePrice, volatility) {
    const data = []
    let price = basePrice
    const now = new Date()
    for (let i = 29; i >= 0; i--) {
        const d = new Date(now)
        d.setDate(d.getDate() - i)
        const change = (Math.random() - 0.48) * volatility * basePrice
        price = Math.max(basePrice * 0.7, Math.min(basePrice * 1.4, price + change))
        data.push({
            date: `${d.getDate()}/${d.getMonth() + 1}`,
            price: Math.round(price),
        })
    }
    return data
}

export default function PriceChart({ cropName, basePrice, volatility = 0.02 }) {
    const data = generatePriceHistory(basePrice, volatility)
    const current = data[data.length - 1].price
    const avg = Math.round(data.reduce((s, d) => s + d.price, 0) / data.length)
    const trend = current > avg ? 'up' : current < avg ? 'down' : 'stable'
    const trendColor = trend === 'up' ? '#22c55e' : trend === 'down' ? '#ef4444' : '#6b7280'

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="font-semibold text-gray-900">{cropName} Price Trend</h3>
                    <p className="text-xs text-gray-400 mt-0.5">Last 30 days</p>
                </div>
                <div className="text-right">
                    <p className="text-xl font-bold" style={{ color: trendColor }}>₹{current.toLocaleString('en-IN')}<span className="text-xs font-normal text-gray-400">/ton</span></p>
                    <p className="text-xs text-gray-400">Avg ₹{avg.toLocaleString('en-IN')}</p>
                </div>
            </div>
            <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id={`grad-${cropName}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={trendColor} stopOpacity={0.15} />
                                <stop offset="95%" stopColor={trendColor} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                        <Tooltip
                            contentStyle={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '12px' }}
                            formatter={(v) => [`₹${v.toLocaleString('en-IN')}`, 'Price']}
                        />
                        <Line type="monotone" dataKey="price" stroke={trendColor} strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}
