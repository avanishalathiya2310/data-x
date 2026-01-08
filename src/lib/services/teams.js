// Lightweight client-side service for Team APIs using shared axios client
import axiosApi from "@/lib/axios";

export async function listTeams() {
  try {
    const res = await axiosApi.get("/api/v1/team/team-list");
    const json = res?.data;
    const payload = Array.isArray(json) ? json : (json?.data || []);

    return Array.isArray(payload) ? payload : [];
  } catch (e) {
    throw new Error(e?.response?.data?.message || "Failed to fetch teams");
  }
}

export async function createTeam({ team_name, description }) {
  try {
    const res = await axiosApi.post("/api/v1/team/create-team", {
      team_name,
      description,
    });
    return res?.data?.data;
  } catch (e) {
    throw new Error(e?.response?.data?.message || "Failed to create team");
  }
}

// Delete a team by id
export async function deleteTeam(teamId) {
  try {
    // Matches: DELETE http://localhost:8000/api/v1/team/{id}/remove-team
    const res = await axiosApi.delete(`/api/v1/team/${teamId}/remove-team`, {
      headers: { Accept: "application/json" },
      withCredentials: true,
    });
    return res?.data?.data ?? true;
  } catch (e) {
    throw new Error(e?.response?.data?.message || "Failed to delete team");
  }
}

// List members of a specific team
export async function listTeamMembers(teamId) {
  if (!teamId) throw new Error("teamId is required");
  try {
    // Matches: GET http://localhost:8000/api/v1/team/{id}/team-members
    const res = await axiosApi.get(`/api/v1/team/${teamId}/team-members`);
    const json = res?.data;
    const payload = Array.isArray(json) ? json : (json?.data || []);
    return Array.isArray(payload) ? payload : [];
  } catch (e) {
    throw new Error(e?.response?.data?.message || "Failed to fetch team members");
  }
}

// Fetch all users for selection while adding team member
export async function listUsers() {
  try {
    const res = await axiosApi.get("/api/v1/user/list");
    const json = res?.data;
    const payload = Array.isArray(json) ? json : (json?.data || []);
    return Array.isArray(payload) ? payload : [];
  } catch (e) {
    throw new Error(e?.response?.data?.message || "Failed to fetch users");
  }
}

// Fetch all permissions to assign to a member
export async function listPermissions() {
  try {
    const res = await axiosApi.get("/api/v1/permission/list");
    const json = res?.data;
    const payload = Array.isArray(json) ? json : (json?.data || []);
    return Array.isArray(payload) ? payload : [];
  } catch (e) {
    throw new Error(e?.response?.data?.message || "Failed to fetch permissions");
  }
}

// Add a member to a team with selected permissions
export async function addTeamMember(teamId, { userId, permissions }) {
  if (!teamId) throw new Error("teamId is required");
  if (!userId) throw new Error("userId is required");
  try {
    const res = await axiosApi.post(`/api/v1/team/${teamId}/add-member`, {
      userId,
      permissions: Array.isArray(permissions) ? permissions : [],
    }, {
      headers: { "Content-Type": "application/json" },
      withCredentials: true,
    });
    return res?.data?.data ?? true;
  } catch (e) {
    throw new Error(e?.response?.data?.message || "Failed to add member");
  }
}

// Remove a member from a team
export async function removeTeamMember(teamId, userId) {
  if (!teamId) throw new Error("teamId is required");
  if (!userId) throw new Error("userId is required");
  try {
    // Send userId as a query parameter. Adjust to body if backend expects otherwise.
    const res = await axiosApi.delete(`/api/v1/team/${teamId}/remove-member`, {
      params: { userId },
      headers: { Accept: "application/json" },
      withCredentials: true,
    });
    return res?.data?.data ?? true;
  } catch (e) {
    throw new Error(e?.response?.data?.message || "Failed to remove member");
  }
}
