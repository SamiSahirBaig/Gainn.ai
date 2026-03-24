import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import landService from '@/services/landService'

// Async thunks
export const fetchLands = createAsyncThunk('land/fetchLands', async (_, { rejectWithValue }) => {
    try {
        const res = await landService.getLands()
        return res.data.data || res.data
    } catch (err) {
        return rejectWithValue(err.message || 'Failed to fetch lands')
    }
})

export const submitAnalysis = createAsyncThunk('land/submitAnalysis', async (data, { rejectWithValue }) => {
    try {
        const res = await landService.submitAnalysis(data)
        return res.data.data || res.data
    } catch (err) {
        return rejectWithValue(err.message || 'Analysis submission failed')
    }
})

const landSlice = createSlice({
    name: 'land',
    initialState: {
        lands: [],
        currentAnalysis: null,
        loading: false,
        error: null,
    },
    reducers: {
        clearLandError: (state) => {
            state.error = null
        },
        setCurrentAnalysis: (state, action) => {
            state.currentAnalysis = action.payload
        },
        clearCurrentAnalysis: (state) => {
            state.currentAnalysis = null
        },
    },
    extraReducers: (builder) => {
        builder
            // fetchLands
            .addCase(fetchLands.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(fetchLands.fulfilled, (state, action) => {
                state.loading = false
                state.lands = action.payload
            })
            .addCase(fetchLands.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
            // submitAnalysis
            .addCase(submitAnalysis.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(submitAnalysis.fulfilled, (state, action) => {
                state.loading = false
                state.currentAnalysis = action.payload
            })
            .addCase(submitAnalysis.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
    },
})

export const { clearLandError, setCurrentAnalysis, clearCurrentAnalysis } = landSlice.actions
export default landSlice.reducer
