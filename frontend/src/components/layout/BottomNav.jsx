import { Link, useLocation } from 'react-router-dom'

const navItems = [
    { path: '/dashboard', label: 'Home', icon: '🏠' },
    { path: '/land-analysis', label: 'Analyze', icon: '🗺️' },
    { path: '/market', label: 'Market', icon: '📈' },
    { path: '/results', label: 'Results', icon: '📋' },
]

export default function BottomNav() {
    const location = useLocation()

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-gray-200 lg:hidden">
            <div className="flex items-center justify-around h-16 px-2 max-w-lg mx-auto">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-xl min-w-[60px] transition-all duration-200 ${isActive
                                    ? 'text-primary-600 bg-primary-50'
                                    : 'text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            <span className={`text-2xl ${isActive ? 'scale-110' : ''} transition-transform`}>
                                {item.icon}
                            </span>
                            <span className={`text-[10px] font-semibold ${isActive ? 'text-primary-700' : ''}`}>
                                {item.label}
                            </span>
                        </Link>
                    )
                })}
            </div>
        </nav>
    )
}
