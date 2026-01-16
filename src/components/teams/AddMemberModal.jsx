import React, { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addTeamMemberThunk } from "@/store/teamSlice";


const AddMemberModal = ({ team, users: usersProp = [], permissions: permissionsProp = [], existingMembers = [], onClose, onAdded }) => {  

  const dispatch = useDispatch();
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = useMemo(() => {
    return !!selectedUserId && !submitting;
  }, [selectedUserId, submitting]);

  const { current: currentUser } = useSelector((state) => state.users || {});
  const users = Array.isArray(usersProp) ? usersProp : [];
  const permissions = Array.isArray(permissionsProp) ? permissionsProp : [];

  // Build sets of existing member ids and emails for quick exclusion
  const existing = useMemo(() => {
    const ids = new Set();
    const emails = new Set();
    for (const m of Array.isArray(existingMembers) ? existingMembers : []) {
      if (m?.id != null) ids.add(Number(m.id));
      if (m?.user_id != null) ids.add(Number(m.user_id));
      const em = (m?.email || m?.username || "").toLowerCase();
      if (em) emails.add(em);
    }
    return { ids, emails };
  }, [existingMembers]);

  const filteredUsers = useMemo(() => users.filter((u) => {
    const uid = u?.id != null ? Number(u.id) : u?.user_id != null ? Number(u.user_id) : undefined;
    const email = (u?.email || u?.username || "").toLowerCase();
    const currentUserId = currentUser?.id != null ? Number(currentUser.id) : undefined;
    const currentUserEmail = (currentUser?.email || currentUser?.username || "").toLowerCase();
    
    // Skip if user is already a member
    if (uid != null && existing.ids.has(uid)) return false;
    if (email && existing.emails.has(email)) return false;
    
    // Skip if user is the current user
    if (uid === currentUserId) return false;
    if (email && email === currentUserEmail) return false;
    
    return true;
  }), [users, existing, currentUser]);

  const togglePermission = (permId) => {
    setSelectedPermissions((prev) => prev.includes(permId)
      ? prev.filter((id) => id !== permId)
      : [...prev, permId]
    );
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    const payload = {
      teamId: team?.id,
      userId: Number(selectedUserId),
      // permissions: selectedPermissions.map((id) => Number(id)),
    };
    dispatch(addTeamMemberThunk(payload))
      .then(() => onAdded?.())
      .finally(() => setSubmitting(false));
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative z-61 w-full max-w-lg rounded-lg bg-white dark:bg-dark-secondary shadow-xl">
        <div className="p-5 border-b border-gray-200 dark:border-gray-700">
          <div className="text-lg font-semibold">Add Member to {team?.team_name}</div>
          <div className="text-xs text-gray-500 dark:text-gray-300">Select a user and assign permissions</div>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="member_user">
              User <span className="text-red-500">*</span>
            </label>
            <select
              id="member_user"
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-primary px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-main"
            >
              <option value="" disabled>
                {filteredUsers.length === 0 ? "No users available" : "Select a user"}
              </option>
              {filteredUsers.map((u) => {
                const uid = u?.id != null ? u.id : u?.user_id;
                return (
                  <option key={uid} value={uid}>
                    {u.email}
                  </option>
                );
              })}
            </select>
          </div>

          {/* <div>
            <div className="block text-sm font-medium mb-2">Permissions</div>
            <div className="grid grid-cols-3 gap-2">
              {permissions.map((p) => {
                const label = p.name;
                const pid = String(p.id);
                const checked = selectedPermissions.includes(pid);
                return (
                  <label key={p.id} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      className="h-4 w-4"
                      checked={checked}
                      onChange={() => togglePermission(pid)}
                    />
                    <span>{label}</span>
                  </label>
                );
              })}
              {permissions.length === 0 && (
                <div className="text-xs text-gray-500 dark:text-gray-400">No permissions available</div>
              )}
            </div>
          </div> */}

          {/* Error messaging can be added here if backend returns validation issues */}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-primary px-4 py-2 text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className={`rounded-md px-4 py-2 text-sm text-white shadow ${
                canSubmit && !submitting
                  ? "bg-[#089bab] hover:bg-[#089bab]/80"
                  : "bg-[#089bab]/80 cursor-not-allowed"
              }`}
            >
              {submitting ? "Adding..." : "Add Member"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMemberModal;
