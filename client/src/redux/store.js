import { configureStore } from "@reduxjs/toolkit";
import authReducer from './authSlice.js'

const store = configureStore({
    reducer : {
        auth  : authReducer ,  
        // {token , id ,email}
    }
})

export default store