const schedule = [
    { phase: 'Land Preparation', period: 'Week 1–2', icon: '🚜', color: 'bg-amber-500', tasks: ['Plowing', 'Leveling', 'Soil treatment'] },
    { phase: 'Sowing', period: 'Week 3', icon: '🌱', color: 'bg-emerald-500', tasks: ['Seed selection', 'Sowing', 'Initial watering'] },
    { phase: 'Growth & Irrigation', period: 'Week 4–10', icon: '💧', color: 'bg-blue-500', tasks: ['Regular irrigation', 'Weed control', 'Pest monitoring'] },
    { phase: 'Fertilization', period: 'Week 6, 9', icon: '🧪', color: 'bg-purple-500', tasks: ['NPK application', 'Micronutrients', 'Soil testing'] },
    { phase: 'Harvest', period: 'Week 14–16', icon: '🌾', color: 'bg-orange-500', tasks: ['Maturity check', 'Harvesting', 'Post-harvest storage'] },
]

export default function ResourceSchedule() {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="mb-5">
                <h3 className="font-semibold text-gray-900">Resource Schedule</h3>
                <p className="text-xs text-gray-400 mt-0.5">Recommended farming timeline for the top crop</p>
            </div>

            <div className="relative">
                {/* Vertical timeline line */}
                <div className="absolute left-[18px] top-3 bottom-3 w-0.5 bg-gray-100" />

                <div className="space-y-5">
                    {schedule.map((item, i) => (
                        <div key={item.phase} className="flex gap-4 group">
                            {/* Timeline dot */}
                            <div className="relative z-10 flex-shrink-0">
                                <div className={`w-9 h-9 rounded-full ${item.color} flex items-center justify-center text-sm shadow-sm group-hover:scale-110 transition-transform`}>
                                    {item.icon}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 pb-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <h4 className="text-sm font-semibold text-gray-900">{item.phase}</h4>
                                    <span className="text-[11px] text-gray-400 font-medium">{item.period}</span>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                    {item.tasks.map((task) => (
                                        <span
                                            key={task}
                                            className="text-[11px] px-2 py-0.5 rounded-full bg-gray-50 text-gray-500 border border-gray-100"
                                        >
                                            {task}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
