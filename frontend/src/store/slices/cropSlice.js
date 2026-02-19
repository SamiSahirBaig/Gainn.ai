import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import cropService from '@/services/cropService'

// Async thunks
export const fetchRecommendations = createAsyncThunk(
    'crop/fetchRecommendations',
    async (landId, { rejectWithValue }) => {
        try {
            const res = await cropService.getRecommendations(landId)
            return res.data.data || res.data
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to fetch recommendations')
        }
    }
)

export const fetchAllCrops = createAsyncThunk('crop/fetchAllCrops', async (_, { rejectWithValue }) => {
    try {
        const res = await cropService.getAllCrops()
        return res.data.data || res.data
    } catch (err) {
        return rejectWithValue(err.message || 'Failed to fetch crops')
    }
})

const cropSlice = createSlice({
    name: 'crop',
    initialState: {
        recommendations: [],
        allCrops: [],
        loading: false,
        error: null,
    },
    reducers: {
        clearCropError: (state) => {
            state.error = null
        },
        clearRecommendations: (state) => {
            state.recommendations = []
        },
    },
    extraReducers: (builder) => {
        builder
            // fetchRecommendations
            .addCase(fetchRecommendations.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(fetchRecommendations.fulfilled, (state, action) => {
                state.loading = false
                state.recommendations = action.payload
            })
            .addCase(fetchRecommendations.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
            // fetchAllCrops
            .addCase(fetchAllCrops.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(fetchAllCrops.fulfilled, (state, action) => {
                state.loading = false
                state.allCrops = action.payload
            })
            .addCase(fetchAllCrops.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
    },
})

export const { clearCropError, clearRecommendations } = cropSlice.actions
export default cropSlice.reducer
