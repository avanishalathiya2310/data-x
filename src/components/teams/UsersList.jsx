// src/components/teams/UsersList.jsx
"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchEntraUsers,
  fetchUsers,
  updateUserPermissions,
  updateUserRoleThunk,
  deleteUserThunk,
} from "@/store/userSlice";
import { fetchRoles } from "@/store/roleSlice";
import { UserPlus, Trash } from "@phosphor-icons/react";
import AddUserModal from "./AddUser";
import DeleteUserModal from "./DeleteUserModal";
import { computeNextPermissionIds } from "@/app/(workspace)/admin/permissions/helpers";
import { toast } from "react-toastify";

const UsersList = () => {
  const dispatch = useDispatch();
  const { items: users, loading, error } = useSelector((state) => state.users);
  const { items: roles } = useSelector((s) => s.roles);
  const { current: currentUser } = useSelector((state) => state.users || {});
  const { entraUsers } = useSelector((state) => state.users);
  const permissions = useSelector((s) => s.permissions.items);

  const handlePermissionToggle = async (user, permissionKey) => {
    if (user.id === currentUser?.id) return;

    const permList = Array.isArray(permissions) ? permissions : [];

    // Check if user already has this permission
    const userPerms = Array.isArray(user.permissions) ? user.permissions : [];
    const hasPermission = userPerms.some(
      (up) => toKey(up) === toKey(permissionKey)
    );

    // Toggle the permission (if has permission, disable it; if not, enable it)
    const nextIds = computeNextPermissionIds(
      permList,
      user,
      permissionKey,
      !hasPermission // Toggle the current state
    );

    if (!nextIds) return;

    try {
      await dispatch(
        updateUserPermissions({
          userId: user.id,
          permissions: nextIds,
        })
      ).unwrap();
    } catch (error) {
      console.error("Failed to update permissions:", error);
    }
  };

  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

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
  // Map permissions into comparable keys
  const idToKey = new Map(
    (permissions || []).map((p) => [
      p.id,
      (p.key ?? p.name ?? String(p.id)).toString().toLowerCase(),
    ])
  );

  const toKey = (val) => {
    if (val == null) return "";
    if (typeof val === "object") {
      const id = val.id != null ? val.id : null;
      if (id != null && idToKey.has(id)) return idToKey.get(id);
      const key = val.key ?? val.name;
      return key ? String(key).toLowerCase() : "";
    }
    const asNum = Number(val);
    if (!Number.isNaN(asNum) && idToKey.has(asNum)) return idToKey.get(asNum);
    return String(val).toLowerCase();
  };

  const VISIBLE_PERM_KEYS = [
    "integration",
    "datastore",
    "collections",
    "codepages",
  ];
  const showPerms = VISIBLE_PERM_KEYS.map((k) => ({ id: k, key: k, name: k }));

  return (
    <div className="p-6">
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
            const userPermSet = new Set(
              Array.isArray(user.permissions)
                ? user.permissions.map((v) => toKey(v))
                : []
            );
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
                    {showPerms.length > 0 && (
                      <div className="flex flex-wrap gap-3">
                        {showPerms.map((p) => {
                          const label = p.name.replace(/\b\w/g, (c) =>
                            c.toUpperCase()
                          );
                          const checked = userPermSet.has(p.key);
                          return (
                            <label
                              key={p.id}
                              className={`inline-flex items-center gap-2 text-xs ${
                                isCurrentUser ? "opacity-50" : ""
                              }`}
                            >
                              <input
                                type="checkbox"
                                className="h-4 w-4 cursor-pointer"
                                checked={!!checked}
                                disabled={isCurrentUser}
                                onChange={(e) =>
                                  !isCurrentUser &&
                                  handlePermissionToggle(user, p.key)
                                }
                              />
                              <span>{label}</span>
                            </label>
                          );
                        })}
                      </div>
                    )}
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

                    <button
                      onClick={() => !isCurrentUser && setUserToDelete(user)}
                      disabled={isCurrentUser}
                      className="inline-flex items-center justify-center rounded border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 px-2 py-1 text-xs disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                      title={
                        isCurrentUser
                          ? "You can't remove yourself"
                          : "Remove member"
                      }
                    >
                      <Trash size={14} />
                    </button>
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
      {userToDelete && (
        <DeleteUserModal
          user={userToDelete}
          onClose={() => setUserToDelete(null)}
          onConfirm={(userId) => dispatch(deleteUserThunk(userId)).unwrap()}
        />
      )}
    </div>
  );
};

export default UsersList;
