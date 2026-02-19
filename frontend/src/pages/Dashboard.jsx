import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import StatsCard from '@/components/dashboard/StatsCard'
import RecentAnalyses from '@/components/dashboard/RecentAnalyses'
import QuickActions from '@/components/dashboard/QuickActions'
import WeatherWidget from '@/components/dashboard/WeatherWidget'

const yieldData = [
    { month: 'Aug', yield: 2400 },
    { month: 'Sep', yield: 2800 },
    { month: 'Oct', yield: 3200 },
    { month: 'Nov', yield: 2900 },
    { month: 'Dec', yield: 3500 },
    { month: 'Jan', yield: 3800 },
    { month: 'Feb', yield: 4100 },
]

const stats = [
    { title: 'Total Land Analyzed', value: '247 ha', icon: '🌍', trend: '12%', trendDirection: 'up', subtitle: 'Across 18 parcels' },
    { title: 'Crops Recommended', value: '34', icon: '🌾', trend: '8%', trendDirection: 'up', subtitle: 'This quarter' },
    { title: 'Avg Profit Increase', value: '+23%', icon: '📈', trend: '5%', trendDirection: 'up', subtitle: 'Over baseline' },
    { title: 'Analyses Run', value: '89', icon: '🔬', trend: '3%', trendDirection: 'down', subtitle: 'This month' },
]

export default function Dashboard() {
    return (
        <div className="space-y-6">
            {/* Page header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
                <p className="text-sm text-gray-500 mt-1">Welcome back! Here's your agricultural overview.</p>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {stats.map((stat) => (
                    <StatsCard key={stat.title} {...stat} />
                ))}
            </div>

            {/* Chart */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="font-semibold text-gray-900">Yield Trend</h3>
                        <p className="text-xs text-gray-400 mt-0.5">Average predicted yield (kg/ha) — last 7 months</p>
                    </div>
                    <span className="text-xs font-medium text-primary-600 bg-primary-50 px-3 py-1 rounded-full">
                        +18% overall
                    </span>
                </div>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={yieldData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="yieldGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'white',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '12px',
                                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                                    fontSize: '13px',
                                }}
                            />
                            <Area
                                type="monotone"
                                dataKey="yield"
                                stroke="#22c55e"
                                strokeWidth={2.5}
                                fill="url(#yieldGradient)"
                                dot={{ r: 4, fill: '#22c55e', strokeWidth: 2, stroke: 'white' }}
                                activeDot={{ r: 6, fill: '#16a34a', strokeWidth: 2, stroke: 'white' }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Bottom grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2">
                    <RecentAnalyses />
                </div>
                <div className="space-y-4">
                    <WeatherWidget />
                    <QuickActions />
                </div>
            </div>
        </div>
    )
}
