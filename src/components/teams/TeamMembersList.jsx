"use client";

import React from "react";
import { Trash } from "@phosphor-icons/react";
import { useDispatch, useSelector } from "react-redux";
import { updateMemberRoleThunk } from "@/store/teamSlice";

const TeamMembersList = ({
  team,
  membersState,
  permissions,
  removingMemberKey,
  onRemoveMember,
  onTogglePermission,
}) => {
  const dispatch = useDispatch();
  const { current: currentUser } = useSelector((state) => state.users || {});
  const state = membersState || {};

  if (state.loading) {
    return (
      <div className="rounded-md bg-gray-100 dark:bg-dark-primary p-4 text-sm text-gray-600 dark:text-gray-300">
        Loading members...
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
        {state.error}
      </div>
    );
  }

  const items = state.items || [];
  if (!items.length) {
    return (
      <div className="rounded-md bg-gray-100 dark:bg-dark-primary p-4 text-sm text-gray-600 dark:text-gray-300">
        No members yet. Use "Add Member" to invite someone.
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
    <ul className="divide-y divide-gray-200 dark:divide-gray-700 rounded-md border border-gray-200 dark:border-gray-700 overflow-hidden">
      {items.map((m, i) => {
        const rawPerms = m.permissions ?? m.permission_ids ?? [];
        const memberPermSet = new Set(
          Array.isArray(rawPerms) ? rawPerms.map((v) => toKey(v)) : []
        );

        const isBusy = removingMemberKey === `${team.id}:${m.id}`;

        const isCurrentUser = currentUser?.id === m?.id;
        return (
          <li key={m.id || i} className="px-3 py-2 text-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="font-medium">{m.email}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {m.username} - {m.role}
                </div>
              </div>
              <div className="flex items-center gap-8">
                {showPerms.length > 0 && (
                  <div className="flex flex-wrap gap-3">
                    {showPerms.map((p) => {
                      const label = p.name.replace(/\b\w/g, (c) =>
                        c.toUpperCase()
                      );
                      const pId =
                        p.id != null ? String(p.id).toLowerCase() : "";
                      const checked = memberPermSet.has(pId);
                      return (
                        <label
                          key={p.id}
                          className={`inline-flex items-center gap-2 text-xs ${isCurrentUser ? 'opacity-50' : ''}`}
                        >
                          <input
                            type="checkbox"
                            className="h-4 w-4"
                            checked={!!checked}
                            disabled={isCurrentUser}
                            onChange={(e) =>
                              !isCurrentUser &&
                              onTogglePermission &&
                              onTogglePermission(
                                team.id,
                                m.id,
                                p.key,
                                e.target.checked
                              )
                            }
                          />
                          <span>{label}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
               
                <button
                  onClick={() =>
                    onRemoveMember && onRemoveMember(team.id, m.id)
                  }
                  className="inline-flex items-center justify-center rounded border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 px-2 py-1 text-xs disabled:opacity-60"
                  disabled={isBusy || isCurrentUser}
                  title={isBusy ? "Removing..." : isCurrentUser ? "You can't remove yourself" : "Remove member"}
                >
                  <Trash size={14} />
                </button>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
};

export default TeamMembersList;
