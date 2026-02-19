import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from '@/components/layout/Layout'
import Dashboard from '@/pages/Dashboard'
import LandAnalysis from '@/pages/LandAnalysis'
import Results from '@/pages/Results'

function NotFoundPage() {
    return (
        <div className="flex flex-col items-center justify-center py-20">
            <h1 className="text-7xl font-bold text-gray-200">404</h1>
            <p className="text-xl text-gray-500 mt-2">Page not found</p>
            <a
                href="/dashboard"
                className="mt-6 px-6 py-2.5 bg-primary-500 text-white rounded-xl text-sm font-medium hover:bg-primary-600 transition-colors shadow-sm shadow-primary-500/20"
            >
                Go to Dashboard
            </a>
        </div>
    )
}

export default function App() {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route element={<Layout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/land-analysis" element={<LandAnalysis />} />
                <Route path="/results" element={<Results />} />
                <Route path="*" element={<NotFoundPage />} />
            </Route>
        </Routes>
    )
}
