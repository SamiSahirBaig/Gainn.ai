import api from './api'

const analysisService = {
    /** Create a new analysis from land + climate data */
    createAnalysis: (data) => api.post('/api/v1/analyses/', data),

    /** List current user's analyses */
    listAnalyses: (params) => api.get('/api/v1/analyses/', { params }),

    /** Get a single analysis by ID */
    getAnalysis: (analysisId) => api.get(`/api/v1/analyses/${analysisId}`),

    /** Get recommendations from a completed analysis */
    getRecommendations: (analysisId) =>
        api.get(`/api/v1/analyses/${analysisId}/recommendations`),

    /** Get NDVI satellite data for an analysis */
    getNdvi: (analysisId) => api.get(`/api/v1/analyses/${analysisId}/ndvi`),

    /** Run a what-if simulation on an existing analysis */
    simulate: (analysisId, scenario) =>
        api.post(`/api/v1/analyses/${analysisId}/simulate`, scenario),
}

export default analysisService
