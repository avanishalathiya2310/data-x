// src/components/teams/UsersList.jsx
"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchEntraUsers,
  fetchUsers,
  updateUserRoleThunk,
} from "@/store/userSlice";
import { fetchRoles } from "@/store/roleSlice";
import { UserPlus } from "@phosphor-icons/react";
import AddUserModal from "./AddUser";

const UsersList = () => {
  const dispatch = useDispatch();
  const { items: users, loading, error } = useSelector((state) => state.users);
  const { items: roles } = useSelector((s) => s.roles);
  const { current: currentUser } = useSelector((state) => state.users || {});
  const { entraUsers } = useSelector((state) => state.users);

  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);

  useEffect(() => {
    if (!users.length) {
      dispatch(fetchUsers());
    }
    if (!roles.length) {
      dispatch(fetchRoles());
    }
    if (!entraUsers.length) {
      dispatch(fetchEntraUsers());
    }
  }, [dispatch, users.length, roles.length, entraUsers.length]);

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
        Error loading users: {error}
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">All Users</h1>
          <p className="text-sm text-gray-500 dark:text-gray-300">
            Manage users
          </p>
        </div>
        <button
          onClick={() => setIsAddUserModalOpen(true)}
          className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-gray-200 dark:border-gray-700 px-3 py-2 text-sm font-medium bg-white dark:bg-dark-secondary hover:bg-gray-50 dark:hover:bg-dark-secondary/80 shadow-sm"
        >
          <UserPlus size={16} />
          Add User
        </button>
      </div>
      <ul className="divide-y divide-gray-200 dark:divide-gray-700 rounded-md border border-gray-200 dark:border-gray-700 overflow-hidden">
        {loading && (
          <div className="rounded-md bg-gray-100 dark:bg-dark-primary p-4 text-sm text-gray-600 dark:text-gray-300">
            Loading users...
          </div>
        )}
        {!users.length && (
          <div className="rounded-md bg-gray-100 dark:bg-dark-primary p-4 text-sm text-gray-600 dark:text-gray-300">
            No users found.
          </div>
        )}
        {users.length > 0 &&
          users.map((user) => {
            const isCurrentUser = currentUser?.id === user?.id;

            return (
              <li key={user.id} className="px-4 py-3 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1">
                    <div className="font-medium">{user.email}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {user.name || user.username || "No name provided"}
                    </div>
                  </div>

                  <div className="flex items-center gap-8">
                    <div className="mt-1">
                      <select
                        className={`text-xs rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-primary text-gray-900 dark:text-gray-100 px-2 py-1 ${
                          isCurrentUser ? "opacity-50" : ""
                        }`}
                        value={user.role_id}
                        disabled={isCurrentUser}
                        onChange={(e) => {
                          if (isCurrentUser) return;
                          const newRoleId = parseInt(e.target.value);
                          dispatch(
                            updateUserRoleThunk({
                              userId: user.id,
                              roleId: newRoleId,
                            })
                          )
                            .unwrap()
                            .catch((error) => {
                              // Revert the select value on error
                              e.target.value = user.role_id;
                              toast.error(
                                error || "Failed to update user role"
                              );
                            });
                        }}
                      >
                        {roles.map((role) => (
                          <option key={role.id} value={role.id}>
                            {role.role_name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
      </ul>
      {isAddUserModalOpen && (
        <AddUserModal
          setOpen={setIsAddUserModalOpen}
          onCreated={() => setIsAddUserModalOpen(false)}
        />
      )}
    </div>
  );
};

export default UsersList;
