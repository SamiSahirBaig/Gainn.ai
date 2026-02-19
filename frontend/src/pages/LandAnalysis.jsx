import LandForm from '@/components/analysis/LandForm'

export default function LandAnalysis() {
    return (
        <div className="max-w-3xl mx-auto space-y-6">
            {/* Page header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">New Land Analysis</h1>
                <p className="text-sm text-gray-500 mt-1">
                    Enter your land details to get personalized crop recommendations and yield predictions.
                </p>
            </div>

            <LandForm />
        </div>
    )
}
