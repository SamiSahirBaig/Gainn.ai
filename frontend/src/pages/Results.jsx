import CropCard from '@/components/results/CropCard'
import YieldChart from '@/components/results/YieldChart'
import ProfitComparison from '@/components/results/ProfitComparison'
import ResourceSchedule from '@/components/results/ResourceSchedule'

const mockCrops = [
    { name: 'Rice (Basmati)', icon: '🌾', suitability: 92, yield: 6.8, profit: 72000, season: 'Kharif (Jun–Nov)', description: 'Excellent match for your alluvial soil with high moisture retention and moderate rainfall.' },
    { name: 'Wheat', icon: '🌿', suitability: 85, yield: 5.2, profit: 58000, season: 'Rabi (Nov–Apr)', description: 'Strong fit given your soil pH and temperature range. Good winter crop rotation option.' },
    { name: 'Sugarcane', icon: '🎋', suitability: 78, yield: 45.0, profit: 95000, season: 'Year-round', description: 'High profit potential with your irrigation setup. Requires sustained water supply.' },
    { name: 'Cotton', icon: '🏵️', suitability: 64, yield: 2.1, profit: 48000, season: 'Kharif (Apr–Oct)', description: 'Moderate suitability. Consider if your soil drainage supports cotton root development.' },
    { name: 'Maize', icon: '🌽', suitability: 58, yield: 4.5, profit: 35000, season: 'Kharif/Rabi', description: 'Decent yield potential but profit margins are lower than top recommendations.' },
]

export default function Results() {
    return (
        <div className="space-y-6">
            {/* Page header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Analysis Results</h1>
                    <p className="text-sm text-gray-500 mt-1">Based on your land parameters — here are the top crop recommendations.</p>
                </div>
                <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:shadow-sm transition-all">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Download Report
                </button>
            </div>

            {/* Summary bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-gradient-to-br from-primary-500 to-emerald-500 rounded-xl p-4 text-white">
                    <p className="text-xs font-medium text-white/80">Top Crop</p>
                    <p className="text-lg font-bold mt-0.5">{mockCrops[0].name}</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-100">
                    <p className="text-xs font-medium text-gray-400">Best Suitability</p>
                    <p className="text-lg font-bold text-primary-600 mt-0.5">{mockCrops[0].suitability}%</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-100">
                    <p className="text-xs font-medium text-gray-400">Highest Yield</p>
                    <p className="text-lg font-bold text-emerald-600 mt-0.5">{Math.max(...mockCrops.map(c => c.yield))} t/ha</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-100">
                    <p className="text-xs font-medium text-gray-400">Max Profit</p>
                    <p className="text-lg font-bold text-blue-600 mt-0.5">₹{Math.max(...mockCrops.map(c => c.profit)).toLocaleString('en-IN')}</p>
                </div>
            </div>

            {/* Crop cards */}
            <div>
                <h2 className="font-semibold text-gray-900 mb-3">🌾 Recommended Crops</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {mockCrops.map((crop, i) => (
                        <CropCard key={crop.name} crop={crop} rank={i + 1} />
                    ))}
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <YieldChart crops={mockCrops} />
                <ProfitComparison crops={mockCrops} />
            </div>

            {/* Resource Schedule */}
            <ResourceSchedule />
        </div>
    )
}
