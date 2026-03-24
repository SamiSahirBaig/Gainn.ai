import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import authService from '@/services/authService'

// Async thunks
export const loginUser = createAsyncThunk('user/login', async ({ email, password }, { rejectWithValue }) => {
    try {
        const res = await authService.login(email, password)
        const { access_token } = res.data
        localStorage.setItem('gainnai_token', access_token)

        // Fetch profile after login
        const profile = await authService.getProfile()
        const user = profile.data.data || profile.data
        localStorage.setItem('gainnai_user', JSON.stringify(user))

        return { token: access_token, user }
    } catch (err) {
        return rejectWithValue(err.message || 'Login failed')
    }
})

export const registerUser = createAsyncThunk('user/register', async (data, { rejectWithValue }) => {
    try {
        const res = await authService.register(data)
        return res.data.data || res.data
    } catch (err) {
        return rejectWithValue(err.message || 'Registration failed')
    }
})

// Hydrate from localStorage on app start
const savedToken = localStorage.getItem('gainnai_token')
const savedUser = (() => {
    try {
        return JSON.parse(localStorage.getItem('gainnai_user'))
    } catch {
        return null
    }
})()

const userSlice = createSlice({
    name: 'user',
    initialState: {
        user: savedUser,
        token: savedToken,
        loading: false,
        error: null,
    },
    reducers: {
        logout: (state) => {
            state.user = null
            state.token = null
            state.error = null
            authService.logout()
        },
        clearUserError: (state) => {
            state.error = null
        },
    },
    extraReducers: (builder) => {
        builder
            // loginUser
            .addCase(loginUser.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false
                state.token = action.payload.token
                state.user = action.payload.user
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
            // registerUser
            .addCase(registerUser.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(registerUser.fulfilled, (state) => {
                state.loading = false
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
    },
})

export const { logout, clearUserError } = userSlice.actions
export default userSlice.reducer
