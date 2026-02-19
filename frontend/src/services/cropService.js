import api from './api'

const cropService = {
    /** Get crop recommendations for a land */
    getRecommendations: (landId) => api.get(`/api/v1/recommendations/${landId}`),

    /** Get all available crops */
    getAllCrops: () => api.get('/api/v1/crops'),

    /** Get details for a specific crop */
    getCropDetails: (cropId) => api.get(`/api/v1/crops/${cropId}`),

    /** Get yield prediction for a crop on a land */
    getYieldPrediction: (landId, cropId) =>
        api.get(`/api/v1/predictions/yield`, { params: { land_id: landId, crop_id: cropId } }),

    /** Get market price for a crop */
    getMarketPrice: (cropId) => api.get(`/api/v1/market/price/${cropId}`),
}

export default cropService
