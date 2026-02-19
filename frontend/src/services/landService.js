import api from './api'

const landService = {
    /** Get all lands for current user */
    getLands: () => api.get('/api/v1/lands'),

    /** Get a single land by ID */
    getLand: (landId) => api.get(`/api/v1/lands/${landId}`),

    /** Create a new land parcel */
    createLand: (data) => api.post('/api/v1/lands', data),

    /** Update an existing land */
    updateLand: (landId, data) => api.put(`/api/v1/lands/${landId}`, data),

    /** Delete a land parcel */
    deleteLand: (landId) => api.delete(`/api/v1/lands/${landId}`),

    /** Submit land for analysis */
    analyzeLand: (landId) => api.post(`/api/v1/lands/${landId}/analyze`),

    /** Submit a full analysis request (location + soil + climate) */
    submitAnalysis: (data) => api.post('/api/v1/lands/analyze', data),
}

export default landService
