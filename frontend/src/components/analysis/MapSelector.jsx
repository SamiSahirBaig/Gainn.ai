import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import { useFormContext } from 'react-hook-form'

function LocationMarker() {
    const { setValue, watch } = useFormContext()
    const lat = watch('latitude')
    const lng = watch('longitude')
    const [position, setPosition] = useState(lat && lng ? [lat, lng] : null)

    useMapEvents({
        click(e) {
            const { lat, lng } = e.latlng
            setPosition([lat, lng])
            setValue('latitude', parseFloat(lat.toFixed(6)), { shouldValidate: true })
            setValue('longitude', parseFloat(lng.toFixed(6)), { shouldValidate: true })
        },
    })

    useEffect(() => {
        if (lat && lng) setPosition([lat, lng])
    }, [lat, lng])

    return position ? <Marker position={position} /> : null
}

export default function MapSelector() {
    const { register, watch, formState: { errors } } = useFormContext()
    const lat = watch('latitude')
    const lng = watch('longitude')

    return (
        <div className="space-y-5">
            <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">📍 Select Location</h3>
                <p className="text-sm text-gray-500">Click on the map to select your land location, then fill in the details below.</p>
            </div>

            {/* Map */}
            <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm" style={{ height: '320px' }}>
                <MapContainer
                    center={[20.5937, 78.9629]}
                    zoom={5}
                    scrollWheelZoom={true}
                    style={{ height: '100%', width: '100%' }}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <LocationMarker />
                </MapContainer>
            </div>

            {/* Coordinates display */}
            {lat && lng && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-primary-50 text-sm text-primary-700">
                    <span>📌</span>
                    <span className="font-medium">Selected:</span>
                    <span>{lat}, {lng}</span>
                </div>
            )}

            {/* Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                    <input
                        type="number"
                        step="any"
                        {...register('latitude', { valueAsNumber: true })}
                        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                        placeholder="e.g. 20.5937"
                    />
                    {errors.latitude && <p className="mt-1 text-xs text-red-500">{errors.latitude.message}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                    <input
                        type="number"
                        step="any"
                        {...register('longitude', { valueAsNumber: true })}
                        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                        placeholder="e.g. 78.9629"
                    />
                    {errors.longitude && <p className="mt-1 text-xs text-red-500">{errors.longitude.message}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Land Size (hectares)</label>
                    <input
                        type="number"
                        step="0.01"
                        {...register('landSize', { valueAsNumber: true })}
                        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                        placeholder="e.g. 5.5"
                    />
                    {errors.landSize && <p className="mt-1 text-xs text-red-500">{errors.landSize.message}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Elevation (meters)</label>
                    <input
                        type="number"
                        {...register('elevation', { valueAsNumber: true })}
                        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                        placeholder="e.g. 450"
                    />
                    {errors.elevation && <p className="mt-1 text-xs text-red-500">{errors.elevation.message}</p>}
                </div>
            </div>
        </div>
    )
}
