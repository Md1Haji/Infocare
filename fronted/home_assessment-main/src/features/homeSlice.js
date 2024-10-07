// features/homeSlice.js
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

// Thunk to fetch homes by user
export const fetchHomesByUser = createAsyncThunk('homes/fetchHomesByUser', async (username) => {
    const response = await fetch(`http://localhost:3001/home/find-by-user/${username}`);
    return await response.json();
});

// Thunk to update users for a home
export const updateUsersForHome = createAsyncThunk('homes/updateUsersForHome', async ({ homeId, usernames }) => {
    const response = await fetch('http://localhost:3001/home/update-users', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ homeId, usernames }),
    });
    return await response.json();
});

const homeSlice = createSlice({
    name: 'homes',
    initialState: {
        list: [],
        status: 'idle',
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchHomesByUser.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchHomesByUser.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.list = action.payload;
            })
            .addCase(fetchHomesByUser.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            })
            .addCase(updateUsersForHome.fulfilled, (state, action) => {
                // Logic to handle state update after successful user update
                console.log('Users updated successfully for home');
            });
    },
});

export default homeSlice.reducer;
