import api from './api'

const marketService = {
    /** Get nearby markets based on lat/lng and radius */
    getNearbyMarkets: (lat, lng, radius = 50, crop = null, sort = 'distance') => {
        const params = { lat, lng, radius, sort }
        if (crop) params.crop = crop
        return api.get('/api/v1/markets/nearby', { params })
    },

    /** Get prices at a specific market */
    getMarketPrices: (marketId, crops = null) => {
        const params = {}
        if (crops) params.crops = crops
        return api.get(`/api/v1/markets/${marketId}/prices`, { params })
    },

    /** Get price predictions for a crop */
    getPricePredictions: (crop, timeframe = 6) =>
        api.get('/api/v1/markets/price-predictions', { params: { crop, timeframe } }),

    /** Get live prices for top 15 crops */
    getLivePrices: () => api.get('/api/v1/markets/live-prices'),

    /** Get market insights (hot/cold crops, opportunities) */
    getInsights: () => api.get('/api/v1/markets/insights'),

    /** Get full market intelligence dashboard */
    getIntelligence: (lat = 20.0, lng = 78.0) =>
        api.get('/api/v1/markets/intelligence', { params: { lat, lng } }),
}


export default marketService
