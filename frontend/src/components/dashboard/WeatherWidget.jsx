import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import weatherService from '@/services/weatherService'

const TEMP_COLOR = (t) => {
    if (t >= 40) return 'text-red-300'
    if (t >= 35) return 'text-orange-300'
    if (t >= 25) return 'text-yellow-100'
    if (t >= 15) return 'text-white'
    if (t >= 5) return 'text-blue-200'
    return 'text-blue-300'
}

const ACTIVITY_BADGES = {
    good: { bg: 'bg-emerald-400/20', text: 'text-emerald-200', label: '✅ Good for farming' },
    caution: { bg: 'bg-amber-400/20', text: 'text-amber-200', label: '⚠️ Proceed with caution' },
    avoid: { bg: 'bg-red-400/20', text: 'text-red-200', label: '🚫 Avoid outdoor activities' },
}

// Default fallback
const FALLBACK = {
    temp: 28, feels_like: 30, humidity: 65, wind_speed: 12, wind_direction: 'SW',
    description: 'partly cloudy', icon: '⛅', rain_1h: 0, visibility: 10, clouds: 40,
    location_name: 'India', country: 'IN', data_source: 'offline',
}

export default function WeatherWidget() {
    const [weather, setWeather] = useState(null)
    const [forecast, setForecast] = useState(null)
    const [farming, setFarming] = useState(null)
    const [loading, setLoading] = useState(true)
    const [showForecast, setShowForecast] = useState(false)
    const [lastUpdated, setLastUpdated] = useState(null)
    const { t: tr } = useTranslation()

    const fetchWeather = useCallback(async () => {
        setLoading(true)
        let lat = 20.5937, lng = 78.9629 // default central India

        try {
            const stored = localStorage.getItem('gainnai_latest_land')
            if (stored) {
                const land = JSON.parse(stored)
                if (land.latitude) lat = land.latitude
                if (land.longitude) lng = land.longitude
            }
        } catch { /* ignore */ }

        try {
            const res = await weatherService.getCurrentWeather(lat, lng)
            const data = res.data
            setWeather(data.current || FALLBACK)
            setForecast(data.forecast || null)
            setFarming(data.farming || null)
            setLastUpdated(new Date())
        } catch (err) {
            console.warn('Weather fetch failed:', err)
            setWeather(FALLBACK)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { fetchWeather() }, [fetchWeather])

    // Auto-refresh every 30 minutes
    useEffect(() => {
        const interval = setInterval(fetchWeather, 30 * 60 * 1000)
        return () => clearInterval(interval)
    }, [fetchWeather])

    const w = weather || FALLBACK
    const tempColor = TEMP_COLOR(w.temp)
    const activity = ACTIVITY_BADGES[farming?.activity_level] || ACTIVITY_BADGES.good

    return (
        <div className="bg-gradient-to-br from-sky-500 to-blue-600 rounded-2xl shadow-sm text-white overflow-hidden relative">
            {/* Decorative circles */}
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full" />
            <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-white/10 rounded-full" />

            <div className="relative p-5">
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                    <div>
                        <p className="text-sm font-medium text-white/80">{tr('weather.title')}</p>
                        <p className="text-xs text-white/60">
                            {w.location_name}{w.country ? `, ${w.country}` : ''}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={fetchWeather}
                            className="text-white/40 hover:text-white/80 transition-colors text-xs"
                            title="Refresh weather"
                        >
                            🔄
                        </button>
                        <span className="text-4xl">{w.icon}</span>
                    </div>
                </div>

                {/* Temperature */}
                <div className="flex items-end gap-2 mb-0.5">
                    <span className={`text-5xl font-bold tracking-tight ${tempColor}`}>{Math.round(w.temp)}°</span>
                    <span className="text-lg text-white/70 mb-1.5">C</span>
                </div>
                <p className="text-xs text-white/60 mb-3 capitalize">
                    {w.description} • {tr('weather.feelsLike')} {Math.round(w.feels_like)}°C
                </p>

                {/* Stats grid */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm text-white/80 mb-3">
                    <span>💧 {w.humidity}% {tr('weather.humidity')}</span>
                    <span>💨 {w.wind_speed} km/h {w.wind_direction || ''}</span>
                    <span>🌧️ {w.rain_1h || 0} mm {tr('weather.rain')}</span>
                    <span>👁️ {w.visibility || 10} km {tr('weather.visibility')}</span>
                </div>

                {/* Farming tip */}
                {farming && farming.tips?.[0] && (
                    <div className={`${activity.bg} rounded-lg px-3 py-2 mb-3`}>
                        <p className="text-xs font-medium text-white/90">{farming.tips[0]}</p>
                        {farming.irrigation && (
                            <p className="text-[10px] text-white/60 mt-0.5">💧 {farming.irrigation}</p>
                        )}
                    </div>
                )}

                {/* Alerts */}
                {farming?.alerts?.length > 0 && (
                    <div className="space-y-1 mb-3">
                        {farming.alerts.map((alert, i) => (
                            <div key={i} className="bg-red-500/20 rounded-lg px-2.5 py-1.5 flex items-center gap-2">
                                <span className="text-xs">⚠️</span>
                                <p className="text-[11px] text-white/90">{alert.message}</p>
                            </div>
                        ))}
                    </div>
                )}

                {/* Forecast toggle + mini forecast */}
                <div className="border-t border-white/20 pt-3">
                    <button
                        onClick={() => setShowForecast(!showForecast)}
                        className="text-[11px] text-white/60 hover:text-white/90 transition-colors mb-2 flex items-center gap-1"
                    >
                        {showForecast ? '▼' : '▶'} {showForecast ? tr('weather.hideForecast') : tr('weather.showForecast')}
                    </button>

                    {/* Always show 3-day mini */}
                    {!showForecast && forecast?.daily && (
                        <div className="flex justify-between">
                            {forecast.daily.slice(0, 3).map((day, i) => (
                                <div key={i} className="text-center">
                                    <p className="text-xs text-white/60 mb-1">{day.day_name}</p>
                                    <p className="text-lg mb-1">{day.icon}</p>
                                    <p className="text-xs">
                                        <span className="font-semibold">{Math.round(day.temp_max)}°</span>
                                        <span className="text-white/50 ml-1">{Math.round(day.temp_min)}°</span>
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Extended forecast */}
                    {showForecast && forecast?.daily && (
                        <div className="space-y-1.5">
                            {forecast.daily.map((day, i) => (
                                <div key={i} className="flex items-center justify-between text-xs bg-white/5 rounded-lg px-3 py-2">
                                    <span className="w-12 text-white/70">{day.day_name}</span>
                                    <span className="text-lg">{day.icon}</span>
                                    <span className="flex-1 text-center text-white/60 capitalize truncate mx-2">{day.description}</span>
                                    <span className="w-14 text-right">
                                        {day.rain > 0 && <span className="text-blue-200 mr-1">💧{day.rain}mm</span>}
                                    </span>
                                    <span className="w-16 text-right">
                                        <span className="font-semibold">{Math.round(day.temp_max)}°</span>
                                        <span className="text-white/50 ml-1">{Math.round(day.temp_min)}°</span>
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Hourly (first 4) */}
                    {showForecast && forecast?.hourly && (
                        <div className="mt-3 pt-2 border-t border-white/10">
                            <p className="text-[10px] text-white/50 uppercase mb-2">Next 12 hours</p>
                            <div className="flex justify-between">
                                {forecast.hourly.slice(0, 4).map((h, i) => (
                                    <div key={i} className="text-center">
                                        <p className="text-[10px] text-white/50">{h.time}</p>
                                        <p className="text-sm my-0.5">{h.icon}</p>
                                        <p className="text-xs font-medium">{Math.round(h.temp)}°</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Best farming days */}
                    {showForecast && farming?.best_farming_days?.length > 0 && (
                        <div className="mt-3 pt-2 border-t border-white/10">
                            <p className="text-[10px] text-white/50 uppercase mb-1">🌱 Best days for farming</p>
                            <p className="text-xs text-emerald-200">{farming.best_farming_days.join(', ')}</p>
                        </div>
                    )}
                </div>

                {/* Last updated */}
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/10">
                    <p className="text-[9px] text-white/30">
                        {w.data_source === 'openweathermap' ? '🟢 Live' : `🟡 ${tr('weather.estimated')}`}
                        {lastUpdated && ` • ${lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                    </p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${activity.bg} ${activity.text}`}>
                        {activity.label}
                    </span>
                </div>
            </div>
        </div>
    )
}
