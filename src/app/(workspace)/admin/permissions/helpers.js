// Helper utilities for admin/teams page

export const getPermissionKey = (p) => (p?.key ?? p?.name ?? "").toString().toLowerCase();

export const buildPermissionIdMap = (permList) => new Map(
  (Array.isArray(permList) ? permList : []).map((p) => [getPermissionKey(p), p.id])
);

export const normalizeMemberPermissionIds = (member, keyToId) => {
  if (Array.isArray(member?.permission_ids) && member.permission_ids.length) {
    return new Set(
      member.permission_ids
        .map((v) => {
          if (v == null) return null;
          if (typeof v === "object") return v.id ?? null;
          const n = Number(v);
          return Number.isNaN(n) ? null : n;
        })
        .filter((x) => x != null)
    );
  }
  if (Array.isArray(member?.permissions) && member.permissions.length) {
    return new Set(
      member.permissions
        .map((v) => {
          if (v == null) return null;
          if (typeof v === "object") return keyToId.get(getPermissionKey(v)) ?? null;
          const asNum = Number(v);
          if (!Number.isNaN(asNum)) return asNum;
          return keyToId.get(String(v).toLowerCase()) ?? null;
        })
        .filter((x) => x != null)
    );
  }
  return new Set();
};

export const computeNextPermissionIds = (permList, member, permKey, enable) => {
  const keyToId = buildPermissionIdMap(permList);
  const targetId = keyToId.get(String(permKey).toLowerCase());
  if (!targetId) return null;
  const currentSet = normalizeMemberPermissionIds(member, keyToId);
  enable ? currentSet.add(targetId) : currentSet.delete(targetId);
  return Array.from(currentSet);
};

export const getMemberById = (membersByTeam, teamId, userId) => (
  (membersByTeam?.[teamId]?.items || []).find((m) => (m?.id ?? m?.user_id) === userId)
);
