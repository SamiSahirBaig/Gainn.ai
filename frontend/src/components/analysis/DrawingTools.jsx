import { useCallback } from 'react'
import { Polygon, Polyline, CircleMarker, useMapEvents } from 'react-leaflet'

/**
 * DrawingTools — Custom polygon drawing using native react-leaflet.
 * No dependency on leaflet-draw (avoids Vite ESM issues).
 *
 * How it works:
 *  - User clicks on map to add polygon vertices
 *  - Each click adds a green dot + the polygon shape updates live
 *  - User clicks "Finish" or double-clicks to complete
 *  - The completed polygon triggers onPolygonCreated with coords + area
 *
 * Props:
 *  - points: [[lat, lng], ...] — current polygon vertices
 *  - setPoints: (pts) => void
 *  - isDrawing: boolean
 *  - onFinish: () => void — called when polygon is completed
 */

function MapClickHandler({ isDrawing, onMapClick }) {
    useMapEvents({
        click(e) {
            if (isDrawing) {
                onMapClick(e.latlng.lat, e.latlng.lng)
            }
        },
        dblclick(e) {
            // Prevent zoom on double-click while drawing
            if (isDrawing) {
                e.originalEvent.preventDefault()
            }
        },
    })
    return null
}

export default function DrawingTools({ points, setPoints, isDrawing, onFinish }) {

    const handleMapClick = useCallback((lat, lng) => {
        setPoints((prev) => [...prev, [lat, lng]])
    }, [setPoints])

    return (
        <>
            <MapClickHandler isDrawing={isDrawing} onMapClick={handleMapClick} />

            {/* Show vertices as green dots */}
            {points.map((p, i) => (
                <CircleMarker
                    key={i}
                    center={p}
                    radius={6}
                    pathOptions={{
                        color: '#10b981',
                        fillColor: i === 0 ? '#fff' : '#10b981',
                        fillOpacity: 1,
                        weight: 2,
                    }}
                    eventHandlers={{
                        click: () => {
                            // Click first point to close the polygon
                            if (i === 0 && points.length >= 3) {
                                onFinish()
                            }
                        },
                    }}
                />
            ))}

            {/* Show work-in-progress line while drawing */}
            {isDrawing && points.length >= 2 && (
                <Polyline
                    positions={points}
                    pathOptions={{
                        color: '#10b981',
                        weight: 2,
                        dashArray: '6 4',
                        opacity: 0.7,
                    }}
                />
            )}

            {/* Show completed polygon */}
            {!isDrawing && points.length >= 3 && (
                <Polygon
                    positions={points}
                    pathOptions={{
                        color: '#10b981',
                        weight: 3,
                        fillColor: '#10b981',
                        fillOpacity: 0.15,
                    }}
                />
            )}
        </>
    )
}
