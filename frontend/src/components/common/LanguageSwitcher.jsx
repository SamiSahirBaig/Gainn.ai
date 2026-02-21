import { useTranslation } from 'react-i18next'
import { useState, useRef, useEffect } from 'react'

const languages = [
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'hi', label: 'हिन्दी', flag: '🇮🇳' },
    { code: 'mr', label: 'मराठी', flag: '🇮🇳' },
    { code: 'te', label: 'తెలుగు', flag: '🇮🇳' },
]

export default function LanguageSwitcher() {
    const { i18n } = useTranslation()
    const [open, setOpen] = useState(false)
    const ref = useRef(null)

    const current = languages.find(l => l.code === i18n.language) || languages[0]

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false)
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const changeLanguage = (code) => {
        i18n.changeLanguage(code)
        localStorage.setItem('gainnai_language', code)
        setOpen(false)
    }

    return (
        <div ref={ref} className="relative">
            <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium bg-white/80 hover:bg-white border border-gray-200 shadow-sm transition-all duration-200 hover:shadow"
                title="Change language"
            >
                <span className="text-base">{current.flag}</span>
                <span className="hidden sm:inline text-gray-700">{current.label}</span>
                <svg className={`w-3.5 h-3.5 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {open && (
                <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-lg border border-gray-100 py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    {languages.map(lang => (
                        <button
                            key={lang.code}
                            onClick={() => changeLanguage(lang.code)}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${lang.code === i18n.language
                                    ? 'bg-primary-50 text-primary-700 font-semibold'
                                    : 'text-gray-700 hover:bg-gray-50'
                                }`}
                        >
                            <span className="text-base">{lang.flag}</span>
                            <span>{lang.label}</span>
                            {lang.code === i18n.language && (
                                <span className="ml-auto text-primary-500">✓</span>
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}
