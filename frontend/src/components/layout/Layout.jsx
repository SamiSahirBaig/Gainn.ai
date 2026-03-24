import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Header from './Header'
import Sidebar from './Sidebar'
import Footer from './Footer'
import BottomNav from './BottomNav'

export default function Layout() {
    const [sidebarOpen, setSidebarOpen] = useState(false)

    return (
        <div className="min-h-screen bg-gray-50/50">
            <Header onMenuToggle={() => setSidebarOpen((prev) => !prev)} />
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            {/* Main content — offset for fixed header (h-16) and sidebar (w-64 on lg) */}
            <div className="pt-16 lg:pl-64 min-h-screen flex flex-col">
                <main className="flex-1 p-4 lg:p-6 pb-20 lg:pb-6">
                    <Outlet />
                </main>
                <Footer />
            </div>

            {/* Mobile bottom navigation */}
            <BottomNav />
        </div>
    )
}
