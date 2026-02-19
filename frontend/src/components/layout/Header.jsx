import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

const navLinks = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/land-analysis', label: 'Land Analysis', icon: '🗺️' },
]

export default function Header({ onMenuToggle }) {
    const location = useLocation()

    return (
        <header className="fixed top-0 left-0 right-0 z-30 bg-white/80 backdrop-blur-lg border-b border-gray-200/60 shadow-sm">
            <div className="flex items-center justify-between h-16 px-4 lg:px-6">
                {/* Left: Hamburger + Logo */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={onMenuToggle}
                        className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                        aria-label="Toggle menu"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>

                    <Link to="/dashboard" className="flex items-center gap-2 group">
                        <span className="text-2xl group-hover:scale-110 transition-transform">🌱</span>
                        <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">
                            Gainn.ai
                        </span>
                    </Link>
                </div>

                {/* Center: Desktop nav links */}
                <nav className="hidden lg:flex items-center gap-1">
                    {navLinks.map((link) => {
                        const isActive = location.pathname === link.path
                        return (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                                        ? 'bg-primary-50 text-primary-700'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                <span className="mr-1.5">{link.icon}</span>
                                {link.label}
                            </Link>
                        )
                    })}
                </nav>

                {/* Right: User area placeholder */}
                <div className="flex items-center gap-3">
                    <button className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors relative">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
                    </button>

                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-sm font-semibold shadow-md shadow-primary-500/20 cursor-pointer hover:scale-105 transition-transform">
                        U
                    </div>
                </div>
            </div>
        </header>
    )
}
