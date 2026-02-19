import { Link, useLocation } from 'react-router-dom'

const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/land-analysis', label: 'Land Analysis', icon: '🗺️' },
    { path: '/results', label: 'Results', icon: '📋' },
    { path: '#', label: 'Crop Recommendations', icon: '🌾', disabled: true },
    { path: '#', label: 'Market Intelligence', icon: '📈', disabled: true },
    { path: '#', label: 'Resource Schedule', icon: '📅', disabled: true },
]

export default function Sidebar({ isOpen, onClose }) {
    const location = useLocation()

    return (
        <>
            {/* Backdrop overlay (mobile) */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden transition-opacity"
                    onClick={onClose}
                />
            )}

            {/* Sidebar panel */}
            <aside
                className={`fixed top-16 left-0 bottom-0 z-40 w-64 bg-white border-r border-gray-200/60 shadow-xl lg:shadow-none transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'
                    } lg:translate-x-0`}
            >
                <div className="flex flex-col h-full">
                    {/* Nav items */}
                    <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                        <p className="px-3 mb-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                            Navigation
                        </p>
                        {menuItems.map((item) => {
                            const isActive = location.pathname === item.path
                            return (
                                <Link
                                    key={item.label}
                                    to={item.disabled ? '#' : item.path}
                                    onClick={item.disabled ? (e) => e.preventDefault() : onClose}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${isActive
                                        ? 'bg-primary-50 text-primary-700 shadow-sm shadow-primary-500/10'
                                        : item.disabled
                                            ? 'text-gray-400 cursor-not-allowed'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                        }`}
                                >
                                    <span className={`text-lg ${isActive ? 'scale-110' : 'group-hover:scale-110'} transition-transform`}>
                                        {item.icon}
                                    </span>
                                    <span>{item.label}</span>
                                    {item.disabled && (
                                        <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-400 font-medium">
                                            Soon
                                        </span>
                                    )}
                                    {isActive && (
                                        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-500" />
                                    )}
                                </Link>
                            )
                        })}
                    </nav>
                </div>
            </aside>
        </>
    )
}
