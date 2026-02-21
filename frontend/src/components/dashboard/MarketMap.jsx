import { useEffect, useRef } from 'react'

/**
 * MarketMap — Leaflet map showing user land + nearby market pins.
 *
 * Props:
 *  - userLat, userLng: land location
 *  - markets: array of market objects with lat/lng
 *  - radiusKm: search radius
 *  - selectedMarket: currently selected market id
 *  - onMarketSelect: callback when a pin is clicked
 */
export default function MarketMap({
    userLat = 20.5937,
    userLng = 78.9629,
    markets = [],
    radiusKm = 50,
    selectedMarket = null,
    onMarketSelect = () => { },
}) {
    const mapRef = useRef(null)
    const mapInstanceRef = useRef(null)
    const markersRef = useRef([])

    useEffect(() => {
        // Dynamic import to avoid SSR issues
        let cancelled = false

        async function initMap() {
            const L = await import('leaflet')
            await import('leaflet/dist/leaflet.css')

            if (cancelled || !mapRef.current) return

            // Cleanup previous
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove()
                mapInstanceRef.current = null
            }

            const map = L.map(mapRef.current, {
                center: [userLat, userLng],
                zoom: 8,
                zoomControl: true,
                attributionControl: false,
            })

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 18,
            }).addTo(map)

            mapInstanceRef.current = map

            // User land marker (green)
            const landIcon = L.divIcon({
                html: '<div style="background:#22c55e;width:16px;height:16px;border-radius:50%;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>',
                iconSize: [16, 16],
                iconAnchor: [8, 8],
                className: '',
            })
            L.marker([userLat, userLng], { icon: landIcon })
                .addTo(map)
                .bindTooltip('Your Land', { permanent: false, direction: 'top' })

            // Radius circle
            L.circle([userLat, userLng], {
                radius: radiusKm * 1000,
                color: '#22c55e',
                fillColor: '#22c55e',
                fillOpacity: 0.04,
                weight: 1.5,
                dashArray: '6 4',
            }).addTo(map)

            // Market markers
            markersRef.current = []
            markets.forEach(m => {
                const isSelected = m.id === selectedMarket
                const markerIcon = L.divIcon({
                    html: `<div style="
                        background:${isSelected ? '#f97316' : '#3b82f6'};
                        width:${isSelected ? '14px' : '10px'};
                        height:${isSelected ? '14px' : '10px'};
                        border-radius:50%;
                        border:2px solid white;
                        box-shadow:0 2px 4px rgba(0,0,0,0.3);
                        transition: all 0.2s;
                    "></div>`,
                    iconSize: [isSelected ? 14 : 10, isSelected ? 14 : 10],
                    iconAnchor: [isSelected ? 7 : 5, isSelected ? 7 : 5],
                    className: '',
                })

                const topPrice = m.prices?.[0]
                const tooltipText = `<div style="font-size:12px;line-height:1.3">
                    <b>${m.name}</b><br/>
                    ${m.distance_km} km • ~${m.travel_time_min} min${topPrice ? `<br/>${topPrice.crop}: ₹${(topPrice.price_per_ton / 1000).toFixed(0)}k/t` : ''}
                </div>`

                const marker = L.marker([m.lat, m.lng], { icon: markerIcon })
                    .addTo(map)
                    .bindTooltip(tooltipText, { direction: 'top' })
                    .on('click', () => onMarketSelect(m))

                markersRef.current.push(marker)
            })

            // Fit bounds if we have markets
            if (markets.length > 0) {
                const allPoints = [[userLat, userLng], ...markets.map(m => [m.lat, m.lng])]
                map.fitBounds(allPoints, { padding: [30, 30] })
            }
        }

        initMap()

        return () => {
            cancelled = true
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove()
                mapInstanceRef.current = null
            }
        }
    }, [userLat, userLng, markets, radiusKm, selectedMarket])

    return (
        <div
            ref={mapRef}
            className="w-full h-64 rounded-xl overflow-hidden border border-gray-100"
            style={{ minHeight: '260px' }}
        />
    )
}
