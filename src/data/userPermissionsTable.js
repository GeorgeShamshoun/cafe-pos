import { useMemo } from "react";
import { supabase } from "../supabase";
import { useRealtimeRows } from "./useRealtimeRows";

export function getActiveUserPermissionIds(userId) {
  if (!userId) return { data: [], error: null };

  return supabase
    .from("user_permissions")
    .select("permission_id")
    .eq("user_id", userId)
    .eq("is_active", true);
}

export function getUserIdsByPermission(permissionId) {
  if (!permissionId) return { data: [], error: null };

  return supabase
    .from("user_permissions")
    .select("user_id")
    .eq("permission_id", permissionId);
}

export function useActiveUserPermissionIds(userId) {
  const subscriptions = useMemo(
    () =>
      userId
        ? [{ table: "user_permissions", filter: `user_id=eq.${userId}` }]
        : [],
    [userId]
  );

  return useRealtimeRows({
    enabled: Boolean(userId),
    fetchRows: () => getActiveUserPermissionIds(userId),
    channelName: userId ? `user-permissions-${userId}` : null,
    subscriptions,
  });
}
