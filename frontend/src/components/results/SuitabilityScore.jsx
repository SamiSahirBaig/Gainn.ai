export default function SuitabilityScore({ score, label, size = 80 }) {
    const radius = (size - 8) / 2
    const circumference = 2 * Math.PI * radius
    const progress = (score / 100) * circumference
    const remaining = circumference - progress

    const color =
        score >= 70 ? '#22c55e' : score >= 40 ? '#f59e0b' : '#ef4444'
    const bgColor =
        score >= 70 ? '#f0fdf4' : score >= 40 ? '#fffbeb' : '#fef2f2'

    return (
        <div className="flex flex-col items-center gap-1.5">
            <div className="relative" style={{ width: size, height: size }}>
                <svg width={size} height={size} className="-rotate-90">
                    {/* Background circle */}
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill={bgColor}
                        stroke="#e5e7eb"
                        strokeWidth={4}
                    />
                    {/* Progress arc */}
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke={color}
                        strokeWidth={4}
                        strokeLinecap="round"
                        strokeDasharray={`${progress} ${remaining}`}
                        className="transition-all duration-700 ease-out"
                    />
                </svg>
                {/* Score text */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold" style={{ color }}>{score}</span>
                </div>
            </div>
            {label && <span className="text-xs text-gray-500 font-medium">{label}</span>}
        </div>
    )
}
