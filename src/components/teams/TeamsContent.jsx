"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { CaretRight, CaretDown, UserPlus, Trash } from "@phosphor-icons/react";
import AddTeamModal from "@/components/teams/AddTeamModal";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import AddMemberModal from "@/components/teams/AddMemberModal";
import TeamsHeader from "@/components/teams/TeamsHeader";
import TeamMembersList from "@/components/teams/TeamMembersList";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchTeams,
  fetchTeamMembers,
  removeTeamMemberThunk,
  deleteTeamThunk,
  updateTeamMemberPermissionsThunk,
} from "@/store/teamSlice";
import { fetchUsers, fetchCurrentUser } from "@/store/userSlice";
import { fetchPermissions } from "@/store/permissionSlice";
import { computeNextPermissionIds, getMemberById } from "@/app/(workspace)/admin/teams/helpers";

const TeamsContent = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const {
    membersByTeam,
    loading,
    error,
    items: teams,
  } = useSelector((s) => s.teams);
  const { items: users } = useSelector((s) => s.users);
  const { current: user, currentToken } = useSelector((s) => s.users || {});
  const permissions = useSelector((s) => s.permissions.items);
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(() => new Set());
  const [memberModalFor, setMemberModalFor] = useState(null); // team object
  const [actionBusy, setActionBusy] = useState(null); // teamId being deleted
  const [confirmDelete, setConfirmDelete] = useState(null); // team object
  const [removingMember, setRemovingMember] = useState(null); // `${teamId}:${userId}`
  const [confirmRemove, setConfirmRemove] = useState(null); // { team, member }
  const didFetchRef = useRef(false);

  const load = useCallback(async () => {
    await Promise.all([
      teams.length === 0 && dispatch(fetchTeams()),
      users.length === 0 && dispatch(fetchUsers()),
      permissions.length === 0 && dispatch(fetchPermissions()),
    ]);
  }, [dispatch, permissions.length, users.length, teams.length]);

  useEffect(() => {
    if (!didFetchRef.current && (!user || !currentToken)) {
      didFetchRef.current = true;
      dispatch(fetchCurrentUser());
    }
  }, [dispatch, user, currentToken]);

  useEffect(() => {
    if (user && currentToken) {
      load();
    }
  }, [user, currentToken]);

  // Guard: Only SuperAdmin can access Teams. Others are redirected to /integration
  useEffect(() => {
    if (user && currentToken && user.role && user.role !== "SuperAdmin") {
      router.replace("/integration");
    }
  }, [user, currentToken, router]);

  const handleCreated = useCallback(() => {
    setOpen(false);
  }, []);

  const ensureMembersLoaded = useCallback(
    (teamId) => {
      const current = membersByTeam?.[teamId];
      if (!current || (!current.items && !current.loading)) {
        dispatch(fetchTeamMembers(teamId));
      }
    },
    [dispatch, membersByTeam]
  );

  // Ensure all teams' members are loaded (so the Add Member modal can exclude users already in any team)
  const ensureAllMembersLoaded = useCallback(() => {
    const list = Array.isArray(teams) ? teams : [];
    for (const t of list) {
      const current = t?.id != null ? membersByTeam?.[t.id] : null;
      if (t?.id && (!current || (!current.items && !current.loading))) {
        dispatch(fetchTeamMembers(t.id));
      }
    }
  }, [dispatch, teams, membersByTeam]);

  // Flatten all team members across teams
  const allTeamMembers = useCallback(() => {
    const out = [];
    if (membersByTeam && typeof membersByTeam === "object") {
      for (const key of Object.keys(membersByTeam)) {
        const entry = membersByTeam[key];
        if (Array.isArray(entry?.items)) out.push(...entry.items);
      }
    }
    return out;
  }, [membersByTeam]);

  const handleRemoveMember = useCallback(
    (teamId, userId) => {
      if (!teamId || !userId) return Promise.resolve();
      const key = `${teamId}:${userId}`;
      setRemovingMember(key);
      return dispatch(removeTeamMemberThunk({ teamId, userId })).finally(() =>
        setRemovingMember(null)
      );
    },
    [dispatch]
  );

  const toggleExpand = (teamId) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(teamId)) next.delete(teamId);
      else next.add(teamId);
      return next;
    });
    // If opening, trigger load once
    if (!expanded.has(teamId)) {
      ensureMembersLoaded(teamId);
    }
  };

  const handleDeleteTeam = (team) => {
    if (!team?.id) return;
    setActionBusy(team.id);
    dispatch(deleteTeamThunk(team.id)).finally(() => {
      setActionBusy(null);
      setConfirmDelete(null);
    });
  };

  // If user is authenticated but not SuperAdmin, block render while redirecting
  if (user?.role && user.role !== "SuperAdmin") {
    return null;
  }

  return (
    <div className="p-6">
      {/* Header */}
      <TeamsHeader  onCreate={() => setOpen(true)}/>

      {/* List */}
      <div className="rounded-md border border-gray-200 dark:border-gray-700 overflow-hidden bg-white dark:bg-dark-secondary">
        {loading && (
          <div className="p-8 text-center text-sm text-gray-500 dark:text-gray-300">
            Loading teams...
          </div>
        )}
        {error && !loading && (
          <div className="p-8 text-center text-sm text-red-600">{error}</div>
        )}
        {teams.map((t, idx) => {
          const isOpen = expanded.has(t.id);
          return (
            <div
              key={t.id}
              className={
                idx !== teams.length - 1
                  ? "border-b border-gray-200 dark:border-gray-700"
                  : ""
              }
            >
              {/* Row header */}
              <div
                className="flex items-start gap-2 p-4 hover:bg-gray-50 dark:hover:bg-dark-secondary/70 cursor-pointer"
                onClick={() => toggleExpand(t.id)}
              >
                {isOpen ? (
                  <CaretDown className="mt-0.5" />
                ) : (
                  <CaretRight className="mt-0.5" />
                )}
                <div className="flex-1">
                  <div className="font-medium">{t.team_name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-300">
                    {t.description || "No description"}
                  </div>
                </div>
                {/* Actions */}
                <div
                  className="flex items-center gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => {
                      ensureAllMembersLoaded();
                      ensureMembersLoaded(t.id);
                      setMemberModalFor(t);
                    }}
                    className="inline-flex items-center gap-2 rounded-md border border-gray-200 dark:border-gray-700 px-3 py-1.5 text-sm bg-white dark:bg-dark-secondary hover:bg-gray-50"
                  >
                    <UserPlus size={16} /> Add Member
                  </button>
                  <button
                    onClick={() => setConfirmDelete(t)}
                    disabled={actionBusy === t.id}
                    className="inline-flex items-center gap-2 rounded-md border border-red-200 px-3 py-1.5 text-sm bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-60"
                  >
                    <Trash size={16} />{" "}
                    {actionBusy === t.id ? "Deleting..." : "Delete Team"}
                  </button>
                </div>
              </div>

              {/* Expanded content (members list) */}
              {isOpen && (
                <div className="px-4 pb-4">
                  <div className="text-sm font-medium mb-2">Team Members</div>
                  <TeamMembersList
                    team={t}
                    membersState={membersByTeam[t.id]}
                    permissions={permissions}
                    removingMemberKey={removingMember}
                    onRemoveMember={(teamId, userId) => {
                      const member = getMemberById(
                        membersByTeam,
                        teamId,
                        userId
                      );
                      setConfirmRemove({ team: t, member });
                    }}
                    onTogglePermission={(teamId, userId, permKey, enable) => {
                      const permList = Array.isArray(permissions)
                        ? permissions
                        : [];
                      const member = getMemberById(
                        membersByTeam,
                        teamId,
                        userId
                      );
                      const nextIds = computeNextPermissionIds(
                        permList,
                        member,
                        permKey,
                        enable
                      );
                      if (!nextIds) return;
                      dispatch(
                        updateTeamMemberPermissionsThunk({
                          teamId,
                          userId,
                          permissionIds: nextIds,
                        })
                      );
                    }}
                  />
                </div>
              )}
            </div>
          );
        })}
        {teams.length === 0 && !loading && !error && (
          <div className="p-8 text-center text-sm text-gray-500 dark:text-gray-300">
            No teams yet
          </div>
        )}
      </div>

      {/* Modal */}
      {open && <AddTeamModal setOpen={setOpen} onCreated={handleCreated} />}
      {memberModalFor && (
        <AddMemberModal
          team={memberModalFor}
          users={users}
          permissions={permissions}
          existingMembers={allTeamMembers()}
          onClose={() => setMemberModalFor(null)}
          onAdded={() => {
            setMemberModalFor(null);
          }}
        />
      )}
      {/* Confirm remove member */}
      <ConfirmDialog
        open={!!confirmRemove}
        title="Remove Member"
        description={
          confirmRemove
            ? `Remove ${
                confirmRemove.member?.email ||
                confirmRemove.member?.name ||
                "this user"
              } from "${confirmRemove.team?.team_name}"?`
            : ""
        }
        confirmText="Remove"
        cancelText="Cancel"
        destructive
        busy={
          !!(
            confirmRemove &&
            removingMember ===
              `${confirmRemove.team?.id}:${confirmRemove.member?.id}`
          )
        }
        onCancel={() => setConfirmRemove(null)}
        onConfirm={() => {
          if (!confirmRemove) return;
          const teamId = confirmRemove.team?.id;
          const userId = confirmRemove.member?.id;
          const p = handleRemoveMember(teamId, userId);
          if (p && typeof p.finally === "function") {
            p.finally(() => setConfirmRemove(null));
          } else {
            setConfirmRemove(null);
          }
        }}
      />

      {/* Confirm delete team */}
      <ConfirmDialog
        open={!!confirmDelete}
        title="Delete Team"
        description={
          confirmDelete
            ? `Are you sure you want to delete "${confirmDelete.team_name}"? This action cannot be undone.`
            : ""
        }
        confirmText="Delete"
        cancelText="Cancel"
        destructive
        busy={!!(confirmDelete && actionBusy === confirmDelete.id)}
        onCancel={() => setConfirmDelete(null)}
        onConfirm={() => handleDeleteTeam(confirmDelete)}
      />
    </div>
  );
};

export default TeamsContent;