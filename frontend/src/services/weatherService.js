import api from './api'

const weatherService = {
    /** Get current weather + forecast + farming recommendations */
    getCurrentWeather: (lat, lng) =>
        api.get('/api/v1/weather/current', { params: { lat, lng } }),
}

export default weatherService
