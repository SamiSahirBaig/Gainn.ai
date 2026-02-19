import React from 'react';

/**
 * NDVIVisualization — displays NDVI satellite health data.
 *
 * Expects props:
 *   ndviFeatures: { current_ndvi, ndvi_mean_12m, ndvi_max_12m, ndvi_min_12m,
 *                   ndvi_trend, vegetation_vigor, healthy_percentage, data_source }
 *   timeSeries:   [{ date, mean_ndvi }, …]
 */

/* ── colour helpers ───────────────────────────────────── */
const healthColor = (v) => {
    if (v >= 0.6) return '#10B981';   // green-500
    if (v >= 0.4) return '#F59E0B';   // amber-500
    if (v >= 0.2) return '#F97316';   // orange-500
    return '#EF4444';                  // red-500
};

const healthLabel = (v) => {
    if (v >= 0.6) return 'Excellent';
    if (v >= 0.4) return 'Good';
    if (v >= 0.2) return 'Fair';
    return 'Poor';
};

/* ── sparkline bar (pure CSS) ─────────────────────────── */
const Bar = ({ value, maxVal = 1 }) => {
    const pct = Math.max(0, Math.min(100, (value / maxVal) * 100));
    return (
        <div style={{
            width: '100%', height: 8, borderRadius: 4,
            background: '#e5e7eb', overflow: 'hidden',
        }}>
            <div style={{
                height: '100%', borderRadius: 4, width: `${pct}%`,
                background: healthColor(value),
                transition: 'width 0.4s ease',
            }} />
        </div>
    );
};

/* ── main component ───────────────────────────────────── */
const NDVIVisualization = ({ ndviFeatures = {}, timeSeries = [] }) => {
    const current = ndviFeatures.current_ndvi ?? 0;
    const trend = ndviFeatures.ndvi_trend ?? 0;
    const vigor = ndviFeatures.vegetation_vigor ?? 0;
    const healthy = ndviFeatures.healthy_percentage ?? 0;
    const source = ndviFeatures.data_source ?? 'unknown';

    return (
        <div style={{
            background: '#fff', borderRadius: 12, padding: 24,
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)', fontFamily: 'Inter, sans-serif',
        }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>
                    🛰️ Vegetation Health (NDVI)
                </h3>
                <span style={{
                    fontSize: 11, padding: '2px 8px', borderRadius: 12,
                    background: source === 'sentinel-2' ? '#DBEAFE' : '#FEF3C7',
                    color: source === 'sentinel-2' ? '#1E40AF' : '#92400E',
                }}>
                    {source === 'sentinel-2' ? 'Satellite' : 'Estimated'}
                </span>
            </div>

            {/* Stat cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
                {/* Current NDVI */}
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 12, color: '#6B7280' }}>Current NDVI</div>
                    <div style={{ fontSize: 32, fontWeight: 700, color: healthColor(current) }}>
                        {current.toFixed(2)}
                    </div>
                    <div style={{ fontSize: 12, color: '#9CA3AF' }}>{healthLabel(current)}</div>
                </div>

                {/* Trend */}
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 12, color: '#6B7280' }}>Trend</div>
                    <div style={{ fontSize: 24, marginTop: 6 }}>
                        {trend > 0 ? '📈' : trend < 0 ? '📉' : '➡️'}
                    </div>
                    <div style={{
                        fontSize: 14, fontWeight: 600,
                        color: trend > 0 ? '#10B981' : trend < 0 ? '#EF4444' : '#6B7280',
                    }}>
                        {trend > 0 ? 'Improving' : trend < 0 ? 'Declining' : 'Stable'}
                    </div>
                </div>

                {/* Healthy area */}
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 12, color: '#6B7280' }}>Healthy Area</div>
                    <div style={{ fontSize: 32, fontWeight: 700, color: '#10B981' }}>
                        {healthy.toFixed(0)}%
                    </div>
                    <div style={{ fontSize: 12, color: '#9CA3AF' }}>NDVI &gt; 0.6</div>
                </div>
            </div>

            {/* 12-month sparkline */}
            {timeSeries.length > 0 && (
                <div>
                    <h4 style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
                        12-Month NDVI History
                    </h4>
                    <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end', height: 80 }}>
                        {timeSeries.map((pt, i) => {
                            const v = pt.mean_ndvi ?? 0;
                            return (
                                <div
                                    key={i}
                                    title={`${pt.date}: ${v.toFixed(2)}`}
                                    style={{
                                        flex: 1, borderRadius: '4px 4px 0 0',
                                        height: `${Math.max(4, v * 100)}%`,
                                        background: healthColor(v),
                                        transition: 'height 0.3s ease',
                                    }}
                                />
                            );
                        })}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#9CA3AF', marginTop: 4 }}>
                        <span>{timeSeries[0]?.date}</span>
                        <span>{timeSeries[timeSeries.length - 1]?.date}</span>
                    </div>
                </div>
            )}

            {/* Info box */}
            <div style={{
                marginTop: 16, padding: 12, borderRadius: 8,
                background: '#EFF6FF', fontSize: 12, color: '#1E40AF', lineHeight: 1.5,
            }}>
                <strong>What is NDVI?</strong> Normalized Difference Vegetation Index measures
                vegetation health from satellite imagery. Values 0.6–1.0 indicate healthy, dense
                vegetation. This data improves crop yield predictions by ~15–20%.
            </div>
        </div>
    );
};

export default NDVIVisualization;
