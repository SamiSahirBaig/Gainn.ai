import { configureStore } from '@reduxjs/toolkit'
import landReducer from './slices/landSlice'
import cropReducer from './slices/cropSlice'
import userReducer from './slices/userSlice'

const store = configureStore({
    reducer: {
        land: landReducer,
        crop: cropReducer,
        user: userReducer,
    },
    devTools: import.meta.env.DEV,
})

export default store
