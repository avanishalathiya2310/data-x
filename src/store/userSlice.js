"use client";

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosApi from "@/lib/axios";
import { listUsers as serviceListUsers } from "@/lib/services/teams";
import { getApiErrorMessage } from "@/lib/apiError";
import { toast } from "react-toastify";

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
// Update user role
// Update user role
export const updateUserRoleThunk = createAsyncThunk(
  "users/updateRole",
  async ({ userId, roleId }, { rejectWithValue }) => {
    try {
      await axiosApi.put(`/api/v1/role/${userId}`, {
        role_id: roleId,
      });
      return { userId, roleId };
    } catch (err) {
      const resp = err?.response?.data;
      const validationMsg =
        Array.isArray(resp?.errors) && resp.errors[0]?.msg
          ? resp.errors[0].msg
          : getApiErrorMessage(err, "Failed to update user role");
      return rejectWithValue(validationMsg);
    }
  }
);

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
      return rejectWithValue(
        getApiErrorMessage(err, "Failed to fetch current user")
      );
    }
  }
);

export const addUserThunk = createAsyncThunk(
  "users/addUser",
  async ({ email, displayName, role_id }, { rejectWithValue }) => {
    try {
      const response = await axiosApi.post(
        "/api/v1/add-user",
        { email, displayName, role_id },
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      return response.data?.[0]; // Return the added user
    } catch (err) {
      return rejectWithValue(getApiErrorMessage(err, "Failed to add user"));
    }
  }
);

export const fetchEntraUsers = createAsyncThunk(
  "users/fetchEntraUsers",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosApi.get("/api/v1/user/entra", {
        headers: {
          Accept: "application/json",
        },
        withCredentials: true,
      });
      return response.data || [];
    } catch (err) {
      return rejectWithValue(
        getApiErrorMessage(err, "Failed to fetch Entra users")
      );
    }
  }
);

const userSlice = createSlice({
  name: "users",
  initialState: {
    items: [],
    entraUsers: [],
    loading: false,
    error: null,
    current: null,
    currentLoading: false,
    currentError: null,
    currentToken: null,
    entraUsersLoading: false,
    entraUsersError: null,
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
      })
      .addCase(updateUserRoleThunk.fulfilled, (state, action) => {
        const { userId, roleId } = action.payload;
        // Update in items array
        const userIndex = state.items.findIndex((user) => user.id === userId);
        if (userIndex !== -1) {
          state.items[userIndex].role_id = roleId;
        }
        // Also update in current user if it's the same user
        if (state.current?.id === userId) {
          state.current.role_id = roleId;
        }
        toast.success("User role updated successfully");
      })
      .addCase(updateUserRoleThunk.rejected, (state, action) => {
        state.error = action.payload || "Failed to update user role";
        toast.error(action.payload || "Failed to update user role");
      })
      // In the extraReducers section, add these cases
      .addCase(fetchEntraUsers.pending, (state) => {
        state.entraUsersLoading = true;
        state.entraUsersError = null;
      })
      .addCase(fetchEntraUsers.fulfilled, (state, action) => {
        state.entraUsersLoading = false;
        state.entraUsers = action.payload || [];
      })
      .addCase(fetchEntraUsers.rejected, (state, action) => {
        state.entraUsersLoading = false;
        state.entraUsersError = action.payload || "Failed to fetch Entra users";
      })
      .addCase(addUserThunk.pending, (state) => {
        state.entraUsersLoading = true;
        state.error = null;
      })
      .addCase(addUserThunk.fulfilled, (state, action) => {
        console.log(action.payload);
        state.entraUsersLoading = false;
        // Add the new user to the items array if not already present
        if (action.payload) {
          const userExists = state.items.some(user => user.id === action.payload.id || user.email === action.payload.email);
          if (!userExists) {
            state.items = [...state.items, action.payload];
          }
          toast.success("User added successfully");
        }
        // Remove the user from entraUsers if they exist there
        state.entraUsers = state.entraUsers.filter(
          (user) => user.email.toLowerCase() !== action.payload?.email?.toLowerCase()
        );
      })
      .addCase(addUserThunk.rejected, (state, action) => {
        state.entraUsersLoading = false;
        state.error = action.payload || "Failed to add user";
        toast.error(action.payload || "Failed to add user");
      });
  },
});

export default userSlice.reducer;
