import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import MapSelector from './MapSelector'
import SoilInputs from './SoilInputs'
import ClimateInputs from './ClimateInputs'
import landService from '@/services/landService'
import analysisService from '@/services/analysisService'

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

const RAINFALL_MAP = { low: 500, moderate: 900, high: 1500, 'very-high': 2200 }

const steps = [
    { id: 0, label: 'Location', icon: '📍', fields: ['latitude', 'longitude', 'landSize', 'elevation'] },
    { id: 1, label: 'Soil', icon: '🧪', fields: ['soilType', 'phLevel', 'organicMatter', 'nitrogen', 'phosphorus', 'potassium'] },
    { id: 2, label: 'Climate', icon: '🌦️', fields: ['avgTemperature', 'rainfallPattern', 'irrigationAvailable'] },
]

export default function LandForm() {
    const [currentStep, setCurrentStep] = useState(0)
    const [submitted, setSubmitted] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const navigate = useNavigate()

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

    const onSubmit = async (data) => {
        setLoading(true)
        setError(null)

        try {
            // Step 1: Create the land parcel
            const landPayload = {
                name: `Land at ${data.latitude.toFixed(3)}, ${data.longitude.toFixed(3)}`,
                latitude: data.latitude,
                longitude: data.longitude,
                size: data.landSize,
                elevation: data.elevation || null,
                soil_type: data.soilType,
                soil_ph: data.phLevel,
                organic_matter: data.organicMatter || null,
                nitrogen: data.nitrogen || null,
                phosphorus: data.phosphorus || null,
                potassium: data.potassium || null,
                irrigation_available: data.irrigationAvailable || false,
            }

            const landRes = await landService.createLand(landPayload)
            const land = landRes.data?.data || landRes.data

            // Store land coordinates IMMEDIATELY so NearbyMarkets + WeatherWidget
            // use this location even if the analysis step is slow/fails
            localStorage.setItem('gainnai_latest_land', JSON.stringify({
                latitude: data.latitude,
                longitude: data.longitude,
                size: data.landSize,
                name: landPayload.name,
            }))

            // Step 2: Create an analysis on the land
            const analysisPayload = {
                land_id: land.id,
                input_data: {
                    temperature: data.avgTemperature,
                    rainfall: RAINFALL_MAP[data.rainfallPattern] || 1000,
                },
            }

            const analysisRes = await analysisService.createAnalysis(analysisPayload)
            const analysis = analysisRes.data?.data || analysisRes.data

            // Store latest analysis ID for the Results page
            localStorage.setItem('gainnai_latest_analysis', JSON.stringify({
                id: analysis.id,
                land_id: land.id,
                created_at: new Date().toISOString(),
            }))

            setSubmitted(true)

            // Navigate to results after brief delay
            setTimeout(() => navigate('/results'), 1500)
        } catch (err) {
            console.error('Analysis submission failed:', err)
            setError(err.message || err.detail || 'Failed to submit analysis. Make sure you are logged in.')
        } finally {
            setLoading(false)
        }
    }

    if (submitted) {
        return (
            <div className="text-center py-16 space-y-4">
                <div className="w-16 h-16 mx-auto bg-primary-50 rounded-full flex items-center justify-center text-3xl">
                    ✅
                </div>
                <h2 className="text-xl font-bold text-gray-900">Analysis Submitted!</h2>
                <p className="text-sm text-gray-500 max-w-md mx-auto">
                    Your land analysis is complete. Redirecting to results…
                </p>
            </div>
        )
    }

    return (
        <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Error */}
                {error && (
                    <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600">
                        {error}
                    </div>
                )}

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
                            disabled={loading}
                            className="px-6 py-2.5 rounded-xl text-sm font-medium bg-gradient-to-r from-primary-500 to-emerald-500 text-white hover:from-primary-600 hover:to-emerald-600 transition-all shadow-md shadow-primary-500/20 disabled:opacity-50"
                        >
                            {loading ? '⏳ Analyzing…' : '🔬 Submit Analysis'}
                        </button>
                    )}
                </div>
            </form>
        </FormProvider>
    )
}
