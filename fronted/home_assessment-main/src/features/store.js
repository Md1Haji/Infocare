// store.js
import { configureStore } from '@reduxjs/toolkit';
import homeReducer from './homeSlice';
import userReducer from './userSlice';

export const store = configureStore({
    reducer: {
        users: userReducer,
        homes: homeReducer,
    },
});

export default store;
