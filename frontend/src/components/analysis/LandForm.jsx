import { useState } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import MapSelector from './MapSelector'
import SoilInputs from './SoilInputs'
import ClimateInputs from './ClimateInputs'

const schema = z.object({
    // Step 1 — Location
    latitude: z.number({ invalid_type_error: 'Required' }).min(-90).max(90),
    longitude: z.number({ invalid_type_error: 'Required' }).min(-180).max(180),
    landSize: z.number({ invalid_type_error: 'Required' }).positive('Must be positive'),
    elevation: z.number({ invalid_type_error: 'Required' }).optional(),

    // Step 2 — Soil
    soilType: z.string().min(1, 'Select a soil type'),
    phLevel: z.number({ invalid_type_error: 'Required' }).min(0).max(14, 'Must be 0–14'),
    organicMatter: z.number({ invalid_type_error: 'Required' }).min(0).optional(),
    nitrogen: z.number({ invalid_type_error: 'Required' }).min(0).optional(),
    phosphorus: z.number({ invalid_type_error: 'Required' }).min(0).optional(),
    potassium: z.number({ invalid_type_error: 'Required' }).min(0).optional(),

    // Step 3 — Climate
    avgTemperature: z.number({ invalid_type_error: 'Required' }),
    rainfallPattern: z.string().min(1, 'Select rainfall pattern'),
    irrigationAvailable: z.boolean().optional(),
})

const steps = [
    { id: 0, label: 'Location', icon: '📍', fields: ['latitude', 'longitude', 'landSize', 'elevation'] },
    { id: 1, label: 'Soil', icon: '🧪', fields: ['soilType', 'phLevel', 'organicMatter', 'nitrogen', 'phosphorus', 'potassium'] },
    { id: 2, label: 'Climate', icon: '🌦️', fields: ['avgTemperature', 'rainfallPattern', 'irrigationAvailable'] },
]

export default function LandForm() {
    const [currentStep, setCurrentStep] = useState(0)
    const [submitted, setSubmitted] = useState(false)

    const methods = useForm({
        resolver: zodResolver(schema),
        mode: 'onTouched',
        defaultValues: {
            irrigationAvailable: false,
        },
    })

    const { handleSubmit, trigger } = methods

    const handleNext = async () => {
        const fieldsToValidate = steps[currentStep].fields
        const valid = await trigger(fieldsToValidate)
        if (valid) setCurrentStep((s) => Math.min(s + 1, steps.length - 1))
    }

    const handleBack = () => setCurrentStep((s) => Math.max(s - 1, 0))

    const onSubmit = (data) => {
        console.log('🌾 Land Analysis Submitted:', data)
        setSubmitted(true)
    }

    if (submitted) {
        return (
            <div className="text-center py-16 space-y-4">
                <div className="w-16 h-16 mx-auto bg-primary-50 rounded-full flex items-center justify-center text-3xl">
                    ✅
                </div>
                <h2 className="text-xl font-bold text-gray-900">Analysis Submitted!</h2>
                <p className="text-sm text-gray-500 max-w-md mx-auto">
                    Your land analysis request has been received. Results will appear on your dashboard once processing is complete.
                </p>
                <button
                    onClick={() => { setSubmitted(false); setCurrentStep(0); methods.reset() }}
                    className="mt-4 px-6 py-2.5 bg-primary-500 text-white rounded-xl text-sm font-medium hover:bg-primary-600 transition-colors shadow-sm shadow-primary-500/20"
                >
                    Start New Analysis
                </button>
            </div>
        )
    }

    return (
        <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Progress bar */}
                <div className="flex items-center gap-2">
                    {steps.map((step, i) => (
                        <div key={step.id} className="flex items-center flex-1">
                            <button
                                type="button"
                                onClick={() => i < currentStep && setCurrentStep(i)}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all w-full ${i === currentStep
                                        ? 'bg-primary-50 text-primary-700 shadow-sm'
                                        : i < currentStep
                                            ? 'text-primary-600 hover:bg-primary-50/50 cursor-pointer'
                                            : 'text-gray-400 cursor-default'
                                    }`}
                            >
                                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${i === currentStep
                                        ? 'bg-primary-500 text-white'
                                        : i < currentStep
                                            ? 'bg-primary-100 text-primary-600'
                                            : 'bg-gray-100 text-gray-400'
                                    }`}>
                                    {i < currentStep ? '✓' : step.icon}
                                </span>
                                <span className="hidden sm:inline">{step.label}</span>
                            </button>
                            {i < steps.length - 1 && (
                                <div className={`hidden sm:block w-8 h-0.5 mx-1 flex-shrink-0 rounded ${i < currentStep ? 'bg-primary-300' : 'bg-gray-200'
                                    }`} />
                            )}
                        </div>
                    ))}
                </div>

                {/* Step content */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6">
                    {currentStep === 0 && <MapSelector />}
                    {currentStep === 1 && <SoilInputs />}
                    {currentStep === 2 && <ClimateInputs />}
                </div>

                {/* Navigation buttons */}
                <div className="flex items-center justify-between">
                    <button
                        type="button"
                        onClick={handleBack}
                        disabled={currentStep === 0}
                        className="px-5 py-2.5 rounded-xl text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                        ← Back
                    </button>

                    {currentStep < steps.length - 1 ? (
                        <button
                            type="button"
                            onClick={handleNext}
                            className="px-5 py-2.5 rounded-xl text-sm font-medium bg-primary-500 text-white hover:bg-primary-600 transition-colors shadow-sm shadow-primary-500/20"
                        >
                            Next →
                        </button>
                    ) : (
                        <button
                            type="submit"
                            className="px-6 py-2.5 rounded-xl text-sm font-medium bg-gradient-to-r from-primary-500 to-emerald-500 text-white hover:from-primary-600 hover:to-emerald-600 transition-all shadow-md shadow-primary-500/20"
                        >
                            🔬 Submit Analysis
                        </button>
                    )}
                </div>
            </form>
        </FormProvider>
    )
}
