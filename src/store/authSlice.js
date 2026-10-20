import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    status: false,
    userData: null,
    isInitialized: false,
}

const authSlice = createSlice({
    name: "auth",
    initialState, 
    reducers: {
        login: (state, action) => {
            state.status = true
            state.userData = action.payload
            state.isInitialized = true
        },
        logout: (state) => {
            state.status = false
            state.userData = null
            state.isInitialized = true
        },
        setAuthInitialized: (state) => {
            state.isInitialized = true
        }
    }
});

export const { login, logout, setAuthInitialized } = authSlice.actions;
export default authSlice.reducer;