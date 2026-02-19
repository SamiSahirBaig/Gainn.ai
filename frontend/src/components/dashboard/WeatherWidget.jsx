const forecast = [
    { day: 'Today', icon: '☀️', high: 32, low: 22 },
    { day: 'Tue', icon: '⛅', high: 30, low: 21 },
    { day: 'Wed', icon: '🌧️', high: 27, low: 19 },
]

export default function WeatherWidget() {
    return (
        <div className="bg-gradient-to-br from-sky-500 to-blue-600 rounded-2xl shadow-sm p-5 text-white overflow-hidden relative">
            {/* Decorative circles */}
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full" />
            <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-white/10 rounded-full" />

            <div className="relative">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <p className="text-sm font-medium text-white/80">Current Weather</p>
                        <p className="text-xs text-white/60">Pune, India</p>
                    </div>
                    <span className="text-4xl">☀️</span>
                </div>

                <div className="flex items-end gap-2 mb-1">
                    <span className="text-5xl font-bold tracking-tight">32°</span>
                    <span className="text-lg text-white/70 mb-1.5">C</span>
                </div>.

                <div className="flex items-center gap-4 text-sm text-white/80 mb-5">
                    <span>💧 45% Humidity</span>
                    <span>💨 12 km/h</span>
                </div>

                <div className="border-t border-white/20 pt-3">
                    <div className="flex justify-between">
                        {forecast.map((day) => (
                            <div key={day.day} className="text-center">
                                <p className="text-xs text-white/60 mb-1">{day.day}</p>
                                <p className="text-lg mb-1">{day.icon}</p>
                                <p className="text-xs">
                                    <span className="font-semibold">{day.high}°</span>
                                    <span className="text-white/50 ml-1">{day.low}°</span>
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
