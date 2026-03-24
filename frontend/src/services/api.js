import axios from 'axios'

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
    timeout: 60000,
    headers: {
        'Content-Type': 'application/json',
    },
})

// Request interceptor — attach JWT token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('gainnai_token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => Promise.reject(error)
)

// Response interceptor — handle errors globally
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            const { status } = error.response

            if (status === 401) {
                localStorage.removeItem('gainnai_token')
                localStorage.removeItem('gainnai_user')
                // Redirect to login (when auth pages exist)
                if (window.location.pathname !== '/login') {
                    window.location.href = '/login'
                }
            }

            // Normalize error shape
            const message =
                error.response.data?.error?.message ||
                error.response.data?.detail ||
                'An unexpected error occurred'

            return Promise.reject({ status, message, data: error.response.data })
        }

        if (error.request) {
            return Promise.reject({ status: 0, message: 'Network error — server unreachable' })
        }

        return Promise.reject({ status: -1, message: error.message })
    }
)

export default api
