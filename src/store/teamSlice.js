"use client";

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosApi from "@/lib/axios";
import { listTeams as serviceListTeams } from "@/lib/services/teams";
import { toast } from "react-toastify";
import { getApiErrorMessage } from "@/lib/apiError";
import { deleteUserThunk, updateUserRoleThunk } from "./userSlice";


const normalizePermissionIds = (raw) => {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((p) => {
      if (p == null) return null;
      if (typeof p === "object") return p.id ?? null;
      const n = Number(p);
      return Number.isNaN(n) ? null : n;
    })
    .filter((x) => x != null);
};

const buildPermissionKeyMap = (allPerms = []) =>
  new Map(
    allPerms.map((p) => [p.id, (p.key ?? p.name ?? String(p.id)).toString().toLowerCase()])
  );

const enrichMember = (baseMember, users = [], userId) => {
  const found = users.find((u) => (u?.id ?? u?.user_id) === userId);
  if (!found) return baseMember;
  const merged = { ...found, ...baseMember };
  if (merged.id == null && found.id != null) merged.id = found.id;
  return merged;
};

// Fetch team list
export const fetchTeams = createAsyncThunk(
  "teams/fetchList",
  async (_, { rejectWithValue }) => {
    try {
      const payload = await serviceListTeams();
      return Array.isArray(payload) ? payload : [];
    } catch (err) {
      return rejectWithValue(getApiErrorMessage(err, "Failed to fetch teams"));
    }
  }
);

// Update a team member's permissions
export const updateTeamMemberPermissionsThunk = createAsyncThunk(
  "teams/updateMemberPermissions",
  async ({ teamId, userId, permissionIds }, { rejectWithValue, getState }) => {
    const perms = Array.isArray(permissionIds) ? permissionIds : [];
    try {
      await axiosApi.put(`/api/v1/team/${teamId}/update-member`, {
        userId,
        permissions: perms,
      });
      // Also compute string keys for UI checkbox mapping
      const allPerms = getState()?.permissions?.items || [];
      const idToKey = new Map(
        allPerms.map((p) => [p.id, (p.key ?? p.name ?? String(p.id)).toString().toLowerCase()])
      );
      const permissionKeys = perms.map((id) => idToKey.get(id)).filter(Boolean);
      return { teamId, userId, permissionIds: perms, permissionKeys };
    } catch (err) {
      const resp = err?.response?.data;
      const validationMsg = Array.isArray(resp?.errors) && resp.errors[0]?.msg ? resp.errors[0].msg : null;
      const baseMsg = getApiErrorMessage(err, "Failed to update member");
      return rejectWithValue(validationMsg || baseMsg);
    }
  }
);

// Fetch members of a team
export const fetchTeamMembers = createAsyncThunk(
  "teams/fetchTeamMembers",
  async (teamId, { rejectWithValue }) => {
    if (!teamId) return rejectWithValue("teamId is required");
    try {
      const res = await axiosApi.get(`/api/v1/team/${teamId}/team-members`);
      const data = Array.isArray(res?.data) ? res.data : res?.data?.data || [];
      return { teamId, items: Array.isArray(data) ? data : [] };
    } catch (err) {
      return rejectWithValue({
        teamId,
        message: getApiErrorMessage(err, "Failed to fetch members"),
      });
    }
  }
);

// Add a member to a team
export const addTeamMemberThunk = createAsyncThunk(
  "teams/addMember",
  async ({ teamId, userId, permissions = [] }, { rejectWithValue, getState }) => {
    try {
      const res = await axiosApi.post(
        `/api/v1/team/${teamId}/add-member`,
        { userId, permissions }
      );

      const state = getState?.();
      const users = state?.users?.items || [];
      const allPerms = state?.permissions?.items || [];

      // Base from API or fallback, then enrich identity from users slice
      let member = res?.data[0] ?? { id: userId, permissions };
      member = enrichMember(member, users, userId);

      // Normalize permissions for UI
      const permSource =  member.permissions;
      const permission_ids = normalizePermissionIds(permSource);
      if (permission_ids.length) {
        const idToKey = buildPermissionKeyMap(allPerms);
        const permissionKeys = permission_ids.map((id) => idToKey.get(id)).filter(Boolean);
        member = { ...member, permission_ids, permissions: permissionKeys };
      }

      return { teamId, member };
    } catch (err) {
      return rejectWithValue(getApiErrorMessage(err, "Failed to add member"));
    }
  }
);

// Remove a member from a team
export const removeTeamMemberThunk = createAsyncThunk(
  "teams/removeMember",
  async ({ teamId, userId }, { rejectWithValue }) => {
    try {
      await axiosApi.delete(`/api/v1/team/${teamId}/remove-member`, {
        params: { userId },
      });
      return { teamId, userId };
    } catch (err) {
      const resp = err?.response?.data;
      const validationMsg = Array.isArray(resp?.errors) && resp.errors[0]?.msg ? resp.errors[0].msg : null;
      const baseMsg = getApiErrorMessage(err, "Failed to remove member");
      return rejectWithValue(validationMsg || baseMsg);
    }
  }
);

// Create a new team (no re-fetch; update state directly)
export const createTeamThunk = createAsyncThunk(
  "teams/create",
  async ({ team_name, description }, { rejectWithValue }) => {
    try {
      const res = await axiosApi.post("/api/v1/team/create-team", {
        team_name,
        description,
      });
      // API returns an array; normalize in case of data wrapper
      const dataArray = Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res?.data?.data)
          ? res.data.data
          : [];
      return dataArray;
    } catch (err) {
      const resp = err?.response?.data;
      const message = resp?.message || resp?.error || err?.message || "Failed to create team";
      return rejectWithValue(message);
    }
  }
);

// Delete a team and update state directly
export const deleteTeamThunk = createAsyncThunk(
  "teams/delete",
  async (teamId, { rejectWithValue }) => {
    if (!teamId) return rejectWithValue("teamId is required");
    try {
      await axiosApi.delete(`/api/v1/team/${teamId}/remove-team`);
      return { teamId };
    } catch (err) {
      const resp = err?.response?.data;
      const validationMsg = Array.isArray(resp?.errors) && resp.errors[0]?.msg ? resp.errors[0].msg : null;
      const baseMsg = getApiErrorMessage(err, "Failed to delete team");
      return rejectWithValue(validationMsg || baseMsg);
    }
  }
);

// Update a team member's role
export const updateMemberRoleThunk = createAsyncThunk(
  "teams/updateMemberRole",
  async ({ userId, roleId }, { rejectWithValue }) => {
    try {
      await axiosApi.put(`/api/v1/role/${userId}`, {
        role_id: roleId
      });
      return { userId, roleId };
    } catch (err) {
      const resp = err?.response?.data;
      const validationMsg = Array.isArray(resp?.errors) && resp.errors[0]?.msg 
        ? resp.errors[0].msg 
        : getApiErrorMessage(err, "Failed to update member role");
      return rejectWithValue(validationMsg);
    }
  }
);

const teamSlice = createSlice({
  name: "teams",
  initialState: {
    items: [],
    loading: false,
    error: null,
    membersByTeam: {}, // { [teamId]: { loading, error, items: [] } }
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTeams.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTeams.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload || [];
      })
      .addCase(fetchTeams.rejected, (state, action) => {
        state.loading = false;
        const msg = action.payload || action.error?.message || "Failed to fetch teams";
        state.error = msg;
        toast.error(msg, { toastId: action.type });
      })
      .addCase(deleteTeamThunk.fulfilled, (state, action) => {
        const { teamId } = action.payload || {};
        state.items = state.items.filter((t) => t.id !== teamId);
        if (teamId in state.membersByTeam) {
          delete state.membersByTeam[teamId];
        }
        toast.success("Team removed successfully", { toastId: action.type });
      })
      .addCase(deleteTeamThunk.rejected, (state, action) => {
        const msg = action.payload || action.error?.message || "Failed to delete team";
        toast.error(msg, { toastId: action.type });
      })
      // On create, push into items if not already present
      .addCase(createTeamThunk.fulfilled, (state, action) => {
        const payload = action.payload;
        if (!payload) return;
        const toInsert = Array.isArray(payload) ? payload : [payload];
        for (const item of toInsert) {
          if (!item || item.id == null) continue;
          const exists = state.items.some((t) => t.id === item.id);
          if (!exists) state.items.push(item);
        }
        toast.success("Team created successfully", { toastId: action.type });
      })
      .addCase(createTeamThunk.rejected, (state, action) => {
        const msg = action.payload || action.error?.message || "Failed to create team";
        toast.error(msg, { toastId: action.type });
      })
      // Team members
      .addCase(fetchTeamMembers.pending, (state, action) => {
        const teamId = action.meta.arg;
        const current = state.membersByTeam[teamId] || {
          items: [],
          loading: false,
          error: null,
        };
        state.membersByTeam[teamId] = { ...current, loading: true, error: null };
      })
      .addCase(fetchTeamMembers.fulfilled, (state, action) => {
        const { teamId, items } = action.payload || {};
        state.membersByTeam[teamId] = {
          loading: false,
          error: null,
          items: Array.isArray(items) ? items : [],
        };
      })
      .addCase(fetchTeamMembers.rejected, (state, action) => {
        
        const payload = action.payload || {};
        const teamId = payload.teamId ?? action.meta.arg;
        const message = payload.message || action.error?.message || "Failed to fetch members";
        const current = state.membersByTeam[teamId] || { items: [] };
        state.membersByTeam[teamId] = {
          ...current,
          loading: false,
          error: message,
        };
        toast.error(message, { toastId: action.type });
      })
      .addCase(addTeamMemberThunk.fulfilled, (state, action) => {
        const { teamId, member } = action.payload || {};
        const current = state.membersByTeam[teamId] || { items: [], loading: false, error: null };
        const nextItems = Array.isArray(current.items) ? [...current.items] : [];
        // Avoid duplicates by id
        const idToCheck = member?.id ?? member?.user_id;
        const existsIdx = nextItems.findIndex((m) => (m?.id ?? m?.user_id) === idToCheck);
        if (existsIdx >= 0) nextItems[existsIdx] = { ...nextItems[existsIdx], ...member };
        else nextItems.push(member);
        state.membersByTeam[teamId] = { ...current, items: nextItems };
        toast.success("Member added successfully", { toastId: action.type });
      })
      .addCase(addTeamMemberThunk.rejected, (state, action) => {
        const msg = action.payload || action.error?.message || "Failed to add member";
        toast.error(msg, { toastId: action.type });
      })
      .addCase(removeTeamMemberThunk.fulfilled, (state, action) => {
        const { teamId, userId } = action.payload || {};
        const current = state.membersByTeam[teamId] || { items: [], loading: false, error: null };
        const nextItems = (current.items || []).filter((m) => (m?.id ?? m?.user_id) !== userId);
        state.membersByTeam[teamId] = { ...current, items: nextItems };
        toast.success("Member removed successfully", { toastId: action.type });
      })
      .addCase(removeTeamMemberThunk.rejected, (state, action) => {
      const teamId = action.meta.arg?.teamId;
      state.error = action.payload || action.error.message;
      if (teamId && state.membersByTeam[teamId]) {
        state.membersByTeam[teamId].error = action.payload || action.error.message;
      }
    })
    .addCase(updateMemberRoleThunk.fulfilled, (state, action) => {
      const { teamId, userId, roleId } = action.payload;
      if (state.membersByTeam[teamId]?.items) {
        const memberIndex = state.membersByTeam[teamId].items.findIndex(m => m.id === userId);
        if (memberIndex !== -1) {
          state.membersByTeam[teamId].items[memberIndex].role_id = roleId;
          toast.success("Member role updated successfully", { toastId: action.type });
        }
      }
    })
    .addCase(updateMemberRoleThunk.rejected, (state, action) => {
      const msg = action.payload || action.error?.message || "Failed to update member role";
      toast.error(msg, { toastId: action.type });
    })
    .addCase(updateTeamMemberPermissionsThunk.fulfilled, (state, action) => {
      const { teamId, userId, permissionIds, permissionKeys } = action.payload || {};
      const current = state.membersByTeam[teamId] || { items: [], loading: false, error: null };
      const nextItems = Array.isArray(current.items) ? [...current.items] : [];
      const idx = nextItems.findIndex((m) => (m?.id ?? m?.user_id) === userId);
      if (idx >= 0) {
        nextItems[idx] = {
          ...nextItems[idx],
          permission_ids: permissionIds,
          permissions: permissionKeys
        };
      }
      state.membersByTeam[teamId] = { ...current, items: nextItems };
      toast.success("Member permissions updated", { toastId: action.type });
    })
    .addCase(updateTeamMemberPermissionsThunk.rejected, (state, action) => {
      const msg = action.payload || action.error?.message || "Failed to update member permissions";
      toast.error(msg, { toastId: action.type });
    })
    // Handle user deletion - remove user from all teams
    .addCase(deleteUserThunk.fulfilled, (state, action) => {
      const deletedUserId = action.payload;
      // Iterate through all teams and remove the deleted user from their member lists
      Object.keys(state.membersByTeam).forEach((teamId) => {
        const current = state.membersByTeam[teamId];
        if (current?.items) {
          const filteredItems = current.items.filter(
            (member) => (member?.id ?? member?.user_id) !== deletedUserId
          );
          // Only update if the array actually changed
          if (filteredItems.length !== current.items.length) {
            state.membersByTeam[teamId] = {
              ...current,
              items: filteredItems,
            };
          }
        }
      });
    })
    // Handle user role update - update role in all teams
    .addCase(updateUserRoleThunk.fulfilled, (state, action) => {
      const { userId, roleId, roleName } = action.payload;
      
      // Iterate through all teams and update the user's role in their member lists
      Object.keys(state.membersByTeam).forEach((teamId) => {
        const current = state.membersByTeam[teamId];
        if (current?.items) {
          const memberIndex = current.items.findIndex(
            (member) => (member?.id ?? member?.user_id) === userId
          );
          if (memberIndex !== -1) {
            // Create a new array with the updated member to ensure immutability
            const updatedItems = [...current.items];
            updatedItems[memberIndex] = {
              ...updatedItems[memberIndex],
              role_id: roleId,
              role: roleName,
            };
            state.membersByTeam[teamId] = {
              ...current,
              items: updatedItems,
            };
          }
        }
      });
    });
  },
});

export default teamSlice.reducer;
