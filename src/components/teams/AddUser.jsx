import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { X } from "@phosphor-icons/react";
import { addUserThunk, fetchUsers } from "@/store/userSlice";
import { toast } from "react-toastify";

const AddUserModal = ({ setOpen, onCreated }) => {
  const dispatch = useDispatch();
  const { entraUsers, entraUsersLoading, entraUsersError } = useSelector((state) => state.users);
  const { items: roles } = useSelector((state) => state.roles);
  const [submitting, setSubmitting] = useState(false);
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedRole, setSelectedRole] = useState("");

  const closeModal = () => {
    setSelectedUser("");
    setSelectedRole("");
    setOpen(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!selectedUser || !selectedRole) {
      toast.error("Please select both user and role");
      return;
    }

    try {
      setSubmitting(true);
      const userToAdd = entraUsers.find(user => user.email === selectedUser);
      
      await dispatch(
        addUserThunk({
          email: selectedUser,
          displayName: userToAdd?.displayName || selectedUser.split('@')[0],
          role_id: parseInt(selectedRole, 10)
        })
      ).unwrap();
      
      // Reset form and close modal on success
      closeModal();
      
      // Call onCreated callback if provided
      if (onCreated && typeof onCreated === 'function') {
        onCreated();
      }
      
      // Refresh the users list
      dispatch(fetchUsers());
    } catch (error) {
      console.error("Failed to add user:", error);
      // Error is already handled by the thunk
    } finally {
      setSubmitting(false);
    }
  };

  const handleRoleChange = (roleId) => {
    setSelectedRole(roleId);
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/30"
        onClick={closeModal}
      />
      <div className="relative z-61 w-full max-w-md rounded-lg bg-white dark:bg-dark-secondary shadow-xl">
        <form onSubmit={handleSave}>
          <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div className="flex items-center gap-2 text-lg font-semibold">
              Add User Role
            </div>
            <button
              type="button"
              onClick={closeModal}
              className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              disabled={submitting}
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-5 space-y-6">
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="user-select">
                Select User <span className="text-red-500">*</span>
              </label>
              <select
                id="user-select"
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-primary px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#089bab]"
                disabled={submitting || entraUsersLoading}
              >
                <option value="">Select a user</option>
                {entraUsers.map((user) => (
                  <option key={user.email} value={user.email}>
                    {user.email}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Select Role <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2">
                {roles.map((role) => (
                  <label key={role.id} className="flex items-center">
                    <input
                      type="radio"
                      name="role"
                      checked={selectedRole === role.id.toString()}
                      onChange={() => handleRoleChange(role.id.toString())}
                      className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300"
                      disabled={submitting}
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      {role.role_name}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {entraUsersError && (
              <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 rounded-md">
                {entraUsersError}
              </div>
            )}
          </div>

          <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-end gap-3">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-dark-primary border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-dark-secondary"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedUser || !selectedRole || submitting}
              className={`px-4 py-2 text-sm font-medium text-white rounded-md ${
                selectedUser && selectedRole && !submitting
                  ? "bg-[#089bab] hover:bg-[#089bab]/80"
                  : "bg-[#089bab]/80 cursor-not-allowed"
              }`}
            >
              {submitting ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUserModal;
