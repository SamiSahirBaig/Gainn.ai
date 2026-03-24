import { useCallback, useState } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import { useFormContext } from 'react-hook-form'
import DrawingTools from './DrawingTools'
import LandDataPanel from './LandDataPanel'
import api from '@/services/api'

/**
 * LocationMarker — click-to-place a single marker (point mode).
 */
function LocationMarker({ onLocationSet }) {
    const { setValue, watch } = useFormContext()
    const lat = watch('latitude')
    const lng = watch('longitude')
    const [position, setPosition] = useState(
        typeof lat === 'number' && !isNaN(lat) && typeof lng === 'number' && !isNaN(lng)
            ? [lat, lng]
            : null
    )

    useMapEvents({
        click(e) {
            const { lat: clickLat, lng: clickLng } = e.latlng
            setPosition([clickLat, clickLng])
            setValue('latitude', parseFloat(clickLat.toFixed(6)), { shouldValidate: true })
            setValue('longitude', parseFloat(clickLng.toFixed(6)), { shouldValidate: true })
            onLocationSet?.(clickLat, clickLng)
        },
    })

    return position ? <Marker position={position} /> : null
}

/**
 * Shoelace-on-sphere area calc.
 */
function calcAreaHectares(pts) {
    const toRad = (d) => (d * Math.PI) / 180
    const R = 6378137
    let area = 0
    const n = pts.length
    for (let i = 0; i < n; i++) {
        const j = (i + 1) % n
        const lat1 = toRad(pts[i][0])
        const lat2 = toRad(pts[j][0])
        const dLon = toRad(pts[j][1] - pts[i][1])
        area += dLon * (2 + Math.sin(lat1) + Math.sin(lat2))
    }
    area = (Math.abs(area) * R * R) / 2
    return Math.round((area / 10000) * 100) / 100
}

/**
 * MapSelector — Interactive map with two modes:
 *   1. Draw mode: click points to draw a polygon boundary
 *   2. Click mode: click a single point
 */
export default function MapSelector() {
    const { register, watch, setValue, formState: { errors } } = useFormContext()
    const lat = watch('latitude')
    const lng = watch('longitude')

    const [mode, setMode] = useState('draw')
    const [isDrawing, setIsDrawing] = useState(false)
    const [drawPoints, setDrawPoints] = useState([])
    const [locationData, setLocationData] = useState(null)
    const [fetchLoading, setFetchLoading] = useState(false)
    const [fetchError, setFetchError] = useState(null)
    const [polygonCoords, setPolygonCoords] = useState(null)

    const hasValidCoords =
        typeof lat === 'number' && !isNaN(lat) &&
        typeof lng === 'number' && !isNaN(lng)

    const handleNumberChange = (fieldName) => (e) => {
        const raw = e.target.value
        if (raw === '' || raw === '-') return
        const num = parseFloat(raw)
        if (!isNaN(num)) {
            setValue(fieldName, num, { shouldValidate: true })
        }
    }

    // ── Auto-fetch location data ──────────────────────

    const fetchLocationData = useCallback(async (payload) => {
        setFetchLoading(true)
        setFetchError(null)
        try {
            const resp = await api.post('/api/v1/lands/analyze-location', payload)
            const data = resp.data
            setLocationData(data)

            if (data.area_hectares) {
                setValue('landSize', data.area_hectares, { shouldValidate: true })
            }
            if (data.centroid) {
                setValue('latitude', data.centroid.latitude, { shouldValidate: true })
                setValue('longitude', data.centroid.longitude, { shouldValidate: true })
            }
            if (data.elevation?.elevation_meters != null) {
                setValue('elevation', data.elevation.elevation_meters, { shouldValidate: true })
            }
            if (data.soil) {
                if (data.soil.soil_type) setValue('soilType', data.soil.soil_type, { shouldValidate: true })
                if (data.soil.ph_level != null) setValue('phLevel', data.soil.ph_level, { shouldValidate: true })
                if (data.soil.organic_matter != null) setValue('organicMatter', data.soil.organic_matter, { shouldValidate: true })
                if (data.soil.nitrogen != null) setValue('nitrogen', data.soil.nitrogen, { shouldValidate: true })
                if (data.soil.phosphorus != null) setValue('phosphorus', data.soil.phosphorus, { shouldValidate: true })
                if (data.soil.potassium != null) setValue('potassium', data.soil.potassium, { shouldValidate: true })
            }
            if (data.climate) {
                if (data.climate.temperature != null) setValue('avgTemperature', data.climate.temperature, { shouldValidate: true })
                if (data.climate.rainfall_pattern) setValue('rainfallPattern', data.climate.rainfall_pattern, { shouldValidate: true })
            }
        } catch (err) {
            console.error('Location analysis failed:', err)
            setFetchError(err.message || 'Failed to fetch location data')
        } finally {
            setFetchLoading(false)
        }
    }, [setValue])

    // ── Drawing handlers ──────────────────────────────

    const handleStartDraw = useCallback(() => {
        setIsDrawing(true)
        setDrawPoints([])
        setPolygonCoords(null)
        setLocationData(null)
    }, [])

    const handleFinishDraw = useCallback(() => {
        if (drawPoints.length < 3) return
        setIsDrawing(false)
        setPolygonCoords(drawPoints)
        fetchLocationData({ polygon: drawPoints })
    }, [drawPoints, fetchLocationData])

    const handleUndoPoint = useCallback(() => {
        setDrawPoints((prev) => prev.slice(0, -1))
    }, [])

    const handleClearDraw = useCallback(() => {
        setIsDrawing(false)
        setDrawPoints([])
        setPolygonCoords(null)
        setLocationData(null)
    }, [])

    // ── Click mode handler ────────────────────────────

    const handleLocationSet = useCallback((clickLat, clickLng) => {
        fetchLocationData({ latitude: clickLat, longitude: clickLng })
    }, [fetchLocationData])

    // ── Live area preview while drawing ───────────────

    const liveArea = drawPoints.length >= 3 ? calcAreaHectares(drawPoints) : null

    return (
        <div className="space-y-5">
            <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">📍 Select Your Land</h3>
                <p className="text-sm text-gray-500">
                    {mode === 'draw'
                        ? 'Click points on the map to outline your land. Click as many points as you need, then press "Finish Drawing".'
                        : 'Click on the map to select your land location, then fill in the details below.'
                    }
                </p>
            </div>

            {/* Mode toggle */}
            <div className="flex items-center gap-3">
                <div className="flex rounded-lg bg-gray-100 p-0.5">
                    <button
                        type="button"
                        onClick={() => { setMode('draw'); handleClearDraw() }}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${mode === 'draw'
                                ? 'bg-white text-primary-700 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        ✏️ Draw Boundary
                    </button>
                    <button
                        type="button"
                        onClick={() => { setMode('click'); handleClearDraw() }}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${mode === 'click'
                                ? 'bg-white text-primary-700 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        📌 Click Point
                    </button>
                </div>

                {/* Draw mode controls */}
                {mode === 'draw' && (
                    <div className="flex items-center gap-2">
                        {!isDrawing && !polygonCoords && (
                            <button
                                type="button"
                                onClick={handleStartDraw}
                                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-500 text-white hover:bg-emerald-600 transition-colors shadow-sm"
                            >
                                🖊 Start Drawing
                            </button>
                        )}
                        {isDrawing && (
                            <>
                                <span className="text-xs text-gray-500">
                                    {drawPoints.length} point{drawPoints.length !== 1 ? 's' : ''}
                                    {liveArea && <span className="ml-1 font-semibold text-primary-600">≈ {liveArea} ha</span>}
                                </span>
                                {drawPoints.length > 0 && (
                                    <button
                                        type="button"
                                        onClick={handleUndoPoint}
                                        className="px-2 py-1 rounded-md text-xs font-medium bg-gray-200 text-gray-600 hover:bg-gray-300 transition-colors"
                                    >
                                        ↩ Undo
                                    </button>
                                )}
                                {drawPoints.length >= 3 && (
                                    <button
                                        type="button"
                                        onClick={handleFinishDraw}
                                        className="px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-500 text-white hover:bg-emerald-600 transition-colors shadow-sm animate-pulse"
                                    >
                                        ✅ Finish Drawing
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={handleClearDraw}
                                    className="px-2 py-1 rounded-md text-xs font-medium text-red-500 hover:bg-red-50 transition-colors"
                                >
                                    ✕ Cancel
                                </button>
                            </>
                        )}
                        {polygonCoords && !isDrawing && (
                            <button
                                type="button"
                                onClick={handleStartDraw}
                                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-200 text-gray-600 hover:bg-gray-300 transition-colors"
                            >
                                🔄 Redraw
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Drawing instructions */}
            {mode === 'draw' && isDrawing && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 text-xs text-blue-700 border border-blue-100">
                    <span>💡</span>
                    <span>
                        Click on the map to add boundary points. Add as many as you need.
                        {drawPoints.length < 3
                            ? ` Need at least ${3 - drawPoints.length} more point${3 - drawPoints.length !== 1 ? 's' : ''}.`
                            : ' Click "Finish Drawing" when done, or click the first point (white dot) to close.'
                        }
                    </span>
                </div>
            )}

            {/* Map */}
            <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm" style={{ height: '400px' }}>
                <MapContainer
                    center={[20.5937, 78.9629]}
                    zoom={5}
                    scrollWheelZoom={true}
                    doubleClickZoom={!isDrawing}
                    style={{ height: '100%', width: '100%' }}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {mode === 'draw' && (
                        <DrawingTools
                            points={drawPoints}
                            setPoints={setDrawPoints}
                            isDrawing={isDrawing}
                            onFinish={handleFinishDraw}
                        />
                    )}
                    {mode === 'click' && (
                        <LocationMarker onLocationSet={handleLocationSet} />
                    )}
                </MapContainer>
            </div>

            {/* Status indicators */}
            {(hasValidCoords || polygonCoords) && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-primary-50 text-sm text-primary-700">
                    <span>📌</span>
                    <span className="font-medium">
                        {polygonCoords
                            ? `${polygonCoords.length}-point boundary`
                            : 'Point selected'
                        }
                    </span>
                    {hasValidCoords && <span>@ {lat?.toFixed(4)}, {lng?.toFixed(4)}</span>}
                    {locationData?.area_hectares && (
                        <span className="ml-auto font-bold text-primary-800">
                            {locationData.area_hectares} ha
                        </span>
                    )}
                </div>
            )}

            {/* Auto-fetched data panel */}
            <LandDataPanel
                data={locationData}
                loading={fetchLoading}
                error={fetchError}
            />

            {/* Manual fields (always available for override) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Latitude
                        {locationData?.centroid && <span className="ml-1 text-[10px] text-emerald-600 font-normal">✓ auto</span>}
                    </label>
                    <input
                        type="number"
                        step="any"
                        {...register('latitude', { valueAsNumber: true })}
                        onChange={handleNumberChange('latitude')}
                        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                        placeholder="e.g. 20.5937"
                    />
                    {errors.latitude && <p className="mt-1 text-xs text-red-500">{errors.latitude.message || 'Required'}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Longitude
                        {locationData?.centroid && <span className="ml-1 text-[10px] text-emerald-600 font-normal">✓ auto</span>}
                    </label>
                    <input
                        type="number"
                        step="any"
                        {...register('longitude', { valueAsNumber: true })}
                        onChange={handleNumberChange('longitude')}
                        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                        placeholder="e.g. 78.9629"
                    />
                    {errors.longitude && <p className="mt-1 text-xs text-red-500">{errors.longitude.message || 'Required'}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Land Size (hectares)
                        {locationData?.area_hectares && <span className="ml-1 text-[10px] text-emerald-600 font-normal">✓ auto</span>}
                    </label>
                    <input
                        type="number"
                        step="0.01"
                        {...register('landSize', { valueAsNumber: true })}
                        onChange={handleNumberChange('landSize')}
                        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                        placeholder="e.g. 5.5"
                    />
                    {errors.landSize && <p className="mt-1 text-xs text-red-500">{errors.landSize.message || 'Required'}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Elevation (meters)
                        {locationData?.elevation && <span className="ml-1 text-[10px] text-emerald-600 font-normal">✓ auto</span>}
                    </label>
                    <input
                        type="number"
                        {...register('elevation', { valueAsNumber: true })}
                        onChange={handleNumberChange('elevation')}
                        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                        placeholder="e.g. 450"
                    />
                    {errors.elevation && <p className="mt-1 text-xs text-red-500">{errors.elevation.message || 'Required'}</p>}
                </div>
            </div>
        </div>
    )
}
