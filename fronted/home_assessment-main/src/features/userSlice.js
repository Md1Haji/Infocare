// features/userSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Thunk to fetch all users
export const fetchUsers = createAsyncThunk('users/fetchUsers', async () => {
    const response = await fetch('http://localhost:3001/user/find-all');
    return await response.json();
});

const userSlice = createSlice({
    name: 'users',
    initialState: {
        list: [],
        status: 'idle',
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchUsers.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchUsers.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.list = action.payload.map((user) => user.username);
            })
            .addCase(fetchUsers.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            });
    },
});

export default userSlice.reducer;
