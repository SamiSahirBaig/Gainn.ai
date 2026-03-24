import api from './api'

const cropService = {
    /** Get crop recommendations from a completed analysis */
    getRecommendations: (analysisId) =>
        api.get(`/api/v1/analyses/${analysisId}/recommendations`),

    /** Get all available crops (from ML data — no dedicated endpoint yet) */
    getAllCrops: () => api.get('/api/v1/analyses/'),

    /** Get NDVI data for an analysis */
    getNdvi: (analysisId) => api.get(`/api/v1/analyses/${analysisId}/ndvi`),
}

export default cropService

