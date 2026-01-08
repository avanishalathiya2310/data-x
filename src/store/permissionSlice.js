"use client";

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { listPermissions as serviceListPermissions } from "@/lib/services/teams";
import { getApiErrorMessage } from "@/lib/apiError";

export const fetchPermissions = createAsyncThunk(
  "permissions/fetchList",
  async (_, { rejectWithValue }) => {
    try {
      const payload = await serviceListPermissions();
      return Array.isArray(payload) ? payload : [];
    } catch (err) {
      return rejectWithValue(getApiErrorMessage(err, "Failed to fetch permissions"));
    }
  }
);

const permissionSlice = createSlice({
  name: "permissions",
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPermissions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPermissions.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload || [];
      })
      .addCase(fetchPermissions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch permissions";
      });
  },
});

export default permissionSlice.reducer;
