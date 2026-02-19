import api from './api'

const authService = {
    /** Login with email and password */
    login: (email, password) =>
        api.post('/api/v1/auth/login', new URLSearchParams({ username: email, password }), {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        }),

    /** Register a new user */
    register: (data) => api.post('/api/v1/auth/register', data),

    /** Get current user profile */
    getProfile: () => api.get('/api/v1/auth/me'),

    /** Update user profile */
    updateProfile: (data) => api.put('/api/v1/auth/me', data),

    /** Logout (client-side only for now) */
    logout: () => {
        localStorage.removeItem('gainnai_token')
        localStorage.removeItem('gainnai_user')
    },
}

export default authService
