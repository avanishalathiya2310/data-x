"use client";

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosApi from "@/lib/axios";
import { listUsers as serviceListUsers } from "@/lib/services/teams";
import { getApiErrorMessage } from "@/lib/apiError";

export const fetchUsers = createAsyncThunk(
  "users/fetchList",
  async (_, { rejectWithValue }) => {
    try {
      const payload = await serviceListUsers();
      return Array.isArray(payload) ? payload : [];
    } catch (err) {
      return rejectWithValue(getApiErrorMessage(err, "Failed to fetch users"));
    }
  }
);

// Fetch the current user and store access token in localStorage
export const fetchCurrentUser = createAsyncThunk(
  "users/fetchCurrent",
  async (_, { rejectWithValue }) => {
    try {
      // 1) Get token from /me
      const res = await fetch("/api/proxy/auth/me", { credentials: "include" });
      const json = await res.json();
      const meToken =
        Array.isArray(json) && json.length > 0
          ? json[0]?.id_token
          : json?.id_token || null;
      if (!meToken) {
        return rejectWithValue("Authentication token not found from /me");
      }

      // 2) Call backend user API with token from /me
      const postRes = await axiosApi.post("/api/v1/user", { token: meToken });
      const backendUser = postRes?.data?.user;
      const backendToken = postRes?.data?.token;

      if (!backendUser || !backendToken) {
        return rejectWithValue("You cannot access this: user or token missing");
      }

      // 3) Persist token
      if (typeof window !== "undefined") {
        localStorage.setItem("access_token", backendToken);
      }

      return { token: backendToken, user: backendUser };
    } catch (err) {
      return rejectWithValue(getApiErrorMessage(err, "Failed to fetch current user"));
    }
  }
);

const userSlice = createSlice({
  name: "users",
  initialState: {
    items: [],
    loading: false,
    error: null,
    current: null,
    currentLoading: false,
    currentError: null,
    currentToken: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload || [];
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch users";
      })
      .addCase(fetchCurrentUser.pending, (state) => {
        state.currentLoading = true;
        state.currentError = null;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.currentLoading = false;
        const { user, token } = action.payload || {};
        state.current = user || null;
        state.currentToken = token || null;
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.currentLoading = false;
        state.currentError = action.payload || "Failed to fetch current user";
        state.current = null;
        state.currentToken = null;
      });
  },
});

export default userSlice.reducer;
